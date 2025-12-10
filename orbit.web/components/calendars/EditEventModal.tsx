'use client'

import {
  Modal,
  Stack,
  TextInput,
  Grid,
  Group,
  Switch,
  Select,
  Textarea,
  Divider,
  Collapse,
  NumberInput,
  Checkbox,
  MultiSelect,
  Button,
  Alert
} from '@mantine/core'
import {
  IconMapPin,
  IconClock,
  IconPaperclip,
  IconClock24,
  IconAlertCircle
} from '@tabler/icons-react'
import { Frequency, RRule } from 'rrule'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { doQueryGet } from '@/helpers/apiClient'
import { GetCalendarEventTypesDto } from '@/interfaces/api/calendar/GetCalendarEventTypesDto'
import type { CalendarEvent } from '@/interfaces/calendar/CalendarEvent'
import { useMutationPut } from '@/helpers/mutations/useMutationPut'
import type { EditCalendarEventRequest } from '@/interfaces/api/calendar/EditCalendarEventRequest'

interface EditEventModalProps {
  opened: boolean
  onClose: () => void
  event: CalendarEvent | null
}

const daysOfWeekOptions = [
  { value: RRule.MO.weekday, label: 'Monday' },
  { value: RRule.TU.weekday, label: 'Tuesday' },
  { value: RRule.WE.weekday, label: 'Wednesday' },
  { value: RRule.TH.weekday, label: 'Thursday' },
  { value: RRule.FR.weekday, label: 'Friday' },
  { value: RRule.SA.weekday, label: 'Saturday' },
  { value: RRule.SU.weekday, label: 'Sunday' },
]

const mockDocuments = [
  { id: 1, name: 'Concert Tickets - Coldplay.pdf', category: 'Tickets' },
  { id: 2, name: 'Flight Confirmation.pdf', category: 'Travel' },
  { id: 3, name: 'Hotel Booking.pdf', category: 'Travel' },
  { id: 4, name: 'Car Service Receipt.pdf', category: 'Vehicle' },
  { id: 5, name: 'Doctor Appointment Letter.pdf', category: 'Medical' },
]

