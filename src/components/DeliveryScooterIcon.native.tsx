import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

export const DeliveryScooterIcon = ({ size = 24, color = '#333333' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <Circle cx="6" cy="16.5" r="2.5" />
    <Circle cx="18" cy="16.5" r="2.5" />
    <Path d="M8.5 16.5h7" />
    <Path d="M15.5 16.5l-2-6h-4" />
    <Path d="M13.5 10.5l1.5-4h3" />
    <Path d="M4 14V9h5v5Z" />
  </Svg>
);
