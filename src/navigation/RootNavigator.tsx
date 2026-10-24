import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '../store/useAuthStore';
import { SplashScreen } from '../features/auth/SplashScreen';
import { PhoneLoginScreen } from '../features/auth/PhoneLoginScreen';
import { OtpVerificationScreen } from '../features/auth/OtpVerificationScreen';
import { LegalScreen } from '../features/auth/LegalScreen';
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

export type RootStackParamList = {
  Splash: undefined;
  PhoneLogin: undefined;
  OtpVerification: { phoneNumber: string };
  Legal: undefined;
  VerificationApproved: undefined;
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

export const RootNavigator = () => {
  const { isAuthenticated, kycStatus } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Quick session check simulation
    const timer = setTimeout(() => setIsLoading(false), 200);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="PhoneLogin" component={PhoneLoginScreen} />
            <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
            <Stack.Screen name="Legal" component={LegalScreen} options={{ presentation: 'modal' }} />
          </>
        ) : kycStatus === 'APPROVED' ? (
          <>
            <Stack.Screen name="VerificationApproved" component={VerificationApprovedScreen} />
            <Stack.Screen name="MainApp" component={MainNavigator} />
            <Stack.Screen name="StoreDetails" component={StoreDetailsScreen} />
            <Stack.Screen name="OrderDetails" component={OrderDetailsScreen} />
            <Stack.Screen name="HistoricalOrderDetail" component={HistoricalOrderDetailScreen} />
            <Stack.Screen name="Slots" component={SlotsScreen} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="DriverProfileDetails" component={DriverProfileDetailsScreen} />
            <Stack.Screen name="ProfileDetailSub" component={ProfileDetailSubScreen} />
          </>
        ) : (
          <Stack.Screen name="KycFlow" component={KycNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
