import React, { useEffect, useState } from 'react';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/useAuthStore';
import { SplashScreen } from '../features/auth/SplashScreen';
import { PhoneLoginScreen } from '../features/auth/PhoneLoginScreen';
import { OtpVerificationScreen } from '../features/auth/OtpVerificationScreen';
import { LegalScreen } from '../features/auth/LegalScreen';
import { TermsAndConditionsScreen } from '../features/auth/TermsAndConditionsScreen';
import { PrivacyPolicyScreen } from '../features/auth/PrivacyPolicyScreen';
import { MainNavigator } from './MainNavigator';
import { KycNavigator } from './KycNavigator';
import { StoreDetailsScreen } from '../features/store/StoreDetailsScreen';
import { OrderDetailsScreen } from '../features/orders/OrderDetailsScreen';

import { VerificationApprovedScreen } from '../features/kyc/VerificationApprovedScreen';
import { SlotsScreen } from '../features/shifts/SlotsScreen';
import { NotificationsScreen } from '../features/notifications/NotificationsScreen';
import { DriverProfileDetailsScreen } from '../features/profile/DriverProfileDetailsScreen';
import { ProfileDetailSubScreen } from '../features/profile/ProfileDetailSubScreen';
import { HistoricalOrderDetailScreen } from '../features/orders/HistoricalOrderDetailScreen';
import { DevicePermissionSetupScreen } from '../features/permissions/DevicePermissionSetupScreen';
import { usePermissionStore } from '../store/usePermissionStore';

export type RootStackParamList = {
  Splash: undefined;
  PhoneLogin: undefined;
  OtpVerification: { phoneNumber: string };
  TermsAndConditions: undefined;
  PrivacyPolicy: undefined;
  Legal: { initialTab?: 'terms' | 'privacy' } | undefined;
  VerificationApproved: undefined;
  DevicePermissionSetup: { returnTo?: 'MainApp' | 'VerificationApproved' | 'Profile' } | undefined;
  MainApp: undefined;
  KycFlow: undefined;
  StoreDetails: undefined;
  OrderDetails: { orderId?: string };
  HistoricalOrderDetail: { orderId?: string };
  Slots: undefined;
  Notifications: undefined;
  DriverProfileDetails: undefined;
  ProfileDetailSub: { id: string; title?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

import { getAuthToken } from '../api';
import { driverSocket } from '../services/driverSocket';
import { notificationService } from '../services/notificationService';
import { useOrderStore } from '../store/useOrderStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { toast } from '../store/useToastStore';

export const navigationRef = createNavigationContainerRef<any>();

export const RootNavigator = () => {
  const { isAuthenticated, kycStatus, syncStatusAsync } = useAuthStore();
  const hasCompletedDeviceSetup = usePermissionStore((s) => s.hasCompletedDeviceSetup);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      syncStatusAsync()
        .catch(() => {})
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [syncStatusAsync]);

  useEffect(() => {
    if (isAuthenticated) {
      driverSocket.connect().catch(() => {});
      useOrderStore.getState().retryPendingSyncs().catch(() => {});
      useOrderStore.getState().fetchAssignedOrdersAsync().catch(() => {});
      useNotificationStore.getState().fetchNotificationsAsync().catch(() => {});

      const handleForegroundMessage = (message: any) => {
        const orderId = message?.data?.orderId;
        if (orderId) {
          useOrderStore.getState().refreshOrderAsync(String(orderId)).catch(() => {});
        }
        useNotificationStore.getState().fetchNotificationsAsync().catch(() => {});
        const title = message?.notification?.title;
        const body = message?.notification?.body;
        if (title || body) {
          try {
            toast.show({
              type: 'info',
              message: title ? `${title}${body ? `: ${body}` : ''}` : String(body),
            });
          } catch {}
        }
      };

      const handleNotificationTap = (message: any) => {
        const data = message?.data || {};
        const orderId = data.orderId ? String(data.orderId) : undefined;
        if (orderId) {
          useOrderStore.getState().refreshOrderAsync(orderId).catch(() => {});
        } else {
          useOrderStore.getState().fetchAssignedOrdersAsync().catch(() => {});
        }
        useNotificationStore.getState().fetchNotificationsAsync().catch(() => {});

        if (navigationRef.isReady() && kycStatus === 'APPROVED') {
          if (orderId) {
            navigationRef.navigate('OrderDetails', { orderId });
          } else if (data.actionRoute === 'Notifications' || data.screen === 'Notifications') {
            navigationRef.navigate('Notifications');
          }
        }
      };

      notificationService.setupNotificationListeners(handleForegroundMessage, handleNotificationTap);
    } else {
      driverSocket.disconnect();
      notificationService.teardownListeners();
    }

    return () => {
      notificationService.teardownListeners();
    };
  }, [isAuthenticated, kycStatus]);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="PhoneLogin" component={PhoneLoginScreen} />
            <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
            <Stack.Screen name="DevicePermissionSetup" component={DevicePermissionSetupScreen} />
            <Stack.Screen name="TermsAndConditions" component={TermsAndConditionsScreen} />
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
            <Stack.Screen name="Legal" component={LegalScreen} />
          </>
        ) : kycStatus === 'APPROVED' ? (
          <>
            {!hasCompletedDeviceSetup ? (
              <>
                <Stack.Screen name="DevicePermissionSetup" component={DevicePermissionSetupScreen} />
                <Stack.Screen name="MainApp" component={MainNavigator} />
              </>
            ) : (
              <>
                <Stack.Screen name="MainApp" component={MainNavigator} />
                <Stack.Screen name="DevicePermissionSetup" component={DevicePermissionSetupScreen} />
              </>
            )}
            <Stack.Screen name="VerificationApproved" component={VerificationApprovedScreen} />
            <Stack.Screen name="StoreDetails" component={StoreDetailsScreen} />
            <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
            <Stack.Screen name="HistoricalOrderDetail" component={HistoricalOrderDetailScreen} />
            <Stack.Screen name="Slots" component={SlotsScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="DriverProfileDetails" component={DriverProfileDetailsScreen} />
            <Stack.Screen name="ProfileDetailSub" component={ProfileDetailSubScreen} />
            <Stack.Screen name="TermsAndConditions" component={TermsAndConditionsScreen} />
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
          </>
        ) : (
          <Stack.Screen name="KycFlow" component={KycNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
