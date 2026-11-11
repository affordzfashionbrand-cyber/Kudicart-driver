import { ordersApi, profileApi, authApi } from '../api';
import {
  PROACTIVE_TOKEN_REFRESH_MS,
  request,
  resetAuthClientState,
  setAuthToken,
  setAuthTokenIssuedAt,
} from '../api/client';
import { driverSocket } from '../services/driverSocket';
import { firebaseAuthService } from '../services/firebaseAuth';
import { locationTrackingService } from '../services/locationTrackingService';
import { notificationService } from '../services/notificationService';
import { useAuthStore } from '../store/useAuthStore';
import { useOrderStore } from '../store/useOrderStore';

const makeMockAuthUser = (kycStatus = 'APPROVED') => ({
  id: 'usr-1',
  driverId: 'drv-1',
  name: 'Ravi Kumar',
  fullName: 'Ravi Kumar',
  phone: '+919876543210',
  email: 'ravi@example.com',
  kycStatus,
  isOnline: true,
  workPreference: 'FULL_TIME',
});

const makeMockLoginResponse = (token: string, kycStatus = 'APPROVED') => ({
  success: true,
  token,
  role: 'DRIVER',
  kycStatus,
  user: makeMockAuthUser(kycStatus),
});

class FakeWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;
  static instances: FakeWebSocket[] = [];
  url: string;
  readyState = FakeWebSocket.OPEN;
  sent: string[] = [];
  onopen: (() => void) | null = null;
  onmessage: ((ev: { data: string }) => void) | null = null;
  onerror: ((err: any) => void) | null = null;
  onclose: ((ev: { code?: number }) => void) | null = null;

  constructor(url: string) {
    this.url = url;
    FakeWebSocket.instances.push(this);
    setTimeout(() => {
      this.onopen?.();
    }, 0);
  }

  send(data: string) {
    this.sent.push(data);
  }

  close(code = 1000) {
    this.readyState = FakeWebSocket.CLOSED;
    this.onclose?.({ code });
  }
}

