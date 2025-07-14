import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import useWindowSize from "../hooks/useWindowSize"; // Import the window size hook

const UnderConstruction = ({ onGoBack }) => {
  const [time, setTime] = useState({ hours: 0, minutes: 0, seconds: 0 });

  // Get current theme from Redux store (same as SectorSidebar)
  const currentTheme = useSelector((state) => state.theme.currentTheme);
  const { width: windowWidth } = useWindowSize();

  // Calculate left menu width (same logic as your LeftMenu component)
  const getMenuWidth = () => {
    if (windowWidth < 640) {
      // Mobile: menu is overlay, so no margin needed
      return 0;
    } else {
      // Desktop: 60px when collapsed, 300px when expanded
      // Since we can't access menuVisible state here, we'll use the collapsed width (60px)
      // This ensures consistent layout
      return 60;
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setTime({
        hours: now.getHours(),
        minutes: now.getMinutes(),
        seconds: now.getSeconds(),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Generate random particles
  const particles = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    top: Math.random() * 100,
    size: Math.random() * 3 + 1,
    animationDelay: Math.random() * 5,
    animationDuration: Math.random() * 3 + 2,
  }));

  // Determine if dark mode (same logic as SectorSidebar)
  const isDarkMode =
    typeof currentTheme === "object"
      ? currentTheme.backgroundColor === "#000" ||
        currentTheme.navBg === "#1F2937"
      : currentTheme === "dark";

  // Theme-based styles
  const styles = {
    container: {
      backgroundColor:
        currentTheme.backgroundColor || (isDarkMode ? "#000" : "#ffffff"),
      color: currentTheme.textColor || (isDarkMode ? "#ffffff" : "#000000"),
      minHeight: "100%",
      marginLeft: `${getMenuWidth()}px`,
      width: `calc(100% - ${getMenuWidth()}px)`,
      transition: "margin-left 0.3s ease, width 0.3s ease",
    },
    particleColor: isDarkMode ? "#ffffff" : "#000000",
    headingColor:
      currentTheme.textColor || (isDarkMode ? "#ffffff" : "#000000"),
    descriptionColor:
      currentTheme.mutedText || (isDarkMode ? "#d1d5db" : "#6b7280"),
    particleOpacity: isDarkMode ? 0.2 : 0.1,
  };

  return (
    <div
      className="relative w-full h-full overflow-hidden flex items-center justify-center under-construction-container"
      style={styles.container}
    >
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full animate-float"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: styles.particleColor,
              opacity: styles.particleOpacity,
              animationDelay: `${particle.animationDelay}s`,
              animationDuration: `${particle.animationDuration}s`,
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center px-6 max-w-2xl mx-auto">
        {/* Construction Icon */}
        <div className="mb-4 md:mb-8">
          <div className="inline-flex items-center justify-center w-56">
            <img src="images/sage-login-img.png" />
          </div>
        </div>

        {/* This module is under activation Text */}
        <div className="mb-2 md:mb-4">
          <p
            className="text-2xl md:text-4xl font-semibold tracking-wide"
            style={{ color: styles.headingColor }}
          >
            This module is under activation
          </p>
        </div>

        {/* Main Heading */}
        <h1
          className="hidden text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 md:mb-8 leading-tight px-4"
          style={{ color: styles.headingColor }}
        >
          Our Website<span className="text-yellow-400">.</span>
        </h1>

        {/* Go Back Button */}
        <button
          onClick={onGoBack}
          className="mx-auto mt-5 lg:mt-10 flex items-center border-none rounded-full px-4 py-3 cursor-pointer font-medium bg-gradient-to-br from-[#CBFEFF] to-[#6ABCFF] text-gray-900"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Go Back
        </button>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg) scale(1);
            opacity: ${styles.particleOpacity};
          }
          25% {
            transform: translateY(-20px) rotate(90deg) scale(1.1);
            opacity: ${styles.particleOpacity * 1.5};
          }
          50% {
            transform: translateY(-10px) rotate(180deg) scale(0.9);
            opacity: ${styles.particleOpacity * 0.8};
          }
          75% {
            transform: translateY(-30px) rotate(270deg) scale(1.2);
            opacity: ${styles.particleOpacity * 1.2};
          }
        }

        .animate-float {
          animation: float 8s ease-in-out infinite;
          will-change: transform, opacity;
        }

        /* Ensure consistent theming */
        .text-yellow-400 {
          color: #facc15 !important;
        }

        /* Responsive adjustments */
        @media (max-width: 640px) {
          .under-construction-container {
            margin-left: 0 !important;
            width: 100% !important;
          }
        }

        /* Smooth particle movements */
        .animate-float:nth-child(even) {
          animation-direction: reverse;
        }

        .animate-float:nth-child(3n) {
          animation-duration: 6s;
        }

        .animate-float:nth-child(4n) {
          animation-duration: 10s;
        }
      `}</style>
    </div>
  );
};

UnderConstruction.propTypes = {
  onGoBack: PropTypes.func.isRequired,
};

export default UnderConstruction;
