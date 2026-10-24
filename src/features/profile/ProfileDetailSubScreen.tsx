import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { spacing } from '../../theme/spacing';
import { colors } from '../../theme/colors';
import { useDriverStore } from '../../store/useDriverStore';
import { useOrderStore } from '../../store/useOrderStore';
import { KudiIcon } from '../../components/KudiIcon';
import { toast } from '../../store/useToastStore';

interface DocItem {
  id: string;
  title: string;
  rawNumber: string;
  maskedNumber: string;
  status: string;
  description: string;
}

const maskDl = (dl?: string) => {
  if (!dl) return 'Not available';
  const clean = dl.replace(/\s+/g, '');
  if (clean.length < 8) return dl;
  return `${clean.slice(0, 5)} •••••• ${clean.slice(-4)}`;
};

const maskAadhaar = (aadhaar?: string) => {
  if (!aadhaar) return 'Not available';
  const clean = aadhaar.replace(/\s+/g, '');
  if (clean.length < 4) return aadhaar;
  return `•••• •••• ${clean.slice(-4)}`;
};

const maskPan = (pan?: string) => {
  if (!pan) return 'Not available';
  const clean = pan.replace(/\s+/g, '');
  if (clean.length < 5) return pan;
  return `${clean.slice(0, 5)} •••• ${clean.slice(-1)}`;
};

const getDocStatusConfig = (rawStatus?: string) => {
  const s = (rawStatus || '').toLowerCase();
  if (s.includes('verif') && !s.includes('pending')) {
    return {
      label: 'Verified',
      badgeBg: '#EDFDF5',
      badgeBorder: '#A7F3D0',
      textColor: '#16805A',
      iconName: 'check-circle' as const,
    };
  }
  if (s.includes('action') || s.includes('reject') || s.includes('fail')) {
    return {
      label: 'Action required',
      badgeBg: '#FEF2F2',
      badgeBorder: '#FECACA',
      textColor: '#B91C1C',
      iconName: 'alert-circle' as const,
    };
  }
  if (s.includes('not') || s.includes('missing')) {
    return {
      label: 'Not uploaded',
      badgeBg: '#F3F4F6',
      badgeBorder: '#E5E7EB',
      textColor: '#6B7280',
      iconName: 'info-circle' as const,
    };
  }
  return {
    label: 'Under review',
    badgeBg: '#F3F1EC',
    badgeBorder: '#E2DED7',
    textColor: '#65635F',
    iconName: 'clock' as const,
  };
};

const DAILY_INCENTIVE_TIERS = [
  { orders: 'Below 15 orders', bonus: '₹0' },
  { orders: '15 orders', bonus: '₹50' },
  { orders: '16 orders', bonus: '₹55' },
  { orders: '17 orders', bonus: '₹60' },
  { orders: '18 orders', bonus: '₹65' },
  { orders: '19 orders', bonus: '₹78' },
  { orders: '20 orders', bonus: '₹86' },
  { orders: '21 orders', bonus: '₹94' },
  { orders: '22 orders', bonus: '₹102' },
  { orders: '23 orders', bonus: '₹110' },
  { orders: '24 orders', bonus: '₹120' },
  { orders: '25 orders', bonus: '₹130' },
  { orders: '26 orders', bonus: '₹140' },
  { orders: '27 orders', bonus: '₹150' },
  { orders: '28 orders', bonus: '₹160' },
  { orders: '29 orders', bonus: '₹170' },
  { orders: '30 orders', bonus: '₹175' },
  { orders: '31+ orders', bonus: '₹175 + ₹5 / addl order' },
];

const SLOT_WEEKS = {
  current: {
    weekNumber: 'Week 43',
    badge: 'This Week',
    dateRange: '19 Oct - 25 Oct',
    metrics: {
      completed: 0,
      failed: 0,
      noShows: 0,
      cancelled: 0,
    },
    days: [
      { key: '19 Oct', label: '19 Oct • Mon' },
      { key: '20 Oct', label: '20 Oct • Tue' },
      { key: '21 Oct', label: '21 Oct • Wed' },
      { key: '22 Oct', label: '22 Oct • Thu' },
      { key: '23 Oct', label: '23 Oct • Fri' },
      { key: '24 Oct', label: '24 Oct • Sat' },
      { key: '25 Oct', label: '25 Oct • Sun' },
    ],
  },
  previous: {
    weekNumber: 'Week 42',
    badge: 'Last Week',
    dateRange: '12 Oct - 18 Oct',
    metrics: {
      completed: 4,
      failed: 0,
      noShows: 0,
      cancelled: 0,
    },
    days: [
      { key: '12 Oct', label: '12 Oct • Mon' },
      { key: '13 Oct', label: '13 Oct • Tue' },
      { key: '14 Oct', label: '14 Oct • Wed' },
      { key: '15 Oct', label: '15 Oct • Thu' },
      { key: '16 Oct', label: '16 Oct • Fri' },
      { key: '17 Oct', label: '17 Oct • Sat' },
      { key: '18 Oct', label: '18 Oct • Sun' },
    ],
  },
};

