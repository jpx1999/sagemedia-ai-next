// AudioWaveButton.js
import React, { useState, useEffect, useRef } from "react";
import Vapi from "@vapi-ai/web";

// Enhanced Audio Waveform Animation Component
const AudioWaveform = ({ isActive, timer }) => {
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Different height patterns for more realistic waveform
  const barHeights = [
    { min: 6, max: 20 }, // Bar 1 - medium variation
    { min: 8, max: 24 }, // Bar 2 - high variation
    { min: 4, max: 16 }, // Bar 3 - low variation
    { min: 10, max: 28 }, // Bar 4 - highest variation
    { min: 6, max: 22 }, // Bar 5 - medium-high variation
    { min: 8, max: 18 }, // Bar 6 - medium variation
    { min: 5, max: 15 }, // Bar 7 - low-medium variation
    { min: 7, max: 20 }, // Bar 8 - medium variation
  ];

  return (
    <div className="flex items-center gap-6">
      {/* Audio Waveform Bars */}
      <div className="flex items-center gap-[3px] h-5 items-end">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={`bg-current rounded-full transition-all duration-100 ease-in-out ${
              isActive ? `animate-waveform-${i}` : ""
            }`}
            style={{
              width: "3px",
              height: isActive ? `${barHeights[i].min}px` : "6px",
              minHeight: "6px",
              animationDelay: `${i * 0.15}s`,
              animationDuration: `${0.6 + i * 0.1}s`,
              opacity: isActive ? 1 : 0.6,
            }}
          />
        ))}
      </div>

      {/* Timer */}
      <span className="text-sm font-mono min-w-[35px] font-semibold">
        {formatTimer(timer)}
      </span>

      {/* Add CSS animations for each bar */}
      <style jsx>{`
        @keyframes waveform-0 {
          0%,
          100% {
            height: ${barHeights[0].min}px;
          }
          25% {
            height: ${barHeights[0].max}px;
          }
          50% {
            height: ${barHeights[0].min + 4}px;
          }
          75% {
            height: ${barHeights[0].max - 2}px;
          }
        }
        @keyframes waveform-1 {
          0%,
          100% {
            height: ${barHeights[1].min}px;
          }
          30% {
            height: ${barHeights[1].max}px;
          }
          60% {
            height: ${barHeights[1].min + 2}px;
          }
          80% {
            height: ${barHeights[1].max - 4}px;
          }
        }
        @keyframes waveform-2 {
          0%,
          100% {
            height: ${barHeights[2].min}px;
          }
          20% {
            height: ${barHeights[2].max}px;
          }
          40% {
            height: ${barHeights[2].min + 3}px;
          }
          70% {
            height: ${barHeights[2].max - 1}px;
          }
        }
        @keyframes waveform-3 {
          0%,
          100% {
            height: ${barHeights[3].min}px;
          }
          35% {
            height: ${barHeights[3].max}px;
          }
          55% {
            height: ${barHeights[3].min + 6}px;
          }
          85% {
            height: ${barHeights[3].max - 3}px;
          }
        }
        @keyframes waveform-4 {
          0%,
          100% {
            height: ${barHeights[4].min}px;
          }
          25% {
            height: ${barHeights[4].max}px;
          }
          45% {
            height: ${barHeights[4].min + 5}px;
          }
          75% {
            height: ${barHeights[4].max - 2}px;
          }
        }
        @keyframes waveform-5 {
          0%,
          100% {
            height: ${barHeights[5].min}px;
          }
          40% {
            height: ${barHeights[5].max}px;
          }
          65% {
            height: ${barHeights[5].min + 2}px;
          }
          90% {
            height: ${barHeights[5].max - 4}px;
          }
        }
        @keyframes waveform-6 {
          0%,
          100% {
            height: ${barHeights[6].min}px;
          }
          15% {
            height: ${barHeights[6].max}px;
          }
          50% {
            height: ${barHeights[6].min + 4}px;
          }
          80% {
            height: ${barHeights[6].max - 1}px;
          }
        }
        @keyframes waveform-7 {
          0%,
          100% {
            height: ${barHeights[7].min}px;
          }
          30% {
            height: ${barHeights[7].max}px;
          }
          60% {
            height: ${barHeights[7].min + 3}px;
          }
          85% {
            height: ${barHeights[7].max - 3}px;
          }
        }

        .animate-waveform-0 {
          animation: waveform-0 0.6s ease-in-out infinite;
        }
        .animate-waveform-1 {
          animation: waveform-1 0.7s ease-in-out infinite;
        }
        .animate-waveform-2 {
          animation: waveform-2 0.8s ease-in-out infinite;
        }
        .animate-waveform-3 {
          animation: waveform-3 0.9s ease-in-out infinite;
        }
        .animate-waveform-4 {
          animation: waveform-4 1s ease-in-out infinite;
        }
        .animate-waveform-5 {
          animation: waveform-5 0.75s ease-in-out infinite;
        }
        .animate-waveform-6 {
          animation: waveform-6 0.85s ease-in-out infinite;
        }
        .animate-waveform-7 {
          animation: waveform-7 0.95s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

// Call Disconnect Icon Component
const CallDisconnectIcon = () => (
  <svg
    width="25"
    height="25"
    viewBox="0 0 24 24"
    className="drop-shadow-sm animate-pulse"
  >
    <rect x="4" y="4" width="16" height="16" rx="2" ry="2" fill="#ffffff" />
  </svg>
);

// Main AudioWaveButton Component with all VAPI logic
const AudioWaveButton = ({
  activeNewsId,
  mergedData,
  userData,
  currentLocation,
  isLoadingImpacts,
  partialAccess = false,
  onLoginRequired,
}) => {
  // VAPI-related state
  const [isVapiActive, setIsVapiActive] = useState(false);
  const [isVapiConnecting, setIsVapiConnecting] = useState(false);
  const [vapiTimer, setVapiTimer] = useState(0);
  const [isMuted, setIsMuted] = useState(false); // Changed: Default to unmuted
  const [timerInterval, setTimerInterval] = useState(null);
  const [activeTooltip, setActiveTooltip] = useState(null);

  // VAPI refs
  const vapiClient = useRef(null);
  const isVapiRunning = useRef(false); // Track VAPI state independently

  // Local state for immediate visual feedback
  const [isClicked, setIsClicked] = useState(false);

  // Helper function to clean up all states immediately
  const cleanupVapiState = () => {
    isVapiRunning.current = false;
    setIsVapiActive(false);
    setIsVapiConnecting(false);
    setVapiTimer(0);
    setIsMuted(false); // Reset to unmuted when cleaning up
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  // Initialize VAPI on component mount
  useEffect(() => {
    vapiClient.current = new Vapi("c392caaf-4056-4eec-8dbb-f9648bda088a");

    // Setup event listeners
    vapiClient.current.on("call-end", () => {
      console.log("VAPI call ended");
      cleanupVapiState();
    });

    vapiClient.current.on("error", (error) => {
      console.error("VAPI error:", error);
      cleanupVapiState();
    });

    // Add speech-start event to ensure we're truly connected
    vapiClient.current.on("speech-start", () => {
      console.log("VAPI speech started - fully connected");
      setIsVapiConnecting(false);
      setIsVapiActive(true);
    });

    // Clean up on component unmount
    return () => {
      if (vapiClient.current && isVapiRunning.current) {
        try {
          vapiClient.current.stop();
        } catch (error) {
          console.error("Error stopping VAPI in cleanup:", error);
        }
        cleanupVapiState();
      }
    };
  }, []);

  // Handle timer when VAPI is active
  useEffect(() => {
    if (isVapiActive && !timerInterval) {
      const interval = setInterval(() => {
        setVapiTimer((prev) => prev + 1);
      }, 1000);
      setTimerInterval(interval);
    } else if (!isVapiActive && timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
      setVapiTimer(0);
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [isVapiActive, timerInterval]);

  // Stop VAPI when activeNewsId changes - Always stop if VAPI client exists and is running
  useEffect(() => {
    // Always attempt to stop VAPI if client exists - don't rely on React state
    if (vapiClient.current && isVapiRunning.current) {
      try {
        console.log("Stopping VAPI due to activeNewsId change");
        vapiClient.current.stop();
        cleanupVapiState();
      } catch (error) {
        console.error("Error stopping VAPI:", error);
        cleanupVapiState(); // Still cleanup even if stop fails
      }
    }
  }, [activeNewsId]);

  // Start VAPI voice assistant
  const startVapiAssistant = () => {
    if (!vapiClient.current) return;

    if (isVapiActive || isVapiConnecting || isVapiRunning.current) {
      // Don't stop here - let the stop button handle stopping
      return;
    }

    setIsVapiConnecting(true);
    isVapiRunning.current = true;

    const firstName = userData?.name?.split(" ")[0].toLowerCase();
    const assistantOverrides = {
      variableValues: {
        news_summary: mergedData?.news_summary,
        bonds_impact: mergedData?.bonds,
        stocks_impact: mergedData?.stocks,
        crypto_impact: mergedData?.crypto,
        options_impact: mergedData?.options,
        futures_impact: mergedData?.futures,
        commodities_impact: mergedData?.commodities,
        firstname: firstName,
      },
    };

    // Uncomment if location-based voice is needed
    // if (currentLocation === "India") {
    //   assistantOverrides.voice = {
    //     model: "eleven_turbo_v2_5",
    //     voiceId: "6MoEUz34rbRrmmyxgRm4",
    //     provider: "11labs",
    //     stability: 0.5,
    //     similarityBoost: 0.75,
    //   };
    // }

    vapiClient.current
      .start("8a4bb447-cdb7-47bc-a1e8-e9403bb131e8", assistantOverrides)
      .then(() => {
        console.log("VAPI started successfully");
        // Changed: Start unmuted by default
        vapiClient.current.setMuted(false);
        setIsMuted(false);
        setVapiTimer(0);
        // isVapiRunning.current is already set to true above
      })
      .catch((error) => {
        console.error("Failed to start VAPI session:", error);
        cleanupVapiState();
      });
  };

  // Stop VAPI function
  const stopVapi = () => {
    console.log("Explicit stop VAPI called");

    // Immediately update UI state
    cleanupVapiState();

    // Then stop the client
    if (vapiClient.current) {
      try {
        vapiClient.current.stop();
      } catch (error) {
        console.error("Error in explicit stop:", error);
      }
    }
  };

  // Toggle mute function
  const toggleMute = () => {
    if (!vapiClient.current || !isVapiActive) return;

    try {
      if (isMuted) {
        // Unmute - enable microphone
        vapiClient.current.setMuted(false);
        setIsMuted(false);
        console.log("Microphone unmuted");
      } else {
        // Mute - disable microphone
        vapiClient.current.setMuted(true);
        setIsMuted(true);
        console.log("Microphone muted");
      }
    } catch (error) {
      console.error("Error toggling mute:", error);
    }
  };

  // Handle click with immediate visual feedback
  const handleClick = () => {
    if (partialAccess && onLoginRequired) {
      onLoginRequired();
      return;
    }

    if (isVapiActive || isVapiConnecting || isLoadingImpacts) {
      // If already active/connecting, don't do anything - let controls handle it
      return;
    }

    // Set immediate connecting state
    setIsClicked(true);

    // Call the VAPI assistant function
    startVapiAssistant();
  };

  // Handle stop button click
  const handleStopClick = (e) => {
    e.stopPropagation();
    stopVapi();
  };

  // Handle mute button click
  const handleMuteClick = (e) => {
    e.stopPropagation();
    toggleMute();
  };

  // Tooltip handlers
  const handleTooltipEnter = (tooltipType) => {
    setActiveTooltip(tooltipType);
  };

  const handleTooltipLeave = () => {
    setActiveTooltip(null);
  };

  // Reset local state when parent states change
  useEffect(() => {
    if (isVapiActive || isVapiConnecting) {
      setIsClicked(false);
    }
  }, [isVapiActive, isVapiConnecting]);

  // Determine current state - prioritize local state for immediate feedback
  const currentState = {
    isActive: isVapiActive,
    isConnecting: isVapiConnecting || isClicked,
    isDefault: !isVapiActive && !isVapiConnecting && !isClicked,
  };

  // Get button content based on current state
  const getButtonContent = () => {
    if (currentState.isActive) {
      return (
        <div className="flex items-center gap-6 w-full justify-between">
          <div className="flex items-center">
            <AudioWaveform isActive={true} timer={vapiTimer} />
          </div>
          <div className="flex items-center">
            {/* Mute/Unmute Icon with Tooltip - Changed from button to div */}
            <div className="relative">
              <div
                className="w-8 h-8 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                onClick={handleMuteClick}
                onMouseEnter={() => handleTooltipEnter("mute")}
                onMouseLeave={handleTooltipLeave}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleMuteClick(e);
                  }
                }}
                aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
              >
                {isMuted ? (
                  // Muted Icon - using mic_off SVG
                  <img
                    src="/images/mic_off.svg"
                    alt="Muted"
                    className="w-6 h-6"
                  />
                ) : (
                  // Unmuted Icon - using mic SVG
                  <img
                    src="/images/mic.svg"
                    alt="Unmuted"
                    className="w-6 h-6"
                  />
                )}
              </div>
              {activeTooltip === "mute" && (
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-[999]">
                  {isMuted ? "Unmute to speak" : "Mute"}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45 -mt-1"></div>
                </div>
              )}
            </div>
            {/* Stop/Disconnect Icon with Tooltip - Changed from button to div */}
            <div className="relative">
              <div
                className="w-8 h-8 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                onClick={handleStopClick}
                onMouseEnter={() => handleTooltipEnter("stop")}
                onMouseLeave={handleTooltipLeave}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleStopClick(e);
                  }
                }}
                aria-label="Stop voice call"
              >
                <img
                  src="/images/stop_circle.svg"
                  alt="Stop"
                  className="w-6 h-6"
                />
              </div>
              {activeTooltip === "stop" && (
                <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded whitespace-nowrap z-[999]">
                  Stop Call
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45 -mt-1"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    if (currentState.isConnecting) {
      return (
        <div className="flex items-center gap-3 w-full justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent"></div>
          <span>Connecting...</span>
        </div>
      );
    }

    // Default state
    return (
      <div className="flex items-center gap-3 w-full justify-center">
        <span>Discuss with AI</span>
        <img
          src="/images/record_voice_over.svg"
          alt="Voice Icon"
          className="w-5 h-5"
        />
      </div>
    );
  };

  // Get button classes based on current state
  const getButtonClasses = () => {
    const baseClasses =
      "ms-auto w-[220px] h-[48px] flex items-center justify-center border-none rounded-full px-4 py-3 font-medium transition-all duration-200 focus:border-0 focus:outline-0";

    if (isLoadingImpacts) {
      return `${baseClasses} opacity-50 cursor-progress bg-gradient-to-br from-[#CBFEFF] to-[#6ABCFF] text-gray-900`;
    }

    if (currentState.isActive) {
      return `${baseClasses} cursor-pointer bg-[#724cf9] text-white hover:bg-[#6244d1] shadow-lg shadow-purple-500/25`;
    }

    if (currentState.isConnecting) {
      return `${baseClasses} cursor-pointer bg-gradient-to-br from-[#CBFEFF] to-[#6ABCFF] text-gray-900 animate-pulse shadow-lg shadow-blue-500/25`;
    }

    // Default state
    const defaultClasses = `${baseClasses} cursor-pointer bg-gradient-to-br from-[#CBFEFF] to-[#6ABCFF] text-gray-900 hover:from-[#A0D8F0] hover:to-[#4A7AFF] hover:shadow-lg hover:shadow-blue-500/25 active:scale-95`;

    if (partialAccess) {
      return `${defaultClasses} opacity-70`;
    }

    return defaultClasses;
  };

  // Get button title based on current state
  const getButtonTitle = () => {
    if (currentState.isActive)
      return "Voice assistant active - use controls to manage";
    if (currentState.isConnecting) return "Connecting...";
    if (partialAccess) return "Login to use voice assistant";
    return "Start voice assistant";
  };

  return (
    <div className="relative group">
      <button
        className={getButtonClasses()}
        disabled={isLoadingImpacts}
        onClick={handleClick}
        onTouchEnd={(e) => {
          e.preventDefault();
          handleClick();
        }}
        title={getButtonTitle()}
      >
        {getButtonContent()}
      </button>

      {/* Connection status tooltip */}
      {currentState.isConnecting && (
        <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-gray-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg animate-fade-in">
          Connecting, please wait...
          <div className="absolute top-[-4px] left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
        </div>
      )}

      {/* Add fade-in animation for tooltip */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translate(-50%, 10px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default AudioWaveButton;
