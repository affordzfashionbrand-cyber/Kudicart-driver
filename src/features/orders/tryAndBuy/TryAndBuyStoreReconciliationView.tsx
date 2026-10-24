import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Order } from '../../../store/useOrderStore';
import { KudiIcon } from '../../../components/KudiIcon';

interface TryAndBuyStoreReconciliationViewProps {
  order: Order;
  onReconcileReturn: () => void;
  onBack?: () => void;
}

const defaultThumbnails = [
  'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=120&q=80',
  'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=120&q=80',
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=120&q=80',
];

export const TryAndBuyStoreReconciliationView: React.FC<TryAndBuyStoreReconciliationViewProps> = ({
  order,
  onReconcileReturn,
  onBack,
}) => {
  const [hubConfirmed, setHubConfirmed] = useState(false);
  const returnedItems = (order.items || []).filter((i) => i.decision === 'RETURN');

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
        <Text style={styles.topBarTitle}>Return reconciliation</Text>
        <Text style={styles.topBarOrderId}>{order.id}</Text>
      </View>

      {/* 2. SCROLL CONTENT */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* INSTRUCTION */}
        <View style={styles.banner}>
          <KudiIcon name="package" size={16} color="#FF5A1F" />
          <Text style={styles.bannerText}>
            Hand over returned items to the hub inventory supervisor for tag and barcode verification.
          </Text>
        </View>

        {/* RETURN MANIFEST CARD */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionLabel}>Return manifest</Text>
            <View style={styles.manifestIdChip}>
              <Text style={styles.manifestIdText}>{order.returnManifestId || '#RM-9842'}</Text>
            </View>
          </View>

          <View style={styles.hubLocationRow}>
            <View style={styles.hubIconWrap}>
              <KudiIcon name="home" size={18} color="#FF5A1F" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.hubTitle}>{order.pickupLocation}</Text>
              <Text style={styles.hubSub}>Destination Hub • Inward Return Bay</Text>
            </View>
          </View>
        </View>

        {/* RETURNED ITEMS TO RECONCILE */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionLabel}>Inventory inwarding</Text>
            <Text style={styles.cardHeaderMeta}>{returnedItems.length} items</Text>
          </View>

          {returnedItems.map((item, index) => {
            const isLast = index === returnedItems.length - 1;

            return (
              <View
                key={item.id}
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
                  <View style={styles.statusRow}>
                    <KudiIcon name="check-circle" size={12} color="#16805A" />
                    <Text style={styles.statusText}>Tags verified • Original packaging</Text>
                  </View>
                </View>

                <View style={styles.qtyTag}>
                  <Text style={styles.qtyTagText}>×{item.quantity}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* RETURN PHOTOS ATTACHED */}
        {order.returnImages && order.returnImages.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>Customer handover evidence</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbsScroll}>
              {order.returnImages.map((uri, idx) => (
                <Image key={idx} source={{ uri }} style={styles.returnEvidenceThumb} />
              ))}
            </ScrollView>
          </View>
        )}

        {/* HUB INVENTORY EXECUTIVE CONFIRMATION */}
        <TouchableOpacity
          style={[styles.verificationCard, hubConfirmed && styles.verificationCardActive]}
          onPress={() => setHubConfirmed(!hubConfirmed)}
          activeOpacity={0.85}
        >
          <View style={[styles.checkbox, hubConfirmed && styles.checkboxActive]}>
            {hubConfirmed && <KudiIcon name="check" size={14} color="#FFFFFF" />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.verificationTitle}>Hub supervisor receipt confirmed</Text>
            <Text style={styles.verificationSub}>
              Darkstore inwarding executive has scanned barcodes and verified physical condition.
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* 3. FIXED BOTTOM ACTION */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.primaryBtn,
            hubConfirmed ? styles.primaryBtnActive : styles.primaryBtnDisabled,
          ]}
          onPress={onReconcileReturn}
          disabled={!hubConfirmed}
          activeOpacity={0.88}
        >
          <Text
            style={[
              styles.primaryBtnText,
              hubConfirmed ? styles.primaryBtnTextActive : styles.primaryBtnTextDisabled,
            ]}
          >
            Complete store return & reconcile
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
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderMeta: { fontSize: 12, fontWeight: '600', color: '#65635F' },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#65635F',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  manifestIdChip: {
    backgroundColor: '#F3F1EC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  manifestIdText: { fontSize: 12, fontWeight: '800', color: '#171716' },

  hubLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  hubIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF0E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hubTitle: { fontSize: 15, fontWeight: '700', color: '#171716' },
  hubSub: { fontSize: 12, color: '#65635F', marginTop: 2 },

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
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  statusText: { fontSize: 11, color: '#16805A', fontWeight: '600' },
  qtyTag: { paddingHorizontal: 8, paddingVertical: 3, backgroundColor: '#F3F1EC', borderRadius: 6 },
  qtyTagText: { fontSize: 13, fontWeight: '700', color: '#171716' },

  thumbsScroll: { gap: 10, paddingVertical: 4 },
  returnEvidenceThumb: { width: 68, height: 68, borderRadius: 8, backgroundColor: '#E2DED7' },

  verificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2DED7',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  verificationCardActive: {
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
  verificationTitle: { fontSize: 14, fontWeight: '700', color: '#171716' },
  verificationSub: { fontSize: 12, color: '#65635F', marginTop: 2, lineHeight: 16 },

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
