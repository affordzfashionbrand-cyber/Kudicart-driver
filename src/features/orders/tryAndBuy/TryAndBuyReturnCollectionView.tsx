import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Order } from '../../../store/useOrderStore';
import { KudiIcon } from '../../../components/KudiIcon';
import { styles } from './returnCollection.styles';

interface TryAndBuyReturnCollectionViewProps {
  order: Order;
  onToggleCollected: (itemId: string) => void;
  onOpenCamera: () => void;
  returnImages: string[];
  onRemoveImage: (index: number) => void;
  onConfirmCollection: (images: string[]) => void;
  onBack?: () => void;
}

const DEFAULT_THUMBNAILS = [
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
  const isReady = allItemsCollected && returnImages.length > 0;

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
                  source={{ uri: DEFAULT_THUMBNAILS[index % DEFAULT_THUMBNAILS.length] }}
                  style={styles.itemThumb}
                  resizeMode="cover"
                />

                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  {item.variant ? <Text style={styles.itemVariant}>{item.variant}</Text> : null}
                  <View style={styles.tagConditionRow}>
                    <Text style={styles.tagConditionText}>Tags & packaging check</Text>
                  </View>
                </View>

                <View style={styles.qtyBox}>
                  <Text style={styles.qtyText}>×{item.quantity}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* RETURN PACKAGE PHOTO CARD */}
        <View style={styles.card}>
          <View style={styles.photoHeaderRow}>
            <Text style={styles.sectionLabel}>Return package photo</Text>
            <View style={[styles.photoStatusTag, returnImages.length > 0 ? styles.photoStatusTagDone : styles.photoStatusTagReq]}>
              <Text style={[styles.photoStatusText, returnImages.length > 0 ? styles.photoStatusTextDone : styles.photoStatusTextReq]}>
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
              <TouchableOpacity
                style={styles.addMoreBtn}
                onPress={onOpenCamera}
                activeOpacity={0.8}
              >
                <KudiIcon name="camera" size={16} color="#171716" />
                <Text style={styles.addMoreText}>Add another photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.photoCaptureCard}
              onPress={onOpenCamera}
              activeOpacity={0.8}
            >
              <View style={styles.photoIconWrap}>
                <KudiIcon name="camera" size={20} color="#FF5A1F" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.photoCaptureTitle}>Take return package photo</Text>
                <Text style={styles.photoCaptureSub}>Capture all returned items inside return tote</Text>
              </View>
              <KudiIcon name="chevron-right" size={18} color="#65635F" />
            </TouchableOpacity>
          )}
        </View>

        {/* SUMMARY CARD */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total items to collect</Text>
            <Text style={styles.summaryVal}>{returnItems.length}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Collected so far</Text>
            <Text style={[styles.summaryVal, { color: allItemsCollected ? '#16805A' : '#FF5A1F' }]}>
              {returnItems.filter((i) => i.collected).length} of {returnItems.length}
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
