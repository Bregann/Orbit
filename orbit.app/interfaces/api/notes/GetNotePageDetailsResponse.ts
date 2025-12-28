export interface GetNotePageDetailsResponse {
  notePage: NotePageDetails
}

export interface NotePageDetails {
  id: number
  title: string
  content: string
  createdAt: string
  isFavourite: boolean
  folderId: number | null
}
