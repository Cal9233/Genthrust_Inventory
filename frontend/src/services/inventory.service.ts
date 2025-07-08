import api from './api';

export interface InventoryItem {
  id: number;
  part_number: string;
  description: string;
  location: string;
  quantity: number;
  source_sheet: 'accurate' | 'inaccurate';
  excel_file_id: string;
  last_synced: string;
  created_at: string;
  updated_at: string;
}

export interface PartSearchResult {
  exact: InventoryItem[];
  similar: InventoryItem[];
  found: boolean;
}

export interface SearchResults {
  [partNumber: string]: PartSearchResult;
}

export interface InventoryReport {
  summary: {
    totalRequested: number;
    totalFound: number;
    totalNotFound: number;
    totalWithSimilar: number;
  };
  details: Array<{
    partNumber: string;
    status: 'found' | 'not_found' | 'similar_found';
    locations: Array<{
      location: string;
      quantity: number;
      source: string;
      description: string;
    }>;
    totalQuantity: number;
    suggestions: Array<{
      partNumber: string;
      description: string;
      location: string;
      quantity: number;
      source: string;
    }>;
  }>;
}

export interface ExcelFile {
  id: string;
  name: string;
  size: number;
  createdDateTime: string;
  lastModifiedDateTime: string;
}

class InventoryService {
  async searchParts(partNumbers: string[]) {
    const response = await api.post('/inventory/search', { partNumbers });
    return response.data;
  }

  async searchByTerm(searchTerm: string) {
    const response = await api.post('/inventory/search', { searchTerm });
    return response.data.items;
  }

  async getItems(params: { 
    source_sheet?: string; 
    limit?: number; 
    offset?: number 
  }) {
    const response = await api.get('/inventory/items', { params });
    return response.data;
  }

  async getPartDetails(partNumber: string) {
    const response = await api.get(`/inventory/parts/${partNumber}`);
    return response.data.items;
  }

  async syncInventory() {
    const response = await api.post('/inventory/sync');
    return response.data;
  }

  async syncExcelFile(fileId: string, worksheetName: string, sourceSheet: string) {
    const response = await api.post('/inventory/sync/file', {
      fileId,
      worksheetName,
      sourceSheet
    });
    return response.data;
  }

  async listExcelFiles() {
    const response = await api.get('/inventory/files');
    return response.data.files;
  }

  async getWorksheets(fileId: string) {
    const response = await api.get(`/inventory/files/${fileId}/worksheets`);
    return response.data.worksheets;
  }

  async getStats() {
    const response = await api.get('/inventory/stats');
    return response.data.stats;
  }
}

export default new InventoryService();