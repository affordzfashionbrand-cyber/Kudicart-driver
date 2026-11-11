import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, useColorScheme } from 'react-native';
import { useOrderStore } from '../../store/useOrderStore';
import { ordersApi } from '../../api';
import { tokens } from '../../theme/tokens';
import { KudiIcon } from '../../components/KudiIcon';
import { LiveRouteMapRef, DEFAULT_HUB_COORDINATES, DEFAULT_DEST_COORDINATES } from './LiveRouteMap';
import { driverSocket } from '../../services/driverSocket';
import { TryAndBuyHandoverView } from './tryAndBuy/TryAndBuyHandoverView';
import { TryAndBuyTrialProgressView } from './tryAndBuy/TryAndBuyTrialProgressView';
import { TryAndBuySelectionSummaryView } from './tryAndBuy/TryAndBuySelectionSummaryView';
import { TryAndBuyReturnCollectionView } from './tryAndBuy/TryAndBuyReturnCollectionView';
import { TryAndBuyPaymentView } from './tryAndBuy/TryAndBuyPaymentView';
import { TryAndBuyStoreReconciliationView } from './tryAndBuy/TryAndBuyStoreReconciliationView';
import { toast } from '../../store/useToastStore';
import { styles } from './details/orderDetails.styles';
import { OrderCameraModal, CameraTarget } from './details/OrderCameraModal';
import { OrderMapNavigationMode } from './details/OrderMapNavigationMode';
import { OrderDeliveryReviewView } from './details/OrderDeliveryReviewView';
import { OrderPickupReviewView } from './details/OrderPickupReviewView';
import { permissionService } from '../../services/permissionService';

const HUB_COORDINATES = DEFAULT_HUB_COORDINATES;
const DEST_COORDINATES = DEFAULT_DEST_COORDINATES;


const DEFAULT_PRODUCT_THUMBNAILS = [
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=120&q=80',
  'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=120&q=80',
  'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=120&q=80',
];

