import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DriverDetailsScreen } from '../features/kyc/DriverDetailsScreen';
import { VehicleDetailsScreen } from '../features/kyc/VehicleDetailsScreen';
import { DocumentUploadsScreen } from '../features/kyc/DocumentUploadsScreen';
import { DocumentUploadDetailScreen } from '../features/kyc/DocumentUploadDetailScreen';
import { VerificationPendingScreen } from '../features/kyc/VerificationPendingScreen';
import { VerificationRejectedScreen } from '../features/kyc/VerificationRejectedScreen';
import { useAuthStore } from '../store/useAuthStore';

const Stack = createNativeStackNavigator();

export const KycNavigator = () => {
  const { kycStatus } = useAuthStore();

  if (kycStatus === 'PENDING') {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="VerificationPending" component={VerificationPendingScreen} />
      </Stack.Navigator>
    );
  }

  return (
    <Stack.Navigator 
      key={kycStatus}
      screenOptions={{ headerShown: false }} 
      initialRouteName={kycStatus === 'REJECTED' ? 'VerificationRejected' : 'DriverDetails'}
    >
      <Stack.Screen name="VerificationRejected" component={VerificationRejectedScreen} />
      <Stack.Screen name="DriverDetails" component={DriverDetailsScreen} />
      <Stack.Screen name="VehicleDetails" component={VehicleDetailsScreen} />
      <Stack.Screen name="DocumentUploads" component={DocumentUploadsScreen} />
      <Stack.Screen name="DocumentUploadDetail" component={DocumentUploadDetailScreen} />
    </Stack.Navigator>
  );
};
