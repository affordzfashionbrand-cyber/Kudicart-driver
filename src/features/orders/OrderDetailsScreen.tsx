import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, useColorScheme, Image } from 'react-native';
import { useOrderStore, Order } from '../../store/useOrderStore';
import { tokens } from '../../theme/tokens';
import { KudiIcon } from '../../components/KudiIcon';
import { IconName } from '../../components/KudiIcon.types';

export const OrderDetailsScreen = ({ route, navigation }: any) => {
  const { orderId } = route.params || {};
  const { activeOrders, acceptOrder, confirmPickup, startDelivery, confirmDelivery } = useOrderStore();
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? tokens.colors.dark : tokens.colors.light;

  const order = activeOrders.find(o => o.id === orderId);
  const [showCamera, setShowCamera] = useState(false);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  
  const mockPackageImages = [
    'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=400&q=80',
    'https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=400&q=80',
    'https://images.unsplash.com/photo-1577705998148-6da4f3963bc8?w=400&q=80'
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

  let currentStepIdx = 0;
  if (isAssigned) currentStepIdx = 0;
  if (isPickedUp) currentStepIdx = 1;
  if (isOutForDelivery) currentStepIdx = 2;

  const displayStatus = (order.status as string).replace(/_/g, ' ');

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
              <KudiIcon name="package" size={18} color={theme.brandLime} />
              <Text style={styles.cameraInstructionText}>Take a clear picture of the package</Text>
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
                // Cycle through a few mock images for variety
                const nextImg = mockPackageImages[capturedImages.length % mockPackageImages.length];
                setCapturedImages([...capturedImages, nextImg]);
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

  return (
    <SafeAreaView style={[styles.main, { backgroundColor: theme.canvas }]}>
      {/* 1. COMPACT HEADER */}
      <View style={[styles.header, { borderBottomColor: theme.line, backgroundColor: theme.surface }]}>
        <View style={{ width: 40 }} />
        <View style={styles.headerCenter}>
          <Text style={[styles.headerOrderId, { color: theme.ink900 }]}>{order.id}</Text>
          <Text style={[styles.headerStatus, { color: theme.brandLime }]}>● {displayStatus}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>



      <ScrollView contentContainerStyle={styles.content}>
        
        {isAssigned ? (
          // ==========================================
          // PHASE 1: STORE PICKUP VERIFICATION
          // ==========================================
          <View style={styles.pickupStateContainer}>
            <Text style={[styles.hugeOrderId, { color: theme.ink900 }]}>ORDER {order.id}</Text>
            
            <View style={[styles.instructionBlock, { justifyContent: 'flex-start', paddingHorizontal: 0, marginBottom: 32, marginTop: -20 }]}>
              <KudiIcon name="info" size={16} color={theme.ink500} />
              <Text style={[styles.instructionText, { color: theme.ink500 }]}>Verify the package before leaving the store.</Text>
            </View>

            <View style={styles.pickupInfoBlock}>
              <Text style={[styles.stageSectionTitle, { color: theme.ink500 }]}>PICKUP FROM</Text>
              <Text style={[styles.pickupStoreText, { color: theme.ink900 }]}>{order.pickupLocation}</Text>
            </View>

            <View style={[styles.productCard, { backgroundColor: theme.surface, borderColor: theme.line }]}>
              <Text style={[styles.productCardTitle, { color: theme.ink900 }]}>PRODUCT DETAILS</Text>
              
              {order.items && order.items.length > 0 ? (
                order.items.map((item, index) => (
                  <View key={item.id || index} style={[styles.productRow, { marginBottom: 12 }]}>
                    <View style={{ flex: 1, paddingRight: 16 }}>
                      <Text style={[styles.productName, { color: theme.ink900 }]}>{item.name}</Text>
                      {item.variant && <Text style={[styles.productVariant, { color: theme.ink500 }]}>{item.variant}</Text>}
                    </View>
                    <Text style={[styles.productQty, { color: theme.ink900 }]}>×{item.quantity}</Text>
                  </View>
                ))
              ) : (
                <View style={styles.productRow}>
                  <Text style={[styles.productName, { color: theme.ink700 }]}>Assigned Package</Text>
                  <Text style={[styles.productQty, { color: theme.ink900 }]}>×{order.itemsCount}</Text>
                </View>
              )}

              <View style={[styles.productDivider, { backgroundColor: theme.line }]} />

              <View style={styles.productRow}>
                <Text style={[styles.productTotalLabel, { color: theme.ink900 }]}>Total Items</Text>
                <Text style={[styles.productTotalValue, { color: theme.ink900 }]}>{order.itemsCount}</Text>
              </View>

              <View style={[styles.productDivider, { backgroundColor: theme.line, marginTop: 16, marginBottom: 16 }]} />
              
              <View style={styles.photoUploadContainer}>
                {capturedImages.length > 0 ? (
                  <View style={styles.capturedImagesContainer}>
                    <View style={[styles.photoUploadRow, { backgroundColor: theme.canvas, borderColor: theme.line, marginBottom: 16 }]}>
                      <Text style={[styles.photoUploadBtnText, { color: theme.ink900 }]}>Add another picture</Text>
                      <TouchableOpacity style={[styles.cameraIconBtn, { backgroundColor: theme.surface, borderColor: theme.line, width: 40, height: 40 }]} onPress={() => setShowCamera(true)}>
                        <KudiIcon name="camera" size={18} color={theme.ink900} />
                      </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.capturedImagesScroll} contentContainerStyle={{ gap: 12, paddingRight: 16, paddingTop: 8, paddingBottom: 8 }}>
                      {capturedImages.map((uri, idx) => (
                        <View key={idx} style={styles.capturedImageWrapper}>
                          <Image source={{ uri }} style={styles.capturedImage} />
                          <TouchableOpacity 
                            style={[styles.removeImageBtn, { backgroundColor: theme.ink900, borderColor: theme.canvas }]} 
                            onPress={() => setCapturedImages(capturedImages.filter((_, i) => i !== idx))}
                          >
                            <KudiIcon name="close" size={14} color="#FFF" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </ScrollView>
                  </View>
                ) : (
                  <View style={[styles.photoUploadRow, { backgroundColor: theme.canvas, borderColor: theme.line }]}>
                    <Text style={[styles.photoUploadBtnText, { color: theme.ink900 }]}>Take Package Photo</Text>
                    <TouchableOpacity style={[styles.cameraIconBtn, { backgroundColor: theme.surface, borderColor: theme.line }]} onPress={() => setShowCamera(true)}>
                      <KudiIcon name="camera" size={20} color={theme.ink900} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>

            </View>
          </View>

        ) : (
          // ==========================================
          // PHASE 2 & 3: DELIVERY NAVIGATION
          // ==========================================
          <View style={styles.deliveryStateContainer}>
            {/* CURRENT OPERATIONAL STAGE */}
            <View style={styles.stageSection}>
              <Text style={[styles.stageSectionTitle, { color: theme.ink500 }]}>DELIVER TO</Text>
              
              <View style={[styles.locationCard, { backgroundColor: theme.surface, borderColor: theme.line }]}>
                <View style={[styles.locationIconWrap, { backgroundColor: theme.canvas }]}>
                  <KudiIcon name="user" size={24} color={theme.ink900} />
                </View>
                <View style={styles.locationDetails}>
                  <Text style={[styles.locationTitle, { color: theme.ink900 }]}>{order.customerName}</Text>
                  <Text style={[styles.locationSubtitle, { color: theme.ink700 }]}>{order.customerAddress}</Text>
                </View>
                <TouchableOpacity style={[styles.actionCircle, { backgroundColor: theme.canvas }]}>
                  <KudiIcon name="phone" size={20} color={theme.ink900} />
                </TouchableOpacity>
              </View>
            </View>

            {/* ORDER SUMMARY */}
            <View style={[styles.summaryGrid, { backgroundColor: theme.surface, borderColor: theme.line }]}>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: theme.ink900 }]}>{order.itemsCount}</Text>
                <Text style={[styles.summaryLabel, { color: theme.ink500 }]}>Items</Text>
              </View>
              <View style={[styles.summaryDivider, { backgroundColor: theme.line }]} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: theme.ink900 }]}>{order.distance}</Text>
                <Text style={[styles.summaryLabel, { color: theme.ink500 }]}>Distance</Text>
              </View>
              <View style={[styles.summaryDivider, { backgroundColor: theme.line }]} />
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: theme.ink900 }]}>{order.eta}</Text>
                <Text style={[styles.summaryLabel, { color: theme.ink500 }]}>ETA</Text>
              </View>
            </View>

            {/* SECONDARY CONTEXT (Pickup location reference) */}
            <View style={styles.secondaryContext}>
              <Text style={[styles.stageSectionTitle, { color: theme.ink500 }]}>PICKED UP FROM</Text>
              <View style={styles.secondaryRow}>
                <KudiIcon name="package" size={16} color={theme.ink500} />
                <Text style={[styles.secondaryText, { color: theme.ink700 }]} numberOfLines={1}>
                  {order.pickupLocation}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* DYNAMIC PRIMARY CTA */}
      <View style={[styles.footer, { backgroundColor: theme.surface, borderTopColor: theme.line }]}>
        {isAssigned && (
          <TouchableOpacity 
            style={[styles.primaryBtn, { backgroundColor: capturedImages.length > 0 ? theme.online : theme.ink300 }]} 
            onPress={() => confirmPickup(order.id)}
            disabled={capturedImages.length === 0}
          >
            <KudiIcon name="check" size={20} color="#FFF" />
            <Text style={[styles.primaryBtnText, { color: '#FFF' }]}>Confirm Pickup</Text>
          </TouchableOpacity>
        )}

        {isPickedUp && (
          <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.ink900 }]} onPress={() => startDelivery(order.id)}>
            <KudiIcon name="navigation" size={20} color="#FFF" />
            <Text style={[styles.primaryBtnText, { color: '#FFF' }]}>Navigate To Delivery</Text>
          </TouchableOpacity>
        )}

        {isOutForDelivery && (
          <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.online }]} onPress={() => {
            confirmDelivery(order.id);
            navigation.goBack();
          }}>
            <KudiIcon name="check" size={20} color="#FFF" />
            <Text style={[styles.primaryBtnText, { color: '#FFF' }]}>Confirm Delivery</Text>
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
  instructionText: { ...tokens.typography.caption, flexShrink: 1, textAlign: 'center' },

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
  corner: { position: 'absolute', width: 40, height: 40, borderColor: tokens.colors.brandLime },
  tl: { top: -2, left: -2, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: 16 },
  tr: { top: -2, right: -2, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: 16 },
  bl: { bottom: -2, left: -2, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: 16 },
  br: { bottom: -2, right: -2, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: 16 },
  cameraControls: { paddingBottom: 48, alignItems: 'center', justifyContent: 'center' },
  captureBtnOuter: { width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  captureBtnInner: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FFF' },
});

