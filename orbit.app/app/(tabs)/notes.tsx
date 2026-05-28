import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { QueryKeys } from '@/helpers/QueryKeys';
import { useMutationPost } from '@/helpers/mutations/useMutationPost';
import { NotesList } from '@/components/notes/NotesList';
import { AddNotePageModal } from '@/components/notes/AddNotePageModal';
import { AddNoteFolderModal } from '@/components/notes/AddNoteFolderModal';
import type { CreateNotePageRequest } from '@/interfaces/api/notes/CreateNotePageRequest';
import type { CreateNoteFolderRequest } from '@/interfaces/api/notes/CreateNoteFolderRequest';
import type { NoteFolder } from '@/interfaces/api/notes/GetNotePagesAndFoldersResponse';
import { useQuery } from '@tanstack/react-query';
import { authApiClient } from '@/helpers/apiClient';
import { notesStyles } from '@/styles/notesStyles';
import { useState } from 'react';
import { TouchableOpacity, useColorScheme, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

  const [showAddPage, setShowAddPage] = useState(false);
  const [showAddFolder, setShowAddFolder] = useState(false);

  const { data } = useQuery({
    queryKey: [QueryKeys.GetNotePagesAndFolders],
    queryFn: async () => {
      const res = await authApiClient.get<{ noteFolders: NoteFolder[] }>(
        '/api/notes/GetNotePagesAndFolders'
      );
      return res.data;
    },
  });

  const folders = data?.noteFolders ?? [];

  const createPage = useMutationPost<CreateNotePageRequest, void>({
    url: '/api/notes/CreateNotePage',
    queryKey: [QueryKeys.GetNotePagesAndFolders],
    invalidateQuery: true,
    onSuccess: () => {
      setShowAddPage(false);
    },
    onError: (error) => {
      Alert.alert('Error', error.message || 'Failed to create page');
    },
  });

  const createFolder = useMutationPost<CreateNoteFolderRequest, void>({
    url: '/api/notes/CreateNoteFolder',
    queryKey: [QueryKeys.GetNotePagesAndFolders],
    invalidateQuery: true,
    onSuccess: () => {
      setShowAddFolder(false);
    },
    onError: (error) => {
      Alert.alert('Error', error.message || 'Failed to create folder');
    },
  });

  return (
    <SafeAreaView style={[notesStyles.screenContainer, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View
        style={[
          notesStyles.screenHeader,
          {
            backgroundColor: isDark ? '#1D2026' : '#ffffff',
            borderBottomColor: isDark ? '#2F333B' : '#e5e7eb',
          },
        ]}
      >
        <ThemedText type="title" style={notesStyles.screenHeaderTitle}>
          Notes
        </ThemedText>
        <View style={notesStyles.screenHeaderActions}>
          <TouchableOpacity
            style={[notesStyles.screenHeaderButton, { backgroundColor: isDark ? '#2F333B' : '#f3f4f6' }]}
            onPress={() => setShowAddFolder(true)}
          >
            <IconSymbol name="folder.plus" size={20} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[notesStyles.screenHeaderButton, { backgroundColor: colors.tint }]}
            onPress={() => setShowAddPage(true)}
          >
            <IconSymbol name="doc.plus" size={20} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Notes List */}
      <View style={notesStyles.screenContent}>
        <NotesList
          onAddPage={() => setShowAddPage(true)}
          onAddFolder={() => setShowAddFolder(true)}
        />
      </View>

      {/* Modals */}
      <AddNotePageModal
        visible={showAddPage}
        folders={folders}
        onClose={() => setShowAddPage(false)}
        onSubmit={(title, folderId) => createPage.mutate({ title, folderId })}
      />
      <AddNoteFolderModal
        visible={showAddFolder}
        onClose={() => setShowAddFolder(false)}
        onSubmit={(folderName, folderIcon) =>
          createFolder.mutate({ folderName, folderIcon })
        }
      />
    </SafeAreaView>
  );
}


