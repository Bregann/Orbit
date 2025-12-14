'use client'

import { Group, ActionIcon, Text, Popover, Button, Stack, Box, TextInput } from '@mantine/core'
import { useState } from 'react'
import { IconChevronDown } from '@tabler/icons-react'

const emojiCategories = {
  'Symbols': ['📝', '💡', '📚', '🎯', '💰', '✅', '❤️', '🔥', '⭐', '📌', '🎨', '🎵', '🌟'],
  'Objects': ['📅', '🗂️', '📊', '🖼️', '🎮', '📱', '💻', '🖥️', '⌨️', '🖱️', '📷', '📹', '🎥'],
  'Activities': ['🏠', '💼', '🚀', '⚡', '🎪', '🎭', '🎬', '🎤', '🎧', '🎮', '🎲', '🎯', '🎳'],
  'Faces': ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌'],
  'Nature': ['🌈', '🌟', '⭐', '✨', '🌙', '☀️', '🌤️', '⛅', '🌦️', '🌧️', '⚡', '🔥', '💧'],
}

interface EmojiPickerProps {
  value: string
  onChange: (_emoji: string) => void
  label?: string
}

export default function EmojiPicker({ value, onChange, label }: EmojiPickerProps) {
  const [opened, setOpened] = useState(false)
  const [search, setSearch] = useState('')

  const allEmojis = Object.values(emojiCategories).flat()
  const filteredEmojis = search
    ? allEmojis.filter(emoji => emoji.includes(search))
    : null

  return (
    <Box>
      {label && <Text size="sm" fw={500} mb="xs">{label}</Text>}

      <Group gap="xs">
        <TextInput
          placeholder="Type emoji or click to browse..."
          value={value}
          onChange={(e) => onChange(e.currentTarget.value.slice(0, 2))}
          maxLength={2}
          leftSection={<Text size="lg">{value}</Text>}
          style={{ flex: 1 }}
        />

        <Popover opened={opened} onChange={setOpened} position="bottom-start" width={300} withinPortal>
          <Popover.Target>
            <Button
              variant="light"
              rightSection={<IconChevronDown size="1rem" />}
              onClick={() => setOpened((o) => !o)}
            >
              Browse
            </Button>
          </Popover.Target>

          <Popover.Dropdown>
            <Stack gap="md">
              {filteredEmojis ? (
                <Box>
                  <Group gap={4}>
                    {filteredEmojis.length === 0 ? (
                      <Text size="sm" c="dimmed">No emojis found</Text>
                    ) : (
                      filteredEmojis.map(emoji => (
                        <ActionIcon
                          key={emoji}
                          size="lg"
                          variant={value === emoji ? 'filled' : 'subtle'}
                          onClick={() => {
                            onChange(emoji)
                            setOpened(false)
                            setSearch('')
                          }}
                        >
                          <Text size="lg">{emoji}</Text>
                        </ActionIcon>
                      ))
                    )}
                  </Group>
                </Box>
              ) : (
                Object.entries(emojiCategories).map(([category, emojis]) => (
                  <Box key={category}>
                    <Text size="xs" c="dimmed" fw={500} mb={4}>{category}</Text>
                    <Group gap={4}>
                      {emojis.map(emoji => (
                        <ActionIcon
                          key={emoji}
                          size="lg"
                          variant={value === emoji ? 'filled' : 'subtle'}
                          onClick={() => {
                            onChange(emoji)
                            setOpened(false)
                          }}
                        >
                          <Text size="lg">{emoji}</Text>
                        </ActionIcon>
                      ))}
                    </Group>
                  </Box>
                ))
              )}
            </Stack>
          </Popover.Dropdown>
        </Popover>
      </Group>
    </Box>
  )
}
