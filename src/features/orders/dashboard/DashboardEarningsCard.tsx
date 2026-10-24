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
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Today's earnings</Text>
        <View style={styles.shiftChip}>
          <Text style={styles.shiftChipText} numberOfLines={1}>Shift 9–6</Text>
        </View>
      </View>
      <View style={styles.amountContainer}>
        <Text style={styles.amountText}>{formatCurrency(workSummary?.totalEarnings || 840.50)}</Text>
      </View>
      <View style={styles.progressSection}>
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBarFill, { width: '65%' }]} />
        </View>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>On shift · 2h 18m left</Text>
          <Text style={styles.progressValue}>65% of goal</Text>
        </View>
      </View>
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statBoxLabel}>Online time</Text>
          <Text style={styles.statBoxValue}>{workSummary?.loginHours || '6h 42m'}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statBoxLabel}>Orders</Text>
          <Text style={styles.statBoxValue}>{workSummary?.ordersDone || 14}</Text>
        </View>
      </View>
    </View>
  );
};
