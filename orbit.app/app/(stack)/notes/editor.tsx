import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { QueryKeys } from '@/helpers/QueryKeys';
import { authApiClient } from '@/helpers/apiClient';
import { useMutationPut } from '@/helpers/mutations/useMutationPut';
import NoteEditor from '@/components/notes/NoteEditor';
import { notesStyles } from '@/styles/notesStyles';
import type { GetNotePageDetailsResponse } from '@/interfaces/api/notes/GetNotePageDetailsResponse';
import type { UpdateNotePageContentRequest } from '@/interfaces/api/notes/UpdateNotePageContentRequest';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useState, useCallback, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function NotesEditorScreen() {
  const { pageId } = useLocalSearchParams<{ pageId: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const numericPageId = pageId ? parseInt(pageId, 10) : null;

  const [isEditing, setIsEditing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const currentContentRef = useRef<string>('');

  const { data: pageDetails, isLoading } = useQuery({
    queryKey: [QueryKeys.NotePageDetails, pageId ?? 'none'],
    queryFn: async () => {
      if (!numericPageId) return null;
      const res = await authApiClient.get<GetNotePageDetailsResponse>(
        `/api/notes/GetNotePageDetails?notePageId=${numericPageId}`
      );
      return res.data;
    },
    enabled: !!numericPageId,
  });

  const page = pageDetails?.notePage;

  const toggleFavourite = useMutationPut<number, void>({
    url: (id) => `/api/notes/ToggleNotePageFavouriteStatus?notePageId=${id}`,
    queryKey: [QueryKeys.GetNotePagesAndFolders],
    invalidateQuery: true,
  });

  const updateContent = useMutationPut<UpdateNotePageContentRequest, void>({
    url: '/api/notes/UpdateNotePageContent',
    queryKey: [QueryKeys.NotePageDetails, pageId ?? 'none'],
    invalidateQuery: true,
  });

  const handleContentChange = useCallback((html: string) => {
    currentContentRef.current = html;
    setHasUnsavedChanges(true);
  }, []);

  const handleSave = async () => {
    if (!numericPageId) return;
    setIsSaving(true);
    try {
      await updateContent.mutateAsync({
        notePageId: numericPageId,
        content: currentContentRef.current,
      });
      setHasUnsavedChanges(false);
      setIsEditing(false);
      Alert.alert('Saved', 'Your note has been saved.');
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to save note.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Do you want to save before leaving?',
        [
          { text: 'Discard', style: 'destructive', onPress: () => { setIsEditing(false); router.back(); } },
          {
            text: 'Save',
            onPress: async () => {
              await handleSave();
              router.back();
            },
          },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    } else {
      setIsEditing(false);
      router.back();
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[notesStyles.editorScreenContainer, { backgroundColor: colors.background }]}>
        <View style={notesStyles.editorScreenCentered}>
          <ActivityIndicator size="large" color={colors.tint} />
        </View>
      </SafeAreaView>
    );
  }

  if (!page) {
    return (
      <SafeAreaView style={[notesStyles.editorScreenContainer, { backgroundColor: colors.background }]}>
        <View style={notesStyles.editorScreenCentered}>
          <ThemedText style={{ opacity: 0.7 }}>Page not found</ThemedText>
          <TouchableOpacity style={notesStyles.editorScreenBackButton} onPress={() => router.back()}>
            <ThemedText style={{ color: colors.tint }}>Go Back</ThemedText>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[notesStyles.editorScreenContainer, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View
        style={[
          notesStyles.editorScreenHeader,
          {
            backgroundColor: isDark ? '#1D2026' : '#ffffff',
            borderBottomColor: isDark ? '#2F333B' : '#e5e7eb',
          },
        ]}
      >
        {/* Top row: back + title + actions */}
        <View style={notesStyles.editorScreenHeaderRow}>
          <TouchableOpacity onPress={handleBack} style={notesStyles.editorScreenHeaderButton} hitSlop={8}>
            <IconSymbol name="chevron.right" size={22} color={colors.text} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>

          <View style={notesStyles.editorScreenHeaderTitle}>
            <ThemedText type="defaultSemiBold" numberOfLines={1} style={notesStyles.editorScreenPageTitle}>
              {page.title}
            </ThemedText>
          </View>

          <View style={notesStyles.editorScreenHeaderActions}>
            <TouchableOpacity
              onPress={() => toggleFavourite.mutate(page.id)}
              style={notesStyles.editorScreenHeaderButton}
              hitSlop={8}
            >
              <IconSymbol
                name={page.isFavourite ? 'star.fill' : 'star'}
                size={20}
                color={page.isFavourite ? '#f59f0b' : colors.icon}
              />
            </TouchableOpacity>

            {!isEditing ? (
              <TouchableOpacity
                onPress={handleEdit}
                style={[notesStyles.editorScreenSaveButton, { backgroundColor: '#0a7ea4' }]}
              >
                <ThemedText style={notesStyles.editorScreenSaveButtonText}>Edit</ThemedText>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleSave}
                style={[
                  notesStyles.editorScreenSaveButton,
                  { backgroundColor: '#0a7ea4' },
                  (!hasUnsavedChanges || isSaving) && { opacity: 0.4 },
                ]}
                disabled={!hasUnsavedChanges || isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <ThemedText style={notesStyles.editorScreenSaveButtonText}>Save</ThemedText>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Meta row */}
        <View style={notesStyles.editorScreenMetaRow}>
          <ThemedText style={notesStyles.editorScreenMetaText}>
            Last edited{' '}
            {new Date(page.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </ThemedText>
          {hasUnsavedChanges && (
            <ThemedText style={[notesStyles.editorScreenMetaText, { color: '#f59f0b' }]}>
              • Unsaved changes
            </ThemedText>
          )}
        </View>
      </View>

      {/* Editor */}
      <View style={{ flex: 1 }}>
        <NoteEditor
          content={page.content}
          isEditing={isEditing}
          onContentChange={handleContentChange}
          onReady={() => {}}
        />
      </View>
    </SafeAreaView>
  );
}


