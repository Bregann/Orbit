'use client'

import {
  Card,
  Stack,
  Group,
  Title,
  Badge,
  Divider,
  Center,
  Text,
  Table,
  ThemeIcon
} from '@mantine/core'
import { IconCalendarRepeat } from '@tabler/icons-react'
import { BillingFrequency, SubscriptionItem } from '@/interfaces/api/subscriptions/MonthlyPayment'

// Helper function to get ordinal suffix for day numbers (1st, 2nd, 3rd, etc.)
const getOrdinalSuffix = (day: number): string => {
  if (day > 3 && day < 21) return 'th'
  switch (day % 10) {
    case 1: return 'st'
    case 2: return 'nd'
    case 3: return 'rd'
    default: return 'th'
  }
}

interface ThisMonthSubscriptionsSectionProps {
  subscriptions: SubscriptionItem[]
}

export default function ThisMonthSubscriptionsSection({ subscriptions }: ThisMonthSubscriptionsSectionProps) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Group gap="sm">
            <ThemeIcon size="lg" radius="md" variant="light" color="grape">
              <IconCalendarRepeat size="1.2rem" />
            </ThemeIcon>
            <Title order={2} size="h3">
              Monthly Payments
            </Title>
          </Group>
          <Badge size="lg" variant="light" color="grape">
            {subscriptions.length} subscriptions
          </Badge>
        </Group>
        <Divider />

        {subscriptions.length === 0 ? (
          <Center py="xl">
            <Stack align="center" gap="sm">
              <Text size="lg" fw={500} c="dimmed">
                No subscriptions set up
              </Text>
              <Text size="sm" c="dimmed">
                Add subscriptions in the Management page to track them here
              </Text>
            </Stack>
          </Center>
        ) : (
          <>
            {/* Subscriptions Table */}
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Subscription</Table.Th>
                  <Table.Th>Amount</Table.Th>
                  <Table.Th>Monthly Amount</Table.Th>
                  <Table.Th>Billing Day</Table.Th>
                  <Table.Th>Frequency</Table.Th>
                  <Table.Th>Next Billing</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {subscriptions
                  .sort((a: SubscriptionItem, b: SubscriptionItem) => a.billingDay - b.billingDay)
                  .map((subscription: SubscriptionItem) => (
                    <Table.Tr key={subscription.id}>
                      <Table.Td>
                        <Text fw={500}>{subscription.name}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text fw={600}>£{subscription.amount.toFixed(2)}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Text fw={600} c="grape">£{subscription.monthlyAmount.toFixed(2)}</Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="light" color="blue">
                          {subscription.billingDay}{getOrdinalSuffix(subscription.billingDay)}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="light" color="grape">
                          {subscription.billingFrequency === BillingFrequency.Monthly ? 'Monthly' : 'Yearly'}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" c="dimmed">
                          {new Date(subscription.nextBillingDate).toLocaleDateString()}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ))}
              </Table.Tbody>
            </Table>

            {/* Total Summary */}
            <Card withBorder p="md" radius="md" style={{ backgroundColor: 'var(--mantine-color-dark-8)' }}>
              <Group justify="space-between">
                <Text fw={600}>Total Monthly Subscriptions:</Text>
                <Text fw={700} size="lg" c="grape">
                  £{subscriptions
                    .reduce((acc, s) => acc + s.monthlyAmount, 0)
                    .toFixed(2)}/month
                </Text>
              </Group>
            </Card>
          </>
        )}
      </Stack>
    </Card>
  )
}
