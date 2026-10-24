import { create } from 'zustand';

export type OrderStatus = 'ASSIGNED' | 'PICKED_UP' | 'OUT_FOR_DELIVERY' | 'ARRIVED' | 'DELIVERED' | 'RETURNING';
export type OrderType = 'STANDARD' | 'TRY_AND_BUY';

export type TryAndBuyStage = 
  | 'HANDOVER_PENDING'       // Phase C: Handover package to customer to start trial
  | 'TRIAL_IN_PROGRESS'      // Phase D: Customer is trying items (countdown active)
  | 'SELECTION_CONFIRMED'    // Phase E/F: Customer selected keep/return items
  | 'RETURN_COLLECTION'      // Phase G: Physical return collection & verification
  | 'PAYMENT_PENDING'        // Phase H: Final price calculation & payment settlement
  | 'RETURNING_TO_STORE'     // Phase I: Heading back to darkstore with returned items
  | 'STORE_RECONCILIATION'   // Phase J: Darkstore staff reconciling returned items
  | 'WAITING_STORE_CONFIRMATION'; // Phase K: Waiting for supervisor confirmation

export interface OrderItem {
  id: string;
  name: string;
  variant?: string;
  quantity: number;
  price: number;
  image?: string;
  // Try & Buy item state
  decision?: 'KEEP' | 'RETURN';
  collected?: boolean;
  returnCondition?: 'GOOD' | 'DAMAGED' | 'TAG_MISSING';
}

export interface Order {
  id: string;
  orderType: OrderType;
  isTryAndBuy: boolean;
  status: OrderStatus;
  pickupLocation: string;
  pickupTime: string | null;
  itemsCount: number;
  toteId: string;
  customerName: string;
  customerAddress: string;
  customerPhone?: string;
  distance: string;
  eta: string;
  date: string;
  items?: OrderItem[];
  accepted?: boolean;
  earnings?: number;

  // Try & Buy workflow metadata
  tryAndBuyStage?: TryAndBuyStage;
  trialDurationMinutes?: number;
  handoverConfirmedAt?: string | null;
  trialStartedAt?: string | null;
  trialEndsAt?: string | null;
  paymentMethod?: 'COD' | 'PREPAID';
  originalTotal?: number;
  finalPayableTotal?: number;
  amountPaid?: number;
  amountDue?: number;
  refundAmount?: number;
  paymentStatus?: 'PAID' | 'DUE' | 'REFUNDED' | 'COLLECTED';
  returnManifestId?: string;
  returnImages?: string[];
  storeReconciliationStatus?: 'PENDING' | 'RECONCILED' | 'DISCREPANCY';
  storeReconciledAt?: string | null;
}

