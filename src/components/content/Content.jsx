import React, { useEffect, useState, useRef } from "react";
import NewsDetails from "./NewsDetails";
import AudioPlayer from "./AudioPlayer";
import ImpactCharts from "./ImpactCharts";
import NewsHighlights from "./NewsHighlights";
import SpiderxSearchBar from "./SpiderxSearchBar";
import Chat from "../Chat";
// Import the SkeletonLoader
import SkeletonLoader from "../SkeletonLoader";

import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { useSelector, useDispatch } from "react-redux";
import { setRightSidebarVisible } from "../../store/slice/newsDetailsSlice";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const Content = ({
  contentRef,
  newsDetails,
  loading,
  error,
  partialAccess,
  onLoginRequired,
  showContentDirectly = false,
  onImpactClick, // ADD THIS: New prop for handling chart impact clicks
}) => {
  const activeNewsId = useSelector((state) => state.newsDetails.activeNewsId);
  const currentTheme = useSelector((state) => state.theme.currentTheme);
  const menuItems = useSelector((state) => state.newsDetails.menuItems);
  const chatVisible = useSelector((state) => state.newsDetails.chatVisible);
  const settings = useSelector((state) => state.settings.settings);
  const rightSidebarVisible = useSelector(
    (state) => state.newsDetails.rightSidebarVisible
  );

  // Add dispatch and window width state
  const dispatch = useDispatch();
  const [windowWidth, setWindowWidth] = useState(1024); // Default to desktop width for SSR
  const [activeHeadline, setActiveHeadline] = useState(null);

  // State for rotating loading messages
  const [currentLoadingMessage, setCurrentLoadingMessage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Array of engaging loading messages with enhanced AI messaging

  const loadingMessages = [
    {
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
            fill="currentColor"
          />
          <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.5">
            <animate
              attributeName="r"
              values="1;4;1"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      ),
      text: "AI scanning global news sources in real-time...",
      subtext: "Processing 847 news articles per second",
    },

    {
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2L2 7l10 5 10-5-10-5z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M2 17l10 5 10-5"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M2 12l10 5 10-5"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <circle cx="12" cy="12" r="2" fill="currentColor">
            <animate
              attributeName="fill-opacity"
              values="0.5;1;0.5"
              dur="1s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      ),
      text: "Neural networks processing sentiment and context...",
      subtext: "Analyzing 2.3M data points for patterns",
    },
    {
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="3"
            y="4"
            width="18"
            height="18"
            rx="2"
            ry="2"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <rect
            x="7"
            y="8"
            width="4"
            height="8"
            fill="currentColor"
            opacity="0.7"
          >
            <animate
              attributeName="height"
              values="2;8;2"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </rect>
          <rect
            x="13"
            y="8"
            width="4"
            height="8"
            fill="currentColor"
            opacity="0.5"
          >
            <animate
              attributeName="height"
              values="8;2;8"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </rect>
        </svg>
      ),
      text: "Cross-referencing with market data and trends...",
      subtext: "Validating against 340+ financial metrics",
    },
    {
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <polyline
            points="7.5,4.21 12,6.81 16.5,4.21"
            stroke="currentColor"
            strokeWidth="1"
          />
          <polyline
            points="7.5,19.79 7.5,14.6 3,12"
            stroke="currentColor"
            strokeWidth="1"
          />
          <polyline
            points="21,12 16.5,14.6 16.5,19.79"
            stroke="currentColor"
            strokeWidth="1"
          />
          <circle cx="12" cy="12" r="2" fill="currentColor">
            <animate
              attributeName="r"
              values="1;3;1"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      ),
      text: "AI correlating geopolitical events with asset prices...",
      subtext: "Mapping impact across 15 major asset classes",
    },
    {
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 12l2 2 4-4"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M12 21c0-1-1-3-3-3s-3 2-3 3 1 3 3 3 3-2 3-3"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <circle cx="12" cy="12" r="1" fill="currentColor">
            <animate
              attributeName="fill-opacity"
              values="0.3;1;0.3"
              dur="1.2s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      ),
      text: "Machine learning algorithms detecting market anomalies...",
      subtext: "Identifying unusual patterns and opportunities",
    },
    {
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <polyline
            points="9,22 9,12 15,12 15,22"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="7" cy="7" r="1" fill="currentColor">
            <animate
              attributeName="fill-opacity"
              values="0.5;1;0.5"
              dur="1s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="12" cy="7" r="1" fill="currentColor">
            <animate
              attributeName="fill-opacity"
              values="1;0.5;1"
              dur="1s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="17" cy="7" r="1" fill="currentColor">
            <animate
              attributeName="fill-opacity"
              values="0.5;1;0.5"
              dur="1s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      ),
      text: "Synthesizing intelligence from premium data providers...",
      subtext: "Curating insights from institutional sources",
    },
    {
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="12"
            cy="12"
            r="3"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M12 1v6m0 6v6m11-7h-6m-6 0H1"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="12" cy="12" r="1" fill="currentColor">
            <animate
              attributeName="r"
              values="0.5;2;0.5"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      ),
      text: "AI calculating impact scores and correlation matrices...",
      subtext: "Generating predictive analytics models",
    },
    {
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <polyline
            points="22,12 18,12 15,21 9,3 6,12 2,12"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <circle cx="15" cy="12" r="2" fill="currentColor" opacity="0.7">
            <animate
              attributeName="opacity"
              values="0.3;1;0.3"
              dur="1s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      ),
      text: "Real-time sentiment analysis across social platforms...",
      subtext: "Monitoring Twitter, Reddit, financial forums",
    },
    {
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <polyline
            points="14,2 14,8 20,8"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="16"
            y1="13"
            x2="8"
            y2="13"
            stroke="currentColor"
            strokeWidth="2"
          />
          <line
            x1="16"
            y1="17"
            x2="8"
            y2="17"
            stroke="currentColor"
            strokeWidth="2"
          />
          <polyline
            points="10,9 9,9 8,9"
            stroke="currentColor"
            strokeWidth="2"
          />
          <rect
            x="8"
            y="15"
            width="8"
            height="1"
            fill="currentColor"
            opacity="0.5"
          >
            <animate
              attributeName="width"
              values="0;8;0"
              dur="2s"
              repeatCount="indefinite"
            />
          </rect>
        </svg>
      ),
      text: "Generating comprehensive market impact report...",
      subtext: "Compiling analysis with actionable insights",
    },
    {
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <polyline
            points="12,6 12,12 16,14"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="12" cy="12" r="2" fill="currentColor">
            <animateTransform
              attributeName="transform"
              attributeType="XML"
              type="rotate"
              from="0 12 12"
              to="360 12 12"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      ),
      text: "Applying temporal analysis for timing predictions...",
      subtext: "Modeling short and long-term market effects",
    },
    {
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.6">
            <animate
              attributeName="opacity"
              values="0.3;1;0.3"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      ),
      text: "AI finalizing personalized insights and recommendations...",
      subtext: "Tailoring analysis for your investment strategy",
    },
    {
      icon: (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <polyline
            points="9,11 12,14 22,4"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
          <circle cx="12" cy="12" r="2" fill="currentColor">
            <animate
              attributeName="fill-opacity"
              values="0.5;1;0.5"
              dur="1s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      ),
      text: "Quality check complete - delivering premium analysis...",
      subtext: "Your comprehensive market intelligence is ready",
    },
  ];

  // Create ref for chat end scrolling
  const chatEndRef = useRef(null);

  // Add window resize listener
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    // Set initial window width
    setWindowWidth(window.innerWidth);
    
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Function to toggle right sidebar
  const toggleRightSidebar = () => {
    dispatch(setRightSidebarVisible(!rightSidebarVisible));
  };

  // Rotate loading messages when loading is active with enhanced animation
  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setIsAnimating(true);
        setTimeout(() => {
          setCurrentLoadingMessage(
            (prev) => (prev + 1) % loadingMessages.length
          );
          setIsAnimating(false);
        }, 300);
      }, 2500); // Change message every 2.5 seconds
    } else {
      setCurrentLoadingMessage(0); // Reset to first message when not loading
      setIsAnimating(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [loading, loadingMessages.length]);

  // Check if currentTheme is an object or a string
  const isDarkMode =
    typeof currentTheme === "object"
      ? currentTheme.backgroundColor === "#000"
      : currentTheme !== "light";

  // Get the headline of the active news item
  useEffect(() => {
    if (activeNewsId && menuItems && menuItems.length > 0) {
      const activeNews = menuItems.find((item) => item.id === activeNewsId);
      if (activeNews) {
        const headline = activeNews.headline || activeNews.title || null;
        setActiveHeadline(headline);
      } else if (
        newsDetails &&
        newsDetails.results &&
        newsDetails.results.length > 0
      ) {
        // If active news ID doesn't match any sidebar item but we have news details loaded
        const headline =
          newsDetails.results[0].headline ||
          newsDetails.results[0].title ||
          null;
        setActiveHeadline(headline);
      }
    }
  }, [activeNewsId, menuItems, newsDetails]);

  // Define scrollbar styles
  const scrollbarStyles = {
    customScrollbar: {
      scrollbarWidth: "thin",
      scrollbarColor: `${isDarkMode ? "#333 #1a1a1a" : "#c1c1c1 #f1f1f1"}`,
    },
    "::-webkit-scrollbar": {
      width: "8px",
    },
    "::-webkit-scrollbar-track": {
      background: isDarkMode ? "#1a1a1a" : "#f1f1f1",
      borderRadius: "4px",
    },
    "::-webkit-scrollbar-thumb": {
      background: isDarkMode ? "#333" : "#c1c1c1",
      borderRadius: "4px",
    },
    "::-webkit-scrollbar-thumb:hover": {
      background: isDarkMode ? "#555" : "#a1a1a1",
    },
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const renderNewsContent = () => {
    if (loading) {
      return (
        <div
          style={{
            backgroundColor: currentTheme.backgroundColor,
            padding: "0 20px",
            opacity: 0.5,
          }}
        >
          <div className="mb-6 mt-4">
            <SkeletonLoader type="news-detail" count={1} />
          </div>
          <div className="mt-8 mb-6 " style={{ padding: "20px" }}>
            <h3
              className={`text-xl font-medium mb-4 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Market Impact
            </h3>
            <SkeletonLoader type="chart" />
          </div>

          {/* Skeleton loader for news highlights */}
          {/* <div className="mt-8 mb-6" style={{ padding: "20px" }}>
            <h3
              className={`text-xl font-medium mb-4 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Key Highlights
            </h3>
            <div className="space-y-4">
              <SkeletonLoader type="text-line" count={4} />
            </div>
          </div> */}
        </div>
      );
    }

    if (error) {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "50vh",
          }}
        >
          <div style={{ color: currentTheme.textColor, marginBottom: "16px" }}>
            {error}
          </div>
          {/* Add a retry button when error occurs */}
        </div>
      );
    }

    if (
      !newsDetails ||
      !newsDetails.results ||
      newsDetails.results.length === 0
    ) {
      return (
        <div style={{ padding: "20px" }}>
          <h1
            style={{
              fontSize: "26px",
              fontWeight: "400",
              marginBottom: "16px",
              color: currentTheme.textColor,
            }}
          >
            No news data available
          </h1>
          <p style={{ color: currentTheme.mutedText, marginBottom: "16px" }}>
            There are no news articles available for the current selection. Try
            selecting a different sector or region.
          </p>
        </div>
      );
    }

    const newsItem = newsDetails.results[0];
    const newsObj = newsItem.newsobj || {};
    const headline =
      newsObj.headline ||
      newsItem.headline ||
      activeHeadline ||
      "Untitled News";
    const summary = newsObj.summary || "";
    const highlights = newsObj.highlights || [];

    return (
      <div
        className="2xl:px-[40px] px-[20px] pb-24"
        style={{ backgroundColor: currentTheme.backgroundColor }}
      >
        <NewsDetails
          newsItem={newsItem}
          headline={headline}
          activeHeadline={activeHeadline}
          theme={currentTheme}
          showContentDirectly={showContentDirectly}
          partialAccess={partialAccess}
          onLoginRequired={onLoginRequired}
        />

        {settings?.enablepodcast && <AudioPlayer theme={currentTheme} />}

        {/* {summary && summary !== 'No summary provided' && (
          <div
            style={{
              backgroundColor: currentTheme.cardBg,
              borderRadius: '12px',
              padding: '10px',
              marginBottom: '24px',
              color: '#d1d5db',
              fontSize: '16px',
              lineHeight: '1.6',
              fontWeight: '300',
            }}
          >
            {summary}
          </div>
        )} */}

        {(newsObj?.what_is_this_news ||
          newsObj?.why_relevant_to_search ||
          newsObj?.impact_of_this_news ||
          (newsObj.news_image && isValidUrl(newsObj.news_image))) && (
          <div
            className={`mt-6 md:grid ${
              isValidUrl(newsObj.news_image) &&
              (newsObj?.what_is_this_news ||
                newsObj?.why_relevant_to_search ||
                newsObj?.impact_of_this_news)
                ? "xl:grid-cols-2"
                : "xl:grid-cols-1"
            } md:gap-3 mb-8`}
          >
            {/* Left Column: Banner Image */}
            <div className="mb-4 md:mb-0">
              {isValidUrl(newsObj.news_image) ? (
                <img
                  src={newsObj.news_image}
                  alt="Banner"
                  className="w-full h-full rounded-lg xl:rounded-2xl object-cover"
                />
              ) : null}
            </div>

            {/* Right Column: Content */}
            {(newsObj?.what_is_this_news ||
              newsObj?.why_relevant_to_search ||
              newsObj?.impact_of_this_news) && (
              <div>
                <div className="px-4">
                  {newsObj?.what_is_this_news && (
                    <div className="mb-4">
                      <h3
                        className={`text-xl font-medium mb-2 uppercase ${
                          isDarkMode ? "text-gray-300" : "text-black"
                        }`}
                      >
                        What?
                      </h3>
                      <p
                        className={`text-base ${
                          isDarkMode ? "text-gray-400" : "text-gray-800"
                        }`}
                      >
                        {newsObj?.what_is_this_news
                          ? newsObj.what_is_this_news
                          : "Not Available"}
                      </p>
                    </div>
                  )}
                  {newsObj?.why_relevant_to_search && (
                    <div className="mb-4">
                      <h3
                        className={`text-xl font-medium mb-2 uppercase ${
                          isDarkMode ? "text-gray-300" : "text-black"
                        }`}
                      >
                        Why?
                      </h3>
                      <p
                        className={`text-base ${
                          isDarkMode ? "text-gray-400" : "text-gray-800"
                        }`}
                      >
                        {newsObj?.why_relevant_to_search
                          ? newsObj.why_relevant_to_search
                          : "Not Available"}
                      </p>
                    </div>
                  )}
                  {newsObj?.impact_of_this_news && (
                    <div className="mb-4">
                      <h3
                        className={`text-xl font-medium mb-2 uppercase ${
                          isDarkMode ? "text-gray-300" : "text-black"
                        }`}
                      >
                        impact
                      </h3>
                      <p
                        className={`text-base ${
                          isDarkMode ? "text-gray-400" : "text-gray-800"
                        }`}
                      >
                        {newsObj?.impact_of_this_news
                          ? newsObj.impact_of_this_news
                          : "Not Available"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        {/* Existing Components */}
        <NewsHighlights newsDetails={newsDetails} theme={currentTheme} />
        {/* Show ImpactCharts based on status (>=4) and impact rating combinations */}
        {(() => {
          const currentStatus = newsDetails?.results?.[0]?.status;
          const impactRatings = newsObj?.impact_ratings || {};
          const validImpactRatings = Object.entries(impactRatings).filter(
            ([key, value]) => {
              const score =
                typeof value.score === "number"
                  ? value.score
                  : parseFloat(value.score);
              return (
                !isNaN(score) && score !== 0 && value.score !== "not available"
              );
            }
          );

          // Count positive and negative ratings
          const positiveRatings = validImpactRatings.filter(([key, value]) => {
            const score =
              typeof value.score === "number"
                ? value.score
                : parseFloat(value.score);
            return score > 0;
          });

          const negativeRatings = validImpactRatings.filter(([key, value]) => {
            const score =
              typeof value.score === "number"
                ? value.score
                : parseFloat(value.score);
            return score < 0;
          });

          // Hide charts if status < 4 OR if insufficient data
          const shouldHideCharts =
            currentStatus == null ||
            currentStatus < 4 ||
            (positiveRatings.length <= 2 && negativeRatings.length <= 2) ||
            validImpactRatings.length <= 2;

          // Always render ImpactCharts but pass shouldHide prop
          return (
            <ImpactCharts
              newsObj={newsObj}
              theme={currentTheme}
              onImpactClick={onImpactClick}
              shouldHide={shouldHideCharts}
            />
          );
        })()}
      </div>
    );
  };

  return (
    <div
      style={{
        height: "100%",
        backgroundColor: currentTheme.backgroundColor,
        position: "relative",
        flex: 1,
      }}
      ref={contentRef}
      className="mobile-container 2xl:w-fit flex-1 md:right-auto md:transform-none"
    >
      <button
        className={`mobile-back-btn w-10 h-10 rounded flex md:hidden items-center justify-center cursor-pointer my-3 ms-4
          ${
            isDarkMode
              ? "bg-gray-800 text-gray-300"
              : "bg-gray-100 text-gray-600"
          }`}
        style={{ display: "none" }}
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
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          scrollBehavior: "smooth",
          height: "100%",
          ...scrollbarStyles.customScrollbar,
        }}
        className="custom-scrollbar sm:pt-4 pt-1"
      >
        {renderNewsContent()}
      </div>

      {/* Summary popup button for mobile - positioned relative to content */}
      {windowWidth < 1024 && showContentDirectly && (
        <div className="relative">
          <div
            className="summary-popup-icon absolute bottom-36 right-4 bg-white w-12 h-12 rounded-full flex items-center justify-center border-none cursor-pointer bg-gradient-to-br from-[#CBFEFF] to-[#6ABCFF]"
            onClick={toggleRightSidebar}
            style={{
              cursor: "pointer",
            }}
          >
            <img
              className="sector-popup-icon hover:scale-105 transition-transform duration-200"
              src="/images/summary-icon.svg"
              alt="Sector popup"
            />
          </div>
        </div>
      )}

      {/* Loading overlay - positioned outside scrollable area */}
      {loading && (
        <div
          className="hidden md:block"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: isDarkMode
              ? "linear-gradient(135deg, rgba(30, 30, 30, 0.95) 0%, rgba(20, 20, 20, 0.98) 100%)"
              : "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 248, 248, 0.98) 100%)",
            backdropFilter: "blur(20px)",
            color: isDarkMode ? "#fff" : "#222",
            padding: "40px",
            borderRadius: "24px",
            boxShadow: isDarkMode
              ? "0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.1)"
              : "0 20px 60px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)",
            zIndex: 40,
            minWidth: "380px",
            textAlign: "center",
            marginLeft: "auto",
            marginRight: "auto",
            border: isDarkMode
              ? "1px solid rgba(255,255,255,0.1)"
              : "1px solid rgba(0,0,0,0.05)",
          }}
        >
          {/* Animated Icon */}
          <div className="flex justify-center mb-6">
            <div
              style={{
                position: "relative",
                transition: "all 0.3s ease",
                transform: isAnimating ? "scale(0.9)" : "scale(1)",
                opacity: isAnimating ? 0.5 : 1,
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  background: isDarkMode
                    ? "linear-gradient(135deg, #0ea5e9 0%, #8b5cf6 100%)"
                    : "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "28px",
                  boxShadow: isDarkMode
                    ? "0 8px 24px rgba(14, 165, 233, 0.3)"
                    : "0 8px 24px rgba(59, 130, 246, 0.3)",
                  animation: "pulse 2s infinite",
                }}
              >
                {loadingMessages[currentLoadingMessage].icon}
              </div>

              {/* Orbital rings */}
              <div
                style={{
                  position: "absolute",
                  inset: "0",
                  border: `2px solid ${
                    isDarkMode
                      ? "rgba(14, 165, 233, 0.3)"
                      : "rgba(59, 130, 246, 0.3)"
                  }`,
                  borderRadius: "16px",
                  animation: "spin 2s linear infinite",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: "-8px",
                  border: `1px solid ${
                    isDarkMode
                      ? "rgba(139, 92, 246, 0.2)"
                      : "rgba(139, 92, 246, 0.2)"
                  }`,
                  borderRadius: "24px",
                  animation: "spin 3s linear infinite reverse",
                }}
              />
            </div>
          </div>

          {/* Loading Text */}
          <div
            style={{
              transition: "all 0.3s ease",
              transform: isAnimating ? "translateY(8px)" : "translateY(0)",
              opacity: isAnimating ? 0.5 : 1,
            }}
          >
            <h3
              style={{
                marginBottom: "8px",
                fontWeight: 600,
                fontSize: "18px",
                lineHeight: "1.4",
                color: isDarkMode ? "#ffffff" : "#1f2937",
              }}
            >
              {loadingMessages[currentLoadingMessage].text}
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: "14px",
                opacity: 0.8,
                lineHeight: "1.4",
                color: isDarkMode ? "#93c5fd" : "#6366f1",
              }}
            >
              {loadingMessages[currentLoadingMessage].subtext}
            </p>
          </div>

          {/* Floating particles effect */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              overflow: "hidden",
              pointerEvents: "none",
              borderRadius: "24px",
            }}
          >
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  width: "4px",
                  height: "4px",
                  background: isDarkMode
                    ? "rgba(14, 165, 233, 0.3)"
                    : "rgba(59, 130, 246, 0.3)",
                  borderRadius: "50%",
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `float ${
                    3 + Math.random() * 2
                  }s ease-in-out infinite`,
                  animationDelay: `${Math.random() * 3}s`,
                }}
              />
            ))}
          </div>
        </div>
      )}
      {/* Chat and Search bar container fixed at the bottom */}
      {settings?.enablechatbot && (
        <div
          className={`md:p-4 p-2`}
          style={{
            position: "absolute", // Absolutely positioned within the Content component
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: currentTheme.backgroundColor,
            borderTop: `1px solid ${currentTheme.borderColor}`,
            zIndex: 2, // Ensure it stays on top of other content
          }}
        >
          {/* Chat component - rendered just before SpiderxSearchBar */}
          {chatVisible && <Chat chatEndRef={chatEndRef} />}

          {/* Search bar */}
          {!chatVisible && (
            <SpiderxSearchBar
              partialAccess={partialAccess}
              onLoginRequired={onLoginRequired}
            />
          )}
        </div>
      )}
      {/* Add a style tag for the scrollbar styles that changes based on theme */}
      <style>
        {`
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
          
          /* Enhanced loading animations */
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes pulse {
            0%, 100% { 
              transform: scale(1);
              opacity: 0.9;
            }
            50% { 
              transform: scale(1.05);
              opacity: 1;
            }
          }
          
          @keyframes float {
            0%, 100% { 
              transform: translateY(0px) rotate(0deg); 
              opacity: 0; 
            }
            50% { 
              transform: translateY(-20px) rotate(180deg); 
              opacity: 1; 
            }
          }
        `}
      </style>
    </div>
  );
};

export default Content;
