import React, { useState, useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faClock,
  faDownload,
  faLink,
  faBookmark,
  faTimes,
  faEnvelope,
  faShare,
  faMicrophone,
  faCopy,
  faCheck,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import {
  faFacebook,
  faXTwitter,
  faLinkedin,
  faWhatsapp,
} from "@fortawesome/free-brands-svg-icons";
// Import the utility functions
import { formatNewsItemTime } from "../newsTimeUtils";
import { useSelector, useDispatch } from "react-redux";
import { discussWithAI, resetAnalysis } from "../../helpers/api";
import AudioWaveButton from "../AudioWaveButton";

const NewsDetails = ({
  newsItem,
  headline,
  activeHeadline,
  showContentDirectly = false,
  partialAccess = false,
  onLoginRequired,
}) => {
  // Add state for share popup
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mergedData, setMergedData] = useState(null);
  const urlInputRef = useRef(null);

  const activeNewsId = useSelector((state) => state.newsDetails.activeNewsId);
  const isLoadingImpacts = useSelector(
    (state) => state.newsDetails.isLoadingImpacts
  );
  const userData = useSelector((state) => state.auth.user);
  const currentLocation = useSelector(
    (state) => state.newsDetails.currentLocation
  );
  const role = localStorage.getItem("role");
  const [deleteNewsLoading, setDeleteNewsLoading] = useState(false);

  const deleteNews = async () => {
    try {
      setDeleteNewsLoading(true);
      const response = await resetAnalysis(activeNewsId);
      console.log("response from delete news", response);
      if (response) {
        window.location.reload();
      }
    } catch (error) {
      console.log("error from delete news", error);
    } finally {
      setDeleteNewsLoading(false);
    }
  };

  // Extract news data from the active news item
  const currentTheme = useSelector((state) => state.theme.currentTheme);
  const newsObj = newsItem && newsItem.newsobj ? newsItem.newsobj : {};
  const source = newsObj.source || "";
  const sourceUrl = newsObj.source_url || "";
  const sourceImage = newsObj["image/video"] || "";

  // Determine if we're using dark mode
  const isDarkMode =
    currentTheme &&
    (currentTheme === "dark" ||
      (typeof currentTheme === "object" &&
        currentTheme.backgroundColor === "#000"));

  // Format the source for display
  let sourceDomain = source;
  let sourceInitial = source ? source.charAt(0).toUpperCase() : "";

  if (source && source.includes("//")) {
    try {
      const url = new URL(source);
      sourceDomain = url.hostname.replace("www.", "");
      sourceInitial = sourceDomain.charAt(0).toUpperCase();
    } catch (e) {
      // Fallback to original source
    }
  } else if (source && !source.includes("//") && source.includes(".")) {
    // Handle cases where it's a domain without protocol
    sourceDomain = source.replace("www.", "");
    sourceInitial = sourceDomain.charAt(0).toUpperCase();
  }

  // Function to copy URL to clipboard
  const copyToClipboard = () => {
    if (urlInputRef.current) {
      urlInputRef.current.select();
      document.execCommand("copy");
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  // Function to get the headline from a news item
  const getNewsHeadline = (item) => {
    let headline = item;
    headline = headline.replace(/&#039;/g, "'");

    // Decode other HTML entities
    const decodeEntities = (text) => {
      const textarea = document.createElement("textarea");
      textarea.innerHTML = text;
      return textarea.value;
    };

    return decodeEntities(headline);
  };

  // Get current URL for sharing
  const shareUrl = window.location.href;

  // Get article title for sharing
  const articleTitle = getNewsHeadline(
    headline || activeHeadline || newsObj.headline || ""
  );

  // Social media sharing functions
  const shareToFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        shareUrl
      )}`,
      "_blank"
    );
  };

  const shareToTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        shareUrl
      )}&text=${encodeURIComponent(articleTitle)}`,
      "_blank"
    );
  };

  const shareToLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        shareUrl
      )}`,
      "_blank"
    );
  };

  const shareToWhatsApp = () => {
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(
        articleTitle + " " + shareUrl
      )}`,
      "_blank"
    );
  };

  const shareViaEmail = () => {
    window.open(
      `mailto:?subject=${encodeURIComponent(
        articleTitle
      )}&body=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!isLoadingImpacts && activeNewsId) {
        const response = await discussWithAI(activeNewsId);
        // console.log("response from discuss with ai", response);
        if (response && response.mergedData) {
          setMergedData(response.mergedData);
        }
      }
    };
    fetchData();
  }, [activeNewsId, isLoadingImpacts]);

  const [isClosing, setIsClosing] = useState(false);

  // Handle closing animation
  const handleClosePopup = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowSharePopup(false);
      setIsClosing(false);
    }, 400);
  };

  const styles = {
    popupOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.8)",
      zIndex: 1000,
      animation: isClosing
        ? "fadeOutOverlay 0.4s ease-out forwards"
        : "fadeInOverlay 0.4s ease-in forwards",
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
      animation: isClosing
        ? "fadeOutPopup 0.4s ease-out forwards"
        : "fadeInPopup 0.4s ease-in forwards",
    },
    popupClose: {
      background: "none",
      border: "none",
      color: currentTheme.textColor,
      fontSize: "1.2rem",
      cursor: "pointer",
    },
  };

  return (
    <>
      <h1
        className={`text-xl sm:text-2xl 2xl:text-3xl font-medium mb-4 ${
          isDarkMode ? "text-white" : "text-gray-900"
        }`}
      >
        {getNewsHeadline(headline || activeHeadline || newsObj.headline || "")}
      </h1>

      <div className="sm:flex justify-between mb-6">
        <div className="flex items-center gap-2 mb-3 sm:mb-0 flex-wrap 2xl:me-3">
          <div
            className={`text-md gap-2 ${
              isDarkMode ? "text-gray-400" : "text-gray-500"
            } flex items-center`}
          >
            <img
              src={
                isDarkMode
                  ? "/images/clock-light.svg"
                  : "/images/clock-dark.svg"
              }
            />
            {formatNewsItemTime(newsItem)}
          </div>
          <span
            className={`mx-2 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}
          >
            •
          </span>
          <div className="flex items-center gap-2 border border-[#2e343a] rounded-full px-2 py-1 max-w-[200px]">
            {sourceImage ? (
              <img
                src={sourceImage}
                alt={sourceDomain || ""}
                className="w-5 h-5 rounded-full mr-2 object-contain flex-shrink-0"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.style.display = "none";
                }}
              />
            ) : (
              <div
                className={`w-5 h-5 rounded-full ${
                  isDarkMode ? "bg-gray-600" : "bg-gray-500"
                } text-white flex items-center justify-center text-xs font-bold mr-2 flex-shrink-0`}
              >
                {sourceInitial}
              </div>
            )}
            <span
              className={`text-md ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              } truncate`}
              title={sourceDomain || ""}
            >
              {sourceUrl ? (
                <a
                  href={sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="hover:underline truncate block"
                  title={sourceDomain || ""}
                >
                  {sourceDomain || ""}
                </a>
              ) : (
                sourceDomain || ""
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            className={`w-10 h-10 rounded flex items-center justify-center cursor-pointer hidden
              ${
                isDarkMode
                  ? "bg-gray-800 text-gray-300"
                  : "bg-gray-100 text-gray-600"
              }`}
          >
            <img
              src={
                isDarkMode
                  ? "/images/download-big-light.svg"
                  : "/images/download-big-dark.svg"
              }
            />
          </button>

          <button
            className={`w-10 h-10 rounded flex items-center justify-center cursor-pointer
              ${
                isDarkMode
                  ? "bg-gray-800 text-gray-300"
                  : "bg-gray-100 text-gray-600"
              }`}
            onClick={() => setShowSharePopup(true)}
          >
            <img
              src={
                isDarkMode
                  ? "/images/share-light.svg"
                  : "/images/share-dark.svg"
              }
            />
          </button>
          {role === "admin" && (
            <button
              className={`w-10 h-10 rounded flex items-center justify-center cursor-pointer ${
                isDarkMode
                  ? "bg-gray-800 text-gray-300"
                  : "bg-gray-100 text-gray-600"
              }`}
              onClick={() => {
                deleteNews();
              }}
            >
              {deleteNewsLoading ? (
                <FontAwesomeIcon
                  icon={faSpinner}
                  spin
                  className="animate-spin"
                />
              ) : (
                <img src="/images/reset-icon.svg" alt="Reset" />
              )}
            </button>
          )}

          <button
            className={`w-10 h-10 rounded items-center justify-center cursor-pointer hidden
              ${
                isDarkMode
                  ? "bg-gray-800 text-gray-300"
                  : "bg-gray-100 text-gray-600"
              }`}
          >
            <img
              src={
                isDarkMode
                  ? "/images/bookmark-light.svg"
                  : "/images/bookmark-dark.svg"
              }
            />
          </button>

          {/* VAPI Voice Assistant Button - All VAPI logic now handled inside AudioWaveButton */}
          <AudioWaveButton
            activeNewsId={activeNewsId}
            mergedData={mergedData}
            userData={userData}
            currentLocation={currentLocation}
            isLoadingImpacts={isLoadingImpacts}
            partialAccess={partialAccess}
            onLoginRequired={onLoginRequired}
          />
        </div>
      </div>

      {/* Share Popup */}
      {showSharePopup && (
        <>
          <div style={styles.popupOverlay} onClick={handleClosePopup}></div>
          <div
            className="p-5 md:p-7 popup-container"
            style={styles.popupContainer}
          >
            <div className="flex items-center justify-between">
              <h3
                className={`text-lg font-medium mb-3 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Share this article
              </h3>
              <button style={styles.popupClose} onClick={handleClosePopup}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="flex items-center mb-4 relative">
              <input
                ref={urlInputRef}
                type="text"
                value={shareUrl}
                readOnly
                className={`p-2 rounded border flex-1 mr-2 pr-[35px] ${
                  isDarkMode
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-white text-gray-900 border-gray-300"
                }`}
              />
              <button
                onClick={copyToClipboard}
                disabled={copied}
                className="bg-[#5E8EFF] text-white font-medium px-3 py-2 rounded absolute right-0 h-full"
              >
                {copied ? (
                  <FontAwesomeIcon icon={faCheck} />
                ) : (
                  <img src="../../images/copied-icon.svg" alt="Copy" />
                )}
              </button>
            </div>

            <div className="mt-4">
              <h4
                className={`text-sm font-medium mb-2 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Share to social media
              </h4>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={shareToFacebook}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-[#1877F2] text-white"
                  title="Share to Facebook"
                >
                  <FontAwesomeIcon icon={faFacebook} />
                </button>
                <button
                  onClick={shareToTwitter}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-[#000000] text-white"
                  title="Share to Twitter"
                >
                  <FontAwesomeIcon icon={faXTwitter} />
                </button>
                <button
                  onClick={shareToLinkedIn}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-[#0A66C2] text-white"
                  title="Share to LinkedIn"
                >
                  <FontAwesomeIcon icon={faLinkedin} />
                </button>
                <button
                  onClick={shareToWhatsApp}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-[#25D366] text-white"
                  title="Share to WhatsApp"
                >
                  <FontAwesomeIcon icon={faWhatsapp} />
                </button>
                <button
                  onClick={shareViaEmail}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-[#D44638] text-white"
                  title="Share via Email"
                >
                  <FontAwesomeIcon icon={faEnvelope} />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default NewsDetails;
