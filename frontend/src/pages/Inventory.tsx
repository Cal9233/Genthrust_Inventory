import React, { useState, useEffect } from 'react';
import inventoryService, { InventoryItem } from '../services/inventory.service';
import InventorySearch from '../components/Inventory/InventorySearch';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

const Inventory: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<'all' | 'accurate' | 'inaccurate'>('all');

  useEffect(() => {
    fetchInventory();
  }, [sourceFilter]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await inventoryService.getItems({
        source_sheet: sourceFilter === 'all' ? undefined : sourceFilter,
        limit: 100
      });
      setItems(response.items);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      await inventoryService.syncInventory();
      await fetchInventory();
    } catch (error) {
      console.error('Failed to sync inventory:', error);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div>
      <div className="sm:flex sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Inventory</h1>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
        >
          <ArrowPathIcon className={`-ml-1 mr-2 h-5 w-5 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Syncing...' : 'Sync Excel Files'}
        </button>
      </div>

      <div className="mt-6">
        <InventorySearch />
      </div>

      <div className="mt-6">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">All Items</h3>
              <div className="flex space-x-2">
                <button
                  onClick={() => setSourceFilter('all')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    sourceFilter === 'all'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSourceFilter('accurate')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    sourceFilter === 'accurate'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Accurate
                </button>
                <button
                  onClick={() => setSourceFilter('inaccurate')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    sourceFilter === 'inaccurate'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Inaccurate
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">Loading inventory...</div>
            ) : items.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                No items found. Sync Excel files to populate inventory.
              </div>
            ) : (
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Part Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Source
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.part_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.description || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.location || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            item.source_sheet === 'accurate'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {item.source_sheet}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Inventory;