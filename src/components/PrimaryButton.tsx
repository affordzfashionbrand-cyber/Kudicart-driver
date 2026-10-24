import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing } from '../theme/spacing';

interface Props {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: any;
  textStyle?: any;
}

export const PrimaryButton = ({ title, onPress, disabled, loading, style, textStyle }: Props) => {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={disabled ? colors.textSecondary : colors.white} />
      ) : (
        <Text style={[styles.text, disabled && styles.textDisabled, textStyle]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    height: 48, // Standard 48px height
    paddingHorizontal: spacing.l,
    borderRadius: 16, // Matches input border radius
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  disabled: {
    backgroundColor: colors.border, // #E2DED7 readable neutral styling
  },
  text: {
    ...typography.button,
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  textDisabled: {
    color: colors.textSecondary, // #65635F dark readable text on neutral background
  },
});
