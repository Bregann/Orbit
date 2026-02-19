'use client'

import { Modal, Stack, Group, TextInput, Button, Select, NumberInput, Textarea } from '@mantine/core'
import { useState, useEffect } from 'react'
import { IconDeviceFloppy, IconX } from '@tabler/icons-react'
import notificationHelper from '@/helpers/notificationHelper'
import type { AssetCategoryItem } from '@/interfaces/api/assets/GetAllAssetCategoriesDto'
import type { AssetItem } from '@/interfaces/api/assets/GetAllAssetsDto'
import type { UpdateAssetRequest } from '@/interfaces/api/assets/UpdateAssetRequest'
import { assetStatuses } from '@/helpers/assetOptions'

interface EditAssetModalProps {
  opened: boolean
  onClose: () => void
  asset: AssetItem
  categories: AssetCategoryItem[]
  onUpdate: (_request: UpdateAssetRequest) => void
  isUpdating: boolean
}

export default function EditAssetModal({
  opened,
  onClose,
  asset,
  categories,
  onUpdate,
  isUpdating
}: EditAssetModalProps) {
  const [assetName, setAssetName] = useState(asset.assetName)
  const [brand, setBrand] = useState(asset.brand || '')
  const [model, setModel] = useState(asset.model || '')
  const [serialNumber, setSerialNumber] = useState(asset.serialNumber || '')
  const [purchaseDate, setPurchaseDate] = useState<string>(asset.purchaseDate)
  const [purchasePrice, setPurchasePrice] = useState<number | string>(asset.purchasePrice || '')
  const [location, setLocation] = useState(asset.location || '')
  const [warrantyExpirationDate, setWarrantyExpirationDate] = useState<string>(asset.warrantyExpirationDate || '')
  const [notes, setNotes] = useState(asset.notes || '')
  const [status, setStatus] = useState<string | null>(asset.status)
  const [categoryId, setCategoryId] = useState<string | null>(asset.categoryId.toString())

  useEffect(() => {
    setAssetName(asset.assetName)
    setBrand(asset.brand || '')
    setModel(asset.model || '')
    setSerialNumber(asset.serialNumber || '')
    setAssetName(asset.assetName)
    setBrand(asset.brand || '')
    setModel(asset.model || '')
    setSerialNumber(asset.serialNumber || '')
    setPurchaseDate(asset.purchaseDate)
    setPurchasePrice(asset.purchasePrice || '')
    setLocation(asset.location || '')
    setWarrantyExpirationDate(asset.warrantyExpirationDate || '')
    setNotes(asset.notes || '')
    setStatus(asset.status)
    setCategoryId(asset.categoryId.toString())
  }, [asset])

  const handleUpdate = () => {
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

    const request: UpdateAssetRequest = {
      assetId: asset.assetId,
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

    onUpdate(request)
  }

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Edit Asset"
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
          <Button variant="light" onClick={onClose}>Cancel</Button>
          <Button
            onClick={handleUpdate}
            leftSection={<IconDeviceFloppy size="1rem" />}
            loading={isUpdating}
            disabled={isUpdating}
          >
            Save Changes
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}
