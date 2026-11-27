import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { colors } from '../../../theme/colors';
import { KudiIcon } from '../../../components/KudiIcon';
import { subviewStyles as styles } from './profileSubviews.styles';
import { isValidCoordinatePair } from '../../../utils/geospatial';

interface StoreSubviewProps {
  assignedHub?: {
    id?: string;
    name: string;
    locality?: string;
    address: string;
    lat?: number | null;
    lng?: number | null;
    deliveryMinutes?: number;
  } | null;
  assignedStore?: {
    name: string;
    address: string;
  } | null;
  supportPhone?: string | null;
  navigation?: any;
}

export const StoreSubview: React.FC<StoreSubviewProps> = ({
  assignedHub,
  assignedStore,
  supportPhone,
  navigation,
}) => {
  const storeName = assignedHub?.name || assignedStore?.name || 'No Darkstore Assigned';
  const storeAddress =
    assignedHub?.address ||
    assignedStore?.address ||
    'Assigned hub address will appear once dispatch links your active hub.';
  const localityLabel = assignedHub?.locality || 'Hub Dispatch Zone';
  const hasHub = Boolean(assignedHub?.name || assignedStore?.name);
  const canNavigateToHub = hasHub && isValidCoordinatePair(assignedHub?.lat, assignedHub?.lng);

  const handleNavigate = () => {
    if (!canNavigateToHub) return;
    navigation?.navigate?.('InAppMap', {
      title: storeName,
      destinationLabel: storeName,
      destinationAddress: storeAddress,
      destination: {
        lat: assignedHub!.lat!,
        lng: assignedHub!.lng!,
      },
    });
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
          {hasHub && !canNavigateToHub ? (
            <Text style={[styles.smallSubtext, { marginTop: 4 }]}>
              Hub map coordinates pending configuration.
            </Text>
          ) : null}
        </View>
        {canNavigateToHub ? (
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
          <Text style={styles.rowValue}>{supportPhone || 'Configured via Support'}</Text>
        </View>

        <View style={[styles.row, styles.rowLast]}>
          <Text style={styles.rowLabel}>SLA Target</Text>
          <Text style={styles.rowValue}>
            {assignedHub?.deliveryMinutes ? `${assignedHub.deliveryMinutes} mins Express` : 'Standard SLA'}
          </Text>
        </View>
      </View>
    </>
  );
};
