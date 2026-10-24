import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { colors } from '../../theme/colors';
import { useDriverStore, DocumentsProfile, DocumentFile } from '../../store/useDriverStore';
import { useAuthStore } from '../../store/useAuthStore';
import { pickFile } from '../../utils/filePicker';
import logo from '../../assets/logo.png';
import { KudiIcon } from '../../components/KudiIcon';
import { toast } from '../../store/useToastStore';


export const DocumentUploadDetailScreen = ({ route, navigation }: any) => {
  const { docType, title } = route.params as { docType: keyof Omit<DocumentsProfile, 'selfie'>; title: string };
  const { documents, updateDocument } = useDriverStore();
  const { kycStatus } = useAuthStore();
  const isRejectedDoc = kycStatus === 'REJECTED' && (docType === 'drivingLicence' || docType === 'vehicleRc');
  
  // Local state initialized with store values
  const docState = documents[docType];
  const [frontFile, setFrontFile] = useState<DocumentFile | null>(docState?.front ?? null);
  const [backFile, setBackFile] = useState<DocumentFile | null>(docState?.back ?? null);

  const [uploadingSide, setUploadingSide] = useState<'front' | 'back' | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ front: number; back: number }>({ front: 0, back: 0 });
  const [uploadError, setUploadError] = useState<{ front: string | null; back: string | null }>({ front: null, back: null });

  const validateFile = (file: DocumentFile): string | null => {
    // 1. File size check (Max 5MB)
    const sizeMatch = file.size.match(/([0-9.]+)\s*MB/i);
    if (sizeMatch) {
      const sizeMb = parseFloat(sizeMatch[1]);
      if (sizeMb > 5.0) {
        return 'File size exceeds 5MB limit. Please choose a smaller file.';
      }
    }

    // 2. File type check (JPG, PNG, PDF)
    const validExtensions = /\.(jpg|jpeg|png|webp|pdf)$/i;
    const validMimes = /(image\/(jpeg|png|webp)|application\/pdf)/i;
    const isNameValid = validExtensions.test(file.name);
    const isTypeValid = !file.type || validMimes.test(file.type);

    if (!isNameValid && !isTypeValid) {
      return 'Unsupported format. Please upload JPG, PNG, or PDF.';
    }

    return null;
  };

  const handleSelectFile = async (side: 'front' | 'back') => {
    setUploadError(prev => ({ ...prev, [side]: null }));

    try {
      const file = await pickFile();
      if (!file) return;

      const error = validateFile(file);
      if (error) {
        setUploadError(prev => ({ ...prev, [side]: error }));
        toast.error(error);
        return;
      }


      // Simulate upload progression for tactile feedback
      setUploadingSide(side);
      setUploadProgress(prev => ({ ...prev, [side]: 30 }));

      setTimeout(() => {
        setUploadProgress(prev => ({ ...prev, [side]: 75 }));
        setTimeout(() => {
          setUploadProgress(prev => ({ ...prev, [side]: 100 }));
          setUploadingSide(null);
          if (side === 'front') setFrontFile(file);
          else setBackFile(file);
        }, 200);
      }, 200);
    } catch (e) {
      setUploadingSide(null);
      setUploadError(prev => ({ ...prev, [side]: 'Upload failed. Tap to retry.' }));
      toast.error('Upload failed. Tap to retry.');
    }
  };


  const handleRemove = (side: 'front' | 'back') => {
    setUploadError(prev => ({ ...prev, [side]: null }));
    if (side === 'front') setFrontFile(null);
    else setBackFile(null);
  };

  const handleSave = () => {
    // Both front and back are required to save
    if (!frontFile || !backFile) {
      toast.warning('Both front and back images are required.');
      return;
    }

    updateDocument(docType, 'front', frontFile);
    updateDocument(docType, 'back', backFile);
    toast.success(`${title} saved successfully.`);
    navigation.goBack();
  };


  const isBothUploaded = Boolean(frontFile && backFile);

  const renderUploadZone = (side: 'front' | 'back') => {
    const file = side === 'front' ? frontFile : backFile;
    const sideTitle = side === 'front' ? 'Front Side' : 'Back Side';
    const isUploading = uploadingSide === side;
    const errorMsg = uploadError[side];

    return (
      <View style={styles.uploadSection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>{sideTitle} <Text style={styles.requiredStar}>*</Text></Text>
          <View style={[styles.sideBadge, file ? styles.sideBadgeSuccess : styles.sideBadgePending]}>
            <Text style={[styles.sideBadgeText, file ? styles.sideBadgeTextSuccess : styles.sideBadgeTextPending]}>
              {file ? '✓ Uploaded' : 'Required'}
            </Text>
          </View>
        </View>
        
        {isUploading ? (
          <View style={styles.uploadingBox}>
            <KudiIcon name="refresh" color={colors.primary} size={22} />
            <View style={styles.fileInfo}>
              <Text style={styles.uploadingTitle}>Uploading {sideTitle.toLowerCase()}…</Text>
              <Text style={styles.uploadingMeta}>{uploadProgress[side]}% completed</Text>
            </View>
          </View>
        ) : !file ? (
          <TouchableOpacity
            style={[styles.emptyFileBox, errorMsg ? styles.dropZoneError : null]}
            onPress={() => handleSelectFile(side)}
            activeOpacity={0.7}
          >
            <View style={styles.emptyIconBox}>
              <KudiIcon name="document" color={errorMsg ? colors.danger : colors.textSecondary} size={24} />
            </View>
            <View style={styles.fileInfo}>
              <Text style={styles.emptyTitle}>Tap to select and upload</Text>
              <Text style={styles.uploadHintText}>JPG, PNG or PDF · Max 5MB</Text>
            </View>
            <KudiIcon name="chevron-right" color="#8A8781" size={18} />
          </TouchableOpacity>
        ) : (
          <View style={styles.selectedFileBox}>
            <View style={styles.fileIconBox}>
              <KudiIcon name="check-circle" color={colors.success} size={22} />
            </View>
            <View style={styles.fileInfo}>
              <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
              <Text style={styles.fileMeta}>{file.size} · Uploaded</Text>
            </View>
            <TouchableOpacity onPress={() => handleSelectFile(side)} style={styles.iconButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <KudiIcon name="edit" color={colors.textSecondary} size={18} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleRemove(side)} style={[styles.iconButton, { marginLeft: spacing.s }]} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <KudiIcon name="trash" color={colors.danger} size={18} />
            </TouchableOpacity>
          </View>
        )}

        {errorMsg ? (
          <View style={styles.errorRow}>
            <Text style={styles.errorText}>{errorMsg}</Text>
            <TouchableOpacity onPress={() => handleSelectFile(side)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <KudiIcon name="arrow-left" color={colors.primary} size={24} />
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <Image source={logo} style={styles.logo} resizeMode="contain" />
            </View>
            <View style={styles.backButtonPlaceholder} />
          </View>

          <View style={styles.content}>
            <Text style={styles.stepText}>DOCUMENT UPLOAD</Text>

            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>
              Upload the front and back of your {title}. Ensure the images are clear and readable.
            </Text>

            {isRejectedDoc && (
              <View style={styles.issueCard}>
                <View style={styles.issueHeader}>
                  <KudiIcon name="alert-circle" color={colors.danger} size={18} />
                  <Text style={styles.issueTitle}>Action required</Text>
                </View>
                <Text style={styles.issueDescription}>
                  {docType === 'drivingLicence'
                    ? 'Previous photo was blurry or edges were cropped. Please upload a clear, glare-free photo of your Driving Licence.'
                    : 'Vehicle registration details could not be matched. Please upload a clear photo of your Vehicle RC matching KA 05 MJ 4821.'}
                </Text>
              </View>
            )}

            {/* Clear Sides Feedback Card */}
            <View style={styles.sidesStatusCard}>
              <Text style={styles.sidesStatusTitle}>Required Document Sides</Text>
              
              <View style={styles.sidesStatusItem}>
                <View style={[styles.statusDot, frontFile ? styles.dotSuccess : styles.dotPending]} />
                <Text style={styles.sidesStatusLabel}>Front side</Text>
                <Text style={[styles.sidesStatusValue, frontFile ? styles.textSuccess : styles.textPending]}>
                  {frontFile ? 'Uploaded' : 'Not uploaded'}
                </Text>
              </View>

              <View style={styles.sidesStatusDivider} />

              <View style={styles.sidesStatusItem}>
                <View style={[styles.statusDot, backFile ? styles.dotSuccess : styles.dotPending]} />
                <Text style={styles.sidesStatusLabel}>Back side</Text>
                <Text style={[styles.sidesStatusValue, backFile ? styles.textSuccess : styles.textPending]}>
                  {backFile ? 'Uploaded' : 'Not uploaded'}
                </Text>
              </View>
            </View>

            {renderUploadZone('front')}
            {renderUploadZone('back')}
          </View>

          <View style={styles.footer}>
            <PrimaryButton 
              title="Save & Continue" 
              onPress={handleSave} 
              disabled={!isBothUploaded} 
              style={[
                styles.continueButton,
                isBothUploaded ? styles.continueButtonActive : styles.continueButtonDisabled
              ]}
              textStyle={[
                styles.continueButtonText,
                isBothUploaded ? styles.continueButtonTextActive : styles.continueButtonTextDisabled
              ]}
            />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  keyboardAvoid: { flex: 1 },
  scrollContainer: {
    paddingHorizontal: spacing.l,
    paddingTop: spacing.m,
    paddingBottom: 8,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.m,
    marginBottom: spacing.s,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  logoContainer: { flex: 1, alignItems: 'center' },
  logo: { width: 140, height: 40 },
  backButtonPlaceholder: { width: 40 },
  
  content: { marginTop: spacing.xs },
  stepText: {
    ...typography.caption,
    letterSpacing: 0.5,
    marginBottom: 6,
    color: colors.primary,
    fontWeight: '700',
  },
  title: {
    ...typography.h1,
    fontWeight: '700',
    color: '#1A2C5B',
    marginBottom: 6,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: 20,
  },

  // Sides Status Card
  sidesStatusCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E2DED7',
    borderRadius: 16,
    padding: spacing.m,
    marginBottom: 22,
  },
  sidesStatusTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  sidesStatusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  dotSuccess: {
    backgroundColor: colors.success,
  },
  dotPending: {
    backgroundColor: '#8A8781',
  },
  sidesStatusLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#1A2C5B',
  },
  sidesStatusValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  textSuccess: {
    color: colors.success,
  },
  textPending: {
    color: '#65635F',
  },
  sidesStatusDivider: {
    height: 1,
    backgroundColor: '#F3F1EC',
    marginVertical: 8,
  },

  // Upload Section
  uploadSection: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A2C5B',
  },
  requiredStar: {
    color: colors.danger,
  },
  sideBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sideBadgeSuccess: {
    backgroundColor: '#E8F5E9',
  },
  sideBadgePending: {
    backgroundColor: '#F3F1EC',
  },
  sideBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  sideBadgeTextSuccess: {
    color: colors.success,
  },
  sideBadgeTextPending: {
    color: '#65635F',
  },
  
  // Empty State
  emptyFileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E2DED7',
    borderRadius: 16,
    padding: spacing.m,
  },
  emptyIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F8F6F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
  },
  fileInfo: {
    flex: 1,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A2C5B',
    marginBottom: 2,
  },
  uploadHintText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  dropZoneError: {
    borderColor: colors.danger,
    borderWidth: 1.5,
  },

  // Uploading State
  uploadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0E8',
    borderWidth: 1,
    borderColor: '#FFD8C2',
    borderRadius: 16,
    padding: spacing.m,
  },
  uploadingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 2,
  },
  uploadingMeta: {
    fontSize: 12,
    color: colors.primaryDark,
  },

  // Selected State
  selectedFileBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E2DED7',
    borderRadius: 16,
    padding: spacing.m,
  },
  fileIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.m,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A2C5B',
    marginBottom: 2,
  },
  fileMeta: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '500',
  },
  iconButton: {
    padding: spacing.xs,
  },

  // Error Row
  errorRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingHorizontal: 4,
  },
  errorText: {
    fontSize: 12,
    color: colors.danger,
    flex: 1,
  },
  retryText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 8,
  },

  footer: {
    marginTop: 24,
    alignItems: 'center',
    marginBottom: 0,
  },
  continueButton: {
    height: 52,
    borderRadius: 16,
    width: '100%',
  },
  continueButtonDisabled: {
    backgroundColor: '#E2DED7',
  },
  continueButtonActive: {
    backgroundColor: '#FF5A1F',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  continueButtonTextDisabled: {
    color: '#65635F',
  },
  continueButtonTextActive: {
    color: '#171716',
  },

  issueCard: {
    backgroundColor: '#FFF1F0',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  issueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  issueTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.danger,
  },
  issueDescription: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },
});
