'use client'

import {
  Container,
  Grid,
  Card,
  Text,
  Title,
  Button,
  Group,
  Stack,
  Badge,
  ActionIcon,
  Divider,
  ThemeIcon,
  Loader,
  Center,
  Table
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useState } from 'react'
import {
  IconPlus,
  IconTrash,
  IconEdit,
  IconClock,
  IconFlame,
  IconToolsKitchen2,
  IconCalendarEvent,
  IconHistory,
  IconChefHat,
  IconCheck,
  IconX,
  IconUsers,
  IconShoppingCart
} from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { doQueryGet } from '@/helpers/apiClient'
import { useMutationDelete } from '@/helpers/mutations/useMutationDelete'
import { useMutationPost } from '@/helpers/mutations/useMutationPost'
import notificationHelper from '@/helpers/notificationHelper'
import type { GetRecipesResponse, RecipeItem } from '@/interfaces/api/meal-planner/GetRecipesResponse'
import type { GetMealPlanResponse } from '@/interfaces/api/meal-planner/GetMealPlanResponse'
import { QueryKeys } from '@/helpers/QueryKeys'
import AddRecipeModal from '@/components/meal-planner/AddRecipeModal'
import EditRecipeModal from '@/components/meal-planner/EditRecipeModal'
import AddMealPlanModal from '@/components/meal-planner/AddMealPlanModal'
import CookHistoryModal from '@/components/meal-planner/CookHistoryModal'
import { useRouter } from 'next/navigation'

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner']

function getWeekDates(): { date: Date; label: string; dateStr: string }[] {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0 = Sunday
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7))
  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    days.push({
      date: d,
      label: d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }),
      dateStr: d.toISOString().split('T')[0]
    })
  }
  return days
}