describe('Wave 2 Driver Readiness', () => {
  const originalFetch = globalThis.fetch;
  const originalDev = (globalThis as any).__DEV__;
  const originalFirebaseBridge = (globalThis as any).__KUDICART_FIREBASE_AUTH__;

  beforeEach(() => {
    jest.restoreAllMocks();
    resetAuthClientState();
    setAuthToken(null);
    FakeWebSocket.instances = [];
    (globalThis as any).WebSocket = FakeWebSocket;
    (globalThis as any).__DEV__ = true;
    delete (globalThis as any).__KUDICART_FIREBASE_AUTH__;
    useAuthStore.setState({
      isAuthenticated: false,
      phoneNumber: null,
      kycStatus: null,
      token: null,
      authMode: null,
      isLoading: false,
      error: null,
    });
    useOrderStore.setState({
      activeOrders: [],
      historicalOrders: [],
      pendingSyncQueue: [],
      lastSyncError: null,
    });
    jest.spyOn(locationTrackingService, 'startTracking').mockImplementation(() => {});
    jest.spyOn(locationTrackingService, 'stopTracking').mockImplementation(() => {});
    jest.spyOn(notificationService, 'registerDeviceToken').mockResolvedValue(true);
    jest.spyOn(notificationService, 'unregisterDeviceToken').mockResolvedValue(true);
    jest.spyOn(notificationService, 'setupNotificationListeners').mockImplementation(() => {});
    jest.spyOn(notificationService, 'teardownListeners').mockImplementation(() => {});
  });

  afterEach(() => {
    driverSocket.disconnect();
    jest.clearAllTimers();
    globalThis.fetch = originalFetch;
    (globalThis as any).__DEV__ = originalDev;
    if (originalFirebaseBridge !== undefined) {
      (globalThis as any).__KUDICART_FIREBASE_AUTH__ = originalFirebaseBridge;
    } else {
      delete (globalThis as any).__KUDICART_FIREBASE_AUTH__;
    }
    jest.useRealTimers();
  });

  test('native firebaseAuth bridge signs in, retrieves ID token, and guards missing app config', async () => {
    const confirmMock = jest.fn().mockResolvedValue({
      user: {
        getIdToken: jest.fn().mockResolvedValue('fb-id-token-native-123'),
      },
    });
    const signInWithPhoneNumberMock = jest.fn().mockResolvedValue({
      confirm: confirmMock,
    });
    const signOutMock = jest.fn().mockResolvedValue(undefined);
    const fakeAuthInstance = {
      signInWithPhoneNumber: signInWithPhoneNumberMock,
      currentUser: {
        getIdToken: jest.fn().mockResolvedValue('fb-id-token-refreshed'),
      },
      onIdTokenChanged: jest.fn().mockReturnValue(() => {}),
      signOut: signOutMock,
    };

    await jest.isolateModulesAsync(async () => {
      jest.doMock('@react-native-firebase/app', () => ({
        __esModule: true,
        default: { apps: [{ name: '[DEFAULT]' }] },
      }));
      jest.doMock('@react-native-firebase/auth', () => ({
        __esModule: true,
        default: () => fakeAuthInstance,
      }));
      const nativeMod = jest.requireActual('../services/firebaseAuth.ts');
      const bridge = nativeMod.firebaseAuthService;

      expect(bridge.isAvailable()).toBe(true);
      await expect(bridge.sendPhoneOtp('+919876543210')).resolves.toBe(true);
      expect(bridge.hasPendingConfirmation()).toBe(true);
      const token = await bridge.confirmPhoneOtp('123456');
      expect(token).toBe('fb-id-token-native-123');
      expect(bridge.hasPendingConfirmation()).toBe(false);
      expect(await bridge.getFreshIdToken(true)).toBe('fb-id-token-refreshed');
      await bridge.signOut();
      expect(signOutMock).toHaveBeenCalled();
    });

    await jest.isolateModulesAsync(async () => {
      jest.doMock('@react-native-firebase/app', () => ({
        __esModule: true,
        default: { apps: [] },
      }));
      jest.doMock('@react-native-firebase/auth', () => ({
        __esModule: true,
        default: () => fakeAuthInstance,
      }));
      const nativeMod = jest.requireActual('../services/firebaseAuth.ts');
      const bridge = nativeMod.firebaseAuthService;
      expect(bridge.isAvailable()).toBe(false);
      await expect(bridge.sendPhoneOtp('+919876543210')).rejects.toMatchObject({
        code: 'FIREBASE_UNAVAILABLE',
      });
    });
  });

  test('Firebase Phone/OTP flow authenticates via loginFirebase and blocks dev OTP bypass in production', async () => {
    const sendMock = jest.fn().mockResolvedValue(true);
    const confirmMock = jest.fn().mockResolvedValue('fb-id-token-abc');
    (globalThis as any).__KUDICART_FIREBASE_AUTH__ = {
      isAvailable: () => true,
      hasPendingConfirmation: () => true,
      sendPhoneOtp: sendMock,
      confirmPhoneOtp: confirmMock,
    };

    const loginSpy = jest
      .spyOn(authApi, 'loginFirebase')
      .mockResolvedValue(makeMockLoginResponse('backend-jwt-after-fb', 'APPROVED'));

    const sendRes = await useAuthStore.getState().sendPhoneOtpAsync('+919876543210');
    expect(sendRes.mode).toBe('firebase');
    expect(sendMock).toHaveBeenCalledWith('+919876543210');

    const ok = await useAuthStore.getState().confirmPhoneOtpAsync('+919876543210', '654321');
    expect(ok).toBe(true);
    expect(confirmMock).toHaveBeenCalledWith('654321');
    expect(loginSpy).toHaveBeenCalledWith('fb-id-token-abc');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().authMode).toBe('firebase');
    expect(useAuthStore.getState().kycStatus).toBe('APPROVED');

    // In production (__DEV__ === false), unavailable Firebase must NOT hit dev sendOtp
    delete (globalThis as any).__KUDICART_FIREBASE_AUTH__;
    (globalThis as any).__DEV__ = false;
    const devSendOtpSpy = jest.spyOn(authApi, 'sendOtp');
    await expect(useAuthStore.getState().sendPhoneOtpAsync('+919876543210')).rejects.toThrow(
      /Firebase Phone Auth is required in production/i,
    );
    expect(devSendOtpSpy).not.toHaveBeenCalled();
  });

  test('API client proactively refreshes 1h token at 50m, retries once on 401, and never logs out on 403', async () => {
    useAuthStore.setState({
      isAuthenticated: true,
      token: 'old-session-jwt',
      kycStatus: 'APPROVED',
    });
    setAuthToken('old-session-jwt');
    setAuthTokenIssuedAt(Date.now() - PROACTIVE_TOKEN_REFRESH_MS - 5000);

    jest.spyOn(firebaseAuthService, 'getFreshIdToken').mockResolvedValue('fresh-fb-token-50m');
    jest
      .spyOn(authApi, 'loginFirebase')
      .mockResolvedValue(makeMockLoginResponse('refreshed-session-jwt', 'APPROVED'));

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ orders: [] }),
    });
    globalThis.fetch = fetchMock as any;

    await request('/driver/orders', { method: 'GET' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer refreshed-session-jwt');

    // Reset token freshness and verify 403 leaves driver authenticated
    setAuthTokenIssuedAt(Date.now());
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
      text: async () => JSON.stringify({ message: 'KYC under review' }),
    });
    await expect(request('/driver/orders', { method: 'GET' })).rejects.toMatchObject({
      status: 403,
    });
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    // 401 -> refresh succeeds -> single retry succeeds
    fetchMock
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: async () => JSON.stringify({ message: 'Token expired' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ ok: true }),
      });
    jest
      .spyOn(authApi, 'loginFirebase')
      .mockResolvedValueOnce(makeMockLoginResponse('retry-session-jwt', 'APPROVED'));

    const retryRes = await request('/driver/orders', { method: 'GET' });
    expect(retryRes).toEqual({ ok: true });
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    // 401 + refresh fails -> logs driver out cleanly
    jest.spyOn(firebaseAuthService, 'getFreshIdToken').mockResolvedValueOnce(null);
    const logoutSpy = jest
      .spyOn(authApi, 'logout')
      .mockResolvedValue({ success: true, message: 'Logged out' });
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: async () => JSON.stringify({ message: 'Invalid session' }),
    });
    await expect(request('/driver/orders', { method: 'GET' })).rejects.toMatchObject({
      status: 401,
    });
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().token).toBeNull();
    expect(logoutSpy).toHaveBeenCalled();
  });

  test('syncStatusAsync and restoreSessionAsync preserve auth on 403 and clear session only on 401', async () => {
    useAuthStore.setState({
      isAuthenticated: true,
      token: 'tok-valid',
      kycStatus: 'PENDING',
    });
    setAuthToken('tok-valid');

    jest.spyOn(authApi, 'getStatus').mockRejectedValueOnce(
      Object.assign(new Error('Driver KYC is still pending'), { status: 403 }),
    );
    await useAuthStore.getState().syncStatusAsync();
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(useAuthStore.getState().token).toBe('tok-valid');

    jest.spyOn(authApi, 'getStatus').mockRejectedValueOnce(
      Object.assign(new Error('Token revoked'), { status: 401 }),
    );
    await useAuthStore.getState().syncStatusAsync();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().token).toBeNull();

    // restoreSessionAsync validates stored token against authApi.getStatus()
    setAuthToken('stored-jwt-401');
    (globalThis as any).localStorage = {
      getItem: (k: string) => (k === 'kudicart_driver_auth_token' ? 'stored-jwt-401' : null),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };
    jest.spyOn(authApi, 'getStatus').mockRejectedValueOnce(
      Object.assign(new Error('Expired stored token'), { status: 401 }),
    );
    await useAuthStore.getState().restoreSessionAsync();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(notificationService.registerDeviceToken).not.toHaveBeenCalled();
  });

  test('driverSocket uses fresh token on connect, deduplicates seq updates, and hydrates TRY_AND_BUY_UPDATED / ORDER_ARRIVED', async () => {
    jest.useFakeTimers();
    useAuthStore.setState({
      isAuthenticated: true,
      token: 'stale-ws-jwt',
      kycStatus: 'APPROVED',
    });
    setAuthToken('stale-ws-jwt');
    setAuthTokenIssuedAt(Date.now() - PROACTIVE_TOKEN_REFRESH_MS - 1000);
    jest.spyOn(firebaseAuthService, 'getFreshIdToken').mockResolvedValue('fb-ws-fresh');
    jest
      .spyOn(authApi, 'loginFirebase')
      .mockResolvedValue(makeMockLoginResponse('fresh-ws-jwt', 'APPROVED'));

    useOrderStore.setState({
      activeOrders: [
        {
          id: 'ORD-TNB-2',
          customerName: 'Asha',
          customerPhone: '+919999999999',
          customerAddress: 'Indiranagar, Bengaluru',
          pickupLocation: 'Affordz Store',
          pickupTime: null,
          toteId: 'TOTE-2',
          distance: '2 km',
          eta: '12 min',
          date: 'Today',
          itemsCount: 2,
          earnings: 60,
          status: 'OUT_FOR_DELIVERY',
          paymentMethod: 'RAZORPAY',
          paymentStatus: 'PAID',
          orderType: 'TRY_AND_BUY',
          isTryAndBuy: true,
          tryAndBuyStage: 'TRIAL_IN_PROGRESS',
          items: [
            { id: 'itm-1', name: 'Kurta', quantity: 1, price: 999 },
            { id: 'itm-2', name: 'Jeans', quantity: 1, price: 1499 },
          ],
        },
      ],
    });
    const refreshSpy = jest
      .spyOn(useOrderStore.getState(), 'refreshOrderAsync')
      .mockResolvedValue(null);

    await driverSocket.connect('ORD-TNB-2');
    jest.runOnlyPendingTimers();

    const ws = FakeWebSocket.instances[0];
    expect(ws.url).toContain('token=fresh-ws-jwt');

    // seq: 2 arrives first
    ws.onmessage?.({
      data: JSON.stringify({
        type: 'TRY_AND_BUY_UPDATED',
        seq: 2,
        orderId: 'ORD-TNB-2',
        stage: 'SELECTION_CONFIRMED',
        items: [
          { id: 'itm-1', productName: 'Kurta', quantity: 1, price: 999, tryAndBuyDecision: 'KEEP' },
          { id: 'itm-2', productName: 'Jeans', quantity: 1, price: 1499, tryAndBuyDecision: 'RETURN' },
        ],
      }),
    });
    expect(refreshSpy).toHaveBeenCalledTimes(1);
    let updated = useOrderStore.getState().activeOrders.find((o) => o.id === 'ORD-TNB-2')!;
    expect(updated.status).toBe('OUT_FOR_DELIVERY');
    expect(updated.tryAndBuyStage).toBe('SELECTION_CONFIRMED');
    expect(updated.items?.find((i) => i.id === 'itm-2')?.decision).toBe('RETURN');

    // Duplicate seq: 2 and stale seq: 1 must be dropped cleanly
    ws.onmessage?.({
      data: JSON.stringify({
        type: 'TRY_AND_BUY_UPDATED',
        seq: 2,
        orderId: 'ORD-TNB-2',
        stage: 'TRIAL_IN_PROGRESS',
      }),
    });
    ws.onmessage?.({
      data: JSON.stringify({
        type: 'ORDER_STATUS_UPDATE',
        seq: 1,
        orderId: 'ORD-TNB-2',
        status: 'PICKED_UP',
      }),
    });
    expect(refreshSpy).toHaveBeenCalledTimes(1);
    updated = useOrderStore.getState().activeOrders.find((o) => o.id === 'ORD-TNB-2')!;
    expect(updated.status).toBe('OUT_FOR_DELIVERY');
    expect(updated.tryAndBuyStage).toBe('SELECTION_CONFIRMED');

    // Newer seq: 3 ORDER_ARRIVED is processed
    ws.onmessage?.({
      data: JSON.stringify({
        type: 'ORDER_ARRIVED',
        seq: 3,
        orderId: 'ORD-TNB-2',
        timestamp: '2026-11-11T12:00:00.000Z',
      }),
    });
    expect(refreshSpy).toHaveBeenCalledTimes(2);
    updated = useOrderStore.getState().activeOrders.find((o) => o.id === 'ORD-TNB-2')!;
    expect(updated.isArrived).toBe(true);
    expect(updated.arrivedAt).toBe('2026-11-11T12:00:00.000Z');
  });

  test('ordersApi.pickupOrder sends verificationPhotos with Idempotency-Key and profileApi uploads KYC PDFs via media/upload', async () => {
    setAuthToken('jwt-driver-1');
    const fetchMock = jest
      .fn()
      // 1) pickupOrder call
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ success: true, order: { id: 'ORD-9', status: 'PICKED_UP' } }),
      })
      // 2) /api/v1/media/upload for PDF
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ success: true, url: 'https://cdn.example.com/kyc/dl.pdf' }),
      })
      // 3) /driver/profile/documents/upload
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify({ success: true }),
      });
    globalThis.fetch = fetchMock as any;

    await ordersApi.pickupOrder(
      'ORD-9',
      ['https://cdn.example.com/pickup-1.jpg'],
      'idem-pickup-ord-9',
    );

    expect(fetchMock.mock.calls[0][0]).toContain('/driver/orders/ORD-9/pickup');
    expect(fetchMock.mock.calls[0][1].headers['Idempotency-Key']).toBe('idem-pickup-ord-9');
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({
      verificationPhotos: ['https://cdn.example.com/pickup-1.jpg'],
    });

    await profileApi.uploadDocument({
      docType: 'drivingLicence',
      side: 'front',
      fileUri: 'file:///storage/emulated/0/Download/dl.pdf',
      fileName: 'dl.pdf',
      fileSize: '1.1 MB',
      mimeType: 'application/pdf',
    });

    expect(fetchMock.mock.calls[1][0]).toContain('/api/v1/media/upload');
    expect(fetchMock.mock.calls[2][0]).toContain('/driver/profile/documents/upload');
    expect(JSON.parse(fetchMock.mock.calls[2][1].body)).toEqual({
      docType: 'drivingLicence',
      side: 'front',
      fileUri: 'https://cdn.example.com/kyc/dl.pdf',
      fileName: 'dl.pdf',
      fileSize: '1.1 MB',
      mimeType: 'application/pdf',
    });
  });
});
