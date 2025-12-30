import { StyleSheet } from 'react-native';

export function createIndexStyles(colorScheme: 'light' | 'dark') {
  return StyleSheet.create({
    warningBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      padding: 12,
      borderRadius: 10,
      borderWidth: 1,
      marginBottom: 16,
    },
    warningText: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
    },
    moodsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 8,
      marginTop: 12,
    },
    moodButton: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      paddingHorizontal: 4,
      borderRadius: 12,
      borderWidth: 1,
      gap: 6,
      overflow: 'visible',
    },
    moodEmoji: {
      fontSize: 28,
      lineHeight: 32,
    },
    moodLabel: {
      fontSize: 11,
      fontWeight: '500',
      textAlign: 'center',
    },
  });
}
