import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { authApiClient } from '@/helpers/apiClient';
import { EventEntry, GetCalendarEventsDto } from '@/interfaces/api/calendar/GetCalendarEventsDto';
import { GetCalendarEventTypesDto } from '@/interfaces/api/calendar/GetCalendarEventTypesDto';
import { createCommonStyles } from '@/styles/commonStyles';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import moment from 'moment';
import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RRule } from 'rrule';

interface ProcessedEvent extends EventEntry {
  displayDate: string; // The actual date this event occurs on (for recurring events)
}

// Mock data for demonstration
const mockCalendarData: GetCalendarEventsDto = {
  events: [
    {
      id: 1,
      eventName: 'Work Christmas cover',
      eventLocation: 'Office',
      description: 'Christmas shift coverage',
      startTime: '2025-12-29T10:00:00Z',
      endTime: '2025-12-29T18:00:00Z',
      isAllDay: false,
      recurrenceRule: null,
      calendarEventTypeId: 1,
      calendarEventTypeName: 'Work',
      calendarEventTypeColour: '#EF4444',
      documentId: null,
      documentFileName: null,
      documentFileType: null,
    },
    {
      id: 2,
      eventName: 'Mark Simmons',
      eventLocation: 'Coffee Shop',
      description: 'Catch up meeting',
      startTime: '2026-02-07T19:30:00Z',
      endTime: '2026-02-07T21:00:00Z',
      isAllDay: false,
      recurrenceRule: null,
      calendarEventTypeId: 2,
      calendarEventTypeName: 'Personal',
      calendarEventTypeColour: '#3B82F6',
      documentId: null,
      documentFileName: null,
      documentFileType: null,
    },
    {
      id: 3,
      eventName: 'An Evening with Elly Griffiths',
      eventLocation: 'Waterstones',
      description: 'Book signing event',
      startTime: '2026-02-12T19:00:00Z',
      endTime: '2026-02-12T21:00:00Z',
      isAllDay: false,
      recurrenceRule: null,
      calendarEventTypeId: 2,
      calendarEventTypeName: 'Personal',
      calendarEventTypeColour: '#3B82F6',
      documentId: null,
      documentFileName: null,
      documentFileType: null,
    },
    {
      id: 4,
      eventName: 'MC Hammersmith',
      eventLocation: 'Hammersmith Apollo',
      description: 'Concert',
      startTime: '2026-05-06T18:30:00Z',
      endTime: '2026-05-06T23:00:00Z',
      isAllDay: false,
      recurrenceRule: null,
      calendarEventTypeId: 2,
      calendarEventTypeName: 'Personal',
      calendarEventTypeColour: '#3B82F6',
      documentId: null,
      documentFileName: null,
      documentFileType: null,
    },
    {
      id: 5,
      eventName: 'Daliso Chaponda',
      eventLocation: 'Comedy Club',
      description: 'Stand-up comedy',
      startTime: '2026-07-29T18:30:00Z',
      endTime: '2026-07-29T22:00:00Z',
      isAllDay: false,
      recurrenceRule: null,
      calendarEventTypeId: 2,
      calendarEventTypeName: 'Personal',
      calendarEventTypeColour: '#3B82F6',
      documentId: null,
      documentFileName: null,
      documentFileType: null,
    },
    {
      id: 6,
      eventName: 'Flo & Joan',
      eventLocation: 'Theater',
      description: 'Comedy show',
      startTime: '2025-10-24T19:30:00Z',
      endTime: '2025-10-24T22:00:00Z',
      isAllDay: false,
      recurrenceRule: null,
      calendarEventTypeId: 2,
      calendarEventTypeName: 'Personal',
      calendarEventTypeColour: '#3B82F6',
      documentId: null,
      documentFileName: null,
      documentFileType: null,
    },
    {
      id: 7,
      eventName: 'Weekly Team Standup',
      eventLocation: 'Zoom',
      description: 'Regular team sync',
      startTime: '2025-12-01T09:00:00Z',
      endTime: '2025-12-01T09:30:00Z',
      isAllDay: false,
      recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO,WE,FR;UNTIL=20260331T090000Z',
      calendarEventTypeId: 1,
      calendarEventTypeName: 'Work',
      calendarEventTypeColour: '#EF4444',
      documentId: null,
      documentFileName: null,
      documentFileType: null,
    },
    {
      id: 8,
      eventName: 'Gym Session',
      eventLocation: 'Local Gym',
      description: 'Workout',
      startTime: '2025-12-01T07:00:00Z',
      endTime: '2025-12-01T08:00:00Z',
      isAllDay: false,
      recurrenceRule: 'FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;UNTIL=20260630T080000Z',
      calendarEventTypeId: 3,
      calendarEventTypeName: 'Health',
      calendarEventTypeColour: '#10B981',
      documentId: null,
      documentFileName: null,
      documentFileType: null,
    },
  ],
  eventExceptions: [],
};

