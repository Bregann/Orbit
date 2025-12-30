import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/authContext';
import { loginStyles as styles } from '@/styles/loginStyles';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { attemptLogin } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const success = await attemptLogin(email, password);
      if (!success) {
        Alert.alert('Login Failed', 'Invalid email or password');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred during login');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Orbit
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Financial Management
        </ThemedText>

        <View style={styles.form}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f0f0f0',
                color: colorScheme === 'dark' ? '#fff' : '#000',
                borderColor: colors.tint,
              },
            ]}
            placeholder="Email"
            placeholderTextColor={colorScheme === 'dark' ? '#999' : '#666'}
            value={email}
            onChangeText={setEmail}
            editable={!loading}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <View style={styles.passwordContainer}>
            <TextInput
              style={[
                styles.input,
                styles.passwordInput,
                {
                  backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f0f0f0',
                  color: colorScheme === 'dark' ? '#fff' : '#000',
                  borderColor: colors.tint,
                },
              ]}
              placeholder="Password"
              placeholderTextColor={colorScheme === 'dark' ? '#999' : '#666'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!loading}
              autoCapitalize="none"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity
              style={styles.eyeIcon}
              onPress={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              <Ionicons
                name={showPassword ? 'eye' : 'eye-off'}
                size={24}
                color={colors.tint}
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colorScheme === 'dark' ? '#0a7ea4' : colors.tint }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );
}


