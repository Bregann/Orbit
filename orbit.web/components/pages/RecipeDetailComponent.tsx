'use client'

import {
  Container,
  Card,
  Text,
  Title,
  Group,
  Stack,
  Badge,
  Divider,
  Loader,
  Center,
  Button,
  Grid,
  ActionIcon,
  Tooltip,
  Checkbox
} from '@mantine/core'
import {
  IconArrowLeft,
  IconClock,
  IconFlame,
  IconUsers,
  IconChefHat,
  IconCheck,
  IconX,
  IconShoppingCart
} from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { doQueryGet } from '@/helpers/apiClient'
import { useMutationPost } from '@/helpers/mutations/useMutationPost'
import notificationHelper from '@/helpers/notificationHelper'
import type { RecipeItem } from '@/interfaces/api/meal-planner/GetRecipesResponse'
import { useRouter } from 'next/navigation'

interface RecipeDetailComponentProps {
  recipeId: number
}

export default function RecipeDetailComponent({ recipeId }: RecipeDetailComponentProps) {
  const router = useRouter()
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps(prev => {
      const next = new Set(prev)
      next.has(stepNumber) ? next.delete(stepNumber) : next.add(stepNumber)
      return next
    })
  }

  const { data: recipe, isLoading } = useQuery({
    queryKey: ['recipe', String(recipeId)],
    queryFn: async () => await doQueryGet<RecipeItem>(`/api/mealplanner/GetRecipe?recipeId=${recipeId}`)
  })

  const { mutate: addToShoppingList, isPending: isAddingToShoppingList } = useMutationPost<number, void>({
    url: (recipeId) => `/api/mealplanner/AddRecipeIngredientsToShoppingList?recipeId=${recipeId}`,
    queryKey: ['recipe', String(recipeId)],
    invalidateQuery: false,
    onSuccess: () => {
      notificationHelper.showSuccessNotification('Success', 'Ingredients added to shopping list', 3000, <IconCheck />)
    },
    onError: (error) => {
      notificationHelper.showErrorNotification('Error', error.message || 'Failed to add to shopping list', 3000, <IconX />)
    }
  })

  const { mutate: addSingleIngredient, isPending: isAddingSingle } = useMutationPost<string, void>({
    url: (name) => `/api/shopping/AddShoppingListItem?name=${encodeURIComponent(name)}`,
    queryKey: ['recipe', String(recipeId)],
    invalidateQuery: false,
    onSuccess: () => {
      notificationHelper.showSuccessNotification('Added', 'Ingredient added to shopping list', 2000, <IconCheck />)
    },
    onError: (error) => {
      notificationHelper.showErrorNotification('Error', error.message || 'Failed to add ingredient', 2000, <IconX />)
    }
  })

  const { mutate: logCook } = useMutationPost<number, number>({
    url: (recipeId) => `/api/mealplanner/LogCook?recipeId=${recipeId}`,
    queryKey: ['recipe', String(recipeId)],
    invalidateQuery: true,
    onSuccess: () => {
      notificationHelper.showSuccessNotification('Success', 'Cook logged!', 3000, <IconCheck />)
    },
    onError: (error) => {
      notificationHelper.showErrorNotification('Error', error.message || 'Failed to log cook', 3000, <IconX />)
    }
  })

  if (isLoading) {
    return (
      <Container size="md" px={{ base: 'xs', sm: 'md' }}>
        <Center h={400}><Loader size="lg" /></Center>
      </Container>
    )
  }

  if (!recipe) {
    return (
      <Container size="md" px={{ base: 'xs', sm: 'md' }}>
        <Text>Recipe not found.</Text>
      </Container>
    )
  }

  return (
    <Container size="md" px={{ base: 'xs', sm: 'md' }}>
      <Stack gap="lg">
        <Button variant="subtle" leftSection={<IconArrowLeft size="1rem" />}
          onClick={() => router.push('/meal-planner')} w="fit-content">
          Back to Meal Planner
        </Button>

        {/* Header */}
        <Card withBorder p="xl" radius="md" shadow="sm">
          <Stack gap="md">
            <Group justify="space-between" align="flex-start">
              <div>
                <Title order={1} mb="xs">{recipe.name}</Title>
                <Text c="dimmed">{recipe.description}</Text>
              </div>
              <Group gap="xs">
                <Button variant="light" color="orange" leftSection={<IconShoppingCart size="1rem" />}
                  onClick={() => addToShoppingList(recipe.id)} loading={isAddingToShoppingList}
                  disabled={!recipe.ingredients || recipe.ingredients.length === 0}>
                  Add to Shopping List
                </Button>
                <Button variant="light" color="green" leftSection={<IconFlame size="1rem" />}
                  onClick={() => logCook(recipe.id)}>
                  Log Cook
                </Button>
              </Group>
            </Group>

            <Group gap="md">
              {recipe.prepTimeMinutes && (
                <Badge size="lg" variant="light" color="blue" leftSection={<IconClock size="0.8rem" />}>
                  Prep: {recipe.prepTimeMinutes} mins
                </Badge>
              )}
              {recipe.cookTimeMinutes && (
                <Badge size="lg" variant="light" color="orange" leftSection={<IconFlame size="0.8rem" />}>
                  Cook: {recipe.cookTimeMinutes} mins
                </Badge>
              )}
              {recipe.servings && (
                <Badge size="lg" variant="light" color="green" leftSection={<IconUsers size="0.8rem" />}>
                  Serves {recipe.servings}
                </Badge>
              )}
              <Badge size="lg" variant="light" color="violet" leftSection={<IconChefHat size="0.8rem" />}>
                Cooked {recipe.timesCooked} {recipe.timesCooked === 1 ? 'time' : 'times'}
              </Badge>
            </Group>
          </Stack>
        </Card>

        <Grid>
          {/* Ingredients */}
          <Grid.Col span={{ base: 12, md: 5 }}>
            <Card withBorder p="lg" radius="md" shadow="sm" h="100%">
              <Title order={3} size="h4" mb="md">Ingredients</Title>
              <Divider mb="md" />
              {recipe.ingredients && recipe.ingredients.length > 0 ? (
                <Stack gap="xs">
                  {recipe.ingredients.map((ingredient, index) => (
                    <Group key={index} justify="space-between" wrap="nowrap">
                      <Group gap="xs">
                        <Text size="sm" fw={500}>{ingredient.name}</Text>
                        {ingredient.quantity && (
                          <Text size="sm" c="dimmed">- {ingredient.quantity}</Text>
                        )}
                      </Group>
                      <Tooltip label="Add to shopping list" withArrow>
                        <ActionIcon
                          variant="subtle"
                          color="orange"
                          size="sm"
                          onClick={() => {
                            const label = ingredient.quantity
                              ? `${ingredient.name} (${ingredient.quantity})`
                              : ingredient.name
                            addSingleIngredient(label)
                          }}
                          disabled={isAddingSingle}
                        >
                          <IconShoppingCart size="0.9rem" />
                        </ActionIcon>
                      </Tooltip>
                    </Group>
                  ))}
                </Stack>
              ) : (
                <Text size="sm" c="dimmed">No ingredients listed.</Text>
              )}
            </Card>
          </Grid.Col>

          {/* Instructions */}
          <Grid.Col span={{ base: 12, md: 7 }}>
            <Card withBorder p="lg" radius="md" shadow="sm" h="100%">
              <Group justify="space-between" mb="md">
                <Title order={3} size="h4">Instructions</Title>
                {recipe.steps && recipe.steps.length > 0 && (
                  <Text size="xs" c="dimmed">
                    {completedSteps.size} / {recipe.steps.length} done
                  </Text>
                )}
              </Group>
              <Divider mb="md" />
              {recipe.steps && recipe.steps.length > 0 ? (
                <Stack gap="sm">
                  {recipe.steps
                    .sort((a, b) => a.stepNumber - b.stepNumber)
                    .map((step) => {
                      const done = completedSteps.has(step.stepNumber)
                      return (
                        <Group
                          key={step.stepNumber}
                          gap="sm"
                          wrap="nowrap"
                          align="flex-start"
                          style={{ cursor: 'pointer' }}
                          onClick={() => toggleStep(step.stepNumber)}
                        >
                          <Checkbox
                            checked={done}
                            onChange={() => toggleStep(step.stepNumber)}
                            onClick={(e) => e.stopPropagation()}
                            mt={2}
                          />
                          <Text
                            size="sm"
                            style={{
                              flex: 1,
                              textDecoration: done ? 'line-through' : 'none',
                              opacity: done ? 0.45 : 1,
                              transition: 'opacity 0.15s'
                            }}
                          >
                            <Text component="span" size="sm" fw={600} mr={6} c="dimmed">{step.stepNumber}.</Text>
                            {step.instruction}
                          </Text>
                        </Group>
                      )
                    })}
                </Stack>
              ) : (
                <Text size="sm" c="dimmed">No instructions listed.</Text>
              )}
            </Card>
          </Grid.Col>
        </Grid>

        {/* Meta info */}
        <Card withBorder p="md" radius="md" shadow="sm">
          <Group gap="xl">
            <Text size="xs" c="dimmed">
              Added: {new Date(recipe.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </Text>
            {recipe.lastUpdatedAt && (
              <Text size="xs" c="dimmed">
                Last updated: {new Date(recipe.lastUpdatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </Text>
            )}
            {recipe.lastCooked && (
              <Text size="xs" c="dimmed">
                Last cooked: {new Date(recipe.lastCooked).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </Text>
            )}
          </Group>
        </Card>
      </Stack>
    </Container>
  )
}
