import { create } from 'zustand';
import { Order, OrderStatus } from './orderTypes';
import { ordersApi, mapBackendDriverOrder } from '../api';
import { locationTrackingService } from '../services/locationTrackingService';
import { queryClient } from '../lib/queryClient';
import { toast } from './useToastStore';

export * from './orderTypes';

export interface PendingSyncMutation {
  id: string;
  orderId: string;
  action:
    | 'ACCEPT'
    | 'PICKUP'
    | 'OUT_FOR_DELIVERY'
    | 'MARK_ARRIVED'
    | 'DELIVER'
    | 'TNB_HANDOVER'
    | 'TNB_RECORD_SELECTION'
    | 'TNB_RETURN_COLLECTION'
    | 'TNB_SETTLE_PAYMENT'
    | 'TNB_ARRIVE_STORE'
    | 'TNB_RECONCILE_STORE';
  payload?: Record<string, any>;
  idempotencyKey: string;
  createdAt: number;
}

interface OrderState {
  activeOrders: Order[];
  historicalOrders: Order[];
  pendingSyncQueue: PendingSyncMutation[];
  lastSyncError: string | null;

  // Backend Sync
  fetchAssignedOrdersAsync: () => Promise<void>;
  fetchHistoricalOrdersAsync: () => Promise<void>;
  refreshOrderAsync: (orderId: string) => Promise<Order | null>;
  syncOrderFromServer: (partial: Partial<Order> & { id: string }) => void;
  retryPendingSyncs: () => Promise<void>;

  // Standard Lifecycle Actions
  clearOrders: () => void;
  acceptOrder: (orderId: string) => void;
  confirmPickup: (orderId: string, pickupImages?: string[]) => void;
  startDelivery: (orderId: string) => void;
  markArrived: (orderId: string) => void;
  confirmDelivery: (orderId: string, deliveryImages?: string[], cashCollected?: boolean) => void;
  completeOrder: (orderId: string, deliveryImages?: string[], cashCollected?: boolean) => void;

  // Try & Buy Specific Lifecycle Actions
  confirmHandoverAndStartTrial: (orderId: string, otp?: string, handoverImages?: string[]) => void;
  recordCustomerSelection: (orderId: string, selections: { [itemId: string]: 'KEEP' | 'RETURN' }) => void;
  proceedToReturnCollection: (orderId: string) => void;
  toggleItemCollected: (orderId: string, itemId: string) => void;
  confirmReturnCollection: (orderId: string, returnImages?: string[]) => void;
  proceedToPayment: (orderId: string) => void;
  confirmPaymentAndBranch: (orderId: string, cashCollected?: boolean) => Promise<void>;
  markArrivedAtStore: (orderId: string) => void;
  reconcileStoreReturn: (
    orderId: string,
    supervisorConfirmed?: boolean,
    note?: string,
  ) => Promise<boolean>;
}

