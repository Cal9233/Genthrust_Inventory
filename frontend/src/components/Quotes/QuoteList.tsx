import React from 'react';
import { Quote } from '../../services/email.service';
import QuoteCard from './QuoteCard';

interface QuoteListProps {
  quotes: Quote[];
  onUpdate: () => void;
}

const QuoteList: React.FC<QuoteListProps> = ({ quotes, onUpdate }) => {
  if (quotes.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No quotes found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {quotes.map((quote) => (
        <QuoteCard key={quote.id} quote={quote} onUpdate={onUpdate} />
      ))}
    </div>
  );
};

export default QuoteList;