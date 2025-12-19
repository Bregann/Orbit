'use client'

import {
  Card,
  Text,
  Stack,
  Group,
  Badge,
  Paper,
  ScrollArea,
  Tabs
} from '@mantine/core'
import {
  IconRepeat
} from '@tabler/icons-react'
import type { EventEntry } from '@/interfaces/api/calendar/GetCalendarEventsDto'

interface EventsSidebarProps {
  activeTab: string | null
  upcomingEvents: EventEntry[]
  pastEvents: EventEntry[]
  onTabChange: (_value: string | null) => void
  onViewEvent: (_event: EventEntry) => void
  getEventTypeColour: (_typeId: number) => string
}

export default function EventsSidebar({
  activeTab,
  upcomingEvents,
  pastEvents,
  onTabChange,
  onViewEvent,
  getEventTypeColour
}: EventsSidebarProps) {
  return (
    <Card withBorder p="md" radius="md" shadow="sm" h="100%">
      <Tabs value={activeTab} onChange={onTabChange}>
        <Tabs.List mb="sm">
          <Tabs.Tab value="upcoming" size="xs">
            Upcoming
          </Tabs.Tab>
          <Tabs.Tab value="past" size="xs">
            Past
          </Tabs.Tab>
        </Tabs.List>

        <ScrollArea h={450} offsetScrollbars>
          <Tabs.Panel value="upcoming">
            {upcomingEvents.length === 0 ? (
              <Text c="dimmed" ta="center" py="lg" size="sm">
                No upcoming events
              </Text>
            ) : (
              <Stack gap="xs">
                {upcomingEvents.slice(0, 10).map(event => (
                  <Paper
                    key={event.id}
                    p="xs"
                    withBorder
                    radius="sm"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      // Set instanceDate to the event's start date
                      const eventWithInstance = {
                        ...event,
                        instanceDate: event.startTime.split('T')[0]
                      }
                      onViewEvent(eventWithInstance)
                    }}
                  >
                    <Group gap="xs" wrap="nowrap">
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: getEventTypeColour(event.calendarEventTypeId),
                          flexShrink: 0,
                        }}
                      />
                      <Stack gap={0} style={{ flex: 1 }}>
                        <Group gap={4}>
                          <Text size="xs" fw={600} lineClamp={1}>{event.eventName}</Text>
                          {event.recurrenceRule && <IconRepeat size="0.7rem" />}
                        </Group>
                        <Text size="xs" c="dimmed">
                          {new Date(event.startTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          {!event.isAllDay && event.startTime.split('T')[1] && ` · ${event.startTime.split('T')[1].substring(0, 5)}`}
                          {event.isAllDay && ' · All day'}
                        </Text>
                      </Stack>
                    </Group>
                  </Paper>
                ))}
              </Stack>
            )}
          </Tabs.Panel>

          <Tabs.Panel value="past">
            {pastEvents.length === 0 ? (
              <Text c="dimmed" ta="center" py="lg" size="sm">
                No past events
              </Text>
            ) : (
              <Stack gap="xs">
                {pastEvents.slice(0, 10).map(event => (
                  <Paper
                    key={event.id}
                    p="xs"
                    withBorder
                    radius="sm"
                    style={{ cursor: 'pointer', opacity: 0.8 }}
                    onClick={() => {
                      // Set instanceDate to the event's start date
                      const eventWithInstance = {
                        ...event,
                        instanceDate: event.startTime.split('T')[0]
                      }
                      onViewEvent(eventWithInstance)
                    }}
                  >
                    <Group gap="xs" wrap="nowrap">
                      <div
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          backgroundColor: getEventTypeColour(event.calendarEventTypeId),
                          flexShrink: 0,
                        }}
                      />
                      <Stack gap={0} style={{ flex: 1 }}>
                        <Group gap={4}>
                          <Text size="xs" fw={600} lineClamp={1}>{event.eventName}</Text>
                          {event.recurrenceRule && <IconRepeat size="0.7rem" />}
                        </Group>
                        <Group gap={4}>
                          <Badge size="xs" variant="light" color="green">
                            Attended
                          </Badge>
                          <Text size="xs" c="dimmed">
                            {new Date(event.startTime).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </Text>
                        </Group>
                      </Stack>
                    </Group>
                  </Paper>
                ))}
              </Stack>
            )}
          </Tabs.Panel>
        </ScrollArea>
      </Tabs>
    </Card>
  )
}
