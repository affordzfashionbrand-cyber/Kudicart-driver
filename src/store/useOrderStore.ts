import { create } from 'zustand';
import { Order, OrderItem, OrderStatus, OrderType, TryAndBuyStage } from './orderTypes';
import { mockTryAndBuyOrder, mockStandardOrder, mockHistory } from './orderMockData';
import { ordersApi } from '../api';

export * from './orderTypes';
export * from './orderMockData';

interface OrderState {
  activeOrders: Order[];
  historicalOrders: Order[];

  // Backend Sync
  fetchAssignedOrdersAsync: () => Promise<void>;
  fetchHistoricalOrdersAsync: () => Promise<void>;

  // Standard Lifecycle Actions
  receiveMockOrder: (asTryAndBuy?: boolean) => void;
  clearOrders: () => void;
  acceptOrder: (orderId: string) => void;
  confirmPickup: (orderId: string) => void;
  startDelivery: (orderId: string) => void;
  markArrived: (orderId: string) => void;
  confirmDelivery: (orderId: string) => void;
  completeOrder: (orderId: string) => void;

  // Try & Buy Specific Lifecycle Actions
  confirmHandoverAndStartTrial: (orderId: string) => void;
  recordCustomerSelection: (orderId: string, selections: { [itemId: string]: 'KEEP' | 'RETURN' }) => void;
  proceedToReturnCollection: (orderId: string) => void;
  toggleItemCollected: (orderId: string, itemId: string) => void;
  confirmReturnCollection: (orderId: string, returnImages?: string[]) => void;
  proceedToPayment: (orderId: string) => void;
  confirmPaymentAndBranch: (orderId: string) => void;
  markArrivedAtStore: (orderId: string) => void;
  submitForStoreConfirmation: (orderId: string) => void;
  reconcileStoreReturn: (orderId: string) => void;
  resetToTryAndBuyOrder: () => void;
  resetToStandardOrder: () => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  activeOrders: [],
  historicalOrders: [],

  fetchAssignedOrdersAsync: async () => {
    try {
      const orders = await ordersApi.getAssignedOrders('active');
      if (orders && Array.isArray(orders)) {
        set({ activeOrders: orders });
      }
    } catch {
      // Retain existing state if backend is offline
    }
  },

  fetchHistoricalOrdersAsync: async () => {
    try {
      const orders = await ordersApi.getAssignedOrders('completed');
      if (orders && Array.isArray(orders)) {
        set({ historicalOrders: orders });
      }
    } catch {
      // Retain existing state if backend is offline
    }
  },

  receiveMockOrder: (asTryAndBuy = true) =>
    set((state) => {
      const template = asTryAndBuy ? mockTryAndBuyOrder : mockStandardOrder;
      if (state.activeOrders.some((o) => o.id === template.id)) return state;
      return { activeOrders: [JSON.parse(JSON.stringify(template))] };
    }),

  resetToTryAndBuyOrder: () =>
    set({ activeOrders: [JSON.parse(JSON.stringify(mockTryAndBuyOrder))] }),

  resetToStandardOrder: () =>
    set({ activeOrders: [JSON.parse(JSON.stringify(mockStandardOrder))] }),

  clearOrders: () => set({ activeOrders: [] }),

  acceptOrder: (orderId) => {
    set((state) => ({
      activeOrders: state.activeOrders.map((order) =>
        order.id === orderId ? { ...order, accepted: true } : order,
      ),
    }));
    ordersApi.acceptOrder(orderId).catch(() => {});
  },

