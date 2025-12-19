'use client'

import {
  Modal,
  Stack,
  Group,
  Badge,
  Divider,
  Text,
  ThemeIcon,
  Button,
  Paper,
  ActionIcon,
  Tooltip
} from '@mantine/core'
import {
  IconCalendar,
  IconMapPin,
  IconRepeat,
  IconSun,
  IconTrash,
  IconEdit,
  IconDownload,
  IconCheck,
  IconX
} from '@tabler/icons-react'
import { useState } from 'react'
import { useDisclosure } from '@mantine/hooks'
import RecurringActionModal from './RecurringActionModal'
import { useQuery } from '@tanstack/react-query'
import { doQueryGet, doGetBlob } from '@/helpers/apiClient'
import { GetCalendarEventTypesDto } from '@/interfaces/api/calendar/GetCalendarEventTypesDto'
import type { EventEntry } from '@/interfaces/api/calendar/GetCalendarEventsDto'
import { getEventTypeColour, getEventTypeLabel, type EventType } from '@/helpers/dataHelper'
import { getFileIcon, getFileIconColour } from '@/helpers/documentHelper'
import notificationHelper from '@/helpers/notificationHelper'
import { RRule } from 'rrule'
import { useMutationDelete } from '@/helpers/mutations/useMutationDelete'
import type { DeleteCalendarEventRequest } from '@/interfaces/api/calendar/DeleteCalendarEventRequest'
import { QueryKeys } from '@/helpers/QueryKeys'

interface ViewEventModalProps {
  opened: boolean
  onClose: () => void
  event: EventEntry | null
  onDelete: (_id: number) => void
  onEdit?: (_event: EventEntry) => void
}

