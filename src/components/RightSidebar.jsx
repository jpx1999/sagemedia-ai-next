import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUp,
  faArrowDown,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useSelector, useDispatch } from "react-redux";
import SkeletonLoader from "./SkeletonLoader";
import { setRightSidebarVisible } from "../store/slice/newsDetailsSlice";

const RightSidebar = ({
  newsDetails,
  loading,
  error,
  partialAccess,
  onLoginRequired,
  // ADD these props for shared SummaryDetail state
  summaryDetailVisible,
  setSummaryDetailVisible,
  selectedImpact,
  setSelectedImpact,
  impactData,
  setImpactData,
  setIsRequestingOpen,
}) => {
  // Check if currentTheme is an object or a string
  const currentTheme = useSelector((state) => state.theme.currentTheme);
  const activeNewsId = useSelector((state) => state.newsDetails.activeNewsId);
  const isLoadingImpacts = useSelector(
    (state) => state.newsDetails.isLoadingImpacts
  );
  const rightSidebarVisible = useSelector(
    (state) => state.newsDetails.rightSidebarVisible
  );

  const dispatch = useDispatch();
  const sidebarRef = useRef(null);

  // Animation states
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationState, setAnimationState] = useState("closed");

  const isDarkMode =
    typeof currentTheme === "object"
      ? currentTheme.backgroundColor === "#000"
      : currentTheme !== "light";

  // Handle animation transitions
  useEffect(() => {
    if (rightSidebarVisible && animationState === "closed") {
      setIsAnimating(true);
      setAnimationState("opening");
      setTimeout(() => {
        setAnimationState("open");
        setIsAnimating(false);
      }, 300); // Duration of animation
    } else if (!rightSidebarVisible && animationState === "open") {
      setIsAnimating(true);
      setAnimationState("closing");
      setTimeout(() => {
        setAnimationState("closed");
        setIsAnimating(false);
      }, 300); // Duration of animation
    }
  }, [rightSidebarVisible, animationState]);

  // Handle clicking outside of the sidebar
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        rightSidebarVisible &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        // Make sure the clicked element is not the summary popup button
        !event.target.closest(".summary-popup-icon") &&
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
  }, [rightSidebarVisible, isAnimating]);

  // Close sidebar when Escape key is pressed
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape" && rightSidebarVisible && !isAnimating) {
        handleCloseSidebar();
      }
    };

    window.addEventListener("keydown", handleEscKey);

    return () => {
      window.removeEventListener("keydown", handleEscKey);
    };
  }, [rightSidebarVisible, isAnimating]);

  const handleCloseSidebar = () => {
    if (!isAnimating) {
      dispatch(setRightSidebarVisible(false));
    }
  };

  // Market impact categories with formatting
  const getMarketImpact = () => {
    if (
      !newsDetails ||
      !newsDetails.results ||
      newsDetails.results.length === 0
    ) {
      return {};
    }

    // Find the news item that matches the activeNewsId
    const newsItem =
      newsDetails.results.find((item) => item.id === activeNewsId) ||
      newsDetails.results[0];

    if (
      newsItem?.newsobj?.impact_ratings &&
      Object.keys(newsItem.newsobj.impact_ratings).length > 0
    ) {
      // Convert API format to display format
      const formattedImpact = {};

      // Convert impact ratings keys to display format
      const keyMap = {
        stocks: "Stocks",
        bonds: "Fixed Income",
        crypto: "Crypto",
        futures: "Futures",
        options: "Options",
        commodities: "Commodities",
      };

      // Only include impact ratings with non-zero scores
      Object.entries(newsItem.newsobj.impact_ratings).forEach(
        ([key, value]) => {
          // Skip ratings with a score of 0
          if (value.score !== 0) {
            const displayKey =
              keyMap[key] || key.charAt(0).toUpperCase() + key.slice(1);
            formattedImpact[displayKey] = {
              score: value.score,
              reasoning: value.explanation,
            };
          }
        }
      );

      return formattedImpact;
    }

    // If no real data, return a default empty object
    return {};
  };

  // Get the market impact data
  const marketImpact = getMarketImpact();

  // Handler for clicking on impact items
  const handleImpactClick = (market, data) => {
    // Don't handle clicks when loading impacts
    if (isLoadingImpacts) return;

    // Get the API key for the clicked market
    const reverseKeyMap = {
      Stocks: "stocks",
      "Fixed Income": "bonds",
      Crypto: "crypto",
      Futures: "futures",
      Options: "options",
      Commodities: "commodities",
    };

    const apiKey = reverseKeyMap[market] || market.toLowerCase();

    // Set the selected impact title for display
    setSelectedImpact(market);

    // Determine if impact is positive or negative
    const impactType = data.score >= 0 ? "positive" : "negative";

    // Set the impact data for the SummaryDetail component
    setImpactData({
      key: apiKey,
      value: data.score,
      type: impactType,
    });

    setIsRequestingOpen(true);
  };

  // Determine content to render based on state
  const renderContent = () => {
    if (loading) {
      return (
        <div
          className="flex-1 overflow-auto p-4 custom-scrollbar"
          style={{
            height: "calc(100% - 50px)",
            minHeight: "0",
          }}
        >
          <SkeletonLoader type="impact-card" count={3} />
        </div>
      );
    }

    if (error) {
      return <div className="p-5 text-center text-gray-500">{error}</div>;
    }

    if (!newsDetails || !newsDetails.results) {
      return (
        <div className="p-5 text-center text-gray-500">
          No content available for this news item.
        </div>
      );
    }

    // Check the status to determine what to show
    const currentStatus = newsDetails?.results?.[0]?.status;
    const summary = newsDetails?.results[0]?.newsobj?.summary;

    // Show summary for status < 4, impact charts for status >= 4
    if (currentStatus == null || currentStatus < 4) {
      // Status 0, 1, 2, 3 - show summary
      if (summary) {
        return (
          <div
            className={`p-5 text-start overflow-y-auto custom-scrollbar ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
            style={{
              height: "calc(100% - 50px)",
              minHeight: "0",
            }}
          >
            <div>{summary}</div>
          </div>
        );
      } else {
        return (
          <div className="p-5 text-center text-gray-500">
            Processing news content...
          </div>
        );
      }
    }

    // Status >= 4 - show impact charts if available, otherwise summary
    if (Object.keys(marketImpact).length === 0) {
      if (summary) {
        return (
          <div
            className={`p-5 text-start overflow-y-auto custom-scrollbar ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
            style={{
              height: "calc(100% - 50px)",
              minHeight: "0",
            }}
          >
            <div>{summary}</div>
          </div>
        );
      } else {
        return (
          <div className="p-5 text-center text-gray-500">
            No impact data available for this news item.
          </div>
        );
      }
    }

    // Default case: show market impact items
    return (
      <div
        className={`flex-1 overflow-auto p-4 custom-scrollbar ${
          isLoadingImpacts ? "pointer-events-none" : ""
        }`}
        style={{
          height: "calc(100% - 50px)",
          minHeight: "0",
        }}
      >
        <div className="space-y-4">
          {Object.entries(marketImpact).map(([market, data]) => (
            <div
              key={market}
              className={`rounded-2xl ${
                isDarkMode
                  ? "bg-transparent border-gray-800"
                  : "bg-white border-gray-200"
              } border p-4 hover:shadow-md transition-shadow cursor-pointer`}
              onClick={() => handleImpactClick(market, data)}
            >
              <div className="flex justify-between items-center mb-2">
                <div
                  className={`text-lg font-medium ${
                    isDarkMode ? "text-white" : "text-gray-900"
                  }`}
                >
                  {market}
                </div>
                <div
                  className={`flex items-center font-medium text-lg ${
                    data.score >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {data.score > 0 ? "+" : ""}
                  {data.score}
                  <FontAwesomeIcon
                    icon={data.score >= 0 ? faArrowUp : faArrowDown}
                    className={`ml-1 ${
                      data.score >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  />
                </div>
              </div>
              <div
                className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
              >
                <span className="font-medium">Reasoning:</span> {data.reasoning}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Determine if sidebar should be rendered at all for mobile
  const shouldRenderSidebar = rightSidebarVisible;

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
    rightSidebar: {
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
    rightSidebarHeader: {
      padding: "20px 30px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottom: `1px solid ${currentTheme.borderColor}`,
    },
    closeButton: {
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

  return (
    <>
      {/* Desktop view */}
      <div
        className={`lg:max-w-[250px] lg:min-w-[250px] 2xl:max-w-[400px] 2xl:min-w-[400px] hidden lg:block ${
          isDarkMode ? "bg-black" : "bg-white"
        } flex flex-col h-full border-l ${
          isDarkMode ? "border-gray-800" : "border-gray-200"
        } ${isLoadingImpacts ? "opacity-50 relative" : ""}`}
      >
        {/* Add overlay when loading to block all interactions */}
        {isLoadingImpacts && (
          <div className="absolute inset-0 z-10 cursor-progress" />
        )}

        <div
          className={`p-3 border-b ${
            isDarkMode ? "border-gray-800" : "border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <h1
              className={`text-2xl font-medium ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Summary
            </h1>
            {isLoadingImpacts && (
              <div className="flex">
                <span className="inline-block w-5 h-1.5 bg-[#724cf9] rounded"></span>
                <span className="dot-summary-loader w-1.5 rounded-full"></span>
                <span className="dot-summary-loader w-1.5 rounded-full"></span>
                <span className="dot-summary-loader w-1.5 rounded-full"></span>
              </div>
            )}
          </div>
        </div>

        {renderContent()}

        <style>
          {`
            .custom-scrollbar {
              scrollbar-width: thin;
              scrollbar-color: ${
                isDarkMode ? "#333 #1a1a1a" : "#c1c1c1 #f1f1f1"
              };
              display: block;
            }
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
            
            /* Dot loader animation for the dots */
            .dot-summary-loader {
              display: inline-block;
              height: 6px;
              margin: 0 3px;
              background-color: #724cf9;
              animation: dot-summary-pulse 1.4s infinite ease-in-out both;
            }

            .dot-summary-loader:nth-child(1) {
              animation-delay: -0.32s;
            }

            .dot-summary-loader:nth-child(2) {
              animation-delay: -0.16s;
            }

            @keyframes dot-summary-pulse {
              0%, 80%, 100% {
                transform: scale(0.6);
                opacity: 0.4;
              }
              40% {
                transform: scale(1);
                opacity: 1;
              }
            }
          `}
        </style>
      </div>

      {/* Mobile overlay and sidebar */}
      {shouldRenderSidebar && (
        <>
          {/* Overlay that covers the entire page */}
          <div
            style={styles.overlay}
            onClick={handleCloseSidebar}
            className="right-sidebar-overlay lg:hidden"
          />

          {/* Mobile Sidebar content */}
          <div
            style={styles.rightSidebar}
            className="globalScroll right-sidebar sm:w-[450px] lg:hidden"
            ref={sidebarRef}
          >
            <div style={styles.rightSidebarHeader}>
              <h1
                className="text-xl lg:text-2xl font-medium text-white flex items-center"
                style={{ color: currentTheme.textColor }}
              >
                Summary
              </h1>
              <div className="flex">
                {isLoadingImpacts && (
                  <div className="flex mr-3">
                    <span className="inline-block w-5 h-1.5 bg-[#724cf9] rounded"></span>
                    <span className="dot-summary-loader w-1.5 rounded-full"></span>
                    <span className="dot-summary-loader w-1.5 rounded-full"></span>
                    <span className="dot-summary-loader w-1.5 rounded-full"></span>
                  </div>
                )}
                <button
                  style={styles.closeButton}
                  onClick={handleCloseSidebar}
                  aria-label="Close summary sidebar"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>
            </div>

            {renderContent()}

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

              .right-sidebar-overlay {
                transition: opacity 0.3s ease, visibility 0.3s ease;
              }

              .right-sidebar {
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

              /* Dot loader animation for the dots */
              .dot-summary-loader {
                display: inline-block;
                height: 6px;
                margin: 0 3px;
                background-color: #724cf9;
                animation: dot-summary-pulse 1.4s infinite ease-in-out both;
              }

              .dot-summary-loader:nth-child(1) {
                animation-delay: -0.32s;
              }

              .dot-summary-loader:nth-child(2) {
                animation-delay: -0.16s;
              }

              @keyframes dot-summary-pulse {
                0%,
                80%,
                100% {
                  transform: scale(0.6);
                  opacity: 0.4;
                }
                40% {
                  transform: scale(1);
                  opacity: 1;
                }
              }
            `}</style>
          </div>
        </>
      )}
    </>
  );
};

export default RightSidebar;