export const ProfileDetailSubScreen = ({ navigation, route }: any) => {
  const screenId = route?.params?.id || 'store';
  const customTitle = route?.params?.title;

  const { profile, vehicle, kyc, assignedStore } = useDriverStore();
  const { historicalOrders } = useOrderStore();

  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [rateCardTier, setRateCardTier] = useState<'fullTime' | 'partTime'>('fullTime');
  const [showAllDailyTiers, setShowAllDailyTiers] = useState(false);
  const [selectedSlotWeek, setSelectedSlotWeek] = useState<'current' | 'previous'>('current');
  const [expandedDays, setExpandedDays] = useState<string[]>(['19 Oct', '20 Oct']);

  const toggleDayExpansion = (dayKey: string) => {
    setExpandedDays(prev =>
      prev.includes(dayKey) ? prev.filter(k => k !== dayKey) : [...prev, dayKey]
    );
  };

  const handleChangeWeek = () => {
    const nextWeek = selectedSlotWeek === 'current' ? 'previous' : 'current';
    setSelectedSlotWeek(nextWeek);
    const weekInfo = SLOT_WEEKS[nextWeek];
    toast.info(`Viewing ${weekInfo.weekNumber} (${weekInfo.dateRange})`);
  };

  const handleOrderPress = (orderId: string) => {
    if (navigation?.navigate) {
      navigation.navigate('HistoricalOrderDetail', { orderId });
    } else {
      toast.info(`Viewing details for ${orderId}`);
    }
  };


  const driverFullName = profile.fullName || profile.name || 'Rahul Sharma';
  const nameParts = driverFullName.trim().split(' ');
  const firstName = nameParts[0] || 'Rahul';
  const lastName = nameParts.slice(1).join(' ') || 'Sharma';
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const documentsList: DocItem[] = [
    {
      id: 'dl',
      title: 'Driving Licence',
      rawNumber: profile.licenseNumber,
      maskedNumber: maskDl(profile.licenseNumber),
      status: kyc?.licenseStatus || 'Under review',
      description: 'Official driving permit required for operating commercial and delivery vehicles.',
    },
    {
      id: 'aadhaar',
      title: 'Aadhaar Card',
      rawNumber: profile.aadhaarNumber,
      maskedNumber: maskAadhaar(profile.aadhaarNumber),
      status: kyc?.aadhaarStatus || 'Verified',
      description: 'Government identification used for background verification and compliance.',
    },
    {
      id: 'pan',
      title: 'PAN Card',
      rawNumber: profile.panNumber,
      maskedNumber: maskPan(profile.panNumber),
      status: kyc?.panStatus || 'Verified',
      description: 'Permanent Account Number required for tax deduction and weekly payouts.',
    },
    {
      id: 'rc',
      title: 'Vehicle RC',
      rawNumber: vehicle.registrationNumber || vehicle.rcNumber || '',
      maskedNumber: vehicle.registrationNumber || vehicle.rcNumber || 'KA 05 MJ 4821',
      status: vehicle.rcStatus || 'Verified',
      description: 'Vehicle registration certificate matching your active delivery vehicle.',
    },
  ];

  const getScreenTitle = () => {
    if (customTitle) return customTitle;
    switch (screenId) {
      case 'store':
        return 'Your Store';
      case 'rateCards':
        return 'My Rate Cards';
      case 'star':
        return 'KudiCart Star';
      case 'assets':
        return 'Rider Assets';
      case 'slotHistory':
        return 'Slot History';
      case 'orderHistory':
        return 'Order History';
      case 'ev':
        return 'EV Marketplace';
      case 'help':
        return 'Help & Support';
      case 'cash':
        return 'Cash Balance';
      case 'insurance':
        return 'Insurance Card';
      case 'loan':
        return 'Partner Loans';
      case 'academy':
        return 'KudiCart Academy';
      case 'language':
        return 'Change App Language';
      case 'card':
        return 'KudiCart Card';
      case 'documents':
        return 'Documents & Verification';
      case 'about':
        return 'About KudiCart';
      default:
        return 'Details';
    }
  };

  const handleBack = () => {
    if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation?.navigate('MainApp');
    }
  };

  const renderContent = () => {
    switch (screenId) {
      case 'store':
        return (
          <>
            <View style={styles.bannerCard}>
              <View style={styles.bannerIconWrap}>
                <KudiIcon name="home" size={24} color={colors.primary} />
              </View>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.bannerTitle}>
                  {assignedStore?.name || 'KudiCart Darkstore'}
                </Text>
                <Text style={styles.bannerSubtitle}>
                  {assignedStore?.address || 'HSR Sector 2, 12th Main Road, Bengaluru — 560102'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.storeNavIconBtn}
                onPress={() => {
                  const query = encodeURIComponent(
                    assignedStore?.address || 'HSR Sector 2, 12th Main Road, Bengaluru — 560102'
                  );
                  Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`).catch(
                    () => toast.info('Opening directions to KudiCart Darkstore...')
                  );
                }}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Navigate to darkstore"
              >
                <KudiIcon name="navigation" size={18} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardSectionTitle}>Hub Management & Operations</Text>

              <View style={styles.row}>
                <Text style={styles.rowLabel}>Hub In-Charge</Text>
                <Text style={styles.rowValue}>Vikas Rao (Lead Supervisor)</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.rowLabel}>Hub Contact</Text>
                <Text style={styles.rowValue}>+91 98451 22890</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.rowLabel}>Operating Hours</Text>
                <Text style={styles.rowValue}>06:00 AM – 11:30 PM (Daily)</Text>
              </View>

              <View style={[styles.row, styles.rowLast]}>
                <Text style={styles.rowLabel}>Assigned Fleet Zone</Text>
                <Text style={[styles.rowValue, { color: colors.primary }]}>Zone B-4 (HSR & Koramangala)</Text>
              </View>
            </View>
          </>
        );

      case 'rateCards':
        return (
          <>
            {/* Affordz Pilot Policy Header Card */}
            <View style={styles.policyHeaderCard}>
              <View style={styles.policyHeaderRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.policyTitle}>Affordz Delivery Partner Policy</Text>
                  <Text style={styles.policySubtitle}>Pilot Version • Chennai Launch</Text>
                </View>
                <View style={styles.pilotBadge}>
                  <Text style={styles.pilotBadgeText}>Pilot v1.0</Text>
                </View>
              </View>
            </View>

            {/* 1. Distance & Base Payout */}
            <View style={styles.card}>
              <Text style={styles.cardSectionTitle}>Delivery Distance & Base Payout</Text>

              <View style={styles.row}>
                <View>
                  <Text style={styles.rowLabelBold}>0 – 1 km</Text>
                  <Text style={styles.smallSubtext}>Short-distance order</Text>
                </View>
                <Text style={styles.highlightValue}>₹20 / order</Text>
              </View>

              <View style={styles.row}>
                <View>
                  <Text style={styles.rowLabelBold}>Above 1 km – 2 km</Text>
                  <Text style={styles.smallSubtext}>Mid-range delivery</Text>
                </View>
                <Text style={styles.highlightValue}>₹25 / order</Text>
              </View>

              <View style={styles.row}>
                <View>
                  <Text style={styles.rowLabelBold}>Above 2 km – 3 km</Text>
                  <Text style={styles.smallSubtext}>Outer radius delivery</Text>
                </View>
                <Text style={styles.highlightValue}>₹30 / order</Text>
              </View>

              <View style={styles.radiusNoteBox}>
                <KudiIcon name="info-circle" size={15} color="#65635F" />
                <Text style={styles.radiusNoteText}>
                  Maximum standard delivery radius during the pilot is 3 km. Distances are calculated via GPS verification.
                </Text>
              </View>
            </View>

            {/* 2. Partner Category & Weekly Bonus */}
            <View style={styles.card}>
              <View style={styles.cardHeaderWithTabs}>
                <Text style={styles.cardSectionTitle}>Working Category & Weekly Bonus</Text>
              </View>

              <View style={styles.categoryToggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.categoryTab,
                    rateCardTier === 'fullTime' && styles.categoryTabActive,
                  ]}
                  onPress={() => setRateCardTier('fullTime')}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="View Full-Time category"
                >
                  <Text
                    style={[
                      styles.categoryTabText,
                      rateCardTier === 'fullTime' && styles.categoryTabTextActive,
                    ]}
                  >
                    Full-Time (8 hrs)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.categoryTab,
                    rateCardTier === 'partTime' && styles.categoryTabActive,
                  ]}
                  onPress={() => setRateCardTier('partTime')}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="View Part-Time category"
                >
                  <Text
                    style={[
                      styles.categoryTabText,
                      rateCardTier === 'partTime' && styles.categoryTabTextActive,
                    ]}
                  >
                    Part-Time (5 hrs)
                  </Text>
                </TouchableOpacity>
              </View>

              {rateCardTier === 'fullTime' ? (
                <>
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>Working Schedule</Text>
                    <Text style={styles.rowValue}>8 hrs/day • 6 days/week</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>Weekly Rest Day</Text>
                    <Text style={styles.rowValue}>1 scheduled day off</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>Weekly Order Target</Text>
                    <Text style={styles.rowValue}>119 completed orders (~20/day)</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>Attendance & Bonus</Text>
                    <Text style={[styles.highlightValue, { color: '#16805A' }]}>₹1,100 / week</Text>
                  </View>
                  <View style={styles.illustrativeBox}>
                    <View style={styles.illustrativeHeader}>
                      <Text style={styles.illustrativeTitle}>Illustrative Weekly Total</Text>
                      <Text style={styles.illustrativeAmount}>~₹4,523 / week</Text>
                    </View>
                    <Text style={styles.illustrativeBreakdown}>
                      Base payout (~₹2,915) + Daily incentives (~₹508) + Attendance bonus (₹1,100). Customer tips & surge extra.
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>Working Schedule</Text>
                    <Text style={styles.rowValue}>5 hrs/day • 6 days/week</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>Weekly Rest Day</Text>
                    <Text style={styles.rowValue}>1 scheduled day off</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>Weekly Order Target</Text>
                    <Text style={styles.rowValue}>75 completed orders (~12.5/day)</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.rowLabel}>Attendance & Bonus</Text>
                    <Text style={[styles.highlightValue, { color: '#16805A' }]}>₹500 / week</Text>
                  </View>
                  <View style={styles.illustrativeBox}>
                    <View style={styles.illustrativeHeader}>
                      <Text style={styles.illustrativeTitle}>Illustrative Weekly Total</Text>
                      <Text style={styles.illustrativeAmount}>~₹2,337.50 / week</Text>
                    </View>
                    <Text style={styles.illustrativeBreakdown}>
                      Base payout (~₹1,837.50) + Attendance bonus (₹500). Customer tips & surge extra.
                    </Text>
                  </View>
                </>
              )}
            </View>

            {/* 3. Daily Performance Incentive */}
            <View style={styles.card}>
              <Text style={styles.cardSectionTitle}>Daily Performance Incentive</Text>
              <Text style={styles.bodyText}>
                Total daily bonus earned for that day's eligible completed order count:
              </Text>

              <View style={styles.tierGrid}>
                <View style={styles.tierPill}>
                  <Text style={styles.tierPillOrders}>Below 15</Text>
                  <Text style={styles.tierPillBonus}>₹0</Text>
                </View>
                <View style={styles.tierPill}>
                  <Text style={styles.tierPillOrders}>15 orders</Text>
                  <Text style={styles.tierPillBonusHighlight}>₹50</Text>
                </View>
                <View style={styles.tierPill}>
                  <Text style={styles.tierPillOrders}>20 orders</Text>
                  <Text style={styles.tierPillBonusHighlight}>₹86</Text>
                </View>
                <View style={styles.tierPill}>
                  <Text style={styles.tierPillOrders}>25 orders</Text>
                  <Text style={styles.tierPillBonusHighlight}>₹130</Text>
                </View>
                <View style={styles.tierPill}>
                  <Text style={styles.tierPillOrders}>30 orders</Text>
                  <Text style={styles.tierPillBonusHighlight}>₹175</Text>
                </View>
                <View style={styles.tierPill}>
                  <Text style={styles.tierPillOrders}>31+ orders</Text>
                  <Text style={styles.tierPillBonusHighlight}>+₹5 / order</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.expandTiersButton}
                onPress={() => setShowAllDailyTiers(!showAllDailyTiers)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Toggle daily performance tier list"
              >
                <Text style={styles.expandTiersText}>
                  {showAllDailyTiers ? 'Hide Detailed Tier List' : 'View Complete Tier List (15–31+)'}
                </Text>
                <KudiIcon
                  name={showAllDailyTiers ? 'chevron-up' : 'chevron-down'}
                  size={15}
                  color={colors.primary}
                />
              </TouchableOpacity>

              {showAllDailyTiers && (
                <View style={styles.fullTierTable}>
                  {DAILY_INCENTIVE_TIERS.map((tier, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.tierRow,
                        idx === DAILY_INCENTIVE_TIERS.length - 1 && styles.rowLast,
                      ]}
                    >
                      <Text style={styles.tierRowLabel}>{tier.orders}</Text>
                      <Text style={styles.tierRowValue}>{tier.bonus}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* 4. Peak-Hour Incentive & Customer Tips */}
            <View style={styles.card}>
              <Text style={styles.cardSectionTitle}>Peak Incentive & Customer Tips</Text>

              <View style={styles.row}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.rowLabelBold}>Peak-Hour Incentive</Text>
                  <Text style={styles.smallSubtext}>When officially activated during high demand</Text>
                </View>
                <Text style={styles.highlightValue}>+₹5 / order</Text>
              </View>

              <View style={[styles.row, styles.rowLast]}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text style={styles.rowLabelBold}>Customer Tips</Text>
                  <Text style={styles.smallSubtext}>100% to partner — Affordz retains 0%</Text>
                </View>
                <Text style={[styles.highlightValue, { color: '#16805A' }]}>100% Partner</Text>
              </View>
            </View>

            {/* 5. Customer Delivery Fee Reference */}
            <View style={styles.card}>
              <Text style={styles.cardSectionTitle}>Customer Delivery Fee Structure</Text>
              <Text style={styles.bodyText}>
                Paid by customer according to order value (separate from your partner payout):
              </Text>

              <View style={styles.row}>
                <Text style={styles.rowLabel}>Below ₹400</Text>
                <Text style={styles.rowValue}>₹49 delivery fee</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.rowLabel}>₹400 – ₹699</Text>
                <Text style={styles.rowValue}>₹49 delivery fee</Text>
              </View>

              <View style={[styles.row, styles.rowLast]}>
                <Text style={styles.rowLabel}>₹700 and above</Text>
                <Text style={[styles.highlightValue, { color: '#16805A' }]}>FREE delivery</Text>
              </View>
            </View>

            {/* 6. Settlement & Operational Guidelines */}
            <View style={styles.card}>
              <Text style={styles.cardSectionTitle}>Settlement & Operational Rules</Text>

              <View style={styles.guidelineRow}>
                <KudiIcon name="calendar" size={16} color={colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.guidelineTitle}>Weekly Payout Schedule</Text>
                  <Text style={styles.guidelineDesc}>
                    Earnings are processed weekly following automated verification of completed orders, distance, and attendance.
                  </Text>
                </View>
              </View>

              <View style={styles.guidelineRow}>
                <KudiIcon name="check-circle" size={16} color="#16805A" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.guidelineTitle}>Scheduled Rest Day</Text>
                  <Text style={styles.guidelineDesc}>
                    1 scheduled weekly day off is not treated as an absence and does not reduce attendance bonus eligibility.
                  </Text>
                </View>
              </View>

              <View style={[styles.guidelineRow, styles.rowLast]}>
                <KudiIcon name="shield" size={16} color="#0284C7" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.guidelineTitle}>Safety First Priority</Text>
                  <Text style={styles.guidelineDesc}>
                    Safety takes absolute priority over delivery targets. Partners must never compromise road safety.
                  </Text>
                </View>
              </View>
            </View>
          </>
        );


      case 'star':
        return (
          <>
            <View style={styles.goldBanner}>
              <Text style={{ fontSize: 32 }}>🌟</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.goldTitle}>Gold Partner Tier</Text>
                <Text style={styles.goldSubtitle}>
                  4.92 ★ Rating • Top 5% Delivery Partners
                </Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardSectionTitle}>Tier Benefits & Metrics</Text>

              <View style={styles.row}>
                <Text style={styles.rowLabel}>On-Time Delivery Rate</Text>
                <Text style={[styles.rowValue, { color: '#16805A' }]}>98.4% (Excellent)</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.rowLabel}>Priority Dispatch</Text>
                <Text style={styles.rowValue}>Enabled</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.rowLabel}>Asset Security Deposit</Text>
                <Text style={styles.rowValue}>100% Waived</Text>
              </View>

              <View style={[styles.row, styles.rowLast]}>
                <Text style={styles.rowLabel}>Weekly Festival Bonus</Text>
                <Text style={styles.highlightValue}>Eligible (+₹500 / week)</Text>
              </View>
            </View>
          </>
        );

      case 'assets':
        return (
          <>
            <View style={styles.card}>
              <Text style={styles.cardSectionTitle}>Issued Partner Equipment</Text>

              <View style={styles.row}>
                <Text style={styles.rowLabel}>Thermal Delivery Bag</Text>
                <Text style={styles.rowValue}>Issued (KC-BAG-4821)</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.rowLabel}>Partner T-Shirts</Text>
                <Text style={styles.rowValue}>2 Units Issued (Size: L)</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.rowLabel}>Reflective Safety Helmet</Text>
                <Text style={styles.rowValue}>Issued (DOT Certified)</Text>
              </View>

              <View style={[styles.row, styles.rowLast]}>
                <Text style={styles.rowLabel}>Refundable Deposit</Text>
                <Text style={styles.rowValue}>₹500.00 (Active)</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={() => toast.info('Asset replacement request logged. Hub team will contact you.')}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryActionButtonText}>Request Gear Replacement</Text>
            </TouchableOpacity>
          </>
        );

      case 'slotHistory': {
        const activeWeek = SLOT_WEEKS[selectedSlotWeek];
        return (
          <>
            {/* Week Selector Card */}
            <View style={styles.slotWeekCard}>
              <View style={styles.slotWeekTopRow}>
                <View style={styles.slotWeekTitleRow}>
                  <Text style={styles.slotWeekNumber}>{activeWeek.weekNumber}</Text>
                  <View style={styles.slotWeekBadge}>
                    <Text style={styles.slotWeekBadgeText}>{activeWeek.badge}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.slotWeekChangeBtn}
                  onPress={handleChangeWeek}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel="Change week"
                >
                  <Text style={styles.slotWeekChangeText}>Change</Text>
                  <KudiIcon name="chevron-right" size={13} color={colors.primary} />
                </TouchableOpacity>
              </View>

              <Text style={styles.slotWeekDateRange}>{activeWeek.dateRange}</Text>
            </View>

            {/* 4 Metric Cards (2x2 Grid) */}
            <View style={styles.slotMetricsGrid}>
              <View style={styles.slotMetricCard}>
                <Text style={styles.slotMetricLabel}>Completed</Text>
                <Text style={[styles.slotMetricValue, { color: colors.success }]}>
                  {activeWeek.metrics.completed}
                </Text>
              </View>

              <View style={styles.slotMetricCard}>
                <Text style={styles.slotMetricLabel}>Failed</Text>
                <Text style={[styles.slotMetricValue, { color: colors.danger }]}>
                  {activeWeek.metrics.failed}
                </Text>
              </View>

              <View style={styles.slotMetricCard}>
                <Text style={styles.slotMetricLabel}>No Shows</Text>
                <Text style={[styles.slotMetricValue, { color: colors.danger }]}>
                  {activeWeek.metrics.noShows}
                </Text>
              </View>

              <View style={styles.slotMetricCard}>
                <Text style={styles.slotMetricLabel}>Cancelled</Text>
                <Text style={[styles.slotMetricValue, { color: colors.text }]}>
                  {activeWeek.metrics.cancelled}
                </Text>
              </View>
            </View>

            {/* Daily Breakdown Accordion List */}
            <View style={styles.slotDaysContainer}>
              {activeWeek.days.map(day => {
                const isExpanded = expandedDays.includes(day.key);
                return (
                  <View key={day.key} style={styles.slotDaySection}>
                    <TouchableOpacity
                      style={styles.slotDayHeader}
                      onPress={() => toggleDayExpansion(day.key)}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel={`Toggle slot details for ${day.label}`}
                    >
                      <Text style={styles.slotDayLabel}>{day.label}</Text>
                      <View style={styles.slotDayHeaderRight}>
                        <KudiIcon name="clock" size={17} color={colors.textSecondary} />
                        <KudiIcon
                          name={isExpanded ? 'chevron-up' : 'chevron-down'}
                          size={17}
                          color={colors.textSecondary}
                        />
                      </View>
                    </TouchableOpacity>

                    {isExpanded && (
                      <View style={styles.emptySlotCard}>
                        <Text style={styles.emptySlotTitle}>No Slot details found</Text>
                        <Text style={styles.emptySlotSubtitle}>
                          You did not do any slots on {day.key}
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </>
        );
      }



      case 'orderHistory':
        return (
          <>
            <View style={styles.orderHistoryListContainer}>
              {historicalOrders && historicalOrders.length > 0 ? (
                historicalOrders.map((order) => {
                  const orderKm = order.distance || '2.4 km';
                  const orderEarnings = order.earnings || 55;

                  return (
                    <View key={order.id} style={styles.orderHistoryCard}>
                      <TouchableOpacity
                        style={styles.orderHistoryHeader}
                        onPress={() => handleOrderPress(order.id)}
                        activeOpacity={0.7}
                        accessibilityRole="button"
                        accessibilityLabel={`View details for order ${order.id}`}
                      >
                        <View style={styles.orderHistoryTopRow}>
                          <Text style={styles.orderHistoryId}>{order.id}</Text>
                          <View style={styles.statusVerifiedPill}>
                            <Text style={styles.statusVerifiedText}>{order.status || 'DELIVERED'}</Text>
                          </View>
                        </View>

                        <View style={styles.orderHistorySubRow}>
                          <Text style={styles.orderHistoryDate}>{order.date || 'Today'}</Text>

                          <View style={styles.orderHistoryQuickStats}>
                            <View style={styles.orderDistancePill}>
                              <Text style={styles.orderDistancePillText}>{orderKm}</Text>
                            </View>

                            <View style={styles.orderEarningsBadge}>
                              <Text style={styles.orderEarningsBadgeText}>₹{orderEarnings}.00</Text>
                            </View>

                            <KudiIcon
                              name="chevron-right"
                              size={16}
                              color={colors.textSecondary}
                            />
                          </View>
                        </View>
                      </TouchableOpacity>
                    </View>
                  );
                })
              ) : (
                <View style={styles.card}>
                  <Text style={styles.bodyText}>No historical completed orders found.</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={() => navigation?.navigate?.('Earnings')}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="View Full Earnings Ledger"
            >
              <Text style={styles.primaryActionButtonText}>View Full Earnings Ledger</Text>
            </TouchableOpacity>
          </>
        );


      case 'ev':
        return (
          <>
            <View style={styles.card}>
              <Text style={styles.cardSectionTitle}>Electric Vehicle Partner Plans</Text>

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowLabel}>Bounce Infinity E1</Text>
                  <Text style={styles.smallSubtext}>Unlimited battery swaps included</Text>
                </View>
                <Text style={styles.highlightValue}>₹149 / day</Text>
              </View>

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowLabel}>Yulu Wynn XP</Text>
                  <Text style={styles.smallSubtext}>Low-speed • No driving licence needed</Text>
                </View>
                <Text style={styles.highlightValue}>₹129 / day</Text>
              </View>

              <View style={[styles.row, styles.rowLast]}>
                <Text style={styles.rowLabel}>Nearby Battery Swaps</Text>
                <Text style={styles.rowValue}>3 Stations within 2.0 km</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={() => toast.success('EV Partner assistance details sent to your registered mobile.')}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryActionButtonText}>Inquire for Rental</Text>
            </TouchableOpacity>
          </>
        );

      case 'help':
        return (
          <>
            <TouchableOpacity
              style={styles.sosButton}
              onPress={() => toast.error('Emergency Safety SOS triggered. Support team alerted.')}
              activeOpacity={0.8}
            >
              <Text style={styles.sosButtonText}>🚨 Emergency Safety SOS</Text>
            </TouchableOpacity>

            <View style={styles.card}>
              <Text style={styles.cardSectionTitle}>24/7 Partner Helpline</Text>

              <View style={styles.row}>
                <Text style={styles.rowLabel}>Toll-Free Helpline</Text>
                <Text style={styles.rowValue}>1800-419-5834</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.rowLabel}>WhatsApp Hub Help</Text>
                <Text style={styles.rowValue}>+91 98451 22890</Text>
              </View>

              <View style={[styles.row, styles.rowLast]}>
                <Text style={styles.rowLabel}>Support Availability</Text>
                <Text style={[styles.rowValue, { color: '#16805A' }]}>24 Hours / 7 Days</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={() => Linking.openURL('tel:18004195834').catch(() => {})}
              activeOpacity={0.8}
            >
              <KudiIcon name="phone" size={18} color="#FFFFFF" />
              <Text style={styles.primaryActionButtonText}>Call Partner Support</Text>
            </TouchableOpacity>
          </>
        );

      case 'cash':
        return (
          <>
            <View style={styles.cashHeroCard}>
              <Text style={styles.cashHeroLabel}>Cash in Hand (COD)</Text>
              <Text style={styles.cashHeroAmount}>₹0.00</Text>
              <Text style={styles.cashHeroStatus}>All collected COD has been deposited</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardSectionTitle}>Deposit Limits & Guidelines</Text>

              <View style={styles.row}>
                <Text style={styles.rowLabel}>Floating Cash Limit</Text>
                <Text style={styles.rowValue}>₹2,500.00</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.rowLabel}>Daily Cutoff Time</Text>
                <Text style={styles.rowValue}>11:00 PM</Text>
              </View>

              <View style={[styles.row, styles.rowLast]}>
                <Text style={styles.rowLabel}>Deposit Drop Location</Text>
                <Text style={styles.rowValue}>HSR Darkstore Smart Kiosk</Text>
              </View>
            </View>
          </>
        );

      case 'insurance':
        return (
          <>
            <View style={styles.insuranceBanner}>
              <KudiIcon name="shield" size={28} color="#0043CE" />
              <View style={{ flex: 1 }}>
                <Text style={styles.insuranceTitle}>Group Accidental & Health Cover</Text>
                <Text style={styles.insuranceSubtitle}>Policy ID: KUDI-HLT-2026-9842</Text>
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardSectionTitle}>Coverage Details</Text>

              <View style={styles.row}>
                <Text style={styles.rowLabel}>Accidental Death & Disability</Text>
                <Text style={styles.highlightValue}>₹5,00,000</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.rowLabel}>Hospital Daily Cash</Text>
                <Text style={styles.highlightValue}>₹1,000 / day (30 days)</Text>
              </View>

              <View style={[styles.row, styles.rowLast]}>
                <Text style={styles.rowLabel}>24x7 Claims Assistance</Text>
                <Text style={styles.rowValue}>1800-102-INSURE</Text>
              </View>
            </View>
          </>
        );

      case 'loan':
        return (
          <>
            <View style={styles.loanBanner}>
              <Text style={styles.loanBannerLabel}>Pre-Approved Partner Loan</Text>
              <Text style={styles.loanBannerAmount}>₹25,000.00</Text>
              <Text style={styles.loanBannerSub}>0% interest for first 30 days</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardSectionTitle}>Loan Terms</Text>

              <View style={styles.row}>
                <Text style={styles.rowLabel}>Repayment Model</Text>
                <Text style={styles.rowValue}>₹150 daily deduction from payout</Text>
              </View>

              <View style={[styles.row, styles.rowLast]}>
                <Text style={styles.rowLabel}>Disbursal Time</Text>
                <Text style={styles.rowValue}>Direct to bank in 2 hours</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={() => toast.success('Loan application submitted. Agent will call you shortly.')}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryActionButtonText}>Apply Instantly</Text>
            </TouchableOpacity>
          </>
        );

      case 'academy':
        return (
          <>
            <View style={styles.card}>
              <Text style={styles.cardSectionTitle}>Training & Safety Modules</Text>

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowLabel}>10-Min Safe Riding Rules</Text>
                  <Text style={styles.smallSubtext}>Traffic adherence and helmet protocols</Text>
                </View>
                <Text style={[styles.rowValue, { color: '#16805A' }]}>Completed ✅</Text>
              </View>

              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowLabel}>Bag Packing & Cold Chain</Text>
                  <Text style={styles.smallSubtext}>Perishable grocery handling</Text>
                </View>
                <Text style={[styles.rowValue, { color: '#16805A' }]}>Completed ✅</Text>
              </View>

              <View style={[styles.row, styles.rowLast]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowLabel}>Doorstep Delivery Etiquette</Text>
                  <Text style={styles.smallSubtext}>Customer communication rules</Text>
                </View>
                <Text style={[styles.rowValue, { color: colors.primary }]}>In Progress 📚</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={() => toast.info('Academy video module loaded.')}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryActionButtonText}>Continue Learning</Text>
            </TouchableOpacity>
          </>
        );

      case 'language':
        return (
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>Select Preferred Language</Text>

            {[
              { id: 'en', label: 'English (Default)' },
              { id: 'hi', label: 'हिंदी (Hindi)' },
              { id: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
              { id: 'te', label: 'తెలుగు (Telugu)' },
              { id: 'ta', label: 'தமிழ் (Tamil)' },
              { id: 'mr', label: 'मराठी (Marathi)' },
            ].map((lang, index, arr) => {
              const isSelected = selectedLanguage === lang.label;
              return (
                <TouchableOpacity
                  key={lang.id}
                  style={[
                    styles.languageRow,
                    index === arr.length - 1 && styles.rowLast,
                    isSelected && styles.languageRowSelected,
                  ]}
                  onPress={() => {
                    setSelectedLanguage(lang.label);
                    toast.success(`Language updated to ${lang.label}`);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.languageText,
                      isSelected && styles.languageTextSelected,
                    ]}
                  >
                    {lang.label}
                  </Text>
                  {isSelected && <KudiIcon name="check" size={18} color={colors.primary} />}
                </TouchableOpacity>
              );
            })}
          </View>
        );

      case 'card':
        return (
          <>
            <View style={styles.digitalCardWrap}>
              <View style={styles.digitalCardHeader}>
                <Text style={styles.digitalCardBrand}>KUDICART PARTNER</Text>
                <View style={styles.digitalCardDot} />
              </View>

              <View style={styles.digitalCardBody}>
                <View style={styles.digitalCardAvatar}>
                  <Text style={styles.digitalCardAvatarText}>{initials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.digitalCardName}>{driverFullName}</Text>
                  <Text style={styles.digitalCardId}>ID: {profile.id || 'KC-DRV-8492'}</Text>
                  <Text style={styles.digitalCardHub}>Hub: HSR Darkstore</Text>
                </View>
              </View>

              <View style={styles.digitalCardFooter}>
                <Text style={styles.digitalCardFootText}>
                  Blood Group: O+ • Emergency: +91 98765 43210
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.primaryActionButton}
              onPress={() => toast.success('Digital Partner Card saved to your photos.')}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryActionButtonText}>Save Card to Phone</Text>
            </TouchableOpacity>
          </>
        );

      case 'documents':
        return (
          <View style={styles.card}>
            <Text style={styles.cardSectionTitle}>Uploaded Documents</Text>

            {documentsList.map((doc, idx) => {
              const statusConfig = getDocStatusConfig(doc.status);
              const isLast = idx === documentsList.length - 1;

              return (
                <View
                  key={doc.id}
                  style={[styles.docItemBox, isLast && styles.docItemBoxLast]}
                >
                  <View style={styles.docItemHeader}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Text style={styles.docItemTitle}>{doc.title}</Text>
                      <Text style={styles.smallSubtext}>{doc.maskedNumber}</Text>
                    </View>

                    <View style={styles.docRightRow}>
                      <View
                        style={[
                          styles.statusPill,
                          {
                            backgroundColor: statusConfig.badgeBg,
                            borderColor: statusConfig.badgeBorder,
                          },
                        ]}
                      >
                        <KudiIcon
                          name={statusConfig.iconName}
                          size={12}
                          color={statusConfig.textColor}
                        />
                        <Text
                          style={[
                            styles.statusPillText,
                            { color: statusConfig.textColor },
                          ]}
                        >
                          {statusConfig.label}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={styles.docDownloadBtn}
                        onPress={() => toast.success(`Downloading ${doc.title}...`)}
                        activeOpacity={0.7}
                        accessibilityRole="button"
                        accessibilityLabel={`Download ${doc.title}`}
                      >
                        <KudiIcon name="download" size={16} color={colors.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        );

      case 'about':
        return (
          <>
            <View style={styles.card}>
              <Text style={styles.cardSectionTitle}>Application Details</Text>

              <View style={styles.row}>
                <Text style={styles.rowLabel}>App Version</Text>
                <Text style={styles.rowValue}>v2.4.1 (Build 142)</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.rowLabel}>Release Channel</Text>
                <Text style={styles.rowValue}>Production (Google Play)</Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.rowLabel}>Partner Model</Text>
                <Text style={styles.rowValue}>10-Minute Quick Commerce</Text>
              </View>

              <TouchableOpacity
                style={styles.row}
                onPress={() => toast.info('Opening Terms of Service...')}
              >
                <Text style={styles.rowLabel}>Terms of Service</Text>
                <Text style={[styles.rowValue, { color: colors.primary }]}>View Agreement ›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.row, styles.rowLast]}
                onPress={() => toast.info('Opening Privacy Policy...')}
              >
                <Text style={styles.rowLabel}>Privacy Policy</Text>
                <Text style={[styles.rowValue, { color: colors.primary }]}>View Policy ›</Text>
              </TouchableOpacity>
            </View>
          </>
        );

      default:
        return (
          <View style={styles.card}>
            <Text style={styles.bodyText}>Information for this section will be available soon.</Text>
          </View>
        );
    }
  };

  return (
    <ScreenContainer>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <KudiIcon name="arrow-left" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{getScreenTitle()}</Text>
      </View>



      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderContent()}
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: spacing.m,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2DED7',
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  scrollContent: {
    padding: spacing.m,
    paddingBottom: spacing.xl * 2,
  },
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: spacing.m,
    borderWidth: 1,
    borderColor: '#E2DED7',
    marginBottom: spacing.m,
    gap: 12,
  },
  bannerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF0E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  storeNavIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF0E8',
    borderWidth: 1,
    borderColor: '#FFD6C5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF0E8',
    borderRadius: 12,
    padding: spacing.m,
    borderWidth: 1,
    borderColor: '#FFD6C5',
    marginBottom: spacing.m,
    gap: 10,
  },
  noticeText: {
    flex: 1,
    fontSize: 12,
    color: '#872B05',
    lineHeight: 17,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: spacing.m,
    borderWidth: 1,
    borderColor: '#E2DED7',
    marginBottom: spacing.m,
  },
  cardSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.s,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F1EC',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#F7F6F2',
  },
  rowLast: {
    borderBottomWidth: 0,
    paddingBottom: 2,
  },
  rowLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  rowValue: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
    maxWidth: '60%',
    textAlign: 'right',
  },
  highlightValue: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  bodyText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  smallSubtext: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusVerifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  statusVerifiedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16805A',
  },
  goldBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 14,
    padding: spacing.m,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: spacing.m,
    gap: 12,
  },
  goldTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#92400E',
  },
  goldSubtitle: {
    fontSize: 12,
    color: '#B45309',
    marginTop: 2,
  },
  sosButton: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.m,
  },
  sosButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#DC2626',
  },
  cashHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: spacing.l,
    borderWidth: 1,
    borderColor: '#E2DED7',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  cashHeroLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  cashHeroAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    marginVertical: 4,
  },
  cashHeroStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16805A',
  },
  insuranceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: spacing.m,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: spacing.m,
    gap: 12,
  },
  insuranceTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E40AF',
  },
  insuranceSubtitle: {
    fontSize: 12,
    color: '#3B82F6',
    marginTop: 2,
  },
  loanBanner: {
    backgroundColor: '#FFF7ED',
    borderRadius: 14,
    padding: spacing.l,
    borderWidth: 1,
    borderColor: '#FED7AA',
    alignItems: 'center',
    marginBottom: spacing.m,
  },
  loanBannerLabel: {
    fontSize: 13,
    color: '#9A3412',
    fontWeight: '600',
  },
  loanBannerAmount: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.primary,
    marginVertical: 4,
  },
  loanBannerSub: {
    fontSize: 12,
    color: '#C2410C',
  },
  languageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F7F6F2',
  },
  languageRowSelected: {
    backgroundColor: '#FFFBF9',
  },
  languageText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  languageTextSelected: {
    fontWeight: '700',
    color: colors.primary,
  },
  digitalCardWrap: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: spacing.l,
    marginBottom: spacing.m,
  },
  digitalCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.l,
  },
  digitalCardBrand: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 1.5,
  },
  digitalCardDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22C55E',
  },
  digitalCardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: spacing.l,
  },
  digitalCardAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitalCardAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  digitalCardName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  digitalCardId: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  digitalCardHub: {
    fontSize: 12,
    color: '#CBD5E1',
    marginTop: 2,
  },
  digitalCardFooter: {
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingTop: spacing.s,
  },
  digitalCardFootText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  docItemBox: {
    borderBottomWidth: 1,
    borderBottomColor: '#F7F6F2',
    paddingVertical: 12,
  },
  docItemBoxLast: {
    borderBottomWidth: 0,
    paddingBottom: 2,
  },
  docItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  docItemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  docRightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },
  docDownloadBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFF0E8',
    borderWidth: 1,
    borderColor: '#FFD6C5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginBottom: spacing.s,
  },
  primaryActionButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2DED7',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    marginBottom: spacing.m,
  },
  secondaryActionButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  policyHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: spacing.m,
    borderWidth: 1,
    borderColor: '#E2DED7',
    marginBottom: spacing.m,
  },
  policyHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  policyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  policySubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  pilotBadge: {
    backgroundColor: '#FFF0E8',
    borderWidth: 1,
    borderColor: '#FFD6C5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  pilotBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  rowLabelBold: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  radiusNoteBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FAF9F6',
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
    gap: 8,
  },
  radiusNoteText: {
    flex: 1,
    fontSize: 11,
    color: '#65635F',
    lineHeight: 15,
  },
  cardHeaderWithTabs: {
    marginBottom: spacing.s,
  },
  categoryToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F1EC',
    borderRadius: 10,
    padding: 4,
    marginBottom: spacing.m,
  },
  categoryTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  categoryTabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  illustrativeBox: {
    backgroundColor: '#FAF9F6',
    borderRadius: 10,
    padding: spacing.s,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#EFECE6',
  },
  illustrativeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  illustrativeTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text,
  },
  illustrativeAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#16805A',
  },
  illustrativeBreakdown: {
    fontSize: 11,
    color: colors.textSecondary,
    lineHeight: 15,
  },
  tierGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    marginBottom: 8,
  },
  tierPill: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: '#FAF9F6',
    borderWidth: 1,
    borderColor: '#EFECE6',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tierPillOrders: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  tierPillBonus: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  tierPillBonusHighlight: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
  },
  expandTiersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 6,
    gap: 6,
  },
  expandTiersText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  fullTierTable: {
    backgroundColor: '#FAF9F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#EFECE6',
  },
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EFECE6',
  },
  tierRowLabel: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '500',
  },
  tierRowValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  guidelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F7F6F2',
  },
  guidelineTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  guidelineDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  /* Slot History Zepto-style layout */
  slotWeekCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: spacing.m,
    borderWidth: 1,
    borderColor: '#E2DED7',
    marginBottom: spacing.m,
  },
  slotWeekTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  slotWeekTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  slotWeekNumber: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  slotWeekBadge: {
    backgroundColor: '#FFF0E8',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFD6C5',
  },
  slotWeekBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  slotWeekChangeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 2,
  },
  slotWeekChangeText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  slotWeekDateRange: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  slotMetricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: spacing.m,
  },
  slotMetricCard: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2DED7',
  },
  slotMetricLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  slotMetricValue: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 6,
  },
  slotDaysContainer: {
    gap: 12,
  },
  slotDaySection: {
    marginBottom: 4,
  },
  slotDayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  slotDayLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  slotDayHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  emptySlotCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2DED7',
    paddingVertical: 28,
    paddingHorizontal: spacing.m,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  emptySlotTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 6,
  },
  emptySlotSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  /* Order History Card Styles */
  orderHistoryListContainer: {
    marginBottom: spacing.s,
  },
  orderHistoryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2DED7',
    marginBottom: spacing.m,
    overflow: 'hidden',
  },
  orderHistoryHeader: {
    padding: spacing.m,
  },
  orderHistoryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  orderHistoryId: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  orderHistorySubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderHistoryDate: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  orderHistoryQuickStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderDistancePill: {
    backgroundColor: '#FAF9F6',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EFECE6',
  },
  orderDistancePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  orderEarningsBadge: {
    backgroundColor: '#EDFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  orderEarningsBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16805A',
  },
});



