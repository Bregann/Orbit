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
  Button,
  Text,
  FileInput,
  SegmentedControl,
  Paper
} from '@mantine/core'
import {
  IconMapPin,
  IconClock,
  IconPaperclip,
  IconRepeat,
  IconClock24,
  IconSun,
  IconUpload,
  IconX,
  IconCheck
} from '@tabler/icons-react'
import { Frequency, RRule } from 'rrule'
import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { doQueryGet, doPostFormData } from '@/helpers/apiClient'
import { GetCalendarEventTypesDto } from '@/interfaces/api/calendar/GetCalendarEventTypesDto'
import { AddCalendarEventRequest } from '@/interfaces/api/calendar/AddCalendarEventRequest'
import { useMutationPost } from '@/helpers/mutations/useMutationPost'
import type { GetAllDocumentsDto } from '@/interfaces/api/documents/GetAllDocumentsDto'
import type { GetAllDocumentCategoriesDto } from '@/interfaces/api/documents/GetAllDocumentCategoriesDto'
import notificationHelper from '@/helpers/notificationHelper'
import { formatDateForInput } from '@/helpers/dateHelper'
import { QueryKeys } from '@/helpers/QueryKeys'

interface AddEventModalProps {
  opened: boolean
  onClose: () => void
  initialDate?: Date | null
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

export default function AddEventModal({ opened, onClose, initialDate }: AddEventModalProps) {
  const queryClient = useQueryClient()
  const { data: eventTypesData } = useQuery({
    queryKey: [QueryKeys.CalendarEventTypes],
    queryFn: async () => await doQueryGet<GetCalendarEventTypesDto>('/api/calendar/GetCalendarEventTypes')
  })

  const { data: documentsData } = useQuery({
    queryKey: [QueryKeys.Documents],
    queryFn: async () => await doQueryGet<GetAllDocumentsDto>('/api/documents/GetAllDocuments')
  })

  const { data: categoriesData } = useQuery({
    queryKey: [QueryKeys.DocumentCategories],
    queryFn: async () => await doQueryGet<GetAllDocumentCategoriesDto>('/api/documents/GetAllDocumentCategories')
  })

  const addEventMutation = useMutationPost<AddCalendarEventRequest, void>({
    url: '/api/calendar/AddCalendarEvent',
    queryKey: [QueryKeys.CalendarEvents],
    invalidateQuery: true
  })

  const documents = documentsData?.documents ?? []
  const categories = categoriesData?.categories ?? []

  const eventTypes = eventTypesData?.eventTypes.map(type => ({
    id: type.id.toString(),
    label: type.eventTypeName,
    color: type.hexColourCode
  })) || []

  const [newEventTitle, setNewEventTitle] = useState('')
  const [newEventDate, setNewEventDate] = useState(formatDateForInput(initialDate || null))
  const [newEventStartTime, setNewEventStartTime] = useState('')
  const [newEventEndTime, setNewEventEndTime] = useState('')
  const [newEventIsAllDay, setNewEventIsAllDay] = useState(false)
  const [newEventLocation, setNewEventLocation] = useState('')
  const [newEventTypeId, setNewEventTypeId] = useState<string | null>(eventTypes[0]?.id || null)
  const [newEventDescription, setNewEventDescription] = useState('')
  const [newEventAttachment, setNewEventAttachment] = useState<string | null>(null)

  // Document upload state
  const [documentMode, setDocumentMode] = useState<'select' | 'upload'>('select')
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadName, setUploadName] = useState('')
  const [uploadCategory, setUploadCategory] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const [showRecurrence, setShowRecurrence] = useState(false)
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<Frequency | null>(null)
  const [recurrenceInterval, setRecurrenceInterval] = useState(1)
  const [recurrenceDaysOfWeek, setRecurrenceDaysOfWeek] = useState<number[]>([])
  const [recurrenceDayOfMonth, setRecurrenceDayOfMonth] = useState(1)
  const [useEndDate, setUseEndDate] = useState(false)
  const [recurrenceEndDate, setRecurrenceEndDate] = useState('')
  const [recurrenceOccurrences, setRecurrenceOccurrences] = useState<number | undefined>(undefined)

  // Update date when initialDate changes and modal opens
  useEffect(() => {
    if (opened && initialDate) {
      setNewEventDate(formatDateForInput(initialDate))
    }
  }, [opened, initialDate])

