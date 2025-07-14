import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import {
  getSettings,
  updateSettings,
  updateSourcesSectors,
} from "../helpers/api";
import {
  setSettings,
  setSettingsLoading,
  setSettingsError,
} from "../store/slice/settingsSlice";
import { Toaster, toast } from "react-hot-toast";

// Custom Code Editor Component
const CodeEditor = ({ value, onChange, placeholder, darkMode }) => {
  const textareaRef = useRef(null);
  const lineNumbersRef = useRef(null);

  const lines = value.split("\n");
  const lineCount = Math.max(lines.length, 1);

  const handleScroll = (e) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.target.scrollTop;
    }
  };

  const handleInput = (e) => {
    onChange(e.target.value);
  };

  return (
    <div
      className={`relative rounded-lg overflow-hidden ${
        darkMode ? "bg-[#22262a]" : "bg-gray-100"
      }`}
      style={{ border: `1px solid #838C96` }}
    >
      <div className="flex">
        {/* Line Numbers */}
        <div
          ref={lineNumbersRef}
          className={`select-none overflow-hidden ${
            darkMode
              ? "bg-[#1a1e22] text-gray-500"
              : "bg-gray-200 text-gray-600"
          }`}
          style={{
            width: "50px",
            height: "400px",
            paddingTop: "16px",
            paddingLeft: "8px",
            paddingRight: "8px",
            fontSize: "14px",
            lineHeight: "20px",
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
            borderRight: `1px solid ${darkMode ? "#374151" : "#d1d5db"}`,
          }}
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i + 1} className="text-right pr-2">
              {i + 1}
            </div>
          ))}
        </div>

        {/* Code Area */}
        <textarea
          ref={textareaRef}
          className={`flex-1 ${
            darkMode ? "bg-[#22262a] text-white" : "bg-gray-100 text-gray-900"
          }`}
          style={{
            border: "none",
            outline: "none",
            resize: "none",
            height: "400px",
            padding: "16px",
            fontSize: "14px",
            lineHeight: "20px",
            fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
          }}
          placeholder={placeholder}
          value={value}
          onChange={handleInput}
          onScroll={handleScroll}
          spellCheck={false}
        />
      </div>
    </div>
  );
};

