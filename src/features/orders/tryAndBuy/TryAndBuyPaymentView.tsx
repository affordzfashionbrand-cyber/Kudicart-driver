import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Order } from '../../../store/useOrderStore';
import { KudiIcon } from '../../../components/KudiIcon';
import { styles } from './paymentView.styles';

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

