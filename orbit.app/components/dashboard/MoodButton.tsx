import { ThemedText } from '@/components/themed-text';
import { MoodType } from '@/interfaces/api/mood/MoodType';
import { createIndexStyles } from '@/styles/indexStyles';
import { TouchableOpacity, useColorScheme } from 'react-native';

interface MoodButtonProps {
  mood: MoodType;
  label: string;
  emoji: string;
  colour: string;
  isSelected: boolean;
  onPress: () => void;
  disabled: boolean;
}

export function MoodButton({
  mood,
  label,
  emoji,
  colour,
  isSelected,
  onPress,
  disabled,
}: MoodButtonProps) {
  const colorScheme = useColorScheme();
  const styles = createIndexStyles(colorScheme ?? 'light');

  return (
    <TouchableOpacity
      style={[
        styles.moodButton,
        isSelected && { backgroundColor: colour + '20', borderColor: colour, borderWidth: 2 },
        {
          backgroundColor: isSelected ? colour + '20' : (colorScheme === 'dark' ? '#1E293B' : '#F8FAFC'),
          borderColor: isSelected ? colour : (colorScheme === 'dark' ? '#334155' : '#E2E8F0'),
        }
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <ThemedText style={styles.moodEmoji}>{emoji}</ThemedText>
      <ThemedText style={[styles.moodLabel, isSelected && { color: colour, fontWeight: '700' }]}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
}
