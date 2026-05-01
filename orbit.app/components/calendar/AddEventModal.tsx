import { ThemedText } from '@/components/themed-text';
import { authApiClient } from '@/helpers/apiClient';
import { useMutationPost } from '@/helpers/mutations/useMutationPost';
import { AddCalendarEventRequest } from '@/interfaces/api/calendar/AddCalendarEventRequest';
import { CalendarEventTypeItem, GetCalendarEventTypesDto } from '@/interfaces/api/calendar/GetCalendarEventTypesDto';
import { Colors } from '@/constants/theme';
import {
  createAddEventModalStyles,
  getTypeChipStyle,
  getFreqChipStyle,
  getDayChipStyle,
} from '@/styles/addEventModalStyles';
import { QueryKeys } from '@/helpers/QueryKeys';
import { useQuery } from '@tanstack/react-query';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Frequency, RRule } from 'rrule';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Switch,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AddEventModalProps {
  visible: boolean;
  onClose: () => void;
  initialDate?: string; // YYYY-MM-DD from the calendar selection
}

const DAYS_OF_WEEK = [
  { value: RRule.MO.weekday, label: 'Mon' },
  { value: RRule.TU.weekday, label: 'Tue' },
  { value: RRule.WE.weekday, label: 'Wed' },
  { value: RRule.TH.weekday, label: 'Thu' },
  { value: RRule.FR.weekday, label: 'Fri' },
  { value: RRule.SA.weekday, label: 'Sat' },
  { value: RRule.SU.weekday, label: 'Sun' },
];

const FREQUENCY_OPTIONS: { value: Frequency; label: string }[] = [
  { value: Frequency.DAILY, label: 'Daily' },
  { value: Frequency.WEEKLY, label: 'Weekly' },
  { value: Frequency.MONTHLY, label: 'Monthly' },
  { value: Frequency.YEARLY, label: 'Yearly' },
];

