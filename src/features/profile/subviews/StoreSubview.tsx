import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { colors } from '../../../theme/colors';
import { KudiIcon } from '../../../components/KudiIcon';
import { toast } from '../../../store/useToastStore';
import { subviewStyles as styles } from './profileSubviews.styles';

interface StoreSubviewProps {
  assignedStore?: {
    name: string;
    address: string;
  };
}

export const StoreSubview: React.FC<StoreSubviewProps> = ({ assignedStore }) => {
  const storeName = assignedStore?.name || 'KudiCart Darkstore';
  const storeAddress = assignedStore?.address || 'HSR Sector 2, 12th Main Road, Bengaluru — 560102';

  const handleNavigate = () => {
    const query = encodeURIComponent(storeAddress);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`).catch(() =>
      toast.info('Opening directions to KudiCart Darkstore...')
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
        <TouchableOpacity
          style={styles.storeNavIconBtn}
          onPress={handleNavigate}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Navigate to darkstore"
        >
          <KudiIcon name="navigation" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>Hub Management & Operations</Text>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Hub In-Charge</Text>
          <Text style={styles.rowValue}>Vikas Rao (Lead Supervisor)</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Hub Contact</Text>
          <Text style={styles.rowValue}>+91 98451 22890</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Operating Hours</Text>
          <Text style={styles.rowValue}>06:00 AM – 11:30 PM (Daily)</Text>
        </View>

        <View style={[styles.row, styles.rowLast]}>
          <Text style={styles.rowLabel}>Assigned Fleet Zone</Text>
          <Text style={[styles.rowValue, { color: colors.primary }]}>Zone B-4 (HSR & Koramangala)</Text>
        </View>
      </View>
    </>
  );
};
