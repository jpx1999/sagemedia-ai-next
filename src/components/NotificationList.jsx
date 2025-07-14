import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Trash2,
  Settings,
  Circle,
  Eye,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Info,
  CheckCircle,
} from "lucide-react";

const NotificationList = ({
  darkMode = false,
  onNotificationClick,
  className = "",
  style = {},
  useCustomIcon = false,
  customIcon = null,
  // Props passed from Header component
  notifications = [],
  loading = false,
  totalCount = 0,
  unreadCount = 0,
  hasMore = true,
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onLoadMore,
  partialAccess = false,
  onLoginRequired,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState("unread"); // 'unread', 'read'
  const [showingAll, setShowingAll] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [animatingItems, setAnimatingItems] = useState(new Set());
  const dropdownRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Add fade-in animation for new items when notifications change
  useEffect(() => {
    if (notifications.length > 0 && isOpen) {
      const allItemIds = new Set(notifications.map((n) => n.id));
      setAnimatingItems(allItemIds);

      setTimeout(() => {
        setAnimatingItems(new Set());
      }, 500);
    }
  }, [notifications, isOpen]);

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    if (partialAccess && onLoginRequired) {
      onLoginRequired();
      return;
    }
    if (onMarkAsRead) {
      await onMarkAsRead(notificationId);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    if (partialAccess && onLoginRequired) {
      onLoginRequired();
      return;
    }

    if (onMarkAllAsRead) {
      await onMarkAllAsRead();
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    if (partialAccess && onLoginRequired) {
      onLoginRequired();
      return;
    }

    if (onDeleteNotification) {
      await onDeleteNotification(notificationId);
    }
  };

  // View all notifications
  const viewAllNotifications = async () => {
    if (partialAccess && onLoginRequired) {
      onLoginRequired();
      return;
    }

    if (!showingAll && hasMore && onLoadMore) {
      setShowingAll(true);
      setLoadingMore(true);
      try {
        await onLoadMore();
      } finally {
        setLoadingMore(false);
      }
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") return !notification.isRead;
    if (filter === "read") return notification.isRead;
    return true;
  });

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Get notification type styles and icon
  const getNotificationTypeConfig = (type) => {
    const baseStyles = "w-3 h-3 rounded-full flex-shrink-0";
    const iconBaseStyles = "w-4 h-4 flex-shrink-0";

    switch (type) {
      case "urgent":
        return {
          dotStyles: `${baseStyles} bg-red-500`,
          icon: <AlertTriangle className={`${iconBaseStyles} text-red-500`} />,
          bgColor: darkMode ? "bg-red-900/20" : "bg-red-50",
        };
      case "warning":
        return {
          dotStyles: `${baseStyles} bg-yellow-500`,
          icon: (
            <AlertTriangle className={`${iconBaseStyles} text-yellow-500`} />
          ),
          bgColor: darkMode ? "bg-yellow-900/20" : "bg-yellow-50",
        };
      case "success":
        return {
          dotStyles: `${baseStyles} bg-green-500`,
          icon: <CheckCircle className={`${iconBaseStyles} text-green-500`} />,
          bgColor: darkMode ? "bg-green-900/20" : "bg-green-50",
        };
      case "info":
      default:
        return {
          dotStyles: `${baseStyles} bg-[#111]`,
          icon: <Info className={`${iconBaseStyles} text-blue-500`} />,
          bgColor: darkMode ? "bg-[#111]" : "bg-blue-50",
        };
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    if (partialAccess && onLoginRequired) {
      onLoginRequired();
      return;
    }

    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    if (onNotificationClick) {
      onNotificationClick(notification);
    }

    // Close dropdown after click
    setIsOpen(false);
  };

  // Toggle notification dropdown
  const toggleNotifications = (e) => {
    e.stopPropagation();

    if (partialAccess && onLoginRequired) {
      onLoginRequired();
      return;
    }

    setIsOpen(!isOpen);
  };

  return (
    <div className={`relative ${className}`} style={style} ref={dropdownRef}>
      {/* Notification Icon Button */}
      <div
        onClick={toggleNotifications}
        className="cursor-pointer relative flex items-center justify-center h-full transition-transform hover:scale-105"
        style={{
          opacity: partialAccess ? 0.7 : 1,
          cursor: partialAccess ? "not-allowed" : "pointer",
        }}
      >
        {useCustomIcon && customIcon ? (
          customIcon
        ) : (
          <Bell
            size={20}
            className={`transition-colors ${
              darkMode
                ? "text-white hover:text-blue-300"
                : "text-black hover:text-blue-600"
            }`}
          />
        )}

        {/* Unread count badge */}
        {unreadCount > 0 && !partialAccess && (
          <span
            className="absolute -top-0.5 -right-2.5 bg-red-500 text-white rounded-full min-w-[18px] h-[18px] text-[10px] flex items-center justify-center font-bold animate-pulse"
            style={{
              fontSize: "10px",
              lineHeight: "1",
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </div>

      {/* Notification Dropdown */}
      {isOpen && !partialAccess && (
        <div
          className={`absolute right-0 top-full mt-2 w-96 rounded-lg shadow-xl border z-50 transition-all duration-300 ease-out transform origin-top-right scale-100 opacity-100 ${
            darkMode
              ? "bg-black border-gray-700 shadow-gray-900/50"
              : "bg-white border-gray-200 shadow-gray-200/50"
          }`}
          style={{
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          {/* Header */}
          <div
            className={`px-4 py-3 border-b ${
              darkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <h3
                className={`font-semibold text-lg flex items-center gap-2 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                <Bell size={18} />
                Notifications
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className={`p-1.5 rounded-lg transition-all duration-200 hover:scale-110 ${
                  darkMode
                    ? "hover:bg-gray-800 text-gray-400 hover:text-white"
                    : "hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                }`}
              >
                <X size={16} />
              </button>
            </div>

            {/* Stats and Actions */}
            <div className="flex items-center justify-between mt-2">
              <span
                className={`text-sm flex items-center gap-1 ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                <Circle size={4} className="fill-current" />
                {totalCount} total • {unreadCount} unread
              </span>

              {unreadCount > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markAllAsRead();
                  }}
                  className={`text-sm font-medium transition-all duration-200 hover:scale-105 flex items-center gap-1 ${
                    darkMode
                      ? "text-blue-400 hover:text-blue-300"
                      : "text-blue-600 hover:text-blue-500"
                  }`}
                >
                  <CheckCheck size={14} />
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div
            className={`px-4 py-2 border-b ${
              darkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div className="flex gap-4">
              {["unread", "read"].map((filterType) => {
                const readCount = totalCount - unreadCount;
                let count = 0;

                if (filterType === "unread") count = unreadCount;
                else if (filterType === "read") count = readCount;

                return (
                  <button
                    key={filterType}
                    onClick={() => setFilter(filterType)}
                    className={`text-sm font-medium pb-2 border-b-2 transition-all duration-200 capitalize ${
                      filter === filterType
                        ? darkMode
                          ? "border-blue-400 text-blue-400"
                          : "border-blue-600 text-blue-600"
                        : darkMode
                        ? "border-transparent text-gray-400 hover:text-gray-300"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {filterType}
                    {count > 0 && (
                      <span className="ml-1 text-xs opacity-75">({count})</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading && filteredNotifications.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <div className="relative">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <div className="absolute inset-0 animate-ping rounded-full h-8 w-8 border border-blue-500 opacity-25"></div>
                </div>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="text-center py-8">
                <div
                  className={`mx-auto mb-3 p-3 rounded-full w-fit ${
                    darkMode ? "bg-gray-800" : "bg-gray-100"
                  }`}
                >
                  <Bell
                    size={24}
                    className={darkMode ? "text-gray-600" : "text-gray-400"}
                  />
                </div>
                <p
                  className={`text-sm font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {`No ${filter} notifications`}
                </p>
                <p
                  className={`text-xs mt-1 ${
                    darkMode ? "text-gray-500" : "text-gray-500"
                  }`}
                >
                  We'll notify you when something important happens
                </p>
              </div>
            ) : (
              <>
                {filteredNotifications.map((notification) => {
                  const typeConfig = getNotificationTypeConfig(
                    notification.type
                  );
                  const isAnimating = animatingItems.has(notification.id);

                  return (
                    <div
                      key={notification.id}
                      className={`group px-4 py-3 border-b transition-all duration-300 cursor-pointer relative overflow-hidden ${
                        darkMode ? "border-gray-700" : "border-gray-200"
                      } ${
                        !notification.isRead
                          ? typeConfig.bgColor
                          : darkMode
                          ? "hover:bg-gray-800"
                          : "hover:bg-gray-50"
                      } ${isAnimating ? "animate-fadeIn" : ""}`}
                      onClick={() => handleNotificationClick(notification)}
                      style={{
                        animationDelay: isAnimating
                          ? `${Math.random() * 0.2}s`
                          : "0s",
                      }}
                    >
                      <div className="flex items-start gap-3">
                        {/* Notification Type Icon */}
                        <div className="mt-0.5">{typeConfig.icon}</div>

                        {/* Notification Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h4
                              className={`font-medium text-sm leading-tight ${
                                darkMode ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {notification.title}
                            </h4>

                            {/* Unread indicator */}
                            {!notification.isRead && (
                              <Circle
                                size={8}
                                className="text-blue-500 fill-current flex-shrink-0 mt-1 ml-2"
                              />
                            )}
                          </div>

                          <p
                            className={`text-sm mt-1 leading-relaxed ${
                              darkMode ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {notification.message}
                          </p>

                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs flex items-center gap-1 ${
                                  darkMode ? "text-gray-500" : "text-gray-500"
                                }`}
                              >
                                <Calendar size={10} />
                                {formatTimestamp(notification.timestamp)}
                              </span>
                              {notification.topic && (
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full ${
                                    darkMode
                                      ? "bg-gray-700 text-gray-300"
                                      : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {notification.topic.toUpperCase()}
                                </span>
                              )}
                            </div>

                            {/* Action Buttons */}
                            {/* <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              {!notification.isRead && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    markAsRead(notification.id);
                                  }}
                                  className={`p-1.5 rounded transition-all duration-200 hover:scale-110 ${
                                    darkMode
                                      ? "hover:bg-gray-700 text-gray-400 hover:text-green-400"
                                      : "hover:bg-gray-200 text-gray-500 hover:text-green-600"
                                  }`}
                                  title="Mark as read"
                                >
                                  <Check size={12} />
                                </button>
                              )}

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className={`p-1.5 rounded transition-all duration-200 hover:scale-110 ${
                                  darkMode
                                    ? "hover:bg-gray-700 text-gray-400 hover:text-red-400"
                                    : "hover:bg-gray-200 text-gray-500 hover:text-red-500"
                                }`}
                                title="Delete notification"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div> */}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Load More Button */}
                {/* {!showingAll &&
                  filteredNotifications.length >= 10 &&
                  hasMore && (
                    <div className="p-4">
                      <button
                        onClick={viewAllNotifications}
                        disabled={loadingMore}
                        className={`w-full text-sm font-medium py-3 rounded-lg transition-all duration-200 hover:scale-[1.02] flex items-center justify-center gap-2 ${
                          darkMode
                            ? "text-blue-400 hover:bg-gray-800 border border-gray-700 hover:border-blue-500"
                            : "text-blue-600 hover:bg-blue-50 border border-gray-200 hover:border-blue-300"
                        } ${
                          loadingMore ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        {loadingMore ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                            Loading more...
                          </>
                        ) : (
                          <>
                            <Eye size={14} />
                            View All Notifications
                          </>
                        )}
                      </button>
                    </div>
                  )} */}
              </>
            )}
          </div>

          {/* Footer */}
          {/* {totalCount > 0 && (
            <div
              className={`px-4 py-3 border-t ${
                darkMode ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <button
                onClick={() => {
                  setIsOpen(false);
                  // Navigate to notifications page or settings
                }}
                className={`w-full text-sm font-medium py-2 rounded-lg transition-all duration-200 hover:scale-[1.02] flex items-center justify-center gap-2 ${
                  darkMode
                    ? "text-blue-400 hover:bg-gray-800"
                    : "text-blue-600 hover:bg-gray-100"
                }`}
              >
                <Settings size={14} />
                Notification Settings
              </button>
            </div>
          )} */}
        </div>
      )}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        /* Smooth scrollbar */
        .max-h-96::-webkit-scrollbar {
          width: 6px;
        }
        .max-h-96::-webkit-scrollbar-track {
          background: ${darkMode ? "#374151" : "#f1f5f9"};
          border-radius: 3px;
        }
        .max-h-96::-webkit-scrollbar-thumb {
          background: ${darkMode ? "#6b7280" : "#cbd5e1"};
          border-radius: 3px;
        }
        .max-h-96::-webkit-scrollbar-thumb:hover {
          background: ${darkMode ? "#9ca3af" : "#94a3b8"};
        }
      `}</style>
    </div>
  );
};

export default NotificationList;
