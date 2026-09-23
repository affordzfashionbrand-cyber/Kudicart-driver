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

import { VerificationApprovedScreen } from '../features/kyc/VerificationApprovedScreen';

export type RootStackParamList = {
  Splash: undefined;
  PhoneLogin: undefined;
  OtpVerification: { phoneNumber: string };
  Legal: undefined;
  VerificationApproved: undefined;
  MainApp: undefined;
  KycFlow: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator = () => {
  const { isAuthenticated, kycStatus } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial loading/checking session
    const timer = setTimeout(() => setIsLoading(false), 2000);
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
          </>
        ) : (
          <Stack.Screen name="KycFlow" component={KycNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
