import { ordersApi, mapBackendDriverOrder } from '../api';
import { setAuthToken } from '../api/client';
import { driverSocket } from '../services/driverSocket';
import { locationTrackingService } from '../services/locationTrackingService';
import { Order, useOrderStore } from '../store/useOrderStore';

class FakeFeedWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;
  static instances: FakeFeedWebSocket[] = [];
  readyState = FakeFeedWebSocket.OPEN;
  sent: string[] = [];
  onopen: (() => void) | null = null;
  onmessage: ((ev: { data: string }) => void) | null = null;
  onerror: ((err: any) => void) | null = null;
  onclose: ((ev: { code?: number }) => void) | null = null;

  constructor(_url: string) {
    FakeFeedWebSocket.instances.push(this);
    setTimeout(() => {
      this.onopen?.();
    }, 0);
  }

  send(data: string) {
    this.sent.push(data);
  }

  close(code = 1000) {
    this.readyState = 3;
    this.onclose?.({ code });
  }
}

const makeAssignedOrder = (overrides: Partial<Order> = {}): Order => ({
  id: 'ORD-DEC-1',
  orderNumber: 'DEC-1001',
  status: 'READY_FOR_PICKUP',
  deliveryAssignmentStatus: 'ASSIGNED',
  orderType: 'STANDARD',
  isTryAndBuy: false,
  accepted: false,
  customerName: 'Asha Mehta',
  customerPhone: '+91 9811111111',
  customerAddress: 'Indiranagar 100ft Rd',
  pickupLocation: 'Dark Store HSR',
  pickupAddress: 'HSR Layout',
  pickupTime: null,
  toteId: 'T-01',
  date: 'Today',
  distance: '2 km',
  eta: '10 mins',
  itemsCount: 1,
  paymentMethod: 'COD',
  paymentStatus: 'PENDING',
  items: [
    { id: 'itm-1', name: 'Linen Shirt', price: 1299, quantity: 1 },
  ],
  ...overrides,
});

describe('Decoupled Order & Delivery Assignment Driver Flows', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    FakeFeedWebSocket.instances = [];
    (globalThis as any).WebSocket = FakeFeedWebSocket;
    useOrderStore.setState({
      activeOrders: [],
      historicalOrders: [],
      pendingSyncQueue: [],
      lastSyncError: null,
    });
    jest.spyOn(locationTrackingService, 'startTracking').mockImplementation(() => {});
    jest.spyOn(locationTrackingService, 'stopTracking').mockImplementation(() => {});
  });

  afterEach(() => {
    driverSocket.disconnect();
    jest.useRealTimers();
  });

  test('mapBackendDriverOrder maps decoupled assignment state and TRY_AND_BUY orderType', () => {
    const mappedUnaccepted = mapBackendDriverOrder({
      id: 'ord-1',
      status: 'ACCEPTED',
      deliveryAssignmentStatus: 'ASSIGNED',
      orderType: 'TRY_AND_BUY',
      items: [],
    });
    expect(mappedUnaccepted.accepted).toBe(false);
    expect(mappedUnaccepted.deliveryAssignmentStatus).toBe('ASSIGNED');
    expect(mappedUnaccepted.isTryAndBuy).toBe(true);

    const mappedAccepted = mapBackendDriverOrder({
      id: 'ord-2',
      status: 'PACKING',
      deliveryAssignmentStatus: 'ACCEPTED_BY_DELIVERY_PARTNER',
      orderType: 'STANDARD',
      items: [],
    });
    expect(mappedAccepted.accepted).toBe(true);
    expect(mappedAccepted.deliveryAssignmentStatus).toBe('ACCEPTED_BY_DELIVERY_PARTNER');
    expect(mappedAccepted.isTryAndBuy).toBe(false);
  });

  test('acceptOrder & rejectOrder update store state and roll back on client error', async () => {
    const ord = makeAssignedOrder();
    useOrderStore.setState({ activeOrders: [ord] });

    const acceptSpy = jest.spyOn(ordersApi, 'acceptOrder').mockResolvedValueOnce({
      order: {
        ...ord,
        accepted: true,
        deliveryAssignmentStatus: 'ACCEPTED_BY_DELIVERY_PARTNER',
      },
    });
    const okAccept = await useOrderStore.getState().acceptOrder(ord.id);
    expect(okAccept).toBe(true);
    expect(acceptSpy).toHaveBeenCalledWith(ord.id, expect.any(String));
    expect(useOrderStore.getState().activeOrders[0].accepted).toBe(true);
    expect(useOrderStore.getState().activeOrders[0].deliveryAssignmentStatus).toBe(
      'ACCEPTED_BY_DELIVERY_PARTNER',
    );

    const rejectSpy = jest.spyOn(ordersApi, 'rejectOrder').mockResolvedValueOnce({ success: true });
    jest.spyOn(ordersApi, 'getAssignedOrders').mockResolvedValueOnce([]);
    const okReject = await useOrderStore.getState().rejectOrder(ord.id, 'Vehicle flat tire');
    expect(okReject).toBe(true);
    expect(rejectSpy).toHaveBeenCalledWith(ord.id, 'Vehicle flat tire', expect.any(String));
    expect(useOrderStore.getState().activeOrders).toHaveLength(0);

    // 400 rollback check
    useOrderStore.setState({ activeOrders: [ord] });
    jest.spyOn(ordersApi, 'rejectOrder').mockRejectedValueOnce({
      status: 400,
      message: 'Cannot reject after pickup',
    });
    const failedReject = await useOrderStore.getState().rejectOrder(ord.id, 'Late');
    expect(failedReject).toBe(false);
    expect(useOrderStore.getState().activeOrders).toHaveLength(1);
    expect(useOrderStore.getState().lastSyncError).toBe('Cannot reject after pickup');
  });

  test('driverSocket subscribes to driver feed and refreshes assigned orders on DELIVERY_ASSIGNMENT_CREATED', async () => {
    jest.useFakeTimers();
    setAuthToken('driver-jwt');
    const fetchSpy = jest
      .spyOn(useOrderStore.getState(), 'fetchAssignedOrdersAsync')
      .mockResolvedValue();

    await driverSocket.connect();
    jest.runOnlyPendingTimers();
    const ws = FakeFeedWebSocket.instances[0];
    expect(ws).toBeDefined();

    const sent = ws.sent.map((raw) => JSON.parse(raw));
    expect(sent).toContainEqual({ type: 'SUBSCRIBE_FEED' });

    ws.onmessage?.({
      data: JSON.stringify({
        type: 'DELIVERY_ASSIGNMENT_CREATED',
        orderId: 'ORD-NEW-9',
        assignmentStatus: 'ASSIGNED',
      }),
    });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
