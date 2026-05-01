import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { RecipeIngredient } from '@/interfaces/api/meal-planner/GetRecipesResponse';
import { useState } from 'react';
import { Modal, ScrollView, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface IngredientPickerModalProps {
  visible: boolean;
  onClose: () => void;
  ingredients: RecipeIngredient[];
  onAdd: (_selectedNames: string[]) => void;
}

export function IngredientPickerModal({ visible, onClose, ingredients, onAdd }: IngredientPickerModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const toggle = (index: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelected(new Set(ingredients.map((_, i) => i)));
  };

  const deselectAll = () => {
    setSelected(new Set());
  };

  const handleAdd = () => {
    if (selected.size === 0) return;
    const names = Array.from(selected).map(i => ingredients[i].name);
    onAdd(names);
    setSelected(new Set());
  };

  const handleClose = () => {
    setSelected(new Set());
    onClose();
  };

  const allSelected = ingredients.length > 0 && selected.size === ingredients.length;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? '#151718' : '#fff' }} edges={['top']}>
        {/* Header */}
        <View style={{
          flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
          paddingHorizontal: 16, paddingVertical: 12,
          borderBottomWidth: 1, borderBottomColor: isDark ? '#1E293B' : '#E2E8F0',
          backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
        }}>
          <TouchableOpacity onPress={handleClose}>
            <ThemedText style={{ fontSize: 16, color: colors.tint }}>Cancel</ThemedText>
          </TouchableOpacity>
          <ThemedText type="title" style={{ fontSize: 18 }}>Add to Cart</ThemedText>
          <TouchableOpacity onPress={handleAdd} disabled={selected.size === 0}>
            <ThemedText style={{
              fontSize: 16, fontWeight: '700',
              color: selected.size > 0 ? colors.tint : (isDark ? '#475569' : '#94A3B8'),
            }}>
              Add ({selected.size})
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Select All / Deselect All */}
        <View style={{ paddingHorizontal: 16, marginTop: 16, marginBottom: 8 }}>
          <TouchableOpacity onPress={allSelected ? deselectAll : selectAll} style={{ alignSelf: 'flex-end' }}>
            <ThemedText style={{ color: colors.tint, fontSize: 14, fontWeight: '600' }}>
              {allSelected ? 'Deselect All' : 'Select All'}
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Ingredient list */}
        <ScrollView style={{ flex: 1, paddingHorizontal: 16 }} contentContainerStyle={{ paddingBottom: 40 }}>
          {ingredients.map((ingredient, index) => {
            const isSelected = selected.has(index);
            return (
              <TouchableOpacity
                key={index}
                onPress={() => toggle(index)}
                style={{
                  flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
                  borderBottomWidth: 1, borderBottomColor: isDark ? '#1E293B' : '#E2E8F0', gap: 12,
                }}
              >
                {/* Checkbox */}
                <View style={{
                  width: 22, height: 22, borderRadius: 4, borderWidth: 2,
                  borderColor: isSelected ? colors.tint : (isDark ? '#475569' : '#CBD5E1'),
                  backgroundColor: isSelected ? colors.tint : 'transparent',
                  justifyContent: 'center', alignItems: 'center',
                }}>
                  {isSelected && (
                    <ThemedText style={{ color: '#000', fontSize: 13, fontWeight: '700', lineHeight: 16 }}>✓</ThemedText>
                  )}
                </View>

                {/* Name + quantity */}
                <View style={{ flex: 1 }}>
                  <ThemedText style={{ fontWeight: '500' }}>{ingredient.name}</ThemedText>
                  {ingredient.quantity && (
                    <ThemedText style={{ fontSize: 13, opacity: 0.5, marginTop: 2 }}>{ingredient.quantity}</ThemedText>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