const Settings = ({ isOpen, onClose, darkMode = false }) => {
  const dispatch = useDispatch();

  const [activeSection, setActiveSection] = useState("settings");
  const [isAnimating, setIsAnimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeMainTab, setActiveMainTab] = useState("general");
  const [activeSourcesTab, setActiveSourcesTab] = useState("sources");
  const [activePromptsTab, setActivePromptsTab] = useState("queryAnalyzer");

  // Updated state structure to include sources and sectors
  const [settingsData, setSettingsData] = useState({
    settings: {
      source: "",
      llm: "",
      usequeryanalyzer: false,
      enablechatbot: false,
      enablepodcast: false,
      advanceLoader: false,
    },
    "instrument-analysis": "",
    "impact-analysis": "",
    email: "",
    podcast: "",
    queryAnalyzer: "",
    topicFilter: "",
    categoryFilter: "",
    chatBotPrompt: "",
    sources: "",
    sectors: "[]",
    regions: [],
    topic_limit: 3,
  });

  // Dynamic menu items for Tab 1 (General Settings)
  const getGeneralMenuItems = () => {
    return [
      {
        id: "settings",
        label: "General",
        icon: (
          <img
            src={
              darkMode
                ? "/images/light-settings.svg"
                : "/images/dark-settings.svg"
            }
            alt="Settings Icon"
            className="w-5 h-5"
            style={{
              filter: "url(#gradientFilter)",
            }}
          />
        ),
      },
      {
        id: "topic_limit",
        label: "Group Topic Limit",
        icon: (
          <img
            src={
              darkMode
                ? "/images/light-settings.svg"
                : "/images/dark-settings.svg"
            }
            alt="Topic Count Icon"
            className="w-5 h-5"
            style={{
              filter: "url(#gradientFilter)",
            }}
          />
        ),
      },
    ];
  };

  // Dynamic menu items for Prompts tab
  const getPromptsMenuItems = () => {
    return [
      {
        id: "queryAnalyzer",
        label: "Query Analyzer",
        icon: (
          <img
            src={
              darkMode
                ? "/images/light-query-analyzer.svg"
                : "/images/dark-query-analyzer.svg"
            }
            alt="Search Icon"
            className="w-5 h-5"
            style={{
              filter: "url(#gradientFilter)",
            }}
          />
        ),
      },
      {
        id: "instrument-analysis",
        label: "Instrument Analysis",
        icon: (
          <img
            src={
              darkMode
                ? "/images/light-instrument-analysis.svg"
                : "/images/dark-instrument-analysis.svg"
            }
            alt="Microscope Icon"
            className="w-5 h-5"
            style={{
              filter: "url(#gradientFilter)",
            }}
          />
        ),
      },
      {
        id: "impact-analysis",
        label: "Impact Analysis",
        icon: (
          <img
            src={
              darkMode
                ? "/images/light-impact-analysis.svg"
                : "/images/dark-impact-analysis.svg"
            }
            alt="Chart Icon"
            className="w-5 h-5"
            style={{
              filter: "url(#gradientFilter)",
            }}
          />
        ),
      },
      {
        id: "email",
        label: "Email",
        icon: (
          <img
            src={darkMode ? "/images/light-mail.svg" : "/images/dark-mail.svg"}
            alt="Email Icon"
            className="w-5 h-5"
            style={{
              filter: "url(#gradientFilter)",
            }}
          />
        ),
      },
      {
        id: "podcast",
        label: "Podcast",
        icon: (
          <img
            src={
              darkMode
                ? "/images/light-podcasts.svg"
                : "/images/dark-podcasts.svg"
            }
            alt="Podcast Icon"
            className="w-5 h-5"
            style={{
              filter: "url(#gradientFilter)",
            }}
          />
        ),
      },
      { id: "topicFilter", label: "Topic Filter", icon: "🗨" },
      { id: "categoryFilter", label: "Category Filter", icon: "🗨" },
      { id: "chatBotPrompt", label: "Chat Bot Prompt", icon: "🤖" },
    ];
  };

  // Dynamic menu items for Sources & Sectors Tab
  const getSourcesSectorsMenuItems = () => {
    return [
      {
        id: "sources",
        label: "Sources",
        icon: (
          <img
            src={
              darkMode
                ? "/images/light-sources.svg"
                : "/images/dark-sources.svg"
            }
            alt="Podcast Icon"
            className="w-5 h-5"
            style={{
              filter: "url(#gradientFilter)",
            }}
          />
        ),
      },
      {
        id: "sectors",
        label: "Sectors",
        icon: (
          <img
            src={
              darkMode
                ? "/images/light-sectors.svg"
                : "/images/dark-sectors.svg"
            }
            alt="Podcast Icon"
            className="w-5 h-5"
            style={{
              filter: "url(#gradientFilter)",
            }}
          />
        ),
      },
      {
        id: "regions",
        label: "Regions",
        icon: (
          <img
            src={
              darkMode
                ? "/images/light-sources.svg"
                : "/images/dark-sources.svg"
            }
            alt="Regions Icon"
            className="w-5 h-5"
            style={{
              filter: "url(#gradientFilter)",
            }}
          />
        ),
      },
    ];
  };

  // API call to fetch settings data on mount
  const fetchSettingsData = async () => {
    setIsLoading(true);
    dispatch(setSettingsLoading(true));
    try {
      const response = await getSettings();
      const data = await response;

      const settingsData = {
        settings: {
          source: data?.settings?.source,
          llm: data?.settings?.llm,
          usequeryanalyzer: data?.settings?.usequeryanalyzer,
          enablechatbot: data?.settings?.enablechatbot,
          enablepodcast: data?.settings?.enablepodcast,
          topic_limit: data?.settings?.topic_limit,
          advanceLoader: data?.settings?.advanceLoader,
        },
        "instrument-analysis": data?.newsAnalysisPrompt,
        "impact-analysis": data?.headlightsAndImpact,
        email: data?.emailTemplate,
        podcast: data?.podcastTemplate,
        queryAnalyzer: data?.queryAnalyzer,
        topicFilter: data?.topicFilter,
        categoryFilter: data?.categoryFilter,
        chatBotPrompt: data?.chatBotPrompt,
        sources: data?.sources ? JSON.stringify(data.sources, null, 2) : "",
        sectors: data?.sectors ? JSON.stringify(data.sectors, null, 2) : "[]",
        regions: data?.regions,
      };

      setSettingsData(settingsData);
      // Update global Redux state
      dispatch(setSettings(settingsData.settings));
    } catch (error) {
      console.error("Error fetching settings:", error);
      dispatch(setSettingsError(error.message));
    } finally {
      setIsLoading(false);
      dispatch(setSettingsLoading(false));
    }
  };

  // Handle animation states and fetch data on mount
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = "hidden";
      fetchSettingsData();
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle input changes for different field types
  const handleInputChange = (section, field, value) => {
    setSettingsData((prev) => {
      if (section === "settings") {
        return {
          ...prev,
          settings: {
            ...prev.settings,
            [field]: value,
          },
        };
      } else {
        return {
          ...prev,
          [section]: value,
        };
      }
    });
  };

  // Submit updated general settings data (Tab 1)
  const handleGeneralSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Replace with your actual API endpoint
      const result = await updateSettings({
        settings: settingsData.settings,
        newsAnalysisPrompt: settingsData["instrument-analysis"],
        headlightsAndImpact: settingsData["impact-analysis"],
        emailTemplate: settingsData.email,
        podcastPrompt: settingsData.podcast,
        queryAnalyzer: settingsData.queryAnalyzer,
        topicFilter: settingsData.topicFilter,
        categoryFilter: settingsData.categoryFilter,
        chatBotPrompt: settingsData.chatBotPrompt,
      });
      if (result) {
        dispatch(setSettings(settingsData.settings));
      }

      toast.success("General settings saved successfully");
      console.log("General settings saved successfully:", result);
    } catch (error) {
      toast.error("Error saving general settings");
      console.error("Error saving general settings:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit sources and sectors data (Tab 2)
  const handleSourcesSectorsSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Parse sources JSON string back to object
      let parsedSources = {};
      try {
        parsedSources = JSON.parse(settingsData.sources);
      } catch (jsonError) {
        toast.error(
          "Invalid JSON format in sources. Please check your syntax."
        );
        setIsSubmitting(false);
        return;
      }

      // Parse sectors JSON string back to array
      let parsedSectors = [];
      try {
        parsedSectors = JSON.parse(settingsData.sectors);
      } catch (jsonError) {
        toast.error(
          "Invalid JSON format in sectors. Please check your syntax."
        );
        setIsSubmitting(false);
        return;
      }

      // Transform regions data to match API expected format
      const parsedRegions = settingsData.regions.map((region) => ({
        name: region.region,
        is_enabled: region.is_enabled,
        is_published: region.is_published,
      }));

      // Replace with your actual API endpoint for sources and sectors
      const response = await updateSourcesSectors({
        sources: parsedSources,
        sectors: parsedSectors,
        regions: parsedRegions,
      });

      const result = await response.message;
      toast.success("Sources and sectors saved successfully");
      console.log(result);
    } catch (error) {
      toast.error("Error saving sources and sectors");
      console.error("Error saving sources and sectors:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const renderGeneralContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className={darkMode ? "text-white" : "text-gray-800"}>
              Loading settings...
            </span>
          </div>
        </div>
      );
    }

    if (activeSection === "settings") {
      return (
        <div className="space-y-6">
          <h2
            className={`text-2xl font-semibold ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            General Settings
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Source/News API Provider */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                News API Provider
              </label>
              <select
                value={settingsData.settings.source}
                onChange={(e) =>
                  handleInputChange("settings", "source", e.target.value)
                }
                className={`w-full px-4 py-3 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none cursor-pointer ${
                  darkMode
                    ? "bg-[#22262a] text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <option value="">Select Provider</option>
                <option value="marketaux">Market Aux</option>
                <option value="mediastack">Media Stack</option>
                <option value="gnews">G News</option>
                <option value="google_news">Google News</option>
              </select>
            </div>

            {/* LLM Provider */}
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-600"
                }`}
              >
                LLM Provider
              </label>
              <select
                value={settingsData.settings.llm}
                onChange={(e) =>
                  handleInputChange("settings", "llm", e.target.value)
                }
                className={`w-full px-4 py-3 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none appearance-none cursor-pointer ${
                  darkMode
                    ? "bg-[#22262a] text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <option value="">Select LLM</option>
                <option value="openai">Open AI</option>
                <option value="perplexity">Perplexity</option>
              </select>
            </div>
          </div>

          {/* Advance Loader Toggle */}
          <div className="grid grid-cols-1 gap-6">
            <div className="flex items-center justify-between">
              <div>
                <label
                  className={`block text-sm font-medium mb-1 ${
                    darkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Advance Loader
                </label>
                <p
                  className={`text-xs ${
                    darkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Enable loading screen during data fetching
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleInputChange(
                    "settings",
                    "advanceLoader",
                    !settingsData.settings.advanceLoader
                  )
                }
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  settingsData.settings.advanceLoader
                    ? "bg-blue-600"
                    : darkMode
                    ? "bg-gray-600"
                    : "bg-gray-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settingsData.settings.advanceLoader
                      ? "translate-x-5"
                      : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (activeSection === "topic_limit") {
      return (
        <div className="space-y-6">
          <h2
            className={`text-2xl font-semibold ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            Topic Count Settings
          </h2>

          <div className="max-w-md">
            <input
              type="number"
              min="1"
              max="100"
              value={settingsData.settings.topic_limit}
              onChange={(e) =>
                handleInputChange(
                  "settings",
                  "topic_limit",
                  parseInt(e.target.value)
                )
              }
              className={`w-full px-4 py-3 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                darkMode
                  ? "bg-[#22262a] text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
              placeholder="Enter topic limit"
            />
            <p
              className={`mt-2 text-sm ${
                darkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Set the maximum number of topics to be processed (1-100)
            </p>
          </div>
        </div>
      );
    }

    // For all other sections in Tab 1 (code editors)
    const sectionTitles = {
      "instrument-analysis": "Instrument Analysis Settings",
      "impact-analysis": "Impact Analysis Settings",
      email: "Email Settings",
      podcast: "Podcast Settings",
      queryAnalyzer: "Query Analyzer",
      topicFilter: "Topic Filter",
      categoryFilter: "Category Filter",
      chatBotPrompt: "Chat Bot Prompt",
    };

    return (
      <div className="space-y-6">
        <h2
          className={`text-2xl font-semibold ${
            darkMode ? "text-white" : "text-gray-800"
          }`}
        >
          {sectionTitles[activeSection]}
        </h2>

        <CodeEditor
          value={settingsData[activeSection]}
          onChange={(value) => handleInputChange(activeSection, null, value)}
          placeholder={`Configure your ${sectionTitles[
            activeSection
          ].toLowerCase()} here...`}
          darkMode={darkMode}
        />
      </div>
    );
  };

  const renderPromptsContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className={darkMode ? "text-white" : "text-gray-800"}>
              Loading settings...
            </span>
          </div>
        </div>
      );
    }

    // For all other sections in Prompts tab (code editors)
    const sectionTitles = {
      "instrument-analysis": "Instrument Analysis Settings",
      "impact-analysis": "Impact Analysis Settings",
      email: "Email Settings",
      podcast: "Podcast Settings",
      queryAnalyzer: "Query Analyzer",
      topicFilter: "Topic Filter",
      categoryFilter: "Category Filter",
      chatBotPrompt: "Chat Bot Prompt",
    };

    // Map section to corresponding setting key
    const getToggleConfig = (section) => {
      switch (section) {
        case "queryAnalyzer":
          return {
            settingKey: "usequeryanalyzer",
            value: settingsData.settings.usequeryanalyzer,
          };
        case "chatBotPrompt":
          return {
            settingKey: "enablechatbot",
            value: settingsData.settings.enablechatbot,
          };
        case "podcast":
          return {
            settingKey: "enablepodcast",
            value: settingsData.settings.enablepodcast,
          };
        default:
          return null;
      }
    };

    const toggleConfig = getToggleConfig(activePromptsTab);

    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <h2
            className={`text-2xl font-semibold mr-2 ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            {sectionTitles[activePromptsTab]}
          </h2>
          {toggleConfig && (
            <button
              type="button"
              onClick={() =>
                handleInputChange(
                  "settings",
                  toggleConfig.settingKey,
                  !toggleConfig.value
                )
              }
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                toggleConfig.value
                  ? "bg-blue-600"
                  : darkMode
                  ? "bg-gray-600"
                  : "bg-gray-200"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  toggleConfig.value ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          )}
        </div>

        <CodeEditor
          value={settingsData[activePromptsTab]}
          onChange={(value) => handleInputChange(activePromptsTab, null, value)}
          placeholder={`Configure your ${sectionTitles[
            activePromptsTab
          ].toLowerCase()} here...`}
          darkMode={darkMode}
        />
      </div>
    );
  };

  const renderSourcesSectorsContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <span className={darkMode ? "text-white" : "text-gray-800"}>
              Loading settings...
            </span>
          </div>
        </div>
      );
    }

    // Sources sub-tab content
    if (activeSourcesTab === "sources") {
      return (
        <div>
          <h2
            className={`text-2xl font-semibold ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            Sources Configuration
          </h2>

          <div>
            <CodeEditor
              value={settingsData.sources}
              onChange={(value) => handleInputChange("sources", null, value)}
              placeholder={`{
                "GLOBAL": "apnews.com,cnn.com,bbc.com,bloomberg.com,reuters.com",
              }`}
              darkMode={darkMode}
            />
          </div>
        </div>
      );
    }

    // Sectors sub-tab content
    if (activeSourcesTab === "sectors") {
      return (
        <div>
          <h2
            className={`text-2xl font-semibold ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            Sectors Configuration
          </h2>

          <div>
            <CodeEditor
              value={settingsData.sectors}
              onChange={(value) => handleInputChange("sectors", null, value)}
              placeholder={`[
                {
                  "sector_name": "Technology",
                  "sector_topics": ["AI", "Software", "Hardware"]
                },
                {
                  "sector_name": "Healthcare",
                  "sector_topics": ["Pharmaceuticals", "Medical Devices"]
                }
              ]`}
              darkMode={darkMode}
            />
          </div>
        </div>
      );
    }

    // Regions sub-tab content
    if (activeSourcesTab === "regions") {
      return (
        <div className="space-y-6">
          <h2
            className={`text-2xl font-semibold ${
              darkMode ? "text-white" : "text-gray-800"
            }`}
          >
            Regions Configuration
          </h2>

          <div
            className="overflow-y-auto space-y-4 pr-2"
            style={{ maxHeight: "calc(100vh - 300px)" }}
          >
            {settingsData.regions &&
              settingsData.regions.map((region, index) => (
                <div
                  key={region.id}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    darkMode ? "bg-[#22262a]" : "bg-gray-100"
                  }`}
                >
                  <div className="flex-1">
                    <span
                      className={`text-lg font-medium ${
                        darkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {region.region}
                    </span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span
                      className={`text-sm ${
                        darkMode ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {region.is_published ? "Enabled" : "Disabled"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const updatedRegions = [...settingsData.regions];
                        updatedRegions[index] = {
                          ...updatedRegions[index],
                          is_published: !updatedRegions[index].is_published,
                        };
                        handleInputChange("regions", null, updatedRegions);
                      }}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        region.is_published
                          ? "bg-blue-600"
                          : darkMode
                          ? "bg-gray-600"
                          : "bg-gray-200"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          region.is_published
                            ? "translate-x-5"
                            : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      );
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          style: {
            backgroundColor: "#1f2937",
            color: "#f1f5f9",
          },
          duration: 3000,
          removeDelay: 500,
        }}
      />
      <style>
        {`
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }

          @keyframes slideOutRight {
            from {
              transform: translateX(0);
              opacity: 1;
            }
            to {
              transform: translateX(100%);
              opacity: 0;
            }
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes fadeOut {
            from {
              opacity: 1;
            }
            to {
              opacity: 0;
            }
          }

          .settings-overlay {
            animation: ${isAnimating ? "fadeIn" : "fadeOut"} 0.6s ease-in-out;
          }

          .settings-panel {
            animation: ${
              isAnimating ? "slideInRight" : "slideOutRight"
            } 0.6s ease-in-out;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .loading-spinner {
            animation: spin 1s linear infinite;
          }
        `}
      </style>

      {/* Overlay */}
      <div
        className={`fixed inset-0 settings-overlay ${
          darkMode ? "bg-black" : "bg-black"
        } bg-opacity-50`}
        onClick={handleClose}
        style={{ zIndex: 100 }}
      >
        {/* Settings Panel */}
        <div
          className={`fixed right-0 top-0 h-full w-[70%] max-w-6xl settings-panel ${
            darkMode ? "bg-black" : "bg-white"
          } shadow-2xl flex flex-col`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className={`p-3 flex items-center justify-between border-b ${
              darkMode
                ? "bg-black border-gray-700"
                : "bg-gray-100 border-gray-200"
            }`}
          >
            <h1
              className={`text-xl font-semibold ${
                darkMode ? "text-white" : "text-black"
              }`}
            >
              Settings
            </h1>
            <button
              onClick={handleClose}
              className={`text-gray-400 hover:${
                darkMode ? "text-white" : "text-black"
              } transition-colors duration-200 p-2`}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Main Tabs */}
          <div
            className={`border-b ${
              darkMode ? "border-gray-700" : "border-gray-200"
            }`}
          >
            <div className="flex">
              <button
                onClick={() => {
                  setActiveMainTab("general");
                  setActiveSection("settings");
                }}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors duration-200 flex items-center space-x-2 ${
                  activeMainTab === "general"
                    ? "border-blue-500 text-blue-600"
                    : darkMode
                    ? "border-transparent text-gray-400 hover:text-gray-300"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <span>⚙️</span>
                <span>General Settings</span>
              </button>
              <button
                onClick={() => {
                  setActiveMainTab("prompts");
                  setActivePromptsTab("queryAnalyzer");
                }}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors duration-200 flex items-center space-x-2 ${
                  activeMainTab === "prompts"
                    ? "border-blue-500 text-blue-600"
                    : darkMode
                    ? "border-transparent text-gray-400 hover:text-gray-300"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <span>💬</span>
                <span>Prompts</span>
              </button>
              <button
                onClick={() => setActiveMainTab("sources-sectors")}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors duration-200 flex items-center space-x-2 ${
                  activeMainTab === "sources-sectors"
                    ? "border-blue-500 text-blue-600"
                    : darkMode
                    ? "border-transparent text-gray-400 hover:text-gray-300"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <span>📰</span>
                <span>Sources & Sectors</span>
              </button>
            </div>
          </div>

          <div className="flex h-full">
            {/* Left Sidebar (only for General Settings tab) */}
            {activeMainTab === "general" && (
              <div
                className={`w-64 border-r ${
                  darkMode
                    ? "bg-black border-gray-700"
                    : "bg-gray-100 border-gray-200"
                } overflow-y-auto`}
              >
                <div className="p-4">
                  <nav className="space-y-1">
                    {getGeneralMenuItems().map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-3 ${
                          activeSection === item.id
                            ? "bg-blue-500 text-white"
                            : darkMode
                            ? "text-gray-300 hover:bg-gray-700"
                            : "text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        <span>{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            )}

            {/* Left Sidebar for Prompts */}
            {activeMainTab === "prompts" && (
              <div
                className={`w-64 border-r ${
                  darkMode
                    ? "bg-black border-gray-700"
                    : "bg-gray-100 border-gray-200"
                } overflow-y-auto`}
              >
                <div className="p-4">
                  <nav className="space-y-1">
                    {getPromptsMenuItems().map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setActivePromptsTab(item.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-3 ${
                          activePromptsTab === item.id
                            ? "bg-blue-500 text-white"
                            : darkMode
                            ? "text-gray-300 hover:bg-gray-700"
                            : "text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        <span>{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            )}

            {/* Left Sidebar for Sources & Sectors */}
            {activeMainTab === "sources-sectors" && (
              <div
                className={`w-64 border-r ${
                  darkMode
                    ? "bg-black border-gray-700"
                    : "bg-gray-100 border-gray-200"
                } overflow-y-auto`}
              >
                <div className="p-4">
                  <nav className="space-y-1">
                    {getSourcesSectorsMenuItems().map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveSourcesTab(item.id)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-3 ${
                          activeSourcesTab === item.id
                            ? "bg-blue-500 text-white"
                            : darkMode
                            ? "text-gray-300 hover:bg-gray-700"
                            : "text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        <span>{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            )}

            {/* Right Content Area */}
            <div className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto">
                <div className="p-8">
                  <div className="max-w-6xl mx-auto">
                    {activeMainTab === "general"
                      ? renderGeneralContent()
                      : activeMainTab === "prompts"
                      ? renderPromptsContent()
                      : renderSourcesSectorsContent()}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className={`p-6 flex justify-end`}>
                <button
                  onClick={
                    activeMainTab === "general"
                      ? handleGeneralSubmit
                      : activeMainTab === "prompts"
                      ? handleGeneralSubmit
                      : handleSourcesSectorsSubmit
                  }
                  disabled={isSubmitting || isLoading}
                  className={`px-6 py-3 fixed bottom-4 right-4 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 text-white`}
                  style={{
                    background:
                      isSubmitting || isLoading
                        ? "linear-gradient(135deg, #B8E6F8 0%, #5E8EFF 100%)"
                        : "linear-gradient(135deg, #B8E6F8 0%, #5E8EFF 100%)",
                  }}
                >
                  {isSubmitting && (
                    <FontAwesomeIcon
                      icon={faSpinner}
                      className="animate-spin"
                    />
                  )}
                  <span>
                    {isSubmitting
                      ? "Saving..."
                      : activeMainTab === "general"
                      ? "Save General"
                      : activeMainTab === "prompts"
                      ? "Save Prompts"
                      : "Save Sources"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
