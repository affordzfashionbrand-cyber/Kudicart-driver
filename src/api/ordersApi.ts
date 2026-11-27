import { request } from './client';
import { uploadMediaFile } from './mediaApi';
import { Order, OrderItem, TryAndBuyStage } from '../store/orderTypes';
import type { OrderStatus } from '../contracts/order-contracts';

export function mapBackendDriverOrder(raw: any): Order {
  const tnb = raw?.tryAndBuySession || null;
  const returnedSet = new Set<string>(tnb?.returnedItemIds || raw?.returnedItemIds || []);
  const keptSet = new Set<string>(tnb?.keptItemIds || raw?.keptItemIds || []);

  const items: OrderItem[] = (raw?.items || []).map((it: any) => {
    const decision =
      it.tryAndBuyDecision ??
      it.decision ??
      (returnedSet.has(it.id) ? 'RETURN' : keptSet.has(it.id) ? 'KEEP' : undefined);
    const variant = it.variant || (it.size ? `Size ${it.size}` : undefined);
    return {
      id: it.id,
      name: it.title || it.name || 'Item',
      title: it.title || it.name,
      variant,
      size: it.size,
      price: Number(it.price || 0),
      quantity: Number(it.quantity || 1),
      image: it.image,
      decision,
      tryAndBuyDecision: it.tryAndBuyDecision ?? null,
      collected: Boolean(it.collected || it.collectedAt || decision === 'KEEP'),
      collectedAt: it.collectedAt ?? null,
    } as OrderItem;
  });

  const resolvedStage: TryAndBuyStage | undefined =
    tnb?.stage || raw?.tryAndBuyStage || (raw?.isTryAndBuy ? 'HANDOVER_PENDING' : undefined);

  return {
    id: raw.id,
    orderNumber: raw.orderNumber || raw.id,
    version: raw.version,
    fulfillmentType: raw.fulfillmentType,
    pickupLocation: raw.pickupLocation || raw.pickupStore?.name || 'KudiCart Hub',
    pickupAddress: raw.pickupAddress || raw.pickupStore?.address || '',
    customerName: raw.customerName || raw.customer?.name || 'Customer',
    customerPhone: raw.customerPhone || raw.customer?.phone || '',
    customerAddress: raw.customerAddress || raw.dropoffAddress || '',
    itemsCount:
      typeof raw.itemsCount === 'number'
        ? raw.itemsCount
        : items.reduce((sum, it) => sum + (it.quantity || 1), 0),
    toteId: raw.toteId || `T-${String(raw.orderNumber || raw.id).slice(-3)}`,
    distance: raw.distance || null,
    eta: raw.eta || null,
    earnings: typeof raw.earnings === 'number' ? raw.earnings : 0,
    status: (raw.status || 'ASSIGNED') as OrderStatus,
    deliveryAssignmentStatus:
      raw.deliveryAssignmentStatus || raw.dispatchAssignment?.assignmentStatus || undefined,
    isArrived: Boolean(raw.isArrived || raw.arrivedAt),
    arrivedAt: raw.arrivedAt || null,
    deliveredAt: raw.deliveredAt || null,
    accepted:
      raw.accepted !== undefined
        ? Boolean(raw.accepted)
        : raw.deliveryAssignmentStatus
          ? raw.deliveryAssignmentStatus === 'ACCEPTED_BY_DELIVERY_PARTNER' ||
            raw.deliveryAssignmentStatus === 'COMPLETED'
          : raw.status !== 'ASSIGNED',
    isTryAndBuy: Boolean(raw.isTryAndBuy || raw.orderType === 'TRY_AND_BUY'),
    orderType: (raw.isTryAndBuy || raw.orderType === 'TRY_AND_BUY') ? 'TRY_AND_BUY' : 'STANDARD',
    tryAndBuyStage: resolvedStage,
    trialDurationMinutes: tnb?.trialDurationMinutes ?? raw.trialDurationMinutes ?? 10,
    handoverConfirmedAt: tnb?.handoverConfirmedAt ?? raw.handoverConfirmedAt ?? undefined,
    trialStartedAt: tnb?.trialStartedAt ?? raw.trialStartedAt ?? undefined,
    trialEndsAt: tnb?.trialEndsAt ?? raw.trialEndsAt ?? undefined,
    customerSelectionAt: tnb?.customerSelectionAt ?? raw.customerSelectionAt ?? undefined,
    finalPayableTotal:
      tnb?.finalPayableTotal ?? raw.finalPayableTotal ?? raw.grandTotal ?? undefined,
    originalTotal: raw.grandTotal ?? raw.originalTotal ?? raw.itemTotal ?? undefined,
    refundAmount: tnb?.refundAmount ?? raw.refundAmount ?? undefined,
    amountDue: tnb?.amountDue ?? raw.amountDue ?? raw.amountToCollect ?? undefined,
    returnManifestId: tnb?.returnManifestId ?? raw.returnManifestId ?? undefined,
    handoverImages: tnb?.handoverImages ?? raw.handoverImages ?? [],
    returnImages: tnb?.returnImages ?? raw.returnImages ?? [],
    paymentMethod: raw.paymentMethod || 'COD',
    paymentStatus: raw.paymentStatus || 'PENDING',
    storeReconciliationStatus:
      tnb?.storeReconciliationStatus ?? raw.storeReconciliationStatus ?? undefined,
    verificationPhotos: Array.isArray(raw.verificationPhotos)
      ? raw.verificationPhotos
      : undefined,
    pickupImages: Array.isArray(raw.verificationPhotos)
      ? raw.verificationPhotos
      : raw.pickupImages || undefined,
    deliveryInstructions: raw.deliveryInstructions ?? undefined,
    rejectedByVendor: raw.rejectedByVendor ?? undefined,
    expiresAt: raw.expiresAt ?? undefined,
    checkoutGroupId: raw.checkoutGroupId ?? undefined,
    pickupCoordinates: raw.pickupCoordinates || undefined,
    deliveryCoordinates: raw.deliveryCoordinates || undefined,
    items,
  } as Order;
}

