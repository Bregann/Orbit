import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { createCommonStyles } from '@/styles/commonStyles';
import { useRouter } from 'expo-router';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const styles = createCommonStyles(colorScheme ?? 'light');
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ThemedView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title">Dashboard</ThemedText>
          <ThemedText style={styles.subtitle}>At a Glance</ThemedText>
        </View>

        {/* Stats Grid - 2x2 */}
        <View style={{ gap: 12, marginBottom: 24 }}>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { borderLeftColor: colors.tint }]}>
              <ThemedText style={styles.statLabel}>Money Left</ThemedText>
              <ThemedText type="title" style={styles.statValue}>
                ₹43,851.00
              </ThemedText>
              <ThemedText style={styles.statPeriod}>This Month</ThemedText>
            </View>

            <View style={[styles.statCard, { borderLeftColor: '#FF6B6B' }]}>
              <ThemedText style={styles.statLabel}>Money Spent</ThemedText>
              <ThemedText type="title" style={styles.statValue}>
                ₹16,202.00
              </ThemedText>
              <ThemedText style={styles.statPeriod}>This Month</ThemedText>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { borderLeftColor: '#4ECDC4' }]}>
              <ThemedText style={styles.statLabel}>Tasks Completed</ThemedText>
              <ThemedText type="title" style={styles.statValue}>
                2/4
              </ThemedText>
              <ThemedText style={styles.statPeriod}>Today</ThemedText>
            </View>

            <View style={[styles.statCard, { borderLeftColor: '#95E1D3' }]}>
              <ThemedText style={styles.statLabel}>Events Scheduled</ThemedText>
              <ThemedText type="title" style={styles.statValue}>
                6
              </ThemedText>
              <ThemedText style={styles.statPeriod}>Next 7 Days</ThemedText>
            </View>
          </View>
        </View>

        {/* Quick Access Section */}
        <View style={styles.sectionContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Quick Access
          </ThemedText>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
            <QuickActionButton
              icon="note.text"
              label="Notes"
              onPress={() => router.push('/(stack)/notes')}
            />
            <QuickActionButton
              icon="checkmark.circle.fill"
              label="Tasks"
              onPress={() => router.push('/(stack)/tasks')}
            />
            <QuickActionButton
              icon="gearshape.fill"
              label="Settings"
              onPress={() => router.push('/(stack)/settings')}
            />
          </View>
        </View>

        {/* Upcoming Tasks Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Upcoming Tasks
            </ThemedText>
            <TouchableOpacity>
              <ThemedText style={[styles.viewAllLink, { color: colors.tint }]}>
                View All →
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.itemsList}>
            <TaskItem
              title="Book in Dani parcel"
              date="17 Dec"
              priority="high"
            />
            <TaskItem
              title="Finish building Christmas factory"
              date="20 Dec"
              priority="high"
            />
            <TaskItem
              title="Finish editing photos"
              date="21 Dec"
              priority="low"
            />
          </View>
        </View>

        {/* Upcoming Events Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Upcoming Events
            </ThemedText>
            <TouchableOpacity>
              <ThemedText style={[styles.viewAllLink, { color: colors.tint }]}>
                View All →
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.itemsList}>
            <EventItem title="Work Christmas cover" dateTime="23 Dec 2025, 10:00" />
            <EventItem title="Mark Simmons" dateTime="7 Feb 2026, 19:30" />
            <EventItem title="An Evening with Diy Griffiths" dateTime="12 Feb 2026, 19:00" />
          </View>
        </View>

        {/* Spacing */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </ThemedView>
    </SafeAreaView>
  );
}

function QuickActionButton({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  const colorScheme = useColorScheme();
  const styles = createCommonStyles(colorScheme ?? 'light');
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <TouchableOpacity
      style={[styles.listItem, { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 }]}
      onPress={onPress}
    >
      <IconSymbol name={icon as any} size={28} color={colors.tint} />
      <ThemedText style={{ fontSize: 12, fontWeight: '500', textAlign: 'center' }}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
}

function TaskItem({
  title,
  date,
  priority,
}: {
  title: string;
  date: string;
  priority: 'high' | 'low';
}) {
  const styles = createCommonStyles(useColorScheme() ?? 'light');
  const priorityColor = priority === 'high' ? '#FF6B6B' : '#95E1D3';

  return (
    <View style={[styles.listItem, styles.taskItem]}>
      <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
      <View style={styles.taskContent}>
        <ThemedText style={styles.taskTitle}>{title}</ThemedText>
      </View>
      <View style={styles.taskDate}>
        <ThemedText style={[styles.taskDateText, { color: priorityColor }]}>
          {date}
        </ThemedText>
      </View>
    </View>
  );
}

function EventItem({ title, dateTime }: { title: string; dateTime: string }) {
  const styles = createCommonStyles(useColorScheme() ?? 'light');

  return (
    <View style={[styles.listItem, styles.eventItem]}>
      <View style={[styles.eventDot, { backgroundColor: '#4ECDC4' }]} />
      <View style={styles.eventContent}>
        <ThemedText style={styles.eventTitle}>{title}</ThemedText>
        <ThemedText style={styles.eventDateTime}>{dateTime}</ThemedText>
      </View>
    </View>
  );
}
