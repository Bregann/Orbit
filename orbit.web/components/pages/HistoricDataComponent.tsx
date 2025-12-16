'use client'

import {
  Container,
  Text,
  Title,
  Stack,
  Divider,
  Loader,
  Center,
  Alert,
  Select,
  Group
} from '@mantine/core'
import { doQueryGet } from '@/helpers/apiClient'
import { useQuery } from '@tanstack/react-query'
import { IconAlertCircle, IconCalendar } from '@tabler/icons-react'
import { useState } from 'react'
import type { GetHistoricMonthsDropdownValuesDto } from '@/interfaces/api/historicData/GetHistoricMonthsDropdownValuesDto'
import HistoricAnalyticsSection from '@/components/finance/historic-data/HistoricAnalyticsSection'

export default function HistoricDataComponent() {
  const [selectedMonthId, setSelectedMonthId] = useState<string | null>(null)

  // Fetch month dropdown values
  const { data: monthsDropdown, isLoading: isLoadingMonthsDropdown } = useQuery({
    queryKey: ['historicMonthsDropdown'],
    queryFn: async () =>
      await doQueryGet<GetHistoricMonthsDropdownValuesDto>('/api/HistoricMonth/GetHistoricMonthsDropdownValues')
  })

  // Set initial selected month once dropdown data is loaded
  if (monthsDropdown && !selectedMonthId && monthsDropdown.months.length > 0) {
    setSelectedMonthId(monthsDropdown.months[0].id.toString())
  }

  if (isLoadingMonthsDropdown) {
    return (
      <Container size="xl" px={{ base: 'xs', sm: 'md' }}>
        <Center h={400}>
          <Stack align="center" gap="md">
            <Loader size="lg" />
            <Text c="dimmed">Loading historic data...</Text>
          </Stack>
        </Center>
      </Container>
    )
  }

  if (!monthsDropdown || monthsDropdown.months.length === 0) {
    return (
      <Container size="xl" px={{ base: 'xs', sm: 'md' }}>
        <Alert icon={<IconAlertCircle size="1rem" />} title="No Data" color="yellow" mt="xl">
          No historic data available yet. Complete your first month to see analytics.
        </Alert>
      </Container>
    )
  }

  const monthOptions = monthsDropdown.months.map((month) => ({
    value: month.id.toString(),
    label: month.displayName
  }))

  return (
    <Container size="xl" px={{ base: 'xs', sm: 'md' }}>
      <Stack gap="xl">
        {/* Page Header */}
        <div>
          <Title order={1} mb="xs">
            Historic Data
          </Title>
          <Text c="dimmed" size="sm">
            View and analyze financial data from previous months
          </Text>
        </div>

        {/* Month Selector */}
        <Group>
          <Select
            leftSection={<IconCalendar size="1rem" />}
            label="Select Month"
            placeholder="Choose a month"
            data={monthOptions}
            value={selectedMonthId}
            onChange={(value) => setSelectedMonthId(value)}
            w={250}
          />
        </Group>

        <Divider />

        {/* Analytics Section */}
        {selectedMonthId && <HistoricAnalyticsSection selectedMonthId={selectedMonthId} />}
      </Stack>
    </Container>
  )
}