export default function ViewEventModal({ opened, onClose, event, onDelete, onEdit }: ViewEventModalProps) {
  const [localEvent, setLocalEvent] = useState<EventEntry | null>(event)
  const [recurringModalOpened, { open: openRecurringModal, close: closeRecurringModal }] = useDisclosure(false)

  const { data: eventTypesData } = useQuery({
    queryKey: [QueryKeys.CalendarEventTypes],
    queryFn: async () => await doQueryGet<GetCalendarEventTypesDto>('/api/calendar/GetCalendarEventTypes')
  })

  const eventTypes: EventType[] = eventTypesData?.eventTypes || []

  const formatDate = (isoDateTime: string) => {
    // Extract date part from ISO datetime and add time component to prevent timezone shift
    const dateString = isoDateTime.split('T')[0]
    return new Date(dateString + 'T00:00:00').toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatRecurrence = (event: EventEntry) => {
    if (!event.recurrenceRule) return null
    try {
      const eventStartDate = new Date(event.startTime.split('T')[0] + 'T00:00:00')
      const rruleString = `DTSTART:${eventStartDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z\nRRULE:${event.recurrenceRule}`
      const rule = RRule.fromString(rruleString)
      return rule.toText()
    } catch {
      return 'Custom recurrence'
    }
  }

  const handleDownload = async () => {
    if (!viewingEvent?.documentId) return

    try {
      const blob = await doGetBlob(`/api/documents/DownloadDocument?documentId=${viewingEvent.documentId}`)

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = viewingEvent.documentFileName || 'document'

      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      notificationHelper.showSuccessNotification('Success', 'Document downloaded successfully', 3000, <IconCheck />)
    } catch (error) {
      notificationHelper.showErrorNotification('Error', error instanceof Error ? error.message : 'Failed to download document', 3000, <IconX />)
    }
  }

  // Sync local state when prop changes
  if (event && localEvent?.id !== event.id) {
    setLocalEvent(event)
  }

  const viewingEvent = localEvent

  const handleDeleteClick = () => {
    if (!viewingEvent) return
    if (viewingEvent.recurrenceRule) {
      openRecurringModal()
    } else {
      onDelete(viewingEvent.id)
    }
  }

  const handleEditClick = () => {
    if (!viewingEvent || !onEdit) return
    onEdit(viewingEvent)
    onClose()
  }

  const deleteMutation = useMutationDelete<DeleteCalendarEventRequest, void>({
    url: '/api/calendar/DeleteCalendarEvent',
    queryKey: [QueryKeys.CalendarEvents],
    invalidateQuery: true
  })

  const handleDeleteSingle = () => {
    if (!viewingEvent) return

    // For single occurrence, use instanceDate (clicked date) or fall back to event start date
    const instanceDateValue = viewingEvent.instanceDate || viewingEvent.startTime.split('T')[0]
    // Convert to full ISO 8601 datetime format for C# DateTime deserialization
    const isoDateTime = new Date(instanceDateValue + 'T00:00:00').toISOString()

    const requestBody: DeleteCalendarEventRequest = {
      eventId: viewingEvent.id,
      instanceDate: isoDateTime
    }

    deleteMutation.mutate(requestBody, {
      onSuccess: () => {
        onDelete(viewingEvent.id)
        closeRecurringModal()
        onClose()
      }
    })
  }

  const handleDeleteSeries = () => {
    if (!viewingEvent) return

    // For entire series, pass null as instanceDate
    const requestBody: DeleteCalendarEventRequest = {
      eventId: viewingEvent.id,
      instanceDate: null
    }

    deleteMutation.mutate(requestBody, {
      onSuccess: () => {
        onDelete(viewingEvent.id)
        closeRecurringModal()
        onClose()
      }
    })
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={viewingEvent?.eventName || 'Event Details'}
      size="lg"
    >
      {viewingEvent && (
        <Stack gap="md">
          <Group gap="md">
            <Badge
              size="lg"
              variant="light"
              color={getEventTypeColour(viewingEvent.calendarEventTypeId, eventTypes)}
              leftSection={
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: getEventTypeColour(viewingEvent.calendarEventTypeId, eventTypes),
                  }}
                />
              }
            >
              {getEventTypeLabel(viewingEvent.calendarEventTypeId, eventTypes)}
            </Badge>
            {viewingEvent.isAllDay && (
              <Badge size="lg" variant="light" color="yellow" leftSection={<IconSun size="0.9rem" />}>
                All Day
              </Badge>
            )}
            {viewingEvent.recurrenceRule && (
              <Badge size="lg" variant="light" color="violet" leftSection={<IconRepeat size="0.9rem" />}>
                Recurring
              </Badge>
            )}
          </Group>

          <Divider />

          <Stack gap="xs">
            <Group gap="xs">
              <ThemeIcon size="sm" variant="light" color="gray">
                <IconCalendar size="0.9rem" />
              </ThemeIcon>
              <Text size="sm">
                {formatDate(viewingEvent.startTime)}
                {!viewingEvent.isAllDay && viewingEvent.startTime.split('T')[1] && (
                  <> at {viewingEvent.startTime.split('T')[1].substring(0, 5)}{viewingEvent.endTime.split('T')[1] && ` - ${viewingEvent.endTime.split('T')[1].substring(0, 5)}`}</>
                )}
                {viewingEvent.isAllDay && ' (All day)'}
              </Text>
            </Group>

            {viewingEvent.eventLocation && (
              <Group gap="xs">
                <ThemeIcon size="sm" variant="light" color="gray">
                  <IconMapPin size="0.9rem" />
                </ThemeIcon>
                <Text size="sm">{viewingEvent.eventLocation}</Text>
              </Group>
            )}

            {viewingEvent.recurrenceRule && (
              <Group gap="xs">
                <ThemeIcon size="sm" variant="light" color="gray">
                  <IconRepeat size="0.9rem" />
                </ThemeIcon>
                <Text size="sm">{formatRecurrence(viewingEvent)}</Text>
              </Group>
            )}
          </Stack>

          {viewingEvent.description && (
            <>
              <Divider />
              <div>
                <Text size="sm" fw={500} mb="xs">Description</Text>
                <Text size="sm" c="dimmed">{viewingEvent.description}</Text>
              </div>
            </>
          )}

          {viewingEvent.documentId && viewingEvent.documentFileName && (
            <>
              <Divider />
              <div>
                <Text size="sm" fw={500} mb="xs">Attached Document</Text>
                <Paper p="xs" withBorder radius="sm" onClick={handleDownload} style={{ cursor: 'pointer' }}>
                  <Group justify="space-between" wrap="nowrap">
                    <Group gap="xs" style={{ flex: 1, minWidth: 0 }}>
                      <ThemeIcon size="md" radius="sm" variant="light" color={getFileIconColour(viewingEvent.documentFileType || '')}>
                        {getFileIcon(viewingEvent.documentFileType || '', '1rem')}
                      </ThemeIcon>
                      <Text size="sm" lineClamp={1} style={{ flex: 1 }}>{viewingEvent.documentFileName}</Text>
                    </Group>
                    <Tooltip label="Download">
                      <ActionIcon
                        variant="light"
                        color="blue"
                        onClick={handleDownload}
                      >
                        <IconDownload size="1rem" />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Paper>
              </div>
            </>
          )}

          <Divider />

          <Group justify="space-between">
            <Group>
              {onEdit && (
                <Button
                  variant="light"
                  leftSection={<IconEdit size="1rem" />}
                  onClick={handleEditClick}
                >
                  Edit
                </Button>
              )}
              <Button
                variant="light"
                color="red"
                leftSection={<IconTrash size="1rem" />}
                onClick={handleDeleteClick}
              >
                Delete
              </Button>
            </Group>
            <Button variant="light" onClick={onClose}>Close</Button>
          </Group>
        </Stack>
      )}

      {/* Recurring Action Modal */}
      <RecurringActionModal
        opened={recurringModalOpened}
        onClose={closeRecurringModal}
        actionType="delete"
        onActionSingle={handleDeleteSingle}
        onActionSeries={handleDeleteSeries}
      />
    </Modal>
  )
}
