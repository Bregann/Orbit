import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { IngredientPickerModal } from '@/components/meal-planner/IngredientPickerModal';
import { Colors } from '@/constants/theme';
import { authApiClient } from '@/helpers/apiClient';
import { useMutationPost } from '@/helpers/mutations/useMutationPost';
import { QueryKeys } from '@/helpers/QueryKeys';
import { RecipeItem } from '@/interfaces/api/meal-planner/GetRecipesResponse';
import { createCommonStyles } from '@/styles/commonStyles';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const styles = createCommonStyles(colorScheme ?? 'light');
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const queryClient = useQueryClient();
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showIngredientPicker, setShowIngredientPicker] = useState(false);

  const toggleStep = (stepNumber: number) => {
    setCompletedSteps(prev => {
      const next = new Set<number>(prev);
      if (next.has(stepNumber)) {
        next.delete(stepNumber);
      } else {
        next.add(stepNumber);
      }
      return next;
    });
  };

  const { data: recipe, isLoading } = useQuery({
    queryKey: [QueryKeys.RecipeDetail, id],
    queryFn: async () => {
      const response = await authApiClient.get<RecipeItem>(`/api/MealPlanner/GetRecipe?recipeId=${id}`);
      return response.data;
    },
  });

  const logCookMutation = useMutationPost<number, void>({
    url: (recipeId: number) => `/api/MealPlanner/LogCook?recipeId=${recipeId}`,
    queryKey: [QueryKeys.RecipeDetail, id],
    invalidateQuery: true,
    onSuccess: () => Alert.alert('Success', 'Cook logged!'),
    onError: () => Alert.alert('Error', 'Failed to log cook'),
  });

  const addSingleIngredientMutation = useMutationPost<string, void>({
    url: (name: string) => `/api/Shopping/AddShoppingListItem?name=${encodeURIComponent(name)}`,
    queryKey: [QueryKeys.ShoppingListItems],
    invalidateQuery: true,
  });

  const handleAddIngredients = async (names: string[]) => {
    try {
      const promises = names.map(name => addSingleIngredientMutation.mutateAsync(name));
      await Promise.all(promises);
      queryClient.invalidateQueries({ queryKey: [QueryKeys.ShoppingListItems] });
      setShowIngredientPicker(false);
      Alert.alert('Done', `${names.length} ingredient(s) added to shopping list`);
    } catch {
      Alert.alert('Error', 'Failed to add some ingredients');
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

  if (!recipe) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ThemedText>Recipe not found</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ThemedView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          {/* Back button */}
          <TouchableOpacity onPress={() => router.back()} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <IconSymbol name="chevron.left" size={20} color={colors.tint} />
            <ThemedText style={{ color: colors.tint, marginLeft: 4 }}>Back</ThemedText>
          </TouchableOpacity>

          {/* Header */}
          <View style={styles.header}>
            <ThemedText type="title">{recipe.name}</ThemedText>
            <ThemedText style={styles.subtitle}>{recipe.description}</ThemedText>
          </View>

          {/* Meta badges */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
            {recipe.prepTimeMinutes && (
              <View style={[styles.statCard, { borderLeftColor: colors.tint, paddingVertical: 8, paddingHorizontal: 12, flex: 0 }]}>
                <ThemedText style={{ fontSize: 12 }}>Prep: {recipe.prepTimeMinutes} mins</ThemedText>
              </View>
            )}
            {recipe.cookTimeMinutes && (
              <View style={[styles.statCard, { borderLeftColor: '#F59E0B', paddingVertical: 8, paddingHorizontal: 12, flex: 0 }]}>
                <ThemedText style={{ fontSize: 12 }}>Cook: {recipe.cookTimeMinutes} mins</ThemedText>
              </View>
            )}
            {recipe.servings && (
              <View style={[styles.statCard, { borderLeftColor: '#10B981', paddingVertical: 8, paddingHorizontal: 12, flex: 0 }]}>
                <ThemedText style={{ fontSize: 12 }}>Serves {recipe.servings}</ThemedText>
              </View>
            )}
            <View style={[styles.statCard, { borderLeftColor: '#8B5CF6', paddingVertical: 8, paddingHorizontal: 12, flex: 0 }]}>
              <ThemedText style={{ fontSize: 12 }}>Cooked {recipe.timesCooked}x</ThemedText>
            </View>
          </View>

          {/* Action buttons */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24 }}>
            <TouchableOpacity
              style={{ flex: 1, backgroundColor: '#F59E0B', borderRadius: 8, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', gap: 4 }}
              onPress={() => {
                if (!recipe?.ingredients || recipe.ingredients.length === 0) {
                  Alert.alert('No ingredients', 'This recipe has no ingredients to add.');
                  return;
                }
                setShowIngredientPicker(true);
              }}
              disabled={addSingleIngredientMutation.isPending}
            >
              <IconSymbol name="cart" size={18} color="#000" />
              <ThemedText style={{ color: '#000', fontWeight: '600', fontSize: 13 }} numberOfLines={1}>
                Add to Cart
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={{ flex: 1, backgroundColor: '#10B981', borderRadius: 8, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', gap: 4 }}
              onPress={() => logCookMutation.mutate(recipe!.id)}
              disabled={logCookMutation.isPending}
            >
              <IconSymbol name="flame" size={18} color="#000" />
              <ThemedText style={{ color: '#000', fontWeight: '600', fontSize: 13 }} numberOfLines={1}>
                Log Cook
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Ingredients */}
          <View style={[styles.sectionContainer, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: isDark ? '#334155' : '#E2E8F0' }]}>
            <ThemedText type="subtitle" style={{ marginBottom: 12 }}>Ingredients</ThemedText>
            {recipe.ingredients && recipe.ingredients.length > 0 ? (
              recipe.ingredients.map((ingredient, index) => (
                <View key={index} style={{ flexDirection: 'row', paddingVertical: 6, borderBottomWidth: index < recipe.ingredients!.length - 1 ? 1 : 0, borderBottomColor: isDark ? '#334155' : '#E2E8F0' }}>
                  <ThemedText style={{ marginRight: 8 }}>•</ThemedText>
                  <ThemedText style={{ fontWeight: '500', flex: 1 }}>{ingredient.name}</ThemedText>
                  {ingredient.quantity && (
                    <ThemedText style={{ opacity: 0.6 }}>{ingredient.quantity}</ThemedText>
                  )}
                </View>
              ))
            ) : (
              <ThemedText style={{ opacity: 0.5 }}>No ingredients listed.</ThemedText>
            )}
          </View>

          {/* Instructions */}
          <View style={[styles.sectionContainer, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: isDark ? '#334155' : '#E2E8F0', marginTop: 16 }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <ThemedText type="subtitle">Instructions</ThemedText>
              {recipe.steps && recipe.steps.length > 0 && (
                <ThemedText style={{ fontSize: 12, opacity: 0.5 }}>{completedSteps.size} / {recipe.steps.length} done</ThemedText>
              )}
            </View>
            {recipe.steps && recipe.steps.length > 0 ? (
              recipe.steps
                .sort((a, b) => a.stepNumber - b.stepNumber)
                .map((step) => {
                  const done = completedSteps.has(step.stepNumber);
                  return (
                    <TouchableOpacity
                      key={step.stepNumber}
                      onPress={() => toggleStep(step.stepNumber)}
                      activeOpacity={0.7}
                      style={{ flexDirection: 'row', paddingVertical: 10, alignItems: 'flex-start', borderBottomWidth: 1, borderBottomColor: isDark ? '#334155' : '#E2E8F0' }}
                    >
                      <View style={{
                        width: 22, height: 22, borderRadius: 4, borderWidth: 2,
                        borderColor: done ? colors.tint : (isDark ? '#475569' : '#CBD5E1'),
                        backgroundColor: done ? colors.tint : 'transparent',
                        justifyContent: 'center', alignItems: 'center', marginRight: 12, marginTop: 2, flexShrink: 0
                      }}>
                        {done && <ThemedText style={{ color: '#000', fontSize: 13, fontWeight: '700', lineHeight: 16 }}>✓</ThemedText>}
                      </View>
                      <View style={{ flex: 1 }}>
                        <ThemedText style={{ fontSize: 12, fontWeight: '700', opacity: 0.4, marginBottom: 2 }}>Step {step.stepNumber}</ThemedText>
                        <ThemedText style={{ opacity: done ? 0.35 : 1, textDecorationLine: done ? 'line-through' : 'none' }}>{step.instruction}</ThemedText>
                      </View>
                    </TouchableOpacity>
                  );
                })
            ) : (
              <ThemedText style={{ opacity: 0.5 }}>No instructions listed.</ThemedText>
            )}
          </View>

          {/* Meta */}
          <View style={{ marginTop: 20, marginBottom: 30, opacity: 0.5 }}>
            <ThemedText style={{ fontSize: 12 }}>
              Added: {new Date(recipe.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </ThemedText>
            {recipe.lastCooked && (
              <ThemedText style={{ fontSize: 12 }}>
                Last cooked: {new Date(recipe.lastCooked).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </ThemedText>
            )}
          </View>
        </ScrollView>

        <IngredientPickerModal
          visible={showIngredientPicker}
          onClose={() => setShowIngredientPicker(false)}
          ingredients={recipe.ingredients ?? []}
          onAdd={handleAddIngredients}
        />
      </ThemedView>
    </SafeAreaView>
  );
}
