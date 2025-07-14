import React, { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";

// MOVE LOADING TEXTS OUTSIDE COMPONENT TO PREVENT RECREATION
const loadingTexts = [
  {
    text: "AI scanning global news sources in real-time...",
    subtext: "Processing 847 news articles per second",
  },
  {
    text: "Neural networks processing sentiment and context...",
    subtext: "Analyzing 2.3M data points for patterns",
  },
  {
    text: "Cross-referencing with market data and trends...",
    subtext: "Validating against 340+ financial metrics",
  },
  {
    text: "AI correlating geopolitical events with asset prices...",
    subtext: "Mapping impact across 15 major asset classes",
  },
  {
    text: "Machine learning algorithms detecting market anomalies...",
    subtext: "Identifying unusual patterns and opportunities",
  },
  {
    text: "Synthesizing intelligence from premium data providers...",
    subtext: "Curating insights from institutional sources",
  },
  {
    text: "AI calculating impact scores and correlation matrices...",
    subtext: "Generating predictive analytics models",
  },
  {
    text: "Real-time sentiment analysis across social platforms...",
    subtext: "Monitoring Twitter, Reddit, financial forums",
  },
  {
    text: "Generating comprehensive market impact report...",
    subtext: "Compiling analysis with actionable insights",
  },
  {
    text: "Applying temporal analysis for timing predictions...",
    subtext: "Modeling short and long-term market effects",
  },
  {
    text: "AI finalizing personalized insights and recommendations...",
    subtext: "Tailoring analysis for your investment strategy",
  },
  {
    text: "Quality check complete - delivering premium analysis...",
    subtext: "Your comprehensive market intelligence is ready",
  },
];

const Loader = ({ isVisible = true }) => {
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(320);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileHeaderHeight, setMobileHeaderHeight] = useState(0);

  // GET DYNAMIC DATA FROM REDUX
  const menuItems = useSelector((state) => state.newsDetails.menuItems);

  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);
  const [loadedNews, setLoadedNews] = useState([]);
  const [showSkeletons, setShowSkeletons] = useState(true);
  const [countdown, setCountdown] = useState(10); // Start with reduced time
  const [loadingMessage, setLoadingMessage] = useState(loadingTexts[0]);
  const [currentlyLoadingIndex, setCurrentlyLoadingIndex] = useState(-1);

  // MEMOIZE TRANSFORMED NEWS ITEMS TO PREVENT RECREATION
  const transformedNewsItems = useMemo(() => {
    return menuItems.map((news) => ({
      id: news.id,
      source: news.newsobj?.source || "Unknown",
      sourceIcon:
        news.newsobj?.["image/video"] || news.newsobj?.source?.charAt(0) || "?",
      time: news.newsobj?.date
        ? new Date(news.newsobj.date).toLocaleDateString()
        : news.created_at
        ? new Date(news.created_at).toLocaleDateString()
        : "Unknown date",
      title: news.headline || news.title || "No title",
      excerpt: news.newsobj?.summary || "No summary available",
      tags: ["News"],
      impact: "medium",
      impactText: "Medium Impact",
    }));
  }, [menuItems]);

  useEffect(() => {
    const calculateSidebarWidth = () => {
      // Only run on client side
      if (typeof window === 'undefined') return;
      
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      setIsMobile(windowWidth < 768);

      if (windowWidth < 768) {
        // Mobile - calculate header height dynamically
        const calculateMobileHeaderHeight = () => {
          let totalHeaderHeight = 0;

          // Main header (always present)
          const mainHeader = document.querySelector(".header-container");
          if (mainHeader) {
            totalHeaderHeight += mainHeader.offsetHeight;
          } else {
            totalHeaderHeight += 64; // Default header height
          }

          // Mobile search bar (if present)
          const mobileSearchContainer = document.querySelector(
            '[style*="position: fixed"][style*="top: 64px"]'
          );
          if (mobileSearchContainer) {
            totalHeaderHeight += mobileSearchContainer.offsetHeight;
          }

          return totalHeaderHeight;
        };

        setMobileHeaderHeight(calculateMobileHeaderHeight());
        setLeftSidebarWidth(0);
        return;
      }

      // Desktop - calculate left sidebar width ONCE and keep it fixed
      // This prevents the loader from moving when menu opens/closes
      const leftMenu = document.querySelector(".left-menu-animated");
      const sidebar = document.querySelector(
        '[class*="max-w-[250px]"], [class*="max-w-[350px]"], [class*="max-w-[410px]"]'
      );

      let totalWidth = 60; // Default collapsed left menu width

      if (leftMenu) {
        const leftMenuWidth = leftMenu.offsetWidth;
        totalWidth = leftMenuWidth;
      }

      if (sidebar) {
        const sidebarWidth = sidebar.offsetWidth;
        totalWidth += sidebarWidth;
      } else {
        // Fallback calculations based on screen size
        if (windowWidth >= 1536) {
          // 2xl
          totalWidth += 410;
        } else if (windowWidth >= 1280) {
          // xl
          totalWidth += 350;
        } else if (windowWidth >= 768) {
          // md
          totalWidth += 250;
        } else {
          totalWidth += 250;
        }
      }

      setLeftSidebarWidth(totalWidth);
    };

    // Initial calculation - only run once when component mounts
    calculateSidebarWidth();

    // Only recalculate on window resize (not on menu state changes)
    const handleResize = () => {
      calculateSidebarWidth();
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []); // Empty dependency array ensures this only runs once

  useEffect(() => {
    // Only start loading if we have data
    if (transformedNewsItems.length === 0) {
      // Reset states when no data
      setCurrentNewsIndex(0);
      setLoadedNews([]);
      setShowSkeletons(true);
      setCountdown(10); // Reduced from 25 to 10 seconds
      setLoadingMessage(loadingTexts[0]);
      setCurrentlyLoadingIndex(-1);
      return;
    }

    // Reset states for progressive loading
    setCurrentNewsIndex(0);
    setLoadedNews([]);
    setShowSkeletons(true);
    setCountdown(10);
    setLoadingMessage(loadingTexts[0]);
    setCurrentlyLoadingIndex(-1);

    // Start countdown - resets when reaches 0 to keep loading feeling alive
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          return 10; // Reset to 10 seconds instead of stopping
        }
        return prev - 1;
      });
    }, 800);

    // SLOWER Progressive loading for better user experience + INFINITE CYCLING
    const loadingInterval = setInterval(() => {
      setCurrentNewsIndex((prev) => {
        let newIndex;

        if (prev < transformedNewsItems.length) {
          // First cycle - loading items one by one
          newIndex = prev + 1;
          setLoadedNews(transformedNewsItems.slice(0, newIndex));
        } else {
          newIndex = 1;
          setLoadedNews(transformedNewsItems.slice(0, newIndex));
        }

        // Set currently loading item
        setCurrentlyLoadingIndex(newIndex - 1);
        setLoadingMessage(
          loadingTexts[Math.min(newIndex - 1, loadingTexts.length - 1)]
        );

        // Keep loading animation for longer so user can see it
        setTimeout(() => {
          setCurrentlyLoadingIndex(-1);
        }, 2000); // Increased to 2 seconds for better visibility

        return newIndex;
      });
    }, 2500); // Slower loading - 2.5 seconds per item for better user experience

    // Remove skeletons after first item loads
    const skeletonTimeout = setTimeout(() => {
      setShowSkeletons(false);
    }, 500);

    // Rotate loading messages independently for variety
    const messageRotationInterval = setInterval(() => {
      setLoadingMessage((prevMessage) => {
        const currentIndex = loadingTexts.findIndex(
          (text) => text.text === prevMessage.text
        );
        const nextIndex = (currentIndex + 1) % loadingTexts.length;
        return loadingTexts[nextIndex];
      });
    }, 3000); // Change message every 3 seconds

    return () => {
      clearInterval(countdownInterval);
      clearInterval(loadingInterval);
      clearInterval(messageRotationInterval);
      clearTimeout(skeletonTimeout);
    };
  }, [transformedNewsItems]);

  // Inline styles to prevent conflicts
  const spinKeyframes = `
    @keyframes newsloader-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes newsloader-pulse {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 0.8; }
    }
  `;

  const SkeletonItem = () => (
    <div className="rounded-xl border overflow-hidden bg-[#22262a] border-gray-700 opacity-60">
      <div className="p-3 sm:p-4 md:p-5">
        <div className="rounded mb-2 h-4 bg-gray-600 w-3/5 animate-pulse"></div>
        <div className="rounded mb-2 h-4 bg-gray-600 w-4/5 animate-pulse"></div>
        <div className="rounded mb-2 h-4 bg-gray-600 w-full animate-pulse"></div>
        <div className="rounded h-4 bg-gray-600 w-3/5 animate-pulse"></div>
      </div>
    </div>
  );

  const NewsItem = ({ news, index }) => {
    const isCurrentlyLoading = currentlyLoadingIndex === index;

    const impactColors = {
      high: "#ff4444",
      medium: "#ffaa00",
      low: "#4caf50",
    };

    return (
      <div
        className={`
          rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-lg
          ${
            isCurrentlyLoading
              ? "border-gray-700 opacity-60"
              : "border-gray-700"
          }
        `}
        style={{
          background: "#1a1a1a",
          boxShadow: isCurrentlyLoading
            ? "0 8px 32px rgba(0, 188, 212, 0.1)"
            : "none",
        }}
      >
        <div className="p-3 sm:p-4 md:p-5">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center mb-2">
              <div className="w-5 h-5 rounded-full mr-2 flex items-center justify-center text-xs font-bold bg-cyan-400 text-black">
                {news.sourceIcon && news.sourceIcon.startsWith("http") ? (
                  <img
                    src={news.sourceIcon}
                    alt=""
                    className="w-5 h-5 rounded-full object-cover"
                  />
                ) : (
                  <span>{news.sourceIcon}</span>
                )}
              </div>
              <span className="text-xs text-gray-400 mr-3">{news.source}</span>
              <span className="text-xs text-gray-600">{news.time}</span>
            </div>
          </div>

          <h3 className="text-sm sm:text-base font-normal text-white leading-snug mb-3">
            {news.title}
          </h3>

          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed mb-3">
            {news.excerpt}
          </p>

          {/* <div className="flex flex-wrap gap-1.5 mb-3">
            {news.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 rounded text-xs font-medium border bg-gray-800 text-cyan-400 border-gray-700"
              >
                {tag}
              </span>
            ))}
          </div> */}

          {/* <div className="flex justify-between items-center pt-3 border-t border-gray-700">
            <div className="flex items-center">
              <div
                className="w-2 h-2 rounded-full mr-1.5"
                style={{ background: impactColors[news.impact] }}
              ></div>
              <span className="text-xs text-gray-400">{news.impactText}</span>
            </div>

            <div className="flex gap-2">
              <button className="px-2 py-1 rounded text-xs border border-gray-600 text-gray-400 hover:border-cyan-400 hover:text-cyan-400 transition-colors">
                Analyze
              </button>
              <button className="px-2 py-1 rounded text-xs border border-gray-600 text-gray-400 hover:border-cyan-400 hover:text-cyan-400 transition-colors">
                Save
              </button>
            </div>
          </div> */}
        </div>
      </div>
    );
  };

  if (!isVisible) return null;

  return (
    <div
      className={`${
        isMobile ? "fixed" : "absolute"
      } inset-0 bg-black text-white z-[60] custom-smooth-scroll`}
      style={
        isMobile
          ? {
              // Mobile - start below the header
              left: 0,
              right: 0,
              top: `${mobileHeaderHeight || 64}px`,
              bottom: 0,
              width: "100vw",
              height: `calc(100vh - ${mobileHeaderHeight || 64}px)`,
              position: "fixed",
              overflow: "auto",
              WebkitOverflowScrolling: "touch",
            }
          : {
              // Desktop - start after left sidebar (fixed position)
              left: `${leftSidebarWidth}px`,
              right: 0,
              top: 0,
              bottom: 0,
              overflow: "auto",
            }
      }
    >
      <style>{`
        ${spinKeyframes}
        
        /* Custom Smooth Scrolling */
        .custom-smooth-scroll {
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
        }
        
        /* Custom Scrollbar Styles */
        .custom-smooth-scroll::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .custom-smooth-scroll::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        
        .custom-smooth-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
          transition: background 0.3s ease;
        }
        
        .custom-smooth-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
        
        .custom-smooth-scroll::-webkit-scrollbar-corner {
          background: rgba(255, 255, 255, 0.1);
        }
        
        /* Hide scrollbar for Firefox */
        .custom-smooth-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(255, 255, 255, 0.3) rgba(255, 255, 255, 0.1);
        }
        
        /* Mobile specific improvements */
        @media (max-width: 640px) {
          .custom-smooth-scroll {
            /* Enable momentum scrolling on iOS */
            -webkit-overflow-scrolling: touch;
            /* Improve scroll performance */
            transform: translateZ(0);
            will-change: scroll-position;
          }
          
          /* Hide scrollbar on mobile for cleaner look */
          .custom-smooth-scroll::-webkit-scrollbar {
            display: none;
          }
          
          .custom-smooth-scroll {
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
        }
      `}</style>

      <div
        className={`w-full h-full ${
          isMobile ? "p-2 sm:p-3" : "p-3 sm:p-4 md:p-5 lg:p-6"
        }`}
      >
        <div
          className={`${
            isMobile ? "w-full" : "max-w-full"
          } mx-auto h-full flex flex-col`}
        >
          {/* Loading message - always show when we have data */}
          {transformedNewsItems.length > 0 && (
            <div className="flex items-center justify-center mb-4 sm:mb-5 p-3 sm:p-4 rounded-lg border bg-[#22262a] border-gray-700">
              <div className="w-4 h-4 border-2 border-gray-600 border-t-gray-400 rounded-full animate-spin mr-3 flex-shrink-0"></div>
              <div className="flex flex-col items-center text-center">
                <div className="text-sm sm:text-base font-medium mb-1 text-white">
                  {loadingMessage.text}
                </div>
                <div className="text-xs sm:text-sm text-gray-400">
                  {loadingMessage.subtext}
                </div>
              </div>
            </div>
          )}

          {/* News grid */}
          <div className="flex-1 overflow-auto">
            <div
              className={`gap-3 sm:gap-4 md:gap-5 mb-4 sm:mb-5 ${
                isMobile
                  ? "grid grid-cols-1 sm:grid-cols-2"
                  : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
              }`}
            >
              {showSkeletons &&
                Array.from({ length: isMobile ? 4 : 8 }, (_, i) => (
                  <SkeletonItem key={`skeleton-${i}`} />
                ))}
              {loadedNews.map((news, index) => (
                <NewsItem key={news.id || index} news={news} index={index} />
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <div className="bg-[#22262a] rounded-lg p-3 sm:p-4 md:p-5 border border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-5">
                <div className="text-sm font-medium text-gray-400">
                  Analyzing articles:{" "}
                  {currentNewsIndex > transformedNewsItems.length
                    ? `${
                        ((currentNewsIndex - 1) % transformedNewsItems.length) +
                        1
                      }/${transformedNewsItems.length} (Cycle ${
                        Math.floor(
                          (currentNewsIndex - 1) / transformedNewsItems.length
                        ) + 1
                      })`
                    : `${currentNewsIndex}/${transformedNewsItems.length}`}
                </div>
                <div className="text-xs text-gray-400">
                  Continuous deep analysis in progress...
                </div>
              </div>
              <div className="text-xs text-gray-400">
                Next analysis cycle in{" "}
                <span className="text-gray-400">{countdown}</span>s
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
