import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import moment from 'moment';
import { StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';

interface EventListItemProps {
  eventName: string;
  startTime: string;
  endTime: string;
  isAllDay: boolean;
  colour: string;
  onPress?: () => void;
}

export function EventListItem({
  eventName,
  startTime,
  endTime,
  isAllDay,
  colour,
  onPress,
}: EventListItemProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const formatEventTime = () => {
    if (isAllDay) {
      return moment(startTime).format('DD MMM');
    }
    const start = moment(startTime);
    const formattedDate = start.format('DD MMM');
    const formattedTime = start.format('HH:mm');
    return `${formattedDate} · ${formattedTime}`;
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <ThemedView
        style={[
          styles.container,
          {
            backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
            borderColor: isDark ? '#334155' : '#E2E8F0',
          },
        ]}
      >
        <View style={[styles.colorIndicator, { backgroundColor: colour }]} />
        <View style={styles.content}>
          <ThemedText style={styles.eventName} numberOfLines={1}>
            {eventName}
          </ThemedText>
          <ThemedText style={styles.eventTime}>{formatEventTime()}</ThemedText>
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    gap: 12,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  eventName: {
    fontSize: 15,
    fontWeight: '600',
  },
  eventTime: {
    fontSize: 13,
    opacity: 0.7,
  },
});
