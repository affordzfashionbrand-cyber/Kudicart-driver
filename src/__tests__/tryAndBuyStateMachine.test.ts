import { ordersApi } from '../api';
import { locationTrackingService } from '../services/locationTrackingService';
import { Order } from '../store/orderTypes';
import { useOrderStore } from '../store/useOrderStore';

const makeOrderFixture = (isTryAndBuy: boolean): Order => ({
  id: isTryAndBuy ? 'ORD-TNB-1' : 'ORD-STD-1',
  orderNumber: isTryAndBuy ? 'TNB-1001' : 'STD-1001',
  status: 'ACCEPTED',
  orderType: isTryAndBuy ? 'TRY_AND_BUY' : 'STANDARD',
  isTryAndBuy,
  accepted: true,
  customerName: 'Test Customer',
  customerPhone: '+91 9000000000',
  customerAddress: '12th Main Rd, Bengaluru',
  pickupLocation: 'Affordz Fashion Store',
  pickupAddress: 'HSR Sector 2, Bengaluru',
  pickupTime: null,
  toteId: 'TOTE-101',
  date: 'Today',
  pickupCoordinates: { latitude: 12.9719, longitude: 77.6412 },
  deliveryCoordinates: { latitude: 12.9658, longitude: 77.6464 },
  paymentMethod: 'COD',
  paymentStatus: 'PENDING',
  trialDurationMinutes: isTryAndBuy ? 10 : undefined,
  distance: '2.4 km',
  eta: '12 mins',
  earnings: 65,
  itemsCount: 2,
  items: [
    {
      id: 'item-1',
      name: 'Classic Cotton Shirt',
      price: 999,
      quantity: 1,
      image: 'https://example.com/shirt.jpg',
    },
    {
      id: 'item-2',
      name: 'Slim Chino Trousers',
      price: 1499,
      quantity: 2,
      image: 'https://example.com/chino.jpg',
    },
  ],
});

