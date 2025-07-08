import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface QuoteFiltersProps {
  stats: any;
}

const QuoteFilters: React.FC<QuoteFiltersProps> = ({ stats }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentStatus = searchParams.get('status') || 'all';

  const filters = [
    { id: 'all', name: 'All', count: stats?.total_count || 0 },
    { id: 'pending', name: 'Pending', count: stats?.pending_count || 0 },
    { id: 'processed', name: 'Processed', count: stats?.processed_count || 0 },
    { id: 'responded', name: 'Responded', count: stats?.responded_count || 0 },
  ];

  const handleFilterChange = (filterId: string) => {
    if (filterId === 'all') {
      navigate('/quotes');
    } else {
      navigate(`/quotes?status=${filterId}`);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <nav className="flex space-x-4" aria-label="Tabs">
          {filters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => handleFilterChange(filter.id)}
              className={`
                ${currentStatus === filter.id
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:text-gray-700'
                }
                px-3 py-2 font-medium text-sm rounded-md flex items-center
              `}
            >
              {filter.name}
              <span className={`
                ${currentStatus === filter.id
                  ? 'bg-indigo-200 text-indigo-600'
                  : 'bg-gray-200 text-gray-900'
                }
                ml-2 hidden py-0.5 px-2.5 rounded-full text-xs font-medium md:inline-block
              `}>
                {filter.count}
              </span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default QuoteFilters;