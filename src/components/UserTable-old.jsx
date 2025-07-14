import React from "react";
import {
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  CreditCard,
  Activity,
  User,
  Calendar,
  Clock,
  Zap,
  Shield,
  TrendingUp,
} from "lucide-react";
import {
  setCurrentPage,
  setPageSize,
} from "../store/slice/adminDashboardSlice";

const UserTable = ({
  userData,
  pagination,
  searchTerm,
  selectedUser,
  selectedUserDetails,
  loadingUserDetails,
  onUserClick,
  onCloseDrawer,
  dispatch,
}) => {
  const transformPlan = (planId) => {
    if (!planId) return "free";
    if (planId === "ent") return "ent";
    else if (planId === "pro") return "pro";
    else return "free";
  };

  const getPlanStyles = (plan) => {
    switch (plan) {
      case "ent":
        return "bg-purple-500/20 text-purple-300 border border-purple-500/30";
      case "pro":
        return "bg-blue-500/20 text-blue-300 border border-blue-500/30";
      default:
        return "bg-green-500/20 text-green-300 border border-green-500/30";
    }
  };

  const getStatusStyles = (status) => {
    return status === "active"
      ? "bg-green-500/20 text-green-300 border border-green-500/30"
      : "bg-red-500/20 text-red-300 border border-red-500/30";
  };

  const getSourceStyles = (source) => {
    return "bg-gray-500/20 text-gray-300 border border-gray-500/30";
  };

  // Pagination handlers
  const handlePageChange = (newPage) => {
    dispatch(setCurrentPage(newPage));
  };

  const handlePageSizeChange = (newPageSize) => {
    dispatch(setPageSize(newPageSize));
  };

  const handlePreviousPage = () => {
    if (pagination.currentPage > 1) {
      dispatch(setCurrentPage(pagination.currentPage - 1));
    }
  };

  const handleNextPage = () => {
    if (pagination.currentPage < pagination.totalPages) {
      dispatch(setCurrentPage(pagination.currentPage + 1));
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (pagination.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= pagination.totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (pagination.currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(pagination.totalPages);
      } else if (pagination.currentPage >= pagination.totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (
          let i = pagination.totalPages - 3;
          i <= pagination.totalPages;
          i++
        ) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (
          let i = pagination.currentPage - 1;
          i <= pagination.currentPage + 1;
          i++
        ) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(pagination.totalPages);
      }
    }

    return pages;
  };

  return (
    <>
      {/* User Table */}
      <div className="bg-gray-800/30 backdrop-blur border border-gray-700/50 rounded-xl overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-4 border-b border-gray-700/50 bg-gray-800/50">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">
                  User Management
                </h3>
              </div>
              {searchTerm && (
                <div className="flex items-center space-x-2">
                  <div className="bg-blue-500/20 border border-blue-500/30 text-blue-300 px-3 py-1 rounded-lg text-xs font-medium">
                    Search: "{searchTerm}"
                  </div>
                  <button
                    onClick={() => setSearchTerm("")}
                    className="text-gray-400 hover:text-gray-200 transition-colors"
                    title="Clear search"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="text-sm text-gray-400 font-medium">
              {searchTerm ? (
                <>Showing {pagination.totalItems} search results</>
              ) : (
                <>
                  Page {pagination.currentPage} of {pagination.totalPages} •{" "}
                  {pagination.totalItems} total users
                </>
              )}
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Today
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  7 Days
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Signup Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                  Last Active
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {userData?.map((user, index) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-700/30 cursor-pointer transition-colors group"
                  onClick={() => onUserClick(user)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-semibold">
                        {user.email?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-medium rounded-lg ${getSourceStyles(
                        user.source
                      )}`}
                    >
                      {user.source === null ? "Website" : user.source}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-medium rounded-lg ${getPlanStyles(
                        user.plan
                      )}`}
                    >
                      {user.plan.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-medium rounded-lg ${getStatusStyles(
                        user.status
                      )}`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                    {user.todaySearches}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                    {user.sevenDaySearches}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                    {user.totalSearches}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {user.signupDate
                      ? new Date(user.signupDate).toLocaleDateString()
                      : "Not available"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {user.lastActive
                      ? new Date(user.lastActive).toLocaleDateString()
                      : "Not available"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {/* Pagination Controls */}
        {pagination.totalItems > 0 && (
          <div className="px-6 py-4 border-t border-gray-700/50 bg-gray-800/30">
            <div className="flex items-center justify-between flex-wrap gap-4">
              {/* Items per page selector */}
              <div className="flex items-center space-x-3 text-sm text-gray-400">
                <span className="font-medium">Show:</span>
                <select
                  value={pagination.pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              <div className="text-sm text-gray-400 font-medium">
                Showing {(pagination.currentPage - 1) * pagination.pageSize + 1}{" "}
                to{" "}
                {Math.min(
                  pagination.currentPage * pagination.pageSize,
                  pagination.totalItems
                )}{" "}
                of {pagination.totalItems} users
              </div>

              {/* Pagination controls */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center space-x-2">
                  {/* Previous button */}
                  <button
                    onClick={handlePreviousPage}
                    disabled={pagination.currentPage === 1}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  {/* Page numbers */}
                  <div className="flex items-center space-x-1">
                    {getPageNumbers().map((page, index) => (
                      <span key={index}>
                        {page === "..." ? (
                          <span className="px-3 py-2 text-gray-400 text-sm">
                            ...
                          </span>
                        ) : (
                          <button
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-2 border rounded-lg text-sm min-w-[40px] transition-colors ${
                              pagination.currentPage === page
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
                            }`}
                          >
                            {page}
                          </button>
                        )}
                      </span>
                    ))}
                  </div>

                  {/* Next button */}
                  <button
                    onClick={handleNextPage}
                    disabled={pagination.currentPage === pagination.totalPages}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg text-sm text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* User Details Drawer */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-end z-50">
          <div className="bg-gray-900/95 backdrop-blur h-full w-96 shadow-2xl overflow-y-auto border-l border-gray-700/50">
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold">
                    {(selectedUserDetails?.email || selectedUser.email)
                      ?.charAt(0)
                      .toUpperCase() || "U"}
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    User Details
                  </h3>
                </div>
                <button
                  onClick={onCloseDrawer}
                  className="text-gray-400 hover:text-gray-200 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* User Info Card */}
              <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-5 space-y-4">
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-blue-400" />
                  <h4 className="font-semibold text-white">
                    Profile Information
                  </h4>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                      Email Address
                    </p>
                    <p className="text-white font-medium">
                      {selectedUserDetails?.email || selectedUser.email}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                        Source
                      </p>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-lg ${getSourceStyles()}`}
                      >
                        {selectedUserDetails?.source ||
                          selectedUser.source ||
                          "Website"}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                        Status
                      </p>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-lg ${getStatusStyles(
                          selectedUserDetails?.status || selectedUser.status
                        )}`}
                      >
                        {selectedUserDetails?.status || selectedUser.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                        Signup Date
                      </p>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-white text-sm">
                          {selectedUserDetails?.signupDate ||
                          selectedUser.signupDate
                            ? new Date(
                                selectedUserDetails?.signupDate ||
                                  selectedUser.signupDate
                              ).toLocaleDateString()
                            : "Not available"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                        Last Active
                      </p>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-white text-sm">
                          {selectedUserDetails?.lastActive ||
                          selectedUser.lastActive
                            ? new Date(
                                selectedUserDetails?.lastActive ||
                                  selectedUser.lastActive
                              ).toLocaleDateString()
                            : "Not available"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subscription Card */}
              <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-5 space-y-4">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-5 h-5 text-purple-400" />
                  <h4 className="font-semibold text-white">Subscription</h4>
                </div>

                {loadingUserDetails ? (
                  <div className="flex items-center space-x-3 py-4">
                    <RefreshCw className="w-4 h-4 text-gray-400 animate-spin" />
                    <span className="text-sm text-gray-300">
                      Loading subscription details...
                    </span>
                  </div>
                ) : selectedUserDetails?.subscription ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Plan</span>
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-lg ${getPlanStyles(
                          transformPlan(selectedUserDetails.subscription.plan)
                        )}`}
                      >
                        {transformPlan(
                          selectedUserDetails.subscription.plan
                        ).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Description</p>
                      <p className="text-white text-sm">
                        {selectedUserDetails.subscription.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-400">
                        {selectedUserDetails.subscription.pricing}
                      </span>
                      <span className="text-xs text-green-400">
                        {selectedUserDetails.subscription.status}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Plan</span>
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-lg ${getPlanStyles(
                          selectedUser.plan
                        )}`}
                      >
                        {selectedUser.plan.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">
                      {selectedUser.plan === "free" &&
                        "Free tier - 10 searches per hour"}
                      {selectedUser.plan === "pro" &&
                        "Pro plan - 50 searches per hour"}
                      {selectedUser.plan === "ent" &&
                        "Enterprise plan - 100 searches per hour"}
                    </p>
                  </div>
                )}
              </div>

              {/* Usage Statistics */}
              <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-5 space-y-4">
                <div className="flex items-center space-x-3">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <h4 className="font-semibold text-white">Usage Statistics</h4>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-green-400">
                      {selectedUserDetails?.usage?.todaySearches ??
                        selectedUser.todaySearches}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Today</div>
                  </div>
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-blue-400">
                      {selectedUserDetails?.usage?.sevenDaySearches ??
                        selectedUser.sevenDaySearches}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">7 Days</div>
                  </div>
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 text-center">
                    <div className="text-lg font-bold text-purple-400">
                      {selectedUserDetails?.usage?.totalSearches ??
                        selectedUser.totalSearches}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">Total</div>
                  </div>
                </div>
              </div>

              {/* Search History */}
              <div className="bg-gray-800/50 backdrop-blur border border-gray-700/50 rounded-xl p-5 space-y-4">
                <div className="flex items-center space-x-3">
                  <Search className="w-5 h-5 text-orange-400" />
                  <h4 className="font-semibold text-white">Recent Searches</h4>
                </div>

                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {loadingUserDetails ? (
                    <div className="flex flex-col items-center justify-center py-8">
                      <RefreshCw className="w-6 h-6 text-gray-400 animate-spin mb-3" />
                      <p className="text-sm text-gray-400">
                        Loading search history...
                      </p>
                    </div>
                  ) : selectedUserDetails?.recentSearches &&
                    selectedUserDetails.recentSearches.length > 0 ? (
                    selectedUserDetails.recentSearches.map((search, index) => (
                      <div
                        key={index}
                        className="bg-gray-700/50 border border-gray-600/50 rounded-lg p-3"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium text-white truncate flex-1 mr-2">
                            {search.query}
                          </span>
                          <span className="text-xs text-blue-400 whitespace-nowrap bg-blue-500/10 px-2 py-1 rounded">
                            {search.resultCount} results
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>
                            {new Date(search.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Search className="w-8 h-8 text-gray-600 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-400 mb-1">
                        No Search History
                      </p>
                      <p className="text-xs text-gray-500">
                        {selectedUserDetails
                          ? "This user hasn't performed any searches yet"
                          : "Click refresh to load detailed search history"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserTable;
