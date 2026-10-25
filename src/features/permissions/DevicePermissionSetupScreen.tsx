import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { PrimaryButton } from '../../components/PrimaryButton';
import { KudiIcon } from '../../components/KudiIcon';
import { colors } from '../../theme/colors';
import { usePermissionStore } from '../../store/usePermissionStore';
import { PermissionKey, PermissionStatus } from '../../services/permissionService';
import { toast } from '../../store/useToastStore';
import { styles } from './devicePermission.styles';

export const DevicePermissionSetupScreen = ({ route, navigation }: any) => {
  const returnTo = route?.params?.returnTo;
  const {
    permissions,
    isLoading,
    checkAll,
    requestPermission,
    openSettings,
    completeDeviceSetup,
    isEssentialConfigured,
  } = usePermissionStore();

  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showWebSettingsModal, setShowWebSettingsModal] = useState(false);

  useEffect(() => {
    checkAll();
  }, [checkAll]);

  const permissionList = Object.values(permissions);
  const totalCount = permissionList.length;
  const grantedCount = permissionList.filter((p) => p.status === 'granted').length;

  const handleRequest = async (key: PermissionKey) => {
    // Android Staged Location Check:
    if (key === 'backgroundLocation') {
      const loc = permissions['location'];
      if (loc?.status !== 'granted') {
        toast.show({
          type: 'warning',
          message: 'Please enable foreground Location access first before background tracking.',
        });
        await requestPermission('location');
        return;
      }
    }

    const res = await requestPermission(key);
    if (res === 'never_ask_again') {
      handleOpenSettings();
    } else if (res === 'granted') {
      toast.show({
        type: 'success',
        message: 'Permission enabled successfully.',
      });
    } else if (res === 'denied') {
      toast.show({
        type: 'error',
        message: 'Permission request was denied.',
      });
    }
  };

  const handleOpenSettings = async () => {
    if (Platform.OS === 'web') {
      setShowWebSettingsModal(true);
    } else {
      const opened = await openSettings();
      if (!opened) {
        toast.show({
          type: 'warning',
          message: 'Unable to open system settings automatically.',
        });
      }
    }
  };

  const handleContinue = () => {
    const isReady = isEssentialConfigured();
    if (!isReady) {
      setShowWarningModal(true);
    } else {
      proceedToApp();
    }
  };

  const proceedToApp = () => {
    completeDeviceSetup();
    if (returnTo === 'Profile' && navigation?.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.replace('MainApp');
    }
  };

  const getStatusBadge = (status: PermissionStatus) => {
    switch (status) {
      case 'granted':
        return (
          <View style={[styles.badge, styles.badgeGranted]}>
            <KudiIcon name="check-circle" size={14} color={colors.success} />
            <Text style={[styles.badgeText, styles.badgeTextGranted, { marginLeft: 4 }]}>
              Enabled
            </Text>
          </View>
        );
      case 'denied':
        return (
          <View style={[styles.badge, styles.badgeDenied]}>
            <KudiIcon name="error-circle" size={14} color={colors.danger} />
            <Text style={[styles.badgeText, styles.badgeTextDenied, { marginLeft: 4 }]}>
              Permission denied
            </Text>
          </View>
        );
      case 'never_ask_again':
        return (
          <View style={[styles.badge, styles.badgeSettings]}>
            <KudiIcon name="info-circle" size={14} color={colors.info} />
            <Text style={[styles.badgeText, styles.badgeTextSettings, { marginLeft: 4 }]}>
              Open settings
            </Text>
          </View>
        );
      case 'limited':
        return (
          <View style={[styles.badge, styles.badgeRequired]}>
            <Text style={[styles.badgeText, styles.badgeTextRequired]}>Approximate only</Text>
          </View>
        );
      case 'unavailable':
        return (
          <View style={[styles.badge, styles.badgeUnavailable]}>
            <Text style={[styles.badgeText, styles.badgeTextUnavailable]}>
              {Platform.OS === 'web' ? 'Unavailable on Web' : 'Not supported'}
            </Text>
          </View>
        );
      case 'not_requested':
      default:
        return (
          <View style={[styles.badge, styles.badgeRequired]}>
            <Text style={[styles.badgeText, styles.badgeTextRequired]}>Permission required</Text>
          </View>
        );
    }
  };

  const getIconForPermission = (key: string) => {
    switch (key) {
      case 'location':
        return 'navigation';
      case 'backgroundLocation':
        return 'radar';
      case 'camera':
        return 'camera';
      case 'notifications':
        return 'notifications';
      case 'backgroundTracking':
        return 'crosshair';
      case 'filePicker':
        return 'document';
      case 'phoneDialer':
        return 'phone';
      default:
        return 'shield';
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          {navigation?.canGoBack() ? (
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <KudiIcon name="arrow-left" size={24} color={colors.primary} />
            </TouchableOpacity>
          ) : (
            <View style={styles.headerPlaceholder} />
          )}
          <Text style={styles.headerTitle}>Set up your device</Text>
          <View style={styles.headerPlaceholder} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Introduction Card */}
          <View style={styles.introCard}>
            <Text style={styles.introTitle}>Device capabilities & permissions</Text>
            <Text style={styles.introText}>
              KudiCart uses your device's native capabilities to coordinate delivery navigation, dispatch nearby fashion orders, and record package handover proof.
            </Text>

            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                {grantedCount} of {totalCount} configured
              </Text>
              <TouchableOpacity
                style={styles.refreshBtn}
                onPress={() => checkAll()}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <>
                    <KudiIcon name="refresh" size={14} color={colors.primary} />
                    <Text style={styles.refreshBtnText}>Check OS</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Required Permissions</Text>

          {/* Permission Cards */}
          {permissionList.map((item) => {
            const isGranted = item.status === 'granted';
            const isDenied = item.status === 'denied';
            const isPermanentlyDenied = item.status === 'never_ask_again';
            const isUnavailable = item.status === 'unavailable';

            return (
              <View key={item.key} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    <View style={styles.iconBox}>
                      <KudiIcon
                        name={getIconForPermission(item.key) as any}
                        size={20}
                        color={colors.primary}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{item.title}</Text>
                      {item.isEssential && (
                        <Text style={styles.essentialBadge}>Essential</Text>
                      )}
                    </View>
                  </View>
                  {getStatusBadge(item.status)}
                </View>

                <Text style={styles.cardDescription}>{item.description}</Text>

                <View style={styles.whyBox}>
                  <Text style={styles.whyText}>
                    <Text style={{ fontWeight: '700', color: colors.text }}>Why needed: </Text>
                    {item.whyNeeded}
                  </Text>
                </View>

                {item.platformNotes && (
                  <Text style={styles.platformNote}>* {item.platformNotes}</Text>
                )}

                {/* Contextual Action Button */}
                <View style={styles.cardActions}>
                  {!isGranted && !isUnavailable && (
                    <>
                      {isPermanentlyDenied ? (
                        <TouchableOpacity
                          style={styles.settingsBtn}
                          onPress={handleOpenSettings}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.settingsBtnText}>Open device settings</Text>
                        </TouchableOpacity>
                      ) : (
                        <TouchableOpacity
                          style={styles.allowBtn}
                          onPress={() => handleRequest(item.key)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.allowBtnText}>
                            {isDenied ? 'Retry access' : 'Grant access'}
                          </Text>
                        </TouchableOpacity>
                      )}
                    </>
                  )}
                  {isGranted && (
                    <Text style={{ fontSize: 12, fontWeight: '600', color: colors.success }}>
                      Verified active
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <PrimaryButton
            title="Continue setup"
            onPress={handleContinue}
            style={styles.continueBtn}
            textStyle={styles.continueBtnText}
          />
        </View>

        {/* Essential Location Warning Modal */}
        <Modal
          visible={showWarningModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowWarningModal(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Location Access Required</Text>
              <Text style={styles.modalMessage}>
                Location permission is essential to receive delivery dispatches and navigate to pickup stores. You can enter the dashboard now, but you will not be able to go online until location access is allowed.
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalBtnSecondary}
                  onPress={() => {
                    setShowWarningModal(false);
                    proceedToApp();
                  }}
                >
                  <Text style={styles.modalBtnSecondaryText}>Continue anyway</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalBtnPrimary}
                  onPress={async () => {
                    setShowWarningModal(false);
                    await handleRequest('location');
                  }}
                >
                  <Text style={styles.modalBtnPrimaryText}>Grant location</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Web Browser Settings Guidance Modal */}
        <Modal
          visible={showWebSettingsModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowWebSettingsModal(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Browser Permission Settings</Text>
              <Text style={styles.modalMessage}>
                To enable blocked permissions in your browser:{"\n\n"}
                1. Click the lock/settings icon on the left side of your browser URL address bar.{"\n"}
                2. Change Location and Camera permissions from "Block" to "Allow".{"\n"}
                3. Refresh the page to apply the updated permission settings.
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalBtnPrimary}
                  onPress={() => {
                    setShowWebSettingsModal(false);
                    checkAll();
                  }}
                >
                  <Text style={styles.modalBtnPrimaryText}>Got it</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </ScreenContainer>
  );
};
