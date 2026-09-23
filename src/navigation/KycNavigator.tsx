import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DriverDetailsScreen } from '../features/kyc/DriverDetailsScreen';
import { VehicleDetailsScreen } from '../features/kyc/VehicleDetailsScreen';
import { RcUploadScreen } from '../features/kyc/RcUploadScreen';
import { useAuthStore } from '../store/useAuthStore';

const Stack = createNativeStackNavigator();

export const KycNavigator = () => {
  const { kycStatus } = useAuthStore();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="DriverDetails">
      <Stack.Screen name="DriverDetails" component={DriverDetailsScreen} />
      <Stack.Screen name="VehicleDetails" component={VehicleDetailsScreen} />
      <Stack.Screen name="RcUpload" component={RcUploadScreen} />
    </Stack.Navigator>
  );
};
