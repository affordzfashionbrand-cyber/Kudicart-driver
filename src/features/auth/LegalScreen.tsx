import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { colors } from '../../theme/colors';
import { KudiIcon } from '../../components/KudiIcon';

export const LegalScreen = ({ navigation }: any) => {
  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <KudiIcon name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Legal Policies</Text>
        </View>
        <Text style={styles.content}>
          This is a dummy screen for Terms & Conditions and Privacy Policy.
          {"\n\n"}
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi.
          Phasellus tristique, nunc vitae faucibus commodo, eros eros lacinia libero, 
          vel volutpat purus erat eu leo. 
          {"\n\n"}
          Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
          Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        </Text>
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: spacing.l,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.m,
  },
  backButton: {
    ...typography.h2,
  },
  title: {
    ...typography.h1,
  },
  content: {
    ...typography.body,
    flex: 1,
  },
});
