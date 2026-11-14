import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useMutationDelete } from '@/helpers/mutations/useMutationDelete';
import { useMutationPost } from '@/helpers/mutations/useMutationPost';
import { QueryKeys } from '@/helpers/QueryKeys';
import { ShoppingListQuickAddItem } from '@/interfaces/api/shopping/GetShoppingListQuickAddItemsResponse';
import { shoppingStyles as styles } from '@/styles/shoppingStyles';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from 'react-native';

interface ManageQuickAddItemsModalProps {
  visible: boolean;
  onClose: () => void;
  items: ShoppingListQuickAddItem[];
}

export function ManageQuickAddItemsModal({ visible, onClose, items }: ManageQuickAddItemsModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

  const [newItemName, setNewItemName] = useState('');

  const addQuickAddItemMutation = useMutationPost<string, void>({
    url: (name: string) => `/api/Shopping/AddShoppingListQuickAddItem?name=${encodeURIComponent(name)}`,
    queryKey: [QueryKeys.ShoppingListQuickAdd],
    invalidateQuery: true,
    onSuccess: () => {
      setNewItemName('');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to add common item');
    },
  });

  const removeQuickAddItemMutation = useMutationDelete<number, void>({
    url: (itemId: number) => `/api/Shopping/RemoveShoppingListQuickAddItem?itemId=${itemId}`,
    queryKey: [QueryKeys.ShoppingListQuickAdd],
    invalidateQuery: true,
    onError: () => {
      Alert.alert('Error', 'Failed to remove common item');
    },
  });

  const handleAdd = () => {
    const trimmed = newItemName.trim();
    if (!trimmed) return;

    if (items.some(item => item.name.toLowerCase() === trimmed.toLowerCase())) {
      Alert.alert('Duplicate', 'This item already exists');
      return;
    }

    addQuickAddItemMutation.mutate(trimmed);
  };

  const handleClose = () => {
    setNewItemName('');
    onClose();
  };

  const Wrapper = Platform.OS === 'ios' ? KeyboardAvoidingView : View;
  const wrapperProps = Platform.OS === 'ios' ? { behavior: 'padding' as const } : {};

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <Wrapper style={styles.modalOverlay} {...wrapperProps}>
        <View style={[styles.modalSheet, { backgroundColor: isDark ? '#1D2026' : '#ffffff' }]}>
          <ThemedText type="title" style={styles.modalTitle}>
            Common Items
          </ThemedText>

          <View style={styles.modalAddRow}>
            <TextInput
              style={[
                styles.modalInput,
                {
                  color: colors.text,
                  backgroundColor: isDark ? '#23272E' : '#f3f4f6',
                  borderColor: isDark ? '#495057' : '#dee2e6',
                },
              ]}
              placeholder="Add a common item..."
              placeholderTextColor={colors.icon}
              value={newItemName}
              onChangeText={setNewItemName}
              onSubmitEditing={handleAdd}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={[
                styles.addButton,
                { backgroundColor: colors.tint, justifyContent: 'center' },
                (!newItemName.trim() || addQuickAddItemMutation.isPending) && { opacity: 0.5 },
              ]}
              onPress={handleAdd}
              disabled={!newItemName.trim() || addQuickAddItemMutation.isPending}
            >
              <ThemedText style={styles.addButtonText}>
                {addQuickAddItemMutation.isPending ? 'Adding...' : 'Add'}
              </ThemedText>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalList} contentContainerStyle={{ gap: 8 }}>
            {items.length === 0 ? (
              <ThemedText style={styles.emptyStateText}>No common items yet</ThemedText>
            ) : (
              items.map((item) => (
                <View
                  key={item.id}
                  style={[
                    styles.listItem,
                    {
                      backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                      borderColor: isDark ? '#334155' : '#E2E8F0',
                    },
                  ]}
                >
                  <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => removeQuickAddItemMutation.mutate(item.id)}
                    disabled={removeQuickAddItemMutation.isPending}
                  >
                    <IconSymbol name="trash" size={18} color={isDark ? '#EF4444' : '#DC2626'} />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </ScrollView>

          <TouchableOpacity
            style={[styles.modalCloseButton, { borderColor: isDark ? '#495057' : '#dee2e6' }]}
            onPress={handleClose}
          >
            <ThemedText>Done</ThemedText>
          </TouchableOpacity>
        </View>
      </Wrapper>
    </Modal>
  );
}
