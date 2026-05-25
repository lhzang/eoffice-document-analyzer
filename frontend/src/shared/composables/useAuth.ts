import { appConfig } from '@/config/app-config'
import { UserManager, WebStorageStateStore } from 'oidc-client-ts'
import { useRouter } from 'vue-router'
import { useUserProfileStore } from '../stores/userProfileStore'
import { updateProfile } from '../utils/profile'

// ---------------------------------------------------------------------------
// Singleton OIDC client — created once, shared across all composable calls
// ---------------------------------------------------------------------------

let oidcClient: UserManager | null = null
let listenersRegistered = false
let tokenRenewalInProgress = false

// FIX: Persist the id_token separately at module level.
// oidc-client-ts sometimes drops id_token from the stored user after a silent
// renew (it becomes null/undefined), which causes the logout endpoint to reject
// the id_token_hint with invalid_token / bad_request.
// We capture it on every UserLoaded event and fall back to it at logout time.
let lastKnownIdToken: string | null = null

function getOidcClient(): UserManager {
  if (!oidcClient) {
    oidcClient = new UserManager({
      authority: appConfig.VITE_API_SERVER,
      client_id: 'eoffice-webapp',
      redirect_uri: `${window.location.origin}/oauth2-callback`,
      post_logout_redirect_uri: window.location.origin,
      response_type: 'code',
      scope: 'openid profile',
      userStore: new WebStorageStateStore({ store: window.localStorage }),
      automaticSilentRenew: false,
      silent_redirect_uri: `${window.location.origin}/silent-renew.html`
    })
  }
  return oidcClient
}

// ---------------------------------------------------------------------------
// Module-level listeners — registered exactly once against the singleton
// ---------------------------------------------------------------------------

function ensureListeners(updateToken: (token: string) => void, onExpiring: () => void) {
  if (listenersRegistered) return

  const client = getOidcClient()

  client.events.addUserLoaded((u) => {
    console.log(u, 'dddddddd22222')
    updateToken(u.access_token)
    // FIX: Capture id_token every time a user is loaded (initial login + every
    // silent renew). This ensures we always have the most recent valid id_token
    // available for logout even if the stored user object loses it later.
    if (u.id_token) {
      lastKnownIdToken = u.id_token
    }
  })

  client.events.addAccessTokenExpiring(onExpiring)

  listenersRegistered = true
}

// ---------------------------------------------------------------------------
// Resolve the best available id_token for logout
// ---------------------------------------------------------------------------

// FIX: Reads id_token from multiple sources in priority order:
//   1. The live user object from oidc-client-ts (most up-to-date)
//   2. The module-level lastKnownIdToken captured on the last UserLoaded event
//   3. The raw value stored directly in localStorage under the oidc key
//      (last-resort fallback for when the UserManager has already cleared state)
async function resolveIdToken(): Promise<string | null> {
  const client = getOidcClient()

  // Source 1: live user
  const user = await client.getUser()
  if (user?.id_token) return user.id_token

  // Source 2: last captured at UserLoaded
  if (lastKnownIdToken) return lastKnownIdToken

  // Source 3: raw localStorage scan (oidc-client-ts key format:
  // "oidc.user:<authority>:<client_id>")
  try {
    const key = `oidc.user:${appConfig.VITE_API_SERVER}:eoffice-webapp`
    const raw = localStorage.getItem(key)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed?.id_token) return parsed.id_token
    }
  } catch {
    // ignore parse errors
  }

  return null
}

// ---------------------------------------------------------------------------
// Auth errors
// ---------------------------------------------------------------------------

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

// ---------------------------------------------------------------------------
// Composable
// ---------------------------------------------------------------------------

