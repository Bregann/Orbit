import { StyleSheet } from 'react-native';

export const shoppingStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  quickAddContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  quickAddInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quickAddInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  addButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
  },
  quickAddItems: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quickAddItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  quickAddItemText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  showCheckedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  showCheckedText: {
    fontSize: 13,
  },
  itemCount: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  itemsList: {
    padding: 12,
    gap: 8,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  itemCheckbox: {
    padding: 4,
  },
  itemName: {
    flex: 1,
    fontSize: 15,
  },
  itemNameChecked: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  deleteButton: {
    padding: 4,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    opacity: 0.6,
    textAlign: 'center',
  },
});
