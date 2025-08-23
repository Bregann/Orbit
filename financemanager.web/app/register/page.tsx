'use client'

import { useState } from 'react'
import {
  Paper,
  TextInput,
  PasswordInput,
  Button,
  Title,
  Text,
  Container,
  Center,
  Box,
  Stack,
  Anchor,
} from '@mantine/core'
import { IconLock, IconMail } from '@tabler/icons-react'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  // Password validation function
  const validatePassword = (password: string) => {
    const minLength = 8
    const hasUppercase = /[A-Z]/.test(password)
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    return {
      minLength: password.length >= minLength,
      hasUppercase,
      hasSpecialChar,
      isValid: password.length >= minLength && hasUppercase && hasSpecialChar
    }
  }

  const passwordValidation = validatePassword(password)
  const passwordsMatch = password !== '' && confirmPassword !== '' && password === confirmPassword

  const handleRegister = async () => {
    setLoading(true)

    // Placeholder registration functionality
    try {
      console.log('Registration attempt:', {
        email,
        password,
        confirmPassword
      })

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      // Placeholder success/error handling
      console.log('Registration successful (placeholder)')

    } catch (error) {
      console.error('Registration failed (placeholder):', error)
    } finally {
      setLoading(false)
    }
  }

  const isFormValid = email !== '' && passwordValidation.isValid && passwordsMatch

  return (
    <Container size={420} my={40}>
      <Center>
        <Box w="100%">
          <Title
            ta="center"
            fw={900}
            mb="md"
          >
            Finance Manager
          </Title>

          <Text c="dimmed" size="sm" ta="center" mt={5} mb="xl">
            Create your account to start managing your finances
          </Text>

          <Paper withBorder shadow="md" p={30} mt={30} radius="md">
            <Stack gap="md">
              <TextInput
                label="Email"
                placeholder="your@email.com"
                value={email}
                onChange={(event) => setEmail(event.currentTarget.value)}
                leftSection={<IconMail size={16} />}
                type="email"
                required
              />

              <PasswordInput
                label="Password"
                placeholder="Your password"
                value={password}
                onChange={(event) => setPassword(event.currentTarget.value)}
                leftSection={<IconLock size={16} />}
                description="At least 8 characters, 1 uppercase letter, and 1 special character"
                error={password !== '' && !passwordValidation.isValid ?
                  `Password must contain: ${!passwordValidation.minLength ? '8+ characters ' : ''}${!passwordValidation.hasUppercase ? 'uppercase letter ' : ''}${!passwordValidation.hasSpecialChar ? 'special character' : ''}`.trim()
                  : undefined}
                required
              />

              <PasswordInput
                label="Confirm Password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.currentTarget.value)}
                leftSection={<IconLock size={16} />}
                error={confirmPassword !== '' && !passwordsMatch ? 'Passwords do not match' : undefined}
                required
              />

              <Button
                fullWidth
                mt="xl"
                onClick={handleRegister}
                loading={loading}
                disabled={!isFormValid}
              >
                Create Account
              </Button>

              <Text ta="center" mt="md" size="sm" c="dimmed">
                Already have an account?{' '}
                <Anchor size="sm" component="button">
                  Sign in
                </Anchor>
              </Text>
            </Stack>
          </Paper>
        </Box>
      </Center>
    </Container>
  )
}
