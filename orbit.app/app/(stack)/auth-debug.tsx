import { authApiClient } from '@/helpers/apiClient'
import {
  AuthEvent,
  clearAuthEvents,
  decodeJwt,
  fingerprint,
  getAuthEvents,
  getAuthLogFile,
  logAuthEvent,
} from '@/helpers/authDebugLog'
import { keychainHelper } from '@/helpers/keychainHelper'
import * as Sharing from 'expo-sharing'
import { Stack } from 'expo-router'
import { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native'

/**
 * Auth diagnostics for internal builds.
 *
 * Shows the current token state and a persistent event log that survives app
 * restarts, so a logout that happens hours into a background session can be
 * reconstructed after the fact.
 */

type TokenState = {
  accessToken: string
  refreshToken: string
  expiresAt: string
  expired: boolean | 'unknown'
  secondsRemaining: number | null
}

const EVENT_COLOURS: Record<string, string> = {
  logout_forced: '#ff453a',
  refresh_rejected: '#ff453a',
  retry_exhausted: '#ff453a',
  refresh_network_error: '#ff9f0a',
  refresh_http_error: '#ff9f0a',
  request_401: '#ff9f0a',
  refresh_success: '#32d74b',
  login_success: '#32d74b',
}

export default function AuthDebugScreen() {
  const isDark = useColorScheme() === 'dark'
  const [events, setEvents] = useState<AuthEvent[]>([])
  const [tokens, setTokens] = useState<TokenState | null>(null)
  const [busy, setBusy] = useState(false)

  const refreshView = useCallback(async () => {
    const accessToken = await keychainHelper.getAccessToken()
    const refreshToken = await keychainHelper.getRefreshToken()
    const exp = accessToken === null ? undefined : decodeJwt(accessToken)?.exp

    setTokens({
      accessToken: fingerprint(accessToken),
      refreshToken: fingerprint(refreshToken),
      expiresAt: exp === undefined ? 'unknown' : new Date(exp * 1000).toLocaleString(),
      expired: exp === undefined ? 'unknown' : exp * 1000 < Date.now(),
      secondsRemaining: exp === undefined ? null : Math.round((exp * 1000 - Date.now()) / 1000),
    })

    setEvents(getAuthEvents().slice().reverse())
  }, [])

  // Polls so the countdown stays live and new events appear while the screen
  // is open. The first tick fires immediately rather than after a second.
  useEffect(() => {
    let cancelled = false

    const tick = (): void => {
      if (!cancelled) {
        refreshView()
      }
    }

    const timeout = setTimeout(tick, 0)
    const interval = setInterval(tick, 1000)

    return () => {
      cancelled = true
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [refreshView])

  // Fires a real authenticated call so you can watch the whole refresh path
  // end to end without waiting an hour for natural expiry.
  const testRequest = async (): Promise<void> => {
    setBusy(true)
    try {
      const response = await authApiClient.get('/api/Dashboard/GetDashboardOverviewData')
      Alert.alert('Request finished', `Status ${response.status}`)
    } catch (error) {
      Alert.alert('Request failed', error instanceof Error ? error.message : String(error))
    } finally {
      setBusy(false)
      refreshView()
    }
  }

  // Corrupts only the ACCESS token, leaving the refresh token intact. The next
  // call must 401, refresh, and retry successfully - this is the exact path
  // that is failing in the wild, reproducible on demand.
  const expireAccessToken = async (): Promise<void> => {
    await keychainHelper.setAccessToken('invalid.access.token')
    logAuthEvent('token_read', { note: 'access token deliberately invalidated by debug screen' })
    Alert.alert('Access token invalidated', 'Now use "Send test request" to exercise the refresh path.')
    refreshView()
  }

  // Corrupts the REFRESH token too, so the refresh must be rejected by the
  // server and the app should log out cleanly - exactly once, with a clear reason.
  const expireBothTokens = async (): Promise<void> => {
    await keychainHelper.setAccessToken('invalid.access.token')
    await keychainHelper.setRefreshToken('invalid-refresh-token')
    logAuthEvent('token_read', { note: 'both tokens deliberately invalidated by debug screen' })
    Alert.alert('Both tokens invalidated', 'A test request should now log you out with reason "server rejected".')
    refreshView()
  }

  const exportLog = async (): Promise<void> => {
    const file = getAuthLogFile()

    if (!file.exists) {
      Alert.alert('Nothing to export', 'No auth events have been recorded yet.')
      return
    }

    if (!(await Sharing.isAvailableAsync())) {
      Alert.alert('Sharing unavailable', 'This device cannot share files.')
      return
    }

    await Sharing.shareAsync(file.uri, { mimeType: 'application/json' })
  }

  const styles = createStyles(isDark)

  return (
    <>
      <Stack.Screen options={{ title: 'Auth Debug', headerShown: true }} />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <Text style={styles.heading}>Current tokens</Text>
        {tokens === null ? (
          <ActivityIndicator />
        ) : (
          <View style={styles.card}>
            <Row label="Access" value={tokens.accessToken} isDark={isDark} />
            <Row label="Refresh" value={tokens.refreshToken} isDark={isDark} />
            <Row label="Expires" value={tokens.expiresAt} isDark={isDark} />
            <Row
              label="Status"
              value={
                tokens.expired === 'unknown'
                  ? 'unknown'
                  : tokens.expired
                    ? 'EXPIRED'
                    : `valid (${tokens.secondsRemaining}s left)`
              }
              isDark={isDark}
              highlight={tokens.expired === true}
            />
          </View>
        )}

        <Text style={styles.heading}>Actions</Text>
        <View style={styles.buttonRow}>
          <Button label="Send test request" onPress={testRequest} disabled={busy} isDark={isDark} />
          <Button label="Invalidate access token" onPress={expireAccessToken} isDark={isDark} />
          <Button label="Invalidate both tokens" onPress={expireBothTokens} isDark={isDark} destructive />
          <Button label="Export log" onPress={exportLog} isDark={isDark} />
          <Button
            label="Clear log"
            onPress={() => {
              clearAuthEvents()
              refreshView()
            }}
            isDark={isDark}
            destructive
          />
        </View>

        <Text style={styles.heading}>Event log ({events.length}, newest first)</Text>
        {events.length === 0 ? (
          <Text style={styles.empty}>No events recorded yet.</Text>
        ) : (
          events.map((event, index) => (
            <View key={`${event.ts}-${index}`} style={styles.event}>
              <Text style={[styles.eventType, { color: EVENT_COLOURS[event.type] ?? (isDark ? '#8e8e93' : '#3c3c43') }]}>
                {event.type}
              </Text>
              <Text style={styles.eventTime}>{new Date(event.ts).toLocaleString()}</Text>
              {event.detail !== undefined && (
                <Text style={styles.eventDetail}>{JSON.stringify(event.detail, null, 2)}</Text>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </>
  )
}

const Row = ({
  label,
  value,
  isDark,
  highlight,
}: {
  label: string
  value: string
  isDark: boolean
  highlight?: boolean
}) => {
  const styles = createStyles(isDark)
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={[styles.rowValue, highlight === true && styles.rowValueAlert]} selectable>
        {value}
      </Text>
    </View>
  )
}

const Button = ({
  label,
  onPress,
  isDark,
  disabled,
  destructive,
}: {
  label: string
  onPress: () => void
  isDark: boolean
  disabled?: boolean
  destructive?: boolean
}) => {
  const styles = createStyles(isDark)
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        destructive === true && styles.buttonDestructive,
        (pressed || disabled === true) && styles.buttonPressed,
      ]}
    >
      <Text style={[styles.buttonText, destructive === true && styles.buttonTextDestructive]}>{label}</Text>
    </Pressable>
  )
}

const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: isDark ? '#000' : '#f2f2f7' },
    content: { padding: 16, paddingBottom: 48 },
    heading: {
      fontSize: 13,
      fontWeight: '600',
      textTransform: 'uppercase',
      color: isDark ? '#8e8e93' : '#6c6c70',
      marginTop: 20,
      marginBottom: 8,
    },
    card: {
      backgroundColor: isDark ? '#1c1c1e' : '#fff',
      borderRadius: 10,
      padding: 12,
    },
    row: { flexDirection: 'row', paddingVertical: 5 },
    rowLabel: { width: 80, fontSize: 14, color: isDark ? '#8e8e93' : '#6c6c70' },
    rowValue: { flex: 1, fontSize: 14, fontFamily: 'monospace', color: isDark ? '#fff' : '#000' },
    rowValueAlert: { color: '#ff453a', fontWeight: '700' },
    buttonRow: { gap: 8 },
    button: {
      backgroundColor: isDark ? '#1c1c1e' : '#fff',
      borderRadius: 10,
      paddingVertical: 13,
      paddingHorizontal: 16,
    },
    buttonDestructive: { backgroundColor: isDark ? '#2c1416' : '#ffe5e5' },
    buttonPressed: { opacity: 0.55 },
    buttonText: { fontSize: 15, color: isDark ? '#0a84ff' : '#007aff', fontWeight: '500' },
    buttonTextDestructive: { color: '#ff453a' },
    empty: { color: isDark ? '#8e8e93' : '#6c6c70', fontStyle: 'italic' },
    event: {
      backgroundColor: isDark ? '#1c1c1e' : '#fff',
      borderRadius: 10,
      padding: 12,
      marginBottom: 8,
    },
    eventType: { fontSize: 14, fontWeight: '700' },
    eventTime: { fontSize: 12, color: isDark ? '#8e8e93' : '#6c6c70', marginTop: 2 },
    eventDetail: {
      fontFamily: 'monospace',
      fontSize: 12,
      color: isDark ? '#d1d1d6' : '#3c3c43',
      marginTop: 6,
    },
  })
