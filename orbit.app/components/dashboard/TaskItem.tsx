import { ThemedText } from '@/components/themed-text';
import { TaskPriorityType } from '@/interfaces/api/tasks/TaskPriorityType';
import { createCommonStyles } from '@/styles/commonStyles';
import { useColorScheme, View } from 'react-native';

interface TaskItemProps {
  title: string;
  date: string;
  priority: TaskPriorityType;
}

export function TaskItem({ title, date, priority }: TaskItemProps) {
  const styles = createCommonStyles(useColorScheme() ?? 'light');
  
  const getPriorityColour = (priority: TaskPriorityType) => {
    switch (priority) {
      case TaskPriorityType.Critical: return '#DC2626';
      case TaskPriorityType.High: return '#EF4444';
      case TaskPriorityType.Medium: return '#F59E0B';
      case TaskPriorityType.Low: return '#10B981';
      default: return '#95E1D3';
    }
  };

  const priorityColour = getPriorityColour(priority);

  return (
    <View style={[styles.listItem, styles.taskItem]}>
      <View style={[styles.priorityDot, { backgroundColor: priorityColour }]} />
      <View style={styles.taskContent}>
        <ThemedText style={styles.taskTitle}>{title}</ThemedText>
      </View>
      <View style={styles.taskDate}>
        <ThemedText style={[styles.taskDateText, { color: priorityColour }]}>
          {date}
        </ThemedText>
      </View>
    </View>
  );
}
