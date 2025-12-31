import FitbitSuccessComponent from '@/components/pages/FitbitSuccessComponent'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Container, Center, Stack, Loader, Text, Title } from '@mantine/core'

export const metadata: Metadata = {
  title: 'Fitbit Connection'
}

export default function FitbitCallbackPage() {
  return (
    <Suspense fallback={
      <Container size="sm" py="xl">
        <Center style={{ minHeight: '50vh' }}>
          <Stack align="center" gap="lg">
            <Loader size="xl" />
            <Title order={3}>Loading...</Title>
            <Text c="dimmed">Please wait.</Text>
          </Stack>
        </Center>
      </Container>
    }>
      <FitbitSuccessComponent />
    </Suspense>
  )
}
