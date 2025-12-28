export interface GetNotePagesAndFoldersResponse {
  notePages: NotePage[]
  noteFolders: NoteFolder[]
}

export interface NotePage {
  id: number
  title: string
  isFavourite: boolean
  folderId: number | null
}

export interface NoteFolder {
  id: number
  folderName: string
  folderIcon: string
}
