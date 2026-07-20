'use client'

import {
  Card,
  Text,
  Group,
  Stack,
  Badge,
  ActionIcon,
} from '@mantine/core'
import {
  IconTrash,
  IconEdit,
  IconCheck,
  IconClock,
} from '@tabler/icons-react'
import type { ChoreItem } from '@/interfaces/api/chores/ChoreItem'
import { getFrequencyLabel, getFrequencyColour } from '@/helpers/choreHelper'
import { formatRelativeDate, formatShortDate, isOverdue } from '@/helpers/dateHelper'

interface ChoreCardProps {
  chore: ChoreItem
  onComplete: (_id: number) => void
  onEdit: (_chore: ChoreItem) => void
  onDelete: (_id: number) => void
  isPending: boolean
}

export default function ChoreCard({ chore, onComplete, onEdit, onDelete, isPending }: ChoreCardProps) {
  const freqColour = getFrequencyColour(chore.frequency)
  const overdue = isOverdue(chore.nextDueDate)

  return (
    <Card
      withBorder
      p="sm"
      radius="sm"
      style={{ borderLeft: overdue ? '3px solid var(--mantine-color-red-6)' : undefined }}
    >
      <Group justify="space-between" wrap="nowrap">
        <Stack gap={4} style={{ flex: 1 }}>
          <Group gap="xs">
            <Text size="sm" fw={500}>
              {chore.name}
            </Text>
            <Badge size="xs" variant="light" color={freqColour}>
              {getFrequencyLabel(chore.frequency)}
            </Badge>
          </Group>
          {chore.description && (
            <Text size="xs" c="dimmed" lineClamp={1}>
              {chore.description}
            </Text>
          )}
          <Group gap="xs" mt={4}>
            <Text
              size="xs"
              c={overdue ? 'red' : 'dimmed'}
              fw={overdue ? 600 : 400}
            >
              <IconClock size="0.75rem" style={{ verticalAlign: 'middle', marginRight: 4 }} />
              {overdue ? '⚠ ' : ''}Due: {formatRelativeDate(chore.nextDueDate)}
            </Text>
            {chore.lastCompletedAt && (
              <Text size="xs" c="dimmed">
                Last done: {formatShortDate(chore.lastCompletedAt)}
              </Text>
            )}
          </Group>
        </Stack>
        <Group gap="xs" wrap="nowrap">
          <ActionIcon
            variant="light"
            color="green"
            size="md"
            onClick={() => onComplete(chore.id)}
            disabled={isPending}
            title="Complete chore"
          >
            <IconCheck size="1rem" />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="gray"
            size="md"
            onClick={() => onEdit(chore)}
            disabled={isPending}
            title="Edit chore"
          >
            <IconEdit size="1rem" />
          </ActionIcon>
          <ActionIcon
            variant="subtle"
            color="red"
            size="md"
            onClick={() => onDelete(chore.id)}
            disabled={isPending}
            title="Delete chore"
          >
            <IconTrash size="1rem" />
          </ActionIcon>
        </Group>
      </Group>
    </Card>
  )
}
