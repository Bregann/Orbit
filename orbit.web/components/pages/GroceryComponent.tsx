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
  Modal
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { useState } from 'react'
import {
  IconPlus,
  IconTrash,
  IconShoppingCart,
  IconCheck,
  IconBasket,
  IconRefresh,
  IconX,
  IconEdit
} from '@tabler/icons-react'

// Mock data - replace with real data later
const mockItems = [
  { id: 1, name: 'Milk', checked: false },
  { id: 2, name: 'Bread', checked: false },
  { id: 3, name: 'Chicken Breast', checked: false },
  { id: 4, name: 'Apples', checked: true },
  { id: 5, name: 'Bananas', checked: false },
  { id: 6, name: 'Eggs', checked: false },
  { id: 7, name: 'Orange Juice', checked: true },
  { id: 8, name: 'Pasta', checked: false },
  { id: 9, name: 'Dish Soap', checked: false },
  { id: 10, name: 'Dog Food', checked: false },
]

const defaultCommonItems = ['Milk', 'Bread', 'Eggs', 'Butter', 'Cheese', 'Chicken', 'Rice', 'Pasta', 'Bananas', 'Apples', 'Onions', 'Potatoes']

export default function GroceryComponent() {
  const [items, setItems] = useState(mockItems)
  const [commonItems, setCommonItems] = useState(defaultCommonItems)
  const [showChecked, setShowChecked] = useState(true)
  const [newListModalOpened, { open: openNewListModal, close: closeNewListModal }] = useDisclosure(false)
  const [commonItemsModalOpened, { open: openCommonItemsModal, close: closeCommonItemsModal }] = useDisclosure(false)

  // Quick add state
  const [quickAddName, setQuickAddName] = useState('')
  const [newCommonItem, setNewCommonItem] = useState('')

  const toggleItemChecked = (itemId: number) => {
    setItems(items.map(item =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    ))
  }

  const deleteItem = (itemId: number) => {
    setItems(items.filter(item => item.id !== itemId))
  }

  const handleQuickAdd = () => {
    if (!quickAddName.trim()) return

    const newItem = {
      id: Math.max(...items.map(i => i.id), 0) + 1,
      name: quickAddName.trim(),
      checked: false
    }

    setItems([...items, newItem])
    setQuickAddName('')
  }

  const clearCheckedItems = () => {
    setItems(items.filter(item => !item.checked))
  }

  const startNewList = () => {
    setItems([])
    closeNewListModal()
  }

  const handleAddCommonItem = () => {
    if (!newCommonItem.trim()) return
    if (commonItems.some(item => item.toLowerCase() === newCommonItem.trim().toLowerCase())) return

    setCommonItems([...commonItems, newCommonItem.trim()])
    setNewCommonItem('')
  }

  const handleRemoveCommonItem = (itemToRemove: string) => {
    setCommonItems(commonItems.filter(item => item !== itemToRemove))
  }

  const filteredItems = items.filter(item => {
    return showChecked || !item.checked
  })

  const checkedCount = items.filter(i => i.checked).length
  const totalCount = items.length
  const remainingCount = totalCount - checkedCount

  return (
    <Container size="xl" px={{ base: 'xs', sm: 'md' }}>
      <Stack gap="xl">
        {/* Page Header */}
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={1} mb="xs">
              Grocery List
            </Title>
            <Text c="dimmed" size="sm">
              Keep track of your shopping items
            </Text>
          </div>
          <Group>
            <Button
              variant="light"
              color="blue"
              leftSection={<IconRefresh size="1rem" />}
              onClick={openNewListModal}
            >
              New List
            </Button>
            {checkedCount > 0 && (
              <Button
                variant="light"
                color="red"
                leftSection={<IconTrash size="1rem" />}
                onClick={clearCheckedItems}
              >
                Clear Checked ({checkedCount})
              </Button>
            )}
          </Group>
        </Group>

        {/* Quick Add */}
        <Card withBorder p="md" radius="md" shadow="sm">
          <Group gap="sm">
            <TextInput
              placeholder="Quick add item..."
              value={quickAddName}
              onChange={(e) => setQuickAddName(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleQuickAdd()
              }}
              style={{ flex: 1 }}
              leftSection={<IconPlus size="1rem" />}
            />
            <Button onClick={handleQuickAdd}>Add</Button>
          </Group>
        </Card>

        {/* Stats Cards */}
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, xs: 4 }}>
            <Card withBorder p="lg" radius="md" shadow="sm">
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>Total Items</Text>
                <ThemeIcon size="lg" radius="md" variant="light" color="blue">
                  <IconShoppingCart size="1.2rem" />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700}>{totalCount}</Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, xs: 4 }}>
            <Card withBorder p="lg" radius="md" shadow="sm">
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>Remaining</Text>
                <ThemeIcon size="lg" radius="md" variant="light" color="orange">
                  <IconBasket size="1.2rem" />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700}>{remainingCount}</Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, xs: 4 }}>
            <Card withBorder p="lg" radius="md" shadow="sm">
              <Group justify="space-between" mb="xs">
                <Text size="sm" c="dimmed" fw={500}>In Cart</Text>
                <ThemeIcon size="lg" radius="md" variant="light" color="green">
                  <IconCheck size="1.2rem" />
                </ThemeIcon>
              </Group>
              <Text size="xl" fw={700}>{checkedCount}</Text>
            </Card>
          </Grid.Col>
        </Grid>

        {/* Shopping List */}
        <Card withBorder p="lg" radius="md" shadow="sm">
          <Group justify="space-between" mb="md">
            <Group gap="xs">
              <ThemeIcon size="lg" radius="md" variant="light" color="orange">
                <IconShoppingCart size="1.2rem" />
              </ThemeIcon>
              <Title order={3} size="h4">Shopping List</Title>
            </Group>
            <Group gap="md">
              <Checkbox
                label="Show checked"
                checked={showChecked}
                onChange={(e) => setShowChecked(e.currentTarget.checked)}
              />
              <Badge variant="light">{filteredItems.length} items</Badge>
            </Group>
          </Group>

          <Divider mb="md" />

          {filteredItems.length === 0 ? (
            <Text c="dimmed" ta="center" py="xl">
              {items.length === 0
                ? 'Your list is empty. Add some items to get started!'
                : 'All items are checked off. Nice work!'}
            </Text>
          ) : (
            <Stack gap="xs">
              {filteredItems.map(item => (
                <Card
                  key={item.id}
                  withBorder
                  p="sm"
                  radius="sm"
                  style={{ opacity: item.checked ? 0.6 : 1 }}
                >
                  <Group justify="space-between" wrap="nowrap">
                    <Group gap="sm" wrap="nowrap" style={{ flex: 1 }}>
                      <Checkbox
                        checked={item.checked}
                        onChange={() => toggleItemChecked(item.id)}
                        size="md"
                      />
                      <Text
                        size="sm"
                        fw={500}
                        td={item.checked ? 'line-through' : undefined}
                      >
                        {item.name}
                      </Text>
                    </Group>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      size="sm"
                      onClick={() => deleteItem(item.id)}
                    >
                      <IconTrash size="1rem" />
                    </ActionIcon>
                  </Group>
                </Card>
              ))}
            </Stack>
          )}
        </Card>

        {/* Quick Add Common Items */}
        <Card withBorder p="lg" radius="md" shadow="sm">
          <Group justify="space-between" mb="md">
            <Group gap="xs">
              <ThemeIcon size="lg" radius="md" variant="light" color="cyan">
                <IconBasket size="1.2rem" />
              </ThemeIcon>
              <Title order={4} size="h5">Quick Add Common Items</Title>
            </Group>
            <ActionIcon
              variant="light"
              color="blue"
              size="sm"
              onClick={openCommonItemsModal}
              title="Edit Common Items"
            >
              <IconEdit size="0.9rem" />
            </ActionIcon>
          </Group>
          <Divider mb="md" />
          {commonItems.length === 0 ? (
            <Text c="dimmed" ta="center" py="md">
              No common items. Click edit to add some!
            </Text>
          ) : (
            <Group gap="xs">
              {commonItems.map(itemName => (
                <Button
                  key={itemName}
                  size="xs"
                  variant="light"
                  leftSection={<IconPlus size="0.8rem" />}
                  onClick={() => {
                    const existing = items.find(i => i.name.toLowerCase() === itemName.toLowerCase() && !i.checked)
                    if (!existing) {
                      setItems([...items, {
                        id: Math.max(...items.map(i => i.id), 0) + 1,
                        name: itemName,
                        checked: false
                      }])
                    }
                  }}
                >
                  {itemName}
                </Button>
              ))}
            </Group>
          )}
        </Card>
      </Stack>

      {/* New List Confirmation Modal */}
      <Modal
        opened={newListModalOpened}
        onClose={closeNewListModal}
        title="Start New Shopping List"
        size="sm"
      >
        <Stack gap="md">
          <Text size="sm">
            Are you sure you want to start a new list? This will clear all current items.
          </Text>
          <Group justify="flex-end">
            <Button variant="light" onClick={closeNewListModal}>Cancel</Button>
            <Button color="blue" onClick={startNewList} leftSection={<IconRefresh size="1rem" />}>
              Start New List
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Manage Common Items Modal */}
      <Modal
        opened={commonItemsModalOpened}
        onClose={closeCommonItemsModal}
        title="Manage Common Items"
        size="md"
      >
        <Stack gap="md">
          <Group gap="xs">
            <TextInput
              placeholder="Add common item..."
              value={newCommonItem}
              onChange={(e) => setNewCommonItem(e.currentTarget.value)}
              style={{ flex: 1 }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddCommonItem()
              }}
            />
            <Button onClick={handleAddCommonItem} leftSection={<IconPlus size="1rem" />}>
              Add
            </Button>
          </Group>

          <Divider />

          <Stack gap="xs">
            {commonItems.length === 0 ? (
              <Text size="sm" c="dimmed" ta="center" py="md">
                No common items yet. Add some above!
              </Text>
            ) : (
              commonItems.map(item => (
                <Card key={item} withBorder p="xs" radius="sm">
                  <Group justify="space-between">
                    <Text size="sm" fw={500}>{item}</Text>
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      size="sm"
                      onClick={() => handleRemoveCommonItem(item)}
                    >
                      <IconX size="1rem" />
                    </ActionIcon>
                  </Group>
                </Card>
              ))
            )}
          </Stack>

          <Group justify="flex-end">
            <Button variant="light" onClick={closeCommonItemsModal}>Close</Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  )
}
