// lib/auth/RestAuthProvider.ts

import { AuthProvider, User, LoginCredentials } from './AuthProvider.interface'

export class RestAuthProvider implements AuthProvider {
  private restEndpoint: string | null = null

  async initialize (): Promise<void> {
    this.restEndpoint = await this.getRestEndpoint()
  }

  private async getRestEndpoint (): Promise<string> {
    try {
      const res = await fetch('/config')
      const contentType = res.headers.get('content-type')
      const isJson = contentType?.includes('application/json') === true

      if (!res.ok || !isJson) {
        console.warn(`Failed to fetch /config (Status: ${res.status}). Falling back to default.`)
        return 'http://localhost:3000/api/v1'
      }

      const config = await res.json()
      return (typeof config.restEndpoint === 'string' && config.restEndpoint.length > 0) ? config.restEndpoint : 'http://localhost:3000/api/v1'
    } catch (error) {
      console.error('Error fetching REST config:', error)
      return 'http://localhost:3000/api/v1'
    }
  }

  private async ensureInitialized (): Promise<string> {
    if (this.restEndpoint === null) {
      await this.initialize()
    }
    if (this.restEndpoint === null) {
      throw new Error('Failed to initialize REST endpoint')
    }
    return this.restEndpoint
  }

  async checkSession (): Promise<User | null> {
    try {
      const endpoint = await this.ensureInitialized()
      const res = await fetch(`${endpoint}/auth/me`)

      if (res.ok) {
        const data = await res.json()
        const username = (typeof data.username === 'string' && data.username.length > 0) ? data.username : 'unknown'
        const email = (typeof data.email === 'string') ? data.email : '' // Extract email

        let role: 'owner' | 'admin' | 'editor' | 'viewer' = 'viewer'
        if (typeof data.role === 'string') {
          const roleStr: string = data.role
          if (roleStr.length > 0) {
            role = roleStr as 'owner' | 'admin' | 'editor' | 'viewer'
          }
        }

        const orgs = Array.isArray(data.orgs) ? data.orgs : []

        return { username, email, role, orgs }
      }
      return null
    } catch (error) {
      console.error('Session check failed', error)
      return null
    }
  }

  async login (credentials: LoginCredentials): Promise<User | null> {
    try {
      const endpoint = await this.ensureInitialized()
      const res = await fetch(`${endpoint}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password
        })
      })

      if (res.ok) {
        const data = await res.json()
        const username = (typeof data.username === 'string' && data.username.length > 0)
          ? data.username
          : (typeof credentials.username === 'string' && credentials.username.length > 0)
              ? credentials.username
              : 'unknown'
        const email = (typeof data.email === 'string') ? data.email : '' // Extract email
        const role = (typeof data.role === 'string' && data.role.length > 0) ? data.role : 'viewer'
        const orgs = Array.isArray(data.orgs) ? data.orgs : []

        return {
          username,
          email,
          role: role as 'owner' | 'admin' | 'editor' | 'viewer',
          orgs
        }
      }
      return null
    } catch (error) {
      console.error('Login error', error)
      return null
    }
  }

  async logout (): Promise<void> {
    try {
      const endpoint = await this.ensureInitialized()
      await fetch(`${endpoint}/auth/logout`, { method: 'POST' })
    } catch (error) {
      console.error('Logout error', error)
    }
  }
}
