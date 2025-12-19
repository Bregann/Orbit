'use client'

import { Modal, Stack, TextInput, Select, Group, Button, Text } from '@mantine/core'
import { RichTextEditor, Link } from '@mantine/tiptap'
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Placeholder from '@tiptap/extension-placeholder'
import { useState, useEffect } from 'react'
import { useMutationPost } from '@/helpers/mutations/useMutationPost'
import notificationHelper from '@/helpers/notificationHelper'
import { IconCheck, IconX } from '@tabler/icons-react'
import { moods } from './JournalEntriesList'
import type { CreateJournalEntryRequest } from '@/interfaces/api/journal/CreateJournalEntryRequest'
import { JournalMoodEnum } from '@/interfaces/api/journal/JournalMoodEnum'
import { QueryKeys } from '@/helpers/QueryKeys'

interface AddJournalEntryModalProps {
  opened: boolean
  onClose: () => void
  initialMood?: JournalMoodEnum
}

export default function AddJournalEntryModal({ opened, onClose, initialMood }: AddJournalEntryModalProps) {
  const [title, setTitle] = useState('')
  const [selectedMood, setSelectedMood] = useState<string>(initialMood?.toString() ?? JournalMoodEnum.Neutral.toString())

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      Placeholder.configure({ placeholder: 'Write about your day...' }),
    ],
    content: '<p></p>',
    immediatelyRender: false,
  })

  // Update mood when initialMood changes
  useEffect(() => {
    if (initialMood !== undefined) {
      setSelectedMood(initialMood.toString())
    }
  }, [initialMood])

  // Clear editor when modal opens
  useEffect(() => {
    if (opened && editor) {
      editor.commands.clearContent()
      editor.commands.focus()
    }
  }, [opened, editor])

  const { mutateAsync: createEntry, isPending } = useMutationPost<CreateJournalEntryRequest, void>({
    url: '/api/journal/CreateJournalEntry',
    queryKey: [QueryKeys.JournalEntries],
    invalidateQuery: true,
    onSuccess: () => {
      notificationHelper.showSuccessNotification('Success', 'Journal entry created', 3000, <IconCheck />)
      resetForm()
      onClose()
    },
    onError: (error) => {
      notificationHelper.showErrorNotification('Error', error.message || 'Failed to create entry', 3000, <IconX />)
    }
  })

  const resetForm = () => {
    setTitle('')
    setSelectedMood(JournalMoodEnum.Neutral.toString())
    editor?.commands.clearContent()
  }

  const handleSubmit = async () => {
    if (!title.trim() || !editor) return

    const request: CreateJournalEntryRequest = {
      title: title.trim(),
      content: editor.getHTML(),
      mood: parseInt(selectedMood) as JournalMoodEnum
    }

    await createEntry(request)
  }

  const isFormValid = title.trim() !== '' && editor?.getText().trim() !== ''

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="New Journal Entry"
      size="lg"
    >
      <Stack gap="md">
        <TextInput
          label="Title"
          placeholder="Give your entry a title..."
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          required
          disabled={isPending}
        />

        <Select
          label="How are you feeling?"
          placeholder="Select your mood"
          data={moods.map(m => ({ value: m.value.toString(), label: m.label }))}
          value={selectedMood}
          onChange={(value) => setSelectedMood(value || JournalMoodEnum.Neutral.toString())}
          disabled={isPending}
        />

        <div>
          <Text size="sm" fw={500} mb="xs">Entry</Text>
          {editor && (
            <RichTextEditor editor={editor}>
              <RichTextEditor.Toolbar sticky stickyOffset={60}>
                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Bold />
                  <RichTextEditor.Italic />
                  <RichTextEditor.Underline />
                  <RichTextEditor.Strikethrough />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.BulletList />
                  <RichTextEditor.OrderedList />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Link />
                  <RichTextEditor.Unlink />
                </RichTextEditor.ControlsGroup>
              </RichTextEditor.Toolbar>

              <RichTextEditor.Content style={{ minHeight: '300px' }} />
            </RichTextEditor>
          )}
        </div>

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!isFormValid || isPending} loading={isPending}>
            Save Entry
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