interface OrderState {
  activeOrders: Order[];
  historicalOrders: Order[];

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

const mockTryAndBuyOrder: Order = {
  id: '#KC10248',
  orderType: 'TRY_AND_BUY',
  isTryAndBuy: true,
  status: 'ASSIGNED',
  pickupLocation: 'KudiCart Darkstore Hub #04 - Indiranagar',
  pickupTime: null,
  itemsCount: 3,
  toteId: '#T-12',
  customerName: 'Priya R.',
  customerAddress: 'Flat 402, Skyline Heights, 12th Main Road, HAL 2nd Stage',
  customerPhone: '+91 98765 43210',
  distance: '1.8 km',
  eta: '10:35 AM',
  date: 'Today, 10:14 AM',
  accepted: false,
  trialDurationMinutes: 20,
  tryAndBuyStage: 'HANDOVER_PENDING',
  paymentMethod: 'COD',
  originalTotal: 3997,
  finalPayableTotal: 3997,
  amountPaid: 0,
  amountDue: 3997,
  refundAmount: 0,
  paymentStatus: 'DUE',
  items: [
    {
      id: 'item_1',
      name: "Men's Oversized Graphic T-Shirt",
      variant: 'Size: L • Black',
      quantity: 1,
      price: 799,
      decision: undefined,
      collected: false,
    },
    {
      id: 'item_2',
      name: 'Classic Denim Jacket',
      variant: 'Size: M • Blue Wash',
      quantity: 1,
      price: 1899,
      decision: undefined,
      collected: false,
    },
    {
      id: 'item_3',
      name: 'Urban Cargo Pants',
      variant: 'Size: 32 • Olive Green',
      quantity: 1,
      price: 1299,
      decision: undefined,
      collected: false,
    },
  ],
};

const mockStandardOrder: Order = {
  id: '#KC10249',
  orderType: 'STANDARD',
  isTryAndBuy: false,
  status: 'ASSIGNED',
  pickupLocation: 'KudiCart Darkstore Hub #04 - Indiranagar',
  pickupTime: null,
  itemsCount: 2,
  toteId: '#T-08',
  customerName: 'Aarav M.',
  customerAddress: '14, Palm Grove Road, Koramangala 4th Block',
  customerPhone: '+91 98450 11223',
  distance: '2.1 km',
  eta: '10:45 AM',
  date: 'Today, 10:20 AM',
  accepted: false,
  items: [
    { id: 'std_1', name: 'Cotton Crew Socks (3-Pack)', variant: 'Size: Free • White', quantity: 1, price: 299 },
    { id: 'std_2', name: 'Casual Canvas Sneakers', variant: 'Size: 9 • Off-White', quantity: 1, price: 1499 },
  ],
};

const mockHistory: Order[] = [
  {
    id: '#KC10247',
    orderType: 'STANDARD',
    isTryAndBuy: false,
    status: 'DELIVERED',
    pickupLocation: 'KudiCart Darkstore Hub #04 - Indiranagar',
    pickupTime: '09:00 AM',
    itemsCount: 5,
    toteId: '#T-05',
    customerName: 'Rahul V.',
    customerAddress: 'Flat 402, Golden Estate, Koramangala 4th Block, Bengaluru',
    customerPhone: '+91 98450 11223',
    distance: '2.4 km',
    eta: '09:25 AM',
    date: 'Today, 09:15 AM',
    earnings: 55,
  },
  {
    id: '#KC10242',
    orderType: 'TRY_AND_BUY',
    isTryAndBuy: true,
    status: 'DELIVERED',
    pickupLocation: 'KudiCart Darkstore Hub #04 - Indiranagar',
    pickupTime: '08:15 AM',
    itemsCount: 3,
    toteId: '#T-02',
    customerName: 'Priya Sharma',
    customerAddress: '14, Palm Grove Road, Koramangala, Bengaluru',
    customerPhone: '+91 98123 45678',
    distance: '1.8 km',
    eta: '08:40 AM',
    date: 'Today, 08:35 AM',
    earnings: 45,
  },
  {
    id: '#KC10238',
    orderType: 'STANDARD',
    isTryAndBuy: false,
    status: 'DELIVERED',
    pickupLocation: 'KudiCart Darkstore Hub #04 - Indiranagar',
    pickupTime: 'Yesterday, 07:10 PM',
    itemsCount: 2,
    toteId: '#T-11',
    customerName: 'Karthik Raja',
    customerAddress: 'Villa 12, Sobha Iris, Outer Ring Road, Bengaluru',
    customerPhone: '+91 99887 66554',
    distance: '2.9 km',
    eta: '07:35 PM',
    date: 'Yesterday, 07:30 PM',
    earnings: 60,
  },
  {
    id: '#KC10229',
    orderType: 'STANDARD',
    isTryAndBuy: false,
    status: 'DELIVERED',
    pickupLocation: 'KudiCart Darkstore Hub #04 - Indiranagar',
    pickupTime: 'Yesterday, 05:40 PM',
    itemsCount: 4,
    toteId: '#T-09',
    customerName: 'Sneha Reddy',
    customerAddress: '23, 7th Cross, HSR Sector 1, Bengaluru',
    customerPhone: '+91 97766 55443',
    distance: '0.9 km',
    eta: '06:00 PM',
    date: 'Yesterday, 05:58 PM',
    earnings: 30,
  },
];


export const useOrderStore = create<OrderState>((set, get) => ({
  activeOrders: [],
  historicalOrders: mockHistory,

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

  acceptOrder: (orderId) =>
    set((state) => ({
      activeOrders: state.activeOrders.map((order) =>
        order.id === orderId ? { ...order, accepted: true } : order
      ),
    })),

  confirmPickup: (orderId) =>
    set((state) => ({
      activeOrders: state.activeOrders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: 'OUT_FOR_DELIVERY',
              pickupTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          : order
      ),
    })),

  startDelivery: (orderId) =>
    set((state) => ({
      activeOrders: state.activeOrders.map((order) =>
        order.id === orderId ? { ...order, status: 'OUT_FOR_DELIVERY' } : order
      ),
    })),

  markArrived: (orderId) =>
    set((state) => ({
      activeOrders: state.activeOrders.map((order) => {
        if (order.id !== orderId) return order;
        return {
          ...order,
          status: 'ARRIVED',
          tryAndBuyStage: order.isTryAndBuy ? (order.tryAndBuyStage || 'HANDOVER_PENDING') : undefined,
        };
      }),
    })),

  confirmDelivery: (orderId) =>
    set((state) => ({
      activeOrders: state.activeOrders.map((order) =>
        order.id === orderId ? { ...order, status: 'RETURNING' } : order
      ),
    })),

  completeOrder: (orderId) =>
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
    }),

