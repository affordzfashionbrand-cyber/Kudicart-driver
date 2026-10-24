import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors } from '../../theme/colors';
import { useDriverStore, DocumentsProfile, DocumentFile } from '../../store/useDriverStore';
import { useAuthStore } from '../../store/useAuthStore';
import { pickFile } from '../../utils/filePicker';
import logo from '../../assets/logo.png';
import { KudiIcon } from '../../components/KudiIcon';
import { toast } from '../../store/useToastStore';
import { profileApi } from '../../api';
import { styles } from './documentUploadDetail.styles';

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
    setUploadError((prev) => ({ ...prev, [side]: null }));

    try {
      const file = await pickFile();
      if (!file) return;

      const error = validateFile(file);
      if (error) {
        setUploadError((prev) => ({ ...prev, [side]: error }));
        toast.error(error);
        return;
      }

      setUploadingSide(side);
      setUploadProgress((prev) => ({ ...prev, [side]: 40 }));

      // Real upload to backend
      await profileApi.uploadDocument({
        docType: docType as any,
        side,
        fileUri: file.uri,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      });

      setUploadProgress((prev) => ({ ...prev, [side]: 100 }));
      setUploadingSide(null);
      if (side === 'front') setFrontFile(file);
      else setBackFile(file);
    } catch (e: any) {
      setUploadingSide(null);
      setUploadError((prev) => ({ ...prev, [side]: e?.message || 'Upload failed. Tap to retry.' }));
      toast.error(e?.message || 'Upload failed. Tap to retry.');
    }
  };

  const handleRemove = (side: 'front' | 'back') => {
    setUploadError((prev) => ({ ...prev, [side]: null }));
    if (side === 'front') setFrontFile(null);
    else setBackFile(null);
  };

  const handleSave = () => {
    // Both front and back are required to save
    if (!frontFile || !backFile) {
      toast.warning('Both front and back images are required.');
      return;
    }

    updateDocument(docType, {
      front: frontFile,
      back: backFile,
      status: 'UPLOADED',
    });

    toast.success(`${title} updated successfully.`);
    navigation.goBack();
  };

  const renderSideUploadSection = (side: 'front' | 'back', label: string) => {
    const file = side === 'front' ? frontFile : backFile;
    const isUploading = uploadingSide === side;
    const progress = uploadProgress[side];
    const error = uploadError[side];

    return (
      <View style={styles.uploadSection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>
            {label} <Text style={styles.requiredStar}>*</Text>
          </Text>
          <View style={[styles.sideBadge, file ? styles.sideBadgeSuccess : styles.sideBadgePending]}>
            <Text style={[styles.sideBadgeText, file ? styles.sideBadgeTextSuccess : styles.sideBadgeTextPending]}>
              {file ? 'Uploaded' : 'Pending'}
            </Text>
          </View>
        </View>

        {isUploading ? (
          <View style={styles.uploadingBox}>
            <View style={styles.emptyIconBox}>
              <KudiIcon name="clock" size={20} color={colors.primary} />
            </View>
            <View style={styles.fileInfo}>
              <Text style={styles.uploadingTitle}>Uploading file...</Text>
              <Text style={styles.uploadingMeta}>{progress}% completed</Text>
            </View>
          </View>
        ) : file ? (
          <View style={styles.selectedFileBox}>
            <View style={styles.fileIconBox}>
              <KudiIcon name="file-text" size={20} color={colors.success} />
            </View>
            <View style={styles.fileInfo}>
              <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
              <Text style={styles.fileMeta}>{file.size} · Uploaded</Text>
            </View>
            <TouchableOpacity onPress={() => handleRemove(side)} style={styles.iconButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <KudiIcon name="trash-2" size={18} color={colors.danger} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.emptyFileBox, error ? styles.dropZoneError : null]}
            onPress={() => handleSelectFile(side)}
            activeOpacity={0.8}
          >
            <View style={styles.emptyIconBox}>
              <KudiIcon name="upload-cloud" size={20} color={colors.primary} />
            </View>
            <View style={styles.fileInfo}>
              <Text style={styles.emptyTitle}>Choose {label.toLowerCase()}</Text>
              <Text style={styles.uploadHintText}>Tap to select image or document (Max 5MB)</Text>
            </View>
            <KudiIcon name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}

        {error ? (
          <View style={styles.errorRow}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => handleSelectFile(side)}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    );
  };

  const isBothUploaded = Boolean(frontFile && backFile);

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header matched to Login Screen with Back Button */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <KudiIcon name="arrow-left" size={24} color={colors.text} />
            </TouchableOpacity>

            <View style={styles.logoContainer}>
              <Image source={logo} style={styles.logo} resizeMode="contain" />
            </View>

            <View style={styles.backButtonPlaceholder} />
          </View>

          <View style={styles.content}>
            <Text style={styles.stepText}>Partner KYC · Verification</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>
              Upload clear photographs of both sides of your official document.
            </Text>

            {/* Rejection / Resubmission notice banner */}
            {isRejectedDoc && (
              <View style={styles.issueCard}>
                <View style={styles.issueHeader}>
                  <KudiIcon name="alert-triangle" size={16} color={colors.danger} />
                  <Text style={styles.issueTitle}>Re-upload required</Text>
                </View>
                <Text style={styles.issueDescription}>
                  {docType === 'drivingLicence'
                    ? 'Your previous driving licence was blurry or unreadable. Please provide a clear, glare-free picture.'
                    : 'The registration certificate corners were cut off. Please upload all 4 edges clearly.'}
                </Text>
              </View>
            )}

            {/* Overall Sides Status Card */}
            <View style={styles.sidesStatusCard}>
              <Text style={styles.sidesStatusTitle}>Required Sides</Text>
              
              <View style={styles.sidesStatusItem}>
                <View style={[styles.statusDot, frontFile ? styles.dotSuccess : styles.dotPending]} />
                <Text style={styles.sidesStatusLabel}>Front Side</Text>
                <Text style={[styles.sidesStatusValue, frontFile ? styles.textSuccess : styles.textPending]}>
                  {frontFile ? 'Ready' : 'Missing'}
                </Text>
              </View>

              <View style={styles.sidesStatusDivider} />

              <View style={styles.sidesStatusItem}>
                <View style={[styles.statusDot, backFile ? styles.dotSuccess : styles.dotPending]} />
                <Text style={styles.sidesStatusLabel}>Back Side</Text>
                <Text style={[styles.sidesStatusValue, backFile ? styles.textSuccess : styles.textPending]}>
                  {backFile ? 'Ready' : 'Missing'}
                </Text>
              </View>
            </View>

            {/* Upload Sections for Front & Back */}
            {renderSideUploadSection('front', 'Front Side')}
            {renderSideUploadSection('back', 'Back Side')}
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
