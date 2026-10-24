import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DashboardScreen } from '../features/orders/DashboardScreen';
import { EarningsScreen } from '../features/earnings/EarningsScreen';
import { ShiftsScreen } from '../features/shifts/ShiftsScreen';
import { SlotsScreen } from '../features/shifts/SlotsScreen';
import { ProfileScreen } from '../features/profile/ProfileScreen';
import { colors } from '../theme/colors';

import { KudiIcon } from '../components/KudiIcon';
import { IconName } from '../components/KudiIcon.types';
import { useOrderStore } from '../store/useOrderStore';
import { useDriverStore } from '../store/useDriverStore';

const Tab = createBottomTabNavigator();

export const MainNavigator = () => {
  const insets = useSafeAreaInsets();
  const isOnline = useDriverStore((s) => s.isOnline);
  const activeOrders = useOrderStore((s) => s.activeOrders);
  const workPreference = useDriverStore((s) => s.profile.workPreference);
  const isPartTime = workPreference === 'PART_TIME';

  // Hide the tab bar when the assignment overlay is visible (online + unaccepted order)
  const hasPendingAssignment = isOnline && activeOrders.some(
    (o) => o.status === 'ASSIGNED' && !o.accepted
  );

  const bottomInset = insets.bottom || 0;
  const barHeight = 62 + bottomInset;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarLabelPosition: 'below-icon',
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: hasPendingAssignment
          ? { display: 'none' }
          : {
              height: barHeight,
              paddingTop: 8,
              paddingBottom: bottomInset > 0 ? bottomInset : 8,
              backgroundColor: colors.surface,
              borderTopWidth: 1,
              borderTopColor: colors.border,
            },
        tabBarItemStyle: {
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 2,
        },
        tabBarIconStyle: {
          width: 24,
          height: 24,
          marginBottom: 3,
        },
        tabBarIcon: ({ focused }) => {
          let iconName: IconName = 'home';
          
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Earnings') iconName = 'wallet';
          else if (route.name === 'Shifts') iconName = 'calendar';
          else if (route.name === 'Profile') iconName = 'user';

          return <KudiIcon name={iconName} size={22} color={focused ? colors.primary : colors.textMuted} />;
        },
        tabBarLabel: ({ focused }) => {
          const shiftLabel = isPartTime ? 'Slots' : 'Shifts';
          const label =
            route.name === 'Home'
              ? 'Home'
              : route.name === 'Earnings'
              ? 'Earnings'
              : route.name === 'Shifts'
              ? shiftLabel
              : 'Profile';

          return (
            <Text
              style={{
                fontSize: 11,
                fontWeight: '600',
                color: focused ? colors.text : colors.textMuted,
              }}
            >
              {label}
            </Text>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Earnings" component={EarningsScreen} />
      <Tab.Screen
        name="Shifts"
        component={isPartTime ? SlotsScreen : ShiftsScreen}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};
