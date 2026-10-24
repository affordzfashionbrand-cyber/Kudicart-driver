import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { KudiIcon } from '../../components/KudiIcon';
import { EarningDay } from './earningsData';
import { styles } from './earnings.styles';
import { earningsApi } from '../../api';

export const EarningsScreen = ({ navigation }: any) => {
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [selectedDay, setSelectedDay] = useState<EarningDay | null>(null);
  const [weekData, setWeekData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const fetchEarningsData = (weekIdx: number) => {
    setLoading(true);
    setError(null);
    earningsApi
      .getEarnings(weekIdx)
      .then((res) => {
        if (res && res.days) {
          setWeekData(res);
        }
      })
      .catch((err) => {
        setError(err?.message || 'Failed to load earnings from backend');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEarningsData(currentWeekIndex);
  }, [currentWeekIndex]);

  const currentWeek = weekData;
  const maxWeeks = weekData?.availableWeeks?.length || 4;

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
    if (currentWeekIndex < maxWeeks - 1) {
      setCurrentWeekIndex(currentWeekIndex + 1);
    }
  };

  if (loading && !currentWeek) {
    return (
      <View style={styles.main}>
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
          <Text style={styles.headerTitle}>Weekly earnings</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#8A8781' }}>Loading earnings...</Text>
        </View>
      </View>
    );
  }

  if (error && !currentWeek) {
    return (
      <View style={styles.main}>
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
          <Text style={styles.headerTitle}>Weekly earnings</Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: '#D94B17', fontSize: 16, marginBottom: 8, textAlign: 'center' }}>{error}</Text>
          <TouchableOpacity
            onPress={() => fetchEarningsData(currentWeekIndex)}
            style={{ backgroundColor: '#16805A', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
                disabled={currentWeekIndex === maxWeeks - 1}
                style={styles.weekArrow}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="Previous week"
              >
                <KudiIcon
                  name="chevron-left"
                  size={20}
                  color={currentWeekIndex === maxWeeks - 1 ? '#C4C0B9' : '#65635F'}
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
