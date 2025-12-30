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
});
