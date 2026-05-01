import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { authApiClient } from '@/helpers/apiClient';
import { useMutationDelete } from '@/helpers/mutations/useMutationDelete';
import { useMutationPost } from '@/helpers/mutations/useMutationPost';
import { useMutationPut } from '@/helpers/mutations/useMutationPut';
import { QueryKeys } from '@/helpers/QueryKeys';
import { AddRecipeRequest, RecipeIngredient, RecipeStep } from '@/interfaces/api/meal-planner/AddRecipeRequest';
import { UpdateRecipeRequest } from '@/interfaces/api/meal-planner/UpdateRecipeRequest';
import { AddMealPlanEntryRequest } from '@/interfaces/api/meal-planner/AddMealPlanEntryRequest';
import { GetRecipesResponse, RecipeItem } from '@/interfaces/api/meal-planner/GetRecipesResponse';
import { GetMealPlanResponse } from '@/interfaces/api/meal-planner/GetMealPlanResponse';
import { createCommonStyles } from '@/styles/commonStyles';
import { mealPlannerStyles as styles } from '@/styles/mealPlannerStyles';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner'];

function getWeekDates(): { date: Date; label: string; dateStr: string }[] {
  const today = new Date();
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      date: d,
      label: d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }),
      dateStr: d.toISOString().split('T')[0],
    });
  }
  return days;
}

