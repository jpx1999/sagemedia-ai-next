importScripts(
  "https://www.gstatic.com/firebasejs/10.13.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.0/firebase-messaging-compat.js"
);

// Service workers cannot access environment variables, so these need to be hardcoded
// or replaced during build process
firebase.initializeApp({
  apiKey: "AIzaSyCcp9JKV5Xy2O0sjGFMjJCVF5dcAJUWe8M",
  authDomain: "enterprisespiderx.firebaseapp.com",
  projectId: "enterprisespiderx",
  storageBucket: "enterprisespiderx.firebasestorage.app",
  messagingSenderId: "289151933747",
  appId: "1:289151933747:web:d26203b8eb5ae9e6d17246",
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  // Customize notification here
  const notificationTitle = payload.notification?.title || "SAGE News Update";
  const notificationOptions = {
    body: payload.notification?.body || "You have a new update",
    icon: "/sage-icon.jpg",
    badge: "/sage-icon.jpg",
    tag: "sage-notification",
    data: payload.data || {},
    actions: [
      {
        action: "open",
        title: "Open SAGE",
        icon: "/sage-icon.jpg",
      },
    ],
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  // Get notification data
  const notificationData = event.notification.data || {};
  let targetUrl = "/news-intelligence";

  // If we have group_id and country data, append them as URL parameters
  if (notificationData.group_id || notificationData.country) {
    const params = new URLSearchParams();

    if (notificationData.group_id) {
      params.append("group_id", notificationData.group_id);
    }

    if (notificationData.country) {
      params.append("country", notificationData.country);
    }

    targetUrl += `?${params.toString()}`;
  }

  // Check if the app is already open
  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        // If app is already open, focus it and navigate to the target URL
        for (const client of clientList) {
          if (client.url.includes("sagemedia.ai") && "focus" in client) {
            // Send message to the client to handle the notification data
            client.postMessage({
              type: "NOTIFICATION_CLICK",
              data: notificationData,
            });
            return client.focus();
          }
        }

        // If app is not open, open it with the target URL
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});
