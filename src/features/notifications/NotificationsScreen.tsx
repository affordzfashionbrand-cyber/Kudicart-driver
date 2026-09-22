import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { ScreenContainer } from '../../components/ScreenContainer';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';
import { colors } from '../../theme/colors';
import { useNotificationStore } from '../../store/useNotificationStore';

export const NotificationsScreen = () => {
  const { notifications } = useNotificationStore();

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        {notifications.length === 0 ? (
          <Text>No new notifications</Text>
        ) : (
          notifications.map(notif => (
            <View key={notif.id} style={styles.card}>
              <Text style={styles.title}>{notif.title}</Text>
              <Text style={styles.body}>{notif.body}</Text>
              <Text style={styles.time}>{notif.timestamp}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: { padding: spacing.l, backgroundColor: colors.surface, borderBottomWidth: 1, borderColor: colors.border },
  headerTitle: { ...typography.h3 },
  container: { padding: spacing.m },
  card: { padding: spacing.m, backgroundColor: colors.surface, borderRadius: 12, marginBottom: spacing.m, borderWidth: 1, borderColor: colors.border },
  title: { ...typography.h4, marginBottom: spacing.xs },
  body: { ...typography.body },
  time: { ...typography.caption, color: colors.textMuted, marginTop: spacing.xs },
});
