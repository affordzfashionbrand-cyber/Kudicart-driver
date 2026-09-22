import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { KycSubmissionScreen } from '../features/profile/KycSubmissionScreen';
import { VerificationPendingScreen } from '../features/profile/VerificationPendingScreen';

const Stack = createNativeStackNavigator();

export const KycNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Submission" component={KycSubmissionScreen} />
      <Stack.Screen name="Pending" component={VerificationPendingScreen} />
    </Stack.Navigator>
  );
};
