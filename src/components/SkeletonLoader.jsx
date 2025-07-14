import React from "react";
import { useSelector } from "react-redux";

const SkeletonLoader = ({ type, count = 1, className = "" }) => {
  const currentTheme = useSelector((state) => state.theme.currentTheme);
  
  // Determine if dark mode
  const isDarkMode =
    typeof currentTheme === "object"
      ? currentTheme.backgroundColor === "#000"
      : currentTheme !== "light";

  // Base skeleton styling with enhanced shimmer effect
  const baseClass = `skeleton-element relative overflow-hidden ${
    isDarkMode ? "bg-gray-800" : "bg-gray-200"
  } rounded`;
  
  // Create skeleton elements based on type with reduced heights
  const renderSkeleton = () => {
    switch (type) {
      case "news-item":
        return (
          <div className={`py-3 px-4 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
            <div className="flex items-center justify-between mb-2">
              <div className={`${baseClass} h-3 w-24`}></div>
              <div className={`${baseClass} h-5 w-28 rounded-full`}></div>
            </div>
            <div className={`${baseClass} h-4 w-full mb-2`}></div>
            <div className={`${baseClass} h-4 w-3/4 mb-2`}></div>
            <div className="flex gap-2">
              <div className={`${baseClass} h-6 w-28 rounded-md`}></div>
              <div className={`${baseClass} h-6 w-28 rounded-md`}></div>
            </div>
          </div>
        );
      
      case "news-detail":
        return (
          <div className="px-4 py-4">
            <div className={`${baseClass} h-6 w-3/4 mb-4`}></div>
            <div className={`${baseClass} h-3 w-32 mb-2`}></div>
            <div className={`${baseClass} h-24 w-full mb-4 rounded-xl`}></div>
            <div className={`${baseClass} h-4 w-full mb-2`}></div>
            <div className={`${baseClass} h-4 w-5/6 mb-2`}></div>
            <div className={`${baseClass} h-4 w-full mb-2`}></div>
            <div className={`${baseClass} h-4 w-4/5 mb-6`}></div>
            <div className={`${baseClass} h-48 w-full mb-4 rounded-xl`}></div>
          </div>
        );
      
      case "impact-card":
        return (
          <div className={`rounded-2xl ${isDarkMode ? "bg-black/50 border-gray-800" : "bg-white/50 border-gray-200"} border p-3 mb-3`}>
            <div className="flex justify-between items-center mb-3">
              <div className={`${baseClass} h-5 w-24`}></div>
              <div className={`${baseClass} h-5 w-16`}></div>
            </div>
            <div className={`${baseClass} h-3 w-full mb-2`}></div>
            <div className={`${baseClass} h-3 w-5/6 mb-2`}></div>
            <div className={`${baseClass} h-3 w-4/5`}></div>
          </div>
        );
      
      case "chart":
        return <div className={`${baseClass} h-56 w-full rounded-xl`}></div>;
      
      case "text-line":
        return <div className={`${baseClass} h-3 w-full mb-2`}></div>;
      
      default:
        return <div className={`${baseClass} h-4 w-full`}></div>;
    }
  };

  return (
    <div className={className}>
      {/* Light grey shimmer effect styles */}
      <style>{`
        @keyframes shimmerHighlight {
          0% {
            transform: translateX(-150%);
          }
          60%, 100% {
            transform: translateX(200%);
          }
        }
        
        .skeleton-element {
          position: relative;
          border-radius: 4px;
          overflow: hidden;
          background-color: ${isDarkMode ? '#1e1e1e' : '#e6e6e6'};
        }
        
        /* Light grey shimmer effect */
        .skeleton-element::after {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: -100%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            transparent 10%,
            ${isDarkMode 
              ? 'rgba(100, 100, 100, 0.15) 20%, rgba(160, 160, 160, 0.5) 50%, rgba(100, 100, 100, 0.15) 80%' 
              : 'rgba(230, 230, 230, 0.15) 20%, rgba(255, 255, 255, 0.8) 50%, rgba(230, 230, 230, 0.15) 80%'
            },
            transparent 90%,
            transparent 100%
          );
          width: 50%;
          animation: shimmerHighlight 2s cubic-bezier(0.4, 0.0, 0.2, 1) infinite;
          content: '';
          z-index: 1;
        }
        
        /* Make round corners more obvious for special elements */
        .skeleton-element.rounded-full::after,
        .skeleton-element.rounded-xl::after {
          border-radius: inherit;
        }
      `}</style>
      
      {Array(count)
        .fill(0)
        .map((_, index) => (
          <div key={index}>{renderSkeleton()}</div>
        ))}
    </div>
  );
};

export default SkeletonLoader;