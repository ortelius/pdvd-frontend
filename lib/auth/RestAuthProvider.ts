// lib/auth/RestAuthProvider.ts

import { AuthProvider, User, LoginCredentials } from './AuthProvider.interface'

export class RestAuthProvider implements AuthProvider {
  private restEndpoint: string | null = null

  async initialize(): Promise<void> {
    this.restEndpoint = await this.getRestEndpoint()
  }

  private async getRestEndpoint(): Promise<string> {
    try {
      const res = await fetch('/api/config')
      
      if (!res.ok || !res.headers.get('content-type')?.includes('application/json')) {
        console.warn(`Failed to fetch /api/config (Status: ${res.status}). Falling back to default.`)
        return 'http://localhost:3000/api/v1'
      }

      const config = await res.json()
      return config.restEndpoint || 'http://localhost:3000/api/v1'
    } catch (error) {
      console.error('Error fetching REST config:', error)
      return 'http://localhost:3000/api/v1'
    }
  }

  private async ensureInitialized(): Promise<string> {
    if (!this.restEndpoint) {
      await this.initialize()
    }
    return this.restEndpoint!
  }

  async checkSession(): Promise<User | null> {
    try {
      const endpoint = await this.ensureInitialized()
      const res = await fetch(`${endpoint}/auth/me`)
      
      if (res.ok) {
        const data = await res.json()
        return {
          username: data.username,
          role: data.role || 'viewer'
        }
      }
      return null
    } catch (error) {
      console.error('Session check failed', error)
      return null
    }
  }

  async login(credentials: LoginCredentials): Promise<User | null> {
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
        return {
          username: data.username || credentials.username || 'unknown',
          role: data.role || 'viewer'
        }
      }
      return null
    } catch (error) {
      console.error('Login error', error)
      return null
    }
  }

  async logout(): Promise<void> {
    try {
      const endpoint = await this.ensureInitialized()
      await fetch(`${endpoint}/auth/logout`, { method: 'POST' })
    } catch (error) {
      console.error('Logout error', error)
    }
  }
}