export default function EditEventModal({ opened, onClose, event }: EditEventModalProps) {
  // Fetch event types
  const { data: eventTypesData } = useQuery({
    queryKey: ['calendarEventTypes'],
    queryFn: async () => await doQueryGet<GetCalendarEventTypesDto>('/api/calendar/GetCalendarEventTypes')
  })

  // Mutation for updating calendar event
  const updateEventMutation = useMutationPut<EditCalendarEventRequest, void>({
    url: '/api/calendar/EditCalendarEvent',
    queryKey: ['calendarEvents'],
    invalidateQuery: true
  })

  const eventTypes = eventTypesData?.eventTypes.map(type => ({
    id: type.id.toString(),
    label: type.eventTypeName,
    color: type.hexColourCode
  })) || []

  const [eventTitle, setEventTitle] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventStartTime, setEventStartTime] = useState('')
  const [eventEndTime, setEventEndTime] = useState('')
  const [eventIsAllDay, setEventIsAllDay] = useState(false)
  const [eventLocation, setEventLocation] = useState('')
  const [eventTypeId, setEventTypeId] = useState<string | null>(null)
  const [eventDescription, setEventDescription] = useState('')
  const [eventAttachments, setEventAttachments] = useState<string[]>([])

  const [showRecurrence, setShowRecurrence] = useState(false)
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<Frequency | null>(null)
  const [recurrenceInterval, setRecurrenceInterval] = useState(1)
  const [recurrenceDaysOfWeek, setRecurrenceDaysOfWeek] = useState<number[]>([])
  const [recurrenceDayOfMonth, setRecurrenceDayOfMonth] = useState(1)
  const [useEndDate, setUseEndDate] = useState(false)
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('')
  const [recurrenceOccurrences, setRecurrenceOccurrences] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (event && opened) {
      setEventTitle(event.title)
      setEventDate(event.date)
      setEventStartTime(event.startTime || '')
      setEventEndTime(event.endTime || '')
      setEventIsAllDay(event.isAllDay)
      setEventLocation(event.location || '')
      setEventTypeId(event.typeId)
      setEventDescription(event.description || '')
      setEventAttachments(event.attachments.map(String))

      // Parse RRule if exists
      if (event.rrule) {
        setShowRecurrence(true)
        try {
          const eventStartDate = new Date(event.date + 'T00:00:00')
          const rruleString = `DTSTART:${eventStartDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z\nRRULE:${event.rrule}`
          const rule = RRule.fromString(rruleString)

          setRecurrenceFrequency(rule.options.freq)
          setRecurrenceInterval(rule.options.interval || 1)

          if (rule.options.byweekday) {
            const days = Array.isArray(rule.options.byweekday)
              ? rule.options.byweekday.map((d: any) => typeof d === 'number' ? d : d.weekday)
              : [typeof rule.options.byweekday === 'number' ? rule.options.byweekday : (rule.options.byweekday as any).weekday]
            setRecurrenceDaysOfWeek(days)
          }

          if (rule.options.bymonthday) {
            const day = Array.isArray(rule.options.bymonthday)
              ? rule.options.bymonthday[0]
              : rule.options.bymonthday
            setRecurrenceDayOfMonth(day)
          }

          if (rule.options.until) {
            setUseEndDate(true)
            setRecurrenceEndDate(rule.options.until.toISOString().split('T')[0])
          } else if (rule.options.count) {
            setRecurrenceOccurrences(rule.options.count)
          }
        } catch (error) {
          console.error('Error parsing RRule:', error)
        }
      } else {
        setShowRecurrence(false)
      }
    }
  }, [event, opened])

  const handleSave = () => {
    if (!event) return

    let rruleString: string | null = null

    if (showRecurrence && recurrenceFrequency !== null) {
      const eventStartDate = new Date(eventDate + 'T00:00:00')
      const ruleOptions: any = {
        freq: recurrenceFrequency,
        interval: recurrenceInterval,
        dtstart: eventStartDate
      }

      if (recurrenceFrequency === Frequency.WEEKLY && recurrenceDaysOfWeek.length > 0) {
        ruleOptions.byweekday = recurrenceDaysOfWeek
      }

      if (recurrenceFrequency === Frequency.MONTHLY) {
        ruleOptions.bymonthday = recurrenceDayOfMonth
      }

      if (useEndDate && recurrenceEndDate) {
        ruleOptions.until = new Date(recurrenceEndDate + 'T23:59:59')
      } else if (recurrenceOccurrences) {
        ruleOptions.count = recurrenceOccurrences
      }

      const rule = new RRule(ruleOptions)
      const fullString = rule.toString()
      rruleString = fullString.includes('RRULE:')
        ? fullString.split('RRULE:')[1].split('\n')[0]
        : fullString.split('\n')[1] || fullString
    }

    const requestBody: EditCalendarEventRequest = {
      eventId: event.id,
      eventName: eventTitle,
      eventLocation: eventLocation,
      description: eventDescription || null,
      startTime: new Date(eventDate + 'T' + (eventStartTime || '00:00') + ':00').toISOString(),
      endTime: new Date(eventDate + 'T' + (eventEndTime || '23:59') + ':00').toISOString(),
      isAllDay: eventIsAllDay,
      calendarEventTypeId: parseInt(eventTypeId || '1'),
      recurrenceRule: rruleString
    }

    updateEventMutation.mutate(requestBody, {
      onSuccess: () => {
        onClose()
      }
    })
  }

  const isFormValid = eventTitle.trim() !== '' && eventDate !== ''

  const documentOptions = mockDocuments.map(doc => ({
    value: doc.id.toString(),
    label: `${doc.name} (${doc.category})`
  }))

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Edit Event"
      size="lg"
    >
      <Stack gap="md">
        {event?.rrule && (
          <Alert icon={<IconAlertCircle size="1rem" />} title="Note" color="blue">
            Editing this recurring event will update ALL occurrences in the series.
          </Alert>
        )}

        <TextInput
          label="Event Title"
          placeholder="Enter event title"
          value={eventTitle}
          onChange={(e) => setEventTitle(e.currentTarget.value)}
          required
        />

        <Textarea
          label="Description"
          placeholder="Add description"
          value={eventDescription}
          onChange={(e) => setEventDescription(e.currentTarget.value)}
          minRows={3}
        />

        <Grid gutter="md">
          <Grid.Col span={6}>
            <TextInput
              label="Date"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.currentTarget.value)}
              required
            />
          </Grid.Col>

          <Grid.Col span={6}>
            <Select
              label="Event Type"
              placeholder="Select type"
              data={eventTypes.map(t => ({ value: t.id, label: t.label }))}
              value={eventTypeId}
              onChange={setEventTypeId}
            />
          </Grid.Col>
        </Grid>

        <Switch
          label="All Day Event"
          checked={eventIsAllDay}
          onChange={(e) => setEventIsAllDay(e.currentTarget.checked)}
        />

        <Collapse in={!eventIsAllDay}>
          <Grid gutter="md">
            <Grid.Col span={6}>
              <TextInput
                label="Start Time"
                type="time"
                value={eventStartTime}
                onChange={(e) => setEventStartTime(e.currentTarget.value)}
                leftSection={<IconClock size="1rem" />}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="End Time"
                type="time"
                value={eventEndTime}
                onChange={(e) => setEventEndTime(e.currentTarget.value)}
                leftSection={<IconClock24 size="1rem" />}
              />
            </Grid.Col>
          </Grid>
        </Collapse>

        <TextInput
          label="Location"
          placeholder="Add location"
          value={eventLocation}
          onChange={(e) => setEventLocation(e.currentTarget.value)}
          leftSection={<IconMapPin size="1rem" />}
        />

        <Divider />

        <Checkbox
          label="Recurring Event"
          checked={showRecurrence}
          onChange={(e) => setShowRecurrence(e.currentTarget.checked)}
        />

        <Collapse in={showRecurrence}>
          <Stack gap="md">
            <Grid gutter="md">
              <Grid.Col span={8}>
                <Select
                  label="Repeat"
                  placeholder="Select frequency"
                  data={[
                    { value: Frequency.DAILY.toString(), label: 'Daily' },
                    { value: Frequency.WEEKLY.toString(), label: 'Weekly' },
                    { value: Frequency.MONTHLY.toString(), label: 'Monthly' },
                    { value: Frequency.YEARLY.toString(), label: 'Yearly' }
                  ]}
                  value={recurrenceFrequency?.toString() || null}
                  onChange={(value) => setRecurrenceFrequency(value ? parseInt(value) as Frequency : null)}
                />
              </Grid.Col>
              <Grid.Col span={4}>
                <NumberInput
                  label="Every"
                  value={recurrenceInterval}
                  onChange={(value) => setRecurrenceInterval(typeof value === 'number' ? value : 1)}
                  min={1}
                />
              </Grid.Col>
            </Grid>

            {recurrenceFrequency === Frequency.WEEKLY && (
              <MultiSelect
                label="Repeat On"
                placeholder="Select days"
                data={daysOfWeekOptions.map(d => ({ value: d.value.toString(), label: d.label }))}
                value={recurrenceDaysOfWeek.map(String)}
                onChange={(values) => setRecurrenceDaysOfWeek(values.map(Number))}
              />
            )}

            {recurrenceFrequency === Frequency.MONTHLY && (
              <NumberInput
                label="Day of Month"
                value={recurrenceDayOfMonth}
                onChange={(value) => setRecurrenceDayOfMonth(typeof value === 'number' ? value : 1)}
                min={1}
                max={31}
              />
            )}

            <Switch
              label="Set End Date"
              checked={useEndDate}
              onChange={(e) => setUseEndDate(e.currentTarget.checked)}
            />

            <Collapse in={useEndDate}>
              <TextInput
                label="End Date"
                type="date"
                value={recurrenceEndDate}
                onChange={(e) => setRecurrenceEndDate(e.currentTarget.value)}
              />
            </Collapse>

            <Collapse in={!useEndDate}>
              <NumberInput
                label="Number of Occurrences (optional)"
                placeholder="Leave empty for no limit"
                value={recurrenceOccurrences}
                onChange={(value) => setRecurrenceOccurrences(typeof value === 'number' ? value : undefined)}
                min={1}
              />
            </Collapse>
          </Stack>
        </Collapse>

        <Divider />

        <MultiSelect
          label="Attach Documents"
          placeholder="Select documents"
          data={documentOptions}
          value={eventAttachments}
          onChange={setEventAttachments}
          leftSection={<IconPaperclip size="1rem" />}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="subtle" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isFormValid}>
            Save Changes
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
