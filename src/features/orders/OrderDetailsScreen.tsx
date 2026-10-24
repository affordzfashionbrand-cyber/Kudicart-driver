import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, useColorScheme } from 'react-native';
import { useOrderStore } from '../../store/useOrderStore';
import { tokens } from '../../theme/tokens';
import { KudiIcon } from '../../components/KudiIcon';
import { LiveRouteMapRef, DEFAULT_HUB_COORDINATES, DEFAULT_DEST_COORDINATES } from './LiveRouteMap';
import { TryAndBuyHandoverView } from './tryAndBuy/TryAndBuyHandoverView';
import { TryAndBuyTrialProgressView } from './tryAndBuy/TryAndBuyTrialProgressView';
import { TryAndBuySelectionSummaryView } from './tryAndBuy/TryAndBuySelectionSummaryView';
import { TryAndBuyReturnCollectionView } from './tryAndBuy/TryAndBuyReturnCollectionView';
import { TryAndBuyPaymentView } from './tryAndBuy/TryAndBuyPaymentView';
import { TryAndBuyStoreReconciliationView } from './tryAndBuy/TryAndBuyStoreReconciliationView';
import { TryAndBuyWaitingConfirmationView } from './tryAndBuy/TryAndBuyWaitingConfirmationView';
import { toast } from '../../store/useToastStore';
import { styles } from './details/orderDetails.styles';
import { OrderCameraModal, CameraTarget } from './details/OrderCameraModal';
import { OrderMapNavigationMode } from './details/OrderMapNavigationMode';
import { OrderDeliveryReviewView } from './details/OrderDeliveryReviewView';
import { OrderPickupReviewView } from './details/OrderPickupReviewView';

const HUB_COORDINATES = DEFAULT_HUB_COORDINATES;
const DEST_COORDINATES = DEFAULT_DEST_COORDINATES;

