import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { colors } from '../../theme/colors';
import { KudiIcon } from '../../components/KudiIcon';
import { toast } from '../../store/useToastStore';

export type SlotStatus = 'AVAILABLE' | 'BOOKED' | 'FULL' | 'LOCKED';
export type SlotFilter = 'ALL' | 'AVAILABLE' | 'BOOKED';

export interface SlotItem {
  id: string;
  timeRange: string;
  demand: string;
  bonusText?: string;
  status: SlotStatus;
}

export interface DaySlotSchedule {
  dateKey: string;
  dayShort: string;
  dayName: string;
  dayNumber: string;
  dateLabel: string;
  isToday?: boolean;
  slots: SlotItem[];
}

// THIS WEEK: Sunday 11 Oct to Saturday 17 Oct
const THIS_WEEK_SCHEDULE: DaySlotSchedule[] = [
  {
    dateKey: '2026-10-11',
    dayShort: 'Sun',
    dayName: 'Sunday',
    dayNumber: '11',
    dateLabel: '11 Oct',
    slots: [
      {
        id: 'tw_sun1',
        timeRange: '8:00 AM – 12:00 PM',
        demand: 'High demand',
        bonusText: '+₹100 bonus',
        status: 'AVAILABLE',
      },
      {
        id: 'tw_sun2',
        timeRange: '12:00 PM – 4:00 PM',
        demand: 'High demand',
        bonusText: '+₹100 bonus',
        status: 'BOOKED',
      },
      {
        id: 'tw_sun3',
        timeRange: '5:00 PM – 10:00 PM',
        demand: 'Normal demand',
        status: 'AVAILABLE',
      },
    ],
  },
  {
    dateKey: '2026-10-12',
    dayShort: 'Mon',
    dayName: 'Monday',
    dayNumber: '12',
    dateLabel: '12 Oct',
    slots: [
      {
        id: 'tw_mon1',
        timeRange: '8:00 AM – 12:00 PM',
        demand: 'Normal demand',
        status: 'AVAILABLE',
      },
      {
        id: 'tw_mon2',
        timeRange: '12:00 PM – 4:00 PM',
        demand: 'Normal demand',
        status: 'AVAILABLE',
      },
      {
        id: 'tw_mon3',
        timeRange: '5:00 PM – 10:00 PM',
        demand: 'Normal demand',
        status: 'AVAILABLE',
      },
    ],
  },
  {
    dateKey: '2026-10-13',
    dayShort: 'Tue',
    dayName: 'Tuesday',
    dayNumber: '13',
    dateLabel: '13 Oct',
    slots: [
      {
        id: 'tw_tue1',
        timeRange: '8:00 AM – 12:00 PM',
        demand: 'Normal demand',
        status: 'AVAILABLE',
      },
      {
        id: 'tw_tue2',
        timeRange: '12:00 PM – 4:00 PM',
        demand: 'Normal demand',
        status: 'AVAILABLE',
      },
      {
        id: 'tw_tue3',
        timeRange: '5:00 PM – 10:00 PM',
        demand: 'Normal demand',
        status: 'AVAILABLE',
      },
    ],
  },
  {
    dateKey: '2026-10-14',
    dayShort: 'Wed',
    dayName: 'Wednesday',
    dayNumber: '14',
    dateLabel: '14 Oct',
    isToday: true,
    slots: [
      {
        id: 'tw_wed1',
        timeRange: '8:00 AM – 12:00 PM',
        demand: 'High demand',
        bonusText: '+₹50 bonus',
        status: 'AVAILABLE',
      },
      {
        id: 'tw_wed2',
        timeRange: '12:00 PM – 4:00 PM',
        demand: 'Normal demand',
        status: 'AVAILABLE',
      },
      {
        id: 'tw_wed3',
        timeRange: '5:00 PM – 10:00 PM',
        demand: 'Normal demand',
        status: 'BOOKED',
      },
    ],
  },
  {
    dateKey: '2026-10-15',
    dayShort: 'Thu',
    dayName: 'Thursday',
    dayNumber: '15',
    dateLabel: '15 Oct',
    slots: [
      {
        id: 'tw_thu1',
        timeRange: '8:00 AM – 12:00 PM',
        demand: 'High demand',
        bonusText: '+₹50 bonus',
        status: 'AVAILABLE',
      },
      {
        id: 'tw_thu2',
        timeRange: '12:00 PM – 4:00 PM',
        demand: 'Normal demand',
        status: 'FULL',
      },
      {
        id: 'tw_thu3',
        timeRange: '5:00 PM – 10:00 PM',
        demand: 'Normal demand',
        status: 'AVAILABLE',
      },
    ],
  },
  {
    dateKey: '2026-10-16',
    dayShort: 'Fri',
    dayName: 'Friday',
    dayNumber: '16',
    dateLabel: '16 Oct',
    slots: [
      {
        id: 'tw_fri1',
        timeRange: '8:00 AM – 12:00 PM',
        demand: 'Normal demand',
        status: 'AVAILABLE',
      },
      {
        id: 'tw_fri2',
        timeRange: '12:00 PM – 4:00 PM',
        demand: 'High demand',
        bonusText: '+₹50 bonus',
        status: 'AVAILABLE',
      },
      {
        id: 'tw_fri3',
        timeRange: '5:00 PM – 10:00 PM',
        demand: 'High demand',
        bonusText: '+₹75 bonus',
        status: 'AVAILABLE',
      },
    ],
  },
  {
    dateKey: '2026-10-17',
    dayShort: 'Sat',
    dayName: 'Saturday',
    dayNumber: '17',
    dateLabel: '17 Oct',
    slots: [
      {
        id: 'tw_sat1',
        timeRange: '8:00 AM – 12:00 PM',
        demand: 'High demand',
        bonusText: '+₹100 bonus',
        status: 'AVAILABLE',
      },
      {
        id: 'tw_sat2',
        timeRange: '12:00 PM – 4:00 PM',
        demand: 'High demand',
        bonusText: '+₹100 bonus',
        status: 'AVAILABLE',
      },
      {
        id: 'tw_sat3',
        timeRange: '5:00 PM – 10:00 PM',
        demand: 'High demand',
        bonusText: '+₹100 bonus',
        status: 'FULL',
      },
    ],
  },
];

