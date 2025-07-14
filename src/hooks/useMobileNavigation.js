import { useEffect } from 'react';

export const useMobileNavigation = () => {
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;

    // Dynamic import of jQuery to avoid SSR issues
    const loadJQuery = async () => {
      const $ = (await import('jquery')).default;

      // Function to check if content should be shown on mobile (for direct URLs only)
      function showContentForDirectMobileAccess() {
        // Only run on mobile screens and only once on initial load
        if ($(window).width() < 768) {
          // Check if we have a newsId in the URL path
          const currentPath = window.location.pathname;
          const hasNewsId =
            currentPath.includes("/newsid/") ||
            currentPath.includes("/news-intelligence/newsid/");

          // Only apply if we have a newsId and container is not already positioned
          if (hasNewsId && $(".mobile-container").css("position") !== "fixed") {
            // Show content immediately without animation for direct URL access
            $(".mobile-container").css({
              position: "fixed",
              top: "0",
              left: "0", // Show content directly
              bottom: "0",
              width: "100%",
              "z-index": "999",
              transition: "none",
            });

            // Make back button visible with flex display
            $(".mobile-back-btn")
              .css({
                display: "flex",
              })
              .show();
          }
        }
      }

      // Function to handle news item click
      function handleNewsItemClick() {
        if ($(window).width() < 768) {
          // First set the initial position
          $(".mobile-container").css({
            position: "fixed",
            top: "0",
            left: "100%", // Start from right side (outside viewport)
            bottom: "0",
            width: "100%",
            "z-index": "999",
            transition: "none", // Ensure no transition yet
          });

          // Force a reflow to ensure the initial position is applied
          $(".mobile-container")[0].offsetHeight;

          // Then animate with slower transition (increased from 0.4s to 0.8s)
          $(".mobile-container").css({
            transition: "left 0.8s ease-in-out", // Slower animation with ease-in-out
            left: "0",
          });

          // Make back button visible with flex display
          $(".mobile-back-btn")
            .css({
              display: "flex",
            })
            .show();
        }
      }

      // Function to handle back button click
      function handleBackButtonClick() {
        if ($(window).width() < 768) {
          // Animate back to right with slower transition
          $(".mobile-container").css({
            transition: "left 0.8s ease-in-out", // Slower animation with ease-in-out
            left: "100%",
          });

          // Reset position after animation completes
          setTimeout(function () {
            $(".mobile-container").css({
              position: "relative",
              top: "",
              left: "",
              bottom: "",
              width: "",
              "z-index": "",
              transition: "",
            });
            // Hide back button when going back to sidebar
            $(".mobile-back-btn").hide();
          }, 800); // Same as transition duration
        }
      }

      // Check on initial load if content should be shown (only for direct URL access on mobile)
      if ($(window).width() < 768) {
        // Small delay to ensure DOM is ready
        setTimeout(showContentForDirectMobileAccess, 300);
      }

      // Listen for browser navigation events (back/forward buttons) - only on mobile
      $(window).on("popstate", function () {
        if ($(window).width() < 768) {
          setTimeout(showContentForDirectMobileAccess, 200);
        }
      });

      // Attach click handler to news items
      $(document).on("click", ".news-item", handleNewsItemClick);

      // Attach click handler to back button
      $(document).on("click", ".mobile-back-btn", handleBackButtonClick);

      // Cleanup function
      return () => {
        $(window).off("popstate");
        $(document).off("click", ".news-item", handleNewsItemClick);
        $(document).off("click", ".mobile-back-btn", handleBackButtonClick);
      };
    };

    // Load jQuery and set up handlers
    loadJQuery().then(cleanup => {
      // Store cleanup function for useEffect cleanup
      return cleanup;
    });

    // Cleanup on unmount
    return () => {
      if (typeof window !== 'undefined' && window.$) {
        const $ = window.$;
        $(window).off("popstate");
        $(document).off("click", ".news-item");
        $(document).off("click", ".mobile-back-btn");
      }
    };
  }, []);
}; 