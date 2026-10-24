import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Switch, Dimensions, Platform, Image, SafeAreaView } from 'react-native';
import { useDriverStore } from '../../store/useDriverStore';
import { useOrderStore } from '../../store/useOrderStore';
import { KudiIcon } from '../../components/KudiIcon';

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
  
  const activeOrder = activeOrders.length > 0 ? activeOrders[0] : null;

  const handleToggleOnline = (value: boolean) => {
    setIsOnline(value);
    if (!value) {
      clearOrders();
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
            <View>
              <Text style={styles.headerName}>{profile.name?.split(' ')[0] || 'Babajide'}</Text>
              <Text style={styles.headerRole}>{roleLabel} · ID: {profile.id || 'DLV-8492'}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={[styles.onlinePill, isOnline ? styles.onlinePillActive : styles.onlinePillInactive]}
              onPress={() => handleToggleOnline(!isOnline)}
            >
              <View style={[styles.onlineDot, isOnline ? styles.onlineDotActive : styles.onlineDotInactive]} />
              <Text style={[styles.onlinePillText, isOnline ? styles.onlineTextActive : styles.onlineTextInactive]}>
                {isOnline ? 'Online' : 'Offline'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.bellBtn}>
              <KudiIcon name="notifications" size={19} color="#191918" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* MODULE 1: EARNINGS CARD */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Today's Earnings</Text>
              <View style={styles.shiftChip}>
                <Text style={styles.shiftChipText}>Shift 9–6</Text>
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
                <Text style={styles.progressValue}>65% quota</Text>
              </View>
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statBoxLabel}>Online Time</Text>
                <Text style={styles.statBoxValue}>{workSummary?.loginHours || '6h 42m'}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statBoxLabel}>Orders</Text>
                <Text style={styles.statBoxValue}>{workSummary?.ordersDone || 14} completed</Text>
              </View>
            </View>
          </View>

          {/* MODULE 2: OPERATIONAL STATUS CARD */}
          <View style={[styles.card, styles.centerCard]}>
            {!isOnline ? (
              <View style={styles.statusInner}>
                <View style={styles.statusIconBgOffline}>
                  <KudiIcon name="bike" size={26} color="#64635F" />
                </View>
                <View style={styles.statusPillOffline}>
                  <View style={styles.statusPillDotOffline} />
                  <Text style={styles.statusPillTextOffline}>Offline</Text>
                </View>
                <Text style={styles.statusHeadline}>You're Offline</Text>
                <Text style={styles.statusSub}>Go online to start receiving orders.</Text>
              </View>
            ) : !activeOrder ? (
              <View style={styles.statusInner}>
                <View style={styles.statusIconBg}>
                  <KudiIcon name="bike" size={26} color="#191918" />
                </View>
                <View style={styles.statusPill}>
                  <View style={styles.statusPillDot} />
                  <Text style={styles.statusPillText}>Searching For Orders</Text>
                </View>
                <Text style={styles.statusHeadline}>Looking For Orders</Text>
                <Text style={styles.statusSub}>Stay near your assigned hub. We'll alert you with instant priority acoustic tone.</Text>
                
                <View style={styles.storeDetailsSection}>
                  <TouchableOpacity style={styles.storeDetailsBtn}>
                    <KudiIcon name="navigation" size={17} color="#64635F" />
                    <Text style={styles.storeDetailsBtnText}>Store Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.statusInner}>
                <View style={[styles.statusIconBg, { backgroundColor: '#EAF5EF' }]}>
                  <KudiIcon name="package" size={26} color="#16805A" />
                </View>
                <View style={styles.statusPill}>
                  <View style={[styles.statusPillDot, { backgroundColor: '#16805A' }]} />
                  <Text style={styles.statusPillText}>Order Assigned</Text>
                </View>
                <Text style={styles.statusHeadline}>New Order Received</Text>
                <Text style={styles.statusSub}>Order {activeOrder.id} ready for pickup</Text>
                
                <View style={styles.storeDetailsSection}>
                  <TouchableOpacity 
                    style={[styles.storeDetailsBtn, { backgroundColor: '#191918', borderColor: '#191918' }]}
                    onPress={() => navigation.navigate('OrderDetails', { orderId: activeOrder.id })}
                  >
                    <Text style={[styles.storeDetailsBtnText, { color: '#FFF' }]}>View Order Details</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* MODULE 3: DAILY BONUS TARGETS CARD */}
          <View style={styles.card}>
            <View style={styles.bonusHeader}>
              <View style={styles.bonusHeaderLeft}>
                <KudiIcon name="star" size={18} color="#64635F" />
                <Text style={styles.bonusHeadline}>Daily Bonus</Text>
              </View>
              <Text style={styles.bonusAmount}>₹150</Text>
            </View>
            <Text style={styles.bonusSubText}>Complete Today's Targets</Text>
            
            <View style={styles.bonusTargetRow}>
              <View style={styles.bonusTargetTop}>
                <Text style={styles.bonusTargetTitle}>Orders: 8 / 20</Text>
                <Text style={styles.bonusTargetMeta}>12 more to go</Text>
              </View>
              <View style={styles.bonusTargetBarBg}>
                <View style={[styles.bonusTargetBarFill, { width: '40%' }]} />
              </View>
            </View>

            <View style={styles.bonusTargetRow}>
              <View style={styles.bonusTargetTop}>
                <Text style={styles.bonusTargetTitle}>Online Time: 6h 42m / 8h</Text>
                <Text style={styles.bonusTargetMeta}>1h 18m left</Text>
              </View>
              <View style={styles.bonusTargetBarBg}>
                <View style={[styles.bonusTargetBarFill, { width: '84%' }]} />
              </View>
            </View>

            <View style={styles.bonusFooter}>
              <View style={styles.inProgressPill}>
                <Text style={styles.inProgressText}>In Progress</Text>
              </View>
              <TouchableOpacity style={styles.viewDetailsBtn}>
                <Text style={styles.viewDetailsText}>View Details</Text>
                <KudiIcon name="arrow-right" size={15} color="#191918" />
              </TouchableOpacity>
            </View>
          </View>

          {/* MODULE 4: FOR YOU INCENTIVE SECTION */}
          <View style={styles.forYouSection}>
            <Text style={styles.forYouTitle}>For You</Text>
            
            <View style={styles.forYouGrid}>
              <View style={styles.forYouCard}>
                <View style={styles.forYouCardHeader}>
                  <View style={styles.extraEarningBadge}>
                    <Text style={styles.extraEarningBadgeText}>EXTRA EARNING</Text>
                  </View>
                  <KudiIcon name="wallet" size={20} color="#64635F" />
                </View>
                <Text style={styles.forYouCardTitle}>₹200 Bonus</Text>
                <Text style={styles.forYouCardSub}>Complete 5 orders before 2 PM today.</Text>
                <View style={styles.forYouCardFooter}>
                  <TouchableOpacity style={styles.forYouBtn}>
                    <Text style={styles.forYouBtnText}>View Offer</Text>
                    <KudiIcon name="arrow-right" size={16} color="#FF5A1F" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.forYouCard}>
                <View style={styles.forYouCardHeader}>
                  <View style={styles.peakHoursBadge}>
                    <Text style={styles.peakHoursBadgeText}>PEAK HOURS</Text>
                  </View>
                  <KudiIcon name="clock" size={20} color="#64635F" />
                </View>
                <Text style={styles.forYouCardTitle}>₹250 Bonus</Text>
                <Text style={styles.forYouCardSub}>11 AM – 3 PM high velocity dispatch.</Text>
                <View style={styles.forYouCardFooter}>
                  <TouchableOpacity style={styles.forYouBtn}>
                    <Text style={styles.forYouBtnText}>View Details</Text>
                    <KudiIcon name="arrow-right" size={16} color="#FF5A1F" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F6F4F0' },
  mainContainer: {
    flex: 1,
    backgroundColor: '#F6F4F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
    borderBottomWidth: 1,
    borderBottomColor: '#E1DDD6',
    backgroundColor: '#F6F4F0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#191918',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#F6F4F0',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  headerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#191918',
    letterSpacing: -0.2,
  },
  headerRole: {
    fontSize: 12,
    color: '#64635F',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
    borderColor: '#d1ebd9',
  },
  onlinePillInactive: {
    backgroundColor: '#F6F4F0',
    borderColor: '#E1DDD6',
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
    backgroundColor: '#64635F',
  },
  onlinePillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  onlineTextActive: {
    color: '#16805A',
  },
  onlineTextInactive: {
    color: '#64635F',
  },
  bellBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E1DDD6',
    justifyContent: 'center',
    alignItems: 'center',
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
    borderColor: '#E1DDD6',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64635F',
    letterSpacing: -0.2,
  },
  shiftChip: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: '#F6F4F0',
    borderWidth: 1,
    borderColor: '#E1DDD6',
  },
  shiftChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64635F',
  },
  amountContainer: {
    marginBottom: 12,
  },
  amountText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#191918',
    letterSpacing: -1,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: '#ECE8E1',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF5A1F',
    borderRadius: 4,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    fontSize: 12,
    color: '#64635F',
  },
  progressValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF5A1F',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#ECE8E1',
    paddingTop: 14,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#F6F4F0',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E1DDD6',
  },
  statBoxLabel: {
    fontSize: 12,
    color: '#64635F',
    fontWeight: '500',
    marginBottom: 2,
  },
  statBoxValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#191918',
  },
  centerCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  statusInner: {
    alignItems: 'center',
    width: '100%',
  },
  statusIconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF0E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusIconBgOffline: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F6F4F0',
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
    backgroundColor: '#F6F4F0',
    borderWidth: 1,
    borderColor: '#E1DDD6',
    marginBottom: 8,
  },
  statusPillOffline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#F6F4F0',
    borderWidth: 1,
    borderColor: '#E1DDD6',
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
    backgroundColor: '#64635F',
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#191918',
    letterSpacing: 0.2,
  },
  statusPillTextOffline: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64635F',
    letterSpacing: 0.2,
  },
  statusHeadline: {
    fontSize: 20,
    fontWeight: '700',
    color: '#191918',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  statusSub: {
    fontSize: 13,
    color: '#64635F',
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 280,
  },
  storeDetailsSection: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ECE8E1',
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
    borderColor: '#E1DDD6',
    backgroundColor: '#FAF9F6',
  },
  storeDetailsBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#191918',
  },
  bonusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  bonusHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bonusHeadline: {
    fontSize: 16,
    fontWeight: '700',
    color: '#191918',
  },
  bonusAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#191918',
  },
  bonusSubText: {
    fontSize: 12,
    color: '#64635F',
    marginBottom: 14,
  },
  bonusTargetRow: {
    marginBottom: 14,
  },
  bonusTargetTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  bonusTargetTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#191918',
  },
  bonusTargetMeta: {
    fontSize: 12,
    color: '#64635F',
  },
  bonusTargetBarBg: {
    height: 8,
    backgroundColor: '#ECE8E1',
    borderRadius: 4,
    overflow: 'hidden',
  },
  bonusTargetBarFill: {
    height: '100%',
    backgroundColor: '#FF5A1F',
    borderRadius: 4,
  },
  bonusFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ECE8E1',
  },
  inProgressPill: {
    backgroundColor: '#FFF0E8',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 999,
  },
  inProgressText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF5A1F',
    letterSpacing: 0.5,
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#191918',
  },
  forYouSection: {
    marginTop: 8,
  },
  forYouTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#191918',
    letterSpacing: -0.2,
    marginBottom: 12,
  },
  forYouGrid: {
    gap: 12,
  },
  forYouCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E1DDD6',
  },
  forYouCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  extraEarningBadge: {
    backgroundColor: '#FFF0E8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  extraEarningBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF5A1F',
    letterSpacing: 0.5,
  },
  peakHoursBadge: {
    backgroundColor: '#F6F4F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#E1DDD6',
  },
  peakHoursBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#191918',
    letterSpacing: 0.5,
  },
  forYouCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#191918',
    marginBottom: 4,
  },
  forYouCardSub: {
    fontSize: 13,
    color: '#64635F',
    marginBottom: 12,
  },
  forYouCardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#ECE8E1',
    paddingTop: 8,
  },
  forYouBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  forYouBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF5A1F',
  },
});
