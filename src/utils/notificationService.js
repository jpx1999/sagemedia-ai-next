import { messaging, getToken, onMessage } from "../firebase/firebaseConfig";
import { subscribeToTopic } from "../helpers/api";

// VAPID key - you'll need to get this from your Firebase console
const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

// Notification service state
let fcmToken = null;
let isPermissionGranted = false;

// Check if running in browser and if notifications are supported
const isClient = () => typeof window !== 'undefined';
const isSupported = () => isClient() && "serviceWorker" in navigator && "PushManager" in window;

const notificationService = {
  // Callback function for notification clicks
  _notificationClickCallback: null,

  // ADD: Callback function for when new notifications are received
  _notificationReceivedCallback: null,

  // Set up service worker message listener for notification clicks
  setupServiceWorkerMessageListener() {
    if (isClient() && "serviceWorker" in navigator) {
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
    return isSupported();
  },

  // Request notification permission from user
  async requestPermission() {
    if (!isClient()) {
      console.warn("Cannot request permission on server side");
      return false;
    }

    if (!isSupported()) {
      console.warn("Notifications are not supported in this browser");
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      isPermissionGranted = permission === "granted";
      
      if (isPermissionGranted) {
        console.log("Notification permission granted");
      } else {
        console.log("Notification permission denied");
      }
      
      return isPermissionGranted;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  },

  // Get FCM token for this device
  async getFCMToken() {
    if (!isClient()) {
      console.warn("Cannot get FCM token on server side");
      return null;
    }

    if (!isSupported()) {
      console.warn("Firebase messaging is not supported");
      return null;
    }

    try {
      const messagingInstance = messaging();
      if (!messagingInstance) {
        console.warn("Firebase messaging not initialized");
        return null;
      }

      // Request permission first
      await this.requestPermission();
      
      if (!isPermissionGranted) {
        console.warn("Notification permission not granted");
        return null;
      }

      // Get the token
      fcmToken = await getToken(messagingInstance, {
        vapidKey: VAPID_KEY,
      });
      
      if (fcmToken) {
        console.log("FCM token received:", fcmToken);
      } else {
        console.log("No FCM token available");
      }
      
      return fcmToken;
    } catch (error) {
      console.error("Error getting FCM token:", error);
      return null;
    }
  },

  // Register service worker for background notifications
  async registerServiceWorker() {
    if (!isClient() || !("serviceWorker" in navigator)) {
      console.warn("Service Worker not supported");
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      console.log("Service Worker registered successfully:", registration);
      return true;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
      return false;
    }
  },

  // Subscribe to a topic for push notifications
  async subscribeToTopic(groupId) {
    if (!isClient()) {
      console.warn("Cannot subscribe to topic on server side");
      return false;
    }

    try {
      const token = await this.getFCMToken();
      if (!token) {
        console.warn("No FCM token available for topic subscription");
        return false;
      }

      const response = await subscribeToTopic(token, groupId);
      console.log(`Subscribed to topic for group ${groupId}:`, response);
      return true;
    } catch (error) {
      console.error(`Error subscribing to topic for group ${groupId}:`, error);
      return false;
    }
  },

  // Unsubscribe from a topic
  async unsubscribeFromTopic(groupId) {
    // Implementation would depend on your backend API
    console.log(`Unsubscribing from topic for group ${groupId}`);
  },

  // Set up listener for foreground messages
  setupForegroundMessageListener(callback) {
    if (!isClient()) {
      console.warn("Cannot setup message listener on server side");
      return () => {}; // Return empty unsubscribe function
    }

    try {
      const messagingInstance = messaging();
      if (!messagingInstance) {
        console.warn("Firebase messaging not initialized");
        return () => {};
      }

      const unsubscribe = onMessage(messagingInstance, (payload) => {
        console.log("Foreground message received:", payload);
        
        // Call the notification received callback if set
        if (
          this._notificationReceivedCallback &&
          typeof this._notificationReceivedCallback === "function"
        ) {
          this._notificationReceivedCallback(payload);
        }
        
        // Show the notification
        this.showForegroundNotification(payload);
        
        // Call the provided callback
        if (callback && typeof callback === "function") {
          callback(payload);
        }
      });
      
      return unsubscribe;
    } catch (error) {
      console.error("Error setting up foreground message listener:", error);
      return () => {};
    }
  },

  // Show notification in foreground
  showForegroundNotification(payload) {
    if (!isClient()) {
      console.warn("Cannot show notification on server side");
      return;
    }

    if (!isSupported()) {
      console.warn("Notifications not supported");
      return;
    }

    const { notification, data } = payload;
    
    if (notification) {
      const { title, body, icon } = notification;
      
      // Show browser notification
      if (Notification.permission === "granted") {
        const notificationOptions = {
          body: body,
          icon: icon || "/images/sage-icon.jpg",
          data: data,
          requireInteraction: true,
          actions: [
            {
              action: "open",
              title: "Open"
            },
            {
              action: "dismiss",
              title: "Dismiss"
            }
          ]
        };
        
        const notif = new Notification(title, notificationOptions);
        
        notif.onclick = () => {
          // Handle notification click
          if (data && this._notificationClickCallback) {
            this._notificationClickCallback(data);
          }
          notif.close();
        };
      }
    }
  },

  // Initialize the notification service
  async initialize() {
    if (!isClient()) {
      console.warn("Cannot initialize notification service on server side");
      return false;
    }

    try {
      console.log("Initializing notification service...");
      
      // Register service worker first
      await this.registerServiceWorker();
      
      // Set up message listeners
      this.setupServiceWorkerMessageListener();
      this.setupForegroundMessageListener();
      
      // Get FCM token
      await this.getFCMToken();
      
      console.log("Notification service initialized successfully");
      return true;
    } catch (error) {
      console.error("Error initializing notification service:", error);
      return false;
    }
  },

  // Get current FCM token
  getCurrentToken() {
    return fcmToken;
  },

  // Get permission status
  getPermissionStatus() {
    if (!isClient()) return 'unavailable';
    return isPermissionGranted ? 'granted' : 'denied';
  },

  // Get notification data from URL parameters (for handling notification clicks)
  getNotificationDataFromURL() {
    if (!isClient()) return null;

    try {
      const urlParams = new URLSearchParams(window.location.search);
      const groupId = urlParams.get('group_id');
      const country = urlParams.get('country');
      
      if (groupId) {
        return {
          group_id: groupId,
          country: country || 'India'
        };
      }
    } catch (error) {
      console.error("Error parsing notification data from URL:", error);
    }
    
    return null;
  },

  // Clear notification data from URL
  clearNotificationDataFromURL() {
    if (!isClient()) return;

    try {
      const url = new URL(window.location);
      url.searchParams.delete('group_id');
      url.searchParams.delete('country');
      window.history.replaceState({}, document.title, url.pathname + url.hash);
    } catch (error) {
      console.error("Error clearing notification data from URL:", error);
    }
  },

  // Simulate notification click for testing
  simulateNotificationClick(groupId, country = "India") {
    if (!isClient()) return;

    console.log(`Simulating notification click for group ${groupId}`);
    if (this._notificationClickCallback) {
      this._notificationClickCallback({
        group_id: groupId,
        country: country
      });
    }
  }
};

export default notificationService;
