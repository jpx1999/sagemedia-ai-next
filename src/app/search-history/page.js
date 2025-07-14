'use client'
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import useWindowSize from "../../hooks/useWindowSize";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSearch,
  faDownload,
  faFilter,
  faCalendarAlt,
  faClock,
  faChevronDown,
  faChevronUp,
  faHistory,
  faPlay,
  faRefresh,
  faEye,
  faNewspaper,
  faChartLine,
} from "@fortawesome/free-solid-svg-icons";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import { getUserSearchHistory, validateHistoryItem } from "../../helpers/api";
import { useRouter, usePathname } from "next/navigation";

const SearchHistory = ({  partialAccess = false }) => {
  const isDarkTheme = true;
  const router = useRouter();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const userData = useSelector((state) => state.auth.user);
  const currentLocation = useSelector(
    (state) => state.newsDetails.currentLocation
  );
  // State management
  const [searchHistory, setSearchHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchFilter, setSearchFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalItems, setTotalItems] = useState(0);

  // Get current theme from Redux store
  const currentTheme = useSelector((state) => state.theme.currentTheme);
  const { width: windowWidth } = useWindowSize();

  const handleLoginRequired = () => {
    console.log("Login required");
  };

  // Load search history from API
  useEffect(() => {
    loadSearchHistory();
  }, [isLoggedIn, currentPage, itemsPerPage]);

  const loadSearchHistory = async () => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Fetching search history...");
      const offset = (currentPage - 1) * itemsPerPage;
      const response = await getUserSearchHistory(itemsPerPage, offset);
      console.log("Search history response:", response);

      if (response.status === 1 && response.results) {
        const transformedData = response.results.map((item, index) => ({
          id: `${item.topic}_${item.created_at}_${index}`,
          topic: item.topic,
          created_at: item.created_at,
          news_count: item.news_count,
          searchDuration: Math.round((item.news_count / 10) * 100) / 100,
          category: determineCategory(item.topic),
          impactScore: Math.min(
            Math.round((item.news_count / 5) * 100) / 100,
            10
          ),
        }));
        setSearchHistory(transformedData);
        setFilteredHistory(transformedData);
        setTotalItems(response.total || transformedData.length);
      } else {
        console.log("No search history found or invalid response");
        setSearchHistory([]);
        setFilteredHistory([]);
        setTotalItems(0);
      }
    } catch (error) {
      console.error("Error loading search history:", error);
      setError(`Failed to load search history: ${error.message}`);
      setSearchHistory([]);
      setFilteredHistory([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to determine category based on topic
  const determineCategory = (topic) => {
    const topicLower = topic.toLowerCase();

    if (
      topicLower.includes("crash") ||
      topicLower.includes("accident") ||
      topicLower.includes("disaster") ||
      topicLower.includes("helicopter")
    ) {
      return "Emergency";
    } else if (
      topicLower.includes("tcs") ||
      topicLower.includes("tech") ||
      topicLower.includes("software") ||
      topicLower.includes("it") ||
      topicLower.includes("microsoft") ||
      topicLower.includes("google") ||
      topicLower.includes("apple")
    ) {
      return "Technology";
    } else if (
      topicLower.includes("market") ||
      topicLower.includes("stock") ||
      topicLower.includes("finance") ||
      topicLower.includes("bank") ||
      topicLower.includes("sbi") ||
      topicLower.includes("dividend") ||
      topicLower.includes("share") ||
      topicLower.includes("investment")
    ) {
      return "Financial";
    } else if (
      topicLower.includes("election") ||
      topicLower.includes("government") ||
      topicLower.includes("policy") ||
      topicLower.includes("minister") ||
      topicLower.includes("politics")
    ) {
      return "Political";
    } else if (
      topicLower.includes("health") ||
      topicLower.includes("medical") ||
      topicLower.includes("hospital") ||
      topicLower.includes("covid") ||
      topicLower.includes("vaccine")
    ) {
      return "Healthcare";
    } else if (
      topicLower.includes("sports") ||
      topicLower.includes("cricket") ||
      topicLower.includes("football") ||
      topicLower.includes("olympics")
    ) {
      return "Sports";
    } else {
      return "General";
    }
  };

  // Filter and sort logic
  useEffect(() => {
    let filtered = [...searchHistory];

    // Apply search filter
    if (searchFilter) {
      filtered = filtered.filter(
        (item) =>
          item.topic.toLowerCase().includes(searchFilter.toLowerCase()) ||
          item.category.toLowerCase().includes(searchFilter.toLowerCase())
      );
    }

    // Apply date filter
    const now = new Date();
    switch (dateFilter) {
      case "today":
        filtered = filtered.filter((item) => {
          const itemDate = new Date(item.created_at);
          return itemDate.toDateString() === now.toDateString();
        });
        break;
      case "week":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(
          (item) => new Date(item.created_at) > weekAgo
        );
        break;
      case "month":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        filtered = filtered.filter(
          (item) => new Date(item.created_at) > monthAgo
        );
        break;
      default:
        break;
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "date":
          comparison = new Date(b.created_at) - new Date(a.created_at);
          break;
        case "topic":
          comparison = a.topic.localeCompare(b.topic);
          break;
        case "news_count":
          comparison = b.news_count - a.news_count;
          break;
        case "impact":
          comparison = b.impactScore - a.impactScore;
          break;
        default:
          break;
      }
      return sortOrder === "desc" ? comparison : -comparison;
    });

    setFilteredHistory(filtered);
  }, [searchHistory, searchFilter, dateFilter, sortBy, sortOrder]);

  // Function to view details for a search history item
  const handleViewDetails = async (item) => {
    // Validate the history item first
    const validation = validateHistoryItem(item);
    if (!validation.valid) {
      console.error("Invalid history item:", validation.error);
      return;
    }

    const cleanedItem = validation.cleanedItem;

    // Navigate directly to news intelligence with topic for auto-search
    // Do not call any APIs here - let the NewsIntelligence component handle the search
    // console.log(
    //   "🔄 Navigating to news intelligence for auto-search:",
    //   cleanedItem.topic
    // );
    // console.log("🔄 Navigation state:", {
    //   fromHistory: true,
    //   autoSearchTopic: cleanedItem.topic,
    //   historyItem: cleanedItem,
    // });

    router.push("/news-intelligence", {
      state: {
        fromHistory: true,
        autoSearchTopic: cleanedItem.topic,
        historyItem: cleanedItem,
      },
    });
  };

  // Function to re-run a search (router.push to main search)
  const handleRerunSearch = (topic) => {
    router.push("/news-intelligence", {
      state: {
        initialQuery: topic,
        fromHistory: true,
      },
    });
  };

  // Utility functions
  const formatDate = (dateString) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffTime = Math.abs(now - date);
    const diffMinutes = Math.ceil(diffTime / (1000 * 60));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60)
      return `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    if (diffDays < 30)
      return `${Math.floor(diffDays / 7)} week${
        Math.floor(diffDays / 7) > 1 ? "s" : ""
      } ago`;
    return `${Math.floor(diffDays / 30)} month${
      Math.floor(diffDays / 30) > 1 ? "s" : ""
    } ago`;
  };

  const getCategoryColor = (category) => {
    const colors = {
      Emergency: "#ef4444",
      Technology: "#3b82f6",
      Financial: "#10b981",
      Political: "#8b5cf6",
      Healthcare: "#06b6d4",
      Sports: "#f59e0b",
      General: "#6b7280",
    };
    return colors[category] || "#6b7280";
  };

  const exportHistory = () => {
    const dataStr = JSON.stringify(filteredHistory, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `search-history-${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleRefresh = () => {
    setCurrentPage(1); // Reset to first page when refreshing
    loadSearchHistory();
  };

  // Pagination handlers
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Calculate pagination info
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const isDarkMode =
    typeof currentTheme === "object"
      ? currentTheme.backgroundColor === "#000" ||
        currentTheme.navBg === "#1F2937"
      : currentTheme === "dark";

  // Calculate left menu width to prevent overlap
  const getMenuWidth = () => {
    if (windowWidth < 640) {
      // Mobile: menu is overlay, so no margin needed
      return 0;
    } else {
      // Desktop: 60px when collapsed, 300px when expanded
      // Using collapsed width for consistency
      return 60;
    }
  };

  const styles = {
    container: {
      padding: "24px",
      backgroundColor:
        currentTheme.backgroundColor || (isDarkMode ? "#000" : "#ffffff"),
      color: currentTheme.textColor || (isDarkMode ? "#ffffff" : "#000000"),
      minHeight: "calc(100vh - 60px)", // Account for header height
      height: "auto",
      overflowY: "visible", // Changed from auto to visible
      overflowX: "hidden",
      marginLeft: `${getMenuWidth()}px`,
      width: `calc(100% - ${getMenuWidth()}px)`,
      transition: "margin-left 0.3s ease, width 0.3s ease",
      position: "relative",
      paddingBottom: "24px",
    },
    header: {
      marginBottom: "32px",
    },
    title: {
      fontSize: "28px",
      fontWeight: "500",
      color: isDarkMode ? "#ffffff" : "#1f2937",
      marginBottom: "8px",
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    subtitle: {
      color: isDarkMode ? "#9ca3af" : "#6b7280",
      fontSize: "16px",
    },
    controls: {
      display: "flex",
      flexWrap: "wrap",
      gap: "16px",
      marginBottom: "24px",
      alignItems: "center",
      justifyContent: "space-between",
    },
    searchBox: {
      flex: "1",
      minWidth: "300px",
      position: "relative",
    },
    searchInput: {
      width: "100%",
      padding: "12px 16px 12px 44px",
      borderRadius: "12px",
      border: `1px solid ${isDarkMode ? "#374151" : "#d1d5db"}`,
      backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
      color: isDarkMode ? "#ffffff" : "#000000",
      fontSize: "14px",
      outline: "none",
    },
    searchIcon: {
      position: "absolute",
      left: "16px",
      top: "50%",
      transform: "translateY(-50%)",
      color: isDarkMode ? "#9ca3af" : "#6b7280",
    },
    filterToggle: {
      padding: "12px 16px",
      borderRadius: "8px",
      border: `1px solid ${isDarkMode ? "#374151" : "#d1d5db"}`,
      backgroundColor: showFilters
        ? isDarkMode
          ? "#374151"
          : "#f3f4f6"
        : isDarkMode
        ? "#1f2937"
        : "#ffffff",
      color: isDarkMode ? "#ffffff" : "#374151",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    actionButtons: {
      display: "flex",
      gap: "8px",
      flexWrap: "wrap",
    },
    actionBtn: {
      padding: "12px 16px",
      borderRadius: "8px",
      border: "none",
      backgroundColor: isDarkMode ? "#374151" : "#f3f4f6",
      color: isDarkMode ? "#000" : "#000",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "14px",
      fontWeight: "500",
      transition: "all 0.2s",
      margin: "auto",
    },
    primaryBtn: {
      backgroundColor: "#3b82f6",
      color: "#ffffff",
    },
    refreshBtn: {
      backgroundColor: "#10b981",
      color: "#ffffff",
    },
    filtersPanel: {
      display: showFilters ? "block" : "none",
      backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
      border: `1px solid ${isDarkMode ? "#374151" : "#d1d5db"}`,
      borderRadius: "12px",
      padding: "20px",
      marginBottom: "24px",
    },
    filterGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "16px",
    },
    filterGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },
    filterLabel: {
      fontSize: "14px",
      fontWeight: "500",
      color: isDarkMode ? "#ffffff" : "#374151",
    },
    filterSelect: {
      padding: "8px 12px",
      borderRadius: "8px",
      border: `1px solid ${isDarkMode ? "#374151" : "#d1d5db"}`,
      backgroundColor: isDarkMode ? "#374151" : "#ffffff",
      color: isDarkMode ? "#ffffff" : "#000000",
      fontSize: "14px",
    },
    statsGrid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "16px",
      marginBottom: "32px",
    },
    statCard: {
      backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
      border: `1px solid ${isDarkMode ? "#374151" : "#e5e7eb"}`,
      borderRadius: "12px",
      padding: "20px",
      textAlign: "center",
    },
    statValue: {
      fontSize: "32px",
      fontWeight: "700",
      color: isDarkMode ? "#ffffff" : "#1f2937",
      marginBottom: "8px",
    },
    statLabel: {
      fontSize: "14px",
      color: isDarkMode ? "#9ca3af" : "#6b7280",
    },
    historyList: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    },
    historyItem: {
      background: "transparent",
      border: `1px solid ${isDarkMode ? "#374151" : "#e5e7eb"}`,
      borderRadius: "16px",
      padding: "15px",
      transition: "all 0.3s",
      // cursor: "pointer",
    },
    historyItemHover: {
      backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
      boxShadow: isDarkMode
        ? "0 8px 25px rgba(0, 0, 0, 0.3)"
        : "0 8px 25px rgba(0, 0, 0, 0.1)",
    },
    historyHeader: {
      justifyContent: "space-between",
      alignItems: "center",
    },
    topicText: {
      fontSize: "20px",
      fontWeight: "400",
      color: isDarkMode ? "#ffffff" : "#1f2937",
      marginBottom: "15px",
      flex: 1,
      marginRight: "20px",
      textTransform: "capitalize",
      overflow: "hidden",

      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    historyMeta: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
      fontSize: "15px",
      color: isDarkMode ? "#9ca3af" : "#6b7280",
      marginBottom: "12px",
      flexWrap: "wrap",
    },

    viewBtn: {
      padding: "8px 12px",
      borderRadius: "8px",
      border: "none",
      backgroundColor: "#10b981",
      color: "#ffffff",
      cursor: "pointer",

      gap: "6px",
      fontSize: "16px",
      fontWeight: "400",
      transition: "all 0.2s",
      minWidth: "100px",
      justifyContent: "center",
    },
    // rerunBtn: {
    //   padding: "8px 12px",
    //   borderRadius: "8px",
    //   border: "none",
    //   backgroundColor: "#3b82f6",
    //   color: "#ffffff",
    //   cursor: "pointer",
    //   display: "flex",
    //   alignItems: "center",
    //   gap: "6px",
    //   fontSize: "12px",
    //   fontWeight: "500",
    //   transition: "all 0.2s",
    //   minWidth: "100px",
    //   justifyContent: "center",
    // },
    loadingBtn: {
      opacity: 0.7,
      cursor: "not-allowed",
    },
    emptyState: {
      textAlign: "center",
      padding: "60px 20px",
      color: isDarkMode ? "#9ca3af" : "#6b7280",
    },
    loadingSpinner: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "300px",
      fontSize: "18px",
      color: isDarkMode ? "#9ca3af" : "#6b7280",
    },
    errorState: {
      textAlign: "center",
      padding: "60px 20px",
      color: "grey",
    },

    // Pagination styles
    paginationContainer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: "32px",
      padding: "20px",
      backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
      border: `1px solid ${isDarkMode ? "#374151" : "#e5e7eb"}`,
      borderRadius: "12px",
      flexWrap: "wrap",
      gap: "16px",
    },
    itemsPerPageContainer: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      fontSize: "14px",
      color: isDarkMode ? "#d1d5db" : "#374151",
    },
    itemsPerPageSelect: {
      padding: "6px 12px",
      borderRadius: "6px",
      border: `1px solid ${isDarkMode ? "#374151" : "#d1d5db"}`,
      backgroundColor: isDarkMode ? "#374151" : "#ffffff",
      color: isDarkMode ? "#ffffff" : "#000000",
      fontSize: "14px",
      cursor: "pointer",
    },
    paginationInfo: {
      fontSize: "14px",
      color: isDarkMode ? "#9ca3af" : "#6b7280",
      fontWeight: "500",
    },
    paginationControls: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    pageButton: {
      padding: "8px 12px",
      border: `1px solid ${isDarkMode ? "#374151" : "#d1d5db"}`,
      backgroundColor: isDarkMode ? "#1f2937" : "#ffffff",
      color: isDarkMode ? "#ffffff" : "#374151",
      borderRadius: "6px",
      cursor: "pointer",
      fontSize: "14px",
      minWidth: "40px",
      textAlign: "center",
      transition: "all 0.2s",
    },
    pageButtonActive: {
      backgroundColor: "#3b82f6",
      color: "#ffffff",
      borderColor: "#3b82f6",
    },
    pageButtonDisabled: {
      opacity: 0.5,
      cursor: "not-allowed",
    },
    pageEllipsis: {
      padding: "8px 4px",
      color: isDarkMode ? "#9ca3af" : "#6b7280",
      fontSize: "14px",
    },
  };

  if (!isLoggedIn && partialAccess) {
    return (
      <DashboardLayout
        isDarkTheme={isDarkTheme}
        partialAccess={partialAccess}
        onLoginRequired={handleLoginRequired}
        showSearch={false}
      >
        <div style={styles.container} className="search-history-container">
          <div style={styles.emptyState}>
            <FontAwesomeIcon
              icon={faHistory}
              size="4x"
              style={{ marginBottom: "24px", opacity: 0.5 }}
            />
            <h2
              style={{
                marginBottom: "16px",
                color: isDarkMode ? "#ffffff" : "#1f2937",
              }}
            >
              Sign in to view your search history
            </h2>
            <p>Track your searches and analyze your research patterns.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    
      <DashboardLayout
        isDarkTheme={isDarkTheme}
        partialAccess={partialAccess}
        onLoginRequired={handleLoginRequired}
        showSearch={false}
      >
        <div style={styles.container} className="search-history-container">
          <div className="max-w-[1000px] mx-auto">
            {/* Header */}
            <div style={styles.header}>
              <h1 style={styles.title}>
                <FontAwesomeIcon icon={faHistory} />
                Search History
              </h1>
              <p style={styles.subtitle}>
                Track and manage your news search history. Click on any item to
                view details.
              </p>
            </div>

            {/* Content */}
            {loading ? (
              <div style={styles.loadingSpinner}>
                <FontAwesomeIcon
                  icon={faClock}
                  spin
                  style={{ marginRight: "12px" }}
                />
                Loading search history...
              </div>
            ) : error ? (
              <div style={styles.errorState}>
                {/* <FontAwesomeIcon
                icon={faTimes}
                size="3x"
                style={{ marginBottom: "24px" }}
              /> */}
                <h3 style={{ marginBottom: "16px" }}>
                  Failed to load search history
                </h3>
                <button
                  style={{
                    ...styles.actionBtn,
                    ...styles.refreshBtn,
                    marginTop: "16px",
                  }}
                  onClick={handleRefresh}
                >
                  <FontAwesomeIcon icon={faRefresh} />
                  Try Again
                </button>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div style={styles.emptyState}>
                <FontAwesomeIcon
                  icon={faSearch}
                  size="3x"
                  style={{ marginBottom: "24px", opacity: 0.5 }}
                />
                <h3
                  style={{
                    marginBottom: "16px",
                    color: isDarkMode ? "#ffffff" : "#1f2937",
                  }}
                >
                  {searchFilter || dateFilter !== "all"
                    ? "No searches found"
                    : "No search history yet"}
                </h3>
                <p>
                  {searchFilter || dateFilter !== "all"
                    ? "Try adjusting your filters to see more results."
                    : "Start searching for news to build your history."}
                </p>
                <button
                  style={{
                    ...styles.actionBtn,

                    marginTop: "16px",
                  }}
                  className="border-none rounded-full px-4 md:py-2 py-1 cursor-pointer font-medium bg-gradient-to-br from-[#CBFEFF] to-[#6ABCFF]  text-black"
                  onClick={() => router.push("/news-intelligence")}
                >
                  <FontAwesomeIcon icon={faSearch} className="text-black" />
                  Search New Topic
                </button>
              </div>
            ) : (
              <div style={styles.historyList}>
                {filteredHistory.map((item) => (
                  <div
                    key={item.id}
                    style={styles.historyItem}
                    // onClick={() => handleViewDetails(item)}
                    onMouseEnter={(e) => {
                      Object.assign(e.currentTarget.style, styles.historyItem);
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style, styles.historyItem;
                    }}
                  >
                    <div style={styles.historyHeader} className="md:flex">
                      <div style={{ flex: 1 }}>
                        <div
                          style={styles.topicText}
                          className="md:flex max-w-[350px] md:max-w-[450px] lg:max-w-[600px] text-ellipsis"
                        >
                          {item.topic}
                        </div>
                        <div style={styles.historyMeta}>
                          <span>
                            <FontAwesomeIcon
                              icon={faCalendarAlt}
                              style={{ marginRight: "10px" }}
                            />
                            {formatDate(item.created_at)}
                          </span>
                          <span>
                            <FontAwesomeIcon
                              icon={faClock}
                              style={{ marginRight: "10px" }}
                            />
                            {formatTimeAgo(item.created_at)}
                          </span>
                          <span>
                            <FontAwesomeIcon
                              icon={faNewspaper}
                              style={{ marginRight: "10px" }}
                            />
                            {item.news_count} articles found
                          </span>
                        </div>
                      </div>

                      <div style={styles.actionIcons}>
                        <button
                          className="border-none rounded-full px-4 md:py-2 cursor-pointer font-medium bg-gradient-to-br from-[#CBFEFF] to-[#6ABCFF] text-gray-900"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(item);
                          }}
                          title="View detailed news analysis"
                        >
                          <FontAwesomeIcon
                            icon={faEye}
                            className="mr-2 font-thin"
                          />
                          View
                        </button>
                        {/* <button
                        style={styles.rerunBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRerunSearch(item.topic);
                        }}
                        title="Search this topic again"
                      >
                        <FontAwesomeIcon icon={faPlay} />
                        New Search
                      </button> */}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalItems > 0 && (
              <div
                className="pagination-container"
                style={styles.paginationContainer}
              >
                {/* Items per page selector */}
                <div style={styles.itemsPerPageContainer}>
                  <span>Show:</span>
                  <select
                    className="items-per-page-select"
                    value={itemsPerPage}
                    onChange={(e) =>
                      handleItemsPerPageChange(Number(e.target.value))
                    }
                    style={styles.itemsPerPageSelect}
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span>per page</span>
                </div>

                {/* Pagination info */}
                <div style={styles.paginationInfo}>
                  Showing {startItem} to {endItem} of {totalItems} searches
                </div>

                {/* Pagination controls */}
                {totalPages > 1 && (
                  <div
                    className="pagination-controls"
                    style={styles.paginationControls}
                  >
                    {/* Previous button */}
                    <button
                      className="page-button"
                      style={{
                        ...styles.pageButton,
                        ...(currentPage === 1 ? styles.pageButtonDisabled : {}),
                      }}
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </button>

                    {/* Page numbers */}
                    {getPageNumbers().map((page, index) => (
                      <span key={index}>
                        {page === "..." ? (
                          <span style={styles.pageEllipsis}>...</span>
                        ) : (
                          <button
                            className={`page-button ${
                              currentPage === page ? "active" : ""
                            }`}
                            style={{
                              ...styles.pageButton,
                              ...(currentPage === page
                                ? styles.pageButtonActive
                                : {}),
                            }}
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </button>
                        )}
                      </span>
                    ))}

                    {/* Next button */}
                    <button
                      className="page-button"
                      style={{
                        ...styles.pageButton,
                        ...(currentPage === totalPages
                          ? styles.pageButtonDisabled
                          : {}),
                      }}
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Add hover effects with CSS */}
        <style jsx>{`
          /* Custom scrollbar styling */
          .search-history-container::-webkit-scrollbar {
            width: 8px;
          }

          .search-history-container::-webkit-scrollbar-track {
            background: ${isDarkMode ? "#1f2937" : "#f1f5f9"};
            border-radius: 4px;
          }

          .search-history-container::-webkit-scrollbar-thumb {
            background: ${isDarkMode ? "#4b5563" : "#cbd5e1"};
            border-radius: 4px;
          }

          .search-history-container::-webkit-scrollbar-thumb:hover {
            background: ${isDarkMode ? "#6b7280" : "#94a3b8"};
          }

          /* Firefox scrollbar styling */
          .search-history-container {
            scrollbar-width: thin;
            scrollbar-color: ${isDarkMode
              ? "#4b5563 #1f2937"
              : "#cbd5e1 #f1f5f9"};
          }

          /* Smooth scrolling */
          html {
            scroll-behavior: smooth;
          }

          .history-item:hover {
            transform: translateY(-2px);
            box-shadow: ${isDarkMode
              ? "0 8px 25px rgba(0, 0, 0, 0.3)"
              : "0 8px 25px rgba(0, 0, 0, 0.1)"};
          }

          .view-btn:hover:not(:disabled) {
            background-color: #059669 !important;
          }

          .rerun-btn:hover {
            background-color: #2563eb !important;
          }

          .action-btn:hover {
            transform: translateY(-1px);
          }

          /* Pagination button hover effects */
          .page-button:hover:not(:disabled) {
            background-color: ${isDarkMode ? "#374151" : "#f3f4f6"} !important;
            transform: translateY(-1px);
          }

          .page-button.active:hover {
            background-color: #2563eb !important;
          }

          .items-per-page-select:hover {
            border-color: ${isDarkMode ? "#4b5563" : "#9ca3af"} !important;
          }

          /* Responsive adjustments for mobile */
          @media (max-width: 640px) {
            .search-history-container {
              margin-left: 0 !important;
              width: 100% !important;
              padding: 16px 16px 100px 16px !important;
              min-height: calc(100vh - 80px) !important;
            }

            .action-icons {
              flex-direction: column;
              gap: 8px;
            }

            .history-meta {
              flex-direction: column;
              align-items: flex-start;
              gap: 8px;
            }

            /* Mobile scrollbar adjustments */
            .search-history-container::-webkit-scrollbar {
              width: 4px;
            }

            /* Pagination responsive adjustments */
            .pagination-container {
              flex-direction: column !important;
              align-items: stretch !important;
              gap: 16px !important;
            }

            .pagination-controls {
              justify-content: center !important;
              flex-wrap: wrap !important;
            }
          }

          /* Ensure proper scrolling on all devices */
          @media (max-height: 600px) {
            .search-history-container {
              min-height: 100vh !important;
              padding-bottom: 140px !important;
            }
          }

          /* Fix for very small screens */
          @media (max-width: 480px) {
            .pagination-controls {
              gap: 4px !important;
            }

            .page-button {
              padding: 6px 8px !important;
              font-size: 12px !important;
              min-width: 32px !important;
            }
          }
        `}</style>
      </DashboardLayout>
    
  );
};

export default SearchHistory;
