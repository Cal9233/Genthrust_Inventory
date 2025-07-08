import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import emailService from '../../services/email.service';
import inventoryService from '../../services/inventory.service';
import EmailComposer from '../EmailComposer/EmailComposer';
import InventoryResults from '../Inventory/InventoryResults';
import { format } from 'date-fns';

const QuoteDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [quote, setQuote] = useState<any>(null);
  const [inventoryResults, setInventoryResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showComposer, setShowComposer] = useState(false);

  useEffect(() => {
    if (id) {
      fetchQuoteDetails();
    }
  }, [id]);

  const fetchQuoteDetails = async () => {
    try {
      setLoading(true);
      const response = await emailService.getQuote(parseInt(id!));
      setQuote(response.quote);
      setInventoryResults(response.inventoryResults);
    } catch (error) {
      console.error('Failed to fetch quote details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResponseSent = () => {
    setShowComposer(false);
    fetchQuoteDetails();
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!quote) {
    return <div className="text-center py-12">Quote not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Quote Details
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {quote.subject}
          </p>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">From</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {quote.sender_name} ({quote.sender_email})
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Received</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {format(new Date(quote.received_at), 'PPpp')}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  quote.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  quote.status === 'processed' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {quote.status}
                </span>
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Part Numbers</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div className="flex flex-wrap gap-2">
                  {quote.part_numbers.map((part: string) => (
                    <span
                      key={part}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      {part}
                    </span>
                  ))}
                </div>
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Message</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: quote.body }} />
                </div>
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {inventoryResults && (
        <InventoryResults results={inventoryResults} />
      )}

      <div className="flex justify-between">
        <button
          onClick={() => navigate('/quotes')}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          Back to Quotes
        </button>
        {quote.status !== 'responded' && (
          <button
            onClick={() => setShowComposer(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Send Response
          </button>
        )}
      </div>

      {showComposer && (
        <EmailComposer
          quote={quote}
          inventoryResults={inventoryResults}
          onClose={() => setShowComposer(false)}
          onSent={handleResponseSent}
        />
      )}
    </div>
  );
};

export default QuoteDetail;