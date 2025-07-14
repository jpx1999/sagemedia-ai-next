import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { generatePodcast, getPodcast } from "../../helpers/api";

const AudioPlayer = () => {
  const currentTheme = useSelector((state) => state.theme.currentTheme);
  const activeNewsId = useSelector((state) => state.newsDetails.activeNewsId);
  const isLoadingImpacts = useSelector(
    (state) => state.newsDetails.isLoadingImpacts
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState("00:00");
  const [duration, setDuration] = useState("00:00");
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const audioRef = useRef(null);

  // Determine if we're using dark mode
  const isDarkMode =
    currentTheme &&
    (currentTheme === "dark" ||
      (typeof currentTheme === "object" &&
        currentTheme.backgroundColor === "#000"));

  function convertToHttps(response) {
    if (response.audio_file) {
      // Check if the URL starts with http: and replace with https:
      if (response.audio_file.startsWith("http:")) {
        response.audio_file = response.audio_file.replace(/^http:/, "https:");
      }
    }
    return response;
  }

  const handleGeneratePodcast = async (id) => {
    try {
      setLoading(true);
      setError(null);
      const response = await generatePodcast(id);
      if (response.audio_file) {
        await generateNewsPodcast();
      }
      // else if (response.status === 0) {
      //   await generateNewsPodcast();
      // } else {
      //   setError("Failed to generate podcast");
      //   return null;
      // }
    } catch (error) {
      console.error("Error generating podcast:", error);
      // if (error.code === "ECONNABORTED") {
      //   setError(
      //     "Podcast generation is taking longer than expected. Please try again in a few minutes."
      //   );
      // } else if (error.response?.status === 500) {
      //   setError(
      //     "Server error while generating podcast. Please try again later."
      //   );
      // } else if (error.response?.status === 429) {
      //   setError("Too many requests. Please wait a moment and try again.");
      // } else if (error.code === "ERR_NETWORK") {
      //   setError("Network error. Please check your connection and try again.");
      // } else if (error.response?.status === 404) {
      //   setError("Podcast service not found. Please contact support.");
      // } else {
      //   setError("Failed to generate podcast. Please try again.");
      // }
    } finally {
      setLoading(false);
    }
  };

  const generateNewsPodcast = async () => {
    if (!activeNewsId) {
      setError("No article selected");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setAudioUrl(""); // Clear previous audio
      let response = await getPodcast(Number(activeNewsId));
      console.log("response from audio player", response);

      if (response.status === 0) {
        // No podcast available, user will need to click Generate button
        return;
      }

      if (response.audio_file) {
        response = convertToHttps(response);
        setAudioUrl(response.audio_file);
      } else {
        setError("No podcast available for this article");
      }
    } catch (err) {
      console.error("Error fetching podcast:", err);
      setError("No podcast available for this article");
    } finally {
      setLoading(false);
    }
  };

  // Call generateNewsPodcast on mounting if conditions are met
  useEffect(() => {
    if (activeNewsId) {
      generateNewsPodcast();
    }
  }, [activeNewsId]);

  useEffect(() => {
    if (!audioUrl) return;

    // Create audio element
    audioRef.current = new Audio(audioUrl);

    // Set up event listeners
    audioRef.current.addEventListener("timeupdate", updateProgress);
    audioRef.current.addEventListener("loadedmetadata", setInitialDuration);
    audioRef.current.addEventListener("ended", handleEnded);

    // Cleanup function
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener("timeupdate", updateProgress);
        audioRef.current.removeEventListener(
          "loadedmetadata",
          setInitialDuration
        );
        audioRef.current.removeEventListener("ended", handleEnded);
      }
    };
  }, [audioUrl]);

  const setInitialDuration = () => {
    const totalSeconds = audioRef.current.duration;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    setDuration(
      `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`
    );
  };

  const updateProgress = () => {
    const currentSeconds = audioRef.current.currentTime;
    const totalSeconds = audioRef.current.duration;
    const progressPercent = (currentSeconds / totalSeconds) * 100;

    const minutes = Math.floor(currentSeconds / 60);
    const seconds = Math.floor(currentSeconds % 60);

    setCurrentTime(
      `${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`
    );
    setProgress(progressPercent);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime("00:00");
  };

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const skipForward = () => {
    audioRef.current.currentTime += 10;
  };

  const skipBackward = () => {
    audioRef.current.currentTime -= 10;
  };

  const toggleMute = () => {
    audioRef.current.muted = !audioRef.current.muted;
    setIsMuted(!isMuted);
  };

  const handleProgressClick = (e) => {
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;

    // Set the current time of the audio
    const newTime = (percentage / 100) * audioRef.current.duration;
    audioRef.current.currentTime = newTime;

    setProgress(percentage);
  };

  // Show loading state
  if (loading) {
    return (
      <div
        className={`xl:flex items-center p-2 lg:p-4 mb-6 rounded-xl ${
          isDarkMode ? "bg-[#22262A]" : "bg-gray-100"
        } border ${isDarkMode ? "border-gray-800" : "border-gray-200"}`}
      >
        <div className="text-center w-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#724CF9] mr-2"></div>
          <span className={`${isDarkMode ? "text-gray-500" : "text-gray-900"}`}>
            Generating Audio Podcast... (This may take a few minutes)
          </span>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div
        className={`xl:flex items-center p-2 lg:p-4 mb-6 rounded-xl ${
          isDarkMode ? "bg-[#22262A]" : "bg-gray-100"
        } border ${isDarkMode ? "border-gray-800" : "border-gray-200"}`}
      >
        <div className="text-center w-full">
          <span className={`text-gray-500 block mb-2`}>{error}</span>
          <button
            onClick={() => handleGeneratePodcast(Number(activeNewsId))}
            disabled={isLoadingImpacts || !activeNewsId || loading}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isLoadingImpacts || !activeNewsId || loading
                ? "bg-gray-400 text-gray-600 cursor-progress"
                : "bg-[#724CF9] text-white hover:bg-[#5a3cc7]"
            }`}
          >
            {loading ? (
              <span className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </span>
            ) : (
              "Try Again"
            )}
          </button>
        </div>
      </div>
    );
  }
  // Show generate button if no audio URL
  if (!audioUrl) {
    return (
      <div className="text-center w-full">
        <button
          onClick={() => handleGeneratePodcast(Number(activeNewsId))}
          disabled={isLoadingImpacts || !activeNewsId || loading}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isLoadingImpacts || !activeNewsId || loading
              ? "bg-gray-400 text-gray-600 cursor-progress"
              : "bg-[#724CF9] text-white hover:bg-[#5a3cc7]"
          }`}
        >
          {loading ? (
            <span className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating...
            </span>
          ) : (
            "Generate Podcast"
          )}
        </button>
      </div>
    );
  }

  return (
    <div
      className={`xl:flex items-center p-2 lg:p-4 mb-6 rounded-xl ${
        isDarkMode ? "bg-[#22262A]" : "bg-gray-100"
      } border ${isDarkMode ? "border-gray-800" : "border-gray-200"}`}
    >
      {/* Generate Podcast Button */}
      {/* <div className="mb-3 xl:mb-0 xl:mr-4">
        <button
          onClick={generateNewsPodcast}
          disabled={isLoadingImpacts || !activeNewsId || loading}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
            isLoadingImpacts || !activeNewsId || loading
              ? "bg-gray-400 text-gray-600 cursor-progress"
              : "bg-[#724CF9] text-white hover:bg-[#5a3cc7]"
          }`}
        >
          Generate Podcast
        </button>
      </div> */}

      <div className="flex items-center justify-between flex-1">
        <div className="flex items-center space-x-2 ml-1">
          <button
            className="w-8 h-8 bg-transparent flex items-center justify-center cursor-pointer"
            onClick={skipBackward}
          >
            <img
              src={
                isDarkMode
                  ? "/images/forward-play-light.svg"
                  : "/images/forward-play-dark.svg"
              }
              style={{ transform: "rotate(180deg)" }}
              alt="Backward 10s"
            />
          </button>
          <button
            className="relative w-10 h-10 rounded-full bg-[#724CF9] flex items-center justify-center cursor-pointer"
            onClick={togglePlay}
          >
            {isPlaying ? (
              <div className="w-3 h-3 bg-white rounded-sm"></div>
            ) : (
              <div className="w-0 h-0 border-t-[6px] border-b-[6px] border-l-[10px] border-t-transparent border-b-transparent border-l-white ml-1"></div>
            )}
          </button>

          <button
            className="w-8 h-8 bg-transparent flex items-center justify-center cursor-pointer"
            onClick={skipForward}
          >
            <img
              src={
                isDarkMode
                  ? "/images/forward-play-light.svg"
                  : "/images/forward-play-dark.svg"
              }
              alt="Forward 10s"
            />
          </button>

          <button
            className="w-8 h-8 bg-transparent flex items-center justify-center cursor-pointer"
            onClick={toggleMute}
          >
            <img
              src={
                isDarkMode
                  ? "/images/speaker-light.svg"
                  : "/images/speaker-dark.svg"
              }
              alt="Mute"
              style={{ opacity: isMuted ? 0.5 : 1 }}
            />
          </button>
        </div>

        <div
          className={`mx-2 text-sm ${isDarkMode ? "text-white" : "text-black"}`}
        >
          {currentTime}
        </div>

        <div
          className="relative flex-1 h-1 bg-gray-700 rounded-full cursor-pointer"
          onClick={handleProgressClick}
        >
          <div
            className="absolute left-0 top-0 h-1 bg-[#724CF9] rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
          <div
            className="absolute w-3 h-3 bg-[#724CF9] rounded-full -translate-y-1/2"
            style={{
              left: `${progress}%`,
              top: "50%",
              transform: "translate(-50%, -50%)",
            }}
          ></div>
        </div>

        <div
          className={`ml-2 text-sm ${isDarkMode ? "text-white" : "text-black"}`}
        >
          {duration}
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
