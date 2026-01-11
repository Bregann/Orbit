'use client'

import {
  Container,
  Grid,
  Title,
  Group,
  Stack,
  Text,
  ThemeIcon,
  SimpleGrid,
  Badge,
  Paper,
  Select,
  Card
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useState, useMemo } from 'react'
import { IconCalendar } from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { doQueryGet } from '@/helpers/apiClient'
import { GetYearlyMoodResponse, MoodEntry } from '@/interfaces/api/mood/GetYearlyMoodResponse'
import { MoodType } from '@/interfaces/api/mood/MoodType'
import RecordMoodModal from '@/components/mood/RecordMoodModal'
import { QueryKeys } from '@/helpers/QueryKeys'
import MoodSelector from '@/components/mood/MoodSelector'
import { GetTodaysMoodResponse } from '@/interfaces/api/mood/GetTodaysMoodResponse'
import { GetAvailableYearsResponse } from '@/interfaces/api/mood/GetAvailableYearsResponse'
import MoodCalendarMonth from '@/components/mood/MoodCalendarMonth'
import { moodOptions, getMoodOption } from '@/helpers/moodOptions'

export default function MoodTrackerComponent() {
  const currentYear = new Date().getFullYear()
  const [selectedYear, setSelectedYear] = useState<string>(currentYear.toString())
  const [recordModalOpened, { open: openRecordModal, close: closeRecordModal }] = useDisclosure(false)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null)

  const { data: yearlyMoodData } = useQuery({
    queryKey: [QueryKeys.YearlyMoodData, selectedYear],
    queryFn: async () => await doQueryGet<GetYearlyMoodResponse>(`/api/Mood/GetYearlyMood?year=${selectedYear}`)
  })

  const { data: todaysMoodData } = useQuery({
    queryKey: [QueryKeys.TodaysMood],
    queryFn: async () => await doQueryGet<GetTodaysMoodResponse>('/api/Mood/GetTodaysMood')
  })

  const { data: availableYearsData } = useQuery({
    queryKey: [QueryKeys.AvailableYears],
    queryFn: async () => await doQueryGet<GetAvailableYearsResponse>('/api/Mood/GetAvailableYears')
  })

  const entries = yearlyMoodData?.entries ?? []

  // Create a map for quick lookup
  const moodMap = useMemo(() => {
    const map = new Map<string, MoodEntry>()
    entries.forEach(entry => {
      const date = new Date(entry.date).toISOString().split('T')[0]
      map.set(date, entry)
    })
    return map
  }, [entries])

  // Calculate stats
  const stats = useMemo(() => {
    const total = entries.length
    const moodCounts = entries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1
      return acc
    }, {} as Record<number, number>)

    const mostCommon = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]
    const mostCommonMood = mostCommon ? getMoodOption(Number(mostCommon[0]) as MoodType) : null

    const daysInYear = new Date(Number(selectedYear), 11, 31).getDate() === 31 ? 365 : 366
    const completionRate = total > 0 ? ((total / daysInYear) * 100).toFixed(1) : '0'

    return {
      total,
      moodCounts,
      mostCommonMood,
      completionRate
    }
  }, [entries, selectedYear])

  const handleDayClick = (date: string, mood?: MoodType) => {
    setSelectedDate(date)
    setSelectedMood(mood || null)
    openRecordModal()
  }

  const yearOptions = (availableYearsData?.years ?? [currentYear]).map(year => ({
    value: year.toString(),
    label: year.toString()
  }))

  return (
    <Container size="xl" px={{ base: 'xs', sm: 'md' }}>
      <Stack gap="xl">
        {/* Page Header */}
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={1} mb="xs">
              Mood Tracker
            </Title>
            <Text c="dimmed" size="sm">
              Track your daily mood throughout the year
            </Text>
          </div>
          <Select
            value={selectedYear}
            onChange={(value) => value && setSelectedYear(value)}
            data={yearOptions}
            leftSection={<IconCalendar size="1rem" />}
            w={120}
          />
        </Group>

        {/* Today's Mood Widget */}
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <MoodSelector
              currentMood={todaysMoodData?.mood || null}
              hasMoodToday={todaysMoodData?.hasMoodToday || false}
            />
          </Grid.Col>

          {/* Stats Cards */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="md">
              <Card shadow="sm" padding="lg" radius="md" withBorder>
                <Stack gap="xs">
                  <Text size="sm" c="dimmed">
                    Days Tracked
                  </Text>
                  <Group justify="space-between">
                    <Text size="xl" fw={700}>
                      {stats.total}
                    </Text>
                    <Badge color="blue" variant="light">
                      {stats.completionRate}%
                    </Badge>
                  </Group>
                </Stack>
              </Card>

              {stats.mostCommonMood && (
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <Stack gap="xs">
                    <Text size="sm" c="dimmed">
                      Most Common Mood
                    </Text>
                    <Group>
                      <ThemeIcon
                        size="lg"
                        radius="xl"
                        variant="light"
                        color={stats.mostCommonMood.color}
                      >
                        <stats.mostCommonMood.icon size={20} />
                      </ThemeIcon>
                      <div>
                        <Text fw={600}>
                          {stats.mostCommonMood.label}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {stats.moodCounts[stats.mostCommonMood.type]} days
                        </Text>
                      </div>
                    </Group>
                  </Stack>
                </Card>
              )}
            </Stack>
          </Grid.Col>
        </Grid>

        {/* Mood Legend */}
        <Paper p="md" withBorder>
          <Group justify="center" gap="xl">
            {moodOptions.map((mood) => {
              const Icon = mood.icon
              const count = stats.moodCounts[mood.type] || 0
              return (
                <Group key={mood.type} gap="xs">
                  <ThemeIcon size="sm" radius="xl" variant="light" color={mood.color}>
                    <Icon size={14} />
                  </ThemeIcon>
                  <Text size="sm">
                    {mood.label}
                  </Text>
                  <Badge size="sm" variant="light" color={mood.color}>
                    {count}
                  </Badge>
                </Group>
              )
            })}
          </Group>
        </Paper>

        {/* Year Grid */}
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing="md">
          {Array.from({ length: 12 }, (_, i) => (
            <MoodCalendarMonth
              key={i}
              monthIndex={i}
              year={Number(selectedYear)}
              moodMap={moodMap}
              onDayClick={handleDayClick}
            />
          ))}
        </SimpleGrid>
      </Stack>

      {/* Record Mood Modal */}
      <RecordMoodModal
        opened={recordModalOpened}
        onClose={closeRecordModal}
        date={selectedDate}
        currentMood={selectedMood}
      />
    </Container>
  )
}