  const resetForm = () => {
    setNewEventTitle('')
    setNewEventDate(formatDateForInput(initialDate || null))
    setNewEventStartTime('')
    setNewEventEndTime('')
    setNewEventIsAllDay(false)
    setNewEventLocation('')
    setNewEventTypeId(eventTypes[0]?.id || null)
    setNewEventDescription('')
    setNewEventAttachment(null)
    setShowRecurrence(false)
    setRecurrenceFrequency(null)
    setRecurrenceInterval(1)
    setRecurrenceDaysOfWeek([])
    setRecurrenceDayOfMonth(1)
    setUseEndDate(false)
    setRecurrenceEndDate('')
    setRecurrenceOccurrences(undefined)
    setDocumentMode('select')
    setUploadFile(null)
    setUploadName('')
    setUploadCategory(null)
    setIsUploading(false)
  }

  const handleUploadDocument = async () => {
    if (!uploadFile || !uploadCategory) {
      notificationHelper.showErrorNotification('Error', 'Please select a file and category', 3000, <IconX />)
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', uploadFile)
      formData.append('request.DocumentName', uploadName.trim() || uploadFile.name)
      formData.append('request.DocumentType', uploadFile.type || 'application/octet-stream')
      formData.append('request.CategoryId', uploadCategory)

      const response = await doPostFormData('/api/documents/UploadDocument', formData)

      if (!response.ok) {
        throw new Error(response.statusMessage ?? 'Failed to upload document')
      }

      // Invalidate queries to refresh documents list
      await queryClient.invalidateQueries({ queryKey: [QueryKeys.Documents] })

      notificationHelper.showSuccessNotification('Success', 'Document uploaded successfully', 3000, <IconCheck />)

      // Reset upload form
      setUploadFile(null)
      setUploadName('')
      setUploadCategory(null)
      setDocumentMode('select')
    } catch (error) {
      notificationHelper.showErrorNotification('Error', error instanceof Error ? error.message : 'Failed to upload document', 3000, <IconX />)
    } finally {
      setIsUploading(false)
    }
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
      recurrenceRule: rruleString,
      documentId: newEventAttachment ? parseInt(newEventAttachment) : null
    }

    await addEventMutation.mutateAsync(request)
    handleClose()
  }

  const isFormValid = newEventTitle.trim() !== '' && newEventDate !== '' && !isUploading

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
          placeholder="e.g., Comedy Night"
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

        <Stack gap="sm">
          <Group justify="space-between">
            <Group gap="xs">
              <IconPaperclip size="1.2rem" />
              <Text fw={500}>Documents</Text>
            </Group>
          </Group>

          <SegmentedControl
            value={documentMode}
            onChange={(value) => setDocumentMode(value as 'select' | 'upload')}
            data={[
              { label: 'Select Existing', value: 'select' },
              { label: 'Upload New', value: 'upload' }
            ]}
            fullWidth
          />

          {documentMode === 'select' ? (
            <Select
              placeholder="Link a document from your vault"
              description="Select a ticket, confirmation, or other related document"
              data={documents.map(d => ({ value: d.documentId.toString(), label: d.documentName }))}
              value={newEventAttachment}
              onChange={setNewEventAttachment}
              searchable
              clearable
            />
          ) : (
            <Paper p="md" withBorder>
              <Stack gap="sm">
                <FileInput
                  placeholder="Choose a file to upload"
                  leftSection={<IconUpload size="1rem" />}
                  value={uploadFile}
                  onChange={setUploadFile}
                  accept="application/pdf,image/*,.doc,.docx,.xls,.xlsx"
                />
                <TextInput
                  placeholder="Document name (optional)"
                  description="Leave empty to use the file name"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.currentTarget.value)}
                />
                <Select
                  placeholder="Select category"
                  data={categories.map(c => ({ value: c.id.toString(), label: c.categoryName }))}
                  value={uploadCategory}
                  onChange={setUploadCategory}
                />
                <Button
                  onClick={handleUploadDocument}
                  leftSection={<IconUpload size="1rem" />}
                  loading={isUploading}
                  disabled={!uploadFile || !uploadCategory || isUploading}
                  fullWidth
                >
                  Upload Document
                </Button>
              </Stack>
            </Paper>
          )}
        </Stack>

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleAddEvent} disabled={!isFormValid}>Add Event</Button>
        </Group>
      </Stack>
    </Modal>
  )
}
