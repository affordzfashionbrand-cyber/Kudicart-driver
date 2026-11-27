import { request } from './client';
import type { UploadedSupportAttachment } from './mediaApi';

export interface CreateSupportTicketPayload {
  title: string;
  category: string;
  description: string;
  orderId?: string;
  priority?: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  attachments?: UploadedSupportAttachment[];
}

export interface SupportTicketRecord {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  attachments?: UploadedSupportAttachment[] | null;
  resolutionRemarks?: string | null;
  createdAt: string;
}

export const supportApi = {
  createTicket: async (payload: CreateSupportTicketPayload): Promise<SupportTicketRecord> => {
    return request<SupportTicketRecord>('/support/tickets', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  getTickets: async (): Promise<SupportTicketRecord[]> => {
    return request<SupportTicketRecord[]>('/support/tickets', {
      method: 'GET',
    });
  },
};
