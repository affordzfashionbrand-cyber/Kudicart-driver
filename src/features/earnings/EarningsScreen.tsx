import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { KudiIcon } from '../../components/KudiIcon';
import { colors } from '../../theme/colors';

const MOCK_WEEKS = [
  {
    id: 0,
    label: 'Oct 1 - Oct 7',
    totalEarnings: '₹ 2,150',
    orderPay: '₹ 1,950',
    bonus: '₹ 200',
    deliveries: 39,
    activeHours: '17h',
    days: [
      {
        id: 'd1',
        date: 'Oct 7',
        dayName: 'Saturday (Today)',
        earnings: '₹ 620',
        deliveries: 12,
        activeHours: '5.0h',
        bonus: '₹ 100',
        orders: [
          { id: '#KC10222', amount: '₹ 75', time: '2:15 PM' },
          { id: '#KC10221', amount: '₹ 65', time: '1:30 PM' },
          { id: '#KC10218', amount: '₹ 80', time: '12:45 PM' },
          { id: '#KC10215', amount: '₹ 110', time: '11:20 AM' },
        ],
      },
      {
        id: 'd2',
        date: 'Oct 6',
        dayName: 'Friday',
        earnings: '₹ 580',
        deliveries: 10,
        activeHours: '4.5h',
        bonus: '₹ 50',
        orders: [
          { id: '#KC10220', amount: '₹ 80', time: '8:45 PM' },
          { id: '#KC10219', amount: '₹ 100', time: '7:30 PM' },
          { id: '#KC10218', amount: '₹ 400', time: '6:15 PM' },
        ],
      },
      {
        id: 'd3',
        date: 'Oct 5',
        dayName: 'Thursday',
        earnings: '₹ 0',
        deliveries: 0,
        activeHours: '0h',
        bonus: '₹ 0',
        orders: [],
      },
      {
        id: 'd4',
        date: 'Oct 4',
        dayName: 'Wednesday',
        earnings: '₹ 200',
        deliveries: 4,
        activeHours: '1.5h',
        bonus: '₹ 0',
        orders: [
          { id: '#KC10210', amount: '₹ 120', time: '1:00 PM' },
          { id: '#KC10209', amount: '₹ 80', time: '12:15 PM' },
        ],
      },
      {
        id: 'd5',
        date: 'Oct 3',
        dayName: 'Tuesday',
        earnings: '₹ 300',
        deliveries: 5,
        activeHours: '2.5h',
        bonus: '₹ 0',
        orders: [
          { id: '#KC10208', amount: '₹ 150', time: '3:45 PM' },
          { id: '#KC10207', amount: '₹ 150', time: '2:10 PM' },
        ],
      },
      {
        id: 'd6',
        date: 'Oct 2',
        dayName: 'Monday',
        earnings: '₹ 0',
        deliveries: 0,
        activeHours: '0h',
        bonus: '₹ 0',
        orders: [],
      },
      {
        id: 'd0',
        date: 'Oct 1',
        dayName: 'Sunday',
        earnings: '₹ 450',
        deliveries: 8,
        activeHours: '3.5h',
        bonus: '₹ 50',
        orders: [
          { id: '#KC10247', amount: '₹ 55', time: '11:45 AM' },
          { id: '#KC10246', amount: '₹ 60', time: '11:10 AM' },
          { id: '#KC10245', amount: '₹ 45', time: '10:35 AM' },
        ],
      },
    ],
  },
  {
    id: 1,
    label: 'Sep 24 - Sep 30',
    totalEarnings: '₹ 3,420',
    orderPay: '₹ 3,220',
    bonus: '₹ 200',
    deliveries: 62,
    activeHours: '25.5h',
    days: [
      {
        id: 'w1d1',
        date: 'Sep 30',
        dayName: 'Saturday',
        earnings: '₹ 900',
        deliveries: 16,
        activeHours: '6.5h',
        bonus: '₹ 100',
        orders: [
          { id: '#KC10199', amount: '₹ 250', time: '9:30 PM' },
          { id: '#KC10198', amount: '₹ 300', time: '8:15 PM' },
          { id: '#KC10197', amount: '₹ 150', time: '7:00 PM' },
          { id: '#KC10196', amount: '₹ 200', time: '6:45 PM' },
        ],
      },
      {
        id: 'w1d2',
        date: 'Sep 29',
        dayName: 'Friday',
        earnings: '₹ 750',
        deliveries: 14,
        activeHours: '5.5h',
        bonus: '₹ 0',
        orders: [
          { id: '#KC10185', amount: '₹ 450', time: '5:30 PM' },
          { id: '#KC10184', amount: '₹ 300', time: '4:20 PM' },
        ],
      },
      {
        id: 'w1d3',
        date: 'Sep 28',
        dayName: 'Thursday',
        earnings: '₹ 500',
        deliveries: 9,
        activeHours: '4h',
        bonus: '₹ 0',
        orders: [{ id: '#KC10170', amount: '₹ 500', time: '1:15 PM' }],
      },
      {
        id: 'w1d4',
        date: 'Sep 27',
        dayName: 'Wednesday',
        earnings: '₹ 470',
        deliveries: 8,
        activeHours: '3.5h',
        bonus: '₹ 0',
        orders: [],
      },
      {
        id: 'w1d5',
        date: 'Sep 26',
        dayName: 'Tuesday',
        earnings: '₹ 0',
        deliveries: 0,
        activeHours: '0h',
        bonus: '₹ 0',
        orders: [],
      },
      {
        id: 'w1d6',
        date: 'Sep 25',
        dayName: 'Monday',
        earnings: '₹ 0',
        deliveries: 0,
        activeHours: '0h',
        bonus: '₹ 0',
        orders: [],
      },
      {
        id: 'w1d0',
        date: 'Sep 24',
        dayName: 'Sunday',
        earnings: '₹ 800',
        deliveries: 15,
        activeHours: '6h',
        bonus: '₹ 100',
        orders: [
          { id: '#KC10150', amount: '₹ 300', time: '8:45 PM' },
          { id: '#KC10149', amount: '₹ 500', time: '7:30 PM' },
        ],
      },
    ],
  },
];

