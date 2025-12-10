'use client'

import {
  Card,
  Group,
  Button,
  ActionIcon,
  Title,
  Text,
  Box,
  SimpleGrid,
  Stack,
  Paper
} from '@mantine/core'
import {
  IconChevronLeft,
  IconChevronRight,
  IconRepeat,
  IconSun
} from '@tabler/icons-react'
import type { CalendarEvent } from '@/interfaces/calendar/CalendarEvent'

interface CalendarGridProps {
  currentMonth: Date
  selectedDate: Date | null
  events: CalendarEvent[]
  onNavigateMonth: (_direction: 'prev' | 'next') => void
  onGoToToday: () => void
  onSelectDate: (_date: Date) => void
  onViewEvent: (_event: CalendarEvent) => void
  getEventTypeColor: (_typeId: string) => string
  getEventsForDate: (_date: Date) => CalendarEvent[]
}

export default function CalendarGrid({
  currentMonth,
  selectedDate,
  onNavigateMonth,
  onGoToToday,
  onSelectDate,
  onViewEvent,
  getEventTypeColor,
  getEventsForDate
}: CalendarGridProps) {
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), 1).getDay()
    // Convert Sunday (0) to 6, Monday (1) to 0, etc. for Monday-first week
    return day === 0 ? 6 : day - 1
  }

  const getCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth)
    const firstDay = getFirstDayOfMonth(currentMonth)
    const days: (Date | null)[] = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))
    }

    // Fill remaining cells to complete the grid (always show 6 rows = 42 cells)
    while (days.length < 42) {
      days.push(null)
    }

    return days
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const getMonthYearString = () => {
    return currentMonth.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
  }

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  return (
    <Card withBorder p="md" radius="md" shadow="sm">
      {/* Calendar Header */}
      <Group justify="space-between" mb="md">
        <Group gap="sm">
          <Button variant="light" size="sm" onClick={onGoToToday}>
            Today
          </Button>
          <ActionIcon variant="subtle" size="lg" onClick={() => onNavigateMonth('prev')}>
            <IconChevronLeft size="1.2rem" />
          </ActionIcon>
          <ActionIcon variant="subtle" size="lg" onClick={() => onNavigateMonth('next')}>
            <IconChevronRight size="1.2rem" />
          </ActionIcon>
          <Title order={3} size="h4">{getMonthYearString()}</Title>
        </Group>
      </Group>

      {/* Weekday Headers */}
      <SimpleGrid cols={7} spacing={0}>
        {weekDays.map(day => (
          <Box key={day} py="xs" style={{ textAlign: 'center', borderBottom: '1px solid var(--mantine-color-dark-4)' }}>
            <Text size="sm" fw={600} c="dimmed">{day}</Text>
          </Box>
        ))}
      </SimpleGrid>

      {/* Calendar Days Grid */}
      <SimpleGrid cols={7} spacing={0}>
        {getCalendarDays().map((date, index) => {
          const dayEvents = date ? getEventsForDate(date) : []
          const isSelected = date && selectedDate?.toDateString() === date.toDateString()
          const isTodayDate = date && isToday(date)

          return (
            <Box
              key={index}
              p="xs"
              style={{
                minHeight: 100,
                borderRight: (index + 1) % 7 !== 0 ? '1px solid var(--mantine-color-dark-5)' : 'none',
                borderBottom: index < 35 ? '1px solid var(--mantine-color-dark-5)' : 'none',
                backgroundColor: isSelected ? 'var(--mantine-color-dark-6)' : 'transparent',
                cursor: date ? 'pointer' : 'default',
                opacity: date ? 1 : 0.3,
              }}
              onClick={() => date && onSelectDate(date)}
            >
              {date && (
                <>
                  <Group justify="flex-start" mb={4}>
                    <Text
                      size="sm"
                      fw={isTodayDate ? 700 : 500}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        backgroundColor: isTodayDate ? 'var(--mantine-color-blue-6)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isTodayDate ? 'white' : undefined,
                      }}
                    >
                      {date.getDate()}
                    </Text>
                  </Group>
                  <Stack gap={2}>
                    {dayEvents.slice(0, 3).map(event => (
                      <Paper
                        key={event.id}
                        px={6}
                        py={2}
                        radius="sm"
                        style={{
                          backgroundColor: `var(--mantine-color-${getEventTypeColor(event.typeId)}-9)`,
                          cursor: 'pointer',
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          // Set instanceDate to the clicked date for recurring events
                          const eventWithInstance = {
                            ...event,
                            instanceDate: date.toISOString().split('T')[0]
                          }
                          onViewEvent(eventWithInstance)
                        }}
                      >
                        <Group gap={4} wrap="nowrap">
                          {event.rrule && (
                            <IconRepeat size="0.7rem" style={{ flexShrink: 0 }} />
                          )}
                          {event.isAllDay && (
                            <IconSun size="0.7rem" style={{ flexShrink: 0 }} />
                          )}
                          <Text size="xs" lineClamp={1} c={getEventTypeColor(event.typeId)}>
                            {!event.isAllDay && event.startTime && `${event.startTime} `}{event.title}
                          </Text>
                        </Group>
                      </Paper>
                    ))}
                    {dayEvents.length > 3 && (
                      <Text size="xs" c="dimmed" pl={6}>
                        +{dayEvents.length - 3} more
                      </Text>
                    )}
                  </Stack>
                </>
              )}
            </Box>
          )
        })}
      </SimpleGrid>
    </Card>
  )
}
