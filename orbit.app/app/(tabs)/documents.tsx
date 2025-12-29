import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { authApiClient } from '@/helpers/apiClient';
import { keychainHelper } from '@/helpers/keychainHelper';
import { GetAllDocumentCategoriesDto } from '@/interfaces/api/documents/GetAllDocumentCategoriesDto';
import { GetAllDocumentsDto } from '@/interfaces/api/documents/GetAllDocumentsDto';
import { createCommonStyles } from '@/styles/commonStyles';
import { useQuery } from '@tanstack/react-query';
import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import moment from 'moment';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DocumentsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const commonStyles = createCommonStyles(colorScheme ?? 'light');
  const isDark = colorScheme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [downloadingDocId, setDownloadingDocId] = useState<number | null>(null);

  // Download document function
  const downloadDocument = async (documentId: number, documentName: string, mimeType: string) => {
    try {
      setDownloadingDocId(documentId);
      
      // Create the Downloads directory if it doesn't exist
      const downloadsDir = new Directory(Paths.document, 'Downloads');
      if (!downloadsDir.exists) {
        downloadsDir.create();
      }
      
      // Create the file in the downloads directory
      const file = new File(downloadsDir, documentName);
      
      // Get access token for authentication
      const accessToken = await keychainHelper.getAccessToken();
      
      // Download the file using fetch with authentication
      const response = await fetch(
        `${authApiClient.defaults.baseURL}/api/Documents/DownloadDocument?documentId=${documentId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Download failed with status ${response.status}`);
      }

      // Convert response to arrayBuffer and write to file
      const arrayBuffer = await response.arrayBuffer();
      await file.write(new Uint8Array(arrayBuffer));

      setDownloadingDocId(null);

      // Show success alert with option to open
      Alert.alert(
        'Download Complete',
        `${documentName} has been downloaded successfully.`,
        [
          { text: 'Close', style: 'cancel' },
          {
            text: 'Open',
            onPress: async () => {
              try {
                // Use Sharing API for both platforms - it's more reliable
                await Sharing.shareAsync(file.uri, {
                  mimeType: mimeType,
                  UTI: mimeType,
                });
              } catch (error) {
                console.error('Open file error:', error);
                Alert.alert('Error', 'Could not open the file. Please check if you have an appropriate app installed.');
              }
            },
          },
        ]
      );
    } catch (error) {
      setDownloadingDocId(null);
      console.error('Download error:', error);
      Alert.alert('Error', 'An error occurred while downloading the document.');
    }
  };

  // Fetch documents
  const { data: documentsData, isLoading: isLoadingDocuments } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const response = await authApiClient.get<GetAllDocumentsDto>('/api/Documents/GetAllDocuments');
      return response.data;
    },
  });

  // Fetch categories
  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['document-categories'],
    queryFn: async () => {
      const response = await authApiClient.get<GetAllDocumentCategoriesDto>('/api/Documents/GetAllDocumentCategories');
      return response.data;
    },
  });

  const isLoading = isLoadingDocuments || isLoadingCategories;

  // Calculate stats
  const stats = useMemo(() => {
    const totalDocuments = documentsData?.documents.length || 0;
    const totalCategories = categoriesData?.categories.length || 0;

    return { totalDocuments, totalCategories };
  }, [documentsData, categoriesData]);

  // Filter documents
  const filteredDocuments = useMemo(() => {
    let filtered = documentsData?.documents || [];

    if (selectedCategory !== null) {
      filtered = filtered.filter(doc => doc.categoryId === selectedCategory);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(doc =>
        doc.documentName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort((a, b) => 
      moment(b.uploadedAt).diff(moment(a.uploadedAt))
    );
  }, [documentsData, searchQuery, selectedCategory]);



  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.tint} />
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ThemedView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          {/* Header */}
          <View style={commonStyles.header}>
            <ThemedText type="title">Documents</ThemedText>
            <ThemedText style={commonStyles.subtitle}>Your personal document vault</ThemedText>
          </View>

          {/* Stats Grid - 2 columns */}
          <View style={styles.statsContainer}>
            <View style={[commonStyles.statCard, { borderLeftColor: '#3B82F6' }]}>
              <ThemedText style={commonStyles.statLabel}>Total Documents</ThemedText>
              <ThemedText type="title" style={commonStyles.statValue}>
                {stats.totalDocuments}
              </ThemedText>
            </View>

            <View style={[commonStyles.statCard, { borderLeftColor: '#8B5CF6' }]}>
              <ThemedText style={commonStyles.statLabel}>Categories</ThemedText>
              <ThemedText type="title" style={commonStyles.statValue}>
                {stats.totalCategories}
              </ThemedText>
            </View>
          </View>

          {/* Search Bar */}
          <View style={[
            styles.searchContainer,
            {
              backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
              borderColor: isDark ? '#334155' : '#E2E8F0',
            }
          ]}>
            <IconSymbol name="magnifyingglass" size={18} color={colors.icon} />
            <TextInput
              style={[
                styles.searchInput,
                { color: isDark ? '#E2E8F0' : '#1E293B' }
              ]}
              placeholder="Search documents..."
              placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Filter Tabs */}
          <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[
                  styles.filterTab,
                  selectedCategory === null && { backgroundColor: colors.tint }
                ]}
                onPress={() => setSelectedCategory(null)}
              >
                <ThemedText style={[
                  styles.filterTabText,
                  { color: selectedCategory === null ? '#000000' : colors.text }
                ]}>
                  All
                </ThemedText>
              </TouchableOpacity>
              {categoriesData?.categories.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.filterTab,
                    selectedCategory === category.id && { backgroundColor: colors.tint }
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <ThemedText style={[
                    styles.filterTabText,
                    { color: selectedCategory === category.id ? '#000000' : colors.text }
                  ]}>
                    {category.categoryName}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <ThemedText style={[styles.documentCount, { color: colors.tint }]}>
              {filteredDocuments.length} DOCUMENTS
            </ThemedText>
          </View>

          {/* Documents List */}
          {filteredDocuments.length === 0 ? (
              <View style={[
                styles.emptyState,
                {
                  backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                }
              ]}>
                <ThemedText style={styles.emptyStateText}>
                  No documents found
                </ThemedText>
              </View>
            ) : (
              <View style={styles.documentsList}>
                {filteredDocuments.map((doc) => (
                  <TouchableOpacity
                    key={doc.documentId}
                    style={[commonStyles.listItem, styles.documentItem]}
                    onPress={() => downloadDocument(doc.documentId, doc.documentName, doc.documentType)}
                    disabled={downloadingDocId === doc.documentId}
                  >
                    <View style={styles.documentIcon}>
                      <IconSymbol name="doc.fill" size={20} color="#EF4444" />
                    </View>
                    <View style={styles.documentInfo}>
                      <ThemedText style={styles.documentName} numberOfLines={1}>
                        {doc.documentName}
                      </ThemedText>
                      <ThemedText style={styles.documentDate}>
                        {doc.documentType.split('/')[1]?.toUpperCase() || 'FILE'} • {moment(doc.uploadedAt).format('D MMM YYYY')}
                      </ThemedText>
                    </View>
                    {downloadingDocId === doc.documentId ? (
                      <ActivityIndicator size="small" color={colors.tint} />
                    ) : (
                      <IconSymbol name="arrow.down.circle" size={24} color={colors.tint} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )
          }

          {/* Categories */}
          <View style={[commonStyles.sectionContainer, { marginTop: 24 }]}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <IconSymbol name="folder" size={20} color={colors.tint} />
                <ThemedText style={commonStyles.sectionTitle}>Categories</ThemedText>
              </View>
            </View>

            <View style={styles.categoriesList}>
              {categoriesData?.categories.map((category) => {
                const count = documentsData?.documents.filter(
                  doc => doc.categoryId === category.id
                ).length || 0;
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryItem,
                      {
                        backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                        borderColor: isDark ? '#334155' : '#E2E8F0',
                      }
                    ]}
                    onPress={() => setSelectedCategory(category.id)}
                  >
                    <ThemedText style={[styles.categoryName, { color: colors.text }]}>
                      {category.categoryName}
                    </ThemedText>
                    <View style={[styles.categoryBadge, { backgroundColor: colors.tint }]}>
                      <ThemedText style={[styles.categoryCount, { color: isDark ? '#000' : '#FFFFFF' }]}>
                        {count}
                      </ThemedText>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Spacing */}
          <View style={{ height: 20 }} />
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  documentCount: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 12,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  documentsList: {
    gap: 6,
  },
  documentItem: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentIcon: {
    marginRight: 8,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  documentDate: {
    fontSize: 11,
    opacity: 0.6,
  },
  downloadButton: {
    padding: 8,
    marginLeft: 8,
  },

  emptyState: {
    padding: 32,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    opacity: 0.6,
  },
  recentList: {
    gap: 8,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  recentInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentName: {
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  recentDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  categoriesList: {
    gap: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
