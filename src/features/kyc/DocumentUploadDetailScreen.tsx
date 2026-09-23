import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { colors } from '../../theme/colors';
import { useDriverStore, DocumentsProfile, DocumentFile } from '../../store/useDriverStore';
import { pickFile } from '../../utils/filePicker';
import logo from '../../assets/logo.png';
import { KudiIcon } from '../../components/KudiIcon';


export const DocumentUploadDetailScreen = ({ route, navigation }: any) => {
  const { docType, title } = route.params as { docType: keyof DocumentsProfile, title: string };
  const { documents, updateDocument } = useDriverStore();
  
  // Local state initialized with store values
  const [frontFile, setFrontFile] = useState<DocumentFile | null>(documents[docType].front);
  const [backFile, setBackFile] = useState<DocumentFile | null>(documents[docType].back);

  const handleSelectFile = async (side: 'front' | 'back') => {
    const file = await pickFile();
    if (file) {
      if (side === 'front') setFrontFile(file);
      else setBackFile(file);
    }
  };

  const handleRemove = (side: 'front' | 'back') => {
    if (side === 'front') setFrontFile(null);
    else setBackFile(null);
  };

  const handleSave = () => {
    // Both front and back are required to save
    if (!frontFile || !backFile) return;

    updateDocument(docType, 'front', frontFile);
    updateDocument(docType, 'back', backFile);
    navigation.goBack();
  };

  const renderUploadZone = (side: 'front' | 'back') => {
    const file = side === 'front' ? frontFile : backFile;
    const sideTitle = side === 'front' ? 'Front Side' : 'Back Side';
    const hasOtherSide = side === 'front' ? !!backFile : !!frontFile;
    const isMissing = !file && hasOtherSide;

    return (
      <View style={styles.uploadSection}>
        <Text style={styles.sectionLabel}>{sideTitle}</Text>
        
        {!file ? (
          <TouchableOpacity style={[styles.emptyFileBox, isMissing ? styles.dropZoneError : null]} onPress={() => handleSelectFile(side)}>
            <View style={styles.emptyIconBox}>
              <KudiIcon name="document" color={colors.textSecondary} size={24} />
            </View>
            <View style={styles.fileInfo}>
              <Text style={styles.emptyTitle}>No document selected</Text>
              <Text style={styles.uploadLinkText}>Upload {side === 'front' ? 'front' : 'back'}</Text>
            </View>
            {isMissing && <KudiIcon name="info-circle" color={colors.warning} size={20} />}
          </TouchableOpacity>
        ) : (
          <View style={styles.selectedFileBox}>
            <View style={styles.fileIconBox}>
              <KudiIcon name="document" color={colors.text} size={24} />
            </View>
            <View style={styles.fileInfo}>
              <Text style={styles.fileName}>{file.name}</Text>
              <Text style={styles.fileMeta}>{file.size} • Selected</Text>
            </View>
            <TouchableOpacity onPress={() => handleSelectFile(side)} style={styles.iconButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <KudiIcon name="edit" color={colors.textSecondary} size={20} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleRemove(side)} style={[styles.iconButton, { marginLeft: spacing.s }]} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <KudiIcon name="trash" color={colors.danger} size={20} />
            </TouchableOpacity>
          </View>
        )}
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
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
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

            {renderUploadZone('front')}
            {renderUploadZone('back')}
          </View>

          <View style={styles.footer}>
            <PrimaryButton 
              title="Save & Continue" 
              onPress={handleSave} 
              disabled={!frontFile || !backFile} 
            />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  keyboardAvoid: { flex: 1 },
  scrollContainer: { flexGrow: 1, padding: spacing.l },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.m,
    marginBottom: spacing.l,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  logoContainer: { flex: 1, alignItems: 'center' },
  logo: { width: 140, height: 40 },
  backButtonPlaceholder: { width: 40 },
  
  content: { marginTop: spacing.s },
  stepText: { ...typography.caption, letterSpacing: 1, marginBottom: spacing.s, color: colors.primary, fontWeight: '700' },
  title: { ...typography.h1, fontWeight: '700', color: '#1A2C5B', marginBottom: spacing.xs },
  subtitle: { ...typography.bodyMedium, color: colors.textSecondary, marginBottom: spacing.l },

  uploadSection: {
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    ...typography.bodyMedium,
    fontWeight: '700',
    color: '#1A2C5B',
    marginBottom: spacing.m,
  },
  
  // Empty State Styles
  emptyFileBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white,
    borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, padding: spacing.l,
  },
  emptyIconBox: { justifyContent: 'center', alignItems: 'center', marginRight: spacing.m },
  emptyTitle: { ...typography.bodyLarge, fontWeight: '600', color: '#1A2C5B', marginBottom: 4 },
  uploadLinkText: { ...typography.caption, color: colors.primary, fontWeight: '600' },
  dropZoneError: { borderColor: colors.warning },

  // Selected State Styles
  selectedFileBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white,
    borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, padding: spacing.l,
  },
  fileIconBox: { justifyContent: 'center', alignItems: 'center', marginRight: spacing.m },
  fileInfo: { flex: 1 },
  fileName: { ...typography.bodyLarge, fontWeight: '600', color: '#1A2C5B', marginBottom: 4 },
  fileMeta: { ...typography.caption, color: colors.textSecondary },
  iconButton: { padding: spacing.xs },

  footer: { marginTop: spacing.xxl, alignItems: 'center', marginBottom: spacing.xl },
});
