'use client'
import { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faTimesCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { handleLogout } from "../helpers/authHelper";
import Settings from "./Settings";
import RemainingSearch from "./RemainingSearch";
import NotificationList from "./NotificationList"; // Import the NotificationList component
import useWindowSize from "./../hooks/useWindowSize";
// ADD THESE IMPORTS FOR NOTIFICATION API
import {
  userPlan,
  getNotificationsHistory,
  markNotificationAsRead,
  // markAllNotificationsAsRead,
  deleteNotificationById,
} from "../helpers/api";
import { incrementNotificationRefreshTrigger } from "../store/slice/newsDetailsSlice";
import notificationService from "../utils/notificationService";

const Header = ({
  darkMode,
  searchText,
  setSearchText,
  userMenuVisible,
  setUserMenuVisible,
  toggleMenu,
  menuVisible,
  setMenuVisible,
  onSearch,
  partialAccess = false,
  onLoginRequired,
  // Add refs for dynamic height calculation and iOS keyboard handling
  headerRef,
  isKeyboardOpen = false,
  isIOS = false,
  // Add search suggestions props
  searchSuggestions = [],
  onSuggestionClick,
  // Add showSearch prop to conditionally render search
  showSearch = true,
  clearRefreshNews,
}) => {
  const router = useRouter();
  const [isSearching, setIsSearching] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const userData = useSelector((state) => state.auth.user);
  const userMenuRef = useRef(null);
  const menuButtonRef = useRef(null);
  // Add refs for search inputs to control focus
  const desktopSearchInputRef = useRef(null);
  const mobileSearchInputRef = useRef(null);
  const [menuAnimation, setMenuAnimation] = useState("");
  const role = useSelector((state) => state.auth.role);
  const { width: windowWidth } = useWindowSize();
  const latestSearchRef = useRef(0);
  const [subscriptionStatus, setSubscriptionStatus] = useState(false);

  // ADD REDUX DISPATCH
  const dispatch = useDispatch();

  // ADD REDUX SELECTOR FOR NOTIFICATION REFRESH TRIGGER
  const notificationRefreshTrigger = useSelector(
    (state) => state.newsDetails.notificationRefreshTrigger
  );

  // ADD THESE NOTIFICATION STATES
  const [notifications, setNotifications] = useState([]);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // ADD THESE NOTIFICATION FUNCTIONS
  // Transform API response to UI format
  const transformNotifications = (apiNotifications) => {
    return apiNotifications.map((notification) => ({
      id: notification.id,
      title: notification.title,
      message: notification.body.replace(/•/g, "").replace(/\n/g, " ").trim(),
      type: getNotificationType(notification.topic),
      isRead: notification.is_read, // Use the actual is_read value from API
      timestamp: notification.created_at,
      actionUrl: `/news-intelligence?group_id=${notification.group_id}&country=${notification.country}`,
      topic: notification.topic,
      country: notification.country,
      group_id: notification.group_id,
      message_id: notification.message_id,
    }));
  };

  // Determine notification type based on topic/content
  const getNotificationType = (topic) => {
    const topicLower = topic.toLowerCase();
    if (topicLower.includes("urgent") || topicLower.includes("alert")) {
      return "urgent";
    }
    if (topicLower.includes("warning") || topicLower.includes("limit")) {
      return "warning";
    }
    if (topicLower.includes("success") || topicLower.includes("completed")) {
      return "success";
    }
    return "info";
  };

  // Fetch notifications from API
  const fetchNotifications = async (loadMore = false) => {
    if (partialAccess) return; // Don't fetch if user is not logged in

    setNotificationLoading(true);

    try {
      const response = await getNotificationsHistory();

      if (response.status === 0 && response.notifications) {
        const transformedNotifications = transformNotifications(
          response.notifications
        );

        if (loadMore) {
          setNotifications((prev) => [...prev, ...transformedNotifications]);
        } else {
          setNotifications(transformedNotifications);
        }

        // Calculate counts
        const total = transformedNotifications.length;
        const unread = transformedNotifications.filter((n) => !n.isRead).length;

        if (!loadMore) {
          setTotalCount(total);
          setUnreadCount(unread);
        } else {
          // Update counts when loading more
          setTotalCount((prev) => prev + total);
          setUnreadCount((prev) => prev + unread);
        }

        // Check if there are more notifications
        // setHasMore(transformedNotifications.length === limit);
      } else {
        if (!loadMore) {
          setNotifications([]);
          setTotalCount(0);
          setUnreadCount(0);
        }
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      if (!loadMore) {
        setNotifications([]);
        setTotalCount(0);
        setUnreadCount(0);
      }
      setHasMore(false);
    } finally {
      setNotificationLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);

      // Refetch notifications to ensure UI is in sync
      await fetchNotifications();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await markNotificationAsRead(true); // Pass true to mark all as read

      // Refetch notifications to ensure UI is in sync
      await fetchNotifications();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      await deleteNotificationById(notificationId);

      // Refetch notifications to ensure UI is in sync
      await fetchNotifications();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Load more notifications
  const loadMoreNotifications = async () => {
    if (hasMore && !notificationLoading) {
      await fetchNotifications(true);
    }
  };

  // Enhanced header styles with sticky positioning and mobile keyboard handling
  const styles = {
    header: {
      display: "flex",
      alignItems: "center",
      padding: "0 10px",
      backgroundColor: darkMode ? "#000" : "#ffffff",
      borderBottom: `1px solid ${darkMode ? "#2a2a2a" : "#d0d0d0"}`,
      height: "64px",
      position: "sticky",
      top: 0,
      zIndex: 100,
      width: "100%",
      // Prevent header from being affected by keyboard on mobile
      transform: "translateZ(0)", // Hardware acceleration
      willChange: "transform", // Optimize for transforms
      // Ensure header stays fixed during keyboard show/hide
      backfaceVisibility: "hidden",
    },
    mobileSearchContainer: {
      // CHANGED: Mobile search container styles - positioned as overlay
      position: "fixed", // ADDED: Fixed positioning
      zIndex: 9, // ADDED: Higher z-index
      top: "64px", // Right after main header
      left: "0",
      right: "0",
      padding: "8px 16px",
      backgroundColor: darkMode ? "#000" : "#ffffff",
      borderBottom: `1px solid ${darkMode ? "#2a2a2a" : "#d0d0d0"}`,
    },
    suggestionsContainer: {
      position: "absolute",
      top: "100%",
      left: "0",
      right: "0",
      backgroundColor: darkMode ? "#000" : "#ffffff",
      border: `1px solid ${darkMode ? "#2a2a2a" : "#d0d0d0"}`,
      borderTop: "none",
      borderRadius: "0 0 12px 12px",
      maxHeight: "200px",
      overflowY: "auto",
      zIndex: 1000,
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    },
    suggestionItem: {
      padding: "12px 16px",
      cursor: "pointer",
      borderBottom: `1px solid ${darkMode ? "#2a2a2a" : "#e0e0e0"}`,
      fontSize: "14px",
      color: darkMode ? "#ffffff" : "#000000",
      transition: "background-color 0.2s ease",
    },
  };

  // Handle clicks outside user menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        closeUserMenu();
      }
    }

    if (userMenuVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuVisible]);

  // Track when component is mounted to prevent hydration mismatches
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Update menu animation state
  useEffect(() => {
    setMenuAnimation(userMenuVisible ? "dropdown-open" : "dropdown-close");
  }, [userMenuVisible]);

  useEffect(() => {
    const getUserPlan = async () => {
      try {
        const plan = await userPlan();
        if (plan.status === 1 && plan?.plan?.subscription_status === "active") {
          setSubscriptionStatus(true);
        } else {
          setSubscriptionStatus(false);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getUserPlan();
  }, []);

  // ADD THIS NEW useEffect FOR FETCHING NOTIFICATIONS
  // Fetch notifications on mount
  useEffect(() => {
    if (!partialAccess) {
      fetchNotifications();
    }
  }, [partialAccess]);

  // ADD THIS NEW useEffect FOR PERIODIC NOTIFICATION REFRESH
  // Set up 5-minute interval for refreshing notifications
  useEffect(() => {
    if (partialAccess) return; // Don't set up interval if user is not logged in

    const interval = setInterval(() => {
      fetchNotifications();
    }, 5 * 60 * 1000); // 5 minutes in milliseconds

    return () => {
      clearInterval(interval);
    };
  }, [partialAccess]);

  // ADD THIS: Watch for Redux notification refresh trigger changes
  useEffect(() => {
    if (!partialAccess && notificationRefreshTrigger > 0) {
      fetchNotifications();
    }
  }, [notificationRefreshTrigger, partialAccess]);

  // ADD THIS: Register callback for when new notifications are received (real-time sync)
  useEffect(() => {
    if (!partialAccess) {
      // Register callback to refresh notifications when new ones are received
      notificationService.onNotificationReceived((payload) => {
        console.log(
          "🔄 Triggering notification refresh due to new notification:",
          payload
        );
        dispatch(incrementNotificationRefreshTrigger());
      });
    }

    return () => {
      // Clean up callback on unmount or when user logs out
      if (!partialAccess) {
        notificationService.onNotificationReceived(null);
      }
    };
  }, [partialAccess, dispatch]);

  // ADD THIS: Refresh notifications when app regains focus (for background notifications)
  useEffect(() => {
    if (partialAccess) return;

    const handleFocus = () => {
      console.log("🔄 App regained focus, refreshing notifications...");
      dispatch(incrementNotificationRefreshTrigger());
    };

    // Add focus event listener
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [partialAccess, dispatch]);

  // Get viewport width once and use it for responsive calculations
  const isSmallScreen = windowWidth < 640;

  const handleSearch = (e) => {
    if (partialAccess && onLoginRequired) {
      onLoginRequired();
      return;
    }
    setSearchText(e.target.value);
  };

  // FIXED: Enhanced handleKeyPress with keyboard dismissal
  const handleKeyPress = (e) => {
    if (partialAccess && onLoginRequired) {
      onLoginRequired();
      return;
    }

    if (e.key === "Enter" && searchText.trim()) {
      // Blur the input to dismiss keyboard on mobile
      if (e.target) {
        e.target.blur();
      }
      handleSearchSubmit();
    }
  };

  // FIXED: Enhanced handleSearchSubmit with keyboard dismissal
  const handleSearchSubmit = () => {
    if (partialAccess && onLoginRequired) {
      onLoginRequired();
      return;
    }

    if (searchText.trim()) {
      // Dismiss keyboard on mobile by blurring active input
      if (isSmallScreen) {
        if (mobileSearchInputRef.current) {
          mobileSearchInputRef.current.blur();
        }
        if (desktopSearchInputRef.current) {
          desktopSearchInputRef.current.blur();
        }
        // Also blur any currently focused element
        if (document.activeElement) {
          document.activeElement.blur();
        }
      }

      setIsSearching(true);
      latestSearchRef.current += 1; // Increment for each new search
      const thisSearch = latestSearchRef.current;

      if (typeof onSearch === "function") {
        onSearch(searchText.trim()).finally(() => {
          // Only clear loading if this is the latest search
          if (thisSearch === latestSearchRef.current) {
            setIsSearching(false);
          }
        });
      } else {
        setTimeout(() => {
          if (thisSearch === latestSearchRef.current) {
            setIsSearching(false);
          }
        }, 500);
      }
    }
  };

  const clearSearch = () => {
    if (partialAccess && onLoginRequired) {
      onLoginRequired();
      return;
    }

    setSearchText("");
    setIsSearching(false); // Clear loading state when search is cleared

    // FIXED: Dismiss keyboard when clearing search on mobile
    if (isSmallScreen) {
      if (mobileSearchInputRef.current) {
        mobileSearchInputRef.current.blur();
      }
      if (desktopSearchInputRef.current) {
        desktopSearchInputRef.current.blur();
      }
      // Also blur any currently focused element
      if (document.activeElement) {
        document.activeElement.blur();
      }
    }

    if (typeof onSearch === "function") {
      onSearch("");
    }
  };

  const toggleUserMenu = (e) => {
    e.stopPropagation();
    if (partialAccess && onLoginRequired) {
      onLoginRequired();
      return;
    }
    setUserMenuVisible(!userMenuVisible);
  };

  const closeUserMenu = () => {
    setUserMenuVisible(false);
  };

  const getUserInitials = () => {
    // Always return "DU" during SSR and before mounting to prevent hydration mismatch
    if (!isMounted || !userData || !userData.name) return "DU";

    const nameParts = userData.name.trim().split(" ");
    const firstInitial = nameParts[0][0] || "";
    const lastInitial =
      nameParts.length > 1 ? nameParts[nameParts.length - 1][0] : "";

    return lastInitial
      ? (firstInitial + lastInitial).toUpperCase()
      : firstInitial.toUpperCase();
  };

  const handleMenuMouseEnter = () => {
    if (setMenuVisible) {
      setMenuVisible(true);
    }
  };

  const menuIconSrc = menuVisible
    ? darkMode
      ? "/images/close-icon-light.svg"
      : "/images/close-icon-dark.svg"
    : darkMode
    ? "/images/menu-icon-light.svg"
    : "/images/menu-icon-dark.svg";

  // Handle input focus for mobile keyboard
  const handleInputFocus = (e) => {
    if (partialAccess && onLoginRequired) {
      e.preventDefault();
      onLoginRequired();
      return;
    }

    // Scroll to top on mobile when input is focused to prevent layout issues
    if (windowWidth < 640) {
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
    }
  };

  const handleInputBlur = () => {
    // Reset viewport on mobile when input loses focus
    if (windowWidth < 640) {
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
    }
  };

  const handleSettingsClick = () => {
    setSettingsOpen(true);
    setUserMenuVisible(false); // Close the user menu when opening settings
  };

  const handleSettingsClose = () => {
    setSettingsOpen(false);
  };

  // FIXED: Enhanced suggestion click with keyboard dismissal
  const handleSuggestionItemClick = (suggestion) => {
    if (partialAccess && onLoginRequired) {
      onLoginRequired();
      return;
    }

    // Dismiss keyboard on mobile when suggestion is clicked
    if (isSmallScreen) {
      if (mobileSearchInputRef.current) {
        mobileSearchInputRef.current.blur();
      }
      if (desktopSearchInputRef.current) {
        desktopSearchInputRef.current.blur();
      }
      // Also blur any currently focused element
      if (document.activeElement) {
        document.activeElement.blur();
      }
    }

    if (onSuggestionClick) {
      onSuggestionClick(suggestion);
    }
  };

  // Handle notification click - this function will be passed to NotificationList
  const handleNotificationClick = (notification) => {
    // You can add navigation logic here based on notification.actionUrl
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
    // Add any other notification click handling logic here
  };

  return (
    <>
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes fadeOut {
            from {
              opacity: 1;
              transform: translateY(0);
            }
            to {
              opacity: 0;
              transform: translateY(-10px);
            }
          }

          @keyframes search-spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }

          .dropdown-menu {
            display: none;
            opacity: 0;
            transform: translateY(-10px);
          }

          .dropdown-open {
            display: block;
            animation: fadeIn 0.25s ease forwards;
          }

          .dropdown-close {
            display: block;
            animation: fadeOut 0.25s ease forwards;
            pointer-events: none;
          }

          /* Mobile keyboard handling */
          @media (max-width: 640px) {
            /* Prevent zoom on inputs */
            input[type="text"] {
              font-size: 16px !important;
              transform: translateZ(0);
            }
            
            /* Prevent page jumping when keyboard appears */
            body.keyboard-open {
              position: fixed;
              width: 100%;
            }
          }

          /* iOS specific keyboard fixes */
          @supports (-webkit-touch-callout: none) {
            .header-container {
              position: -webkit-sticky;
              position: sticky;
              -webkit-transform: translateZ(0);
              transform: translateZ(0);
            }
            
            /* Prevent elastic scrolling from affecting header */
            body {
              -webkit-overflow-scrolling: touch;
            }
          }

          /* Android specific fixes */
          @media screen and (max-width: 767px) {
            .mobile-search-input {
              /* Prevent keyboard from pushing content */
              position: relative;
              z-index: 9;
            }
          }
        `}
      </style>
      <div ref={headerRef} style={styles.header} className="header-container">
        <button
          ref={menuButtonRef}
          style={{
            background: "none",
            border: "none",
            color: darkMode ? "#ffffff" : "#000000",
            fontSize: "1.5rem",
            cursor: "pointer",
            marginRight: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: "25px",
            // Improve touch target
            minHeight: "44px",
            // Prevent touch highlighting
            WebkitTapHighlightColor: "transparent",
          }}
          onClick={toggleMenu}
          onMouseEnter={handleMenuMouseEnter}
          onTouchEnd={(e) => {
            e.preventDefault();
            toggleMenu();
          }}
        >
          <img
            src={menuIconSrc}
            alt={menuVisible ? "Close Menu" : "Open Menu"}
          />
        </button>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontWeight: "600",
            fontSize: "22px",
            color: darkMode ? "#ffffff" : "#000000",
            cursor: "pointer",
          }}
          onClick={() => {
            setSearchText("");
            clearRefreshNews();
          }}
        >
          <div
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              marginRight: "10px",
              background: "url(/images/sage-icon.jpg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          ></div>
          SAGE<sup className="ps-2 block text-[12px] text-[#6ABCFF]">V1.01</sup>
          <sup className="ml-1 text-xs font-medium text-gray-400 rounded-xl  px-1 border border-gray-400">
            Beta
          </sup>
        </div>
        {showSearch && (
          <div className="xl:flex-1 justify-center max-w-[600px] mx-auto min-w-max sm:min-w-[330px] md:min-w-[350px] lg:min-w-[430px] 2xl:max-w-[750px] hidden sm:flex">
            <div
              style={{
                flex: 1,
                position: "relative",
                background: "url(/images/search-bg.png)",
                backgroundRepeat: "no-repeat",
                padding: "5px",
                backgroundSize: "cover",
                borderRadius: "12px",
                opacity: partialAccess ? 0.7 : 1,
              }}
            >
              <img
                style={{
                  position: "absolute",
                  left: "isSmallScreen ? '0' : '212px'",
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: "18px",
                  color: darkMode ? "#ffffff" : "#000000",
                }}
                className="ms-3"
                src={
                  darkMode
                    ? "/images/search-light.svg"
                    : "/images/search-dark.svg"
                }
                alt="Search"
              />
              <div
                style={{
                  padding: "2px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #8651FF, #5175FF)",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <input
                  ref={desktopSearchInputRef}
                  type="text"
                  placeholder={
                    partialAccess ? "Login to search news..." : "Search news..."
                  }
                  value={searchText}
                  onChange={handleSearch}
                  onKeyPress={handleKeyPress}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  style={{
                    width: "100%",
                    padding: isSmallScreen
                      ? "6px 20px 6px 40px"
                      : "12px 40px 12px 50px",
                    borderRadius: "10px",
                    border: "none",
                    backgroundColor: darkMode ? "#000" : "#ffffff",
                    color: darkMode ? "#ffffff" : "#000000",
                    fontSize: "18px",
                    outline: "none",
                    boxSizing: "border-box",
                    fontWeight: "500",
                    cursor: partialAccess ? "not-allowed" : "text",
                    // Prevent zoom on mobile
                    WebkitTapHighlightColor: "transparent",
                  }}
                  onClick={(e) => {
                    if (partialAccess && onLoginRequired) {
                      e.preventDefault();
                      onLoginRequired();
                    }
                  }}
                  readOnly={partialAccess}
                />
                {isSearching ? (
                  <div
                    style={{
                      animation: "search-spin 1s linear infinite",
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      border: "2px solid rgba(255, 255, 255, 0.3)",
                      borderTopColor: "white",
                    }}
                  ></div>
                ) : (
                  searchText && (
                    <FontAwesomeIcon
                      icon={faTimesCircle}
                      style={{
                        position: "absolute",
                        right: "12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: "16px",
                        color: "rgba(255, 255, 255, 0.7)",
                        cursor: "pointer",
                      }}
                      onClick={clearSearch}
                    />
                  )
                )}
              </div>

              {/* Desktop Search Suggestions */}
              {searchSuggestions && searchSuggestions.length > 0 && (
                <div style={styles.suggestionsContainer}>
                  {searchSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      style={styles.suggestionItem}
                      onClick={() => handleSuggestionItemClick(suggestion)}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = darkMode
                          ? "#2a2a2a"
                          : "#f5f5f5";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = "transparent";
                      }}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        <div className="ml-auto flex items-center">
          {/* Remaining Search Component - Desktop */}
          {/* {showSearch && !partialAccess && (
            <div className="hidden lg:block">
              <RemainingSearch darkMode={darkMode} />
            </div>
          )} */}

          {/* Subscribe Button */}
          {/* {!partialAccess && !subscriptionStatus && (
            <button
              onClick={() => navigate("/subscription")}
              title="Subscribe to get more searches"
              className="ml-auto lg:ml-2 mr-2 border-none rounded-full px-4 md:py-2 py-1 cursor-pointer font-medium bg-gradient-to-br from-[#CBFEFF] to-[#6ABCFF] text-gray-900"
            >
              Subscribe
            </button>
          )} */}

          {/* MODIFY THIS SECTION - ADD NOTIFICATION PROPS */}
          {/* Notification Icon with NotificationList */}
          <NotificationList
            darkMode={darkMode}
            onNotificationClick={handleNotificationClick}
            className="sm:ml-0 min-w-[20px] flex"
            style={{
              height: "50px",
              alignItems: "center",
              justifyContent: "center",
              cursor: partialAccess ? "not-allowed" : "pointer",
              position: "relative",
              opacity: partialAccess ? 0.7 : 1,
              // Improve touch target
              minWidth: "44px",
              minHeight: "44px",
            }}
            useCustomIcon={true}
            customIcon={
              <span>
                <img
                  src={
                    darkMode
                      ? "/images/notifications-light.svg"
                      : "/images/notifications-dark.svg"
                  }
                  alt="Notification"
                />
              </span>
            }
            // ADD THESE PROPS - Pass notification data and handlers
            notifications={notifications}
            loading={notificationLoading}
            totalCount={totalCount}
            unreadCount={unreadCount}
            hasMore={hasMore}
            onMarkAsRead={markAsRead}
            onMarkAllAsRead={markAllAsRead}
            onDeleteNotification={deleteNotification}
            onLoadMore={loadMoreNotifications}
            partialAccess={partialAccess}
            onLoginRequired={onLoginRequired}
          />

          <div
            ref={userMenuRef}
            style={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              position: "relative",
              opacity: partialAccess ? 0.7 : 1,
              // Improve touch target
              minHeight: "44px",
              // Prevent touch highlighting
              WebkitTapHighlightColor: "transparent",
            }}
            onClick={toggleUserMenu}
          >
            <div
              style={{
                minWidth: "32px",
                minHeight: "32px",
                borderRadius: "50%",
                background: "#CBFEFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "black",
                fontWeight: "400",
              }}
            >
              {partialAccess ? "DU" : getUserInitials()}
            </div>

            {!partialAccess && (
              <div
                className={`dropdown-menu ${menuAnimation}`}
                style={{
                  minWidth: "260px",
                  position: "absolute",
                  backgroundColor: darkMode ? "#000" : "#ffffff",
                  border: "1px solid #2A3435",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
                  zIndex: 100,
                  overflow: "hidden",
                  fontSize: "16px",
                  padding: "12px 0",
                  right: "0",
                  top: "50px",
                }}
                onAnimationEnd={() => {
                  if (menuAnimation === "dropdown-close") {
                    setMenuAnimation("");
                  }
                }}
              >
                <div
                  className="flex items-center px-4 py-2"
                  style={{
                    color: darkMode ? "#FFFFFF" : "#000000",
                    borderBottom: "1px solid #2A3435",
                    cursor: "default",
                    fontSize: "16px",
                    marginBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      minWidth: "36px",
                      minHeight: "36px",
                      borderRadius: "50%",
                      marginRight: "10px",
                      background: "#CBFEFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "black",
                      fontWeight: "500",
                    }}
                  >
                    {getUserInitials()}
                  </div>

                  <div>{userData?.name}</div>
                </div>

                {/* Add Remaining Searches in dropdown */}
                {showSearch && (
                  <div className="px-4">
                    <RemainingSearch darkMode={darkMode} />
                  </div>
                )}

                {/* Add Subscribe button if not subscribed */}
                {!subscriptionStatus && (
                  <div className="px-4 py-1 pb-3 border-b border-[#2A3435]">
                    <button
                      onClick={() => router.push("/subscription")}
                      title="Subscribe to get more searches"
                      className="border-none rounded-full px-4 py-1 cursor-pointer font-medium bg-gradient-to-br from-[#CBFEFF] to-[#6ABCFF] text-gray-900"
                    >
                      Subscribe
                    </button>
                  </div>
                )}

                <div
                  style={{
                    padding: "8px 20px",
                    cursor: "pointer",
                    transition: "backgroundColor 0.2s",
                    color: darkMode ? "#E5E7EB" : "#000000",
                    // display: "flex",
                    display: "none",
                    alignItems: "center",
                    gap: "12px",
                    fontSize: "16px",
                    fontWeight: "400",
                    minHeight: "44px", // Better touch target
                  }}
                >
                  <img src="/images/profile.svg" alt="Profile" />
                  My Profile
                </div>
                <div
                  style={{
                    padding: "8px 20px",
                    cursor: "pointer",
                    transition: "backgroundColor 0.2s",
                    color: darkMode ? "#E5E7EB" : "#000000",
                    display:
                      role === "admin" &&
                      userData?.email.includes("webspiders.com")
                        ? "flex"
                        : "none",
                    alignItems: "center",
                    gap: "12px",
                    fontSize: "16px",
                    fontWeight: "400",
                    minHeight: "44px", // Better touch target
                  }}
                  onClick={handleSettingsClick}
                >
                  <img src="/images/setting.svg" alt="Setting" />
                  Settings
                </div>
                <div
                  style={{
                    padding: "8px 20px",
                    cursor: "pointer",
                    transition: "backgroundColor 0.2s",
                    color: darkMode ? "#E5E7EB" : "#000000",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    fontSize: "16px",
                    fontWeight: "400",
                    minHeight: "44px", // Better touch target
                  }}
                  onClick={() => router.push("/subscription")}
                >
                  <img
                    src={"/images/page_info-dark.svg"}
                    style={{ width: "20px", height: "20px" }}
                    alt="Plan"
                  />
                  My Plan
                </div>
                <div
                  style={{
                    padding: "8px 20px",
                    cursor: "pointer",
                    transition: "backgroundColor 0.2s",
                    color: darkMode ? "#E5E7EB" : "#000000",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    fontSize: "16px",
                    fontWeight: "400",
                    minHeight: "44px", // Better touch target
                  }}
                  onClick={() => handleLogout()}
                >
                  <img src="/images/logout.svg" alt="Logout" />
                  Logout
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search section */}
      {showSearch && (
        <div
          className="xl:flex-1 justify-center max-w-[600px] mx-auto min-w-full p-1 sm:p-0 sm:min-w-[330px] md:min-w-[350px] block sm:hidden"
          style={styles.mobileSearchContainer}
        >
          <div
            style={{
              flex: 1,

              position: "relative",
              background: "url(/images/search-bg.png)",
              backgroundRepeat: "no-repeat",
              padding: "5px",
              backgroundSize: "cover",
              borderRadius: "12px",
              opacity: partialAccess ? 0.7 : 1,
            }}
          >
            <img
              style={{
                position: "absolute",
                left: "isSmallScreen ? '0' : '212px'",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "18px",
                color: darkMode ? "#ffffff" : "#000000",
                zIndex: "99",
              }}
              className="ms-3"
              src={
                darkMode
                  ? "/images/search-light.svg"
                  : "/images/search-dark.svg"
              }
              alt="Search"
            />
            <div
              style={{
                padding: "2px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #8651FF, #5175FF)",
                display: "flex",
              }}
            >
              <input
                ref={mobileSearchInputRef}
                type="text"
                placeholder={
                  partialAccess ? "Login to search news..." : "Search news..."
                }
                value={searchText}
                onChange={handleSearch}
                onKeyPress={handleKeyPress}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                className="mobile-search-input"
                style={{
                  width: "100%",
                  padding: isSmallScreen
                    ? "6px 20px 6px 40px"
                    : "12px 40px 12px 50px",
                  borderRadius: "10px",
                  border: "none",
                  backgroundColor: darkMode ? "#000" : "#ffffff",
                  color: darkMode ? "#ffffff" : "#000000",
                  fontSize: "16px", // Prevent zoom on iOS
                  outline: "none",
                  boxSizing: "border-box",
                  fontWeight: "500",
                  cursor: partialAccess ? "not-allowed" : "text",
                  // Mobile optimizations
                  WebkitTapHighlightColor: "transparent",
                  WebkitAppearance: "none", // Remove iOS styling
                  transform: "translateZ(0)", // Hardware acceleration
                }}
                onClick={(e) => {
                  if (partialAccess) {
                    e.preventDefault();
                    if (onLoginRequired) {
                      onLoginRequired();
                    }
                  }
                }}
                readOnly={partialAccess}
              />
              {isSearching ? (
                <div
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    animation: "search-spin 1s linear infinite",
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    border: "2px solid rgba(255, 255, 255, 0.3)",
                    borderTopColor: "white",
                  }}
                ></div>
              ) : (
                searchText && (
                  <FontAwesomeIcon
                    icon={faTimesCircle}
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      fontSize: "16px",
                      color: "rgba(255, 255, 255, 0.7)",
                      cursor: "pointer",
                      // Better touch target
                      padding: "8px",
                      margin: "-1px",
                      zIndex: "9",
                    }}
                    onClick={clearSearch}
                  />
                )
              )}
            </div>

            {/* Mobile Search Suggestions */}
            {searchSuggestions && searchSuggestions.length > 0 && (
              <div
                style={{
                  ...styles.suggestionsContainer,
                  position: "absolute",
                  top: "100%",
                  left: "0",
                  right: "0",
                  marginTop: "2px",
                }}
              >
                {searchSuggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    style={styles.suggestionItem}
                    onClick={() => handleSuggestionItemClick(suggestion)}
                    onTouchStart={(e) => {
                      e.target.style.backgroundColor = darkMode
                        ? "#2a2a2a"
                        : "#f5f5f5";
                    }}
                    onTouchEnd={(e) => {
                      setTimeout(() => {
                        e.target.style.backgroundColor = "transparent";
                      }, 150);
                    }}
                  >
                    {suggestion}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Remaining Search Component */}
          {!partialAccess && (
            <div className="mt-2">
              <RemainingSearch darkMode={darkMode} />
            </div>
          )}
        </div>
      )}
      {/* Settings Component */}
      <Settings
        isOpen={settingsOpen}
        onClose={handleSettingsClose}
        darkMode={darkMode}
      />
    </>
  );
};

export default Header;
