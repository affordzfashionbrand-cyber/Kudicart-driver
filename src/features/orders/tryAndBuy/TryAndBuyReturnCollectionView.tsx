import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Order } from '../../../store/useOrderStore';
import { KudiIcon } from '../../../components/KudiIcon';

interface TryAndBuyReturnCollectionViewProps {
  order: Order;
  onToggleCollected: (itemId: string) => void;
  onOpenCamera: () => void;
  returnImages: string[];
  onRemoveImage: (index: number) => void;
  onConfirmCollection: (images: string[]) => void;
  onBack?: () => void;
}

const defaultThumbnails = [
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=120&q=80',
  'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=120&q=80',
  'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=120&q=80',
];

export const TryAndBuyReturnCollectionView: React.FC<TryAndBuyReturnCollectionViewProps> = ({
  order,
  onToggleCollected,
  onOpenCamera,
  returnImages,
  onRemoveImage,
  onConfirmCollection,
  onBack,
}) => {
  const returnItems = (order.items || []).filter((i) => i.decision === 'RETURN');
  const allItemsCollected = returnItems.every((i) => i.collected);
  const isReady = allItemsCollected && (returnImages.length > 0);

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
        <Text style={styles.topBarTitle}>Collect returned items</Text>
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
          <KudiIcon name="alert-circle" size={16} color="#FF5A1F" />
          <Text style={styles.bannerText}>
            Physically collect the returned garments. Verify that original tags are intact before accepting.
          </Text>
        </View>

        {/* ITEMS EXPECTED BACK CHECKLIST */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionLabel}>Items expected back</Text>
            <Text style={styles.cardHeaderMeta}>{returnItems.length} items to collect</Text>
          </View>

          {returnItems.map((item, index) => {
            const isLast = index === returnItems.length - 1;
            const isCollected = !!item.collected;

            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.itemCard, !isLast && styles.itemBorder]}
                onPress={() => onToggleCollected(item.id)}
                activeOpacity={0.85}
              >
                {/* CHECKBOX */}
                <View style={[styles.checkbox, isCollected && styles.checkboxActive]}>
                  {isCollected && <KudiIcon name="check" size={14} color="#FFFFFF" />}
                </View>

                <Image
                  source={{ uri: defaultThumbnails[index % defaultThumbnails.length] }}
                  style={styles.itemThumb}
                  resizeMode="cover"
                />

                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.variant ? <Text style={styles.itemVariant}>{item.variant}</Text> : null}
                  <View style={styles.tagConditionRow}>
                    <Text style={styles.tagConditionText}>• Check: Brand tag attached</Text>
                  </View>
                </View>

                <View style={styles.qtyBox}>
                  <Text style={styles.qtyText}>×{item.quantity}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* RETURN VERIFICATION PHOTO */}
        <View style={styles.card}>
          <View style={styles.photoHeaderRow}>
            <Text style={styles.sectionLabel}>Return package photo</Text>
            <View
              style={[
                styles.photoStatusTag,
                returnImages.length > 0 ? styles.photoStatusTagDone : styles.photoStatusTagReq,
              ]}
            >
              <Text
                style={[
                  styles.photoStatusText,
                  returnImages.length > 0 ? styles.photoStatusTextDone : styles.photoStatusTextReq,
                ]}
              >
                {returnImages.length > 0 ? 'Photo captured' : 'Required'}
              </Text>
            </View>
          </View>

          {returnImages.length > 0 ? (
            <View style={styles.photoCapturedBox}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbsScroll}>
                {returnImages.map((uri, idx) => (
                  <View key={idx} style={styles.thumbWrapper}>
                    <Image source={{ uri }} style={styles.capturedThumb} />
                    <TouchableOpacity
                      style={styles.removeBtn}
                      onPress={() => onRemoveImage(idx)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <KudiIcon name="close" size={12} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
              <TouchableOpacity style={styles.addMoreBtn} onPress={onOpenCamera} activeOpacity={0.8}>
                <KudiIcon name="camera" size={16} color="#171716" />
                <Text style={styles.addMoreText}>Add another photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.photoCaptureCard} onPress={onOpenCamera} activeOpacity={0.8}>
              <View style={styles.photoIconWrap}>
                <KudiIcon name="camera" size={20} color="#FF5A1F" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.photoCaptureTitle}>Take return photo</Text>
                <Text style={styles.photoCaptureSub}>Capture physical items collected from customer</Text>
              </View>
              <KudiIcon name="chevron-right" size={18} color="#65635F" />
            </TouchableOpacity>
          )}
        </View>

        {/* VERIFICATION SUMMARY */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Items collected</Text>
            <Text style={styles.summaryVal}>
              {returnItems.filter((i) => i.collected).length} of {returnItems.length}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Condition checklist</Text>
            <Text style={[styles.summaryVal, { color: allItemsCollected ? '#16805A' : '#65635F' }]}>
              {allItemsCollected ? 'Verified' : 'Pending verification'}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Return photos</Text>
            <Text style={[styles.summaryVal, { color: returnImages.length > 0 ? '#16805A' : '#65635F' }]}>
              {returnImages.length > 0 ? `${returnImages.length} attached` : 'Required'}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* 3. FIXED BOTTOM ACTION */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.primaryBtn, isReady ? styles.primaryBtnActive : styles.primaryBtnDisabled]}
          onPress={() => onConfirmCollection(returnImages)}
          disabled={!isReady}
          activeOpacity={0.88}
        >
          <Text style={[styles.primaryBtnText, isReady ? styles.primaryBtnTextActive : styles.primaryBtnTextDisabled]}>
            Confirm physical collection
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

  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECE6',
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
    borderColor: '#FF5A1F',
    backgroundColor: '#FF5A1F',
  },
  itemThumb: { width: 44, height: 44, borderRadius: 8, backgroundColor: '#E2DED7' },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '600', color: '#171716' },
  itemVariant: { fontSize: 12, color: '#65635F', marginTop: 2 },
  tagConditionRow: { marginTop: 4 },
  tagConditionText: { fontSize: 11, color: '#16805A', fontWeight: '600' },
  qtyBox: { paddingHorizontal: 6, paddingVertical: 2, backgroundColor: '#F3F1EC', borderRadius: 6 },
  qtyText: { fontSize: 13, fontWeight: '700', color: '#171716' },

  photoHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  photoStatusTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  photoStatusTagDone: { backgroundColor: '#EAF5EF' },
  photoStatusTagReq: { backgroundColor: '#FFF0E8' },
  photoStatusText: { fontSize: 11, fontWeight: '700' },
  photoStatusTextDone: { color: '#16805A' },
  photoStatusTextReq: { color: '#FF5A1F' },

  photoCapturedBox: { marginTop: 4 },
  thumbsScroll: { gap: 10, paddingVertical: 4 },
  thumbWrapper: { position: 'relative' },
  capturedThumb: { width: 72, height: 72, borderRadius: 10, backgroundColor: '#E2DED7' },
  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#171716',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 12,
    paddingVertical: 10,
    backgroundColor: '#F3F1EC',
    borderRadius: 10,
  },
  addMoreText: { fontSize: 13, fontWeight: '600', color: '#171716' },

  photoCaptureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F7F6F3',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2DED7',
    borderStyle: 'dashed',
    gap: 12,
  },
  photoIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF0E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoCaptureTitle: { fontSize: 14, fontWeight: '700', color: '#171716' },
  photoCaptureSub: { fontSize: 12, color: '#65635F', marginTop: 2 },

  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2DED7',
    padding: 16,
    marginBottom: 14,
    gap: 8,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryLabel: { fontSize: 13, color: '#65635F' },
  summaryVal: { fontSize: 13, fontWeight: '700', color: '#171716' },

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
