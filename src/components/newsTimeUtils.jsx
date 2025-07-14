// newsTimeUtils.js

// Function to format news time consistently across the app
export const formatNewsTime = (timestamp, timeString = null) => {
  if (!timestamp) return "";

  let date;
  try {
    // Handle different timestamp formats
    date = typeof timestamp === "string" ? new Date(timestamp) : timestamp;

    // Check if date is valid
    if (isNaN(date.getTime())) return "";
  } catch (e) {
    return "";
  }

  // If we have a time string, create a more precise date with the time
  if (timeString) {
    try {
      const timeParts = timeString.split(":");
      if (timeParts.length >= 2) {
        const hours = parseInt(timeParts[0]);
        const minutes = parseInt(timeParts[1]);
        const seconds = timeParts.length > 2 ? parseInt(timeParts[2]) : 0;

        // Create a new date with the specific time
        date = new Date(date);
        date.setHours(hours, minutes, seconds, 0);
      }
    } catch (e) {
      // If parsing time fails, continue with original date
    }
  }

  const now = new Date();

  // Calculate different time formats based on how old the news is
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  // Format based on age of the news item
  if (diffMins < 60) {
    return `${diffMins} min ago`;
  } else if (diffHours < 24) {
    return diffHours === 1 ? `${diffHours} hour ago` : `${diffHours} hours ago`;
  }
  //  else if (diffDays < 7) {
  //   // For items within a week, show day of week
  //   const dayOfWeek = date.toLocaleDateString(undefined, { weekday: 'short' });
  //   return dayOfWeek;
  // }
  else {
    // For older items, show month and day
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
};

// Helper function to get a timestamp from a news item consistently
export const getNewsTimestamp = (newsItem) => {
  if (!newsItem) return null;

  // Try to get timestamp from different possible locations
  // Order matters - prioritize what you consider the most accurate
  if (newsItem.newsobj?.date) {
    return newsItem.newsobj.date;
  } else if (newsItem.created_at) {
    return newsItem.created_at;
  } else if (newsItem.date) {
    return newsItem.date;
  }

  return null;
};

// Helper function to get the time string from a news item
export const getNewsTimeString = (newsItem) => {
  if (!newsItem) return null;

  // Return the time field if it exists
  return newsItem.newsobj?.time || null;
};

// Function that combines the above to directly format a news item's time
export const formatNewsItemTime = (newsItem) => {
  const timestamp = getNewsTimestamp(newsItem);
  const timeString = getNewsTimeString(newsItem);
  return formatNewsTime(timestamp, timeString);
};
