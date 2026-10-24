import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Order } from '../../../store/useOrderStore';
import { KudiIcon } from '../../../components/KudiIcon';

interface TryAndBuyPaymentViewProps {
  order: Order;
  onConfirmPaymentAndBranch: () => void;
  onBack?: () => void;
}

export const TryAndBuyPaymentView: React.FC<TryAndBuyPaymentViewProps> = ({
  order,
  onConfirmPaymentAndBranch,
  onBack,
}) => {
  const [cashCollected, setCashCollected] = useState(false);

  const retainedItems = (order.items || []).filter((i) => i.decision === 'KEEP');
  const returnedItems = (order.items || []).filter((i) => i.decision === 'RETURN');

  const retainedCount = retainedItems.length;
  const returnedCount = returnedItems.length;
  const hasReturns = returnedCount > 0;

  const isCod = order.paymentMethod === 'COD' || !order.paymentMethod;
  const finalAmount = order.finalPayableTotal ?? 2098;
  const originalAmount = order.originalTotal ?? 3997;
  const refundAmount = order.refundAmount ?? (originalAmount - finalAmount);

  // If COD and amount > 0, cash collection must be verified
  const isActionAllowed = !isCod || finalAmount === 0 || cashCollected;

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
        <Text style={styles.topBarTitle}>Payment & settlement</Text>
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
          <KudiIcon name="info-circle" size={16} color="#FF5A1F" />
          <Text style={styles.bannerText}>
            {hasReturns
              ? `Customer retained ${retainedCount} item(s) and returned ${returnedCount} item(s). Collect the final adjusted amount.`
              : `Customer retained all ${retainedCount} items. Collect the full order amount.`}
          </Text>
        </View>

        {/* FINANCIAL SUMMARY CARD */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Financial summary</Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Original order value ({order.itemsCount} items)</Text>
            <Text style={styles.priceValue}>₹{originalAmount.toLocaleString('en-IN')}</Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Retained items ({retainedCount} items)</Text>
            <Text style={[styles.priceValue, { color: '#16805A' }]}>
              ₹{finalAmount.toLocaleString('en-IN')}
            </Text>
          </View>

          {hasReturns && (
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Returned items adjustment ({returnedCount} items)</Text>
              <Text style={[styles.priceValue, { color: '#65635F' }]}>
                - ₹{refundAmount.toLocaleString('en-IN')}
              </Text>
            </View>
          )}

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Try & Buy delivery fee</Text>
            <Text style={[styles.priceValue, { color: '#16805A' }]}>FREE</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Final amount payable</Text>
            <Text style={styles.totalValue}>₹{finalAmount.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* PAYMENT METHOD & SETTLEMENT CONFIRMATION */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Payment collection</Text>

          <View style={styles.methodHeader}>
            <View style={styles.methodIconWrap}>
              <KudiIcon name="wallet" size={20} color="#FF5A1F" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.methodTitle}>{isCod ? 'Cash on Delivery (COD)' : 'Prepaid (Online)'}</Text>
              <Text style={styles.methodSub}>
                {isCod
                  ? finalAmount > 0
                    ? `Collect ₹${finalAmount.toLocaleString('en-IN')} from ${order.customerName}`
                    : 'All items returned — No payment due'
                  : `Online refund of ₹${refundAmount.toLocaleString('en-IN')} will be initiated automatically`}
              </Text>
            </View>
          </View>

          {isCod && finalAmount > 0 && (
            <TouchableOpacity
              style={[styles.collectCard, cashCollected && styles.collectCardActive]}
              onPress={() => setCashCollected(!cashCollected)}
              activeOpacity={0.85}
            >
              <View style={[styles.checkbox, cashCollected && styles.checkboxActive]}>
                {cashCollected && <KudiIcon name="check" size={14} color="#FFFFFF" />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.collectTitle}>
                  Cash collected: ₹{finalAmount.toLocaleString('en-IN')}
                </Text>
                <Text style={styles.collectSub}>
                  I confirm receiving exact cash from {order.customerName} for retained items.
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* 3. FIXED BOTTOM ACTION */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.primaryBtn,
            isActionAllowed ? styles.primaryBtnActive : styles.primaryBtnDisabled,
          ]}
          onPress={onConfirmPaymentAndBranch}
          disabled={!isActionAllowed}
          activeOpacity={0.88}
        >
          <Text
            style={[
              styles.primaryBtnText,
              isActionAllowed ? styles.primaryBtnTextActive : styles.primaryBtnTextDisabled,
            ]}
          >
            {hasReturns
              ? 'Finalize & start return to store'
              : 'Mark delivery completed'}
          </Text>
        </TouchableOpacity>
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
    backgroundColor: '#FFF0E8',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FFD9C7',
    gap: 10,
    marginBottom: 14,
    alignItems: 'center',
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    color: '#171716',
    lineHeight: 18,
    fontWeight: '500',
  },

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

  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  priceLabel: { fontSize: 13, color: '#65635F' },
  priceValue: { fontSize: 13, fontWeight: '600', color: '#171716' },

  divider: { height: 1, backgroundColor: '#E2DED7', marginVertical: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 15, fontWeight: '700', color: '#171716' },
  totalValue: { fontSize: 22, fontWeight: '900', color: '#FF5A1F' },

  methodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  methodIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFF0E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodTitle: { fontSize: 15, fontWeight: '700', color: '#171716' },
  methodSub: { fontSize: 13, color: '#65635F', marginTop: 3 },

  collectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2DED7',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  collectCardActive: {
    borderColor: '#16805A',
    backgroundColor: '#F3F9F5',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: '#A8A8A8',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxActive: {
    borderColor: '#16805A',
    backgroundColor: '#16805A',
  },
  collectTitle: { fontSize: 14, fontWeight: '700', color: '#171716' },
  collectSub: { fontSize: 12, color: '#65635F', marginTop: 2 },

  footer: {
    padding: 16,
    paddingTop: 10,
    backgroundColor: '#F3F1EC',
    borderTopWidth: 1,
    borderTopColor: '#E2DED7',
  },
  primaryBtn: {
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnActive: { backgroundColor: '#FF5A1F' },
  primaryBtnDisabled: { backgroundColor: '#D9D0C9' },
  primaryBtnText: { fontSize: 15, fontWeight: '700' },
  primaryBtnTextActive: { color: '#171716' },
  primaryBtnTextDisabled: { color: '#8A8781' },
});
