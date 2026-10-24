import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { KudiIcon } from '../../components/KudiIcon';

interface FullTimeShift {
  id: string;
  day: string;
  dateStr: string;
  timeRange: string;
  duration: string;
  breakDuration?: string;
  hub: string;
  hubAddress: string;
  status: 'UPCOMING' | 'IN_PROGRESS' | 'SCHEDULED' | 'COMPLETED' | 'DAY_OFF';
  statusLabel: string;
  isToday?: boolean;
}

const FULL_TIME_WEEK_SCHEDULE: FullTimeShift[] = [
  {
    id: 'ft1',
    day: 'Saturday',
    dateStr: '17 Oct',
    timeRange: 'No shift scheduled',
    duration: '0 hours',
    hub: '',
    hubAddress: '',
    status: 'DAY_OFF',
    statusLabel: 'Day off',
  },
  {
    id: 'ft2',
    day: 'Friday',
    dateStr: '16 Oct',
    timeRange: '9:00 AM – 6:00 PM',
    duration: '9 hours including break',
    breakDuration: '1 hour',
    hub: 'KudiCart Darkstore',
    hubAddress: 'HSR Sector 2, 12th Main Road',
    status: 'SCHEDULED',
    statusLabel: 'Scheduled',
  },
  {
    id: 'ft3',
    day: 'Thursday',
    dateStr: '15 Oct',
    timeRange: '9:00 AM – 6:00 PM',
    duration: '9 hours including break',
    breakDuration: '1 hour',
    hub: 'KudiCart Darkstore',
    hubAddress: 'HSR Sector 2, 12th Main Road',
    status: 'UPCOMING',
    statusLabel: 'Upcoming',
  },
  {
    id: 'ft4',
    day: 'Wednesday',
    dateStr: '14 Oct',
    timeRange: '9:00 AM – 6:00 PM',
    duration: '9 hours including break',
    breakDuration: '1 hour',
    hub: 'KudiCart Darkstore',
    hubAddress: 'HSR Sector 2, 12th Main Road',
    status: 'UPCOMING',
    statusLabel: 'Upcoming',
    isToday: true,
  },
  {
    id: 'ft5',
    day: 'Tuesday',
    dateStr: '13 Oct',
    timeRange: '9:00 AM – 6:00 PM',
    duration: '9 hours including break',
    breakDuration: '1 hour',
    hub: 'KudiCart Darkstore',
    hubAddress: 'HSR Sector 2, 12th Main Road',
    status: 'COMPLETED',
    statusLabel: 'Completed',
  },
  {
    id: 'ft6',
    day: 'Monday',
    dateStr: '12 Oct',
    timeRange: '9:00 AM – 6:00 PM',
    duration: '9 hours including break',
    breakDuration: '1 hour',
    hub: 'KudiCart Darkstore',
    hubAddress: 'HSR Sector 2, 12th Main Road',
    status: 'COMPLETED',
    statusLabel: 'Completed',
  },
  {
    id: 'ft7',
    day: 'Sunday',
    dateStr: '11 Oct',
    timeRange: 'No shift scheduled',
    duration: '0 hours',
    hub: '',
    hubAddress: '',
    status: 'DAY_OFF',
    statusLabel: 'Day off',
  },
];

const getStatusBadgeStyle = (status: FullTimeShift['status']) => {
  switch (status) {
    case 'UPCOMING':
      return {
        bg: '#FFE2D5',
        text: '#D94B17',
        border: '#FFDAC8',
      };
    case 'IN_PROGRESS':
    case 'COMPLETED':
      return {
        bg: '#EDFDF5',
        text: '#16805A',
        border: '#C1F2D9',
      };
    case 'DAY_OFF':
      return {
        bg: '#F3F1EC',
        text: '#8A8781',
        border: '#E2DED7',
      };
    case 'SCHEDULED':
    default:
      return {
        bg: '#F3F1EC',
        text: '#65635F',
        border: '#E2DED7',
      };
  }
};

