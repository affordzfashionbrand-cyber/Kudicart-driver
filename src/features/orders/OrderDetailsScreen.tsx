import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, useColorScheme, Image, Platform } from 'react-native';
import { useOrderStore, Order } from '../../store/useOrderStore';
import { tokens } from '../../theme/tokens';
import { KudiIcon } from '../../components/KudiIcon';
import { IconName } from '../../components/KudiIcon.types';
import { LiveRouteMap, LiveRouteMapRef, DEFAULT_HUB_COORDINATES, DEFAULT_DEST_COORDINATES } from './LiveRouteMap';
import { TryAndBuyHandoverView } from './tryAndBuy/TryAndBuyHandoverView';
import { TryAndBuyTrialProgressView } from './tryAndBuy/TryAndBuyTrialProgressView';
import { TryAndBuySelectionSummaryView } from './tryAndBuy/TryAndBuySelectionSummaryView';
import { TryAndBuyReturnCollectionView } from './tryAndBuy/TryAndBuyReturnCollectionView';
import { TryAndBuyPaymentView } from './tryAndBuy/TryAndBuyPaymentView';
import { TryAndBuyStoreReconciliationView } from './tryAndBuy/TryAndBuyStoreReconciliationView';
import { TryAndBuyWaitingConfirmationView } from './tryAndBuy/TryAndBuyWaitingConfirmationView';
import { toast } from '../../store/useToastStore';

const HUB_COORDINATES = DEFAULT_HUB_COORDINATES;
const DEST_COORDINATES = DEFAULT_DEST_COORDINATES;

