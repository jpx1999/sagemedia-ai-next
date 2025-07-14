import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";

const DynamicMeta = ({
  newsItem = null,
  headline = "",
  activeHeadline = "",
  newsDetails = null,
  activeNewsId = null,
  loading = false,
  defaultTitle = "News Intelligence Dashboard | SAGE by SpiderX.AI",
  defaultDescription = "Access SAGE's AI-powered news intelligence dashboard. Analyze global news with advanced insights, real-time updates, and comprehensive market impact analysis.",
}) => {
  // Validate URL
  function isValidUrl(string) {
    if (!string || typeof string !== "string") return false;
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  // Function to safely decode HTML entities
  const decodeEntities = (text) => {
    if (!text || typeof text !== "string") return "";
    try {
      const textarea = document.createElement("textarea");
      textarea.innerHTML = text;
      return textarea.value;
    } catch (error) {
      return text;
    }
  };

  // Extract news data safely
  const newsObj = newsItem?.newsobj || newsDetails?.results?.[0]?.newsobj || {};
  const newsResult = newsDetails?.results?.[0] || {};

  // Enhanced function to get clean headline with better fallback logic
  const getCleanHeadline = () => {
    // Try multiple possible headline sources in order of priority
    const rawHeadline =
      headline || // Prop passed directly
      activeHeadline || // Active headline from state
      newsItem?.headline || // From menu item
      newsItem?.title || // From menu item (alternative field)
      newsResult?.headline || // From news details result
      newsResult?.title || // From news details result (alternative)
      newsObj?.headline || // From nested newsobj
      newsObj?.title || // From nested newsobj (alternative)
      newsObj?.news_headline || // Alternative field name
      newsObj?.text || // Sometimes headline is in text field
      "";

    if (!rawHeadline) return "";

    let cleanHeadline = rawHeadline.replace(/&#039;/g, "'");
    cleanHeadline = cleanHeadline.replace(/&quot;/g, '"');
    cleanHeadline = cleanHeadline.replace(/&amp;/g, "&");
    cleanHeadline = cleanHeadline.replace(/&lt;/g, "<");
    cleanHeadline = cleanHeadline.replace(/&gt;/g, ">");

    return decodeEntities(cleanHeadline);
  };

  const cleanHeadline = getCleanHeadline();

  // Enhanced summary extraction
  const summary =
    newsObj?.summary ||
    newsObj?.what_is_this_news ||
    newsObj?.description ||
    newsResult?.summary ||
    newsResult?.description ||
    newsResult?.text ||
    "";

  // Clean summary for meta description
  const cleanSummary = summary
    ? decodeEntities(summary.replace(/<[^>]*>/g, ""))
    : "";

  // Enhanced image extraction
  const newsImage =
    newsObj?.news_image ||
    newsObj?.image ||
    newsObj["image/video"] ||
    newsResult?.image ||
    newsResult?.news_image ||
    "";

  const source = newsObj?.source || newsResult?.source || "";
  const publishedTime =
    newsItem?.created_at ||
    newsResult?.created_at ||
    newsObj?.date ||
    newsObj?.published_at ||
    newsObj?.created_at ||
    "";

  // Build meta data with enhanced logic
  const pageTitle = cleanHeadline
    ? `${cleanHeadline} | SAGE News Intelligence`
    : loading && activeNewsId
    ? "Loading News Article | SAGE News Intelligence"
    : defaultTitle;

  const pageDescription = cleanSummary
    ? cleanSummary.substring(0, 160) + (cleanSummary.length > 160 ? "..." : "")
    : loading && activeNewsId
    ? "Loading comprehensive AI-powered news analysis and market impact insights..."
    : defaultDescription;

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  // Use news image or fallback to default
  const imageUrl =
    newsImage && isValidUrl(newsImage)
      ? newsImage
      : typeof window !== "undefined"
      ? `${window.location.origin}/images/sage-og-image.jpg`
      : "https://sagemedia.ai/images/sage-og-image.jpg";

  // Enhanced keywords generation
  const generateKeywords = () => {
    const baseKeywords =
      "news intelligence, AI news analysis, market impact, financial news, real-time analysis, SpiderX.AI, SAGE";

    if (cleanHeadline) {
      const headlineKeywords = cleanHeadline
        .split(" ")
        .filter((word) => word.length > 3) // Filter out small words
        .slice(0, 8) // Take first 8 meaningful words
        .join(", ");
      return `${headlineKeywords}, ${baseKeywords}`;
    }

    if (source) {
      return `${source}, ${baseKeywords}`;
    }

    return baseKeywords;
  };

  // 🚀 ENHANCED PRERENDER.IO READY SIGNAL - COMPLETE FIX
  useEffect(() => {
    if (cleanHeadline) {
      // Update document title immediately
      document.title = `${cleanHeadline} | SAGE News Intelligence`;

      // Update all meta tags immediately via DOM manipulation
      const metaDescription = document.querySelector(
        'meta[name="description"]'
      );
      if (metaDescription && pageDescription) {
        metaDescription.setAttribute("content", pageDescription);
      }

      // Update Open Graph title
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute("content", pageTitle);
      }

      // Update Open Graph description
      const ogDescription = document.querySelector(
        'meta[property="og:description"]'
      );
      if (ogDescription && pageDescription) {
        ogDescription.setAttribute("content", pageDescription);
      }

      // Update Open Graph image
      const ogImage = document.querySelector('meta[property="og:image"]');
      if (ogImage && imageUrl) {
        ogImage.setAttribute("content", imageUrl);
      }

      // Update Open Graph URL
      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl && currentUrl) {
        ogUrl.setAttribute("content", currentUrl);
      }

      // Update Twitter title
      const twitterTitle = document.querySelector('meta[name="twitter:title"]');
      if (twitterTitle) {
        twitterTitle.setAttribute("content", pageTitle);
      }

      // Update Twitter description
      const twitterDescription = document.querySelector(
        'meta[name="twitter:description"]'
      );
      if (twitterDescription && pageDescription) {
        twitterDescription.setAttribute("content", pageDescription);
      }

      // Update Twitter image
      const twitterImage = document.querySelector('meta[name="twitter:image"]');
      if (twitterImage && imageUrl) {
        twitterImage.setAttribute("content", imageUrl);
      }

      // Update canonical URL
      const canonicalLink = document.querySelector('link[rel="canonical"]');
      if (canonicalLink && currentUrl) {
        canonicalLink.setAttribute("href", currentUrl);
      }

      // 🚀 ENHANCED: Multiple aggressive Prerender.io signals with proper timing
      if (typeof window !== "undefined") {
        // First signal - immediate (after DOM updates)
        setTimeout(() => {
          window.prerenderReady = true;
          console.log("📄 PRERENDER READY: Signal 1/4 sent", {
            title: pageTitle,
            ogTitle: document.querySelector('meta[property="og:title"]')
              ?.content,
            description: pageDescription,
            image: imageUrl,
            timestamp: new Date().toISOString(),
            signal: 1,
          });

          // Dispatch custom event for additional confirmation
          if (typeof window.dispatchEvent === "function") {
            window.dispatchEvent(
              new CustomEvent("prerenderReady", {
                detail: {
                  title: pageTitle,
                  description: pageDescription,
                  signal: 1,
                  source: "DynamicMeta-immediate",
                },
              })
            );
          }
        }, 200);

        // Second signal - after React Helmet updates
        setTimeout(() => {
          window.prerenderReady = true;
          console.log("📄 PRERENDER READY: Signal 2/4 sent", {
            title: document.title,
            ogTitle: document.querySelector('meta[property="og:title"]')
              ?.content,
            signal: 2,
          });

          // Force another event
          if (typeof window.dispatchEvent === "function") {
            window.dispatchEvent(
              new CustomEvent("prerenderContentReady", {
                detail: { signal: 2, source: "DynamicMeta-helmet" },
              })
            );
          }
        }, 600);

        // Third signal - extended delay for slow networks
        setTimeout(() => {
          window.prerenderReady = true;
          console.log("📄 PRERENDER READY: Signal 3/4 sent", {
            signal: 3,
            finalCheck: true,
          });

          if (typeof window.dispatchEvent === "function") {
            window.dispatchEvent(new Event("prerenderComplete"));
          }
        }, 1200);

        // Final signal - last chance with comprehensive logging
        setTimeout(() => {
          window.prerenderReady = true;
          console.log("📄 PRERENDER READY: Signal 4/4 (FINAL) sent");

          // Log comprehensive final state for debugging
          const finalState = {
            documentTitle: document.title,
            ogTitle: document.querySelector('meta[property="og:title"]')
              ?.content,
            ogDescription: document.querySelector(
              'meta[property="og:description"]'
            )?.content,
            ogImage: document.querySelector('meta[property="og:image"]')
              ?.content,
            ogUrl: document.querySelector('meta[property="og:url"]')?.content,
            twitterTitle: document.querySelector('meta[name="twitter:title"]')
              ?.content,
            twitterDescription: document.querySelector(
              'meta[name="twitter:description"]'
            )?.content,
            twitterImage: document.querySelector('meta[name="twitter:image"]')
              ?.content,
            canonical: document.querySelector('link[rel="canonical"]')?.href,
            prerenderReady: window.prerenderReady,
            timestamp: new Date().toISOString(),
          };

          console.log("📊 FINAL STATE FOR PRERENDER.IO:", finalState);

          // Final event dispatch
          if (typeof window.dispatchEvent === "function") {
            window.dispatchEvent(
              new CustomEvent("prerenderFinalReady", {
                detail: finalState,
              })
            );
          }

          // Set a flag to indicate meta updates are complete
          window.metaUpdatesComplete = true;
        }, 2000);
      }
    }
  }, [cleanHeadline, pageTitle, pageDescription, imageUrl, currentUrl]);

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />

      {/* Open Graph Tags for Social Sharing */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="SAGE by SpiderX.AI" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:site" content="@SpiderXAI" />
      <meta name="twitter:creator" content="@SpiderXAI" />

      {/* Article specific meta tags */}
      {publishedTime && (
        <>
          <meta property="article:published_time" content={publishedTime} />
          <meta property="article:modified_time" content={publishedTime} />
        </>
      )}
      {source && <meta property="article:author" content={source} />}
      <meta property="article:section" content="Financial News" />
      <meta property="article:tag" content="AI Analysis" />
      <meta property="article:tag" content="Market Intelligence" />

      {/* Additional SEO tags */}
      <meta
        name="robots"
        content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
      />
      <link rel="canonical" href={currentUrl} />

      {/* Enhanced Keywords */}
      <meta name="keywords" content={generateKeywords()} />

      {/* Additional meta tags for better SEO */}
      {cleanHeadline && (
        <meta property="article:headline" content={cleanHeadline} />
      )}
      {cleanSummary && (
        <meta
          property="article:summary"
          content={cleanSummary.substring(0, 300)}
        />
      )}

      {/* Schema.org structured data */}
      {cleanHeadline && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            headline: cleanHeadline,
            description: pageDescription,
            image: imageUrl,
            datePublished: publishedTime || new Date().toISOString(),
            dateModified: publishedTime || new Date().toISOString(),
            author: {
              "@type": "Organization",
              name: source || "SAGE by SpiderX.AI",
            },
            publisher: {
              "@type": "Organization",
              name: "SAGE by SpiderX.AI",
              logo: {
                "@type": "ImageObject",
                url: "https://sagemedia.ai/images/sage-logo.png",
              },
            },
            url: currentUrl,
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": currentUrl,
            },
          })}
        </script>
      )}
    </Helmet>
  );
};

export default DynamicMeta;
