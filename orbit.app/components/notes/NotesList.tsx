import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { QueryKeys } from '@/helpers/QueryKeys';
import { authApiClient } from '@/helpers/apiClient';
import { useMutationDelete } from '@/helpers/mutations/useMutationDelete';
import { useMutationPut } from '@/helpers/mutations/useMutationPut';
import type { NoteFolder, NotePage } from '@/interfaces/api/notes/GetNotePagesAndFoldersResponse';
import { createCommonStyles } from '@/styles/commonStyles';
import { notesStyles } from '@/styles/notesStyles';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

interface NotesListProps {
  onAddPage: () => void;
  onAddFolder: () => void;
}

export function NotesList({ onAddPage, onAddFolder }: NotesListProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const commonStyles = createCommonStyles(colorScheme ?? 'light');
  const isDark = colorScheme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());

  const { data, isLoading } = useQuery({
    queryKey: [QueryKeys.GetNotePagesAndFolders],
    queryFn: async () => {
      const res = await authApiClient.get<{
        notePages: NotePage[];
        noteFolders: NoteFolder[];
      }>('/api/notes/GetNotePagesAndFolders');
      return res.data;
    },
  });

  const toggleFavourite = useMutationPut<number, void>({
    url: (pageId) => `/api/notes/ToggleNotePageFavouriteStatus?notePageId=${pageId}`,
    queryKey: [QueryKeys.GetNotePagesAndFolders],
    invalidateQuery: true,
  });

  const deletePage = useMutationDelete<number, void>({
    url: (pageId) => `/api/notes/DeleteNotePage?notePageId=${pageId}`,
    queryKey: [QueryKeys.GetNotePagesAndFolders],
    invalidateQuery: true,
  });

  const deleteFolder = useMutationDelete<number, void>({
    url: (folderId) => `/api/notes/DeleteNoteFolder?noteFolderId=${folderId}`,
    queryKey: [QueryKeys.GetNotePagesAndFolders],
    invalidateQuery: true,
  });

  const folders = useMemo(() => data?.noteFolders ?? [], [data?.noteFolders]);
  const pages = useMemo(() => data?.notePages ?? [], [data?.notePages]);

  const filteredPages = useMemo(() => {
    if (!searchQuery.trim()) return pages;
    const q = searchQuery.toLowerCase();
    return pages.filter((p) => p.title.toLowerCase().includes(q));
  }, [pages, searchQuery]);

  const favouritePages = filteredPages.filter((p) => p.isFavourite);
  const unfiledPages = filteredPages.filter((p) => p.folderId === null);

  const getFolderPages = (folderId: number) =>
    filteredPages.filter((p) => p.folderId === folderId);

  const toggleFolder = (folderId: number) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };

  const handleDeletePage = (pageId: number, title: string) => {
    Alert.alert('Delete Page', `Are you sure you want to delete "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deletePage.mutate(pageId),
      },
    ]);
  };

  const handleDeleteFolder = (folderId: number, name: string) => {
    Alert.alert('Delete Folder', `Are you sure you want to delete "${name}" and all its pages?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteFolder.mutate(folderId),
      },
    ]);
  };

  const navigateToEditor = (pageId: number) => {
    router.push({ pathname: '/(stack)/notes/editor', params: { pageId: pageId.toString() } } as any);
  };

  const renderPageItem = (page: NotePage, showFolder: boolean = false) => {
    const folder = folders.find((f) => f.id === page.folderId);
    return (
      <TouchableOpacity
        key={page.id}
        style={[
          notesStyles.listPageItem,
          { backgroundColor: isDark ? '#23272E' : '#f3f4f6' },
        ]}
        onPress={() => navigateToEditor(page.id)}
        onLongPress={() => handleDeletePage(page.id, page.title)}
      >
        <View style={notesStyles.listPageItemContent}>
          <IconSymbol
            name={page.isFavourite ? 'star.fill' : 'star'}
            size={16}
            color={page.isFavourite ? '#f59f0b' : colors.icon}
          />
          <View style={notesStyles.listPageItemText}>
            <ThemedText numberOfLines={1} style={notesStyles.listPageTitle}>
              {page.title}
            </ThemedText>
            {showFolder && folder && (
              <ThemedText style={notesStyles.listPageSubtitle}>
                {folder.folderIcon} {folder.folderName}
              </ThemedText>
            )}
          </View>
        </View>
        <TouchableOpacity
          onPress={() => toggleFavourite.mutate(page.id)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <IconSymbol
            name={page.isFavourite ? 'star.fill' : 'star'}
            size={18}
            color={page.isFavourite ? '#f59f0b' : colors.icon}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderFolderItem = (folder: NoteFolder) => {
    const folderPages = getFolderPages(folder.id);
    const isExpanded = expandedFolders.has(folder.id);

    return (
      <View key={folder.id}>
        <TouchableOpacity
          style={[
            notesStyles.listFolderItem,
            { backgroundColor: isDark ? '#2F333B' : '#e5e7eb' },
          ]}
          onPress={() => toggleFolder(folder.id)}
          onLongPress={() => handleDeleteFolder(folder.id, folder.folderName)}
        >
          <View style={notesStyles.listFolderItemContent}>
            <IconSymbol
              name={isExpanded ? 'folder.open' : 'folder.fill'}
              size={20}
              color={isDark ? '#fbbf24' : '#d97706'}
            />
            <ThemedText style={notesStyles.listFolderName}>
              {folder.folderIcon} {folder.folderName}
            </ThemedText>
            <ThemedText style={notesStyles.listFolderCount}>({folderPages.length})</ThemedText>
          </View>
          <IconSymbol
            name="chevron.right"
            size={18}
            color={colors.icon}
            style={isExpanded ? { transform: [{ rotate: '90deg' }] } : undefined}
          />
        </TouchableOpacity>
        {isExpanded && folderPages.map((p) => renderPageItem(p))}
      </View>
    );
  };

  if (isLoading) {
    return (
      <ThemedView style={[commonStyles.card, notesStyles.listCentered]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={notesStyles.listContainer}>
      {/* Search */}
      <View style={[notesStyles.listSearchContainer, { backgroundColor: isDark ? '#23272E' : '#f3f4f6' }]}>
        <IconSymbol name="magnifyingglass" size={18} color={colors.icon} />
        <TextInput
          style={[notesStyles.listSearchInput, { color: colors.text }]}
          placeholder="Search notes..."
          placeholderTextColor={colors.icon}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        style={notesStyles.listScroll}
      >
        {/* Favourites */}
        {favouritePages.length > 0 && (
          <View style={commonStyles.sectionContainer}>
            <ThemedText type="defaultSemiBold" style={commonStyles.sectionTitle}>
              ⭐ Favourites
            </ThemedText>
            {favouritePages.map((p) => renderPageItem(p, true))}
          </View>
        )}

        {/* Folders */}
        {folders.length > 0 && (
          <View style={commonStyles.sectionContainer}>
            <ThemedText type="defaultSemiBold" style={commonStyles.sectionTitle}>
              📁 Folders
            </ThemedText>
            {folders.map(renderFolderItem)}
          </View>
        )}

        {/* Unfiled Pages */}
        {unfiledPages.length > 0 && (
          <View style={commonStyles.sectionContainer}>
            <ThemedText type="defaultSemiBold" style={commonStyles.sectionTitle}>
              📄 Pages
            </ThemedText>
            {unfiledPages.map((p) => renderPageItem(p))}
          </View>
        )}

        {/* Empty State */}
        {pages.length === 0 && (
          <ThemedView style={[commonStyles.card, notesStyles.listCentered, { paddingVertical: 40 }]}>
            <IconSymbol name="note.text" size={48} color={colors.icon} />
            <ThemedText style={{ marginTop: 12, opacity: 0.7 }}>
              No notes yet. Create your first note!
            </ThemedText>
          </ThemedView>
        )}
      </ScrollView>
    </ThemedView>
  );
}