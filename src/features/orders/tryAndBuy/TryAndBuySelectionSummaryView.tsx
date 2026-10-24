import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Order } from '../../../store/useOrderStore';
import { KudiIcon } from '../../../components/KudiIcon';

interface TryAndBuySelectionSummaryViewProps {
  order: Order;
  onProceedToReturnCollection: () => void;
  onProceedToPayment: () => void;
  onBack?: () => void;
}

const defaultThumbnails = [
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=120&q=80',
  'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=120&q=80',
  'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=120&q=80',
];

export const TryAndBuySelectionSummaryView: React.FC<TryAndBuySelectionSummaryViewProps> = ({
  order,
  onProceedToReturnCollection,
  onProceedToPayment,
  onBack,
}) => {
  const keptItems = (order.items || []).filter((i) => i.decision === 'KEEP');
  const returnedItems = (order.items || []).filter((i) => i.decision === 'RETURN');

  const keptCount = keptItems.length;
  const returnedCount = returnedItems.length;

  const hasReturns = returnedCount > 0;

  return (
    <View style={styles.container}>
      {/* 1. TOP BAR */}
      <View style={styles.topBar}>
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="Back"
          >
            <KudiIcon name="arrow-left" size={20} color="#171716" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
        <Text style={styles.topBarTitle}>Try & Buy summary</Text>
        <Text style={styles.topBarOrderId}>{order.id}</Text>
      </View>

      {/* 2. SCROLL CONTENT */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* BANNER */}
        <View style={styles.banner}>
          <KudiIcon name="check-badge" size={18} color="#16805A" />
          <View style={{ flex: 1 }}>
            <Text style={styles.bannerTitle}>Customer selections confirmed</Text>
            <Text style={styles.bannerSub}>
              {order.customerName} has completed their trial decisions. Review the items below before proceeding.
            </Text>
          </View>
        </View>

        {/* METRICS SUMMARY TILES */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricTile}>
            <Text style={styles.metricVal}>{keptCount}</Text>
            <Text style={styles.metricLabel}>Items to deliver</Text>
            <Text style={styles.metricSub}>Retained by customer</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricTile}>
            <Text style={[styles.metricVal, hasReturns && { color: '#FF5A1F' }]}>{returnedCount}</Text>
            <Text style={styles.metricLabel}>Items to collect</Text>
            <Text style={styles.metricSub}>Physical return required</Text>
          </View>
        </View>

        {/* DETAILED ITEM SELECTIONS */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Customer item decisions</Text>

          {order.items?.map((item, index) => {
            const isLast = index === order.items!.length - 1;
            const isKept = item.decision === 'KEEP';

            return (
              <View
                key={item.id || index}
                style={[styles.itemRow, !isLast && styles.itemBorder]}
              >
                <Image
                  source={{ uri: defaultThumbnails[index % defaultThumbnails.length] }}
                  style={styles.itemThumb}
                  resizeMode="cover"
                />

                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.variant ? <Text style={styles.itemVariant}>{item.variant}</Text> : null}
                  <Text style={styles.itemPrice}>₹{item.price.toLocaleString('en-IN')}</Text>
                </View>

                {/* DECISION BADGE */}
                {isKept ? (
                  <View style={styles.keptBadge}>
                    <KudiIcon name="check" size={12} color="#16805A" />
                    <Text style={styles.keptBadgeText}>Keep</Text>
                  </View>
                ) : (
                  <View style={styles.returnBadge}>
                    <KudiIcon name="arrow-left" size={12} color="#171716" />
                    <Text style={styles.returnBadgeText}>Return</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* PRICING BREAKDOWN */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Settlement preview</Text>

          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Original order amount</Text>
            <Text style={styles.calcValue}>₹{(order.originalTotal || 3997).toLocaleString('en-IN')}</Text>
          </View>

          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Retained items ({keptCount})</Text>
            <Text style={[styles.calcValue, { color: '#16805A' }]}>
              + ₹{(order.finalPayableTotal || 0).toLocaleString('en-IN')}
            </Text>
          </View>

          {hasReturns && (
            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>Returned items deduction ({returnedCount})</Text>
              <Text style={[styles.calcValue, { color: '#65635F' }]}>
                - ₹{(order.refundAmount || 0).toLocaleString('en-IN')}
              </Text>
            </View>
          )}

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Final payable amount</Text>
            <Text style={styles.totalValue}>
              ₹{(order.finalPayableTotal || 0).toLocaleString('en-IN')}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* 3. FIXED BOTTOM ACTION */}
      <View style={styles.footer}>
        {hasReturns ? (
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={onProceedToReturnCollection}
            activeOpacity={0.88}
          >
            <Text style={styles.primaryBtnText}>Proceed to return collection ({returnedCount})</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={onProceedToPayment}
            activeOpacity={0.88}
          >
            <Text style={styles.primaryBtnText}>Proceed to payment & completion</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F1EC' },
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#F3F1EC',
    borderBottomWidth: 1,
    borderBottomColor: '#E2DED7',
  },
  backBtn: {
    padding: 6,
    marginLeft: -6,
  },
  topBarTitle: { fontSize: 16, fontWeight: '700', color: '#171716' },
  topBarOrderId: { fontSize: 13, fontWeight: '600', color: '#65635F' },

  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 28 },

  banner: {
    flexDirection: 'row',
    backgroundColor: '#EAF5EF',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#C3E6D2',
    gap: 12,
    marginBottom: 14,
    alignItems: 'flex-start',
  },
  bannerTitle: { fontSize: 14, fontWeight: '700', color: '#16805A' },
  bannerSub: { fontSize: 12, color: '#3A634E', marginTop: 3, lineHeight: 17 },

  metricsGrid: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2DED7',
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginBottom: 14,
    alignItems: 'center',
  },
  metricTile: { flex: 1, alignItems: 'center' },
  metricVal: { fontSize: 28, fontWeight: '900', color: '#171716' },
  metricLabel: { fontSize: 13, fontWeight: '700', color: '#171716', marginTop: 2 },
  metricSub: { fontSize: 11, color: '#65635F', marginTop: 2 },
  metricDivider: { width: 1, height: 48, backgroundColor: '#E2DED7' },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2DED7',
    padding: 16,
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#65635F',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },

  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECE6',
  },
  itemThumb: { width: 44, height: 44, borderRadius: 8, backgroundColor: '#E2DED7' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '600', color: '#171716' },
  itemVariant: { fontSize: 12, color: '#65635F', marginTop: 2 },
  itemPrice: { fontSize: 13, fontWeight: '700', color: '#171716', marginTop: 2 },

  keptBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF5EF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#C3E6D2',
  },
  keptBadgeText: { fontSize: 12, fontWeight: '700', color: '#16805A' },

  returnBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0E8',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
    borderWidth: 1,
    borderColor: '#FFD9C7',
  },
  returnBadgeText: { fontSize: 12, fontWeight: '700', color: '#FF5A1F' },

  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  calcLabel: { fontSize: 13, color: '#65635F' },
  calcValue: { fontSize: 13, fontWeight: '600', color: '#171716' },
  divider: { height: 1, backgroundColor: '#E2DED7', marginVertical: 10 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 14, fontWeight: '700', color: '#171716' },
  totalValue: { fontSize: 18, fontWeight: '900', color: '#FF5A1F' },

  footer: {
    padding: 16,
    paddingTop: 10,
    backgroundColor: '#F3F1EC',
    borderTopWidth: 1,
    borderTopColor: '#E2DED7',
  },
  primaryBtn: {
    backgroundColor: '#FF5A1F',
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: '#171716', fontSize: 15, fontWeight: '700' },
});
