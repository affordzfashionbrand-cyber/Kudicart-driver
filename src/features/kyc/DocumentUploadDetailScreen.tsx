import React, { useState, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors } from '../../theme/colors';
import { useDriverStore, DocumentsProfile, DocumentFile } from '../../store/useDriverStore';
import { useAuthStore } from '../../store/useAuthStore';
import { pickFile } from '../../utils/filePicker';
import { CameraModal } from '../../components/CameraModal';
import logo from '../../assets/logo.png';
import { KudiIcon } from '../../components/KudiIcon';
import { toast } from '../../store/useToastStore';
import { profileApi } from '../../api';
import { styles } from './documentUploadDetail.styles';

export const DocumentUploadDetailScreen = ({ route, navigation }: any) => {
  const { docType, title } = route.params as { docType: keyof Omit<DocumentsProfile, 'selfie'>; title: string };
  const { documents, kyc, updateDocument, fetchProfileAsync } = useDriverStore();
  const { kycStatus, rejectionReason: authRejectionReason } = useAuthStore();
  const isReviewMode = kycStatus === 'REJECTED';

  // Local state initialized with store values
  const docState = documents[docType];
  const combinedRejectionReason = (kyc?.rejectionReason || authRejectionReason || '').trim();
  const docStatus = (docState as any)?.status;

  const isRejectedDoc = isReviewMode && (
    docStatus === 'REJECTED' ||
    (docStatus !== 'VERIFIED' && (() => {
      const lower = combinedRejectionReason.toLowerCase();
      if (!lower) return false;
      if (docType === 'drivingLicence') {
        return lower.includes('driving licence') || lower.includes('licence') || lower.includes('license') || lower.includes('dl');
      }
      if (docType === 'vehicleRc') {
        return lower.includes('vehicle rc') || lower.includes('registration certificate') || lower.includes('rc document');
      }
      if (docType === 'aadhaar') {
        return lower.includes('aadhaar');
      }
      if (docType === 'pan') {
        return lower.includes('pan');
      }
      return false;
    })())
  );

  const getRejectionDescription = (): string => {
    const rawReason = (docState as any)?.rejectionReason || '';
    if (rawReason) {
      let clean = rawReason.replace(/^[•\-\*]\s*/, '').trim();
      if (clean.includes(':')) {
        const parts = clean.split(':');
        clean = parts.slice(1).join(':').trim();
      }
      if (clean) return clean;
    }
    const lines = combinedRejectionReason.split('\n');
    for (const line of lines) {
      const clean = line.replace(/^[•\-\*]\s*/, '').trim();
      if (!clean) continue;
      const lower = clean.toLowerCase();
      if (docType === 'drivingLicence' && (lower.includes('licence') || lower.includes('license') || lower.includes('dl'))) {
        const parts = clean.split(':');
        return (parts[1] || parts[0]).trim();
      }
      if (docType === 'vehicleRc' && (lower.includes('rc') || lower.includes('registration'))) {
        const parts = clean.split(':');
        return (parts[1] || parts[0]).trim();
      }
      if (docType === 'aadhaar' && lower.includes('aadhaar')) {
        const parts = clean.split(':');
        return (parts[1] || parts[0]).trim();
      }
      if (docType === 'pan' && lower.includes('pan')) {
        const parts = clean.split(':');
        return (parts[1] || parts[0]).trim();
      }
    }
    return docType === 'drivingLicence'
      ? 'Your previous driving licence was rejected. Please provide a clear, glare-free picture.'
      : 'Document verification issue identified. Please re-upload a clear photo.';
  };
  const [frontFile, setFrontFile] = useState<DocumentFile | null>(docState?.front ?? null);
  const [backFile, setBackFile] = useState<DocumentFile | null>(docState?.back ?? null);

  useFocusEffect(
    useCallback(() => {
      fetchProfileAsync().catch(() => {});
    }, [fetchProfileAsync])
  );

  useEffect(() => {
    if (docState?.front && (!frontFile || frontFile.uri !== docState.front.uri)) {
      setFrontFile(docState.front);
    }
    if (docState?.back && (!backFile || backFile.uri !== docState.back.uri)) {
      setBackFile(docState.back);
    }
  }, [docState]);

  const [uploadingSide, setUploadingSide] = useState<'front' | 'back' | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ front: number; back: number }>({ front: 0, back: 0 });
  const [uploadError, setUploadError] = useState<{ front: string | null; back: string | null }>({ front: null, back: null });

  // Camera and Upload Method selection states
  const [pickerModalSide, setPickerModalSide] = useState<'front' | 'back' | null>(null);
  const [cameraSide, setCameraSide] = useState<'front' | 'back' | null>(null);

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

  const isPan = docType === 'pan';

  const handleOpenPicker = (side: 'front' | 'back') => {
    setUploadError((prev) => ({ ...prev, [side]: null }));
    setPickerModalSide(side);
  };

  const handleSelectCamera = (side: 'front' | 'back') => {
    setPickerModalSide(null);
    setCameraSide(side);
  };

  const handleSelectGallery = async (side: 'front' | 'back') => {
    setPickerModalSide(null);
    setUploadError((prev) => ({ ...prev, [side]: null }));

    try {
      const file = await pickFile();
      if (!file) return;
      await handleProcessFile(side, file);
    } catch (e: any) {
      setUploadError((prev) => ({ ...prev, [side]: e?.message || 'Upload failed. Tap to retry.' }));
      toast.error(e?.message || 'Upload failed. Tap to retry.');
    }
  };

  const handleProcessFile = async (side: 'front' | 'back', file: DocumentFile) => {
    setUploadError((prev) => ({ ...prev, [side]: null }));

    const error = validateFile(file);
    if (error) {
      setUploadError((prev) => ({ ...prev, [side]: error }));
      toast.error(error);
      return;
    }

    setUploadingSide(side);
    setUploadProgress((prev) => ({ ...prev, [side]: 40 }));

    try {
      // Real upload to backend
      const res = await profileApi.uploadDocument({
        docType: docType as any,
        side,
        fileUri: file.uri,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      });

      setUploadProgress((prev) => ({ ...prev, [side]: 100 }));
      setUploadingSide(null);

      const savedDocFile: DocumentFile = res?.documents?.[docType]?.[side]
        ? {
            uri: res.documents[docType][side].uri,
            name: res.documents[docType][side].name || file.name,
            size: res.documents[docType][side].size || file.size,
            type: res.documents[docType][side].type || file.type,
          }
        : file;

      if (side === 'front') setFrontFile(savedDocFile);
      else setBackFile(savedDocFile);

      // Immediately synchronize global store
      useDriverStore.setState((state) => {
        const existingDoc = (state.documents[docType] as any) || {};
        const backendDoc = res?.documents?.[docType] || {};
        return {
          documents: {
            ...state.documents,
            [docType]: {
              ...existingDoc,
              ...backendDoc,
              [side]: savedDocFile,
              status: 'PENDING',
              rejectionReason: null,
              isReuploaded: true,
            },
          },
        };
      });

      toast.success(`${side === 'front' ? 'Front' : 'Back'} side uploaded.`);
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

    useDriverStore.setState((state) => {
      const existingDoc = (state.documents[docType] as any) || {};
      return {
        documents: {
          ...state.documents,
          [docType]: {
            ...existingDoc,
            [side]: null,
          },
        },
      };
    });
  };

  const handleSave = () => {
    if (isPan) {
      if (!frontFile) {
        toast.warning('PAN card image is required.');
        return;
      }
    } else {
      if (!frontFile || !backFile) {
        toast.warning('Both front and back images are required.');
        return;
      }
    }

    useDriverStore.setState((state) => {
      const existingDoc = (state.documents[docType] as any) || {};
      return {
        documents: {
          ...state.documents,
          [docType]: {
            ...existingDoc,
            front: frontFile,
            ...(isPan ? {} : { back: backFile }),
            status: 'PENDING',
            rejectionReason: null,
            isReuploaded: true,
          },
        },
      };
    });

    toast.success(`${title} updated successfully.`);
    navigation.goBack();
  };

  const renderSideUploadSection = (side: 'front' | 'back', label: string) => {
    const file = side === 'front' ? frontFile : backFile;
    const isUploading = uploadingSide === side;
    const progress = uploadProgress[side];
    const error = uploadError[side];

    const isImageFile =
      file &&
      (file.type?.startsWith('image/') ||
        /\.(jpg|jpeg|png|webp)$/i.test(file.name));

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
            {isImageFile ? (
              <Image source={{ uri: file.uri }} style={styles.thumbnailImage} resizeMode="cover" />
            ) : (
              <View style={styles.fileIconBox}>
                <KudiIcon name="document" size={20} color={colors.success} />
              </View>
            )}
            <View style={styles.fileInfo}>
              <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
              <Text style={styles.fileMeta}>{file.size} · Uploaded</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <TouchableOpacity
                onPress={() => handleOpenPicker(side)}
                style={styles.iconButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Change photo"
              >
                <KudiIcon name="camera" size={18} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleRemove(side)}
                style={styles.iconButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Remove photo"
              >
                <KudiIcon name="trash" size={18} color={colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.emptyFileBox, error ? styles.dropZoneError : null]}
            onPress={() => handleOpenPicker(side)}
            activeOpacity={0.8}
          >
            <View style={styles.emptyIconBox}>
              <KudiIcon name="camera" size={20} color={colors.primary} />
            </View>
            <View style={styles.fileInfo}>
              <Text style={styles.emptyTitle}>Upload {label}</Text>
              <Text style={styles.uploadHintText}>Tap to use Camera or choose File (Max 5MB)</Text>
            </View>
            <KudiIcon name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}

        {error ? (
          <View style={styles.errorRow}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => handleOpenPicker(side)}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    );
  };

  const isDocUploaded = isPan ? Boolean(frontFile) : Boolean(frontFile && backFile);

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
              {isPan
                ? 'Capture with camera or upload a clear photo of your official PAN card.'
                : 'Capture with camera or upload clear photos of both sides of your official document.'}
            </Text>

            {/* Rejection / Resubmission notice banner */}
            {isRejectedDoc && (
              <View style={styles.issueCard}>
                <View style={styles.issueHeader}>
                  <KudiIcon name="warning" size={16} color={colors.danger} />
                  <Text style={styles.issueTitle}>Re-upload required</Text>
                </View>
                <Text style={styles.issueDescription}>
                  {getRejectionDescription()}
                </Text>
              </View>
            )}

            {/* Overall Sides Status Card */}
            <View style={styles.sidesStatusCard}>
              <Text style={styles.sidesStatusTitle}>Required Sides</Text>
              
              <View style={styles.sidesStatusItem}>
                <View style={[styles.statusDot, frontFile ? styles.dotSuccess : styles.dotPending]} />
                <Text style={styles.sidesStatusLabel}>{isPan ? 'Front (Details)' : 'Front Side'}</Text>
                <Text style={[styles.sidesStatusValue, frontFile ? styles.textSuccess : styles.textPending]}>
                  {frontFile ? 'Ready' : 'Missing'}
                </Text>
              </View>

              {!isPan && (
                <>
                  <View style={styles.sidesStatusDivider} />

                  <View style={styles.sidesStatusItem}>
                    <View style={[styles.statusDot, backFile ? styles.dotSuccess : styles.dotPending]} />
                    <Text style={styles.sidesStatusLabel}>Back Side</Text>
                    <Text style={[styles.sidesStatusValue, backFile ? styles.textSuccess : styles.textPending]}>
                      {backFile ? 'Ready' : 'Missing'}
                    </Text>
                  </View>
                </>
              )}
            </View>

            {/* Upload Sections for Front & Back */}
            {renderSideUploadSection('front', isPan ? 'PAN Card' : 'Front Side')}
            {!isPan && renderSideUploadSection('back', 'Back Side')}
          </View>

          <View style={styles.footer}>
            <PrimaryButton 
              title="Save & Continue" 
              onPress={handleSave} 
              disabled={!isDocUploaded || Boolean(uploadingSide)} 
              style={[
                styles.continueButton,
                isDocUploaded && !uploadingSide ? styles.continueButtonActive : styles.continueButtonDisabled
              ]}
              textStyle={[
                styles.continueButtonText,
                isDocUploaded && !uploadingSide ? styles.continueButtonTextActive : styles.continueButtonTextDisabled
              ]}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Upload Method Selection Bottom Sheet */}
      {pickerModalSide && (
        <View style={styles.sheetOverlayContainer}>
          <TouchableOpacity
            style={styles.sheetBackdrop}
            activeOpacity={1}
            onPress={() => setPickerModalSide(null)}
          >
            <TouchableOpacity
              style={styles.sheetContent}
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
            >
              <View style={styles.sheetDragHandle} />

              <View style={styles.sheetHeaderRow}>
                <Text style={styles.sheetTitle}>
                  Upload {pickerModalSide === 'front' ? (isPan ? 'PAN Card' : 'Front Side') : 'Back Side'}
                </Text>
                <TouchableOpacity
                  onPress={() => setPickerModalSide(null)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <KudiIcon name="close" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Option 1: Take Photo with Camera */}
              <TouchableOpacity
                style={styles.optionCard}
                onPress={() => handleSelectCamera(pickerModalSide)}
                activeOpacity={0.8}
              >
                <View style={styles.optionIconWrap}>
                  <KudiIcon name="camera" size={22} color={colors.primary} />
                </View>
                <View style={styles.optionTextCol}>
                  <Text style={styles.optionTitle}>Take Photo with Camera</Text>
                  <Text style={styles.optionSub}>Open device camera to capture document now</Text>
                </View>
                <KudiIcon name="chevron-right" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              {/* Option 2: Upload from Files / Gallery */}
              <TouchableOpacity
                style={styles.optionCard}
                onPress={() => handleSelectGallery(pickerModalSide)}
                activeOpacity={0.8}
              >
                <View style={[styles.optionIconWrap, { backgroundColor: '#F0FDF4' }]}>
                  <KudiIcon name="upload" size={22} color={colors.success} />
                </View>
                <View style={styles.optionTextCol}>
                  <Text style={styles.optionTitle}>Choose from Files / Gallery</Text>
                  <Text style={styles.optionSub}>Select image (JPEG, PNG) or PDF document</Text>
                </View>
                <KudiIcon name="chevron-right" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sheetCancelButton}
                onPress={() => setPickerModalSide(null)}
              >
                <Text style={styles.sheetCancelText}>Cancel</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>
      )}

      {/* Live Camera Viewfinder Modal for Documents */}
      <CameraModal
        isOpen={Boolean(cameraSide)}
        onClose={() => setCameraSide(null)}
        onCapture={(file) => {
          if (cameraSide) {
            handleProcessFile(cameraSide, file);
          }
        }}
        mode="document"
        title={`Capture ${title} (${cameraSide === 'front' ? (isPan ? 'PAN Card' : 'Front Side') : 'Back Side'})`}
        side={cameraSide || undefined}
      />
    </ScreenContainer>
  );
};

