import { IconFileTypePdf, IconPhoto, IconFileSpreadsheet, IconFileText } from '@tabler/icons-react'

export const getFileIcon = (type: string, size: string = '1.2rem') => {
  const lowerType = type.toLowerCase()
  if (lowerType.includes('pdf')) return <IconFileTypePdf size={size} />
  if (lowerType.includes('image') || lowerType.includes('jpg') || lowerType.includes('png')) return <IconPhoto size={size} />
  if (lowerType.includes('sheet') || lowerType.includes('xls')) return <IconFileSpreadsheet size={size} />
  return <IconFileText size={size} />
}

export const getFileIconColour = (type: string) => {
  const lowerType = type.toLowerCase()
  if (lowerType.includes('pdf')) return 'red'
  if (lowerType.includes('image') || lowerType.includes('jpg') || lowerType.includes('png')) return 'green'
  if (lowerType.includes('sheet') || lowerType.includes('xls')) return 'teal'
  return 'blue'
}
