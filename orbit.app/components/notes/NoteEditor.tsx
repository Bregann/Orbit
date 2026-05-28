import React, { useRef, useEffect } from 'react';
import { useColorScheme, View } from 'react-native';
import {
  RichEditor,
  RichToolbar,
  actions,
} from 'react-native-pell-rich-editor';
import { notesStyles } from '@/styles/notesStyles';

interface NoteEditorProps {
  content: string;
  isEditing: boolean;
  onContentChange: (html: string) => void;
  onReady: () => void;
}

export default function NoteEditor({ content, isEditing, onContentChange, onReady }: NoteEditorProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const editorRef = useRef<RichEditor>(null);
  const initialisedRef = useRef(false);

  useEffect(() => {
    // Set initial content once the editor is mounted
    if (editorRef.current && !initialisedRef.current) {
      initialisedRef.current = true;
      onReady();
    }
  }, [onReady]);

  const handleChange = (html: string) => {
    onContentChange(html);
  };

  const insertBlockquote = () => {
    editorRef.current?.insertHTML('<blockquote><br/></blockquote>');
  };

  const insertTable3x3 = () => {
    const tableHtml = '<table style="border-collapse:collapse;width:100%"><tr><th style="border:1px solid #ccc;padding:4px"></th><th style="border:1px solid #ccc;padding:4px"></th><th style="border:1px solid #ccc;padding:4px"></th></tr><tr><td style="border:1px solid #ccc;padding:4px"></td><td style="border:1px solid #ccc;padding:4px"></td><td style="border:1px solid #ccc;padding:4px"></td></tr><tr><td style="border:1px solid #ccc;padding:4px"></td><td style="border:1px solid #ccc;padding:4px"></td><td style="border:1px solid #ccc;padding:4px"></td></tr></table>';
    editorRef.current?.insertHTML(tableHtml);
  };

  const insertStrikeThrough = () => {
    editorRef.current?.insertHTML('<s><br/></s>');
  };

  const darkTheme = isDark ? {
    backgroundColor: '#151718',
    color: '#ECEDEE',
    placeholderColor: '#9BA1A6',
    contentCSSText: 'color: #ECEDEE;',
  } : {
    backgroundColor: '#ffffff',
    color: '#11181C',
    placeholderColor: '#adb5bd',
    contentCSSText: 'color: #11181C;',
  };

  return (
    <View style={notesStyles.editorContainer}>
      {isEditing && (
        <RichToolbar
          editor={editorRef}
          style={notesStyles.editorToolbar}
          iconTint={isDark ? '#9BA1A6' : '#687076'}
          selectedIconTint="#3b82f6"
          selectedButtonStyle={notesStyles.editorToolbarButtonActive}
          actions={[
            actions.setBold,
            actions.setItalic,
            actions.setUnderline,
            { iconName: 'md-text', title: 'Strikethrough', onPress: insertStrikeThrough },
            actions.heading1,
            actions.heading2,
            actions.heading3,
            actions.insertBulletsList,
            actions.insertOrderedList,
            { iconName: 'md-quote', title: 'Blockquote', onPress: insertBlockquote },
            { iconName: 'md-grid', title: 'Insert Table', onPress: insertTable3x3 },
            actions.setHR,
            actions.undo,
            actions.redo,
          ]}
        />
      )}
      <RichEditor
        ref={editorRef}
        initialContentHTML={content}
        onChange={handleChange}
        editorStyle={darkTheme}
        placeholder="Start writing..."
        style={notesStyles.editorWebview}
        scrollEnabled={true}
        showsVerticalScrollIndicator={false}
        disabled={!isEditing}
      />
    </View>
  );
}