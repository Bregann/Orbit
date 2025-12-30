import { StyleSheet } from 'react-native';

export const documentsStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    padding: 0,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
  },
  filterTabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  documentCount: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 12,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  documentsList: {
    gap: 6,
  },
  documentItem: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  documentIcon: {
    marginRight: 8,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  documentDate: {
    fontSize: 11,
    opacity: 0.6,
  },
  downloadButton: {
    padding: 8,
    marginLeft: 8,
  },

  emptyState: {
    padding: 32,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    opacity: 0.6,
  },
  recentList: {
    gap: 8,
  },
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  recentInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentName: {
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  recentDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  categoriesList: {
    gap: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryCount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
