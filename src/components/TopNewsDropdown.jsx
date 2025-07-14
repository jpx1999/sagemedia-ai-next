import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faPencil,
  faTrash,
  faCheck,
  faTimes,
  faSpinner,
  faBell,
  faBellSlash,
} from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import { Toaster, toast } from "react-hot-toast";
import notificationService from "../utils/notificationService";
import { unsubscribeFromTopic, globalSubscribe } from "../helpers/api";
import { useDispatch } from "react-redux";
import { incrementNotificationRefreshTrigger } from "../store/slice/newsDetailsSlice";

// Top News dropdown component with updated modal styling
const TopNewsDropdown = ({
  selectedOption,
  setSelectedOption,
  menuVisible,
  setMenuVisible,
  groupOptions,
  onEditGroup,
  onDeleteGroup,
  className,
}) => {
  // State for edit/delete functionality
  const [editMode, setEditMode] = useState(false);
  const [editGroupId, setEditGroupId] = useState(null);
  const [editGroupName, setEditGroupName] = useState("");
  const [editGroupTopics, setEditGroupTopics] = useState([]);
  const [topicInput, setTopicInput] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteGroupId, setDeleteGroupId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State for notification subscription
  const [subscribedGroups, setSubscribedGroups] = useState({});
  const [subscribingGroups, setSubscribingGroups] = useState(new Set());

  // Animation states
  const [isEditClosing, setIsEditClosing] = useState(false);
  const [isDeleteClosing, setIsDeleteClosing] = useState(false);

  // Reference for dropdown menu and topic container
  const dropdownRef = useRef(null);
  const topicContainerRef = useRef(null);

  // Theme from Redux store
  const currentTheme = useSelector((state) => state.theme.currentTheme);
  const settings = useSelector((state) => state.settings);

  const dispatch = useDispatch();

  // Determine dark mode from the theme object
  const isDarkMode =
    typeof currentTheme === "object"
      ? currentTheme.backgroundColor === "#000"
      : currentTheme !== "light";

  // Get theme values for styling objects
  const textColor = isDarkMode ? "#ffffff" : "#333333";
  const popupBg = isDarkMode ? "#22262a" : "#ffffff";
  const borderColor = isDarkMode ? "#32373D" : "#e5e7eb";
  const secondaryBg = isDarkMode ? "#32373D" : "#f3f4f6";
  const accentColor = isDarkMode ? "#6ABCFF" : "#6ABCFF";

  // Theme classes
  const themeText = isDarkMode ? "text-white" : "text-gray-900";
  const themeBtnBg = isDarkMode ? "bg-[#32373D]" : "bg-gray-100";
  const themeDropdownBg = isDarkMode ? "bg-[#32373D]" : "bg-white";
  const themeBorder = isDarkMode ? "border-gray-700" : "border-gray-200";
  const themeMenuHover = isDarkMode ? "hover:bg-gray-800" : "hover:bg-gray-100";
  const themeActionText = isDarkMode ? "text-blue-400" : "text-blue-600";
  const themeActionTextHover = isDarkMode
    ? "hover:text-blue-300"
    : "hover:text-blue-700";
  const themeDeleteText = isDarkMode ? "text-red-400" : "text-red-600";
  const themeDeleteTextHover = isDarkMode
    ? "hover:text-red-300"
    : "hover:text-red-700";

  // Styles for popups (matching NewGroupPopup)
  const styles = {
    popupOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      zIndex: 9999,
      animation:
        isEditClosing || isDeleteClosing
          ? "fadeOutOverlay 0.3s ease-out forwards"
          : "fadeInOverlay 0.3s ease-in forwards",
    },
    popupContainer: {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: popupBg,
      borderRadius: "20px",
      zIndex: 10000,
      border: `1px solid ${borderColor}`,
      animation:
        isEditClosing || isDeleteClosing
          ? "fadeOutPopup 0.3s ease-out forwards"
          : "fadeInPopup 0.3s ease-in forwards",
    },
    popupHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "20px",
    },
    popupTitle: {
      fontSize: "25px",
      fontWeight: "400",
      color: textColor,
    },
    popupClose: {
      background: "none",
      border: "none",
      color: textColor,
      fontSize: "1.2rem",
      cursor: "pointer",
    },
    popupForm: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    },
    popupInput: {
      padding: "10px",
      borderRadius: "8px",
      border: `1px solid #838C96`,
      backgroundColor: popupBg,
      color: textColor,
      fontSize: "16px",
      height: "50px",
      width: "100%",
    },
    popupButton: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      background: "linear-gradient(135deg, #CBFEFF, #6ABCFF)",
      color: "black",
      border: "none",
      borderRadius: "5px",
      padding: "10px 20px",
      cursor: "pointer",
      fontSize: "16px",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
      transition: "all 0.3s ease",
      minWidth: "120px",
      textAlign: "center",
      height: "50px",
      justifyContent: "center",
      marginLeft: "20px",
    },
    popupDeleteButton: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      background: "#dc2626", // Red for delete
      color: "white",
      border: "none",
      borderRadius: "5px",
      padding: "10px 20px",
      cursor: "pointer",
      fontSize: "16px",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
      transition: "all 0.3s ease",
      minWidth: "120px",
      textAlign: "center",
      height: "50px",
      justifyContent: "center",
      marginLeft: "20px",
    },
    popupCancelButton: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      background: "none",
      color: textColor,
      border: `1px solid ${accentColor}`,
      borderRadius: "5px",
      padding: "10px 20px",
      cursor: "pointer",
      fontSize: "16px",
      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
      transition: "all 0.3s ease",
      minWidth: "120px",
      textAlign: "center",
      height: "50px",
      justifyContent: "center",
    },
    tagContainer: {
      position: "relative",
      borderRadius: "8px",
      border: `1px solid #838C96`,
      backgroundColor: popupBg,
      color: textColor,
      fontSize: "16px",
      height: "150px",
      padding: "10px",
      display: "flex",
      flexWrap: "wrap",
      gap: "8px",
      alignContent: "flex-start",
      overflowY: "auto",
      cursor: "text",
    },
    tag: {
      display: "flex",
      alignItems: "center",
      backgroundColor: secondaryBg,
      padding: "5px 10px",
      borderRadius: "12px",
      fontSize: "14px",
      color: textColor,
    },
    tagRemove: {
      marginLeft: "8px",
      cursor: "pointer",
      fontSize: "12px",
      color: "#dadada",
    },
    hiddenInput: {
      background: "transparent",
      border: "none",
      outline: "none",
      color: textColor,
      fontSize: "16px",
      padding: "5px",
      flex: "1 0 auto",
      height: "30px",
      width: "auto",
      minWidth: "100px",
    },
  };

  // Click outside listener effect
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        menuVisible
      ) {
        setMenuVisible(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuVisible, setMenuVisible]);

  // Handle selecting an option
  const handleSelectOption = (optionName) => {
    setSelectedOption(optionName);
    setMenuVisible(false);
  };

  // Handle start editing a group
  const handleEditGroup = (e, group) => {
    e.preventDefault();
    e.stopPropagation();
    setEditMode(true);
    setEditGroupId(group.id);
    setEditGroupName(group.name);

    // Convert comma-separated string to array
    const topicsArray = group.topics
      ? group.topics.split(/,\s*/).filter(Boolean)
      : [];
    setEditGroupTopics(topicsArray);

    setTopicInput("");
    setMenuVisible(false);
  };

  // Handle save group changes
  const handleSaveGroup = async () => {
    if (!editGroupName.trim()) {
      toast.error("Group name cannot be empty");
      return;
    }

    if (editGroupTopics.length === 0) {
      toast.error("Please add at least one topic");
      return;
    }

    setIsSubmitting(true);
    try {
      await onEditGroup({
        id: editGroupId,
        name: editGroupName,
        topics: editGroupTopics.join(", "), // Join topics as comma-separated string
      });

      toast.success("Group updated successfully!");

      // Use animation before closing
      setIsEditClosing(true);
      setTimeout(() => {
        setEditMode(false);
        setEditGroupId(null);
        setEditGroupName("");
        setEditGroupTopics([]);
        setTopicInput("");
        setIsEditClosing(false);
      }, 300);
    } catch (error) {
      console.error("Failed to update group:", error);
      toast.error("Failed to update group. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel edit with animation
  const handleCancelEdit = () => {
    setIsEditClosing(true);
    setTimeout(() => {
      setEditMode(false);
      setEditGroupId(null);
      setEditGroupName("");
      setEditGroupTopics([]);
      setTopicInput("");
      setIsEditClosing(false);
    }, 300);
  };

  // Handle initiating group deletion
  const handleDeleteClick = (e, groupId) => {
    e.preventDefault();
    e.stopPropagation();
    setDeleteGroupId(groupId);
    setShowDeleteConfirm(true);
    setMenuVisible(false);
  };

  // Handle confirming deletion
  const handleConfirmDelete = async () => {
    if (!deleteGroupId) return;

    setIsSubmitting(true);
    try {
      await onDeleteGroup(deleteGroupId);

      toast.success("Group deleted successfully!");

      dispatch(incrementNotificationRefreshTrigger());

      // Use animation before closing
      setIsDeleteClosing(true);
      setTimeout(() => {
        setShowDeleteConfirm(false);
        setDeleteGroupId(null);
        setIsDeleteClosing(false);
      }, 300);
    } catch (error) {
      console.error("Failed to delete group:", error);
      toast.error("Failed to delete group. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel delete with animation
  const handleCancelDelete = () => {
    setIsDeleteClosing(true);
    setTimeout(() => {
      setShowDeleteConfirm(false);
      setDeleteGroupId(null);
      setIsDeleteClosing(false);
    }, 300);
  };

  // Handle adding a topic
  const handleAddTopic = (e) => {
    if (e.key === "Enter" && topicInput.trim()) {
      e.preventDefault();
      if (!editGroupTopics.includes(topicInput.trim())) {
        setEditGroupTopics([...editGroupTopics, topicInput.trim()]);
        setTopicInput("");
      }
    } else if (e.key === "," && topicInput.trim()) {
      e.preventDefault();
      if (!editGroupTopics.includes(topicInput.trim().replace(",", ""))) {
        setEditGroupTopics([
          ...editGroupTopics,
          topicInput.trim().replace(",", ""),
        ]);
        setTopicInput("");
      }
    }
  };

  // Handle removing a topic
  const handleRemoveTopic = (topicToRemove) => {
    setEditGroupTopics(
      editGroupTopics.filter((topic) => topic !== topicToRemove)
    );
  };

  // Initialize subscribedGroups from groupOptions' is_subscribed
  useEffect(() => {
    const initializeSubscriptions = async () => {
      try {
        // Initialize notification service
        await notificationService.initialize();

        // Get FCM token
        const fcmToken = await notificationService.getFCMToken();

        if (fcmToken) {
          // Get device ID
          const deviceId = localStorage.getItem("fcm_device_id");

          if (deviceId) {
            // Get global subscription status which includes subscribed groups
            const response = await globalSubscribe(fcmToken, deviceId);

            if (response.status === 1 && response.subscribed_groups) {
              // Convert array to object for O(1) lookup
              const subscriptionMap = {};
              response.subscribed_groups.forEach((group) => {
                subscriptionMap[group.group_id] = group.is_subscribed;
              });
              setSubscribedGroups(subscriptionMap);
            }
          }
        }
      } catch (error) {
        console.error("Error initializing subscriptions:", error);
      }
    };

    initializeSubscriptions();
  }, []);

  // Handle subscribing to group notifications
  const handleSubscribeToGroup = async (e, groupId) => {
    e.preventDefault();
    e.stopPropagation();

    setSubscribingGroups((prev) => new Set([...prev, groupId]));

    const isCurrentlySubscribed = subscribedGroups[groupId] || false;

    if (isCurrentlySubscribed) {
      // Unsubscribe logic
      try {
        const token = await notificationService.getFCMToken();
        await unsubscribeFromTopic(token, groupId);
        setSubscribedGroups((prev) => ({
          ...prev,
          [groupId]: false,
        }));
        toast.success("Unsubscribed from notifications for this group.");
      } catch (error) {
        console.error("Unsubscribe error:", error);
        toast.error("Failed to unsubscribe from notifications");
      } finally {
        setSubscribingGroups((prev) => {
          const newSet = new Set(prev);
          newSet.delete(groupId);
          return newSet;
        });
      }
      return;
    }

    // Subscribe logic using native browser API
    try {
      // Check if notifications are supported
      if (!("Notification" in window)) {
        toast.error("This browser does not support desktop notifications");
        return;
      }

      let permissionGranted = false;

      if (Notification.permission === "granted") {
        // Already have permission
        permissionGranted = true;
      } else if (Notification.permission === "denied") {
        // Permission explicitly denied
        toast.error(
          "Notifications are blocked. Please enable them in your browser settings."
        );
        return;
      } else {
        // Permission not yet asked, request it
        const permission = await Notification.requestPermission();
        permissionGranted = permission === "granted";

        if (!permissionGranted) {
          toast.error(
            "Please allow notifications in your browser to subscribe to group updates"
          );
          return;
        }
      }

      // Get FCM token (this will use existing permission)
      const token = await notificationService.getFCMToken();
      if (!token) {
        toast.error("Failed to get notification token");
        return;
      }

      // Subscribe to this specific group
      await notificationService.subscribeToTopic(groupId);

      setSubscribedGroups((prev) => ({
        ...prev,
        [groupId]: true,
      }));
      toast.success(`🔔 Subscribed to notifications for this group!`);
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error("Failed to subscribe to notifications");
    } finally {
      setSubscribingGroups((prev) => {
        const newSet = new Set(prev);
        newSet.delete(groupId);
        return newSet;
      });
    }
  };

  // Handle click on topic container
  const handleContainerClick = () => {
    if (topicContainerRef.current)
      topicContainerRef.current.querySelector("input").focus();
  };

  // Check if form is valid
  const isFormValid = editGroupName.trim() !== "" && editGroupTopics.length > 0;

  return (
    <>
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
      {/* CSS Animation Keyframes */}
      <style>
        {`
          @keyframes fadeInOverlay {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes fadeOutOverlay {
            from {
              opacity: 1;
            }
            to {
              opacity: 0;
            }
          }

          @keyframes fadeInPopup {
            from {
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
          }

          @keyframes fadeOutPopup {
            from {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
            to {
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.95);
            }
          }
          
          /* Ensure popup containers are correctly centered */
          .popup-container {
            position: fixed !important;
            top: 50% !important;
            left: 50% !important;
            transform: translate(-50%, -50%) !important;
            max-width: 95vw;
            width: 530px;
          }
        `}
      </style>

      {/* Main Dropdown */}
      <div
        className={`relative flex-1 me-2 md:me-0 xl:me-2 ${className || ""}`}
        ref={dropdownRef}
      >
        <div
          className={`flex items-center ${themeBtnBg} px-3 py-2.5 rounded-lg text-base border ${themeBorder} cursor-pointer ${themeText}`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMenuVisible(!menuVisible);
          }}
        >
          <span className="truncate max-w-[100px]" title={selectedOption}>
            {selectedOption}
          </span>
          <FontAwesomeIcon
            icon={faChevronDown}
            className="ml-auto flex-shrink-0 text-sm"
          />
        </div>

        {/* Dropdown Menu */}
        {menuVisible && (
          <div
            className={`absolute z-10 right-0 top-12 left-0 w-full xl:min-w-[300px] ${themeDropdownBg} border ${themeBorder} rounded-lg shadow-lg overflow-hidden py-1`}
          >
            {/* Top News option that can't be edited/deleted */}
            <div
              className={`px-4 py-2 cursor-pointer ${themeMenuHover} transition-colors ${themeText} truncate ${
                selectedOption === "Top News" ? "bg-blue-600/20" : ""
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSelectOption("Top News");
              }}
              title="Top News"
            >
              Top News
            </div>

            {/* Custom groups that can be edited/deleted */}
            {groupOptions
              .filter((group) => group.name !== "Top News")
              .map((group) => (
                <div
                  key={group.id}
                  className={`group px-4 py-2 cursor-pointer ${themeMenuHover} transition-colors ${themeText} flex items-center justify-between ${
                    selectedOption === group.name ? "bg-blue-600/20" : ""
                  }`}
                >
                  <div
                    className="truncate max-w-[200px] flex-1"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSelectOption(group.name);
                    }}
                    title={group.name}
                  >
                    {group.name}
                  </div>
                  <div className="flex items-center opacity-100 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                    <button
                      className={`p-1 ml-1 text-white ${
                        subscribingGroups.has(group.id) ? "opacity-50" : ""
                      }`}
                      onClick={(e) => handleSubscribeToGroup(e, group.id)}
                      disabled={subscribingGroups.has(group.id)}
                      title={
                        subscribedGroups[group.id]
                          ? "Unsubscribe from notifications"
                          : "Subscribe to notifications"
                      }
                    >
                      {subscribingGroups.has(group.id) ? (
                        <FontAwesomeIcon
                          icon={faSpinner}
                          spin
                          className="w-[18px] h-[18px]"
                        />
                      ) : (
                        <FontAwesomeIcon
                          icon={
                            subscribedGroups[group.id] ? faBell : faBellSlash
                          }
                          className="w-[18px] h-[18px] text-white"
                        />
                      )}
                    </button>
                    <button
                      className={`p-1 ml-1 ${themeActionText} ${themeActionTextHover}`}
                      onClick={(e) => handleEditGroup(e, group)}
                      title="Edit group"
                    >
                      <img
                        className="min-w-[18px] min-h-[18px]"
                        src={
                          isDarkMode
                            ? "../../images/edit-icon-light.svg"
                            : "../../images/edit-icon-dark.svg"
                        }
                        alt="Edit"
                      />
                    </button>
                    <button
                      className={`p-1 ml-1 ${themeDeleteText} ${themeDeleteTextHover}`}
                      onClick={(e) => handleDeleteClick(e, group.id)}
                      title="Delete group"
                    >
                      <img
                        className="min-w-[18px] min-h-[18px]"
                        src={
                          isDarkMode
                            ? "../../images/delete-icon-light.svg"
                            : "../../images/delete-icon-dark.svg"
                        }
                        alt="Delete"
                      />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Edit Group Modal */}
      {editMode && (
        <>
          <div style={styles.popupOverlay} onClick={handleCancelEdit}></div>
          <div
            className="p-5 md:p-7 popup-container"
            style={styles.popupContainer}
          >
            <div style={styles.popupHeader}>
              <span style={styles.popupTitle}>Edit Group</span>
              <button style={styles.popupClose} onClick={handleCancelEdit}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div style={styles.popupForm}>
              <div className="field-hld">
                <label
                  className="mb-3 w-full block"
                  style={{ color: textColor }}
                >
                  Group Name
                </label>
                <input
                  style={styles.popupInput}
                  value={editGroupName}
                  onChange={(e) => setEditGroupName(e.target.value)}
                  placeholder="Enter group name"
                />
              </div>
              <div className="field-hld">
                <label
                  className="mb-3 w-full block"
                  style={{ color: textColor }}
                >
                  Topics (Comma separated / Enter to add) - Max{" "}
                  {settings?.topic_limit || 3} topics
                </label>
                <div
                  style={styles.tagContainer}
                  ref={topicContainerRef}
                  onClick={handleContainerClick}
                >
                  {editGroupTopics.map((topic, index) => (
                    <div key={index} style={styles.tag}>
                      {topic}
                      <FontAwesomeIcon
                        icon={faTimes}
                        style={styles.tagRemove}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveTopic(topic);
                        }}
                      />
                    </div>
                  ))}
                  <input
                    style={styles.hiddenInput}
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    onKeyDown={handleAddTopic}
                    placeholder={
                      editGroupTopics.length === 0
                        ? "Add sectors or keywords"
                        : editGroupTopics.length >= (settings?.topic_limit || 3)
                        ? `Maximum ${settings?.topic_limit || 3} topics reached`
                        : `${
                            (settings?.topic_limit || 3) -
                            editGroupTopics.length
                          } more topics allowed`
                    }
                    disabled={
                      editGroupTopics.length >= (settings?.topic_limit || 3)
                    }
                  />
                </div>
              </div>
              <div className="flex items-center">
                <button
                  style={styles.popupCancelButton}
                  onClick={handleCancelEdit}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  style={{
                    ...styles.popupButton,
                    opacity: !isFormValid || isSubmitting ? 0.6 : 1,
                    cursor:
                      !isFormValid || isSubmitting ? "not-allowed" : "pointer",
                  }}
                  onClick={handleSaveGroup}
                  disabled={!isFormValid || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin />
                      <span style={{ marginLeft: "8px" }}>Saving...</span>
                    </>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <>
          <div style={styles.popupOverlay} onClick={handleCancelDelete}></div>
          <div
            className="p-5 md:p-7 popup-container"
            style={styles.popupContainer}
          >
            <div style={styles.popupHeader}>
              <span style={styles.popupTitle}>Confirm Deletion</span>
              <button style={styles.popupClose} onClick={handleCancelDelete}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div style={styles.popupForm}>
              <p
                style={{
                  color: textColor,
                  marginBottom: "20px",
                  textAlign: "center",
                }}
              >
                Are you sure you want to delete this group? This action cannot
                be undone.
              </p>
              <div className="flex items-center justify-center">
                <button
                  style={styles.popupCancelButton}
                  onClick={handleCancelDelete}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  style={{
                    ...styles.popupDeleteButton,
                    opacity: isSubmitting ? 0.6 : 1,
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                  }}
                  onClick={handleConfirmDelete}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} spin />
                      <span style={{ marginLeft: "8px" }}>Deleting...</span>
                    </>
                  ) : (
                    "Delete Group"
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default TopNewsDropdown;
