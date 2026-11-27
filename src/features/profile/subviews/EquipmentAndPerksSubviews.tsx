import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { subviewStyles as styles } from './profileSubviews.styles';

interface StarSubviewProps {
  tier?: string;
  rating?: number;
  completedDeliveries?: number;
}

export const StarSubview: React.FC<StarSubviewProps> = ({
  tier = 'Partner Tier',
  rating = 0,
  completedDeliveries = 0,
}) => {
  return (
    <>
      <View style={styles.goldBanner}>
        <Text style={{ fontSize: 32 }}>🌟</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.goldTitle}>{tier}</Text>
          <Text style={styles.goldSubtitle}>
            {rating > 0 ? `${rating.toFixed(2)} ★ Rating` : 'Verified Partner'} • {completedDeliveries} Completed Deliveries
          </Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>Partner Metrics</Text>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Completed Deliveries</Text>
          <Text style={[styles.rowValue, { color: '#16805A' }]}>{completedDeliveries}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.rowLabel}>Current Rating</Text>
          <Text style={styles.rowValue}>{rating > 0 ? `${rating.toFixed(2)} / 5.0` : 'Pending reviews'}</Text>
        </View>

        <View style={[styles.row, styles.rowLast]}>
          <Text style={styles.rowLabel}>Tier Standing</Text>
          <Text style={styles.highlightValue}>{tier}</Text>
        </View>
      </View>
    </>
  );
};

export const AssetsSubview: React.FC = () => {
  const [notice, setNotice] = useState<string | null>(null);
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
        onPress={() =>
          setNotice(
            'Gear replacements are issued directly at your assigned hub or via Help & Support.',
          )
        }
        activeOpacity={0.8}
      >
        <Text style={styles.primaryActionButtonText}>Request Gear Replacement</Text>
      </TouchableOpacity>

      {notice ? (
        <Text style={[styles.smallSubtext, { marginTop: 10, textAlign: 'center' }]}>{notice}</Text>
      ) : null}
    </>
  );
};

export const EvMarketplaceSubview: React.FC = () => {
  const [notice, setNotice] = useState<string | null>(null);
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
        onPress={() =>
          setNotice('EV rental enrollment is coordinated through your hub supervisor or Help & Support.')
        }
        activeOpacity={0.8}
      >
        <Text style={styles.primaryActionButtonText}>Inquire for Rental</Text>
      </TouchableOpacity>

      {notice ? (
        <Text style={[styles.smallSubtext, { marginTop: 10, textAlign: 'center' }]}>{notice}</Text>
      ) : null}
    </>
  );
};
