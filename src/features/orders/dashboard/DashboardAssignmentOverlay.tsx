import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { KudiIcon } from '../../../components/KudiIcon';
import { useOrderStore } from '../../../store/useOrderStore';
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
  isTryAndBuy?: boolean;
}

interface DashboardAssignmentOverlayProps {
  activeOrder: AssignmentOrder;
  navigation: any;
}

const QUICK_REASONS = ['Vehicle issue', 'Too far from hub', 'Shift ending', 'Other'];

export const DashboardAssignmentOverlay: React.FC<DashboardAssignmentOverlayProps> = ({
  activeOrder,
  navigation,
}) => {
  const { acceptOrder, rejectOrder, lastSyncError } = useOrderStore();
  const [isDeclining, setIsDeclining] = useState(false);
  const [declineReason, setDeclineReason] = useState(QUICK_REASONS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAccept = async () => {
    setIsSubmitting(true);
    try {
      await acceptOrder(activeOrder.id);
      navigation.navigate('OrderDetails', { orderId: activeOrder.id });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDecline = async () => {
    setIsSubmitting(true);
    try {
      await rejectOrder(activeOrder.id, declineReason.trim() || 'Rejected by delivery partner');
      setIsDeclining(false);
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <View style={[styles.assignmentFooter, { gap: 10 }]}>
        {lastSyncError ? (
          <Text style={{ color: '#DC2626', fontSize: 12, fontWeight: '600', textAlign: 'center' }}>
            {lastSyncError}
          </Text>
        ) : null}

        {isDeclining ? (
          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 12.5, fontWeight: '700', color: '#171716' }}>
              Select reason for declining:
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {QUICK_REASONS.map((r) => (
                <TouchableOpacity
                  key={r}
                  onPress={() => setDeclineReason(r)}
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: declineReason === r ? '#FF5A1F' : '#E2DED7',
                    backgroundColor: declineReason === r ? '#FFF0E8' : '#FFFFFF',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '600',
                      color: declineReason === r ? '#FF5A1F' : '#65635F',
                    }}
                  >
                    {r}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              value={declineReason}
              onChangeText={setDeclineReason}
              placeholder="Optional rejection note..."
              style={{
                backgroundColor: '#FFFFFF',
                borderWidth: 1,
                borderColor: '#E2DED7',
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 8,
                fontSize: 13,
                color: '#171716',
              }}
            />
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                style={[styles.primaryBtn, { flex: 1, backgroundColor: '#EAE6DF' }]}
                onPress={() => setIsDeclining(false)}
                disabled={isSubmitting}
              >
                <Text style={[styles.primaryBtnText, { color: '#171716' }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryBtn, { flex: 1, backgroundColor: '#DC2626' }]}
                onPress={handleConfirmDecline}
                disabled={isSubmitting}
              >
                <Text style={styles.primaryBtnText}>
                  {isSubmitting ? 'Declining...' : 'Confirm Decline'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  {
                    flex: 1,
                    backgroundColor: '#FFFFFF',
                    borderWidth: 1,
                    borderColor: '#DC2626',
                  },
                ]}
                onPress={() => setIsDeclining(true)}
                disabled={isSubmitting}
                activeOpacity={0.8}
              >
                <Text style={[styles.primaryBtnText, { color: '#DC2626' }]}>Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.primaryBtn, { flex: 2 }]}
                onPress={handleAccept}
                disabled={isSubmitting}
                activeOpacity={0.8}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.primaryBtnText}>Accept Assignment</Text>
                )}
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('OrderDetails', { orderId: activeOrder.id })}
              style={{ alignItems: 'center', paddingVertical: 4 }}
            >
              <Text style={{ fontSize: 12.5, fontWeight: '600', color: '#65635F' }}>
                Review order details
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};
