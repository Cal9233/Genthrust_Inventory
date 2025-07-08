import React from 'react';
import { SearchResults, InventoryReport } from '../../services/inventory.service';

interface InventoryResultsProps {
  results: {
    results: SearchResults;
    report: InventoryReport;
  };
}

const InventoryResults: React.FC<InventoryResultsProps> = ({ results }) => {
  const { report } = results;

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Inventory Search Results
        </h3>
        <div className="mt-2 flex space-x-4 text-sm text-gray-500">
          <span>Total Requested: {report.summary.totalRequested}</span>
          <span className="text-green-600">Found: {report.summary.totalFound}</span>
          <span className="text-red-600">Not Found: {report.summary.totalNotFound}</span>
          <span className="text-yellow-600">Similar: {report.summary.totalWithSimilar}</span>
        </div>
      </div>
      
      <div className="border-t border-gray-200">
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-4">
            {report.details.map((detail) => (
              <div key={detail.partNumber} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">
                    {detail.partNumber}
                  </h4>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    detail.status === 'found' ? 'bg-green-100 text-green-800' :
                    detail.status === 'similar_found' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {detail.status === 'found' ? 'Found' :
                     detail.status === 'similar_found' ? 'Similar Found' :
                     'Not Found'}
                  </span>
                </div>
                
                {detail.status === 'found' && (
                  <div className="space-y-2">
                    {detail.locations.map((loc, idx) => (
                      <div key={idx} className="bg-gray-50 rounded p-3">
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Location:</span>
                            <p className="font-medium">{loc.location}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Quantity:</span>
                            <p className="font-medium">{loc.quantity}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Source:</span>
                            <p className="font-medium capitalize">{loc.source}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Description:</span>
                            <p className="font-medium">{loc.description || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {detail.status === 'similar_found' && detail.suggestions.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 mb-2">Similar parts found:</p>
                    <div className="space-y-1">
                      {detail.suggestions.map((suggestion, idx) => (
                        <div key={idx} className="bg-yellow-50 rounded p-2 text-sm">
                          <span className="font-medium">{suggestion.partNumber}</span>
                          {suggestion.description && (
                            <span className="text-gray-500 ml-2">- {suggestion.description}</span>
                          )}
                          <span className="text-gray-500 ml-2">({suggestion.quantity} available)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryResults;