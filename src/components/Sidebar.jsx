import React, { useRef, useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useWindowSize from "../hooks/useWindowSize";

import {
  faChevronDown,
  faPlus,
  faClock,
  faArrowUp,
  faArrowDown,
  faMinus,
  faRefresh,
  faLock,
  faTimes,
  faSearch,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
// Import the time utility
import { formatNewsItemTime } from "./newsTimeUtils";
import { useDispatch, useSelector } from "react-redux";
import {
  setActiveNewsId,
  setAvailableRegions,
  setCurrentLocation,
  setLocationMenuVisible,
  setShowNewGroupPopup,
  setSelectedSectors,
  removeHighlightFromItem,
} from "../store/slice/newsDetailsSlice";
// Import the SkeletonLoader
import SkeletonLoader from "./SkeletonLoader";
// Import the TopNewsDropdown component
import TopNewsDropdown from "./TopNewsDropdown";
// Import API functions for group management
import { updateGroup, deleteGroup } from "../helpers/api";
import DynamicAILoader from "./DynamicAILoader";

const AILoader = ({ isDarkMode }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [messageOpacity, setMessageOpacity] = useState(1);

  const loadingMessages = [
    "Sage AI connecting to global data streams...",
    "Analyzing terabytes of market information...",
    "Cross-validating intelligence sources...",
    "Identifying critical patterns & anomalies...",
    "Synthesizing actionable insights...",
    "Curating your personalized briefing...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageOpacity(0);
      setTimeout(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
        setMessageOpacity(1);
      }, 350);
    }, 1600);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="ai-loader-container">
      <div className="ai-loader">
        <div className="ai-loader-icon">
          <img src="/images/ai-loader.svg" alt="Ai Loader" />
        </div>
        <div className="ai-loader-text" style={{ opacity: messageOpacity }}>
          {loadingMessages[currentMessageIndex]}
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({
  selectedTopNewsOption,
  setSelectedTopNewsOption,
  topNewsMenuVisible,
  setTopNewsMenuVisible,
  groupOptions,
  toggleSectorSidebar,
  loading,
  fetchNewsByCountry,
  clearRefreshNews,
  refreshNews,
  fetchGroupOptions,
  partialAccess = false,
  onItemClick,
  onCountryChange,
  detailsLoading = false,
  // Add showSearch prop to detect mobile search bar
  showSearch = false,
}) => {
  // Reference for draggable categories container
  const scrollRef = useRef(null);
  // Add ref for the location menu dropdown
  const locationMenuRef = useRef(null);
  const { width: windowWidth, height: windowHeight } = useWindowSize();
  const currentTheme = useSelector((state) => state.theme.currentTheme);
  const activeNewsId = useSelector((state) => state.newsDetails.activeNewsId);
  const refreshLoading = useSelector(
    (state) => state.newsDetails.refreshLoading
  );
  const currentLocation = useSelector(
    (state) => state.newsDetails.currentLocation
  );
  const locationMenuVisible = useSelector(
    (state) => state.newsDetails.locationMenuVisible
  );
  const availableRegions = useSelector(
    (state) => state.newsDetails.availableRegions
  );
  const menuItems = useSelector((state) => state.newsDetails.menuItems);
  const errorResponse = useSelector((state) => state.newsDetails.errorResponse);
  const selectedSectors = useSelector(
    (state) => state.newsDetails.selectedSectors
  );
  // Add new selectors for highlighted items and loading state
  const newHighlightedItems = useSelector(
    (state) => state.newsDetails.newHighlightedItems
  );
  const isLoadingNewHeadlines = useSelector(
    (state) => state.newsDetails.isLoadingNewHeadlines
  );
  const dispatch = useDispatch();

  // ADD: Mobile height calculation states
  const [mobileSearchHeight, setMobileSearchHeight] = useState(0);

  // Auto-select region with status 1 only on initial load
  useEffect(() => {
    if (availableRegions && availableRegions.length > 0 && !currentLocation) {
      const activeRegion = availableRegions.find(
        (region) => region.status === 1
      );
      if (activeRegion) {
        dispatch(setCurrentLocation(activeRegion.name));
      }
    }
  }, [availableRegions, currentLocation, dispatch]);

  // Determine dark mode from the theme object
  const isDarkMode =
    typeof currentTheme === "object"
      ? currentTheme.backgroundColor === "#000"
      : currentTheme !== "light";

  // ADD: Calculate mobile search height dynamically
  useEffect(() => {
    const calculateMobileSearchHeight = () => {
      if (windowWidth >= 640 || !showSearch) {
        setMobileSearchHeight(0);
        return;
      }

      // Look for the fixed mobile search container
      const mobileSearchEl = document.querySelector(
        '[style*="position: fixed"][style*="top: 64px"]'
      );
      if (mobileSearchEl) {
        setMobileSearchHeight(mobileSearchEl.offsetHeight);
      } else {
        // Fallback - typical mobile search height
        setMobileSearchHeight(78);
      }
    };

    // Initial calculation
    calculateMobileSearchHeight();

    // Recalculate on window resize and DOM changes
    let timeoutId;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(calculateMobileSearchHeight, 100);
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", () => {
      setTimeout(calculateMobileSearchHeight, 300);
    });

    // Watch for DOM changes
    const observer = new MutationObserver(() => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(calculateMobileSearchHeight, 50);
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style"],
    });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      observer.disconnect();
    };
  }, [windowWidth, showSearch]);

  // Define scrollbar styles
  const scrollbarStyles = {
    customScrollbar: {
      scrollbarWidth: "thin",
      scrollbarColor: `${isDarkMode ? "#333 #1a1a1a" : "#c1c1c1 #f1f1f1"}`,
    },
  };

  // Add click outside listener effect for location dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      // Close location menu if clicked outside
      if (
        locationMenuRef.current &&
        !locationMenuRef.current.contains(event.target) &&
        locationMenuVisible
      ) {
        dispatch(setLocationMenuVisible(false));
      }
    }

    // Add event listener to the document
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up the event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [locationMenuVisible, dispatch]);

  // Function to handle editing a group
  const handleEditGroup = async (groupData) => {
    try {
      // Call API to update group
      await updateGroup(groupData);

      // Refresh group options
      if (fetchGroupOptions) {
        await fetchGroupOptions();
      }

      // If currently selected group was edited, update the selected option
      if (
        groupData.name &&
        selectedTopNewsOption ===
          groupOptions.find((g) => g.id === groupData.id)?.name
      ) {
        setSelectedTopNewsOption(groupData.name);
      }

      return true;
    } catch (error) {
      console.error("Failed to update group:", error);
      throw error;
    }
  };

  // Function to handle deleting a group
  const handleDeleteGroup = async (groupId) => {
    try {
      // Call API to delete group
      await deleteGroup(groupId);

      // Refresh group options
      if (fetchGroupOptions) {
        await fetchGroupOptions();
      }

      // If deleted group was selected, switch to "Top News"
      const deletedGroup = groupOptions.find((g) => g.id === groupId);
      if (deletedGroup && deletedGroup.name === selectedTopNewsOption) {
        setSelectedTopNewsOption("Top News");
      }

      return true;
    } catch (error) {
      console.error("Failed to delete group:", error);
      throw error;
    }
  };

  // Function to get the headline from a news item
  const getNewsHeadline = (item) => {
    // Get the headline
    let headline = item.headline || item.newsobj?.headline || "Untitled News";

    headline = headline.replace(/&#039;/g, "'");

    // Decode other HTML entities
    const decodeEntities = (text) => {
      const textarea = document.createElement("textarea");
      textarea.innerHTML = text;
      return textarea.value;
    };

    return decodeEntities(headline);
  };

  const getSourceInitial = (source) => {
    if (!source) return "N";
    return source.charAt(0).toUpperCase();
  };

  const getSourceColor = (source) => {
    // Generate a consistent color based on the source name
    if (!source) return "#293ee5"; // Default blue

    // Simple hash function to generate a color from the source name
    const hash = source.split("").reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    // Use a simple algorithm to convert the hash to a color
    return `#${((hash & 0xffffff) | 0x808080).toString(16).slice(1)}`;
  };

  const renderNewsSource = (newsItem) => {
    // Check for source in the newsobj
    const source = newsItem.newsobj?.source;
    if (!source) return null;

    // Get source URL if available
    const sourceUrl =
      newsItem.newsobj?.source_url || newsItem.newsobj?.sourceUrl || null;

    // Get source icon dynamically from the API response
    const sourceIcon = newsItem.newsobj?.["image/video"] || null;

    return {
      name: source,
      url: sourceUrl,
      icon: sourceIcon,
      initial: getSourceInitial(source),
      color: getSourceColor(source),
    };
  };

  const renderImpactLabels = (newsItem) => {
    if (!newsItem.newsobj || !newsItem.newsobj.impact_ratings) {
      return null;
    }

    // Impact categories from the API
    const impactCategories = [
      { key: "stocks", label: "Equity" },
      { key: "bonds", label: "Fixed Income" },
      { key: "commodities", label: "Commodities" },
      { key: "crypto", label: "Crypto" },
      { key: "futures", label: "Futures" },
      { key: "options", label: "Options" },
    ];

    // Get ratings that have non-zero scores
    const significantImpacts = impactCategories
      .filter(
        (category) =>
          newsItem.newsobj.impact_ratings[category.key] &&
          newsItem.newsobj.impact_ratings[category.key].score !== 0
      )
      .map((category) => ({
        label: category.label,
        score: newsItem.newsobj.impact_ratings[category.key].score,
        explanation: newsItem.newsobj.impact_ratings[category.key].explanation,
      }))
      .slice(0, 3); // Limit to first 3 significant impacts

    if (significantImpacts.length === 0) return null;

    return (
      <div className="flex space-x-2 mt-2">
        {significantImpacts.map((impact, index) => (
          <div
            key={index}
            className={`flex items-center text-sm ${
              impact.score < 0
                ? "bg-red-600/20 text-red-500"
                : "bg-green-600/20 text-green-500"
            } rounded px-3 py-1`}
          >
            <span className="mr-1">{impact.label}</span>
            <span className="flex items-center">
              {impact.score > 0 ? "+" : ""}
              {impact.score} {impact.score > 0 ? "↗" : "↘"}
            </span>
          </div>
        ))}
      </div>
    );
  };

  // Function to extract impact categories from news item
  const extractImpactCategories = (item) => {
    // Check if impact_ratings exist in the newsobj
    if (!item?.newsobj?.impact_ratings) return [];

    const impactRatings = item.newsobj.impact_ratings;

    // Convert impact ratings object to array format needed for display
    // Filter out categories with score of 0
    return Object.entries(impactRatings)
      .filter(([_, data]) => data.score !== 0) // Filter out zero scores
      .map(([name, data]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize first letter
        score: data.score,
        explanation: data.explanation,
      }));
  };

  // Function to get color class based on impact score
  const getImpactScoreColorClass = (score) => {
    if (score > 0) return "text-green-500";
    if (score < 0) return "text-red-500";
    return "text-gray-400";
  };

  // Function to format impact score for display
  const formatImpactScore = (score) => {
    if (score > 0) return `+${score}`;
    return score.toString();
  };

  // Function to get appropriate icon based on score direction
  const getImpactScoreIcon = (score) => {
    if (score > 0) return faArrowUp;
    if (score < 0) return faArrowDown;
    return faMinus;
  };

  // Handle country change with partial access check
  const handleCountryChange = (country) => {
    if (partialAccess) {
      if (onCountryChange) {
        onCountryChange(country);
      }
    } else {
      dispatch(setCurrentLocation(country));
      dispatch(setLocationMenuVisible(false));

      // Update availableRegions to set the selected country as active (status 1) and others as inactive (status 0)
      if (availableRegions && availableRegions.length > 0) {
        const updatedRegions = availableRegions.map((region) => ({
          ...region,
          status: region.name === country ? 1 : 0,
        }));
        dispatch(setAvailableRegions(updatedRegions));
      }

      if (fetchNewsByCountry) {
        console.log("Fetching news for country:", country);
        fetchNewsByCountry(country);
      }
    }
  };

  // Handle refresh news data
  const handleRefreshNews = () => {
    if (refreshNews) {
      refreshNews();
    }
  };

  // Touch handling function for impact categories
  const handleDragStart = (e, scrollContainer) => {
    if (!scrollContainer) return;

    // Initialize variables depending on event type
    let startX,
      startY,
      startScrollLeft,
      isScrolling = false;

    // Handle mouse events
    if (e.type === "mousedown") {
      if (e.button !== 0) return; // Only left mouse button
      e.preventDefault();

      startX = e.pageX;
      startY = e.pageY;
      startScrollLeft = scrollContainer.scrollLeft;

      // Add grabbing cursor
      e.currentTarget.style.cursor = "grabbing";

      // Setup mouse move handler
      const handleMouseMove = (moveEvent) => {
        moveEvent.preventDefault();

        // Calculate how far the mouse has been moved
        const x = moveEvent.pageX;
        const y = moveEvent.pageY;

        // Determine if user is trying to scroll vertically or horizontally
        if (!isScrolling) {
          if (Math.abs(y - startY) > Math.abs(x - startX)) {
            // User is scrolling vertically, so don't handle horizontal scroll
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            e.currentTarget.style.cursor = "grab";
            return;
          }
          isScrolling = true;
        }

        // Calculate scroll distance and update scroll position
        const walk = x - startX;
        scrollContainer.scrollLeft = startScrollLeft - walk;
      };

      // Setup mouse up handler
      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        e.currentTarget.style.cursor = "grab";
      };

      // Register the handlers
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
    // Handle touch events
    else if (e.type === "touchstart") {
      const touch = e.touches[0];
      startX = touch.pageX;
      startY = touch.pageY;
      startScrollLeft = scrollContainer.scrollLeft;

      // Setup touch move handler
      const handleTouchMove = (moveEvent) => {
        if (moveEvent.cancelable) moveEvent.preventDefault();

        const touch = moveEvent.touches[0];
        const x = touch.pageX;
        const y = touch.pageY;

        // Determine if this is really a horizontal scroll
        if (!isScrolling) {
          if (Math.abs(y - startY) > Math.abs(x - startX)) {
            // User is trying to scroll vertically
            document.removeEventListener("touchmove", handleTouchMove);
            document.removeEventListener("touchend", handleTouchEnd);
            return;
          }
          isScrolling = true;
        }

        // Scrolling horizontally - prevent page scrolling
        moveEvent.preventDefault();

        // Calculate scroll distance and update scroll position
        const walk = x - startX;
        scrollContainer.scrollLeft = startScrollLeft - walk;
      };

      // Setup touch end handler
      const handleTouchEnd = () => {
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleTouchEnd);
      };

      // Register the handlers
      document.addEventListener("touchmove", handleTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleTouchEnd);
    }
  };

  // Function to clear selected sector
  // Function to clear selected sector with smooth exit animation
  const handleClearSector = async (e) => {
    // Prevent opening the sector sidebar and default behavior
    e.stopPropagation();
    e.preventDefault();

    // Get the sector popup element
    const sectorPopup = document.querySelector(".sector-popup-icon");

    // Add the slide-out animation class
    if (sectorPopup) {
      // Remove the slide-in animation if it exists
      sectorPopup.classList.remove("animate-slide-in-right");
      // Add the slide-out animation
      sectorPopup.classList.add("animate-slide-out-right");

      // Wait for animation to complete before clearing sectors
      setTimeout(() => {
        // Clear selected sectors
        dispatch(setSelectedSectors([]));

        // Fetch new data based on current location
        if (clearRefreshNews) {
          clearRefreshNews();
        }
      }, 450); // Slightly shorter than the animation duration to ensure smooth transition
    } else {
      // Fallback if element not found
      dispatch(setSelectedSectors([]));

      if (clearRefreshNews) {
        clearRefreshNews();
      }
    }
  };

  // Theme-based classes with the correct default (dark mode)
  const themeBg = isDarkMode ? "bg-[#22262a]" : "bg-white";
  const themeText = isDarkMode ? "text-white" : "text-gray-900";
  const themeBorder = isDarkMode ? "border-gray-700" : "border-gray-200";
  const themeHeaderBg = isDarkMode ? "bg-[#32373D]" : "bg-gray-100";
  const themeSecondaryText = isDarkMode ? "text-gray-300" : "text-gray-600";
  const themeCardBg = isDarkMode ? "bg-black" : "bg-gray-200";
  const themeBtnBg = isDarkMode ? "bg-[#32373D]" : "bg-gray-100";
  const themeBtnHover = isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-200";
  const themeDropdownBg = isDarkMode ? "bg-black" : "bg-white";
  const themeMenuHover = isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100";

  // Mobile active background color based on theme
  const mobileActiveBg = isDarkMode ? "bg-gray-800" : "bg-gray-200";

  // // Sort menuItems by newsobj.date (newest first)
  // const sortedMenuItems = React.useMemo(() => {
  //   if (!menuItems || menuItems.length === 0) return [];
  //   return [...menuItems].sort((a, b) => {
  //     const dateA = new Date(a.newsobj?.date);
  //     const dateB = new Date(b.newsobj?.date);
  //     return dateB - dateA;
  //   });
  // }, [menuItems]);

  // Add indicator for scrollable content
  useEffect(() => {
    // Add indicators to all impact category containers after component mounts
    const addScrollIndicators = () => {
      document
        .querySelectorAll(".impact-categories-container")
        .forEach((container) => {
          if (container.scrollWidth > container.clientWidth) {
            container.classList.add("scrollable-content");
          } else {
            container.classList.remove("scrollable-content");
          }
        });
    };

    // Run initially and on window resize
    addScrollIndicators();
    window.addEventListener("resize", addScrollIndicators);

    return () => window.removeEventListener("resize", addScrollIndicators);
  }, [menuItems]);

  // MODIFY: Calculate dynamic styles for mobile
  const getDynamicStyles = () => {
    if (windowWidth >= 640) {
      return {};
    }

    // Mobile styles with height and position calculation
    const headerHeight = 64;
    const topPosition = headerHeight + mobileSearchHeight; // Position below header + search
    const availableHeight = windowHeight - topPosition;

    return {
      position: "fixed", // Use fixed instead of absolute
      top: `${topPosition}px`,
      left: "0",
      right: "0",
      width: "100%",
      height: `${Math.max(availableHeight, 400)}px`,
      maxHeight: `${Math.max(availableHeight, 400)}px`,
      minHeight: `${Math.max(availableHeight, 400)}px`,
      zIndex: 10,
    };
  };

  return (
    <div
      style={{
        minWidth:
          windowWidth < 640
            ? "100%"
            : windowWidth < 768
            ? "calc(100% - 60px)"
            : undefined,
        ...getDynamicStyles(), // ADD: Apply dynamic mobile styles
      }}
      className={`${
        windowWidth < 640 ? "mobile-sidebar-fixed" : ""
      } max-w-[250px] md:max-w-[250px] xl:max-w-[350px] xl:min-w-[350px] 2xl:max-w-[410px] 2xl:min-w-[410px] ${
        windowWidth < 640 ? (isDarkMode ? "bg-black" : "bg-white") : themeBg
      } flex flex-col h-full ${
        windowWidth < 640 ? "" : "ml-[60px]"
      } relative border-r ${themeBorder}`}
    >
      {/* Single overlay lock for the entire sidebar when in partial access mode */}
      {partialAccess && (
        <div className="absolute inset-0 bg-black bg-opacity-50 z-50 flex flex-col items-center justify-center">
          <FontAwesomeIcon icon={faLock} className="text-white text-6xl mb-4" />
          <p className="text-white text-xl font-semibold">Login Required</p>
          <button
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg"
            onClick={() => {
              if (onCountryChange) {
                onCountryChange(currentLocation);
              }
            }}
          >
            Unlock
          </button>
        </div>
      )}

      {/* REMOVE: No need for negative margin anymore */}
      <div className="px-3 py-2 sm:p-4 flex-shrink-0">
        <div className="flex md:block xl:flex justify-between items-center 2xl:mb-5">
          <h1
            className={`text-xl 2xl:text-2xl font-medium md:mb-4 xl:mb-0 ${themeText}`}
          >
            News Intelligence
          </h1>
          <div
            className={`relative flex items-center gap-2  ${
              isDarkMode
                ? "bg-black border-gray-800"
                : "bg-gray-100 border-gray-200"
            } px-3 h-[46px] rounded-full md:rounded-lg xl:rounded-full text-base ${themeText} cursor-pointer backdrop-blur-md border max-w-[150px] sm:w-full md:max-w-none  xl:w-[150px] z-20`}
            onClick={(e) => {
              e.stopPropagation();
              if (!partialAccess) {
                dispatch(setLocationMenuVisible(!locationMenuVisible));
              }
            }}
            ref={locationMenuRef}
          >
            <span
              className="w-4 h-4 flex items-center justify-center"
              style={{
                backgroundImage: `url(${
                  isDarkMode
                    ? "/images/globe-icon-light.svg"
                    : "/images/globe-icon-dark.svg"
                })`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "center",
                backgroundSize: "cover",
              }}
            ></span>
            {/* Added truncation with ellipsis for location text */}
            <span className="truncate max-w-[70px]" title={currentLocation}>
              {currentLocation}
            </span>
            <FontAwesomeIcon
              icon={faChevronDown}
              className="ml-auto text-sm  flex-shrink-0"
            />
            {locationMenuVisible && !partialAccess && (
              <div
                className={`absolute right-0 left-auto md:left-0 top-11 xl:left-auto ${themeDropdownBg} border ${themeBorder} rounded-lg shadow-lg z-100 overflow-hidden min-w-[200px] text-base py-1`}
              >
                {availableRegions
                  .filter((country) => country.display === true)
                  .map((country) => (
                    <div
                      key={country.id}
                      className={`px-4 py-2 cursor-pointer ${themeMenuHover} transition-colors ${themeText} truncate ${
                        country.status === 1
                          ? `${
                              isDarkMode
                                ? "bg-blue-900/30 border-l-4 border-blue-500"
                                : "bg-blue-50 border-l-4 border-blue-500"
                            }`
                          : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCountryChange(country.name);
                      }}
                      title={`${country.name}${
                        country.status === 1 ? " (Active)" : ""
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{country.name}</span>
                        {country.status === 1 && (
                          <span className="ml-2 text-xs px-2 py-1 bg-green-500 text-white rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex md:block xl:flex items-center justify-between my-2 xl:my-4">
          {/* Replace old dropdown with new TopNewsDropdown component */}
          <TopNewsDropdown
            selectedOption={selectedTopNewsOption}
            setSelectedOption={setSelectedTopNewsOption}
            menuVisible={topNewsMenuVisible}
            setMenuVisible={setTopNewsMenuVisible}
            groupOptions={groupOptions}
            onEditGroup={handleEditGroup}
            onDeleteGroup={handleDeleteGroup}
            className="md:mb-4 xl:mb-0"
          />

          <div className="flex gap-2 justify-between">
            <button
              className={`${
                isDarkMode
                  ? "bg-[#000] text-white border-blue-500"
                  : "bg-gray-100 text-blue-600 border-blue-300"
              } py-2.5 px-3 rounded-lg flex items-center gap-1 border w-[140px]`}
              onClick={() => {
                if (!partialAccess) {
                  dispatch(setShowNewGroupPopup(true));
                }
              }}
            >
              New Group <FontAwesomeIcon className="ml-1" icon={faPlus} />
            </button>
            {/* Refresh button */}
            <button
              className={`min-w-[44px] h-[44px] rounded-lg ${themeBtnBg} border ${themeBorder} ${themeText} flex items-center justify-center cursor-pointer ${
                refreshLoading ? "opacity-50 cursor-not-allowed" : themeBtnHover
              }`}
              onClick={() => {
                if (!partialAccess) {
                  handleRefreshNews();
                }
              }}
              disabled={refreshLoading}
              title="Refresh news data"
            >
              {refreshLoading ? (
                // <svg className="w-5 h-5 spin" viewBox="0 0 24 24">
                //   <circle
                //     className="opacity-25"
                //     cx="12"
                //     cy="12"
                //     r="10"
                //     stroke="currentColor"
                //     strokeWidth="4"
                //     fill="none"
                //   />
                //   <path
                //     className="opacity-75"
                //     fill="currentColor"
                //     d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                //   />
                // </svg>
                <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
              ) : (
                <FontAwesomeIcon
                  icon={faRefresh}
                  className="text-lg flex-shrink-0"
                />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* News items list */}
      <ul
        className="list-none py-0 m-0 flex-1 overflow-y-auto scroll-smooth px-4 custom-scrollbar"
        style={scrollbarStyles.customScrollbar}
      >
        {loading ? (
          <>
            <DynamicAILoader isDarkMode={isDarkMode} />
            <SkeletonLoader type="news-item" count={5} />
          </>
        ) : (
          <>
            {/* Show AILoader when loading new headlines but we already have initial data */}
            {isLoadingNewHeadlines && menuItems?.length > 0 && (
              <div>
                <DynamicAILoader isDarkMode={isDarkMode} />
              </div>
            )}

            {/* Show shimmer when loading new headlines and no initial data */}
            {isLoadingNewHeadlines && menuItems?.length === 0 && (
              <>
                <DynamicAILoader isDarkMode={isDarkMode} />
                <SkeletonLoader type="news-item" count={5} />
              </>
            )}

            {menuItems?.length > 0 ? (
              menuItems.map((item, index) => {
                const source = renderNewsSource(item);
                // Extract impact categories for each news item - only non-zero scores will be displayed
                const impactCategories = extractImpactCategories(item);
                const isActive = String(item.id) === String(activeNewsId);
                // Check if this item should be highlighted in purple (new from searchNewHeadlines)
                const isNewHighlighted = newHighlightedItems.includes(item.id);

                return (
                  <li
                    key={item.id}
                    className={`overflow-hidden news-item py-4 px-4 mb-3 transition-all cursor-pointer relative ${themeText} rounded-2xl border ${
                      isNewHighlighted
                        ? "border-gray-700" // Purple highlighting for new items
                        : themeBorder
                    } ${
                      isActive
                        ? `${themeCardBg} ${
                            windowWidth < 640 ? mobileActiveBg : ""
                          } shadow-md`
                        : ""
                    }`}
                    onClick={() => {
                      if (partialAccess) {
                        if (onItemClick) {
                          onItemClick(item.id);
                        }
                      } else {
                        // Check if this item is highlighted and clear highlights when clicked
                        if (isNewHighlighted) {
                          dispatch(removeHighlightFromItem(item.id));
                        }
                        dispatch(setActiveNewsId(item.id));
                      }
                    }}
                  >
                    <div
                      className={`flex md:block xl:flex items-center ${themeSecondaryText} text-sm mb-2`}
                    >
                      <span className="block text-sm md:mb-3 xl:mb-0">
                        {formatNewsItemTime(item)}
                      </span>

                      {isActive &&
                        ((errorResponse &&
                          errorResponse.status === 0 &&
                          errorResponse.newsId === item.id) ||
                          detailsLoading) && (
                          <div className="ml-auto flex items-center gap-1">
                            <span className="inline-block w-5 h-1.5 bg-[#724cf9] rounded"></span>
                            <span className="inline-block w-1.5 h-1.5 bg-[#724cf9] rounded-full animate-pulse"></span>
                            <span
                              className="inline-block w-1.5 h-1.5 bg-[#724cf9] rounded-full animate-pulse"
                              style={{ animationDelay: "0.3s" }}
                            ></span>
                            <span
                              className="inline-block w-1.5 h-1.5 bg-[#724cf9] rounded-full animate-pulse"
                              style={{ animationDelay: "0.6s" }}
                            ></span>
                          </div>
                        )}
                    </div>
                    <div
                      className={`text-base line-clamp-2 `}
                      title={getNewsHeadline(item)}
                    >
                      {getNewsHeadline(item)}
                    </div>
                    {/* Add "NEW" badge for highlighted items */}
                    {/*isNewHighlighted*/}{" "}
                    {isNewHighlighted && (
                      <div
                        className="absolute top-0 right-0 bg-gray-700 flex item-center justify-center text-white text-xs font-semibold transform rotate-45 translate-x-4 translate-y-4 text-center"
                        style={{
                          width: "80px",
                          textAlign: "center",
                          transformOrigin: "64px 17px",
                          padding: "5px",
                        }}
                      >
                        <span className="bg-[#87c9ff] w-3 h-3 rounded-full inline-block border-4 border-blue-300">
                          &nbsp;
                        </span>
                      </div>
                    )}
                    {impactCategories.length > 0 && (
                      <div
                        className="relative impact-categories-container overflow-x-auto overflow-y-hidden"
                        style={{
                          maxWidth: "100%",
                          overflowX: "auto",
                          position: "relative",
                          WebkitOverflowScrolling: "touch", // Enable momentum scrolling on iOS
                          scrollbarWidth: "none", // Hide scrollbar on Firefox
                          msOverflowStyle: "none", // Hide scrollbar on IE/Edge
                        }}
                      >
                        <div
                          className="flex gap-2 pb-1 draggable-container"
                          style={{
                            cursor: "grab",
                            width: "max-content",
                            userSelect: "none",
                            touchAction: "pan-x", // Optimize for horizontal touch scrolling
                          }}
                          onMouseDown={(e) => {
                            if (!partialAccess) {
                              handleDragStart(e, e.currentTarget.parentElement);
                            }
                          }}
                          onTouchStart={(e) => {
                            if (!partialAccess) {
                              handleDragStart(e, e.currentTarget.parentElement);
                            }
                          }}
                        >
                          {impactCategories.map((category, idx) => (
                            <div
                              key={idx}
                              className="flex-shrink-0 border border-gray-700 rounded-md px-3 py-1 flex items-center gap-2"
                              style={{ minWidth: "fit-content" }}
                            >
                              <span className="text-gray-300">
                                {category.name}
                              </span>
                              <span
                                className={`flex items-center ${getImpactScoreColorClass(
                                  category.score
                                )}`}
                              >
                                {formatImpactScore(category.score)}
                                {getImpactScoreIcon(category.score) && (
                                  <FontAwesomeIcon
                                    icon={getImpactScoreIcon(category.score)}
                                    className="ml-1 text-xs"
                                  />
                                )}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </li>
                );
              })
            ) : (
              // <div
              //   className={`flex justify-center items-center p-5 ${themeSecondaryText}`}
              // >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "calc(100% - 50px)",
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    // border: `2px dashed ${isDarkMode ? "#333" : "#d1d5db"}`,
                    borderRadius: "12px",
                    padding: "30px 15px",
                    textAlign: "center",
                    maxWidth: "300px",
                    // backgroundColor: isDarkMode ? "#1a1a1a" : "#f9fafb",
                  }}
                >
                  <div
                    style={{
                      fontSize: "32px",
                      marginBottom: "12px",
                      opacity: 0.5,
                    }}
                  >
                    <FontAwesomeIcon icon={faSearch} />
                  </div>
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      marginBottom: "8px",
                      color: currentTheme.textColor,
                    }}
                  >
                    No headlines found
                  </h3>
                  <p
                    style={{
                      color: currentTheme.mutedText,
                      fontSize: "14px",
                      lineHeight: "1.4",
                    }}
                  >
                    Please try another search to see headlines.
                  </p>
                </div>
              </div>
              // </div>
            )}
          </>
        )}
      </ul>

      {/* Conditional rendering for sector popup button */}
      <div
        className={`absolute bottom-[70px] w-[55px] lg:w-auto md:bottom-5 right-5 ${
          windowWidth < 640 ? "z-30" : "z-20"
        }`}
      >
        {selectedSectors && selectedSectors.length > 0 ? (
          <div
            className="sector-popup-icon flex items-center gap-2 py-3 px-4 rounded-full bg-[#b4eeff] text-black font-medium shadow-lg transition-all duration-300 hover:bg-[#9fd6e7] animate-slide-in-right"
            onClick={!partialAccess ? toggleSectorSidebar : undefined}
            style={{
              cursor: partialAccess ? "not-allowed" : "pointer",
              maxWidth: "200px",
            }}
          >
            <span className="truncate" title={selectedSectors[0]}>
              {selectedSectors[0]}
            </span>
            {/* className="flex-shrink-0 ml-1 w-8 h-8 flex items-center
            justify-center bg-slate-500 bg-opacity-20 rounded-full
            hover:bg-white hover:bg-opacity-50 hover:shadow-md transition-all
            duration-200" */}
            <span
              onClick={(e) => {
                if (!partialAccess) {
                  // Call the handler and prevent event propagation
                  handleClearSector(e);
                }
              }}
              title="Clear sector selection"
            >
              <FontAwesomeIcon icon={faTimes} className="text-xl" />
            </span>
          </div>
        ) : (
          <img
            className="sector-popup-icon hover:scale-105 transition-transform duration-200"
            src="/images/sector-popup-button.svg"
            onClick={!partialAccess ? toggleSectorSidebar : undefined}
            style={{
              cursor: partialAccess ? "not-allowed" : "pointer",
            }}
            alt="Sector popup"
          />
        )}
      </div>

      {/* Add custom CSS for animations */}
      <style jsx="true">{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${isDarkMode ? "#1a1a1a" : "#f1f1f1"};
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${isDarkMode ? "#333" : "#c1c1c1"};
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${isDarkMode ? "#555" : "#a1a1a1"};
        }

        .sector-popup-icon {
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        @keyframes slideInFromRight {
          0% {
            transform: translateX(120%);
            opacity: 0;
          }
          50% {
            transform: translateX(-8%);
            opacity: 0.9;
          }
          75% {
            transform: translateX(4%);
            opacity: 1;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOutToRight {
          0% {
            transform: translateX(0);
            opacity: 1;
          }
          100% {
            transform: translateX(120%);
            opacity: 0;
          }
        }
        .animate-slide-in-right {
          animation: slideInFromRight 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)
            forwards;
        }
        .animate-slide-out-right {
          animation: slideOutToRight 0.5s cubic-bezier(0.55, 0.085, 0.68, 0.53)
            forwards;
        }

        /* Mobile positioning fixes */
        @media (max-width: 640px) {
          .mobile-sidebar-fixed {
            position: fixed !important;
            top: ${64 + mobileSearchHeight}px !important;
            left: 0 !important;
            right: 0 !important;
            width: 100% !important;
            z-index: 10 !important;
            margin: 0 !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
