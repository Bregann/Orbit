import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { authApiClient } from '@/helpers/apiClient';
import { EventEntry, GetCalendarEventsDto } from '@/interfaces/api/calendar/GetCalendarEventsDto';
import { calendarStyles as styles } from '@/styles/calendarStyles';
import { createCommonStyles } from '@/styles/commonStyles';
import { useQuery } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import moment from 'moment';
import { useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, TouchableOpacity, useColorScheme, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RRule } from 'rrule';

interface ProcessedEvent extends EventEntry {
  displayDate: string; // The actual date this event occurs on (for recurring events)
}

export default function CalendarScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const commonStyles = createCommonStyles(colorScheme ?? 'light');
  const isDark = colorScheme === 'dark';
  const [selectedDate, setSelectedDate] = useState(moment().format('YYYY-MM-DD'));

  // Fetch calendar events
  const { data: calendarData, isLoading } = useQuery({
    queryKey: ['calendar-events'],
    queryFn: async () => {
      const response = await authApiClient.get<GetCalendarEventsDto>('/api/Calendar/GetCalendarEvents');
      return response.data;
    },
  });

  // Process events including recurring events with RRule
  const processedEvents = useMemo(() => {
    if (!calendarData?.events) return [];

    const processed: ProcessedEvent[] = [];
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
