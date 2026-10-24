import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { KudiIcon } from '../../components/KudiIcon';
import { MOCK_WEEKS, EarningDay } from './earningsData';
import { styles } from './earnings.styles';

export const EarningsScreen = ({ navigation }: any) => {
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [selectedDay, setSelectedDay] = useState<EarningDay | null>(null);

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
              selectedDay.orders.map((item, i) => {
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
