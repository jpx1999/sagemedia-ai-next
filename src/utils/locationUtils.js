// locationUtils.js - Utility functions for getting user location

// Function to get user's IP address
const getUserIP = async () => {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error("Failed to get IP address:", error);
      try {
        // Fallback to another service
        const response = await fetch("https://ipapi.co/ip/");
        const ip = await response.text();
        return ip.trim();
      } catch (fallbackError) {
        console.error("Fallback IP service also failed:", fallbackError);
        return null;
      }
    }
  };
  
  // Function to get user source from referrer
  const getUserSource = () => {
    try {
      const referrer = document.referrer;
      const userAgent = navigator.userAgent.toLowerCase();
      const currentUrl = window.location.href;
  
      // Check for UTM parameters first (highest priority)
      const urlParams = new URLSearchParams(window.location.search);
      const utmSource = urlParams.get("utm_source");
      const utmMedium = urlParams.get("utm_medium");
      const source = urlParams.get("source");
      const ref = urlParams.get("ref");
  
      if (utmSource) {
        return utmMedium ? `utm_${utmSource}_${utmMedium}` : `utm_${utmSource}`;
      }
  
      if (source) {
        return `param_${source}`;
      }
  
      if (ref) {
        return `ref_${ref}`;
      }
  
      // Check for mobile app user agents (when referrer is missing)
      const mobileAppPatterns = [
        { pattern: /whatsapp/i, name: "whatsapp" },
        { pattern: /telegram/i, name: "telegram" },
        { pattern: /line/i, name: "line" },
        { pattern: /viber/i, name: "viber" },
        { pattern: /wechat/i, name: "wechat" },
        { pattern: /messenger/i, name: "messenger" },
        { pattern: /instagram/i, name: "instagram" },
        { pattern: /tiktok/i, name: "tiktok" },
        { pattern: /twitter/i, name: "twitter" },
        { pattern: /linkedin/i, name: "linkedin" },
        { pattern: /discord/i, name: "discord" },
        { pattern: /slack/i, name: "slack" },
      ];
  
      // If no referrer, check user agent for mobile apps
      if (!referrer || referrer === "") {
        for (const app of mobileAppPatterns) {
          if (app.pattern.test(userAgent)) {
            return `mobile_${app.name}`;
          }
        }
  
        // Check if it's a mobile device without referrer
        if (/mobile|android|iphone|ipad|ipod/i.test(userAgent)) {
          return "mobile_direct";
        }
  
        return "direct"; // User typed URL directly or bookmarked
      }
  
      // If referrer is from the same domain, it's internal navigation
      const currentDomain = window.location.hostname;
      const referrerUrl = new URL(referrer);
      const referrerDomain = referrerUrl.hostname;
  
      if (referrerDomain === currentDomain) {
        return "internal"; // Internal navigation within the same site
      }
  
      // Check for common social media and search engine sources
      const socialMediaPatterns = [
        { pattern: /facebook\.com/i, name: "facebook" },
        { pattern: /twitter\.com|x\.com/i, name: "twitter" },
        { pattern: /linkedin\.com/i, name: "linkedin" },
        { pattern: /instagram\.com/i, name: "instagram" },
        { pattern: /youtube\.com/i, name: "youtube" },
        { pattern: /tiktok\.com/i, name: "tiktok" },
        { pattern: /reddit\.com/i, name: "reddit" },
        { pattern: /whatsapp\.com/i, name: "whatsapp" },
        { pattern: /telegram\.org/i, name: "telegram" },
        { pattern: /t\.me/i, name: "telegram" },
        { pattern: /discord\.com/i, name: "discord" },
        { pattern: /slack\.com/i, name: "slack" },
      ];
  
      const searchEnginePatterns = [
        { pattern: /google\./i, name: "google" },
        { pattern: /bing\.com/i, name: "bing" },
        { pattern: /yahoo\.com/i, name: "yahoo" },
        { pattern: /duckduckgo\.com/i, name: "duckduckgo" },
        { pattern: /baidu\.com/i, name: "baidu" },
        { pattern: /yandex\./i, name: "yandex" },
      ];
  
      // Check social media sources
      for (const social of socialMediaPatterns) {
        if (social.pattern.test(referrerDomain)) {
          return `social_${social.name}`;
        }
      }
  
      // Check search engine sources
      for (const search of searchEnginePatterns) {
        if (search.pattern.test(referrerDomain)) {
          return `search_${search.name}`;
        }
      }
  
      // Return the domain name for other external sources
      return `external_${referrerDomain}`;
    } catch (error) {
      console.error("Error getting user source:", error);
      return "unknown";
    }
  };
  
  // Function to get device and browser information
  const getDeviceInfo = () => {
    const navigator = window.navigator;
    const screen = window.screen;
  
    // Detect browser
    const getBrowserInfo = () => {
      const userAgent = navigator.userAgent;
      let browserName = "Unknown";
      let browserVersion = "Unknown";
  
      if (userAgent.indexOf("Chrome") > -1) {
        browserName = "Chrome";
        browserVersion = userAgent.match(/Chrome\/([0-9.]+)/)?.[1] || "Unknown";
      } else if (userAgent.indexOf("Firefox") > -1) {
        browserName = "Firefox";
        browserVersion = userAgent.match(/Firefox\/([0-9.]+)/)?.[1] || "Unknown";
      } else if (userAgent.indexOf("Safari") > -1) {
        browserName = "Safari";
        browserVersion = userAgent.match(/Version\/([0-9.]+)/)?.[1] || "Unknown";
      } else if (userAgent.indexOf("Edge") > -1) {
        browserName = "Edge";
        browserVersion = userAgent.match(/Edge\/([0-9.]+)/)?.[1] || "Unknown";
      } else if (
        userAgent.indexOf("Opera") > -1 ||
        userAgent.indexOf("OPR") > -1
      ) {
        browserName = "Opera";
        browserVersion =
          userAgent.match(/(Opera|OPR)\/([0-9.]+)/)?.[2] || "Unknown";
      }
  
      return { browserName, browserVersion };
    };
  
    // Detect operating system
    const getOSInfo = () => {
      const userAgent = navigator.userAgent;
      let osName = "Unknown";
      let osVersion = "Unknown";
  
      if (userAgent.indexOf("Windows NT 10.0") !== -1) {
        osName = "Windows";
        osVersion = "10";
      } else if (userAgent.indexOf("Windows NT 6.3") !== -1) {
        osName = "Windows";
        osVersion = "8.1";
      } else if (userAgent.indexOf("Windows NT 6.2") !== -1) {
        osName = "Windows";
        osVersion = "8";
      } else if (userAgent.indexOf("Windows NT 6.1") !== -1) {
        osName = "Windows";
        osVersion = "7";
      } else if (userAgent.indexOf("Mac OS X") !== -1) {
        osName = "macOS";
        const match = userAgent.match(/Mac OS X ([0-9_]+)/);
        if (match) {
          osVersion = match[1].replace(/_/g, ".");
        }
      } else if (userAgent.indexOf("X11") !== -1) {
        osName = "UNIX";
      } else if (userAgent.indexOf("Linux") !== -1) {
        osName = "Linux";
      } else if (userAgent.indexOf("Android") !== -1) {
        osName = "Android";
        const match = userAgent.match(/Android ([0-9.]+)/);
        if (match) {
          osVersion = match[1];
        }
      } else if (userAgent.indexOf("like Mac") !== -1) {
        osName = "iOS";
        const match = userAgent.match(/OS ([0-9_]+)/);
        if (match) {
          osVersion = match[1].replace(/_/g, ".");
        }
      }
  
      return { osName, osVersion };
    };
  
    // Detect device type
    const getDeviceType = () => {
      const userAgent = navigator.userAgent;
      if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
        return "tablet";
      } else if (
        /mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(
          userAgent
        )
      ) {
        return "mobile";
      }
      return "desktop";
    };
  
    const { browserName, browserVersion } = getBrowserInfo();
    const { osName, osVersion } = getOSInfo();
    const deviceType = getDeviceType();
  
    return {
      deviceType,
      browser: {
        name: browserName,
        version: browserVersion,
      },
      os: {
        name: osName,
        version: osVersion,
      },
      screen: {
        width: screen.width,
        height: screen.height,
        availWidth: screen.availWidth,
        availHeight: screen.availHeight,
        colorDepth: screen.colorDepth,
      },
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
      timestamp: new Date().toISOString(),
    };
  };
  
  // Function to get user's IP-based location as fallback
  const getIPLocation = async () => {
    try {
      const response = await fetch("https://ipapi.co/json/");
      const data = await response.json();
      return {
        country: data.country_name,
        countryCode: data.country_code,
        city: data.city,
        region: data.region,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone,
        ip: data.ip, // Add IP address to the location data
        source: "ip",
      };
    } catch (error) {
      console.error("IP location detection failed:", error);
      return null;
    }
  };
  
  // Function to get user's GPS location
  const getGPSLocation = () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.log("Geolocation is not supported by this browser");
        resolve(null);
        return;
      }
  
      const options = {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes cache
      };
  
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
  
            // Use a free reverse geocoding service
            try {
              const response = await fetch(
                `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
              );
  
              if (response.ok) {
                const data = await response.json();
  
                resolve({
                  latitude,
                  longitude,
                  country: data.countryName,
                  countryCode: data.countryCode,
                  city: data.city || data.locality,
                  region: data.principalSubdivision,
                  accuracy: position.coords.accuracy,
                  source: "gps",
                });
              } else {
                // If reverse geocoding fails, return basic GPS data
                resolve({
                  latitude,
                  longitude,
                  accuracy: position.coords.accuracy,
                  source: "gps",
                });
              }
            } catch (reverseGeoError) {
              console.error("Reverse geocoding failed:", reverseGeoError);
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                source: "gps",
              });
            }
          } catch (error) {
            console.error("Reverse geocoding failed:", error);
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              source: "gps",
            });
          }
        },
        (error) => {
          console.error("GPS location detection failed:", error);
          resolve(null);
        },
        options
      );
    });
  };
  
  // Main function to get user location with fallback strategy
  export const getUserLocation = async () => {
    try {
      // First try GPS location (most accurate but requires permission)
      const gpsLocation = await getGPSLocation();
      if (gpsLocation) {
        return gpsLocation;
      }
  
      // Fallback to IP-based location
      const ipLocation = await getIPLocation();
      if (ipLocation) {
        return ipLocation;
      }
  
      // If all methods fail, return India as default
      return {
        country: "India",
        countryCode: "IN",
        city: "New Delhi",
        source: "default",
      };
    } catch (error) {
      console.error("Location detection failed:", error);
      return {
        country: "India",
        countryCode: "IN",
        city: "New Delhi",
        source: "error",
        error: error.message,
      };
    }
  };
  
  // Function to get location with timeout
  export const getUserLocationWithTimeout = (timeoutMs = 7000) => {
    return Promise.race([
      getUserLocation(),
      new Promise((resolve) =>
        setTimeout(
          () =>
            resolve({
              country: "India",
              countryCode: "IN",
              city: "New Delhi",
              source: "timeout",
            }),
          timeoutMs
        )
      ),
    ]);
  };
  
  // Function to get comprehensive authentication data
  export const getAuthenticationData = async (loginMethod = null) => {
    try {
      // Get device info and user source synchronously
      const deviceInfo = getDeviceInfo();
      const userSource = getUserSource();
  
      // Get IP address and location data
      const [userIP, locationData] = await Promise.allSettled([
        getUserIP(),
        getUserLocationWithTimeout(5000),
      ]);
  
      const ip = userIP.status === "fulfilled" ? userIP.value : null;
      const location =
        locationData.status === "fulfilled" ? locationData.value : null;
  
      return {
        ip,
        deviceInfo,
        loginMethod,
        location,
        userSource,
      };
    } catch (error) {
      console.error("Error gathering authentication data:", error);
      return {
        ip: null,
        deviceInfo: getDeviceInfo(), // Device info should still work even if other things fail
        loginMethod,
        location: null,
        userSource: getUserSource(), // Still try to get user source even if other things fail
      };
    }
  };
  
  // Function to format location for API
  export const formatLocationForAPI = (location, additionalData = {}) => {
    if (!location) {
      // Return default India location if no location data
      location = {
        country: "India",
        countryCode: "IN",
        city: "New Delhi",
        source: "fallback",
      };
    }
  
    // Always return a uniform payload structure
    return {
      country: location.country || "India",
      countryCode: location.countryCode || "IN",
      city: location.city || "New Delhi",
      region: location.region || null,
      latitude: location.latitude || null,
      longitude: location.longitude || null,
      timezone: location.timezone || null,
      accuracy: location.accuracy || null,
      source: location.source || "unknown",
      timestamp: new Date().toISOString(),
      error: location.error || null,
      // New fields
      ip: additionalData.ip || location.ip || null,
      deviceInfo: additionalData.deviceInfo || null,
      loginMethod: additionalData.loginMethod || null,
      userSource: additionalData.userSource || null,
    };
  };
  