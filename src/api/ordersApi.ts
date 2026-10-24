import { request } from './client';
import { Order } from '../store/orderTypes';

export const ordersApi = {
  getDashboard: async () => {
    return request<any>('/driver/dashboard', { method: 'GET' });
  },

  getAssignedOrders: async (status?: string): Promise<Order[]> => {
    const query = status ? `?status=${status}` : '';
    return request<Order[]>(`/driver/orders${query}`, { method: 'GET' });
  },

  getOrderDetails: async (orderId: string): Promise<Order> => {
    return request<Order>(`/driver/orders/${orderId}`, { method: 'GET' });
  },

  acceptOrder: async (orderId: string) => {
    return request<any>(`/driver/orders/${orderId}/accept`, { method: 'POST' });
  },

  pickupOrder: async (orderId: string, verificationPhotos: string[] = []) => {
    return request<any>(`/driver/orders/${orderId}/pickup`, {
      method: 'POST',
      body: JSON.stringify({ verificationPhotos }),
    });
  },

  outForDelivery: async (orderId: string) => {
    return request<any>(`/driver/orders/${orderId}/out-for-delivery`, { method: 'POST' });
  },

  markArrived: async (orderId: string) => {
    return request<any>(`/driver/orders/${orderId}/arrived`, { method: 'POST' });
  },

  deliverOrder: async (orderId: string, deliveryImages: string[] = []) => {
    return request<any>(`/driver/orders/${orderId}/deliver`, {
      method: 'POST',
      body: JSON.stringify({ deliveryImages }),
    });
  },

  // Try & Buy Workflows
  confirmHandover: async (orderId: string, otp: string, handoverImages: string[] = []) => {
    return request<any>(`/driver/orders/${orderId}/try-and-buy/handover`, {
      method: 'POST',
      body: JSON.stringify({ otp, handoverImages }),
    });
  },

  recordSelections: async (
    orderId: string,
    selections: Record<string, 'KEEP' | 'RETURN'>,
  ) => {
    return request<any>(`/driver/orders/${orderId}/try-and-buy/selections`, {
      method: 'POST',
      body: JSON.stringify({ selections }),
    });
  },

  confirmReturnCollection: async (
    orderId: string,
    collectedItemIds: string[] = [],
    returnImages: string[] = [],
  ) => {
    return request<any>(`/driver/orders/${orderId}/try-and-buy/collect-returns`, {
      method: 'POST',
      body: JSON.stringify({ collectedItemIds, returnImages }),
    });
  },

  settlePayment: async (
    orderId: string,
    dto: { cashCollected?: boolean; amountCollected?: number } = {},
  ) => {
    return request<any>(`/driver/orders/${orderId}/try-and-buy/settle-payment`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  },

  arriveAtStore: async (orderId: string) => {
    return request<any>(`/driver/orders/${orderId}/try-and-buy/arrive-store`, {
      method: 'POST',
    });
  },

  reconcileStoreReturn: async (
    orderId: string,
    supervisorConfirmed = true,
    note = 'Reconciled at darkstore hub',
  ) => {
    return request<any>(`/driver/orders/${orderId}/try-and-buy/reconcile-store`, {
      method: 'POST',
      body: JSON.stringify({ supervisorConfirmed, note }),
    });
  },
};