// NEXT WEEK: Sunday 18 Oct to Saturday 24 Oct (LOCKED)
const NEXT_WEEK_SCHEDULE: DaySlotSchedule[] = [
  {
    dateKey: '2026-10-18',
    dayShort: 'Sun',
    dayName: 'Sunday',
    dayNumber: '18',
    dateLabel: '18 Oct',
    slots: [
      { id: 'nw_sun1', timeRange: '8:00 AM – 12:00 PM', demand: 'High demand', status: 'LOCKED' },
      { id: 'nw_sun2', timeRange: '12:00 PM – 4:00 PM', demand: 'Normal demand', status: 'LOCKED' },
      { id: 'nw_sun3', timeRange: '5:00 PM – 10:00 PM', demand: 'Normal demand', status: 'LOCKED' },
    ],
  },
  {
    dateKey: '2026-10-19',
    dayShort: 'Mon',
    dayName: 'Monday',
    dayNumber: '19',
    dateLabel: '19 Oct',
    slots: [
      { id: 'nw_mon1', timeRange: '8:00 AM – 12:00 PM', demand: 'Normal demand', status: 'LOCKED' },
      { id: 'nw_mon2', timeRange: '12:00 PM – 4:00 PM', demand: 'Normal demand', status: 'LOCKED' },
      { id: 'nw_mon3', timeRange: '5:00 PM – 10:00 PM', demand: 'Normal demand', status: 'LOCKED' },
    ],
  },
  {
    dateKey: '2026-10-20',
    dayShort: 'Tue',
    dayName: 'Tuesday',
    dayNumber: '20',
    dateLabel: '20 Oct',
    slots: [
      { id: 'nw_tue1', timeRange: '8:00 AM – 12:00 PM', demand: 'Normal demand', status: 'LOCKED' },
      { id: 'nw_tue2', timeRange: '12:00 PM – 4:00 PM', demand: 'Normal demand', status: 'LOCKED' },
      { id: 'nw_tue3', timeRange: '5:00 PM – 10:00 PM', demand: 'Normal demand', status: 'LOCKED' },
    ],
  },
  {
    dateKey: '2026-10-21',
    dayShort: 'Wed',
    dayName: 'Wednesday',
    dayNumber: '21',
    dateLabel: '21 Oct',
    slots: [
      { id: 'nw_wed1', timeRange: '8:00 AM – 12:00 PM', demand: 'High demand', status: 'LOCKED' },
      { id: 'nw_wed2', timeRange: '12:00 PM – 4:00 PM', demand: 'Normal demand', status: 'LOCKED' },
      { id: 'nw_wed3', timeRange: '5:00 PM – 10:00 PM', demand: 'Normal demand', status: 'LOCKED' },
    ],
  },
  {
    dateKey: '2026-10-22',
    dayShort: 'Thu',
    dayName: 'Thursday',
    dayNumber: '22',
    dateLabel: '22 Oct',
    slots: [
      { id: 'nw_thu1', timeRange: '8:00 AM – 12:00 PM', demand: 'High demand', status: 'LOCKED' },
      { id: 'nw_thu2', timeRange: '12:00 PM – 4:00 PM', demand: 'Normal demand', status: 'LOCKED' },
      { id: 'nw_thu3', timeRange: '5:00 PM – 10:00 PM', demand: 'Normal demand', status: 'LOCKED' },
    ],
  },
  {
    dateKey: '2026-10-23',
    dayShort: 'Fri',
    dayName: 'Friday',
    dayNumber: '23',
    dateLabel: '23 Oct',
    slots: [
      { id: 'nw_fri1', timeRange: '8:00 AM – 12:00 PM', demand: 'Normal demand', status: 'LOCKED' },
      { id: 'nw_fri2', timeRange: '12:00 PM – 4:00 PM', demand: 'High demand', status: 'LOCKED' },
      { id: 'nw_fri3', timeRange: '5:00 PM – 10:00 PM', demand: 'High demand', status: 'LOCKED' },
    ],
  },
  {
    dateKey: '2026-10-24',
    dayShort: 'Sat',
    dayName: 'Saturday',
    dayNumber: '24',
    dateLabel: '24 Oct',
    slots: [
      { id: 'nw_sat1', timeRange: '8:00 AM – 12:00 PM', demand: 'High demand', status: 'LOCKED' },
      { id: 'nw_sat2', timeRange: '12:00 PM – 4:00 PM', demand: 'High demand', status: 'LOCKED' },
      { id: 'nw_sat3', timeRange: '5:00 PM – 10:00 PM', demand: 'High demand', status: 'LOCKED' },
    ],
  },
];

