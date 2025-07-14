import { signOut } from "../firebase/firebaseConfig";
import { auth } from "../firebase/firebaseConfig";
import { logout } from "../store/slice/authSlice";
import { store } from "../store/store";
import { onAuthStateChanged } from "firebase/auth";

/**
 * Performs a complete logout, clearing all auth data from Firebase,
 * localStorage, and Redux store
 */
export const handleLogout = async () => {
  try {
    // Sign out from Firebase
    await signOut(auth);

    // Dispatch logout action to Redux
    localStorage.removeItem("role");
    localStorage.removeItem("authData");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    store.dispatch(logout());

    // Redirect to login page
    window.location.href = "/login";
  } catch (error) {
    console.error("Error during logout:", error);

    // Even if Firebase logout fails, clear local data
    localStorage.removeItem("role");
    localStorage.removeItem("authData");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    // Dispatch logout action to Redux
    store.dispatch(logout());

    // Redirect to login page
    window.location.href = "/login";
  }
};

/**
 * Updates user data in localStorage
 */
// export const updateUserData = (userData) => {
//   try {
//     const authData = localStorage.getItem('authData');
//     const parsedAuthData = authData ? JSON.parse(authData) : { isLoggedIn: true };

//     const updatedAuthData = {
//       ...parsedAuthData,
//       user: {
//         ...(parsedAuthData.user || {}),
//         ...userData
//       }
//     };

//     localStorage.setItem('authData', JSON.stringify(updatedAuthData));
//     return true;
//   } catch (error) {
//     console.error('Error updating user data:', error);
//     return false;
//   }
// };

/**
 * Gets the current user data from localStorage
 */
export const getCurrentUser = () => {
  try {
    const authData = localStorage.getItem("authData");
    if (!authData) return null;

    const parsedAuthData = JSON.parse(authData);
    return parsedAuthData.user || null;
  } catch (error) {
    console.error("Error getting current user:", error);
    return null;
  }
};

/**
 * Gets the current access token
 */
export const getAccessToken = () => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;

    // Handle case where token might be stored as JSON string
    if (token.startsWith('"') && token.endsWith('"')) {
      return JSON.parse(token);
    }

    return token;
  } catch (error) {
    console.error("Error parsing access token:", error);
    // Try to return the raw token if JSON parsing fails
    return localStorage.getItem("accessToken");
  }
};

/**
 * Gets the current refresh token
 */
export const getRefreshToken = () => {
  return localStorage.getItem("refreshToken");
};

/**
 * Updates the access and refresh tokens
 */
export const updateTokens = (accessToken, refreshToken) => {
  if (accessToken) {
    localStorage.setItem("accessToken", accessToken);
  }

  if (refreshToken) {
    localStorage.setItem("refreshToken", refreshToken);
  }
};

/**
 * Checks if user session can be restored from stored tokens
 */
export const canRestoreSession = () => {
  try {
    const authData = localStorage.getItem("authData");
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    return !!(authData || (accessToken && refreshToken));
  } catch (error) {
    console.error("Error checking session restore capability:", error);
    return false;
  }
};

/**
 * Waits for Firebase auth state to be ready
 * Useful when auth.currentUser is null but user should be authenticated
 */
export const waitForAuthReady = (maxWaitTime = 5000) => {
  return new Promise((resolve) => {
    if (auth.currentUser) {
      resolve(auth.currentUser);
      return;
    }

    const timeout = setTimeout(() => {
      unsubscribe();
      resolve(null);
    }, maxWaitTime);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      clearTimeout(timeout);
      unsubscribe();
      resolve(user);
    });
  });
};
