import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/context/authContext';
import { createCommonStyles } from '@/styles/commonStyles';
import { ScrollView, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const styles = createCommonStyles(colorScheme ?? 'light');
  const { logOut } = useAuth();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      <ThemedView style={{ flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false} style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title">Settings</ThemedText>
          <ThemedText style={styles.subtitle}>Manage your preferences</ThemedText>
        </View>

        {/* App Section */}
        <View style={styles.sectionContainer}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            App
          </ThemedText>

          <TouchableOpacity style={[styles.listItem, { marginTop: 12 }]}>
            <View style={{ flex: 1 }}>
              <ThemedText style={{ fontSize: 14, fontWeight: '500' }}>Version</ThemedText>
              <ThemedText style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>
                1.0.0
              </ThemedText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.listItem, { marginTop: 8 }]}>
            <View style={{ flex: 1 }}>
              <ThemedText style={{ fontSize: 14, fontWeight: '500' }}>About</ThemedText>
              <ThemedText style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>
                Learn more about Orbit
              </ThemedText>
            </View>
          </TouchableOpacity>
        </View>

        {/* Logout Section */}
        <View style={styles.sectionContainer}>
          <TouchableOpacity
            style={[styles.listItem, { marginTop: 12, borderColor: '#FF6B6B', borderWidth: 1 }]}
            onPress={logOut}
          >
            <View style={{ flex: 1, alignItems: 'center' }}>
              <ThemedText style={{ fontSize: 14, fontWeight: '500', color: '#FF6B6B' }}>
                Logout
              </ThemedText>
            </View>
          </TouchableOpacity>
        </View>

        {/* Spacing */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </ThemedView>
    </SafeAreaView>
  );
}