const MOCK_PACKAGE_IMAGES = [
  'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=400&q=80',
  'https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=400&q=80',
  'https://images.unsplash.com/photo-1577705998148-6da4f3963bc8?w=400&q=80',
];

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
    confirmDelivery,
    markArrived,
    completeOrder,
    confirmHandoverAndStartTrial,
    recordCustomerSelection,
    proceedToReturnCollection,
    toggleItemCollected,
    confirmReturnCollection,
    proceedToPayment,
    confirmPaymentAndBranch,
    markArrivedAtStore,
    submitForStoreConfirmation,
    reconcileStoreReturn,
  } = useOrderStore();
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? tokens.colors.dark : tokens.colors.light;

  const order = activeOrders.find((o) => o.id === orderId);
  const mapRef = useRef<LiveRouteMapRef>(null);
  const [showCamera, setShowCamera] = useState<CameraTarget | false>(false);
  const [pickupImages, setPickupImages] = useState<string[]>([]);
  const [deliveryImages, setDeliveryImages] = useState<string[]>([]);
  const [handoverImages, setHandoverImages] = useState<string[]>([]);
  const [returnImages, setReturnImages] = useState<string[]>([]);
  const [fullScreenMap, setFullScreenMap] = useState(false);

  if (!order) {
    return (
      <SafeAreaView style={[styles.main, { backgroundColor: theme.canvas }]}>
        <View style={[styles.header, { borderBottomColor: theme.line, backgroundColor: theme.surface }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <KudiIcon name="arrow-left" size={24} color={theme.ink900} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.ink900 }]}>Order Not Found</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyState}>
          <Text style={{ color: theme.ink500 }}>This order has been completed or does not exist.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // --------------------------------------------------------
  // ACTIVE DELIVERY WORKSPACE
  // --------------------------------------------------------
  const isAssigned = order.status === 'ASSIGNED';
  const isOutForDelivery = order.status === 'OUT_FOR_DELIVERY';
  const isArrived = order.status === 'ARRIVED';
  const isReturning = order.status === 'RETURNING';

  if (showCamera) {
    return (
      <OrderCameraModal
        target={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={() => {
          if (showCamera === 'pickup') {
            const nextImg = MOCK_PACKAGE_IMAGES[pickupImages.length % MOCK_PACKAGE_IMAGES.length];
            setPickupImages([...pickupImages, nextImg]);
          } else if (showCamera === 'delivery') {
            const nextImg = MOCK_PACKAGE_IMAGES[deliveryImages.length % MOCK_PACKAGE_IMAGES.length];
            setDeliveryImages([...deliveryImages, nextImg]);
          } else if (showCamera === 'handover') {
            const nextImg = MOCK_PACKAGE_IMAGES[handoverImages.length % MOCK_PACKAGE_IMAGES.length];
            setHandoverImages([...handoverImages, nextImg]);
          } else if (showCamera === 'return') {
            const nextImg = MOCK_PACKAGE_IMAGES[returnImages.length % MOCK_PACKAGE_IMAGES.length];
            setReturnImages([...returnImages, nextImg]);
          }
          setShowCamera(false);
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
          onReconcileReturn={() => {
            submitForStoreConfirmation(order.id);
          }}
        />
      </SafeAreaView>
    );
  }

  // --------------------------------------------------------
  // WAITING FOR STORE CONFIRMATION VIEW (PHASE K)
  // --------------------------------------------------------
  if (order.isTryAndBuy && isReturning && order.tryAndBuyStage === 'WAITING_STORE_CONFIRMATION') {
    return (
      <SafeAreaView style={[styles.main, { backgroundColor: '#F3F1EC' }]}>
        <TryAndBuyWaitingConfirmationView
          order={order}
          onCompleteReconciliation={() => {
            reconcileStoreReturn(order.id);
            navigation.goBack();
          }}
        />
      </SafeAreaView>
    );
  }

  // --------------------------------------------------------
  // MAP NAVIGATION MODE (OUT FOR DELIVERY / FULL SCREEN / RETURNING)
  // --------------------------------------------------------
  if (
    isOutForDelivery ||
    (isArrived && fullScreenMap) ||
    (isReturning &&
      order.tryAndBuyStage !== 'STORE_RECONCILIATION' &&
      order.tryAndBuyStage !== 'WAITING_STORE_CONFIRMATION')
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
        hubCoordinates={HUB_COORDINATES}
        destCoordinates={DEST_COORDINATES}
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
            onConfirmHandover={() => confirmHandoverAndStartTrial(order.id)}
            onOpenMap={() => setFullScreenMap(true)}
            handoverImages={handoverImages}
            onOpenCamera={() => setShowCamera('handover')}
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
            onSimulateSelection={(selections) => recordCustomerSelection(order.id, selections)}
            onContactCustomer={() => {}}
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
            onOpenCamera={() => setShowCamera('return')}
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
              const returnedCount = (order.items || []).filter((i) => i.decision === 'RETURN').length;
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
        onOpenCamera={() => setShowCamera('delivery')}
        onOpenMap={() => setFullScreenMap(true)}
        onConfirmDelivery={() => {
          confirmDelivery(order.id);
          toast.success('Order delivered successfully.');
        }}
        defaultProductThumbnails={DEFAULT_PRODUCT_THUMBNAILS}
      />
    );
  }

  // --------------------------------------------------------
  // PICKUP REVIEW (ASSIGNED STATE & DEFAULT)
  // --------------------------------------------------------
  return (
    <OrderPickupReviewView
      order={order}
      pickupImages={pickupImages}
      setPickupImages={setPickupImages}
      onOpenCamera={() => setShowCamera('pickup')}
      onConfirmPickup={() => {
        confirmPickup(order.id);
        toast.success('Pickup verified. Starting delivery.');
      }}
      onBack={() => navigation.goBack()}
      defaultProductThumbnails={DEFAULT_PRODUCT_THUMBNAILS}
    />
  );
};
