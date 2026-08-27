import { File, Paths } from 'expo-file-system'

/**
 * Persistent auth event log for diagnosing the "randomly logged out" bug.
 *
 * console.log is useless for this: the app sits backgrounded for hours, Metro
 * disconnects, and by the time you notice you're on the login screen the logs
 * are long gone. This writes to disk instead, so the trail survives app
 * restarts and can be read back (or exported) from the Auth Debug screen.
 *
 * Internal builds only - remove before any public release.
 */

export type AuthEventType =
  | 'app_start'
  | 'app_foreground'
  | 'app_background'
  | 'token_read'
  | 'request_401'
  | 'refresh_start'
  | 'refresh_success'
  | 'refresh_http_error'
  | 'refresh_network_error'
  | 'refresh_rejected'
  | 'logout_forced'
  | 'logout_manual'
  | 'login_success'
  | 'retry_exhausted'

export type AuthEvent = {
  ts: string
  type: AuthEventType
  detail?: Record<string, unknown>
}

const LOG_FILE = 'auth-debug.jsonl'
const MAX_EVENTS = 500

// In-memory mirror so the debug screen can render without re-reading the file
// on every event.
let memoryLog: AuthEvent[] = []
let loaded = false

const getFile = (): File => new File(Paths.document, LOG_FILE)

const load = (): void => {
  if (loaded) {
    return
  }

  loaded = true

  try {
    const file = getFile()
    if (!file.exists) {
      return
    }

    memoryLog = file
      .textSync()
      .split('\n')
      .filter((line) => line.trim() !== '')
      .map((line) => {
        try {
          return JSON.parse(line) as AuthEvent
        } catch {
          return null
        }
      })
      .filter((e): e is AuthEvent => e !== null)
      .slice(-MAX_EVENTS)
  } catch (error) {
    console.warn('[authDebugLog] failed to load:', error)
  }
}

/**
 * Records an auth event. Never throws - diagnostics must not be able to break
 * the auth flow they are observing.
 */
export const logAuthEvent = (type: AuthEventType, detail?: Record<string, unknown>): void => {
  load()

  const event: AuthEvent = {
    ts: new Date().toISOString(),
    type,
    ...(detail === undefined ? {} : { detail }),
  }

  memoryLog.push(event)

  // Still emit to console so it shows in Metro when attached.
  console.log(`🔐 [${event.type}]`, detail ?? '')

  try {
    const file = getFile()
    if (!file.exists) {
      file.create({ intermediates: true, overwrite: false })
    }

    if (memoryLog.length > MAX_EVENTS) {
      // Compact: rewrite just the trimmed window so the file stays bounded on
      // a device that runs for weeks.
      memoryLog = memoryLog.slice(-MAX_EVENTS)
      file.write(memoryLog.map((e) => JSON.stringify(e)).join('\n') + '\n')
    } else {
      file.write(JSON.stringify(event) + '\n', { append: true })
    }
  } catch (error) {
    console.warn('[authDebugLog] failed to write:', error)
  }
}

export const getAuthEvents = (): AuthEvent[] => {
  load()
  return [...memoryLog]
}

export const clearAuthEvents = (): void => {
  memoryLog = []
  loaded = true

  try {
    const file = getFile()
    if (file.exists) {
      file.delete()
    }
  } catch (error) {
    console.warn('[authDebugLog] failed to clear:', error)
  }
}

export const getAuthLogFile = (): File => getFile()

/**
 * Decodes a JWT payload without verifying it, so the debug screen can show
 * real expiry times. Returns null for anything unparseable.
 */
export const decodeJwt = (token: string): { exp?: number; nbf?: number; [k: string]: unknown } | null => {
  try {
    const payload = token.split('.')[1]
    if (!payload) {
      return null
    }

    // base64url -> base64, padded.
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)

    return JSON.parse(atob(padded))
  } catch {
    return null
  }
}

/** Safe token fingerprint for logs - never record the token itself. */
export const fingerprint = (token: string | null): string => {
  if (token === null || token === '') {
    return 'none'
  }
  return `${token.slice(0, 6)}…${token.slice(-4)} (len ${token.length})`
}
