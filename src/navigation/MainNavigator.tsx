import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardScreen } from '../features/orders/DashboardScreen';
import { AssignedOrdersScreen } from '../features/orders/AssignedOrdersScreen';
import { OrderHistoryScreen } from '../features/orders/OrderHistoryScreen';
import { ProfileScreen } from '../features/profile/ProfileScreen';
import { colors } from '../theme/colors';

import { KudiIcon } from '../components/KudiIcon';
import { IconName } from '../components/KudiIcon.types';
import { useOrderStore } from '../store/useOrderStore';
import { useDriverStore } from '../store/useDriverStore';

const Tab = createBottomTabNavigator();

export const MainNavigator = () => {
  const isOnline = useDriverStore((s) => s.isOnline);
  const activeOrders = useOrderStore((s) => s.activeOrders);

  // Hide the tab bar when the assignment overlay is visible (online + unaccepted order)
  const hasPendingAssignment = isOnline && activeOrders.some(
    (o) => o.status === 'ASSIGNED' && !o.accepted
  );

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName: IconName = 'home';
          
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Orders') iconName = 'clipboard-list';
          else if (route.name === 'History') iconName = 'history';
          else if (route.name === 'Profile') iconName = 'user';

          return <KudiIcon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: hasPendingAssignment
          ? { display: 'none' }
          : { paddingBottom: 5, paddingTop: 5, minHeight: 60, backgroundColor: colors.surface },
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Orders" component={AssignedOrdersScreen} />
      <Tab.Screen name="History" component={OrderHistoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};
