import { StyleSheet } from 'react-native';

// Mantine color palette
export const MantineColors = {
  dark: [
    '#F3F4F6',
    '#DFE2E6',
    '#C3C7CD',
    '#9BA1A9',
    '#6E757E',
    '#4A4F57',
    '#2F333B',
    '#23272E',
    '#1D2026',
    '#15171C',
  ],
};

export const createCommonStyles = (colorScheme: 'light' | 'dark') => {
  const isDark = colorScheme === 'dark';
  const cardLight = isDark ? MantineColors.dark[7] : '#f9fafb';
  const cardAlt = isDark ? MantineColors.dark[6] : '#f3f4f6';

  return StyleSheet.create({
    // Card backgrounds with better contrast
    card: {
      backgroundColor: cardLight,
      borderRadius: 8,
      padding: 12,
    },
    statCard: {
      flex: 1,
      backgroundColor: cardLight,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderLeftWidth: 4,
    },
    listItem: {
      backgroundColor: cardAlt,
      borderRadius: 6,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    sectionContainer: {
      marginBottom: 24,
    },
    containerPadding: {
      paddingHorizontal: 16,
      paddingTop: 24,
    },

    // Text styles
    header: {
      marginBottom: 24,
    },
    subtitle: {
      marginTop: 4,
      opacity: 0.7,
    },
    sectionTitle: {
      fontSize: 16,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
    },

    // Stat card specifics
    statLabel: {
      fontSize: 12,
      opacity: 0.7,
      marginBottom: 4,
    },
    statValue: {
      fontSize: 18,
      marginVertical: 4,
    },
    statPeriod: {
      fontSize: 11,
      opacity: 0.6,
    },

    // Grid layouts
    statsGrid: {
      flexDirection: 'row',
      gap: 12,
      flex: 1,
    },
    itemsList: {
      gap: 8,
    },

    // Task items
    taskItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    priorityDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 10,
    },
    taskContent: {
      flex: 1,
    },
    taskTitle: {
      fontSize: 13,
    },
    taskDate: {
      marginLeft: 8,
    },
    taskDateText: {
      fontSize: 12,
      fontWeight: '500',
    },

    // Event items
    eventItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    eventDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 10,
      marginTop: 4,
    },
    eventContent: {
      flex: 1,
    },
    eventTitle: {
      fontSize: 13,
      fontWeight: '500',
      marginBottom: 2,
    },
    eventDateTime: {
      fontSize: 11,
      opacity: 0.6,
    },

    // Buttons
    viewAllLink: {
      fontSize: 12,
      fontWeight: '500',
    },
  });
};
