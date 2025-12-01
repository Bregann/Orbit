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
  TextInput,
  ActionIcon,
  Divider,
  ThemeIcon,
  Progress,
  Select,
  Modal,
  Textarea
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useState } from 'react'
import {
  IconPlus,
  IconTrash,
  IconEdit,
  IconCalendar,
  IconFlag,
  IconCheckbox,
  IconListCheck,
  IconClipboardList,
  IconCircleCheck,
  IconClock,
  IconCategory,
  IconX
} from '@tabler/icons-react'

// Mock data - replace with real data later
const mockTasks = [
  { id: 1, title: 'Review monthly budget', description: 'Check all expenses and income for the month', completed: false, priority: 'high', dueDate: '2025-12-05', category: 'Finance' },
  { id: 2, title: 'Grocery shopping', description: 'Buy weekly groceries', completed: false, priority: 'medium', dueDate: '2025-12-02', category: 'Shopping' },
  { id: 3, title: 'Call plumber', description: 'Fix the kitchen sink leak', completed: true, priority: 'high', dueDate: '2025-11-30', category: 'Home' },
  { id: 4, title: 'Schedule car maintenance', description: 'Book appointment for oil change', completed: false, priority: 'low', dueDate: '2025-12-15', category: 'Vehicle' },
  { id: 5, title: 'Pay electricity bill', description: 'Due by end of month', completed: true, priority: 'high', dueDate: '2025-11-28', category: 'Finance' },
  { id: 6, title: 'Organize documents', description: 'Sort through paperwork and file important documents', completed: false, priority: 'low', dueDate: '2025-12-10', category: 'Home' },
]

const defaultCategories = ['Finance', 'Shopping', 'Home', 'Vehicle', 'Work', 'Personal']
const priorities = [
  { value: 'high', label: 'High', color: 'red' },
  { value: 'medium', label: 'Medium', color: 'yellow' },
  { value: 'low', label: 'Low', color: 'blue' },
]

