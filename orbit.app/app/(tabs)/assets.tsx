import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { authApiClient } from '@/helpers/apiClient';
import { GetAllAssetCategoriesDto } from '@/interfaces/api/assets/GetAllAssetCategoriesDto';
import { GetAllAssetsDto } from '@/interfaces/api/assets/GetAllAssetsDto';
import { assetsStyles as styles } from '@/styles/assetsStyles';
import { createCommonStyles } from '@/styles/commonStyles';
import { useQuery } from '@tanstack/react-query';
import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import moment from 'moment';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AssetsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const commonStyles = createCommonStyles(colorScheme ?? 'light');
  const isDark = colorScheme === 'dark';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [downloadingAssetId, setDownloadingAssetId] = useState<number | null>(null);
  const [downloadingType, setDownloadingType] = useState<'Receipt' | 'Manual' | null>(null);

  // Download asset document function
  const downloadAssetDocument = async (assetId: number, assetName: string, documentType: 'Receipt' | 'Manual') => {
    try {
      setDownloadingAssetId(assetId);
      setDownloadingType(documentType);
      
      // Create the Downloads directory if it doesn't exist
      const downloadsDir = new Directory(Paths.document, 'Downloads');
      if (!downloadsDir.exists) {
        downloadsDir.create();
      }
      
      // Generate filename
      const filename = `${assetName}_${documentType}`;
      const file = new File(downloadsDir, filename);
      
      // Download the file using authApiClient with arraybuffer response type
      const response = await authApiClient.get<ArrayBuffer>(
        `/api/Assets/DownloadAssetDocument?assetId=${assetId}&documentType=${documentType}`,
        {
          responseType: 'arraybuffer'
        }
      );

      // Write the array buffer to file
      file.write(new Uint8Array(response.data));

      setDownloadingAssetId(null);
      setDownloadingType(null);

      // Show success alert with option to open
      Alert.alert(
        'Download Complete',
        `${documentType} for ${assetName} has been downloaded successfully.`,
        [
          { text: 'Close', style: 'cancel' },
          {
            text: 'Open',
            onPress: async () => {
              try {
                await Sharing.shareAsync(file.uri, {
                  mimeType: 'application/pdf',
                });
              } catch (error) {
                console.error('Open file error:', error);
                Alert.alert('Error', 'Could not open the file.');
              }
            },
          },
        ]
      );
    } catch (error) {
      setDownloadingAssetId(null);
      setDownloadingType(null);
      console.error('Download error:', error);
      Alert.alert('Error', `An error occurred while downloading the ${documentType.toLowerCase()}.`);
    }
  };

  // Fetch assets
  const { data: assetsData, isLoading: isLoadingAssets } = useQuery({
    queryKey: ['assets'],
    queryFn: async () => {
      const response = await authApiClient.get<GetAllAssetsDto>('/api/Assets/GetAllAssets');
      return response.data;
    },
  });

  // Fetch categories
  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['asset-categories'],
    queryFn: async () => {
      const response = await authApiClient.get<GetAllAssetCategoriesDto>('/api/Assets/GetAllAssetCategories');
      return response.data;
    },
  });

  const isLoading = isLoadingAssets || isLoadingCategories;

  // Calculate stats
  const stats = useMemo(() => {
    const assets = assetsData?.assets || [];
    const totalAssets = assets.length;
    const totalCategories = categoriesData?.categories.length || 0;
    const activeAssets = assets.filter(a => a.status === 'Active').length;
    const totalValue = assets.reduce((sum, asset) => sum + (asset.purchasePrice || 0), 0);

    return { totalAssets, totalCategories, activeAssets, totalValue };
  }, [assetsData, categoriesData]);

  // Filter assets
  const filteredAssets = useMemo(() => {
    let filtered = assetsData?.assets || [];

    if (selectedCategory !== null) {
      filtered = filtered.filter(asset => asset.categoryId === selectedCategory);
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(asset =>
        asset.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered.sort((a, b) => 
      moment(b.purchaseDate).diff(moment(a.purchaseDate))
    );
  }, [assetsData, searchQuery, selectedCategory]);

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return '#10B981';
      case 'Disposed': return '#6B7280';
      case 'In Repair': return '#F59E0B';
      case 'Lost': return '#EF4444';
      case 'Sold': return '#3B82F6';
      default: return '#6B7280';
    }
  };

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
            <ThemedText type="title">Assets</ThemedText>
            <ThemedText style={commonStyles.subtitle}>Manage your valuable items</ThemedText>
          </View>

          {/* Stats Grid - 4 columns (2x2) */}
          <View style={styles.statsGrid}>
            <View style={[commonStyles.statCard, { flex: 1, borderLeftColor: '#3B82F6' }]}>
              <ThemedText style={commonStyles.statLabel}>Total Assets</ThemedText>
              <ThemedText type="title" style={commonStyles.statValue}>
                {stats.totalAssets}
              </ThemedText>
            </View>

            <View style={[commonStyles.statCard, { flex: 1, borderLeftColor: '#10B981' }]}>
              <ThemedText style={commonStyles.statLabel}>Active</ThemedText>
              <ThemedText type="title" style={commonStyles.statValue}>
                {stats.activeAssets}
              </ThemedText>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={[commonStyles.statCard, { flex: 1, borderLeftColor: '#8B5CF6' }]}>
              <ThemedText style={commonStyles.statLabel}>Categories</ThemedText>
              <ThemedText type="title" style={commonStyles.statValue}>
                {stats.totalCategories}
              </ThemedText>
            </View>

            <View style={[commonStyles.statCard, { flex: 1, borderLeftColor: '#F59E0B' }]}>
              <ThemedText style={commonStyles.statLabel}>Total Value</ThemedText>
              <ThemedText type="title" style={commonStyles.statValue}>
                £{stats.totalValue.toLocaleString()}
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
              placeholder="Search assets..."
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
                  key={category.categoryId}
                  style={[
                    styles.filterTab,
                    selectedCategory === category.categoryId && { backgroundColor: colors.tint }
                  ]}
                  onPress={() => setSelectedCategory(category.categoryId)}
                >
                  <ThemedText style={[
                    styles.filterTabText,
                    { color: selectedCategory === category.categoryId ? '#000000' : colors.text }
                  ]}>
                    {category.categoryName}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <ThemedText style={[styles.assetCount, { color: colors.tint }]}>
              {filteredAssets.length} ASSETS
            </ThemedText>
          </View>

          {/* Assets List */}
          {filteredAssets.length === 0 ? (
              <View style={[
                styles.emptyState,
                {
                  backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                }
              ]}>
                <ThemedText style={styles.emptyStateText}>
                  No assets found
                </ThemedText>
              </View>
            ) : (
              <View style={styles.assetsList}>
                {filteredAssets.map((asset) => (
                  <View
                    key={asset.assetId}
                    style={[
                      commonStyles.listItem,
                      styles.assetItem,
                      {
                        backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
                        borderColor: isDark ? '#334155' : '#E2E8F0',
                      }
                    ]}
                  >
                    {/* Asset Header */}
                    <View style={styles.assetHeader}>
                      <View style={styles.assetMainInfo}>
                        <ThemedText style={styles.assetName} numberOfLines={1}>
                          {asset.assetName}
                        </ThemedText>
                        <View style={styles.assetMetaRow}>
                          {asset.brand && (
                            <ThemedText style={styles.assetMeta}>
                              {asset.brand}
                            </ThemedText>
                          )}
                          {asset.model && (
                            <ThemedText style={styles.assetMeta}>
                              • {asset.model}
                            </ThemedText>
                          )}
                        </View>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(asset.status) }]}>
                        <ThemedText style={styles.statusText}>
                          {asset.status}
                        </ThemedText>
                      </View>
                    </View>

                    {/* Asset Details */}
                    <View style={styles.assetDetails}>
                      {asset.purchasePrice !== null && (
                        <View style={styles.detailRow}>
                          <IconSymbol name="dollarsign.circle" size={16} color={colors.icon} />
                          <ThemedText style={styles.detailText}>
                            ${asset.purchasePrice.toLocaleString()}
                          </ThemedText>
                        </View>
                      )}
                      <View style={styles.detailRow}>
                        <IconSymbol name="calendar" size={16} color={colors.icon} />
                        <ThemedText style={styles.detailText}>
                          {moment(asset.purchaseDate).format('MMM D, YYYY')}
                        </ThemedText>
                      </View>
                      {asset.location && (
                        <View style={styles.detailRow}>
                          <IconSymbol name="mappin" size={16} color={colors.icon} />
                          <ThemedText style={styles.detailText} numberOfLines={1}>
                            {asset.location}
                          </ThemedText>
                        </View>
                      )}
                    </View>

                    {/* Document Downloads */}
                    {(asset.hasReceipt || asset.hasManual) && (
                      <View style={styles.documentsSection}>
                        <View style={[styles.documentsDivider, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]} />
                        <View style={styles.documentsRow}>
                          {asset.hasReceipt && (
                            <TouchableOpacity
                              style={[
                                styles.documentButton,
                                {
                                  backgroundColor: isDark ? '#0F172A' : '#F1F5F9',
                                  borderColor: isDark ? '#334155' : '#CBD5E1',
                                }
                              ]}
                              onPress={() => downloadAssetDocument(asset.assetId, asset.assetName, 'Receipt')}
                              disabled={downloadingAssetId === asset.assetId && downloadingType === 'Receipt'}
                            >
                              {downloadingAssetId === asset.assetId && downloadingType === 'Receipt' ? (
                                <ActivityIndicator size="small" color={colors.tint} />
                              ) : (
                                <IconSymbol name="doc.text" size={18} color="#3B82F6" />
                              )}
                              <ThemedText style={styles.documentButtonText}>
                                Receipt
                              </ThemedText>
                            </TouchableOpacity>
                          )}
                          {asset.hasManual && (
                            <TouchableOpacity
                              style={[
                                styles.documentButton,
                                {
                                  backgroundColor: isDark ? '#0F172A' : '#F1F5F9',
                                  borderColor: isDark ? '#334155' : '#CBD5E1',
                                }
                              ]}
                              onPress={() => downloadAssetDocument(asset.assetId, asset.assetName, 'Manual')}
                              disabled={downloadingAssetId === asset.assetId && downloadingType === 'Manual'}
                            >
                              {downloadingAssetId === asset.assetId && downloadingType === 'Manual' ? (
                                <ActivityIndicator size="small" color={colors.tint} />
                              ) : (
                                <IconSymbol name="book" size={18} color="#8B5CF6" />
                              )}
                              <ThemedText style={styles.documentButtonText}>
                                Manual
                              </ThemedText>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    )}

                    {/* Notes */}
                    {asset.notes && (
                      <View style={styles.notesSection}>
                        <View style={[styles.documentsDivider, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]} />
                        <ThemedText style={styles.notesLabel}>Notes:</ThemedText>
                        <ThemedText style={styles.notesText} numberOfLines={3}>
                          {asset.notes}
                        </ThemedText>
                      </View>
                    )}
                  </View>
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
              {categoriesData?.categories.map((category) => (
                <TouchableOpacity
                  key={category.categoryId}
                  style={[
                    styles.categoryItem,
                    {
                      backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
                      borderColor: isDark ? '#334155' : '#E2E8F0',
                    }
                  ]}
                  onPress={() => setSelectedCategory(category.categoryId)}
                >
                  <View style={{ flex: 1 }}>
                    <ThemedText style={[styles.categoryName, { color: colors.text }]}>
                      {category.categoryName}
                    </ThemedText>
                    {category.description && (
                      <ThemedText style={styles.categoryDescription} numberOfLines={1}>
                        {category.description}
                      </ThemedText>
                    )}
                  </View>
                  <View style={[styles.categoryBadge, { backgroundColor: colors.tint }]}>
                    <ThemedText style={[styles.categoryCount, { color: isDark ? '#000' : '#FFFFFF' }]}>
                      {category.assetCount}
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Spacing */}
          <View style={{ height: 20 }} />
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}
