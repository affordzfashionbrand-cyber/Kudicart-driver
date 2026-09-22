import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';

interface Props {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  edges?: readonly ('top' | 'right' | 'bottom' | 'left')[];
}

export const ScreenContainer = ({ children, style, edges = ['top', 'bottom'] }: Props) => {
  return (
    <SafeAreaView style={[styles.container, style]} edges={edges}>
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC', // Very light background with subtle dot grid normally, solid color for now
  },
});
