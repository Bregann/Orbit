import { Paper, Stack, Text } from '@mantine/core'

interface StatCardProps {
  title: string
  amount: number
}

const StatCard = (props: StatCardProps) => {
  return (
    <Paper withBorder p="md" radius="md" shadow="sm">
      <Stack gap="xs">
        <Text size="sm" c="dimmed" fw={500}>
          {props.title}
        </Text>
        <Text size="xl" fw={700}>
          {props.amount}
        </Text>
      </Stack>
    </Paper>
  )
}

export default StatCard
