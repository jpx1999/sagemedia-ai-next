import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { setShowNewGroupPopup } from "../store/slice/newsDetailsSlice";
import { useState } from "react";
import { createGroup } from "../helpers/api";

const NewGroupPopup = ({
  newGroupName,
  setNewGroupName,
  newGroupTopics,
  setNewGroupTopics,
  topicInput,
  setTopicInput,
  fetchGroupOptions,
  setShowSuccessPopup,
  topicContainerRef,
}) => {
  const dispatch = useDispatch();
  const currentTheme = useSelector((state) => state.theme.currentTheme);
  const currentLocation = useSelector(
    (state) => state.newsDetails.currentLocation
  );
  const settings = useSelector((state) => state.settings);
  const [isLoading, setIsLoading] = useState(false);
  const [isClosing, setIsClosing] = useState(false); // New state to track closing

  const createNewGroup = async () => {
    console.log("Creating new group:");
    if (!newGroupName || newGroupTopics.length === 0) return;

    setIsLoading(true);
    try {
      const data = await createGroup({
        name: newGroupName,
        topics: newGroupTopics.join(", "),
        country: currentLocation,
      });

      console.log("Group creation response:", data);

      if (data && (data.status === 0 || data.status === 1)) {
        setIsClosing(true); // Trigger fade-out before closing
        setTimeout(() => {
          dispatch(setShowNewGroupPopup(false));
          setNewGroupName("");
          setNewGroupTopics([]);
          setTopicInput("");
          fetchGroupOptions();
          setShowSuccessPopup(true);
          setIsClosing(false); // Reset closing state
        }, 300); // Match the animation duration
      } else {
        console.error("Failed to create group:", data);
      }
    } catch (error) {
      console.error("Error creating new group:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsClosing(true); // Trigger fade-out animation
    setTimeout(() => {
      dispatch(setShowNewGroupPopup(false));
      setIsClosing(false); // Reset closing state
    }, 300); // Match the animation duration
  };

  const handleAddTopic = (e) => {
    if (e.key === "Enter" && topicInput.trim()) {
      e.preventDefault();
      if (!newGroupTopics.includes(topicInput.trim())) {
        setNewGroupTopics([...newGroupTopics, topicInput.trim()]);
        setTopicInput("");
      }
    } else if (e.key === "," && topicInput.trim()) {
      e.preventDefault();
      if (!newGroupTopics.includes(topicInput.trim().replace(",", ""))) {
        setNewGroupTopics([
          ...newGroupTopics,
          topicInput.trim().replace(",", ""),
        ]);
        setTopicInput("");
      }
    }
  };

  const handleRemoveTopic = (topicToRemove) => {
    setNewGroupTopics(
      newGroupTopics.filter((topic) => topic !== topicToRemove)
    );
  };

  const handleContainerClick = () => {
    if (topicContainerRef.current)
      topicContainerRef.current.querySelector("input").focus();
  };

  const isFormValid = newGroupName.trim() !== "" && newGroupTopics.length > 0;

  // Determine which animation to apply based on isClosing state
  const overlayAnimation = isClosing
    ? "fadeOutOverlay 0.3s ease-out forwards"
    : "fadeInOverlay 0.3s ease-in forwards";
  const popupAnimation = isClosing
    ? "fadeOutPopup 0.3s ease-out forwards"
    : "fadeInPopup 0.3s ease-in forwards";

  const styles = {
    popupOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      zIndex: 1000,
      animation: overlayAnimation, // Dynamic animation
    },
    popupContainer: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      backgroundColor: currentTheme.popupBg,
      borderRadius: "20px",
      zIndex: 1001,
      border: `1px solid ${currentTheme.borderColor}`,
      animation: popupAnimation, // Dynamic animation
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
      color: currentTheme.textColor,
    },
    popupClose: {
      background: "none",
      border: "none",
      color: currentTheme.textColor,
      fontSize: "1.2rem",
      cursor: "pointer",
    },
    popupForm: { display: "flex", flexDirection: "column", gap: "16px" },
    popupInput: {
      padding: "10px",
      borderRadius: "8px",
      border: `1px solid #838C96`,
      backgroundColor: currentTheme.popupBg,
      color: currentTheme.textColor,
      fontSize: "16px",
      height: "50px",
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
    popupCancelButton: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      background: "none",
      color: currentTheme.textColor,
      border: `1px solid ${currentTheme.accentColor}`,
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
      backgroundColor: currentTheme.popupBg,
      color: currentTheme.textColor,
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
      backgroundColor: currentTheme.secondaryBg,
      padding: "5px 10px",
      borderRadius: "12px",
      fontSize: "14px",
      color: currentTheme.textColor,
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
      color: currentTheme.textColor,
      fontSize: "16px",
      padding: "5px",
      flex: "1 0 auto",
      height: "30px",
      width: "auto",
      minWidth: "100px",
    },
  };

  return (
    <>
      {/* Define keyframes for both fade-in and fade-out animations */}
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
        `}
      </style>

      <div
        style={styles.popupOverlay}
        onClick={handleClose} // Use handleClose to trigger fade-out
      ></div>
      <div className="p-5 md:p-7 popup-container" style={styles.popupContainer}>
        <div style={styles.popupHeader}>
          <span style={styles.popupTitle}>Create New Group</span>
          <button
            style={styles.popupClose}
            onClick={handleClose} // Use handleClose to trigger fade-out
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>
        <div style={styles.popupForm}>
          <div className="field-hld">
            <label
              className="mb-3 w-full block"
              style={{ color: currentTheme.textColor }}
            >
              Group Name
            </label>
            <input
              className="w-full"
              style={styles.popupInput}
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Add group name"
            />
          </div>
          <div className="field-hld">
            <label
              className="mb-3 w-full block"
              style={{ color: currentTheme.textColor }}
            >
              Topics (Comma separated / Enter to add) - Max{" "}
              {settings?.topic_limit || 3} topics
            </label>
            <div
              style={styles.tagContainer}
              ref={topicContainerRef}
              onClick={handleContainerClick}
            >
              {newGroupTopics.map((topic, index) => (
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
                onKeyPress={handleAddTopic}
                placeholder={
                  newGroupTopics.length === 0
                    ? "Add sectors or keywords"
                    : newGroupTopics.length >= (settings?.topic_limit || 3)
                    ? `Maximum ${settings?.topic_limit || 3} topics reached`
                    : `${
                        (settings?.topic_limit || 3) - newGroupTopics.length
                      } more topics allowed`
                }
                disabled={newGroupTopics.length >= (settings?.topic_limit || 3)}
              />
            </div>
          </div>
          <div className="flex item-center">
            <button
              style={styles.popupCancelButton}
              onClick={handleClose} // Use handleClose to trigger fade-out
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              style={{
                ...styles.popupButton,
                opacity: !isFormValid || isLoading ? 0.6 : 1,
                cursor: !isFormValid || isLoading ? "not-allowed" : "pointer",
              }}
              onClick={createNewGroup}
              disabled={!isFormValid || isLoading}
            >
              {isLoading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin />
                  <span style={{ marginLeft: "8px" }}>Saving</span>
                </>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewGroupPopup;
