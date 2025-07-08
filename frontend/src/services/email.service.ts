import api from './api';

export interface Quote {
  id: number;
  email_id: string;
  sender_email: string;
  sender_name: string;
  subject: string;
  body: string;
  part_numbers: string[];
  status: 'pending' | 'processed' | 'responded';
  received_at: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface QuoteStats {
  pending_count: string;
  processed_count: string;
  responded_count: string;
  total_count: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  description: string;
}

export interface QuoteResponse {
  id: number;
  quote_id: number;
  response_body: string;
  template_used: string;
  parts_found: string[];
  parts_not_found: string[];
  response_sent_at: string;
}

class EmailService {
  async syncEmails(filter?: string, top: number = 50) {
    const response = await api.post('/emails/sync', { filter, top });
    return response.data;
  }

  async getQuotes(params: { status?: string; limit?: number; offset?: number }) {
    const response = await api.get('/emails/quotes', { params });
    return response.data;
  }

  async getQuote(id: number) {
    const response = await api.get(`/emails/quotes/${id}`);
    return response.data;
  }

  async respondToQuote(id: number, data: { 
    template: string; 
    customMessage?: string; 
    ccEmails?: string[] 
  }) {
    const response = await api.post(`/emails/quotes/${id}/respond`, data);
    return response.data;
  }

  async getTemplates() {
    const response = await api.get('/emails/templates');
    return response.data.templates;
  }
}

export default new EmailService();