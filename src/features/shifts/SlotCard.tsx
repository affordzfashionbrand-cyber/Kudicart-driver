import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { KudiIcon } from '../../components/KudiIcon';
import { SlotItem } from './slotsData';
import { styles } from './slots.styles';

interface SlotCardProps {
  slot: SlotItem;
  isLast: boolean;
  onToggleBooking: (slotId: string) => void;
}

export const SlotCard: React.FC<SlotCardProps> = ({ slot, isLast, onToggleBooking }) => {
  const isHighDemand = slot.demand.toLowerCase().includes('high');
  const isBooked = slot.status === 'BOOKED';
  const isFull = slot.status === 'FULL';
  const isLocked = slot.status === 'LOCKED';
  const isAvailable = slot.status === 'AVAILABLE';

  return (
    <View style={[styles.slotCard, isLast && styles.lastCard]}>
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
          {slot.bonusText ? <Text style={styles.slotBonus}> · {slot.bonusText}</Text> : null}
        </View>
      </View>

      {/* Action on the right */}
      {isBooked && (
        <TouchableOpacity
          style={styles.bookedBadge}
          onPress={() => onToggleBooking(slot.id)}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Slot booked. Tap to cancel booking"
        >
          <Text style={styles.bookedBadgeText}>Booked</Text>
        </TouchableOpacity>
      )}

      {isFull && (
        <View style={styles.fullBadge} accessibilityLabel="Slot is full">
          <Text style={styles.fullBadgeText}>Full</Text>
        </View>
      )}

      {isLocked && (
        <View style={styles.lockedBadge} accessibilityLabel="Slot is locked">
          <KudiIcon name="lock" size={12} color="#8A8781" />
          <Text style={styles.lockedBadgeText}>Locked</Text>
        </View>
      )}

      {isAvailable && (
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => onToggleBooking(slot.id)}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={`Book slot ${slot.timeRange}`}
        >
          <Text style={styles.bookButtonText}>Book</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
