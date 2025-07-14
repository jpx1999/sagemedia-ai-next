'use client'

import { Provider } from 'react-redux'
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { loginSuccess, logout } from "../store/slice/authSlice";
import { updateTokens } from "../helpers/authHelper.js";
import { updateTokens as updateReduxTokens } from "../store/slice/authSlice";
import * as config from "../firebase/firebaseConfig";
import notificationService from "../utils/notificationService.js";
import { store } from '../store/store'

// Inner component that has access to Redux
function AppProviders({ children }) {
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const dispatch = useDispatch();

  // Get user data from Redux store for tracking
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const userRole = useSelector((state) => state.auth.role);

  // Initialize Silktide Consent Manager
  useEffect(() => {
    // Ensure the silktideCookieBannerManager is available
    if (typeof window !== 'undefined' && window.silktideCookieBannerManager) {
      window.silktideCookieBannerManager.updateCookieBannerConfig({
        cookieTypes: [
          {
            id: "essential",
            name: "Essential Cookies",
            description:
              "These cookies are necessary for the website to function and cannot be switched off.",
            required: true,
            defaultValue: true,
          },
          {
            id: "analytics",
            name: "Analytics Cookies",
            description:
              "These cookies help us understand how visitors interact with the website.",
            defaultValue: true,
            onAccept: function () {
              console.log("Analytics cookies accepted");
              // Add your analytics initialization code here (e.g., Google Analytics)
            },
            onReject: function () {
              console.log("Analytics cookies rejected");
              // Add code to disable analytics tracking
            },
          },
          {
            id: "marketing",
            name: "Marketing Cookies",
            description: "These cookies are used to deliver personalized ads.",
            defaultValue: false,
            onAccept: function () {
              console.log("Marketing cookies accepted");
              // Add your marketing scripts initialization code here
            },
            onReject: function () {
              console.log("Marketing cookies rejected");
              // Add code to disable marketing scripts
            },
          },
        ],
        text: {
          banner: {
            description: `<p>We use cookies to enhance your experience. By continuing to visit this site, you agree to our use of cookies.</p>`,
            acceptAllButtonText: "Accept all",
            acceptAllButtonAccessibleLabel: "Accept all cookies",
            rejectNonEssentialButtonText: "Reject non-essential",
            rejectNonEssentialButtonAccessibleLabel: "Reject non-essential",
            preferencesButtonText: "Preferences",
            preferencesButtonAccessibleLabel: "Toggle preferences",
          },
          preferences: {
            title: "Customize your cookie preferences",
            description: `<p>We respect your right to privacy. You can choose not to allow some types of cookies. Your cookie preferences will apply across our website.</p>`,
          },
        },
        position: {
          banner: "bottomRight", // Options: 'bottomRight', 'bottomLeft', 'center', 'bottomCenter'
          cookieIcon: "bottomLeft", // Options: 'bottomRight', 'bottomLeft'
        },
      });
    } else {
      console.warn("Silktide Consent Manager not loaded");
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const unsubscribe = config.onAuthStateChanged(config.auth, async (user) => {
      if (user) {
        // Restore logged-in state from localStorage
        const storedAuth = localStorage.getItem("authData");
        const role = localStorage.getItem("role");

        if (storedAuth) {
          try {
            const authData = JSON.parse(storedAuth);
            const freshToken = await user.getIdToken();

            updateTokens(freshToken, user.refreshToken);

            dispatch(
              updateReduxTokens({
                token: freshToken,
                refreshToken: user.refreshToken,
              })
            );

            dispatch(
              loginSuccess({
                user: authData.user,
                token: freshToken,
                refreshToken: user.refreshToken,
                role: role,
              })
            );

            // Initialize notification service after login
            notificationService.initialize().catch((error) => {
              console.error(
                "Failed to initialize notification service:",
                error
              );
            });
          } catch (error) {
            console.error("Error parsing stored auth data:", error);
          }
        }
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  const toggleTheme = () => setIsDarkTheme(!isDarkTheme);

  return children;
}

export default function Providers({ children }) {
  return (
    <Provider store={store}>
      <AppProviders>
        {children}
      </AppProviders>
    </Provider>
  )
} 