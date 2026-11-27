import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { colors } from '../../../theme/colors';
import { APP_NAME, APP_VERSION } from '../../../config/appInfo';
import { useDriverStore } from '../../../store/useDriverStore';
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

      <View
        style={{
          backgroundColor: '#FFF7F2',
          borderWidth: 1,
          borderColor: '#FED7AA',
          borderRadius: 12,
          padding: 12,
        }}
      >
        <Text style={{ fontSize: 12.5, fontWeight: '600', color: '#9A3412' }}>
          In-app training video modules are assigned during onboarding or via your hub trainer.
        </Text>
      </View>
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
  const supportPhone = useDriverStore((s) => s.supportConfig?.phone);
  return (
    <>
      <View style={styles.digitalCardWrap}>
        <View style={styles.digitalCardHeader}>
          <Text style={styles.digitalCardBrand}>KUDICART PARTNER</Text>
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
            Partner Contact: {phone || 'Not linked'}
            {supportPhone ? ` • Helpline: ${supportPhone}` : ''}
          </Text>
        </View>
      </View>

      <View
        style={{
          backgroundColor: '#EDFDF5',
          borderWidth: 1,
          borderColor: '#A7F3D0',
          borderRadius: 12,
          paddingVertical: 12,
          paddingHorizontal: 14,
          alignItems: 'center',
        }}
      >
        <Text style={{ fontSize: 13.5, fontWeight: '700', color: '#16805A' }}>
          Verified Digital ID • Active for Hub Verification
        </Text>
      </View>
    </>
  );
};

export const AboutSubview: React.FC<{ navigation?: any }> = ({ navigation }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.cardSectionTitle}>Application Details</Text>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>App Name</Text>
        <Text style={styles.rowValue}>{APP_NAME}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.rowLabel}>App Version</Text>
        <Text style={styles.rowValue}>v{APP_VERSION}</Text>
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
        onPress={() => navigation?.navigate?.('DevicePermissionSetup', { returnTo: 'Profile' })}
      >
        <Text style={styles.rowLabel}>Device & App Permissions</Text>
        <Text style={[styles.rowValue, { color: colors.primary }]}>Configure ›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.row}
        onPress={() => navigation?.navigate?.('TermsAndConditions')}
      >
        <Text style={styles.rowLabel}>Terms of Service</Text>
        <Text style={[styles.rowValue, { color: colors.primary }]}>View Agreement ›</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.row, styles.rowLast]}
        onPress={() => navigation?.navigate?.('PrivacyPolicy')}
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
