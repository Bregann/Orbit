'use client'

import {
  Modal,
  Stack,
  Text,
  Group,
  Badge,
  Divider,
  Loader,
  Center
} from '@mantine/core'
import { useQuery } from '@tanstack/react-query'
import { doQueryGet } from '@/helpers/apiClient'
import type { GetCookHistoryResponse } from '@/interfaces/api/meal-planner/GetCookHistoryResponse'
import { QueryKeys } from '@/helpers/QueryKeys'
import { IconHistory } from '@tabler/icons-react'

interface CookHistoryModalProps {
  recipeId: number | null
  onClose: () => void
}

export default function CookHistoryModal({ recipeId, onClose }: CookHistoryModalProps) {
  const { data, isLoading } = useQuery({
    queryKey: [QueryKeys.CookHistory, recipeId],
    queryFn: async () => await doQueryGet<GetCookHistoryResponse>(`/api/mealplanner/GetCookHistory?recipeId=${recipeId}`),
    enabled: recipeId !== null
  })

  const history = data?.history ?? []

  return (
    <Modal
      opened={recipeId !== null}
      onClose={onClose}
      title="Cook History"
      size="md"
    >
      {isLoading ? (
        <Center py="xl">
          <Loader size="md" />
        </Center>
      ) : (
        <Stack gap="md">
          <Group gap="xs">
            <IconHistory size="1rem" />
            <Text size="sm" fw={500}>
              {history.length} {history.length === 1 ? 'time' : 'times'} cooked
            </Text>
          </Group>

          <Divider />

          <Stack gap="xs">
            {history.length === 0 ? (
              <Text size="sm" c="dimmed" ta="center" py="md">
                This recipe hasn&apos;t been cooked yet.
              </Text>
            ) : (
              history.map(entry => (
                <Group key={entry.id} justify="space-between">
                  <Text size="sm">{entry.recipeName}</Text>
                  <Badge size="sm" variant="light" color="gray">
                    {new Date(entry.cookedAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                    {' '}
                    {new Date(entry.cookedAt).toLocaleTimeString('en-GB', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Badge>
                </Group>
              ))
            )}
          </Stack>
        </Stack>
      )}
    </Modal>
  )
}
