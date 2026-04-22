'use client'

import {
  Modal,
  Stack,
  TextInput,
  Textarea,
  Grid,
  NumberInput,
  Group,
  Button,
  ActionIcon,
  Text,
  Autocomplete,
  Divider
} from '@mantine/core'
import { useState, useEffect } from 'react'
import { IconCheck, IconX, IconPlus, IconTrash } from '@tabler/icons-react'
import { useMutationPut } from '@/helpers/mutations/useMutationPut'
import notificationHelper from '@/helpers/notificationHelper'
import type { UpdateRecipeRequest } from '@/interfaces/api/meal-planner/UpdateRecipeRequest'
import type { RecipeItem } from '@/interfaces/api/meal-planner/GetRecipesResponse'
import type { RecipeIngredient, RecipeStep } from '@/interfaces/api/meal-planner/AddRecipeRequest'
import { QueryKeys } from '@/helpers/QueryKeys'

interface EditRecipeModalProps {
  recipe: RecipeItem | null
  onClose: () => void
  allRecipes: RecipeItem[]
}

export default function EditRecipeModal({ recipe, onClose, allRecipes }: EditRecipeModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([{ name: '', quantity: null }])
  const [steps, setSteps] = useState<RecipeStep[]>([{ stepNumber: 1, instruction: '' }])
  const [prepTime, setPrepTime] = useState<number | string>('')
  const [cookTime, setCookTime] = useState<number | string>('')
  const [servings, setServings] = useState<number | string>('')

  useEffect(() => {
    if (recipe) {
      setName(recipe.name)
      setDescription(recipe.description)
      setIngredients(
        recipe.ingredients && recipe.ingredients.length > 0
          ? recipe.ingredients.map(i => ({ name: i.name, quantity: i.quantity }))
          : [{ name: '', quantity: null }]
      )
      setSteps(
        recipe.steps && recipe.steps.length > 0
          ? recipe.steps.map(s => ({ stepNumber: s.stepNumber, instruction: s.instruction }))
          : [{ stepNumber: 1, instruction: '' }]
      )
      setPrepTime(recipe.prepTimeMinutes ?? '')
      setCookTime(recipe.cookTimeMinutes ?? '')
      setServings(recipe.servings ?? '')
    }
  }, [recipe])

  const isFormValid = name.trim() !== '' && description.trim() !== ''

  const existingIngredientNames = Array.from(
    new Set(
      allRecipes
        .flatMap(r => r.ingredients ?? [])
        .map(i => i.name)
        .filter(n => n.trim() !== '')
    )
  ).sort()

  const addIngredient = () => setIngredients([...ingredients, { name: '', quantity: null }])
  const removeIngredient = (index: number) => {
    if (ingredients.length <= 1) return
    setIngredients(ingredients.filter((_, i) => i !== index))
  }
  const updateIngredient = (index: number, field: keyof RecipeIngredient, value: string) => {
    const updated = [...ingredients]
    updated[index] = { ...updated[index], [field]: field === 'name' ? value : (value || null) }
    setIngredients(updated)
  }

  const addStep = () => setSteps([...steps, { stepNumber: steps.length + 1, instruction: '' }])
  const removeStep = (index: number) => {
    if (steps.length <= 1) return
    setSteps(steps.filter((_, i) => i !== index).map((s, i) => ({ ...s, stepNumber: i + 1 })))
  }
  const updateStep = (index: number, instruction: string) => {
    const updated = [...steps]
    updated[index] = { ...updated[index], instruction }
    setSteps(updated)
  }

  const { mutateAsync: updateRecipe, isPending } = useMutationPut<UpdateRecipeRequest, void>({
    url: '/api/mealplanner/UpdateRecipe',
    queryKey: [QueryKeys.Recipes],
    invalidateQuery: true,
    onSuccess: () => {
      notificationHelper.showSuccessNotification('Success', 'Recipe updated successfully', 3000, <IconCheck />)
      onClose()
    },
    onError: (error) => {
      notificationHelper.showErrorNotification('Error', error.message || 'Failed to update recipe', 3000, <IconX />)
    }
  })

  const handleSubmit = async () => {
    if (!isFormValid || !recipe) return

    const filteredIngredients = ingredients.filter(i => i.name.trim() !== '')
    const filteredSteps = steps.filter(s => s.instruction.trim() !== '').map((s, i) => ({ ...s, stepNumber: i + 1 }))

    const request: UpdateRecipeRequest = {
      id: recipe.id,
      name: name.trim(),
      description: description.trim(),
      ingredients: filteredIngredients.length > 0 ? filteredIngredients : null,
      steps: filteredSteps.length > 0 ? filteredSteps : null,
      prepTimeMinutes: typeof prepTime === 'number' ? prepTime : null,
      cookTimeMinutes: typeof cookTime === 'number' ? cookTime : null,
      servings: typeof servings === 'number' ? servings : null
    }

    await updateRecipe(request)
  }

  return (
    <Modal opened={recipe !== null} onClose={onClose} title="Edit Recipe" size="lg" closeOnClickOutside={false}>
      <Stack gap="md">
        <TextInput label="Recipe Name" placeholder="Enter recipe name" value={name}
          onChange={(e) => setName(e.currentTarget.value)} required />
        <Textarea label="Description" placeholder="Brief description of the recipe" value={description}
          onChange={(e) => setDescription(e.currentTarget.value)} rows={2} required />

        {/* Ingredients */}
        <div>
          <Group justify="space-between" mb="xs">
            <Text size="sm" fw={500}>Ingredients</Text>
            <ActionIcon variant="light" color="blue" size="sm" onClick={addIngredient}><IconPlus size="0.9rem" /></ActionIcon>
          </Group>
          <Stack gap="xs">
            {ingredients.map((ingredient, index) => (
              <Group key={index} gap="xs" wrap="nowrap">
                <Autocomplete placeholder="Ingredient name" data={existingIngredientNames}
                  value={ingredient.name} onChange={(value) => updateIngredient(index, 'name', value)} style={{ flex: 2 }} />
                <TextInput placeholder="Qty (e.g. 200g)" value={ingredient.quantity ?? ''}
                  onChange={(e) => updateIngredient(index, 'quantity', e.currentTarget.value)} style={{ flex: 1 }} />
                <ActionIcon variant="subtle" color="red" size="sm" onClick={() => removeIngredient(index)}
                  disabled={ingredients.length <= 1}><IconTrash size="0.8rem" /></ActionIcon>
              </Group>
            ))}
          </Stack>
        </div>

        <Divider />

        {/* Steps */}
        <div>
          <Group justify="space-between" mb="xs">
            <Text size="sm" fw={500}>Instructions</Text>
            <ActionIcon variant="light" color="blue" size="sm" onClick={addStep}><IconPlus size="0.9rem" /></ActionIcon>
          </Group>
          <Stack gap="xs">
            {steps.map((step, index) => (
              <Group key={index} gap="xs" wrap="nowrap" align="flex-start">
                <Text size="sm" fw={500} c="dimmed" mt={8} w={24} ta="center">{index + 1}.</Text>
                <TextInput placeholder={`Step ${index + 1}`} value={step.instruction}
                  onChange={(e) => updateStep(index, e.currentTarget.value)} style={{ flex: 1 }} />
                <ActionIcon variant="subtle" color="red" size="sm" onClick={() => removeStep(index)}
                  disabled={steps.length <= 1} mt={4}><IconTrash size="0.8rem" /></ActionIcon>
              </Group>
            ))}
          </Stack>
        </div>

        <Divider />

        <Grid>
          <Grid.Col span={4}>
            <NumberInput label="Prep Time (mins)" placeholder="Minutes" value={prepTime} onChange={setPrepTime} min={0} />
          </Grid.Col>
          <Grid.Col span={4}>
            <NumberInput label="Cook Time (mins)" placeholder="Minutes" value={cookTime} onChange={setCookTime} min={0} />
          </Grid.Col>
          <Grid.Col span={4}>
            <NumberInput label="Servings" placeholder="Servings" value={servings} onChange={setServings} min={1} />
          </Grid.Col>
        </Grid>
        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} loading={isPending} disabled={!isFormValid}>Save Changes</Button>
        </Group>
      </Stack>
    </Modal>
  )
}
