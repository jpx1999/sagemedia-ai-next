import React from "react";
import { useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";
import Layout from "../components/Layout";
import useWindowSize from "../hooks/useWindowSize";

const MainMasterPage = ({
  isDarkTheme,
  children,
  containerClassName = "",
  ...props
}) => {
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const currentTheme = useSelector((state) => state.theme.currentTheme);
  const { width: windowWidth } = useWindowSize();

  // Determine if dark mode
  const isDarkMode =
    typeof currentTheme === "object"
      ? currentTheme.backgroundColor === "#000" ||
        currentTheme.navBg === "#1F2937"
      : currentTheme === "dark";

  return (
    <Layout isDarkTheme={isDarkTheme || isDarkMode}>
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

      {/* Main Container with Left Margin */}
      <div
        className={`py-8 px-4 flex items-start justify-center relative w-full overflow-y-auto min-h-ful lg:max-w-7xl mx-auto`}
      >
        <div>{children}</div>
      </div>
    </Layout>
  );
};

export default MainMasterPage;
