import api from "./axiosInterceptor";


// Cache for storing news details by ID with timestamps
const newsDetailsCache = {};

// Set cache TTL (time to live) to 5 minutes (in milliseconds)
const CACHE_TTL = 5 * 60 * 1000;

// Maximum number of items to keep in cache
const MAX_CACHE_SIZE = 50;

// Helper function to clear the news details cache
export const clearNewsDetailsCache = () => {
  Object.keys(newsDetailsCache).forEach((key) => delete newsDetailsCache[key]);
};

// Helper function to clean expired items from the cache
const cleanExpiredCache = () => {
  const now = Date.now();
  let expired = 0;

  Object.entries(newsDetailsCache).forEach(([id, item]) => {
    if (now - item.timestamp > CACHE_TTL) {
      delete newsDetailsCache[id];
      expired++;
    }
  });
};

// Set up periodic cache cleaning (every 10 minutes)
setInterval(cleanExpiredCache, 10 * 60 * 1000);

// Helper function to trim the cache if it gets too large
const trimCache = () => {
  const cacheSize = Object.keys(newsDetailsCache).length;

  if (cacheSize > MAX_CACHE_SIZE) {
    console.log(
      `Cache size (${cacheSize}) exceeds maximum (${MAX_CACHE_SIZE}), trimming oldest entries`
    );

    // Get all cache entries with their timestamps
    const entries = Object.entries(newsDetailsCache).map(([id, entry]) => ({
      id,
      timestamp: entry.timestamp,
    }));

    // Sort by timestamp (oldest first)
    entries.sort((a, b) => a.timestamp - b.timestamp);

    // Remove oldest entries until we're back under the limit
    const entriesToRemove = entries.slice(0, cacheSize - MAX_CACHE_SIZE);
    entriesToRemove.forEach((entry) => {
      delete newsDetailsCache[entry.id];
    });
  }
};

export const authUser = async (locationData) => {
  try {
    let requestData = {};

    if (locationData) {
      requestData = locationData;
    }

    const response = await api.post("/auth", requestData);
    return response;
  } catch (error) {
    throw error;
  }
};
export const getUserDetails = async () => {
  try {
    const response = await api.get("/get-role");
    return response.data;
  } catch (error) {
    throw error;
  }
};
// Helper function to get the current auth token
export const getAuthToken = () => {
  if (typeof window === 'undefined') return null;
  const userData = localStorage.getItem("authData");
  return userData ? JSON.parse(userData).token : null;
};

// NEW FUNCTION: Check if email exists
export const checkEmailExists = async (email) => {
  try {
    const response = await api.post("/check-email-exists", { email });
    return response.data;
  } catch (error) {
    console.error("Error checking email exists:", error);
    throw error;
  }
};

// NEW OTP FUNCTIONS
// Function to send OTP to email (Updated to include name parameter)
export const sendOTP = async (email, name = null) => {
  try {
    const requestData = { email };
    if (name) {
      requestData.name = name;
    }
    const response = await api.post("/send-otp", requestData);
    return response.data;
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw error;
  }
};

// Function to verify OTP (Updated to always include name parameter)
export const verifyOTP = async (email, otp, name = null) => {
  try {
    const requestData = {
      email,
      otp,
      name: name || "", // Always include name field, even if empty
    };
    const response = await api.post("/verify-otp", requestData);
    return response.data;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    throw error;
  }
};

// Direct functions to access the new API endpoints
// These can be used if you need more explicit control over the API calls

