import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { colors } from '../../../theme/colors';
import { KudiIcon } from '../../../components/KudiIcon';
import { toast } from '../../../store/useToastStore';
import { subviewStyles as styles } from './profileSubviews.styles';

interface StoreSubviewProps {
  assignedHub?: {
    id?: string;
    name: string;
    locality?: string;
    address: string;
    deliveryMinutes?: number;
  } | null;
  assignedStore?: {
    name: string;
    address: string;
  } | null;
}

export const StoreSubview: React.FC<StoreSubviewProps> = ({ assignedHub, assignedStore }) => {
  const storeName = assignedHub?.name || assignedStore?.name || 'No Darkstore Assigned';
  const storeAddress =
    assignedHub?.address ||
    assignedStore?.address ||
    'Assigned hub address will appear once dispatch links your active hub.';
  const localityLabel = assignedHub?.locality || 'Hub Dispatch Zone';
  const hasHub = Boolean(assignedHub?.name || assignedStore?.name);

  const handleNavigate = () => {
    if (!hasHub || !assignedHub?.address && !assignedStore?.address) {
      toast.info('Hub address is not configured yet.');
      return;
    }
    const query = encodeURIComponent(storeAddress);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`).catch(() =>
      toast.info('Opening directions to assigned darkstore hub...')
    );
  };

  return (
    <>
      <View style={styles.bannerCard}>
        <View style={styles.bannerIconWrap}>
          <KudiIcon name="home" size={24} color={colors.primary} />
        </View>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.bannerTitle}>{storeName}</Text>
          <Text style={styles.bannerSubtitle}>{storeAddress}</Text>
        </View>
        {hasHub ? (
          <TouchableOpacity
            style={styles.storeNavIconBtn}
            onPress={handleNavigate}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Navigate to darkstore"
          >
            <KudiIcon name="navigation" size={18} color={colors.primary} />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>Hub Operations</Text>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Locality / Zone</Text>
          <Text style={[styles.rowValue, { color: colors.primary }]}>{localityLabel}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Support Helpline</Text>
          <Text style={styles.rowValue}>1800-419-5834</Text>
        </View>

        <View style={[styles.row, styles.rowLast]}>
          <Text style={styles.rowLabel}>SLA Target</Text>
          <Text style={styles.rowValue}>
            {assignedHub?.deliveryMinutes ? `${assignedHub.deliveryMinutes} mins Express` : '18 mins Express'}
          </Text>
        </View>
      </View>
    </>
  );
};
