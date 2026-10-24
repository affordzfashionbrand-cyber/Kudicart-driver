import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { colors } from '../../../theme/colors';
import { KudiIcon } from '../../../components/KudiIcon';
import { toast } from '../../../store/useToastStore';
import { subviewStyles as styles } from './profileSubviews.styles';

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

export const SlotHistorySubview: React.FC = () => {
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
};
