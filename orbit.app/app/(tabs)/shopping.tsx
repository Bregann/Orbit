import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ManageQuickAddItemsModal } from '@/components/shopping/ManageQuickAddItemsModal';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { authApiClient } from '@/helpers/apiClient';
import { useMutationDelete } from '@/helpers/mutations/useMutationDelete';
import { useMutationPost } from '@/helpers/mutations/useMutationPost';
import { QueryKeys } from '@/helpers/QueryKeys';
import { GetShoppingListItemsResponse } from '@/interfaces/api/shopping/GetShoppingListItemsResponse';
import { GetShoppingListQuickAddItemsResponse } from '@/interfaces/api/shopping/GetShoppingListQuickAddItemsResponse';
import { createCommonStyles } from '@/styles/commonStyles';
import { shoppingStyles as styles } from '@/styles/shoppingStyles';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ShoppingScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const commonStyles = createCommonStyles(colorScheme ?? 'light');
  const isDark = colorScheme === 'dark';

  const [quickAddText, setQuickAddText] = useState('');
  const [manageQuickAddVisible, setManageQuickAddVisible] = useState(false);

  // Fetch shopping list items
  const { data: shoppingData, isLoading: isLoadingItems } = useQuery({
    queryKey: [QueryKeys.ShoppingListItems],
    queryFn: async () => {
      const response = await authApiClient.get<GetShoppingListItemsResponse>('/api/Shopping/GetShoppingListItems');
      return response.data;
    },
  });

  // Fetch quick add items
  const { data: quickAddData, isLoading: isLoadingQuickAdd } = useQuery({
    queryKey: [QueryKeys.ShoppingListQuickAdd],
    queryFn: async () => {
      const response = await authApiClient.get<GetShoppingListQuickAddItemsResponse>('/api/Shopping/GetShoppingListQuickAddItems');
      return response.data;
    },
  });

  // Add item mutation
  const addItemMutation = useMutationPost<string, void>({
    url: (name: string) => `/api/Shopping/AddShoppingListItem?name=${encodeURIComponent(name)}`,
    queryKey: [QueryKeys.ShoppingListItems],
    invalidateQuery: true,
    onSuccess: () => {
      setQuickAddText('');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to add item');
    },
  });

  // Remove item mutation
  const removeItemMutation = useMutationDelete<number, void>({
    url: (itemId: number) => `/api/Shopping/RemoveShoppingListItem?itemId=${itemId}`,
    queryKey: [QueryKeys.ShoppingListItems],
    invalidateQuery: true,
    onError: () => {
      Alert.alert('Error', 'Failed to remove item');
    },
  });

  const handleAddItem = () => {
    const trimmedText = quickAddText.trim();
    if (trimmedText) {
      addItemMutation.mutate(trimmedText);
    }
  };

  const handleQuickAddItem = (name: string) => {
    addItemMutation.mutate(name);
  };

  const tickItem = (itemId: number) => {
    removeItemMutation.mutate(itemId);
  };

  const items = shoppingData?.items || [];

  if (isLoadingItems || isLoadingQuickAdd) {
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
            <ThemedText type="title">Shopping List</ThemedText>
            <ThemedText style={commonStyles.subtitle}>Keep track of your shopping items</ThemedText>
          </View>

          {/* Quick Add Input */}
          <View style={[
            styles.quickAddContainer,
            {
              backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
              borderColor: isDark ? '#334155' : '#E2E8F0',
            }
          ]}>
            <View style={styles.quickAddInputWrapper}>
              <IconSymbol name="plus" size={18} color={colors.icon} />
              <TextInput
                style={[
                  styles.quickAddInput,
                  { color: isDark ? '#E2E8F0' : '#1E293B' }
                ]}
                placeholder="Quick add item..."
                placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                value={quickAddText}
                onChangeText={setQuickAddText}
              />
            </View>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: colors.tint }]}
              onPress={handleAddItem}
              disabled={addItemMutation.isPending || !quickAddText.trim()}
            >
              <ThemedText style={styles.addButtonText}>
                {addItemMutation.isPending ? 'Adding...' : 'Add'}
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Quick Add Common Items */}
          <View style={[
            styles.section,
            {
              backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
              borderColor: isDark ? '#334155' : '#E2E8F0',
            }
          ]}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <IconSymbol name="basket" size={20} color={colors.tint} />
                <ThemedText style={styles.sectionTitle}>Quick Add Common Items</ThemedText>
              </View>
              <TouchableOpacity onPress={() => setManageQuickAddVisible(true)}>
                <IconSymbol name="pencil" size={18} color={colors.icon} />
              </TouchableOpacity>
            </View>
            <View style={styles.divider} />
            <View style={styles.quickAddItems}>
              {quickAddData?.items.length === 0 && (
                <ThemedText style={styles.emptyStateText}>
                  No common items yet. Tap the pencil to add some.
                </ThemedText>
              )}
              {quickAddData?.items.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.quickAddItem,
                    {
                      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                      borderColor: colors.tint,
                    }
                  ]}
                  onPress={() => handleQuickAddItem(item.name)}
                  disabled={addItemMutation.isPending}
                >
                  <IconSymbol name="plus.circle" size={16} color={colors.tint} />
                  <ThemedText style={styles.quickAddItemText}>
                    {item.name}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Shopping List */}
          <View style={[
            styles.section,
            {
              backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
              borderColor: isDark ? '#334155' : '#E2E8F0',
            }
          ]}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <IconSymbol name="cart" size={20} color={colors.tint} />
                <ThemedText style={styles.sectionTitle}>Shopping List</ThemedText>
              </View>
              <ThemedText style={[styles.itemCount, { color: colors.tint }]}>
                {items.length} ITEMS
              </ThemedText>
            </View>
            <View style={styles.divider} />

            {items.length === 0 ? (
              <View style={styles.emptyState}>
                <ThemedText style={styles.emptyStateText}>
                  No items in your shopping list
                </ThemedText>
              </View>
            ) : (
              <View style={styles.itemsList}>
                {items.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.listItem,
                      {
                        backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                        borderColor: isDark ? '#334155' : '#E2E8F0',
                      }
                    ]}
                    onPress={() => tickItem(item.id)}
                    disabled={removeItemMutation.isPending}
                  >
                    <View style={styles.itemCheckbox}>
                      <View style={[
                        styles.checkbox,
                        { borderColor: isDark ? '#475569' : '#CBD5E1' }
                      ]} />
                    </View>
                    <ThemedText style={styles.itemName}>
                      {item.name}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Spacing */}
          <View style={{ height: 20 }} />
        </ScrollView>

        <ManageQuickAddItemsModal
          visible={manageQuickAddVisible}
          onClose={() => setManageQuickAddVisible(false)}
          items={quickAddData?.items ?? []}
        />
      </ThemedView>
    </SafeAreaView>
  );
}