export default function TasksComponent() {
  const [tasks, setTasks] = useState(mockTasks)
  const [categories, setCategories] = useState(defaultCategories)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [showCompleted, setShowCompleted] = useState(true)
  const [addModalOpened, { open: openAddModal, close: closeAddModal }] = useDisclosure(false)
  const [categoryModalOpened, { open: openCategoryModal, close: closeCategoryModal }] = useDisclosure(false)

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState<string | null>('medium')
  const [newTaskCategory, setNewTaskCategory] = useState<string | null>('Personal')
  const [newTaskDueDate, setNewTaskDueDate] = useState('')

  // New category form state
  const [newCategoryName, setNewCategoryName] = useState('')

  const toggleTaskComplete = (taskId: number) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ))
  }

  const deleteTask = (taskId: number) => {
    setTasks(tasks.filter(task => task.id !== taskId))
  }

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return

    const newTask = {
      id: Math.max(...tasks.map(t => t.id), 0) + 1,
      title: newTaskTitle,
      description: newTaskDescription,
      completed: false,
      priority: newTaskPriority || 'medium',
      dueDate: newTaskDueDate || new Date().toISOString().split('T')[0],
      category: newTaskCategory || categories[0] || 'General'
    }

    setTasks([...tasks, newTask])
    setNewTaskTitle('')
    setNewTaskDescription('')
    setNewTaskPriority('medium')
    setNewTaskCategory(categories[0] || null)
    setNewTaskDueDate('')
    closeAddModal()
  }

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return
    if (categories.includes(newCategoryName.trim())) return

    setCategories([...categories, newCategoryName.trim()])
    setNewCategoryName('')
  }

  const handleDeleteCategory = (categoryToDelete: string) => {
    // Don't allow deleting if tasks are using this category
    const tasksUsingCategory = tasks.filter(t => t.category === categoryToDelete)
    if (tasksUsingCategory.length > 0) {
      return // Could show a notification here
    }
    setCategories(categories.filter(c => c !== categoryToDelete))
    if (selectedCategory === categoryToDelete) {
      setSelectedCategory('All')
    }
  }

  const filteredTasks = tasks.filter(task => {
    const categoryMatch = selectedCategory === 'All' || task.category === selectedCategory
    const completedMatch = showCompleted || !task.completed
    return categoryMatch && completedMatch
  })

  const completedCount = tasks.filter(t => t.completed).length
  const totalCount = tasks.length
  const completionPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  const todaysTasks = tasks.filter(t => {
    const today = new Date().toISOString().split('T')[0]
    return t.dueDate === today && !t.completed
  })

  const overdueTasks = tasks.filter(t => {
    const today = new Date().toISOString().split('T')[0]
    return t.dueDate < today && !t.completed
  })

  const upcomingTasks = tasks.filter(t => {
    const today = new Date().toISOString().split('T')[0]
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    return t.dueDate > today && t.dueDate <= nextWeek && !t.completed
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red'
      case 'medium': return 'yellow'
      case 'low': return 'blue'
      default: return 'gray'
    }
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
                  key={category}
                  variant={selectedCategory === category ? 'filled' : 'light'}
                  size="xs"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
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
                      style={{ opacity: task.completed ? 0.6 : 1 }}
                    >
                      <Group justify="space-between" wrap="nowrap">
                        <Group gap="sm" wrap="nowrap" style={{ flex: 1 }}>
                          <Checkbox
                            checked={task.completed}
                            onChange={() => toggleTaskComplete(task.id)}
                            size="md"
                          />
                          <Stack gap={2} style={{ flex: 1 }}>
                            <Text
                              size="sm"
                              fw={500}
                              td={task.completed ? 'line-through' : undefined}
                            >
                              {task.title}
                            </Text>
                            <Group gap="xs">
                              <Badge size="xs" variant="light" color={getPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                              <Badge size="xs" variant="outline">
                                {task.category}
                              </Badge>
                              <Text size="xs" c="dimmed">
                                <IconCalendar size="0.75rem" style={{ verticalAlign: 'middle', marginRight: 4 }} />
                                {new Date(task.dueDate).toLocaleDateString()}
                              </Text>
                            </Group>
                          </Stack>
                        </Group>
                        <Group gap="xs">
                          <ActionIcon variant="subtle" color="gray" size="sm">
                            <IconEdit size="1rem" />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color="red"
                            size="sm"
                            onClick={() => deleteTask(task.id)}
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
                          {new Date(task.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
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
                    <IconEdit size="0.9rem" />
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
                      const categoryTasks = tasks.filter(t => t.category === category)
                      const completed = categoryTasks.filter(t => t.completed).length
                      return (
                        <Group key={category} justify="space-between">
                          <Text size="sm">{category}</Text>
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

      {/* Add Task Modal */}
      <Modal
        opened={addModalOpened}
        onClose={closeAddModal}
        title="Add New Task"
        size="md"
      >
        <Stack gap="md">
          <TextInput
            label="Task Title"
            placeholder="Enter task title"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.currentTarget.value)}
            required
          />
          <Textarea
            label="Description"
            placeholder="Enter task description (optional)"
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.currentTarget.value)}
            rows={3}
          />
          <Grid>
            <Grid.Col span={6}>
              <Select
                label="Priority"
                placeholder="Select priority"
                data={priorities.map(p => ({ value: p.value, label: p.label }))}
                value={newTaskPriority}
                onChange={setNewTaskPriority}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                label="Category"
                placeholder="Select category"
                data={categories}
                value={newTaskCategory}
                onChange={setNewTaskCategory}
              />
            </Grid.Col>
          </Grid>
          <TextInput
            label="Due Date"
            type="date"
            value={newTaskDueDate}
            onChange={(e) => setNewTaskDueDate(e.currentTarget.value)}
          />
          <Group justify="flex-end" mt="md">
            <Button variant="light" onClick={closeAddModal}>Cancel</Button>
            <Button onClick={handleAddTask}>Add Task</Button>
          </Group>
        </Stack>
      </Modal>

      {/* Manage Categories Modal */}
      <Modal
        opened={categoryModalOpened}
        onClose={closeCategoryModal}
        title="Manage Categories"
        size="md"
      >
        <Stack gap="md">
          <Group gap="xs">
            <TextInput
              placeholder="New category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.currentTarget.value)}
              style={{ flex: 1 }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddCategory()
              }}
            />
            <Button onClick={handleAddCategory} leftSection={<IconPlus size="1rem" />}>
              Add
            </Button>
          </Group>

          <Divider />

          <Stack gap="xs">
            {categories.length === 0 ? (
              <Text size="sm" c="dimmed" ta="center" py="md">
                No categories yet. Add one above!
              </Text>
            ) : (
              categories.map(category => {
                const taskCount = tasks.filter(t => t.category === category).length
                return (
                  <Card key={category} withBorder p="xs" radius="sm">
                    <Group justify="space-between">
                      <Group gap="sm">
                        <Text size="sm" fw={500}>{category}</Text>
                        <Badge size="xs" variant="light">
                          {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
                        </Badge>
                      </Group>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        size="sm"
                        onClick={() => handleDeleteCategory(category)}
                        disabled={taskCount > 0}
                        title={taskCount > 0 ? 'Cannot delete category with tasks' : 'Delete category'}
                      >
                        <IconX size="1rem" />
                      </ActionIcon>
                    </Group>
                  </Card>
                )
              })
            )}
          </Stack>

          <Text size="xs" c="dimmed">
            Note: Categories with tasks cannot be deleted. Remove or reassign tasks first.
          </Text>

          <Group justify="flex-end">
            <Button variant="light" onClick={closeCategoryModal}>Close</Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  )
}
