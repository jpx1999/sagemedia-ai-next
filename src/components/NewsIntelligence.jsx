import { useState, useRef, useEffect } from "react";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import DashboardLayout from "../components/layouts/DashboardLayout";
import Sidebar from "../components/Sidebar";
import Content from "../components/content/Content";
import RightSidebar from "../components/RightSidebar";
import { toast, Toaster } from "react-hot-toast";
// REMOVED: import { Helmet } from "react-helmet-async"; - DynamicMeta handles this
import NewGroupPopup from "../components/NewGroupPopup";
import SuccessPopup from "../components/SuccessPopup";
import SectorSidebar from "../components/SectorSidebar";
import SummaryDetail from "../components/SummaryDetail";
import Loader from "../components/newsloader/Loader";
import DynamicMeta from "../components/DynamicMeta";

import {
  fetchNewsListings,
  fetchNewsDetails,
  fetchRegions,
  fetchGroupOptions,
  fetchSectors,
  fetchSectorNews,
  getNewsDetailsByTopicAndId,
  searchHeadlines,
  searchNewHeadlines,
  clearNewsDetailsCache,
  getGroupNews,
  fetchRefreshNews,
  refreshGroupNews,
  getSectorNews,
  getSettings,
  getUserSelection,
} from "../helpers/api";
import { useDispatch, useSelector } from "react-redux";
import {
  setActiveNewsId,
  setAvailableRegions,
  setCurrentLocation,
  setMenuItems,
  setNewsQuery,
  setRefreshLoading,
  setSectors,
  setSectorSidebarVisible,
  setErrorResponse,
  setNewHighlightedItems,
  prependNewHighlightedItems,
  clearNewHighlights,
  setIsLoadingNewHeadlines,
  removeHighlightFromItem,
  setSelectedSectors,
  setChatVisible,
  setUserSelection,
  setSearchLimits,
  setRightSidebarVisible,
} from "../store/slice/newsDetailsSlice";
import { setSettings } from "../store/slice/settingsSlice";
import { setcurrentTheme } from "../store/slice/themeSlice";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFaceFrown } from "@fortawesome/free-solid-svg-icons";
import notificationService from "../utils/notificationService";
import { globalSubscribe } from "../helpers/api";
import { useRouter } from "next/navigation";
import SignUpAndLogin from "app/login/page";
import { useMobileNavigation } from "hooks/useMobileNavigation";

// Function to get or create device ID
const getDeviceId = () => {
  let deviceId = localStorage.getItem("fcm_device_id");

  if (!deviceId) {
    const navigator = window.navigator;
    const screen = window.screen;

    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: navigator.deviceMemory,
      screenResolution: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      touchSupport: "ontouchstart" in window,
    };

    const fingerprintString = Object.values(fingerprint).join("|");

    let hash = 0;
    for (let i = 0; i < fingerprintString.length; i++) {
      const char = fingerprintString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }

    deviceId = `web_${Math.abs(hash).toString(16)}`;
    localStorage.setItem("fcm_device_id", deviceId);
  }

  return deviceId;
};

