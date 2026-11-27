import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  BackHandler,
  StyleSheet,
} from 'react-native';
import { KudiIcon } from '../../components/KudiIcon';
import { colors } from '../../theme/colors';
import { usePermissionStore } from '../../store/usePermissionStore';
import { useAuthStore } from '../../store/useAuthStore';
import { PermissionKey } from '../../services/permissionService';

interface PermissionStep {
  key: PermissionKey;
  iconName: 'navigation' | 'camera' | 'notifications' | 'phone';
  dialogTitle: string;
  description: string;
  essentialTag: string;
}

const ALL_PERMISSION_STEPS: PermissionStep[] = [
  {
    key: 'location',
    iconName: 'navigation',
    dialogTitle: 'Allow "KudiCart" to access your location?',
    description:
      'Enable location access to receive nearby delivery orders, guide your route to the darkstore and customer, and track live order progress.',
    essentialTag: 'Required for order dispatch',
  },
  {
    key: 'camera',
    iconName: 'camera',
    dialogTitle: 'Allow "KudiCart" to access your camera?',
    description:
      'Enable camera access to photograph parcel drop-offs, scan return packages, and record delivery handover proof.',
    essentialTag: 'Proof of delivery capture',
  },
  {
    key: 'notifications',
    iconName: 'notifications',
    dialogTitle: 'Allow "KudiCart" to send you notifications?',
    description:
      'Enable notifications to receive real-time order alerts, urgent customer messages, and dispatch updates.',
    essentialTag: 'Instant order dispatch alerts',
  },
  {
    key: 'phoneDialer',
    iconName: 'phone',
    dialogTitle: 'Allow "KudiCart" to make phone calls?',
    description:
      'Enable call access to contact customers and darkstore dispatchers directly from the app during active deliveries.',
    essentialTag: 'Customer & hub communication',
  },
];

export const DevicePermissionModal = () => {
  const { isAuthenticated, kycStatus } = useAuthStore();
  const {
    checkAll,
    requestPermission,
    setPermissionDecision,
    completeDeviceSetup,
    areAllPermissionsGranted,
    isPermissionGranted,
    permissionDecisions,
    permissions,
  } = usePermissionStore();

  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    checkAll().catch(() => {});
  }, [checkAll]);

  // Find the first required permission that is not yet granted
  const currentStep = useMemo(() => {
    return ALL_PERMISSION_STEPS.find((step) => !isPermissionGranted(step.key));
  }, [permissions, permissionDecisions, isPermissionGranted]);

  // If driver is not authenticated or KYC is not approved, do not show modal
  if (!isAuthenticated || kycStatus !== 'APPROVED') {
    return null;
  }

  // If all permissions are granted, complete device setup and render nothing
  if (!currentStep || areAllPermissionsGranted()) {
    return null;
  }

  const closeApp = () => {
    if (Platform.OS === 'android') {
      BackHandler.exitApp();
      return;
    }

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        window.open('', '_self', '');
        window.close();
      } catch {}

      try {
        window.close();
      } catch {}

      // If browser security blocks script from closing a user-opened tab, redirect to blank page
      try {
        window.location.replace('about:blank');
      } catch {
        try {
          window.location.href = 'about:blank';
        } catch {}
      }
    }
  };

  const handleAllow = async () => {
    if (isProcessing || !currentStep) return;
    setIsProcessing(true);
    try {
      if (Platform.OS === 'android') {
        const osStatus = await requestPermission(currentStep.key).catch(() => 'denied');
        if (osStatus === 'denied' || osStatus === 'never_ask_again') {
          setPermissionDecision(currentStep.key, 'denied');
          closeApp();
          return;
        }
      } else {
        // Web: trigger request if browser supports, but don't close app on explicit user Allow
        try {
          await requestPermission(currentStep.key);
        } catch {}
      }
      setPermissionDecision(currentStep.key, 'granted');

      const remainingUngranted = ALL_PERMISSION_STEPS.filter(
        (s) => s.key !== currentStep.key && !isPermissionGranted(s.key)
      );

      if (remainingUngranted.length === 0) {
        completeDeviceSetup();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeny = () => {
    if (!currentStep) return;
    // Denying any permission immediately closes the application automatically
    setPermissionDecision(currentStep.key, 'denied');
    closeApp();
  };

  return (
    <View style={modalStyles.overlayContainer} pointerEvents="auto">
      {/* Dimmed backdrop overlay directly over the live Homepage */}
      <View style={modalStyles.backdropOverlay} />

      {/* Centered Dialog */}
      <View style={modalStyles.centerContainer}>
        <View style={modalStyles.dialogCard}>
          <View style={modalStyles.cardBody}>
            {/* Centered Brand Icon */}
            <View style={modalStyles.iconCircle}>
              <KudiIcon
                name={currentStep.iconName}
                size={26}
                color={colors.primary}
              />
            </View>

            {/* Dialog Title */}
            <Text style={modalStyles.dialogTitle}>{currentStep.dialogTitle}</Text>

            {/* Delivery Rationale */}
            <Text style={modalStyles.dialogDescription}>
              {currentStep.description}
            </Text>

            {/* Context Pill */}
            <View style={modalStyles.tagPill}>
              <Text style={modalStyles.tagPillText}>
                {currentStep.essentialTag}
              </Text>
            </View>
          </View>

          {/* Horizontal Divider */}
          <View style={modalStyles.dividerHorizontal} />

          {/* Split Action Buttons (Allow & Deny never wrap) */}
          <View style={modalStyles.actionRow}>
            <TouchableOpacity
              style={modalStyles.actionBtn}
              onPress={handleDeny}
              activeOpacity={0.7}
              disabled={isProcessing}
            >
              <Text
                numberOfLines={1}
                style={[
                  modalStyles.denyText,
                  Platform.OS === 'web' && ({ userSelect: 'none' } as any),
                ]}
              >
                Deny
              </Text>
            </TouchableOpacity>

            <View style={modalStyles.dividerVertical} />

            <TouchableOpacity
              style={modalStyles.actionBtn}
              onPress={handleAllow}
              activeOpacity={0.7}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text
                  numberOfLines={1}
                  style={[
                    modalStyles.allowText,
                    Platform.OS === 'web' && ({ userSelect: 'none' } as any),
                  ]}
                >
                  Allow
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const modalStyles = StyleSheet.create({
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.52)',
  },
  centerContainer: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 100000,
  },
  dialogCard: {
    width: '90%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 26,
  },
  cardBody: {
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 18,
    alignItems: 'center',
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFF0E8',
    borderWidth: 1,
    borderColor: '#FFE2D4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  dialogTitle: {
    fontSize: 17.5,
    fontWeight: '700',
    color: '#111111',
    textAlign: 'center',
    lineHeight: 23,
    marginBottom: 8,
  },
  dialogDescription: {
    fontSize: 13,
    fontWeight: '400',
    color: '#6B6667',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 10,
  },
  tagPill: {
    backgroundColor: '#F7F7F5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EAE7E1',
  },
  tagPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8A8580',
  },
  dividerHorizontal: {
    height: 1,
    backgroundColor: '#EFECE8',
    width: '100%',
  },
  actionRow: {
    flexDirection: 'row',
    height: 54,
    alignItems: 'stretch',
    width: '100%',
  },
  actionBtn: {
    flex: 1,
    minWidth: 130,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  dividerVertical: {
    width: 1,
    backgroundColor: '#EFECE8',
    height: '100%',
  },
  denyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B6667',
    textAlign: 'center',
    flexShrink: 0,
  },
  allowText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF5A1F',
    textAlign: 'center',
    flexShrink: 0,
  },
});
