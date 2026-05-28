import { Stack } from 'expo-router';
import React from 'react';

export default function NotesStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