const NewsIntelligence = ({
  
  partialAccess = false,
  newsIdParam,
}) => {
  const isDarkTheme = true;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { newsId } = useParams();
useMobileNavigation()
  const rightSidebarVisible = useSelector(
    (state) => state.newsDetails.rightSidebarVisible
  );

  const currentNewsId = newsIdParam || newsId;

  // News state
  const dispatch = useDispatch();
  // Redux Store Values
  const activeNewsId = useSelector((state) => state.newsDetails.activeNewsId);
  const menuItems = useSelector((state) => state.newsDetails.menuItems);
  const showNewGroupPopup = useSelector(
    (state) => state.newsDetails.showNewGroupPopup
  );
  const sectorSidebarVisible = useSelector(
    (state) => state.newsDetails.sectorSidebarVisible
  );
  const selectedSectors = useSelector(
    (state) => state.newsDetails.selectedSectors
  );
  const currentLocation = useSelector(
    (state) => state.newsDetails.currentLocation
  );
  const newsQuery = useSelector((state) => state.newsDetails.newsQuery);
  const newHighlightedItems = useSelector(
    (state) => state.newsDetails.newHighlightedItems
  );
  const chatVisible = useSelector((state) => state.newsDetails.chatVisible);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const userSelection = useSelector((state) => state.newsDetails.userSelection);
  const availableRegions = useSelector(
    (state) => state.newsDetails.availableRegions
  );
  const settings = useSelector((state) => state.settings.settings);

  const [newsData, setNewsData] = useState(null);

  // Summary Detail state (lifted to NewsIntelligence level for mobile compatibility)
  const [summaryDetailVisible, setSummaryDetailVisible] = useState(false);
  const [selectedImpact, setSelectedImpact] = useState(null);
  const [impactData, setImpactData] = useState(null);
  const [isRequestingOpen, setIsRequestingOpen] = useState(false);

  // Flag to track manual dropdown change
  const [groupManuallyChanged, setGroupManuallyChanged] = useState(false);

  // Active news details state (centralized)
  const [activeNewsDetails, setActiveNewsDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState(null);

  const [activeHeadline, setActiveHeadline] = useState(null);

  // Search state - Initialize as empty to prevent stale values
  const [searchText, setSearchText] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [currentSearchTopic, setCurrentSearchTopic] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);

  // Refs for functionality and height calculation
  const containerRef = useRef(null);

  // Filter state
  const [topNewsMenuVisible, setTopNewsMenuVisible] = useState(false);
  const [selectedTopNewsOption, setSelectedTopNewsOption] =
    useState("Top News");

  // Chat state
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your SAGE AI assistant. How can I help you understand the news today?",
      isUser: false,
    },
  ]);

  // Group management state
  const [groupOptions, setGroupOptions] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupTopics, setNewGroupTopics] = useState([]);
  const [topicInput, setTopicInput] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);

  // API-related state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Refs
  const topicContainerRef = useRef(null);
  const chatEndRef = useRef(null);
  const contentRef = useRef(null);

  // Add a flag to track whether we're currently in search mode
  const [isInSearchMode, setIsInSearchMode] = useState(false);
  // Flag to track if initial data is loaded
  const [isInitialized, setIsInitialized] = useState(false);

  // State for login modal
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // State for chart-triggered impact clicks
  const [chartTriggeredImpact, setChartTriggeredImpact] = useState(null);

  const currentTheme = useSelector((state) => state.theme.currentTheme);

  // Add state to track if location is initialized
  const [isLocationInitialized, setIsLocationInitialized] = useState(false);

  // Add state to track if user selection has been processed
  const [userSelectionProcessed, setUserSelectionProcessed] = useState(false);

  // Add state to track if user selection is loaded
  const [userSelectionLoaded, setUserSelectionLoaded] = useState(false);

  // Add state to track auto-search from history
  const [autoSearchFromHistory, setAutoSearchFromHistory] = useState(false);
  const [autoSearchProcessed, setAutoSearchProcessed] = useState(false);

  // Mobile detection state
  const [isMobile, setIsMobile] = useState(false);

  // Add this with other refs near the top of the component
  const abortControllerRef = useRef(null);
  const searchAbortControllerRef = useRef(null);
  const autoSearchStartedRef = useRef(false);
  const autoSearchTopicRef = useRef(null);
  const isProcessingNotificationRef = useRef(false);

  // Handler for chart impact clicks
  const handleChartImpactClick = (label, value, apiKey) => {
    const reverseKeyMap = {
      Stocks: "stocks",
      "Fixed Income": "bonds",
      Crypto: "crypto",
      Futures: "futures",
      Options: "options",
      Commodities: "commodities",
    };

    const finalApiKey = apiKey || reverseKeyMap[label] || label.toLowerCase();

    setSelectedImpact(label);

    const impactType = value >= 0 ? "positive" : "negative";

    setImpactData({
      key: finalApiKey,
      value: value,
      type: impactType,
    });

    setIsRequestingOpen(true);
  };

  // ENHANCED: Dynamic headline management for SEO
  useEffect(() => {
    const setHeadlineFromAvailableData = () => {
      let headline = null;

      // Priority 1: Get from activeNewsDetails if available (most complete data)
      if (activeNewsDetails?.results?.[0]) {
        const newsResult = activeNewsDetails.results[0];
        headline =
          newsResult.headline ||
          newsResult.title ||
          newsResult.newsobj?.headline ||
          newsResult.newsobj?.title ||
          newsResult.newsobj?.news_headline ||
          newsResult.newsobj?.text ||
          null;
      }

      // Priority 2: Get from menuItems if activeNewsDetails not available
      if (!headline && activeNewsId && menuItems?.length > 0) {
        const activeNews = menuItems.find((item) => item.id === activeNewsId);
        if (activeNews) {
          headline =
            activeNews.headline ||
            activeNews.title ||
            activeNews.newsobj?.headline ||
            activeNews.newsobj?.title ||
            null;
        }
      }

      // Priority 3: Get from URL if we have currentNewsId but no menuItems match
      if (!headline && currentNewsId && activeNewsDetails?.results?.[0]) {
        const newsResult = activeNewsDetails.results[0];
        headline =
          newsResult.headline ||
          newsResult.title ||
          newsResult.newsobj?.headline ||
          newsResult.newsobj?.title ||
          null;
      }

      setActiveHeadline(headline);

      // IMPORTANT: Also update document title immediately for faster SEO response
      if (headline) {
        document.title = `${headline} | SAGE News Intelligence`;
      }
    };

    setHeadlineFromAvailableData();
  }, [activeNewsId, menuItems, activeNewsDetails, currentNewsId]);

  // ENHANCED: Handle direct URL access for SEO crawlers
  useEffect(() => {
    // Handle case where page is accessed directly via URL (important for SEO/social sharing)
    if (currentNewsId && !activeNewsDetails && !loading && !detailsLoading) {
      // If we have a news ID in URL but no details loaded, fetch them immediately
      fetchNewsById(currentNewsId);
    }
  }, [currentNewsId, activeNewsDetails, loading, detailsLoading]);

  // ENHANCED: Prerender.io signaling for SEO
  useEffect(() => {
    const signalReadyState = () => {
      if (
        typeof window !== "undefined" &&
        window.prerenderReady !== undefined
      ) {
        // Check if we have meaningful content to show
        const hasContent =
          (activeNewsDetails && activeHeadline) ||
          (menuItems.length > 0 && !loading);

        if (hasContent || (!loading && !detailsLoading && !isSearching)) {
          setTimeout(() => {
            window.prerenderReady = true;
            console.log("📄 Content ready signal sent to Prerender.io", {
              hasActiveNews: !!activeNewsDetails,
              hasHeadline: !!activeHeadline,
              menuItemsCount: menuItems.length,
              loading,
              detailsLoading,
            });
          }, 300);
        }
      }
    };

    signalReadyState();
  }, [
    activeNewsDetails,
    activeHeadline,
    menuItems,
    loading,
    detailsLoading,
    isSearching,
  ]);

  // Add this effect for animation timing:
  useEffect(() => {
    if (isRequestingOpen) {
      setSummaryDetailVisible(true);
      setIsRequestingOpen(false);
    }
  }, [isRequestingOpen]);

  // Function to refresh news data - UPDATED for new API endpoints
  const clearRefreshNewsData = async () => {
    dispatch(setRefreshLoading(true));
    setError(null);
    dispatch(setSelectedSectors([]));
    setSelectedTopNewsOption("Top News");
    setSearchText("");
    clearNewsDetailsCache();

    try {
      const data = await fetchNewsListings(currentLocation);

      if (data && data.results && data.results.length > 0) {
        const newsItems = data.results.map((news) => ({
          id: news.id || `news_${Date.now()}_${Math.random()}`,
          title: news.headline || "Untitled News",
          headline: news.headline || "",
          aiengine: news.aiengine || "",
          created_at: news.created_at || new Date().toISOString(),
          region: news.region || currentLocation,
          newsobj: news.newsobj || {},
        }));

        dispatch(setMenuItems(newsItems));
        setNewsData(data);

        if (newsItems.length > 0) {
          dispatch(setActiveNewsId(newsItems[0].id));
        }
      } else {
        setError("No new data available. Try again later.");
      }
    } catch (error) {
      setError("Failed to refresh news data. Please try again later.");
    } finally {
      dispatch(setRefreshLoading(false));
    }
  };

  const refreshNewsData = async () => {
    dispatch(setRefreshLoading(true));
    setError(null);
    clearNewsDetailsCache();
    setLoading(true);
    setSearchText("");

    try {
      let data;

      if (selectedTopNewsOption !== "Top News") {
        const selectedGroup = groupOptions.find(
          (g) => g.name === selectedTopNewsOption
        );

        if (selectedGroup && selectedGroup.id) {
          data = await refreshGroupNews(selectedGroup.id);
        } else {
          data = await fetchRefreshNews(currentLocation, selectedSectors);
        }
      } else {
        data = await fetchRefreshNews(currentLocation, selectedSectors);
      }

      if (data && data.results && data.results.length > 0) {
        const newsItems = data.results.map((news) => ({
          id: news.id || `news_${Date.now()}_${Math.random()}`,
          title: news.headline || "Untitled News",
          headline: news.headline || "",
          aiengine: news.aiengine || "",
          created_at: news.created_at || new Date().toISOString(),
          region: news.region || currentLocation,
          newsobj: news.newsobj || {},
        }));

        dispatch(setMenuItems(newsItems));
        setNewsData(data);

        if (newsItems.length > 0) {
          dispatch(setActiveNewsId(newsItems[0].id));
        }
      } else {
        setError("No new data available. Try again later.");
      }
    } catch (error) {
      setError("Failed to refresh news data. Please try again later.");
    } finally {
      dispatch(setRefreshLoading(false));
      setLoading(false);
    }
  };

  // Fetch Regions
  const getRegions = async () => {
    try {
      const data = await fetchRegions();
      if (data && data.results && Array.isArray(data.results)) {
        const filteredData = data.results.filter(
          (region) => region?.display === true
        );
        const regions = filteredData.map((region) => region);

        regions.sort((a, b) => a.name.localeCompare(b.name));
        dispatch(setAvailableRegions(regions));

        const hasUserSelectionCountry =
          userSelection &&
          userSelection.results &&
          userSelection.results.length >= 2 &&
          userSelection.results[1]?.country;

        if (!hasUserSelectionCountry) {
          const activeRegion = data.results.find((r) => r.status === 1);
          if (activeRegion) {
            dispatch(setCurrentLocation(activeRegion.name));
          }
        } else {
          dispatch(setCurrentLocation(userSelection.results[1].country));
        }
      }
    } catch (error) {
      console.error("Error fetching regions:", error);
    }
  };

  // Function to handle dropdown change
  const handleTopNewsOptionChange = (option) => {
    console.log("groupName", option);
    setSelectedTopNewsOption(option);
    setGroupManuallyChanged(true);
    dispatch(setSelectedSectors([]));
    setSearchText("");

    const selectedGroup = groupOptions.find((g) => g.name === option);

    if (selectedGroup && selectedGroup.id && option !== "Top News") {
      let targetCountry = currentLocation;
      if (selectedGroup.country) {
        targetCountry = selectedGroup.country;
        dispatch(setCurrentLocation(selectedGroup.country));

        if (availableRegions && availableRegions.length > 0) {
          const updatedRegions = availableRegions.map((region) => ({
            ...region,
            status: region.name === selectedGroup.country ? 1 : 0,
          }));
          dispatch(setAvailableRegions(updatedRegions));
        }
      }

      setLoading(true);
      getGroupNews(selectedGroup.id, targetCountry)
        .then((response) => {
          if (
            response &&
            (response.status === 1 || response.status === 2) &&
            response.results &&
            response.results.length > 0
          ) {
            const newsItems = response.results.map((news) => ({
              id: news.id || `news_${Date.now()}_${Math.random()}`,
              title: news.headline || "Untitled News",
              headline: news.headline || "",
              aiengine: news.aiengine || "",
              created_at: news.created_at || new Date().toISOString(),
              region: news.region || targetCountry,
              newsobj: news.newsobj || {},
            }));
            dispatch(setMenuItems(newsItems));
            if (newsItems.length > 0) {
              dispatch(setActiveNewsId(newsItems[0].id));
            }
          } else {
            setError("No news data available for this group.");
          }
        })
        .catch((error) => {
          console.error("Error fetching group news:", error);
          setError("Failed to load news for this group.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };

  // Fetch News Items - UPDATED for new API endpoints
  const getNewsItems = async () => {
    if (
      isSearching ||
      loading ||
      !isLocationInitialized ||
      isProcessingNotificationRef.current
    ) {
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      if (selectedSectors.length > 0) {
        const sector = selectedSectors[0];
        const data = await getSectorNews(sector, currentLocation);

        if (data && data.results && data.results.length > 0) {
          const newsItems = data.results.map((news) => ({
            id: news.id || `news_${Date.now()}_${Math.random()}`,
            title: news.headline || "Untitled News",
            headline: news.headline || "",
            aiengine: news.aiengine || "",
            created_at: news.created_at || new Date().toISOString(),
            region: news.region || currentLocation,
            newsobj: news.newsobj || {},
          }));

          dispatch(setMenuItems(newsItems));
          setNewsData(data);

          if (newsItems.length > 0 && groupManuallyChanged) {
            dispatch(setActiveNewsId(newsItems[0].id));
            setGroupManuallyChanged(false);
          }

          return data;
        } else {
          dispatch(setMenuItems([]));
          setNewsData(null);

          if (!currentNewsId) {
            dispatch(setActiveNewsId(null));
          }

          setError(
            `No news data available for the selected sector: ${sector}.`
          );
          return null;
        }
      } else {
        let data;

        if (selectedTopNewsOption !== "Top News") {
          const selectedGroup = groupOptions.find(
            (g) => g.name === selectedTopNewsOption
          );
          if (selectedGroup?.topics) {
            // If a topic group is selected, use search-by-topic
            // data = await searchByTopic(selectedGroup.topics);
          } else {
            data = await fetchNewsListings(currentLocation);
          }
        } else {
          data = await fetchNewsListings(currentLocation);
        }

        if (data && data.results && data.results.length > 0) {
          const newsItems = data.results.map((news) => ({
            id: news.id || `news_${Date.now()}_${Math.random()}`,
            title: news.headline || "Untitled News",
            headline: news.headline || "",
            aiengine: news.aiengine || "",
            created_at: news.created_at || new Date().toISOString(),
            region: news.region || currentLocation,
            newsobj: news.newsobj || {},
          }));

          dispatch(setMenuItems(newsItems));
          setNewsData(data);

          if (newsItems.length > 0 && groupManuallyChanged) {
            dispatch(setActiveNewsId(newsItems[0].id));
            setGroupManuallyChanged(false);
          }

          return data;
        } else {
          dispatch(setMenuItems([]));
          setNewsData(null);

          if (!currentNewsId) {
            dispatch(setActiveNewsId(null));
          }

          setError("No news data available for the selected filters.");
          return null;
        }
      }
    } catch (error) {
      setError("Failed to load news data. Please try again later.");
      dispatch(setMenuItems([]));
      setNewsData(null);

      if (!currentNewsId) {
        dispatch(setActiveNewsId(null));
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Fetch News Details - UPDATED for new API endpoints
  const retrieveNewsDetails = async () => {
    if (!activeNewsId) {
      setActiveNewsDetails(null);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const activeNews = menuItems.find((item) => item.id === activeNewsId);
    const currentId = activeNewsId;

    setDetailsLoading(true);
    setDetailsError(null);
    dispatch(setErrorResponse(null));

    try {
      let attempts = 0;
      const maxAttempts = 60;
      const pollingInterval = 1000;
      let response;

      while (attempts < maxAttempts) {
        if (signal.aborted) {
          return;
        }

        response = await fetchNewsDetails(currentId, signal);

        if (response.status === 0) {
          dispatch(
            setErrorResponse({
              status: 0,
              message: response.message || "Processing...",
              newsId: currentId,
            })
          );
        } else {
          dispatch(setErrorResponse(null));
        }

        if (response && response.results && response.results.length > 0) {
          const currentStatus = response.results[0].status;

          if (currentStatus >= 2 && currentStatus < 4) {
            if (!signal.aborted) {
              setActiveNewsDetails(response);
              setDetailsLoading(false);
            }
          } else if (currentStatus >= 4) {
            if (!signal.aborted) {
              setActiveNewsDetails(response);
              setDetailsLoading(false);
            }
            return;
          }
        }

        if (signal.aborted) {
          return;
        }

        await new Promise((resolve) => {
          const timeoutId = setTimeout(resolve, pollingInterval);
          signal.addEventListener("abort", () => clearTimeout(timeoutId));
        });

        attempts++;
      }

      if (!signal.aborted) {
        if (response && response.results && response.results.length > 0) {
          setActiveNewsDetails(response);
        } else if (activeNews) {
          const fallbackDetails = {
            status: 1,
            results: [activeNews],
          };
          setActiveNewsDetails(fallbackDetails);
        } else {
          throw new Error(
            "Failed to fetch news details after maximum attempts"
          );
        }
      }
    } catch (err) {
      if (err.name === "AbortError") {
        return;
      }

      if (!signal.aborted) {
        setDetailsError("Failed to load news details.. try again later");
        setActiveNewsDetails(null);
      }
    } finally {
      if (!signal.aborted) {
        setDetailsLoading(false);
      }
    }
  };

  // Fetch Group Options
  const getGroupOptions = async () => {
    try {
      const data = await fetchGroupOptions();

      if (Array.isArray(data) && data.length > 0) {
        setGroupOptions(data);
      } else {
        setGroupOptions([
          { id: 0, name: "Top News", topics: "Markets,Economy" },
        ]);
      }
    } catch (error) {
      setGroupOptions([{ id: 0, name: "Top News", topics: "Markets,Economy" }]);
    }
  };

  // Fetch Sectors
  const getSectors = async () => {
    try {
      const data = await fetchSectors();

      if (data && data.results && Array.isArray(data.results.sectors)) {
        dispatch(setSectors(data.results.sectors));
      } else {
        dispatch(setSectors([]));
      }
    } catch (error) {
      dispatch(setSectors([]));
    }
  };

  // Fetch Settings
  const initializeSettings = async () => {
    try {
      const response = await getSettings();
      const data = await response;

      const settings = {
        source: data?.settings?.source || "",
        llm: data?.settings?.llm || "",
        usequeryanalyzer: data?.settings?.usequeryanalyzer || false,
        enablechatbot: data?.settings?.enablechatbot || false,
        enablepodcast: data?.settings?.enablepodcast || false,
        topic_limit: data?.settings?.topic_limit || 3,
        advanceLoader: data?.settings?.advanceLoader,
      };

      dispatch(setSettings(settings));
    } catch (error) {
      console.error("Error fetching settings:", error);
      dispatch(
        setSettings({
          source: "",
          llm: "",
          usequeryanalyzer: false,
          enablechatbot: false,
          enablepodcast: false,
          topic_limit: 3,
          advanceLoader: false,
        })
      );
    }
  };

  // Handle Search - UPDATED to use dual API search
  const handleSearch = async (searchTerm, country) => {
    if (!searchTerm || searchTerm.trim() === "") {
      setCurrentSearchTopic("");
      dispatch(setNewsQuery(""));
      setIsInSearchMode(false);
      setSearchSuggestions([]);
      dispatch(clearNewHighlights());
      return getNewsItems();
    }

    if (searchAbortControllerRef.current) {
      searchAbortControllerRef.current.abort();
    }

    searchAbortControllerRef.current = new AbortController();
    const searchSignal = searchAbortControllerRef.current.signal;

    setIsInSearchMode(true);
    setIsSearching(true);
    setLoading(true);
    setDetailsLoading(true);
    setError(null);
    setDetailsError(null);
    setSelectedTopNewsOption("Top News");
    setSearchSuggestions([]);
    dispatch(clearNewHighlights());
    dispatch(setSelectedSectors([]));

    dispatch(setMenuItems([]));
    setNewsData(null);
    dispatch(setActiveNewsId(null));

    clearNewsDetailsCache();

    try {
      dispatch(setNewsQuery(searchTerm));

      const [searchHeadlinesPromise, searchNewHeadlinesPromise] = [
        searchHeadlines(
          searchTerm,
          country || currentLocation,
          "query",
          searchSignal
        ).catch((error) => {
          if (error.name === "AbortError") {
            console.log("Search headlines request was aborted");
            return { status: 0, results: [], error };
          }
          return { status: 0, results: [], error };
        }),
        searchNewHeadlines(
          searchTerm,
          country || currentLocation,
          searchSignal
        ).catch((error) => {
          if (error.name === "AbortError") {
            console.log("Search new headlines request was aborted");
            return { status: 0, results: [], error };
          }
          if (
            error.response?.status === 429 ||
            error.response?.data?.status === -1
          ) {
            toast(
              (t) => (
                <div className="flex flex-col space-y-3 max-w-sm">
                  <div className="flex items-start space-x-2">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        Search Limit Reached
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                        You've hit the 10 searches per hour limit on the free
                        plan. Upgrade to a paid plan to continue searching
                        without interruptions.
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        toast.dismiss(t.id);
                        router.push("/subscription");
                      }}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Upgrade Now
                    </button>
                    <button
                      onClick={() => toast.dismiss(t.id)}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 text-sm font-medium rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ),
              {
                duration: 10000,
                position: "top-right",
                style: {
                  background: "var(--toast-bg, #fff)",
                  color: "var(--toast-color, #333)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                  borderRadius: "12px",
                  padding: "16px",
                  maxWidth: "400px",
                },
              }
            );
          }
          return { status: 0, results: [], error };
        }),
      ];

      dispatch(setIsLoadingNewHeadlines(true));

      const headlinesResults = await searchHeadlinesPromise;

      if (searchSignal.aborted) {
        return;
      }

      let hasInitialData = false;

      if (
        (headlinesResults.status === 1 || headlinesResults.status === 2) &&
        headlinesResults.results &&
        headlinesResults.results.length > 0
      ) {
        const searchResults = headlinesResults.results.map((news) => ({
          id: news.id,
          title: news.headline || news.title || "Untitled News",
          headline: news.headline || news.title || "",
          aiengine: news.aiengine || "search",
          created_at: news.created_at,
          region: news.region || currentLocation,
          newsobj: news.newsobj || news,
        }));

        dispatch(setMenuItems(searchResults));
        setNewsData(headlinesResults);
        hasInitialData = true;

        if (searchResults.length > 0 && !country) {
          dispatch(setActiveNewsId(searchResults[0].id));
          router.push(`/news-intelligence/newsid/${searchResults[0].id}`, {
            replace: true,
          });
        }

        setIsSearching(false);
        setLoading(false);
      } else if (headlinesResults.status === 0) {
        if (
          headlinesResults.suggestions &&
          Array.isArray(headlinesResults.suggestions)
        ) {
          setSearchSuggestions(headlinesResults.suggestions);
          setError("No exact matches found. Try one of the suggestions below.");
        }
      } else {
        console.log("⚠️ searchHeadlines returned empty results");
      }

      if (searchSignal.aborted) {
        return;
      }

      const newHeadlinesResults = await searchNewHeadlinesPromise;

      if (searchSignal.aborted) {
        return;
      }

      if (
        newHeadlinesResults.max_limit !== undefined &&
        newHeadlinesResults.search_count !== undefined
      ) {
        dispatch(
          setSearchLimits({
            maxLimit: newHeadlinesResults.max_limit,
            searchCount: newHeadlinesResults.search_count,
          })
        );
      }

      if (
        (newHeadlinesResults.status === 1 ||
          newHeadlinesResults.status === 2) &&
        newHeadlinesResults.results &&
        newHeadlinesResults.results.length > 0
      ) {
        const newSearchResults = newHeadlinesResults.results.map((news) => ({
          id: news.id,
          title: news.headline || news.title || "Untitled News",
          headline: news.headline || news.title || "",
          aiengine: news.aiengine || "search",
          created_at: news.created_at,
          region: news.region || currentLocation,
          newsobj: news.newsobj || news,
        }));

        if (hasInitialData) {
          dispatch(prependNewHighlightedItems(newSearchResults));
        } else {
          dispatch(setMenuItems(newSearchResults));
          dispatch(
            setNewHighlightedItems(newSearchResults.map((item) => item.id))
          );
          setNewsData(newHeadlinesResults);

          if (newSearchResults.length > 0) {
            dispatch(setActiveNewsId(newSearchResults[0].id));
            router.push(`/news-intelligence/newsid/${newSearchResults[0].id}`, {
              replace: true,
            });
            dispatch(removeHighlightFromItem(newSearchResults[0].id));
          }
        }
      } else if (newHeadlinesResults.status === 0) {
        if (
          newHeadlinesResults.suggestions &&
          Array.isArray(newHeadlinesResults.suggestions)
        ) {
          setSearchSuggestions(newHeadlinesResults.suggestions);
          setError("No exact matches found. Try one of the suggestions below.");
        }
      } else {
        console.log("⚠️ searchNewHeadlines returned no results or failed");
      }

      if (
        !hasInitialData &&
        (!newHeadlinesResults.status ||
          !newHeadlinesResults.results ||
          newHeadlinesResults.results.length === 0)
      ) {
        if (
          !headlinesResults.suggestions ||
          headlinesResults.suggestions.length === 0
        ) {
          setError("No search results found.");
        }
        if (!currentNewsId) {
          dispatch(setActiveNewsId(null));
        }
      }

      setCurrentSearchTopic(searchTerm);
    } catch (error) {
      console.error("❌ SEARCH FAILED:", error);
      setError(`Search failed: ${error.message}. Please try again later.`);
      dispatch(setMenuItems([]));
      setNewsData(null);

      if (!currentNewsId) {
        dispatch(setActiveNewsId(null));
      }
    } finally {
      if (!searchSignal.aborted) {
        setIsSearching(false);
        setLoading(false);
        dispatch(setIsLoadingNewHeadlines(false));
      }
    }
  };

  // Function to fetch news by country
  const fetchNewsByCountry = async (country) => {
    dispatch(setCurrentLocation(country));
    dispatch(setSelectedSectors([]));
    setIsLocationInitialized(false);
    setSearchText("");
    setIsSearching(false);
    setCurrentSearchTopic("");
    dispatch(setNewsQuery(""));
    dispatch(clearNewHighlights());
    setLoading(true);
    setError(null);
    setSelectedTopNewsOption("Top News");

    clearNewsDetailsCache();

    try {
      await new Promise((resolve) => setTimeout(resolve, 100));
      let data;
      if (selectedSectors && selectedSectors.length > 0) {
        const sector = selectedSectors[0];
        data = await getSectorNews(sector, country);
      } else {
        data = await fetchNewsListings(country);
      }

      if (data && data.results && data.results.length > 0) {
        const newsItems = data.results.map((news) => ({
          id: news.id || `news_${Date.now()}_${Math.random()}`,
          title: news.headline || "Untitled News",
          headline: news.headline || "",
          aiengine: news.aiengine || "",
          created_at: news.created_at || new Date().toISOString(),
          region: news.region || country,
          newsobj: news.newsobj || {},
        }));

        dispatch(setMenuItems(newsItems));
        setNewsData(data);

        if (newsItems.length > 0) {
          dispatch(setActiveNewsId(newsItems[0].id));
          router.push(`/news-intelligence/newsid/${newsItems[0].id}`, {
            replace: true,
          });
        }
      } else {
        dispatch(setMenuItems([]));
        setNewsData(null);
        dispatch(setActiveNewsId(null));
        setError("No news data available for the selected country.");
      }
    } catch (error) {
      setError("Failed to load news data for the selected country.");
      dispatch(setMenuItems([]));
      setNewsData(null);
      dispatch(setActiveNewsId(null));
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch a specific news item by ID
  const fetchNewsById = async (id) => {
    if (!id) return null;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setDetailsLoading(true);
    setDetailsError(null);
    dispatch(setErrorResponse(null));

    try {
      const response = await fetchNewsDetails(id, signal);

      if (response && response.results && response.results.length > 0) {
        if (!signal.aborted) {
          setActiveNewsDetails(response);
        }
        return response;
      }
    } catch (error) {
      if (error.name === "AbortError") {
        console.log("Request was aborted");
        return null;
      }

      if (!signal.aborted) {
        setDetailsError("Failed to load news details");
      }
      return null;
    } finally {
      if (!signal.aborted) {
        setDetailsLoading(false);
      }
    }
  };

  // Add effect to track location initialization
  useEffect(() => {
    if (currentLocation) {
      setIsLocationInitialized(true);
    }
  }, [currentLocation]);

  // Modify the initialization effect
  useEffect(() => {
    const initializeApp = async () => {
      if (!isInitialized && userSelectionLoaded) {
        try {
          await Promise.all([
            getRegions(),
            getGroupOptions(),
            getSectors(),
            initializeSettings(),
          ]);
          setIsInitialized(true);

          const hasValidUserSelection =
            userSelection?.results?.length >= 2 &&
            userSelection?.status === 1 &&
            userSelection.results[0]?.type &&
            userSelection.results[1]?.value;

          if (
            isLocationInitialized &&
            !hasValidUserSelection &&
            !autoSearchFromHistory
          ) {
            await getNewsItems();
          }
        } catch (error) {
          console.error("Error initializing app:", error);
          setError("Failed to initialize app. Please try again later.");
        }
      }
    };

    initializeApp();
  }, [
    isLocationInitialized,
    userSelectionLoaded,
    userSelection,
    autoSearchFromHistory,
  ]);

  // Modify the filter change effect
  useEffect(() => {
    if (
      isInitialized &&
      groupOptions.length > 0 &&
      !isSearching &&
      !loading &&
      isLocationInitialized &&
      userSelectionProcessed &&
      !autoSearchFromHistory
    ) {
      getNewsItems();
    }
  }, [
    selectedTopNewsOption,
    selectedSectors,
    currentLocation,
    isInitialized,
    isLocationInitialized,
    userSelectionProcessed,
    autoSearchFromHistory,
  ]);

  // Call when activeNewsId changes
  useEffect(() => {
    if (activeNewsId) {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      dispatch(setChatVisible(false));

      retrieveNewsDetails();
    }
  }, [activeNewsId]);

  // Scroll chat to bottom when messages change
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages]);

  // Synchronize local searchText state with Redux store only for search operations
  useEffect(() => {
    if (isInSearchMode && newsQuery && newsQuery !== searchText) {
      setSearchText(newsQuery);
    }
  }, [newsQuery, isInSearchMode]);

  // Handle URL parameters and initial selection
  useEffect(() => {
    if (currentNewsId) {
      if (menuItems.length > 0) {
        const newsExists = menuItems.some((item) => item.id === currentNewsId);

        if (newsExists) {
          dispatch(setActiveNewsId(currentNewsId));
        } else {
          fetchNewsById(currentNewsId);
          dispatch(setActiveNewsId(currentNewsId));
        }
      } else {
        fetchNewsById(currentNewsId);
        dispatch(setActiveNewsId(currentNewsId));
      }
    }
  }, [menuItems, currentNewsId, isInitialized]);

  // Auto-select first news item - ROBUST VERSION for external navigation
  useEffect(() => {
    const attemptAutoSelection = () => {
      const currentPath = pathname;
      const isBaseNewsPath =
        currentPath === "/news-intelligence" ||
        currentPath === "/news-intelligence/";

      console.log("🔄 Auto-selection check:", {
        currentPath,
        isBaseNewsPath,
        currentNewsId,
        activeNewsId,
        menuItemsCount: menuItems.length,
        firstItemId: menuItems[0]?.id,
        loading,
        isSearching,
        isInitialized,
        partialAccess,
        isInSearchMode,
      });

      // Must have menu items to proceed
      if (menuItems.length === 0) {
        console.log("❌ No menu items available");
        return false;
      }

      // Skip if partial access (but allow search mode if user selection completed)
      if (partialAccess) {
        console.log("❌ Skipping: partial access");
        return false;
      }

      // Allow auto-selection in search mode if it's from user selection processing
      if (isInSearchMode && !userSelectionProcessed) {
        console.log(
          "❌ Skipping: search mode and user selection not processed"
        );
        return false;
      }

      // Determine if we should auto-select
      const shouldAutoSelect =
        (isBaseNewsPath && !currentNewsId) || // Base path without newsId
        (!currentNewsId && !activeNewsId); // No newsId in URL and no active news

      if (shouldAutoSelect) {
        console.log("✅ AUTO-SELECTING first news item:", menuItems[0].id);
        dispatch(setActiveNewsId(menuItems[0].id));
        router.push(`/news-intelligence/newsid/${menuItems[0].id}`, {
          replace: true,
        });
        return true;
      }

      console.log("❌ Auto-selection conditions not met");
      return false;
    };

    // Try immediately
    if (!attemptAutoSelection()) {
      // If it failed, try again after a delay to handle race conditions
      setTimeout(attemptAutoSelection, 300);
    }
  }, [
    menuItems,
    currentNewsId,
    activeNewsId,
    pathname,
    partialAccess,
    isInSearchMode,
    userSelectionProcessed,
    router,
    dispatch,
  ]);

  // BACKUP: Force auto-selection when menu items change and no news selected
  useEffect(() => {
    if (
      menuItems.length > 0 &&
      !activeNewsId &&
      !currentNewsId &&
      !partialAccess &&
      pathname === "/news-intelligence"
    ) {
      // Allow backup selection even in search mode if user selection is processed
      const allowInSearchMode = isInSearchMode && userSelectionProcessed;

      if (!isInSearchMode || allowInSearchMode) {
        console.log("🆘 BACKUP: Force selecting first item on menu change");
        dispatch(setActiveNewsId(menuItems[0].id));
        router.push(`/news-intelligence/newsid/${menuItems[0].id}`, {
          replace: true,
        });
      }
    }
  }, [
    menuItems.length,
    activeNewsId,
    currentNewsId,
    userSelectionProcessed,
    isInSearchMode,
  ]); // Added userSelectionProcessed and isInSearchMode

  // Update URL when activeNewsId changes
  useEffect(() => {
    if (activeNewsId && (!currentNewsId || currentNewsId !== activeNewsId)) {
      router.push(`/news-intelligence/newsid/${activeNewsId}`, { replace: true });
    }
  }, [activeNewsId]);

  // Function to handle actions that require login
  const handleProtectedAction = (action, params = {}) => {
    if (partialAccess) {
      setPendingAction({ type: action, params });
      setShowLoginModal(true);
      return false;
    }
    return true;
  };

  // Handle login completion
  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    if (pendingAction) {
      const { type, params } = pendingAction;
      switch (type) {
        case "setActiveNewsId":
          dispatch(setActiveNewsId(params.id));
          break;
        case "fetchNewsByCountry":
          fetchNewsByCountry(params.country);
          break;
        default:
          break;
      }
      setPendingAction(null);
    } else if (currentNewsId) {
      dispatch(setActiveNewsId(currentNewsId));
      fetchNewsById(currentNewsId);
    }
  };

  // Mobile detection useEffect
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Add cleanup in the component's cleanup function and clear stale search state
  useEffect(() => {
    dispatch(setNewsQuery(""));

    const fetchUserSelection = async () => {
      try {
        const userSelection = await getUserSelection();
        dispatch(
          setSearchLimits({
            maxLimit: userSelection.max_limit,
            searchCount: userSelection.search_count,
          })
        );
        dispatch(setUserSelection(userSelection));
      } catch (error) {
        dispatch(
          setSearchLimits({
            maxLimit: error.response.data.max_limit,
            searchCount: error.response.data.search_count,
          })
        );
      } finally {
        setUserSelectionLoaded(true);
      }
    };
    fetchUserSelection();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      autoSearchStartedRef.current = false;
      autoSearchTopicRef.current = null;
    };
  }, []);

  // Reset auto-search refs only when coming from a new external navigation
  // Note: location.state and location.key don't exist in Next.js
  // This functionality may need to be implemented differently if needed
  useEffect(() => {
    // TODO: Implement if navigation state handling is needed
    // In Next.js, we might need to use query parameters or a different approach
  }, [pathname]);

  // Process user selection on mount
  useEffect(() => {
    const processUserSelection = async () => {
      if (
        !userSelection ||
        !userSelection.results ||
        userSelection.results.length < 2 ||
        userSelection.status !== 1
      ) {
        if (!userSelectionProcessed) {
          dispatch(setNewsQuery(""));
          setSearchText("");
          setUserSelectionProcessed(true);
        }
        return;
      }

      if (
        userSelection &&
        userSelection.results &&
        userSelection.results.length >= 2 &&
        userSelection.status === 1 &&
        isInitialized &&
        isLocationInitialized &&
        !userSelectionProcessed
      ) {
        const typeData = userSelection.results[0];
        const valueData = userSelection.results[1];

        if (typeData.type && valueData.value) {
          setLoading(true);
          setUserSelectionProcessed(true);

          try {
            switch (typeData.type) {
              case "sector":
                console.log("Processing sector selection:", valueData.value);
                dispatch(setNewsQuery(""));
                setSearchText("");
                dispatch(setSelectedSectors([valueData.value]));
                setSelectedTopNewsOption("Top News");

                const sectorData = await getSectorNews(
                  valueData.value,
                  valueData.country || currentLocation
                );

                if (
                  sectorData &&
                  sectorData.results &&
                  sectorData.results.length > 0
                ) {
                  const newsItems = sectorData.results.map((news) => ({
                    id: news.id || `news_${Date.now()}_${Math.random()}`,
                    title: news.headline || "Untitled News",
                    headline: news.headline || "",
                    aiengine: news.aiengine || "",
                    created_at: news.created_at || new Date().toISOString(),
                    region: news.region || valueData.country || currentLocation,
                    newsobj: news.newsobj || {},
                  }));

                  dispatch(setMenuItems(newsItems));
                  setNewsData(sectorData);
                }
                break;

              case "group":
                console.log("Processing group selection:", valueData.value);
                dispatch(setNewsQuery(""));
                setSearchText("");
                setSelectedTopNewsOption("Top News");
                dispatch(setSelectedSectors([]));

                const selectedGroup = groupOptions.find(
                  (g) => g.id === valueData.value
                );
                if (selectedGroup) {
                  setSelectedTopNewsOption(selectedGroup.name);
                }

                const groupData = await getGroupNews(
                  valueData.value,
                  valueData.country || currentLocation
                );

                if (
                  groupData &&
                  (groupData.status === 1 || groupData.status === 2) &&
                  groupData.results &&
                  groupData.results.length > 0
                ) {
                  const newsItems = groupData.results.map((news) => ({
                    id: news.id || `news_${Date.now()}_${Math.random()}`,
                    title: news.headline || "Untitled News",
                    headline: news.headline || "",
                    aiengine: news.aiengine || "",
                    created_at: news.created_at || new Date().toISOString(),
                    region: news.region || valueData.country || currentLocation,
                    newsobj: news.newsobj || {},
                  }));

                  dispatch(setMenuItems(newsItems));
                  setNewsData(groupData);
                }
                break;

              case "search":
                console.log("Processing search selection:", valueData.value);
                setSearchText(valueData.value);
                await handleSearch(valueData.value, valueData.country);
                break;

              default:
                console.log("Unknown user selection type:", typeData.type);
                dispatch(setNewsQuery(""));
                setSearchText("");
                break;
            }
          } catch (error) {
            console.error("Error processing user selection:", error);
            setError(`Failed to load previous selection: ${error.message}`);
          } finally {
            setLoading(false);
          }
        }
      }
    };

    if (
      isInitialized &&
      isLocationInitialized &&
      groupOptions.length > 0 &&
      !userSelectionProcessed
    ) {
      processUserSelection();
    }
  }, [
    userSelection,
    isInitialized,
    isLocationInitialized,
    groupOptions,
    currentLocation,
    userSelectionProcessed,
  ]);

  // Handle notification-based group selection
  useEffect(() => {
    const handleNotificationGroupSelection = async (notificationData) => {
      if (!notificationData || !notificationData.group_id) {
        console.log("No group_id in notification data");
        return;
      }

      console.log("Processing notification group selection:", notificationData);

      isProcessingNotificationRef.current = true;
      setLoading(true);

      if (searchAbortControllerRef.current) {
        searchAbortControllerRef.current.abort();
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      try {
        const targetGroup = groupOptions.find(
          (group) => String(group.id) === String(notificationData.group_id)
        );

        if (!targetGroup) {
          console.warn("Group not found with ID:", notificationData.group_id);
          toast.error("Group not found for notification");
          setLoading(false);
          isProcessingNotificationRef.current = false;
          return;
        }

        console.log("Found target group:", targetGroup);

        const loadingStartTime = Date.now();
        const minLoadingDuration = 500;

        if (
          notificationData.country &&
          notificationData.country !== currentLocation
        ) {
          console.log(
            "Updating location from notification:",
            notificationData.country
          );
          dispatch(setCurrentLocation(notificationData.country));

          if (availableRegions && availableRegions.length > 0) {
            const updatedRegions = availableRegions.map((region) => ({
              ...region,
              status: region.name === notificationData.country ? 1 : 0,
            }));
            dispatch(setAvailableRegions(updatedRegions));
          }
        }

        setSelectedTopNewsOption(targetGroup.name);
        setGroupManuallyChanged(true);
        dispatch(setSelectedSectors([]));
        setSearchText("");

        setIsInSearchMode(false);
        dispatch(setNewsQuery(""));

        const targetCountry = notificationData.country || currentLocation;
        const groupData = await getGroupNews(targetGroup.id, targetCountry);

        if (
          groupData &&
          (groupData.status === 1 || groupData.status === 2) &&
          groupData.results &&
          groupData.results.length > 0
        ) {
          const newsItems = groupData.results.map((news) => ({
            id: news.id || `news_${Date.now()}_${Math.random()}`,
            title: news.headline || "Untitled News",
            headline: news.headline || "",
            aiengine: news.aiengine || "",
            created_at: news.created_at || new Date().toISOString(),
            region: news.region || targetCountry,
            newsobj: news.newsobj || {},
          }));

          dispatch(setMenuItems(newsItems));
          setNewsData(groupData);

          if (newsItems.length > 0) {
            dispatch(setActiveNewsId(newsItems[0].id));
            router.push(`/news-intelligence/newsid/${newsItems[0].id}`, {
              replace: true,
            });
          }

          toast.success(
            `📰 Opened group "${targetGroup.name}" from notification`
          );
        } else {
          toast.error("No news found for this group");
        }

        const elapsedTime = Date.now() - loadingStartTime;
        if (elapsedTime < minLoadingDuration) {
          await new Promise((resolve) =>
            setTimeout(resolve, minLoadingDuration - elapsedTime)
          );
        }
      } catch (error) {
        console.error("Error handling notification group selection:", error);
        toast.error("Failed to load group from notification");

        const elapsedTime = Date.now() - loadingStartTime;
        if (elapsedTime < minLoadingDuration) {
          await new Promise((resolve) =>
            setTimeout(resolve, minLoadingDuration - elapsedTime)
          );
        }
      } finally {
        setLoading(false);
        isProcessingNotificationRef.current = false;
      }
    };

    const urlNotificationData =
      notificationService.getNotificationDataFromURL();
    if (urlNotificationData && isInitialized && groupOptions.length > 0) {
      console.log("Found notification data in URL:", urlNotificationData);
      handleNotificationGroupSelection(urlNotificationData);
      notificationService.clearNotificationDataFromURL();
    }

    notificationService.onNotificationClick((notificationData) => {
      if (isInitialized && groupOptions.length > 0) {
        console.log(
          "Received notification click from service worker:",
          notificationData
        );
        handleNotificationGroupSelection(notificationData);
      }
    });
  }, [
    isInitialized,
    groupOptions,
    currentLocation,
    availableRegions,
    router,
    dispatch,
  ]);

  // Function to handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    const searchTerm = suggestion
      .replace(/^Did you mean ['"]?|['"]?\?$/g, "")
      .trim();
    setSearchText(searchTerm);
    setSearchSuggestions([]);
    handleSearch(searchTerm);
  };

  // Handle auto-search from search history
  // Note: This functionality relied on location.state which doesn't exist in Next.js
  useEffect(() => {
    const handleAutoSearchFromHistory = async () => {
      // TODO: If auto-search from history is needed, implement using query parameters
      // or a different state management approach
      
      const searchTopic = autoSearchTopicRef.current;

      if (
        searchTopic &&
        typeof searchTopic === "string" &&
        searchTopic.trim() !== "" &&
        !autoSearchProcessed &&
        !autoSearchStartedRef.current &&
        isInitialized &&
        isLocationInitialized
      ) {
        autoSearchStartedRef.current = true;
        setAutoSearchFromHistory(true);
        setAutoSearchProcessed(true);

        setSearchText(searchTopic);
        setIsInSearchMode(true);

        dispatch(setMenuItems([]));
        setNewsData(null);
        dispatch(setActiveNewsId(null));

        try {
          await handleSearch(searchTopic);
          autoSearchTopicRef.current = null;
        } catch (error) {
          setError(`Failed to search for "${searchTopic}"`);
          autoSearchTopicRef.current = null;
        }
      }
    };

    handleAutoSearchFromHistory();
  }, [isInitialized, isLocationInitialized, pathname, autoSearchProcessed]);

  // Handle navigation from search history
  // Note: This functionality relied on location.state which doesn't exist in Next.js
  useEffect(() => {
    const handleHistoryNavigation = async () => {
      // TODO: If navigation from search history is needed, implement using query parameters
      // or a different state management approach
      
      // For now, this functionality is disabled since location.state doesn't exist in Next.js
      // Consider using searchParams or a different approach if this feature is required
    };

    if (isInitialized && isLocationInitialized) {
      handleHistoryNavigation();
    }
  }, [isInitialized, isLocationInitialized]);

  // Initialize notifications on mount
  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        await notificationService.initialize();
        const fcmToken = await notificationService.getFCMToken();

        if (fcmToken) {
          const deviceId = getDeviceId();
          await globalSubscribe(fcmToken, deviceId);
          console.log("Successfully subscribed to global notifications");
        }
      } catch (error) {
        console.error("Error initializing notifications:", error);
      }
    };

    initializeNotifications();
  }, []);

  return (
    <>
      {/* DYNAMIC META TAGS - This replaces the commented Helmet section */}
      <DynamicMeta
        newsItem={menuItems.find((item) => item.id === activeNewsId)}
        headline={activeHeadline}
        activeHeadline={activeHeadline}
        newsDetails={activeNewsDetails}
        activeNewsId={activeNewsId}
        loading={loading || detailsLoading || isSearching}
        defaultTitle="News Intelligence Dashboard | SAGE by SpiderX.AI"
        defaultDescription="Access SAGE's AI-powered news intelligence dashboard. Analyze global news with advanced insights, real-time updates, and comprehensive market impact analysis."
      />

      <DashboardLayout
        isDarkTheme={isDarkTheme}
        partialAccess={partialAccess}
        onLoginRequired={() => setShowLoginModal(true)}
        showSearch={true}
        searchText={searchText}
        setSearchText={setSearchText}
        onSearch={handleSearch}
        searchSuggestions={searchSuggestions}
        onSuggestionClick={handleSuggestionClick}
        clearRefreshNews={clearRefreshNewsData}
      >
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            style: {
              backgroundColor: "#1f2937",
              color: "#f1f5f9",
            },
            duration: 3000,
            removeDelay: 500,
          }}
        />
        <Sidebar
          showSearch={true}
          selectedTopNewsOption={selectedTopNewsOption}
          setSelectedTopNewsOption={handleTopNewsOptionChange}
          topNewsMenuVisible={topNewsMenuVisible}
          setTopNewsMenuVisible={setTopNewsMenuVisible}
          groupOptions={groupOptions}
          toggleSectorSidebar={() =>
            dispatch(setSectorSidebarVisible(!sectorSidebarVisible))
          }
          loading={loading}
          detailsLoading={detailsLoading}
          fetchNewsByCountry={fetchNewsByCountry}
          clearRefreshNews={clearRefreshNewsData}
          refreshNews={refreshNewsData}
          fetchGroupOptions={getGroupOptions}
          partialAccess={partialAccess}
          onItemClick={(id) => {
            if (!handleProtectedAction("setActiveNewsId", { id })) {
              return;
            }
            dispatch(setActiveNewsId(id));
          }}
          onCountryChange={(country) => {
            if (!handleProtectedAction("fetchNewsByCountry", { country })) {
              return;
            }
            fetchNewsByCountry(country);
          }}
        />
        {settings?.advanceLoader &&
        (loading || isSearching || detailsLoading) &&
        !isMobile ? (
          <Loader />
        ) : (
          <>
            <Content
              contentRef={contentRef}
              newsDetails={activeNewsDetails}
              loading={loading || detailsLoading}
              error={detailsError}
              partialAccess={partialAccess}
              onLoginRequired={() => setShowLoginModal(true)}
              onImpactClick={handleChartImpactClick}
              showContentDirectly={!!activeNewsId && !!activeNewsDetails}
            />
            <RightSidebar
              newsDetails={activeNewsDetails}
              loading={loading || detailsLoading}
              error={detailsError}
              partialAccess={partialAccess}
              onLoginRequired={() => setShowLoginModal(true)}
              summaryDetailVisible={summaryDetailVisible}
              setSummaryDetailVisible={setSummaryDetailVisible}
              selectedImpact={selectedImpact}
              setSelectedImpact={setSelectedImpact}
              impactData={impactData}
              setImpactData={setImpactData}
              setIsRequestingOpen={setIsRequestingOpen}
            />
            {isMobile &&
              settings?.advanceLoader &&
              (loading || isSearching || detailsLoading) && <Loader />}
          </>
        )}

        {/* Empty State Overlay */}
        {menuItems.length === 0 &&
          !loading &&
          !isSearching &&
          isInitialized &&
          isLoggedIn && (
            <div
              className="absolute md:flex items-start pt-4 lg:pt-8 justify-center z-40 hidden md:left-[320px] lg:left-[320px] xl:left-[410px] 2xl:left-[485px]"
              style={{
                backgroundColor: currentTheme.backgroundColor,
                opacity: 1,
                right: "0",
                top: "0",
                bottom: "0",
              }}
            >
              <div className="text-center p-12 max-w-xl flex flex-col rounded-2xl items-center bg-[#22262a] border-gray-700">
                <div
                  className="mb-6"
                  style={{
                    border: "2px solid #3b82f6",
                    borderRadius: "50%",
                    padding: "20px",
                  }}
                >
                  <img
                    className="w-[40px]"
                    alt="Search"
                    src="/images/search-light.svg"
                  />
                </div>
                <h3
                  className="text-2xl font-medium mb-4"
                  style={{ color: currentTheme.textColor }}
                >
                  Let's try again!
                </h3>
                <p
                  className="mb-6 leading-relaxed"
                  style={{ color: currentTheme.mutedText }}
                >
                  We couldn't find exactly what you're looking for.
                </p>

                <div className="suggestions">
                  <h3 className="text-lg font-medium mb-2">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 32 32"
                      width="32px"
                      height="32px"
                      fill="currentColor"
                    >
                      <path d="M 6.8125 2.40625 L 5.40625 3.8125 L 7.5 5.90625 L 8.90625 4.5 Z M 25.1875 2.40625 L 23.09375 4.5 L 24.5 5.90625 L 26.59375 3.8125 Z M 16 3.03125 C 15.671875 3.035156 15.335938 3.054688 15 3.09375 C 14.988281 3.09375 14.980469 3.09375 14.96875 3.09375 C 10.914063 3.558594 7.6875 6.835938 7.125 10.875 C 6.675781 14.125 8.015625 17.070313 10.25 18.96875 C 11.207031 19.789063 11.796875 20.882813 12 22 L 12 28 L 14.28125 28 C 14.628906 28.597656 15.261719 29 16 29 C 16.738281 29 17.371094 28.597656 17.71875 28 L 20 28 L 20 24 L 20.09375 24 L 20.09375 22.8125 C 20.09375 21.347656 20.855469 19.867188 22.09375 18.71875 C 23.75 17.0625 25 14.707031 25 12 C 25 7.058594 20.933594 2.984375 16 3.03125 Z M 16 5.03125 C 19.863281 4.976563 23 8.140625 23 12 C 23 14.09375 22.03125 15.9375 20.6875 17.28125 L 20.71875 17.3125 C 19.375 18.566406 18.515625 20.207031 18.28125 22 L 13.90625 22 C 13.6875 20.285156 12.949219 18.628906 11.5625 17.4375 C 9.796875 15.933594 8.742188 13.675781 9.09375 11.125 C 9.53125 7.972656 12.085938 5.441406 15.21875 5.09375 C 15.480469 5.0625 15.742188 5.035156 16 5.03125 Z M 2 12 L 2 14 L 5 14 L 5 12 Z M 27 12 L 27 14 L 30 14 L 30 12 Z M 7.5 20.09375 L 5.40625 22.1875 L 6.8125 23.59375 L 8.90625 21.5 Z M 24.5 20.09375 L 23.09375 21.5 L 25.1875 23.59375 L 26.59375 22.1875 Z M 14 24 L 18 24 L 18 26 L 14 26 Z" />
                    </svg>{" "}
                    Quick tips to improve your search:
                  </h3>
                  <ul>
                    <li>Try using different keywords or phrases</li>
                    <li>Check your spelling and remove extra spaces</li>
                    <li>Use broader terms for more results</li>
                    <li>Try filtering by different categories</li>
                  </ul>
                </div>

                <div
                  onClick={() => window.location.reload()}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      window.location.reload();
                    }
                  }}
                  className="border-none rounded-full px-4 py-3 cursor-pointer font-medium transition-all duration-200 focus:border-0 focus:outline-0 w-[200px] h-[48px] bg-gradient-to-br from-[#CBFEFF] to-[#6ABCFF] text-gray-900 hover:from-[#A0D8F0] hover:to-[#4A7AFF] hover:shadow-lg hover:shadow-blue-500/25 active:scale-95"
                >
                  <span>Start Fresh</span>
                </div>
              </div>
            </div>
          )}

        {showNewGroupPopup && (
          <NewGroupPopup
            newGroupName={newGroupName}
            setNewGroupName={setNewGroupName}
            newGroupTopics={newGroupTopics}
            setNewGroupTopics={setNewGroupTopics}
            topicInput={topicInput}
            setTopicInput={setTopicInput}
            fetchGroupOptions={getGroupOptions}
            setShowSuccessPopup={setShowSuccessPopup}
            topicContainerRef={topicContainerRef}
          />
        )}
        {showSuccessPopup && (
          <SuccessPopup setShowSuccessPopup={setShowSuccessPopup} />
        )}
        <SectorSidebar
          setSelectedTopNewsOption={setSelectedTopNewsOption}
          setSearchText={setSearchText}
        />
        <SummaryDetail
          summaryDetailVisible={summaryDetailVisible}
          setSummaryDetailVisible={setSummaryDetailVisible}
          activeNewsId={activeNewsId}
          impactTitle={selectedImpact}
          impactData={impactData}
        />

        {/* Login Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[1000]">
            <div
              className="rounded-lg p-5 md:p-10 max-w-[95vw] w-[530px] max-h-[90vh] overflow-auto relative"
              style={{
                backgroundColor: "rgb(34, 38, 42)",
                borderRadius: "20px",
              }}
            >
              <div className="flex justify-center items-center mb-4">
                <h2 className="text-[25px] font-weight-400 text-center">
                  Sign in to continue
                </h2>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="text-gray-400 hover:text-white absolute top-3 right-3 text-lg border border-white rounded-full w-7 h-7 "
                >
                  ✕
                </button>
              </div>
              <SignUpAndLogin
                isDarkTheme={isDarkTheme}
                isModal={true}
                onLoginSuccess={handleLoginSuccess}
                redirectAfterLogin={false}
              />
            </div>
          </div>
        )}
      </DashboardLayout>
    </>
  );
};

export default NewsIntelligence;
