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
}

export const PrimaryButton = ({ title, onPress, disabled, loading }: Props) => {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    height: 56, // Large, comfortable touch target
    paddingHorizontal: spacing.l,
    borderRadius: 16, // Matches input border radius
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    ...typography.button,
    fontSize: 18, // Clearly readable size
  },
});
