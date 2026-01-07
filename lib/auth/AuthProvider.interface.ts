// lib/auth/AuthProvider.interface.ts

export interface User {
  username: string
  role: 'admin' | 'editor' | 'viewer'
}

export interface AuthProvider {
  /**
   * Initialize the provider (e.g., fetch config endpoints)
   */
  initialize: () => Promise<void>

  /**
   * Check if there's an active session
   * @returns User object if session is valid, null otherwise
   */
  checkSession: () => Promise<User | null>

  /**
   * Authenticate a user
   * @param credentials - Authentication credentials (username/password, token, etc.)
   * @returns User object if successful, null otherwise
   */
  login: (credentials: LoginCredentials) => Promise<User | null>

  /**
   * End the current session
   */
  logout: () => Promise<void>
}

export interface LoginCredentials {
  username?: string
  password?: string
  token?: string
  [key: string]: any
}