  confirmPickup: (orderId) => {
    set((state) => ({
      activeOrders: state.activeOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: 'OUT_FOR_DELIVERY',
              pickupTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          : order,
      ),
    }));
    ordersApi.pickupOrder(orderId).catch(() => {});
  },

  startDelivery: (orderId) => {
    set((state) => ({
      activeOrders: state.activeOrders.map((order) =>
        order.id === orderId ? { ...order, status: 'OUT_FOR_DELIVERY' } : order,
      ),
    }));
    ordersApi.outForDelivery(orderId).catch(() => {});
  },

  markArrived: (orderId) => {
    set((state) => ({
      activeOrders: state.activeOrders.map((order) => {
        if (order.id !== orderId) return order;
        return {
          ...order,
          status: 'ARRIVED',
          tryAndBuyStage: order.isTryAndBuy ? order.tryAndBuyStage || 'HANDOVER_PENDING' : undefined,
        };
      }),
    }));
    ordersApi.markArrived(orderId).catch(() => {});
  },

  confirmDelivery: (orderId) => {
    set((state) => ({
      activeOrders: state.activeOrders.map((order) =>
        order.id === orderId ? { ...order, status: 'RETURNING' } : order,
      ),
    }));
  },

  completeOrder: (orderId) => {
    set((state) => {
      const deliveredOrder = state.activeOrders.find((o) => o.id === orderId);
      if (!deliveredOrder) return state;

      const completedOrder: Order = {
        ...deliveredOrder,
        status: 'DELIVERED',
        date: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      };

      return {
        activeOrders: state.activeOrders.filter((o) => o.id !== orderId),
        historicalOrders: [completedOrder, ...state.historicalOrders],
      };
    });
    ordersApi.deliverOrder(orderId).catch(() => {});
  },

  // ----------------------------------------------------
  // TRY & BUY STATE MACHINE ACTIONS
  // ----------------------------------------------------

  confirmHandoverAndStartTrial: (orderId) => {
    const now = new Date();
    set((state) => ({
      activeOrders: state.activeOrders.map((order) => {
        if (order.id !== orderId || !order.isTryAndBuy) return order;
        const duration = order.trialDurationMinutes || 20;
        const endsAt = new Date(now.getTime() + duration * 60 * 1000);

        return {
          ...order,
          handoverConfirmedAt: now.toISOString(),
          trialStartedAt: now.toISOString(),
          trialEndsAt: endsAt.toISOString(),
          tryAndBuyStage: 'TRIAL_IN_PROGRESS',
        };
      }),
    }));
    ordersApi.confirmHandover(orderId, '4829').catch(() => {});
  },

  recordCustomerSelection: (orderId, selections) => {
    set((state) => ({
      activeOrders: state.activeOrders.map((order) => {
        if (order.id !== orderId || !order.isTryAndBuy) return order;

        const updatedItems = (order.items || []).map((item) => {
          const decision = selections[item.id] || item.decision || 'KEEP';
          return {
            ...item,
            decision,
            collected: decision === 'KEEP',
          };
        });

        const retainedItems = updatedItems.filter((i) => i.decision === 'KEEP');
        const returnedItems = updatedItems.filter((i) => i.decision === 'RETURN');

        const finalPayableTotal = retainedItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
        const refundAmount = returnedItems.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
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
    ordersApi.recordSelections(orderId, selections).catch(() => {});
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
    set((state) => ({
      activeOrders: state.activeOrders.map((order) => {
        if (order.id !== orderId) return order;
        return {
          ...order,
          returnImages,
          tryAndBuyStage: 'PAYMENT_PENDING',
        };
      }),
    }));
    ordersApi.confirmReturnCollection(orderId, [], returnImages).catch(() => {});
  },

  proceedToPayment: (orderId) =>
    set((state) => ({
      activeOrders: state.activeOrders.map((order) =>
        order.id === orderId ? { ...order, tryAndBuyStage: 'PAYMENT_PENDING' } : order,
      ),
    })),

  confirmPaymentAndBranch: (orderId) => {
    const order = get().activeOrders.find((o) => o.id === orderId);
    if (!order) return;

    const returnedItems = (order.items || []).filter((i) => i.decision === 'RETURN');
    const returnedCount = returnedItems.length;

    ordersApi.settlePayment(orderId, { cashCollected: true }).catch(() => {});

    if (returnedCount === 0) {
      // Branch A: All items retained -> Direct completion
      get().completeOrder(orderId);
    } else {
      // Branch B & C: Some or all items returned -> Route to store with Manifest
      const manifestId = '#RM-' + Math.floor(1000 + Math.random() * 9000);
      set((state) => ({
        activeOrders: state.activeOrders.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: 'RETURNING',
                tryAndBuyStage: 'RETURNING_TO_STORE',
                returnManifestId: manifestId,
                paymentStatus: 'COLLECTED',
                storeReconciliationStatus: 'PENDING',
              }
            : o,
        ),
      }));
    }
  },

  markArrivedAtStore: (orderId) => {
    set((state) => ({
      activeOrders: state.activeOrders.map((order) =>
        order.id === orderId ? { ...order, tryAndBuyStage: 'STORE_RECONCILIATION' } : order,
      ),
    }));
    ordersApi.arriveAtStore(orderId).catch(() => {});
  },

  submitForStoreConfirmation: (orderId) =>
    set((state) => ({
      activeOrders: state.activeOrders.map((order) =>
        order.id === orderId ? { ...order, tryAndBuyStage: 'WAITING_STORE_CONFIRMATION' } : order,
      ),
    })),

  reconcileStoreReturn: (orderId) => {
    const now = new Date();
    set((state) => ({
      activeOrders: state.activeOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              storeReconciliationStatus: 'RECONCILED',
              storeReconciledAt: now.toISOString(),
            }
          : order,
      ),
    }));
    ordersApi.reconcileStoreReturn(orderId, true).catch(() => {});
    get().completeOrder(orderId);
  },
}));
