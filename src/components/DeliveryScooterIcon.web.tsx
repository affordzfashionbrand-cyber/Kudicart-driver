import React from 'react';

export const DeliveryScooterIcon = ({ size = 24, color = '#333333' }: { size?: number; color?: string }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke={color} 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <circle cx="6" cy="16.5" r="2.5" />
    <circle cx="18" cy="16.5" r="2.5" />
    <path d="M8.5 16.5h7" />
    <path d="M15.5 16.5l-2-6h-4" />
    <path d="M13.5 10.5l1.5-4h3" />
    <path d="M4 14V9h5v5Z" />
  </svg>
);
