import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { chatBot } from "../helpers/api";
import { setChatVisible } from "../store/slice/newsDetailsSlice";

const Chat = ({ chatEndRef }) => {
  const dispatch = useDispatch();
  const currentTheme = useSelector((state) => state.theme.currentTheme);
  const activeNewsId = useSelector((state) => state.newsDetails.activeNewsId);
  const chatQuery = useSelector((state) => state.newsDetails.chatQuery); // CHANGED: Use chatQuery instead of newsQuery
  const chatVisible = useSelector((state) => state.newsDetails.chatVisible);
  const [isTyping, setIsTyping] = useState(false);
  const [chatQueryInput, setChatQueryInput] = useState(""); // RENAMED: Make local state name more specific
  const [chatMessages, setChatMessages] = useState([]);
  const [hasAutoSubmitted, setHasAutoSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!chatQueryInput.trim()) return;

    // Add user message first
    const userMessage = { id: Date.now(), text: chatQueryInput, isUser: true };
    setChatMessages((prev) => [...prev, userMessage]);

    // Show typing indicator
    setIsTyping(true);
    setChatQueryInput("");

    try {
      const response = await chatBot(chatQueryInput, activeNewsId);
      // Add AI response
      const aiMessage = {
        id: Date.now() + 1,
        text: response.answer,
        isUser: false,
      };
      setChatMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.log("error", error);
      // Add error message
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I encountered an error. Please try again.",
        isUser: false,
      };
      setChatMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    // Scroll to bottom when messages change
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Auto-submit query from SpiderxSearchBar when chat opens - but only once
  useEffect(() => {
    if (chatQuery && chatQuery.trim() !== "" && !hasAutoSubmitted) {
      // Set the query in the input
      setChatQueryInput(chatQuery);

      // Auto-submit the query
      const submitQuery = async () => {
        const userMessage = { id: Date.now(), text: chatQuery, isUser: true };
        setChatMessages((prev) => [...prev, userMessage]);

        setIsTyping(true);
        setChatQueryInput("");
        try {
          const response = await chatBot(chatQuery, activeNewsId);
          const aiMessage = {
            id: Date.now() + 1,
            text: response.answer,
            isUser: false,
          };
          setChatMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
          const errorMessage = {
            id: Date.now() + 1,
            text: "Sorry, I encountered an error. Please try again.",
            isUser: false,
          };
          setChatMessages((prev) => [...prev, errorMessage]);
        } finally {
          setIsTyping(false);
        }
      };

      submitQuery();
      setHasAutoSubmitted(true); // Mark as auto-submitted to prevent multiple submissions
    }
  }, [chatQuery, activeNewsId, hasAutoSubmitted]); // CHANGED: Use chatQuery instead of newsQuery

  // Reset auto-submit flag when chat is closed and reopened or when chatQuery changes significantly
  useEffect(() => {
    // Reset the auto-submit flag if chatQuery becomes empty (chat was closed)
    if (!chatQuery || chatQuery.trim() === "") {
      setHasAutoSubmitted(false);
    }
  }, [chatQuery]); // CHANGED: Use chatQuery instead of newsQuery

  // Reset chat state when chat is closed
  useEffect(() => {
    if (!chatVisible) {
      // Reset all chat state when chat is closed for a fresh experience
      setChatMessages([]);
      setChatQueryInput("");
      setIsTyping(false);
      setHasAutoSubmitted(false);
    }
  }, [chatVisible]);

  const styles = {
    chatContainer: {
      position: "relative", // Changed from absolute to relative
      width: "100%", // Full width of parent container
      height: "400px",
      maxHeight: "60vh", // Limit maximum height
      backgroundColor: currentTheme.cardBg,
      borderTopLeftRadius: "15px",
      borderTopRightRadius: "15px",
      borderBottomLeftRadius: "15px",
      borderBottomRightRadius: "15px",
      boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.2)",
      display: "flex",
      flexDirection: "column",
      border: `1px solid ${currentTheme.borderColor}`,
      // marginBottom: "16px", // Add space between chat and search bar
    },
    chatHeader: {
      padding: "15px",
      borderBottom: `1px solid ${currentTheme.borderColor}`,
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    chatTitle: {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      color: currentTheme.textColor,
      fontWeight: "500",
    },
    closeChat: {
      background: "none",
      border: "none",
      color: currentTheme.textColor,
      fontSize: "1.2rem",
      cursor: "pointer",
    },
    chatMessages: {
      flex: 1,
      padding: "15px",
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
    },
    userMessage: {
      alignSelf: "flex-end",
      backgroundColor: currentTheme.accentColor,
      color: "#fff",
      padding: "10px 15px",
      borderRadius: "15px 15px 0 15px",
      maxWidth: "80%",
    },
    aiMessage: {
      alignSelf: "flex-start",
      backgroundColor: currentTheme.secondaryBg,
      color: currentTheme.textColor,
      padding: "10px 15px",
      borderRadius: "15px 15px 15px 0",
      maxWidth: "80%",
    },
    typingIndicator: {
      alignSelf: "flex-start",
      backgroundColor: currentTheme.secondaryBg,
      color: currentTheme.textColor,
      padding: "10px 15px",
      borderRadius: "15px 15px 15px 0",
      display: "flex",
      gap: "3px",
      alignItems: "center",
    },
    dot: {
      width: "8px",
      height: "8px",
      backgroundColor: currentTheme.textColor,
      borderRadius: "50%",
      animation: "bounce 1.5s infinite",
    },
    chatForm: {
      padding: "15px",
      borderTop: `1px solid ${currentTheme.borderColor}`,
      display: "flex",
      gap: "10px",
      width: "100%",
    },
    chatInput: {
      flex: 1,
      padding: "10px 15px",
      borderRadius: "20px",
      border: `1px solid ${currentTheme.borderColor}`,
      backgroundColor: currentTheme.secondaryBg,
      color: currentTheme.textColor,
      outline: "none",
      minWidth: 0,
    },
    sendButton: {
      backgroundColor: currentTheme.accentColor,
      color: "#fff",
      border: "none",
      borderRadius: "20px",
      padding: "0 20px",
      cursor: "pointer",
      flexShrink: 0,
    },
  };

  return (
    <div style={styles.chatContainer} className="chat-container">
      <div style={styles.chatHeader}>
        <div style={styles.chatTitle}>
          <img src="/images/discuss-ai.png" alt="AI" width="24" height="24" />
          SAGE AI Assistant
        </div>
        <button
          style={styles.closeChat}
          onClick={() => dispatch(setChatVisible(false))}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      </div>
      <div style={styles.chatMessages} className="globalScroll">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            style={msg.isUser ? styles.userMessage : styles.aiMessage}
          >
            {msg.text}
          </div>
        ))}

        {isTyping && (
          <div style={styles.typingIndicator}>
            <div style={{ ...styles.dot, animationDelay: "0s" }}></div>
            <div style={{ ...styles.dot, animationDelay: "0.2s" }}></div>
            <div style={{ ...styles.dot, animationDelay: "0.4s" }}></div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>
      <form style={styles.chatForm} onSubmit={handleSubmit}>
        <input
          style={styles.chatInput}
          type="text"
          placeholder="Type your message..."
          value={chatQueryInput}
          onChange={(e) => setChatQueryInput(e.target.value)}
        />
        <button style={styles.sendButton} type="submit">
          Send
        </button>
      </form>

      {/* Add mobile responsive styles */}
      <style jsx="true">{`
        @media (max-width: 480px) {
          .chat-container {
            height: 350px !important;
            margin-bottom: 12px !important;
          }
        }

        @keyframes bounce {
          0%,
          80%,
          100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
};

export default Chat;
