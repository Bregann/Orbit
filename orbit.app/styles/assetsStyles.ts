import { StyleSheet } from 'react-native';

export const assetsStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 15,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  assetCount: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 12,
    letterSpacing: 0.5,
  },
  emptyState: {
    padding: 32,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyStateText: {
    fontSize: 16,
    opacity: 0.6,
  },
  assetsList: {
    gap: 12,
  },
  assetItem: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  assetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  assetMainInfo: {
    flex: 1,
    marginRight: 12,
  },
  assetName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  assetMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  assetMeta: {
    fontSize: 14,
    opacity: 0.7,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  assetDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    opacity: 0.8,
    flex: 1,
  },
  documentsSection: {
    marginTop: 12,
  },
  documentsDivider: {
    height: 1,
    marginBottom: 12,
  },
  documentsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  documentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  documentButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  notesSection: {
    marginTop: 12,
  },
  notesLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    opacity: 0.7,
  },
  notesText: {
    fontSize: 14,
    opacity: 0.8,
    lineHeight: 20,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoriesList: {
    gap: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  categoryDescription: {
    fontSize: 13,
    opacity: 0.6,
    marginTop: 2,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 32,
    alignItems: 'center',
  },
  categoryCount: {
    fontSize: 14,
    fontWeight: '600',
  },
});