export default function MealPlannerComponent() {
  const router = useRouter()
  const [addRecipeOpened, { open: openAddRecipe, close: closeAddRecipe }] = useDisclosure(false)
  const [editRecipe, setEditRecipe] = useState<RecipeItem | null>(null)
  const [addMealOpened, { open: openAddMeal, close: closeAddMeal }] = useDisclosure(false)
  const [selectedMealDate, setSelectedMealDate] = useState<string>('')
  const [selectedMealType, setSelectedMealType] = useState<string>('')
  const [cookHistoryRecipeId, setCookHistoryRecipeId] = useState<number | null>(null)

  const weekDates = getWeekDates()
  const startDate = weekDates[0].dateStr
  const endDate = weekDates[6].dateStr

  const { data: recipesData, isLoading: isLoadingRecipes } = useQuery({
    queryKey: [QueryKeys.Recipes],
    queryFn: async () => await doQueryGet<GetRecipesResponse>('/api/mealplanner/GetRecipes')
  })

  const { data: mealPlanData, isLoading: isLoadingMealPlan } = useQuery({
    queryKey: [QueryKeys.MealPlan, startDate, endDate],
    queryFn: async () => await doQueryGet<GetMealPlanResponse>(`/api/mealplanner/GetMealPlan?startDate=${startDate}&endDate=${endDate}`)
  })

  const recipes = recipesData?.recipes ?? []
  const mealPlanEntries = mealPlanData?.entries ?? []

  const { mutate: deleteRecipe, isPending: isDeletingRecipe } = useMutationDelete<number, void>({
    url: (recipeId) => `/api/mealplanner/DeleteRecipe?recipeId=${recipeId}`,
    queryKey: [QueryKeys.Recipes],
    invalidateQuery: true,
    onSuccess: () => {
      notificationHelper.showSuccessNotification('Success', 'Recipe deleted successfully', 3000, <IconCheck />)
    },
    onError: (error) => {
      notificationHelper.showErrorNotification('Error', error.message || 'Failed to delete recipe', 3000, <IconX />)
    }
  })

  const { mutate: deleteMealEntry, isPending: isDeletingMealEntry } = useMutationDelete<number, void>({
    url: (entryId) => `/api/mealplanner/DeleteMealPlanEntry?entryId=${entryId}`,
    queryKey: [QueryKeys.MealPlan, startDate, endDate],
    invalidateQuery: true,
    onSuccess: () => {
      notificationHelper.showSuccessNotification('Success', 'Meal removed from plan', 3000, <IconCheck />)
    },
    onError: (error) => {
      notificationHelper.showErrorNotification('Error', error.message || 'Failed to remove meal', 3000, <IconX />)
    }
  })

  const { mutate: logCook, isPending: isLoggingCook } = useMutationPost<number, number>({
    url: (recipeId) => `/api/mealplanner/LogCook?recipeId=${recipeId}`,
    queryKey: [QueryKeys.Recipes],
    invalidateQuery: true,
    onSuccess: () => {
      notificationHelper.showSuccessNotification('Success', 'Cook logged!', 3000, <IconCheck />)
    },
    onError: (error) => {
      notificationHelper.showErrorNotification('Error', error.message || 'Failed to log cook', 3000, <IconX />)
    }
  })

  const { mutate: addToShoppingList, isPending: isAddingToShoppingList } = useMutationPost<number, void>({
    url: (recipeId) => `/api/mealplanner/AddRecipeIngredientsToShoppingList?recipeId=${recipeId}`,
    queryKey: [QueryKeys.Recipes],
    invalidateQuery: false,
    onSuccess: () => {
      notificationHelper.showSuccessNotification('Success', 'Ingredients added to shopping list', 3000, <IconCheck />)
    },
    onError: (error) => {
      notificationHelper.showErrorNotification('Error', error.message || 'Failed to add to shopping list', 3000, <IconX />)
    }
  })

  const handleAddMeal = (dateStr: string, mealType: string) => {
    setSelectedMealDate(dateStr)
    setSelectedMealType(mealType)
    openAddMeal()
  }

  const isLoading = isLoadingRecipes || isLoadingMealPlan

  if (isLoading) {
    return (
      <Container size="xl" px={{ base: 'xs', sm: 'md' }}>
        <Center h={400}>
          <Loader size="lg" />
        </Center>
      </Container>
    )
  }

  const totalRecipes = recipes.length
  const totalCooks = recipes.reduce((sum, r) => sum + r.timesCooked, 0)
  const mealsPlanned = mealPlanEntries.length
  const mostCookedRecipe = recipes.length > 0
    ? recipes.reduce((prev, curr) => curr.timesCooked > prev.timesCooked ? curr : prev)
    : null

  return (
    <Container size="xl" px={{ base: 'xs', sm: 'md' }}>
      <Stack gap="xl">
        {/* Page Header */}
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={1} mb="xs">
              Meal Planner
            </Title>
            <Text c="dimmed" size="sm">
              Plan your meals and manage your recipe collection
            </Text>
          </div>
          <Button
            leftSection={<IconPlus size="1rem" />}
            onClick={openAddRecipe}
          >
            Add Recipe
          </Button>
        </Group>

        {/* Stats Cards */}
        <Grid>
          <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
            <Card withBorder p="lg" radius="md" shadow="sm">
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>Total Recipes</Text>
                <ThemeIcon size="lg" radius="md" variant="light" color="blue">
                  <IconToolsKitchen2 size="1.2rem" />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700}>{totalRecipes}</Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
            <Card withBorder p="lg" radius="md" shadow="sm">
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>Times Cooked</Text>
                <ThemeIcon size="lg" radius="md" variant="light" color="orange">
                  <IconFlame size="1.2rem" />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700}>{totalCooks}</Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
            <Card withBorder p="lg" radius="md" shadow="sm">
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>Meals Planned</Text>
                <ThemeIcon size="lg" radius="md" variant="light" color="green">
                  <IconCalendarEvent size="1.2rem" />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700}>{mealsPlanned}</Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
            <Card withBorder p="lg" radius="md" shadow="sm">
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>Most Cooked</Text>
                <ThemeIcon size="lg" radius="md" variant="light" color="violet">
                  <IconChefHat size="1.2rem" />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700} lineClamp={1}>
                {mostCookedRecipe && mostCookedRecipe.timesCooked > 0 ? mostCookedRecipe.name : '-'}
              </Text>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Weekly Meal Plan */}
        <Card withBorder p="lg" radius="md" shadow="sm">
          <Group gap="xs" mb="md">
            <ThemeIcon size="lg" radius="md" variant="light" color="green">
              <IconCalendarEvent size="1.2rem" />
            </ThemeIcon>
            <Title order={3} size="h4">Weekly Meal Plan</Title>
          </Group>

          <Divider mb="md" />

          <Table.ScrollContainer minWidth={700}>
            <Table verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Day</Table.Th>
                  {MEAL_TYPES.map(type => (
                    <Table.Th key={type}>{type}</Table.Th>
                  ))}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {weekDates.map(day => (
                  <Table.Tr key={day.dateStr}>
                    <Table.Td>
                      <Text size="sm" fw={500}>{day.label}</Text>
                    </Table.Td>
                    {MEAL_TYPES.map(mealType => {
                      const entry = mealPlanEntries.find(
                        e => e.date.split('T')[0] === day.dateStr && e.mealType === mealType
                      )
                      return (
                        <Table.Td key={mealType}>
                          {entry ? (
                            <Group gap="xs" wrap="nowrap">
                              <Text
                                size="sm"
                                lineClamp={1}
                                style={{ flex: 1, cursor: 'pointer' }}
                                c="blue"
                                onClick={() => router.push(`/meal-planner/${entry.recipeId}`)}
                              >
                                {entry.recipeName}
                              </Text>
                              <ActionIcon
                                variant="subtle"
                                color="red"
                                size="xs"
                                onClick={() => deleteMealEntry(entry.id)}
                                disabled={isDeletingMealEntry}
                              >
                                <IconTrash size="0.8rem" />
                              </ActionIcon>
                            </Group>
                          ) : (
                            <ActionIcon
                              variant="subtle"
                              color="gray"
                              size="sm"
                              onClick={() => handleAddMeal(day.dateStr, mealType)}
                              title={`Add ${mealType}`}
                            >
                              <IconPlus size="0.9rem" />
                            </ActionIcon>
                          )}
                        </Table.Td>
                      )
                    })}
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Card>

        {/* Recipe Book */}
        <Grid>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Card withBorder p="lg" radius="md" shadow="sm">
              <Group justify="space-between" mb="md">
                <Group gap="xs">
                  <ThemeIcon size="lg" radius="md" variant="light" color="blue">
                    <IconToolsKitchen2 size="1.2rem" />
                  </ThemeIcon>
                  <Title order={3} size="h4">Recipe Book</Title>
                </Group>
                <Badge variant="light">{recipes.length} recipes</Badge>
              </Group>

              <Divider mb="md" />

              <Stack gap="sm">
                {recipes.length === 0 ? (
                  <Text c="dimmed" ta="center" py="xl">
                    No recipes yet. Add your first recipe to get started!
                  </Text>
                ) : (
                  recipes.map(recipe => (
                    <Card
                      key={recipe.id}
                      withBorder
                      p="sm"
                      radius="sm"
                    >
                      <Group justify="space-between" wrap="nowrap">
                        <Stack gap={2} style={{ flex: 1, cursor: 'pointer' }} onClick={() => router.push(`/meal-planner/${recipe.id}`)}>
                          <Text size="sm" fw={500} c="blue">{recipe.name}</Text>
                          <Text size="xs" c="dimmed" lineClamp={1}>{recipe.description}</Text>
                          <Group gap="xs" mt={5}>
                            {recipe.prepTimeMinutes && (
                              <Badge size="xs" variant="light" color="blue">
                                <Group gap={4} wrap="nowrap">
                                  <IconClock size="0.65rem" />
                                  Prep: {recipe.prepTimeMinutes}m
                                </Group>
                              </Badge>
                            )}
                            {recipe.cookTimeMinutes && (
                              <Badge size="xs" variant="light" color="orange">
                                <Group gap={4} wrap="nowrap">
                                  <IconFlame size="0.65rem" />
                                  Cook: {recipe.cookTimeMinutes}m
                                </Group>
                              </Badge>
                            )}
                            {recipe.servings && (
                              <Badge size="xs" variant="light" color="green">
                                <Group gap={4} wrap="nowrap">
                                  <IconUsers size="0.65rem" />
                                  Serves: {recipe.servings}
                                </Group>
                              </Badge>
                            )}
                            <Badge size="xs" variant="outline">
                              Cooked {recipe.timesCooked} {recipe.timesCooked === 1 ? 'time' : 'times'}
                            </Badge>
                          </Group>
                        </Stack>
                        <Group gap="xs">
                          <ActionIcon variant="subtle" color="orange" size="sm"
                            onClick={() => addToShoppingList(recipe.id)} disabled={isAddingToShoppingList}
                            title="Add ingredients to shopping list">
                            <IconShoppingCart size="1rem" />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color="green"
                            size="sm"
                            onClick={() => logCook(recipe.id)}
                            disabled={isLoggingCook}
                            title="Log cook"
                          >
                            <IconFlame size="1rem" />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color="blue"
                            size="sm"
                            onClick={() => setCookHistoryRecipeId(recipe.id)}
                            title="View cook history"
                          >
                            <IconHistory size="1rem" />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color="yellow"
                            size="sm"
                            onClick={() => setEditRecipe(recipe)}
                            title="Edit recipe"
                          >
                            <IconEdit size="1rem" />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            size="sm"
                            onClick={() => deleteRecipe(recipe.id)}
                            disabled={isDeletingRecipe}
                            title="Delete recipe"
                          >
                            <IconTrash size="1rem" />
                          </ActionIcon>
                        </Group>
                      </Group>
                    </Card>
                  ))
                )}
              </Stack>
            </Card>
          </Grid.Col>

          {/* Sidebar */}
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="md">
              <Card withBorder p="lg" radius="md" shadow="sm">
                <Group gap="xs" mb="md">
                  <ThemeIcon size="lg" radius="md" variant="light" color="cyan">
                    <IconHistory size="1.2rem" />
                  </ThemeIcon>
                  <Title order={4} size="h5">Recently Cooked</Title>
                </Group>
                <Divider mb="md" />
                <Stack gap="xs">
                  {recipes.filter(r => r.lastCooked).length === 0 ? (
                    <Text size="sm" c="dimmed" ta="center" py="md">
                      No cook history yet
                    </Text>
                  ) : (
                    recipes
                      .filter(r => r.lastCooked)
                      .sort((a, b) => new Date(b.lastCooked!).getTime() - new Date(a.lastCooked!).getTime())
                      .slice(0, 5)
                      .map(recipe => (
                        <Group key={recipe.id} justify="space-between" wrap="nowrap">
                          <Text size="sm" lineClamp={1} style={{ flex: 1 }}>{recipe.name}</Text>
                          <Badge size="xs" variant="light" color="gray">
                            {new Date(recipe.lastCooked!).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </Badge>
                        </Group>
                      ))
                  )}
                </Stack>
              </Card>

              <Card withBorder p="lg" radius="md" shadow="sm">
                <Group gap="xs" mb="md">
                  <ThemeIcon size="lg" radius="md" variant="light" color="violet">
                    <IconChefHat size="1.2rem" />
                  </ThemeIcon>
                  <Title order={4} size="h5">Top Recipes</Title>
                </Group>
                <Divider mb="md" />
                <Stack gap="xs">
                  {recipes.filter(r => r.timesCooked > 0).length === 0 ? (
                    <Text size="sm" c="dimmed" ta="center" py="md">
                      No cook history yet
                    </Text>
                  ) : (
                    recipes
                      .filter(r => r.timesCooked > 0)
                      .sort((a, b) => b.timesCooked - a.timesCooked)
                      .slice(0, 5)
                      .map(recipe => (
                        <Group key={recipe.id} justify="space-between">
                          <Text size="sm" lineClamp={1} style={{ flex: 1 }}>{recipe.name}</Text>
                          <Badge variant="light" color="orange">
                            {recipe.timesCooked}x
                          </Badge>
                        </Group>
                      ))
                  )}
                </Stack>
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>

      <AddRecipeModal
        opened={addRecipeOpened}
        onClose={closeAddRecipe}
        allRecipes={recipes}
      />

      <EditRecipeModal
        recipe={editRecipe}
        onClose={() => setEditRecipe(null)}
        allRecipes={recipes}
      />

      <AddMealPlanModal
        opened={addMealOpened}
        onClose={closeAddMeal}
        recipes={recipes}
        initialDate={selectedMealDate}
        initialMealType={selectedMealType}
        mealPlanQueryKey={[QueryKeys.MealPlan, startDate, endDate]}
      />

      <CookHistoryModal
        recipeId={cookHistoryRecipeId}
        onClose={() => setCookHistoryRecipeId(null)}
      />
    </Container>
  )
}
