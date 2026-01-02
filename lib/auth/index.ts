// lib/auth/index.ts

export type { AuthProvider, User, LoginCredentials } from './AuthProvider.interface'
export { RestAuthProvider } from './RestAuthProvider'
export { createAuthProvider } from './factory'