export default function AddEventModal({ visible, onClose, initialDate }: AddEventModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

  // Form state
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [isAllDay, setIsAllDay] = useState(false);
  const [eventLocation, setEventLocation] = useState('');
  const [eventTypeId, setEventTypeId] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [documentId, setDocumentId] = useState<number | null>(null);

  // Recurrence state
  const [showRecurrence, setShowRecurrence] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<Frequency | null>(null);
  const [recurrenceInterval, setRecurrenceInterval] = useState('1');
  const [recurrenceDaysOfWeek, setRecurrenceDaysOfWeek] = useState<number[]>([]);
  const [recurrenceDayOfMonth, setRecurrenceDayOfMonth] = useState('1');
  const [useEndDate, setUseEndDate] = useState(false);
  const [recurrenceEndDate, setRecurrenceEndDate] = useState(new Date());
  const [recurrenceOccurrences, setRecurrenceOccurrences] = useState('');

  // Date/time picker visibility
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showRecurrenceEndDatePicker, setShowRecurrenceEndDatePicker] = useState(false);

  // Fetch event types
  const { data: eventTypesData, isLoading: isLoadingTypes } = useQuery({
    queryKey: [QueryKeys.CalendarEventTypes],
    queryFn: async () => {
      const response = await authApiClient.get<GetCalendarEventTypesDto>('/api/Calendar/GetCalendarEventTypes');
      return response.data;
    },
    enabled: visible,
  });

  const eventTypes = eventTypesData?.eventTypes ?? [];

  // Add event mutation
  const addEventMutation = useMutationPost<AddCalendarEventRequest, void>({
    url: '/api/Calendar/AddCalendarEvent',
    queryKey: [QueryKeys.CalendarEvents],
    invalidateQuery: true,
    onSuccess: () => {
      resetForm();
      onClose();
    },
    onError: (error) => {
      Alert.alert('Error', error.message || 'Failed to add event');
    },
  });

  // Set initial date and default event type when modal opens
  useEffect(() => {
    if (visible) {
      if (initialDate) {
        setEventDate(moment(initialDate).toDate());
      }
      // Default start time to current hour
      const now = new Date();
      now.setMinutes(0, 0, 0);
      now.setHours(now.getHours() + 1);
      setStartTime(now);
      const endDefault = new Date(now);
      endDefault.setHours(endDefault.getHours() + 1);
      setEndTime(endDefault);
    }
  }, [visible, initialDate]);

  // Set event type when data loads
  useEffect(() => {
    if (eventTypes.length > 0 && eventTypeId === null) {
      setEventTypeId(eventTypes[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventTypes]);

  const resetForm = () => {
    setEventName('');
    setEventDate(new Date());
    setStartTime(new Date());
    setEndTime(new Date());
    setIsAllDay(false);
    setEventLocation('');
    setEventTypeId(null);
    setDescription('');
    setDocumentId(null);
    setShowRecurrence(false);
    setRecurrenceFrequency(null);
    setRecurrenceInterval('1');
    setRecurrenceDaysOfWeek([]);
    setRecurrenceDayOfMonth('1');
    setUseEndDate(false);
    setRecurrenceEndDate(new Date());
    setRecurrenceOccurrences('');
  };

  const buildRRuleString = (): string | null => {
    if (recurrenceFrequency === null) return null;

    const ruleOptions: any = {
      freq: recurrenceFrequency,
      interval: parseInt(recurrenceInterval, 10) || 1,
      dtstart: eventDate,
    };

    if (recurrenceFrequency === Frequency.WEEKLY && recurrenceDaysOfWeek.length > 0) {
      ruleOptions.byweekday = recurrenceDaysOfWeek;
    }

    if (recurrenceFrequency === Frequency.MONTHLY && recurrenceDayOfMonth) {
      ruleOptions.bymonthday = parseInt(recurrenceDayOfMonth, 10) || 1;
    }

    if (useEndDate && recurrenceEndDate) {
      ruleOptions.until = recurrenceEndDate;
    } else if (!useEndDate && recurrenceOccurrences) {
      ruleOptions.count = parseInt(recurrenceOccurrences, 10);
    }

    try {
      const rule = new RRule(ruleOptions);
      const fullRuleString = rule.toString();
      return fullRuleString.includes('RRULE:')
        ? fullRuleString.split('RRULE:')[1].split('\n')[0]
        : fullRuleString.split('\n')[1];
    } catch {
      return null;
    }
  };

  const handleSubmit = () => {
    if (!eventName.trim()) {
      Alert.alert('Validation', 'Please enter an event name');
      return;
    }

    const dateStr = moment(eventDate).format('YYYY-MM-DD');
    const startTimeStr = moment(startTime).format('HH:mm');
    const endTimeStr = moment(endTime).format('HH:mm');

    const startDateTime = isAllDay
      ? `${dateStr}T00:00:00`
      : `${dateStr}T${startTimeStr}:00`;

    const endDateTime = isAllDay
      ? `${dateStr}T23:59:59`
      : `${dateStr}T${endTimeStr}:00`;

    const request: AddCalendarEventRequest = {
      eventName: eventName.trim(),
      eventLocation: eventLocation.trim(),
      description: description.trim(),
      startTime: startDateTime,
      endTime: endDateTime,
      isAllDay,
      calendarEventTypeId: eventTypeId ?? 1,
      recurrenceRule: buildRRuleString(),
      documentId: documentId,
    };

    addEventMutation.mutate(request);
  };

  const toggleDayOfWeek = (day: number) => {
    setRecurrenceDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const handleDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setEventDate(selectedDate);
  };

  const handleStartTimeChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowStartTimePicker(false);
    if (selectedDate) setStartTime(selectedDate);
  };

  const handleEndTimeChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowEndTimePicker(false);
    if (selectedDate) setEndTime(selectedDate);
  };

  const handleRecurrenceEndDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowRecurrenceEndDatePicker(false);
    if (selectedDate) setRecurrenceEndDate(selectedDate);
  };

  const s = createAddEventModalStyles(isDark, colors.tint);

  const isLoading = addEventMutation.isPending;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={s.safeArea} edges={['top']}>
        <KeyboardAvoidingView
          style={s.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Header */}
          <View style={s.header}>
            <TouchableOpacity onPress={onClose} disabled={isLoading}>
              <ThemedText style={s.headerButtonText}>Cancel</ThemedText>
            </TouchableOpacity>
            <ThemedText type="title" style={s.headerTitle}>
              Add Event
            </ThemedText>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isLoading || !eventName.trim()}
              style={{ opacity: isLoading || !eventName.trim() ? 0.5 : 1 }}
            >
              <ThemedText style={s.headerSaveText}>
                {isLoading ? 'Saving...' : 'Save'}
              </ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={s.scrollContent}
            contentContainerStyle={s.scrollContentContainer}
            keyboardShouldPersistTaps="handled"
          >
            {isLoadingTypes ? (
              <View style={s.loadingContainer}>
                <ActivityIndicator size="large" color={colors.tint} />
              </View>
            ) : (
              <>
                {/* Event Name */}
                <View style={s.fieldBlockFirst}>
                  <ThemedText style={s.label}>Event Name *</ThemedText>
                  <TextInput
                    style={s.input}
                    placeholder="e.g., Comedy Night"
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                    value={eventName}
                    onChangeText={setEventName}
                    autoFocus
                  />
                </View>

                {/* Date */}
                <View style={s.fieldBlock}>
                  <ThemedText style={s.label}>Date</ThemedText>
                  <TouchableOpacity style={s.pickerButton} onPress={() => setShowDatePicker(true)}>
                    <ThemedText>{moment(eventDate).format('dddd, MMMM D, YYYY')}</ThemedText>
                    <ThemedText style={s.pickerButtonIcon}>📅</ThemedText>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={eventDate}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={handleDateChange}
                    />
                  )}
                </View>

                {/* All Day Toggle */}
                <View style={s.allDayRow}>
                  <ThemedText style={s.label}>All Day</ThemedText>
                  <Switch
                    value={isAllDay}
                    onValueChange={setIsAllDay}
                    trackColor={{ false: isDark ? '#475569' : '#CBD5E1', true: colors.tint }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                {/* Start / End Time (hidden when all-day) */}
                {!isAllDay && (
                  <>
                    <View style={s.fieldBlock}>
                      <ThemedText style={s.label}>Start Time</ThemedText>
                      <TouchableOpacity style={s.pickerButton} onPress={() => setShowStartTimePicker(true)}>
                        <ThemedText>{moment(startTime).format('HH:mm')}</ThemedText>
                        <ThemedText style={s.pickerButtonIcon}>⏰</ThemedText>
                      </TouchableOpacity>
                      {showStartTimePicker && (
                        <DateTimePicker
                          value={startTime}
                          mode="time"
                          is24Hour
                          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                          onChange={handleStartTimeChange}
                        />
                      )}
                    </View>

                    <View style={s.fieldBlock}>
                      <ThemedText style={s.label}>End Time</ThemedText>
                      <TouchableOpacity style={s.pickerButton} onPress={() => setShowEndTimePicker(true)}>
                        <ThemedText>{moment(endTime).format('HH:mm')}</ThemedText>
                        <ThemedText style={s.pickerButtonIcon}>⏰</ThemedText>
                      </TouchableOpacity>
                      {showEndTimePicker && (
                        <DateTimePicker
                          value={endTime}
                          mode="time"
                          is24Hour
                          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                          onChange={handleEndTimeChange}
                        />
                      )}
                    </View>
                  </>
                )}

                {/* Location */}
                <View style={s.fieldBlock}>
                  <ThemedText style={s.label}>📍 Location</ThemedText>
                  <TextInput
                    style={s.input}
                    placeholder="e.g., Downtown Comedy Club"
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                    value={eventLocation}
                    onChangeText={setEventLocation}
                  />
                </View>

                {/* Event Type */}
                <View style={s.fieldBlock}>
                  <ThemedText style={s.label}>Event Type</ThemedText>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.typeChipsContent}>
                    {eventTypes.map((type: CalendarEventTypeItem) => (
                      <TouchableOpacity
                        key={type.id}
                        style={getTypeChipStyle(
                          eventTypeId === type.id,
                          isDark,
                          colors.tint,
                          type.hexColourCode
                        )}
                        onPress={() => setEventTypeId(type.id)}
                      >
                        <View style={s.typeChipRow}>
                          <View style={[s.typeChipDot, { backgroundColor: type.hexColourCode }]} />
                          <ThemedText style={s.typeChipText}>
                            {type.eventTypeName}
                          </ThemedText>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {/* Description */}
                <View style={s.fieldBlock}>
                  <ThemedText style={s.label}>Description</ThemedText>
                  <TextInput
                    style={[s.input, s.inputMultiline]}
                    placeholder="Add details about this event..."
                    placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                {/* Recurrence Toggle */}
                <TouchableOpacity
                  style={[
                    s.recurrenceToggle,
                    { marginBottom: showRecurrence ? 16 : 24 },
                  ]}
                  onPress={() => setShowRecurrence(!showRecurrence)}
                >
                  <View style={s.recurrenceToggleIconRow}>
                    <ThemedText>🔁</ThemedText>
                    <ThemedText style={s.recurrenceToggleLabel}>Repeat Event</ThemedText>
                  </View>
                  <Switch
                    value={showRecurrence}
                    onValueChange={setShowRecurrence}
                    trackColor={{ false: isDark ? '#475569' : '#CBD5E1', true: colors.tint }}
                    thumbColor="#FFFFFF"
                  />
                </TouchableOpacity>

                {/* Recurrence Options */}
                {showRecurrence && (
                  <View style={s.recurrenceOptions}>
                    {/* Frequency */}
                    <View style={s.recurrenceOptionBlock}>
                      <ThemedText style={s.label}>Frequency</ThemedText>
                      <View style={s.frequencyRow}>
                        {FREQUENCY_OPTIONS.map((opt) => (
                          <TouchableOpacity
                            key={opt.value}
                            style={getFreqChipStyle(recurrenceFrequency === opt.value, isDark, colors.tint)}
                            onPress={() => setRecurrenceFrequency(opt.value)}
                          >
                            <ThemedText
                              style={{
                                fontSize: 13,
                                fontWeight: '600',
                                color: recurrenceFrequency === opt.value ? '#FFFFFF' : undefined,
                              }}
                            >
                              {opt.label}
                            </ThemedText>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    {/* Interval */}
                    <View style={s.recurrenceOptionBlock}>
                      <ThemedText style={s.label}>Every</ThemedText>
                      <View style={s.intervalRow}>
                        <TextInput
                          style={[s.input, s.inputSmall]}
                          keyboardType="number-pad"
                          value={recurrenceInterval}
                          onChangeText={setRecurrenceInterval}
                        />
                        <ThemedText>
                          {recurrenceFrequency === Frequency.DAILY
                            ? 'day(s)'
                            : recurrenceFrequency === Frequency.WEEKLY
                              ? 'week(s)'
                              : recurrenceFrequency === Frequency.MONTHLY
                                ? 'month(s)'
                                : 'year(s)'}
                        </ThemedText>
                      </View>
                    </View>

                    {/* Days of week (for weekly) */}
                    {recurrenceFrequency === Frequency.WEEKLY && (
                      <View style={s.recurrenceOptionBlock}>
                        <ThemedText style={s.label}>On</ThemedText>
                        <View style={s.dayChipsRow}>
                          {DAYS_OF_WEEK.map((day) => (
                            <TouchableOpacity
                              key={day.value}
                              style={getDayChipStyle(recurrenceDaysOfWeek.includes(day.value), isDark, colors.tint)}
                              onPress={() => toggleDayOfWeek(day.value)}
                            >
                              <ThemedText
                                style={{
                                  fontSize: 12,
                                  fontWeight: '600',
                                  color: recurrenceDaysOfWeek.includes(day.value) ? '#FFFFFF' : undefined,
                                }}
                              >
                                {day.label}
                              </ThemedText>
                            </TouchableOpacity>
                          ))}
                        </View>
                      </View>
                    )}

                    {/* Day of month (for monthly) */}
                    {recurrenceFrequency === Frequency.MONTHLY && (
                      <View style={s.recurrenceOptionBlock}>
                        <ThemedText style={s.label}>On day</ThemedText>
                        <TextInput
                          style={[s.input, s.inputSmall]}
                          keyboardType="number-pad"
                          value={recurrenceDayOfMonth}
                          onChangeText={setRecurrenceDayOfMonth}
                          placeholder="1"
                          placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                        />
                      </View>
                    )}

                    {/* End condition */}
                    <View style={s.recurrenceOptionBlock}>
                      <ThemedText style={s.label}>Ends</ThemedText>
                      <View style={s.endConditionRow}>
                        <TouchableOpacity
                          onPress={() => setUseEndDate(false)}
                          style={s.radioOption}
                        >
                          <View style={[s.radioOuter, { borderColor: colors.tint }]}>
                            {!useEndDate && (
                              <View style={[s.radioInner, { backgroundColor: colors.tint }]} />
                            )}
                          </View>
                          <ThemedText style={s.radioLabel}>After</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => setUseEndDate(true)}
                          style={s.radioOption}
                        >
                          <View style={[s.radioOuter, { borderColor: colors.tint }]}>
                            {useEndDate && (
                              <View style={[s.radioInner, { backgroundColor: colors.tint }]} />
                            )}
                          </View>
                          <ThemedText style={s.radioLabel}>On date</ThemedText>
                        </TouchableOpacity>
                      </View>

                      {!useEndDate ? (
                        <TextInput
                          style={[s.input, s.inputWide]}
                          keyboardType="number-pad"
                          value={recurrenceOccurrences}
                          onChangeText={setRecurrenceOccurrences}
                          placeholder="10"
                          placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                        />
                      ) : (
                        <TouchableOpacity
                          style={s.pickerButton}
                          onPress={() => setShowRecurrenceEndDatePicker(true)}
                        >
                          <ThemedText>{moment(recurrenceEndDate).format('MMM D, YYYY')}</ThemedText>
                          <ThemedText style={s.pickerButtonIcon}>📅</ThemedText>
                        </TouchableOpacity>
                      )}
                      {showRecurrenceEndDatePicker && (
                        <DateTimePicker
                          value={recurrenceEndDate}
                          mode="date"
                          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                          onChange={handleRecurrenceEndDateChange}
                        />
                      )}
                    </View>
                  </View>
                )}

                {/* Save Button (bottom of form) */}
                <TouchableOpacity
                  style={[
                    s.saveButton,
                    {
                      backgroundColor: eventName.trim() ? colors.tint : (isDark ? '#334155' : '#CBD5E1'),
                      opacity: isLoading ? 0.5 : 1,
                    },
                  ]}
                  onPress={handleSubmit}
                  disabled={isLoading || !eventName.trim()}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <ThemedText style={s.saveButtonText}>Add Event</ThemedText>
                  )}
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