const makeIdempotencyKey = (prefix: string, orderId: string) =>
  `${prefix}-${orderId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

function syncTrackingForActiveOrders(orders: Order[]) {
  const activeTransit = orders.find(
    (o) => o.status === 'PICKED_UP' || o.status === 'OUT_FOR_DELIVERY',
  );
  if (activeTransit) {
    locationTrackingService.startTracking(activeTransit.id);
  } else {
    locationTrackingService.stopTracking();
  }
}

function applyServerResponseOrder(
  set: (fn: (state: OrderState) => Partial<OrderState>) => void,
  orderId: string,
  res: any,
  syncOrderFromServer?: (partial: Partial<Order> & { id: string }) => void,
) {
  const rawOrder = res?.order || (res?.id ? res : null);
  if (rawOrder) {
    const mapped = mapBackendDriverOrder(rawOrder);
    if (syncOrderFromServer) {
      set(() => ({ lastSyncError: null }));
      syncOrderFromServer(mapped);
    } else {
      set((state) => ({
        lastSyncError: null,
        activeOrders: state.activeOrders.map((o) => (o.id === orderId ? { ...o, ...mapped } : o)),
      }));
    }
  }
  queryClient.invalidateQueries({ queryKey: ['driver-orders'] });
}

function handleMutationFailure(
  set: (fn: (state: OrderState) => Partial<OrderState>) => void,
  previousSnapshot: Order[],
  mutation: PendingSyncMutation,
  err: any,
) {
  const status = typeof err?.status === 'number' ? err.status : 0;
  const message = err?.message || 'Failed to sync order update with server.';
  const isClientError = status >= 400 && status < 500;

  if (isClientError) {
    set(() => ({
      activeOrders: previousSnapshot,
      lastSyncError: message,
    }));
    try {
      toast.show({ type: 'error', message });
    } catch {}
    return;
  }

  // Transient network or 5xx failure: keep in retry queue with idempotency key
  set((state) => ({
    lastSyncError: message,
    pendingSyncQueue: [
      ...state.pendingSyncQueue.filter((m) => m.id !== mutation.id),
      mutation,
    ],
  }));
}

async function executeQueuedMutation(m: PendingSyncMutation) {
  switch (m.action) {
    case 'ACCEPT':
      return ordersApi.acceptOrder(m.orderId, m.idempotencyKey);
    case 'PICKUP':
      return ordersApi.pickupOrder(m.orderId, m.payload?.pickupImages || [], m.idempotencyKey);
    case 'OUT_FOR_DELIVERY':
      return ordersApi.outForDelivery(m.orderId, m.idempotencyKey);
    case 'MARK_ARRIVED':
      return ordersApi.markArrived(m.orderId, m.idempotencyKey);
    case 'DELIVER':
      return ordersApi.deliverOrder(
        m.orderId,
        m.payload?.deliveryImages || [],
        m.payload?.cashCollected,
        m.idempotencyKey,
      );
    case 'TNB_HANDOVER':
      return ordersApi.confirmHandover(
        m.orderId,
        m.payload?.otp || '',
        m.payload?.handoverImages || [],
        m.idempotencyKey,
      );
    case 'TNB_RECORD_SELECTION':
      return ordersApi.recordSelections(m.orderId, m.payload?.selections || {});
    case 'TNB_RETURN_COLLECTION':
      return ordersApi.confirmReturnCollection(
        m.orderId,
        m.payload?.collectedItemIds || [],
        m.payload?.returnImages || [],
        m.idempotencyKey,
      );
    case 'TNB_SETTLE_PAYMENT':
      return ordersApi.settlePayment(
        m.orderId,
        { cashCollected: m.payload?.cashCollected ?? true },
        m.idempotencyKey,
      );
    case 'TNB_ARRIVE_STORE':
      return ordersApi.arriveAtStore(m.orderId);
    case 'TNB_RECONCILE_STORE':
      return ordersApi.reconcileStoreReturn(
        m.orderId,
        m.payload?.supervisorConfirmed,
        m.payload?.note,
      );
  }
}

export const useOrderStore = create<OrderState>((set, get) => ({
  activeOrders: [],
  historicalOrders: [],
  pendingSyncQueue: [],
  lastSyncError: null,

  fetchAssignedOrdersAsync: async () => {
    try {
      const orders = await ordersApi.getAssignedOrders('ACTIVE');
      if (orders && Array.isArray(orders)) {
        set({ activeOrders: orders, lastSyncError: null });
        syncTrackingForActiveOrders(orders);
      }
    } catch (err: any) {
      set({ lastSyncError: err?.message || 'Unable to refresh active orders' });
    }
  },

  fetchHistoricalOrdersAsync: async () => {
    try {
      const [delivered, returned] = await Promise.all([
        ordersApi.getAssignedOrders('DELIVERED'),
        ordersApi.getAssignedOrders('RETURNED').catch(() => []),
      ]);
      const combined = [...(delivered || []), ...(returned || [])];
      combined.sort((a, b) => {
        const ta = new Date(a.deliveredAt || a.date || 0).getTime();
        const tb = new Date(b.deliveredAt || b.date || 0).getTime();
        return tb - ta;
      });
      set({ historicalOrders: combined, lastSyncError: null });
    } catch (err: any) {
      set({ lastSyncError: err?.message || 'Unable to load order history' });
    }
  },

  refreshOrderAsync: async (orderId: string) => {
    try {
      const fresh = await ordersApi.getOrderDetails(orderId);
      get().syncOrderFromServer(fresh);
      return fresh;
    } catch (err: any) {
      set({ lastSyncError: err?.message || 'Unable to refresh order details' });
      return null;
    }
  },

  syncOrderFromServer: (partial) => {
    const cleanPartial: Record<string, any> = {};
    for (const [k, v] of Object.entries(partial as Record<string, any>)) {
      if (v !== undefined) {
        cleanPartial[k] = v;
      }
    }
    set((state) => {
      const exists = state.activeOrders.some((o) => o.id === partial.id);
      if (
        cleanPartial.status === 'DELIVERED' ||
        cleanPartial.status === 'RETURNED' ||
        cleanPartial.status === 'CANCELLED' ||
        cleanPartial.status === 'FAILED'
      ) {
        const existing = state.activeOrders.find((o) => o.id === partial.id);
        const merged = existing
          ? ({ ...existing, ...cleanPartial } as Order)
          : (cleanPartial as Order);
        return {
          activeOrders: state.activeOrders.filter((o) => o.id !== partial.id),
          historicalOrders: [
            merged,
            ...state.historicalOrders.filter((o) => o.id !== partial.id),
          ],
        };
      }
      if (!exists) return state;
      return {
        activeOrders: state.activeOrders.map((o) =>
          o.id === partial.id ? ({ ...o, ...cleanPartial } as Order) : o,
        ),
      };
    });
    syncTrackingForActiveOrders(get().activeOrders);
  },

  retryPendingSyncs: async () => {
    const queue = get().pendingSyncQueue;
    if (!queue.length) return;
    const remaining: PendingSyncMutation[] = [];
    let droppedError: string | null = null;
    for (const item of queue) {
      try {
        const res = await executeQueuedMutation(item);
        applyServerResponseOrder(set, item.orderId, res, get().syncOrderFromServer);
      } catch (err: any) {
        if (!err?.status || err.status >= 500) {
          remaining.push(item);
        } else {
          droppedError = err?.message || `Queued action ${item.action} was rejected by server.`;
        }
      }
    }
    set({
      pendingSyncQueue: remaining,
      ...(droppedError ? { lastSyncError: droppedError } : {}),
    });
    if (droppedError) {
      try {
        toast.show({ type: 'error', message: droppedError });
      } catch {}
    }
  },

  clearOrders: () => {
    locationTrackingService.stopTracking();
    set({ activeOrders: [], pendingSyncQueue: [] });
  },

  acceptOrder: (orderId) => {
    const previousSnapshot = get().activeOrders;
    set((state) => ({
      activeOrders: state.activeOrders.map((order) =>
        order.id === orderId ? { ...order, accepted: true } : order,
      ),
    }));
    const mutation: PendingSyncMutation = {
      id: makeIdempotencyKey('accept', orderId),
      orderId,
      action: 'ACCEPT',
      idempotencyKey: makeIdempotencyKey('accept', orderId),
      createdAt: Date.now(),
    };
    ordersApi
      .acceptOrder(orderId, mutation.idempotencyKey)
      .then((res) => applyServerResponseOrder(set, orderId, res, get().syncOrderFromServer))
      .catch((err) => handleMutationFailure(set, previousSnapshot, mutation, err));
  },

  confirmPickup: (orderId, pickupImages = []) => {
    const previousSnapshot = get().activeOrders;
    locationTrackingService.startTracking(orderId);
    set((state) => ({
      activeOrders: state.activeOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: 'PICKED_UP',
              pickupImages: pickupImages.length ? pickupImages : order.pickupImages,
              pickupTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          : order,
      ),
    }));
    const key = makeIdempotencyKey('pickup', orderId);
    const mutation: PendingSyncMutation = {
      id: key,
      orderId,
      action: 'PICKUP',
      payload: { pickupImages },
      idempotencyKey: key,
      createdAt: Date.now(),
    };
    ordersApi
      .pickupOrder(orderId, pickupImages, key)
      .then((res) => applyServerResponseOrder(set, orderId, res, get().syncOrderFromServer))
      .catch((err) => handleMutationFailure(set, previousSnapshot, mutation, err));
  },

  startDelivery: (orderId) => {
    const previousSnapshot = get().activeOrders;
    locationTrackingService.startTracking(orderId);
    set((state) => ({
      activeOrders: state.activeOrders.map((order) =>
        order.id === orderId ? { ...order, status: 'OUT_FOR_DELIVERY' } : order,
      ),
    }));
    const key = makeIdempotencyKey('ofd', orderId);
    const mutation: PendingSyncMutation = {
      id: key,
      orderId,
      action: 'OUT_FOR_DELIVERY',
      idempotencyKey: key,
      createdAt: Date.now(),
    };
    ordersApi
      .outForDelivery(orderId, key)
      .then((res) => applyServerResponseOrder(set, orderId, res, get().syncOrderFromServer))
      .catch((err) => handleMutationFailure(set, previousSnapshot, mutation, err));
  },

  markArrived: (orderId) => {
    const previousSnapshot = get().activeOrders;
    const nowIso = new Date().toISOString();
    set((state) => ({
      activeOrders: state.activeOrders.map((order) => {
        if (order.id !== orderId) return order;
        // DCR-005: Doorstep arrival retains OrderStatus === OUT_FOR_DELIVERY while setting isArrived/arrivedAt
        return {
          ...order,
          status: 'OUT_FOR_DELIVERY',
          isArrived: true,
          arrivedAt: order.arrivedAt || nowIso,
          tryAndBuyStage: order.isTryAndBuy ? order.tryAndBuyStage || 'HANDOVER_PENDING' : undefined,
        };
      }),
    }));
    const key = makeIdempotencyKey('arrived', orderId);
    const mutation: PendingSyncMutation = {
      id: key,
      orderId,
      action: 'MARK_ARRIVED',
      idempotencyKey: key,
      createdAt: Date.now(),
    };
    ordersApi
      .markArrived(orderId, key)
      .then((res) => applyServerResponseOrder(set, orderId, res, get().syncOrderFromServer))
      .catch((err) => handleMutationFailure(set, previousSnapshot, mutation, err));
  },

  confirmDelivery: (orderId, deliveryImages = [], cashCollected = true) => {
    get().completeOrder(orderId, deliveryImages, cashCollected);
  },

  completeOrder: (orderId, deliveryImages = [], cashCollected = true) => {
    const previousSnapshot = get().activeOrders;
    const targetOrder = get().activeOrders.find((o) => o.id === orderId);
    const isReturnCompletion =
      Boolean(targetOrder?.isTryAndBuy) &&
      (targetOrder?.status === 'RETURNING' ||
        (targetOrder?.items || []).some((i) => i.decision === 'RETURN'));
    const finalStatus: OrderStatus = isReturnCompletion ? 'RETURNED' : 'DELIVERED';

    set((state) => {
      const deliveredOrder = state.activeOrders.find((o) => o.id === orderId);
      if (!deliveredOrder) return state;

      const completedOrder: Order = {
        ...deliveredOrder,
        status: finalStatus,
        deliveryImages: deliveryImages.length ? deliveryImages : deliveredOrder.deliveryImages,
        deliveredAt: new Date().toISOString(),
        date: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      };

      return {
        activeOrders: state.activeOrders.filter((o) => o.id !== orderId),
        historicalOrders: [completedOrder, ...state.historicalOrders],
      };
    });
    syncTrackingForActiveOrders(get().activeOrders);

    if (finalStatus === 'DELIVERED') {
      const key = makeIdempotencyKey('deliver', orderId);
      const mutation: PendingSyncMutation = {
        id: key,
        orderId,
        action: 'DELIVER',
        payload: { deliveryImages, cashCollected },
        idempotencyKey: key,
        createdAt: Date.now(),
      };
      ordersApi
        .deliverOrder(orderId, deliveryImages, cashCollected, key)
        .then((res) => applyServerResponseOrder(set, orderId, res, get().syncOrderFromServer))
        .catch((err) => handleMutationFailure(set, previousSnapshot, mutation, err));
    }
  },

  // ----------------------------------------------------
  // TRY & BUY STATE MACHINE ACTIONS
  // ----------------------------------------------------

  confirmHandoverAndStartTrial: (orderId, otp, handoverImages = []) => {
    const trimmedOtp = (otp || '').trim();
    if (!trimmedOtp) {
      const msg = 'Customer OTP is required to confirm handover.';
      set({ lastSyncError: msg });
      try {
        toast.show({ type: 'error', message: msg });
      } catch {}
      return;
    }

    const previousSnapshot = get().activeOrders;
    const now = new Date();
    set((state) => ({
      lastSyncError: null,
      activeOrders: state.activeOrders.map((order) => {
        if (order.id !== orderId || !order.isTryAndBuy) return order;
        const duration = order.trialDurationMinutes || 10;
        const endsAt = new Date(now.getTime() + duration * 60 * 1000);

        return {
          ...order,
          handoverImages: handoverImages.length ? handoverImages : order.handoverImages,
          handoverConfirmedAt: now.toISOString(),
          trialStartedAt: now.toISOString(),
          trialEndsAt: endsAt.toISOString(),
          tryAndBuyStage: 'TRIAL_IN_PROGRESS',
        };
      }),
    }));

    const key = makeIdempotencyKey('handover', orderId);
    const mutation: PendingSyncMutation = {
      id: key,
      orderId,
      action: 'TNB_HANDOVER',
      payload: { otp: trimmedOtp, handoverImages },
      idempotencyKey: key,
      createdAt: Date.now(),
    };
    ordersApi
      .confirmHandover(orderId, trimmedOtp, handoverImages, key)
      .then((res) => applyServerResponseOrder(set, orderId, res, get().syncOrderFromServer))
      .catch((err) => handleMutationFailure(set, previousSnapshot, mutation, err));
  },

  recordCustomerSelection: (orderId, selections) => {
    const previousSnapshot = get().activeOrders;
    set((state) => ({
      activeOrders: state.activeOrders.map((order) => {
        if (order.id !== orderId || !order.isTryAndBuy) return order;

        const updatedItems = (order.items || []).map((item) => {
          const decision = selections[item.id] || item.decision || 'KEEP';
          return {
            ...item,
            decision,
            tryAndBuyDecision: decision,
            collected: decision === 'KEEP',
          };
        });

        const retainedItems = updatedItems.filter((i) => i.decision === 'KEEP');
        const returnedItems = updatedItems.filter((i) => i.decision === 'RETURN');

        const finalPayableTotal = retainedItems.reduce(
          (acc, curr) => acc + curr.price * curr.quantity,
          0,
        );
        const refundAmount = returnedItems.reduce(
          (acc, curr) => acc + curr.price * curr.quantity,
          0,
        );
        const amountDue = order.paymentMethod === 'COD' ? finalPayableTotal : 0;

        return {
          ...order,
          items: updatedItems,
          finalPayableTotal,
          refundAmount,
          amountDue,
          tryAndBuyStage: 'SELECTION_CONFIRMED',
        };
      }),
    }));
    const key = makeIdempotencyKey('selection', orderId);
    const mutation: PendingSyncMutation = {
      id: key,
      orderId,
      action: 'TNB_RECORD_SELECTION',
      payload: { selections },
      idempotencyKey: key,
      createdAt: Date.now(),
    };
    ordersApi
      .recordSelections(orderId, selections)
      .then((res) => applyServerResponseOrder(set, orderId, res, get().syncOrderFromServer))
      .catch((err) => handleMutationFailure(set, previousSnapshot, mutation, err));
  },

  proceedToReturnCollection: (orderId) =>
    set((state) => ({
      activeOrders: state.activeOrders.map((order) =>
        order.id === orderId ? { ...order, tryAndBuyStage: 'RETURN_COLLECTION' } : order,
      ),
    })),

  toggleItemCollected: (orderId, itemId) =>
    set((state) => ({
      activeOrders: state.activeOrders.map((order) => {
        if (order.id !== orderId) return order;
        return {
          ...order,
          items: (order.items || []).map((item) =>
            item.id === itemId ? { ...item, collected: !item.collected } : item,
          ),
        };
      }),
    })),

  confirmReturnCollection: (orderId, returnImages = []) => {
    const previousSnapshot = get().activeOrders;
    const order = get().activeOrders.find((o) => o.id === orderId);
    const collectedItemIds = (order?.items || [])
      .filter((i) => i.decision === 'RETURN' && i.collected)
      .map((i) => i.id);

    set((state) => ({
      activeOrders: state.activeOrders.map((o) => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          returnImages,
          tryAndBuyStage: 'PAYMENT_PENDING',
        };
      }),
    }));

    const key = makeIdempotencyKey('retcol', orderId);
    const mutation: PendingSyncMutation = {
      id: key,
      orderId,
      action: 'TNB_RETURN_COLLECTION',
      payload: { collectedItemIds, returnImages },
      idempotencyKey: key,
      createdAt: Date.now(),
    };
    ordersApi
      .confirmReturnCollection(orderId, collectedItemIds, returnImages, key)
      .then((res) => applyServerResponseOrder(set, orderId, res, get().syncOrderFromServer))
      .catch((err) => handleMutationFailure(set, previousSnapshot, mutation, err));
  },

  proceedToPayment: (orderId) =>
    set((state) => ({
      activeOrders: state.activeOrders.map((order) =>
        order.id === orderId ? { ...order, tryAndBuyStage: 'PAYMENT_PENDING' } : order,
      ),
    })),

  confirmPaymentAndBranch: async (orderId, cashCollected = true) => {
    const previousSnapshot = get().activeOrders;
    const order = get().activeOrders.find((o) => o.id === orderId);
    if (!order) return;

    const returnedCount = (order.items || []).filter((i) => i.decision === 'RETURN').length;
    const key = makeIdempotencyKey('settle', orderId);
    const mutation: PendingSyncMutation = {
      id: key,
      orderId,
      action: 'TNB_SETTLE_PAYMENT',
      payload: { cashCollected },
      idempotencyKey: key,
      createdAt: Date.now(),
    };

    try {
      const res = await ordersApi.settlePayment(orderId, { cashCollected }, key);
      const rawOrder = res?.order || (res?.id ? res : null);
      if (rawOrder) {
        applyServerResponseOrder(set, orderId, res, get().syncOrderFromServer);
      } else if (returnedCount === 0) {
        set((state) => {
          const delivered = state.activeOrders.find((o) => o.id === orderId);
          if (!delivered) return state;
          const completedOrder: Order = {
            ...delivered,
            status: 'DELIVERED',
            paymentStatus: 'PAID',
            deliveredAt: new Date().toISOString(),
            date: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          };
          return {
            lastSyncError: null,
            activeOrders: state.activeOrders.filter((o) => o.id !== orderId),
            historicalOrders: [
              completedOrder,
              ...state.historicalOrders.filter((o) => o.id !== orderId),
            ],
          };
        });
        queryClient.invalidateQueries({ queryKey: ['driver-orders'] });
      } else {
        set((state) => ({
          lastSyncError: null,
          activeOrders: state.activeOrders.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: 'RETURNING',
                  tryAndBuyStage: 'RETURNING_TO_STORE',
                  paymentStatus: 'PAID',
                  storeReconciliationStatus: 'PENDING',
                }
              : o,
          ),
        }));
        queryClient.invalidateQueries({ queryKey: ['driver-orders'] });
      }
      syncTrackingForActiveOrders(get().activeOrders);
    } catch (err) {
      handleMutationFailure(set, previousSnapshot, mutation, err);
    }
  },

  markArrivedAtStore: (orderId) => {
    const previousSnapshot = get().activeOrders;
    set((state) => ({
      activeOrders: state.activeOrders.map((order) =>
        order.id === orderId ? { ...order, tryAndBuyStage: 'STORE_RECONCILIATION' } : order,
      ),
    }));
    const key = makeIdempotencyKey('arrstore', orderId);
    const mutation: PendingSyncMutation = {
      id: key,
      orderId,
      action: 'TNB_ARRIVE_STORE',
      idempotencyKey: key,
      createdAt: Date.now(),
    };
    ordersApi
      .arriveAtStore(orderId)
      .then((res) => applyServerResponseOrder(set, orderId, res, get().syncOrderFromServer))
      .catch((err) => handleMutationFailure(set, previousSnapshot, mutation, err));
  },

  reconcileStoreReturn: async (orderId, supervisorConfirmed, note) => {
    const previousSnapshot = get().activeOrders;
    const key = makeIdempotencyKey('reconcile', orderId);
    const mutation: PendingSyncMutation = {
      id: key,
      orderId,
      action: 'TNB_RECONCILE_STORE',
      payload: { supervisorConfirmed, note },
      idempotencyKey: key,
      createdAt: Date.now(),
    };

    try {
      const res = await ordersApi.reconcileStoreReturn(orderId, supervisorConfirmed, note);
      const rawOrder = res?.order || (res?.id ? res : null);
      if (rawOrder) {
        applyServerResponseOrder(set, orderId, res, get().syncOrderFromServer);
      } else {
        const now = new Date();
        set((state) => {
          const target = state.activeOrders.find((o) => o.id === orderId);
          if (!target) return state;
          const reconciledOrder: Order = {
            ...target,
            status: 'RETURNED',
            storeReconciliationStatus: 'RECONCILED',
            storeReconciledAt: now.toISOString(),
            deliveredAt: now.toISOString(),
            date: `Today, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          };
          return {
            lastSyncError: null,
            activeOrders: state.activeOrders.filter((o) => o.id !== orderId),
            historicalOrders: [
              reconciledOrder,
              ...state.historicalOrders.filter((o) => o.id !== orderId),
            ],
          };
        });
        queryClient.invalidateQueries({ queryKey: ['driver-orders'] });
      }
      syncTrackingForActiveOrders(get().activeOrders);
      return true;
    } catch (err) {
      handleMutationFailure(set, previousSnapshot, mutation, err);
      return false;
    }
  },
}));
