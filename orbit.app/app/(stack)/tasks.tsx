import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { createCommonStyles } from '@/styles/commonStyles';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TasksScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const styles = createCommonStyles(colorScheme ?? 'light');

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ThemedView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title">Tasks</ThemedText>
          <ThemedText style={styles.subtitle}>Manage your to-do list</ThemedText>
        </View>

        {/* Tasks List Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              All Tasks
            </ThemedText>
            <TouchableOpacity>
              <ThemedText style={[styles.viewAllLink, { color: colors.tint }]}>
                Add →
              </ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.itemsList}>
            <TaskItem
              title="Book in Dani parcel"
              dueDate="17 Dec"
              priority="high"
              isCompleted={false}
            />
            <TaskItem
              title="Finish building Christmas factory"
              dueDate="20 Dec"
              priority="high"
              isCompleted={false}
            />
            <TaskItem
              title="Finish editing photos"
              dueDate="21 Dec"
              priority="low"
              isCompleted={false}
            />
            <TaskItem
              title="Convert Amazon and Spotify to yearly subs"
              dueDate="27 Dec"
              priority="low"
              isCompleted={false}
            />
          </View>
        </View>

        {/* Spacing */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </ThemedView>
    </SafeAreaView>
  );
}

function TaskItem({
  title,
  dueDate,
  priority,
  isCompleted,
}: {
  title: string;
  dueDate: string;
  priority: 'high' | 'low';
  isCompleted: boolean;
}) {
  const styles = createCommonStyles(useColorScheme() ?? 'light');
  const priorityColor = priority === 'high' ? '#FF6B6B' : '#95E1D3';

  return (
    <View style={[styles.listItem, styles.taskItem]}>
      <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
      <View style={styles.taskContent}>
        <ThemedText
          style={[
            styles.taskTitle,
            isCompleted && { textDecorationLine: 'line-through', opacity: 0.5 },
          ]}
        >
          {title}
        </ThemedText>
      </View>
      <View style={styles.taskDate}>
        <ThemedText style={[styles.taskDateText, { color: priorityColor }]}>
          {dueDate}
        </ThemedText>
      </View>
    </View>
  );
}
