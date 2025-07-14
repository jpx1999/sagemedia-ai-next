import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import useWindowSize from "../hooks/useWindowSize";

const LeftMenu = ({
  darkMode,
  menuVisible,
  setMenuVisible,
  toggleDarkMode,
  partialAccess = false,
  onLoginRequired,
  // Add new props for dynamic height and iOS keyboard handling
  viewportHeight = 0,
  headerHeight = 64,
  isClient = false,
  isKeyboardOpen = false,
  isIOS = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [labelOpacity, setLabelOpacity] = useState(menuVisible ? 1 : 0);
  const opacityTimeoutRef = useRef(null);
  const [currentPath, setCurrentPath] = useState(location.pathname);
  const menuRef = useRef(null); // Reference for the menu itself
  const { width: windowWidth } = useWindowSize();

  // Get user role from Redux store
  const userRole = useSelector((state) => state.auth.role);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  // Track location changes to ensure active state updates
  useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location]);

  // This effect handles closing the menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      // Check if menu is visible and click is outside menu and not on the toggle button
      if (
        menuVisible &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        // Make sure we don't count clicks on the menu toggle button
        !event.target.closest('button[data-menu-toggle="true"]')
      ) {
        setMenuVisible(false);
      }
    }

    // Add the event listener to detect clicks outside
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuVisible, setMenuVisible]);

  // ADDED: Body scroll lock for mobile
  useEffect(() => {
    if (windowWidth < 640) {
      if (menuVisible) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuVisible, windowWidth]);

  // Manage label opacity with delay to avoid jarring effect
  useEffect(() => {
    setLabelOpacity(menuVisible ? 1 : 0);

    if (opacityTimeoutRef.current) {
      clearTimeout(opacityTimeoutRef.current);
    }

    if (menuVisible) {
      // Show the menu first, then fade in labels after slight delay
      opacityTimeoutRef.current = setTimeout(() => {
        setLabelOpacity(1);
      }, 150); // Half the time of the width transition for a natural effect
    } else {
      // Hide labels first, then collapse the menu
      setLabelOpacity(0);
    }

    return () => {
      if (opacityTimeoutRef.current) {
        clearTimeout(opacityTimeoutRef.current);
      }
    };
  }, [menuVisible]);

  // Improved helper to check if a route is active
  const isActive = (path) => {
    if (path === "/" && currentPath === "/") {
      return true;
    }
    // Direct match
    if (path && currentPath === path) {
      return true;
    }
    // Check if current path starts with the menu path (for nested routes)
    if (path && path !== "/" && currentPath.startsWith(path)) {
      return true;
    }
    return false;
  };

  // Calculate dynamic heights - menu should fill remaining space after header
  const calculatedHeight = isClient
    ? `${viewportHeight - headerHeight}px`
    : "calc(100vh - 64px)";

  // console.log("LeftMenu Height Calculation:", {
  //   isClient,
  //   viewportHeight,
  //   headerHeight,
  //   calculatedHeight,
  //   isKeyboardOpen,
  //   isIOS,
  // });

  const styles = {
    leftMenu: {
      width:
        windowWidth < 640
          ? menuVisible
            ? "300px" // CHANGED: was "300px", now "100vw" for full screen
            : "0"
          : menuVisible
          ? "300px"
          : "60px",
      height: calculatedHeight,
      backgroundColor: darkMode ? "#000" : "#f0f0f0",
      flexDirection: "column",
      zIndex: 999,
      transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
      position: "absolute", // Always absolute, not fixed - scrolls with page
      paddingTop: "16px",
      display: "flex",
      top: "64px", // Start at 0, right after header
      left: "0",
      boxShadow: darkMode
        ? "4px 0 15px rgba(0, 0, 0, 0.2)"
        : "4px 0 15px rgba(0, 0, 0, 0.1)",
      overflowY: "auto",
      overflowX: "hidden",
      // Hardware acceleration for smooth transitions
      transform: "translateZ(0)",
      willChange: "width",
      borderRight: `1px solid ${darkMode ? "#2a2a2a" : "#d0d0d0"}`,
    },
    leftMenuItem: {
      display: "flex",
      alignItems: "center",
      padding: menuVisible ? "16px" : "16px 0",
      justifyContent: menuVisible ? "flex-start" : "center",
      color: darkMode ? "#ffffff" : "#000000",
      fontSize: "16px",
      cursor: "pointer",
      transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
      // Prevent text selection on mobile
      userSelect: "none",
      WebkitUserSelect: "none",
      WebkitTouchCallout: "none",
    },
    activeMenuItem: {
      paddingLeft: menuVisible ? "12px" : "0",
    },
    leftMenuLabel: {
      opacity: labelOpacity,
      transition: "opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
      visibility: labelOpacity === 0 && !menuVisible ? "hidden" : "visible",
      whiteSpace: "nowrap",
      overflow: "hidden",
      maxWidth: menuVisible ? "240px" : "0",
      // Prevent text selection
      userSelect: "none",
      WebkitUserSelect: "none",
    },
    // Regular menu item style for toggle wrapper - not fixed at bottom
    toggleWrapper: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "16px",
      color: darkMode ? "#ffffff" : "#000000",
      fontSize: "16px",
      opacity: labelOpacity,
      transition: "opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
      visibility: labelOpacity === 0 && !menuVisible ? "hidden" : "visible",
      pointerEvents: labelOpacity > 0.5 ? "auto" : "none",
      position: "relative",
      // Remove flexShrink and minHeight - let it flow naturally
    },
    toggleSwitch: {
      position: "relative",
      width: "40px",
      height: "20px",
      backgroundColor: darkMode ? "#3498ff" : "#ccc",
      borderRadius: "20px",
      cursor: "pointer",
      transition: "background-color 0.6s",
      // Prevent touch highlighting
      WebkitTapHighlightColor: "transparent",
    },
    toggleKnob: {
      position: "absolute",
      width: "16px",
      height: "16px",
      backgroundColor: "#fff",
      borderRadius: "50%",
      top: "2px",
      left: darkMode ? "22px" : "2px",
      transition: "left 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
    },
    // Regular menu item style for footer - not fixed at bottom
    leftMenuFooter: {
      display: "flex",
      alignItems: "center",
      padding: menuVisible ? "16px" : "16px 0",
      justifyContent: menuVisible ? "flex-start" : "center",
      color: darkMode ? "#ffffff" : "#000000",
      fontSize: "16px",
      cursor: "pointer",
      transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
      // Remove marginTop: auto, flexShrink, and minHeight - let it flow naturally
    },
  };

  // Menu items with their routes - could be moved to a config file
  const allMenuItems = [
    {
      name: "News Intelligence",
      path: "/news-intelligence",
      lightIcon: "/images/globe_book-light.svg",
      darkIcon: "/images/globe_book-dark.svg",
    },
    {
      name: "Search History",
      path: "/search-history",
      lightIcon: "/images/manage_search-light.svg",
      darkIcon: "/images/manage_search-dark.svg",
    },
    {
      name: "Admin Dashboard",
      path: "/admin-dashboard",
      lightIcon: "/images/workspaces-light.svg",
      darkIcon: "/images/workspaces-dark.svg",
      adminOnly: true, // Mark this item as admin-only
    },
    // {
    //   name: "Bookmarks",
    //   path: "/bookmarks",
    //   lightIcon: "/images/menu-bookmark-light.svg",
    //   darkIcon: "/images/menu-bookmark-dark.svg",
    // },
    // {
    //   name: "My Playlist",
    //   path: "#",
    //   lightIcon: "/images/playlist_play-light.svg",
    //   darkIcon: "/images/playlist_play-dark.svg",
    // },
    // {
    //   name: "Subscription",
    //   path: "/subscription",
    //   lightIcon: "/images/page_info-light.svg",
    //   darkIcon: "/images/page_info-dark.svg",
    // },
    // {
    //   name: "Settings",
    //   path: "#",
    //   lightIcon: "/images/page_info-light.svg",
    //   darkIcon: "/images/page_info-dark.svg",
    // },
  ];

  // Filter menu items based on user role
  const menuItems = allMenuItems.filter((item) => {
    // If item is admin-only, only show it to admin users
    if (item.adminOnly) {
      return isLoggedIn && userRole === "admin";
    }
    // Show all other items to everyone
    return true;
  });

  // Handle navigation with protection for partial access
  const handleNavigate = (path) => {
    if (path === "#") return; // Placeholder paths

    if (partialAccess) {
      if (onLoginRequired) {
        onLoginRequired();
      }
      return;
    }

    navigate(path);

    // For mobile devices, close the menu after navigation
    if (windowWidth < 640) {
      setMenuVisible(false);
    }
  };

  return (
    <>
      {/* ADDED: Mobile backdrop overlay */}
      {menuVisible && windowWidth < 640 && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 99,
          }}
          onClick={() => setMenuVisible(false)}
        />
      )}

      <div ref={menuRef} style={styles.leftMenu} className="left-menu-animated">
        {/* All menu items flow naturally - no fixed sections */}
        {menuItems.map((item) => {
          const active = isActive(item.path);

          // If active, always use light icon; if inactive, use icon based on theme
          const iconSrc = darkMode
            ? active
              ? item.lightIcon
              : item.darkIcon // Dark mode: active=light, inactive=dark
            : item.darkIcon; // Light mode: always dark icons

          return (
            <div
              key={item.name}
              style={{
                ...styles.leftMenuItem,
                ...(active ? styles.activeMenuItem : {}),
              }}
              className={`${active ? "active-menu-item" : ""}`}
              onClick={() => handleNavigate(item.path)}
            >
              <span className="w-16 flex justify-center">
                <img src={iconSrc} alt={item.name} />
              </span>
              <span className="menu-label" style={styles.leftMenuLabel}>
                {item.name}
              </span>
            </div>
          );
        })}

        {/* Dark mode toggle - flows naturally with other menu items */}
        {/* <div style={styles.toggleWrapper} className="toggle-wrapper">
          <span className="flex">
            <span className="w-16 flex justify-center">
              <img
                src={
                  darkMode
                    ? "/images/routine-light.svg"
                    : "/images/routine-dark.svg"
                }
                alt="Theme toggle"
              />
            </span>
            Dark Mode
          </span>
          <div
            style={styles.toggleSwitch}
            onClick={
              partialAccess ? onLoginRequired || (() => {}) : toggleDarkMode
            }
            className="toggle-switch"
          >
            <div style={styles.toggleKnob} className="toggle-knob"></div>
          </div>
        </div> */}

        {/* Footer - flows naturally with other menu items */}
        <div style={styles.leftMenuFooter} className="footer mt-auto">
          <span className="w-16 flex justify-center">
            <img
              src={
                darkMode
                  ? "/images/spiderx-logo-light.svg"
                  : "/images/spiderx-logo-dark.svg"
              }
              alt="Theme toggle"
            />
          </span>
          <a
            href="https://spiderx.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-label flex text-sm text-gray-500"
            style={styles.leftMenuLabel}
          >
            <span className="me-3">Powered by</span>
            <img
              src={
                darkMode
                  ? "/images/powerdby-logo-light.svg"
                  : "/images/powerdby-logo-dark.svg"
              }
              style={{
                backgroundRepeat: "no-repeat",
              }}
              alt="Powered by"
            />
          </a>
        </div>

        {/* Simplified CSS - no fixed positioning */}
        <style jsx="true">{`
          .left-menu-animated {
            transition: width 0.6s cubic-bezier(0.4, 0, 0.2, 1),
              box-shadow 0.6s ease;
          }

          .menu-label,
          .footer-label {
            transition: opacity 0.6s ease, max-width 0.6s ease;
            overflow: hidden;
          }

          .toggle-wrapper {
            overflow: hidden;
            transition: opacity 0.6s ease;
          }

          .toggle-switch {
            transition: background-color 0.6s ease;
          }

          .toggle-knob {
            transition: left 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          }

          /* Mobile specific adjustments */
          @media (max-width: 640px) {
            .left-menu-animated {
              transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
              /* Keep absolute positioning - scrolls with page */
              left: 0;
              top: 0;
            }
          }

          /* Prevent text selection on menu items */
          .left-menu-animated * {
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            -khtml-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
          }

          /* Allow text selection only for links */
          .left-menu-animated a {
            -webkit-user-select: auto;
            -moz-user-select: auto;
            -ms-user-select: auto;
            user-select: auto;
          }

          /* Improve touch targets for mobile */
          @media (max-width: 640px) {
            .left-menu-animated div[style*="cursor: pointer"] {
              // min-height: 44px;
              display: flex;
              align-items: center;
            }
          }
        `}</style>
      </div>
    </>
  );
};

export default LeftMenu;
