import { messaging, getToken, onMessage } from "../firebase/firebaseConfig";
import { subscribeToTopic } from "../helpers/api";

// VAPID key - you'll need to get this from your Firebase console
const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

// Notification service state
let fcmToken = null;
const isSupported = "serviceWorker" in navigator && "PushManager" in window;
let isPermissionGranted = false;

const notificationService = {
  // Callback function for notification clicks
  _notificationClickCallback: null,

  // ADD: Callback function for when new notifications are received
  _notificationReceivedCallback: null,

  // Set up service worker message listener for notification clicks
  setupServiceWorkerMessageListener() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data && event.data.type === "NOTIFICATION_CLICK") {
          // Call the callback if it's set
          if (
            this._notificationClickCallback &&
            typeof this._notificationClickCallback === "function"
          ) {
            this._notificationClickCallback(event.data.data);
          }
        }
      });
    }
  },

  // Set callback for notification clicks
  onNotificationClick(callback) {
    this._notificationClickCallback = callback;
  },

  // ADD: Set callback for when new notifications are received
  onNotificationReceived(callback) {
    this._notificationReceivedCallback = callback;
  },

  // Check if notifications are supported
  isNotificationSupported() {
    return isSupported;
  },

  // Request notification permission
  async requestPermission() {
    try {
      if (!isSupported) {
        return false;
      }

      // Check current permission status
      let permission = Notification.permission;

      if (permission === "default") {
        // Request permission
        permission = await Notification.requestPermission();
      }

      if (permission === "granted") {
        isPermissionGranted = true;
        return true;
      } else {
        isPermissionGranted = false;
        return false;
      }
    } catch (error) {
      return false;
    }
  },

  // Get FCM token
  async getFCMToken() {
    try {
      if (!isPermissionGranted) {
        const permissionGranted = await this.requestPermission();
        if (!permissionGranted) {
          throw new Error("Notification permission not granted");
        }
      }

      // Register service worker if not already registered
      await this.registerServiceWorker();

      // Get FCM token
      const currentToken = await getToken(messaging, {
        vapidKey: VAPID_KEY,
      });

      if (currentToken) {
        fcmToken = currentToken;

        // Store token in localStorage for future use
        localStorage.setItem("fcmToken", currentToken);

        return currentToken;
      } else {
        return null;
      }
    } catch (error) {
      throw error;
    }
  },

  // Register service worker
  async registerServiceWorker() {
    try {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js"
        );
        return registration;
      }
    } catch (error) {
      throw error;
    }
  },

  // Subscribe to topic using your API
  async subscribeToTopic(groupId) {
    try {
      if (!fcmToken) {
        fcmToken = await this.getFCMToken();
      }

      if (!fcmToken) {
        throw new Error("FCM token not available");
      }

      const response = await subscribeToTopic(fcmToken, groupId);

      return response;
    } catch (error) {
      throw error;
    }
  },

  // Note: Unsubscribe functionality not available - only subscribe-topic API exists
  async unsubscribeFromTopic(groupId) {
    throw new Error("Unsubscribe functionality not available");
  },

  // Listen for foreground messages
  setupForegroundMessageListener(callback) {
    try {
      onMessage(messaging, (payload) => {
        console.log("📧 New FCM notification received:", payload);

        // CALL THE NOTIFICATION RECEIVED CALLBACK TO REFRESH NOTIFICATION LIST
        if (
          this._notificationReceivedCallback &&
          typeof this._notificationReceivedCallback === "function"
        ) {
          this._notificationReceivedCallback(payload);
        }

        // Show notification if browser is in focus
        if (callback && typeof callback === "function") {
          callback(payload);
        } else {
          // Default notification display
          this.showForegroundNotification(payload);
        }
      });
    } catch (error) {}
  },

  // Show notification when app is in foreground
  showForegroundNotification(payload) {
    try {
      const notificationTitle =
        payload.notification?.title || "SAGE News Update";
      const notificationOptions = {
        body: payload.notification?.body || "You have a new update",
        icon: "/sage-icon.jpg",
        badge: "/sage-icon.jpg",
        tag: "sage-notification",
        requireInteraction: true,
        // Note: actions are not supported for direct Notification constructor
        // They only work with ServiceWorkerRegistration.showNotification()
      };

      const notification = new Notification(
        notificationTitle,
        notificationOptions
      );

      // Handle click event manually since actions aren't supported
      notification.onclick = () => {
        window.focus();
        notification.close();

        // Handle any custom data from payload
        if (payload.data) {
          // Call the callback if it's set (same as service worker messages)
          if (
            this._notificationClickCallback &&
            typeof this._notificationClickCallback === "function"
          ) {
            this._notificationClickCallback(payload.data);
          }
        }
      };
    } catch (error) {}
  },

  // Initialize notification service
  async initialize() {
    try {
      if (!isSupported) {
        return false;
      }

      // Check if permission is already granted
      if (Notification.permission === "granted") {
        isPermissionGranted = true;

        // Try to get existing token from localStorage
        const storedToken = localStorage.getItem("fcmToken");
        if (storedToken) {
          fcmToken = storedToken;
        }
      }

      // Setup foreground message listener
      this.setupForegroundMessageListener();

      // Setup service worker message listener for notification clicks
      this.setupServiceWorkerMessageListener();

      return true;
    } catch (error) {
      return false;
    }
  },

  // Get current FCM token (without requesting new one)
  getCurrentToken() {
    return fcmToken || localStorage.getItem("fcmToken");
  },

  // Check permission status
  getPermissionStatus() {
    return Notification.permission;
  },

  // Helper function to extract notification data from URL parameters
  getNotificationDataFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    const notificationData = {};

    if (urlParams.has("group_id")) {
      notificationData.group_id = urlParams.get("group_id");
    }

    if (urlParams.has("country")) {
      notificationData.country = urlParams.get("country");
    }

    return Object.keys(notificationData).length > 0 ? notificationData : null;
  },

  // Helper function to clear notification parameters from URL
  clearNotificationDataFromURL() {
    const url = new URL(window.location);
    url.searchParams.delete("group_id");
    url.searchParams.delete("country");

    // Update the URL without reloading the page
    window.history.replaceState({}, document.title, url.toString());
  },

  // Test utility - simulate notification click (for development/testing)
  simulateNotificationClick(groupId, country = "India") {
    if (
      this._notificationClickCallback &&
      typeof this._notificationClickCallback === "function"
    ) {
      this._notificationClickCallback({
        group_id: groupId,
        country: country,
      });
    } else {
    }
  },
};

export default notificationService;
