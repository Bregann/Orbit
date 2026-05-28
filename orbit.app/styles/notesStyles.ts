import { StyleSheet } from 'react-native';

export const notesStyles = StyleSheet.create({
  // ── Notes List ──
  listContainer: {
    flex: 1,
  },
  listCentered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  listSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    gap: 8,
  },
  listSearchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
  },
  listScroll: {
    flex: 1,
  },
  listPageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 4,
  },
  listPageItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  listPageItemText: {
    flex: 1,
  },
  listPageTitle: {
    fontSize: 14,
  },
  listPageSubtitle: {
    fontSize: 11,
    opacity: 0.6,
    marginTop: 2,
  },
  listFolderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 6,
  },
  listFolderItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  listFolderName: {
    fontSize: 15,
    fontWeight: '600',
  },
  listFolderCount: {
    fontSize: 13,
    opacity: 0.6,
  },

  // ── Note Editor (WebView) ──
  editorContainer: {
    flex: 1,
  },
  editorWebview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  editorToolbarScroll: {
    flexGrow: 0,
    maxHeight: 44,
  },
  editorToolbarContent: {
    alignItems: 'center',
  },
  editorToolbar: {
    height: 44,
    backgroundColor: 'transparent',
  },
  editorToolbarButtonActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderRadius: 4,
  },

  // ── Modals (shared between AddNotePageModal & AddNoteFolderModal) ──
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalSheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    paddingBottom: 40,
    gap: 12,
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 8,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: -4,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelButton: {
    borderWidth: 1,
  },
  modalSubmitButton: {},

  // ── Add Page Modal ──
  pageModalFolderList: {
    borderWidth: 1,
    borderRadius: 8,
    maxHeight: 180,
  },
  pageModalFolderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  pageModalFolderOptionText: {
    flex: 1,
    fontSize: 15,
  },
  pageModalFolderIcon: {
    fontSize: 18,
  },

  // ── Emoji Picker ──
  emojiContainer: {
    marginTop: 4,
  },
  emojiTabs: {
    flexGrow: 0,
    marginBottom: 8,
  },
  emojiTab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 6,
  },
  emojiTabText: {
    fontSize: 13,
    fontWeight: '500',
  },
  emojiScroll: {
    maxHeight: 160,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  emojiButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  emojiText: {
    fontSize: 22,
  },

  // ── Notes Tab Screen ──
  screenContainer: {
    flex: 1,
  },
  screenHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  screenHeaderTitle: {
    fontSize: 28,
  },
  screenHeaderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  screenHeaderButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  // ── Editor Screen ──
  editorScreenContainer: {
    flex: 1,
  },
  editorScreenCentered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  editorScreenHeader: {
    borderBottomWidth: 1,
  },
  editorScreenHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  editorScreenHeaderTitle: {
    flex: 1,
  },
  editorScreenPageTitle: {
    fontSize: 17,
  },
  editorScreenHeaderButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  editorScreenHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editorScreenSaveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  editorScreenSaveButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  editorScreenMetaRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 8,
  },
  editorScreenMetaText: {
    fontSize: 12,
    opacity: 0.6,
  },
  editorScreenBackButton: {
    marginTop: 8,
  },
});
