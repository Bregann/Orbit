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
  Divider,
  Collapse,
  CopyButton,
  Paper
} from '@mantine/core'
import { useState } from 'react'
import { IconCheck, IconX, IconPlus, IconTrash, IconCode, IconCopy, IconFileImport } from '@tabler/icons-react'
import { useMutationPost } from '@/helpers/mutations/useMutationPost'
import notificationHelper from '@/helpers/notificationHelper'
import type { AddRecipeRequest, RecipeIngredient, RecipeStep } from '@/interfaces/api/meal-planner/AddRecipeRequest'
import { QueryKeys } from '@/helpers/QueryKeys'
import type { RecipeItem } from '@/interfaces/api/meal-planner/GetRecipesResponse'
import { parseRecipeJson, recipeAiPrompt } from '@/helpers/recipeImportHelper'

interface AddRecipeModalProps {
  opened: boolean
  onClose: () => void
  allRecipes: RecipeItem[]
}

export default function AddRecipeModal({ opened, onClose, allRecipes }: AddRecipeModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([{ name: '', quantity: null }])
  const [steps, setSteps] = useState<RecipeStep[]>([{ stepNumber: 1, instruction: '' }])
  const [prepTime, setPrepTime] = useState<number | string>('')
  const [cookTime, setCookTime] = useState<number | string>('')
  const [servings, setServings] = useState<number | string>('')
  const [showImport, setShowImport] = useState(false)
  const [importJson, setImportJson] = useState('')
  const [importError, setImportError] = useState<string | null>(null)

  const isFormValid = name.trim() !== '' && description.trim() !== ''

  const existingIngredientNames = Array.from(
    new Set(
      allRecipes
        .flatMap(r => r.ingredients ?? [])
        .map(i => i.name)
        .filter(n => n.trim() !== '')
    )
  ).sort()

  const resetForm = () => {
    setName('')
    setDescription('')
    setIngredients([{ name: '', quantity: null }])
    setSteps([{ stepNumber: 1, instruction: '' }])
    setPrepTime('')
    setCookTime('')
    setServings('')
    setShowImport(false)
    setImportJson('')
    setImportError(null)
  }

  const handleImport = () => {
    try {
      const recipe = parseRecipeJson(importJson)
      setName(recipe.name)
      setDescription(recipe.description)
      setIngredients(recipe.ingredients.length > 0 ? recipe.ingredients : [{ name: '', quantity: null }])
      setSteps(recipe.steps.length > 0 ? recipe.steps : [{ stepNumber: 1, instruction: '' }])
      setPrepTime(recipe.prepTimeMinutes ?? '')
      setCookTime(recipe.cookTimeMinutes ?? '')
      setServings(recipe.servings ?? '')
      setImportError(null)
      setImportJson('')
      setShowImport(false)
      notificationHelper.showSuccessNotification('Imported', 'Recipe loaded - review it and click Add Recipe', 3000, <IconCheck />)
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Failed to import recipe')
    }
  }

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

  const { mutateAsync: addRecipe, isPending } = useMutationPost<AddRecipeRequest, number>({
    url: '/api/mealplanner/AddRecipe',
    queryKey: [QueryKeys.Recipes],
    invalidateQuery: true,
    onSuccess: () => {
      notificationHelper.showSuccessNotification('Success', 'Recipe added successfully', 3000, <IconCheck />)
      onClose()
      resetForm()
    },
    onError: (error) => {
      notificationHelper.showErrorNotification('Error', error.message || 'Failed to add recipe', 3000, <IconX />)
    }
  })

  const handleSubmit = async () => {
    if (!isFormValid) return

    const filteredIngredients = ingredients.filter(i => i.name.trim() !== '')
    const filteredSteps = steps.filter(s => s.instruction.trim() !== '').map((s, i) => ({ ...s, stepNumber: i + 1 }))

    const request: AddRecipeRequest = {
      name: name.trim(),
      description: description.trim(),
      ingredients: filteredIngredients.length > 0 ? filteredIngredients : null,
      steps: filteredSteps.length > 0 ? filteredSteps : null,
      prepTimeMinutes: typeof prepTime === 'number' ? prepTime : null,
      cookTimeMinutes: typeof cookTime === 'number' ? cookTime : null,
      servings: typeof servings === 'number' ? servings : null
    }

    await addRecipe(request)
  }

  return (
    <Modal opened={opened} onClose={onClose} title="Add New Recipe" size="lg" closeOnClickOutside={false}>
      <Stack gap="md">
        <Group justify="flex-end" gap="xs">
          <CopyButton value={recipeAiPrompt}>
            {({ copied, copy }) => (
              <Button size="xs" variant="light" color={copied ? 'teal' : 'gray'} onClick={copy}
                leftSection={copied ? <IconCheck size="0.9rem" /> : <IconCopy size="0.9rem" />}>
                {copied ? 'Prompt copied' : 'Copy AI prompt'}
              </Button>
            )}
          </CopyButton>
          <Button size="xs" variant={showImport ? 'filled' : 'light'} leftSection={<IconCode size="0.9rem" />}
            onClick={() => setShowImport(!showImport)}>
            Import from JSON
          </Button>
        </Group>

        <Collapse expanded={showImport}>
          <Paper withBorder p="sm">
            <Stack gap="xs">
              <Text size="xs" c="dimmed">
                Copy the AI prompt, paste it into your AI of choice followed by the recipe (text or link), then paste the JSON it returns here.
              </Text>
              <Textarea placeholder='{ "name": "...", "ingredients": [...], "steps": [...] }' value={importJson}
                onChange={(e) => { setImportJson(e.currentTarget.value); setImportError(null) }}
                autosize minRows={4} maxRows={12} error={importError} styles={{ input: { fontFamily: 'monospace', fontSize: 12 } }} />
              <Group justify="flex-end">
                <Button size="xs" leftSection={<IconFileImport size="0.9rem" />} onClick={handleImport}
                  disabled={importJson.trim() === ''}>
                  Import
                </Button>
              </Group>
            </Stack>
          </Paper>
        </Collapse>

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
          <Button onClick={handleSubmit} loading={isPending} disabled={!isFormValid}>Add Recipe</Button>
        </Group>
      </Stack>
    </Modal>
  )
}
