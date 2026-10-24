import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { Order } from '../../../store/useOrderStore';
import { KudiIcon } from '../../../components/KudiIcon';
import { styles } from './orderDetails.styles';

interface OrderPickupReviewViewProps {
  order: Order;
  pickupImages: string[];
  setPickupImages: (images: string[]) => void;
  onOpenCamera: () => void;
  onConfirmPickup: () => void;
  onBack: () => void;
  defaultProductThumbnails: string[];
}

export const OrderPickupReviewView: React.FC<OrderPickupReviewViewProps> = ({
  order,
  pickupImages,
  setPickupImages,
  onOpenCamera,
  onConfirmPickup,
  onBack,
  defaultProductThumbnails,
}) => {
  return (
    <SafeAreaView style={[styles.main, { backgroundColor: '#F3F1EC' }]}>
      {/* 1. TOP NAVIGATION BAR */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={onBack}
          style={styles.backBtn}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
        >
          <KudiIcon name="arrow-left" size={20} color="#171716" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Review order</Text>
        <Text style={styles.topBarOrderId}>{order.id}</Text>
      </View>

      {/* 2. SCROLLABLE OPERATIONAL CHECKLIST */}
      <View style={styles.scrollWrapper}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.reviewScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* INSTRUCTION */}
          {order.isTryAndBuy ? (
            <View style={[styles.instructionBanner, { backgroundColor: '#FFF0E8', borderColor: '#FFD9C7' }]}>
              <KudiIcon name="clock" size={16} color="#FF5A1F" />
              <Text style={styles.instructionText}>
                Try & Buy Order: Verify garment sizes & colors. Customer receives a 20-min trial upon delivery.
              </Text>
            </View>
          ) : (
            <View style={styles.instructionBanner}>
              <KudiIcon name="alert-circle" size={16} color="#FF5A1F" />
              <Text style={styles.instructionText}>Check the items before leaving the store.</Text>
            </View>
          )}

          {/* PICKUP FROM */}
          <View style={styles.reviewCard}>
            <Text style={styles.reviewSectionLabel}>Pickup from</Text>
            <Text style={styles.pickupStoreName}>{order.pickupLocation}</Text>
          </View>

          {/* PRODUCT DETAILS */}
          <View style={styles.reviewCard}>
            <Text style={styles.reviewSectionLabel}>Product details</Text>

            {order.items && order.items.length > 0 ? (
              order.items.map((item, index) => {
                const isLast = index === order.items!.length - 1;
                return (
                  <View
                    key={item.id || index}
                    style={[styles.productItemRow, !isLast && styles.productItemBorder]}
                  >
                    <View style={styles.productItemInfo}>
                      <Text style={styles.productItemName}>{item.name}</Text>
                      {item.variant ? (
                        <Text style={styles.productItemVariant}>{item.variant}</Text>
                      ) : null}
                    </View>
                    <Image
                      source={{ uri: defaultProductThumbnails[index % defaultProductThumbnails.length] }}
                      style={styles.productThumb}
                      resizeMode="cover"
                    />
                    <Text style={styles.productItemQty}>×{item.quantity}</Text>
                  </View>
                );
              })
            ) : (
              <View style={styles.productItemRow}>
                <View style={styles.productItemInfo}>
                  <Text style={styles.productItemName}>Assigned Package</Text>
                </View>
                <Image
                  source={{ uri: defaultProductThumbnails[0] }}
                  style={styles.productThumb}
                  resizeMode="cover"
                />
                <Text style={styles.productItemQty}>×{order.itemsCount}</Text>
              </View>
            )}

            {/* TOTAL ITEMS */}
            <View style={styles.reviewDivider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total items</Text>
              <Text style={styles.totalValue}>{order.itemsCount}</Text>
            </View>
          </View>

          {/* PACKAGE PHOTO */}
          <View style={styles.reviewCard}>
            <View style={styles.photoHeaderRow}>
              <Text style={styles.reviewSectionLabel}>Package photo</Text>
              <View style={[styles.photoStatusTag, pickupImages.length > 0 ? styles.photoStatusTagDone : styles.photoStatusTagReq]}>
                <Text style={[styles.photoStatusTagText, pickupImages.length > 0 ? styles.photoStatusTagTextDone : styles.photoStatusTagTextReq]}>
                  {pickupImages.length > 0 ? 'Photo captured' : 'Required'}
                </Text>
              </View>
            </View>

            {pickupImages.length > 0 ? (
              <View style={styles.photoCapturedContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.photoThumbsScroll}
                >
                  {pickupImages.map((uri, idx) => (
                    <View key={idx} style={styles.photoThumbWrapper}>
                      <Image source={{ uri }} style={styles.photoThumb} />
                      <TouchableOpacity
                        style={styles.removePhotoBtn}
                        onPress={() => setPickupImages(pickupImages.filter((_, i) => i !== idx))}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <KudiIcon name="close" size={12} color="#FFF" />
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
                <TouchableOpacity
                  style={styles.addMorePhotoBtn}
                  onPress={onOpenCamera}
                  activeOpacity={0.8}
                >
                  <KudiIcon name="camera" size={16} color="#171716" />
                  <Text style={styles.addMorePhotoText}>Add another photo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.photoCaptureCard}
                onPress={onOpenCamera}
                activeOpacity={0.8}
              >
                <View style={styles.photoCaptureIconWrap}>
                  <KudiIcon name="camera" size={20} color="#FF5A1F" />
                </View>
                <View style={styles.photoCaptureTextWrap}>
                  <Text style={styles.photoCaptureTitle}>Take package photo</Text>
                  <Text style={styles.photoCaptureSub}>Capture packed items before leaving</Text>
                </View>
                <KudiIcon name="chevron-right" size={18} color="#65635F" />
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>

      {/* 3. FIXED BOTTOM ACTION */}
      <View style={styles.reviewFooter}>
        <TouchableOpacity
          style={[
            styles.confirmPickupBtn,
            pickupImages.length > 0 ? styles.confirmPickupBtnActive : styles.confirmPickupBtnDisabled,
          ]}
          onPress={onConfirmPickup}
          disabled={pickupImages.length === 0}
          activeOpacity={0.85}
        >
          <Text
            style={[
              styles.confirmPickupBtnText,
              pickupImages.length > 0 ? styles.confirmPickupBtnTextActive : styles.confirmPickupBtnTextDisabled,
            ]}
          >
            Confirm pickup
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
