'use client'

import {
  Modal,
  Stack,
  Text,
  Button,
  Group,
  Paper,
  Badge,
  Divider
} from '@mantine/core'
import {
  IconPlus,
  IconRepeat,
  IconSun,
  IconMapPin,
  IconClock
} from '@tabler/icons-react'
import type { EventEntry } from '@/interfaces/api/calendar/GetCalendarEventsDto'
import { isToday } from '@/helpers/dateHelper'

interface DayEventsModalProps {
  opened: boolean
  onClose: () => void
  selectedDate: Date | null
  events: EventEntry[]
  onViewEvent: (_event: EventEntry) => void
  onAddEvent: () => void
  getEventTypeColour: (_typeId: number) => string
}

export default function DayEventsModal({
  opened,
  onClose,
  selectedDate,
  events,
  onViewEvent,
  onAddEvent,
  getEventTypeColour
}: DayEventsModalProps) {
  if (!selectedDate) return null
  if (!selectedDate) return null

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <Text fw={600}>{formatDate(selectedDate)}</Text>
          {isToday(selectedDate) && <Badge size="sm" variant="light" color="blue">Today</Badge>}
        </Group>
      }
      size="md"
    >
      <Stack gap="md">
        <Button
          leftSection={<IconPlus size="1rem" />}
          onClick={() => {
            onAddEvent()
            onClose()
          }}
          fullWidth
        >
          Add Event for this Day
        </Button>

        <Divider label={`${events.length} event${events.length !== 1 ? 's' : ''}`} />

        {events.length === 0 ? (
          <Text c="dimmed" ta="center" py="xl">
            No events scheduled for this day
          </Text>
        ) : (
          <Stack gap="xs">
            {events.map(event => (
              <Paper
                key={event.id}
                p="md"
                withBorder
                radius="sm"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  // Set instanceDate to the selected date for recurring events
                  const eventWithInstance = {
                    ...event,
                    instanceDate: selectedDate.toISOString().split('T')[0]
                  }
                  onViewEvent(eventWithInstance)
                  onClose()
                }}
              >
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                  <Stack gap={4} style={{ flex: 1 }}>
                    <Group gap="xs">
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: getEventTypeColour(event.calendarEventTypeId),
                          flexShrink: 0
                        }}
                      />
                      <Text fw={600} size="sm">{event.eventName}</Text>
                      {event.recurrenceRule && <IconRepeat size="0.8rem" />}
                    </Group>

                    <Group gap="xs" c="dimmed">
                      {event.isAllDay ? (
                        <Group gap={4}>
                          <IconSun size="0.9rem" />
                          <Text size="xs">All day</Text>
                        </Group>
                      ) : (
                        <Group gap={4}>
                          <IconClock size="0.9rem" />
                          <Text size="xs">
                            {event.startTime.split('T')[1]?.substring(0, 5)} - {event.endTime.split('T')[1]?.substring(0, 5)}
                          </Text>
                        </Group>
                      )}

                      {event.eventLocation && (
                        <Group gap={4}>
                          <IconMapPin size="0.9rem" />
                          <Text size="xs">{event.eventLocation}</Text>
                        </Group>
                      )}
                    </Group>

                    {event.description && (
                      <Text size="xs" c="dimmed" lineClamp={2}>
                        {event.description}
                      </Text>
                    )}
                  </Stack>
                </Group>
              </Paper>
            ))}
          </Stack>
        )}
      </Stack>
    </Modal>
  )
}
