'use client'
import React, { useState, useMemo, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import useWindowSize from "../../hooks/useWindowSize";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import {
  getUsersWithFilters,
  getPlatformSummary,
  getUserDetailsById,
  getSearchAnalytics,
} from "../../helpers/api";
import {
  setLoading,
  setDashboardData,
  setError,
  setSelectedUserDetails,
  setLoadingUserDetails,
  clearSelectedUserDetails,
  setCurrentPage,
  setPageSize,
  setCurrentPlanFilter,
  clearCurrentPlanFilter,
} from "../../store/slice/adminDashboardSlice";
import {
  Calendar,
  Filter,
  Download,
  Users,
  TrendingUp,
  Search,
  Eye,
  RefreshCw,
  X,
  Clock,
  CreditCard,
  Activity,
  ChevronLeft,
  ChevronRight,
  Settings,
  BarChart3,
} from "lucide-react";

import DashboardStats from "../../components/DashboardStats";
import UserTable from "../../components/UserTable";

const AdminDashboard = ({  partialAccess = false }) => {
  const isDarkTheme = true;
  const dispatch = useDispatch();

  // Redux state
  const {
    dashboardData,
    loading,
    error,
    selectedUserDetails,
    loadingUserDetails,
    pagination,
    currentPlanFilter,
  } = useSelector((state) => state.adminDashboard);

  // Local state - Changed default dateRange from "today" to "all"
  const [dateRange, setDateRange] = useState("all");
  const [selectedSource, setSelectedSource] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeFilter, setActiveFilter] = useState({
    type: "stat",
    value: "totalUsers",
  }); // Default to Total Users

  // Fixed date filtering logic
  const applyDateFilter = (records, dateRange) => {
    if (dateRange === "all") return records;

    const now = new Date();
    let filterDate;

    switch (dateRange) {
      case "today":
        // Set to start of today in local timezone
        filterDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "7d":
        // Set to 7 days ago from start of today
        filterDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        filterDate.setDate(filterDate.getDate() - 7);
        break;
      case "30d":
        // Set to 30 days ago from start of today
        filterDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        filterDate.setDate(filterDate.getDate() - 30);
        break;
      default:
        return records;
    }

    return records.filter((record) => {
      const recordDate = new Date(record.created_at);
      return recordDate >= filterDate;
    });
  };

  // Fetch dashboard data function using new APIs - FIXED FOR PAGINATION
  const fetchDashboardData = async (
    page = pagination.currentPage,
    limit = pagination.limit,
    planFilter = null,
    searchQuery = null,
    sourceFilter = null,
    statusFilter = null
  ) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const offset = (page - 1) * limit;

      // Prepare parameters for users API
      const params = { offset, limit };
      if (planFilter) {
        params.plan = planFilter;
      }
      if (searchQuery && searchQuery.trim() !== "") {
        params.search = searchQuery.trim();
      }
      if (sourceFilter && sourceFilter !== "all") {
        params.source = sourceFilter;
      }
      if (statusFilter) {
        params.status = statusFilter;
      }

      // Map dateRange for API
      let apiDateParam = null;
      if (dateRange === "today") apiDateParam = "today";
      else if (dateRange === "7d") apiDateParam = "7days";
      // Note: API doesn't support "30d" based on your code, so it will default to null which should return all data

      // Fetch users, platform summary, and search analytics simultaneously
      const [usersResponse, summaryResponse, searchAnalyticsResponse] =
        await Promise.all([
          getUsersWithFilters(
            params.offset,
            params.limit,
            params.plan,
            params.search,
            params.source,
            params.status
          ),
          getPlatformSummary(),
          // FIXED: Pass pagination and filter parameters directly to API
          getSearchAnalytics(
            apiDateParam,
            null,
            offset,
            limit,
            searchQuery,
            sourceFilter
          ),
        ]);

      // Process search analytics data for table display
      let searchRecords = [];
      let searchSources = {};
      let totalSearchItems = 0;

      if (searchAnalyticsResponse && searchAnalyticsResponse.results) {
        // FIXED: Use API response directly, no client-side pagination
        searchRecords = [...searchAnalyticsResponse.results];
        totalSearchItems =
          searchAnalyticsResponse.pagination?.totalCount ||
          searchAnalyticsResponse.pagination?.totalItems ||
          0;

        // Calculate sources distribution from API response
        searchRecords.forEach((record) => {
          const source = record.source || "website";
          searchSources[source] = (searchSources[source] || 0) + 1;
        });
      } else {
        console.warn("No search analytics data available");
      }

      if (usersResponse && summaryResponse) {
        // Combine the responses to match the expected dashboard data structure
        const combinedData = {
          summary: {
            totalUsers: summaryResponse.summary.totalUsers,
            activeUsers: summaryResponse.summary.activeUsers,
            inactiveUsers: summaryResponse.summary.inactiveUsers,
            totalSearches: summaryResponse.summary.totalSearches,
            searchesToday: summaryResponse.summary.searchesToday,
            searches7Days: summaryResponse.summary.searches7Days,
          },
          // Calculate plans distribution from users data
          plans: calculatePlansDistribution(usersResponse.users || []),
          // Use search sources for sources distribution (since we're showing search records)
          sources:
            Object.keys(searchSources).length > 0
              ? searchSources
              : calculateSourcesDistribution(usersResponse.users || []),
          users: usersResponse.users || [], // Keep original users data for stats
          searchRecords: searchRecords, // FIXED: Use API response directly
          pagination: {
            currentPage: page,
            limit: limit,
            totalItems: totalSearchItems, // FIXED: Use API pagination response
            totalPages: Math.ceil(totalSearchItems / limit),
          },
        };

        dispatch(setDashboardData(combinedData));
      } else {
        throw new Error("Failed to fetch dashboard data");
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      dispatch(setError(err.message || "Failed to load dashboard data"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  //.special fetch function for stat-based filters - UPDATED FOR PAGINATION
  const fetchStatBasedData = async (
    statType,
    page = 1,
    limit = pagination.limit
  ) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const offset = (page - 1) * limit;
      let usersResponse;
      const summaryResponse = await getPlatformSummary();

      switch (statType) {
        case "totalUsers":
          // Show all users with pagination
          usersResponse = await getUsersWithFilters(
            offset,
            limit,
            null,
            searchTerm,
            selectedSource,
            null
          );
          break;
        case "activeUsers":
          // Show only active users with pagination
          usersResponse = await getUsersWithFilters(
            offset,
            limit,
            null,
            searchTerm,
            selectedSource,
            "active"
          );
          break;
        case "searchesToday":
        case "searches7Days":
        case "totalSearches":
          // Get search analytics data to show search records
          try {
            // Map statType to the appropriate days parameter
            const daysParam =
              statType === "searchesToday"
                ? "today"
                : statType === "searches7Days"
                ? "7days"
                : null;

            // FIXED: Pass pagination and filter parameters directly to API
            const searchAnalytics = await getSearchAnalytics(
              daysParam,
              null,
              offset,
              limit,
              searchTerm,
              selectedSource
            );

            if (
              searchAnalytics &&
              searchAnalytics.results &&
              Array.isArray(searchAnalytics.results)
            ) {
              // FIXED: Use API response directly, no client-side filtering/pagination
              let searchRecords = [...searchAnalytics.results];
              const totalItems =
                searchAnalytics.pagination?.totalCount ||
                searchAnalytics.pagination?.totalItems ||
                0;

              // Calculate sources from search records
              const searchSources = {};
              searchRecords.forEach((record) => {
                const source = record.source || "website";
                searchSources[source] = (searchSources[source] || 0) + 1;
              });

              const combinedData = {
                summary: {
                  totalUsers: summaryResponse.summary.totalUsers,
                  activeUsers: summaryResponse.summary.activeUsers,
                  inactiveUsers: summaryResponse.summary.inactiveUsers,
                  totalSearches: summaryResponse.summary.totalSearches,
                  searchesToday: summaryResponse.summary.searchesToday,
                  searches7Days: summaryResponse.summary.searches7Days,
                },
                plans: { free: 0, pro: 0, ent: 0 }, // No plan data for search records
                sources: searchSources,
                users: [], // Empty users for search-based filters
                searchRecords: searchRecords, // FIXED: Use API response directly
                pagination: {
                  currentPage: page,
                  limit: limit,
                  totalItems: totalItems, // FIXED: Use API pagination response
                  totalPages: Math.ceil(totalItems / limit),
                },
                activeFilterType: statType,
              };

              dispatch(setDashboardData(combinedData));
              return;
            } else {
              console.warn(
                "Search analytics response is invalid or empty:",
                searchAnalytics
              );
              throw new Error(
                "Invalid search analytics response - no results found"
              );
            }
          } catch (analyticsError) {
            console.error("Search analytics API error:", analyticsError);
            // Set empty search records to ensure stable UI but show the error
            const combinedData = {
              summary: {
                totalUsers: summaryResponse.summary.totalUsers,
                activeUsers: summaryResponse.summary.activeUsers,
                inactiveUsers: summaryResponse.summary.inactiveUsers,
                totalSearches: summaryResponse.summary.totalSearches,
                searchesToday: summaryResponse.summary.searchesToday,
                searches7Days: summaryResponse.summary.searches7Days,
              },
              plans: { free: 0, pro: 0, ent: 0 },
              sources: {},
              users: [],
              searchRecords: [], // Empty array for failed search analytics
              pagination: {
                currentPage: page,
                limit: limit,
                totalItems: 0,
                totalPages: 1,
              },
              activeFilterType: statType,
              error: `Failed to load ${statType} data: ${analyticsError.message}`,
            };
            dispatch(setDashboardData(combinedData));
            return;
          }
        default:
          usersResponse = await getUsersWithFilters(
            offset,
            limit,
            null,
            searchTerm,
            selectedSource,
            null
          );
      }

      if (usersResponse && summaryResponse) {
        const combinedData = {
          summary: {
            totalUsers: summaryResponse.summary.totalUsers,
            activeUsers: summaryResponse.summary.activeUsers,
            inactiveUsers: summaryResponse.summary.inactiveUsers,
            totalSearches: summaryResponse.summary.totalSearches,
            searchesToday: summaryResponse.summary.searchesToday,
            searches7Days: summaryResponse.summary.searches7Days,
          },
          plans: calculatePlansDistribution(usersResponse.users || []),
          sources: calculateSourcesDistribution(usersResponse.users || []),
          users: usersResponse.users || [],
          searchRecords: [], // Empty search records for user-based filters
          pagination: {
            currentPage: page,
            limit: limit,
            totalItems: usersResponse.pagination?.totalUserCount || 0,
            totalPages: Math.ceil(
              (usersResponse.pagination?.totalUserCount || 0) / limit
            ),
          },
          activeFilterType: statType,
        };

        dispatch(setDashboardData(combinedData));
      }
    } catch (err) {
      console.error("Error fetching stat-based data:", err);
      dispatch(setError(err.message || "Failed to load data"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  // Helper function to calculate plans distribution
  const calculatePlansDistribution = (users) => {
    const plans = { free: 0, pro: 0, ent: 0 };
    users.forEach((user) => {
      if (user.plan && plans.hasOwnProperty(user.plan)) {
        plans[user.plan]++;
      } else {
        plans.free++; // Default to free if plan is not recognized
      }
    });
    return plans;
  };

  // Helper function to calculate sources distribution
  const calculateSourcesDistribution = (users) => {
    const sources = {};
    users.forEach((user) => {
      const source = user.source || "website"; // Default to website if source is null
      sources[source] = (sources[source] || 0) + 1;
    });
    return sources;
  };

  // Debounced search effect - FIXED to work with stat filters and 1000ms debounce
  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      // Reset to first page when searching
      if (searchTerm.trim() !== "") {
        dispatch(setCurrentPage(1));
      }

      // If we have an active stat filter, use fetchStatBasedData with search
      if (activeFilter?.type === "stat") {
        fetchStatBasedData(
          activeFilter.value,
          searchTerm.trim() !== "" ? 1 : pagination.currentPage,
          pagination.limit
        );
      } else {
        // Use regular fetchDashboardData for non-stat filters
        fetchDashboardData(
          searchTerm.trim() !== "" ? 1 : pagination.currentPage,
          pagination.limit,
          currentPlanFilter,
          searchTerm,
          selectedSource,
          null
        );
      }
    }, 1000); // 1000ms delay for debouncing

    return () => clearTimeout(searchTimeout);
  }, [
    searchTerm,
    dispatch,
    pagination.limit,
    currentPlanFilter,
    selectedSource,
    activeFilter,
    dateRange, // Add dateRange dependency
  ]);

  // Fetch dashboard data on component mount and when pagination changes (but not for search)
  useEffect(() => {
    if (searchTerm.trim() === "") {
      // Check if we have an active stat filter, maintain it
      if (activeFilter?.type === "stat") {
        fetchStatBasedData(
          activeFilter.value,
          pagination.currentPage,
          pagination.limit
        );
      } else {
        // Only fetch Total Users data on initial load when no active filter
        fetchStatBasedData(
          "totalUsers",
          pagination.currentPage,
          pagination.limit
        );
      }
    } else {
    }
  }, [dispatch,
    pagination.currentPage,
    pagination.limit, // Ensure limit changes trigger fetch
    currentPlanFilter,
    selectedSource,
    dateRange, // Add dateRange dependency
    activeFilter, // Add activeFilter dependency to maintain state
  ]);

  // Generate dynamic sources list from actual data
  const availableSources = useMemo(() => {
    if (!dashboardData?.sources) return [];

    return Object.keys(dashboardData.sources)
      .map((source) => ({
        value: source,
        label: source,
        count: dashboardData.sources[source],
      }))
      .filter((source) => source.count > 0); // Only show sources that have users
  }, [dashboardData?.sources]);

  const handleStatClick = (type, value) => {
    // Clear search term when any filter is clicked
    setSearchTerm("");

    if (
      activeFilter &&
      activeFilter.type === type &&
      activeFilter.value === value
    ) {
      // If clicking the same filter, clear it
      setActiveFilter(null);
      // Clear plan filter if it was set
      if (type === "plan") {
        dispatch(clearCurrentPlanFilter());
      }
      // Reset pagination and reload normal data
      dispatch(setCurrentPage(1));
      fetchDashboardData(1, pagination.limit, null, "", selectedSource, null);
    } else {
      // Set new filter
      setActiveFilter({ type, value });

      if (type === "plan") {
        dispatch(setCurrentPlanFilter(value));
        dispatch(setCurrentPage(1));
        fetchDashboardData(1, pagination.limit, value, "", selectedSource);
      } else if (type === "stat") {
        // Handle stat-based filtering
        dispatch(setCurrentPage(1));
        // Always start from page 1 when changing stat filter
        fetchStatBasedData(value, 1, pagination.limit);
      }
    }
  };

  const clearFilter = () => {
    setActiveFilter(null);
    dispatch(clearCurrentPlanFilter());
    dispatch(setCurrentPage(1));
    // When clearing filters, maintain search term and source filter
    fetchDashboardData(
      1,
      pagination.limit,
      null,
      searchTerm,
      selectedSource,
      null
    );
  };

  const handleUserClick = async (user) => {
    setSelectedUser(user);
    dispatch(clearSelectedUserDetails());
    dispatch(setLoadingUserDetails(true));

    try {
      // Handle both user records and search records
      const userId = user.user_id || user.id;
      if (userId) {
        const userDetails = await getUserDetailsById(userId);
        dispatch(setSelectedUserDetails(userDetails));
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      // Still show the drawer with basic info even if detailed fetch fails
    } finally {
      dispatch(setLoadingUserDetails(false));
    }
  };

  const closeDrawer = () => {
    setSelectedUser(null);
    dispatch(clearSelectedUserDetails());
  };

  const handleEmailClick = (record) => {
    console.log("Email clicked:", record);
    // Set search term to the clicked email
    setSearchTerm(record.email);
    // Set active filter to totalSearches
    setActiveFilter({ type: "stat", value: "totalSearches" });
    // Reset pagination and fetch data for totalSearches with the email as search term
    dispatch(setCurrentPage(1));

    // Directly call the fetchStatBasedData with the email search
    fetchStatBasedDataWithSearch(
      "totalSearches",
      1,
      pagination.limit,
      record.email
    );
  };

  // Helper function to fetch stat-based data with custom search term
  const fetchStatBasedDataWithSearch = async (
    statType,
    page = 1,
    limit = pagination.limit,
    customSearchTerm = null
  ) => {
    try {
      dispatch(setLoading(true));
      dispatch(setError(null));

      const offset = (page - 1) * limit;
      const summaryResponse = await getPlatformSummary();
      const searchTermToUse = customSearchTerm || searchTerm;

      // Map statType to the appropriate days parameter
      const daysParam =
        statType === "searchesToday"
          ? "today"
          : statType === "searches7Days"
          ? "7days"
          : null;

      // Fetch search analytics data with the custom search term
      const searchAnalytics = await getSearchAnalytics(
        daysParam,
        null,
        offset,
        limit,
        searchTermToUse,
        selectedSource
      );

      if (
        searchAnalytics &&
        searchAnalytics.results &&
        Array.isArray(searchAnalytics.results)
      ) {
        let searchRecords = [...searchAnalytics.results];
        const totalItems =
          searchAnalytics.pagination?.totalCount ||
          searchAnalytics.pagination?.totalItems ||
          0;

        // Calculate sources from search records
        const searchSources = {};
        searchRecords.forEach((record) => {
          const source = record.source || "website";
          searchSources[source] = (searchSources[source] || 0) + 1;
        });

        const combinedData = {
          summary: {
            totalUsers: summaryResponse.summary.totalUsers,
            activeUsers: summaryResponse.summary.activeUsers,
            inactiveUsers: summaryResponse.summary.inactiveUsers,
            totalSearches: summaryResponse.summary.totalSearches,
            searchesToday: summaryResponse.summary.searchesToday,
            searches7Days: summaryResponse.summary.searches7Days,
          },
          plans: { free: 0, pro: 0, ent: 0 },
          sources: searchSources,
          users: [],
          searchRecords: searchRecords,
          pagination: {
            currentPage: page,
            limit: limit,
            totalItems: totalItems,
            totalPages: Math.ceil(totalItems / limit),
          },
          activeFilterType: statType,
        };

        dispatch(setDashboardData(combinedData));
      } else {
        throw new Error("Invalid search analytics response - no results found");
      }
    } catch (err) {
      console.error("Error fetching stat-based data with search:", err);
      dispatch(setError(err.message || "Failed to load data"));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const refreshData = async () => {
    if (activeFilter?.type === "stat") {
      await fetchStatBasedData(
        activeFilter.value,
        pagination.currentPage,
        pagination.limit
      );
    } else {
      await fetchDashboardData(
        pagination.currentPage,
        pagination.limit,
        currentPlanFilter,
        searchTerm,
        selectedSource,
        null
      );
    }
  };

  const { width: windowWidth } = useWindowSize();
  const userRole = useSelector((state) => state.auth.role);
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);

  const handleLoginRequired = () => {
    console.log("Login required");
  };

  // Force dark theme for admin dashboard
  const isDarkMode = true;

  // Calculate left menu width to prevent overlap
  const getMenuWidth = () => {
    if (windowWidth < 640) {
      return 0;
    } else {
      return 60;
    }
  };

  const containerStyles = {
    padding: "24px",
    paddingBottom: "24px",
    backgroundColor: "#0f1419",
    color: "#ffffff",
    minHeight: "calc(100vh - 60px)", // Match SearchHistory pattern
    height: "auto",
    overflowY: "visible", // Match SearchHistory - allow natural scrolling
    overflowX: "hidden",
    marginLeft: `${getMenuWidth()}px`,
    width: `calc(100% - ${getMenuWidth()}px)`,
    transition: "margin-left 0.3s ease, width 0.3s ease",
    position: "relative",
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  };

  // Double-check authorization
  if (!isLoggedIn || userRole !== "admin") {
    return (
      <DashboardLayout
        isDarkTheme={isDarkTheme}
        partialAccess={partialAccess}
        onLoginRequired={handleLoginRequired}
        showSearch={false}
      >
        <div style={containerStyles}>
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center">
              <X className="w-10 h-10 text-red-400" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-white">Access Denied</h1>
              <p className="text-gray-400 max-w-md mx-auto leading-relaxed">
                {!isLoggedIn
                  ? "You must be logged in to access this page. Please sign in and try again."
                  : "You don't have permission to access the Admin Dashboard. This page is restricted to administrators only."}
              </p>
            </div>
            <button
              onClick={() => window.history.back()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              Go Back
            </button>
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
      <div style={containerStyles} className="admin-dashboard-container">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex items-center justify-between lg:mb-10 mb-5">
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">
                    SAGE Media Analytics
                  </h1>
                  <p className="text-gray-400">Super Admin Dashboard</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-lg transition-colors">
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Export</span>
              </button>
              <button
                onClick={refreshData}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                <span className="text-sm font-medium">
                  {loading ? "Refreshing..." : "Refresh"}
                </span>
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && !dashboardData && (
            <div className="flex justify-center items-center py-20">
              <div className="text-center space-y-4">
                <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto">
                  <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
                </div>
                <p className="text-gray-400">Loading dashboard data...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !dashboardData && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 bg-red-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <X className="w-5 h-5 text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-red-400 font-semibold mb-1">
                    Error Loading Dashboard
                  </h3>
                  <p className="text-red-300 text-sm mb-4">{error}</p>
                  <button
                    onClick={refreshData}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Search Analytics Error State */}
          {dashboardData?.error &&
            activeFilter?.type === "stat" &&
            ["searchesToday", "searches7Days", "totalSearches"].includes(
              activeFilter?.value
            ) && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 mb-5">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Search className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-yellow-400 font-semibold mb-1">
                      Search Analytics Issue
                    </h3>
                    <p className="text-yellow-300 text-sm mb-4">
                      {dashboardData.error}
                    </p>
                    <p className="text-yellow-200 text-xs">
                      This might be due to API limitations or no search data
                      available for the selected filter.
                    </p>
                  </div>
                </div>
              </div>
            )}

          {/* Dashboard Content */}
          {(dashboardData || (!loading && !error)) && (
            <>
              {/* Dashboard Stats Component */}
              <DashboardStats
                dashboardData={dashboardData}
                activeFilter={activeFilter}
                onStatClick={handleStatClick}
                onClearFilter={clearFilter}
              />

              {/* Filters Section */}
              <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-6 mb-5">
                <div className="flex flex-wrap items-center gap-6">
                  {/* Date Range Filter */}
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-gray-300" />
                    </div>
                    <select
                      value={dateRange}
                      onChange={(e) => {
                        setDateRange(e.target.value);
                        dispatch(setCurrentPage(1)); // Reset to first page when changing date range
                      }}
                      className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all" selected>
                        All time
                      </option>
                      <option value="today">Today</option>
                      <option value="7d">Last 7 days</option>
                      <option value="30d">Last 30 days</option>
                    </select>
                  </div>

                  {/* Source Filter */}
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                      <Filter className="w-4 h-4 text-gray-300" />
                    </div>
                    <select
                      value={selectedSource}
                      onChange={(e) => {
                        setSelectedSource(e.target.value);
                        dispatch(setCurrentPage(1));
                      }}
                      className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">All Sources</option>
                      {availableSources.map((source) => (
                        <option key={source.value} value={source.value}>
                          {source.label} ({source.count})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Search Input */}
                  <div className="flex items-center space-x-3 ml-auto">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="w-4 h-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="Search by email or topic..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-gray-700 border border-gray-600 rounded-lg pl-10 pr-10 py-2 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                      />
                      {searchTerm && (
                        <button
                          onClick={() => {
                            setSearchTerm("");
                            dispatch(setCurrentPage(1));
                          }}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* User Table Component - MODIFIED to pass search records */}
              <UserTable
                userData={
                  // Show search records for search-based filters, even if empty
                  activeFilter?.type === "stat" &&
                  ["searchesToday", "searches7Days", "totalSearches"].includes(
                    activeFilter?.value
                  )
                    ? dashboardData?.searchRecords || []
                    : dashboardData?.users || []
                }
                pagination={dashboardData?.pagination || pagination}
                searchTerm={searchTerm}
                selectedUser={selectedUser}
                selectedUserDetails={selectedUserDetails}
                loadingUserDetails={loadingUserDetails}
                onUserClick={handleUserClick}
                onCloseDrawer={closeDrawer}
                dispatch={dispatch}
                onEmailClick={handleEmailClick}
                onPageChange={(page, limit) => {
                  // Always handle pagination change properly
                  if (activeFilter?.type === "stat") {
                    fetchStatBasedData(
                      activeFilter.value,
                      page,
                      limit || pagination.limit
                    );
                  } else {
                    fetchDashboardData(
                      page,
                      limit || pagination.limit,
                      currentPlanFilter,
                      searchTerm,
                      selectedSource,
                      null
                    );
                  }
                }}
                isSearchRecordsMode={
                  activeFilter?.type === "stat" &&
                  ["searchesToday", "searches7Days", "totalSearches"].includes(
                    activeFilter?.value
                  )
                } // Show search mode for search-based filters
              />
            </>
          )}
        </div>
      </div>

      {/* Responsive Styles */}
      <style jsx>{`
        /* Custom scrollbar styling - Match SearchHistory */
        .admin-dashboard-container::-webkit-scrollbar {
          width: 8px;
        }

        .admin-dashboard-container::-webkit-scrollbar-track {
          background: #1f2937;
          border-radius: 4px;
        }

        .admin-dashboard-container::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 4px;
        }

        .admin-dashboard-container::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }

        /* Firefox scrollbar styling */
        .admin-dashboard-container {
          scrollbar-width: thin;
          scrollbar-color: #4b5563 #1f2937;
        }

        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }

        /* Button hover effects - exclude close/clear buttons */
        .admin-dashboard-container
          button:hover:not(:disabled):not([title*="Clear"]):not(
            [title*="close"]
          ) {
          transform: translateY(-1px);
        }

        .admin-dashboard-container select:hover {
          border-color: #4b5563 !important;
        }

        /* Responsive adjustments for mobile - Match SearchHistory */
        @media (max-width: 640px) {
          .admin-dashboard-container {
            margin-left: 0 !important;
            width: 100% !important;
            padding: 16px 16px 100px 16px !important;
            min-height: calc(100vh - 80px) !important;
          }

          /* Pagination responsive adjustments */
          .admin-dashboard-container .pagination-container {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 16px !important;
          }

          .admin-dashboard-container .pagination-controls {
            justify-content: center !important;
            flex-wrap: wrap !important;
          }
        }

        /* Ensure proper scrolling on all devices */
        @media (max-height: 600px) {
          .admin-dashboard-container {
            min-height: 100vh !important;
            padding-bottom: 140px !important;
          }
        }

        /* Fix for very small screens */
        @media (max-width: 480px) {
          .admin-dashboard-container .pagination-controls {
            gap: 4px !important;
          }

          .admin-dashboard-container .pagination-controls button {
            padding: 6px 8px !important;
            font-size: 12px !important;
            min-width: 32px !important;
          }
        }
      `}</style>
    </DashboardLayout>
  );
};

export default AdminDashboard;
