import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { KudiIcon } from '../../components/KudiIcon';
import {
  FullTimeShift,
  getStatusBadgeStyle,
} from './shiftsData';
import { shiftsApi } from '../../api';
import { styles } from './shifts.styles';
import { ShiftDetailsModal } from './ShiftDetailsModal';

export const ShiftsScreen = ({ navigation }: any) => {
  const [selectedShift, setSelectedShift] = useState<FullTimeShift | null>(null);
  const [schedule, setSchedule] = useState<FullTimeShift[]>([]);
  const [todayShift, setTodayShift] = useState<FullTimeShift | null>(null);
  const [shiftError, setShiftError] = useState<string | null>(null);
  const [isLoadingShifts, setIsLoadingShifts] = useState<boolean>(true);

  const loadShifts = React.useCallback(() => {
    setIsLoadingShifts(true);
    setShiftError(null);
    shiftsApi
      .getShifts()
      .then((res) => {
        if (res && res.weekSchedule && res.weekSchedule.length > 0) {
          setSchedule(res.weekSchedule);
          setTodayShift(res.todayShift || null);
        } else {
          setSchedule([]);
          setTodayShift(null);
        }
      })
      .catch((err: any) => {
        setShiftError(err?.message || 'Unable to load shift schedule.');
      })
      .finally(() => {
        setIsLoadingShifts(false);
      });
  }, []);

  useEffect(() => {
    loadShifts();
  }, [loadShifts]);

  const todayBadge = todayShift ? getStatusBadgeStyle(todayShift.status) : null;

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

        {isLoadingShifts && schedule.length === 0 ? (
          <View style={styles.scheduleCard}>
            <Text style={styles.scheduleDay}>Loading shift schedule…</Text>
          </View>
        ) : shiftError && schedule.length === 0 ? (
          <TouchableOpacity
            style={styles.scheduleCard}
            onPress={loadShifts}
            activeOpacity={0.85}
          >
            <View style={styles.scheduleInfo}>
              <Text style={styles.scheduleDay}>Could not load schedule</Text>
              <Text style={styles.scheduleSub}>{shiftError} Tap to retry.</Text>
            </View>
          </TouchableOpacity>
        ) : todayShift && todayBadge ? (
          /* Today's Shift Main Card (Soft-Orange Surface) */
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
        ) : (
          <View style={styles.scheduleCard}>
            <Text style={styles.scheduleDay}>No shift scheduled for today</Text>
          </View>
        )}

        {/* This Week's Schedule Section */}
        <Text style={styles.sectionTitle}>This week's schedule</Text>

        {!isLoadingShifts && schedule.length === 0 ? (
          <View style={styles.scheduleCard}>
            <Text style={styles.scheduleSub}>
              {shiftError || 'No upcoming shifts assigned for this week.'}
            </Text>
          </View>
        ) : null}

        {schedule.map((shift, index) => {
          const isLast = index === schedule.length - 1;
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
