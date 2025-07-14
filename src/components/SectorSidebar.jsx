import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faTrash } from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setSectorSidebarVisible,
  setSelectedSectors,
  setMenuItems,
  setActiveNewsId,
} from "../store/slice/newsDetailsSlice";
import { fetchNewsListings, getSectorNews } from "../helpers/api";

const SectorSidebar = ({ setSelectedTopNewsOption, setSearchText }) => {
  const dispatch = useDispatch();
  const sidebarRef = useRef(null);
  const currentTheme = useSelector((state) => state.theme.currentTheme);
  const sectorSidebarVisible = useSelector(
    (state) => state.newsDetails.sectorSidebarVisible
  );
  const selectedSectors = useSelector(
    (state) => state.newsDetails.selectedSectors
  );
  const sectors = useSelector((state) => state.newsDetails.sectors);
  const currentLocation = useSelector(
    (state) => state.newsDetails.currentLocation
  );

  // Animation states
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationState, setAnimationState] = useState("closed");

  // Handle animation transitions
  useEffect(() => {
    if (sectorSidebarVisible && animationState === "closed") {
      setIsAnimating(true);
      setAnimationState("opening");
      setTimeout(() => {
        setAnimationState("open");
        setIsAnimating(false);
      }, 300); // Duration of animation
    } else if (!sectorSidebarVisible && animationState === "open") {
      setIsAnimating(true);
      setAnimationState("closing");
      setTimeout(() => {
        setAnimationState("closed");
        setIsAnimating(false);
      }, 300); // Duration of animation
    }
  }, [sectorSidebarVisible, animationState]);

  // Handle clicking outside of the sidebar
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        sectorSidebarVisible &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        // Make sure the clicked element is not the sector popup button
        !event.target.closest(".sector-popup-icon") &&
        // Don't close while animating
        !isAnimating
      ) {
        handleCloseSidebar();
      }
    };

    // Add event listener
    document.addEventListener("mousedown", handleOutsideClick);

    // Clean up
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [sectorSidebarVisible, isAnimating]);

  // Close sidebar when Escape key is pressed
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape" && sectorSidebarVisible && !isAnimating) {
        handleCloseSidebar();
      }
    };

    window.addEventListener("keydown", handleEscKey);

    return () => {
      window.removeEventListener("keydown", handleEscKey);
    };
  }, [sectorSidebarVisible, isAnimating]);

  const handleCloseSidebar = () => {
    if (!isAnimating) {
      dispatch(setSectorSidebarVisible(false));
    }
  };

  const handleClearSector = async () => {
    if (!isAnimating) {
      // Clear selected sectors
      dispatch(setSelectedSectors([]));

      try {
        // Fetch default news for current location
        const newsData = await fetchNewsListings(currentLocation);

        if (newsData && newsData.results && newsData.results.length > 0) {
          // Map the results to our menu items format
          const newsItems = newsData.results.map((news) => ({
            id: news.id || `news_${Date.now()}_${Math.random()}`,
            title: news.headline || "Untitled News",
            headline: news.headline || "",
            aiengine: news.aiengine || "",
            created_at: news.created_at || new Date().toISOString(),
            region: news.region || currentLocation,
            newsobj: news.newsobj || {},
          }));

          // Update the news items in the store
          dispatch(setMenuItems(newsItems));

          // Set the first news item as active
          if (newsItems.length > 0) {
            dispatch(setActiveNewsId(newsItems[0].id));
          }
        }

        // Close the sidebar after clearing
        dispatch(setSectorSidebarVisible(false));
      } catch (error) {
        console.error("Error fetching news after clearing sector:", error);
      }
    }
  };

  const handleSectorSelection = async (sector) => {
    // For true radio button behavior, we only want one selection at a time
    if (selectedSectors.includes(sector)) {
      // Allow deselecting by clicking the same radio button again
      dispatch(setSelectedSectors([]));
    } else {
      // Select only the clicked sector, replacing any previous selection
      dispatch(setSelectedSectors([sector]));
      setSelectedTopNewsOption("Top News");
      setSearchText("");
      try {
        // Fetch news for the selected sector
        const sectorNewsData = await getSectorNews(sector, currentLocation);

        if (
          sectorNewsData &&
          sectorNewsData.results &&
          sectorNewsData.results.length > 0
        ) {
          // Map the results to our menu items format
          const newsItems = sectorNewsData.results.map((news) => ({
            id: news.id || `news_${Date.now()}_${Math.random()}`,
            title: news.headline || "Untitled News",
            headline: news.headline || "",
            aiengine: news.aiengine || "",
            created_at: news.created_at || new Date().toISOString(),
            region: news.region || currentLocation,
            // Store the complete news object for reference
            newsobj: news.newsobj || {},
          }));

          // Update the news items in the store
          dispatch(setMenuItems(newsItems));

          // Set the first news item as active
          if (newsItems.length > 0) {
            dispatch(setActiveNewsId(newsItems[0].id));
          }

          // Close the sector sidebar after selection
          dispatch(setSectorSidebarVisible(false));
        } else {
          console.warn(
            "No news items found for the selected sector:",
            sectorNewsData
          );
          // Show empty state
          dispatch(setMenuItems([]));
          dispatch(setActiveNewsId(null));
        }
      } catch (error) {
        console.error("Error fetching sector news:", error);
        // Handle error state
        dispatch(setMenuItems([]));
        dispatch(setActiveNewsId(null));
      }
    }
  };

  const lastUpdated = (date) => {
    // Handle null or undefined dates
    if (!date) {
      return {
        text: "",
        colorClass: "",
      };
    }

    const now = new Date();
    const lastUpdatedDate = new Date(date);

    // Check if date is valid
    if (isNaN(lastUpdatedDate.getTime())) {
      return {
        text: "",
        colorClass: "",
      };
    }

    const diffTime = Math.abs(now - lastUpdatedDate);

    // Calculate different time units
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // Calculate remaining minutes after hours
    const remainingMinutes = diffMinutes % 60;

    let timeText = "";
    let colorClass = "";

    if (diffDays < 1) {
      // Less than 1 day - show hours and minutes format with green color
      colorClass = "text-green-500";

      if (diffHours === 0) {
        if (diffMinutes <= 1) {
          timeText = "Just now";
        } else {
          timeText = `${diffMinutes} minutes ago`;
        }
      } else {
        // Show hours and minutes
        if (remainingMinutes === 0) {
          timeText = diffHours === 1 ? "1 hr ago" : `${diffHours} hrs ago`;
        } else {
          const hourText = diffHours === 1 ? "1 hr" : `${diffHours} hrs`;
          const minuteText =
            remainingMinutes === 1 ? "1 min" : `${remainingMinutes} mins`;
          timeText = `${hourText} ${minuteText} ago`;
        }
      }
    } else if (diffDays <= 6) {
      // 1-6 days - show "X days ago" format with orange color
      colorClass = "text-orange-500";

      if (diffDays === 1) {
        timeText = "1 day ago";
      } else {
        timeText = `${diffDays} days ago`;
      }
    } else {
      // More than 6 days - show full date format with orange color
      colorClass = "text-gray-500";

      const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
      };
      timeText = lastUpdatedDate.toLocaleDateString("en-US", options);
    }

    return {
      text: timeText,
      colorClass: colorClass,
    };
  };

  // Determine if dark mode
  const isDarkMode =
    typeof currentTheme === "object"
      ? currentTheme.backgroundColor === "#000" ||
        currentTheme.navBg === "#1F2937"
      : currentTheme === "dark";

  const menuIconSrc = `/images/sector-heading-icon-${
    isDarkMode ? "light" : "dark"
  }.svg`;
  const resetIconSrc = `/images/reset-icon-${
    isDarkMode ? "light" : "dark"
  }.svg`;

  // Determine if sidebar should be rendered at all
  const shouldRenderSidebar = true;

  const styles = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: 99,
      backdropFilter: "blur(2px)",
      visibility: shouldRenderSidebar ? "visible" : "hidden",
      opacity:
        animationState === "open" || animationState === "opening" ? 1 : 0,
      pointerEvents: animationState === "open" ? "auto" : "none",
    },
    sectorSidebar: {
      backgroundColor: currentTheme.navBg,
      position: "fixed",
      right: 0,
      top: 0,
      height: "100%",
      zIndex: 1000,
      overflowY: "auto",
      borderLeft: `1px solid ${currentTheme.borderColor}`,
      visibility: shouldRenderSidebar ? "visible" : "hidden",
      transition: "transform 0.6s ease, opacity 0.6s ease",
      transform:
        animationState === "open" || animationState === "opening"
          ? "translateX(0)"
          : "translateX(450px)",
      opacity:
        animationState === "open" || animationState === "opening" ? 1 : 0,
      pointerEvents: animationState === "open" ? "auto" : "none",
    },

    sectorSidebarHeader: {
      padding: "20px 30px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    sectorList: {
      padding: "20px 30px",
      display: "flex",
      flexDirection: "column",
      gap: "15px",
    },
    sectorItem: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      color: currentTheme.textColor,
      fontSize: "16px",
      cursor: "pointer",
    },
    customRadio: {
      position: "relative",
      width: "20px",
      height: "20px",
      borderRadius: "50%",
      border: `2px solid ${isDarkMode ? "#6B7280" : "#D1D5DB"}`,
      display: "inline-block",
      marginRight: "10px",
      cursor: "pointer",
    },
    customRadioChecked: {
      border: "2px solid #3B82F6",
    },
    customRadioInner: {
      position: "absolute",
      width: "10px",
      height: "10px",
      borderRadius: "50%",
      backgroundColor: "#3B82F6",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    },
    closeChat: {
      background: "none",
      border: "none",
      color: currentTheme.textColor,
      fontSize: "1.2rem",
      cursor: "pointer",
      padding: "8px",
      borderRadius: "50%",
      transition: "background-color 0.2s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "36px",
      height: "36px",
    },
    loadingIndicator: {
      margin: "20px auto",
      textAlign: "center",
      color: currentTheme.textColor,
    },
    actionButton: {
      background: "none",
      border: "none",
      color: currentTheme.textColor,
      fontSize: "1.2rem",
      cursor: "pointer",
      padding: "8px",
      borderRadius: "50%",
      transition: "background-color 0.2s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "36px",
      height: "36px",
    },
  };

  // If the sidebar should not be rendered at all, return null
  if (!shouldRenderSidebar) {
    return null;
  }

  return (
    <>
      {/* Overlay that covers the entire page */}
      <div
        style={styles.overlay}
        onClick={handleCloseSidebar}
        className="sector-sidebar-overlay"
      />

      {/* Sidebar content */}
      <div
        style={styles.sectorSidebar}
        className="globalScroll sector-sidebar sm:w-[450px]"
        ref={sidebarRef}
      >
        <div style={styles.sectorSidebarHeader}>
          <h1
            className="text-xl lg:text-2xl font-medium text-white flex items-center"
            style={{ color: currentTheme.textColor }}
          >
            <img className="me-4" src={menuIconSrc} alt="Sector Icon" /> Select
            Sector
          </h1>
          <div className="flex">
            <button
              style={{
                ...styles.actionButton,
                marginRight: "8px",
                opacity: selectedSectors.length > 0 ? 1 : 0.5,
                cursor: selectedSectors.length > 0 ? "pointer" : "not-allowed",
              }}
              onClick={
                selectedSectors.length > 0 ? handleClearSector : undefined
              }
              aria-label="Clear sector selection"
              title="Clear sector selection"
              disabled={selectedSectors.length === 0}
            >
              <img src={resetIconSrc} alt="Reset Icon" />
            </button>
            <button
              style={styles.actionButton}
              onClick={handleCloseSidebar}
              aria-label="Close sector sidebar"
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>
        </div>
        <div style={styles.sectorList}>
          {sectors && sectors.length > 0 ? (
            sectors.map((sector, index) => {
              const lastUpdatedInfo = lastUpdated(sector.last_updated);
              return (
                <div
                  key={index}
                  style={styles.sectorItem}
                  onClick={() => handleSectorSelection(sector.name)}
                >
                  <div
                    style={{
                      ...styles.customRadio,
                      ...(selectedSectors.includes(sector.name)
                        ? styles.customRadioChecked
                        : {}),
                    }}
                  >
                    {selectedSectors.includes(sector.name) && (
                      <div style={styles.customRadioInner}></div>
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span>{sector.name}</span>
                    {lastUpdatedInfo.text && (
                      <span className={`text-xs ${lastUpdatedInfo.colorClass}`}>
                        {lastUpdatedInfo.text}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={styles.loadingIndicator}>Loading sectors...</div>
          )}
        </div>

        {/* Enhanced CSS with smoother animations */}
        <style jsx="true">{`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          .sector-sidebar-overlay {
            transition: opacity 0.3s ease, visibility 0.3s ease;
          }

          .sector-sidebar {
            transition: transform 0.3s ease,
              opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            will-change: transform, opacity;
            box-shadow: ${isDarkMode
              ? "-4px 0 15px rgba(0, 0, 0, 0.5)"
              : "-4px 0 15px rgba(0, 0, 0, 0.1)"};
          }

          .globalScroll::-webkit-scrollbar {
            width: 8px;
          }
          .globalScroll::-webkit-scrollbar-track {
            background: ${isDarkMode ? "#1a1a1a" : "#f1f1f1"};
            border-radius: 4px;
          }
          .globalScroll::-webkit-scrollbar-thumb {
            background: ${isDarkMode ? "#333" : "#c1c1c1"};
            border-radius: 4px;
          }
          .globalScroll::-webkit-scrollbar-thumb:hover {
            background: ${isDarkMode ? "#555" : "#a1a1a1"};
          }

          /* Ensure Tailwind colors work properly */
          .text-green-500 {
            color: #10b981 !important;
          }
          .text-orange-500 {
            color: #f97316 !important;
          }
        `}</style>
      </div>
    </>
  );
};

export default SectorSidebar;
