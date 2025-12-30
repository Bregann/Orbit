import { EventItem } from '@/components/dashboard/EventItem';
import { MoodButton } from '@/components/dashboard/MoodButton';
import { QuickActionButton } from '@/components/dashboard/QuickActionButton';
import { TaskItem } from '@/components/dashboard/TaskItem';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { authApiClient } from '@/helpers/apiClient';
import { useMutationPost } from '@/helpers/mutations/useMutationPost';
import { GetDashboardOverviewDataDto } from '@/interfaces/api/dashboard/GetDashboardOverviewDataDto';
import { GetTodaysMoodResponse } from '@/interfaces/api/mood/GetTodaysMoodResponse';
import { MoodType } from '@/interfaces/api/mood/MoodType';
import { RecordMoodRequest } from '@/interfaces/api/mood/RecordMoodRequest';
import { createCommonStyles } from '@/styles/commonStyles';
import { createIndexStyles } from '@/styles/indexStyles';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import moment from 'moment';
import { ActivityIndicator, Alert, ScrollView, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const styles = createCommonStyles(colorScheme ?? 'light');
  const customStyles = createIndexStyles(colorScheme ?? 'light');
  const router = useRouter();

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

  const recordMoodMutation = useMutationPost<RecordMoodRequest, void>({
    url: '/api/Mood/RecordMood',
    queryKey: ['todays-mood'],
    invalidateQuery: true,
    onError: () => {
      Alert.alert('Error', 'Failed to record mood');
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
          onPress: () => recordMoodMutation.mutate({ mood }),
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
              colour="#10B981"
              isSelected={moodData?.mood === MoodType.Excellent}
              onPress={() => handleMoodPress(MoodType.Excellent, 'Excellent')}
              disabled={recordMoodMutation.isPending || moodData?.hasMoodToday || false}
            />
            <MoodButton
              mood={MoodType.Good}
              label="Good"
              emoji="🙂"
              colour="#3B82F6"
              isSelected={moodData?.mood === MoodType.Good}
              onPress={() => handleMoodPress(MoodType.Good, 'Good')}
              disabled={recordMoodMutation.isPending || moodData?.hasMoodToday || false}
            />
            <MoodButton
              mood={MoodType.Neutral}
              label="Neutral"
              emoji="😐"
              colour="#F59E0B"
              isSelected={moodData?.mood === MoodType.Neutral}
              onPress={() => handleMoodPress(MoodType.Neutral, 'Neutral')}
              disabled={recordMoodMutation.isPending || moodData?.hasMoodToday || false}
            />
            <MoodButton
              mood={MoodType.Low}
              label="Low"
              emoji="😔"
              colour="#F97316"
              isSelected={moodData?.mood === MoodType.Low}
              onPress={() => handleMoodPress(MoodType.Low, 'Low')}
              disabled={recordMoodMutation.isPending || moodData?.hasMoodToday || false}
            />
            <MoodButton
              mood={MoodType.Difficult}
              label="Difficult"
              emoji="😞"
              colour="#EF4444"
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
