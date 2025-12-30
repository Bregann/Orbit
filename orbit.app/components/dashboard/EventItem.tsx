import { ThemedText } from '@/components/themed-text';
import { createCommonStyles } from '@/styles/commonStyles';
import { useColorScheme, View } from 'react-native';

interface EventItemProps {
  title: string;
  dateTime: string;
}

export function EventItem({ title, dateTime }: EventItemProps) {
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
