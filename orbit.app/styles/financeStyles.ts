import { StyleSheet } from 'react-native';

export const financeStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  currencySymbol: {
    fontSize: 14,
    opacity: 0.5,
    fontWeight: '600',
  },
  potCount: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  pendingCount: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  budgetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  budgetPot: {
    width: '48%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  potName: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  potDivider: {
    height: 1,
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
    marginBottom: 12,
  },
  potDetails: {
    gap: 8,
    marginBottom: 12,
  },
  potRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  potLabel: {
    fontSize: 12,
    opacity: 0.8,
  },
  potAmount: {
    fontSize: 13,
    fontWeight: '600',
  },
  progressBarContainer: {
    marginBottom: 8,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  potPercentage: {
    fontSize: 11,
    textAlign: 'center',
    opacity: 0.7,
  },
  transactionsList: {
    gap: 6,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  transactionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  merchantInitial: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3B82F6',
  },
  transactionInfo: {
    flex: 1,
  },
  merchantName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 11,
    opacity: 0.6,
  },
  transactionAmount: {
    alignItems: 'flex-end',
    marginRight: 12,
  },
  amountText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  potTypeText: {
    fontSize: 11,
    opacity: 0.6,
  },
  deleteButton: {
    padding: 4,
  },
  emptyState: {
    padding: 32,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingBottom: 32,
    maxHeight: '70%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(100, 116, 139, 0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(100, 116, 139, 0.2)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    opacity: 0.6,
  },
  potList: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  potOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  potOptionInfo: {
    flex: 1,
  },
  potOptionName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  potOptionBalance: {
    fontSize: 13,
    opacity: 0.6,
  },
});
