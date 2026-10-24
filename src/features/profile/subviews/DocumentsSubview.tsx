import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { colors } from '../../../theme/colors';
import { KudiIcon } from '../../../components/KudiIcon';
import { toast } from '../../../store/useToastStore';
import { subviewStyles as styles } from './profileSubviews.styles';

export interface DocItem {
  id: string;
  title: string;
  rawNumber: string;
  maskedNumber: string;
  status: string;
  description: string;
}

export const maskDl = (dl?: string) => {
  if (!dl) return 'Not available';
  const clean = dl.replace(/\s+/g, '');
  if (clean.length < 8) return dl;
  return `${clean.slice(0, 5)} •••••• ${clean.slice(-4)}`;
};

export const maskAadhaar = (aadhaar?: string) => {
  if (!aadhaar) return 'Not available';
  const clean = aadhaar.replace(/\s+/g, '');
  if (clean.length < 4) return aadhaar;
  return `•••• •••• ${clean.slice(-4)}`;
};

export const maskPan = (pan?: string) => {
  if (!pan) return 'Not available';
  const clean = pan.replace(/\s+/g, '');
  if (clean.length < 5) return pan;
  return `${clean.slice(0, 5)} •••• ${clean.slice(-1)}`;
};

export const getDocStatusConfig = (rawStatus?: string) => {
  const s = (rawStatus || '').toLowerCase();
  if (s.includes('verif') && !s.includes('pending')) {
    return {
      label: 'Verified',
      badgeBg: '#EDFDF5',
      badgeBorder: '#A7F3D0',
      textColor: '#16805A',
      iconName: 'check-circle' as const,
    };
  }
  if (s.includes('action') || s.includes('reject') || s.includes('fail')) {
    return {
      label: 'Action required',
      badgeBg: '#FEF2F2',
      badgeBorder: '#FECACA',
      textColor: '#B91C1C',
      iconName: 'alert-circle' as const,
    };
  }
  if (s.includes('not') || s.includes('missing')) {
    return {
      label: 'Not uploaded',
      badgeBg: '#F3F4F6',
      badgeBorder: '#E5E7EB',
      textColor: '#6B7280',
      iconName: 'info-circle' as const,
    };
  }
  return {
    label: 'Under review',
    badgeBg: '#F3F1EC',
    badgeBorder: '#E2DED7',
    textColor: '#65635F',
    iconName: 'clock' as const,
  };
};

interface DocumentsSubviewProps {
  documentsList: DocItem[];
}

export const DocumentsSubview: React.FC<DocumentsSubviewProps> = ({ documentsList }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.cardSectionTitle}>Uploaded Documents</Text>

      {documentsList.map((doc, idx) => {
        const statusConfig = getDocStatusConfig(doc.status);
        const isLast = idx === documentsList.length - 1;

        return (
          <View
            key={doc.id}
            style={[styles.docItemBox, isLast && styles.docItemBoxLast]}
          >
            <View style={styles.docItemHeader}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.docItemTitle}>{doc.title}</Text>
                <Text style={styles.smallSubtext}>{doc.maskedNumber}</Text>
              </View>

              <View style={styles.docRightRow}>
                <View
                  style={[
                    styles.statusPill,
                    {
                      backgroundColor: statusConfig.badgeBg,
                      borderColor: statusConfig.badgeBorder,
                    },
                  ]}
                >
                  <KudiIcon
                    name={statusConfig.iconName}
                    size={12}
                    color={statusConfig.textColor}
                  />
                  <Text
                    style={[
                      styles.statusPillText,
                      { color: statusConfig.textColor },
                    ]}
                  >
                    {statusConfig.label}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.docDownloadBtn}
                  onPress={() => toast.success(`Downloading ${doc.title}...`)}
                  activeOpacity={0.7}
                  accessibilityRole="button"
                  accessibilityLabel={`Download ${doc.title}`}
                >
                  <KudiIcon name="download" size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
};
