// lib/auth/factory.ts

import { AuthProvider } from './AuthProvider.interface'
import { RestAuthProvider } from './RestAuthProvider'

/**
 * Factory function to create authentication providers based on configuration
 * 
 * Usage in app/layout.tsx:
 * 
 * import { createAuthProvider } from '@/lib/auth/factory'
 * 
 * const authProvider = createAuthProvider()
 * 
 * <AuthWrapper provider={authProvider}>
 *   {children}
 * </AuthWrapper>
 */
export function createAuthProvider(): AuthProvider {
  const providerType = process.env.NEXT_PUBLIC_AUTH_PROVIDER || 'rest'
  
  switch (providerType.toLowerCase()) {
    case 'rest':
      return new RestAuthProvider()
    
    // Add additional providers here as you implement them:
    // case 'authentik':
    //   return new AuthentikProvider({
    //     clientId: process.env.NEXT_PUBLIC_AUTHENTIK_CLIENT_ID!,
    //     redirectUri: process.env.NEXT_PUBLIC_AUTHENTIK_REDIRECT_URI!,
    //     authentikUrl: process.env.NEXT_PUBLIC_AUTHENTIK_URL!,
    //   })
    
    // case 'okta':
    //   return new OktaProvider({ ... })
    
    // case 'auth0':
    //   return new Auth0Provider({ ... })
    
    default:
      console.warn(`Unknown auth provider: ${providerType}. Falling back to RestAuthProvider.`)
      return new RestAuthProvider()
  }
}
