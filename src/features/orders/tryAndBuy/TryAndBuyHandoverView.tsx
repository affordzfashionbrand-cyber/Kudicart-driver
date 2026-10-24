import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { Order } from '../../../store/useOrderStore';
import { KudiIcon } from '../../../components/KudiIcon';
import { styles } from './handover.styles';
import { TryAndBuyOtpModal } from './TryAndBuyOtpModal';

interface TryAndBuyHandoverViewProps {
  order: Order;
  onConfirmHandover: () => void;
  onOpenMap?: () => void;
  handoverImages?: string[];
  onOpenCamera?: () => void;
  onRemoveImage?: (index: number) => void;
}

const DEFAULT_THUMBNAILS = [
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=120&q=80',
  'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=120&q=80',
  'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=120&q=80',
];

const MOCK_CAPTURE_IMAGES = [
  'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?w=400&q=80',
  'https://images.unsplash.com/photo-1622560480654-d96214fdc887?w=400&q=80',
  'https://images.unsplash.com/photo-1577705998148-6da4f3963bc8?w=400&q=80',
];

export const TryAndBuyHandoverView: React.FC<TryAndBuyHandoverViewProps> = ({
  order,
  onConfirmHandover,
  onOpenMap,
  handoverImages,
  onOpenCamera,
  onRemoveImage,
}) => {
  // Photo management (props with local fallback)
  const [internalImages, setInternalImages] = useState<string[]>([]);
  const images = handoverImages ?? internalImages;

  const handleOpenCamera = () => {
    if (onOpenCamera) {
      onOpenCamera();
    } else {
      const nextImg = MOCK_CAPTURE_IMAGES[internalImages.length % MOCK_CAPTURE_IMAGES.length];
      setInternalImages([...internalImages, nextImg]);
    }
  };

  const handleRemoveImage = (idx: number) => {
    if (onRemoveImage) {
      onRemoveImage(idx);
    } else {
      setInternalImages(internalImages.filter((_, i) => i !== idx));
    }
  };

  // OTP Verification state & handling
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpArray, setOtpArray] = useState(['', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleOtpChange = (text: string, index: number) => {
    const cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length > 1) {
      const chars = cleaned.slice(0, 4).split('');
      const newOtp = ['', '', '', ''];
      chars.forEach((c, i) => {
        if (i < 4) newOtp[i] = c;
      });
      setOtpArray(newOtp);
      setOtpError('');
      const nextIdx = Math.min(chars.length - 1, 3);
      inputs.current[nextIdx]?.focus();
      return;
    }

    const newOtp = [...otpArray];
    newOtp[index] = cleaned;
    setOtpArray(newOtp);
    setOtpError('');

    if (cleaned && index < 3) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otpArray[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleAutofill = () => {
    setOtpArray(['4', '8', '2', '9']);
    setOtpError('');
    inputs.current[3]?.focus();
  };

  const handleVerifyOtp = () => {
    const code = otpArray.join('');
    if (code.length < 4) {
      setOtpError('Please enter all 4 digits of the customer OTP');
      return;
    }
    setShowOtpModal(false);
    onConfirmHandover();
  };

  const hasPhotos = images.length > 0;

  return (
    <View style={styles.container}>
      {/* 1. TOP BAR — NO BACK BUTTON */}
      <View style={styles.topBar}>
        <View style={{ width: 36 }} />
        <Text style={styles.topBarTitle}>Customer handover</Text>
        <Text style={styles.topBarOrderId}>{order.id}</Text>
      </View>

      {/* 2. SCROLL CONTENT */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* INSTRUCTION BANNER */}
        <View style={styles.instructionBanner}>
          <KudiIcon name="package" size={16} color="#FF5A1F" />
          <Text style={styles.instructionText}>
            Hand over all items to the customer. The 20-minute trial starts once handover is confirmed with OTP.
          </Text>
        </View>

        {/* CUSTOMER DETAILS CARD */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Deliver to customer</Text>
          <View style={styles.customerRow}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Text style={styles.customerName}>{order.customerName}</Text>
              <Text style={styles.customerAddress}>{order.customerAddress}</Text>
            </View>
            <View style={styles.customerActions}>
              <TouchableOpacity
                style={styles.actionCircle}
                accessibilityRole="button"
                accessibilityLabel="Call customer"
              >
                <KudiIcon name="phone" size={18} color="#FF5A1F" />
              </TouchableOpacity>
              {onOpenMap && (
                <TouchableOpacity
                  style={styles.actionCircle}
                  onPress={onOpenMap}
                  accessibilityRole="button"
                  accessibilityLabel="View map"
                >
                  <KudiIcon name="navigation" size={18} color="#FF5A1F" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* TRIAL DURATION SPECS */}
        <View style={styles.card}>
          <Text style={styles.sectionLabel}>Trial policy</Text>
          <View style={styles.trialSpecRow}>
            <View style={styles.trialIconWrap}>
              <KudiIcon name="clock" size={20} color="#FF5A1F" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.trialSpecTitle}>20 Minutes Trial Period</Text>
              <Text style={styles.trialSpecSub}>
                Customer will try the garments and make Keep or Return selections directly in their app.
              </Text>
            </View>
          </View>
        </View>

        {/* HANDOVER ITEMS LIST */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.sectionLabel}>Items for handover</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{order.items?.length || order.itemsCount} items</Text>
            </View>
          </View>

          {order.items && order.items.length > 0 ? (
            order.items.map((item, index) => {
              const isLast = index === order.items!.length - 1;
              return (
                <View
                  key={item.id || index}
                  style={[styles.productRow, !isLast && styles.productBorder]}
                >
                  <Image
                    source={{ uri: DEFAULT_THUMBNAILS[index % DEFAULT_THUMBNAILS.length] }}
                    style={styles.productThumb}
                    resizeMode="cover"
                  />
                  <View style={styles.productInfo}>
                    <Text style={styles.productName}>{item.name}</Text>
                    {item.variant ? (
                      <Text style={styles.productVariant}>{item.variant}</Text>
                    ) : null}
                    <Text style={styles.productPrice}>₹{item.price.toLocaleString('en-IN')}</Text>
                  </View>
                  <Text style={styles.productQty}>×{item.quantity}</Text>
                </View>
              );
            })
          ) : (
            <Text style={styles.emptyText}>Package items ready for handover</Text>
          )}

          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total trial value</Text>
            <Text style={styles.totalValue}>
              ₹{(order.originalTotal || 3997).toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        {/* PACKAGE PHOTO CARD */}
        <View style={styles.card}>
          <View style={styles.photoHeaderRow}>
            <Text style={styles.sectionLabel}>Package photo</Text>
            <View style={[styles.photoStatusTag, hasPhotos ? styles.photoStatusTagDone : styles.photoStatusTagReq]}>
              <Text style={[styles.photoStatusTagText, hasPhotos ? styles.photoStatusTagTextDone : styles.photoStatusTagTextReq]}>
                {hasPhotos ? 'Photo captured' : 'Required'}
              </Text>
            </View>
          </View>

          {hasPhotos ? (
            <View style={styles.photoCapturedContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.photoThumbsScroll}
              >
                {images.map((uri, idx) => (
                  <View key={idx} style={styles.photoThumbWrapper}>
                    <Image source={{ uri }} style={styles.photoThumb} />
                    <TouchableOpacity
                      style={styles.removePhotoBtn}
                      onPress={() => handleRemoveImage(idx)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <KudiIcon name="close" size={12} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
              <TouchableOpacity
                style={styles.addMorePhotoBtn}
                onPress={handleOpenCamera}
                activeOpacity={0.8}
              >
                <KudiIcon name="camera" size={16} color="#171716" />
                <Text style={styles.addMorePhotoText}>Add another photo</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.photoCaptureCard}
              onPress={handleOpenCamera}
              activeOpacity={0.8}
            >
              <View style={styles.photoCaptureIconWrap}>
                <KudiIcon name="camera" size={20} color="#FF5A1F" />
              </View>
              <View style={styles.photoCaptureTextWrap}>
                <Text style={styles.photoCaptureTitle}>Take package photo</Text>
                <Text style={styles.photoCaptureSub}>Capture package handed over to customer</Text>
              </View>
              <KudiIcon name="chevron-right" size={18} color="#65635F" />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>

      {/* 3. FIXED BOTTOM ACTION */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.primaryBtn,
            hasPhotos ? styles.primaryBtnActive : styles.primaryBtnDisabled,
          ]}
          onPress={() => setShowOtpModal(true)}
          disabled={!hasPhotos}
          activeOpacity={0.88}
        >
          <Text
            style={[
              styles.primaryBtnText,
              hasPhotos ? styles.primaryBtnTextActive : styles.primaryBtnTextDisabled,
            ]}
          >
            Confirm handover & start trial
          </Text>
        </TouchableOpacity>
      </View>

      {/* 4. OTP VERIFICATION OVERLAY */}
      <TryAndBuyOtpModal
        visible={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        customerName={order.customerName}
        otpArray={otpArray}
        otpError={otpError}
        focusedIndex={focusedIndex}
        inputs={inputs}
        onOtpChange={handleOtpChange}
        onKeyPress={handleKeyPress}
        onFocus={(idx) => setFocusedIndex(idx)}
        onBlur={() => setFocusedIndex(null)}
        onAutofill={handleAutofill}
        onVerifyOtp={handleVerifyOtp}
      />
    </View>
  );
};