// Function to fetch news listings directly
export const fetchNewsListings = async (country) => {
  try {
    const response = await api.post("/top-news", { country });
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const fetchRefreshNews = async (country, selectedSectors) => {
  try {
    const response = await api.post("/refresh-headlines", {
      country,
      sector: selectedSectors[0],
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const refreshGroupNews = async (group_id) => {
  try {
    const response = await api.post("/refresh-group-news", { group_id });
    return response.data;
  } catch (error) {
    throw error;
  }
};
// Function to fetch news details directly
export const fetchNewsDetails = async (id, signal) => {
  if (!id) {
    throw new Error("News ID is required to fetch details");
  }

  // Check if we already have this news item in the cache and it's not expired
  if (newsDetailsCache[id]) {
    const cachedItem = newsDetailsCache[id];
    const now = Date.now();

    // Check if the cached item is still valid (not expired)
    if (now - cachedItem.timestamp < CACHE_TTL) {
      return cachedItem.data;
    } else {
      // Remove expired item from cache
      delete newsDetailsCache[id];
    }
  }

  try {
    const response = await api.post("/get-details", { id }, { signal });
    const data = response.data;

    // Only cache the result if status is 4 or higher (complete data)
    // Don't cache status 0, 1, 2, or 3 to allow polling to continue
    if (
      data &&
      data.results &&
      data.results.length > 0 &&
      data.results[0].status >= 4
    ) {
      // Store the result in the cache with timestamp
      newsDetailsCache[id] = {
        data: data,
        timestamp: Date.now(),
      };

      // Check if we need to trim the cache
      trimCache();
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// NEW FUNCTION: Search by topic API
// Fix for API function
// export const searchByTopic = async (topic) => {
//   try {
//     const requestParams = {
//       topic: topic,
//     };

//     console.log(
//       "Sending request to with params:",
//       requestParams
//     );

//     const response = await fetch(`${API_BASE_URL}/search-by-topic`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify(requestParams),
//     });

//     if (!response.ok) {
//       console.error(`API call failed with status: ${response.status}`);
//       throw new Error(`API call failed with status: ${response.status}`);
//     }

//     const data = await response.json();
//     console.log("API raw response:", data);

//     // IMPORTANT: Transform the data to match expected format if necessary
//     // This is a critical step if your API response doesn't match what the UI expects
//     let transformedData = data;

//     // If the API doesn't return data in the expected format, transform it
//     if (data && !data.status && !data.results) {
//       // Example transformation - adjust based on actual API response
//       transformedData = {
//         status: 1,
//         results: Array.isArray(data) ? data : [data],
//       };

//       // If the results aren't properly structured, map them to the expected format
//       transformedData.results = transformedData.results.map((item) => {
//         // Ensure each item has the required fields
//         return {
//           id: item.id || `search_${Date.now()}_${Math.random()}`,
//           headline: item.headline || item.title || topic,
//           title: item.headline || item.title || topic,
//           created_at: item.created_at || new Date().toISOString(),
//           region: item.region,
//           aiengine: "search",
//           newsobj: item.newsobj || item,
//         };
//       });
//     }

//     console.log("API transformed response:", transformedData);
//     return transformedData;
//   } catch (error) {
//     console.error("Error searching by topic:", error);
//     throw error;
//   }
// };

// search headlines
export const searchHeadlines = async (topic, currentLocation, type, signal) => {
  try {
    const requestParams = {
      country: currentLocation,
    };
    if (type === "sector") {
      requestParams.keywords = topic;
    } else if (type === "query") {
      requestParams.topic = topic;
    }

    const response = await api.post("/db-search", requestParams, { signal });
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const searchNewHeadlines = async (query, country, signal) => {
  try {
    const response = await api.post(
      "/search-headlines",
      { query, country },
      { signal }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const getSectorNews = async (sector, country) => {
  try {
    const response = await api.post("/get-sector-news", { sector, country });
    return response.data;
  } catch (error) {
    throw error;
  }
};
// Function to fetch impact analysis data
export const fetchImpactAnalysis = async (params = {}) => {
  try {
    const requestParams = {
      id: params.id,
      impact: params.impact,
    };

    const response = await api.post("/get-impact-analysis", requestParams);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// NEW FUNCTION: Get news details by topic and ID
export const getNewsDetailsByTopicAndId = async (topic, id) => {
  try {
    const requestParams = {
      topic: topic,
      id: id,
    };

    const response = await api.post("/search-by-topic", requestParams);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Function to fetch sector-specific news
export const fetchSectorNews = async (sector, country) => {
  try {
    const requestParams = {
      sector: sector,
    };

    // Add country parameter if it exists
    if (country) {
      requestParams.country = country;
    }

    const response = await api.post("/fetch-sector-news", requestParams);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Function to fetch available regions
export const fetchRegions = async () => {
  try {
    const response = await api.get("/get-regions");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Function to fetch group options
export const fetchGroupOptions = async () => {
  try {
    const response = await api.get("/get-groups");

    // Transform the response to match the format expected by the UI components
    if (
      response.data &&
      response.data.groups &&
      Array.isArray(response.data.groups)
    ) {
      // Map the groups to match the format expected by the UI
      return response.data.groups.map((group) => ({
        id: group.id,
        name: group.name,
        topics: Array.isArray(group.topics)
          ? group.topics.join(", ")
          : group.topics,
        country: group.country || null, // Add country field
        ownerId: group.ownerId, // Preserve ownerId if needed
      }));
    } else {
      return [];
    }
  } catch (error) {
    return [];
  }
};

export const getGroupNews = async (id, country) => {
  try {
    const requestParams = {
      group_id: id,
      country: country,
    };
    const response = await api.post("/get-group-news", requestParams);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Function to update an existing group
export const updateGroup = async (params) => {
  try {
    const requestParams = {
      groupId: params.id,
      groupName: params.name,
      topics: params.topics,
    };

    const response = await api.put("/update-group", requestParams);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Function to delete a group
export const deleteGroup = async (groupId) => {
  try {
    const response = await api.delete("/delete-group", {
      data: { groupId },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Function to fetch sectors
export const fetchSectors = async () => {
  try {
    const response = await api.get("/get-sectors");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Function to create a new group
export const createGroup = async (params) => {
  try {
    const requestParams = {
      groupName: params.name,
      topics: params.topics,
      country: params.country,
    };

    const response = await api.post("/create-group", requestParams);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPodcast = async (id) => {
  try {
    const response = await api.post("/get-podcast", { id });
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const generatePodcast = async (id) => {
  try {
    // Use a longer timeout for podcast generation (5 minutes)
    const response = await api.post(
      "/podcast",
      { id },
      {
        timeout: 300000, // 5 minutes in milliseconds
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const discussWithAI = async (id) => {
  try {
    const response = await api.post("/discuss-with-ai", { id });
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const getSettings = async () => {
  try {
    const response = await api.get("/get-settings");
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const updateSettings = async (settingsPayload) => {
  try {
    const response = await api.post("/update-settings", settingsPayload);
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const updateSourcesSectors = async (payload) => {
  try {
    const response = await api.post("/update-sources-sectors", payload);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const chatBot = async (query, id) => {
  try {
    const response = await api.post("/chat-bot", { query, id });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const resetAnalysis = async (id) => {
  try {
    const response = await api.post("/delete-news", { id });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserSelection = async () => {
  try {
    const response = await api.get("/search-history");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createSubscription = async (planId) => {
  try {
    const response = await api.post("/create-subscription", { planId });
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const verifyPayment = async (
  razorpay_payment_id,
  razorpay_subscription_id,
  razorpay_signature
) => {
  try {
    const response = await api.post("/verify-payment", {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const userPlan = async () => {
  try {
    const response = await api.get("/user-plan");
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const cancelSubscription = async (subscription_id) => {
  try {
    const response = await api.post("/cancel-subscription", {
      subscription_id,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const downloadInvoice = async (subscription_id) => {
  try {
    const response = await api.get(`/download-invoice/${subscription_id}`, {
      responseType: "blob", // Important for downloading files
    });
    return response;
  } catch (error) {
    throw error;
  }
};

// ==================== NEW SEARCH HISTORY FUNCTIONS ====================

export const getUserSearchHistory = async (limit = 10, offset = 0) => {
  try {
    const response = await api.get(
      `/user-search-history?limit=${limit}&offset=${offset}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching user search history:", error);
    throw error;
  }
};
// Function to validate history item data
export const validateHistoryItem = (item) => {
  if (!item) {
    return {
      valid: false,
      error: "Invalid history item",
      cleanedItem: null,
    };
  }

  if (
    !item.topic ||
    typeof item.topic !== "string" ||
    item.topic.trim() === ""
  ) {
    return {
      valid: false,
      error: "Invalid search topic",
      cleanedItem: null,
    };
  }

  // Clean and validate the item
  const cleanedItem = {
    id: item.id || `cleaned_${Date.now()}`,
    topic: item.topic.trim(),
    created_at: item.created_at || new Date().toISOString(),
    news_count: item.news_count || 0,
    category: item.category || "General",
    impactScore: item.impactScore || 1,
  };

  return {
    valid: true,
    error: null,
    cleanedItem,
  };
};

// Function to search for details of a history item
// export const searchHistoryDetails = async (historyItem, options = {}) => {
//   try {
//     const {
//       preferredSource = "database",
//       fallbackEnabled = true,
//       limit = 20,
//       region,
//     } = options;

//     console.log(`Searching simultaneously for: ${historyItem.topic}`);

//     // Start both API calls simultaneously
//     const headlinesPromise = searchNewHeadlines(historyItem.topic, region);
//     const dbPromise = searchHeadlines(historyItem.topic, region, "query");

//     let dbData = null;
//     let hasDbData = false;
//     let dbError = null;

//     // Wait for database API first (this is our priority for navigation)
//     try {
//       console.log("Waiting for database API (searchHeadlines)...");
//       const dbResponse = await dbPromise;
//       if (
//         dbResponse &&
//         (dbResponse.status === 1 || dbResponse.status === 2) &&
//         dbResponse.results &&
//         dbResponse.results.length > 0
//       ) {
//         dbData = dbResponse.results;
//         hasDbData = true;
//         console.log(
//           `Database API completed! Returned ${dbData.length} results`
//         );
//       }
//     } catch (error) {
//       console.log("Database search failed:", error.message);
//       dbError = error;
//     }

//     // If we have database data, return immediately for navigation
//     if (hasDbData) {
//       console.log("Database search completed, returning early for navigation");

//       // Continue headlines API in background and update later if needed
//       headlinesPromise
//         .then((headlinesResponse) => {
//           if (
//             headlinesResponse &&
//             (headlinesResponse.status === 1 ||
//               headlinesResponse.status === 2) &&
//             headlinesResponse.results &&
//             headlinesResponse.results.length > 0
//           ) {
//             console.log(
//               `Headlines API completed later with ${headlinesResponse.results.length} results`
//             );
//           } else {
//             console.log("Headlines API completed but returned no results");
//           }
//         })
//         .catch((error) => {
//           console.log("Headlines search failed:", error.message);
//         });

//       return {
//         success: true,
//         data: dbData,
//         source: "database",
//         count: dbData.length,
//         hasDbData: true,
//         hasHeadlinesData: false, // We don't wait for this
//         dbCount: dbData.length,
//         headlinesCount: 0,
//       };
//     }

//     // If no database data, wait for headlines API as fallback
//     let headlinesData = null;
//     let hasHeadlinesData = false;
//     let headlinesError = null;

//     try {
//       console.log("No database data, waiting for headlines API...");
//       const headlinesResponse = await headlinesPromise;
//       if (
//         headlinesResponse &&
//         (headlinesResponse.status === 1 || headlinesResponse.status === 2) &&
//         headlinesResponse.results &&
//         headlinesResponse.results.length > 0
//       ) {
//         headlinesData = headlinesResponse.results;
//         hasHeadlinesData = true;
//         console.log(`Headlines API returned ${headlinesData.length} results`);
//       }
//     } catch (error) {
//       console.log("Headlines search failed:", error.message);
//       headlinesError = error;
//     }

//     // Return headlines data if available
//     if (hasHeadlinesData) {
//       return {
//         success: true,
//         data: headlinesData,
//         source: "headlines",
//         count: headlinesData.length,
//         hasDbData: false,
//         hasHeadlinesData: true,
//         dbCount: 0,
//         headlinesCount: headlinesData.length,
//       };
//     }

//     // If both failed, return error

//     return {
//       success: false,
//       error: `No current news found for "${historyItem.topic}". ${
//         (dbError && dbError.message) ||
//         (headlinesError && headlinesError.message) ||
//         "Please try a different search term."
//       }`,
//       data: [],
//       source: null,
//       count: 0,
//       hasDbData: false,
//       hasHeadlinesData: false,
//       dbCount: 0,
//       headlinesCount: 0,
//     };
//   } catch (error) {
//     console.error("Error in searchHistoryDetails:", error);
//     return {
//       success: false,
//       error: error.message,
//       data: [],
//       source: null,
//       count: 0,
//       hasDbData: false,
//       hasHeadlinesData: false,
//       dbCount: 0,
//       headlinesCount: 0,
//     };
//   }
// };

// Function to format search results for display in NewsIntelligence
// export const formatSearchResultsForDisplay = (
//   searchData,
//   searchTopic,
//   historyItem,
//   searchResult = {}
// ) => {
//   try {
//     if (!Array.isArray(searchData) || searchData.length === 0) {
//       return [];
//     }

//     // Get counts to determine which data came from which source
//     const headlinesCount = searchResult.headlinesCount || 0;
//     const dbCount = searchResult.dbCount || 0;

//     return searchData.map((news, index) => {
//       // Determine if this item came from headlines or database
//       // Headlines data comes first in the combined array
//       const isFromHeadlines = index < headlinesCount;

//       return {
//         id: news.id || `history_${historyItem.id}_${index}`,
//         title: news.headline || news.title || "Untitled News",
//         headline: news.headline || news.title || "",
//         aiengine: news.aiengine || "search",
//         created_at: news.created_at || new Date().toISOString(),
//         region: news.region || "Global",
//         newsobj: news.newsobj || news,
//         // Add metadata to indicate this came from search history
//         fromHistory: true,
//         originalSearchTopic: searchTopic,
//         historyItemId: historyItem.id,
//         // Add source information
//         dataSource: isFromHeadlines ? "headlines" : "database",
//         searchSource: isFromHeadlines
//           ? "searchNewHeadlines"
//           : "searchHeadlines",
//       };
//     });
//   } catch (error) {
//     console.error("Error formatting search results:", error);
//     return [];
//   }
// };

// // Function to get search history statistics
// export const getSearchHistoryStats = async () => {
//   try {
//     // This could be a separate API endpoint in the future
//     // For now, we can calculate stats from the search history
//     const historyResponse = await getUserSearchHistory();

//     if (historyResponse.status === 1 && historyResponse.results) {
//       const history = historyResponse.results;

//       const stats = {
//         totalSearches: history.length,
//         totalArticles: history.reduce(
//           (sum, item) => sum + (item.news_count || 0),
//           0
//         ),
//         avgArticlesPerSearch:
//           history.length > 0
//             ? Math.round(
//                 history.reduce((sum, item) => sum + (item.news_count || 0), 0) /
//                   history.length
//               )
//             : 0,
//         mostRecentSearch:
//           history.length > 0
//             ? new Date(
//                 Math.max(...history.map((item) => new Date(item.created_at)))
//               )
//             : null,
//         topCategories: getTopCategories(history),
//       };

//       return {
//         success: true,
//         stats,
//       };
//     }

//     return {
//       success: false,
//       stats: null,
//     };
//   } catch (error) {
//     console.error("Error getting search history stats:", error);
//     return {
//       success: false,
//       stats: null,
//       error: error.message,
//     };
//   }
// };

// Helper function to get top categories from history
// const getTopCategories = (history) => {
//   const categoryCounts = {};

//   history.forEach((item) => {
//     const category = item.category || "General";
//     categoryCounts[category] = (categoryCounts[category] || 0) + 1;
//   });

//   return Object.entries(categoryCounts)
//     .sort(([, a], [, b]) => b - a)
//     .slice(0, 5)
//     .map(([category, count]) => ({ category, count }));
// };

// export const userDashboard = async (
//   offset = 0,
//   limit = 10,
//   plan = null,
//   search = null,
//   source = null
// ) => {
//   try {
//     let url = `/dashboard?offset=${offset}&limit=${limit}`;
//     if (plan) {
//       url += `&plan=${plan}`;
//     }
//     if (search && search.trim() !== "") {
//       url += `&search=${encodeURIComponent(search.trim())}`;
//     }
//     if (source && source !== "all") {
//       url += `&source=${encodeURIComponent(source)}`;
//     }
//     const response = await api.get(url);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };

// ==================== NEW ADMIN DASHBOARD API FUNCTIONS ====================

// User Details API function (for admin dashboard)
export const getUserDetailsById = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// NEW: Get platform summary API function
export const getPlatformSummary = async () => {
  try {
    const response = await api.get("/platform-summary");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ==================== NEW SEARCH ANALYTICS API FUNCTIONS ====================

// Get search analytics data - UPDATED with pagination and filter support
export const getSearchAnalytics = async (
  days = null,
  userId = null,
  offset = 0,
  limit = 10,
  search = null,
  source = null
) => {
  try {
    let url = `/search-analytics`;
    const params = new URLSearchParams();

    if (days) {
      params.append("days", days);
    }
    if (userId) {
      params.append("user_id", userId);
    }
    // Add pagination parameters
    params.append("offset", offset);
    params.append("limit", limit);

    // Add search parameters
    if (search && search.trim() !== "") {
      params.append("search", search.trim());
    }
    if (source && source !== "all") {
      params.append("source", source);
    }

    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    console.log(`Making search analytics request to: ${url}`);
    const response = await api.get(url);
    console.log("Search analytics raw response:", response.data);

    // Validate response structure
    if (!response.data) {
      throw new Error("No data received from search analytics API");
    }

    if (!response.data.results || !Array.isArray(response.data.results)) {
      console.warn(
        "Search analytics response missing results array:",
        response.data
      );
      // Return empty results with proper structure
      return {
        results: [],
        pagination: {
          offset: offset,
          limit: limit,
          totalCount: 0,
          totalItems: 0,
        },
        summary: response.data.summary || {},
      };
    }

    return response.data;
  } catch (error) {
    console.error("Search analytics API error:", error);
    throw error;
  }
};

// Enhanced getUsers function with status parameter
export const getUsersWithFilters = async (
  offset = 0,
  limit = 10,
  plan = null,
  search = null,
  source = null,
  status = null
) => {
  try {
    let url = `/users?offset=${offset}&limit=${limit}`;
    if (plan) {
      url += `&plan=${plan}`;
    }
    if (search && search.trim() !== "") {
      url += `&search=${encodeURIComponent(search.trim())}`;
    }
    if (source && source !== "all") {
      url += `&source=${encodeURIComponent(source)}`;
    }
    if (status) {
      url += `&status=${status}`;
    }

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Users API error:", error);
    throw error;
  }
};

// ==================== PUSH NOTIFICATION API FUNCTIONS ====================

export const globalSubscribe = async (fcmToken, deviceId) => {
  try {
    const response = await api.post("/subscribe-global", {
      token: fcmToken,
      device_id: deviceId,
    });
    return response.data;
  } catch (error) {
    console.error("Error subscribing to global:", error);
    throw error;
  }
};

// Subscribe to push notifications for a specific topic/group
export const subscribeToTopic = async (fcmToken, groupId) => {
  try {
    const response = await api.post("/subscribe-topic", {
      token: fcmToken,
      group_id: groupId,
    });
    return response.data;
  } catch (error) {
    console.error("Error subscribing to topic:", error);
    throw error;
  }
};

// Unsubscribe from push notifications for a specific topic/group
export const unsubscribeFromTopic = async (fcmToken, groupId) => {
  try {
    const response = await api.post("/unsubscribe-topic", {
      token: fcmToken,
      group_id: groupId,
    });
    return response.data;
  } catch (error) {
    console.error("Error unsubscribing from topic:", error);
    throw error;
  }
};

// ==================== NOTIFICATIONS HISTORY API FUNCTIONS ====================

// Function to fetch notifications history
export const getNotificationsHistory = async () => {
  try {
    const response = await api.get(`/notifications-history`);
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications history:", error);
    throw error;
  }
};

// Function to mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    let params = {};
    if (notificationId === true) {
      params.mark_all = true;
    } else {
      params.notification_id = Number(notificationId);
    }
    const response = await api.post("/mark-notification-read", params);
    return response.data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

// Function to mark all notifications as read
// export const markAllNotificationsAsRead = async () => {
//   try {
//     const response = await api.post("/mark-all-notifications-read");
//     return response.data;
//   } catch (error) {
//     console.error("Error marking all notifications as read:", error);
//     throw error;
//   }
// };

// Function to delete a notification
export const deleteNotificationById = async (notificationId) => {
  try {
    const response = await api.post("/delete-notification", {
      notification_id: Number(notificationId),
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};

export const invoiceList = async () => {
  try {
    const response = await api.get("/invoices");
    return response.data;
  } catch (error) {
    throw error;
  }
};
