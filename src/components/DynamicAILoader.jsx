import React, { useRef, useEffect, useState } from "react";

const DynamicAILoader = ({ isDarkMode }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [messageOpacity, setMessageOpacity] = useState(1);
  const [currentAnimation, setCurrentAnimation] = useState(0);

  const loadingMessages = [
    "Sage AI connecting to global data streams...",
    "Analyzing terabytes of market information...",
    "Cross-validating intelligence sources...",
    "Identifying critical patterns & anomalies...",
    "Synthesizing actionable insights...",
    "Curating your personalized briefing...",
  ];

  const animations = [
    "connecting",
    "analyzing",
    "crossValidating",
    "patterns",
    "synthesizing",
    "curating",
  ];

  // Handle message cycling
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessageOpacity(0);
      setTimeout(() => {
        setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
        setMessageOpacity(1);
      }, 350);
    }, 1600);

    return () => clearInterval(messageInterval);
  }, []);

  // Handle animation cycling - exact match to original code
  useEffect(() => {
    // Start immediately and cycle every 1.2 seconds
    const animationInterval = setInterval(() => {
      setCurrentAnimation((prev) => (prev + 1) % animations.length);
    }, 1200);

    return () => clearInterval(animationInterval);
  }, []);

  return (
    <div className="ai-loader-container">
      <div className="ai-loader">
        <div className="ai-loader-icon">
          <svg
            id="dynamicLoader"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 80 80"
            width="50"
            height="50"
          >
            <defs>
              {/* Enhanced gradients for Google-style depth */}
              <radialGradient id="sparkleGradient" cx="50%" cy="40%" r="60%">
                <stop
                  offset="0%"
                  style={{ stopColor: "#FFFFFF", stopOpacity: 1 }}
                />
                <stop
                  offset="25%"
                  style={{ stopColor: "#E0E7FF", stopOpacity: 0.95 }}
                />
                <stop
                  offset="60%"
                  style={{ stopColor: "#A78BFA", stopOpacity: 0.8 }}
                />
                <stop
                  offset="100%"
                  style={{ stopColor: "#7C3AED", stopOpacity: 0.5 }}
                />
              </radialGradient>

              <radialGradient id="coreGradient" cx="50%" cy="35%" r="65%">
                <stop
                  offset="0%"
                  style={{ stopColor: "#FFFFFF", stopOpacity: 1 }}
                />
                <stop
                  offset="30%"
                  style={{ stopColor: "#F3F4F6", stopOpacity: 0.9 }}
                />
                <stop
                  offset="65%"
                  style={{ stopColor: "#A78BFA", stopOpacity: 0.7 }}
                />
                <stop
                  offset="100%"
                  style={{ stopColor: "#7C3AED", stopOpacity: 0.4 }}
                />
              </radialGradient>

              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <filter
                id="innerGlow"
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feGaussianBlur stdDeviation="1.5" result="softGlow" />
                <feMerge>
                  <feMergeNode in="softGlow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* 1. CONNECTING - Expanding sparkle with connection waves */}
            <g
              id="connecting"
              style={{ display: currentAnimation === 0 ? "block" : "none" }}
              transform="translate(40,40)"
            >
              {/* Central sparkle with Google-style smooth morphing */}
              <g filter="url(#glow)">
                <path
                  d="M 0,-15 L 3,-3 L 15,0 L 3,3 L 0,15 L -3,3 L -15,0 L -3,-3 Z"
                  fill="url(#sparkleGradient)"
                  transform="scale(1)"
                >
                  <animateTransform
                    attributeName="transform"
                    type="scale"
                    values="0.8;1.1;0.9;1"
                    dur="1.2s"
                    repeatCount="indefinite"
                  />
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    additive="sum"
                    values="0;45;90;135"
                    dur="1.2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.9;1;0.8;1"
                    dur="1.2s"
                    repeatCount="indefinite"
                  />
                </path>
              </g>

              {/* Connection pulses - simplified for Google style */}
              <circle
                r="12"
                fill="none"
                stroke="#A78BFA"
                strokeWidth="0.8"
                opacity="0.5"
              >
                <animate
                  attributeName="r"
                  values="12;28;40"
                  dur="1.2s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.5;0.15;0"
                  dur="1.2s"
                  repeatCount="indefinite"
                />
              </circle>

              {/* Orbital sparkles */}
              {/* Removed orbital elements for cleaner Google-style look */}
            </g>

            {/* 2. ANALYZING - Morphing sparkle with data streams */}
            <g
              id="analyzing"
              style={{ display: currentAnimation === 1 ? "block" : "none" }}
              transform="translate(40,40)"
            >
              {/* Google-style morphing sparkle */}
              <g filter="url(#glow)">
                <path fill="url(#sparkleGradient)">
                  <animate
                    attributeName="d"
                    values="M 0,-15 L 3,-3 L 15,0 L 3,3 L 0,15 L -3,3 L -15,0 L -3,-3 Z;M 0,-12 L 5,-5 L 12,0 L 5,5 L 0,12 L -5,5 L -12,0 L -5,-5 Z;M 0,-18 L 2,-2 L 18,0 L 2,2 L 0,18 L -2,2 L -18,0 L -2,-2 Z;M 0,-15 L 3,-3 L 15,0 L 3,3 L 0,15 L -3,3 L -15,0 L -3,-3 Z"
                    dur="1.2s"
                    repeatCount="indefinite"
                  />
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    values="0;30;60;90"
                    dur="1.2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="1;0.8;1;0.9"
                    dur="1.2s"
                    repeatCount="indefinite"
                  />
                </path>
              </g>

              {/* Simplified data stream particles */}
              <g opacity="0.6">
                <circle r="1.5" fill="#FFFFFF">
                  <animateMotion dur="1.2s" repeatCount="indefinite">
                    <path d="M -20,-20 Q -8,-8 0,0" />
                  </animateMotion>
                  <animate
                    attributeName="opacity"
                    values="0;1;0"
                    dur="1.2s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle r="1.5" fill="#A78BFA">
                  <animateMotion
                    dur="1.2s"
                    repeatCount="indefinite"
                    begin="0.3s"
                  >
                    <path d="M 20,-20 Q 8,-8 0,0" />
                  </animateMotion>
                  <animate
                    attributeName="opacity"
                    values="0;1;0"
                    dur="1.2s"
                    repeatCount="indefinite"
                    begin="0.3s"
                  />
                </circle>
                <circle r="1.5" fill="#8B5CF6">
                  <animateMotion
                    dur="1.2s"
                    repeatCount="indefinite"
                    begin="0.6s"
                  >
                    <path d="M 20,20 Q 8,8 0,0" />
                  </animateMotion>
                  <animate
                    attributeName="opacity"
                    values="0;1;0"
                    dur="1.2s"
                    repeatCount="indefinite"
                    begin="0.6s"
                  />
                </circle>
              </g>
            </g>

            {/* 3. CROSS-VALIDATING - Multi-layer sparkle validation */}
            <g
              id="crossValidating"
              style={{ display: currentAnimation === 2 ? "block" : "none" }}
              transform="translate(40,40)"
            >
              {/* Main sparkle */}
              <g filter="url(#glow)">
                <path
                  d="M 0,-10 L 1.5,-1.5 L 10,0 L 1.5,1.5 L 0,10 L -1.5,1.5 L -10,0 L -1.5,-1.5 Z"
                  fill="url(#coreGradient)"
                >
                  <animateTransform
                    attributeName="transform"
                    type="scale"
                    values="1;1.2;0.9;1.1;1"
                    dur="1.2s"
                    repeatCount="indefinite"
                  />
                </path>
              </g>

              {/* Validation layers */}
              <g opacity="0.6">
                <path
                  d="M 0,-6 L 1,-1 L 6,0 L 1,1 L 0,6 L -1,1 L -6,0 L -1,-1 Z"
                  fill="none"
                  stroke="#A78BFA"
                  strokeWidth="1"
                >
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    values="0;90;180;270"
                    dur="1.2s"
                    repeatCount="indefinite"
                  />
                </path>
                <path
                  d="M 0,-8 L 1.2,-1.2 L 8,0 L 1.2,1.2 L 0,8 L -1.2,1.2 L -8,0 L -1.2,-1.2 Z"
                  fill="none"
                  stroke="#8B5CF6"
                  strokeWidth="1"
                >
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    values="270;180;90;0"
                    dur="1.2s"
                    repeatCount="indefinite"
                  />
                </path>
              </g>

              {/* Validation checkmarks */}
              <g opacity="0.8">
                <path
                  d="M -18,-18 l 2,2 l 4,-4"
                  stroke="#A78BFA"
                  strokeWidth="1.5"
                  fill="none"
                >
                  <animate
                    attributeName="opacity"
                    values="0;1;0"
                    dur="1.2s"
                    repeatCount="indefinite"
                  />
                </path>
                <path
                  d="M 14,-18 l 2,2 l 4,-4"
                  stroke="#8B5CF6"
                  strokeWidth="1.5"
                  fill="none"
                >
                  <animate
                    attributeName="opacity"
                    values="0;1;0"
                    dur="1.2s"
                    repeatCount="indefinite"
                    begin="0.3s"
                  />
                </path>
                <path
                  d="M 14,14 l 2,2 l 4,-4"
                  stroke="#7C3AED"
                  strokeWidth="1.5"
                  fill="none"
                >
                  <animate
                    attributeName="opacity"
                    values="0;1;0"
                    dur="1.2s"
                    repeatCount="indefinite"
                    begin="0.6s"
                  />
                </path>
                <path
                  d="M -18,14 l 2,2 l 4,-4"
                  stroke="#A855F7"
                  strokeWidth="1.5"
                  fill="none"
                >
                  <animate
                    attributeName="opacity"
                    values="0;1;0"
                    dur="1.2s"
                    repeatCount="indefinite"
                    begin="0.9s"
                  />
                </path>
              </g>
            </g>

            {/* 4. PATTERNS - Sparkle with pattern matrix */}
            <g
              id="patterns"
              style={{ display: currentAnimation === 3 ? "block" : "none" }}
              transform="translate(40,40)"
            >
              {/* Central sparkle */}
              <g filter="url(#innerGlow)">
                <path
                  d="M 0,-11 L 1.8,-1.8 L 11,0 L 1.8,1.8 L 0,11 L -1.8,1.8 L -11,0 L -1.8,-1.8 Z"
                  fill="url(#sparkleGradient)"
                >
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    values="0;45;90;135"
                    dur="1.2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="1;0.7;1;0.9"
                    dur="1.2s"
                    repeatCount="indefinite"
                  />
                </path>
              </g>

              {/* Pattern recognition grid */}
              <g opacity="0.4" stroke="#7C3AED" strokeWidth="0.3" fill="none">
                <line x1="-20" y1="-15" x2="20" y2="-15" />
                <line x1="-20" y1="-5" x2="20" y2="-5" />
                <line x1="-20" y1="5" x2="20" y2="5" />
                <line x1="-20" y1="15" x2="20" y2="15" />
                <line x1="-15" y1="-20" x2="-15" y2="20" />
                <line x1="-5" y1="-20" x2="-5" y2="20" />
                <line x1="5" y1="-20" x2="5" y2="20" />
                <line x1="15" y1="-20" x2="15" y2="20" />
              </g>

              {/* Pattern detection points */}
              <g>
                <circle cx="-15" cy="-15" r="1.5" fill="#A78BFA">
                  <animate
                    attributeName="opacity"
                    values="0;1;0"
                    dur="0.24s"
                    repeatCount="5"
                    begin="0s"
                  />
                </circle>
                <circle cx="-5" cy="-15" r="1.5" fill="#A78BFA">
                  <animate
                    attributeName="opacity"
                    values="0;1;0"
                    dur="0.24s"
                    repeatCount="5"
                    begin="0.24s"
                  />
                </circle>
                <circle cx="5" cy="-15" r="1.5" fill="#A78BFA">
                  <animate
                    attributeName="opacity"
                    values="0;1;0"
                    dur="0.24s"
                    repeatCount="5"
                    begin="0.48s"
                  />
                </circle>
                <circle cx="15" cy="-5" r="1.5" fill="#8B5CF6">
                  <animate
                    attributeName="opacity"
                    values="0;1;0"
                    dur="0.24s"
                    repeatCount="5"
                    begin="0.72s"
                  />
                </circle>
                <circle cx="5" cy="5" r="1.5" fill="#7C3AED">
                  <animate
                    attributeName="opacity"
                    values="0;1;0"
                    dur="0.24s"
                    repeatCount="5"
                    begin="0.96s"
                  />
                </circle>
              </g>
            </g>

            {/* 5. SYNTHESIZING - Converging sparkle fusion */}
            <g
              id="synthesizing"
              style={{ display: currentAnimation === 4 ? "block" : "none" }}
              transform="translate(40,40)"
            >
              {/* Multi-layer synthesis sparkle */}
              <g filter="url(#glow)">
                {/* Outer layer */}
                <path
                  d="M 0,-14 L 2,-2 L 14,0 L 2,2 L 0,14 L -2,2 L -14,0 L -2,-2 Z"
                  fill="url(#sparkleGradient)"
                  opacity="0.6"
                >
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    values="0;90;180;270"
                    dur="1.2s"
                    repeatCount="indefinite"
                  />
                  <animateTransform
                    attributeName="transform"
                    type="scale"
                    additive="sum"
                    values="1;1.4;1;1.2"
                    dur="1.2s"
                    repeatCount="indefinite"
                  />
                </path>
                {/* Inner layer */}
                <path
                  d="M 0,-8 L 1.2,-1.2 L 8,0 L 1.2,1.2 L 0,8 L -1.2,1.2 L -8,0 L -1.2,-1.2 Z"
                  fill="url(#coreGradient)"
                  opacity="0.9"
                >
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    values="270;180;90;0"
                    dur="1.2s"
                    repeatCount="indefinite"
                  />
                </path>
              </g>

              {/* Synthesis streams */}
              <g opacity="0.8">
                <circle r="1.5" fill="#FFFFFF">
                  <animateMotion dur="1.2s" repeatCount="indefinite">
                    <path d="M -25,-25 C -15,-15 -5,-5 0,0" />
                  </animateMotion>
                  <animate
                    attributeName="opacity"
                    values="0;1;0"
                    dur="1.2s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle r="1.5" fill="#A78BFA">
                  <animateMotion
                    dur="1.2s"
                    repeatCount="indefinite"
                    begin="0.3s"
                  >
                    <path d="M 25,-25 C 15,-15 5,-5 0,0" />
                  </animateMotion>
                  <animate
                    attributeName="opacity"
                    values="0;1;0"
                    dur="1.2s"
                    repeatCount="indefinite"
                    begin="0.3s"
                  />
                </circle>
                <circle r="1.5" fill="#8B5CF6">
                  <animateMotion
                    dur="1.2s"
                    repeatCount="indefinite"
                    begin="0.6s"
                  >
                    <path d="M 25,25 C 15,15 5,5 0,0" />
                  </animateMotion>
                  <animate
                    attributeName="opacity"
                    values="0;1;0"
                    dur="1.2s"
                    repeatCount="indefinite"
                    begin="0.6s"
                  />
                </circle>
                <circle r="1.5" fill="#7C3AED">
                  <animateMotion
                    dur="1.2s"
                    repeatCount="indefinite"
                    begin="0.9s"
                  >
                    <path d="M -25,25 C -15,15 -5,5 0,0" />
                  </animateMotion>
                  <animate
                    attributeName="opacity"
                    values="0;1;0"
                    dur="1.2s"
                    repeatCount="indefinite"
                    begin="0.9s"
                  />
                </circle>
              </g>
            </g>

            {/* 6. CURATING - Final sparkle with refinement aura */}
            <g
              id="curating"
              style={{ display: currentAnimation === 5 ? "block" : "none" }}
              transform="translate(40,40)"
            >
              {/* Perfect sparkle */}
              <g filter="url(#glow)">
                <path
                  d="M 0,-12 L 2,-2 L 12,0 L 2,2 L 0,12 L -2,2 L -12,0 L -2,-2 Z"
                  fill="url(#coreGradient)"
                >
                  <animateTransform
                    attributeName="transform"
                    type="scale"
                    values="1;1.1;1;1.05"
                    dur="1.2s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.9;1;0.9;1"
                    dur="1.2s"
                    repeatCount="indefinite"
                  />
                </path>
              </g>

              {/* Quality aura */}
              <circle
                r="16"
                fill="none"
                stroke="url(#sparkleGradient)"
                strokeWidth="1"
                opacity="0.4"
              >
                <animate
                  attributeName="r"
                  values="16;20;16;18"
                  dur="1.2s"
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.4;0.1;0.4;0.2"
                  dur="1.2s"
                  repeatCount="indefinite"
                />
              </circle>

              {/* Refinement particles */}
              <g opacity="0.7">
                <circle cx="18" cy="-8" r="1" fill="#FFFFFF">
                  <animate
                    attributeName="opacity"
                    values="0;1;0;1"
                    dur="1.2s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle cx="-18" cy="8" r="1" fill="#A78BFA">
                  <animate
                    attributeName="opacity"
                    values="0;1;0;1"
                    dur="1.2s"
                    repeatCount="indefinite"
                    begin="0.3s"
                  />
                </circle>
                <circle cx="8" cy="18" r="1" fill="#8B5CF6">
                  <animate
                    attributeName="opacity"
                    values="0;1;0;1"
                    dur="1.2s"
                    repeatCount="indefinite"
                    begin="0.6s"
                  />
                </circle>
              </g>
            </g>
          </svg>
        </div>
        <div className="ai-loader-text" style={{ opacity: messageOpacity }}>
          {loadingMessages[currentMessageIndex]}
        </div>
      </div>

      <style jsx>{`
        .ai-loader-container {
          padding: 0;
          margin-bottom: 10px;
        }

        .ai-loader {
          padding: 0.5rem;
          background-color: ${isDarkMode ? "#111827" : "#f7fafc"};
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          position: relative;
          overflow: hidden;
          border: 1px solid ${isDarkMode ? "#111827" : "#e2e8f0"};
          min-height: 60px;
          transition: opacity 0.4s ease-out;
        }

        .ai-loader::after {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 75%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(124, 58, 237, 0.3),
            transparent
          );
          animation: shimmer 2.2s infinite linear;
        }

        @keyframes shimmer {
          0% {
            left: -75%;
          }
          100% {
            left: 125%;
          }
        }

        .ai-loader-icon {
          margin-right: 0.85rem;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .ai-loader-text {
          font-size: 0.875rem;
          font-weight: 300;
          color: ${isDarkMode ? "#e5e7eb" : "#374151"};
          z-index: 1;
          text-align: left;
          flex-grow: 1;
          transition: opacity 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default DynamicAILoader;
