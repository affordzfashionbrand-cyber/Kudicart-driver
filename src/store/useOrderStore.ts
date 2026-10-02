import { create } from 'zustand';

export type OrderStatus = 'ASSIGNED' | 'PICKED_UP' | 'OUT_FOR_DELIVERY' | 'DELIVERED';

export interface OrderItem {
  id: string;
  name: string;
  variant?: string;
  quantity: number;
}

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
  items?: OrderItem[];
}

interface OrderState {
  activeOrders: Order[];
  historicalOrders: Order[];

  // Actions
  receiveMockOrder: () => void;
  clearOrders: () => void;
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
    items: [
      { id: '1', name: 'Men\'s Oversized Graphic T-Shirt', variant: 'Size: L • Black', quantity: 1 },
      { id: '2', name: 'Classic Denim Jacket', variant: 'Size: M • Blue Wash', quantity: 1 },
      { id: '3', name: 'Urban Cargo Pants', variant: 'Size: 32 • Olive Green', quantity: 1 }
    ]
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
    date: 'Today, 09:15 AM'
  },
];

export const useOrderStore = create<OrderState>((set) => ({
  activeOrders: [],
  historicalOrders: mockHistory,

  receiveMockOrder: () => set((state) => {
    if (state.activeOrders.some(o => o.id === mockOrders[0].id)) return state;
    return { activeOrders: [mockOrders[0]] };
  }),

  clearOrders: () => set({ activeOrders: [] }),

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
