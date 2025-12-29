import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { authApiClient } from '@/helpers/apiClient';
import { GetDashboardOverviewDataDto } from '@/interfaces/api/dashboard/GetDashboardOverviewDataDto';
import { GetTodaysMoodResponse } from '@/interfaces/api/mood/GetTodaysMoodResponse';
import { MoodType } from '@/interfaces/api/mood/MoodType';
import { RecordMoodRequest } from '@/interfaces/api/mood/RecordMoodRequest';
import { TaskPriorityType } from '@/interfaces/api/tasks/TaskPriorityType';
import { createCommonStyles } from '@/styles/commonStyles';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import moment from 'moment';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const styles = createCommonStyles(colorScheme ?? 'light');
  const customStyles = createCustomStyles(colorScheme ?? 'light');
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await authApiClient.get<GetDashboardOverviewDataDto>('/api/Dashboard/GetDashboardOverviewData');
      return response.data;
    },
  });

  const { data: moodData, isLoading: isLoadingMood } = useQuery({
    queryKey: ['todays-mood'],
    queryFn: async () => {
      const response = await authApiClient.get<GetTodaysMoodResponse>('/api/Mood/GetTodaysMood');
      return response.data;
    },
  });

  const recordMoodMutation = useMutation({
    mutationFn: async (mood: MoodType) => {
      const request: RecordMoodRequest = { mood };
      const response = await authApiClient.post('/api/Mood/RecordMood', request);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todays-mood'] });
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to record mood');
      console.error('Record mood error:', error);
    },
  });

  const handleMoodPress = (mood: MoodType, label: string) => {
    // Prevent changing mood if already recorded today
    if (moodData?.hasMoodToday) {
      Alert.alert(
        'Mood Already Recorded',
        'You have already recorded your mood for today. You can record a new mood tomorrow.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Record Mood',
      `Record your mood as "${label}" for today?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => recordMoodMutation.mutate(mood),
        },
      ]
    );
  };

  if (isLoading || isLoadingMood) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.tint} />
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <ThemedText style={{ textAlign: 'center', marginBottom: 12 }}>Failed to load dashboard</ThemedText>
          <ThemedText style={{ textAlign: 'center', opacity: 0.6 }}>{(error as Error).message}</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ThemedView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title">Dashboard</ThemedText>
          <ThemedText style={styles.subtitle}>At a Glance</ThemedText>
        </View>

        {/* Mood Warning Banner */}
        {!moodData?.hasMoodToday && (
          <View style={[
            customStyles.warningBanner,
            {
              backgroundColor: colorScheme === 'dark' ? '#7C2D12' : '#FEF3C7',
              borderColor: colorScheme === 'dark' ? '#EA580C' : '#F59E0B',
            }
          ]}>
            <IconSymbol name="exclamationmark.triangle.fill" size={20} color="#F59E0B" />
            <ThemedText style={[customStyles.warningText, { color: colorScheme === 'dark' ? '#FDE68A' : '#92400E' }]}>
              You haven&apos;t recorded your mood today
            </ThemedText>
          </View>
        )}

        {/* Stats Grid - 2x2 */}
        <View style={{ gap: 12, marginBottom: 24 }}>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { borderLeftColor: colors.tint }]}>
              <ThemedText style={styles.statLabel}>Money Left</ThemedText>
              <ThemedText type="title" style={styles.statValue}>
                {data?.moneyLeft || '£0.00'}
              </ThemedText>
              <ThemedText style={styles.statPeriod}>This Month</ThemedText>
            </View>

            <View style={[styles.statCard, { borderLeftColor: '#FF6B6B' }]}>
              <ThemedText style={styles.statLabel}>Money Spent</ThemedText>
              <ThemedText type="title" style={styles.statValue}>
                {data?.moneySpent || '£0.00'}
              </ThemedText>
              <ThemedText style={styles.statPeriod}>This Month</ThemedText>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { borderLeftColor: '#4ECDC4' }]}>
              <ThemedText style={styles.statLabel}>Tasks Completed</ThemedText>
              <ThemedText type="title" style={styles.statValue}>
                {data?.tasksCompleted || 0}/{data?.totalTasks || 0}
              </ThemedText>
              <ThemedText style={styles.statPeriod}>Today</ThemedText>
            </View>

            <View style={[styles.statCard, { borderLeftColor: '#95E1D3' }]}>
              <ThemedText style={styles.statLabel}>Events Scheduled</ThemedText>
              <ThemedText type="title" style={styles.statValue}>
                {data?.eventsScheduled || 0}
              </ThemedText>
              <ThemedText style={styles.statPeriod}>Next 7 Days</ThemedText>
            </View>
          </View>
        </View>

        {/* How Are You Feeling Today Section */}
        <View style={styles.sectionContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            How are you feeling today?
          </ThemedText>
          <View style={customStyles.moodsContainer}>
            <MoodButton
              mood={MoodType.Excellent}
              label="Excellent"
              emoji="😊"
              color="#10B981"
              isSelected={moodData?.mood === MoodType.Excellent}
              onPress={() => handleMoodPress(MoodType.Excellent, 'Excellent')}
              disabled={recordMoodMutation.isPending || moodData?.hasMoodToday || false}
            />
            <MoodButton
              mood={MoodType.Good}
              label="Good"
              emoji="🙂"
              color="#3B82F6"
              isSelected={moodData?.mood === MoodType.Good}
              onPress={() => handleMoodPress(MoodType.Good, 'Good')}
              disabled={recordMoodMutation.isPending || moodData?.hasMoodToday || false}
            />
            <MoodButton
              mood={MoodType.Neutral}
              label="Neutral"
              emoji="😐"
              color="#F59E0B"
              isSelected={moodData?.mood === MoodType.Neutral}
              onPress={() => handleMoodPress(MoodType.Neutral, 'Neutral')}
              disabled={recordMoodMutation.isPending || moodData?.hasMoodToday || false}
            />
            <MoodButton
              mood={MoodType.Low}
              label="Low"
              emoji="😔"
              color="#F97316"
              isSelected={moodData?.mood === MoodType.Low}
              onPress={() => handleMoodPress(MoodType.Low, 'Low')}
              disabled={recordMoodMutation.isPending || moodData?.hasMoodToday || false}
            />
            <MoodButton
              mood={MoodType.Difficult}
              label="Difficult"
              emoji="😞"
              color="#EF4444"
              isSelected={moodData?.mood === MoodType.Difficult}
              onPress={() => handleMoodPress(MoodType.Difficult, 'Difficult')}
              disabled={recordMoodMutation.isPending || moodData?.hasMoodToday || false}
            />
          </View>
        </View>

        {/* Quick Access Section */}
        <View style={styles.sectionContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Quick Access
          </ThemedText>
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
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
            <TouchableOpacity onPress={() => router.push('/(stack)/tasks')}>
              <ThemedText style={[styles.viewAllLink, { color: colors.tint }]}>
                View All →
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.itemsList}>
            {data?.upcomingTasks && data.upcomingTasks.length > 0 ? (
              data.upcomingTasks.slice(0, 3).map((task) => (
                <TaskItem
                  key={task.taskId}
                  title={task.taskTitle}
                  date={task.dueDate ? moment(task.dueDate).format('D MMM') : 'No date'}
                  priority={task.priority}
                />
              ))
            ) : (
              <ThemedText style={{ opacity: 0.6, textAlign: 'center', paddingVertical: 16 }}>
                No upcoming tasks
              </ThemedText>
            )}
          </View>
        </View>

        {/* Upcoming Events Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Upcoming Events
            </ThemedText>
            <TouchableOpacity onPress={() => router.push('/(tabs)/calendar')}>
              <ThemedText style={[styles.viewAllLink, { color: colors.tint }]}>
                View All →
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.itemsList}>
            {data?.upcomingEvents && data.upcomingEvents.length > 0 ? (
              data.upcomingEvents.slice(0, 3).map((event) => (
                <EventItem
                  key={event.eventId}
                  title={event.eventTitle}
                  dateTime={
                    event.isAllDay
                      ? moment(event.eventDate).format('D MMM YYYY')
                      : moment(event.eventDate).format('D MMM YYYY, HH:mm')
                  }
                />
              ))
            ) : (
              <ThemedText style={{ opacity: 0.6, textAlign: 'center', paddingVertical: 16 }}>
                No upcoming events
              </ThemedText>
            )}
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
  priority: TaskPriorityType;
}) {
  const styles = createCommonStyles(useColorScheme() ?? 'light');
  
  const getPriorityColor = (priority: TaskPriorityType) => {
    switch (priority) {
      case TaskPriorityType.Critical: return '#DC2626';
      case TaskPriorityType.High: return '#EF4444';
      case TaskPriorityType.Medium: return '#F59E0B';
      case TaskPriorityType.Low: return '#10B981';
      default: return '#95E1D3';
    }
  };

  const priorityColor = getPriorityColor(priority);

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

function MoodButton({
  mood,
  label,
  emoji,
  color,
  isSelected,
  onPress,
  disabled,
}: {
  mood: MoodType;
  label: string;
  emoji: string;
  color: string;
  isSelected: boolean;
  onPress: () => void;
  disabled: boolean;
}) {
  const colorScheme = useColorScheme();
  const styles = createCustomStyles(colorScheme ?? 'light');

  return (
    <TouchableOpacity
      style={[
        styles.moodButton,
        isSelected && { backgroundColor: color + '20', borderColor: color, borderWidth: 2 },
        {
          backgroundColor: isSelected ? color + '20' : (colorScheme === 'dark' ? '#1E293B' : '#F8FAFC'),
          borderColor: isSelected ? color : (colorScheme === 'dark' ? '#334155' : '#E2E8F0'),
        }
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <ThemedText style={styles.moodEmoji}>{emoji}</ThemedText>
      <ThemedText style={[styles.moodLabel, isSelected && { color, fontWeight: '700' }]}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
}

function createCustomStyles(colorScheme: 'light' | 'dark') {
  return StyleSheet.create({
    warningBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 12,
      borderRadius: 10,
      borderWidth: 1,
      marginBottom: 16,
    },
    warningText: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
    },
    moodsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 8,
      marginTop: 12,
    },
    moodButton: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      paddingHorizontal: 4,
      borderRadius: 12,
      borderWidth: 1,
      gap: 6,
      overflow: 'visible',
    },
    moodEmoji: {
      fontSize: 28,
      lineHeight: 32,
    },
    moodLabel: {
      fontSize: 11,
      fontWeight: '500',
      textAlign: 'center',
    },
  });
}
