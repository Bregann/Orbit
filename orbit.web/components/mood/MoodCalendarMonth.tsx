'use client'

import { Card, Stack, Text, SimpleGrid, Tooltip, Box } from '@mantine/core'
import { MoodType } from '@/interfaces/api/mood/MoodType'
import { MoodEntry } from '@/interfaces/api/mood/GetYearlyMoodResponse'
import { getMoodOption } from '@/helpers/moodOptions'

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

interface MoodCalendarMonthProps {
  monthIndex: number
  year: number
  moodMap: Map<string, MoodEntry>
  onDayClick: (_date: string, _mood?: MoodType) => void
}

export default function MoodCalendarMonth({ monthIndex, year, moodMap, onDayClick }: MoodCalendarMonthProps) {
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay()
  }

  const daysInMonth = getDaysInMonth(monthIndex, year)
  const firstDay = getFirstDayOfMonth(monthIndex, year)
  const days = []

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(<Box key={`empty-${i}`} />)
  }

  // Add cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, monthIndex, day)
    const dateStr = date.toISOString().split('T')[0]
    const moodEntry = moodMap.get(dateStr)
    const isToday = dateStr === new Date().toISOString().split('T')[0]
    const isFuture = date > new Date()

    days.push(
      <Tooltip
        key={day}
        label={moodEntry ? getMoodOption(moodEntry.mood).label : 'No mood recorded'}
        disabled={isFuture}
      >
        <Box
          onClick={() => !isFuture && onDayClick(dateStr, moodEntry?.mood)}
          style={{
            aspectRatio: '1',
            cursor: isFuture ? 'not-allowed' : 'pointer',
            borderRadius: '4px',
            border: isToday ? '2px solid var(--mantine-color-blue-5)' : moodEntry ? `2px solid var(--mantine-color-${getMoodOption(moodEntry.mood).color}-6)` : '1px solid var(--mantine-color-gray-3)',
            backgroundColor: moodEntry
              ? `var(--mantine-color-${getMoodOption(moodEntry.mood).color}-6)`
              : isFuture
                ? 'var(--mantine-color-dark-6)'
                : 'var(--mantine-color-dark-5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            opacity: isFuture ? 0.3 : 1,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            if (!isFuture) {
              e.currentTarget.style.transform = 'scale(1.05)'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          {moodEntry && (() => {
            const Icon = getMoodOption(moodEntry.mood).icon
            return (
              <Icon size={24} />
            )
          })()}
          <Text
            size="xs"
            style={{
              position: 'absolute',
              bottom: 2,
              right: 2,
              fontSize: '0.6rem',
              color: 'var(--mantine-color-gray-6)'
            }}
          >
            {day}
          </Text>
        </Box>
      </Tooltip>
    )
  }

  return (
    <Card shadow="sm" padding="sm" radius="md" withBorder>
      <Stack gap="xs">
        <Text size="sm" fw={600} ta="center">
          {monthNames[monthIndex]}
        </Text>
        <SimpleGrid cols={7} spacing={4}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <Text key={i} size="xs" ta="center" c="dimmed" fw={600}>
              {day}
            </Text>
          ))}
          {days}
        </SimpleGrid>
      </Stack>
    </Card>
  )
}
