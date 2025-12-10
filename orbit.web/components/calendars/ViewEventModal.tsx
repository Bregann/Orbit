'use client'

import {
  Modal,
  Stack,
  Group,
  Badge,
  Divider,
  Text,
  ThemeIcon,
  Paper,
  Button
} from '@mantine/core'
import {
  IconCalendar,
  IconMapPin,
  IconRepeat,
  IconSun,
  IconTrash,
  IconFileText,
  IconEdit
} from '@tabler/icons-react'
import { useState } from 'react'
import { useDisclosure } from '@mantine/hooks'
import RecurringActionModal from './RecurringActionModal'
import { useQuery } from '@tanstack/react-query'
import { doQueryGet } from '@/helpers/apiClient'
import { GetCalendarEventTypesDto } from '@/interfaces/api/calendar/GetCalendarEventTypesDto'
import type { CalendarEvent } from '@/interfaces/calendar/CalendarEvent'
import { RRule } from 'rrule'
import { useMutationDelete } from '@/helpers/mutations/useMutationDelete'
import type { DeleteCalendarEventRequest } from '@/interfaces/api/calendar/DeleteCalendarEventRequest'

interface ViewEventModalProps {
  opened: boolean
  onClose: () => void
  event: CalendarEvent | null
  onDelete: (_id: number) => void
  onEdit?: (_event: CalendarEvent) => void
}

const mockDocuments = [
  { id: 1, name: 'Concert Tickets - Coldplay.pdf', category: 'Tickets' },
  { id: 2, name: 'Flight Confirmation.pdf', category: 'Travel' },
  { id: 3, name: 'Hotel Booking.pdf', category: 'Travel' },
  { id: 4, name: 'Car Service Receipt.pdf', category: 'Vehicle' },
  { id: 5, name: 'Doctor Appointment Letter.pdf', category: 'Medical' },
]

export default function ViewEventModal({ opened, onClose, event, onDelete, onEdit }: ViewEventModalProps) {
  const [localEvent, setLocalEvent] = useState<CalendarEvent | null>(event)
  const [recurringModalOpened, { open: openRecurringModal, close: closeRecurringModal }] = useDisclosure(false)

  const { data: eventTypesData } = useQuery({
    queryKey: ['calendarEventTypes'],
    queryFn: async () => await doQueryGet<GetCalendarEventTypesDto>('/api/calendar/GetCalendarEventTypes')
  })

  const eventTypes = eventTypesData?.eventTypes.map(type => ({
    id: type.id.toString(),
    label: type.eventTypeName,
    color: type.hexColourCode
  })) || []

  const getEventTypeLabel = (typeId: string) => {
    return eventTypes.find(t => t.id === typeId)?.label || 'Unknown'
  }

  const getEventTypeColor = (typeId: string) => {
    return eventTypes.find(t => t.id === typeId)?.color || '#6b7280'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatRecurrence = (event: CalendarEvent) => {
    if (!event.rrule) return null
    try {
      const eventStartDate = new Date(event.date + 'T00:00:00')
      const rruleString = `DTSTART:${eventStartDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z\nRRULE:${event.rrule}`
      const rule = RRule.fromString(rruleString)
      return rule.toText()
    } catch {
      return 'Custom recurrence'
    }
  }

  const getDocumentById = (id: number) => {
    return mockDocuments.find(d => d.id === id)
  }

  // Sync local state when prop changes
  if (event && localEvent?.id !== event.id) {
    setLocalEvent(event)
  }

  const viewingEvent = localEvent

  const handleDeleteClick = () => {
    if (!viewingEvent) return
    if (viewingEvent.rrule) {
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
    queryKey: ['calendarEvents'],
    invalidateQuery: true
  })

  const handleDeleteSingle = () => {
    if (!viewingEvent) return

    // For single occurrence, use instanceDate (clicked date) or fall back to event date
    const instanceDateValue = viewingEvent.instanceDate || viewingEvent.date
    // Convert to full ISO 8601 datetime format for C# DateTime deserialization
    const isoDateTime = new Date(instanceDateValue + 'T00:00:00Z').toISOString()

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
      title={viewingEvent?.title || 'Event Details'}
      size="lg"
    >
      {viewingEvent && (
        <Stack gap="md">
          <Group gap="md">
            <Badge
              size="lg"
              variant="light"
              color={getEventTypeColor(viewingEvent.typeId)}
              leftSection={
                <div
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: getEventTypeColor(viewingEvent.typeId),
                  }}
                />
              }
            >
              {getEventTypeLabel(viewingEvent.typeId)}
            </Badge>
            {viewingEvent.isAllDay && (
              <Badge size="lg" variant="light" color="yellow" leftSection={<IconSun size="0.9rem" />}>
                All Day
              </Badge>
            )}
            {viewingEvent.rrule && (
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
                {formatDate(viewingEvent.date)}
                {!viewingEvent.isAllDay && viewingEvent.startTime && (
                  <> at {viewingEvent.startTime}{viewingEvent.endTime && ` - ${viewingEvent.endTime}`}</>
                )}
                {viewingEvent.isAllDay && ' (All day)'}
              </Text>
            </Group>

            {viewingEvent.location && (
              <Group gap="xs">
                <ThemeIcon size="sm" variant="light" color="gray">
                  <IconMapPin size="0.9rem" />
                </ThemeIcon>
                <Text size="sm">{viewingEvent.location}</Text>
              </Group>
            )}

            {viewingEvent.rrule && (
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

          {viewingEvent.attachments.length > 0 && (
            <>
              <Divider />
              <div>
                <Text size="sm" fw={500} mb="xs">Attached Documents</Text>
                <Stack gap="xs">
                  {viewingEvent.attachments.map((attachmentId: number) => {
                    const doc = getDocumentById(attachmentId)
                    if (!doc) return null
                    return (
                      <Paper key={attachmentId} p="xs" withBorder radius="sm">
                        <Group gap="xs">
                          <ThemeIcon size="sm" variant="light" color="blue">
                            <IconFileText size="0.9rem" />
                          </ThemeIcon>
                          <Text size="sm">{doc.name}</Text>
                        </Group>
                      </Paper>
                    )
                  })}
                </Stack>
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
