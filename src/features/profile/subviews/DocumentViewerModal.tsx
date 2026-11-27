import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { KudiIcon } from '../../../components/KudiIcon';
import { colors } from '../../../theme/colors';
import { profileApi } from '../../../api';
import { getFriendlyErrorMessage } from '../../../utils/errorHandling';
import type { DocItem } from './DocumentsSubview';

interface DocumentViewerModalProps {
  visible: boolean;
  doc: DocItem | null;
  onClose: () => void;
  onDownload: (doc: DocItem, side: 'front' | 'back') => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  visible,
  doc,
  onClose,
  onDownload,
}) => {
  const [selectedSide, setSelectedSide] = useState<'front' | 'back'>('front');
  const [isLoading, setIsLoading] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [previewMime, setPreviewMime] = useState<string>('image/jpeg');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!visible || !doc) {
      setPreviewUri(null);
      setError(null);
      return;
    }

    const defaultSide: 'front' | 'back' = doc.frontUrl ? 'front' : doc.backUrl ? 'back' : 'front';
    setSelectedSide(defaultSide);
  }, [visible, doc]);

  useEffect(() => {
    if (!visible || !doc) return;

    const targetSide: 'front' | 'back' =
      selectedSide === 'back' && !doc.backUrl ? 'front' : selectedSide;
    const rawSideUrl = targetSide === 'back' ? doc.backUrl : doc.frontUrl;
    if (!rawSideUrl) {
      setPreviewUri(null);
      setError('No uploaded file found for this document side.');
      return;
    }

    let revokedUrl: string | null = null;
    let cancelled = false;
    setIsLoading(true);
    setError(null);

    profileApi
      .fetchDocumentFile(doc.docType, targetSide, false)
      .then((file) => {
        if (cancelled) return;
        setPreviewMime(file.mimeType);
        if (file.blob && typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
          const objUrl = URL.createObjectURL(file.blob);
          revokedUrl = objUrl;
          setPreviewUri(objUrl);
        } else {
          setPreviewUri(rawSideUrl);
        }
      })
      .catch((err: any) => {
        if (cancelled) return;
        if (/^https?:\/\//i.test(rawSideUrl)) {
          setPreviewUri(rawSideUrl);
          setPreviewMime(doc.mimeType || 'image/jpeg');
        } else {
          setError(getFriendlyErrorMessage(err, 'Unable to preview document file.'));
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
      if (revokedUrl && typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
        URL.revokeObjectURL(revokedUrl);
      }
    };
  }, [visible, doc, selectedSide]);

  if (!doc) return null;

  const isPdf = previewMime.toLowerCase().includes('pdf') || (previewUri || '').toLowerCase().endsWith('.pdf');
  const activeSide: 'front' | 'back' = selectedSide === 'back' && doc.backUrl ? 'back' : 'front';

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle} numberOfLines={1}>
                {doc.title}
              </Text>
              <Text style={styles.modalSubtitle}>{doc.maskedNumber}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityLabel="Close preview">
              <KudiIcon name="close" size={18} color="#171716" />
            </TouchableOpacity>
          </View>

          {doc.frontUrl && doc.backUrl ? (
            <View style={styles.sideTabs}>
              <TouchableOpacity
                style={[styles.sideTab, activeSide === 'front' && styles.sideTabActive]}
                onPress={() => setSelectedSide('front')}
              >
                <Text style={[styles.sideTabText, activeSide === 'front' && styles.sideTabTextActive]}>
                  Front Side
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sideTab, activeSide === 'back' && styles.sideTabActive]}
                onPress={() => setSelectedSide('back')}
              >
                <Text style={[styles.sideTabText, activeSide === 'back' && styles.sideTabTextActive]}>
                  Back Side
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <View style={styles.previewArea}>
            {isLoading ? (
              <View style={styles.centerBox}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.helperText}>Loading document preview...</Text>
              </View>
            ) : error ? (
              <View style={styles.centerBox}>
                <KudiIcon name="error-circle" size={32} color="#DC2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : previewUri && isPdf ? (
              Platform.OS === 'web' ? (
                <View style={styles.centerBox}>
                  <KudiIcon name="document" size={40} color={colors.primary} />
                  <Text style={styles.helperText}>PDF document ready</Text>
                  <TouchableOpacity
                    style={styles.openPdfBtn}
                    onPress={() => window.open(previewUri, '_blank', 'noopener,noreferrer')}
                  >
                    <Text style={styles.openPdfText}>Open PDF in Browser</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.centerBox}>
                  <KudiIcon name="document" size={40} color={colors.primary} />
                  <TouchableOpacity
                    style={styles.openPdfBtn}
                    onPress={() => Linking.openURL(previewUri).catch(() => {})}
                  >
                    <Text style={styles.openPdfText}>Open PDF Viewer</Text>
                  </TouchableOpacity>
                </View>
              )
            ) : previewUri ? (
              <Image source={{ uri: previewUri }} style={styles.previewImage} resizeMode="contain" />
            ) : (
              <View style={styles.centerBox}>
                <Text style={styles.helperText}>No document uploaded yet.</Text>
              </View>
            )}
          </View>

          <View style={styles.footerRow}>
            <TouchableOpacity style={styles.closeFooterBtn} onPress={onClose}>
              <Text style={styles.closeFooterText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.downloadFooterBtn}
              onPress={() => onDownload(doc, activeSide)}
            >
              <KudiIcon name="download" size={16} color="#FFFFFF" />
              <Text style={styles.downloadFooterText}>Download</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(23, 23, 22, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2DED7',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2DED7',
    gap: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#171716',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#65635F',
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3F1EC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sideTabs: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
    backgroundColor: '#FAF9F6',
    borderBottomWidth: 1,
    borderBottomColor: '#E2DED7',
  },
  sideTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2DED7',
  },
  sideTabActive: {
    backgroundColor: '#171716',
    borderColor: '#171716',
  },
  sideTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#65635F',
  },
  sideTabTextActive: {
    color: '#FFFFFF',
  },
  previewArea: {
    height: 320,
    backgroundColor: '#F3F1EC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 20,
  },
  helperText: {
    fontSize: 13,
    color: '#65635F',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 13,
    color: '#991B1B',
    textAlign: 'center',
    fontWeight: '600',
  },
  openPdfBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  openPdfText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  footerRow: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2DED7',
  },
  closeFooterBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2DED7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeFooterText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#171716',
  },
  downloadFooterBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  downloadFooterText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
