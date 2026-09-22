import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardScreen } from '../features/orders/DashboardScreen';
import { AssignedOrdersScreen } from '../features/orders/AssignedOrdersScreen';
import { OrderHistoryScreen } from '../features/orders/OrderHistoryScreen';
import { ProfileScreen } from '../features/profile/ProfileScreen';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

export const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { paddingBottom: 5, height: 60, backgroundColor: colors.surface },
      }}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Orders" component={AssignedOrdersScreen} />
      <Tab.Screen name="History" component={OrderHistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};
