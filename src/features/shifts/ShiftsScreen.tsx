import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { KudiIcon } from '../../components/KudiIcon';
import {
  FullTimeShift,
  FULL_TIME_WEEK_SCHEDULE,
  getStatusBadgeStyle,
} from './shiftsData';
import { styles } from './shifts.styles';
import { ShiftDetailsModal } from './ShiftDetailsModal';

export const ShiftsScreen = ({ navigation }: any) => {
  const [selectedShift, setSelectedShift] = useState<FullTimeShift | null>(null);

  const todayShift =
    FULL_TIME_WEEK_SCHEDULE.find((s) => s.isToday) || FULL_TIME_WEEK_SCHEDULE[0];
  const todayBadge = getStatusBadgeStyle(todayShift.status);

  const handleBack = () => {
    if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation?.navigate('Home');
    }
  };

  return (
    <View style={styles.main}>
      {/* Header */}
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
        <Text style={styles.headerTitle}>Shift details</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Section Header: Today's Shift */}
        <Text style={styles.sectionTitle}>Today's shift</Text>

        {/* Today's Shift Main Card (Soft-Orange Surface) */}
        <TouchableOpacity
          style={styles.heroShiftCard}
          onPress={() => setSelectedShift(todayShift)}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="View today's shift details"
        >
          <View style={styles.heroShiftHeader}>
            <Text style={styles.heroShiftDate}>
              {todayShift.day}, {todayShift.dateStr}
            </Text>
            <View
              style={[
                styles.statusPill,
                {
                  backgroundColor: todayBadge.bg,
                  borderColor: todayBadge.border,
                },
              ]}
            >
              <Text style={[styles.statusPillText, { color: todayBadge.text }]}>
                {todayShift.statusLabel}
              </Text>
            </View>
          </View>

          <Text style={styles.heroShiftTime}>{todayShift.timeRange}</Text>

          <View style={styles.heroDivider} />

          <View style={styles.heroDetailRow}>
            <View style={styles.heroDetailIconWrap}>
              <KudiIcon name="home" size={16} color="#D94B17" />
            </View>
            <View style={styles.heroDetailTextCol}>
              <Text style={styles.heroDetailLabel}>
                Assigned hub · <Text style={styles.heroDetailValue}>{todayShift.hub}</Text>
              </Text>
              {todayShift.hubAddress ? (
                <Text style={styles.heroDetailSub}>{todayShift.hubAddress}</Text>
              ) : null}
            </View>
          </View>

          <View style={[styles.heroDetailRow, { marginTop: 10 }]}>
            <View style={styles.heroDetailIconWrap}>
              <KudiIcon name="clock" size={16} color="#D94B17" />
            </View>
            <View style={styles.heroDetailTextCol}>
              <Text style={styles.heroDetailLabel}>
                Scheduled duration ·{' '}
                <Text style={styles.heroDetailValue}>{todayShift.duration}</Text>
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* This Week's Schedule Section */}
        <Text style={styles.sectionTitle}>This week's schedule</Text>

        {FULL_TIME_WEEK_SCHEDULE.map((shift, index) => {
          const isLast = index === FULL_TIME_WEEK_SCHEDULE.length - 1;
          const isDayOff = shift.status === 'DAY_OFF';
          const badgeStyle = getStatusBadgeStyle(shift.status);

          return (
            <TouchableOpacity
              key={shift.id}
              style={[styles.scheduleCard, isLast && styles.lastCard]}
              onPress={() => setSelectedShift(shift)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`View shift details for ${shift.day}, ${shift.dateStr}`}
            >
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleDay}>{shift.day}</Text>
                <Text style={[styles.scheduleSub, isDayOff && styles.scheduleSubOff]}>
                  {shift.dateStr} · {shift.timeRange}
                </Text>
              </View>

              <View style={styles.statusRowRight}>
                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor: badgeStyle.bg,
                      borderColor: badgeStyle.border,
                    },
                  ]}
                >
                  <Text style={[styles.statusPillText, { color: badgeStyle.text }]}>
                    {shift.statusLabel}
                  </Text>
                </View>
                <KudiIcon name="chevron-right" size={16} color="#8A8781" />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Shift Details Bottom Sheet (In-Screen Overlay) */}
      <ShiftDetailsModal shift={selectedShift} onClose={() => setSelectedShift(null)} />
    </View>
  );
};
