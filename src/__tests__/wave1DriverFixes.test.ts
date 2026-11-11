import { ordersApi, mapBackendDriverOrder } from '../api';
import { setAuthToken } from '../api/client';
import { driverSocket } from '../services/driverSocket';
import { locationTrackingService } from '../services/locationTrackingService';
import { notificationService } from '../services/notificationService';
import { useAuthStore, KycStatus } from '../store/useAuthStore';
import { useDriverStore } from '../store/useDriverStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { useOrderStore } from '../store/useOrderStore';

class FakeWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;
  static instances: FakeWebSocket[] = [];
  readyState = FakeWebSocket.OPEN;
  sent: string[] = [];
  onopen: (() => void) | null = null;
  onmessage: ((ev: { data: string }) => void) | null = null;
  onerror: ((err: any) => void) | null = null;
  onclose: ((ev: { code?: number }) => void) | null = null;

  constructor(_url: string) {
    FakeWebSocket.instances.push(this);
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

describe('Wave 1 Driver App Fixes', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    FakeWebSocket.instances = [];
    (globalThis as any).WebSocket = FakeWebSocket;
    jest.useFakeTimers();
  });

  afterEach(() => {
    driverSocket.disconnect();
    jest.useRealTimers();
  });

  test('driverSocket emits LOCATION_UPDATE, stops reconnect on 4001/4003, resets subscription, and refreshes on TRY_AND_BUY_UPDATED / ORDER_ARRIVED', async () => {
    setAuthToken('jwt-test-token');
    const refreshSpy = jest
      .spyOn(useOrderStore.getState(), 'refreshOrderAsync')
      .mockResolvedValue(null);

    await driverSocket.connect();
    jest.runOnlyPendingTimers();
    const ws = FakeWebSocket.instances[0];
    expect(ws).toBeDefined();

    driverSocket.subscribe('ORD-1');
    driverSocket.sendLocation('ORD-1', { latitude: 12.97, longitude: 77.64, heading: 90 });

    const sentPayloads = ws.sent.map((raw) => JSON.parse(raw));
    expect(sentPayloads).toContainEqual(
      expect.objectContaining({ type: 'SUBSCRIBE', orderId: 'ORD-1' }),
    );
    expect(sentPayloads).toContainEqual(
      expect.objectContaining({
        type: 'LOCATION_UPDATE',
        orderId: 'ORD-1',
        latitude: 12.97,
        longitude: 77.64,
        heading: 90,
      }),
    );

    ws.onmessage?.({ data: JSON.stringify({ type: 'TRY_AND_BUY_UPDATED', orderId: 'ORD-1' }) });
    ws.onmessage?.({ data: JSON.stringify({ type: 'ORDER_ARRIVED', orderId: 'ORD-1' }) });
    expect(refreshSpy).toHaveBeenCalledWith('ORD-1');
    expect(refreshSpy).toHaveBeenCalledTimes(2);

    // Server auth rejection (4001 / 4003) should not schedule reconnect timers
    ws.onclose?.({ code: 4001 });
    jest.advanceTimersByTime(10000);
    expect(FakeWebSocket.instances).toHaveLength(1);

    // Reconnecting and disconnecting resets subscribedOrderId so same order can be re-subscribed cleanly
    await driverSocket.connect();
    jest.runOnlyPendingTimers();
    driverSocket.disconnect();
    await driverSocket.connect();
    jest.runOnlyPendingTimers();
    const ws3 = FakeWebSocket.instances[FakeWebSocket.instances.length - 1];
    driverSocket.subscribe('ORD-1');
    expect(ws3.sent.map((s) => JSON.parse(s))).toContainEqual({
      type: 'SUBSCRIBE',
      orderId: 'ORD-1',
    });
  });

  test('ordersApi maps orderType TRY_AND_BUY reliably and does not force supervisorConfirmed=true', () => {
    const mapped = mapBackendDriverOrder({
      id: 'ORD-RAW-1',
      orderType: 'TRY_AND_BUY',
      status: 'OUT_FOR_DELIVERY',
    });
    expect(mapped.isTryAndBuy).toBe(true);
    expect(mapped.orderType).toBe('TRY_AND_BUY');

    const src = ordersApi.reconcileStoreReturn.toString();
    expect(src).not.toContain('supervisorConfirmed = true');
  });

  test('useDriverStore.fetchDashboardAsync consumes backend getDashboard payload shape and records sync errors', async () => {
    jest.spyOn(ordersApi, 'getDashboard').mockResolvedValueOnce({
      driver: {
        id: 'drv-1',
        fullName: 'Ravi Kumar',
        isOnline: true,
        kycStatus: 'UNDER_REVIEW',
        tier: 'Gold',
      },
      isOnline: true,
      todayEarnings: 1450,
      deliveriesCompletedToday: 11,
      activeOrders: [],
      availableJobs: [],
    });

    await useDriverStore.getState().fetchDashboardAsync();
    const state = useDriverStore.getState();
    expect(state.profile.fullName).toBe('Ravi Kumar');
    expect(state.profile.tier).toBe('Gold');
    expect(state.isOnline).toBe(true);
    expect(state.kyc?.status).toBe('UNDER_REVIEW');
    expect(state.workSummary?.totalEarnings).toBe(1450);
    expect(state.workSummary?.ordersDone).toBe(11);
    expect(state.lastError).toBeNull();

    jest.spyOn(ordersApi, 'getDashboard').mockRejectedValueOnce(new Error('Network down'));
    await useDriverStore.getState().fetchDashboardAsync();
    expect(useDriverStore.getState().lastError).toBe('Network down');
  });

  test('useAuthStore supports UNDER_REVIEW KYC status and logout clears driver/order/notification stores', async () => {
    const statusValue: KycStatus = 'UNDER_REVIEW';
    useAuthStore.setState({
      isAuthenticated: true,
      kycStatus: statusValue,
      phoneNumber: '+91 9876543210',
      token: 'tok-1',
    });
    useNotificationStore.setState({
      notifications: [
        {
          id: 'n1',
          category: 'ORDER',
          title: 'Order',
          body: 'Assigned',
          timestamp: 'now',
          read: false,
        },
      ],
    });
    useDriverStore.setState({ isOnline: true });
    jest.spyOn(notificationService, 'unregisterDeviceToken').mockResolvedValue(true);
    jest.spyOn(notificationService, 'teardownListeners').mockImplementation(() => {});
    jest.spyOn(locationTrackingService, 'stopTracking').mockImplementation(() => {});

    await useAuthStore.getState().logout();

    expect(locationTrackingService.stopTracking).toHaveBeenCalled();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useOrderStore.getState().activeOrders).toHaveLength(0);
    expect(useDriverStore.getState().isOnline).toBe(false);
    expect(useNotificationStore.getState().notifications).toHaveLength(0);
  });
});
