import React from 'react';
import { Link } from 'react-router-dom';
import { Quote } from '../../services/email.service';
import { format } from 'date-fns';
import { 
  EnvelopeIcon, 
  ClockIcon, 
  CheckCircleIcon,
  ChevronRightIcon 
} from '@heroicons/react/24/outline';

interface QuoteCardProps {
  quote: Quote;
  onUpdate: () => void;
}

const QuoteCard: React.FC<QuoteCardProps> = ({ quote }) => {
  const statusConfig = {
    pending: {
      color: 'bg-yellow-100 text-yellow-800',
      icon: ClockIcon,
      label: 'Pending'
    },
    processed: {
      color: 'bg-blue-100 text-blue-800',
      icon: EnvelopeIcon,
      label: 'Processed'
    },
    responded: {
      color: 'bg-green-100 text-green-800',
      icon: CheckCircleIcon,
      label: 'Responded'
    }
  };

  const config = statusConfig[quote.status];

  return (
    <Link
      to={`/quotes/${quote.id}`}
      className="block bg-white shadow rounded-lg hover:shadow-md transition-shadow"
    >
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center">
              <h3 className="text-lg font-medium text-gray-900">
                {quote.subject}
              </h3>
              <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                <config.icon className="w-3 h-3 mr-1" />
                {config.label}
              </span>
            </div>
            <div className="mt-2 sm:flex sm:justify-between">
              <div className="sm:flex">
                <p className="flex items-center text-sm text-gray-500">
                  <EnvelopeIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                  {quote.sender_email}
                </p>
                <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                  <ClockIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                  {format(new Date(quote.received_at), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
            </div>
            <div className="mt-2">
              <p className="text-sm text-gray-600">
                Part Numbers: {quote.part_numbers.join(', ')}
              </p>
            </div>
          </div>
          <div className="ml-5 flex-shrink-0">
            <ChevronRightIcon className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default QuoteCard;