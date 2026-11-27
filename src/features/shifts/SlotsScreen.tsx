import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { KudiIcon } from '../../components/KudiIcon';
import { shiftsApi } from '../../api';
import { getFriendlyErrorMessage } from '../../utils/errorHandling';
import {
  SlotStatus,
  SlotFilter,
  SlotItem,
  DaySlotSchedule,
} from './slotsData';
import { styles } from './slots.styles';
import { SlotCard } from './SlotCard';

export type { SlotStatus, SlotFilter, SlotItem, DaySlotSchedule };

export const SlotsScreen = ({ navigation }: any) => {
  const [selectedWeek, setSelectedWeek] = useState<'THIS_WEEK' | 'NEXT_WEEK'>('THIS_WEEK');
  const [schedule, setSchedule] = useState<DaySlotSchedule[]>([]);
  const [selectedDateKey, setSelectedDateKey] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<SlotFilter>('ALL');
  const [isLocked, setIsLocked] = useState(false);
  const [lockMessage, setLockMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchSchedule = (week: 'THIS_WEEK' | 'NEXT_WEEK') => {
    setLoading(true);
    setLoadError(null);
    setActionError(null);
    shiftsApi
      .getSlots(week)
      .then((res) => {
        if (res && Array.isArray(res.schedule)) {
          setSchedule(res.schedule as any);
          setIsLocked(Boolean(res.isLocked));
          setLockMessage(res.lockMessage || null);
          if (res.schedule.length > 0) {
            const todayItem = res.schedule.find((d: any) => d.isToday);
            setSelectedDateKey(todayItem ? todayItem.dateKey : res.schedule[0].dateKey);
          }
        }
      })
      .catch((err) => {
        setLoadError(
          getFriendlyErrorMessage(err, 'Unable to load shift slots right now. Please try again.'),
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSchedule(selectedWeek);
  }, [selectedWeek]);

  const isNextWeek = selectedWeek === 'NEXT_WEEK';

  // Active selected day
  const selectedDay =
    schedule.find((d) => d.dateKey === selectedDateKey) || schedule[0] || null;

  // Filter slots based on active filter
  const filteredSlots = selectedDay
    ? selectedDay.slots.filter((slot) => {
        if (activeFilter === 'ALL') return true;
        if (activeFilter === 'AVAILABLE') return slot.status === 'AVAILABLE';
        if (activeFilter === 'BOOKED') return slot.status === 'BOOKED';
        return true;
      })
    : [];

  const handleBack = () => {
    if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation?.navigate('Home');
    }
  };

  const handleSelectWeek = (week: 'THIS_WEEK' | 'NEXT_WEEK') => {
    setSelectedWeek(week);
  };

  const handleToggleBooking = async (slotId: string) => {
    setActionError(null);
    if (isNextWeek && isLocked) {
      if (lockMessage) {
        setActionError(lockMessage);
      }
      return;
    }

    const slot = selectedDay?.slots.find((s) => s.id === slotId);
    if (!slot) return;

    if (slot.status === 'AVAILABLE') {
      try {
        await shiftsApi.bookSlot(slotId);
        fetchSchedule(selectedWeek);
      } catch (err: any) {
        setActionError(getFriendlyErrorMessage(err, 'Could not book slot. Please try again.'));
      }
    } else if (slot.status === 'BOOKED') {
      try {
        await shiftsApi.cancelSlot(slotId);
        fetchSchedule(selectedWeek);
      } catch (err: any) {
        setActionError(getFriendlyErrorMessage(err, 'Could not cancel slot. Please try again.'));
      }
    }
  };

  const sectionTitle = selectedDay ? `${selectedDay.dayName}'s slots` : 'Slots';

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
        <Text style={styles.headerTitle}>Slot details</Text>
      </View>

      {/* Top Section: Week Selector + Date Strip + Status Filter */}
      <View style={styles.topControlSection}>
        {/* Week Selector: This Week & Next Week */}
        <View style={styles.weekTabContainer}>
          <TouchableOpacity
            style={[styles.weekTab, !isNextWeek && styles.weekTabActive]}
            onPress={() => handleSelectWeek('THIS_WEEK')}
            activeOpacity={0.8}
            accessibilityRole="tab"
            accessibilityLabel="This week"
            accessibilityState={{ selected: !isNextWeek }}
          >
            <Text style={[styles.weekTabText, !isNextWeek && styles.weekTabTextActive]}>
              This week
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.weekTab, isNextWeek && styles.weekTabActive, styles.lockedTab]}
            onPress={() => handleSelectWeek('NEXT_WEEK')}
            activeOpacity={0.8}
            accessibilityRole="tab"
            accessibilityLabel="Next week (locked)"
            accessibilityState={{ selected: isNextWeek }}
          >
            <Text style={[styles.weekTabText, isNextWeek && styles.weekTabTextActive]}>
              Next week
            </Text>
            <KudiIcon name="lock" size={12} color={isNextWeek ? '#171716' : '#8A8781'} />
          </TouchableOpacity>
        </View>

        {/* Clean Horizontal Date Strip (Sunday to Saturday) */}
        <View style={styles.dateStripWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateStripScroll}
          >
            {schedule.map((day) => {
              const isSelected = day.dateKey === selectedDateKey;

              return (
                <TouchableOpacity
                  key={day.dateKey}
                  style={styles.dateItem}
                  onPress={() => setSelectedDateKey(day.dateKey)}
                  activeOpacity={0.7}
                  accessibilityRole="tab"
                  accessibilityLabel={`Select ${day.dayName}, ${day.dateLabel}`}
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text
                    style={[
                      styles.dateDayText,
                      isSelected ? styles.dateDayTextSelected : styles.dateDayTextUnselected,
                    ]}
                  >
                    {day.dayShort}
                  </Text>
                  <Text style={styles.dateNumText}>{day.dayNumber}</Text>

                  {/* Signal Orange Active Underline */}
                  <View style={[styles.activeBar, isSelected && styles.activeBarVisible]} />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Filter Below Dates: All, Available, Booked */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'ALL' && styles.filterChipActive]}
            onPress={() => setActiveFilter('ALL')}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityLabel="Filter All slots"
            accessibilityState={{ selected: activeFilter === 'ALL' }}
          >
            <Text
              style={[
                styles.filterChipText,
                activeFilter === 'ALL' && styles.filterChipTextActive,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'AVAILABLE' && styles.filterChipActive]}
            onPress={() => setActiveFilter('AVAILABLE')}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityLabel="Filter Available slots"
            accessibilityState={{ selected: activeFilter === 'AVAILABLE' }}
          >
            <Text
              style={[
                styles.filterChipText,
                activeFilter === 'AVAILABLE' && styles.filterChipTextActive,
              ]}
            >
              Available
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, activeFilter === 'BOOKED' && styles.filterChipActive]}
            onPress={() => setActiveFilter('BOOKED')}
            activeOpacity={0.7}
            accessibilityRole="tab"
            accessibilityLabel="Filter Booked slots"
            accessibilityState={{ selected: activeFilter === 'BOOKED' }}
          >
            <Text
              style={[
                styles.filterChipText,
                activeFilter === 'BOOKED' && styles.filterChipTextActive,
              ]}
            >
              Booked
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Next Week Locked Notice Banner */}
        {isNextWeek && (
          <View style={styles.lockedNoticeCard}>
            <View style={styles.lockedIconWrap}>
              <KudiIcon name="lock" size={16} color="#8A8781" />
            </View>
            <View style={styles.lockedTextCol}>
              <Text style={styles.lockedNoticeTitle}>Next week's slots are locked</Text>
              <Text style={styles.lockedNoticeSub}>
                Booking for next week opens on Friday at 6:00 PM.
              </Text>
            </View>
          </View>
        )}

        {/* Action Error Banner */}
        {actionError ? (
          <View
            accessibilityRole="alert"
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              backgroundColor: '#FEF2F2',
              borderWidth: 1,
              borderColor: '#FECACA',
              borderRadius: 10,
              padding: 10,
              marginBottom: 12,
            }}
          >
            <KudiIcon name="alert-circle" size={16} color="#DC2626" />
            <Text style={{ flex: 1, fontSize: 12.5, fontWeight: '600', color: '#991B1B' }}>
              {actionError}
            </Text>
            <TouchableOpacity
              onPress={() => setActionError(null)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Dismiss error"
            >
              <KudiIcon name="close" size={14} color="#991B1B" />
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Section Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>{sectionTitle}</Text>
          <Text style={styles.sectionDateSub}>{selectedDay?.dateLabel || ''}</Text>
        </View>

        {/* Slots List, Load Error, or Empty State */}
        {loadError && filteredSlots.length === 0 ? (
          <View style={styles.emptyFilterState}>
            <Text style={styles.emptyFilterTitle}>Unable to load slots</Text>
            <Text style={styles.emptyFilterSub}>{loadError}</Text>
            <TouchableOpacity
              onPress={() => fetchSchedule(selectedWeek)}
              style={{
                marginTop: 12,
                backgroundColor: '#171716',
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700' }}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : filteredSlots.length === 0 ? (
          <View style={styles.emptyFilterState}>
            <Text style={styles.emptyFilterTitle}>
              {loading
                ? 'Loading slots...'
                : activeFilter === 'BOOKED'
                  ? 'No booked slots'
                  : 'No available slots'}
            </Text>
            <Text style={styles.emptyFilterSub}>
              {loading
                ? 'Fetching latest slot schedule from server.'
                : activeFilter === 'BOOKED'
                  ? 'You have not booked any slots for this day.'
                  : 'No slots match the selected filter.'}
            </Text>
          </View>
        ) : (
          filteredSlots.map((slot, index) => (
            <SlotCard
              key={slot.id}
              slot={slot}
              isLast={index === filteredSlots.length - 1}
              onToggleBooking={handleToggleBooking}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};
