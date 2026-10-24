import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, LayoutAnimation, Animated } from 'react-native';
import { useDriverStore } from '../../store/useDriverStore';
import { useOrderStore } from '../../store/useOrderStore';
import { KudiIcon } from '../../components/KudiIcon';
import { DeliveryScooterIcon } from '../../components/DeliveryScooterIcon';
import { LiveRouteMap, DEFAULT_HUB_COORDINATES, DEFAULT_DEST_COORDINATES } from './LiveRouteMap';
import { SurgeBanner, SurgeDetailsSheet } from '../../components/SurgeBanner';
import { useNotificationStore } from '../../store/useNotificationStore';
import { toast } from '../../store/useToastStore';

const RadarPulse = ({ children }: { children: React.ReactNode }) => {
  const anim1 = useRef(new Animated.Value(0)).current;
  const anim2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createLoop = (anim: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 2500,
            useNativeDriver: true,
          })
        ])
      ).start();
    };
    
    createLoop(anim1, 0);
    createLoop(anim2, 1250);
  }, [anim1, anim2]);

  const getAnimatedStyle = (anim: Animated.Value) => {
    return {
      transform: [
        {
          scale: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 2.8]
          })
        }
      ],
      opacity: anim.interpolate({
        inputRange: [0, 0.2, 1],
        outputRange: [0, 0.8, 0]
      })
    };
  };

  return (
    <View style={styles.radarContainer}>
      <Animated.View style={[styles.radarRing, getAnimatedStyle(anim1)]} />
      <Animated.View style={[styles.radarRing, getAnimatedStyle(anim2)]} />
      {children}
    </View>
  );
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const DashboardScreen = ({ navigation }: any) => {
  const { profile, isOnline, setIsOnline, schedule, assignedStore, workSummary, weeklyBonusProgress } = useDriverStore();
  const { activeOrders, receiveMockOrder, clearOrders } = useOrderStore();
  const unreadNotifications = useNotificationStore((s) => s.notifications.filter((n) => !n.read).length);
  const [bonusTab, setBonusTab] = React.useState<'daily' | 'weekly'>('daily');
  const [oppTab, setOppTab] = React.useState<'01' | '02'>('01');
  const [showSurgeDetails, setShowSurgeDetails] = React.useState(false);
  const [bonusWidth, setBonusWidth] = React.useState(0);
  const [oppSectionWidth, setOppSectionWidth] = React.useState(0);
  
  const oppBannerWidth = 310;
  // Calculate padding based on the exact rendered width of the Opportunities section
  const oppSidePadding = oppSectionWidth > 0 ? (oppSectionWidth - oppBannerWidth) / 2 : 0;

  const activeOrder = activeOrders.length > 0 ? activeOrders[0] : null;
  const hasActiveDelivery = isOnline && !!activeOrder && (
    activeOrder.status === 'OUT_FOR_DELIVERY' ||
    activeOrder.status === 'ARRIVED' ||
    activeOrder.status === 'RETURNING' ||
    activeOrder.status === 'PICKED_UP'
  );

  const handleToggleOnline = (value: boolean) => {
    try {
      (LayoutAnimation as any)?.configureNext?.((LayoutAnimation as any)?.Presets?.easeInEaseOut);
    } catch (_) {}
    setIsOnline(value);
    if (!value) {
      clearOrders();
      toast.info('You are now offline.');
    } else {
      toast.success('You are online. Ready for assignments.');
    }
  };


  // Mock Order Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isOnline && !activeOrder) {
      timer = setTimeout(() => {
        receiveMockOrder();
      }, 10000);
    }
    return () => clearTimeout(timer);
  }, [isOnline, activeOrder, receiveMockOrder]);

  const getInitials = () => {
    if (profile.avatarInitial) return profile.avatarInitial;
    return profile.fullName ? profile.fullName.substring(0, 2).toUpperCase() : 'BA';
  };

  const isFullTimeProfile = profile.workPreference === 'FULL_TIME';
  const roleLabel = isFullTimeProfile ? 'Full-time' : 'Part-time';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.mainContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </TouchableOpacity>
            <View style={styles.profileTextContainer}>
              <Text style={styles.headerName} numberOfLines={1}>{profile.name?.split(' ')[0] || 'Babajide'}</Text>
              <Text style={styles.headerRole} numberOfLines={1}>{roleLabel} · ID: {profile.id || 'DLV-8492'}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={() => handleToggleOnline(!isOnline)}
              style={[styles.customToggleTrack, { backgroundColor: isOnline ? '#16805A' : '#D3CEC7', borderColor: isOnline ? '#16805A' : '#D3CEC7' }]}
            >
              <View style={[styles.customToggleThumb, { transform: [{ translateX: isOnline ? 20 : 0 }] }]} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.bellBtn}
              onPress={() => navigation?.navigate('Notifications')}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`Notifications, ${unreadNotifications} unread`}
            >
              <KudiIcon name="notifications" size={19} color="#171716" />
              {unreadNotifications > 0 && <View style={styles.bellBadgeDot} />}
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* MODULE 1: EARNINGS CARD */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Today's earnings</Text>
              <View style={styles.shiftChip}>
                <Text style={styles.shiftChipText} numberOfLines={1}>Shift 9–6</Text>
              </View>
            </View>
            <View style={styles.amountContainer}>
              <Text style={styles.amountText}>{formatCurrency(workSummary?.totalEarnings || 840.50)}</Text>
            </View>
            <View style={styles.progressSection}>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '65%' }]} />
              </View>
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>On shift · 2h 18m left</Text>
                <Text style={styles.progressValue}>65% of goal</Text>
              </View>
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statBoxLabel}>Online time</Text>
                <Text style={styles.statBoxValue}>{workSummary?.loginHours || '6h 42m'}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statBoxLabel}>Orders</Text>
                <Text style={styles.statBoxValue}>{workSummary?.ordersDone || 14}</Text>
              </View>
            </View>
          </View>

          {/* SURGE INCENTIVES BANNER */}
          <SurgeBanner onPressDetails={() => setShowSurgeDetails(true)} />

          {/* MODULE 2: OPERATIONAL STATUS CARD / ACTIVE DELIVERY CARD */}
          {!isOnline ? (
            <View style={[styles.card, styles.centerCard]}>
              <View style={styles.statusInner}>
                <View style={styles.statusIconBgOffline}>
                  <DeliveryScooterIcon size={24} color="#333333" />
                </View>
                <Text style={styles.statusHeadline}>You're offline</Text>
                <Text style={styles.statusSub}>Go online to start receiving orders.</Text>
                
                <View style={styles.storeDetailsSection}>
                  <TouchableOpacity
                    style={[styles.storeDetailsBtn, { alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 20 }]}
                    onPress={() => navigation?.navigate('StoreDetails')}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel="Store Details"
                  >
                    <KudiIcon name="navigation" size={16} color="#65635F" />
                    <Text style={styles.storeDetailsBtnText} numberOfLines={1}>Store Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : hasActiveDelivery && activeOrder ? (
            <View
              style={[styles.card, styles.activeDeliveryCard]}
            >
              {/* Header row: Status chip + Order ID */}
              <View style={styles.activeDeliveryHeader}>
                <View style={styles.activeDeliveryStatusPill}>
                  <View style={styles.activeDeliveryPulseDot} />
                  <Text style={styles.activeDeliveryStatusText}>
                    {activeOrder.status === 'RETURNING'
                      ? activeOrder.tryAndBuyStage === 'WAITING_STORE_CONFIRMATION'
                        ? 'Waiting for confirmation'
                        : activeOrder.tryAndBuyStage === 'STORE_RECONCILIATION'
                        ? 'At store'
                        : 'Returning to store'
                      : activeOrder.status === 'ARRIVED' && activeOrder.isTryAndBuy && activeOrder.tryAndBuyStage === 'TRIAL_IN_PROGRESS'
                      ? 'Trial in progress'
                      : activeOrder.status === 'ARRIVED'
                      ? 'At customer'
                      : 'On the way'}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  {activeOrder.isTryAndBuy && (
                    <View
                      style={{
                        backgroundColor: '#FFF0E8',
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        borderRadius: 6,
                        borderWidth: 1,
                        borderColor: '#FFD9C7',
                      }}
                    >
                      <Text style={{ fontSize: 10, fontWeight: '700', color: '#FF5A1F' }}>TRY & BUY</Text>
                    </View>
                  )}
                  <Text style={styles.activeDeliveryOrderId}>{activeOrder.id}</Text>
                </View>
              </View>

              {/* Map Preview Container */}
              <View style={styles.activeDeliveryMapWrap} pointerEvents="none">
                <LiveRouteMap
                  origin={DEFAULT_HUB_COORDINATES}
                  destination={DEFAULT_DEST_COORDINATES}
                  originLabel={activeOrder.pickupLocation}
                  destinationLabel={activeOrder.customerAddress}
                  isPreview={true}
                />
              </View>

              {/* Compact Action at the bottom */}
              <TouchableOpacity 
                style={styles.continueActionBtn}
                activeOpacity={0.92}
                onPress={() => navigation.navigate('OrderDetails', { orderId: activeOrder.id })}
                accessibilityRole="button"
                accessibilityLabel={activeOrder.status === 'RETURNING' ? 'Navigate to store' : 'Continue delivery'}
              >
                <Text style={styles.continueActionText}>
                  {activeOrder.status === 'RETURNING'
                    ? activeOrder.tryAndBuyStage === 'WAITING_STORE_CONFIRMATION'
                      ? 'View confirmation status'
                      : activeOrder.tryAndBuyStage === 'STORE_RECONCILIATION'
                      ? 'Reconcile return'
                      : 'Navigate to store'
                    : activeOrder.status === 'ARRIVED' && activeOrder.isTryAndBuy && activeOrder.tryAndBuyStage === 'TRIAL_IN_PROGRESS'
                    ? 'View trial in progress'
                    : 'Continue delivery'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.card, styles.centerCard]}>
              <View style={styles.statusInner}>
                <RadarPulse>
                  <View style={styles.statusIconBg}>
                    <DeliveryScooterIcon size={24} color="#333333" />
                  </View>
                </RadarPulse>
                <Text style={[styles.statusHeadline, { marginBottom: 8 }]}>Looking for orders</Text>
                <Text style={styles.statusSub}>Stay near your hub. We'll let you know when an order comes in.</Text>
              </View>
            </View>
          )}

          {/* MODULE 3: SWIPEABLE BONUS CARD */}
          <View style={styles.card}>
            <View style={styles.bonusHeader}>
              <Text style={styles.bonusHeadline}>
                {bonusTab === 'daily' ? 'Daily bonus' : 'Weekly bonus'}
              </Text>
              <Text style={styles.bonusAmount}>{bonusTab === 'daily' ? '₹10 earned' : '₹250 earned'}</Text>
            </View>

            <View 
              style={{ flex: 1, minHeight: 120 }} 
              onLayout={(e) => setBonusWidth(e.nativeEvent.layout.width)}
            >
              {bonusWidth > 0 && (
                <ScrollView 
                  horizontal 
                  pagingEnabled 
                  showsHorizontalScrollIndicator={false}
                  onScroll={(e) => {
                    const page = Math.round(e.nativeEvent.contentOffset.x / bonusWidth);
                    const newTab = page === 0 ? 'daily' : 'weekly';
                    if (bonusTab !== newTab) setBonusTab(newTab);
                  }}
                  scrollEventThrottle={16}
                >
                  {/* DAILY PAGE */}
                  <View style={{ width: bonusWidth }}>
                    
                    <View style={[styles.bonusTargetRow, { marginBottom: 22 }]}>
                      <View style={styles.bonusTargetTop}>
                        <Text style={styles.bonusTargetTitle}>Orders 8 / 10</Text>
                        <Text style={styles.bonusTargetReward}>Earn ₹20</Text>
                      </View>
                      <View style={styles.bonusTargetBarBg}>
                        <View style={[styles.bonusTargetBarFill, { width: '80%' }]} />
                      </View>
                      <Text style={styles.bonusTargetMeta}>2 more orders</Text>
                    </View>

                    <View style={styles.bonusTargetRow}>
                      <View style={styles.bonusTargetTop}>
                        <Text style={styles.bonusTargetTitle}>Online time 6h 42m / 8h</Text>
                        <Text style={styles.bonusTargetReward}>Earn ₹25</Text>
                      </View>
                      <View style={styles.bonusTargetBarBg}>
                        <View style={[styles.bonusTargetBarFill, { width: '84%' }]} />
                      </View>
                      <Text style={styles.bonusTargetMeta}>1h 18m left</Text>
                    </View>
                  </View>

                  {/* WEEKLY PAGE */}
                  <View style={{ width: bonusWidth }}>
                    
                    <View style={[styles.bonusTargetRow, { marginBottom: 22 }]}>
                      <View style={styles.bonusTargetTop}>
                        <Text style={styles.bonusTargetTitle}>Orders 42 / 50</Text>
                        <Text style={styles.bonusTargetReward}>Earn ₹100</Text>
                      </View>
                      <View style={styles.bonusTargetBarBg}>
                        <View style={[styles.bonusTargetBarFill, { width: '84%' }]} />
                      </View>
                      <Text style={styles.bonusTargetMeta}>8 more orders</Text>
                    </View>

                    <View style={styles.bonusTargetRow}>
                      <View style={styles.bonusTargetTop}>
                        <Text style={styles.bonusTargetTitle}>Online time 32h / 40h</Text>
                        <Text style={styles.bonusTargetReward}>Earn ₹150</Text>
                      </View>
                      <View style={styles.bonusTargetBarBg}>
                        <View style={[styles.bonusTargetBarFill, { width: '80%' }]} />
                      </View>
                      <Text style={styles.bonusTargetMeta}>8h left</Text>
                    </View>
                  </View>
                </ScrollView>
              )}
            </View>

            <View style={styles.bonusFooter}>
              <View style={styles.inProgressPill}>
                <Text style={styles.inProgressText}>In progress</Text>
              </View>

              <View style={styles.pagerIndicatorContainer}>
                <View style={[styles.pagerDot, bonusTab === 'daily' && styles.pagerDotActive]} />
                <View style={[styles.pagerDot, bonusTab === 'weekly' && styles.pagerDotActive]} />
              </View>

              <TouchableOpacity style={styles.viewDetailsBtn}>
                <Text style={styles.viewDetailsText}>View details →</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* MODULE 4: OPPORTUNITIES SECTION */}
          <View 
            style={styles.opportunitiesSection}
            onLayout={(e) => setOppSectionWidth(e.nativeEvent.layout.width)}
          >
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>For you</Text>
            </View>

            {oppSectionWidth > 0 && (
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  gap: 16,
                }}
                snapToInterval={oppBannerWidth + 16}
                decelerationRate="fast"
                snapToAlignment="center"
                onScroll={(e) => {
                  const page = Math.round(e.nativeEvent.contentOffset.x / (oppBannerWidth + 16));
                  const newTab = page === 0 ? '01' : '02';
                  if (oppTab !== newTab) setOppTab(newTab);
                }}
                scrollEventThrottle={16}
              >
                <View style={{ width: Math.max(0, oppSidePadding - 16) }} />

                {/* BANNER 1: Primary Opportunity */}
                <View style={[styles.opportunityBanner, styles.bannerPrimary]}>
                  <Text style={styles.bannerSuperTitle}>EXTRA EARNING</Text>
                  
                  <View style={styles.bannerMid}>
                    <Text style={styles.bannerAmount}>₹200 <Text style={styles.bannerType}>BONUS</Text></Text>
                  </View>

                  <View style={styles.bannerBottom}>
                    <Text style={styles.bannerDesc}>Complete 5 orders by 2 PM</Text>
                    <TouchableOpacity style={styles.bannerAction}>
                      <Text style={styles.bannerActionText}>View offer →</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* BANNER 2: Secondary Opportunity */}
                <View style={[styles.opportunityBanner, styles.bannerSecondary]}>
                  <Text style={[styles.bannerSuperTitle, { color: '#8A8781' }]}>PEAK HOURS</Text>
                  
                  <View style={styles.bannerMid}>
                    <Text style={styles.bannerAmount}>₹250 <Text style={styles.bannerType}>BONUS</Text></Text>
                  </View>

                  <View style={styles.bannerBottom}>
                    <Text style={[styles.bannerDesc, { color: '#65635F' }]}>11 AM – 3 PM · More orders expected</Text>
                    <TouchableOpacity style={styles.bannerAction}>
                      <Text style={[styles.bannerActionText, { color: '#171716' }]}>View details →</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={{ width: Math.max(0, oppSidePadding - 16) }} />
              </ScrollView>
            )}
            
            <View style={styles.oppPagerIndicatorContainer}>
              <View style={[styles.pagerDot, oppTab === '01' && styles.pagerDotActive]} />
              <View style={[styles.pagerDot, oppTab === '02' && styles.pagerDotActive]} />
            </View>
          </View>

        </ScrollView>

        {/* FULLSCREEN ORDER ASSIGNMENT OVERLAY */}
        {isOnline && activeOrder && (!activeOrder.accepted && activeOrder.status === 'ASSIGNED') && (
          <View style={styles.assignmentOverlay}>
            {/* Top bar */}
            <View style={styles.assignmentTopBar}>
              <View style={styles.assignmentTopBarLeft}>
                <Text style={styles.assignmentTitle}>Order assigned</Text>
              </View>
              <Text style={styles.sheetOrderId}>{activeOrder.id}</Text>
            </View>

            {/* Scrollable content */}
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={styles.assignmentScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Assignment notification */}
              <View style={styles.assignmentAlertBanner}>
                <KudiIcon name="alert-circle" size={16} color="#FF5A1F" />
                <Text style={styles.assignmentAlertText}>
                  New order assigned. Check the route and order details before confirming.
                </Text>
              </View>

              {/* Route timeline */}
              <View style={styles.assignmentCard}>
                <Text style={styles.assignmentCardLabel}>Route</Text>
                <View style={styles.sheetTimeline}>
                  <View style={styles.sheetTimelineCol}>
                    <View style={[styles.sheetTimelineDot, { backgroundColor: '#171716' }]} />
                    <View style={styles.sheetTimelineLine} />
                    <View style={[styles.sheetTimelineDot, { backgroundColor: '#FF5A1F' }]} />
                  </View>
                  <View style={styles.sheetTimelineContent}>
                    <View style={styles.sheetLocationRow}>
                      <Text style={styles.sheetLocationLabel}>Pickup</Text>
                      <Text style={styles.sheetLocationValue}>{activeOrder.pickupLocation}</Text>
                    </View>
                    <View style={styles.sheetLocationRowDrop}>
                      <Text style={[styles.sheetLocationLabel, { color: '#FF5A1F' }]}>Drop-off</Text>
                      <Text style={styles.sheetLocationValue}>{activeOrder.customerAddress}</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* Order details */}
              <View style={styles.assignmentCard}>
                <Text style={styles.assignmentCardLabel}>Order details</Text>
                <View style={styles.assignmentMetaGrid}>
                  <View style={styles.assignmentMetaTile}>
                    <KudiIcon name="package" size={18} color="#65635F" />
                    <Text style={styles.assignmentMetaValue}>{activeOrder.itemsCount}</Text>
                    <Text style={styles.assignmentMetaLabel}>Items</Text>
                  </View>
                  <View style={styles.assignmentMetaDivider} />
                  <View style={styles.assignmentMetaTile}>
                    <KudiIcon name="navigation" size={18} color="#65635F" />
                    <Text style={styles.assignmentMetaValue}>{activeOrder.distance}</Text>
                    <Text style={styles.assignmentMetaLabel}>Distance</Text>
                  </View>
                  <View style={styles.assignmentMetaDivider} />
                  <View style={styles.assignmentMetaTile}>
                    <KudiIcon name="clock" size={18} color="#65635F" />
                    <Text style={styles.assignmentMetaValue}>{activeOrder.eta}</Text>
                    <Text style={styles.assignmentMetaLabel}>ETA</Text>
                  </View>
                </View>
              </View>

              {/* Customer */}
              <View style={styles.assignmentCard}>
                <Text style={styles.assignmentCardLabel}>Customer</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={styles.assignmentCustomerAvatar}>
                    <KudiIcon name="user" size={18} color="#171716" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.assignmentCustomerName}>{activeOrder.customerName}</Text>
                    <Text style={styles.assignmentMetaLabelSecondary}>{activeOrder.date}</Text>
                  </View>
                </View>
              </View>
            </ScrollView>

            {/* Bottom action */}
            <View style={styles.assignmentFooter}>
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => navigation.navigate('OrderDetails', { orderId: activeOrder.id })}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryBtnText}>Review order</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Surge & Incentives Detail Bottom Sheet */}
        <SurgeDetailsSheet
          visible={showSurgeDetails}
          onClose={() => setShowSurgeDetails(false)}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F3F1EC' },
  mainContainer: {
    flex: 1,
    backgroundColor: '#F3F1EC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 64,
    borderBottomWidth: 1,
    borderBottomColor: '#E2DED7',
    backgroundColor: '#F3F1EC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 12,
  },
  profileTextContainer: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#171716',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#F3F1EC',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#171716',
    letterSpacing: -0.2,
  },
  headerRole: {
    fontSize: 11,
    fontWeight: '500',
    color: '#65635F',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  customToggleTrack: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 2,
    justifyContent: 'center',
    borderWidth: 1,
  },
  customToggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  onlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  onlinePillActive: {
    backgroundColor: '#EAF5EF',
    borderColor: '#EAF5EF',
  },
  onlinePillInactive: {
    backgroundColor: '#FFF0E8',
    borderColor: '#F4D5C4',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  onlineDotActive: {
    backgroundColor: '#16805A',
  },
  onlineDotInactive: {
    backgroundColor: '#65635F',
  },
  onlinePillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  onlineTextActive: {
    color: '#16805A',
  },
  onlineTextInactive: {
    color: '#FF5A1F',
  },
  bellBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2DED7',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bellBadgeDot: {
    position: 'absolute',
    top: 7,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF5A1F',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 24,
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2DED7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#171716',
    letterSpacing: -0.2,
  },
  shiftChip: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: '#F3F1EC',
    borderWidth: 1,
    borderColor: '#E2DED7',
  },
  shiftChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#65635F',
    flexShrink: 0,
  },
  amountContainer: {
    marginBottom: 12,
  },
  amountText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#171716',
    letterSpacing: -0.5,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: '#E2DED7',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF5A1F',
    borderRadius: 2,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#65635F',
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF5A1F',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2DED7',
    paddingTop: 14,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F3F1EC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2DED7',
  },
  statBoxLabel: {
    fontSize: 11,
    color: '#65635F',
    fontWeight: '500',
    marginBottom: 2,
  },
  statBoxValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#171716',
  },
  centerCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    minHeight: 290,
  },
  statusInner: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  statusIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF0E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  radarRing: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 90, 31, 0.12)', // brand orange #FF5A1F with low opacity
    borderWidth: 1,
    borderColor: 'rgba(255, 90, 31, 0.2)',
  },
  statusIconBgOffline: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F1EC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#F3F1EC',
    borderWidth: 1,
    borderColor: '#E2DED7',
    marginBottom: 8,
  },
  statusPillOffline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#F3F1EC',
    borderWidth: 1,
    borderColor: '#E2DED7',
    marginBottom: 8,
  },
  statusPillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16805A',
  },
  statusPillDotOffline: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8A8781',
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#171716',
    letterSpacing: 0.2,
  },
  statusPillTextOffline: {
    fontSize: 12,
    fontWeight: '600',
    color: '#65635F',
    letterSpacing: 0.2,
  },
  statusHeadline: {
    fontSize: 20,
    fontWeight: '700',
    color: '#171716',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  statusSub: {
    fontSize: 12,
    fontWeight: '500',
    color: '#65635F',
    textAlign: 'center',
    lineHeight: 16,
    maxWidth: 280,
  },
  storeDetailsSection: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2DED7',
    width: '100%',
    alignItems: 'center',
  },
  storeDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2DED7',
    backgroundColor: '#FAF9F6',
  },
  storeDetailsBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#171716',
    flexShrink: 0,
  },
  bonusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  bonusHeadline: {
    fontSize: 14,
    fontWeight: '600',
    color: '#65635F',
  },
  bonusAmount: {
    fontSize: 17,
    fontWeight: '700',
    color: '#171716',
  },
  bonusTargetRow: {
    // Margin overridden per row via inline styles
  },
  bonusTargetTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bonusTargetTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#171716',
  },
  bonusTargetReward: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF5A1F',
  },
  bonusTargetMeta: {
    fontSize: 12,
    color: '#65635F',
    marginTop: 6,
  },
  bonusTargetBarBg: {
    height: 4,
    backgroundColor: '#E2DED7',
    borderRadius: 2,
    overflow: 'hidden',
  },
  bonusTargetBarFill: {
    height: '100%',
    backgroundColor: '#FF5A1F',
    borderRadius: 2,
  },
  bonusFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2DED7',
  },
  inProgressPill: {
    backgroundColor: '#F3F1EC',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  inProgressText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333333',
  },
  pagerIndicatorContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    zIndex: -1,
  },
  pagerDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#D5D1CA',
  },
  pagerDotActive: {
    backgroundColor: '#65635F',
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewDetailsText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#171716',
  },
  oppPagerIndicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
  },
  opportunitiesSection: {
    marginTop: 8,
    marginHorizontal: -16, // Edge-to-edge scrolling area
  },
  sectionHeaderRow: {
    paddingHorizontal: 16, // Re-align with cards
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#171716',
  },
  opportunityBanner: {
    width: 310,
    minWidth: 310,
    flexShrink: 0,
    minHeight: 184,
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: 18,
    justifyContent: 'space-between',
  },
  bannerPrimary: {
    backgroundColor: '#FFF0E8',
    borderWidth: 1,
    borderColor: '#FAD5C5',
  },
  bannerSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2DED7',
  },
  bannerSuperTitle: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.2,
    color: '#FF5A1F',
    marginBottom: 14,
  },
  bannerMid: {
    marginBottom: 16,
  },
  bannerAmount: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
    color: '#171716',
  },
  bannerType: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
    color: '#171716',
  },
  bannerBottom: {
    marginTop: 'auto',
  },
  bannerDesc: {
    fontSize: 14,
    fontWeight: '500',
    color: '#4A4845',
    lineHeight: 20,
    marginBottom: 14,
  },
  bannerAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bannerActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF5A1F',
  },

  // Fullscreen assignment overlay
  assignmentOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 999,
    backgroundColor: '#F3F1EC',
  },
  assignmentTopBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2DED7',
    backgroundColor: '#FFFFFF',
  },
  assignmentTopBarLeft: { flex: 1, marginRight: 12 },
  assignmentTitle: { fontSize: 17, fontWeight: '600', letterSpacing: -0.2, color: '#171716' },
  sheetOrderId: { fontSize: 12, fontWeight: '500', color: '#65635F' },
  assignmentScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    gap: 16,
  },
  assignmentAlertBanner: {
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
  assignmentAlertText: { fontSize: 13, fontWeight: '500', flex: 1, color: '#171716', lineHeight: 18 },
  assignmentCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2DED7',
    padding: 18,
    backgroundColor: '#FFFFFF',
  },
  assignmentCardLabel: { fontSize: 12, fontWeight: '500', marginBottom: 12, color: '#65635F' },
  sheetTimeline: { flexDirection: 'row' },
  sheetTimelineCol: { width: 14, alignItems: 'center', marginRight: 12, paddingTop: 4, paddingBottom: 4 },
  sheetTimelineDot: { width: 8, height: 8, borderRadius: 4 },
  sheetTimelineLine: { width: 2, flex: 1, marginVertical: 4, backgroundColor: '#E2DED7' },
  sheetTimelineContent: { flex: 1 },
  sheetLocationRow: { marginBottom: 16 },
  sheetLocationRowDrop: { marginBottom: 2 },
  sheetLocationLabel: { fontSize: 12, fontWeight: '600', marginBottom: 3, color: '#171716' },
  sheetLocationValue: { fontSize: 13, lineHeight: 19, color: '#171716', fontWeight: '500' },
  assignmentMetaGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  assignmentMetaTile: { flex: 1, alignItems: 'center', gap: 6 },
  assignmentMetaDivider: { width: 1, height: 40, backgroundColor: '#E2DED7' },
  assignmentMetaValue: { fontSize: 16, fontWeight: '600', color: '#171716' },
  assignmentMetaLabel: { fontSize: 12, fontWeight: '500', color: '#65635F' },
  assignmentCustomerAvatar: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F3F1EC' },
  assignmentCustomerName: { fontSize: 14, fontWeight: '600', marginBottom: 2, color: '#171716' },
  assignmentMetaLabelSecondary: { fontSize: 12, fontWeight: '400', color: '#65635F' },
  assignmentFooter: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2DED7',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
  },
  primaryBtn: { height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FF5A1F', flex: 1 },
  primaryBtnText: { fontSize: 15, fontWeight: '600', color: '#171716' },
  activeDeliveryCard: {
    minHeight: 290,
    paddingHorizontal: 20,
    paddingVertical: 20,
    justifyContent: 'space-between',
  },
  activeDeliveryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activeDeliveryStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFF0E8',
    borderColor: '#F4D5C4',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  activeDeliveryPulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#FF5A1F',
  },
  activeDeliveryStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF5A1F',
    letterSpacing: -0.1,
  },
  activeDeliveryOrderId: {
    fontSize: 13,
    fontWeight: '700',
    color: '#171716',
    letterSpacing: -0.2,
  },
  activeDeliveryMapWrap: {
    height: 162,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2DED7',
    backgroundColor: '#F3F1EC',
    position: 'relative',
  },
  continueActionBtn: {
    backgroundColor: '#FF5A1F',
    height: 44,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#FF5A1F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.16,
    shadowRadius: 3,
    elevation: 2,
  },
  continueActionText: {
    color: '#171716',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
});

