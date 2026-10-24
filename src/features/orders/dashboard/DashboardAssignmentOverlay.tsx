import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { KudiIcon } from '../../../components/KudiIcon';
import { dashboardStyles as styles } from './dashboard.styles';

interface AssignmentOrder {
  id: string;
  pickupLocation: string;
  customerAddress: string;
  customerName: string;
  itemsCount: number;
  distance: string;
  eta: string;
  date?: string;
  status: string;
  accepted?: boolean;
}

interface DashboardAssignmentOverlayProps {
  activeOrder: AssignmentOrder;
  navigation: any;
}

export const DashboardAssignmentOverlay: React.FC<DashboardAssignmentOverlayProps> = ({
  activeOrder,
  navigation,
}) => {
  return (
    <View style={styles.assignmentOverlay}>
      {/* Top bar */}
      <View style={styles.assignmentTopBar}>
        <View style={styles.assignmentTopBarLeft}>
          <Text style={styles.assignmentTitle}>Order assigned</Text>
        </View>
        <Text style={styles.sheetOrderId}>{activeOrder.id}</Text>
      </View>

      {/* Scrollable content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.assignmentScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Assignment notification */}
        <View style={styles.assignmentAlertBanner}>
          <KudiIcon name="alert-circle" size={16} color="#FF5A1F" />
          <Text style={styles.assignmentAlertText}>
            New order assigned. Check the route and order details before confirming.
          </Text>
        </View>

        {/* Route timeline */}
        <View style={styles.assignmentCard}>
          <Text style={styles.assignmentCardLabel}>Route</Text>
          <View style={styles.sheetTimeline}>
            <View style={styles.sheetTimelineCol}>
              <View style={[styles.sheetTimelineDot, { backgroundColor: '#171716' }]} />
              <View style={styles.sheetTimelineLine} />
              <View style={[styles.sheetTimelineDot, { backgroundColor: '#FF5A1F' }]} />
            </View>
            <View style={styles.sheetTimelineContent}>
              <View style={styles.sheetLocationRow}>
                <Text style={styles.sheetLocationLabel}>Pickup</Text>
                <Text style={styles.sheetLocationValue}>{activeOrder.pickupLocation}</Text>
              </View>
              <View style={styles.sheetLocationRowDrop}>
                <Text style={[styles.sheetLocationLabel, { color: '#FF5A1F' }]}>Drop-off</Text>
                <Text style={styles.sheetLocationValue}>{activeOrder.customerAddress}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Order details */}
        <View style={styles.assignmentCard}>
          <Text style={styles.assignmentCardLabel}>Order details</Text>
          <View style={styles.assignmentMetaGrid}>
            <View style={styles.assignmentMetaTile}>
              <KudiIcon name="package" size={18} color="#65635F" />
              <Text style={styles.assignmentMetaValue}>{activeOrder.itemsCount}</Text>
              <Text style={styles.assignmentMetaLabel}>Items</Text>
            </View>
            <View style={styles.assignmentMetaDivider} />
            <View style={styles.assignmentMetaTile}>
              <KudiIcon name="navigation" size={18} color="#65635F" />
              <Text style={styles.assignmentMetaValue}>{activeOrder.distance}</Text>
              <Text style={styles.assignmentMetaLabel}>Distance</Text>
            </View>
            <View style={styles.assignmentMetaDivider} />
            <View style={styles.assignmentMetaTile}>
              <KudiIcon name="clock" size={18} color="#65635F" />
              <Text style={styles.assignmentMetaValue}>{activeOrder.eta}</Text>
              <Text style={styles.assignmentMetaLabel}>ETA</Text>
            </View>
          </View>
        </View>

        {/* Customer */}
        <View style={styles.assignmentCard}>
          <Text style={styles.assignmentCardLabel}>Customer</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={styles.assignmentCustomerAvatar}>
              <KudiIcon name="user" size={18} color="#171716" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.assignmentCustomerName}>{activeOrder.customerName}</Text>
              <Text style={styles.assignmentMetaLabelSecondary}>{activeOrder.date || 'Today'}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom action */}
      <View style={styles.assignmentFooter}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('OrderDetails', { orderId: activeOrder.id })}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryBtnText}>Review order</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
