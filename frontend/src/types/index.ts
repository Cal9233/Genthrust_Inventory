export * from '../services/auth.service';
export * from '../services/email.service';
export * from '../services/inventory.service';

export interface Stats {
  quotes: {
    pending: number;
    processed: number;
    responded: number;
    total: number;
  };
  responses: {
    total: number;
    unique_quotes: number;
    parts_found: number;
    parts_not_found: number;
  };
  response_rate: string;
}

export interface InventoryStats {
  accurate_count: number;
  inaccurate_count: number;
  total_count: number;
  last_sync: string;
}