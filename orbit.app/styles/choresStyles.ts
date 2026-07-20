import { StyleSheet } from 'react-native'

export const choresStyles = StyleSheet.create({
  screenContainer: {
    flex: 1,
  },
  screenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  screenHeaderTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  screenHeaderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  screenHeaderButton: {
    padding: 10,
    borderRadius: 10,
  },
  screenContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  choreCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
  },
  choreCardCompleted: {
    opacity: 0.6,
  },
  choreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  choreName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  choreNameCompleted: {
    textDecorationLine: 'line-through',
  },
  choreDescription: {
    fontSize: 13,
    marginBottom: 10,
  },
  choreMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  choreMetaLeft: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  choreMetaRight: {
    flexDirection: 'row',
    gap: 4,
  },
  frequencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  frequencyText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  dueDateText: {
    fontSize: 12,
  },
  dueDateOverdue: {
    fontWeight: '700',
  },
  actionButton: {
    padding: 6,
    borderRadius: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    marginBottom: 16,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  modalInputMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalFrequencyRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  modalFrequencyOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  modalFrequencyOptionSelected: {
    borderWidth: 2,
  },
  modalFrequencyOptionText: {
    fontSize: 13,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 24,
  },
  modalButtonCancel: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modalButtonCancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalButtonSubmit: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modalButtonSubmitText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 8,
  },
})
