import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  onIdTokenChanged,
  signOut,
  sendEmailVerification,
  applyActionCode,
  checkActionCode,
} from "firebase/auth";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize messaging only on client side
let messaging = null;
const getMessagingInstance = () => {
  if (typeof window !== 'undefined' && !messaging) {
    try {
      messaging = getMessaging(app);
    } catch (error) {
      console.error("Error initializing Firebase messaging:", error);
    }
  }
  return messaging;
};

// Set persistence to LOCAL (persists across browser sessions) - only on client
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      console.log("Firebase persistence set to LOCAL");
    })
    .catch((error) => {
      console.error("Error setting persistence:", error);
    });
}

// Setup auth state change listener for debugging - only on client
if (typeof window !== 'undefined') {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      user
        .reload()
        .then(() => {
          console.log("User email verified status:", user.emailVerified);
          if (user.emailVerified) {
            console.log("User email is verified");
          } else {
            console.log("User email is not yet verified");
          }
        })
        .catch((error) => {
          console.error("Error reloading user in global listener:", error);
        });
      console.log("Firebase auth state change: User is signed in");
    } else {
      console.log("Firebase auth state change: User is signed out");
    }
  });

  // Setup token change listener to automatically update tokens when refreshed by Firebase
  onIdTokenChanged(auth, async (user) => {
    if (user) {
      try {
        // Get the fresh token
        const freshToken = await user.getIdToken();
        const refreshToken = user.refreshToken;

        // Dynamically import to avoid SSR issues
        const { updateTokens } = await import("../helpers/authHelper");
        const { updateTokens: updateReduxTokens } = await import("../store/slice/authSlice");
        const { store } = await import("../store/store");

        // Update stored tokens
        updateTokens(freshToken, refreshToken);

        // Update Redux store tokens
        store.dispatch(
          updateReduxTokens({
            token: freshToken,
            refreshToken: refreshToken,
          })
        );

        console.log("Token automatically updated by Firebase");
      } catch (error) {
        console.error("Error updating token in onIdTokenChanged:", error);
      }
    }
  });
}

const googleAuthProvider = new GoogleAuthProvider();
const microsoftAuthProvider = new OAuthProvider("microsoft.com");
microsoftAuthProvider.setCustomParameters({
  prompt: "login",
  tenant: "common",
});

// Safe messaging functions that check for client-side
const getFirebaseToken = async () => {
  const messagingInstance = getMessagingInstance();
  if (messagingInstance) {
    return getToken(messagingInstance);
  }
  return null;
};

const onFirebaseMessage = (callback) => {
  const messagingInstance = getMessagingInstance();
  if (messagingInstance) {
    return onMessage(messagingInstance, callback);
  }
  return () => {}; // Return empty unsubscribe function
};

export {
  auth,
  getMessagingInstance as messaging,
  googleAuthProvider,
  microsoftAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  onAuthStateChanged,
  onIdTokenChanged,
  signOut,
  sendEmailVerification,
  applyActionCode,
  checkActionCode,
  getFirebaseToken as getToken,
  onFirebaseMessage as onMessage,
};
