import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { KudiIcon } from '../../components/KudiIcon';
import { toast } from '../../store/useToastStore';
import { shiftsApi } from '../../api';
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

  const fetchSchedule = (week: 'THIS_WEEK' | 'NEXT_WEEK') => {
    setLoading(true);
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
        toast.error(err?.message || 'Failed to load shift slots');
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
    if (isNextWeek && isLocked) {
      toast.warning(lockMessage || 'Next week slots cannot be booked yet.');
      return;
    }

    const slot = selectedDay?.slots.find((s) => s.id === slotId);
    if (!slot) return;

    if (slot.status === 'AVAILABLE') {
      try {
        await shiftsApi.bookSlot(slotId);
        toast.success(`Slot booked for ${slot.timeRange}`);
        fetchSchedule(selectedWeek);
      } catch (err: any) {
        toast.error(err?.message || 'Could not book slot');
      }
    } else if (slot.status === 'BOOKED') {
      try {
        await shiftsApi.cancelSlot(slotId);
        toast.info(`Slot booking cancelled for ${slot.timeRange}`);
        fetchSchedule(selectedWeek);
      } catch (err: any) {
        toast.error(err?.message || 'Could not cancel slot');
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

        {/* Section Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>{sectionTitle}</Text>
          <Text style={styles.sectionDateSub}>{selectedDay?.dateLabel || ''}</Text>
        </View>

        {/* Slots List or Empty State */}
        {filteredSlots.length === 0 ? (
          <View style={styles.emptyFilterState}>
            <Text style={styles.emptyFilterTitle}>
              {activeFilter === 'BOOKED' ? 'No booked slots' : 'No available slots'}
            </Text>
            <Text style={styles.emptyFilterSub}>
              {activeFilter === 'BOOKED'
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
