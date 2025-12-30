'use client'

import FitbitIntegration from '@/components/fitbit/FitbitIntegration'
import {
  Container,
  Title,
  Text,
  Stack,
  Tabs
} from '@mantine/core'
import {
  IconSettings,
  IconPlugConnected
} from '@tabler/icons-react'

export default function SettingsPage() {
  return (
    <Container size="xl" py="xl">
      <Stack gap="lg">
        <div>
          <Title order={1}>Settings</Title>
          <Text c="dimmed" size="sm">
            Manage your account settings and integrations
          </Text>
        </div>

        <Tabs defaultValue="integrations">
          <Tabs.List>
            <Tabs.Tab value="integrations" leftSection={<IconPlugConnected size={16} />}>
              Integrations
            </Tabs.Tab>
            <Tabs.Tab value="account" leftSection={<IconSettings size={16} />}>
              Account
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="integrations" pt="md">
            <Stack gap="lg">
              <FitbitIntegration />
            </Stack>
          </Tabs.Panel>

          <Tabs.Panel value="account" pt="md">
            <Text c="dimmed">Account settings coming soon...</Text>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  )
}