export function useAuth() {
  const { clearUserInfo, updateToken, user: storeUser } = useUserProfileStore()
  const router = useRouter()
  const client = getOidcClient()

  // Wire up module-level listeners on first composable usage
  ensureListeners(updateToken, renewToken)

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  function login(): Promise<void> {
    return client.signinRedirect()
  }

  async function logout(reason?: string): Promise<void> {
    if (reason) console.warn('[Auth] Logging out:', reason)

    try {
      // FIX: Use resolveIdToken() instead of user?.id_token directly.
      // After a silent renew the stored user's id_token can be null, which
      // causes the server to return 400 invalid_token on the logout endpoint.
      const idToken = await resolveIdToken()

      if (idToken) {
        await client.signoutRedirect({
          id_token_hint: idToken,
          post_logout_redirect_uri: window.location.origin
        })
      } else {
        // FIX: No id_token available at all — perform logout without the hint.
        // The server session may already be gone; just redirect to the logout
        // endpoint with only the post_logout_redirect_uri so the user lands
        // back on the home page cleanly.
        console.warn('[Auth] No id_token available for logout hint, redirecting without hint')
        const logoutUrl = new URL(`${appConfig.VITE_API_SERVER}/connect/logout`)
        clearUserInfo()

        logoutUrl.searchParams.set('post_logout_redirect_uri', window.location.origin)
        window.location.href = logoutUrl.toString()
      }
    } catch (error) {
      console.error('[Auth] Logout failed:', error)
      // FIX: On any logout error, still clear local state and redirect home
      // so the user is not stuck in a broken authenticated state.
      clearUserInfo()
      lastKnownIdToken = null
      router.push('/')
    } finally {
      // Always clear local state and the cached id_token
      clearUserInfo()
      lastKnownIdToken = null
    }
  }

  async function handleCallback(): Promise<void> {
    try {
      await client.signinRedirectCallback()
    } catch (error) {
      throw new AuthError('Login callback failed', error)
    }
  }

  async function changeUserPosition(newPositionId: string): Promise<void> {
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    if (isLocalhost) {
      console.log('[Auth] Localhost detected, using fast local fallback for position change')
      const profileStore = useUserProfileStore()
      if (profileStore?.user?.positions) {
        const found = profileStore.user.positions.find((pos) => pos.id === newPositionId)
        if (found) {
          const updatedUser = {
            ...profileStore.user,
            currentPosition: found
          }
          profileStore.updateUser(updatedUser)
          router.push('/')
          return
        }
      }
    }

    try {
      const user = await client.signinSilent({
        extraQueryParams: { position_id: newPositionId }
      })

      if (!user) throw new AuthError('Silent sign-in returned null')

      await updateProfile()
      router.push('/')
    } catch (error) {
      console.warn('[Auth] signinSilent failed, attempting local fallback:', error)
      const profileStore = useUserProfileStore()
      if (profileStore?.user?.positions) {
        const found = profileStore.user.positions.find((pos) => pos.id === newPositionId)
        if (found) {
          const updatedUser = {
            ...profileStore.user,
            currentPosition: found
          }
          profileStore.updateUser(updatedUser)
          router.push('/')
          return
        }
      }
      if (error instanceof AuthError) throw error
      throw new AuthError('Position change failed', error)
    }
  }

  function getUser() {
    return client.getUser()
  }

  return { login, logout, handleCallback, changeUserPosition, getUser }
}

// ---------------------------------------------------------------------------
// Token renewal — defined at module level so ensureListeners can reference it
// without a circular composable dependency
// ---------------------------------------------------------------------------

async function renewToken(): Promise<void> {
  if (tokenRenewalInProgress) {
    console.log('[Auth] Token renewal already in progress, skipping')
    return
  }

  tokenRenewalInProgress = true

  const { user: storeUser } = useUserProfileStore()

  try {
    const extraQueryParams = storeUser?.currentPosition?.id
      ? { position_id: storeUser.currentPosition.id }
      : undefined

    const user = await getOidcClient().signinSilent({ extraQueryParams })
    if (!user) throw new Error('Silent sign-in returned null')

    // FIX: signinSilent fires UserLoaded which updates lastKnownIdToken via
    // the listener, but capture here too as a safety net in case the event
    // fires after this function resolves.
    if (user.id_token) {
      lastKnownIdToken = user.id_token
    }

    console.log('[Auth] Token renewed successfully')
  } catch (error) {
    const isAuthError =
      error instanceof Error &&
      (error.message.includes('login_required') || error.message.includes('interaction_required'))

    if (isAuthError) {
      console.error('[Auth] Session expired, logging out')
      // FIX: Use resolveIdToken() here too so the server-side session is also
      // properly terminated even when logging out due to expiry.
      resolveIdToken().then((idToken) => {
        const signoutOptions = idToken
          ? { id_token_hint: idToken, post_logout_redirect_uri: window.location.origin }
          : { post_logout_redirect_uri: window.location.origin }

        getOidcClient().signoutRedirect(signoutOptions).catch(console.error)
      })
      useUserProfileStore().clearUserInfo()
      lastKnownIdToken = null
    } else {
      console.warn('[Auth] Token renewal failed (network?), will retry:', error)
    }
  } finally {
    tokenRenewalInProgress = false
  }
}
