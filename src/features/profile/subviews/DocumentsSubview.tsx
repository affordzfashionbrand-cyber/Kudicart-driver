import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Linking, Platform } from 'react-native';
import { colors } from '../../../theme/colors';
import { KudiIcon } from '../../../components/KudiIcon';
import { toast } from '../../../store/useToastStore';
import { profileApi } from '../../../api';
import { getFriendlyErrorMessage } from '../../../utils/errorHandling';
import { subviewStyles as styles } from './profileSubviews.styles';
import { DocumentViewerModal } from './DocumentViewerModal';

export interface DocItem {
  id: string;
  docType: 'drivingLicence' | 'aadhaar' | 'pan' | 'vehicleRc' | 'selfie';
  title: string;
  rawNumber: string;
  maskedNumber: string;
  status: string;
  description: string;
  frontUrl?: string | null;
  backUrl?: string | null;
  mimeType?: string;
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
  const s = (rawStatus || '').trim().toLowerCase();
  if (
    !s ||
    s.includes('not_upload') ||
    s.includes('not upload') ||
    s.includes('not_submit') ||
    s.includes('missing')
  ) {
    return {
      label: 'Not uploaded',
      badgeBg: '#F3F4F6',
      badgeBorder: '#E5E7EB',
      textColor: '#6B7280',
      iconName: 'info-circle' as const,
    };
  }
  if ((s.includes('verif') || s.includes('approv')) && !s.includes('pending') && !s.includes('under')) {
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
      label: 'Rejected',
      badgeBg: '#FEF2F2',
      badgeBorder: '#FECACA',
      textColor: '#B91C1C',
      iconName: 'alert-circle' as const,
    };
  }
  if (s.includes('pending') && !s.includes('under')) {
    return {
      label: 'Pending',
      badgeBg: '#FFFBEB',
      badgeBorder: '#FDE68A',
      textColor: '#B45309',
      iconName: 'clock' as const,
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
  const [viewerDoc, setViewerDoc] = useState<DocItem | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [docError, setDocError] = useState<string | null>(null);

  const handleViewDoc = (doc: DocItem) => {
    setDocError(null);
    if (!doc.frontUrl && !doc.backUrl) return;
    setViewerDoc(doc);
  };

  const handleDownloadDoc = async (doc: DocItem, side?: 'front' | 'back') => {
    const resolvedSide: 'front' | 'back' =
      side || (doc.frontUrl ? 'front' : doc.backUrl ? 'back' : 'front');

    if (!doc.frontUrl && !doc.backUrl) return;

    setDocError(null);
    setDownloadingId(doc.id);
    try {
      if (Platform.OS === 'web') {
        const file = await profileApi.fetchDocumentFile(doc.docType, resolvedSide, true);
        if (file.blob && typeof document !== 'undefined' && typeof URL !== 'undefined') {
          const objUrl = URL.createObjectURL(file.blob);
          const a = document.createElement('a');
          a.href = objUrl;
          a.download = file.fileName || `${doc.docType}_${resolvedSide}`;
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(objUrl), 2500);
          toast.success(`${doc.title} saved.`, { dedupeKey: `doc-dl:${doc.id}` });
          return;
        }
      }

      const rawUrl = resolvedSide === 'back' ? doc.backUrl : doc.frontUrl;
      const downloadUrl =
        rawUrl && /^https?:\/\//i.test(rawUrl)
          ? rawUrl
          : profileApi.getDocumentFileUrl(doc.docType, resolvedSide, true);
      await Linking.openURL(downloadUrl);
    } catch (err: any) {
      setDocError(getFriendlyErrorMessage(err, `Unable to download ${doc.title}. Please try again.`));
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <>
      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>Uploaded Documents</Text>

        {docError ? (
          <View
            accessibilityRole="alert"
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              backgroundColor: '#FEF2F2',
              borderWidth: 1,
              borderColor: '#FECACA',
              borderRadius: 10,
              padding: 10,
              marginBottom: 12,
            }}
          >
            <KudiIcon name="alert-circle" size={16} color="#DC2626" />
            <Text style={{ flex: 1, fontSize: 12.5, fontWeight: '600', color: '#991B1B' }}>
              {docError}
            </Text>
          </View>
        ) : null}

        {documentsList.map((doc, idx) => {
          const statusConfig = getDocStatusConfig(doc.status);
          const isLast = idx === documentsList.length - 1;
          const hasFile = Boolean(doc.frontUrl || doc.backUrl);
          const isBusy = downloadingId === doc.id;

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
                    style={[
                      styles.docDownloadBtn,
                      !hasFile && { opacity: 0.45 },
                    ]}
                    onPress={() => handleViewDoc(doc)}
                    disabled={!hasFile}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`View ${doc.title}`}
                  >
                    <KudiIcon name="eye" size={16} color={colors.text} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.docDownloadBtn,
                      !hasFile && { opacity: 0.45 },
                    ]}
                    onPress={() => void handleDownloadDoc(doc)}
                    disabled={!hasFile || isBusy}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`Download ${doc.title}`}
                  >
                    {isBusy ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <KudiIcon name="download" size={16} color={colors.primary} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </View>

      <DocumentViewerModal
        visible={Boolean(viewerDoc)}
        doc={viewerDoc}
        onClose={() => setViewerDoc(null)}
        onDownload={(d, s) => void handleDownloadDoc(d, s)}
      />
    </>
  );
};
