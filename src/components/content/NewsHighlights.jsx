import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown } from "@fortawesome/free-solid-svg-icons";

const NewsHighlights = ({ newsDetails }) => {
  const [expanded, setExpanded] = useState(false);
  const currentTheme = useSelector((state) => state.theme.currentTheme);
  // Get the active news item
  const activeNews = newsDetails?.results?.[0];

  // Extract highlights from the news details
  const highlights = activeNews?.newsobj?.highlights || [];
  const content = activeNews?.newsobj?.content;

  // Get impact ratings to check if we should auto-expand
  const impactRatings = activeNews?.newsobj?.impact_ratings || {};

  // Check if we should auto-expand based on impact rating combinations
  useEffect(() => {
    const impactRatingEntries = Object.entries(impactRatings);
    // Filter out items with score 0 or "not available"
    const validImpactRatings = impactRatingEntries.filter(([key, value]) => {
      const score =
        typeof value.score === "number" ? value.score : parseFloat(value.score);
      return !isNaN(score) && score !== 0 && value.score !== "not available";
    });

    // Count positive and negative ratings
    const positiveRatings = validImpactRatings.filter(([key, value]) => {
      const score =
        typeof value.score === "number" ? value.score : parseFloat(value.score);
      return score > 0;
    });

    const negativeRatings = validImpactRatings.filter(([key, value]) => {
      const score =
        typeof value.score === "number" ? value.score : parseFloat(value.score);
      return score < 0;
    });

    if (
      (positiveRatings.length <= 2 && negativeRatings.length <= 2) ||
      validImpactRatings.length <= 2
    ) {
      setExpanded(true);
    }
  }, [impactRatings]);

  // If no highlights, don't render the component
  if (!highlights || highlights.length === 0) {
    return null;
  }

  // Determine dark mode from the theme object
  const isDarkMode =
    typeof currentTheme === "object"
      ? currentTheme.backgroundColor === "#000"
      : currentTheme !== "light";

  return (
    <div style={{ marginBottom: "24px" }}>
      {/* Key Highlights Box */}
      <div
        style={{
          backgroundColor: currentTheme.cardBg,
          borderRadius: "20px",
          border: `1px solid ${currentTheme.borderColor}`,
          padding: "20px",
          marginBottom: expanded ? "16px" : "0",
        }}
      >
        <div style={{ marginBottom: "15px" }}>
          <div style={{ display: "flex", alignItems: "flex-start" }}>
            <div
              style={{
                width: "4px",
                backgroundColor: "#3b82f6",
                borderRadius: "2px",
                height: "28px",
                marginRight: "8px",
              }}
            ></div>
            <div
              style={{
                fontSize: "20px",
                fontWeight: "500",
                marginBottom: "10px",
              }}
            >
              Key Highlights
            </div>
          </div>
        </div>

        <ul style={{ margin: 0, padding: 0, listStyleType: "none" }}>
          {highlights.map((highlight, index) => (
            <li
              key={index}
              className={`${isDarkMode ? "text-white" : "text-gray-800"}`}
              style={{
                display: "flex",
                alignItems: "flex-start",
                marginBottom: "10px",
                fontSize: "18px",
                fontWeight: "300",
                lineHeight: "1.5",
              }}
            >
              <div
                style={{
                  backgroundColor: "#3498ff",
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  marginRight: "10px",
                  marginTop: "8px",
                  flexShrink: 0,
                }}
              />
              {highlight}
            </li>
          ))}
        </ul>

        {/* Show Read More only if content exists and is not 'Content not found...' */}
        {content &&
          content !== "Content not found..." &&
          content !== "not available" &&
          !expanded && (
            <a
              href="#"
              className="flex justify-center items-center mt-4 text-[16px] font-medium transition-all duration-200 hover:underline"
              style={{
                background:
                  "linear-gradient(to bottom right, #CBFEFF, #6ABCFF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                color: "transparent",
                marginTop: "16px",
              }}
              onClick={(e) => {
                e.preventDefault();
                setExpanded(true);
              }}
            >
              Read More
              <FontAwesomeIcon
                icon={faChevronDown}
                style={{
                  marginLeft: "8px",
                  fontSize: "10px",
                  color: isDarkMode ? "#ffffff" : "#000000",
                  transition: "transform 0.2s",
                }}
              />
            </a>
          )}
      </div>

      {/* Expanded Content Box */}
      {expanded &&
        content &&
        content !== "Content not found..." &&
        content !== "not available" && (
          <div
            style={{
              backgroundColor: currentTheme.cardBg,
              borderRadius: "20px",
              border: `1px solid ${currentTheme.borderColor}`,
              padding: "20px",
            }}
          >
            <div
              style={{
                fontSize: "17px",
                fontWeight: 300,
                lineHeight: 1.7,
              }}
              className={`${isDarkMode ? "text-white" : "text-gray-800"}`}
            >
              {(() => {
                const processedText = content.replace(/\\n/g, "\n");
                return processedText.split("\n").map((paragraph, index) => (
                  <p
                    key={index}
                    style={{
                      marginBottom:
                        index < processedText.split("\n").length - 1
                          ? "1rem"
                          : "0",
                    }}
                  >
                    {paragraph.trim()}
                  </p>
                ));
              })()}
            </div>

            <a
              href="#"
              className="flex justify-center items-center mt-4 text-[16px] font-medium transition-all duration-200 hover:underline"
              style={{
                background:
                  "linear-gradient(to bottom right, #CBFEFF, #6ABCFF)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                color: "transparent",
                marginTop: "16px",
              }}
              onClick={(e) => {
                e.preventDefault();
                setExpanded(false);
              }}
            >
              Show Less
              <FontAwesomeIcon
                icon={faChevronDown}
                style={{
                  marginLeft: "8px",
                  fontSize: "10px",
                  transform: "rotate(180deg)",
                  color: isDarkMode ? "#ffffff" : "#000000",
                  transition: "transform 0.2s",
                }}
              />
            </a>
          </div>
        )}
    </div>
  );
};

export default NewsHighlights;
