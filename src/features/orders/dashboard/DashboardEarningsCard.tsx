import React from 'react';
import { View, Text } from 'react-native';
import { dashboardStyles as styles } from './dashboard.styles';

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};

interface DashboardEarningsCardProps {
  workSummary?: {
    totalEarnings: number;
    loginHours: string;
    ordersDone: number;
  };
}

export const DashboardEarningsCard: React.FC<DashboardEarningsCardProps> = ({ workSummary }) => {
  const earnings = workSummary?.totalEarnings ?? 0;
  const loginHours = workSummary?.loginHours || '0h 00m';
  const ordersDone = workSummary?.ordersDone ?? 0;

  // Real goal calculation
  const targetOrders = 10;
  const progressPercent = Math.min(100, Math.round((ordersDone / targetOrders) * 100));

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Today's earnings</Text>
        <View style={styles.shiftChip}>
          <Text style={styles.shiftChipText} numberOfLines={1}>Active shift</Text>
        </View>
      </View>
      <View style={styles.amountContainer}>
        <Text style={styles.amountText}>{formatCurrency(earnings)}</Text>
      </View>
      <View style={styles.progressSection}>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
        </View>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Target: {ordersDone} / {targetOrders} orders</Text>
          <Text style={styles.progressValue}>{progressPercent}% of goal</Text>
        </View>
      </View>
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statBoxLabel}>Online time</Text>
          <Text style={styles.statBoxValue}>{loginHours}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statBoxLabel}>Orders</Text>
          <Text style={styles.statBoxValue}>{ordersDone}</Text>
        </View>
      </View>
    </View>
  );
};
