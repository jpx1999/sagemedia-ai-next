import React from "react";
import { useSelector } from "react-redux";

const RemainingSearch = ({ darkMode }) => {
  const maxLimit = useSelector((state) => state.newsDetails.maxLimit);
  const searchCount = useSelector((state) => state.newsDetails.searchCount);
  const remainingSearch = maxLimit - searchCount;
  const percentage = (remainingSearch / maxLimit) * 100;

  return (
    <div className="flex flex-col gap-1 pr-3 sm:py-2">
      {/* Text */}
      <div
        className={`text-sm font-normal ${
          darkMode ? "text-gray-400" : "text-gray-600"
        } whitespace-nowrap`}
      >
        Remaining Searches/Hour: {remainingSearch}/{maxLimit}
      </div>

      {/* Progress Bar Container */}
      <div
        className={`hidden sm:block w-full h-1.5 rounded-full ${
          darkMode ? "bg-gray-700" : "bg-gray-200"
        } relative overflow-hidden`}
      >
        {/* Progress Bar Fill */}
        <div
          className={`h-full rounded-full transition-all duration-300 ease-out ${
            percentage === 0
              ? ""
              : percentage > 50
              ? "bg-gradient-to-r from-green-400 to-green-500"
              : percentage > 20
              ? "bg-gradient-to-r from-orange-400 to-orange-500"
              : "bg-gradient-to-r from-red-400 to-red-500"
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    </div>
  );
};

export default RemainingSearch;
