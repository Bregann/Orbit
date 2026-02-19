'use client'

import { Modal, Stack, Group, TextInput, Button, Select, NumberInput, Textarea } from '@mantine/core'
import { useState } from 'react'
import { IconPlus, IconX } from '@tabler/icons-react'
import notificationHelper from '@/helpers/notificationHelper'
import type { AssetCategoryItem } from '@/interfaces/api/assets/GetAllAssetCategoriesDto'
import type { CreateAssetRequest } from '@/interfaces/api/assets/CreateAssetRequest'
import { assetStatuses } from '@/helpers/assetOptions'

interface CreateAssetModalProps {
  opened: boolean
  onClose: () => void
  categories: AssetCategoryItem[]
  onCreate: (_request: CreateAssetRequest) => void
  isCreating: boolean
}

export default function CreateAssetModal({
  opened,
  onClose,
  categories,
  onCreate,
  isCreating
}: CreateAssetModalProps) {
  const [assetName, setAssetName] = useState('')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [serialNumber, setSerialNumber] = useState('')
  const [purchaseDate, setPurchaseDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [purchasePrice, setPurchasePrice] = useState<number | string>('')
  const [location, setLocation] = useState('')
  const [warrantyExpirationDate, setWarrantyExpirationDate] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<string | null>('Active')
  const [categoryId, setCategoryId] = useState<string | null>(null)

  const handleCreate = () => {
    if (!assetName.trim()) {
      notificationHelper.showErrorNotification('Error', 'Please enter an asset name', 3000, <IconX />)
      return
    }

    if (!categoryId) {
      notificationHelper.showErrorNotification('Error', 'Please select a category', 3000, <IconX />)
      return
    }

    if (!purchaseDate) {
      notificationHelper.showErrorNotification('Error', 'Please select a purchase date', 3000, <IconX />)
      return
    }

    if (!status) {
      notificationHelper.showErrorNotification('Error', 'Please select a status', 3000, <IconX />)
      return
    }

    const request: CreateAssetRequest = {
      assetName: assetName.trim(),
      brand: brand.trim() || null,
      model: model.trim() || null,
      serialNumber: serialNumber.trim() || null,
      purchaseDate: new Date(purchaseDate).toISOString(),
      purchasePrice: typeof purchasePrice === 'number' ? purchasePrice : null,
      location: location.trim() || null,
      warrantyExpirationDate: warrantyExpirationDate ? new Date(warrantyExpirationDate).toISOString() : null,
      notes: notes.trim() || null,
      status,
      categoryId: parseInt(categoryId, 10)
    }

    onCreate(request)
    resetForm()
  }

  const resetForm = () => {
    setAssetName('')
    setBrand('')
    setModel('')
    setSerialNumber('')
    setPurchaseDate(new Date().toISOString().split('T')[0])
    setPurchasePrice('')
    setLocation('')
    setWarrantyExpirationDate('')
    setNotes('')
    setStatus('Active')
    setCategoryId(null)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Add New Asset"
      size="lg"
    >
      <Stack gap="md">
        <TextInput
          label="Asset Name"
          placeholder="e.g., MacBook Pro 2024"
          value={assetName}
          onChange={(e) => setAssetName(e.currentTarget.value)}
          required
        />

        <Group grow>
          <TextInput
            label="Brand"
            placeholder="e.g., Apple"
            value={brand}
            onChange={(e) => setBrand(e.currentTarget.value)}
          />
          <TextInput
            label="Model"
            placeholder="e.g., A2442"
            value={model}
            onChange={(e) => setModel(e.currentTarget.value)}
          />
        </Group>

        <TextInput
          label="Serial Number"
          placeholder="e.g., C02ABC123DEF"
          value={serialNumber}
          onChange={(e) => setSerialNumber(e.currentTarget.value)}
        />

        <Select
          label="Category"
          placeholder="Select category"
          data={categories.map(c => ({ value: c.categoryId.toString(), label: c.categoryName }))}
          value={categoryId}
          onChange={setCategoryId}
          required
        />

        <Group grow>
          <TextInput
            label="Purchase Date"
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.currentTarget.value)}
            required
          />
          <NumberInput
            label="Purchase Price"
            placeholder="0.00"
            prefix="£"
            decimalScale={2}
            value={purchasePrice}
            onChange={setPurchasePrice}
            min={0}
          />
        </Group>

        <Group grow>
          <TextInput
            label="Location"
            placeholder="e.g., Home Office"
            value={location}
            onChange={(e) => setLocation(e.currentTarget.value)}
          />
          <Select
            label="Status"
            placeholder="Select status"
            data={assetStatuses}
            value={status}
            onChange={setStatus}
            required
          />
        </Group>

        <TextInput
          label="Warranty Expiration Date"
          type="date"
          value={warrantyExpirationDate}
          onChange={(e) => setWarrantyExpirationDate(e.currentTarget.value)}
        />

        <Textarea
          label="Notes"
          placeholder="Add any additional notes..."
          value={notes}
          onChange={(e) => setNotes(e.currentTarget.value)}
          minRows={3}
        />

        <Group justify="flex-end" mt="md">
          <Button variant="light" onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleCreate}
            leftSection={<IconPlus size="1rem" />}
            loading={isCreating}
            disabled={isCreating}
          >
            Create Asset
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