export const SlotsScreen = ({ navigation }: any) => {
  const [selectedWeek, setSelectedWeek] = useState<'THIS_WEEK' | 'NEXT_WEEK'>('THIS_WEEK');
  const [thisWeekSchedule, setThisWeekSchedule] = useState<DaySlotSchedule[]>(THIS_WEEK_SCHEDULE);
  const [selectedDateKey, setSelectedDateKey] = useState<string>('2026-10-14'); // Wednesday (Today)
  const [activeFilter, setActiveFilter] = useState<SlotFilter>('ALL');

  const isNextWeek = selectedWeek === 'NEXT_WEEK';
  const currentSchedule = isNextWeek ? NEXT_WEEK_SCHEDULE : thisWeekSchedule;

  // Active selected day
  const selectedDay =
    currentSchedule.find((d) => d.dateKey === selectedDateKey) || currentSchedule[0];

  // Filter slots based on active filter
  const filteredSlots = selectedDay.slots.filter((slot) => {
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'AVAILABLE') return slot.status === 'AVAILABLE';
    if (activeFilter === 'BOOKED') return slot.status === 'BOOKED';
    return true;
  });

  const handleBack = () => {
    if (navigation?.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation?.navigate('Home');
    }
  };

  const handleSelectWeek = (week: 'THIS_WEEK' | 'NEXT_WEEK') => {
    setSelectedWeek(week);
    if (week === 'THIS_WEEK') {
      setSelectedDateKey('2026-10-14'); // Reset to Today
    } else {
      setSelectedDateKey('2026-10-18'); // Reset to start of next week (Sunday)
      toast.info('Next week schedule is locked until Friday 6:00 PM.');
    }
  };

  const handleToggleBooking = (slotId: string) => {
    if (isNextWeek) {
      toast.warning('Next week slots cannot be booked yet.');
      return;
    }

    setThisWeekSchedule((prev) =>
      prev.map((day) => {
        if (day.dateKey !== selectedDateKey) return day;
        return {
          ...day,
          slots: day.slots.map((slot) => {
            if (slot.id !== slotId) return slot;
            if (slot.status === 'AVAILABLE') {
              toast.success(`Slot booked for ${slot.timeRange}`);
              return { ...slot, status: 'BOOKED' };
            }
            if (slot.status === 'BOOKED') {
              toast.info(`Slot booking cancelled for ${slot.timeRange}`);
              return { ...slot, status: 'AVAILABLE' };
            }
            return slot;
          }),
        };
      })
    );
  };


  const sectionTitle = `${selectedDay.dayName}'s slots`;

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
            <KudiIcon
              name="lock"
              size={12}
              color={isNextWeek ? '#171716' : '#8A8781'}
            />
          </TouchableOpacity>
        </View>

        {/* Clean Horizontal Date Strip (Sunday to Saturday) */}
        <View style={styles.dateStripWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateStripScroll}
          >
            {currentSchedule.map((day) => {
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
                  <View
                    style={[
                      styles.activeBar,
                      isSelected && styles.activeBarVisible,
                    ]}
                  />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Filter Below Dates: All, Available, Booked */}
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              activeFilter === 'ALL' && styles.filterChipActive,
            ]}
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
            style={[
              styles.filterChip,
              activeFilter === 'AVAILABLE' && styles.filterChipActive,
            ]}
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
            style={[
              styles.filterChip,
              activeFilter === 'BOOKED' && styles.filterChipActive,
            ]}
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
          <Text style={styles.sectionDateSub}>{selectedDay.dateLabel}</Text>
        </View>

        {/* Slots List or Empty State */}
        {filteredSlots.length === 0 ? (
          <View style={styles.emptyFilterState}>
            <Text style={styles.emptyFilterTitle}>
              {activeFilter === 'BOOKED'
                ? 'No booked slots'
                : 'No available slots'}
            </Text>
            <Text style={styles.emptyFilterSub}>
              {activeFilter === 'BOOKED'
                ? 'You have not booked any slots for this day.'
                : 'No slots match the selected filter.'}
            </Text>
          </View>
        ) : (
          filteredSlots.map((slot, index) => {
            const isLast = index === filteredSlots.length - 1;
            const isHighDemand = slot.demand.toLowerCase().includes('high');
            const isBooked = slot.status === 'BOOKED';
            const isFull = slot.status === 'FULL';
            const isLocked = slot.status === 'LOCKED';
            const isAvailable = slot.status === 'AVAILABLE';

            return (
              <View
                key={slot.id}
                style={[styles.slotCard, isLast && styles.lastCard]}
              >
                <View style={styles.slotInfo}>
                  <Text style={styles.slotTime}>{slot.timeRange}</Text>

                  {/* Supporting Demand / Bonus Text */}
                  <View style={styles.demandRow}>
                    <Text
                      style={[
                        styles.slotDemand,
                        isHighDemand ? styles.slotDemandHigh : styles.slotDemandNormal,
                        isLocked && styles.slotDemandLocked,
                      ]}
                    >
                      {slot.demand}
                    </Text>
                    {slot.bonusText ? (
                      <Text style={styles.slotBonus}> · {slot.bonusText}</Text>
                    ) : null}
                  </View>
                </View>

                {/* Action on the right */}
                {isBooked && (
                  <TouchableOpacity
                    style={styles.bookedBadge}
                    onPress={() => handleToggleBooking(slot.id)}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel="Slot booked. Tap to cancel booking"
                  >
                    <Text style={styles.bookedBadgeText}>Booked</Text>
                  </TouchableOpacity>
                )}

                {isFull && (
                  <View
                    style={styles.fullBadge}
                    accessibilityLabel="Slot is full"
                  >
                    <Text style={styles.fullBadgeText}>Full</Text>
                  </View>
                )}

                {isLocked && (
                  <View
                    style={styles.lockedBadge}
                    accessibilityLabel="Slot is locked"
                  >
                    <KudiIcon name="lock" size={12} color="#8A8781" />
                    <Text style={styles.lockedBadgeText}>Locked</Text>
                  </View>
                )}

                {isAvailable && (
                  <TouchableOpacity
                    style={styles.bookButton}
                    onPress={() => handleToggleBooking(slot.id)}
                    activeOpacity={0.85}
                    accessibilityRole="button"
                    accessibilityLabel={`Book slot ${slot.timeRange}`}
                  >
                    <Text style={styles.bookButtonText}>Book</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#F3F1EC', // Warm neutral canvas background
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

  // Top Section: Week Selector + Date Strip + Filters
  topControlSection: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: '#E2DED7',
    paddingTop: 10,
  },

  // Week Selector Tabs
  weekTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F1EC',
    borderRadius: 10,
    padding: 3,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  weekTab: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockedTab: {
    flexDirection: 'row',
    gap: 5,
  },
  weekTabActive: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  weekTabText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#65635F',
  },
  weekTabTextActive: {
    color: '#171716',
    fontWeight: '700',
  },

  // Horizontal Date Strip (Sunday to Saturday)
  dateStripWrapper: {
    paddingTop: 4,
    paddingBottom: 2,
  },
  dateStripScroll: {
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minWidth: '100%',
  },
  dateItem: {
    alignItems: 'center',
    paddingHorizontal: 10,
    minWidth: 42,
  },
  dateDayText: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  dateDayTextSelected: {
    color: '#FF5A1F', // Signal orange for active day
    fontWeight: '600',
  },
  dateDayTextUnselected: {
    color: '#65635F',
  },
  dateNumText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#171716',
    marginBottom: 8,
  },
  activeBar: {
    width: 24,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'transparent',
  },
  activeBarVisible: {
    backgroundColor: '#FF5A1F', // Signal orange underline
  },

  // Filter Row below dates
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F1EC',
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3F1EC',
    borderWidth: 1,
    borderColor: '#E2DED7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterChipActive: {
    backgroundColor: '#171716',
    borderColor: '#171716',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#65635F',
  },
  filterChipTextActive: {
    color: colors.white,
    fontWeight: '600',
  },

  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },

  // Locked Notice Banner
  lockedNoticeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F8F5',
    borderWidth: 1,
    borderColor: '#E2DED7',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  lockedIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EAE7E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  lockedTextCol: {
    flex: 1,
  },
  lockedNoticeTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#171716',
    marginBottom: 1,
  },
  lockedNoticeSub: {
    fontSize: 12,
    color: '#65635F',
  },

  // Section Headers
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#171716',
  },
  sectionDateSub: {
    fontSize: 13,
    fontWeight: '400',
    color: '#65635F',
  },

  // Simplified Slot Cards
  slotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E2DED7',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 68,
    marginBottom: 10,
  },
  slotInfo: {
    flex: 1,
    paddingRight: 12,
  },
  slotTime: {
    fontSize: 15,
    fontWeight: '700',
    color: '#171716',
    marginBottom: 4,
  },
  demandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  slotDemand: {
    fontSize: 13,
  },
  slotDemandHigh: {
    color: '#D94B17', // Warm brand secondary
    fontWeight: '500',
  },
  slotDemandNormal: {
    color: '#65635F',
    fontWeight: '400',
  },
  slotDemandLocked: {
    color: '#8A8781',
  },
  slotBonus: {
    fontSize: 13,
    fontWeight: '600',
    color: '#D94B17',
  },

  // Right-hand Actions
  bookButton: {
    backgroundColor: '#FF5A1F',
    paddingHorizontal: 22,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookButtonText: {
    color: colors.white,
    fontWeight: '700',
    fontSize: 13,
  },
  bookedBadge: {
    backgroundColor: '#EDFDF5',
    borderWidth: 1,
    borderColor: '#C1F2D9',
    paddingHorizontal: 16,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookedBadgeText: {
    color: '#16805A',
    fontWeight: '600',
    fontSize: 13,
  },
  fullBadge: {
    backgroundColor: '#F3F1EC',
    borderWidth: 1,
    borderColor: '#E2DED7',
    paddingHorizontal: 16,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullBadgeText: {
    color: '#8A8781',
    fontWeight: '600',
    fontSize: 13,
  },
  lockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F3F1EC',
    borderWidth: 1,
    borderColor: '#E2DED7',
    paddingHorizontal: 14,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
  },
  lockedBadgeText: {
    color: '#8A8781',
    fontWeight: '600',
    fontSize: 13,
  },

  emptyFilterState: {
    padding: 28,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2DED7',
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  emptyFilterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#171716',
    marginBottom: 4,
  },
  emptyFilterSub: {
    fontSize: 12,
    color: '#65635F',
    textAlign: 'center',
  },

  lastCard: {
    marginBottom: 0,
  },
});
