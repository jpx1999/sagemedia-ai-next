import React, { useRef, useEffect, useState } from "react";
import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { useSelector, useDispatch } from "react-redux";
import { fetchImpactAnalysis } from "../../helpers/api";
import { setIsLoadingImpacts } from "../../store/slice/newsDetailsSlice";
import useWindowSize from "../../hooks/useWindowSize";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const ImpactCharts = ({ newsObj, onImpactClick, shouldHide = false }) => {
  // Refs for containers to measure dimensions
  const positiveChartRef = useRef(null);
  const negativeChartRef = useRef(null);

  // FIXED: Use only the hook for window size tracking
  const { width: windowWidth } = useWindowSize();

  // State to store container dimensions
  const [dimensions, setDimensions] = useState({
    positive: { width: 0, height: 0 },
    negative: { width: 0, height: 0 },
  });

  // New state for loading status (local state for component-specific logic)
  const [isLoadingImpactsLocal, setIsLoadingImpactsLocal] = useState(true);

  // Redux
  const dispatch = useDispatch();
  const isLoadingImpacts = useSelector(
    (state) => state.newsDetails.isLoadingImpacts
  );

  // New state to track if we're polling
  const [isPolling, setIsPolling] = useState(false);

  // New state for tooltip (display-only, not clickable)
  const [tooltipInfo, setTooltipInfo] = useState({
    visible: false,
    content: null,
    position: { x: 0, y: 0 },
  });

  // Cache for impact analysis data
  const [impactAnalysisCache, setImpactAnalysisCache] = useState({});

  // State for tracking impact analysis API polling status
  const [impactAnalysisStatus, setImpactAnalysisStatus] = useState({});
  // Ref for polling interval
  const pollingIntervalRef = useRef(null);
  // Ref for polling timeout (1 minute max)
  const pollingTimeoutRef = useRef(null);
  // Ref for polling start time
  const pollingStartTimeRef = useRef(null);

  // Determine if dark mode
  const currentTheme = useSelector((state) => state.theme.currentTheme);
  const activeNewsId = useSelector((state) => state.newsDetails.activeNewsId);
  const isDarkMode =
    currentTheme &&
    (currentTheme === "dark" ||
      (typeof currentTheme === "object" &&
        currentTheme.backgroundColor === "#000"));

  // REMOVED: Redundant window resize effect since useWindowSize handles it
  // useEffect(() => {
  //   const handleResize = () => {
  //     setWindowWidth(windowWidth);
  //   };
  //   window.addEventListener("resize", handleResize);
  //   return () => window.removeEventListener("resize", handleResize);
  // }, []);

  // Complete mapping of display names to API keys
  const displayNames = {
    stocks: "Stocks",
    bonds: "Fixed Income",
    crypto: "Crypto",
    futures: "Futures",
    options: "Options",
    commodities: "Commodities",
    futures_options: "Futures & Options",
  };

  // Reverse mapping from display name to API key
  const reverseDisplayNames = Object.entries(displayNames).reduce(
    (acc, [key, value]) => {
      acc[value] = key;
      return acc;
    },
    {}
  );

  // Check if impact ratings are available
  const hasImpactData = () => {
    // Return false if no newsObj or impact_ratings
    if (!newsObj?.impact_ratings) return false;

    // Check if any impact rating has a numeric score
    return Object.values(newsObj.impact_ratings).some(
      (rating) =>
        typeof rating.score === "number" ||
        (!isNaN(parseFloat(rating.score)) && rating.score !== "not available")
    );
  };

  // New effect for polling impact analysis API
  useEffect(() => {
    // Clean up previous interval and timeout if they exist
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current);
      pollingTimeoutRef.current = null;
    }

    // If we don't have impact ratings or activeNewsId, don't do anything
    if (!newsObj?.impact_ratings || !activeNewsId) {
      setIsLoadingImpactsLocal(false);
      dispatch(setIsLoadingImpacts(false));
      return;
    }

    // Get non-zero impact ratings
    const nonZeroImpacts = Object.entries(newsObj.impact_ratings).filter(
      ([key, rating]) => {
        const score =
          typeof rating.score === "number"
            ? rating.score
            : parseFloat(rating.score);
        return !isNaN(score) && score !== 0 && rating.score !== "not available";
      }
    );

    if (nonZeroImpacts.length === 0) {
      setIsLoadingImpactsLocal(false);
      dispatch(setIsLoadingImpacts(false));
      return;
    }

    // Set polling state to true when we start polling
    setIsPolling(true);
    setIsLoadingImpactsLocal(true);
    dispatch(setIsLoadingImpacts(true));

    // Set polling start time
    pollingStartTimeRef.current = Date.now();

    // Initialize status tracking for each impact
    const initialStatus = {};
    nonZeroImpacts.forEach(([key]) => {
      initialStatus[key] = { status: 0, attempts: 0 };
    });
    setImpactAnalysisStatus(initialStatus);

    // Check if all impacts have status 1
    const checkIfAllComplete = (currentStatus) => {
      return nonZeroImpacts.every(([key]) => currentStatus[key]?.status === 1);
    };

    // Function to stop polling and enable charts
    const stopPollingAndEnableCharts = () => {
      console.log("Stopping polling and enabling charts");
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
        pollingTimeoutRef.current = null;
      }
      setIsPolling(false);

      // After a short delay, set loading to false to show the charts
      setTimeout(() => {
        setIsLoadingImpactsLocal(false);
        dispatch(setIsLoadingImpacts(false));
      }, 500); // Small delay for transition effect
    };

    // Function to fetch impact analysis for a given impact
    const fetchImpactData = async () => {
      // Check if we've reached the 1-minute timeout
      const currentTime = Date.now();
      const elapsedTime = currentTime - pollingStartTimeRef.current;

      // If we've been polling for more than 1 minute, stop and enable charts
      if (elapsedTime >= 60000) {
        // 60000ms = 1 minute
        console.log(
          "1-minute timeout reached, enabling charts regardless of status"
        );
        stopPollingAndEnableCharts();
        return;
      }

      // Get the current status before proceeding
      setImpactAnalysisStatus((currentStatus) => {
        // If all already have status 1, clear the interval and return current state
        if (checkIfAllComplete(currentStatus)) {
          stopPollingAndEnableCharts();
          return currentStatus;
        }

        // Process each non-zero impact
        const updatedStatus = { ...currentStatus };

        const processImpacts = async () => {
          for (const [key, rating] of nonZeroImpacts) {
            // Skip if already has status 1
            if (currentStatus[key]?.status === 1) continue;

            try {
              const params = {
                id: activeNewsId,
                impact: key,
              };

              const response = await fetchImpactAnalysis(params);

              // Update cache with the response
              const cacheKey = `${activeNewsId}_${key}`;
              if (response.data?.companies) {
                setImpactAnalysisCache((prev) => ({
                  ...prev,
                  [cacheKey]: response.data.companies,
                }));
              }

              // Update status
              updatedStatus[key] = {
                status: response.status === 1 ? 1 : 0,
                attempts: (currentStatus[key]?.attempts || 0) + 1,
              };

              // Log success if status changed to 1
              if (response.status === 1) {
                // console.log(
                //   `Impact ${key} now has status 1 after ${updatedStatus[key].attempts} attempts`
                // );
              }
            } catch (error) {
              console.error(
                `Error fetching impact analysis for ${key}:`,
                error
              );
              updatedStatus[key] = {
                status: 0,
                attempts: (currentStatus[key]?.attempts || 0) + 1,
              };
            }
          }
        };

        // Start the API calls asynchronously
        processImpacts();

        // Check if all impacts have status 1 after processing
        const allComplete = nonZeroImpacts.every(
          ([key]) =>
            updatedStatus[key]?.status === 1 || currentStatus[key]?.status === 1
        );

        // If all impacts have status 1, stop polling and enable charts
        if (allComplete) {
          stopPollingAndEnableCharts();
        }

        return updatedStatus;
      });
    };

    // Initial fetch
    fetchImpactData();

    // Set up polling interval (every 2 seconds)
    pollingIntervalRef.current = setInterval(fetchImpactData, 2000);

    // Set up 1-minute timeout
    pollingTimeoutRef.current = setTimeout(() => {
      console.log(
        "1-minute timeout reached, enabling charts regardless of status"
      );
      stopPollingAndEnableCharts();
    }, 60000); // 60000ms = 1 minute

    // Clean up on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
        pollingTimeoutRef.current = null;
      }
      setIsPolling(false);
    };
  }, [newsObj?.impact_ratings, activeNewsId, dispatch]);

  // Function to process chart data to ensure it matches RightSidebar
  const processChartData = () => {
    // Check if we have impact_ratings data
    if (!newsObj?.impact_ratings) {
      return {
        positive: { labels: [], data: [] },
        negative: { labels: [], data: [] },
      };
    }

    // Extract impact ratings
    const impactRatings = newsObj.impact_ratings;

    // Extract chart data
    const chartData = {
      positive: {
        labels: [],
        data: [],
      },
      negative: {
        labels: [],
        data: [],
      },
    };

    // If we have chartobj data, use it as our base
    if (newsObj.chartobj?.positive_financial_impact?.datasets?.[0]?.data) {
      const posLabels = newsObj.chartobj.positive_financial_impact.labels || [];
      const posData =
        newsObj.chartobj.positive_financial_impact.datasets[0].data || [];

      // Process each label/data pair
      posLabels.forEach((label, index) => {
        // Skip if data value is 0
        if (posData[index] === 0) return;

        // Always use the value from impact_ratings for consistency
        const impactScoreRaw = impactRatings[label]?.score;
        const impactScore =
          typeof impactScoreRaw === "number"
            ? impactScoreRaw
            : parseFloat(impactScoreRaw);

        // Only add if score is positive
        if (impactScore > 0) {
          // Use the display name mapping for consistency
          chartData.positive.labels.push(displayNames[label] || label);
          chartData.positive.data.push(impactScore);
        }
      });
    } else {
      // Fallback: If no chart data, generate from impact_ratings directly
      Object.entries(impactRatings).forEach(([key, value]) => {
        const scoreRaw = value.score;
        // Skip if score is "not available"
        if (scoreRaw === "not available") return;

        const score =
          typeof scoreRaw === "number" ? scoreRaw : parseFloat(scoreRaw);

        if (!isNaN(score)) {
          if (score > 0) {
            chartData.positive.labels.push(displayNames[key] || key);
            chartData.positive.data.push(score);
          } else if (score < 0) {
            chartData.negative.labels.push(displayNames[key] || key);
            chartData.negative.data.push(score);
          }
        }
      });
    }

    // Similarly for negative data
    if (newsObj.chartobj?.negative_financial_impact?.datasets?.[0]?.data) {
      const negLabels = newsObj.chartobj.negative_financial_impact.labels || [];
      const negData =
        newsObj.chartobj.negative_financial_impact.datasets[0].data || [];

      // Filter for triangle shape (top 3 negative impacts)
      const negativeItems = [];

      negLabels.forEach((label, index) => {
        // Handle both cases: chart data could be positive or negative for negative impacts
        const value = Math.abs(negData[index]); // Take absolute value for sorting
        if (value > 0) {
          // Always use impact_ratings for consistency
          const impactScoreRaw = impactRatings[label]?.score;

          // Skip if score is "not available"
          if (impactScoreRaw === "not available") return;

          const impactScore =
            typeof impactScoreRaw === "number"
              ? impactScoreRaw
              : parseFloat(impactScoreRaw);

          // Only add if score is negative in impact_ratings
          if (impactScore < 0) {
            negativeItems.push({
              label: displayNames[label] || label,
              value: impactScore, // Keep the negative value from impact_ratings
              originalIndex: index,
            });
          }
        }
      });

      // Sort and take top 3
      negativeItems.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
      const top3 = negativeItems.slice(0, 3);

      // Add to chart data
      top3.forEach((item) => {
        chartData.negative.labels.push(item.label);
        chartData.negative.data.push(item.value);
      });
    }

    return chartData;
  };

  // Function to get label positions outside the chart - adjusted for responsive layouts
  const getChartLabelPositions = (
    labels,
    dataPoints,
    containerWidth,
    containerHeight,
    isLargeScreen = false
  ) => {
    const positions = [];

    labels.forEach((label, index) => {
      if (!dataPoints[index]) return;
      const totalLabels = labels.length;
      const angle = (index / totalLabels) * 2 * Math.PI - Math.PI / 2;

      // Calculate container size and use it for positioning
      const containerSize = Math.min(
        containerWidth || 300,
        containerHeight || 300
      );

      // On large screens, position labels closer to the chart
      const radius = isLargeScreen
        ? containerSize * 0.42
        : containerSize * 0.45;

      // Calculate X and Y coordinates based on angle and radius
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      // Determine position adjustments based on angle
      let textAlign = "center";
      let xOffset = 0;
      let yOffset = 0;

      // Adjust offsets for large screens
      const offsetMult = isLargeScreen ? 0.8 : 1;

      // Right side of the chart
      if (angle > -Math.PI / 4 && angle < Math.PI / 4) {
        textAlign = "left";
        xOffset = 10 * offsetMult;
      }
      // Left side of the chart
      else if (angle > (3 * Math.PI) / 4 || angle < (-3 * Math.PI) / 4) {
        textAlign = "right";
        xOffset = -10 * offsetMult;
      }
      // Bottom of the chart
      else if (angle >= Math.PI / 4 && angle <= (3 * Math.PI) / 4) {
        yOffset = 5 * offsetMult;
      }
      // Top of the chart
      else if (angle <= -Math.PI / 4 && angle >= (-3 * Math.PI) / 4) {
        yOffset = -5 * offsetMult;
      }

      positions.push({
        index,
        value: dataPoints[index],
        label,
        style: {
          position: "absolute",
          top: `calc(50% + ${y + yOffset}px)`,
          left: `calc(50% + ${x + xOffset}px)`,
          transform: "translate(-50%, -50%)",
          textAlign,
          whiteSpace: "nowrap",
          display: "flex",
          flexDirection: "column",
          alignItems:
            textAlign === "left"
              ? "flex-start"
              : textAlign === "right"
              ? "flex-end"
              : "center",
          cursor: "pointer", // Add cursor pointer to indicate clickable
          fontSize: isLargeScreen ? "0.9rem" : "1rem", // Smaller font on large screens
        },
      });
    });
    return positions;
  };

  // Create a ref to store the timeout
  const tooltipTimeoutRef = useRef(null);

  // Show tooltip when hovering over a label
  const handleLabelMouseEnter = (e, label, value) => {
    // Clear any existing timeout
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
      tooltipTimeoutRef.current = null;
    }

    // Get the API key for the hovered label
    const apiKey = reverseDisplayNames[label] || label.toLowerCase();

    // Determine impact type
    const impactType = value >= 0 ? "positive" : "negative";

    // Create tooltip content
    const tooltipContent = {
      label,
      value,
      apiKey,
      impactType,
    };

    // Set tooltip position from mouse event
    setTooltipInfo({
      visible: true,
      content: tooltipContent,
      position: { x: e.clientX, y: e.clientY },
    });
  };

  // Hide tooltip when mouse leaves the label - with delay
  const handleLabelMouseLeave = () => {
    // Set a timeout to hide the tooltip after a delay
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }

    // Use a 300ms delay to give user time to move mouse to tooltip
    tooltipTimeoutRef.current = setTimeout(() => {
      setTooltipInfo((prev) => ({ ...prev, visible: false }));
      tooltipTimeoutRef.current = null;
    }, 300);
  };

  // Handler for clicking on a chart label - use callback instead of local state
  const handleLabelClick = (e, label, value) => {
    e.stopPropagation(); // Prevent event bubbling

    // Get the API key for the clicked label
    const apiKey = reverseDisplayNames[label] || label.toLowerCase();

    // Use the callback from parent instead of local state management
    if (onImpactClick) {
      onImpactClick(label, value, apiKey);
    }

    // Hide tooltip
    setTooltipInfo((prev) => ({ ...prev, visible: false }));
  };

  // Click away listener to close tooltip
  useEffect(() => {
    const handleClickAway = (e) => {
      // Find if we clicked on the tooltip or any of its children
      let clickedElement = e.target;
      let isTooltipClick = false;

      // Traverse up the DOM to check if we clicked inside the tooltip
      while (clickedElement) {
        if (
          clickedElement.classList &&
          clickedElement.classList.contains("chart-tooltip")
        ) {
          isTooltipClick = true;
          break;
        }
        clickedElement = clickedElement.parentElement;
      }

      // Only hide tooltip if clicked outside the tooltip
      if (!isTooltipClick) {
        setTooltipInfo((prev) => ({ ...prev, visible: false }));
      }
    };

    document.addEventListener("click", handleClickAway);

    return () => {
      document.removeEventListener("click", handleClickAway);
    };
  }, []);

  // ResizeObserver to update dimensions when the chart size changes
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === positiveChartRef.current) {
          setDimensions((prevDimensions) => ({
            ...prevDimensions,
            positive: {
              width: entry.contentRect.width,
              height: entry.contentRect.height,
            },
          }));
        } else if (entry.target === negativeChartRef.current) {
          setDimensions((prevDimensions) => ({
            ...prevDimensions,
            negative: {
              width: entry.contentRect.width,
              height: entry.contentRect.height,
            },
          }));
        }
      });
    });

    if (positiveChartRef.current) {
      resizeObserver.observe(positiveChartRef.current);
    }

    if (negativeChartRef.current) {
      resizeObserver.observe(negativeChartRef.current);
    }

    // Initial dimension calculation
    setTimeout(() => {
      if (positiveChartRef.current) {
        setDimensions((prevDimensions) => ({
          ...prevDimensions,
          positive: {
            width: positiveChartRef.current.offsetWidth,
            height: positiveChartRef.current.offsetHeight,
          },
        }));
      }

      if (negativeChartRef.current) {
        setDimensions((prevDimensions) => ({
          ...prevDimensions,
          negative: {
            width: negativeChartRef.current.offsetWidth,
            height: negativeChartRef.current.offsetHeight,
          },
        }));
      }
    }, 0);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Process chart data to ensure correct values
  const chartData = processChartData();

  // CRITICAL FIX: Handle the case where negative chart values are provided as positive numbers
  // This ensures that negative_financial_impact data is interpreted correctly regardless of sign
  if (newsObj?.chartobj?.negative_financial_impact?.datasets?.[0]?.data) {
    // If we have any non-zero values in the negative chart but they're positive numbers
    const negData = newsObj.chartobj.negative_financial_impact.datasets[0].data;
    const negLabels = newsObj.chartobj.negative_financial_impact.labels || [];
    const hasPositiveValuesInNegativeChart = negData.some((val) => val > 0);

    if (hasPositiveValuesInNegativeChart) {
      // Rebuild the negative chart data properly
      chartData.negative = {
        labels: [],
        data: [],
      };

      // Convert positive values to negative for the negative chart
      negLabels.forEach((label, index) => {
        if (negData[index] > 0) {
          // Use the mapped display name for consistency
          chartData.negative.labels.push(displayNames[label] || label);
          // Make the value negative for correct display
          chartData.negative.data.push(-1 * negData[index]);
        }
      });
    }
  }

  // Check if we have data to display
  const hasPositiveData = chartData.positive.data.length > 0;
  const hasNegativeDataRaw = chartData.negative.data.length > 0;

  // Determine which charts to hide based on impact combinations
  const { shouldHidePositiveChart, shouldHideNegativeChart } = (() => {
    if (!newsObj?.impact_ratings)
      return { shouldHidePositiveChart: false, shouldHideNegativeChart: false };

    const impactRatings = newsObj.impact_ratings;
    const validImpactRatings = Object.entries(impactRatings).filter(
      ([key, value]) => {
        const score =
          typeof value.score === "number"
            ? value.score
            : parseFloat(value.score);
        return !isNaN(score) && score !== 0 && value.score !== "not available";
      }
    );

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

    return {
      // Hide positive chart if we have 2+ negative and 1 positive
      shouldHidePositiveChart:
        negativeRatings.length >= 3 && positiveRatings.length <= 2,
      // Hide negative chart if we have 2+ positive and 1 negative
      shouldHideNegativeChart:
        positiveRatings.length >= 3 && negativeRatings.length <= 2,
    };
  })();

  const hasNegativeData = hasNegativeDataRaw && !shouldHideNegativeChart;
  const hasPositiveDataFiltered = hasPositiveData && !shouldHidePositiveChart;

  // Determine if we're on a large screen (> 991px)
  const isLargeScreen = windowWidth > 991;

  // Get positions for both positive and negative impacts
  let positivePositions = [];
  let negativePositions = [];

  if (hasPositiveDataFiltered) {
    positivePositions = getChartLabelPositions(
      chartData.positive.labels,
      chartData.positive.data,
      dimensions.positive.width || 300,
      dimensions.positive.height || 300,
      isLargeScreen
    );
  }

  if (hasNegativeData) {
    negativePositions = getChartLabelPositions(
      chartData.negative.labels,
      chartData.negative.data,
      dimensions.negative.width || 300,
      dimensions.negative.height || 300,
      isLargeScreen
    );
  }

  // Chart options with proper scale - adjusted for responsive layouts
  const getChartOptions = (type, containerWidth) => {
    // Adjust scale and padding for larger screens
    const scaleAdjustment = isLargeScreen ? 0.9 : 1;

    return {
      scales: {
        r: {
          angleLines: { color: isDarkMode ? "#3e3e3e" : "#d1d5db" },
          grid: { color: isDarkMode ? "#3e3e3e" : "#e5e7eb" },
          pointLabels: {
            color: "rgba(255, 255, 255, 0)", // Hide default labels
            font: { size: 0 },
          },
          ticks: {
            backdropColor: "transparent",
            color: isDarkMode ? "#ffffff" : "#1f2937",
            stepSize: 1.0 * scaleAdjustment,
            min: type === "positive" ? 0 : -5 * scaleAdjustment,
            max: type === "positive" ? 5 * scaleAdjustment : 0,
            font: { size: isLargeScreen ? 9 : 10 },
            count: 6,
            showLabelBackdrop: false,
          },
          beginAtZero: type === "positive",
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          titleColor: "#fff",
          bodyColor: "#fff",
          padding: 10,
          cornerRadius: 8,
          displayColors: false,
        },
      },
      elements: {
        line: { borderWidth: 1 },
        point: { radius: 0, hoverRadius: 4 },
      },
      maintainAspectRatio: true,
      responsive: true,
      aspectRatio: isLargeScreen ? 1.6 : 1, // Wider aspect ratio on larger screens
      animation: {
        duration: 0, // Disable animation for consistent render
      },
      layout: {
        padding: isLargeScreen ? 12 : 20, // Less padding on larger screens
      },
    };
  };

  // Custom tooltip component (display-only, not clickable)
  const CustomTooltip = () => {
    if (!tooltipInfo.visible || !tooltipInfo.content) return null;

    const { content, position } = tooltipInfo;

    // Calculate tooltip position with boundaries
    const maxX = windowWidth - 280; // Max X position (tooltip width + margin)
    const xPos = Math.min(position.x, maxX);

    // Position tooltip so it doesn't go off screen
    const tooltipStyle = {
      position: "fixed",
      top: `${position.y + 20}px`, // 20px below cursor
      left: `${xPos}px`,
      zIndex: 1000,
      borderRadius: "8px",
      padding: "12px",
      width: "260px",
      backgroundColor: isDarkMode
        ? "rgba(15, 23, 42, 0.95)"
        : "rgba(255, 255, 255, 0.95)",
      boxShadow: isDarkMode
        ? "0 4px 20px rgba(0, 0, 0, 0.3)"
        : "0 4px 20px rgba(0, 0, 0, 0.1)",
      border: isDarkMode
        ? "1px solid rgba(30, 41, 59, 0.8)"
        : "1px solid rgba(209, 213, 219, 0.8)",
      pointerEvents: "none", // Make tooltip not interactive/clickable
    };

    // State for storing impacted company data
    const [impactedCompanies, setImpactedCompanies] = useState([]);
    // State for loading status
    const [dataStatus, setDataStatus] = useState("loading"); // "loading", "success", "empty", "error"

    // Fetch impact analysis when tooltip is shown
    useEffect(() => {
      if (tooltipInfo.visible && tooltipInfo.content) {
        // Initial loading state
        setDataStatus("loading");

        // Get the API key for the hovered label
        const apiKey =
          reverseDisplayNames[content.label] || content.label.toLowerCase();
        const cacheKey = `${activeNewsId}_${apiKey}`;

        // Check if we have cached data
        if (impactAnalysisCache[cacheKey]) {
          console.log("Using cached impact analysis data");
          const cachedData = impactAnalysisCache[cacheKey];
          setImpactedCompanies(cachedData);
          setDataStatus(cachedData.length > 0 ? "success" : "empty");
        } else {
          // Fetch new data
          const params = {
            id: activeNewsId,
            impact: apiKey,
          };

          console.log("Fetching impact analysis data for:", params);
          fetchImpactAnalysis(params)
            .then((response) => {
              console.log(
                "Impact analysis data received:",
                response.data?.companies
              );
              if (response.data?.companies) {
                const companies = response.data.companies;
                // Update cache
                setImpactAnalysisCache((prevCache) => ({
                  ...prevCache,
                  [cacheKey]: companies,
                }));
                setImpactedCompanies(companies);
                setDataStatus(companies.length > 0 ? "success" : "empty");
              } else {
                setImpactedCompanies([]);
                setDataStatus("empty");
              }
            })
            .catch((err) => {
              console.error("Error fetching impact analysis:", err);
              setImpactedCompanies([]);
              setDataStatus("error");
            });
        }
      }
    }, [
      tooltipInfo.visible,
      tooltipInfo.content?.label,
      activeNewsId,
      impactAnalysisCache,
    ]);

    return (
      <div style={tooltipStyle} className="chart-tooltip">
        <div style={{ fontSize: "14px", color: "rgb(209, 213, 219)" }}>
          <div
            className={`font-medium mb-2 ${
              isDarkMode ? "text-white" : "text-gray-800"
            }`}
          >
            {content.label}
          </div>

          {dataStatus === "loading" && (
            <div className="text-center py-2">
              <div className="spinner mb-1"></div>
              <div>Loading impact data...</div>
            </div>
          )}

          {dataStatus === "success" && impactedCompanies.length > 0 && (
            <div className="mt-2">
              <div className="text-gray-400 text-xs mb-1">
                Impacted Instruments
              </div>
              {impactedCompanies.map((company, index) => (
                <div key={index} className="flex justify-between mt-1">
                  <div className={isDarkMode ? "text-white" : "text-gray-800"}>
                    {company.ticker}
                  </div>
                  <div
                    style={{
                      color:
                        company.impact_score > 0
                          ? "rgb(34, 197, 94)"
                          : "rgb(239, 68, 68)",
                    }}
                  >
                    {company.impact_score > 0 ? "+" : ""}
                    {company.impact_score}
                  </div>
                </div>
              ))}
            </div>
          )}

          {dataStatus === "empty" && (
            <div
              className={`text-center py-2 ${
                isDarkMode ? "text-white" : "text-gray-800"
              }`}
            >
              No impacted instruments found
            </div>
          )}

          {dataStatus === "error" && (
            <div className="text-center py-2 text-red-400">
              Error loading impact instruments
            </div>
          )}
        </div>
      </div>
    );
  };

  // Get responsive container classes based on screen size
  const getContainerClasses = () => {
    // On larger screens, use a more compact layout
    if (isLargeScreen) {
      return "mb-4 space-y-0 flex flex-col gap-4";
    }
    return "mb-6 space-y-6";
  };

  // Get chart container width based on screen size and chart count
  const getChartWidth = () => {
    // If we're on larger screens with both charts, use half width
    if (isLargeScreen && hasPositiveData && hasNegativeData) {
      return "w-full";
    }
    return "w-full";
  };

  // Chart container padding based on screen size
  const getChartPadding = () => {
    return isLargeScreen ? "p-4 pb-8" : "p-5 pb-10";
  };

  // Chart aspect ratio styling
  const getChartAspectRatio = () => {
    return isLargeScreen ? "aspect-[1.6/1]" : "aspect-square";
  };

  return (
    <div style={{ display: shouldHide ? "none" : "block" }}>
      {/* Show loading indicator at the top when polling/loading */}
      {isLoadingImpactsLocal && (
        <div className="mb-4 flex items-center justify-end gap-3">
          <h3
            className="text-base font-medium text-transparent"
            style={{
              background: "linear-gradient(to bottom right, #CBFEFF, #724cf9)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              textShadow:
                "0 0 3px rgba(106, 188, 255, 0.2), 0 0 6px rgba(114, 76, 249, 0.1)",
            }}
          >
            Analyzing the Impact
          </h3>
          <div className="flex items-center gap-1">
            <span className="inline-block w-5 h-1.5 bg-[#724cf9] rounded"></span>
            <span className="dot-loader w-1.5 h-1.5 rounded-full bg-gray-400"></span>
            <span className="dot-loader w-1.5 h-1.5 rounded-full bg-gray-400"></span>
            <span className="dot-loader w-1.5 h-1.5 rounded-full bg-gray-400"></span>
          </div>
        </div>
      )}

      <div className={getContainerClasses()}>
        {/* Positive Impact Chart */}
        {hasPositiveDataFiltered && (
          <div
            className={`${getChartWidth()} rounded-3xl ${getChartPadding()} overflow-visible ${
              isDarkMode
                ? "bg-black border border-gray-800"
                : "bg-white border border-gray-300"
            } ${isLoadingImpactsLocal ? "opacity-50" : ""} relative`}
          >
            {/* Add absolute overlay to block all interactions during loading */}
            {isLoadingImpactsLocal && (
              <div className="absolute inset-0 z-10 cursor-progress" />
            )}

            <div className="flex items-start mb-2 lg:mb-1">
              <div className="w-1 bg-blue-500 rounded h-12 mr-3"></div>
              <div className="text-left">
                <div
                  className={`${
                    isDarkMode ? "text-white" : "text-gray-800"
                  } text-sm lg:text-base`}
                >
                  Financial
                </div>
                <div
                  className={`${
                    isDarkMode ? "text-white" : "text-gray-800"
                  } text-sm lg:text-base`}
                >
                  Instrument Impact
                </div>
                <div
                  className={`${
                    isDarkMode ? "text-white" : "text-gray-800"
                  } text-sm lg:text-base`}
                >
                  (Positive)
                </div>
              </div>
            </div>

            <div
              ref={positiveChartRef}
              className={`w-full ${getChartAspectRatio()} relative mx-auto ${
                isLoadingImpactsLocal ? "pointer-events-none" : ""
              }`}
              style={{ maxWidth: isLargeScreen ? "100%" : "500px" }}
            >
              <div className="absolute inset-0">
                <Radar
                  data={{
                    labels: chartData.positive.labels,
                    datasets: [
                      {
                        label: "Positive Impact",
                        data: chartData.positive.data,
                        fill: true,
                        backgroundColor: "rgba(26, 144, 255, 0.5)",
                        borderColor: "rgb(26, 144, 255)",
                        pointBackgroundColor: "rgb(26, 144, 255)",
                        pointBorderColor: "#fff",
                        pointHoverBackgroundColor: "#fff",
                        pointHoverBorderColor: "rgb(26, 144, 255)",
                      },
                    ],
                  }}
                  options={getChartOptions(
                    "positive",
                    dimensions.positive.width
                  )}
                />
              </div>

              {/* Outside labels that match the screenshot */}
              <div className="absolute inset-0 pointer-events-none">
                {positivePositions.map((pos) => (
                  <div
                    key={pos.index}
                    style={pos.style}
                    className={`chart-label ${
                      isLoadingImpactsLocal ? "" : "pointer-events-auto"
                    }`}
                    onClick={(e) =>
                      !isLoadingImpactsLocal &&
                      handleLabelClick(e, pos.label, pos.value)
                    }
                    onMouseEnter={(e) =>
                      !isLoadingImpactsLocal &&
                      handleLabelMouseEnter(e, pos.label, pos.value)
                    }
                    onMouseLeave={handleLabelMouseLeave}
                  >
                    <div
                      className={`text-green-500 ${
                        isLargeScreen ? "text-base" : "text-lg"
                      } font-medium`}
                    >
                      {pos.value > 0 ? "+" : ""}
                      {pos.value}
                    </div>
                    <div
                      className={`${
                        isLargeScreen ? "text-xs" : "text-sm"
                      } mt-1 ${isDarkMode ? "text-white" : "text-gray-800"}`}
                    >
                      {pos.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Negative Impact Chart */}
        {hasNegativeData && (
          <div
            className={`${getChartWidth()} rounded-3xl ${getChartPadding()} overflow-visible ${
              isDarkMode
                ? "bg-black border border-gray-800"
                : "bg-white border border-gray-300"
            } ${isLoadingImpactsLocal ? "opacity-50" : ""} relative`}
          >
            {/* Add absolute overlay to block all interactions during loading */}
            {isLoadingImpactsLocal && (
              <div className="absolute inset-0 z-10 cursor-progress" />
            )}

            <div className="flex items-start mb-2 lg:mb-1">
              <div className="w-1 bg-blue-500 rounded h-12 mr-3"></div>
              <div className="text-left">
                <div
                  className={`${
                    isDarkMode ? "text-white" : "text-gray-800"
                  } text-sm lg:text-base`}
                >
                  Financial
                </div>
                <div
                  className={`${
                    isDarkMode ? "text-white" : "text-gray-800"
                  } text-sm lg:text-base`}
                >
                  Instrument Impact
                </div>
                <div
                  className={`${
                    isDarkMode ? "text-white" : "text-gray-800"
                  } text-sm lg:text-base`}
                >
                  (Negative)
                </div>
              </div>
            </div>

            <div
              ref={negativeChartRef}
              className={`w-full ${getChartAspectRatio()} relative mx-auto ${
                isLoadingImpactsLocal ? "pointer-events-none" : ""
              }`}
              style={{ maxWidth: isLargeScreen ? "100%" : "500px" }}
            >
              <div className="absolute inset-0">
                <Radar
                  data={{
                    labels: chartData.negative.labels,
                    datasets: [
                      {
                        label: "Negative Impact",
                        data: chartData.negative.data,
                        fill: true,
                        backgroundColor: "rgba(26, 144, 255, 0.5)",
                        borderColor: "rgb(26, 144, 255)",
                        pointBackgroundColor: "rgb(26, 144, 255)",
                        pointBorderColor: "#fff",
                        pointHoverBackgroundColor: "#fff",
                        pointHoverBorderColor: "rgb(26, 144, 255)",
                      },
                    ],
                  }}
                  options={getChartOptions(
                    "negative",
                    dimensions.negative.width
                  )}
                />
              </div>

              {/* Outside labels that match the screenshot */}
              <div className="absolute inset-0 pointer-events-none">
                {negativePositions.map((pos) => (
                  <div
                    key={pos.index}
                    style={pos.style}
                    className={`chart-label ${
                      isLoadingImpactsLocal ? "" : "pointer-events-auto"
                    }`}
                    onClick={(e) =>
                      !isLoadingImpactsLocal &&
                      handleLabelClick(e, pos.label, pos.value)
                    }
                    onMouseEnter={(e) =>
                      !isLoadingImpactsLocal &&
                      handleLabelMouseEnter(e, pos.label, pos.value)
                    }
                    onMouseLeave={handleLabelMouseLeave}
                  >
                    <div
                      className={`text-red-500 ${
                        isLargeScreen ? "text-base" : "text-lg"
                      } font-medium`}
                    >
                      {pos.value}
                    </div>
                    <div
                      className={`${
                        isLargeScreen ? "text-xs" : "text-sm"
                      } mt-1 ${isDarkMode ? "text-white" : "text-gray-800"}`}
                    >
                      {pos.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Tooltip */}
      {!isLoadingImpactsLocal && <CustomTooltip />}

      {/* Add responsive styles */}
      <style jsx="true">{`
        @media (min-width: 992px) {
          .chart-label {
            font-size: 0.9rem;
          }
        }

        /* Animation for spinner */
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: #1a90ff;
          animation: spin 1s ease-in-out infinite;
          margin: 0 auto;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Dot loader animation for the time-based indicator */
        .dot-loader {
          display: inline-block;
          height: 6px;
          margin: 0 3px;
          background-color: #724cf9;
          animation: dotPulse 1.4s infinite ease-in-out both;
        }

        .dot-loader:nth-child(1) {
          animation-delay: -0.32s;
        }

        .dot-loader:nth-child(2) {
          animation-delay: -0.16s;
        }

        @keyframes dotPulse {
          0%,
          80%,
          100% {
            transform: scale(0.6);
            opacity: 0.4;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default ImpactCharts;
