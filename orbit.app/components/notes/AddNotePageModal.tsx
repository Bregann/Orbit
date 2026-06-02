import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { notesStyles } from '@/styles/notesStyles';
import { useState } from 'react';
import {
  Modal,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import type { NoteFolder } from '@/interfaces/api/notes/GetNotePagesAndFoldersResponse';

interface AddNotePageModalProps {
  visible: boolean;
  folders: NoteFolder[];
  onClose: () => void;
  onSubmit: (title: string, folderId: number | null) => void;
}

export function AddNotePageModal({ visible, folders, onClose, onSubmit }: AddNotePageModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

  const [title, setTitle] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);

  const handleSubmit = () => {
    const trimmed = title.trim();
    if (!trimmed) return;
    onSubmit(trimmed, selectedFolderId);
    setTitle('');
    setSelectedFolderId(null);
  };

  const handleClose = () => {
    setTitle('');
    setSelectedFolderId(null);
    onClose();
  };

  const Wrapper = Platform.OS === 'ios' ? KeyboardAvoidingView : View;
  const wrapperProps = Platform.OS === 'ios' ? { behavior: 'padding' as const } : {};

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Wrapper style={notesStyles.modalOverlay} {...wrapperProps}>
        <View style={[notesStyles.modalSheet, { backgroundColor: isDark ? '#1D2026' : '#ffffff' }]}>
          <ThemedText type="title" style={notesStyles.modalTitle}>
            New Note Page
          </ThemedText>

          <ThemedText style={notesStyles.modalLabel}>Page Title</ThemedText>
          <TextInput
            style={[
              notesStyles.modalInput,
              {
                color: colors.text,
                backgroundColor: isDark ? '#23272E' : '#f3f4f6',
                borderColor: isDark ? '#495057' : '#dee2e6',
              },
            ]}
            placeholder="Enter page title..."
            placeholderTextColor={colors.icon}
            value={title}
            onChangeText={setTitle}
          />

          <ThemedText style={notesStyles.modalLabel}>Folder (optional)</ThemedText>
          <ScrollView
            style={[notesStyles.pageModalFolderList, { borderColor: isDark ? '#495057' : '#dee2e6' }]}
            showsVerticalScrollIndicator={false}
          >
            <TouchableOpacity
              style={[
                notesStyles.pageModalFolderOption,
                {
                  backgroundColor:
                    selectedFolderId === null
                      ? isDark
                        ? '#4A4F57'
                        : '#dee2e6'
                      : 'transparent',
                },
              ]}
              onPress={() => setSelectedFolderId(null)}
            >
              <IconSymbol name="doc.text" size={18} color={colors.text} />
              <ThemedText style={notesStyles.pageModalFolderOptionText}>No folder</ThemedText>
              {selectedFolderId === null && (
                <IconSymbol name="checkmark" size={16} color={colors.tint} />
              )}
            </TouchableOpacity>
            {folders.map((f) => (
              <TouchableOpacity
                key={f.id}
                style={[
                  notesStyles.pageModalFolderOption,
                  {
                    backgroundColor:
                      selectedFolderId === f.id
                        ? isDark
                          ? '#4A4F57'
                          : '#dee2e6'
                        : 'transparent',
                  },
                ]}
                onPress={() => setSelectedFolderId(f.id)}
              >
                <ThemedText style={notesStyles.pageModalFolderIcon}>{f.folderIcon}</ThemedText>
                <ThemedText style={notesStyles.pageModalFolderOptionText}>{f.folderName}</ThemedText>
                {selectedFolderId === f.id && (
                  <IconSymbol name="checkmark" size={16} color={colors.tint} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={notesStyles.modalButtons}>
            <TouchableOpacity
              style={[notesStyles.modalButton, notesStyles.modalCancelButton, { borderColor: isDark ? '#495057' : '#dee2e6' }]}
              onPress={handleClose}
            >
              <ThemedText>Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                notesStyles.modalButton,
                notesStyles.modalSubmitButton,
                { backgroundColor: '#0a7ea4' },
                !title.trim() && { opacity: 0.5 },
              ]}
              onPress={handleSubmit}
              disabled={!title.trim()}
            >
              <ThemedText style={{ color: '#ffffff' }}>Create</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Wrapper>
    </Modal>
  );
}