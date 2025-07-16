import api from './api';

export interface AircraftPart {
  part_id: number;
  part_number: string;
  description: string;
  manufacturer: string;
  aircraft_model: string;
  part_type: string;
  category: string;
  unit_of_measure: string;
  unit_price: number;
  currency: string;
  is_rotable: boolean;
  shelf_life_months: number;
  hazmat_flag: boolean;
  notes: string;
}

export interface InventoryItem {
  item_id: number;
  part_id: number;
  serial_number: string;
  condition_code: string;
  bin_location: string;
  tag_date: string;
  expiry_date: string;
  owner_id: number;
  is_consignment: boolean;
  overhaul_shop: string;
  notes: string;
  part_number: string;
  description: string;
  manufacturer: string;
  aircraft_model: string;
  category: string;
  unit_price: number;
  owner_name: string;
  expiry_status: string;
}

export interface PurchaseOrder {
  po_id: number;
  po_number: string;
  vendor_id: number;
  vendor_name: string;
  order_date: string;
  expected_date: string;
  status: string;
  total_amount: number;
  currency: string;
  notes: string;
}

export interface Entity {
  cv_id: number;
  business_name: string;
  is_customer: boolean;
  is_vendor: boolean;
  contact_name: string;
  email: string;
  phone: string;
  address_line1: string;
  city: string;
  state: string;
  country: string;
  certification: string;
}

export interface DashboardStats {
  totalParts: number;
  totalInventoryItems: number;
  pendingPurchaseOrders: number;
  lowStockItems: number;
}

class AviationService {
  // Aircraft Parts
  async getParts(filters?: any): Promise<AircraftPart[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.aircraft_model) params.append('aircraft_model', filters.aircraft_model);
    
    const response = await api.get(`/aviation/parts?${params.toString()}`);
    return response.data;
  }

  async getPartById(id: number): Promise<AircraftPart> {
    const response = await api.get(`/aviation/parts/${id}`);
    return response.data;
  }

  async createPart(part: Partial<AircraftPart>): Promise<AircraftPart> {
    const response = await api.post('/aviation/parts', part);
    return response.data;
  }

  async updatePart(id: number, part: Partial<AircraftPart>): Promise<void> {
    await api.put(`/aviation/parts/${id}`, part);
  }

  async deletePart(id: number): Promise<void> {
    await api.delete(`/aviation/parts/${id}`);
  }

  // Inventory
  async getInventory(filters?: any): Promise<InventoryItem[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.condition_code) params.append('condition_code', filters.condition_code);
    if (filters?.location) params.append('location', filters.location);
    if (filters?.owner_id) params.append('owner_id', filters.owner_id);
    if (filters?.is_consignment !== undefined) params.append('is_consignment', filters.is_consignment);
    
    const response = await api.get(`/aviation/inventory?${params.toString()}`);
    return response.data;
  }

  async getInventorySummary(): Promise<any[]> {
    const response = await api.get('/aviation/inventory/summary');
    return response.data;
  }

  async getInventoryItem(id: number): Promise<InventoryItem> {
    const response = await api.get(`/aviation/inventory/${id}`);
    return response.data;
  }

  async getMovementHistory(id: number): Promise<any[]> {
    const response = await api.get(`/aviation/inventory/${id}/history`);
    return response.data;
  }

  async createInventoryItem(item: Partial<InventoryItem>): Promise<InventoryItem> {
    const response = await api.post('/aviation/inventory', item);
    return response.data;
  }

  async updateInventoryItem(id: number, item: Partial<InventoryItem>): Promise<void> {
    await api.put(`/aviation/inventory/${id}`, item);
  }

  async deleteInventoryItem(id: number): Promise<void> {
    await api.delete(`/aviation/inventory/${id}`);
  }

  // Purchase Orders
  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    const response = await api.get('/aviation/purchase-orders');
    return response.data;
  }

  async getPurchaseOrder(id: number): Promise<any> {
    const response = await api.get(`/aviation/purchase-orders/${id}`);
    return response.data;
  }

  // Entities (Customers/Vendors)
  async getEntities(): Promise<Entity[]> {
    const response = await api.get('/aviation/entities');
    return response.data;
  }

  // Dashboard Stats
  async getStats(): Promise<DashboardStats> {
    const response = await api.get('/aviation/stats');
    return response.data;
  }
}

export default new AviationService();