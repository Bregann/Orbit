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
  Checkbox,
  ActionIcon,
  Divider,
  ThemeIcon,
  Progress,
  Loader,
  Center
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useState } from 'react'
import {
  IconPlus,
  IconTrash,
  IconCalendar,
  IconFlag,
  IconCheckbox,
  IconListCheck,
  IconClipboardList,
  IconCircleCheck,
  IconClock,
  IconCategory,
  IconX,
  IconCheck
} from '@tabler/icons-react'
import { useQuery } from '@tanstack/react-query'
import { doQueryGet } from '@/helpers/apiClient'
import { useMutationPatch } from '@/helpers/mutations/useMutationPatch'
import { useMutationDelete } from '@/helpers/mutations/useMutationDelete'
import notificationHelper from '@/helpers/notificationHelper'
import type { GetTasksResponse } from '@/interfaces/api/tasks/GetTasksResponse'
import type { GetTaskCategoriesResponse } from '@/interfaces/api/tasks/GetTaskCategoriesResponse'
import { TaskPriorityType } from '@/interfaces/api/tasks/TaskPriorityType'
import AddTaskModal from '@/components/tasks/AddTaskModal'
import ManageCategoriesModal from '@/components/tasks/ManageCategoriesModal'

export default function TasksComponent() {
  const [selectedCategory, setSelectedCategory] = useState<number | 'All'>('All')
  const [showCompleted, setShowCompleted] = useState(false)
  const [addModalOpened, { open: openAddModal, close: closeAddModal }] = useDisclosure(false)
  const [categoryModalOpened, { open: openCategoryModal, close: closeCategoryModal }] = useDisclosure(false)

  // Fetch tasks
  const { data: tasksData, isLoading: isLoadingTasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => await doQueryGet<GetTasksResponse>('/api/tasks/GetTasks')
  })

  // Fetch categories
  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['taskCategories'],
    queryFn: async () => await doQueryGet<GetTaskCategoriesResponse>('/api/tasks/GetTaskCategories')
  })

  const tasks = tasksData?.tasks ?? []
  const categories = categoriesData?.categories ?? []

  // Delete task mutation
  const { mutate: deleteTask, isPending: isDeletingTask } = useMutationDelete<number, void>({
    url: (taskId) => `/api/tasks/DeleteTask?taskId=${taskId}`,
    queryKey: ['tasks'],
    invalidateQuery: true,
    onSuccess: () => {
      notificationHelper.showSuccessNotification('Success', 'Task deleted successfully', 3000, <IconCheck />)
    },
    onError: (error) => {
      notificationHelper.showErrorNotification('Error', error.message || 'Failed to delete task', 3000, <IconX />)
    }
  })

  // Complete task mutation
  const { mutate: completeTask, isPending: isCompletingTask } = useMutationPatch<number, void>({
    url: (taskId) => `/api/tasks/CompleteTask?taskId=${taskId}`,
    queryKey: ['tasks'],
    invalidateQuery: true,
    onSuccess: () => {
      notificationHelper.showSuccessNotification('Success', 'Task completed!', 3000, <IconCheck />)
    },
    onError: (error) => {
      notificationHelper.showErrorNotification('Error', error.message || 'Failed to complete task', 3000, <IconX />)
    }
  })

  const handleCategoryDeleted = () => {
    if (selectedCategory !== 'All') {
      setSelectedCategory('All')
    }
  }

  const getCategoryName = (categoryId: number): string => {
    const category = categories.find(c => c.id === categoryId)
    return category?.name ?? 'Unknown'
  }

  const filteredTasks = tasks.filter(task => {
    const categoryMatch = selectedCategory === 'All' || task.taskCategoryId === selectedCategory
    const completedMatch = showCompleted || task.dateCompleted === null
    return categoryMatch && completedMatch
  })

  const completedCount = tasks.filter(t => t.dateCompleted !== null).length
  const totalCount = tasks.length
  const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  const todaysTasks = tasks.filter(t => {
    if (!t.dueDate || t.dateCompleted !== null) return false
    const today = new Date().toISOString().split('T')[0]
    const taskDate = new Date(t.dueDate).toISOString().split('T')[0]
    return taskDate === today
  })

  const overdueTasks = tasks.filter(t => {
    if (!t.dueDate || t.dateCompleted !== null) return false
    const today = new Date().toISOString().split('T')[0]
    const taskDate = new Date(t.dueDate).toISOString().split('T')[0]
    return taskDate < today
  })

  const upcomingTasks = tasks.filter(t => {
    if (!t.dueDate || t.dateCompleted !== null) return false
    const today = new Date()
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    const taskDate = new Date(t.dueDate)
    return taskDate > today && taskDate <= nextWeek
  })

  const getPriorityColor = (priority: TaskPriorityType) => {
    switch (priority) {
      case TaskPriorityType.Critical: return 'red'
      case TaskPriorityType.High: return 'orange'
      case TaskPriorityType.Medium: return 'yellow'
      case TaskPriorityType.Low: return 'blue'
      default: return 'gray'
    }
  }

  const getPriorityLabel = (priority: TaskPriorityType) => {
    switch (priority) {
      case TaskPriorityType.Critical: return 'Critical'
      case TaskPriorityType.High: return 'High'
      case TaskPriorityType.Medium: return 'Medium'
      case TaskPriorityType.Low: return 'Low'
      default: return 'Unknown'
    }
  }

  const isLoading = isLoadingTasks || isLoadingCategories

  if (isLoading) {
    return (
      <Container size="xl" px={{ base: 'xs', sm: 'md' }}>
        <Center h={400}>
          <Loader size="lg" />
        </Center>
      </Container>
    )
  }

  return (
    <Container size="xl" px={{ base: 'xs', sm: 'md' }}>
      <Stack gap="xl">
        {/* Page Header */}
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={1} mb="xs">
              Tasks
            </Title>
            <Text c="dimmed" size="sm">
              Manage your to-do lists and stay organized
            </Text>
          </div>
          <Button
            leftSection={<IconPlus size="1rem" />}
            onClick={openAddModal}
          >
            Add Task
          </Button>
        </Group>

        {/* Stats Cards */}
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
            <Card withBorder p="lg" radius="md" shadow="sm">
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>Total Tasks</Text>
                <ThemeIcon size="lg" radius="md" variant="light" color="blue">
                  <IconClipboardList size="1.2rem" />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700}>{totalCount}</Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
            <Card withBorder p="lg" radius="md" shadow="sm">
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>Completed</Text>
                <ThemeIcon size="lg" radius="md" variant="light" color="green">
                  <IconCircleCheck size="1.2rem" />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700}>{completedCount}</Text>
              <Progress value={completionPercentage} size="sm" mt="sm" color="green" />
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
            <Card withBorder p="lg" radius="md" shadow="sm">
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>Due Today</Text>
                <ThemeIcon size="lg" radius="md" variant="light" color="orange">
                  <IconClock size="1.2rem" />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700}>{todaysTasks.length}</Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, xs: 6, md: 3 }}>
            <Card withBorder p="lg" radius="md" shadow="sm">
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>Overdue</Text>
                <ThemeIcon size="lg" radius="md" variant="light" color="red">
                  <IconFlag size="1.2rem" />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700} c={overdueTasks.length > 0 ? 'red' : undefined}>
                {overdueTasks.length}
              </Text>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Filters */}
        <Card withBorder p="md" radius="md" shadow="sm">
          <Group justify="space-between" wrap="wrap" gap="md">
            <Group gap="sm" wrap="wrap">
              <Button
                variant={selectedCategory === 'All' ? 'filled' : 'light'}
                size="xs"
                onClick={() => setSelectedCategory('All')}
              >
                All
              </Button>
              {categories.map(category => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'filled' : 'light'}
                  size="xs"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </Button>
              ))}
              <ActionIcon
                variant="light"
                color="gray"
                size="sm"
                onClick={openCategoryModal}
                title="Manage Categories"
              >
                <IconCategory size="1rem" />
              </ActionIcon>
            </Group>
            <Checkbox
              label="Show completed"
              checked={showCompleted}
              onChange={(e) => setShowCompleted(e.currentTarget.checked)}
            />
          </Group>
        </Card>

        {/* Task List */}
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Card withBorder p="lg" radius="md" shadow="sm">
              <Group justify="space-between" mb="md">
                <Group gap="xs">
                  <ThemeIcon size="lg" radius="md" variant="light" color="blue">
                    <IconListCheck size="1.2rem" />
                  </ThemeIcon>
                  <Title order={3} size="h4">All Tasks</Title>
                </Group>
                <Badge variant="light">{filteredTasks.length} tasks</Badge>
              </Group>

              <Divider mb="md" />

              <Stack gap="sm">
                {filteredTasks.length === 0 ? (
                  <Text c="dimmed" ta="center" py="xl">
                    No tasks found. Add a new task to get started!
                  </Text>
                ) : (
                  filteredTasks.map(task => (
                    <Card
                      key={task.id}
                      withBorder
                      p="sm"
                      radius="sm"
                      style={{ opacity: task.dateCompleted !== null ? 0.6 : 1 }}
                    >
                      <Group justify="space-between" wrap="nowrap">
                        <Group gap="sm" wrap="nowrap" style={{ flex: 1 }}>
                          <Checkbox
                            checked={task.dateCompleted !== null}
                            onChange={() => {
                              if (task.dateCompleted === null) {
                                completeTask(task.id)
                              }
                            }}
                            disabled={task.dateCompleted !== null || isCompletingTask}
                            size="md"
                          />
                          <Stack gap={2} style={{ flex: 1 }}>
                            <Text
                              size="sm"
                              fw={500}
                              td={task.dateCompleted !== null ? 'line-through' : undefined}
                            >
                              {task.title}
                            </Text>
                            {task.description && (
                              <Text size="xs" c="dimmed" lineClamp={1}>
                                {task.description}
                              </Text>
                            )}
                            <Group gap="xs" mt={5}>
                              <Badge size="xs" variant="light" color={getPriorityColor(task.priority)}>
                                {getPriorityLabel(task.priority)}
                              </Badge>
                              <Badge size="xs" variant="outline">
                                {getCategoryName(task.taskCategoryId)}
                              </Badge>
                              {task.dueDate && (
                                <Text size="xs" c="dimmed">
                                  <IconCalendar size="0.75rem" style={{ verticalAlign: 'middle', marginRight: 4 }} />
                                  {new Date(task.dueDate).toLocaleDateString()}
                                </Text>
                              )}
                            </Group>
                          </Stack>
                        </Group>
                        <Group gap="xs">
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            size="sm"
                            onClick={() => deleteTask(task.id)}
                            disabled={isDeletingTask}
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
              {/* Upcoming Tasks */}
              <Card withBorder p="lg" radius="md" shadow="sm">
                <Group gap="xs" mb="md">
                  <ThemeIcon size="lg" radius="md" variant="light" color="cyan">
                    <IconClock size="1.2rem" />
                  </ThemeIcon>
                  <Title order={4} size="h5">Upcoming (7 days)</Title>
                </Group>
                <Divider mb="md" />
                <Stack gap="xs">
                  {upcomingTasks.length === 0 ? (
                    <Text size="sm" c="dimmed" ta="center" py="md">
                      No upcoming tasks
                    </Text>
                  ) : (
                    upcomingTasks.slice(0, 5).map(task => (
                      <Group key={task.id} justify="space-between" wrap="nowrap">
                        <Text size="sm" lineClamp={1} style={{ flex: 1 }}>{task.title}</Text>
                        <Badge size="xs" variant="light" color={getPriorityColor(task.priority)}>
                          {task.dueDate && new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </Badge>
                      </Group>
                    ))
                  )}
                </Stack>
              </Card>

              {/* Categories Overview */}
              <Card withBorder p="lg" radius="md" shadow="sm">
                <Group justify="space-between" mb="md">
                  <Group gap="xs">
                    <ThemeIcon size="lg" radius="md" variant="light" color="violet">
                      <IconCheckbox size="1.2rem" />
                    </ThemeIcon>
                    <Title order={4} size="h5">By Category</Title>
                  </Group>
                  <ActionIcon
                    variant="light"
                    color="blue"
                    size="sm"
                    onClick={openCategoryModal}
                    title="Manage Categories"
                  >
                    <IconCategory size="0.9rem" />
                  </ActionIcon>
                </Group>
                <Divider mb="md" />
                <Stack gap="xs">
                  {categories.length === 0 ? (
                    <Text size="sm" c="dimmed" ta="center" py="md">
                      No categories yet
                    </Text>
                  ) : (
                    categories.map(category => {
                      const categoryTasks = tasks.filter(t => t.taskCategoryId === category.id)
                      const completed = categoryTasks.filter(t => t.dateCompleted !== null).length
                      return (
                        <Group key={category.id} justify="space-between">
                          <Text size="sm">{category.name}</Text>
                          <Badge variant="light" color={completed === categoryTasks.length && categoryTasks.length > 0 ? 'green' : 'gray'}>
                            {completed}/{categoryTasks.length}
                          </Badge>
                        </Group>
                      )
                    })
                  )}
                </Stack>
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>

      <AddTaskModal
        opened={addModalOpened}
        onClose={closeAddModal}
        categories={categories}
      />

      <ManageCategoriesModal
        opened={categoryModalOpened}
        onClose={closeCategoryModal}
        categories={categories}
        tasks={tasks}
        onCategoryDeleted={handleCategoryDeleted}
      />
    </Container>
  )
}
