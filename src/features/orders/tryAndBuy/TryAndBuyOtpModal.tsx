import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { KudiIcon } from '../../../components/KudiIcon';
import { styles } from './handover.styles';

interface TryAndBuyOtpModalProps {
  visible: boolean;
  onClose: () => void;
  customerName: string;
  otpArray: string[];
  otpError: string;
  focusedIndex: number | null;
  inputs: React.MutableRefObject<(TextInput | null)[]>;
  onOtpChange: (text: string, index: number) => void;
  onKeyPress: (e: any, index: number) => void;
  onFocus: (index: number) => void;
  onBlur: () => void;
  onAutofill?: () => void;
  onVerifyOtp: () => void;
}

export const TryAndBuyOtpModal: React.FC<TryAndBuyOtpModalProps> = ({
  visible,
  onClose,
  customerName,
  otpArray,
  otpError,
  focusedIndex,
  inputs,
  onOtpChange,
  onKeyPress,
  onFocus,
  onBlur,
  onVerifyOtp,
}) => {
  if (!visible) return null;

  const isOtpComplete = otpArray.join('').length === 4;

  return (
    <View style={styles.modalBackdrop}>
      <TouchableOpacity
        style={StyleSheet.absoluteFillObject}
        onPress={onClose}
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
            onPress={onClose}
            style={styles.closeModalBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <KudiIcon name="close" size={18} color="#65635F" />
          </TouchableOpacity>
        </View>

        <Text style={styles.otpTitle}>Enter customer OTP</Text>
        <Text style={styles.otpSubtitle}>
          Ask {customerName} for the 4-digit handover code shown on their KudiCart app.
        </Text>

        {/* OTP 4-Box Input */}
        <View style={styles.otpBoxesRow}>
          {otpArray.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputs.current[index] = ref;
              }}
              style={[
                styles.otpBox,
                focusedIndex === index && styles.otpBoxFocused,
                digit ? styles.otpBoxFilled : null,
              ]}
              value={digit}
              onChangeText={(val) => onOtpChange(val, index)}
              onKeyPress={(e) => onKeyPress(e, index)}
              onFocus={() => onFocus(index)}
              onBlur={onBlur}
              keyboardType="number-pad"
              maxLength={4}
              textAlign="center"
              selectTextOnFocus
            />
          ))}
        </View>

        {otpError ? <Text style={styles.otpErrorText}>{otpError}</Text> : null}

        {/* Verify Button */}
        <TouchableOpacity
          style={[
            styles.verifyOtpBtn,
            isOtpComplete ? styles.verifyOtpBtnActive : styles.verifyOtpBtnDisabled,
          ]}
          onPress={onVerifyOtp}
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
          <Text style={styles.resendOtpLabel}>Ask customer to check the active handover code on their KudiCart app.</Text>
        </View>
      </View>
    </View>
  );
};
