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
  Text
} from '@mantine/core'
import {
  IconMapPin,
  IconClock,
  IconPaperclip,
  IconRepeat,
  IconClock24,
  IconSun
} from '@tabler/icons-react'
import { Frequency, RRule } from 'rrule'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { doQueryGet } from '@/helpers/apiClient'
import { GetCalendarEventTypesDto } from '@/interfaces/api/calendar/GetCalendarEventTypesDto'
import { AddCalendarEventRequest } from '@/interfaces/api/calendar/AddCalendarEventRequest'
import { useMutationPost } from '@/helpers/mutations/useMutationPost'

interface AddEventModalProps {
  opened: boolean
  onClose: () => void
}

interface RuleOptionsType {
  freq: Frequency
  interval: number
  dtstart: Date
  byweekday?: number[]
  bymonthday?: number
  until?: Date
  count?: number
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

export default function AddEventModal({ opened, onClose }: AddEventModalProps) {
  const { data: eventTypesData } = useQuery({
    queryKey: ['calendarEventTypes'],
    queryFn: async () => await doQueryGet<GetCalendarEventTypesDto>('/api/calendar/GetCalendarEventTypes')
  })

  const addEventMutation = useMutationPost<AddCalendarEventRequest, void>({
    url: '/api/calendar/AddCalendarEvent',
    queryKey: ['calendarEvents'],
    invalidateQuery: true
  })

  const eventTypes = eventTypesData?.eventTypes.map(type => ({
    id: type.id.toString(),
    label: type.eventTypeName,
    color: type.hexColourCode
  })) || []

  const [newEventTitle, setNewEventTitle] = useState('')
  const [newEventDate, setNewEventDate] = useState('')
  const [newEventStartTime, setNewEventStartTime] = useState('')
  const [newEventEndTime, setNewEventEndTime] = useState('')
  const [newEventIsAllDay, setNewEventIsAllDay] = useState(false)
  const [newEventLocation, setNewEventLocation] = useState('')
  const [newEventTypeId, setNewEventTypeId] = useState<string | null>(eventTypes[0]?.id || null)
  const [newEventDescription, setNewEventDescription] = useState('')
  const [newEventAttachments, setNewEventAttachments] = useState<string[]>([])

  const [showRecurrence, setShowRecurrence] = useState(false)
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<Frequency | null>(null)
  const [recurrenceInterval, setRecurrenceInterval] = useState(1)
  const [recurrenceDaysOfWeek, setRecurrenceDaysOfWeek] = useState<number[]>([])
  const [recurrenceDayOfMonth, setRecurrenceDayOfMonth] = useState(1)
  const [useEndDate, setUseEndDate] = useState(false)
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('')
  const [recurrenceOccurrences, setRecurrenceOccurrences] = useState<number | undefined>(undefined)

  const resetForm = () => {
    setNewEventTitle('')
    setNewEventDate('')
    setNewEventStartTime('')
    setNewEventEndTime('')
    setNewEventIsAllDay(false)
    setNewEventLocation('')
    setNewEventTypeId(eventTypes[0]?.id || null)
    setNewEventDescription('')
    setNewEventAttachments([])
    setShowRecurrence(false)
    setRecurrenceFrequency(null)
    setRecurrenceInterval(1)
    setRecurrenceDaysOfWeek([])
    setRecurrenceDayOfMonth(1)
    setUseEndDate(false)
    setRecurrenceEndDate('')
    setRecurrenceOccurrences(undefined)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleAddEvent = async () => {
    if (!newEventTitle || !newEventDate) return

    // Generate RRule string if recurrence is enabled
    let rruleString: string | null = null
    if (recurrenceFrequency !== null) {
      const ruleOptions: RuleOptionsType = {
        freq: recurrenceFrequency,
        interval: recurrenceInterval,
        dtstart: new Date(newEventDate)
      }

      if (recurrenceFrequency === Frequency.WEEKLY && recurrenceDaysOfWeek.length > 0) {
        ruleOptions.byweekday = recurrenceDaysOfWeek
      }

      if (recurrenceFrequency === Frequency.MONTHLY && recurrenceDayOfMonth) {
        ruleOptions.bymonthday = recurrenceDayOfMonth
      }

      if (useEndDate && recurrenceEndDate) {
        ruleOptions.until = new Date(recurrenceEndDate + 'T23:59:59')
      } else if (!useEndDate && recurrenceOccurrences) {
        ruleOptions.count = recurrenceOccurrences
      }

      const rule = new RRule(ruleOptions)
      const fullRuleString = rule.toString()
      // Extract just the RRULE part without the "RRULE:" prefix
      rruleString = fullRuleString.includes('RRULE:')
        ? fullRuleString.split('RRULE:')[1].split('\n')[0]
        : fullRuleString.split('\n')[1]
    }

    // Construct DateTime strings for start and end times
    const startDateTime = newEventIsAllDay
      ? `${newEventDate}T00:00:00`
      : `${newEventDate}T${newEventStartTime || '00:00'}:00`

    const endDateTime = newEventIsAllDay
      ? `${newEventDate}T23:59:59`
      : `${newEventDate}T${newEventEndTime || '23:59'}:00`

    const request: AddCalendarEventRequest = {
      eventName: newEventTitle,
      eventLocation: newEventLocation.trim(),
      description: newEventDescription.trim(),
      startTime: startDateTime,
      endTime: endDateTime,
      isAllDay: newEventIsAllDay,
      calendarEventTypeId: parseInt(newEventTypeId || eventTypes[0]?.id || '1'),
      recurrenceRule: rruleString
    }

    await addEventMutation.mutateAsync(request)
    handleClose()
  }

  const isFormValid = newEventTitle.trim() !== '' && newEventDate !== ''

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Add Event"
      size="lg"
    >
      <Stack gap="md">
        <TextInput
          label="Event Title"
          placeholder="e.g., Coldplay Concert"
          value={newEventTitle}
          onChange={(e) => setNewEventTitle(e.currentTarget.value)}
          required
        />

        <Grid>
          <Grid.Col span={12}>
            <TextInput
              label="Date"
              type="date"
              value={newEventDate}
              onChange={(e) => setNewEventDate(e.currentTarget.value)}
              required
            />
          </Grid.Col>
        </Grid>

        <Group gap="xs">
          <IconSun size="1.2rem" />
          <Switch
            label="All day event"
            checked={newEventIsAllDay}
            onChange={(e) => setNewEventIsAllDay(e.currentTarget.checked)}
          />
        </Group>

        {!newEventIsAllDay && (
          <Grid>
            <Grid.Col span={6}>
              <TextInput
                label="Start Time"
                type="time"
                value={newEventStartTime}
                onChange={(e) => setNewEventStartTime(e.currentTarget.value)}
                leftSection={<IconClock size="1rem" />}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="End Time"
                type="time"
                value={newEventEndTime}
                onChange={(e) => setNewEventEndTime(e.currentTarget.value)}
                leftSection={<IconClock24 size="1rem" />}
              />
            </Grid.Col>
          </Grid>
        )}

        <TextInput
          label="Location"
          placeholder="e.g., Wembley Stadium, London"
          value={newEventLocation}
          onChange={(e) => setNewEventLocation(e.currentTarget.value)}
          leftSection={<IconMapPin size="1rem" />}
        />

        <Select
          label="Event Type"
          placeholder="Select type"
          data={eventTypes.map(t => ({ value: t.id, label: t.label }))}
          value={newEventTypeId}
          onChange={setNewEventTypeId}
        />

        <Textarea
          label="Description"
          placeholder="Add any notes about this event..."
          value={newEventDescription}
          onChange={(e) => setNewEventDescription(e.currentTarget.value)}
          rows={3}
        />

        {/* Recurrence Section */}
        <Divider />
        <Group justify="space-between">
          <Group gap="xs">
            <IconRepeat size="1.2rem" />
            <Text fw={500}>Recurring Event</Text>
          </Group>
          <Switch
            checked={showRecurrence}
            onChange={(e) => {
              setShowRecurrence(e.currentTarget.checked)
              if (!e.currentTarget.checked) {
                setRecurrenceFrequency(null)
              }
            }}
          />
        </Group>

        <Collapse in={showRecurrence}>
          <Stack gap="md">
            <Select
              label="Repeat"
              placeholder="Select frequency"
              data={[
                { value: String(Frequency.DAILY), label: 'Daily' },
                { value: String(Frequency.WEEKLY), label: 'Weekly' },
                { value: String(Frequency.MONTHLY), label: 'Monthly' },
                { value: String(Frequency.YEARLY), label: 'Yearly' },
              ]}
              value={recurrenceFrequency !== null ? String(recurrenceFrequency) : null}
              onChange={(value) => setRecurrenceFrequency(value ? Number(value) as Frequency : null)}
            />

            {recurrenceFrequency !== null && (
              <>
                <NumberInput
                  label="Repeat every"
                  description={`Every ${recurrenceInterval} ${recurrenceFrequency === Frequency.DAILY ? 'day(s)' : recurrenceFrequency === Frequency.WEEKLY ? 'week(s)' : recurrenceFrequency === Frequency.MONTHLY ? 'month(s)' : 'year(s)'}`}
                  value={recurrenceInterval}
                  onChange={(value) => setRecurrenceInterval(Number(value) || 1)}
                  min={1}
                  max={99}
                />

                {recurrenceFrequency === Frequency.WEEKLY && (
                  <div>
                    <Text size="sm" fw={500} mb="xs">Repeat on</Text>
                    <Group gap="xs">
                      {daysOfWeekOptions.map(day => (
                        <Checkbox
                          key={day.value}
                          label={day.label.slice(0, 3)}
                          checked={recurrenceDaysOfWeek.includes(day.value)}
                          onChange={(e) => {
                            if (e.currentTarget.checked) {
                              setRecurrenceDaysOfWeek([...recurrenceDaysOfWeek, day.value])
                            } else {
                              setRecurrenceDaysOfWeek(recurrenceDaysOfWeek.filter(d => d !== day.value))
                            }
                          }}
                        />
                      ))}
                    </Group>
                  </div>
                )}

                {recurrenceFrequency === Frequency.MONTHLY && (
                  <NumberInput
                    label="Day of month"
                    description="Which day of the month"
                    value={recurrenceDayOfMonth}
                    onChange={(value) => setRecurrenceDayOfMonth(Number(value) || 1)}
                    min={1}
                    max={31}
                  />
                )}

                <div>
                  <Text size="sm" fw={500} mb="xs">Ends</Text>
                  <Stack gap="sm">
                    <Switch
                      label="Use end date"
                      checked={useEndDate}
                      onChange={(e) => setUseEndDate(e.currentTarget.checked)}
                    />
                    {useEndDate ? (
                      <TextInput
                        type="date"
                        value={recurrenceEndDate}
                        onChange={(e) => setRecurrenceEndDate(e.currentTarget.value)}
                        description="Last occurrence date"
                      />
                    ) : (
                      <NumberInput
                        label="Number of occurrences"
                        value={recurrenceOccurrences}
                        onChange={(value) => setRecurrenceOccurrences(Number(value) || undefined)}
                        min={1}
                        max={999}
                        placeholder="Leave empty for no end"
                      />
                    )}
                  </Stack>
                </div>
              </>
            )}
          </Stack>
        </Collapse>

        <Divider />

        <MultiSelect
          label="Attach Documents"
          placeholder="Link documents from your vault"
          description="Select tickets, confirmations, or other related documents"
          data={mockDocuments.map(d => ({ value: d.id.toString(), label: d.name }))}
          value={newEventAttachments}
          onChange={setNewEventAttachments}
          leftSection={<IconPaperclip size="1rem" />}
          searchable
          clearable
        />

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAddEvent} disabled={!isFormValid}>Add Event</Button>
        </Group>
      </Stack>
    </Modal>
  )
}
