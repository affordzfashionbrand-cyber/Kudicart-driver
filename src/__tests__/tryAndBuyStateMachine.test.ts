import { useOrderStore, Order } from '../store/useOrderStore';

describe('Try & Buy End-to-End Lifecycle State Machine', () => {
  beforeEach(() => {
    useOrderStore.getState().clearOrders();
  });

  test('1. Standard delivery orders retain their existing behaviour', () => {
    useOrderStore.getState().receiveMockOrder(false); // standard order
    const order = useOrderStore.getState().activeOrders[0];
    expect(order.isTryAndBuy).toBe(false);
    expect(order.orderType).toBe('STANDARD');

    useOrderStore.getState().confirmPickup(order.id);
    expect(useOrderStore.getState().activeOrders[0].status).toBe('OUT_FOR_DELIVERY');

    useOrderStore.getState().markArrived(order.id);
    expect(useOrderStore.getState().activeOrders[0].status).toBe('ARRIVED');
    expect(useOrderStore.getState().activeOrders[0].tryAndBuyStage).toBeUndefined();

    useOrderStore.getState().confirmDelivery(order.id);
    expect(useOrderStore.getState().activeOrders[0].status).toBe('RETURNING');
  });

  test('2. Try & Buy order initializes with HANDOVER_PENDING and trial cannot start before confirmation', () => {
    useOrderStore.getState().receiveMockOrder(true); // Try & Buy order
    const order = useOrderStore.getState().activeOrders[0];
    expect(order.isTryAndBuy).toBe(true);
    expect(order.status).toBe('ASSIGNED');
    expect(order.tryAndBuyStage).toBe('HANDOVER_PENDING');
    expect(order.trialStartedAt).toBeFalsy();
    expect(order.trialEndsAt).toBeFalsy();

    // Confirm pickup & mark arrived
    useOrderStore.getState().confirmPickup(order.id);
    useOrderStore.getState().markArrived(order.id);

    const arrivedOrder = useOrderStore.getState().activeOrders[0];
    expect(arrivedOrder.status).toBe('ARRIVED');
    expect(arrivedOrder.tryAndBuyStage).toBe('HANDOVER_PENDING');
  });

  test('3. Handover confirmation starts the authoritative trial timer', () => {
    useOrderStore.getState().receiveMockOrder(true);
    const order = useOrderStore.getState().activeOrders[0];

    useOrderStore.getState().confirmHandoverAndStartTrial(order.id);
    const inProgressOrder = useOrderStore.getState().activeOrders[0];

    expect(inProgressOrder.tryAndBuyStage).toBe('TRIAL_IN_PROGRESS');
    expect(inProgressOrder.trialStartedAt).toBeTruthy();
    expect(inProgressOrder.trialEndsAt).toBeTruthy();
    expect(inProgressOrder.handoverConfirmedAt).toBeTruthy();

    const startTime = new Date(inProgressOrder.trialStartedAt!).getTime();
    const endTime = new Date(inProgressOrder.trialEndsAt!).getTime();
    const diffMinutes = Math.round((endTime - startTime) / (60 * 1000));
    expect(diffMinutes).toBe(20);
  });

  test('4. Customer item selections update retained totals, refund amounts and state', () => {
    useOrderStore.getState().receiveMockOrder(true);
    const order = useOrderStore.getState().activeOrders[0];
    useOrderStore.getState().confirmHandoverAndStartTrial(order.id);

    // Customer keeps item 1 (₹799) and item 3 (₹1,299), returns item 2 (₹1,899)
    useOrderStore.getState().recordCustomerSelection(order.id, {
      item_1: 'KEEP',
      item_2: 'RETURN',
      item_3: 'KEEP',
    });

    const confirmedOrder = useOrderStore.getState().activeOrders[0];
    expect(confirmedOrder.tryAndBuyStage).toBe('SELECTION_CONFIRMED');

    // Total: 799 + 1299 = 2098
    expect(confirmedOrder.finalPayableTotal).toBe(2098);
    expect(confirmedOrder.refundAmount).toBe(1899);
    expect(confirmedOrder.amountDue).toBe(2098);

    const item2 = confirmedOrder.items?.find((i) => i.id === 'item_2');
    expect(item2?.decision).toBe('RETURN');
    expect(item2?.collected).toBe(false);
  });

  test('5. Physical return collection tracks collected status', () => {
    useOrderStore.getState().receiveMockOrder(true);
    const order = useOrderStore.getState().activeOrders[0];
    useOrderStore.getState().confirmHandoverAndStartTrial(order.id);
    useOrderStore.getState().recordCustomerSelection(order.id, {
      item_1: 'KEEP',
      item_2: 'RETURN',
      item_3: 'KEEP',
    });

    useOrderStore.getState().proceedToReturnCollection(order.id);
    expect(useOrderStore.getState().activeOrders[0].tryAndBuyStage).toBe('RETURN_COLLECTION');

    // Toggle collected for item_2
    useOrderStore.getState().toggleItemCollected(order.id, 'item_2');
    const updatedItem2 = useOrderStore.getState().activeOrders[0].items?.find((i) => i.id === 'item_2');
    expect(updatedItem2?.collected).toBe(true);

    // Confirm collection
    useOrderStore.getState().confirmReturnCollection(order.id, ['mock_return_photo.jpg']);
    const paymentStageOrder = useOrderStore.getState().activeOrders[0];
    expect(paymentStageOrder.tryAndBuyStage).toBe('PAYMENT_PENDING');
    expect(paymentStageOrder.returnImages).toEqual(['mock_return_photo.jpg']);
  });

  test('6. Branch A: All items retained completes delivery directly without store return', () => {
    useOrderStore.getState().receiveMockOrder(true);
    const order = useOrderStore.getState().activeOrders[0];
    useOrderStore.getState().confirmHandoverAndStartTrial(order.id);

    // All kept
    useOrderStore.getState().recordCustomerSelection(order.id, {
      item_1: 'KEEP',
      item_2: 'KEEP',
      item_3: 'KEEP',
    });

    useOrderStore.getState().proceedToPayment(order.id);
    useOrderStore.getState().confirmPaymentAndBranch(order.id);

    // Order should be completed directly
    expect(useOrderStore.getState().activeOrders.length).toBe(0);
    const completed = useOrderStore.getState().historicalOrders.find((o) => o.id === order.id);
    expect(completed).toBeDefined();
    expect(completed?.status).toBe('DELIVERED');
  });

  test('7. Branch B & C: Return items generate manifest and require store reconciliation', () => {
    useOrderStore.getState().receiveMockOrder(true);
    const order = useOrderStore.getState().activeOrders[0];
    useOrderStore.getState().confirmHandoverAndStartTrial(order.id);

    // Partial return
    useOrderStore.getState().recordCustomerSelection(order.id, {
      item_1: 'KEEP',
      item_2: 'RETURN',
      item_3: 'KEEP',
    });

    useOrderStore.getState().toggleItemCollected(order.id, 'item_2');
    useOrderStore.getState().confirmReturnCollection(order.id, ['return_proof.jpg']);
    useOrderStore.getState().confirmPaymentAndBranch(order.id);

    // Should branch into RETURNING status with Manifest
    const returningOrder = useOrderStore.getState().activeOrders[0];
    expect(returningOrder.status).toBe('RETURNING');
    expect(returningOrder.tryAndBuyStage).toBe('RETURNING_TO_STORE');
    expect(returningOrder.returnManifestId).toMatch(/^#RM-\d+/);
    expect(returningOrder.storeReconciliationStatus).toBe('PENDING');

    // Partner arrives at store
    useOrderStore.getState().markArrivedAtStore(order.id);
    expect(useOrderStore.getState().activeOrders[0].tryAndBuyStage).toBe('STORE_RECONCILIATION');

    // Partner submits items for inwarding verification
    useOrderStore.getState().submitForStoreConfirmation(order.id);
    expect(useOrderStore.getState().activeOrders[0].tryAndBuyStage).toBe('WAITING_STORE_CONFIRMATION');

    // Store reconciles and receives returned items
    useOrderStore.getState().reconcileStoreReturn(order.id);

    expect(useOrderStore.getState().activeOrders.length).toBe(0);
    const completed = useOrderStore.getState().historicalOrders.find((o) => o.id === order.id);
    expect(completed?.storeReconciliationStatus).toBe('RECONCILED');
    expect(completed?.status).toBe('DELIVERED');
  });
});
