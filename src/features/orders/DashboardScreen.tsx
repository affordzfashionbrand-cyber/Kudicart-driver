import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Switch, useColorScheme, Dimensions } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { useDriverStore } from '../../store/useDriverStore';
import { useOrderStore } from '../../store/useOrderStore';
import { KudiIcon } from '../../components/KudiIcon';
import { tokens } from '../../theme/tokens';

const { width } = Dimensions.get('window');

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
  
  const [bonusSlideIndex, setBonusSlideIndex] = useState(0);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? tokens.colors.dark : tokens.colors.light;
  
  const activeOrder = activeOrders.length > 0 ? activeOrders[0] : null;

  const handleToggleOnline = (value: boolean) => {
    setIsOnline(value);
    if (!value) {
      clearOrders();
    }
  };

  // Radar Animation for Online State
  const radarAnim1 = useRef(new Animated.Value(0)).current;
  const radarAnim2 = useRef(new Animated.Value(0)).current;
  const radarAnim3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOnline && !activeOrder) {
      const createLoop = (anim: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, {
              toValue: 1,
              duration: 2400,
              useNativeDriver: true,
            })
          ])
        );
      };
      createLoop(radarAnim1, 0).start();
      createLoop(radarAnim2, 800).start();
      createLoop(radarAnim3, 1600).start();
    } else {
      radarAnim1.setValue(0);
      radarAnim2.setValue(0);
      radarAnim3.setValue(0);
    }
  }, [isOnline, activeOrder]);

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
    return profile.fullName.substring(0, 2).toUpperCase();
  };

  const isFullTimeProfile = profile.workPreference === 'FULL_TIME';
  const roleLabel = isFullTimeProfile ? 'Full-time' : 'Part-time';
  
  // Bonus computation
  const weeklyBonusAmount = isFullTimeProfile ? 1100 : 500;
  const targetOrders = isFullTimeProfile ? 119 : 75;
  const targetDays = 6;
  const currentOrders = weeklyBonusProgress?.eligibleOrders || (isFullTimeProfile ? 64 : 43);
  const currentDays = weeklyBonusProgress?.workingDays || 5;
  const ordersPercent = Math.min((currentOrders / targetOrders) * 100, 100);
  const daysPercent = Math.min((currentDays / targetDays) * 100, 100);

  const dailyBonusAmount = isFullTimeProfile ? 150 : 80;
  const targetDailyOrders = isFullTimeProfile ? 20 : 12;
  const currentDailyOrders = 8;
  const dailyOrdersPercent = Math.min((currentDailyOrders / targetDailyOrders) * 100, 100);

  const targetDailyHours = isFullTimeProfile ? 8 : 5;
  const dailyHours = isFullTimeProfile ? 6.7 : 3.5;
  const dailyHoursRemaining = isFullTimeProfile ? '1h 18m left' : '1h 30m left';
  const dailyHoursPercent = Math.min((dailyHours / targetDailyHours) * 100, 100);

  const [cardWidth, setCardWidth] = useState(width - (tokens.spacing.gutter * 2));
  const bonusScrollRef = useRef<ScrollView>(null);

  const handleBonusScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const slide = Math.round(offsetX / (cardWidth || 1));
    if (slide !== bonusSlideIndex && (slide === 0 || slide === 1)) {
      setBonusSlideIndex(slide);
    }
  };

  const renderRadarRing = (anim: Animated.Value, index: number) => {
    return (
      <Animated.View
        key={`ring-${index}`}
        style={[
          styles.radarRing,
          { borderColor: theme.online },
          {
            transform: [
              {
                scale: anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 3]
                })
              }
            ],
            opacity: anim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.15, 0.1, 0]
            })
          }
        ]}
      />
    );
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: theme.canvas }]}>
      
      {/* A. HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={[styles.avatar, { backgroundColor: theme.ink900 }]}>
            <Text style={[styles.avatarText, { color: theme.brandLime }]}>{getInitials()}</Text>
          </TouchableOpacity>
          <View>
            <Text style={[styles.headerName, { color: theme.ink900 }]}>{profile.name?.split(' ')[0]}</Text>
            <Text style={[styles.headerRole, { color: theme.ink500 }]}>{roleLabel} • {profile.id}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Switch
            value={isOnline}
            onValueChange={handleToggleOnline}
            trackColor={{ false: theme.offlineSoft, true: theme.online }}
            thumbColor="#FFFFFF"
            style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
          />
          <TouchableOpacity style={[styles.bellBtn, { backgroundColor: theme.surface }]}>
            <KudiIcon name="notifications" size={20} color={theme.ink900} />
            <View style={styles.bellBadge} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* C. EARNINGS HERO */}
        <View style={[styles.heroCard, { backgroundColor: theme.ink900 }]}>
          <View style={styles.heroHeader}>
            <Text style={[styles.heroSub, { color: 'rgba(255,255,255,0.7)' }]}>Today's earnings</Text>
            <View style={styles.shiftChip}>
              <Text style={styles.shiftChipText}>Shift 9:00 AM – 6:00 PM</Text>
            </View>
          </View>
          
          <Text style={styles.heroAmount}>
            <Text style={{ color: 'rgba(255,255,255,0.6)' }}>₹</Text>
            {formatCurrency(workSummary?.totalEarnings || 0).replace('₹', '').trim()}
          </Text>

          <View style={styles.shiftProgressContainer}>
            <View style={styles.shiftProgressBarBg}>
              <View style={[styles.shiftProgressBarFill, { width: '40%', backgroundColor: theme.online }]} />
            </View>
            <Text style={[styles.shiftProgressText, { color: 'rgba(255,255,255,0.7)' }]}>On shift · 2h 18m left</Text>
          </View>

          <View style={styles.heroTiles}>
            <View style={styles.heroTile}>
              <Text style={styles.heroTileLabel}>Online time</Text>
              <Text style={styles.heroTileValue}>{workSummary?.loginHours || '0h'}</Text>
            </View>
            <View style={styles.heroTile}>
              <Text style={styles.heroTileLabel}>Orders done</Text>
              <Text style={styles.heroTileValue}>{workSummary?.ordersDone || 0}</Text>
            </View>
          </View>

          {schedule?.status === 'IN_PROGRESS' && !isOnline && (
            <View style={[styles.heroNudge, { backgroundColor: theme.warningSoft }]}>
              <Text style={[styles.heroNudgeText, { color: theme.warning }]}>You're on shift but offline. Go online to receive orders.</Text>
            </View>
          )}
        </View>

        {/* D. STATE STAGE */}
        <View style={[styles.stageCard, { backgroundColor: theme.surface, borderColor: theme.line }]}>
          {!isOnline ? (
            <View style={styles.stageOffline}>
              <View style={[styles.stageIconBg, { backgroundColor: theme.offlineSoft }]}>
                <View style={[styles.stageDot, { backgroundColor: theme.offline }]} />
              </View>
              <Text style={[styles.stageTitle, { color: theme.ink900 }]}>You're offline</Text>
              <Text style={[styles.stageSub, { color: theme.ink500 }]}>Go online to start receiving delivery assignments.</Text>
              <TouchableOpacity style={[styles.secondaryBtn, { borderColor: theme.line }]} onPress={() => navigation.navigate('StoreDetails')}>
                <KudiIcon name="navigation" size={18} color={theme.ink900} />
                <Text style={[styles.secondaryBtnText, { color: theme.ink900 }]}>Store details</Text>
              </TouchableOpacity>
            </View>
          ) : !activeOrder ? (
            <View style={styles.stageOnline}>
              <View style={styles.radarContainer}>
                {renderRadarRing(radarAnim1, 1)}
                {renderRadarRing(radarAnim2, 2)}
                {renderRadarRing(radarAnim3, 3)}
                <View style={[styles.radarCenter, { backgroundColor: theme.online }]}>
                  <KudiIcon name="package" size={24} color="#FFF" />
                </View>
              </View>
              <Text style={[styles.stageTitle, { color: theme.ink900 }]}>Looking for orders</Text>
              <Text style={[styles.stageSub, { color: theme.ink500 }]}>Stay close to your store. We'll alert you with sound and vibration.</Text>
            </View>
          ) : (
            <View /> // Handled by bottom sheet
          )}
        </View>

        {/* E. BONUS CARD (SWIPEABLE CAROUSEL) */}
        <View 
          style={[styles.bonusCard, { backgroundColor: theme.surface, borderColor: theme.line, padding: 0, overflow: 'hidden' }]}
          onLayout={(e) => {
            const w = e.nativeEvent.layout.width;
            if (w > 0 && Math.abs(w - cardWidth) > 1) {
              setCardWidth(w);
            }
          }}
        >
          <ScrollView 
            ref={bonusScrollRef}
            horizontal 
            pagingEnabled 
            showsHorizontalScrollIndicator={false} 
            bounces={false}
            onScroll={handleBonusScroll}
            scrollEventThrottle={16}
          >
            {/* DAILY BONUS SLIDE */}
            <View style={{ width: cardWidth, padding: tokens.spacing.cardPadding }}>
              <View style={styles.bonusHeader}>
                <View style={styles.bonusTitleRow}>
                  <View style={[styles.bonusIconBg, { backgroundColor: theme.brandLimeSoft }]}>
                    <KudiIcon name="clock" size={16} color={theme.ink900} />
                  </View>
                  <Text style={[styles.bonusTitle, { color: theme.ink900 }]}>Daily bonus</Text>
                </View>
                <Text style={[styles.bonusAmount, { color: theme.ink900 }]}>₹{dailyBonusAmount.toLocaleString()}</Text>
              </View>
              <Text style={[styles.bonusSub, { color: theme.ink500 }]}>
                Complete both targets • Today's shift
              </Text>

              {/* Progress 1: Orders */}
              <View style={styles.bonusProgressRow}>
                <View style={styles.bonusProgressHeader}>
                  <Text style={[styles.bonusProgressLabel, { color: theme.ink900 }]}>
                    Orders {currentDailyOrders} / {targetDailyOrders}
                  </Text>
                  <Text style={[styles.bonusProgressHelper, { color: theme.ink500 }]}>
                    {Math.max(0, targetDailyOrders - currentDailyOrders)} more to go
                  </Text>
                </View>
                <View style={[styles.bonusProgressBarBg, { backgroundColor: theme.line }]}>
                  <View style={[styles.bonusProgressBarFill, { width: `${dailyOrdersPercent}%`, backgroundColor: theme.online }]} />
                  <View style={styles.bonusFlagWrapper}>
                    <KudiIcon name="star" size={8} color={theme.ink900} />
                  </View>
                </View>
              </View>

              {/* Progress 2: Login Hours */}
              <View style={styles.bonusProgressRow}>
                <View style={styles.bonusProgressHeader}>
                  <Text style={[styles.bonusProgressLabel, { color: theme.ink900 }]}>
                    Login hours {dailyHours} / {targetDailyHours}h
                  </Text>
                  <Text style={[styles.bonusProgressHelper, { color: theme.ink500 }]}>
                    {dailyHoursRemaining}
                  </Text>
                </View>
                <View style={[styles.bonusProgressBarBg, { backgroundColor: theme.line }]}>
                  <View style={[styles.bonusProgressBarFill, { width: `${dailyHoursPercent}%`, backgroundColor: theme.online }]} />
                  <View style={styles.bonusFlagWrapper}>
                    <KudiIcon name="star" size={8} color={theme.ink900} />
                  </View>
                </View>
              </View>

              {/* Footer */}
              <View style={styles.bonusFooter}>
                <View style={[styles.bonusStatusPill, { backgroundColor: theme.warningSoft }]}>
                  <Text style={[styles.bonusStatusText, { color: theme.warning }]}>In progress</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('History')}>
                  <Text style={[styles.bonusFooterLink, { color: theme.ink500 }]}>View details ›</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* WEEKLY BONUS SLIDE */}
            <View style={{ width: cardWidth, padding: tokens.spacing.cardPadding }}>
              <View style={styles.bonusHeader}>
                <View style={styles.bonusTitleRow}>
                  <View style={[styles.bonusIconBg, { backgroundColor: theme.brandLimeSoft }]}>
                    <KudiIcon name="star" size={16} color={theme.ink900} />
                  </View>
                  <Text style={[styles.bonusTitle, { color: theme.ink900 }]}>Weekly bonus</Text>
                </View>
                <Text style={[styles.bonusAmount, { color: theme.ink900 }]}>₹{weeklyBonusAmount.toLocaleString()}</Text>
              </View>
              <Text style={[styles.bonusSub, { color: theme.ink500 }]}>
                Complete both targets • Mon – Sun
              </Text>

              {/* Progress 1: Orders */}
              <View style={styles.bonusProgressRow}>
                <View style={styles.bonusProgressHeader}>
                  <Text style={[styles.bonusProgressLabel, { color: theme.ink900 }]}>
                    Orders {currentOrders} / {targetOrders}
                  </Text>
                  <Text style={[styles.bonusProgressHelper, { color: theme.ink500 }]}>
                    {Math.max(0, targetOrders - currentOrders)} more to go
                  </Text>
                </View>
                <View style={[styles.bonusProgressBarBg, { backgroundColor: theme.line }]}>
                  <View style={[styles.bonusProgressBarFill, { width: `${ordersPercent}%`, backgroundColor: theme.online }]} />
                  <View style={styles.bonusFlagWrapper}>
                    <KudiIcon name="star" size={8} color={theme.ink900} />
                  </View>
                </View>
              </View>

              {/* Progress 2: Working Days */}
              <View style={styles.bonusProgressRow}>
                <View style={styles.bonusProgressHeader}>
                  <Text style={[styles.bonusProgressLabel, { color: theme.ink900 }]}>
                    Working days {currentDays} / {targetDays}
                  </Text>
                  <Text style={[styles.bonusProgressHelper, { color: theme.ink500 }]}>
                    {Math.max(0, targetDays - currentDays)} more day{Math.max(0, targetDays - currentDays) > 1 ? 's' : ''}
                  </Text>
                </View>
                <View style={[styles.bonusProgressBarBg, { backgroundColor: theme.line }]}>
                  <View style={[styles.bonusProgressBarFill, { width: `${daysPercent}%`, backgroundColor: theme.online }]} />
                  <View style={styles.bonusFlagWrapper}>
                    <KudiIcon name="star" size={8} color={theme.ink900} />
                  </View>
                </View>
              </View>

              {/* Footer */}
              <View style={styles.bonusFooter}>
                <View style={[styles.bonusStatusPill, { backgroundColor: theme.warningSoft }]}>
                  <Text style={[styles.bonusStatusText, { color: theme.warning }]}>In progress</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('History')}>
                  <Text style={[styles.bonusFooterLink, { color: theme.ink500 }]}>View details ›</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Pagination Indicators */}
          <View style={styles.paginationContainer}>
            <TouchableOpacity 
              onPress={() => {
                bonusScrollRef.current?.scrollTo({ x: 0, animated: true });
                setBonusSlideIndex(0);
              }}
              style={[
                styles.paginationDot, 
                bonusSlideIndex === 0 
                  ? { backgroundColor: theme.ink900, width: 16 } 
                  : { backgroundColor: theme.line, width: 6 }
              ]} 
            />
            <TouchableOpacity 
              onPress={() => {
                bonusScrollRef.current?.scrollTo({ x: cardWidth, animated: true });
                setBonusSlideIndex(1);
              }}
              style={[
                styles.paginationDot, 
                bonusSlideIndex === 1 
                  ? { backgroundColor: theme.ink900, width: 16 } 
                  : { backgroundColor: theme.line, width: 6 }
              ]} 
            />
          </View>
        </View>

        {/* F. BANNER SECTION */}
        <View style={styles.bannerSection}>
          <Text style={[styles.bannerSectionTitle, { color: theme.ink900 }]}>For you</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.bannerScroll}
          >
            {/* Banner 1 — Earn More */}
            <View style={[styles.bannerCard, { backgroundColor: theme.ink900 }]}>
              <View style={styles.bannerTopRow}>
                <View style={[styles.bannerBadge, { backgroundColor: theme.brandLime }]}>
                  <Text style={[styles.bannerBadgeText, { color: theme.ink900 }]}>LIMITED</Text>
                </View>
                <KudiIcon name="wallet" size={20} color={theme.brandLime} />
              </View>
              <Text style={[styles.bannerHeadline, { color: '#FFFFFF' }]}>Earn ₹200 extra</Text>
              <Text style={[styles.bannerSub, { color: 'rgba(255,255,255,0.6)' }]}>Complete 5 orders before 2 PM today</Text>
              <View style={[styles.bannerCta, { backgroundColor: theme.brandLime }]}>
                <Text style={[styles.bannerCtaText, { color: theme.ink900 }]}>View offer →</Text>
              </View>
            </View>

            {/* Banner 2 — Peak Hour */}
            <View style={[styles.bannerCard, { backgroundColor: '#2E6BFF' }]}>
              <View style={styles.bannerTopRow}>
                <View style={[styles.bannerBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Text style={[styles.bannerBadgeText, { color: '#FFFFFF' }]}>PEAK HOURS</Text>
                </View>
                <KudiIcon name="star" size={20} color="#FFFFFF" />
              </View>
              <Text style={[styles.bannerHeadline, { color: '#FFFFFF' }]}>2× bonus live now</Text>
              <Text style={[styles.bannerSub, { color: 'rgba(255,255,255,0.7)' }]}>12 PM – 3 PM peak hour surge active</Text>
              <View style={[styles.bannerCta, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                <Text style={[styles.bannerCtaText, { color: '#FFFFFF' }]}>See surge map →</Text>
              </View>
            </View>

            {/* Banner 3 — Referral */}
            <View style={[styles.bannerCard, { backgroundColor: '#12B76A' }]}>
              <View style={styles.bannerTopRow}>
                <View style={[styles.bannerBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Text style={[styles.bannerBadgeText, { color: '#FFFFFF' }]}>REFERRAL</Text>
                </View>
                <KudiIcon name="user" size={20} color="#FFFFFF" />
              </View>
              <Text style={[styles.bannerHeadline, { color: '#FFFFFF' }]}>{'Invite & earn ₹500'}</Text>
              <Text style={[styles.bannerSub, { color: 'rgba(255,255,255,0.7)' }]}>For every partner you refer who completes 10 orders</Text>
              <View style={[styles.bannerCta, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                <Text style={[styles.bannerCtaText, { color: '#FFFFFF' }]}>Refer now →</Text>
              </View>
            </View>
          </ScrollView>
        </View>

      </ScrollView>

      {/* NEW ASSIGNMENT FULLSCREEN OVERLAY — blocks all interaction, stays inside phone frame */}
      {isOnline && activeOrder && (
        <View style={[styles.assignmentOverlay, { backgroundColor: theme.canvas }]}>
          {/* Top bar */}
          <View style={[styles.assignmentTopBar, { backgroundColor: theme.surface, borderBottomColor: theme.line }]}>
            <View style={styles.assignmentTopBarLeft}>
              <Text style={[styles.assignmentTitle, { color: theme.ink900 }]}>ORDER ASSIGNED</Text>
            </View>
            <Text style={[styles.sheetOrderId, { color: theme.ink500 }]}>{activeOrder.id}</Text>
          </View>

          {/* Scrollable content */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.assignmentScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Alert banner */}
            <View style={[styles.assignmentAlertBanner, { backgroundColor: theme.brandLime }]}>
              <KudiIcon name="alert-circle" size={16} color={theme.ink900} />
              <Text style={[styles.assignmentAlertText, { color: theme.ink900 }]}>
                A delivery has been assigned to this driver at the store. Review the order before pickup confirmation.
              </Text>
            </View>

            {/* Route timeline */}
            <View style={[styles.assignmentCard, { backgroundColor: theme.surface, borderColor: theme.line }]}>
              <Text style={[styles.assignmentCardLabel, { color: theme.ink500 }]}>Route</Text>
              <View style={styles.sheetTimeline}>
                <View style={styles.sheetTimelineCol}>
                  <View style={[styles.sheetTimelineDot, { backgroundColor: theme.ink900 }]} />
                  <View style={[styles.sheetTimelineLine, { backgroundColor: theme.line }]} />
                  <View style={[styles.sheetTimelineDot, { backgroundColor: theme.online }]} />
                </View>
                <View style={styles.sheetTimelineContent}>
                  <View style={styles.sheetLocationRow}>
                    <Text style={[styles.sheetLocationLabel, { color: theme.ink900 }]}>Pickup</Text>
                    <Text style={[styles.sheetLocationValue, { color: theme.ink700 }]}>{activeOrder.pickupLocation}</Text>
                  </View>
                  <View style={styles.sheetLocationRow}>
                    <Text style={[styles.sheetLocationLabel, { color: theme.online }]}>Drop</Text>
                    <Text style={[styles.sheetLocationValue, { color: theme.ink700 }]}>{activeOrder.customerAddress}</Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Order meta */}
            <View style={[styles.assignmentCard, { backgroundColor: theme.surface, borderColor: theme.line }]}>
              <Text style={[styles.assignmentCardLabel, { color: theme.ink500 }]}>Order details</Text>
              <View style={styles.assignmentMetaGrid}>
                <View style={styles.assignmentMetaTile}>
                  <KudiIcon name="package" size={20} color={theme.ink500} />
                  <Text style={[styles.assignmentMetaValue, { color: theme.ink900 }]}>{activeOrder.itemsCount}</Text>
                  <Text style={[styles.assignmentMetaLabel, { color: theme.ink500 }]}>Items</Text>
                </View>
                <View style={[styles.assignmentMetaDivider, { backgroundColor: theme.line }]} />
                <View style={styles.assignmentMetaTile}>
                  <KudiIcon name="navigation" size={20} color={theme.ink500} />
                  <Text style={[styles.assignmentMetaValue, { color: theme.ink900 }]}>{activeOrder.distance}</Text>
                  <Text style={[styles.assignmentMetaLabel, { color: theme.ink500 }]}>Distance</Text>
                </View>
                <View style={[styles.assignmentMetaDivider, { backgroundColor: theme.line }]} />
                <View style={styles.assignmentMetaTile}>
                  <KudiIcon name="clock" size={20} color={theme.ink500} />
                  <Text style={[styles.assignmentMetaValue, { color: theme.ink900 }]}>{activeOrder.eta}</Text>
                  <Text style={[styles.assignmentMetaLabel, { color: theme.ink500 }]}>ETA</Text>
                </View>
              </View>
            </View>

            {/* Customer */}
            <View style={[styles.assignmentCard, { backgroundColor: theme.surface, borderColor: theme.line }]}>
              <Text style={[styles.assignmentCardLabel, { color: theme.ink500 }]}>Customer</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={[styles.assignmentCustomerAvatar, { backgroundColor: theme.canvas }]}>
                  <KudiIcon name="user" size={20} color={theme.ink700} />
                </View>
                <View>
                  <Text style={[styles.assignmentCustomerName, { color: theme.ink900 }]}>{activeOrder.customerName}</Text>
                  <Text style={[styles.assignmentMetaLabel, { color: theme.ink500 }]}>{activeOrder.date}</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={[styles.assignmentFooter, { backgroundColor: theme.surface, borderTopColor: theme.line }]}>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: theme.ink900, flex: 1 }]}
              onPress={() => navigation.navigate('OrderDetails', { orderId: activeOrder.id })}
              activeOpacity={0.85}
            >
              <Text style={[styles.primaryBtnText, { color: '#FFF' }]}>Review Order</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: { flex: 1 },
  header: {
    height: 64,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.gutter,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  avatarText: { ...tokens.typography.section },
  headerName: { ...tokens.typography.section },
  headerRole: { ...tokens.typography.minimum },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: tokens.radii.pill, gap: 6 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { ...tokens.typography.minimum, fontWeight: '700' },
  bellBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  bellBadge: { position: 'absolute', top: 10, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: tokens.colors.light.danger, borderWidth: 1.5, borderColor: '#FFF' },

  safetyBanner: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: tokens.spacing.gutter,
    gap: 8,
  },
  safetyText: { ...tokens.typography.caption, flex: 1 },
  safetyLink: { ...tokens.typography.caption, fontWeight: '700', marginRight: 8 },
  safetyClose: { padding: 4 },

  scrollContent: {
    padding: tokens.spacing.gutter,
    paddingBottom: 24,
  },

  heroCard: {
    borderRadius: tokens.radii.hero,
    padding: tokens.spacing.cardPadding,
    marginBottom: tokens.spacing.cardGap,
  },
  heroHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  heroSub: { ...tokens.typography.minimum },
  shiftChip: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: tokens.radii.pill },
  shiftChipText: { ...tokens.typography.minimum, color: '#FFF' },
  heroAmount: { ...tokens.typography.hero, color: '#FFF', marginBottom: 24 },
  shiftProgressContainer: { marginBottom: 24 },
  shiftProgressBarBg: { height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, marginBottom: 8 },
  shiftProgressBarFill: { height: '100%', borderRadius: 3 },
  shiftProgressText: { ...tokens.typography.minimum },
  heroTiles: { flexDirection: 'row', gap: 12 },
  heroTile: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: tokens.radii.tile, padding: 12 },
  heroTileLabel: { ...tokens.typography.minimum, color: 'rgba(255,255,255,0.6)', marginBottom: 4 },
  heroTileValue: { ...tokens.typography.body, color: '#FFF', fontWeight: '700' },
  heroNudge: { marginTop: 16, padding: 12, borderRadius: 8 },
  heroNudgeText: { ...tokens.typography.caption, fontWeight: '600' },

  stageCard: {
    borderRadius: tokens.radii.card,
    borderWidth: 1,
    padding: 32,
    marginBottom: tokens.spacing.cardGap,
    alignItems: 'center',
  },
  stageOffline: { alignItems: 'center' },
  stageIconBg: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  stageDot: { width: 16, height: 16, borderRadius: 8 },
  stageTitle: { ...tokens.typography.title, marginBottom: 8, textAlign: 'center' },
  stageSub: { ...tokens.typography.body, textAlign: 'center', marginBottom: 24 },
  secondaryBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderRadius: tokens.radii.pill, borderWidth: 1 },
  secondaryBtnText: { ...tokens.typography.body, fontWeight: '700' },

  stageOnline: { alignItems: 'center' },
  radarContainer: { width: 120, height: 120, justifyContent: 'center', alignItems: 'center', marginBottom: 16, position: 'relative' },
  radarRing: { position: 'absolute', width: 40, height: 40, borderRadius: 20, borderWidth: 2 },
  radarCenter: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', zIndex: 2 },

  bonusCard: {
    borderRadius: tokens.radii.card,
    borderWidth: 1,
    marginBottom: tokens.spacing.cardGap,
  },
  paginationContainer: { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingBottom: 16, paddingTop: 4 },
  paginationDot: { width: 6, height: 6, borderRadius: 3 },
  bonusHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  bonusTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bonusIconBg: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  bonusTitle: { ...tokens.typography.body, fontWeight: '600' },
  bonusAmount: { ...tokens.typography.section },
  bonusSub: { ...tokens.typography.caption, marginBottom: 24 },
  bonusProgressRow: { marginBottom: 20 },
  bonusProgressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  bonusProgressLabel: { ...tokens.typography.caption, fontWeight: '700' },
  bonusProgressHelper: { ...tokens.typography.minimum },
  bonusProgressBarBg: { height: 8, borderRadius: 4, position: 'relative' },
  bonusProgressBarFill: { height: '100%', borderRadius: 4 },
  bonusFlagWrapper: { position: 'absolute', right: 0, top: -2, width: 12, height: 12, borderRadius: 6, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, elevation: 1 },
  bonusFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  bonusStatusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: tokens.radii.pill },
  bonusStatusText: { ...tokens.typography.minimum, fontWeight: '700' },
  bonusFooterLink: { ...tokens.typography.caption, fontWeight: '600' },

  bannerSection: { marginBottom: tokens.spacing.cardGap },
  bannerSectionTitle: { ...tokens.typography.body, fontWeight: '700', marginBottom: 12, paddingHorizontal: tokens.spacing.gutter },
  bannerScroll: { paddingHorizontal: tokens.spacing.gutter, gap: 12 },
  bannerCard: {
    width: 220,
    borderRadius: tokens.radii.card,
    padding: 20,
    justifyContent: 'space-between',
  },
  bannerTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  bannerBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: tokens.radii.pill },
  bannerBadgeText: { ...tokens.typography.minimum, fontWeight: '800', letterSpacing: 0.5 },
  bannerHeadline: { ...tokens.typography.body, fontWeight: '800', marginBottom: 6, lineHeight: 22 },
  bannerSub: { ...tokens.typography.minimum, lineHeight: 17, marginBottom: 20 },
  bannerCta: { alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 8, borderRadius: tokens.radii.pill },
  bannerCtaText: { ...tokens.typography.minimum, fontWeight: '700' },

  scrim: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    zIndex: 999,
  },
  bottomSheet: {
    borderTopLeftRadius: tokens.radii.hero,
    borderTopRightRadius: tokens.radii.hero,
    padding: tokens.spacing.cardPadding,
    paddingBottom: 40,
  },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  sheetPill: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: tokens.radii.pill, gap: 6 },
  sheetPillDot: { width: 6, height: 6, borderRadius: 3 },
  sheetPillText: { ...tokens.typography.minimum, fontWeight: '700' },
  sheetOrderId: { ...tokens.typography.caption, fontWeight: '600' },
  
  sheetTimeline: { flexDirection: 'row', marginBottom: 24 },
  sheetTimelineCol: { width: 16, alignItems: 'center', marginRight: 16, marginTop: 6 },
  sheetTimelineDot: { width: 8, height: 8, borderRadius: 4 },
  sheetTimelineLine: { width: 2, flex: 1, marginVertical: 4 },
  sheetTimelineContent: { flex: 1 },
  sheetLocationRow: { marginBottom: 16 },
  sheetLocationLabel: { ...tokens.typography.caption, fontWeight: '700', marginBottom: 2 },
  sheetLocationValue: { ...tokens.typography.body, lineHeight: 24 },

  sheetChips: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  sheetChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: tokens.radii.pill },
  sheetChipText: { ...tokens.typography.caption, fontWeight: '600' },

  primaryBtn: { height: 60, borderRadius: tokens.radii.pill, justifyContent: 'center', alignItems: 'center' },
  primaryBtnText: { ...tokens.typography.body, fontWeight: '700', fontSize: 18 },

  // Fullscreen assignment overlay (inside phone frame, not escaping like Modal on web)
  assignmentOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 10 },
  assignmentTopBar: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: tokens.spacing.gutter,
    borderBottomWidth: 1,
  },
  assignmentTopBarLeft: { flex: 1, marginRight: 12 },
  assignmentTitle: { ...tokens.typography.caption, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  assignmentSubtitle: { ...tokens.typography.minimum, lineHeight: 17 },
  assignmentScrollContent: {
    padding: tokens.spacing.gutter,
    paddingBottom: 24,
    gap: 12,
  },
  assignmentAlertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: tokens.radii.tile,
  },
  assignmentAlertText: { ...tokens.typography.caption, fontWeight: '700', flex: 1 },
  assignmentCard: {
    borderRadius: tokens.radii.card,
    borderWidth: 1,
    padding: tokens.spacing.cardPadding,
  },
  assignmentCardLabel: { ...tokens.typography.minimum, fontWeight: '700', letterSpacing: 0.5, marginBottom: 16, textTransform: 'uppercase' },
  assignmentMetaGrid: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assignmentMetaTile: { flex: 1, alignItems: 'center', gap: 6 },
  assignmentMetaDivider: { width: 1, height: 48 },
  assignmentMetaValue: { ...tokens.typography.body, fontWeight: '800' },
  assignmentMetaLabel: { ...tokens.typography.minimum, fontWeight: '500' },
  assignmentCustomerAvatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  assignmentCustomerName: { ...tokens.typography.body, fontWeight: '700', marginBottom: 2 },
  assignmentFooter: {
    padding: tokens.spacing.gutter,
    paddingBottom: 32,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 12,
  },
});
