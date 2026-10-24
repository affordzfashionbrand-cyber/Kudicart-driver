import React from 'react';
import { ProfileDetailSubScreen } from '../profile/ProfileDetailSubScreen';

export const StoreDetailsScreen = ({ navigation, route }: any) => {
  const mergedRoute = {
    ...route,
    params: {
      id: 'store',
      title: 'Your Store',
      ...route?.params,
    },
  };
  return <ProfileDetailSubScreen navigation={navigation} route={mergedRoute} />;
};
