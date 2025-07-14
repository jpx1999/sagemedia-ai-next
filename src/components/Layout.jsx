'use client'

import React, { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSelector } from "react-redux";
import { handleLogout } from "../helpers/authHelper";

const Layout = ({ children, isDarkTheme = true }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userMenuVisible, setUserMenuVisible] = useState(false);
  const userMenuRef = useRef(null);
  const mobileUserMenuRef = useRef(null);
  const [menuAnimation, setMenuAnimation] = useState("");

  // Get user data from Redux store
  const userData = useSelector((state) => state.auth.user);
  const role = useSelector((state) => state.auth.role);

  // Authentication logic
  const isAuthenticated = !!userData;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleNavigation = (path) => {
    router.push(path);
    closeMobileMenu();
  };

  // Handle clicks outside user menu
  useEffect(() => {
    function handleClickOutside(event) {
      const desktopMenu = userMenuRef.current;
      const mobileMenu = mobileUserMenuRef.current;

      if (
        userMenuVisible &&
        desktopMenu &&
        !desktopMenu.contains(event.target) &&
        mobileMenu &&
        !mobileMenu.contains(event.target)
      ) {
        closeUserMenu();
      }
    }

    if (userMenuVisible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuVisible]);

  // Update menu animation state
  useEffect(() => {
    setMenuAnimation(userMenuVisible ? "dropdown-open" : "dropdown-close");
  }, [userMenuVisible]);

  const toggleUserMenu = (e) => {
    e.stopPropagation();
    setUserMenuVisible(!userMenuVisible);
  };

  const closeUserMenu = () => {
    setUserMenuVisible(false);
  };

  const getUserInitials = () => {
    if (!userData || !userData.name) return "DU";

    const nameParts = userData.name.trim().split(" ");
    const firstInitial = nameParts[0][0] || "";
    const lastInitial =
      nameParts.length > 1 ? nameParts[nameParts.length - 1][0] : "";

    return lastInitial
      ? (firstInitial + lastInitial).toUpperCase()
      : firstInitial.toUpperCase();
  };

  const handleLogoutClick = () => {
    handleLogout();
    closeUserMenu();
  };

  return (
    <>
      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes fadeOut {
            from {
              opacity: 1;
              transform: translateY(0);
            }
            to {
              opacity: 0;
              transform: translateY(-10px);
            }
          }

          .dropdown-menu {
            display: none;
            opacity: 0;
            transform: translateY(-10px);
          }

          .dropdown-open {
            display: block;
            animation: fadeIn 0.25s ease forwards;
          }

          .dropdown-close {
            display: block;
            animation: fadeOut 0.25s ease forwards;
            pointer-events: none;
          }

          .mobile-dropdown-menu {
            display: none;
            opacity: 0;
            transform: translateY(-10px);
          }

          .mobile-dropdown-open {
            display: block;
            animation: fadeIn 0.25s ease forwards;
          }

          .mobile-dropdown-close {
            display: block;
            animation: fadeOut 0.25s ease forwards;
            pointer-events: none;
          }
        `}
      </style>
      <div
        className={`min-h-screen flex flex-col ${
          isDarkTheme ? "bg-black text-white" : "bg-white text-black"
        }`}
      >
        {/* Header */}
        <header
          className={`${
            isDarkTheme
              ? "bg-black border-gray-800"
              : "bg-white border-gray-200"
          } border-b relative`}
        >
          <div className="w-full px-4 sm:px-6 lg:px-10">
            <div className="flex items-center justify-between h-20">
              {/* Logo Section */}
              <div
                className="flex items-center cursor-pointer group"
                onClick={() => router.push("/")}
              >
                {/* SpiderX Logo */}
                <div className="items-center mr-2 hidden sm:flex">
                  <img
                    src="/images/logo.png"
                    alt="SpiderX Logo"
                    className="h-8 w-auto"
                  />
                </div>

                {/* Divider */}
                <div className="h-6 w-px bg-gray-300 mx-4 hidden sm:block"></div>

                {/* SAGE Branding */}
                <div className="flex items-center">
                  <div
                    className="w-10 h-10 rounded-full mr-3 bg-cover bg-center"
                    style={{
                      backgroundImage: "url(/images/sage-icon-big.png)",
                    }}
                  ></div>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-[#6ABCFF] dark:text-white group-hover:text-[#7aaed8] transition-colors">
                      SAGE
                    </span>
                    <sup className="ml-1 text-sm font-semibold text-[#6ABCFF]">
                      V1.01
                    </sup>
                    <sup className="ml-1 text-xs font-medium text-gray-400 rounded-xl  px-1 border border-gray-400">
                      Beta
                    </sup>
                  </div>
                </div>
              </div>

              {/* Navigation Menu - Desktop */}
              <nav className="hidden lg:flex items-center space-x-8">
                {/* Pricing */}
                <button
                  onClick={() => router.push("/pricing")}
                  className={`${
                    isDarkTheme
                      ? "text-gray-300 hover:text-white"
                      : "text-gray-700 hover:text-gray-900"
                  } font-medium transition-colors`}
                >
                  Pricing
                </button>

                {/* Contact */}
                <button
                  onClick={() => router.push("/contact-us")}
                  className={`${
                    isDarkTheme
                      ? "text-gray-300 hover:text-white"
                      : "text-gray-700 hover:text-gray-900"
                  } font-medium transition-colors`}
                >
                  Contact
                </button>

                {/* User Profile or Get Started Button */}
                {userData ? (
                  <div
                    ref={userMenuRef}
                    className="relative flex items-center cursor-pointer"
                    onClick={toggleUserMenu}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#CBFEFF] flex items-center justify-center text-black font-medium">
                      {getUserInitials()}
                    </div>

                    {/* User Dropdown Menu */}
                    <div
                      className={`dropdown-menu ${menuAnimation}`}
                      style={{
                        minWidth: "260px",
                        position: "absolute",
                        backgroundColor: isDarkTheme ? "#000" : "#ffffff",
                        border: "1px solid #2A3435",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
                        zIndex: 100,
                        overflow: "hidden",
                        fontSize: "16px",
                        padding: "12px 0",
                        right: "0",
                        top: "50px",
                      }}
                      onAnimationEnd={() => {
                        if (menuAnimation === "dropdown-close") {
                          setMenuAnimation("");
                        }
                      }}
                    >
                      <div
                        className="flex items-center px-4 py-2"
                        style={{
                          color: isDarkTheme ? "#FFFFFF" : "#000000",
                          borderBottom: "1px solid #2A3435",
                          cursor: "default",
                          fontSize: "16px",
                          marginBottom: "8px",
                        }}
                      >
                        <div
                          style={{
                            minWidth: "36px",
                            minHeight: "36px",
                            borderRadius: "50%",
                            marginRight: "10px",
                            background: "#CBFEFF",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "black",
                            fontWeight: "500",
                          }}
                        >
                          {getUserInitials()}
                        </div>
                        <div>{userData?.name}</div>
                      </div>

                      {role === "admin" &&
                        userData?.email?.includes("webspiders.com") && (
                          <div
                            style={{
                              padding: "8px 20px",
                              cursor: "pointer",
                              transition: "backgroundColor 0.2s",
                              color: isDarkTheme ? "#E5E7EB" : "#000000",
                              display: "flex",
                              alignItems: "center",
                              gap: "12px",
                              fontSize: "16px",
                              fontWeight: "400",
                              minHeight: "44px",
                            }}
                          >
                            <img src="/images/setting.svg" alt="Setting" />
                            Settings
                          </div>
                        )}
                      <div
                        style={{
                          padding: "8px 20px",
                          cursor: "pointer",
                          transition: "backgroundColor 0.2s",
                          color: isDarkTheme ? "#E5E7EB" : "#000000",
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          fontSize: "16px",
                          fontWeight: "400",
                          minHeight: "44px",
                        }}
                        onClick={() => router.push("/subscription")}
                      >
                        <img src="/images/page_info-dark.svg" alt="Plan" />
                        My Plan
                      </div>

                      <div
                        style={{
                          padding: "8px 20px",
                          cursor: "pointer",
                          transition: "backgroundColor 0.2s",
                          color: isDarkTheme ? "#E5E7EB" : "#000000",
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          fontSize: "16px",
                          fontWeight: "400",
                          minHeight: "44px",
                        }}
                        onClick={handleLogoutClick}
                      >
                        <img src="/images/logout.svg" alt="Logout" />
                        Logout
                      </div>
                    </div>
                  </div>
                ) : (
                  // Show Get Started button only if not authenticated and not on login page
                  pathname !== "/login" && (
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => router.push("/login")}
                        className="bg-gradient-to-r from-[#B8E6F8] to-[#5E8EFF] text-gray-900 px-6 py-3 rounded-lg font-semibold flex items-center"
                      >
                        Login/Signup
                      </button>
                    </div>
                  )
                )}
              </nav>

              {/* Mobile menu button */}
              <div className="lg:hidden flex gap-2">
                {/* Mobile Get Started Button */}
                {!userData && pathname !== "/login" && (
                  <button
                    onClick={() => handleNavigation("/login")}
                    className="bg-gradient-to-r from-[#B8E6F8] to-[#5E8EFF] text-gray-900 px-3 py-2 rounded-md font-medium text-md"
                  >
                    Login/Signup
                  </button>
                )}

                {/* Mobile User Avatar */}
                {userData && (
                  <div
                    ref={mobileUserMenuRef}
                    className="relative flex items-center cursor-pointer"
                    onClick={toggleUserMenu}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#CBFEFF] flex items-center justify-center text-black font-medium mr-2">
                      {getUserInitials()}
                    </div>

                    {/* Mobile User Dropdown Menu */}
                    <div
                      className={`mobile-dropdown-menu ${
                        userMenuVisible
                          ? "mobile-dropdown-open"
                          : "mobile-dropdown-close"
                      }`}
                      style={{
                        minWidth: "260px",
                        position: "absolute",
                        backgroundColor: isDarkTheme ? "#000" : "#ffffff",
                        border: "1px solid #2A3435",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
                        zIndex: 1000,
                        overflow: "hidden",
                        fontSize: "16px",
                        padding: "8px 0",
                        right: "0",
                        top: "40px",
                      }}
                    >
                      <div
                        className="flex items-center px-3 py-2"
                        style={{
                          color: isDarkTheme ? "#FFFFFF" : "#000000",
                          borderBottom: "1px solid #2A3435",
                          cursor: "default",
                          fontSize: "16px",
                          marginBottom: "4px",
                        }}
                      >
                        <div
                          style={{
                            minWidth: "28px",
                            minHeight: "28px",
                            borderRadius: "50%",
                            marginRight: "8px",
                            background: "#CBFEFF",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "black",
                            fontWeight: "500",
                            fontSize: "12px",
                          }}
                        >
                          {getUserInitials()}
                        </div>
                        <div style={{ fontSize: "16px", fontWeight: "500" }}>
                          {userData?.name}
                        </div>
                      </div>

                      {role === "admin" &&
                        userData?.email?.includes("webspiders.com") && (
                          <div
                            style={{
                              padding: "8px 16px",
                              cursor: "pointer",
                              transition: "backgroundColor 0.2s",
                              color: isDarkTheme ? "#E5E7EB" : "#000000",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              fontSize: "16px",
                              fontWeight: "400",
                              minHeight: "36px",
                            }}
                          >
                            <img
                              src="/images/setting.svg"
                              alt="Setting"
                              style={{ width: "16px", height: "16px" }}
                            />
                            Settings
                          </div>
                        )}

                      <div
                        style={{
                          padding: "8px 16px",
                          cursor: "pointer",
                          transition: "backgroundColor 0.2s",
                          color: isDarkTheme ? "#E5E7EB" : "#000000",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontSize: "16px",
                          fontWeight: "400",
                          minHeight: "36px",
                        }}
                        onClick={handleLogoutClick}
                      >
                        <img
                          src="/images/logout.svg"
                          alt="Logout"
                          style={{ width: "16px", height: "16px" }}
                        />
                        Logout
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={toggleMobileMenu}
                  className={`${
                    isDarkTheme
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-600 hover:text-gray-900"
                  } transition-colors`}
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        <div
          className={`fixed inset-0 z-40 lg:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? "visible opacity-100" : "invisible opacity-0"
          }`}
        >
          {/* Backdrop */}
          <div
            className={`fixed inset-0 bg-black transition-opacity duration-700 ease-in-out ${
              isMobileMenuOpen ? "bg-opacity-70" : "bg-opacity-0"
            }`}
            onClick={closeMobileMenu}
          ></div>

          {/* Mobile Menu Panel */}
          <div
            className={`fixed top-0 right-0 h-full w-80 max-w-sm transform transition-all duration-700 ease-in-out ${
              isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
            } ${
              isDarkTheme
                ? "bg-black border-gray-800"
                : "bg-white border-gray-200"
            } border-l shadow-xl`}
          >
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-3 dark:border-gray-800">
              <button
                onClick={closeMobileMenu}
                className={`${
                  isDarkTheme
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-600 hover:text-gray-900"
                } transition-all duration-200 p-2 rounded-lg ml-auto`}
              >
                <svg
                  className="h-6 w-6"
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

            {/* Mobile Menu Items */}
            <nav className="flex flex-col p-6">
              <button
                onClick={() => handleNavigation("/pricing")}
                className={`text-left text-lg font-normal text-gray-300 border-b border-gray-700 p-3`}
              >
                Pricing
              </button>

              <button
                onClick={() => handleNavigation("/terms-and-conditions")}
                className={`text-left text-lg font-normal text-gray-300 border-b border-gray-700 p-3`}
              >
                Terms & Conditions
              </button>

              <button
                onClick={() => handleNavigation("/privacy-policy")}
                className={`text-left text-lg font-normal text-gray-300 border-b border-gray-700 p-3`}
              >
                Privacy Policy
              </button>

              <button
                onClick={() => handleNavigation("/refund-policy")}
                className={`text-left text-lg font-normal text-gray-300 border-b border-gray-700 p-3`}
              >
                Refund Policy
              </button>

              <button
                onClick={() => handleNavigation("/contact-us")}
                className={`text-left text-lg font-normal text-gray-300 border-b border-gray-700 p-3`}
              >
                Contact
              </button>

              {/* Mobile CTA Button for non-authenticated users */}
              {!userData && pathname !== "/login" && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                  <button
                    onClick={() => handleNavigation("/login")}
                    className="w-full bg-gradient-to-r from-[#B8E6F8] to-[#5E8EFF] text-gray-900 px-6 py-4 rounded-lg font-semibold text-lg transition-all duration-200 hover:scale-105 hover:shadow-lg"
                  >
                    Get Started
                  </button>
                </div>
              )}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer
          className={`py-4 md:py-8 px-4 sm:px-10 lg:px-20 w-full ${
            isDarkTheme ? "border-gray-800" : "border-gray-200"
          }`}
        >
          <div className="w-full flex flex-col-reverse md:flex-row-reverse items-center justify-between">
            <div className="flex items-center mt-4 md:mt-0">
              <span className="text-sm text-gray-500 me-3">Powered by</span>
              <img
                src={
                  isDarkTheme
                    ? "/images/powerdby-logo-light.svg"
                    : "/images/powerdby-logo-dark.svg"
                }
                alt="Powered by SpiderX"
                className="cursor-pointer"
                onClick={() => window.open("https://spiderx.ai", "_blank")}
              />
            </div>
            <div className="sm:flex space-x-3 sm:space-x-6 text-sm text-gray-400 text-center">
              <button
                onClick={() => router.push("/terms-and-conditions")}
                className={`${
                  isDarkTheme ? "hover:text-white" : "hover:text-gray-600"
                } transition-colors`}
              >
                Terms & Conditions
              </button>
              <button
                onClick={() => router.push("/privacy-policy")}
                className={`${
                  isDarkTheme ? "hover:text-white" : "hover:text-gray-600"
                } transition-colors`}
              >
                Privacy Policy
              </button>
              <button
                onClick={() => router.push("/refund-policy")}
                className={`${
                  isDarkTheme ? "hover:text-white" : "hover:text-gray-600"
                } transition-colors`}
              >
                Refund Policy
              </button>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Layout; 