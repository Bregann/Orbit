'use client'

import {
  Modal,
  Stack,
  Select,
  Group,
  Button,
  TextInput
} from '@mantine/core'
import { useState, useEffect } from 'react'
import { IconCheck, IconX } from '@tabler/icons-react'
import { useMutationPost } from '@/helpers/mutations/useMutationPost'
import notificationHelper from '@/helpers/notificationHelper'
import type { AddMealPlanEntryRequest } from '@/interfaces/api/meal-planner/AddMealPlanEntryRequest'
import type { RecipeItem } from '@/interfaces/api/meal-planner/GetRecipesResponse'

const mealTypeOptions = [
  { value: 'Breakfast', label: 'Breakfast' },
  { value: 'Lunch', label: 'Lunch' },
  { value: 'Dinner', label: 'Dinner' },
]

interface AddMealPlanModalProps {
  opened: boolean
  onClose: () => void
  recipes: RecipeItem[]
  initialDate: string
  initialMealType: string
  mealPlanQueryKey: string[]
}

export default function AddMealPlanModal({
  opened,
  onClose,
  recipes,
  initialDate,
  initialMealType,
  mealPlanQueryKey
}: AddMealPlanModalProps) {
  const [date, setDate] = useState(initialDate)
  const [mealType, setMealType] = useState<string | null>(initialMealType)
  const [recipeId, setRecipeId] = useState<string | null>(null)

  useEffect(() => {
    setDate(initialDate)
    setMealType(initialMealType)
    setRecipeId(null)
  }, [initialDate, initialMealType])

  const isFormValid = date !== '' && mealType !== null && recipeId !== null

  const { mutateAsync: addEntry, isPending } = useMutationPost<AddMealPlanEntryRequest, number>({
    url: '/api/mealplanner/AddMealPlanEntry',
    queryKey: mealPlanQueryKey,
    invalidateQuery: true,
    onSuccess: () => {
      notificationHelper.showSuccessNotification('Success', 'Meal added to plan', 3000, <IconCheck />)
      onClose()
      setRecipeId(null)
    },
    onError: (error) => {
      notificationHelper.showErrorNotification('Error', error.message || 'Failed to add meal', 3000, <IconX />)
    }
  })

  const handleSubmit = async () => {
    if (!isFormValid) return

    const request: AddMealPlanEntryRequest = {
      date,
      mealType: mealType!,
      recipeId: parseInt(recipeId!)
    }

    await addEntry(request)
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Add Meal to Plan"
      size="md"
      closeOnClickOutside={false}
    >
      <Stack gap="md">
        <TextInput
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.currentTarget.value)}
          required
        />
        <Select
          label="Meal Type"
          placeholder="Select meal type"
          data={mealTypeOptions}
          value={mealType}
          onChange={setMealType}
          required
        />
        <Select
          label="Recipe"
          placeholder="Select a recipe"
          data={recipes.map(r => ({ value: r.id.toString(), label: r.name }))}
          value={recipeId}
          onChange={setRecipeId}
          searchable
          required
        />
        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} loading={isPending} disabled={!isFormValid}>Add to Plan</Button>
        </Group>
      </Stack>
    </Modal>
  )
}
