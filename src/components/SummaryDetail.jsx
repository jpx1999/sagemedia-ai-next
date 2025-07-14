import React, { useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimes,
  faArrowUp,
  faArrowDown,
} from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import AudioPlayer from "../components/content/AudioPlayer";
import { fetchImpactAnalysis } from "../helpers/api";

const SummaryDetail = ({
  summaryDetailVisible,
  setSummaryDetailVisible,
  activeNewsId,
  impactTitle,
  impactData,
}) => {
  const sidebarRef = useRef(null);
  const currentTheme = useSelector((state) => state.theme.currentTheme);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summaryData, setSummaryData] = useState(null);

  // Animation states
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationState, setAnimationState] = useState("closed");

  // Get active news ID from Redux store
  const storeActiveNewsId = useSelector(
    (state) => state.newsDetails.activeNewsId
  );

  // Determine if dark mode
  const isDarkMode =
    typeof currentTheme === "object"
      ? currentTheme.backgroundColor === "#000" ||
        currentTheme.navBg === "#1F2937"
      : currentTheme === "dark";

  // Handle animation transitions
  useEffect(() => {
    if (summaryDetailVisible && animationState === "closed") {
      setIsAnimating(true);
      setAnimationState("opening");
      setTimeout(() => {
        setAnimationState("open");
        setIsAnimating(false);
      }, 300); // Duration of animation
    } else if (!summaryDetailVisible && animationState === "open") {
      setIsAnimating(true);
      setAnimationState("closing");
      setTimeout(() => {
        setAnimationState("closed");
        setIsAnimating(false);
      }, 300); // Duration of animation
    }
  }, [summaryDetailVisible, animationState]);

  // Fetch impact analysis data when the component becomes visible
  useEffect(() => {
    if (summaryDetailVisible && impactData && impactData.key) {
      setLoading(true);
      setError(null);

      // Use the correct news ID - first try the Redux store value, then the prop, then fallback
      const newsId = storeActiveNewsId || activeNewsId;

      console.log(
        `Fetching impact analysis for news ID: ${newsId}, impact type: ${impactData.key}`
      );

      // Prepare params for API call with the correct ID and impact type
      const params = {
        id: newsId,
        impact: impactData.key, // This comes from the clicked label in ImpactCharts or RightSidebar
      };

      // Use the api.js fetchImpactAnalysis function
      fetchImpactAnalysis(params)
        .then((response) => {
          console.log("Impact analysis data received:", response);
          if (response && response.data) {
            setSummaryData(response.data);
          } else {
            setError("No impact data available");
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching impact analysis:", err);
          setError(`Data not available for this news item`);
          setLoading(false);
        });
    }
  }, [summaryDetailVisible, impactData, activeNewsId, storeActiveNewsId]);

  // Handle clicking outside of the sidebar
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        summaryDetailVisible &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        // Make sure the clicked element is not the summary popup button
        !event.target.closest(".summary-detail-button") &&
        // Make sure the clicked element is not a chart label
        !event.target.closest(".chart-label") &&
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
  }, [summaryDetailVisible, isAnimating]);

  // Close sidebar when Escape key is pressed
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === "Escape" && summaryDetailVisible && !isAnimating) {
        handleCloseSidebar();
      }
    };

    window.addEventListener("keydown", handleEscKey);

    return () => {
      window.removeEventListener("keydown", handleEscKey);
    };
  }, [summaryDetailVisible, isAnimating]);

  const handleCloseSidebar = () => {
    if (!isAnimating) {
      setSummaryDetailVisible(false);
    }
  };

  // Format the impact title for display
  const getFormattedTitle = () => {
    if (!impactTitle) return "Impact Analysis";

    if (impactData && impactData.value) {
      const scoreValue = impactData.value;
      return `Why the Impact Score is ${
        scoreValue >= 0 ? "+" : ""
      }${scoreValue} for ${impactTitle}`;
    }

    return `Impact Analysis for ${impactTitle}`;
  };

  // Determine if sidebar should be rendered at all
  const shouldRenderSidebar =
    animationState !== "closed" || summaryDetailVisible;

  const styles = {
    overlay: {
      display: shouldRenderSidebar ? "block" : "none",
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      zIndex: 9999,
      backdropFilter: "blur(2px)",
      transition: "opacity 0.3s ease",
      opacity:
        animationState === "open" || animationState === "opening" ? 1 : 0,
    },
    summaryDetailSidebar: {
      backgroundColor: isDarkMode ? "#000" : "#fff",
      position: "fixed",
      right: 0,
      top: 0,
      height: "100%",
      zIndex: 99999,
      overflowY: "auto",
      borderLeft: `1px solid ${isDarkMode ? "#2a2a2a" : "#d0d0d0"}`,
      transition: "transform 0.6s ease, opacity 0.6s ease",
      transform:
        animationState === "open" || animationState === "opening"
          ? "translateX(0)"
          : "translateX(450px)",
      opacity:
        animationState === "open" || animationState === "opening" ? 1 : 0,
    },
    backButton: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      color: isDarkMode ? "#ffffff" : "#000000",
      fontSize: "16px",
      cursor: "pointer",
      border: "none",
      background: "none",
      paddingTop: "8px",
      width: "25px",
    },
    summaryContent: {
      padding: "16px",
    },
    title: {
      fontSize: "24px",
      fontWeight: "500",
      color: isDarkMode ? "#ffffff" : "#000000",
    },
    impactCard: {
      border: `1px solid ${isDarkMode ? "#2a2a2a" : "#e0e0e0"}`,
      borderRadius: "10px",
      padding: "10px",
      marginBottom: "16px",
      backgroundColor: isDarkMode ? "transparent" : "#ffffff",
    },
    impactCardHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    symbolText: {
      fontSize: "16px",
      fontWeight: "500",
      color: isDarkMode ? "#ffffff" : "#000000",
    },
    scorePositive: {
      display: "flex",
      alignItems: "center",
      fontSize: "18px",
      fontWeight: "500",
      color: "#10b981", // Green for positive
    },
    scoreNegative: {
      display: "flex",
      alignItems: "center",
      fontSize: "18px",
      fontWeight: "500",
      color: "#ef4444", // Red for negative
    },
    scoreIcon: {
      marginLeft: "4px",
    },
    reasonText: {
      color: isDarkMode ? "#9ca3af" : "#4b5563",
      fontSize: "16px",
    },
    loaderContainer: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "300px",
    },
    loader: {
      border: `4px solid ${isDarkMode ? "#333" : "#f3f3f3"}`,
      borderTop: `4px solid ${isDarkMode ? "#fff" : "#3498db"}`,
      borderRadius: "50%",
      width: "40px",
      height: "40px",
      animation: "spin 2s linear infinite",
    },
    loaderText: {
      marginTop: "16px",
      color: isDarkMode ? "#fff" : "#333",
    },
    errorContainer: {
      padding: "20px",
      textAlign: "center",
      color: "#9ca3af",
      fontSize: "20x",
    },
  };

  // Render company impacts based on dynamic data
  const renderCompanyImpacts = () => {
    if (
      !summaryData ||
      !summaryData.companies ||
      !Array.isArray(summaryData.companies) ||
      summaryData.companies.length === 0
    ) {
      return null;
    }

    return (
      <div className="mt-6">
        <h2
          className={`text-lg font-medium mb-3 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Instrument Impact
        </h2>
        {summaryData.companies.map((company, index) => (
          <div key={index} style={styles.impactCard}>
            <div style={styles.impactCardHeader}>
              <div style={styles.symbolText}>{company.ticker}</div>
              <div
                style={
                  parseInt(company.impact_score) >= 0
                    ? styles.scorePositive
                    : styles.scoreNegative
                }
              >
                {company.impact_score > 0 ? "+" : ""}
                {company.impact_score}
                <FontAwesomeIcon
                  icon={
                    parseInt(company.impact_score) >= 0
                      ? faArrowUp
                      : faArrowDown
                  }
                  style={styles.scoreIcon}
                />
              </div>
            </div>
            <div style={styles.reasonText}>
              <span style={{ fontWeight: "500" }}>Reason:</span>{" "}
              {company.reason}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render financial instrument impacts based on dynamic data
  const renderFinancialInstruments = () => {
    if (!summaryData || !summaryData.financial_instruments) {
      return null;
    }

    // Convert object to array for rendering
    const instruments = Object.entries(summaryData.financial_instruments).map(
      ([key, data]) => ({
        market: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize first letter
        score: data.impact,
        reasoning: data.reason,
      })
    );

    // Filter out instruments with zero impact
    const filteredInstruments = instruments.filter((item) => item.score !== 0);

    if (filteredInstruments.length === 0) {
      return null;
    }

    return (
      <div className="mt-6">
        <h2
          className={`text-lg font-medium mb-3 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Financial Instrument Impact
        </h2>
        {filteredInstruments.map((item, index) => (
          <div key={index} style={styles.impactCard}>
            <div style={styles.impactCardHeader}>
              <div style={styles.symbolText}>{item.market}</div>
              <div
                style={
                  parseInt(item.score) >= 0
                    ? styles.scorePositive
                    : styles.scoreNegative
                }
              >
                {item.score > 0 ? "+" : ""}
                {item.score}
                <FontAwesomeIcon
                  icon={parseInt(item.score) >= 0 ? faArrowUp : faArrowDown}
                  style={styles.scoreIcon}
                />
              </div>
            </div>
            <div style={styles.reasonText}>
              <span style={{ fontWeight: "500" }}>Reasoning:</span>{" "}
              {item.reasoning}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Render risks and opportunities
  const renderRisksOpportunities = () => {
    if (!summaryData || !summaryData.risks_opportunities) {
      return null;
    }

    const { opportunities, long_term_risks, short_term_risks } =
      summaryData.risks_opportunities;

    return (
      <div className="mt-6">
        <h2
          className={`text-lg font-medium mb-3 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Risks & Opportunities
        </h2>

        {opportunities && (
          <div style={styles.impactCard}>
            <div style={{ ...styles.symbolText, marginBottom: "8px" }}>
              Opportunities
            </div>
            <div style={styles.reasonText}>{opportunities}</div>
          </div>
        )}

        {short_term_risks && (
          <div style={styles.impactCard}>
            <div style={{ ...styles.symbolText, marginBottom: "8px" }}>
              Short Term Risks
            </div>
            <div style={styles.reasonText}>{short_term_risks}</div>
          </div>
        )}

        {long_term_risks && (
          <div style={styles.impactCard}>
            <div style={{ ...styles.symbolText, marginBottom: "8px" }}>
              Long Term Risks
            </div>
            <div style={styles.reasonText}>{long_term_risks}</div>
          </div>
        )}
      </div>
    );
  };

  // Render sector impact
  const renderSectorImpact = () => {
    if (!summaryData || !summaryData.sector_impact) {
      return null;
    }

    const { primary, secondary, regional, global_level } =
      summaryData.sector_impact;

    return (
      <div className="mt-6">
        <h2
          className={`text-lg font-medium mb-3 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Sector Impact
        </h2>

        {primary && primary.length > 0 && (
          <div style={styles.impactCard}>
            <div style={{ ...styles.symbolText, marginBottom: "8px" }}>
              Primary Sectors
            </div>
            <div style={styles.reasonText}>{primary.join(", ")}</div>
          </div>
        )}

        {secondary && secondary.length > 0 && (
          <div style={styles.impactCard}>
            <div style={{ ...styles.symbolText, marginBottom: "8px" }}>
              Secondary Sectors
            </div>
            <div style={styles.reasonText}>{secondary.join(", ")}</div>
          </div>
        )}

        {regional && regional.length > 0 && (
          <div style={styles.impactCard}>
            <div style={{ ...styles.symbolText, marginBottom: "8px" }}>
              Regions Affected
            </div>
            <div style={styles.reasonText}>{regional.join(", ")}</div>
          </div>
        )}

        {global_level && (
          <div style={styles.impactCard}>
            <div style={{ ...styles.symbolText, marginBottom: "8px" }}>
              Global Impact Level
            </div>
            <div style={styles.reasonText}>{global_level}</div>
          </div>
        )}
      </div>
    );
  };

  // Render sentiment analysis
  const renderSentiment = () => {
    if (!summaryData || !summaryData.sentiment) {
      return null;
    }

    const { market, social_media, institutional } = summaryData.sentiment;

    return (
      <div className="mt-6">
        <h2
          className={`text-lg font-medium mb-3 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        >
          Market Sentiment
        </h2>

        {market && (
          <div style={styles.impactCard}>
            <div style={{ ...styles.symbolText, marginBottom: "8px" }}>
              Overall Market Sentiment
            </div>
            <div style={styles.reasonText}>{market}</div>
          </div>
        )}

        {social_media && (
          <div style={styles.impactCard}>
            <div style={{ ...styles.symbolText, marginBottom: "8px" }}>
              Social Media Sentiment
            </div>
            <div style={styles.reasonText}>{social_media}</div>
          </div>
        )}

        {institutional && (
          <div style={styles.impactCard}>
            <div style={{ ...styles.symbolText, marginBottom: "8px" }}>
              Institutional Sentiment
            </div>
            <div style={styles.reasonText}>{institutional}</div>
          </div>
        )}
      </div>
    );
  };

  // Only render if the sidebar should be visible
  if (!shouldRenderSidebar) {
    return null;
  }

  return (
    <>
      {/* Overlay that covers the entire page */}
      <div
        style={styles.overlay}
        onClick={handleCloseSidebar}
        className="summary-detail-overlay"
      />

      {/* Sidebar content */}
      <div
        style={styles.summaryDetailSidebar}
        className="globalScroll summary-detail-sidebar sm:w-[450px]"
        ref={sidebarRef}
      >
        <div style={styles.summaryContent}>
          <div className="flex mb-5 gap-3 items-start">
            <button
              style={styles.backButton}
              className="hover:bg-gray-700/30"
              onClick={handleCloseSidebar}
              aria-label="Back to summary"
            >
              <img
                src={
                  isDarkMode
                    ? "/images/arrow-back-light.svg"
                    : "/images/arrow-back-dark.svg"
                }
                alt="Back"
              />
            </button>
            <h1 style={styles.title}>{getFormattedTitle()}</h1>
            {/* <button
              style={{ ...styles.backButton, paddingTop: "10px" }}
              className="hover:bg-gray-700/30 ml-auto"
              onClick={handleCloseSidebar}
              aria-label="Download"
            >
              <img
                src={
                  isDarkMode
                    ? "/images/download-light.svg"
                    : "/images/download-dark.svg"
                }
                alt="Download"
              />
            </button> */}
          </div>

          {/* Audio Player */}
          {/* <AudioPlayer /> */}

          {/* Content based on loading/error state */}
          {loading ? (
            <div style={styles.loaderContainer}>
              <div style={styles.loader}></div>
              <div style={styles.loaderText}>Loading impact data...</div>
            </div>
          ) : error ? (
            <div style={styles.errorContainer}>{error}</div>
          ) : (
            <>
              {/* Dynamic content based on API response */}
              {renderCompanyImpacts()}
              {renderFinancialInstruments()}
              {renderRisksOpportunities()}
              {renderSectorImpact()}
              {renderSentiment()}
            </>
          )}
        </div>

        {/* Add a style tag for additional styling */}
        <style jsx="true">{`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
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

          /* Enhanced animation effects */
          .summary-detail-overlay {
            transition: opacity 0.3s ease;
          }

          .summary-detail-sidebar {
            transition: transform 0.3s ease,
              opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: ${isDarkMode
              ? "-4px 0 15px rgba(0, 0, 0, 0.5)"
              : "-4px 0 15px rgba(0, 0, 0, 0.1)"};
          }
        `}</style>
      </div>
    </>
  );
};

export default SummaryDetail;