  // ----------------------------------------------------
  // TRY & BUY STATE MACHINE ACTIONS
  // ----------------------------------------------------

  confirmHandoverAndStartTrial: (orderId) =>
    set((state) => {
      const now = new Date();
      return {
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
      };
    }),

  recordCustomerSelection: (orderId, selections) =>
    set((state) => {
      return {
        activeOrders: state.activeOrders.map((order) => {
          if (order.id !== orderId || !order.isTryAndBuy) return order;

          const updatedItems = (order.items || []).map((item) => {
            const decision = selections[item.id] || item.decision || 'KEEP';
            return {
              ...item,
              decision,
              collected: decision === 'KEEP', // Retained items are already with customer
            };
          });

          const retainedItems = updatedItems.filter((i) => i.decision === 'KEEP');
          const returnedItems = updatedItems.filter((i) => i.decision === 'RETURN');

          const originalTotal = order.originalTotal || 3997;
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
      };
    }),

  proceedToReturnCollection: (orderId) =>
    set((state) => ({
      activeOrders: state.activeOrders.map((order) =>
        order.id === orderId ? { ...order, tryAndBuyStage: 'RETURN_COLLECTION' } : order
      ),
    })),

  toggleItemCollected: (orderId, itemId) =>
    set((state) => ({
      activeOrders: state.activeOrders.map((order) => {
        if (order.id !== orderId) return order;
        return {
          ...order,
          items: (order.items || []).map((item) =>
            item.id === itemId ? { ...item, collected: !item.collected } : item
          ),
        };
      }),
    })),

  confirmReturnCollection: (orderId, returnImages = []) =>
    set((state) => ({
      activeOrders: state.activeOrders.map((order) => {
        if (order.id !== orderId) return order;
        return {
          ...order,
          returnImages,
          tryAndBuyStage: 'PAYMENT_PENDING',
        };
      }),
    })),

  proceedToPayment: (orderId) =>
    set((state) => ({
      activeOrders: state.activeOrders.map((order) =>
        order.id === orderId ? { ...order, tryAndBuyStage: 'PAYMENT_PENDING' } : order
      ),
    })),

  confirmPaymentAndBranch: (orderId) => {
    const order = get().activeOrders.find((o) => o.id === orderId);
    if (!order) return;

    const returnedItems = (order.items || []).filter((i) => i.decision === 'RETURN');
    const returnedCount = returnedItems.length;

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
            : o
        ),
      }));
    }
  },

  markArrivedAtStore: (orderId) =>
    set((state) => ({
      activeOrders: state.activeOrders.map((order) =>
        order.id === orderId ? { ...order, tryAndBuyStage: 'STORE_RECONCILIATION' } : order
      ),
    })),

  submitForStoreConfirmation: (orderId) =>
    set((state) => ({
      activeOrders: state.activeOrders.map((order) =>
        order.id === orderId ? { ...order, tryAndBuyStage: 'WAITING_STORE_CONFIRMATION' } : order
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
          : order
      ),
    }));
    get().completeOrder(orderId);
  },
}));
