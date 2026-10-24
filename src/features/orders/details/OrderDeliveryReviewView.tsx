import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { Order } from '../../../store/useOrderStore';
import { KudiIcon } from '../../../components/KudiIcon';
import { styles } from './orderDetails.styles';

interface OrderDeliveryReviewViewProps {
  order: Order;
  deliveryImages: string[];
  setDeliveryImages: (images: string[]) => void;
  onOpenCamera: () => void;
  onOpenMap: () => void;
  onConfirmDelivery: () => void;
  defaultProductThumbnails: string[];
}

export const OrderDeliveryReviewView: React.FC<OrderDeliveryReviewViewProps> = ({
  order,
  deliveryImages,
  setDeliveryImages,
  onOpenCamera,
  onOpenMap,
  onConfirmDelivery,
  defaultProductThumbnails,
}) => {
  return (
    <SafeAreaView style={[styles.main, { backgroundColor: '#F3F1EC' }]}>
      {/* 1. TOP NAVIGATION BAR */}
      <View style={styles.topBar}>
        <View style={{ width: 36 }} />
        <Text style={styles.topBarTitle}>Complete delivery</Text>
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
          <View style={styles.instructionBanner}>
            <KudiIcon name="package" size={16} color="#FF5A1F" />
            <Text style={styles.instructionText}>Hand over the package to the customer.</Text>
          </View>

          {/* DELIVER TO */}
          <View style={styles.reviewCard}>
            <Text style={styles.reviewSectionLabel}>Deliver to</Text>

            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginTop: 4 }}>
              <View style={{ flex: 1, paddingRight: 16 }}>
                <Text style={styles.pickupStoreName}>{order.customerName}</Text>
                <Text style={{ fontSize: 15, color: '#65635F', marginTop: 4, lineHeight: 22 }}>{order.customerAddress}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
                <TouchableOpacity style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2DED7' }}>
                  <KudiIcon name="phone" size={18} color="#FF5A1F" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2DED7' }}
                  onPress={onOpenMap}
                >
                  <KudiIcon name="navigation" size={18} color="#FF5A1F" />
                </TouchableOpacity>
              </View>
            </View>
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

          {/* DELIVERY PHOTO */}
          <View style={styles.reviewCard}>
            <View style={styles.photoHeaderRow}>
              <Text style={styles.reviewSectionLabel}>Delivery photo</Text>
              <View style={[styles.photoStatusTag, deliveryImages.length > 0 ? styles.photoStatusTagDone : styles.photoStatusTagReq]}>
                <Text style={[styles.photoStatusTagText, deliveryImages.length > 0 ? styles.photoStatusTagTextDone : styles.photoStatusTagTextReq]}>
                  {deliveryImages.length > 0 ? 'Photo captured' : 'Required'}
                </Text>
              </View>
            </View>

            {deliveryImages.length > 0 ? (
              <View style={styles.photoCapturedContainer}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.photoThumbsScroll}
                >
                  {deliveryImages.map((uri, idx) => (
                    <View key={idx} style={styles.photoThumbWrapper}>
                      <Image source={{ uri }} style={styles.photoThumb} />
                      <TouchableOpacity
                        style={styles.removePhotoBtn}
                        onPress={() => setDeliveryImages(deliveryImages.filter((_, i) => i !== idx))}
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
                  <Text style={styles.photoCaptureTitle}>Take delivery photo</Text>
                  <Text style={styles.photoCaptureSub}>Capture handover or drop-off location</Text>
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
            deliveryImages.length > 0 ? styles.confirmPickupBtnActive : styles.confirmPickupBtnDisabled,
          ]}
          onPress={onConfirmDelivery}
          disabled={deliveryImages.length === 0}
          activeOpacity={0.85}
        >
          <Text
            style={[
              styles.confirmPickupBtnText,
              deliveryImages.length > 0 ? styles.confirmPickupBtnTextActive : styles.confirmPickupBtnTextDisabled,
            ]}
          >
            Mark Delivered
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
