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
            <Text style={styles.rowLabel}>10-Min Safe Riding Rules</Text>
            <Text style={styles.smallSubtext}>Traffic adherence and helmet protocols</Text>
          </View>
          <Text style={[styles.rowValue, { color: '#16805A' }]}>Completed ✅</Text>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>Bag Packing & Cold Chain</Text>
            <Text style={styles.smallSubtext}>Perishable grocery handling</Text>
          </View>
          <Text style={[styles.rowValue, { color: '#16805A' }]}>Completed ✅</Text>
        </View>

        <View style={[styles.row, styles.rowLast]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>Doorstep Delivery Etiquette</Text>
            <Text style={styles.smallSubtext}>Customer communication rules</Text>
          </View>
          <Text style={[styles.rowValue, { color: colors.primary }]}>In Progress 📚</Text>
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
}

export const CardSubview: React.FC<CardSubviewProps> = ({
  driverFullName,
  driverId,
  initials,
}) => {
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
            <Text style={styles.digitalCardHub}>Hub: HSR Darkstore</Text>
          </View>
        </View>

        <View style={styles.digitalCardFooter}>
          <Text style={styles.digitalCardFootText}>
            Blood Group: O+ • Emergency: +91 98765 43210
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.primaryActionButton}
        onPress={() => toast.success('Digital Partner Card saved to your photos.')}
        activeOpacity={0.8}
      >
        <Text style={styles.primaryActionButtonText}>Save Card to Phone</Text>
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

export interface LanguageSubviewProps {
  selectedLanguage: string;
  onSelectLanguage: (lang: string) => void;
}

export const LanguageSubview: React.FC<LanguageSubviewProps> = ({
  selectedLanguage,
  onSelectLanguage,
}) => {
  const languages = [
    { id: 'en', label: 'English (Default)' },
    { id: 'hi', label: 'हिंदी (Hindi)' },
    { id: 'kn', label: 'ಕನ್ನಡ (Kannada)' },
    { id: 'te', label: 'తెలుగు (Telugu)' },
    { id: 'ta', label: 'தமிழ் (Tamil)' },
    { id: 'mr', label: 'मराठी (Marathi)' },
  ];

  return (
    <View style={styles.card}>
      <Text style={styles.cardSectionTitle}>Select Preferred Language</Text>

      {languages.map((lang, index, arr) => {
        const isSelected = selectedLanguage === lang.label;
        return (
          <TouchableOpacity
            key={lang.id}
            style={[
              styles.languageRow,
              index === arr.length - 1 && styles.rowLast,
              isSelected && styles.languageRowSelected,
            ]}
            onPress={() => {
              onSelectLanguage(lang.label);
              toast.success(`Language updated to ${lang.label}`);
            }}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.languageText,
                isSelected && styles.languageTextSelected,
              ]}
            >
              {lang.label}
            </Text>
            {isSelected && <KudiIcon name="check" size={18} color={colors.primary} />}
          </TouchableOpacity>
        );
      })}
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
