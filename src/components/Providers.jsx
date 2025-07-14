'use client'

import { Provider } from 'react-redux'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { Auth0Provider } from '@auth0/auth0-react'
import { store } from '../store/store'

// These would normally come from environment variables
const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'your-google-client-id'
const auth0Domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN || 'your-auth0-domain'
const auth0ClientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID || 'your-auth0-client-id'

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <Auth0Provider
        domain={auth0Domain}
        clientId={auth0ClientId}
        authorizationParams={{
          redirect_uri: typeof window !== 'undefined' ? window.location.origin : '',
          audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE
        }}
      >
        <GoogleOAuthProvider clientId={googleClientId}>
          {children}
        </GoogleOAuthProvider>
      </Auth0Provider>
    </Provider>
  )
} 