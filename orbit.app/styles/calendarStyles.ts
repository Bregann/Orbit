import { StyleSheet } from 'react-native';

export const calendarStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  calendarContainer: {
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 24,
    overflow: 'hidden',
  },
  eventsContainer: {
    marginBottom: 24,
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  eventsHeaderTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  eventsCount: {
    fontSize: 14,
    opacity: 0.6,
  },
  eventsList: {
    gap: 12,
  },
  eventItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
  },
  eventColorBar: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
  },
  eventItemContent: {
    flex: 1,
    gap: 8,
  },
  eventItemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  eventItemDetails: {
    gap: 4,
  },
  eventItemTime: {
    fontSize: 14,
    opacity: 0.7,
  },
  eventItemLocation: {
    fontSize: 13,
    opacity: 0.6,
  },
  eventTypeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  eventTypeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    padding: 32,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 15,
    opacity: 0.6,
  },

  // FAB (Floating Action Button) for adding events
  fab: {
    position: 'absolute',
    bottom: 84,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  fabText: {
    color: '#000000',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 30,
  },
});