describe('Order & Try & Buy State Machine Flows', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    useOrderStore.setState({
      activeOrders: [],
      historicalOrders: [],
      pendingSyncQueue: [],
      lastSyncError: null,
    });

    jest.spyOn(locationTrackingService, 'startTracking').mockImplementation(() => {});
    jest.spyOn(locationTrackingService, 'stopTracking').mockImplementation(() => {});
    jest.spyOn(ordersApi, 'pickupOrder').mockResolvedValue({ success: true } as any);
    jest.spyOn(ordersApi, 'outForDelivery').mockResolvedValue({ success: true } as any);
    jest.spyOn(ordersApi, 'markArrived').mockResolvedValue({ success: true } as any);
    jest.spyOn(ordersApi, 'deliverOrder').mockResolvedValue({ success: true } as any);
    jest.spyOn(ordersApi, 'confirmHandover').mockResolvedValue({ success: true } as any);
    jest.spyOn(ordersApi, 'recordSelections').mockResolvedValue({ success: true } as any);
    jest.spyOn(ordersApi, 'confirmReturnCollection').mockResolvedValue({ success: true } as any);
    jest.spyOn(ordersApi, 'settlePayment').mockResolvedValue({ success: true } as any);
    jest.spyOn(ordersApi, 'arriveAtStore').mockResolvedValue({ success: true } as any);
    jest.spyOn(ordersApi, 'reconcileStoreReturn').mockResolvedValue({ success: true } as any);
  });

  test('Standard Order Lifecycle: ACCEPTED -> PICKED_UP (tracks) -> OUT_FOR_DELIVERY -> ARRIVED -> DELIVERED', () => {
    const baseOrder = makeOrderFixture(false);
    useOrderStore.setState({ activeOrders: [baseOrder] });

    useOrderStore.getState().confirmPickup(baseOrder.id, ['pickup_img.jpg']);
    expect(useOrderStore.getState().activeOrders[0].status).toBe('PICKED_UP');
    expect(locationTrackingService.startTracking).toHaveBeenCalledWith(baseOrder.id);

    useOrderStore.getState().startDelivery(baseOrder.id);
    expect(useOrderStore.getState().activeOrders[0].status).toBe('OUT_FOR_DELIVERY');
    expect(locationTrackingService.startTracking).toHaveBeenCalledWith(baseOrder.id);

    useOrderStore.getState().markArrived(baseOrder.id);
    expect(useOrderStore.getState().activeOrders[0].status).toBe('OUT_FOR_DELIVERY');
    expect(useOrderStore.getState().activeOrders[0].isArrived).toBe(true);

    useOrderStore.getState().completeOrder(baseOrder.id, ['deliv_img.jpg'], true);
    expect(useOrderStore.getState().activeOrders).toHaveLength(0);
    expect(useOrderStore.getState().historicalOrders).toHaveLength(1);
    expect(useOrderStore.getState().historicalOrders[0].status).toBe('DELIVERED');
    expect(locationTrackingService.stopTracking).toHaveBeenCalled();
  });

  test('Try & Buy requires customer OTP before starting trial and finishes 100% Keep with PAID status', async () => {
    const tnbOrder = makeOrderFixture(true);
    useOrderStore.setState({ activeOrders: [tnbOrder] });

    useOrderStore.getState().confirmPickup(tnbOrder.id);
    useOrderStore.getState().startDelivery(tnbOrder.id);
    useOrderStore.getState().markArrived(tnbOrder.id);

    expect(useOrderStore.getState().activeOrders[0].status).toBe('OUT_FOR_DELIVERY');
    expect(useOrderStore.getState().activeOrders[0].tryAndBuyStage).toBe('HANDOVER_PENDING');

    useOrderStore.getState().confirmHandoverAndStartTrial(tnbOrder.id, '');
    expect(ordersApi.confirmHandover).not.toHaveBeenCalled();
    expect(useOrderStore.getState().activeOrders[0].tryAndBuyStage).toBe('HANDOVER_PENDING');
    expect(useOrderStore.getState().lastSyncError).toMatch(/OTP/i);

    useOrderStore.getState().confirmHandoverAndStartTrial(tnbOrder.id, '1234', ['handover.jpg']);
    expect(ordersApi.confirmHandover).toHaveBeenCalledWith(
      tnbOrder.id,
      '1234',
      ['handover.jpg'],
      expect.any(String),
    );
    expect(useOrderStore.getState().activeOrders[0].tryAndBuyStage).toBe('TRIAL_IN_PROGRESS');

    useOrderStore.getState().recordCustomerSelection(tnbOrder.id, {
      'item-1': 'KEEP',
      'item-2': 'KEEP',
    });

    const updated = useOrderStore.getState().activeOrders[0];
    expect(updated.tryAndBuyStage).toBe('SELECTION_CONFIRMED');
    expect(updated.finalPayableTotal).toBe(3997);
    expect(updated.refundAmount).toBe(0);
    expect(updated.amountDue).toBe(3997);

    useOrderStore.getState().proceedToPayment(tnbOrder.id);
    expect(useOrderStore.getState().activeOrders[0].tryAndBuyStage).toBe('PAYMENT_PENDING');

    await useOrderStore.getState().confirmPaymentAndBranch(tnbOrder.id, true);
    expect(useOrderStore.getState().activeOrders).toHaveLength(0);
    expect(useOrderStore.getState().historicalOrders).toHaveLength(1);
    expect(useOrderStore.getState().historicalOrders[0].status).toBe('DELIVERED');
    expect(useOrderStore.getState().historicalOrders[0].paymentStatus).toBe('PAID');
  });

  test('Try & Buy Partial Return returns to store and completes reconciliation without self-confirm override', async () => {
    const tnbOrder = makeOrderFixture(true);
    useOrderStore.setState({ activeOrders: [tnbOrder] });

    useOrderStore.getState().markArrived(tnbOrder.id);
    useOrderStore.getState().confirmHandoverAndStartTrial(tnbOrder.id, '5678');

    useOrderStore.getState().recordCustomerSelection(tnbOrder.id, {
      'item-1': 'KEEP',
      'item-2': 'RETURN',
    });

    const updated = useOrderStore.getState().activeOrders[0];
    expect(updated.finalPayableTotal).toBe(999);
    expect(updated.refundAmount).toBe(2998);

    useOrderStore.getState().proceedToReturnCollection(tnbOrder.id);
    expect(useOrderStore.getState().activeOrders[0].tryAndBuyStage).toBe('RETURN_COLLECTION');

    useOrderStore.getState().toggleItemCollected(tnbOrder.id, 'item-2');
    useOrderStore.getState().confirmReturnCollection(tnbOrder.id, ['return_img.jpg']);
    expect(useOrderStore.getState().activeOrders[0].tryAndBuyStage).toBe('PAYMENT_PENDING');

    await useOrderStore.getState().confirmPaymentAndBranch(tnbOrder.id, true);
    const branchOrder = useOrderStore.getState().activeOrders[0];
    expect(branchOrder.status).toBe('RETURNING');
    expect(branchOrder.tryAndBuyStage).toBe('RETURNING_TO_STORE');
    expect(branchOrder.paymentStatus).toBe('PAID');
    expect(branchOrder.returnManifestId).toBeUndefined();
    expect(branchOrder.storeReconciliationStatus).toBe('PENDING');

    useOrderStore.getState().markArrivedAtStore(tnbOrder.id);
    expect(useOrderStore.getState().activeOrders[0].tryAndBuyStage).toBe('STORE_RECONCILIATION');

    const ok = await useOrderStore.getState().reconcileStoreReturn(tnbOrder.id);
    expect(ok).toBe(true);
    expect(ordersApi.reconcileStoreReturn).toHaveBeenCalledWith(tnbOrder.id, undefined, undefined);
    expect(useOrderStore.getState().activeOrders).toHaveLength(0);
    expect(useOrderStore.getState().historicalOrders[0].status).toBe('RETURNED');
    expect(useOrderStore.getState().historicalOrders[0].storeReconciliationStatus).toBe('RECONCILED');
  });

  test('reconcileStoreReturn keeps order active when server rejects with 4xx', async () => {
    const returningOrder: Order = {
      ...makeOrderFixture(true),
      status: 'RETURNING',
      tryAndBuyStage: 'STORE_RECONCILIATION',
      storeReconciliationStatus: 'PENDING',
    };
    useOrderStore.setState({ activeOrders: [returningOrder] });
    jest
      .spyOn(ordersApi, 'reconcileStoreReturn')
      .mockRejectedValueOnce({ status: 409, message: 'Supervisor confirmation required at store' });

    const ok = await useOrderStore.getState().reconcileStoreReturn(returningOrder.id);
    expect(ok).toBe(false);
    expect(useOrderStore.getState().activeOrders).toHaveLength(1);
    expect(useOrderStore.getState().historicalOrders).toHaveLength(0);
    expect(useOrderStore.getState().lastSyncError).toBe('Supervisor confirmation required at store');
  });

  test('fetchAssignedOrdersAsync resumes location tracking for active PICKED_UP orders', async () => {
    const pickedUpOrder: Order = {
      ...makeOrderFixture(false),
      status: 'PICKED_UP',
    };
    jest.spyOn(ordersApi, 'getAssignedOrders').mockResolvedValueOnce([pickedUpOrder]);

    await useOrderStore.getState().fetchAssignedOrdersAsync();
    expect(locationTrackingService.startTracking).toHaveBeenCalledWith(pickedUpOrder.id);
  });
});