export const OrderDetailsScreen = ({ route, navigation }: any) => {
  const { orderId } = route.params || {};
  const {
    activeOrders,
    confirmPickup,
    startDelivery,
    markArrived,
    completeOrder,
    confirmHandoverAndStartTrial,
    proceedToReturnCollection,
    toggleItemCollected,
    confirmReturnCollection,
    proceedToPayment,
    confirmPaymentAndBranch,
    markArrivedAtStore,
    reconcileStoreReturn,
    refreshOrderAsync,
  } = useOrderStore();
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? tokens.colors.dark : tokens.colors.light;

  const [fetchedOrder, setFetchedOrder] = useState<any>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const localOrder = activeOrders.find((o) => o.id === orderId) || (activeOrders.length > 0 && !orderId ? activeOrders[0] : null);

  const hasLocalOrder = Boolean(localOrder);
  const loadMissingOrder = React.useCallback(() => {
    if (!orderId) return;
    setFetchError(null);
    ordersApi
      .getOrderDetails(orderId)
      .then((data) => {
        setFetchedOrder(data);
        setFetchError(null);
      })
      .catch((err: any) => {
        setFetchError(err?.message || 'Unable to load order details.');
      });
  }, [orderId]);

  useEffect(() => {
    const targetId = localOrder?.id || orderId;
    if (targetId) {
      driverSocket.subscribe(targetId);
      refreshOrderAsync(targetId).catch(() => {});
    }
    if (!hasLocalOrder && orderId) {
      loadMissingOrder();
    }
  }, [orderId, localOrder?.id, hasLocalOrder, refreshOrderAsync, loadMissingOrder]);

  const order = localOrder || fetchedOrder;
  const trialStage = order?.tryAndBuyStage;
  useEffect(() => {
    if (!order?.id || !order?.isTryAndBuy || trialStage !== 'TRIAL_IN_PROGRESS') {
      return;
    }
    const poll = setInterval(() => {
      refreshOrderAsync(order.id).catch(() => {});
    }, 8000);
    return () => clearInterval(poll);
  }, [order?.id, order?.isTryAndBuy, trialStage, refreshOrderAsync]);
  const mapRef = useRef<LiveRouteMapRef>(null);
  const [showCamera, setShowCamera] = useState<CameraTarget | false>(false);
  const [pickupImages, setPickupImages] = useState<string[]>([]);
  const [deliveryImages, setDeliveryImages] = useState<string[]>([]);
  const [handoverImages, setHandoverImages] = useState<string[]>([]);
  const [returnImages, setReturnImages] = useState<string[]>([]);
  const [fullScreenMap, setFullScreenMap] = useState(false);

  const handleOpenCamera = async (target: CameraTarget) => {
    const status = await permissionService.check('camera');
    if (status !== 'granted') {
      const res = await permissionService.request('camera');
      if (res !== 'granted') {
        toast.show({
          type: 'error',
          message: 'Camera permission is required to capture parcel proof.',
        });
        return;
      }
    }
    setShowCamera(target);
  };

  if (!order) {
    return (
      <SafeAreaView style={[styles.main, { backgroundColor: theme.canvas }]}>
        <View style={[styles.header, { borderBottomColor: theme.line, backgroundColor: theme.surface }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <KudiIcon name="arrow-left" size={24} color={theme.ink900} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.ink900 }]}>
            {fetchError ? 'Unable to Load Order' : 'Order Not Found'}
          </Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyState}>
          <Text style={{ color: theme.ink500, textAlign: 'center', marginBottom: 12 }}>
            {fetchError || 'This order has been completed or does not exist.'}
          </Text>
          {fetchError && orderId ? (
            <TouchableOpacity
              onPress={loadMissingOrder}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor: theme.ink900,
              }}
            >
              <Text style={{ color: theme.surface, fontWeight: '600' }}>Retry</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </SafeAreaView>
    );
  }

  // --------------------------------------------------------
  // ACTIVE DELIVERY WORKSPACE
  // --------------------------------------------------------
  const isOutForDelivery = order.status === 'OUT_FOR_DELIVERY';
  const isArrived = isOutForDelivery && Boolean(order.isArrived || order.arrivedAt);
  const isReturning = order.status === 'RETURNING';

  if (showCamera) {
    return (
      <OrderCameraModal
        target={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={async (photoUri) => {
          const capturedTarget = showCamera;
          setShowCamera(false);
          if (!photoUri) {
            toast.error('Camera did not return a valid photo. Please try again.');
            return;
          }
          let finalUri = photoUri;
          if (photoUri.startsWith('blob:') || photoUri.startsWith('file:')) {
            try {
              finalUri = await ordersApi.uploadProofImage(
                photoUri,
                `${capturedTarget}_${order.id}_${Date.now()}.jpg`,
              );
            } catch (err: any) {
              toast.error(err?.message || 'Failed to upload proof photo. Please retry.');
              return;
            }
          }
          if (capturedTarget === 'pickup') {
            setPickupImages((prev) => [...prev, finalUri]);
          } else if (capturedTarget === 'delivery') {
            setDeliveryImages((prev) => [...prev, finalUri]);
          } else if (capturedTarget === 'handover') {
            setHandoverImages((prev) => [...prev, finalUri]);
          } else if (capturedTarget === 'return') {
            setReturnImages((prev) => [...prev, finalUri]);
          }
        }}
      />
    );
  }

  // --------------------------------------------------------
  // STORE RETURN RECONCILIATION VIEW (PHASE J)
  // --------------------------------------------------------
  if (order.isTryAndBuy && isReturning && order.tryAndBuyStage === 'STORE_RECONCILIATION') {
    return (
      <SafeAreaView style={[styles.main, { backgroundColor: '#F3F1EC' }]}>
        <TryAndBuyStoreReconciliationView
          order={order}
          onRefreshStatus={() => {
            void refreshOrderAsync(order.id);
          }}
          onReconcileReturn={async () => {
            const ok = await reconcileStoreReturn(order.id, order.storeReconciliationStatus === 'RECONCILED');
            if (ok) {
              navigation.goBack();
            }
          }}
        />
      </SafeAreaView>
    );
  }

  const hubCoords = order.pickupCoordinates
    ? { lat: order.pickupCoordinates.latitude, lng: order.pickupCoordinates.longitude }
    : HUB_COORDINATES;
  const destCoords = order.deliveryCoordinates
    ? { lat: order.deliveryCoordinates.latitude, lng: order.deliveryCoordinates.longitude }
    : DEST_COORDINATES;

  // --------------------------------------------------------
  // MAP NAVIGATION MODE (OUT FOR DELIVERY / FULL SCREEN / RETURNING)
  // --------------------------------------------------------
  if (
    (isOutForDelivery && !isArrived) ||
    (isArrived && fullScreenMap) ||
    (isReturning &&
      order.tryAndBuyStage !== 'STORE_RECONCILIATION')
  ) {
    return (
      <OrderMapNavigationMode
        order={order}
        mapRef={mapRef}
        fullScreenMap={fullScreenMap}
        setFullScreenMap={setFullScreenMap}
        onBack={() => {
          if (fullScreenMap) setFullScreenMap(false);
          else navigation.goBack();
        }}
        isReturning={isReturning}
        theme={theme}
        hubCoordinates={hubCoords}
        destCoordinates={destCoords}
        onMarkArrived={() => {
          if (isReturning) {
            if (order.isTryAndBuy) {
              markArrivedAtStore(order.id);
            } else {
              completeOrder(order.id);
              navigation.goBack();
            }
          } else {
            markArrived(order.id);
          }
        }}
      />
    );
  }

  // --------------------------------------------------------
  // TRY & BUY AT-CUSTOMER LIFECYCLE (PHASES C, D, E, F, G, H)
  // --------------------------------------------------------
  if (isArrived && order.isTryAndBuy) {
    const stage = order.tryAndBuyStage || 'HANDOVER_PENDING';

    if (stage === 'HANDOVER_PENDING') {
      return (
        <SafeAreaView style={[styles.main, { backgroundColor: '#F3F1EC' }]}>
          <TryAndBuyHandoverView
            order={order}
            onConfirmHandover={(code) => confirmHandoverAndStartTrial(order.id, code, handoverImages)}
            onOpenMap={() => setFullScreenMap(true)}
            handoverImages={handoverImages}
            onOpenCamera={() => handleOpenCamera('handover')}
            onRemoveImage={(idx) => setHandoverImages(handoverImages.filter((_, i) => i !== idx))}
          />
        </SafeAreaView>
      );
    }

    if (stage === 'TRIAL_IN_PROGRESS') {
      return (
        <SafeAreaView style={[styles.main, { backgroundColor: '#F3F1EC' }]}>
          <TryAndBuyTrialProgressView
            order={order}
            onBack={() => navigation.goBack()}
            onRefreshSelection={() => refreshOrderAsync(order.id)}
            onContactCustomer={() =>
              toast.info('Customer calling is disabled. Confirm doorstep arrival to coordinate.')
            }
          />
        </SafeAreaView>
      );
    }

    if (stage === 'SELECTION_CONFIRMED') {
      return (
        <SafeAreaView style={[styles.main, { backgroundColor: '#F3F1EC' }]}>
          <TryAndBuySelectionSummaryView
            order={order}
            onProceedToReturnCollection={() => proceedToReturnCollection(order.id)}
            onProceedToPayment={() => proceedToPayment(order.id)}
          />
        </SafeAreaView>
      );
    }

    if (stage === 'RETURN_COLLECTION') {
      return (
        <SafeAreaView style={[styles.main, { backgroundColor: '#F3F1EC' }]}>
          <TryAndBuyReturnCollectionView
            order={order}
            onToggleCollected={(itemId) => toggleItemCollected(order.id, itemId)}
            onOpenCamera={() => handleOpenCamera('return')}
            returnImages={returnImages}
            onRemoveImage={(idx) => setReturnImages(returnImages.filter((_, i) => i !== idx))}
            onConfirmCollection={(images) => confirmReturnCollection(order.id, images)}
          />
        </SafeAreaView>
      );
    }

    if (stage === 'PAYMENT_PENDING') {
      return (
        <SafeAreaView style={[styles.main, { backgroundColor: '#F3F1EC' }]}>
          <TryAndBuyPaymentView
            order={order}
            onConfirmPaymentAndBranch={() => {
              const returnedCount = (order.items || []).filter((i: any) => i.decision === 'RETURN').length;
              confirmPaymentAndBranch(order.id);
              if (returnedCount === 0) {
                navigation.goBack();
              }
            }}
          />
        </SafeAreaView>
      );
    }
  }

  // --------------------------------------------------------
  // AT CUSTOMER REVIEW (NON-TRY & BUY)
  // --------------------------------------------------------
  if (isArrived) {
    return (
      <OrderDeliveryReviewView
        order={order}
        deliveryImages={deliveryImages}
        setDeliveryImages={setDeliveryImages}
        onOpenCamera={() => handleOpenCamera('delivery')}
        onOpenMap={() => setFullScreenMap(true)}
        onConfirmDelivery={(cashCollected) => {
          completeOrder(order.id, deliveryImages, cashCollected);
          toast.success('Order delivered successfully.');
          navigation.goBack();
        }}
        defaultProductThumbnails={DEFAULT_PRODUCT_THUMBNAILS}
      />
    );
  }

  // --------------------------------------------------------
  // PICKUP REVIEW (ASSIGNED & PICKED_UP STATES)
  // --------------------------------------------------------
  return (
    <OrderPickupReviewView
      order={order}
      pickupImages={pickupImages}
      setPickupImages={setPickupImages}
      onOpenCamera={() => handleOpenCamera('pickup')}
      onConfirmPickup={() => {
        confirmPickup(order.id, pickupImages);
        toast.success('Pickup verified. Tap Start Delivery when departing hub.');
      }}
      onStartDelivery={() => {
        startDelivery(order.id);
        toast.success('Delivery started! Live tracking active.');
      }}
      onBack={() => navigation.goBack()}
      defaultProductThumbnails={DEFAULT_PRODUCT_THUMBNAILS}
    />
  );
};
