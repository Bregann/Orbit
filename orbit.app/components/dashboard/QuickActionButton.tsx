import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { createCommonStyles } from '@/styles/commonStyles';
import { TouchableOpacity, useColorScheme } from 'react-native';

interface QuickActionButtonProps {
  icon: string;
  label: string;
  onPress: () => void;
}

export function QuickActionButton({ icon, label, onPress }: QuickActionButtonProps) {
  const colorScheme = useColorScheme();
  const styles = createCommonStyles(colorScheme ?? 'light');
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <TouchableOpacity
      style={[styles.listItem, { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 }]}
      onPress={onPress}
    >
      <IconSymbol name={icon as any} size={28} color={colors.tint} />
      <ThemedText style={{ fontSize: 12, fontWeight: '500', textAlign: 'center' }}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
}