export const EarningsScreen = ({ navigation }: any) => {
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [selectedDay, setSelectedDay] = useState<any>(null);

  const currentWeek = MOCK_WEEKS[currentWeekIndex];

  const handleBack = () => {
    if (selectedDay) {
      setSelectedDay(null);
    } else {
      navigation.navigate('Home');
    }
  };

  const handleNextWeek = () => {
    if (currentWeekIndex > 0) {
      setCurrentWeekIndex(currentWeekIndex - 1);
    }
  };

  const handlePrevWeek = () => {
    if (currentWeekIndex < MOCK_WEEKS.length - 1) {
      setCurrentWeekIndex(currentWeekIndex + 1);
    }
  };

  return (
    <View style={styles.main}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <KudiIcon name="arrow-left" size={22} color="#171716" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {selectedDay ? 'Daily earnings' : 'Weekly earnings'}
        </Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        bounces={false}
      >
        {!selectedDay ? (
          <>
            {/* Week Selector */}
            <View style={styles.weekSelector}>
              <TouchableOpacity
                onPress={handlePrevWeek}
                disabled={currentWeekIndex === MOCK_WEEKS.length - 1}
                style={styles.weekArrow}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Previous week"
              >
                <KudiIcon
                  name="chevron-left"
                  size={20}
                  color={currentWeekIndex === MOCK_WEEKS.length - 1 ? '#C4C0B9' : '#65635F'}
                />
              </TouchableOpacity>

              <Text style={styles.weekLabel}>{currentWeek.label}</Text>

              <TouchableOpacity
                onPress={handleNextWeek}
                disabled={currentWeekIndex === 0}
                style={styles.weekArrow}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Next week"
              >
                <KudiIcon
                  name="chevron-right"
                  size={20}
                  color={currentWeekIndex === 0 ? '#C4C0B9' : '#65635F'}
                />
              </TouchableOpacity>
            </View>

            {/* Weekly Earnings Hero Card */}
            <View style={styles.heroCard}>
              <Text style={styles.heroSub}>Weekly earnings</Text>
              <Text style={styles.heroAmount}>{currentWeek.totalEarnings}</Text>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{currentWeek.deliveries}</Text>
                  <Text style={styles.statLabel}>Deliveries</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{currentWeek.activeHours}</Text>
                  <Text style={styles.statLabel}>Active hours</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{currentWeek.bonus}</Text>
                  <Text style={styles.statLabel}>Bonus</Text>
                </View>
              </View>
            </View>

            {/* Daily Breakdown Section */}
            <Text style={styles.sectionTitle}>Daily breakdown</Text>

            {currentWeek.days.map((day, index) => {
              const isLast = index === currentWeek.days.length - 1;
              return (
                <TouchableOpacity
                  key={day.id}
                  style={[styles.dayCard, isLast && styles.lastCard]}
                  onPress={() => setSelectedDay(day)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                >
                  <View style={styles.dayInfo}>
                    <Text style={styles.dayName}>{day.dayName}</Text>
                    <Text style={styles.dayDate}>{day.date}</Text>
                  </View>
                  <Text style={styles.dayAmount}>{day.earnings}</Text>
                  <KudiIcon name="chevron-right" size={16} color="#8A8781" />
                </TouchableOpacity>
              );
            })}
          </>
        ) : (
          <>
            {/* Daily Detail View */}
            <View style={styles.heroCard}>
              <Text style={styles.heroSub}>
                {selectedDay.dayName}, {selectedDay.date}
              </Text>
              <Text style={styles.heroAmount}>{selectedDay.earnings}</Text>

              <View style={styles.statsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{selectedDay.deliveries}</Text>
                  <Text style={styles.statLabel}>Deliveries</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{selectedDay.activeHours}</Text>
                  <Text style={styles.statLabel}>Active hours</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{selectedDay.bonus}</Text>
                  <Text style={styles.statLabel}>Bonus</Text>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Completed orders</Text>

            {selectedDay.orders && selectedDay.orders.length > 0 ? (
              selectedDay.orders.map((item: any, i: number) => {
                const isLast = i === selectedDay.orders.length - 1;
                return (
                  <View key={i} style={[styles.transactionCard, isLast && styles.lastCard]}>
                    <View style={styles.transactionIcon}>
                      <KudiIcon name="package" size={18} color="#1A2C5B" />
                    </View>
                    <View style={styles.transactionInfo}>
                      <Text style={styles.transactionTitle}>Order {item.id}</Text>
                      <Text style={styles.transactionTime}>{item.time}</Text>
                    </View>
                    <Text style={styles.transactionAmount}>+{item.amount}</Text>
                  </View>
                );
              })
            ) : (
              <View style={[styles.emptyState, styles.lastCard]}>
                <Text style={styles.emptyText}>No orders completed on this day.</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#F3F1EC', // Warm neutral page background
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2DED7',
    backgroundColor: colors.white,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#171716',
    flex: 1,
    textAlign: 'left',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 8,
  },

  // Week Selector
  weekSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2DED7',
    marginBottom: 16,
  },
  weekArrow: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#171716',
  },

  // Weekly Hero Card
  heroCard: {
    backgroundColor: '#FFF0E8', // Soft orange-tinted surface
    borderWidth: 1,
    borderColor: '#FFD6C4', // Harmonious subtle orange border
    borderRadius: 16,
    padding: 20,
    marginBottom: 18,
  },
  heroSub: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9E4A24', // Warm secondary text
    marginBottom: 6,
  },
  heroAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#171716',
    letterSpacing: -0.5,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F5DCD0', // Soft divider
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#F5DCD0',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#171716',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '400',
    color: '#8A583C', // Warm secondary
  },

  // Daily Breakdown
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#171716',
    marginBottom: 12,
  },
  dayCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E2DED7',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 64,
    marginBottom: 10,
  },
  lastCard: {
    marginBottom: 0,
  },
  dayInfo: {
    flex: 1,
  },
  dayName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#171716',
    marginBottom: 2,
  },
  dayDate: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textSecondary,
  },
  dayAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: '#171716',
    textAlign: 'right',
    marginRight: 10,
  },

  // Daily Detail Order Transactions
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E2DED7',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F1EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#171716',
    marginBottom: 2,
  },
  transactionTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.success,
  },

  emptyState: {
    padding: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2DED7',
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
});
