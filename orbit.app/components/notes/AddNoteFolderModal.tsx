import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { notesStyles } from '@/styles/notesStyles';
import { useState } from 'react';
import {
  Modal,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { EmojiPicker } from './EmojiPicker';

interface AddNoteFolderModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (folderName: string, folderIcon: string) => void;
}

const EMOJI_CATEGORIES: Record<string, string[]> = {
  Faces: ['😀','😂','😍','🥰','😎','🤩','😇','🤔','😴','🥳','😤','😢','😡','🥶','🤯'],
  Gestures: ['👍','👎','👏','🙌','🤝','💪','✌️','🤞','👋','🙏'],
  Objects: ['📝','📌','📎','✂️','📏','📐','💡','🔑','🎯','🏠','🚗','✈️','🚀','🛸'],
  Symbols: ['❤️','💛','💚','💙','💜','🧡','💖','⭐','🔥','💯','✅','❌','⚠️','💡'],
  Nature: ['🌸','🌺','🌻','🌹','🍀','🌲','🌊','☀️','🌙','⚡','🌈','❄️','🍎','🍕'],
  Activity: ['⚽','🏀','🎾','🏈','🎮','🎨','🎵','🎸','📚','💻','📱','⌚','🎉','🏆'],
};

export function AddNoteFolderModal({ visible, onClose, onSubmit }: AddNoteFolderModalProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

  const [folderName, setFolderName] = useState('');
  const [folderIcon, setFolderIcon] = useState('📁');

  const handleSubmit = () => {
    const trimmed = folderName.trim();
    if (!trimmed) return;
    onSubmit(trimmed, folderIcon);
    setFolderName('');
    setFolderIcon('📁');
  };

  const handleClose = () => {
    setFolderName('');
    setFolderIcon('📁');
    onClose();
  };

  const Wrapper = Platform.OS === 'ios' ? KeyboardAvoidingView : View;
  const wrapperProps = Platform.OS === 'ios' ? { behavior: 'padding' as const } : {};

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Wrapper style={notesStyles.modalOverlay} {...wrapperProps}>
        <View style={[notesStyles.modalSheet, { backgroundColor: isDark ? '#1D2026' : '#ffffff' }]}>
          <ThemedText type="title" style={notesStyles.modalTitle}>
            New Folder
          </ThemedText>

          <ThemedText style={notesStyles.modalLabel}>Folder Name</ThemedText>
          <TextInput
            style={[
              notesStyles.modalInput,
              {
                color: colors.text,
                backgroundColor: isDark ? '#23272E' : '#f3f4f6',
                borderColor: isDark ? '#495057' : '#dee2e6',
              },
            ]}
            placeholder="Enter folder name..."
            placeholderTextColor={colors.icon}
            value={folderName}
            onChangeText={setFolderName}
          />

          <ThemedText style={notesStyles.modalLabel}>Icon</ThemedText>
          <EmojiPicker
            categories={EMOJI_CATEGORIES}
            selectedEmoji={folderIcon}
            onSelect={setFolderIcon}
            isDark={isDark}
          />

          <View style={notesStyles.modalButtons}>
            <TouchableOpacity
              style={[notesStyles.modalButton, notesStyles.modalCancelButton, { borderColor: isDark ? '#495057' : '#dee2e6' }]}
              onPress={handleClose}
            >
              <ThemedText>Cancel</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                notesStyles.modalButton,
                notesStyles.modalSubmitButton,
                { backgroundColor: '#0a7ea4' },
                !folderName.trim() && { opacity: 0.5 },
              ]}
              onPress={handleSubmit}
              disabled={!folderName.trim()}
            >
              <ThemedText style={{ color: '#ffffff' }}>Create</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Wrapper>
    </Modal>
  );
}


