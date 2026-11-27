import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../../../theme/colors';
import { KudiIcon } from '../../../components/KudiIcon';
import { shiftsApi, ShiftHistoryResponse } from '../../../api';
import { getFriendlyErrorMessage } from '../../../utils/errorHandling';
import { subviewStyles as styles } from './profileSubviews.styles';

export const SlotHistorySubview: React.FC = () => {
  const [weekIndex, setWeekIndex] = useState(0);
  const [history, setHistory] = useState<ShiftHistoryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async (targetWeek: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await shiftsApi.getHistory(targetWeek);
      setHistory(res);
    } catch (err: any) {
      setError(getFriendlyErrorMessage(err, 'Unable to load shift & slot history.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHistory(weekIndex);
  }, [weekIndex, loadHistory]);

  const handleCycleWeek = () => {
    const totalWeeks = history?.availableWeeks?.length || 4;
    setWeekIndex((prev) => (prev + 1) % totalWeeks);
  };

  if (isLoading && !history) {
    return (
      <View style={[styles.card, { alignItems: 'center', paddingVertical: 32, gap: 10 }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.smallSubtext}>Loading your work history...</Text>
      </View>
    );
  }

  if (error && !history) {
    return (
      <View style={[styles.card, { alignItems: 'center', paddingVertical: 28, gap: 10 }]}>
        <KudiIcon name="error-circle" size={30} color="#DC2626" />
        <Text style={styles.emptySlotTitle}>Could not load history</Text>
        <Text style={styles.emptySlotSubtitle}>{error}</Text>
        <TouchableOpacity
          style={[styles.primaryActionButton, { paddingHorizontal: 20, marginTop: 6 }]}
          onPress={() => void loadHistory(weekIndex)}
        >
          <Text style={styles.primaryActionButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isShiftMode = history?.mode === 'SHIFT_HISTORY' || history?.workPreference === 'FULL_TIME';
  const items = history?.items || [];

  return (
    <>
      {/* Week Selector Card */}
      <View style={styles.slotWeekCard}>
        <View style={styles.slotWeekTopRow}>
          <View style={styles.slotWeekTitleRow}>
            <Text style={styles.slotWeekNumber}>
              {weekIndex === 0 ? 'This Week' : weekIndex === 1 ? 'Last Week' : `${weekIndex} Weeks Ago`}
            </Text>
            <View style={styles.slotWeekBadge}>
              <Text style={styles.slotWeekBadgeText}>
                {isShiftMode ? 'Full-Time' : 'Part-Time'}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.slotWeekChangeBtn}
            onPress={handleCycleWeek}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Change week"
          >
            <Text style={styles.slotWeekChangeText}>Next Week</Text>
            <KudiIcon name="chevron-right" size={13} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.slotWeekDateRange}>{history?.label || ''}</Text>
      </View>

      {/* Metrics Grid */}
      <View style={styles.slotMetricsGrid}>
        <View style={styles.slotMetricCard}>
          <Text style={styles.slotMetricLabel}>
            {isShiftMode ? 'Shifts Scheduled' : 'Slots Booked'}
          </Text>
          <Text style={[styles.slotMetricValue, { color: colors.success }]}>
            {isShiftMode ? history?.totalShifts ?? 0 : history?.completedSlots ?? 0}
          </Text>
        </View>

        <View style={styles.slotMetricCard}>
          <Text style={styles.slotMetricLabel}>Total Hours</Text>
          <Text style={[styles.slotMetricValue, { color: colors.text }]}>
            {isShiftMode ? `${history?.totalHours ?? 0}h` : `${history?.bookedHours ?? 0}h`}
          </Text>
        </View>

        <View style={styles.slotMetricCard}>
          <Text style={styles.slotMetricLabel}>Deliveries</Text>
          <Text style={[styles.slotMetricValue, { color: colors.text }]}>
            {history?.deliveries ?? 0}
          </Text>
        </View>

        <View style={styles.slotMetricCard}>
          <Text style={styles.slotMetricLabel}>Earnings</Text>
          <Text style={[styles.slotMetricValue, { color: colors.primary }]}>
            ₹{history?.totalEarnings ?? 0}
          </Text>
        </View>
      </View>

      {/* Records List */}
      {items.length === 0 ? (
        <View style={styles.emptySlotCard}>
          <Text style={styles.emptySlotTitle}>
            No {isShiftMode ? 'shift records' : 'booked slots'} found
          </Text>
          <Text style={styles.emptySlotSubtitle}>
            No {isShiftMode ? 'shifts' : 'slot bookings'} were recorded for {history?.label || 'this week'}.
          </Text>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardSectionTitle}>
            {isShiftMode ? 'Shift Records' : 'Booked Slot Records'}
          </Text>
          {items.map((item, idx) => (
            <View
              key={item.id}
              style={[styles.row, idx === items.length - 1 && styles.rowLast]}
            >
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.rowLabelBold}>
                  {item.day} · {item.dateLabel}
                </Text>
                <Text style={styles.smallSubtext}>
                  {item.timeRange}
                  {item.duration ? ` (${item.duration})` : ''}
                </Text>
                {item.hub ? (
                  <Text style={styles.smallSubtext}>{item.hub}</Text>
                ) : null}
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.highlightValue, { color: '#16805A', fontSize: 13 }]}>
                  {item.attendance || item.statusLabel}
                </Text>
                {item.bonusText ? (
                  <Text style={styles.smallSubtext}>{item.bonusText}</Text>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      )}
    </>
  );
};
