import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { Order } from '../../../store/useOrderStore';
import { KudiIcon } from '../../../components/KudiIcon';

interface TryAndBuyHandoverViewProps {
  order: Order;
  onConfirmHandover: () => void;
  onOpenMap?: () => void;
  handoverImages?: string[];
  onOpenCamera?: () => void;
  onRemoveImage?: (index: number) => void;
}

const defaultThumbnails = [
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=120&q=80',
  'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=120&q=80',
  'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=120&q=80',
];

const mockCaptureImages = [
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
      const nextImg = mockCaptureImages[internalImages.length % mockCaptureImages.length];
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
    // If text has multiple digits pasted or typed
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
  const isOtpComplete = otpArray.join('').length === 4;

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
                    source={{ uri: defaultThumbnails[index % defaultThumbnails.length] }}
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

      {/* 4. OTP VERIFICATION OVERLAY — CONSTRAINED INSIDE WINDOW */}
      {showOtpModal && (
        <View style={styles.modalBackdrop}>
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            onPress={() => setShowOtpModal(false)}
            activeOpacity={1}
          />
          <View style={styles.otpSheet}>
            {/* Sheet Handle */}
            <View style={styles.sheetHandle} />

            {/* Header */}
            <View style={styles.otpHeaderRow}>
              <View style={styles.otpShieldBadge}>
                <KudiIcon name="shield" size={18} color="#FF5A1F" />
              </View>
              <TouchableOpacity
                onPress={() => setShowOtpModal(false)}
                style={styles.closeModalBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <KudiIcon name="close" size={18} color="#65635F" />
              </TouchableOpacity>
            </View>

            <Text style={styles.otpTitle}>Enter customer OTP</Text>
            <Text style={styles.otpSubtitle}>
              Ask {order.customerName} for the 4-digit handover code shown on their KudiCart app.
            </Text>

            {/* Quick Demo Autofill Hint */}
            <TouchableOpacity
              style={styles.demoOtpChip}
              onPress={handleAutofill}
              activeOpacity={0.8}
            >
              <KudiIcon name="check" size={13} color="#FF5A1F" />
              <Text style={styles.demoOtpText}>Demo OTP: 4829  •  Tap to auto-fill</Text>
            </TouchableOpacity>

            {/* OTP 4-Box Input */}
            <View style={styles.otpBoxesRow}>
              {otpArray.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => { inputs.current[index] = ref; }}
                  style={[
                    styles.otpBox,
                    focusedIndex === index && styles.otpBoxFocused,
                    digit ? styles.otpBoxFilled : null,
                  ]}
                  value={digit}
                  onChangeText={(val) => handleOtpChange(val, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  onFocus={() => setFocusedIndex(index)}
                  onBlur={() => setFocusedIndex(null)}
                  keyboardType="number-pad"
                  maxLength={4}
                  textAlign="center"
                  selectTextOnFocus
                />
              ))}
            </View>

            {otpError ? (
              <Text style={styles.otpErrorText}>{otpError}</Text>
            ) : null}

            {/* Verify Button */}
            <TouchableOpacity
              style={[
                styles.verifyOtpBtn,
                isOtpComplete ? styles.verifyOtpBtnActive : styles.verifyOtpBtnDisabled,
              ]}
              onPress={handleVerifyOtp}
              disabled={!isOtpComplete}
              activeOpacity={0.88}
            >
              <Text
                style={[
                  styles.verifyOtpBtnText,
                  isOtpComplete ? styles.verifyOtpBtnTextActive : styles.verifyOtpBtnTextDisabled,
                ]}
              >
                Verify OTP & start trial
              </Text>
            </TouchableOpacity>

            {/* Resend Helper */}
            <View style={styles.resendOtpRow}>
              <Text style={styles.resendOtpLabel}>Didn't receive the OTP? </Text>
              <TouchableOpacity onPress={handleAutofill}>
                <Text style={styles.resendOtpLink}>Resend OTP</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F1EC',
    position: 'relative',
    overflow: 'hidden',
  },
  topBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2DED7',
  },
  topBarTitle: { fontSize: 17, fontWeight: '600', color: '#171716', letterSpacing: -0.2 },
  topBarOrderId: { fontSize: 12, fontWeight: '500', color: '#65635F' },

  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 24 },

  instructionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF0E8',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD9C7',
    marginBottom: 14,
    gap: 10,
  },
  instructionText: {
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
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#65635F',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  countBadge: {
    backgroundColor: '#F3F1EC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  countBadgeText: { fontSize: 11, fontWeight: '600', color: '#171716' },

  customerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  customerName: { fontSize: 16, fontWeight: '700', color: '#171716' },
  customerAddress: { fontSize: 14, color: '#65635F', marginTop: 4, lineHeight: 20 },
  customerActions: { flexDirection: 'row', gap: 10 },
  actionCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2DED7',
    alignItems: 'center',
    justifyContent: 'center',
  },

  trialSpecRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  trialIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF0E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trialSpecTitle: { fontSize: 15, fontWeight: '700', color: '#171716' },
  trialSpecSub: { fontSize: 13, color: '#65635F', marginTop: 3, lineHeight: 18 },

  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  productBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F0ECE6',
  },
  productThumb: { width: 44, height: 44, borderRadius: 8, backgroundColor: '#E2DED7' },
  productInfo: { flex: 1 },
  productName: { fontSize: 14, fontWeight: '600', color: '#171716' },
  productVariant: { fontSize: 12, color: '#65635F', marginTop: 2 },
  productPrice: { fontSize: 13, fontWeight: '700', color: '#171716', marginTop: 2 },
  productQty: { fontSize: 14, fontWeight: '700', color: '#171716' },

  emptyText: { fontSize: 13, color: '#65635F', fontStyle: 'italic' },
  divider: { height: 1, backgroundColor: '#E2DED7', marginVertical: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 13, fontWeight: '600', color: '#65635F' },
  totalValue: { fontSize: 15, fontWeight: '700', color: '#171716' },

  // PHOTO CAPTURE COMPONENT
  photoHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  photoStatusTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  photoStatusTagReq: { backgroundColor: '#FFF0E8' },
  photoStatusTagDone: { backgroundColor: '#E8F5E9' },
  photoStatusTagText: { fontSize: 11, fontWeight: '700' },
  photoStatusTagTextReq: { color: '#FF5A1F' },
  photoStatusTagTextDone: { color: '#2E7D32' },

  photoCaptureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F8F6',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2DED7',
    gap: 12,
  },
  photoCaptureIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF0E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoCaptureTextWrap: { flex: 1 },
  photoCaptureTitle: { fontSize: 15, fontWeight: '700', color: '#171716' },
  photoCaptureSub: { fontSize: 12, color: '#65635F', marginTop: 2 },

  photoCapturedContainer: { gap: 12 },
  photoThumbsScroll: { flexDirection: 'row', gap: 10, paddingVertical: 4 },
  photoThumbWrapper: { position: 'relative' },
  photoThumb: { width: 72, height: 72, borderRadius: 10, backgroundColor: '#E2DED7' },
  removePhotoBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#171716',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMorePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    backgroundColor: '#F3F1EC',
    borderRadius: 8,
  },
  addMorePhotoText: { fontSize: 13, fontWeight: '600', color: '#171716' },

  // FOOTER
  footer: {
    padding: 16,
    paddingTop: 10,
    backgroundColor: '#FFFFFF',
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

  // OTP MODAL STYLES (ABSOLUTE OVERLAY CONSTRAINED INSIDE WINDOW)
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(23, 23, 22, 0.65)',
    justifyContent: 'flex-end',
    zIndex: 999,
  },
  otpSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderColor: '#E2DED7',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2DED7',
    alignSelf: 'center',
    marginBottom: 16,
  },
  otpHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  otpShieldBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF0E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeModalBtn: {
    padding: 6,
  },
  otpTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#171716',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  otpSubtitle: {
    fontSize: 14,
    color: '#65635F',
    lineHeight: 20,
    marginBottom: 16,
  },
  demoOtpChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF0E8',
    borderWidth: 1,
    borderColor: '#FFD9C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  demoOtpText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF5A1F',
  },
  otpBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  otpBox: {
    width: 58,
    height: 56,
    borderWidth: 1.5,
    borderColor: '#E2DED7',
    borderRadius: 12,
    backgroundColor: '#F9F8F6',
    fontSize: 22,
    fontWeight: '700',
    color: '#171716',
    textAlign: 'center',
  },
  otpBoxFocused: {
    borderColor: '#FF5A1F',
    backgroundColor: '#FFFFFF',
  },
  otpBoxFilled: {
    borderColor: '#171716',
    backgroundColor: '#FFFFFF',
  },
  otpErrorText: {
    color: '#D32F2F',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  verifyOtpBtn: {
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    marginBottom: 14,
  },
  verifyOtpBtnActive: {
    backgroundColor: '#FF5A1F',
  },
  verifyOtpBtnDisabled: {
    backgroundColor: '#D9D0C9',
  },
  verifyOtpBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  verifyOtpBtnTextActive: {
    color: '#171716',
  },
  verifyOtpBtnTextDisabled: {
    color: '#8A8781',
  },
  resendOtpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendOtpLabel: {
    fontSize: 13,
    color: '#65635F',
  },
  resendOtpLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF5A1F',
  },
});
