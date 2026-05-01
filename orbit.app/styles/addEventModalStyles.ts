import { Platform, StyleSheet } from 'react-native';

/**
 * Creates all static styles for the AddEventModal.
 * Returns a StyleSheet object with namespaced style keys.
 */
export const createAddEventModalStyles = (isDark: boolean, tintColor: string) => {
  return StyleSheet.create({
    // ── Layout ──
    safeArea: {
      flex: 1,
      backgroundColor: isDark ? '#151718' : '#fff',
    },
    keyboardAvoid: {
      flex: 1,
    },

    // ── Header ──
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#1E293B' : '#E2E8F0',
      backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
    },
    headerButtonText: {
      fontSize: 16,
      color: tintColor,
    },
    headerSaveText: {
      fontSize: 16,
      fontWeight: '700',
      color: tintColor,
    },
    headerTitle: {
      fontSize: 18,
    },

    // ── Scroll content ──
    scrollContent: {
      flex: 1,
      paddingHorizontal: 16,
    },
    scrollContentContainer: {
      paddingBottom: 40,
    },
    loadingContainer: {
      padding: 40,
      alignItems: 'center',
    },

    // ── Form fields ──
    fieldBlock: {
      marginBottom: 16,
    },
    fieldBlockFirst: {
      marginTop: 20,
      marginBottom: 16,
    },

    // ── Input ──
    input: {
      backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
      color: isDark ? '#E2E8F0' : '#1E293B',
      borderColor: isDark ? '#334155' : '#CBD5E1',
      borderRadius: 10,
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: Platform.OS === 'ios' ? 14 : 10,
      fontSize: 15,
    },
    inputMultiline: {
      minHeight: 80,
      textAlignVertical: 'top',
    },
    inputSmall: {
      width: 70,
      textAlign: 'center',
    },
    inputWide: {
      width: 80,
      textAlign: 'center',
    },

    // ── Label ──
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? '#CBD5E1' : '#475569',
      marginBottom: 6,
    },

    // ── Picker button ──
    pickerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: isDark ? '#1E293B' : '#F1F5F9',
      borderColor: isDark ? '#334155' : '#CBD5E1',
      borderRadius: 10,
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    },
    pickerButtonIcon: {
      color: tintColor,
    },

    // ── All-day row ──
    allDayRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },

    // ── Event type chips ──
    typeChipsScroll: {
      flexDirection: 'row',
    },
    typeChipsContent: {
      gap: 12,
      paddingRight: 16,
    },
    typeChipRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    typeChipDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    typeChipText: {
      fontSize: 13,
      fontWeight: '600',
    },

    // ── Recurrence toggle row ──
    recurrenceToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 14,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: isDark ? '#334155' : '#E2E8F0',
    },
    recurrenceToggleIconRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    recurrenceToggleLabel: {
      fontSize: 15,
      fontWeight: '600',
    },

    // ── Recurrence options ──
    recurrenceOptions: {
      marginBottom: 24,
    },
    recurrenceOptionBlock: {
      marginBottom: 14,
    },
    frequencyRow: {
      flexDirection: 'row',
      gap: 8,
    },
    intervalRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    dayChipsRow: {
      flexDirection: 'row',
      gap: 8,
      flexWrap: 'wrap',
    },

    // ── End condition ──
    endConditionRow: {
      flexDirection: 'row',
      gap: 16,
      marginBottom: 12,
    },
    radioOption: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    radioOuter: {
      width: 18,
      height: 18,
      borderRadius: 9,
      borderWidth: 2,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    radioLabel: {
      fontSize: 14,
    },

    // ── Save button ──
    saveButton: {
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      marginTop: 8,
    },
    saveButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '700',
    },
  });
};

/**
 * Dynamic style for an event-type chip (selected vs unselected).
 * Must be called per-chip because colours vary.
 */
export const getTypeChipStyle = (
  selected: boolean,
  isDark: boolean,
  tintColor: string,
  typeHexColour?: string
) => {
  const colour = typeHexColour ?? tintColor;
  return {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: selected ? colour + '30' : isDark ? '#334155' : '#E2E8F0',
    borderWidth: 1,
    borderColor: selected ? colour : 'transparent',
  } as const;
};

/**
 * Dynamic style for a recurrence-frequency chip.
 */
export const getFreqChipStyle = (
  selected: boolean,
  isDark: boolean,
  tintColor: string
) => {
  return {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: selected ? tintColor : isDark ? '#334155' : '#E2E8F0',
  } as const;
};

/**
 * Dynamic style for a day-of-week circle chip.
 */
export const getDayChipStyle = (
  selected: boolean,
  isDark: boolean,
  tintColor: string
) => {
  return {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: selected ? tintColor : isDark ? '#334155' : '#E2E8F0',
  };
};