export default function MealPlannerScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const commonStyles = createCommonStyles(colorScheme ?? 'light');
  const isDark = colorScheme === 'dark';
  const router = useRouter();

  const [showAddRecipeModal, setShowAddRecipeModal] = useState(false);
  const [showEditRecipeModal, setShowEditRecipeModal] = useState(false);
  const [showAddMealModal, setShowAddMealModal] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<RecipeItem | null>(null);
  const [selectedMealDate, setSelectedMealDate] = useState('');

  // Add recipe form
  const [recipeName, setRecipeName] = useState('');
  const [recipeDescription, setRecipeDescription] = useState('');
  const [recipeIngredients, setRecipeIngredients] = useState<RecipeIngredient[]>([{ name: '', quantity: null }]);
  const [recipeSteps, setRecipeSteps] = useState<RecipeStep[]>([{ stepNumber: 1, instruction: '' }]);
  const [recipePrepTime, setRecipePrepTime] = useState('');
  const [recipeCookTime, setRecipeCookTime] = useState('');
  const [recipeServings, setRecipeServings] = useState('');

  // Add meal form
  const [addMealSelectedRecipe, setAddMealSelectedRecipe] = useState<number | null>(null);
  const [addMealType, setAddMealType] = useState('');

  const weekDates = useMemo(() => getWeekDates(), []);
  const startDate = weekDates[0].dateStr;
  const endDate = weekDates[6].dateStr;

  const { data: recipesData, isLoading: isLoadingRecipes } = useQuery({
    queryKey: [QueryKeys.Recipes],
    queryFn: async () => {
      const response = await authApiClient.get<GetRecipesResponse>('/api/MealPlanner/GetRecipes');
      return response.data;
    },
  });

  const { data: mealPlanData, isLoading: isLoadingMealPlan } = useQuery({
    queryKey: [QueryKeys.MealPlan, startDate, endDate],
    queryFn: async () => {
      const response = await authApiClient.get<GetMealPlanResponse>(`/api/MealPlanner/GetMealPlan?startDate=${startDate}&endDate=${endDate}`);
      return response.data;
    },
  });

  const recipes = useMemo(() => recipesData?.recipes || [], [recipesData]);
  const mealPlanEntries = useMemo(() => mealPlanData?.entries || [], [mealPlanData]);

  const addRecipeMutation = useMutationPost<AddRecipeRequest, number>({
    url: '/api/MealPlanner/AddRecipe',
    queryKey: [QueryKeys.Recipes],
    invalidateQuery: true,
    onSuccess: () => {
      setShowAddRecipeModal(false);
      resetRecipeForm();
    },
    onError: () => {
      Alert.alert('Error', 'Failed to add recipe');
    },
  });

  const updateRecipeMutation = useMutationPut<UpdateRecipeRequest, void>({
    url: '/api/MealPlanner/UpdateRecipe',
    queryKey: [QueryKeys.Recipes],
    invalidateQuery: true,
    onSuccess: () => {
      setShowEditRecipeModal(false);
      setEditingRecipe(null);
      resetRecipeForm();
    },
    onError: () => {
      Alert.alert('Error', 'Failed to update recipe');
    },
  });

  const deleteRecipeMutation = useMutationDelete<number, void>({
    url: (recipeId: number) => `/api/MealPlanner/DeleteRecipe?recipeId=${recipeId}`,
    queryKey: [QueryKeys.Recipes],
    invalidateQuery: true,
    onError: () => {
      Alert.alert('Error', 'Failed to delete recipe');
    },
  });

  const addMealEntryMutation = useMutationPost<AddMealPlanEntryRequest, number>({
    url: '/api/MealPlanner/AddMealPlanEntry',
    queryKey: [QueryKeys.MealPlan, startDate, endDate],
    invalidateQuery: true,
    onSuccess: () => {
      setShowAddMealModal(false);
      setAddMealSelectedRecipe(null);
      setAddMealType('');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to add meal to plan');
    },
  });

  const deleteMealEntryMutation = useMutationDelete<number, void>({
    url: (entryId: number) => `/api/MealPlanner/DeleteMealPlanEntry?entryId=${entryId}`,
    queryKey: [QueryKeys.MealPlan, startDate, endDate],
    invalidateQuery: true,
    onError: () => {
      Alert.alert('Error', 'Failed to remove meal');
    },
  });

  const logCookMutation = useMutationPost<number, number>({
    url: (recipeId: number) => `/api/MealPlanner/LogCook?recipeId=${recipeId}`,
    queryKey: [QueryKeys.Recipes],
    invalidateQuery: true,
    onError: () => {
      Alert.alert('Error', 'Failed to log cook');
    },
  });

  const resetRecipeForm = () => {
    setRecipeName('');
    setRecipeDescription('');
    setRecipeIngredients([{ name: '', quantity: null }]);
    setRecipeSteps([{ stepNumber: 1, instruction: '' }]);
    setRecipePrepTime('');
    setRecipeCookTime('');
    setRecipeServings('');
  };

  const handleAddRecipe = () => {
    if (!recipeName.trim() || !recipeDescription.trim()) return;
    const filteredIngredients = recipeIngredients.filter(i => i.name.trim() !== '');
    const filteredSteps = recipeSteps.filter(s => s.instruction.trim() !== '').map((s, i) => ({ ...s, stepNumber: i + 1 }));
    addRecipeMutation.mutate({
      name: recipeName.trim(),
      description: recipeDescription.trim(),
      ingredients: filteredIngredients.length > 0 ? filteredIngredients : null,
      steps: filteredSteps.length > 0 ? filteredSteps : null,
      prepTimeMinutes: recipePrepTime ? parseInt(recipePrepTime) : null,
      cookTimeMinutes: recipeCookTime ? parseInt(recipeCookTime) : null,
      servings: recipeServings ? parseInt(recipeServings) : null,
    });
  };

  const handleEditRecipe = () => {
    if (!editingRecipe || !recipeName.trim() || !recipeDescription.trim()) return;
    const filteredIngredients = recipeIngredients.filter(i => i.name.trim() !== '');
    const filteredSteps = recipeSteps.filter(s => s.instruction.trim() !== '').map((s, i) => ({ ...s, stepNumber: i + 1 }));
    updateRecipeMutation.mutate({
      id: editingRecipe.id,
      name: recipeName.trim(),
      description: recipeDescription.trim(),
      ingredients: filteredIngredients.length > 0 ? filteredIngredients : null,
      steps: filteredSteps.length > 0 ? filteredSteps : null,
      prepTimeMinutes: recipePrepTime ? parseInt(recipePrepTime) : null,
      cookTimeMinutes: recipeCookTime ? parseInt(recipeCookTime) : null,
      servings: recipeServings ? parseInt(recipeServings) : null,
    });
  };

  const openEditRecipe = (recipe: RecipeItem) => {
    setEditingRecipe(recipe);
    setRecipeName(recipe.name);
    setRecipeDescription(recipe.description);
    setRecipeIngredients(
      recipe.ingredients && recipe.ingredients.length > 0
        ? recipe.ingredients.map(i => ({ name: i.name, quantity: i.quantity }))
        : [{ name: '', quantity: null }]
    );
    setRecipeSteps(
      recipe.steps && recipe.steps.length > 0
        ? recipe.steps.map(s => ({ stepNumber: s.stepNumber, instruction: s.instruction }))
        : [{ stepNumber: 1, instruction: '' }]
    );
    setRecipePrepTime(recipe.prepTimeMinutes?.toString() ?? '');
    setRecipeCookTime(recipe.cookTimeMinutes?.toString() ?? '');
    setRecipeServings(recipe.servings?.toString() ?? '');
    setShowEditRecipeModal(true);
  };

  const handleDeleteRecipe = (recipeId: number, recipeName: string) => {
    Alert.alert('Delete Recipe', `Are you sure you want to delete "${recipeName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteRecipeMutation.mutate(recipeId) },
    ]);
  };

  const handleAddMeal = (dateStr: string, mealType: string) => {
    setSelectedMealDate(dateStr);
    setAddMealType(mealType);
    setAddMealSelectedRecipe(null);
    setShowAddMealModal(true);
  };

  const handleSubmitMeal = () => {
    if (!addMealSelectedRecipe || !addMealType) return;
    addMealEntryMutation.mutate({
      date: selectedMealDate,
      mealType: addMealType,
      recipeId: addMealSelectedRecipe,
    });
  };

  const handleDeleteMealEntry = (entryId: number) => {
    Alert.alert('Remove Meal', 'Remove this meal from the plan?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deleteMealEntryMutation.mutate(entryId) },
    ]);
  };

  const isLoading = isLoadingRecipes || isLoadingMealPlan;

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.tint} />
        </ThemedView>
      </SafeAreaView>
    );
  }

  const totalRecipes = recipes.length;
  const totalCooks = recipes.reduce((sum, r) => sum + r.timesCooked, 0);
  const mealsPlanned = mealPlanEntries.length;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ThemedView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false} style={{ paddingHorizontal: 16, paddingTop: 16 }}>
          {/* Header */}
          <View style={commonStyles.header}>
            <ThemedText type="title">Meal Planner</ThemedText>
            <ThemedText style={commonStyles.subtitle}>Plan your meals and manage recipes</ThemedText>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={[commonStyles.statCard, { borderLeftColor: colors.tint }]}>
              <ThemedText style={{ fontSize: 20, fontWeight: '700' }}>{totalRecipes}</ThemedText>
              <ThemedText style={{ fontSize: 12, opacity: 0.6 }}>Recipes</ThemedText>
            </View>
            <View style={[commonStyles.statCard, { borderLeftColor: '#F59E0B' }]}>
              <ThemedText style={{ fontSize: 20, fontWeight: '700' }}>{totalCooks}</ThemedText>
              <ThemedText style={{ fontSize: 12, opacity: 0.6 }}>Cooked</ThemedText>
            </View>
            <View style={[commonStyles.statCard, { borderLeftColor: '#10B981' }]}>
              <ThemedText style={{ fontSize: 20, fontWeight: '700' }}>{mealsPlanned}</ThemedText>
              <ThemedText style={{ fontSize: 12, opacity: 0.6 }}>Planned</ThemedText>
            </View>
          </View>

          {/* Weekly Meal Plan */}
          <View style={[styles.section, {
            backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
            borderColor: isDark ? '#334155' : '#E2E8F0',
          }]}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <IconSymbol name="calendar" size={20} color={colors.tint} />
                <ThemedText style={styles.sectionTitle}>Weekly Plan</ThemedText>
              </View>
            </View>
            <View style={styles.divider} />

            {weekDates.map(day => {
              const dayEntries = mealPlanEntries.filter(e => e.date.split('T')[0] === day.dateStr);
              return (
                <View key={day.dateStr} style={styles.dayRow}>
                  <ThemedText style={styles.dayLabel}>{day.label}</ThemedText>
                  <View style={styles.mealsContainer}>
                    {dayEntries.length > 0 ? (
                      dayEntries.map(entry => (
                        <View key={entry.id} style={[styles.mealChip, { backgroundColor: isDark ? '#334155' : '#E8F4FD' }]}>
                          <ThemedText style={[styles.mealChipText, { color: colors.tint }]}>{entry.mealType}:</ThemedText>
                          <ThemedText style={styles.mealChipRecipe} numberOfLines={1}>{entry.recipeName}</ThemedText>
                          <TouchableOpacity onPress={() => handleDeleteMealEntry(entry.id)}>
                            <IconSymbol name="xmark.circle" size={16} color={isDark ? '#EF4444' : '#DC2626'} />
                          </TouchableOpacity>
                        </View>
                      ))
                    ) : null}
                    <TouchableOpacity
                      style={styles.addMealButton}
                      onPress={() => handleAddMeal(day.dateStr, 'Dinner')}
                    >
                      <IconSymbol name="plus.circle" size={18} color={colors.tint} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Recipe Book */}
          <View style={[styles.section, {
            backgroundColor: isDark ? '#1E293B' : '#F8FAFC',
            borderColor: isDark ? '#334155' : '#E2E8F0',
          }]}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <IconSymbol name="book" size={20} color={colors.tint} />
                <ThemedText style={styles.sectionTitle}>Recipe Book</ThemedText>
              </View>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.tint }]}
                onPress={() => {
                  resetRecipeForm();
                  setShowAddRecipeModal(true);
                }}
              >
                <ThemedText style={[styles.modalButtonText, { color: '#000' }]}>+ Add</ThemedText>
              </TouchableOpacity>
            </View>
            <View style={styles.divider} />

            {recipes.length === 0 ? (
              <View style={styles.emptyState}>
                <ThemedText style={styles.emptyStateText}>No recipes yet. Add your first recipe!</ThemedText>
              </View>
            ) : (
              recipes.map(recipe => (
                <View key={recipe.id} style={[styles.recipeCard, {
                  backgroundColor: isDark ? '#0F172A' : '#FFFFFF',
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                }]}>
                  <View style={styles.recipeHeader}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => router.push(`/(stack)/recipe/${recipe.id}`)}>
                      <ThemedText style={[styles.recipeName, { color: colors.tint }]}>{recipe.name}</ThemedText>
                      <ThemedText style={styles.recipeDescription} numberOfLines={1}>{recipe.description}</ThemedText>
                    </TouchableOpacity>
                    <View style={styles.recipeActions}>
                      <TouchableOpacity onPress={() => logCookMutation.mutate(recipe.id)}>
                        <IconSymbol name="flame" size={18} color="#F59E0B" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => openEditRecipe(recipe)}>
                        <IconSymbol name="pencil" size={18} color={colors.tint} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteRecipe(recipe.id, recipe.name)}>
                        <IconSymbol name="trash" size={18} color={isDark ? '#EF4444' : '#DC2626'} />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.recipeMeta}>
                    {recipe.prepTimeMinutes && (
                      <View style={[styles.metaBadge, { backgroundColor: isDark ? '#1E3A5F' : '#DBEAFE' }]}>
                        <IconSymbol name="clock" size={12} color={colors.tint} />
                        <ThemedText style={styles.metaBadgeText}>Prep: {recipe.prepTimeMinutes}m</ThemedText>
                      </View>
                    )}
                    {recipe.cookTimeMinutes && (
                      <View style={[styles.metaBadge, { backgroundColor: isDark ? '#451A03' : '#FEF3C7' }]}>
                        <IconSymbol name="flame" size={12} color="#F59E0B" />
                        <ThemedText style={styles.metaBadgeText}>Cook: {recipe.cookTimeMinutes}m</ThemedText>
                      </View>
                    )}
                    {recipe.servings && (
                      <View style={[styles.metaBadge, { backgroundColor: isDark ? '#064E3B' : '#D1FAE5' }]}>
                        <IconSymbol name="person.2" size={12} color="#10B981" />
                        <ThemedText style={styles.metaBadgeText}>Serves: {recipe.servings}</ThemedText>
                      </View>
                    )}
                    <View style={[styles.metaBadge, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}>
                      <ThemedText style={styles.metaBadgeText}>Cooked {recipe.timesCooked}x</ThemedText>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>

          <View style={{ height: 20 }} />
        </ScrollView>
      </ThemedView>

      {/* Add Recipe Modal */}
      <Modal visible={showAddRecipeModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
            <ScrollView>
            <ThemedText style={styles.modalTitle}>Add New Recipe</ThemedText>
            <TextInput
              style={[styles.modalInput, { color: isDark ? '#E2E8F0' : '#1E293B', borderColor: isDark ? '#475569' : '#CBD5E1' }]}
              placeholder="Recipe name"
              placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
              value={recipeName}
              onChangeText={setRecipeName}
            />
            <TextInput
              style={[styles.modalInput, { color: isDark ? '#E2E8F0' : '#1E293B', borderColor: isDark ? '#475569' : '#CBD5E1' }]}
              placeholder="Description"
              placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
              value={recipeDescription}
              onChangeText={setRecipeDescription}
            />

            {/* Ingredients */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <ThemedText style={styles.modalLabel}>Ingredients</ThemedText>
              <TouchableOpacity onPress={() => setRecipeIngredients([...recipeIngredients, { name: '', quantity: null }])}>
                <IconSymbol name="plus.circle" size={22} color={colors.tint} />
              </TouchableOpacity>
            </View>
            {recipeIngredients.map((ingredient, index) => (
              <View key={index} style={{ flexDirection: 'row', gap: 8, marginBottom: 6 }}>
                <TextInput
                  style={[styles.modalInput, { flex: 2, color: isDark ? '#E2E8F0' : '#1E293B', borderColor: isDark ? '#475569' : '#CBD5E1', marginBottom: 0 }]}
                  placeholder="Ingredient"
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  value={ingredient.name}
                  onChangeText={(text) => {
                    const updated = [...recipeIngredients];
                    updated[index] = { ...updated[index], name: text };
                    setRecipeIngredients(updated);
                  }}
                />
                <TextInput
                  style={[styles.modalInput, { flex: 1, color: isDark ? '#E2E8F0' : '#1E293B', borderColor: isDark ? '#475569' : '#CBD5E1', marginBottom: 0 }]}
                  placeholder="Qty"
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  value={ingredient.quantity ?? ''}
                  onChangeText={(text) => {
                    const updated = [...recipeIngredients];
                    updated[index] = { ...updated[index], quantity: text || null };
                    setRecipeIngredients(updated);
                  }}
                />
                {recipeIngredients.length > 1 && (
                  <TouchableOpacity onPress={() => setRecipeIngredients(recipeIngredients.filter((_, i) => i !== index))} style={{ justifyContent: 'center' }}>
                    <IconSymbol name="trash" size={16} color={isDark ? '#EF4444' : '#DC2626'} />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {/* Steps */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <ThemedText style={styles.modalLabel}>Instructions</ThemedText>
              <TouchableOpacity onPress={() => setRecipeSteps([...recipeSteps, { stepNumber: recipeSteps.length + 1, instruction: '' }])}>
                <IconSymbol name="plus.circle" size={22} color={colors.tint} />
              </TouchableOpacity>
            </View>
            {recipeSteps.map((step, index) => (
              <View key={index} style={{ flexDirection: 'row', gap: 8, marginBottom: 6, alignItems: 'center' }}>
                <ThemedText style={{ width: 24, textAlign: 'center', opacity: 0.5 }}>{index + 1}.</ThemedText>
                <TextInput
                  style={[styles.modalInput, { flex: 1, color: isDark ? '#E2E8F0' : '#1E293B', borderColor: isDark ? '#475569' : '#CBD5E1', marginBottom: 0 }]}
                  placeholder={`Step ${index + 1}`}
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  value={step.instruction}
                  onChangeText={(text) => {
                    const updated = [...recipeSteps];
                    updated[index] = { ...updated[index], instruction: text };
                    setRecipeSteps(updated);
                  }}
                />
                {recipeSteps.length > 1 && (
                  <TouchableOpacity onPress={() => setRecipeSteps(recipeSteps.filter((_, i) => i !== index).map((s, i) => ({ ...s, stepNumber: i + 1 })))} style={{ justifyContent: 'center' }}>
                    <IconSymbol name="trash" size={16} color={isDark ? '#EF4444' : '#DC2626'} />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <View style={styles.modalRow}>
              <View style={styles.modalFieldHalf}>
                <ThemedText style={styles.modalLabel}>Prep (mins)</ThemedText>
                <TextInput
                  style={[styles.modalInput, { color: isDark ? '#E2E8F0' : '#1E293B', borderColor: isDark ? '#475569' : '#CBD5E1' }]}
                  placeholder="0"
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  value={recipePrepTime}
                  onChangeText={setRecipePrepTime}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.modalFieldHalf}>
                <ThemedText style={styles.modalLabel}>Cook (mins)</ThemedText>
                <TextInput
                  style={[styles.modalInput, { color: isDark ? '#E2E8F0' : '#1E293B', borderColor: isDark ? '#475569' : '#CBD5E1' }]}
                  placeholder="0"
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  value={recipeCookTime}
                  onChangeText={setRecipeCookTime}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.modalFieldHalf}>
                <ThemedText style={styles.modalLabel}>Servings</ThemedText>
                <TextInput
                  style={[styles.modalInput, { color: isDark ? '#E2E8F0' : '#1E293B', borderColor: isDark ? '#475569' : '#CBD5E1' }]}
                  placeholder="0"
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  value={recipeServings}
                  onChangeText={setRecipeServings}
                  keyboardType="numeric"
                />
              </View>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}
                onPress={() => setShowAddRecipeModal(false)}
              >
                <ThemedText style={styles.modalButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.tint }]}
                onPress={handleAddRecipe}
                disabled={addRecipeMutation.isPending || !recipeName.trim() || !recipeDescription.trim()}
              >
                <ThemedText style={[styles.modalButtonText, { color: '#000' }]}>
                  {addRecipeMutation.isPending ? 'Adding...' : 'Add Recipe'}
                </ThemedText>
              </TouchableOpacity>
            </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Recipe Modal */}
      <Modal visible={showEditRecipeModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
            <ScrollView>
            <ThemedText style={styles.modalTitle}>Edit Recipe</ThemedText>
            <TextInput
              style={[styles.modalInput, { color: isDark ? '#E2E8F0' : '#1E293B', borderColor: isDark ? '#475569' : '#CBD5E1' }]}
              placeholder="Recipe name"
              placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
              value={recipeName}
              onChangeText={setRecipeName}
            />
            <TextInput
              style={[styles.modalInput, { color: isDark ? '#E2E8F0' : '#1E293B', borderColor: isDark ? '#475569' : '#CBD5E1' }]}
              placeholder="Description"
              placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
              value={recipeDescription}
              onChangeText={setRecipeDescription}
            />

            {/* Ingredients */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <ThemedText style={styles.modalLabel}>Ingredients</ThemedText>
              <TouchableOpacity onPress={() => setRecipeIngredients([...recipeIngredients, { name: '', quantity: null }])}>
                <IconSymbol name="plus.circle" size={22} color={colors.tint} />
              </TouchableOpacity>
            </View>
            {recipeIngredients.map((ingredient, index) => (
              <View key={index} style={{ flexDirection: 'row', gap: 8, marginBottom: 6 }}>
                <TextInput
                  style={[styles.modalInput, { flex: 2, color: isDark ? '#E2E8F0' : '#1E293B', borderColor: isDark ? '#475569' : '#CBD5E1', marginBottom: 0 }]}
                  placeholder="Ingredient"
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  value={ingredient.name}
                  onChangeText={(text) => {
                    const updated = [...recipeIngredients];
                    updated[index] = { ...updated[index], name: text };
                    setRecipeIngredients(updated);
                  }}
                />
                <TextInput
                  style={[styles.modalInput, { flex: 1, color: isDark ? '#E2E8F0' : '#1E293B', borderColor: isDark ? '#475569' : '#CBD5E1', marginBottom: 0 }]}
                  placeholder="Qty"
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  value={ingredient.quantity ?? ''}
                  onChangeText={(text) => {
                    const updated = [...recipeIngredients];
                    updated[index] = { ...updated[index], quantity: text || null };
                    setRecipeIngredients(updated);
                  }}
                />
                {recipeIngredients.length > 1 && (
                  <TouchableOpacity onPress={() => setRecipeIngredients(recipeIngredients.filter((_, i) => i !== index))} style={{ justifyContent: 'center' }}>
                    <IconSymbol name="trash" size={16} color={isDark ? '#EF4444' : '#DC2626'} />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {/* Steps */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <ThemedText style={styles.modalLabel}>Instructions</ThemedText>
              <TouchableOpacity onPress={() => setRecipeSteps([...recipeSteps, { stepNumber: recipeSteps.length + 1, instruction: '' }])}>
                <IconSymbol name="plus.circle" size={22} color={colors.tint} />
              </TouchableOpacity>
            </View>
            {recipeSteps.map((step, index) => (
              <View key={index} style={{ flexDirection: 'row', gap: 8, marginBottom: 6, alignItems: 'center' }}>
                <ThemedText style={{ width: 24, textAlign: 'center', opacity: 0.5 }}>{index + 1}.</ThemedText>
                <TextInput
                  style={[styles.modalInput, { flex: 1, color: isDark ? '#E2E8F0' : '#1E293B', borderColor: isDark ? '#475569' : '#CBD5E1', marginBottom: 0 }]}
                  placeholder={`Step ${index + 1}`}
                  placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
                  value={step.instruction}
                  onChangeText={(text) => {
                    const updated = [...recipeSteps];
                    updated[index] = { ...updated[index], instruction: text };
                    setRecipeSteps(updated);
                  }}
                />
                {recipeSteps.length > 1 && (
                  <TouchableOpacity onPress={() => setRecipeSteps(recipeSteps.filter((_, i) => i !== index).map((s, i) => ({ ...s, stepNumber: i + 1 })))} style={{ justifyContent: 'center' }}>
                    <IconSymbol name="trash" size={16} color={isDark ? '#EF4444' : '#DC2626'} />
                  </TouchableOpacity>
                )}
              </View>
            ))}

            <View style={styles.modalRow}>
              <View style={styles.modalFieldHalf}>
                <ThemedText style={styles.modalLabel}>Prep (mins)</ThemedText>
                <TextInput
                  style={[styles.modalInput, { color: isDark ? '#E2E8F0' : '#1E293B', borderColor: isDark ? '#475569' : '#CBD5E1' }]}
                  value={recipePrepTime}
                  onChangeText={setRecipePrepTime}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.modalFieldHalf}>
                <ThemedText style={styles.modalLabel}>Cook (mins)</ThemedText>
                <TextInput
                  style={[styles.modalInput, { color: isDark ? '#E2E8F0' : '#1E293B', borderColor: isDark ? '#475569' : '#CBD5E1' }]}
                  value={recipeCookTime}
                  onChangeText={setRecipeCookTime}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.modalFieldHalf}>
                <ThemedText style={styles.modalLabel}>Servings</ThemedText>
                <TextInput
                  style={[styles.modalInput, { color: isDark ? '#E2E8F0' : '#1E293B', borderColor: isDark ? '#475569' : '#CBD5E1' }]}
                  value={recipeServings}
                  onChangeText={setRecipeServings}
                  keyboardType="numeric"
                />
              </View>
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}
                onPress={() => { setShowEditRecipeModal(false); setEditingRecipe(null); }}
              >
                <ThemedText style={styles.modalButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.tint }]}
                onPress={handleEditRecipe}
                disabled={updateRecipeMutation.isPending || !recipeName.trim() || !recipeDescription.trim()}
              >
                <ThemedText style={[styles.modalButtonText, { color: '#000' }]}>
                  {updateRecipeMutation.isPending ? 'Saving...' : 'Save Changes'}
                </ThemedText>
              </TouchableOpacity>
            </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Add Meal Plan Entry Modal */}
      <Modal visible={showAddMealModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF' }]}>
            <ThemedText style={styles.modalTitle}>Add Meal to Plan</ThemedText>
            <ThemedText style={styles.modalLabel}>Meal Type</ThemedText>
            <View style={styles.mealTypeSelector}>
              {MEAL_TYPES.map(type => (
                <TouchableOpacity
                  key={type}
                  style={[styles.mealTypeOption, {
                    borderColor: addMealType === type ? colors.tint : (isDark ? '#475569' : '#CBD5E1'),
                    backgroundColor: addMealType === type ? (isDark ? '#1E3A5F' : '#DBEAFE') : 'transparent',
                  }]}
                  onPress={() => setAddMealType(type)}
                >
                  <ThemedText style={[styles.mealTypeText, addMealType === type && { color: colors.tint }]}>{type}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
            <ThemedText style={styles.modalLabel}>Select Recipe</ThemedText>
            <ScrollView style={{ maxHeight: 200 }}>
              {recipes.map(recipe => (
                <TouchableOpacity
                  key={recipe.id}
                  style={[styles.recipeOption, {
                    borderColor: addMealSelectedRecipe === recipe.id ? colors.tint : (isDark ? '#475569' : '#CBD5E1'),
                    backgroundColor: addMealSelectedRecipe === recipe.id ? (isDark ? '#1E3A5F' : '#DBEAFE') : 'transparent',
                  }]}
                  onPress={() => setAddMealSelectedRecipe(recipe.id)}
                >
                  <ThemedText style={styles.recipeOptionName}>{recipe.name}</ThemedText>
                  <ThemedText style={styles.recipeOptionDesc}>{recipe.description}</ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}
                onPress={() => setShowAddMealModal(false)}
              >
                <ThemedText style={styles.modalButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.tint }]}
                onPress={handleSubmitMeal}
                disabled={addMealEntryMutation.isPending || !addMealSelectedRecipe || !addMealType}
              >
                <ThemedText style={[styles.modalButtonText, { color: '#000' }]}>
                  {addMealEntryMutation.isPending ? 'Adding...' : 'Add to Plan'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
