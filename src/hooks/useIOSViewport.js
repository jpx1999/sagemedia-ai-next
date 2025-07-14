// Create this file as: src/hooks/useIOSViewport.js

import { useState, useEffect, useCallback } from "react";

export const useIOSViewport = () => {
  const [viewportHeight, setViewportHeight] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(64);
  const [isIOS, setIsIOS] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // Detect iOS
  const detectIOS = useCallback(() => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
  }, []);

  // Calculate viewport height with iOS-specific logic
  const calculateViewportHeight = useCallback(() => {
    const iOS = detectIOS();

    if (iOS) {
      // Use visualViewport API if available (iOS 13+)
      if (window.visualViewport) {
        return window.visualViewport.height;
      }

      // Fallback for older iOS versions
      return document.documentElement.clientHeight;
    }

    // For non-iOS devices
    return window.innerHeight;
  }, [detectIOS]);

  // Calculate header height dynamically
  const calculateHeaderHeight = useCallback((headerRef) => {
    if (headerRef?.current) {
      const rect = headerRef.current.getBoundingClientRect();
      return rect.height;
    }
    return 64; // Default fallback
  }, []);

  // Set CSS custom property for dynamic viewport height
  const setCSSViewportHeight = useCallback((height) => {
    document.documentElement.style.setProperty("--vh", `${height}px`);
  }, []);

  // Update viewport dimensions
  const updateViewportDimensions = useCallback(
    (headerRef = null) => {
      const newViewportHeight = calculateViewportHeight();
      const newHeaderHeight = calculateHeaderHeight(headerRef);

      setViewportHeight(newViewportHeight);
      setHeaderHeight(newHeaderHeight);
      setCSSViewportHeight(newViewportHeight);
    },
    [calculateViewportHeight, calculateHeaderHeight, setCSSViewportHeight]
  );

  // Initialize and setup event listeners
  useEffect(() => {
    setIsClient(true);
    const iOS = detectIOS();
    setIsIOS(iOS);

    // Initial calculation
    updateViewportDimensions();

    // Debounced handler
    let timeoutId;
    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => updateViewportDimensions(), 50);
    };

    if (iOS) {
      // iOS-specific event listeners
      if (window.visualViewport) {
        window.visualViewport.addEventListener("resize", debouncedUpdate);
        window.visualViewport.addEventListener("scroll", debouncedUpdate);
      }

      // Handle orientation changes with delay for iOS
      const handleOrientationChange = () => {
        setTimeout(() => updateViewportDimensions(), 500);
      };

      window.addEventListener("orientationchange", handleOrientationChange);
      window.addEventListener("pageshow", debouncedUpdate);
      window.addEventListener("pagehide", debouncedUpdate);

      // Cleanup iOS listeners
      return () => {
        clearTimeout(timeoutId);

        if (window.visualViewport) {
          window.visualViewport.removeEventListener("resize", debouncedUpdate);
          window.visualViewport.removeEventListener("scroll", debouncedUpdate);
        }

        window.removeEventListener(
          "orientationchange",
          handleOrientationChange
        );
        window.removeEventListener("pageshow", debouncedUpdate);
        window.removeEventListener("pagehide", debouncedUpdate);
      };
    } else {
      // Standard event listeners for non-iOS
      const handleResize = () => debouncedUpdate();
      const handleOrientationChange = () => {
        setTimeout(() => updateViewportDimensions(), 300);
      };
      const handleVisibilityChange = () => {
        if (document.visibilityState === "visible") {
          setTimeout(() => updateViewportDimensions(), 100);
        }
      };

      window.addEventListener("resize", handleResize);
      window.addEventListener("orientationchange", handleOrientationChange);
      document.addEventListener("visibilitychange", handleVisibilityChange);

      return () => {
        clearTimeout(timeoutId);
        window.removeEventListener("resize", handleResize);
        window.removeEventListener(
          "orientationchange",
          handleOrientationChange
        );
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
      };
    }
  }, [detectIOS, updateViewportDimensions]);

  // Generate styles object with iOS fixes
  const getContainerStyles = useCallback(
    (theme) => {
      const mobileSearchHeight = windowWidth < 640 ? 70 : 0;
      const calculatedMainHeight = isClient
        ? viewportHeight - headerHeight - mobileSearchHeight
        : 0;

      return {
        container: {
          display: "flex",
          flexDirection: "column",
          height: isIOS
            ? isClient
              ? `${viewportHeight}px`
              : "var(--vh, 100vh)"
            : isClient
            ? `${viewportHeight}px`
            : "100vh",
          minHeight: isIOS ? "100vh" : "auto",
          backgroundColor: theme.backgroundColor,
          color: theme.textColor,
          fontFamily: "'Poppins', sans-serif",
          overflow: "hidden",
          position: isIOS ? "fixed" : "relative",
          width: "100%",
          top: isIOS ? 0 : "auto",
          left: isIOS ? 0 : "auto",
          paddingTop: isIOS ? "env(safe-area-inset-top)" : 0,
          paddingBottom: isIOS ? "env(safe-area-inset-bottom)" : 0,
          paddingLeft: isIOS ? "env(safe-area-inset-left)" : 0,
          paddingRight: isIOS ? "env(safe-area-inset-right)" : 0,
        },
        mainContainer: {
          height: isIOS
            ? isClient
              ? `${calculatedMainHeight}px`
              : "calc(var(--vh, 100vh) - 64px)"
            : isClient
            ? `${calculatedMainHeight}px`
            : "calc(100vh - 64px)",
          position: "relative",
          overflow: "hidden",
          marginTop: windowWidth < 640 ? "70px" : "0",
          flex: isIOS ? "1 1 auto" : "none",
          minHeight: isIOS ? 0 : "auto",
        },
      };
    },
    [isIOS, isClient, viewportHeight, headerHeight]
  );

  return {
    viewportHeight,
    headerHeight,
    isIOS,
    isClient,
    updateViewportDimensions,
    getContainerStyles,
  };
};
