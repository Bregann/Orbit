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
import { IconUser, IconLock, IconExclamationCircle } from '@tabler/icons-react'
import { useAuth } from '@/context/authContext'
import notificationHelper from '@/helpers/notificationHelper'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const auth = useAuth()

  const handleLogin = async () => {
    setLoading(true)
    const res = await auth.login(email, password)

    if (!res) {
      setLoading(false)
      notificationHelper.showErrorNotification('Login failed', 'Please check your email and password.', 3000, <IconExclamationCircle size={16} />)
      return
    }
    setLoading(false)
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && email !== '' && password !== '' && !loading) {
      handleLogin()
    }
  }

  return (
    <Container size={420} my={40}>
      <Center>
        <Box w="100%">
          <Title
            ta="center"
            fw={900}
            mb="md"
          >
            Orbit
          </Title>

          <Text c="dimmed" size="sm" ta="center" mt={5} mb="xl">
            Sign in to your account
          </Text>

          <Paper withBorder shadow="md" p={30} mt={30} radius="md">
            <Stack gap="md">
              <TextInput
                label="Email"
                placeholder="your@email.com"
                value={email}
                onChange={(event) => setEmail(event.currentTarget.value)}
                onKeyDown={handleKeyPress}
                leftSection={<IconUser size={16} />}
                required
              />

              <PasswordInput
                label="Password"
                placeholder="Your password"
                value={password}
                onChange={(event) => setPassword(event.currentTarget.value)}
                onKeyDown={handleKeyPress}
                leftSection={<IconLock size={16} />}
                required
              />

              <Button
                fullWidth
                mt="xl"
                onClick={handleLogin}
                loading={loading}
                disabled={email === '' || password === ''}
              >
                Sign in
              </Button>

              <Text ta="center" mt="md" size="sm" c="dimmed">
                Don&apos;t have an account?{' '}
                <Anchor size="sm" component="button">
                  Create account
                </Anchor>
              </Text>
            </Stack>
          </Paper>
        </Box>
      </Center>
    </Container>
  )
}