export const ShiftsScreen = ({ navigation }: any) => {
  const [selectedShift, setSelectedShift] = useState<FullTimeShift | null>(null);

  const todayShift = FULL_TIME_WEEK_SCHEDULE.find((s) => s.isToday) || FULL_TIME_WEEK_SCHEDULE[0];
  const todayBadge = getStatusBadgeStyle(todayShift.status);
  const selectedBadge = selectedShift ? getStatusBadgeStyle(selectedShift.status) : null;

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
      {selectedShift && selectedBadge && (
        <View style={styles.overlayContainer}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setSelectedShift(null)}
          >
            <TouchableOpacity
              style={styles.bottomSheet}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              {/* Drag Handle */}
              <View style={styles.dragHandle} />

              {/* Sheet Header */}
              <View style={styles.sheetHeader}>
                <View style={styles.sheetHeaderLeft}>
                  <Text style={styles.sheetDate}>
                    {selectedShift.day}, {selectedShift.dateStr}
                  </Text>
                  <Text style={styles.sheetSub}>
                    {selectedShift.status === 'DAY_OFF'
                      ? 'Rest day'
                      : selectedShift.status === 'COMPLETED'
                      ? 'Completed shift'
                      : 'Scheduled shift'}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor: selectedBadge.bg,
                      borderColor: selectedBadge.border,
                    },
                  ]}
                >
                  <Text style={[styles.statusPillText, { color: selectedBadge.text }]}>
                    {selectedShift.statusLabel}
                  </Text>
                </View>
              </View>

              <View style={styles.sheetDivider} />

              {selectedShift.status === 'DAY_OFF' ? (
                <View style={styles.dayOffContainer}>
                  <Text style={styles.dayOffText}>
                    No shift scheduled for this day.
                  </Text>
                </View>
              ) : (
                <>
                  {/* Soft-Orange Highlight Panel for Shift Time */}
                  <View style={styles.sheetTimePanel}>
                    <View style={styles.sheetTimeIconWrap}>
                      <KudiIcon name="clock" size={20} color="#FF5A1F" />
                    </View>
                    <View style={styles.sheetTimeTextCol}>
                      <Text style={styles.sheetTimeLabel}>Shift time</Text>
                      <Text style={styles.sheetTimeValue}>{selectedShift.timeRange}</Text>
                    </View>
                  </View>

                  {/* Neutral Card for Hub, Break & Duration */}
                  <View style={styles.sheetNeutralCard}>
                    <View style={styles.sheetField}>
                      <Text style={styles.sheetFieldLabel}>Assigned hub</Text>
                      <Text style={styles.sheetFieldValue}>{selectedShift.hub}</Text>
                      {selectedShift.hubAddress ? (
                        <Text style={styles.sheetFieldSub}>{selectedShift.hubAddress}</Text>
                      ) : null}
                    </View>

                    <View style={styles.sheetFieldDivider} />

                    <View style={styles.sheetFieldRow}>
                      <View style={styles.sheetFieldCol}>
                        <Text style={styles.sheetFieldLabel}>Break</Text>
                        <Text style={styles.sheetFieldValue}>{selectedShift.breakDuration || '1 hour'}</Text>
                      </View>
                      <View style={styles.sheetFieldCol}>
                        <Text style={styles.sheetFieldLabel}>Scheduled duration</Text>
                        <Text style={styles.sheetFieldValue}>{selectedShift.duration}</Text>
                      </View>
                    </View>
                  </View>
                </>
              )}

              {/* Close Button */}
              <TouchableOpacity
                style={styles.sheetCloseButton}
                onPress={() => setSelectedShift(null)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Close shift details"
              >
                <Text style={styles.sheetCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      )}
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
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 8,
  },

  // Full-time Today's Shift Main Card (Soft-Orange Branded Surface)
  heroShiftCard: {
    backgroundColor: '#FFF0E8',
    borderWidth: 1,
    borderColor: '#FFDAC8',
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },
  heroShiftHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroShiftDate: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9E4A24',
  },
  heroShiftTime: {
    fontSize: 18,
    fontWeight: '700',
    color: '#171716',
    marginBottom: 12,
  },
  heroDivider: {
    height: 1,
    backgroundColor: '#FFDAC8',
    marginBottom: 12,
  },
  heroDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroDetailIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFE2D5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  heroDetailTextCol: {
    flex: 1,
  },
  heroDetailLabel: {
    fontSize: 13,
    color: '#65635F',
    fontWeight: '400',
  },
  heroDetailValue: {
    color: '#171716',
    fontWeight: '600',
  },
  heroDetailSub: {
    fontSize: 12,
    color: '#65635F',
    marginTop: 2,
  },

  // Section Headers
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#171716',
    marginBottom: 12,
  },

  // Full-time Schedule List Cards (White Cards)
  scheduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E2DED7',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 60,
    marginBottom: 10,
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleDay: {
    fontSize: 14,
    fontWeight: '600',
    color: '#171716',
    marginBottom: 2,
  },
  scheduleSub: {
    fontSize: 12,
    fontWeight: '400',
    color: '#65635F',
  },
  scheduleSubOff: {
    color: '#8A8781',
  },

  statusRowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  // Status Badges
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Bottom Sheet In-Screen Overlay
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    elevation: 9999,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D3CEC7',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sheetHeaderLeft: {
    flex: 1,
    paddingRight: 12,
  },
  sheetDate: {
    fontSize: 18,
    fontWeight: '700',
    color: '#171716',
    marginBottom: 3,
  },
  sheetSub: {
    fontSize: 13,
    color: '#65635F',
    fontWeight: '400',
  },
  sheetDivider: {
    height: 1,
    backgroundColor: '#F3F1EC',
    marginVertical: 14,
  },

  // Soft-orange Highlight Panel for Shift Time
  sheetTimePanel: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0E8',
    borderWidth: 1,
    borderColor: '#FFDAC8',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  sheetTimeIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFE2D5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sheetTimeTextCol: {
    flex: 1,
  },
  sheetTimeLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9E4A24',
    marginBottom: 2,
  },
  sheetTimeValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#171716',
  },

  // Neutral Card for Hub & Duration
  sheetNeutralCard: {
    backgroundColor: '#F9F8F5',
    borderWidth: 1,
    borderColor: '#E2DED7',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  sheetField: {
    marginBottom: 0,
  },
  sheetFieldLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#65635F',
    marginBottom: 3,
  },
  sheetFieldValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#171716',
  },
  sheetFieldSub: {
    fontSize: 12,
    color: '#8A8781',
    marginTop: 2,
  },
  sheetFieldDivider: {
    height: 1,
    backgroundColor: '#EAE7E0',
    marginVertical: 12,
  },
  sheetFieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sheetFieldCol: {
    flex: 1,
  },

  dayOffContainer: {
    backgroundColor: '#F3F1EC',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  dayOffText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#65635F',
    textAlign: 'center',
  },
  sheetCloseButton: {
    backgroundColor: '#F3F1EC',
    borderWidth: 1,
    borderColor: '#E2DED7',
    borderRadius: 10,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  sheetCloseButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
  },

  lastCard: {
    marginBottom: 0,
  },
});
