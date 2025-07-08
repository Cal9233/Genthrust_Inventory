import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import emailService, { Quote } from '../services/email.service';
import QuoteList from '../components/Quotes/QuoteList';
import QuoteFilters from '../components/Quotes/QuoteFilters';

const Quotes: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const status = searchParams.get('status') || undefined;

  useEffect(() => {
    fetchQuotes();
  }, [status]);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const response = await emailService.getQuotes({ status });
      setQuotes(response.quotes);
      setStats(response.stats);
    } catch (error) {
      console.error('Failed to fetch quotes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      await emailService.syncEmails();
      await fetchQuotes();
    } catch (error) {
      console.error('Failed to sync emails:', error);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Quotes</h1>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
        >
          {syncing ? 'Syncing...' : 'Sync Emails'}
        </button>
      </div>

      <div className="mt-6">
        <QuoteFilters stats={stats} />
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            Loading quotes...
          </div>
        ) : (
          <QuoteList quotes={quotes} onUpdate={fetchQuotes} />
        )}
      </div>
    </div>
  );
};

export default Quotes;