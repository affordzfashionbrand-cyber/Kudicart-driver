import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DriverDetailsScreen } from '../features/kyc/DriverDetailsScreen';
import { VehicleDetailsScreen } from '../features/kyc/VehicleDetailsScreen';
import { DocumentUploadsScreen } from '../features/kyc/DocumentUploadsScreen';
import { SelfieScreen } from '../features/kyc/SelfieScreen';
import { DocumentUploadDetailScreen } from '../features/kyc/DocumentUploadDetailScreen';
import { VerificationPendingScreen } from '../features/kyc/VerificationPendingScreen';
import { VerificationRejectedScreen } from '../features/kyc/VerificationRejectedScreen';
import { useAuthStore } from '../store/useAuthStore';

const Stack = createNativeStackNavigator();

export const KycNavigator = () => {
  const { kycStatus } = useAuthStore();

  const isPending = kycStatus === 'PENDING' || kycStatus === 'UNDER_REVIEW';
  const initialRouteName = isPending
    ? 'VerificationPending'
    : kycStatus === 'REJECTED'
      ? 'VerificationRejected'
      : 'DriverDetails';

  return (
    <Stack.Navigator
      key={kycStatus}
      screenOptions={{ headerShown: false }}
      initialRouteName={initialRouteName}
    >
      <Stack.Screen name="DriverDetails" component={DriverDetailsScreen} />
      <Stack.Screen name="VehicleDetails" component={VehicleDetailsScreen} />
      <Stack.Screen name="DocumentUploads" component={DocumentUploadsScreen} />
      <Stack.Screen name="Selfie" component={SelfieScreen} />
      <Stack.Screen name="DocumentUploadDetail" component={DocumentUploadDetailScreen} />
      <Stack.Screen name="VerificationPending" component={VerificationPendingScreen} />
      <Stack.Screen name="VerificationRejected" component={VerificationRejectedScreen} />
    </Stack.Navigator>
  );
};