export default function CalendarScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const commonStyles = createCommonStyles(colorScheme ?? 'light');
  const isDark = colorScheme === 'dark';
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));

  // Fetch calendar events
  const { data: calendarData, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['calendar-events'],
    queryFn: async () => {
      const response = await authApiClient.get<GetCalendarEventsDto>('/api/Calendar/GetCalendarEvents');
      return response.data;
    },
  });

  // Fetch event types
  const { data: eventTypesData, isLoading: isLoadingTypes } = useQuery({
    queryKey: ['calendar-event-types'],
    queryFn: async () => {
      const response = await authApiClient.get<GetCalendarEventTypesDto>('/api/Calendar/GetCalendarEventTypes');
      return response.data;
    },
  });

  const isLoading = isLoadingEvents || isLoadingTypes;

  // Process events including recurring events with RRule
  const processedEvents = useMemo(() => {
    if (!calendarData?.events) return [];

    const processed: ProcessedEvent[] = [];
    const now = moment();
    const startDate = moment().subtract(1, 'year');
    const endDate = moment().add(2, 'years');

    calendarData.events.forEach((event) => {
      const eventExceptions = calendarData.eventExceptions
        .filter((ex) => ex.calendarEventId === event.id)
        .map((ex) => moment(ex.exceptionDate).format('YYYY-MM-DD'));

      if (event.recurrenceRule) {
        try {
          // Parse RRule and generate occurrences
          const rule = RRule.fromString(event.recurrenceRule);
          const occurrences = rule.between(startDate.toDate(), endDate.toDate(), true);

          occurrences.forEach((occurrence) => {
            const occurrenceDate = moment(occurrence).format('YYYY-MM-DD');
            
            // Skip if this occurrence is in the exceptions list
            if (!eventExceptions.includes(occurrenceDate)) {
              const startTime = moment(occurrence)
                .hour(moment(event.startTime).hour())
                .minute(moment(event.startTime).minute());
              const endTime = moment(occurrence)
                .hour(moment(event.endTime).hour())
                .minute(moment(event.endTime).minute());

              processed.push({
                ...event,
                displayDate: occurrenceDate,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
              });
            }
          });
        } catch (error) {
          console.error('Error parsing RRule:', error);
          // Fall back to single event if RRule parsing fails
          processed.push({
            ...event,
            displayDate: moment(event.startTime).format('YYYY-MM-DD'),
          });
        }
      } else {
        // Non-recurring event
        const eventDate = moment(event.startTime).format('YYYY-MM-DD');
        if (!eventExceptions.includes(eventDate)) {
          processed.push({
            ...event,
            displayDate: eventDate,
          });
        }
      }
    });

    return processed;
  }, [calendarData]);

  // Calculate statistics
  const stats = useMemo(() => {
    const now = moment();
    const startOfMonth = moment().startOf('month');
    const endOfMonth = moment().endOf('month');

    const totalEvents = new Set(processedEvents.map(e => e.id)).size;
    const thisMonth = processedEvents.filter((e) =>
      moment(e.displayDate).isBetween(startOfMonth, endOfMonth, 'day', '[]')
    ).length;
    const upcoming = processedEvents.filter((e) =>
      moment(e.displayDate).isAfter(now, 'day')
    ).length;
    const placesVisited = new Set(
      processedEvents
        .filter((e) => moment(e.displayDate).isSameOrBefore(now, 'day'))
        .map((e) => e.eventLocation)
        .filter(Boolean)
    ).size;

    return {
      totalEvents,
      thisMonth,
      upcoming,
      placesVisited,
    };
  }, [processedEvents]);

  // Mark dates on calendar
  const markedDates = useMemo(() => {
    const marked: any = {};

    processedEvents.forEach((event) => {
      const dateKey = event.displayDate;
      if (!marked[dateKey]) {
        marked[dateKey] = {
          marked: true,
          dots: [],
        };
      }
      marked[dateKey].dots.push({
        color: event.calendarEventTypeColour,
      });
    });

    // Add selection styling
    if (marked[selectedDate]) {
      marked[selectedDate].selected = true;
      marked[selectedDate].selectedColor = isDark ? '#3B82F6' : '#2563EB';
    } else {
      marked[selectedDate] = {
        selected: true,
        selectedColor: isDark ? '#3B82F6' : '#2563EB',
      };
    }

    return marked;
  }, [processedEvents, selectedDate, isDark]);

  // Get events for selected date
  const selectedDateEvents = useMemo(() => {
    return processedEvents
      .filter((e) => e.displayDate === selectedDate)
      .sort((a, b) => moment(a.startTime).diff(moment(b.startTime)));
  }, [processedEvents, selectedDate]);

  const handleDayPress = (day: DateData) => {
    Haptics.selectionAsync();
    setSelectedDate(day.dateString);
  };

  const handleMonthChange = (date: DateData) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderEventItem = (event: ProcessedEvent) => {
    return (
      <TouchableOpacity
        key={`${event.id}-${event.displayDate}`}
        style={[
          styles.eventItem,
          {
            backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
            borderColor: isDark ? '#334155' : '#E2E8F0',
          },
        ]}
        onPress={() => console.log('Event pressed:', event)}
      >
        <View style={[styles.eventColorBar, { backgroundColor: event.calendarEventTypeColour }]} />
        <View style={styles.eventItemContent}>
          <ThemedText style={styles.eventItemTitle}>{event.eventName}</ThemedText>
          <View style={styles.eventItemDetails}>
            <ThemedText style={styles.eventItemTime}>
              {event.isAllDay
                ? 'All Day'
                : `${moment(event.startTime).format('HH:mm')} - ${moment(event.endTime).format('HH:mm')}`}
            </ThemedText>
            {event.eventLocation && (
              <ThemedText style={styles.eventItemLocation} numberOfLines={1}>
                📍 {event.eventLocation}
              </ThemedText>
            )}
          </View>
          <View style={[styles.eventTypeBadge, { backgroundColor: event.calendarEventTypeColour + '20' }]}>
            <ThemedText style={[styles.eventTypeText, { color: event.calendarEventTypeColour }]}>
              {event.calendarEventTypeName}
            </ThemedText>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const calendarTheme = {
    backgroundColor: 'transparent',
    calendarBackground: 'transparent',
    textSectionTitleColor: isDark ? '#94A3B8' : '#64748B',
    selectedDayBackgroundColor: isDark ? '#3B82F6' : '#2563EB',
    selectedDayTextColor: '#FFFFFF',
    todayTextColor: isDark ? '#60A5FA' : '#3B82F6',
    dayTextColor: isDark ? '#E2E8F0' : '#1E293B',
    textDisabledColor: isDark ? '#475569' : '#CBD5E1',
    dotColor: isDark ? '#3B82F6' : '#2563EB',
    monthTextColor: isDark ? '#F1F5F9' : '#0F172A',
    textMonthFontWeight: '700' as const,
    textDayFontSize: 14,
    textMonthFontSize: 18,
    arrowColor: isDark ? '#60A5FA' : '#3B82F6',
  };

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ThemedView style={styles.container}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.tint} />
          </View>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ThemedView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          {/* Header */}
          <View style={commonStyles.header}>
            <ThemedText type="title">Calendar</ThemedText>
            <ThemedText style={commonStyles.subtitle}>Your Schedule</ThemedText>
          </View>

          {/* Stats Grid - 2x2 */}
          <View style={{ gap: 12, marginBottom: 24 }}>
            <View style={commonStyles.statsGrid}>
              <View style={[commonStyles.statCard, { borderLeftColor: '#3B82F6' }]}>
                <ThemedText style={commonStyles.statLabel}>Total Events</ThemedText>
                <ThemedText type="title" style={commonStyles.statValue}>
                  {stats.totalEvents}
                </ThemedText>
                <ThemedText style={commonStyles.statPeriod}>All Time</ThemedText>
              </View>

              <View style={[commonStyles.statCard, { borderLeftColor: '#8B5CF6' }]}>
                <ThemedText style={commonStyles.statLabel}>This Month</ThemedText>
                <ThemedText type="title" style={commonStyles.statValue}>
                  {stats.thisMonth}
                </ThemedText>
                <ThemedText style={commonStyles.statPeriod}>{moment().format('MMMM')}</ThemedText>
              </View>
            </View>

            <View style={commonStyles.statsGrid}>
              <View style={[commonStyles.statCard, { borderLeftColor: '#06B6D4' }]}>
                <ThemedText style={commonStyles.statLabel}>Upcoming</ThemedText>
                <ThemedText type="title" style={commonStyles.statValue}>
                  {stats.upcoming}
                </ThemedText>
                <ThemedText style={commonStyles.statPeriod}>Future Events</ThemedText>
              </View>

              <View style={[commonStyles.statCard, { borderLeftColor: '#10B981' }]}>
                <ThemedText style={commonStyles.statLabel}>Places Visited</ThemedText>
                <ThemedText type="title" style={commonStyles.statValue}>
                  {stats.placesVisited}
                </ThemedText>
                <ThemedText style={commonStyles.statPeriod}>Unique</ThemedText>
              </View>
            </View>
          </View>

          {/* Calendar */}
          <ThemedView
            style={[
              styles.calendarContainer,
              {
                backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                borderColor: isDark ? '#334155' : '#E2E8F0',
              },
            ]}
          >
            <Calendar
              current={selectedDate}
              onDayPress={handleDayPress}
              onMonthChange={handleMonthChange}
              markingType="multi-dot"
              markedDates={markedDates}
              theme={calendarTheme}
              enableSwipeMonths={true}
            />
          </ThemedView>

          {/* Selected Date Events */}
          <View style={styles.eventsContainer}>
            <View style={styles.eventsHeader}>
              <ThemedText style={styles.eventsHeaderTitle}>
                {moment(selectedDate).format('MMMM DD, YYYY')}
              </ThemedText>
              <ThemedText style={styles.eventsCount}>
                {selectedDateEvents.length} {selectedDateEvents.length === 1 ? 'event' : 'events'}
              </ThemedText>
            </View>

            {selectedDateEvents.length === 0 ? (
              <ThemedView
                style={[
                  styles.emptyState,
                  {
                    backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                    borderColor: isDark ? '#334155' : '#E2E8F0',
                  },
                ]}
              >
                <ThemedText style={styles.emptyStateText}>No events on this day</ThemedText>
              </ThemedView>
            ) : (
              <View style={styles.eventsList}>
                {selectedDateEvents.map((event) => renderEventItem(event))}
              </View>
            )}
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calendarContainer: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    overflow: 'hidden',
  },
  eventsContainer: {
    marginBottom: 24,
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  eventsHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  eventsCount: {
    fontSize: 14,
    opacity: 0.6,
  },
  eventsList: {
    gap: 12,
  },
  eventItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  eventColorBar: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
  },
  eventItemContent: {
    flex: 1,
    gap: 8,
  },
  eventItemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  eventItemDetails: {
    gap: 4,
  },
  eventItemTime: {
    fontSize: 14,
    opacity: 0.7,
  },
  eventItemLocation: {
    fontSize: 13,
    opacity: 0.6,
  },
  eventTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  eventTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    padding: 32,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 15,
    opacity: 0.6,
  },
});
