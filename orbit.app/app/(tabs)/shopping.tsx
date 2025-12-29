import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { authApiClient } from '@/helpers/apiClient';
import { GetShoppingListItemsResponse } from '@/interfaces/api/shopping/GetShoppingListItemsResponse';
import { GetShoppingListQuickAddItemsResponse } from '@/interfaces/api/shopping/GetShoppingListQuickAddItemsResponse';
import { createCommonStyles } from '@/styles/commonStyles';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ShoppingScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const commonStyles = createCommonStyles(colorScheme ?? 'light');
  const isDark = colorScheme === 'dark';
  const queryClient = useQueryClient();

  const [quickAddText, setQuickAddText] = useState('');
  const [showChecked, setShowChecked] = useState(true);

  // Fetch shopping list items
  const { data: shoppingData, isLoading: isLoadingItems } = useQuery({
    queryKey: ['shopping-items'],
    queryFn: async () => {
      const response = await authApiClient.get<GetShoppingListItemsResponse>('/api/Shopping/GetShoppingListItems');
      return response.data;
    },
  });

  // Fetch quick add items
  const { data: quickAddData, isLoading: isLoadingQuickAdd } = useQuery({
    queryKey: ['shopping-quick-add'],
    queryFn: async () => {
      const response = await authApiClient.get<GetShoppingListQuickAddItemsResponse>('/api/Shopping/GetShoppingListQuickAddItems');
      return response.data;
    },
  });

  // Add item mutation
  const addItemMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await authApiClient.post(`/api/Shopping/AddShoppingListItem?name=${encodeURIComponent(name)}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-items'] });
      setQuickAddText('');
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to add item');
      console.error('Add item error:', error);
    },
  });

  // Mark as purchased mutation
  const markAsPurchasedMutation = useMutation({
    mutationFn: async (itemId: number) => {
      const response = await authApiClient.put(`/api/Shopping/MarkShoppingListItemAsPurchased?itemId=${itemId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-items'] });
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to update item');
      console.error('Mark as purchased error:', error);
    },
  });

  // Remove item mutation
  const removeItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      const response = await authApiClient.delete(`/api/Shopping/RemoveShoppingListItem?itemId=${itemId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-items'] });
    },
    onError: (error) => {
      Alert.alert('Error', 'Failed to remove item');
      console.error('Remove item error:', error);
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

  const toggleItemChecked = (itemId: number) => {
    markAsPurchasedMutation.mutate(itemId);
  };

  const deleteItem = (itemId: number) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeItemMutation.mutate(itemId) },
      ]
    );
  };

  const items = shoppingData?.items || [];
  const visibleItems = showChecked ? items : items.filter(item => !item.isPurchased);
  const uncheckedCount = items.filter(item => !item.isPurchased).length;

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
              <TouchableOpacity>
                <IconSymbol name="pencil" size={18} color={colors.icon} />
              </TouchableOpacity>
            </View>
            <View style={styles.divider} />
            <View style={styles.quickAddItems}>
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
              <View style={styles.listControls}>
                <TouchableOpacity 
                  style={styles.showCheckedToggle}
                  onPress={() => setShowChecked(!showChecked)}
                >
                  <View style={[
                    styles.checkbox,
                    showChecked && { backgroundColor: colors.tint },
                    { borderColor: colors.tint }
                  ]}>
                    {showChecked && <IconSymbol name="checkmark" size={14} color="#FFFFFF" />}
                  </View>
                  <ThemedText style={styles.showCheckedText}>Show checked</ThemedText>
                </TouchableOpacity>
                <ThemedText style={[styles.itemCount, { color: colors.tint }]}>
                  {uncheckedCount} ITEMS
                </ThemedText>
              </View>
            </View>
            <View style={styles.divider} />
            
            {visibleItems.length === 0 ? (
              <View style={styles.emptyState}>
                <ThemedText style={styles.emptyStateText}>
                  {showChecked ? 'No items in your shopping list' : 'No unchecked items'}
                </ThemedText>
              </View>
            ) : (
              <View style={styles.itemsList}>
                {visibleItems.map((item) => (
                  <View
                    key={item.id}
                    style={[
                      styles.listItem,
                      {
                        backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                        borderColor: isDark ? '#334155' : '#E2E8F0',
                      }
                    ]}
                  >
                    <TouchableOpacity 
                      style={styles.itemCheckbox}
                      onPress={() => toggleItemChecked(item.id)}
                      disabled={markAsPurchasedMutation.isPending}
                    >
                      <View style={[
                        styles.checkbox,
                        item.isPurchased && { backgroundColor: colors.tint },
                        { borderColor: item.isPurchased ? colors.tint : (isDark ? '#475569' : '#CBD5E1') }
                      ]}>
                        {item.isPurchased && <IconSymbol name="checkmark" size={14} color="#FFFFFF" />}
                      </View>
                    </TouchableOpacity>
                    <ThemedText 
                      style={[
                        styles.itemName,
                        item.isPurchased && styles.itemNameChecked
                      ]}
                    >
                      {item.name}
                    </ThemedText>
                    <TouchableOpacity 
                      style={styles.deleteButton}
                      onPress={() => deleteItem(item.id)}
                      disabled={removeItemMutation.isPending}
                    >
                      <IconSymbol name="trash" size={18} color={isDark ? '#EF4444' : '#DC2626'} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
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
  quickAddContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  quickAddInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quickAddInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  addButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
  },
  quickAddItems: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickAddItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  quickAddItemText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  showCheckedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  showCheckedText: {
    fontSize: 13,
  },
  itemCount: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  itemsList: {
    padding: 12,
    gap: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  itemCheckbox: {
    padding: 4,
  },
  itemName: {
    flex: 1,
    fontSize: 15,
  },
  itemNameChecked: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  deleteButton: {
    padding: 4,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
});