export const OrderDetailsScreen = ({ route, navigation }: any) => {
  const { orderId } = route.params || {};
  const {
    activeOrders,
    acceptOrder,
    confirmPickup,
    startDelivery,
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

  const order = activeOrders.find(o => o.id === orderId);
  const mapRef = useRef<LiveRouteMapRef>(null);
  const [showCamera, setShowCamera] = useState<'pickup' | 'delivery' | 'return' | 'handover' | false>(false);
  const [pickupImages, setPickupImages] = useState<string[]>([]);
  const [deliveryImages, setDeliveryImages] = useState<string[]>([]);
  const [handoverImages, setHandoverImages] = useState<string[]>([]);
  const [returnImages, setReturnImages] = useState<string[]>([]);
  const [fullScreenMap, setFullScreenMap] = useState(false);
  
  const mockPackageImages = [
    'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=400&q=80',
    'https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=400&q=80',
    'https://images.unsplash.com/photo-1577705998148-6da4f3963bc8?w=400&q=80'
  ];

  const defaultProductThumbnails = [
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=120&q=80',
    'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=120&q=80',
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=120&q=80',
  ];

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
  const isPickedUp = order.status === 'PICKED_UP';
  const isOutForDelivery = order.status === 'OUT_FOR_DELIVERY';
  const isArrived = order.status === 'ARRIVED';
  const isReturning = order.status === 'RETURNING';

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <SafeAreaView style={styles.cameraSafe}>
          {/* Header */}
          <View style={styles.cameraHeader}>
            <TouchableOpacity onPress={() => setShowCamera(false)} style={styles.cameraBackBtn}>
              <KudiIcon name="close" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
          
          {/* Instruction */}
          <View style={styles.cameraInstructionWrapper}>
            <View style={styles.cameraInstructionBadge}>
              <KudiIcon name="package" size={18} color="#FF5A1F" />
              <Text style={styles.cameraInstructionText}>
                {showCamera === 'return'
                  ? 'Take a clear picture of the return package'
                  : showCamera === 'handover'
                  ? 'Take a clear picture of package handover'
                  : 'Take a clear picture of the package'}
              </Text>
            </View>
          </View>

          {/* Viewfinder Mock */}
          <View style={styles.viewfinderCenter}>
             <View style={styles.viewfinderBox}>
                <View style={[styles.corner, styles.tl]} />
                <View style={[styles.corner, styles.tr]} />
                <View style={[styles.corner, styles.bl]} />
                <View style={[styles.corner, styles.br]} />
             </View>
          </View>

          {/* Capture Controls */}
          <View style={styles.cameraControls}>
            <TouchableOpacity 
              style={styles.captureBtnOuter}
              onPress={() => {
                if (showCamera === 'pickup') {
                  const nextImg = mockPackageImages[pickupImages.length % mockPackageImages.length];
                  setPickupImages([...pickupImages, nextImg]);
                } else if (showCamera === 'delivery') {
                  const nextImg = mockPackageImages[deliveryImages.length % mockPackageImages.length];
                  setDeliveryImages([...deliveryImages, nextImg]);
                } else if (showCamera === 'handover') {
                  const nextImg = mockPackageImages[handoverImages.length % mockPackageImages.length];
                  setHandoverImages([...handoverImages, nextImg]);
                } else if (showCamera === 'return') {
                  const nextImg = mockPackageImages[returnImages.length % mockPackageImages.length];
                  setReturnImages([...returnImages, nextImg]);
                }
                setShowCamera(false);
              }}
            >
              <View style={styles.captureBtnInner} />
            </TouchableOpacity>
            
            <Text style={{ color: 'rgba(255,255,255,0.7)', marginTop: 24, fontSize: 14 }}>
              Tap shutter to capture package
            </Text>
          </View>
        </SafeAreaView>
      </View>
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

  if (isOutForDelivery || (isArrived && fullScreenMap) || (isReturning && order.tryAndBuyStage !== 'STORE_RECONCILIATION' && order.tryAndBuyStage !== 'WAITING_STORE_CONFIRMATION')) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.canvas }}>
        {/* MAP BACKGROUND */}
        <View style={[StyleSheet.absoluteFillObject, !fullScreenMap && { bottom: 215 }]}>
          <LiveRouteMap
            ref={mapRef}
            origin={HUB_COORDINATES}
            destination={DEST_COORDINATES}
            originLabel={order.pickupLocation}
            destinationLabel={order.customerAddress}
            isFullScreen={fullScreenMap}
          />
        </View>

        {/* TOP FLOATING BACK BUTTON */}
        <SafeAreaView style={{ position: 'absolute', top: 0, left: 0, right: 0, pointerEvents: 'box-none' }}>
          <View style={{ padding: 16 }}>
            <TouchableOpacity 
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: '#FFFFFF',
                borderWidth: 1,
                borderColor: '#E2DED7',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }} 
              onPress={() => {
                if (fullScreenMap) setFullScreenMap(false);
                else navigation.goBack();
              }}
              accessibilityLabel="Back"
            >
              <KudiIcon name="arrow-left" size={22} color="#171716" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* FLOATING MAP CONTROLS */}
        <View style={{ position: 'absolute', right: 14, bottom: fullScreenMap ? 32 : 234, zIndex: 10, gap: 10 }}>
          {!fullScreenMap && (
            <TouchableOpacity 
              style={{
                width: 46,
                height: 46,
                borderRadius: 23,
                backgroundColor: '#FF5A1F',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.16,
                shadowRadius: 4,
                elevation: 4,
              }} 
              onPress={() => setFullScreenMap(true)}
              accessibilityLabel="Expand map"
            >
              <KudiIcon name="navigation" size={20} color="#171716" />
            </TouchableOpacity>
          )}

          <TouchableOpacity 
            style={{
              width: 46,
              height: 46,
              borderRadius: 23,
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: '#E2DED7',
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
            }} 
            onPress={() => mapRef.current?.recenter()}
            accessibilityLabel="Recenter map"
          >
            <KudiIcon name="crosshair" size={20} color="#171716" />
          </TouchableOpacity>
        </View>

        {/* BOTTOM SHEET OVERLAY */}
        {!fullScreenMap && (
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: '#FFFFFF',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              borderTopWidth: 1,
              borderLeftWidth: 1,
              borderRightWidth: 1,
              borderColor: '#E2DED7',
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: Platform.OS === 'ios' ? 36 : 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -3 },
              shadowOpacity: 0.08,
              shadowRadius: 10,
              elevation: 10,
            }}
          >
            {/* Sheet Handle */}
            <View style={{ alignItems: 'center', marginBottom: 12 }}>
              <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: '#E2DED7' }} />
            </View>
            
            {/* Title: Sentence Case */}
            <Text style={{ fontSize: 18, fontWeight: '700', textAlign: 'center', color: '#171716', marginBottom: 16 }}>
              {isReturning ? 'Returning to store' : 'On the way'}
            </Text>

            {/* Destination Address & Customer */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 }}>
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: '#FFF0E8',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                  marginTop: 2,
                }}
              >
                <KudiIcon name={isReturning ? 'home' : 'navigation'} size={18} color="#FF5A1F" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '600', color: '#171716', lineHeight: 22 }}>
                  {isReturning ? order.pickupLocation : order.customerAddress}
                </Text>
                <Text style={{ fontSize: 13, color: '#65635F', marginTop: 4 }}>
                  {isReturning
                    ? order.isTryAndBuy && order.returnManifestId
                      ? `Return Bay • Manifest ${order.returnManifestId}`
                      : 'Store location'
                    : order.customerName}
                </Text>
              </View>
            </View>

            {/* Primary Action Button: Signal Orange #FF5A1F + Charcoal Text #171716 */}
            <TouchableOpacity 
              style={{
                backgroundColor: '#FF5A1F',
                height: 50,
                borderRadius: 25,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => {
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
            >
              <Text style={{ color: '#171716', fontSize: 15, fontWeight: '700' }}>
                {isReturning ? 'Mark arrived at store' : 'Mark Arrived'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
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

  if (isArrived) {
    return (
      <SafeAreaView style={[styles.main, { backgroundColor: '#F3F1EC' }]}>
        {/* 1. TOP NAVIGATION BAR */}
        <View style={styles.topBar}>
          <View style={{ width: 36 }} />
          <Text style={styles.topBarTitle}>Complete delivery</Text>
          <Text style={styles.topBarOrderId}>{order.id}</Text>
        </View>

        {/* 2. SCROLLABLE OPERATIONAL CHECKLIST */}
        <View style={styles.scrollWrapper}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.reviewScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* INSTRUCTION */}
            <View style={styles.instructionBanner}>
              <KudiIcon name="package" size={16} color="#FF5A1F" />
              <Text style={styles.instructionText}>Hand over the package to the customer.</Text>
            </View>

            {/* DELIVER TO */}
            <View style={styles.reviewCard}>
              <Text style={styles.reviewSectionLabel}>Deliver to</Text>
              
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: 4 }}>
                <View style={{ flex: 1, paddingRight: 16 }}>
                  <Text style={styles.pickupStoreName}>{order.customerName}</Text>
                  <Text style={{ fontSize: 15, color: '#65635F', marginTop: 4, lineHeight: 22 }}>{order.customerAddress}</Text>
                </View>
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
                  <TouchableOpacity style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2DED7' }}>
                    <KudiIcon name="phone" size={18} color="#FF5A1F" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2DED7' }}
                    onPress={() => setFullScreenMap(true)}
                  >
                    <KudiIcon name="navigation" size={18} color="#FF5A1F" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* PRODUCT DETAILS */}
            <View style={styles.reviewCard}>
              <Text style={styles.reviewSectionLabel}>Product details</Text>

              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => {
                  const isLast = index === order.items!.length - 1;
                  return (
                    <View
                      key={item.id || index}
                      style={[styles.productItemRow, !isLast && styles.productItemBorder]}
                    >
                      <View style={styles.productItemInfo}>
                        <Text style={styles.productItemName}>{item.name}</Text>
                        {item.variant ? (
                          <Text style={styles.productItemVariant}>{item.variant}</Text>
                        ) : null}
                      </View>
                      <Image
                        source={{ uri: defaultProductThumbnails[index % defaultProductThumbnails.length] }}
                        style={styles.productThumb}
                        resizeMode="cover"
                      />
                      <Text style={styles.productItemQty}>×{item.quantity}</Text>
                    </View>
                  );
                })
              ) : (
                <View style={styles.productItemRow}>
                  <View style={styles.productItemInfo}>
                    <Text style={styles.productItemName}>Assigned Package</Text>
                  </View>
                  <Image
                    source={{ uri: defaultProductThumbnails[0] }}
                    style={styles.productThumb}
                    resizeMode="cover"
                  />
                  <Text style={styles.productItemQty}>×{order.itemsCount}</Text>
                </View>
              )}

              {/* TOTAL ITEMS */}
              <View style={styles.reviewDivider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total items</Text>
                <Text style={styles.totalValue}>{order.itemsCount}</Text>
              </View>
            </View>

            {/* DELIVERY PHOTO */}
            <View style={styles.reviewCard}>
              <View style={styles.photoHeaderRow}>
                <Text style={styles.reviewSectionLabel}>Delivery photo</Text>
                <View style={[styles.photoStatusTag, deliveryImages.length > 0 ? styles.photoStatusTagDone : styles.photoStatusTagReq]}>
                  <Text style={[styles.photoStatusTagText, deliveryImages.length > 0 ? styles.photoStatusTagTextDone : styles.photoStatusTagTextReq]}>
                    {deliveryImages.length > 0 ? 'Photo captured' : 'Required'}
                  </Text>
                </View>
              </View>

              {deliveryImages.length > 0 ? (
                <View style={styles.photoCapturedContainer}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.photoThumbsScroll}
                  >
                    {deliveryImages.map((uri, idx) => (
                      <View key={idx} style={styles.photoThumbWrapper}>
                        <Image source={{ uri }} style={styles.photoThumb} />
                        <TouchableOpacity
                          style={styles.removePhotoBtn}
                          onPress={() => setDeliveryImages(deliveryImages.filter((_, i) => i !== idx))}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <KudiIcon name="close" size={12} color="#FFF" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                  <TouchableOpacity
                    style={styles.addMorePhotoBtn}
                    onPress={() => setShowCamera('delivery')}
                    activeOpacity={0.8}
                  >
                    <KudiIcon name="camera" size={16} color="#171716" />
                    <Text style={styles.addMorePhotoText}>Add another photo</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.photoCaptureCard}
                  onPress={() => setShowCamera('delivery')}
                  activeOpacity={0.8}
                >
                  <View style={styles.photoCaptureIconWrap}>
                    <KudiIcon name="camera" size={20} color="#FF5A1F" />
                  </View>
                  <View style={styles.photoCaptureTextWrap}>
                    <Text style={styles.photoCaptureTitle}>Take delivery photo</Text>
                    <Text style={styles.photoCaptureSub}>Capture handover or drop-off location</Text>
                  </View>
                  <KudiIcon name="chevron-right" size={18} color="#65635F" />
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </View>

        {/* 3. FIXED BOTTOM ACTION */}
        <View style={styles.reviewFooter}>
          <TouchableOpacity
            style={[
              styles.confirmPickupBtn,
              deliveryImages.length > 0 ? styles.confirmPickupBtnActive : styles.confirmPickupBtnDisabled,
            ]}
            onPress={() => {
              confirmDelivery(order.id);
              toast.success('Order delivered successfully.');
            }}
            disabled={deliveryImages.length === 0}

            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.confirmPickupBtnText,
                deliveryImages.length > 0 ? styles.confirmPickupBtnTextActive : styles.confirmPickupBtnTextDisabled,
              ]}
            >
              Mark Delivered
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  let currentStepIdx = 0;
  if (isAssigned) currentStepIdx = 0;
  if (isPickedUp) currentStepIdx = 1;
  if (isOutForDelivery) currentStepIdx = 2;

  const displayStatus = (order.status as string).replace(/_/g, ' ');



  return (
    <SafeAreaView style={[styles.main, { backgroundColor: '#F3F1EC' }]}>
      {/* 1. TOP NAVIGATION BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={styles.backBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <KudiIcon name="arrow-left" size={20} color="#171716" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Review order</Text>
        <Text style={styles.topBarOrderId}>{order.id}</Text>
      </View>

      {/* 2. SCROLLABLE OPERATIONAL CHECKLIST */}
      <View style={styles.scrollWrapper}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.reviewScrollContent}
          showsVerticalScrollIndicator={false}
        >
        {isAssigned && (
          <>
            {/* INSTRUCTION */}
            {order.isTryAndBuy ? (
              <View style={[styles.instructionBanner, { backgroundColor: '#FFF0E8', borderColor: '#FFD9C7' }]}>
                <KudiIcon name="clock" size={16} color="#FF5A1F" />
                <Text style={styles.instructionText}>
                  Try & Buy Order: Verify garment sizes & colors. Customer receives a 20-min trial upon delivery.
                </Text>
              </View>
            ) : (
              <View style={styles.instructionBanner}>
                <KudiIcon name="alert-circle" size={16} color="#FF5A1F" />
                <Text style={styles.instructionText}>Check the items before leaving the store.</Text>
              </View>
            )}

            {/* PICKUP FROM */}
            <View style={styles.reviewCard}>
              <Text style={styles.reviewSectionLabel}>Pickup from</Text>
              <Text style={styles.pickupStoreName}>{order.pickupLocation}</Text>
            </View>

            {/* PRODUCT DETAILS */}
            <View style={styles.reviewCard}>
              <Text style={styles.reviewSectionLabel}>Product details</Text>

              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => {
                  const isLast = index === order.items!.length - 1;
                  return (
                    <View
                      key={item.id || index}
                      style={[styles.productItemRow, !isLast && styles.productItemBorder]}
                    >
                      <View style={styles.productItemInfo}>
                        <Text style={styles.productItemName}>{item.name}</Text>
                        {item.variant ? (
                          <Text style={styles.productItemVariant}>{item.variant}</Text>
                        ) : null}
                      </View>
                      <Image
                        source={{ uri: defaultProductThumbnails[index % defaultProductThumbnails.length] }}
                        style={styles.productThumb}
                        resizeMode="cover"
                      />
                      <Text style={styles.productItemQty}>×{item.quantity}</Text>
                    </View>
                  );
                })
              ) : (
                <View style={styles.productItemRow}>
                  <View style={styles.productItemInfo}>
                    <Text style={styles.productItemName}>Assigned Package</Text>
                  </View>
                  <Image
                    source={{ uri: defaultProductThumbnails[0] }}
                    style={styles.productThumb}
                    resizeMode="cover"
                  />
                  <Text style={styles.productItemQty}>×{order.itemsCount}</Text>
                </View>
              )}

              {/* TOTAL ITEMS */}
              <View style={styles.reviewDivider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total items</Text>
                <Text style={styles.totalValue}>{order.itemsCount}</Text>
              </View>
            </View>

            {/* PACKAGE PHOTO */}
            <View style={styles.reviewCard}>
              <View style={styles.photoHeaderRow}>
                <Text style={styles.reviewSectionLabel}>Package photo</Text>
                <View style={[styles.photoStatusTag, pickupImages.length > 0 ? styles.photoStatusTagDone : styles.photoStatusTagReq]}>
                  <Text style={[styles.photoStatusTagText, pickupImages.length > 0 ? styles.photoStatusTagTextDone : styles.photoStatusTagTextReq]}>
                    {pickupImages.length > 0 ? 'Photo captured' : 'Required'}
                  </Text>
                </View>
              </View>

              {pickupImages.length > 0 ? (
                <View style={styles.photoCapturedContainer}>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.photoThumbsScroll}
                  >
                    {pickupImages.map((uri, idx) => (
                      <View key={idx} style={styles.photoThumbWrapper}>
                        <Image source={{ uri }} style={styles.photoThumb} />
                        <TouchableOpacity
                          style={styles.removePhotoBtn}
                          onPress={() => setPickupImages(pickupImages.filter((_, i) => i !== idx))}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <KudiIcon name="close" size={12} color="#FFF" />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </ScrollView>
                  <TouchableOpacity
                    style={styles.addMorePhotoBtn}
                    onPress={() => setShowCamera('pickup')}
                    activeOpacity={0.8}
                  >
                    <KudiIcon name="camera" size={16} color="#171716" />
                    <Text style={styles.addMorePhotoText}>Add another photo</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.photoCaptureCard}
                  onPress={() => setShowCamera('pickup')}
                  activeOpacity={0.8}
                >
                  <View style={styles.photoCaptureIconWrap}>
                    <KudiIcon name="camera" size={20} color="#FF5A1F" />
                  </View>
                  <View style={styles.photoCaptureTextWrap}>
                    <Text style={styles.photoCaptureTitle}>Take package photo</Text>
                    <Text style={styles.photoCaptureSub}>Capture packed items before leaving</Text>
                  </View>
                  <KudiIcon name="chevron-right" size={18} color="#65635F" />
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>

    {/* 3. FIXED BOTTOM ACTION */}
      <View style={styles.reviewFooter}>
        {isAssigned && (
          <TouchableOpacity
            style={[
              styles.confirmPickupBtn,
              pickupImages.length > 0 ? styles.confirmPickupBtnActive : styles.confirmPickupBtnDisabled,
            ]}
            onPress={() => {
              confirmPickup(order.id);
              toast.success('Pickup verified. Starting delivery.');
            }}
            disabled={pickupImages.length === 0}

            activeOpacity={0.85}
          >
            <Text
              style={[
                styles.confirmPickupBtnText,
                pickupImages.length > 0 ? styles.confirmPickupBtnTextActive : styles.confirmPickupBtnTextDisabled,
              ]}
            >
              Confirm pickup
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  main: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.gutter,
    height: 60,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 8, marginLeft: -8 },
  headerCenter: { alignItems: 'center' },
  headerTitle: { ...tokens.typography.body, fontWeight: '700' },
  headerOrderId: { ...tokens.typography.body, fontWeight: '800' },
  headerStatus: { ...tokens.typography.minimum, fontWeight: '800', marginTop: 2, textTransform: 'uppercase' },
  
  progressWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.gutter,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  progressStep: { alignItems: 'center', flex: 1 },
  progressDot: { borderRadius: 5, marginBottom: 6 },
  progressText: { ...tokens.typography.minimum },

  content: { padding: tokens.spacing.gutter, paddingBottom: 40 },
  
  // PICKUP STATE
  pickupStateContainer: { flex: 1, paddingTop: 16 },
  hugeOrderId: { fontSize: 32, fontWeight: '900', marginBottom: 32, letterSpacing: -0.5 },
  pickupInfoBlock: { marginBottom: 32 },
  pickupStoreText: { fontSize: 24, fontWeight: '800', lineHeight: 32 },
  
  productCard: { padding: tokens.spacing.cardPadding, borderRadius: tokens.radii.card, borderWidth: 1, marginBottom: 32 },
  productCardTitle: { ...tokens.typography.body, fontWeight: '800', marginBottom: 16 },
  productRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productName: { ...tokens.typography.body, fontWeight: '600' },
  productVariant: { ...tokens.typography.caption, marginTop: 2 },
  productQty: { ...tokens.typography.body, fontWeight: '800' },
  productDivider: { height: 1, marginVertical: 16 },
  productTotalLabel: { ...tokens.typography.body, fontWeight: '800' },
  productTotalValue: { ...tokens.typography.body, fontWeight: '900' },
  
  instructionBlock: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 20 },
  legacyInstructionText: { ...tokens.typography.caption, flexShrink: 1, textAlign: 'center' },

  photoUploadContainer: { marginTop: 8 },
  photoUploadRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, paddingLeft: 16, borderRadius: 12, borderWidth: 1, borderStyle: 'dashed' },
  photoUploadBtnText: { ...tokens.typography.body, fontWeight: '700' },
  cameraIconBtn: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  capturedImagesContainer: { marginTop: 4 },
  capturedImagesScroll: { overflow: 'visible' },
  capturedImageWrapper: { position: 'relative', width: 80, height: 80, borderRadius: 12 },
  capturedImage: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#E5E5E5' },
  removeImageBtn: { position: 'absolute', top: -8, right: -8, width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },

  // DELIVERY STATE
  deliveryStateContainer: { flex: 1 },
  stageSection: { marginBottom: 24 },
  stageSectionTitle: { ...tokens.typography.minimum, fontWeight: '800', letterSpacing: 0.5, marginBottom: 12 },
  
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: tokens.spacing.cardPadding,
    borderRadius: tokens.radii.card,
    borderWidth: 1,
  },
  locationIconWrap: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  locationDetails: { flex: 1 },
  locationTitle: { ...tokens.typography.body, fontWeight: '800', marginBottom: 4 },
  locationSubtitle: { ...tokens.typography.caption, lineHeight: 20 },
  actionCircle: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginLeft: 12 },

  summaryGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: tokens.radii.card,
    borderWidth: 1,
    paddingVertical: 20,
    marginBottom: 24,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryDivider: { width: 1, height: 40 },
  summaryValue: { ...tokens.typography.section, marginBottom: 4 },
  summaryLabel: { ...tokens.typography.caption, fontWeight: '600' },

  secondaryContext: { marginTop: 8 },
  secondaryRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  secondaryText: { ...tokens.typography.body, fontWeight: '600', flex: 1 },

  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  footer: {
    padding: tokens.spacing.gutter,
    paddingBottom: 32,
    borderTopWidth: 1,
  },
  primaryBtn: {
    flexDirection: 'row',
    height: 60,
    borderRadius: tokens.radii.pill,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  primaryBtnText: { ...tokens.typography.body, fontWeight: '700', fontSize: 18 },

  assignmentTopBar: { height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: tokens.spacing.gutter, borderBottomWidth: 1 },
  assignmentTopBarLeft: { flex: 1, marginRight: 12 },
  assignmentTitle: { ...tokens.typography.caption, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  sheetOrderId: { ...tokens.typography.caption, fontWeight: '600' },
  assignmentScrollContent: { padding: tokens.spacing.gutter, paddingBottom: 24, gap: 12 },
  assignmentAlertBanner: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 12, borderRadius: tokens.radii.card },
  assignmentAlertText: { ...tokens.typography.caption, fontWeight: '700', flex: 1 },
  assignmentCard: { borderRadius: tokens.radii.card, borderWidth: 1, padding: tokens.spacing.cardPadding },
  assignmentCardLabel: { ...tokens.typography.minimum, fontWeight: '700', letterSpacing: 0.5, marginBottom: 16, textTransform: 'uppercase' },
  sheetTimeline: { flexDirection: 'row', marginBottom: 24 },
  sheetTimelineCol: { width: 16, alignItems: 'center', marginRight: 16, marginTop: 6 },
  sheetTimelineDot: { width: 8, height: 8, borderRadius: 4 },
  sheetTimelineLine: { width: 2, flex: 1, marginVertical: 4 },
  sheetTimelineContent: { flex: 1 },
  sheetLocationRow: { marginBottom: 16 },
  sheetLocationLabel: { ...tokens.typography.caption, fontWeight: '700', marginBottom: 2 },
  sheetLocationValue: { ...tokens.typography.body, lineHeight: 24 },
  assignmentMetaGrid: { flexDirection: 'row', alignItems: 'center' },
  assignmentMetaTile: { flex: 1, alignItems: 'center', gap: 6 },
  assignmentMetaDivider: { width: 1, height: 48 },
  assignmentMetaValue: { ...tokens.typography.body, fontWeight: '800' },
  assignmentMetaLabel: { ...tokens.typography.minimum, fontWeight: '500' },
  assignmentCustomerAvatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  assignmentCustomerName: { ...tokens.typography.body, fontWeight: '700', marginBottom: 2 },
  assignmentFooter: { padding: tokens.spacing.gutter, paddingBottom: 32, borderTopWidth: 1, flexDirection: 'row', gap: 12 },

  // CAMERA MOCK
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  cameraSafe: { flex: 1 },
  cameraHeader: { padding: 16, flexDirection: 'row', justifyContent: 'flex-start' },
  cameraBackBtn: { padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 24, width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  cameraInstructionWrapper: { alignItems: 'center', marginTop: 40, zIndex: 10 },
  cameraInstructionBadge: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)', 
    paddingHorizontal: 20, paddingVertical: 12, borderRadius: 30, gap: 10,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)'
  },
  cameraInstructionText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  viewfinderCenter: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  viewfinderBox: { width: 280, height: 380, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)', borderRadius: 16, position: 'relative', backgroundColor: 'rgba(255,255,255,0.05)' },
  corner: { position: 'absolute', width: 40, height: 40, borderColor: '#FF5A1F' },
  tl: { top: -2, left: -2, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 16 },
  tr: { top: -2, right: -2, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 16 },
  bl: { bottom: -2, left: -2, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 16 },
  br: { bottom: -2, right: -2, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 16 },
  cameraControls: { paddingBottom: 48, alignItems: 'center', justifyContent: 'center' },
  captureBtnOuter: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  captureBtnInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFF' },

  // REVIEW ORDER DESIGN SYSTEM STYLES
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2DED7',
    backgroundColor: '#FFFFFF',
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#171716',
    letterSpacing: -0.2,
  },
  topBarOrderId: {
    fontSize: 12,
    fontWeight: '500',
    color: '#65635F',
  },
  scrollWrapper: {
    flex: 1,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  reviewScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
    gap: 14,
  },
  instructionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#FFF0E8',
    borderWidth: 1,
    borderColor: '#FFE2D5',
  },
  instructionText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#171716',
    lineHeight: 18,
    flex: 1,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2DED7',
    padding: 18,
  },
  reviewSectionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#65635F',
    marginBottom: 8,
  },
  pickupStoreName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#171716',
    lineHeight: 22,
  },
  productItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingVertical: 14,
    gap: 12,
  },
  productItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECE4',
  },
  productItemInfo: {
    flex: 1,
    paddingRight: 4,
  },
  productItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#171716',
    lineHeight: 20,
  },
  productItemVariant: {
    fontSize: 12,
    fontWeight: '400',
    color: '#65635F',
    marginTop: 3,
    lineHeight: 16,
  },
  productThumb: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#F3F1EC',
    borderWidth: 1,
    borderColor: '#E2DED7',
  },
  productItemQty: {
    fontSize: 14,
    fontWeight: '700',
    color: '#171716',
    lineHeight: 20,
    minWidth: 24,
    textAlign: 'right',
  },
  reviewDivider: {
    height: 1,
    backgroundColor: '#E2DED7',
    marginTop: 8,
    marginBottom: 14,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#65635F',
    lineHeight: 20,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#171716',
    lineHeight: 20,
  },
  photoHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  photoStatusTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },
  photoStatusTagReq: {
    backgroundColor: '#FFF0E8',
    borderColor: '#FFE2D5',
  },
  photoStatusTagDone: {
    backgroundColor: '#EAF5EF',
    borderColor: '#D0E9DA',
  },
  photoStatusTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
  photoStatusTagTextReq: {
    color: '#FF5A1F',
  },
  photoStatusTagTextDone: {
    color: '#16805A',
  },
  photoCaptureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2DED7',
    backgroundColor: '#FBF9F6',
    gap: 12,
  },
  photoCaptureIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF0E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoCaptureTextWrap: {
    flex: 1,
  },
  photoCaptureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#171716',
  },
  photoCaptureSub: {
    fontSize: 12,
    fontWeight: '400',
    color: '#65635F',
    marginTop: 2,
  },
  photoCapturedContainer: {
    gap: 12,
  },
  photoThumbsScroll: {
    gap: 12,
    paddingVertical: 2,
  },
  photoThumbWrapper: {
    position: 'relative',
    width: 72,
    height: 72,
    borderRadius: 12,
  },
  photoThumb: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#E5E5E5',
  },
  removePhotoBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#171716',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  addMorePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2DED7',
    backgroundColor: '#F3F1EC',
  },
  addMorePhotoText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#171716',
  },
  reviewFooter: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2DED7',
    backgroundColor: '#FFFFFF',
  },
  confirmPickupBtn: {
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmPickupBtnActive: {
    backgroundColor: '#FF5A1F',
  },
  confirmPickupBtnDisabled: {
    backgroundColor: '#E2DED7',
  },
  confirmPickupBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  confirmPickupBtnTextActive: {
    color: '#171716',
  },
  confirmPickupBtnTextDisabled: {
    color: '#55534E',
  },
});

