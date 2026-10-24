import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { colors } from '../../../theme/colors';
import { toast } from '../../../store/useToastStore';
import { subviewStyles as styles } from './profileSubviews.styles';

export const StarSubview: React.FC = () => {
  return (
    <>
      <View style={styles.goldBanner}>
        <Text style={{ fontSize: 32 }}>🌟</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.goldTitle}>Gold Partner Tier</Text>
          <Text style={styles.goldSubtitle}>
            4.92 ★ Rating • Top 5% Delivery Partners
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>Tier Benefits & Metrics</Text>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>On-Time Delivery Rate</Text>
          <Text style={[styles.rowValue, { color: '#16805A' }]}>98.4% (Excellent)</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Priority Dispatch</Text>
          <Text style={styles.rowValue}>Enabled</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Asset Security Deposit</Text>
          <Text style={styles.rowValue}>100% Waived</Text>
        </View>

        <View style={[styles.row, styles.rowLast]}>
          <Text style={styles.rowLabel}>Weekly Festival Bonus</Text>
          <Text style={styles.highlightValue}>Eligible (+₹500 / week)</Text>
        </View>
      </View>
    </>
  );
};

export const AssetsSubview: React.FC = () => {
  return (
    <>
      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>Issued Partner Equipment</Text>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Thermal Delivery Bag</Text>
          <Text style={styles.rowValue}>Issued (KC-BAG-4821)</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Partner T-Shirts</Text>
          <Text style={styles.rowValue}>2 Units Issued (Size: L)</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Reflective Safety Helmet</Text>
          <Text style={styles.rowValue}>Issued (DOT Certified)</Text>
        </View>

        <View style={[styles.row, styles.rowLast]}>
          <Text style={styles.rowLabel}>Refundable Deposit</Text>
          <Text style={styles.rowValue}>₹500.00 (Active)</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.primaryActionButton}
        onPress={() => toast.info('Asset replacement request logged. Hub team will contact you.')}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryActionButtonText}>Request Gear Replacement</Text>
      </TouchableOpacity>
    </>
  );
};

export const EvMarketplaceSubview: React.FC = () => {
  return (
    <>
      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>Electric Vehicle Partner Plans</Text>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>Bounce Infinity E1</Text>
            <Text style={styles.smallSubtext}>Unlimited battery swaps included</Text>
          </View>
          <Text style={styles.highlightValue}>₹149 / day</Text>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>Yulu Wynn XP</Text>
            <Text style={styles.smallSubtext}>Low-speed • No driving licence needed</Text>
          </View>
          <Text style={styles.highlightValue}>₹129 / day</Text>
        </View>

        <View style={[styles.row, styles.rowLast]}>
          <Text style={styles.rowLabel}>Nearby Battery Swaps</Text>
          <Text style={styles.rowValue}>3 Stations within 2.0 km</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.primaryActionButton}
        onPress={() => toast.success('EV Partner assistance details sent to your registered mobile.')}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryActionButtonText}>Inquire for Rental</Text>
      </TouchableOpacity>
    </>
  );
};
