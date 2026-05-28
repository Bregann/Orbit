import React, { useState } from 'react';
import { TouchableOpacity, View, ScrollView, Text } from 'react-native';
import { notesStyles } from '@/styles/notesStyles';

interface EmojiPickerProps {
  categories: Record<string, string[]>;
  selectedEmoji: string;
  onSelect: (emoji: string) => void;
  isDark: boolean;
}

export function EmojiPicker({ categories, selectedEmoji, onSelect, isDark }: EmojiPickerProps) {
  const [activeCategory, setActiveCategory] = useState<string>(Object.keys(categories)[0]);
  const [showAll, setShowAll] = useState(false);

  return (
    <View style={notesStyles.emojiContainer}>
      {/* Category tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={notesStyles.emojiTabs}>
        {Object.keys(categories).map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              notesStyles.emojiTab,
              {
                backgroundColor:
                  activeCategory === cat
                    ? isDark
                      ? '#4A4F57'
                      : '#dee2e6'
                    : 'transparent',
              },
            ]}
            onPress={() => {
              setActiveCategory(cat);
              setShowAll(false);
            }}
          >
            <Text style={notesStyles.emojiTabText}>{cat}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[
            notesStyles.emojiTab,
            {
              backgroundColor: showAll ? (isDark ? '#4A4F57' : '#dee2e6') : 'transparent',
            },
          ]}
          onPress={() => setShowAll(!showAll)}
        >
          <Text style={notesStyles.emojiTabText}>All</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Emoji grid */}
      <ScrollView style={notesStyles.emojiScroll} showsVerticalScrollIndicator={false}>
        <View style={notesStyles.emojiGrid}>
          {(showAll
            ? Object.values(categories).flat()
            : categories[activeCategory] ?? []
          ).map((emoji) => (
            <TouchableOpacity
              key={emoji}
              style={[
                notesStyles.emojiButton,
                {
                  backgroundColor:
                    selectedEmoji === emoji
                      ? isDark
                        ? '#4A4F57'
                        : '#dee2e6'
                      : 'transparent',
                },
              ]}
              onPress={() => onSelect(emoji)}
            >
              <Text style={notesStyles.emojiText}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}


