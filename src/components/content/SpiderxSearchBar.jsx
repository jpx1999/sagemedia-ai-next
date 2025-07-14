// SpiderxSearchBar.jsx
import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setChatVisible,
  setChatQuery, // CHANGED: Use setChatQuery instead of setNewsQuery
} from "../../store/slice/newsDetailsSlice";

const SpiderxSearchBar = ({ partialAccess = false, onLoginRequired }) => {
  const dispatch = useDispatch();
  // Use local state instead of Redux newsQuery to avoid interference with Header search
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const inputRef = useRef(null);

  const handleSubmit = () => {
    if (partialAccess && onLoginRequired) {
      onLoginRequired();
      return;
    }

    if (localSearchQuery.trim() !== "") {
      const queryToSubmit = localSearchQuery.trim();

      // Use setChatQuery instead of setNewsQuery to avoid conflicts with header search
      dispatch(setChatQuery(queryToSubmit));
      dispatch(setChatVisible(true));

      // Clear the input immediately
      setLocalSearchQuery("");

      // Clear the Redux state after a short delay to prevent interference with header search
      setTimeout(() => {
        dispatch(setChatQuery(""));
      }, 1000); // Give chat component enough time to read and process the query
    }
  };

  const handleInputChange = (e) => {
    if (partialAccess && onLoginRequired) {
      onLoginRequired();
      return;
    }
    setLocalSearchQuery(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (partialAccess && onLoginRequired) {
      onLoginRequired();
      return;
    }

    if (e.key === "Enter" && localSearchQuery.trim() !== "") {
      handleSubmit();
    }
  };

  const handleInputClick = (e) => {
    if (partialAccess && onLoginRequired) {
      e.preventDefault();
      onLoginRequired();
      return;
    }
  };

  const handleInputFocus = (e) => {
    if (partialAccess && onLoginRequired) {
      e.preventDefault();
      onLoginRequired();
      return;
    }
  };

  // const toggleRecording = () => {
  //   setIsRecording(!isRecording);
  //   // Simulate voice recording with a timeout
  //   if (!isRecording) {
  //     setTimeout(() => {
  //       setIsRecording(false);
  //       setLocalSearchQuery(
  //         (prev) => prev + " (voice transcription would appear here)"
  //       );
  //       inputRef.current?.focus();
  //     }, 3000);
  //   }
  // };

  return (
    <div
      className="md:py-2 md:px-3 py-1 px-2"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        backgroundColor: "#fff",
        borderRadius: "50px",
        fontSize: "16px",
        fontWeight: "300",
        boxShadow: isRecording ? "0 0 0 2px #724CF9" : "none",
        transition: "all 0.2s ease",
        border: "2px solid #374151",
        opacity: partialAccess ? 0.7 : 1,
      }}
    >
      <input
        className="sm:py-[10px] py-[5px]"
        ref={inputRef}
        type="text"
        placeholder={
          partialAccess
            ? "Login to ask questions..."
            : "Ask anything related to this News..."
        }
        style={{
          flex: 1,
          backgroundColor: "transparent",
          border: "none",
          color: "#000",
          outline: "none",
          fontWeight: "500",
          cursor: partialAccess ? "pointer" : "text",
        }}
        value={localSearchQuery}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        onClick={handleInputClick}
        onFocus={handleInputFocus}
        readOnly={partialAccess}
      />

      {/* Animated Mic Button */}

      {/* <button
        className="relative overflow-hidden rounded-[50%] w-10 "
        style={{
          minWidth: "25px",
        }}
        tabIndex="0"
        onClick={toggleRecording}
      >
        <img
          src="/images/microphone.png"
          alt="Mic"
          className="absolute left-[50%] top-[50%]  w-[40%] translate-x-[-50%] translate-y-[-50%]"
        />
        <img src="/images/voice.gif" alt="Send" />
      </button> */}

      <button
        className="w-10"
        style={{
          minWidth: "25px",
          border: "2px solid #724CF9",
          borderRadius: "50%",
          cursor: partialAccess
            ? "pointer"
            : localSearchQuery.trim() !== ""
            ? "pointer"
            : "default",
          opacity: partialAccess ? 0.7 : 1,
        }}
        onClick={handleSubmit}
        disabled={partialAccess || localSearchQuery.trim() === ""}
      >
        <img src="/images/submit-bot-queary.svg" alt="Send" />
      </button>
    </div>
  );
};

export default SpiderxSearchBar;
