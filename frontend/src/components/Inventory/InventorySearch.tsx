import React, { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import inventoryService from '../../services/inventory.service';
import InventoryResults from './InventoryResults';

const InventorySearch: React.FC = () => {
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchInput.trim()) return;

    try {
      setSearching(true);
      
      // Parse input for multiple part numbers (comma or space separated)
      const partNumbers = searchInput
        .split(/[,\s]+/)
        .map(p => p.trim())
        .filter(p => p.length > 0);

      const response = await inventoryService.searchParts(partNumbers);
      setSearchResults(response);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleClear = () => {
    setSearchInput('');
    setSearchResults(null);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSearch}>
          <div className="flex space-x-3">
            <div className="flex-1">
              <label htmlFor="search" className="sr-only">
                Search part numbers
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="search"
                  id="search"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter part numbers (comma or space separated)"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={searching || !searchInput.trim()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {searching ? 'Searching...' : 'Search'}
            </button>
            {searchResults && (
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Clear
              </button>
            )}
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Tip: You can search for multiple parts at once by separating them with commas or spaces
          </p>
        </form>
      </div>

      {searchResults && (
        <InventoryResults results={searchResults} />
      )}
    </div>
  );
};

export default InventorySearch;