export const ordersApi = {
  getDashboard: async () => {
    return request<any>('/driver/dashboard', { method: 'GET' });
  },

  getAssignedOrders: async (status?: string): Promise<Order[]> => {
    let query = '';
    if (status) {
      const normalized = status.toUpperCase();
      if (normalized === 'COMPLETED') {
        query = '?status=DELIVERED';
      } else {
        query = `?status=${encodeURIComponent(normalized)}`;
      }
    }
    const res = await request<any>(`/driver/orders${query}`, { method: 'GET' });
    const rows = Array.isArray(res) ? res : Array.isArray(res?.orders) ? res.orders : [];
    return rows.map(mapBackendDriverOrder);
  },

  getOrderDetails: async (orderId: string): Promise<Order> => {
    const res = await request<any>(`/driver/orders/${orderId}`, { method: 'GET' });
    return mapBackendDriverOrder(res?.order || res);
  },

  uploadProofImage: async (
    fileUri: string,
    fileName = `proof_${Date.now()}.jpg`,
    mimeType = 'image/jpeg',
  ): Promise<string> => {
    if (!fileUri || fileUri.startsWith('http://') || fileUri.startsWith('https://')) {
      return fileUri;
    }
    return uploadMediaFile(fileUri, fileName, mimeType);
  },

  acceptOrder: async (orderId: string, idempotencyKey?: string) => {
    return request<any>(`/driver/orders/${orderId}/accept`, {
      method: 'POST',
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
    });
  },

  rejectOrder: async (
    orderId: string,
    reason?: string,
    idempotencyKey?: string,
  ) => {
    return request<any>(`/driver/orders/${orderId}/reject`, {
      method: 'POST',
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
      body: JSON.stringify({
        reason: reason?.trim() || 'Rejected by delivery partner',
      }),
    });
  },

  pickupOrder: async (
    orderId: string,
    verificationPhotos: string[] = [],
    idempotencyKey?: string,
  ) => {
    return request<any>(`/driver/orders/${orderId}/pickup`, {
      method: 'POST',
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
      body: JSON.stringify({ verificationPhotos }),
    });
  },

  outForDelivery: async (orderId: string, idempotencyKey?: string) => {
    return request<any>(`/driver/orders/${orderId}/out-for-delivery`, {
      method: 'POST',
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
    });
  },

  markArrived: async (orderId: string, idempotencyKey?: string) => {
    return request<any>(`/driver/orders/${orderId}/arrived`, {
      method: 'POST',
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
    });
  },

  deliverOrder: async (
    orderId: string,
    deliveryImages: string[] = [],
    cashCollected?: boolean,
    idempotencyKey?: string,
  ) => {
    return request<any>(`/driver/orders/${orderId}/deliver`, {
      method: 'POST',
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
      body: JSON.stringify({ deliveryImages, cashCollected }),
    });
  },

  // Try & Buy Workflows
  confirmHandover: async (
    orderId: string,
    otp: string,
    handoverImages: string[] = [],
    idempotencyKey?: string,
  ) => {
    return request<any>(`/driver/orders/${orderId}/try-and-buy/handover`, {
      method: 'POST',
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
      body: JSON.stringify({ otp, handoverImages }),
    });
  },

  recordSelections: async (
    orderId: string,
    selections: Record<string, 'KEEP' | 'RETURN'>,
    idempotencyKey?: string,
  ) => {
    return request<any>(`/driver/orders/${orderId}/try-and-buy/selections`, {
      method: 'POST',
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
      body: JSON.stringify({ selections }),
    });
  },

  confirmReturnCollection: async (
    orderId: string,
    collectedItemIds: string[] = [],
    returnImages: string[] = [],
    idempotencyKey?: string,
  ) => {
    return request<any>(`/driver/orders/${orderId}/try-and-buy/return-collection`, {
      method: 'POST',
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
      body: JSON.stringify({ collectedItemIds, returnImages }),
    });
  },

  settlePayment: async (
    orderId: string,
    dto: { cashCollected?: boolean; amountCollected?: number; paymentReference?: string } = {},
    idempotencyKey?: string,
  ) => {
    return request<any>(`/driver/orders/${orderId}/try-and-buy/settle-payment`, {
      method: 'POST',
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
      body: JSON.stringify(dto),
    });
  },

  arriveAtStore: async (orderId: string, idempotencyKey?: string) => {
    return request<any>(`/driver/orders/${orderId}/try-and-buy/arrive-store`, {
      method: 'POST',
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
    });
  },

  reconcileStoreReturn: async (
    orderId: string,
    supervisorConfirmed?: boolean,
    note = 'Reconciled at darkstore hub',
    idempotencyKey?: string,
  ) => {
    return request<any>(`/driver/orders/${orderId}/try-and-buy/reconcile-store`, {
      method: 'POST',
      headers: idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : undefined,
      body: JSON.stringify({
        note,
        ...(typeof supervisorConfirmed === 'boolean' ? { supervisorConfirmed } : {}),
      }),
    });
  },
};
