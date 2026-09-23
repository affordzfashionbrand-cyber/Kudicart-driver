import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { colors } from '../../theme/colors';
import { useDriverStore } from '../../store/useDriverStore';
import logo from '../../assets/logo.png';

const Icon = ({ name, color, size = 20 }: { name: string; color: string; size?: number }) => {
  const getIcon = () => {
    switch (name) {
      case 'arrow-left': return '←';
      case 'document': return '📄';
      case 'upload': return '↑';
      case 'trash': return '🗑️';
      default: return '•';
    }
  };
  return (
    <Text style={{ fontSize: size, color: color, textAlign: 'center', lineHeight: size * 1.2 }}>
      {getIcon()}
    </Text>
  );
};

export const RcUploadScreen = ({ navigation }: any) => {
  const { rcDocument, setRcDocument } = useDriverStore();
  const [error, setError] = useState('');

  const handleMockUpload = () => {
    setError('');
    setRcDocument({
      uri: 'file:///mock/path/to/vehicle_rc.pdf',
      name: 'vehicle_rc.pdf',
      size: '1.2MB',
      type: 'application/pdf',
    });
  };

  const handleRemove = () => {
    setRcDocument(null);
  };

  const handleContinue = () => {
    if (!rcDocument) {
      setError('Please upload your Vehicle Registration Certificate.');
      return;
    }
    
    Alert.alert(
      "Iteration Complete",
      "The current implementation stops at local RC selection. Server upload and vehicle details will be built in the next step."
    );
  };

  return (
    <ScreenContainer>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          
          {/* Header matched to Login Screen */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <Icon name="arrow-left" color={colors.primary} size={24} />
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <Image source={logo} style={styles.logo} resizeMode="contain" />
            </View>
            <View style={styles.backButtonPlaceholder} />
          </View>

          <View style={styles.content}>
            <Text style={styles.stepText}>PARTNER KYC • STEP 2 OF 4</Text>

            <Text style={styles.title}>Vehicle RC</Text>
            <Text style={styles.subtitle}>
              Please upload a clear copy of your Vehicle Registration Certificate.
            </Text>

            {!rcDocument ? (
              <View style={[styles.dropZone, error ? styles.dropZoneError : null]}>
                <View style={styles.uploadIconCircle}>
                  <Icon name="upload" color={colors.primary} size={24} />
                </View>
                <Text style={styles.dropZoneTitle}>Select Document</Text>
                <Text style={styles.dropZoneSubtitle}>Supported: PDF, JPG, PNG (Max 10MB)</Text>
                <TouchableOpacity style={styles.uploadButton} onPress={handleMockUpload}>
                  <Text style={styles.uploadButtonText}>Browse Files</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.selectedFileBox}>
                <View style={styles.fileIconBox}><Icon name="document" color={colors.success} size={24} /></View>
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName}>{rcDocument.name}</Text>
                  <Text style={styles.fileMeta}>{rcDocument.size} • Selected</Text>
                </View>
                <TouchableOpacity onPress={handleRemove} style={styles.removeButton}>
                  <Icon name="trash" color={colors.danger} size={16} />
                </TouchableOpacity>
              </View>
            )}

            {error ? <Text style={styles.validationError}>{error}</Text> : null}
          </View>

          <View style={styles.footer}>
            <PrimaryButton title="Continue" onPress={handleContinue} />
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
  backButton: {
    width: 40, height: 40, justifyContent: 'center',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    width: 140,
    height: 40,
  },
  backButtonPlaceholder: {
    width: 40,
  },
  
  content: {
    marginTop: spacing.xl,
  },
  stepText: {
    ...typography.caption,
    letterSpacing: 1,
    marginBottom: spacing.s,
    color: colors.primary,
    fontWeight: '700',
  },
  title: {
    ...typography.h1,
    fontWeight: '700',
    color: '#1A2C5B',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
    marginBottom: spacing.xxl,
  },

  dropZone: {
    borderWidth: 1.5, borderColor: '#A6C8FF', borderStyle: 'dashed', borderRadius: 16,
    backgroundColor: '#F0F4FF', padding: spacing.xxl, alignItems: 'center',
    marginTop: spacing.l,
  },
  dropZoneError: { borderColor: colors.danger, backgroundColor: '#FFEBEB' },
  uploadIconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.white, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.m },
  dropZoneTitle: { ...typography.h4, fontWeight: '700', color: '#1A2C5B', marginBottom: spacing.xs },
  dropZoneSubtitle: { ...typography.caption, color: colors.textSecondary, marginBottom: spacing.xl },
  uploadButton: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.primary, paddingHorizontal: spacing.xl, paddingVertical: spacing.m, borderRadius: 24 },
  uploadButtonText: { ...typography.bodyLarge, color: colors.primary, fontWeight: '700' },

  selectedFileBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white,
    borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, padding: spacing.l,
    marginTop: spacing.l,
  },
  fileIconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#E6F4EA', justifyContent: 'center', alignItems: 'center', marginRight: spacing.m },
  fileInfo: { flex: 1 },
  fileName: { ...typography.bodyLarge, fontWeight: '600', color: '#1A2C5B', marginBottom: 4 },
  fileMeta: { ...typography.caption, color: colors.textSecondary },
  removeButton: { padding: spacing.m, backgroundColor: '#FFEBEB', borderRadius: 12 },

  validationError: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.m,
    textAlign: 'center',
  },

  footer: {
    marginTop: spacing.xxl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
});
