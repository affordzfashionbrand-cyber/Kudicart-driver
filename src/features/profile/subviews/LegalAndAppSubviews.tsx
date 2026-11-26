import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { colors } from '../../../theme/colors';
import { KudiIcon } from '../../../components/KudiIcon';
import { toast } from '../../../store/useToastStore';
import { subviewStyles as styles } from './profileSubviews.styles';

export const AcademySubview: React.FC = () => {
  return (
    <>
      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>Training & Safety Modules</Text>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>18-Min Express Safe Riding</Text>
            <Text style={styles.smallSubtext}>Traffic adherence and helmet protocols</Text>
          </View>
          <Text style={[styles.rowValue, { color: '#16805A' }]}>Completed</Text>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>Apparel Care &amp; Seal Integrity</Text>
            <Text style={styles.smallSubtext}>Garment bag handling &amp; barcode scan rules</Text>
          </View>
          <Text style={[styles.rowValue, { color: '#16805A' }]}>Completed</Text>
        </View>

        <View style={[styles.row, styles.rowLast]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>Try &amp; Buy Doorstep Etiquette</Text>
            <Text style={styles.smallSubtext}>10-min trial handover &amp; return verification</Text>
          </View>
          <Text style={[styles.rowValue, { color: colors.primary }]}>Required</Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.primaryActionButton}
        onPress={() => toast.info('Academy video module loaded.')}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryActionButtonText}>Continue Learning</Text>
      </TouchableOpacity>
    </>
  );
};

export interface CardSubviewProps {
  driverFullName: string;
  driverId: string;
  initials: string;
  hubName?: string;
  phone?: string;
}

export const CardSubview: React.FC<CardSubviewProps> = ({
  driverFullName,
  driverId,
  initials,
  hubName,
  phone,
}) => {
  return (
    <>
      <View style={styles.digitalCardWrap}>
        <View style={styles.digitalCardHeader}>
          <Text style={styles.digitalCardBrand}>AFFORDZ PARTNER</Text>
          <View style={styles.digitalCardDot} />
        </View>

        <View style={styles.digitalCardBody}>
          <View style={styles.digitalCardAvatar}>
            <Text style={styles.digitalCardAvatarText}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.digitalCardName}>{driverFullName}</Text>
            <Text style={styles.digitalCardId}>ID: {driverId || 'Pending'}</Text>
            <Text style={styles.digitalCardHub}>Hub: {hubName || 'Unassigned'}</Text>
          </View>
        </View>

        <View style={styles.digitalCardFooter}>
          <Text style={styles.digitalCardFootText}>
            Partner Contact: {phone || 'Not linked'} • Helpline: 1800-419-5834
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.primaryActionButton}
        onPress={() => toast.info('Digital Partner Card is active for in-person hub verification.')}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryActionButtonText}>Verified Digital ID</Text>
      </TouchableOpacity>
    </>
  );
};

export const AboutSubview: React.FC<{ navigation?: any }> = ({ navigation }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.cardSectionTitle}>Application Details</Text>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>App Version</Text>
        <Text style={styles.rowValue}>v2.4.1 (Build 142)</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Release Channel</Text>
        <Text style={styles.rowValue}>Production (Google Play)</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>Partner Model</Text>
        <Text style={styles.rowValue}>10-Minute Quick Commerce</Text>
      </View>

      <TouchableOpacity
        style={styles.row}
        onPress={() => {
          if (navigation?.navigate) {
            navigation.navigate('DevicePermissionSetup', { returnTo: 'Profile' });
          } else {
            toast.info('Opening Device Permissions...');
          }
        }}
      >
        <Text style={styles.rowLabel}>Device & App Permissions</Text>
        <Text style={[styles.rowValue, { color: colors.primary }]}>Configure ›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.row}
        onPress={() => {
          if (navigation?.navigate) {
            navigation.navigate('TermsAndConditions');
          } else {
            toast.info('Opening Terms of Service...');
          }
        }}
      >
        <Text style={styles.rowLabel}>Terms of Service</Text>
        <Text style={[styles.rowValue, { color: colors.primary }]}>View Agreement ›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.row, styles.rowLast]}
        onPress={() => {
          if (navigation?.navigate) {
            navigation.navigate('PrivacyPolicy');
          } else {
            toast.info('Opening Privacy Policy...');
          }
        }}
      >
        <Text style={styles.rowLabel}>Privacy Policy</Text>
        <Text style={[styles.rowValue, { color: colors.primary }]}>View Policy ›</Text>
      </TouchableOpacity>
    </View>
  );
};

export const DefaultFallbackSubview: React.FC = () => {
  return (
    <View style={styles.card}>
      <Text style={styles.bodyText}>Information for this section will be available soon.</Text>
    </View>
  );
};
