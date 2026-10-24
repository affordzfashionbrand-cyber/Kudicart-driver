import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { KudiIcon } from '../../components/KudiIcon';
import { FullTimeShift, getStatusBadgeStyle } from './shiftsData';
import { styles } from './shifts.styles';

interface ShiftDetailsModalProps {
  shift: FullTimeShift | null;
  onClose: () => void;
}

export const ShiftDetailsModal: React.FC<ShiftDetailsModalProps> = ({ shift, onClose }) => {
  if (!shift) return null;

  const badgeStyle = getStatusBadgeStyle(shift.status);

  return (
    <View style={styles.overlayContainer}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
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
                {shift.day}, {shift.dateStr}
              </Text>
              <Text style={styles.sheetSub}>
                {shift.status === 'DAY_OFF'
                  ? 'Rest day'
                  : shift.status === 'COMPLETED'
                  ? 'Completed shift'
                  : 'Scheduled shift'}
              </Text>
            </View>
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
          </View>

          <View style={styles.sheetDivider} />

          {shift.status === 'DAY_OFF' ? (
            <View style={styles.dayOffContainer}>
              <Text style={styles.dayOffText}>No shift scheduled for this day.</Text>
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
                  <Text style={styles.sheetTimeValue}>{shift.timeRange}</Text>
                </View>
              </View>

              {/* Neutral Card for Hub, Break & Duration */}
              <View style={styles.sheetNeutralCard}>
                <View style={styles.sheetField}>
                  <Text style={styles.sheetFieldLabel}>Assigned hub</Text>
                  <Text style={styles.sheetFieldValue}>{shift.hub}</Text>
                  {shift.hubAddress ? (
                    <Text style={styles.sheetFieldSub}>{shift.hubAddress}</Text>
                  ) : null}
                </View>

                <View style={styles.sheetFieldDivider} />

                <View style={styles.sheetFieldRow}>
                  <View style={styles.sheetFieldCol}>
                    <Text style={styles.sheetFieldLabel}>Break</Text>
                    <Text style={styles.sheetFieldValue}>{shift.breakDuration || '1 hour'}</Text>
                  </View>
                  <View style={styles.sheetFieldCol}>
                    <Text style={styles.sheetFieldLabel}>Scheduled duration</Text>
                    <Text style={styles.sheetFieldValue}>{shift.duration}</Text>
                  </View>
                </View>
              </View>
            </>
          )}

          {/* Close Button */}
          <TouchableOpacity
            style={styles.sheetCloseButton}
            onPress={onClose}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="Close shift details"
          >
            <Text style={styles.sheetCloseButtonText}>Close</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
};
