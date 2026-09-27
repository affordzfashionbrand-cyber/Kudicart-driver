import { create } from 'zustand';

export type OrderStatus = 'ASSIGNED' | 'PICKED_UP' | 'OUT_FOR_DELIVERY' | 'DELIVERED';

export interface Order {
  id: string;
  status: OrderStatus;
  pickupLocation: string;
  pickupTime: string | null;
  itemsCount: number;
  toteId: string;
  customerName: string;
  customerAddress: string;
  distance: string;
  eta: string;
  date: string;
  accepted?: boolean;
}

interface OrderState {
  activeOrders: Order[];
  historicalOrders: Order[];

  // Actions
  acceptOrder: (orderId: string) => void;
  confirmPickup: (orderId: string) => void;
  startDelivery: (orderId: string) => void;
  confirmDelivery: (orderId: string) => void;
}

const mockOrders: Order[] = [
  {
    id: '#KC10248',
    status: 'ASSIGNED',
    pickupLocation: 'KudiCart Darkstore Hub #04 - Indiranagar',
    pickupTime: null,
    itemsCount: 3,
    toteId: '#T-12',
    customerName: 'Priya R.',
    customerAddress: 'Flat 402, Skyline Heights, 12th Main Road, HAL 2nd Stage',
    distance: '1.8 km',
    eta: '10:35 AM',
    date: 'Today, 10:14 AM',
    accepted: false
  },
];

const mockHistory: Order[] = [
  {
    id: '#KC10247',
    status: 'DELIVERED',
    pickupLocation: 'KudiCart Darkstore Hub #04 - Indiranagar',
    pickupTime: '09:00 AM',
    itemsCount: 5,
    toteId: '#T-05',
    customerName: 'Rahul V.',
    customerAddress: 'Block C, Golden Estate',
    distance: '2.4 km',
    eta: '09:25 AM',
    date: 'Today, 09:15 AM',
    accepted: true
  },
];

export const useOrderStore = create<OrderState>((set) => ({
  activeOrders: mockOrders,
  historicalOrders: mockHistory,

  acceptOrder: (orderId) => {
    set((state) => ({
      activeOrders: state.activeOrders.map((order) =>
        order.id === orderId && order.status === 'ASSIGNED' && !order.accepted
          ? { ...order, accepted: true }
          : order
      ),
    }));
  },

  confirmPickup: (orderId) =>
    set((state) => ({
      activeOrders: state.activeOrders.map((order) =>
        order.id === orderId
          ? { ...order, status: 'PICKED_UP', pickupTime: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
          : order
      ),
    })),

  startDelivery: (orderId) =>
    set((state) => ({
      activeOrders: state.activeOrders.map((order) =>
        order.id === orderId ? { ...order, status: 'OUT_FOR_DELIVERY' } : order
      ),
    })),

  confirmDelivery: (orderId) =>
    set((state) => {
      const deliveredOrder = state.activeOrders.find((o) => o.id === orderId);
      if (!deliveredOrder) return state;

      const completedOrder = { ...deliveredOrder, status: 'DELIVERED' as OrderStatus, date: `Today, ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` };
      
      return {
        activeOrders: state.activeOrders.filter((o) => o.id !== orderId),
        historicalOrders: [completedOrder, ...state.historicalOrders],
      };
    }),
}));
