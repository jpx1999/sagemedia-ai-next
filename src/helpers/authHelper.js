import { googleLogout } from '@react-oauth/google'
import { store } from '../store/store'
import { logout } from '../store/slice/authSlice'

// Simple logout function that clears Redux state and localStorage
export const handleLogout = () => {
  // Clear Redux state
  store.dispatch(logout())

  // Clear any local storage items
  localStorage.clear()
  sessionStorage.clear()

  // For Google OAuth, call googleLogout if available
  try {
    googleLogout()
  } catch (error) {
    console.log('Google logout not available or already logged out')
  }

  // For Firebase auth, sign out if available
  try {
    import('firebase/auth').then(({ signOut, getAuth }) => {
      const auth = getAuth()
      signOut(auth).catch(() => {
        // Ignore errors if not authenticated
      })
    }).catch(() => {
      // Firebase not available
    })
  } catch (error) {
    console.log('Firebase logout not available')
  }
  
  // Redirect to home page after a brief delay to allow cleanup
  if (typeof window !== 'undefined') {
    setTimeout(() => {
      window.location.href = '/'
    }, 100)
  }
}

// Logout function that can be used with Auth0 hook
export const createAuthLogoutHandler = (auth0Logout) => {
  return () => {
    // Clear Redux state
    store.dispatch(logout())
    
    // Clear storage
    localStorage.clear()
    sessionStorage.clear()

    // Handle Auth0 logout if provided
    if (auth0Logout) {
      auth0Logout({ 
        logoutParams: {
          returnTo: window.location.origin 
        }
      })
    } else {
      // Fallback: redirect to home
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
    }
  }
} 