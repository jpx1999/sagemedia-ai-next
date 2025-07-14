import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Header from "../Header";
import LeftMenu from "../LeftMenu";
import { setcurrentTheme } from "../../store/slice/themeSlice";
import useWindowSize from "../../hooks/useWindowSize";
const DashboardLayout = ({
  children,
  isDarkTheme,
  partialAccess = false,
  onLoginRequired,
  // Search-related props (only used for NewsIntelligence)
  showSearch = false,
  searchText = "",
  setSearchText,
  onSearch,
  searchSuggestions = [],
  onSuggestionClick,
  clearRefreshNews,
}) => {
  const dispatch = useDispatch();

  // Theme and UI state
  const [darkMode, setDarkMode] = useState(isDarkTheme);
  const [userMenuVisible, setUserMenuVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const { width: windowWidth } = useWindowSize();
  // Viewport and keyboard handling states
  const [viewportHeight, setViewportHeight] = useState(0);
  const [headerHeight, setHeaderHeight] = useState(64);
  const [isClient, setIsClient] = useState(false);

  // Refs for hover functionality and height calculation
  const menuTimeoutRef = useRef(null);
  const menuAreaRef = useRef(null);
  const headerRef = useRef(null);
  const containerRef = useRef(null);

  // Theme definitions
  const themes = {
    dark: {
      backgroundColor: "#000",
      textColor: "#ffffff",
      secondaryBg: "#1a1a1a",
      navBg: "#000",
      sidebarBg: "#22262a",
      borderColor: "#2a2a2a",
      accentColor: "#3498ff",
      mutedText: "#9a9a9a",
      inputBg: "#2a2a2a",
      cardBg: "#000",
      popupBg: "#22262A",
    },
    light: {
      backgroundColor: "#ffffff",
      textColor: "#000000",
      secondaryBg: "#f0f0f0",
      navBg: "#f0f0f0",
      sidebarBg: "#e0e0e0",
      borderColor: "#d0d0d0",
      accentColor: "#3498ff",
      mutedText: "#666666",
      inputBg: "#f5f5f5",
      cardBg: "#ffffff",
      popupBg: "#f0f0f0",
    },
  };

  const currentTheme = useSelector((state) => state.theme.currentTheme);

  // Calculate viewport height
  const calculateViewportHeight = () => {
    return window.innerHeight;
  };

  // Calculate header height dynamically
  const calculateHeaderHeight = () => {
    if (headerRef.current) {
      const rect = headerRef.current.getBoundingClientRect();
      return rect.height;
    }
    return 64; // Default fallback
  };

  // Update viewport dimensions
  const updateViewportDimensions = () => {
    const newViewportHeight = calculateViewportHeight();
    const newHeaderHeight = calculateHeaderHeight();

    setViewportHeight(newViewportHeight);
    setHeaderHeight(newHeaderHeight);
  };

  // Effect for handling viewport changes
  useEffect(() => {
    setIsClient(true);

    // Initial calculation
    updateViewportDimensions();

    // Debounced resize handler
    let resizeTimeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateViewportDimensions, 50);
    };

    // Orientation change handler
    const handleOrientationChange = () => {
      setTimeout(() => {
        updateViewportDimensions();
      }, 300);
    };

    // Visibility change handler
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setTimeout(() => {
          updateViewportDimensions();
        }, 100);
      }
    };

    // Add event listeners
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleOrientationChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup
    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleOrientationChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Update header height when header ref changes
  useEffect(() => {
    if (headerRef.current) {
      updateViewportDimensions();
    }
  }, [headerRef.current]);

  // Update dark mode state
  useEffect(() => setDarkMode(isDarkTheme), [isDarkTheme]);

  // Update theme on dark mode change
  useEffect(() => {
    dispatch(setcurrentTheme(darkMode ? themes.dark : themes.light));
  }, [darkMode, dispatch]);

  // Function for toggle menu
  const toggleMenu = () => {
    // Clear any timeouts to prevent conflicts
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current);
      menuTimeoutRef.current = null;
    }
    setMenuVisible((prev) => !prev);
  };

  // Function to open menu on hover
  const handleMenuMouseEnter = () => {
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current);
      menuTimeoutRef.current = null;
    }
    setMenuVisible(true);
  };

  // Function to handle mouse leave from menu area
  const handleMenuMouseLeave = () => {
    menuTimeoutRef.current = setTimeout(() => {
      setMenuVisible(false);
    }, 300);
  };

  // Calculate dynamic heights
  const mobileSearchHeight = showSearch && windowWidth < 640 ? 70 : 0; // Mobile search bar height
  const calculatedMainHeight = isClient
    ? viewportHeight - headerHeight - mobileSearchHeight
    : "calc(100vh - 64px)";

  const calculatedContainerHeight = isClient ? `${viewportHeight}px` : "100vh";

  const styles = {
    container: {
      display: "flex",
      flexDirection: "column",
      height: calculatedContainerHeight,
      backgroundColor: currentTheme.backgroundColor,
      color: currentTheme.textColor,
      fontFamily: "'Poppins', sans-serif",
      overflow: "hidden",
      position: "relative",
      width: "100%",
    },
    mainContainer: {
      height: isClient ? `${calculatedMainHeight}px` : "calc(100vh - 64px)",
      position: "relative",
      overflow: "hidden",
      // Add top margin on mobile to account for fixed mobile search bar
      marginTop: showSearch && windowWidth < 640 ? "10px" : "0",
    },
    contentWrapper: {
      display: "flex",
      height: "100%",
      position: "relative",
    },
  };

  // Cleanup function
  useEffect(() => {
    return () => {
      if (menuTimeoutRef.current) {
        clearTimeout(menuTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div style={styles.container} ref={containerRef}>
      <div ref={headerRef}>
        <Header
          darkMode={darkMode}
          searchText={showSearch ? searchText : ""}
          setSearchText={showSearch ? setSearchText : () => {}}
          userMenuVisible={userMenuVisible}
          setUserMenuVisible={setUserMenuVisible}
          toggleMenu={toggleMenu}
          menuVisible={menuVisible}
          setMenuVisible={setMenuVisible}
          onSearch={showSearch ? onSearch : () => {}}
          partialAccess={partialAccess}
          onLoginRequired={onLoginRequired}
          headerRef={headerRef}
          searchSuggestions={showSearch ? searchSuggestions : []}
          onSuggestionClick={showSearch ? onSuggestionClick : () => {}}
          showSearch={showSearch} // Pass this prop to conditionally render search
          clearRefreshNews={clearRefreshNews}
        />
      </div>

      <div
        ref={menuAreaRef}
        onMouseEnter={handleMenuMouseEnter}
        onMouseLeave={handleMenuMouseLeave}
      >
        <LeftMenu
          darkMode={darkMode}
          menuVisible={menuVisible}
          setMenuVisible={setMenuVisible}
          toggleDarkMode={() => setDarkMode(!darkMode)}
          partialAccess={partialAccess}
          onLoginRequired={onLoginRequired}
          viewportHeight={viewportHeight}
          headerHeight={headerHeight}
          isClient={isClient}
        />
      </div>

      <div style={styles.mainContainer}>
        <div style={styles.contentWrapper}>{children}</div>
      </div>
    </div>
  );
};

export default DashboardLayout;
