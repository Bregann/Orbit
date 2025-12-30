import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { StyleSheet, useColorScheme, View } from 'react-native';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: string;
  iconColor: string;
}

export function StatCard({ title, value, icon, iconColor }: StatCardProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <ThemedView
      style={[
        styles.card,
        {
          backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
          borderColor: isDark ? '#334155' : '#E2E8F0',
        },
      ]}
    >
      <View style={styles.iconContainer}>
        <ThemedText style={[styles.icon, { color: iconColor }]}>{icon}</ThemedText>
      </View>
      <View style={styles.content}>
        <ThemedText style={styles.title}>{title}</ThemedText>
        <ThemedText style={styles.value}>{value}</ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    minWidth: 140,
  },
  iconContainer: {
    marginBottom: 8,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    gap: 4,
  },
  title: {
    fontSize: 13,
    opacity: 0.7,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
  },
});
