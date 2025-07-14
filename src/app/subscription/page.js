'use client'
import React, { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import AuthWrapper from "../../components/AuthWrapper";
import useWindowSize from "../../hooks/useWindowSize"; // Import the window size hook
import {
  createSubscription,
  userPlan,
  verifyPayment,
  getUserSelection,
  cancelSubscription,
  downloadInvoice,
  invoiceList,
} from "../../helpers/api";
import { useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faX,
  faCrown,
  faRocket,
  faInfinity,
  faSpinner,
  faDownload,
  faEye,
} from "@fortawesome/free-solid-svg-icons";
import { useRouter, usePathname } from "next/navigation";

const Subscription = ({ partialAccess = false }) => {
    const isDarkTheme = true;
  // Get current theme from Redux store (same as SectorSidebar)
  const currentTheme = useSelector((state) => state.theme.currentTheme);
  const { width: windowWidth } = useWindowSize();
  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const handleLoginRequired = () => {
    console.log("Login required");
  };
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

  const isDarkMode =
    typeof currentTheme === "object"
      ? currentTheme.backgroundColor === "#000" ||
        currentTheme.navBg === "#1F2937"
      : currentTheme === "dark";

  // Theme-based styles
  const styles = {
    container: {
      padding: "24px",
      backgroundColor:
        currentTheme.backgroundColor || (isDarkMode ? "#000" : "#ffffff"),
      color: currentTheme.textColor || (isDarkMode ? "#ffffff" : "#000000"),
      minHeight: "calc(100vh - 60px)", // Account for header height
      height: "auto",
      overflowY: "visible", // Allow proper scrolling
      overflowX: "hidden",
      marginLeft: `${getMenuWidth()}px`,
      width: `calc(100% - ${getMenuWidth()}px)`,
      transition: "margin-left 0.3s ease, width 0.3s ease",
      position: "relative",
    },
    particleColor: isDarkMode ? "#ffffff" : "#000000",
    headingColor:
      currentTheme.textColor || (isDarkMode ? "#ffffff" : "#000000"),
    descriptionColor:
      currentTheme.mutedText || (isDarkMode ? "#d1d5db" : "#6b7280"),
    particleOpacity: isDarkMode ? 0.2 : 0.1,
  };
  const router = useRouter();
  const location = usePathname();
  const user = useSelector((state) => state.auth.user);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [userPhone, setUserPhone] = useState(user?.phone || "");
  const [userEmail, setUserEmail] = useState(user?.email || "");
  const [phoneValidation, setPhoneValidation] = useState({
    isValid: null,
    message: "",
  });
  const [emailValidation, setEmailValidation] = useState({
    isValid: null,
    message: "",
  });
  const [formErrors, setFormErrors] = useState({
    phone: false,
    email: false,
  });
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [isCancelLoading, setIsCancelLoading] = useState(false);
  const [isDownloadLoading, setIsDownloadLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState(false);
  const [currentPlanData, setCurrentPlanData] = useState(null);
  const [showCancelConfirmation, setShowCancelConfirmation] = useState(false);
  const [isWaitingForActivation, setIsWaitingForActivation] = useState(false);
  const [usageData, setUsageData] = useState({
    searchCount: 0,
    maxLimit: 10,
    remaining: 10,
  });
  const [userLocation, setUserLocation] = useState("India"); // Default to India
  const [invoices, setInvoices] = useState([]);
  const [isInvoicesLoading, setIsInvoicesLoading] = useState(false);
  const [invoicesError, setInvoicesError] = useState(null);

  // Location-based pricing configuration
  const pricingConfig = {
    India: {
      currency: "₹",
      gstRate: 0.18, // 18% GST
      professional: {
        name: "Professional",
        id: process.env.NEXT_PUBLIC_PROFESSIONAL_PLAN_ID,
        baseAmount: 3481, // Base amount before GST
        amount: 2950, // Amount including GST (2950 + 18% = 3481)
        gstAmount: 531, // GST amount (2950 * 0.18 = 531)
        billing: "Monthly",
        icon: faRocket,
        popular: false,
        features: [
          "5,000 queries/month",
          "50 Premium searches/hour",
          "25+ News Sources",
          "Slack + Teams integration",
          "Basic analytics dashboard",
          "Email support",
          "30-day free trial",
        ],
      },
      enterprise: {
        name: "Enterprise",
        id: process.env.NEXT_PUBLIC_ENTERPRISE_PLAN_ID,
        baseAmount: 5841, // Base amount before GST
        amount: 4950, // Amount including GST (4950 + 18% = 5841)
        gstAmount: 891, // GST amount (4950 * 0.18 = 891)
        originalAmount: 5940, // Original amount including GST (5940 + 18% = 7009)
        billing: "Monthly",
        icon: faCrown,
        popular: true,
        features: [
          "Unlimited queries",
          "100+ Premium News Sources",
          "100 Premium searches/hour",
          "10+ integrations (CRM, Slack, Teams etc.)",
          "Advanced analytics + reporting",
          "SSO + Enterprise security",
          "Dedicated success manager",
          "Custom AI training",
          "24/7 priority support",
        ],
      },
    },
    International: {
      currency: "$",
      professional: {
        name: "Professional",
        id:
          process.env.NEXT_PUBLIC_PROFESSIONAL_PLAN_ID_USD ||
          process.env.NEXT_PUBLIC_PROFESSIONAL_PLAN_ID,
        amount: 49,
        baseAmount: 49,
        gstAmount: 0,
        billing: "Monthly",
        icon: faRocket,
        popular: false,
        features: [
          "5,000 queries/month",
          "50 Premium searches/hour",
          "25+ News Sources",
          "Slack + Teams integration",
          "Basic analytics dashboard",
          "Email support",
          "30-day free trial",
        ],
      },
      enterprise: {
        name: "Enterprise",
        id:
          process.env.NEXT_PUBLIC_ENTERPRISE_PLAN_ID_USD ||
          process.env.NEXT_PUBLIC_ENTERPRISE_PLAN_ID,
        amount: 99,
        baseAmount: 99,
        gstAmount: 0,
        originalAmount: 119,
        billing: "Monthly",
        icon: faCrown,
        popular: true,
        features: [
          "Unlimited queries",
          "100+ Premium News Sources",
          "100 Premium searches/hour",
          "10+ integrations (CRM, Slack, Teams etc.)",
          "Advanced analytics + reporting",
          "SSO + Enterprise security",
          "Dedicated success manager",
          "Custom AI training",
          "24/7 priority support",
        ],
      },
    },
  };

  // Get current pricing based on location
  const getCurrentPricing = () => {
    return userLocation === "India"
      ? pricingConfig.India
      : pricingConfig.International;
  };

  // Get currency symbol based on location
  const getCurrencySymbol = () => {
    return getCurrentPricing().currency;
  };

  // Check if GST should be displayed (only for India)
  const shouldShowGST = () => {
    return userLocation === "India";
  };

  // Get GST rate for current location
  const getGSTRate = () => {
    const pricing = getCurrentPricing();
    return pricing.gstRate || 0;
  };

  // Get plans without currency property
  const getPlans = () => {
    const pricing = getCurrentPricing();
    const { currency, gstRate, ...plans } = pricing;
    return plans;
  };

  const plans = getPlans();

  // Get plan from URL params or default to enterprise
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const planParam = searchParams.get("plan");
    if (planParam && plans[planParam]) {
      setSelectedPlan(planParam);
    } else {
      setSelectedPlan("enterprise");
    }
  }, [location.search]);

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  // Mobile number validation function (location-based format)
  const validateMobileNumber = (phone) => {
    const cleanPhone = phone.replace(/\D/g, "");

    if (userLocation === "India") {
      // Indian format: 10 digits starting with 6-9
      const phoneRegex = /^[6-9]\d{9}$/;
      return cleanPhone.length === 10 && phoneRegex.test(cleanPhone);
    } else {
      // International format: 7-15 digits
      return cleanPhone.length >= 7 && cleanPhone.length <= 15;
    }
  };

  // Handle phone number change with real-time validation
  const handlePhoneChange = (e) => {
    let value = e.target.value;
    // Only allow numbers and limit based on location
    value = value.replace(/[^0-9]/g, "");

    if (userLocation === "India") {
      value = value.slice(0, 10); // Limit to 10 digits for India
    } else {
      value = value.slice(0, 15); // Limit to 15 digits for international
    }

    e.target.value = value;
    setUserPhone(value);

    // Clear form error when user starts typing
    if (formErrors.phone) {
      setFormErrors((prev) => ({ ...prev, phone: false }));
    }

    if (value.trim() === "") {
      setPhoneValidation({ isValid: null, message: "" });
    } else if (!validateMobileNumber(value.trim())) {
      setPhoneValidation({
        isValid: false,
        message:
          userLocation === "India"
            ? "Please enter a valid 10-digit mobile number"
            : "Please enter a valid phone number (7-15 digits)",
      });
    } else {
      setPhoneValidation({
        isValid: true,
        message: "Valid mobile number",
      });
    }
  };

  // Handle email change with real-time validation
  const handleEmailChange = (e) => {
    const value = e.target.value;
    setUserEmail(value);

    // Clear form error when user starts typing
    if (formErrors.email) {
      setFormErrors((prev) => ({ ...prev, email: false }));
    }

    if (value.trim() === "") {
      setEmailValidation({ isValid: null, message: "" });
    } else if (!validateEmail(value.trim())) {
      setEmailValidation({
        isValid: false,
        message: "Enter a valid email address (e.g., user@example.com)",
      });
    } else {
      setEmailValidation({ isValid: true, message: "Valid email address" });
    }
  };

  // Poll subscription status until active
  const pollSubscriptionStatus = async () => {
    const maxAttempts = 30; // Poll for up to 5 minutes (30 attempts * 10 seconds)
    let attempts = 0;

    const poll = async () => {
      try {
        attempts++;
        const planResponse = await userPlan();

        if (
          planResponse.status === 1 &&
          planResponse.plan?.subscription_status === "active"
        ) {
          // Subscription is now active
          setSubscriptionStatus(true);
          setCurrentPlanData(planResponse);
          setUsageData({
            searchCount: planResponse.search_count,
            maxLimit: planResponse.max_limit,
            remaining: planResponse.max_limit - planResponse.search_count,
          });
          setIsWaitingForActivation(false);
          toast.success("Subscription activated successfully!");
          return;
        }

        if (attempts < maxAttempts) {
          // Continue polling if max attempts not reached
          setTimeout(poll, 10000); // Poll every 10 seconds
        } else {
          // Max attempts reached
          setIsWaitingForActivation(false);
          toast.error(
            "Subscription activation is taking longer than expected. Please refresh the page or contact support."
          );
        }
      } catch (error) {
        if (attempts < maxAttempts) {
          // Continue polling even if there's an error
          setTimeout(poll, 10000);
        } else {
          setIsWaitingForActivation(false);
          toast.error(
            "Unable to verify subscription status. Please refresh the page or contact support."
          );
        }
      }
    };

    poll();
  };

  // Proceed to payment
  const proceedToPayment = () => {
    const errors = {
      phone: false,
      email: false,
    };

    // Validate phone number
    if (!userPhone.trim() || !validateMobileNumber(userPhone.trim())) {
      errors.phone = true;
    }

    // Validate email
    if (!userEmail.trim() || !validateEmail(userEmail.trim())) {
      errors.email = true;
    }

    // Set form errors
    setFormErrors(errors);

    // If there are errors, don't proceed
    if (errors.phone || errors.email) {
      return;
    }

    handlePayment();
  };

  // Payment handler
  const handlePayment = async () => {
    if (!selectedPlan) return;

    setIsPaymentLoading(true);

    try {
      const response = await createSubscription(plans[selectedPlan].id);
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        subscription_id: response.subscriptionId,
        name: "WEB SPIDERS (INDIA) PRIVATE LIMITED",
        description: `${plans[selectedPlan].name} Plan Subscription`,
        image: "https://cdn.razorpay.com/logos/MZM6yyjNUoOzCQ_large.png",
        handler: async function (res) {
          console.log(res);
          const {
            razorpay_payment_id,
            razorpay_subscription_id,
            razorpay_signature,
          } = res;
          try {
            const verifyResponse = await verifyPayment(
              razorpay_payment_id,
              razorpay_subscription_id,
              razorpay_signature
            );
            console.log(verifyResponse);
            if (
              verifyResponse.success === true &&
              verifyResponse.subscription_status === "created"
            ) {
              toast.success(
                "Payment successful! Setting up your subscription..."
              );
              setIsWaitingForActivation(true);
              pollSubscriptionStatus();
            } else {
              toast.error("Payment Verification Failed!");
            }
          } catch (err) {
            toast.error("Payment Verification Error!");
          }
        },
        prefill: {
          email: userEmail,
          contact: userPhone,
        },
        theme: {
          color: "#6ABCFF",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on("payment.failed", function (response) {
        console.error("Payment failed:", response.error);
        toast.error(`Payment failed: ${response.error.description}`);
        setIsPaymentLoading(false);
      });

      paymentObject.open();
    } catch (error) {
      console.error("Error initiating payment:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsPaymentLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    setIsCancelLoading(true);
    try {
      const response = await cancelSubscription(
        currentPlanData?.plan?.subscription_id
      );
      console.log(response);

      // Check if status is active and show popup with message and current_end
      if (response.status === "active" && response.subscription?.current_end) {
        const endDate = new Date(
          response.subscription.current_end * 1000
        ).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        toast.success(
          `${
            response.message ||
            "Subscription will be cancelled at the end of current cycle"
          } ${endDate}`,
          {
            duration: 6000,
            style: {
              background: isDarkTheme ? "#1f2937" : "#ffffff",
              color: isDarkTheme ? "#ffffff" : "#000000",
              border: isDarkTheme ? "1px solid #374151" : "1px solid #e5e7eb",
            },
          }
        );
      } else {
        toast.success("Subscription canceled successfully");
      }

      // Refresh user plan data after successful cancellation
      try {
        const planResponse = await userPlan();
        if (planResponse.status === 1) {
          setCurrentPlanData(planResponse);
          setUsageData({
            searchCount: planResponse.search_count,
            maxLimit: planResponse.max_limit,
            remaining: planResponse.max_limit - planResponse.search_count,
          });
        }
      } catch (error) {
        console.log("Error refreshing plan data:", error);
      }
      // setSubscriptionStatus(false);
    } catch (error) {
      console.error("Error canceling subscription:", error);
      toast.error("Failed to cancel subscription. Please try again.");
    } finally {
      setIsCancelLoading(false);
      setShowCancelConfirmation(false);
    }
  };

  const handleDownloadInvoice = async () => {
    setIsDownloadLoading(true);
    try {
      const response = await downloadInvoice(
        currentPlanData?.plan?.subscription_id
      );

      // Create blob from response
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      // Create download link
      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${currentPlanData?.plan?.subscription_id}-${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Invoice downloaded successfully");
    } catch (error) {
      console.error("Error downloading invoice:", error);
      toast.error("Failed to download invoice. Please try again.");
    } finally {
      setIsDownloadLoading(false);
    }
  };

  // Fetch invoices when subscription status is true
  const fetchInvoices = async () => {
    if (!subscriptionStatus) return;

    setIsInvoicesLoading(true);
    setInvoicesError(null);

    try {
      const response = await invoiceList();
      if (response.status === 1 && response.invoices) {
        setInvoices(response.invoices);
      } else {
        setInvoices([]);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      setInvoicesError("Failed to load invoices");
      setInvoices([]);
    } finally {
      setIsInvoicesLoading(false);
    }
  };

  // Fetch user plan and usage data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get user plan
        const planResponse = await userPlan();

        // Set user location from API response
        if (planResponse.location) {
          setUserLocation(planResponse.location);
        }

        if (planResponse.status === 1) {
          setSubscriptionStatus(true);
          setCurrentPlanData(planResponse);

          // Extract usage data from the same response
          setUsageData({
            searchCount: planResponse.search_count,
            maxLimit: planResponse.max_limit,
            remaining: planResponse.max_limit - planResponse.search_count,
          });
        } else {
          setSubscriptionStatus(false);
        }

        // Get usage data as fallback if not in plan response
        try {
          const usageResponse = await getUserSelection();
          if (usageResponse && !subscriptionStatus) {
            setUsageData({
              searchCount: usageResponse.search_count,
              maxLimit: usageResponse.max_limit,
              remaining: usageResponse.max_limit - usageResponse.search_count,
            });
          }
        } catch (usageError) {
          console.log("Usage data not available separately");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setSubscriptionStatus(false);

        // Set location from error response if available
        if (error.response?.data?.location) {
          setUserLocation(error.response.data.location);
        }

        // Set usage data from error response if available
        if (error.response?.data?.max_limit) {
          setUsageData({
            searchCount: error.response.data.search_count || 0,
            maxLimit: error.response.data.max_limit || 10,
            remaining:
              (error.response.data.max_limit || 10) -
              (error.response.data.search_count || 0),
          });
        }
      } finally {
        setIsInitialLoading(false);
      }
    };
    fetchUserData();
  }, []);

  // Fetch invoices when subscription status changes to true
  useEffect(() => {
    if (subscriptionStatus) {
      fetchInvoices();
    }
  }, [subscriptionStatus]);

  // Format date helper function
  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format amount helper function
  const formatAmount = (amount, currency) => {
    const currencySymbol = currency === "INR" ? "₹" : "$";
    return `${currencySymbol}${amount.toLocaleString()}`;
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "failed":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const currentPlan = selectedPlan ? plans[selectedPlan] : null;

  // Show loading state while fetching user plan
  if (isInitialLoading) {
    return (
      <DashboardLayout isDarkTheme={true}>
        <div
          className="relative w-full h-full overflow-hidden flex items-center justify-center under-construction-container"
          style={styles.container}
        >
          <div className="flex items-center justify-center min-h-screen w-full">
            <div className="text-center">
              <FontAwesomeIcon
                icon={faSpinner}
                className={`text-6xl mb-4 animate-spin ${
                  isDarkTheme ? "text-white" : "text-gray-900"
                }`}
              />
              <h2
                className={`text-xl font-semibold ${
                  isDarkTheme ? "text-white" : "text-gray-900"
                }`}
              >
                Loading your subscription details...
              </h2>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!currentPlan) {
    return (
      <DashboardLayout isDarkTheme={true}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">
              Invalid Plan Selected
            </h2>
            <button
              onClick={() => router.push("/pricing")}
              className="bg-gradient-to-r from-[#B8E6F8] to-[#5E8EFF] text-black px-6 py-3 rounded-lg font-semibold"
            >
              Go Back to Pricing
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
      <DashboardLayout isDarkTheme={true}>
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
        <div
          className="relative w-full subscription-container"
          style={styles.container}
        >
          <div className="w-full max-w-[1200px] mx-auto">
            {/* Header */}
            <div className="text-center mb-6 md:mb-12">
              <h1
                className={`text-4xl font-semibold mb-4 ${
                  isDarkTheme ? "text-white" : "text-gray-900"
                }`}
              >
                {subscriptionStatus ? "Your Subscription" : "Choose Your Plan"}
              </h1>
              {!subscriptionStatus && (
                <p
                  className={`text-xl ${
                    isDarkTheme ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Yippee! You&apos;re on{" "}
                  <span
                    className={`${
                      isDarkTheme
                        ? "bg-green-400/10 border border-green-400/30"
                        : "bg-green-400/10 border border-green-400/30"
                    } border rounded-xl text-center font-semibold text-white px-1`}
                  >
                    Free Plan
                  </span>{" "}
                  upgrade to unlock premium features
                </p>
              )}
              <p
                className={`text-xl ${
                  isDarkTheme ? "text-gray-400" : "text-gray-600"
                }`}
              >
                {subscriptionStatus
                  ? "Manage your subscription and view usage statistics"
                  : "Unlock the full power of SAGE AI with our premium plans"}
              </p>
            </div>
            {/* subscriptionStatus */}
            {subscriptionStatus ? (
              /* Current Subscription View */
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Current Plan Card */}
                  <div className="lg:col-span-2 h-full">
                    <div
                      className={`h-full ${
                        isDarkTheme ? "bg-gray-800" : "bg-white"
                      } rounded-xl shadow-lg p-8 border ${
                        isDarkTheme ? "border-gray-700" : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-gradient-to-r from-[#B8E6F8] to-[#5E8EFF] rounded-lg">
                            <FontAwesomeIcon
                              icon={faCrown}
                              className="text-white text-xl"
                            />
                          </div>
                          <div>
                            <h2
                              className={`text-2xl font-bold ${
                                isDarkTheme ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {currentPlanData?.plan?.description
                                ?.split(" ")
                                .slice(0, -2)
                                .join(" ")}
                            </h2>
                            <p
                              className={`${
                                isDarkTheme
                                  ? "bg-green-400/10 border border-green-400/30"
                                  : "bg-green-400/10 border border-green-400/30"
                              } border rounded-xl text-center py-1 px-1`}
                            >
                              Active subscription
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-2xl font-bold ${
                              isDarkTheme ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {getCurrencySymbol()}
                            {currentPlanData?.plan?.amount?.toLocaleString()}
                          </div>
                          {shouldShowGST() && (
                            <div
                              className={`text-xs ${
                                isDarkTheme ? "text-gray-400" : "text-gray-500"
                              } mt-1`}
                            >
                              (includes 18% GST)
                            </div>
                          )}
                          <div
                            className={`text-sm ${
                              isDarkTheme ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            per month
                          </div>
                        </div>
                      </div>

                      {/* Subscription Expiry */}
                      {currentPlanData?.plan?.end_at && (
                        <div className="mb-6">
                          <p
                            className={`text-base ${
                              isDarkTheme ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            Your Subscription Expires on{" "}
                            <span
                              className={`font-semibold ${
                                isDarkTheme ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {new Date(
                                currentPlanData.plan.end_at
                              ).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>{" "}
                            at{" "}
                            <span
                              className={`font-semibold ${
                                isDarkTheme ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {new Date(
                                currentPlanData.plan.end_at
                              ).toLocaleTimeString("en-US", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </p>
                        </div>
                      )}

                      {/* Usage Statistics */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div
                          className={`p-4 rounded-lg ${
                            isDarkTheme ? "bg-gray-700" : "bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className={`text-sm font-medium ${
                                isDarkTheme ? "text-gray-300" : "text-gray-700"
                              }`}
                            >
                              Searches Used
                            </span>
                            <FontAwesomeIcon
                              icon={faRocket}
                              className="text-blue-500"
                            />
                          </div>
                          <div
                            className={`text-2xl font-bold ${
                              isDarkTheme ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {usageData.searchCount}
                          </div>
                          <div
                            className={`text-sm ${
                              isDarkTheme ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            this hour
                          </div>
                        </div>

                        <div
                          className={`p-4 rounded-lg ${
                            isDarkTheme ? "bg-gray-700" : "bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className={`text-sm font-medium ${
                                isDarkTheme ? "text-gray-300" : "text-gray-700"
                              }`}
                            >
                              Remaining
                            </span>
                            <FontAwesomeIcon
                              icon={faInfinity}
                              className="text-green-500"
                            />
                          </div>
                          <div
                            className={`text-2xl font-bold ${
                              isDarkTheme ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {usageData.remaining}
                          </div>
                          <div
                            className={`text-sm ${
                              isDarkTheme ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            searches left per hour
                          </div>
                        </div>

                        <div
                          className={`p-4 rounded-lg ${
                            isDarkTheme ? "bg-gray-700" : "bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className={`text-sm font-medium ${
                                isDarkTheme ? "text-gray-300" : "text-gray-700"
                              }`}
                            >
                              Hourly Limit
                            </span>
                            <FontAwesomeIcon
                              icon={faCheck}
                              className="text-purple-500"
                            />
                          </div>
                          <div
                            className={`text-2xl font-bold ${
                              isDarkTheme ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {usageData.maxLimit}
                          </div>
                          <div
                            className={`text-sm ${
                              isDarkTheme ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            per hour
                          </div>
                        </div>
                      </div>

                      {/* Usage Progress Bar */}
                      <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                          <span
                            className={`text-sm font-medium ${
                              isDarkTheme ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            Usage Progress
                          </span>
                          <span
                            className={`text-sm ${
                              isDarkTheme ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            {usageData.searchCount}/{usageData.maxLimit}
                          </span>
                        </div>
                        <div
                          className={`w-full h-2 rounded-full ${
                            isDarkTheme ? "bg-gray-700" : "bg-gray-200"
                          }`}
                        >
                          <div
                            className="h-full bg-gradient-to-r from-[#B8E6F8] to-[#5E8EFF] rounded-full transition-all duration-300"
                            style={{
                              width: `${
                                (usageData.searchCount / usageData.maxLimit) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex justify-center">
                        {!currentPlanData?.plan?.cancel_at_cycle_end && (
                          <button
                            onClick={() => setShowCancelConfirmation(true)}
                            className={`px-8 py-3 rounded-lg font-semibold hover:shadow-lg transition-all ${
                              isDarkTheme
                                ? "bg-gray-700 text-white"
                                : "bg-gray-200 text-gray-900"
                            }`}
                          >
                            Cancel Subscription
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="space-y-6">
                    <div
                      className={`${
                        isDarkTheme ? "bg-gray-800" : "bg-white"
                      } rounded-xl shadow-lg p-6 border h-full flex flex-col ${
                        isDarkTheme ? "border-gray-700" : "border-gray-200"
                      }`}
                    >
                      <h3
                        className={`text-lg font-semibold mb-4 ${
                          isDarkTheme ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Need Help?
                      </h3>
                      <p
                        className={`text-sm ${
                          isDarkTheme ? "text-gray-400" : "text-gray-600"
                        } mb-4`}
                      >
                        Contact our support team for assistance with your
                        subscription or billing.
                      </p>
                      <div className="flex justify-center mt-auto">
                        <button
                          className={`px-8 py-2  rounded-lg font-medium hover:shadow-lg transition-all ${
                            isDarkTheme
                              ? "bg-gray-700 text-white"
                              : "bg-gray-200 text-gray-900"
                          }`}
                          onClick={() => router.push("/support")}
                        >
                          Contact Support
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Invoice History Section */}
                <div className="mt-8">
                  <div
                    className={`${
                      isDarkTheme ? "bg-gray-800" : "bg-white"
                    } rounded-xl shadow-lg p-6 border ${
                      isDarkTheme ? "border-gray-700" : "border-gray-200"
                    }`}
                  >
                    <h3
                      className={`text-xl font-semibold mb-6 ${
                        isDarkTheme ? "text-white" : "text-gray-900"
                      }`}
                    >
                      Billing History
                    </h3>

                    {isInvoicesLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <FontAwesomeIcon
                          icon={faSpinner}
                          className={`text-2xl animate-spin ${
                            isDarkTheme ? "text-white" : "text-gray-900"
                          }`}
                        />
                        <span
                          className={`ml-3 ${
                            isDarkTheme ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Loading invoices...
                        </span>
                      </div>
                    ) : invoicesError ? (
                      <div className="text-center py-8">
                        <p className={`text-red-500 mb-4`}>{invoicesError}</p>
                        <button
                          onClick={fetchInvoices}
                          className={`px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all ${
                            isDarkTheme
                              ? "bg-gray-700 text-white"
                              : "bg-gray-200 text-gray-900"
                          }`}
                        >
                          Retry
                        </button>
                      </div>
                    ) : invoices.length === 0 ? (
                      <div className="text-center py-8">
                        <p
                          className={`${
                            isDarkTheme ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          No invoices found
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr
                                className={`border-b ${
                                  isDarkTheme
                                    ? "border-gray-600"
                                    : "border-gray-200"
                                }`}
                              >
                                {/* <th
                                  className={`text-left py-3 px-4 font-medium ${
                                    isDarkTheme
                                      ? "text-gray-300"
                                      : "text-gray-700"
                                  }`}
                                >
                                  Invoice ID
                                </th> */}
                                <th
                                  className={`text-left py-3 px-4 font-medium ${
                                    isDarkTheme
                                      ? "text-gray-300"
                                      : "text-gray-700"
                                  }`}
                                >
                                  Date
                                </th>
                                <th
                                  className={`text-left py-3 px-4 font-medium ${
                                    isDarkTheme
                                      ? "text-gray-300"
                                      : "text-gray-700"
                                  }`}
                                >
                                  Amount
                                </th>
                                <th
                                  className={`text-left py-3 px-4 font-medium ${
                                    isDarkTheme
                                      ? "text-gray-300"
                                      : "text-gray-700"
                                  }`}
                                >
                                  Status
                                </th>
                                <th
                                  className={`text-left py-3 px-4 font-medium ${
                                    isDarkTheme
                                      ? "text-gray-300"
                                      : "text-gray-700"
                                  }`}
                                >
                                  Action
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {invoices.map((invoice, index) => (
                                <tr
                                  key={invoice.id}
                                  className={`border-b ${
                                    isDarkTheme
                                      ? "border-gray-700"
                                      : "border-gray-100"
                                  } ${
                                    isDarkTheme
                                      ? "hover:bg-gray-700"
                                      : "hover:bg-gray-50"
                                  } transition-colors`}
                                >
                                  {/* <td
                                    className={`py-4 px-4 ${
                                      isDarkTheme
                                        ? "text-white"
                                        : "text-gray-900"
                                    }`}
                                  >
                                    <span className="font-mono text-sm">
                                      {invoice.id}
                                    </span>
                                  </td> */}
                                  <td
                                    className={`py-4 px-4 ${
                                      isDarkTheme
                                        ? "text-gray-300"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    {formatDate(invoice.created_at)}
                                  </td>
                                  <td
                                    className={`py-4 px-4 font-semibold ${
                                      isDarkTheme
                                        ? "text-white"
                                        : "text-gray-900"
                                    }`}
                                  >
                                    {formatAmount(
                                      invoice.amount,
                                      invoice.currency
                                    )}
                                  </td>
                                  <td className="py-4 px-4">
                                    <span
                                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeColor(
                                        invoice.status
                                      )}`}
                                    >
                                      {invoice.status.toUpperCase()}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4">
                                    <a
                                      href={invoice.short_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-600 text-sm font-medium"
                                    >
                                      <FontAwesomeIcon icon={faEye} />
                                      View
                                    </a>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-4">
                          {invoices.map((invoice, index) => (
                            <div
                              key={invoice.id}
                              className={`${
                                isDarkTheme ? "bg-gray-700" : "bg-gray-50"
                              } rounded-lg p-4 border ${
                                isDarkTheme
                                  ? "border-gray-600"
                                  : "border-gray-200"
                              }`}
                            >
                              {/* <div className="flex justify-between items-start mb-3">
                                <div>
                                  <p
                                    className={`text-sm font-medium ${
                                      isDarkTheme
                                        ? "text-gray-300"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    Invoice ID
                                  </p>
                                  <p
                                    className={`font-mono text-sm ${
                                      isDarkTheme
                                        ? "text-white"
                                        : "text-gray-900"
                                    }`}
                                  >
                                    {invoice.id}
                                  </p>
                                </div>
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeColor(
                                    invoice.status
                                  )}`}
                                >
                                  {invoice.status.toUpperCase()}
                                </span>
                              </div> */}

                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                  <p
                                    className={`text-sm font-medium ${
                                      isDarkTheme
                                        ? "text-gray-300"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    Date
                                  </p>
                                  <p
                                    className={`${
                                      isDarkTheme
                                        ? "text-white"
                                        : "text-gray-900"
                                    }`}
                                  >
                                    {formatDate(invoice.created_at)}
                                  </p>
                                </div>
                                <div>
                                  <p
                                    className={`text-sm font-medium ${
                                      isDarkTheme
                                        ? "text-gray-300"
                                        : "text-gray-700"
                                    }`}
                                  >
                                    Amount
                                  </p>
                                  <p
                                    className={`font-semibold ${
                                      isDarkTheme
                                        ? "text-white"
                                        : "text-gray-900"
                                    }`}
                                  >
                                    {formatAmount(
                                      invoice.amount,
                                      invoice.currency
                                    )}
                                  </p>
                                </div>
                              </div>

                              <div className="flex justify-end">
                                <a
                                  href={invoice.short_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-blue-500 hover:text-blue-600 text-sm font-medium"
                                >
                                  <FontAwesomeIcon icon={faEye} />
                                  View Invoice
                                </a>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              /* Upgrade Plan View */
              <div className="md:grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-8 max-w-6xl mx-auto">
                {/* Plan Selection */}
                <div className="mb-5 md:mb-0 space-y-5">
                  {Object.entries(plans).map(([key, plan]) => (
                    <div
                      key={key}
                      className={`relative rounded-xl border-2 p-4 lg:p-6 cursor-pointer transition-all ${
                        selectedPlan === key
                          ? "border-blue-500 bg-[#061529] dark:bg-[#061529]"
                          : isDarkTheme
                          ? "border-gray-700 bg-gray-800 hover:border-gray-600"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedPlan(key)}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-6 bg-gradient-to-r from-[#B8E6F8] to-[#5E8EFF] text-black px-3 py-1 rounded-full text-sm font-semibold">
                          Most Popular
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-r from-[#B8E6F8] to-[#5E8EFF] rounded-lg">
                            <FontAwesomeIcon
                              icon={plan.icon}
                              className="text-white"
                            />
                          </div>
                          <div>
                            <h3
                              className={`text-xl font-semibold ${
                                isDarkTheme ? "text-white" : "text-gray-900"
                              }`}
                            >
                              {plan.name}
                            </h3>
                            <p
                              className={`text-sm ${
                                isDarkTheme ? "text-gray-400" : "text-gray-600"
                              }`}
                            >
                              {plan.billing}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={`text-2xl font-bold ${
                              isDarkTheme ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {getCurrencySymbol()}
                            {plan.amount.toLocaleString()}
                          </div>
                          {plan.originalAmount && (
                            <div
                              className={`text-sm line-through ${
                                isDarkTheme ? "text-gray-400" : "text-gray-500"
                              }`}
                            >
                              {getCurrencySymbol()}
                              {plan.originalAmount.toLocaleString()}
                            </div>
                          )}
                          {shouldShowGST() && (
                            <div
                              className={`text-xs ${
                                isDarkTheme ? "text-gray-400" : "text-gray-500"
                              } mt-1`}
                            >
                              {/* <div>
                              {getCurrencySymbol()}
                              {plan.baseAmount?.toLocaleString()}
                            </div> */}
                              <div>+18% GST</div>
                            </div>
                          )}
                          <div
                            className={`text-sm ${
                              isDarkTheme ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            per month
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {plan.features.slice(0, 4).map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <FontAwesomeIcon
                              icon={faCheck}
                              className="text-green-500 text-sm"
                            />
                            <span
                              className={`text-sm ${
                                isDarkTheme ? "text-gray-300" : "text-gray-700"
                              }`}
                            >
                              {feature}
                            </span>
                          </div>
                        ))}
                        {plan.features.length > 4 && (
                          <div
                            className={`text-sm ${
                              isDarkTheme ? "text-gray-400" : "text-gray-600"
                            }`}
                          >
                            +{plan.features.length - 4} more features
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Checkout Form */}
                <div
                  className={`${
                    isDarkTheme ? "bg-gray-800" : "bg-white"
                  } rounded-xl shadow-lg p-4 lg:p-8 border md:mt-0 ${
                    isDarkTheme ? "border-gray-700" : "border-gray-200"
                  } h-100`}
                >
                  <h3
                    className={`text-xl font-semibold mb-6 ${
                      isDarkTheme ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Complete Your Subscription
                  </h3>

                  <div className="space-y-6">
                    {/* Phone Number Input - Fixed for iOS */}
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${
                          isDarkTheme ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Phone Number *
                      </label>
                      <div
                        className={`phone-input-container ${
                          formErrors.phone
                            ? "border-red-500"
                            : phoneValidation.isValid === null
                            ? isDarkTheme
                              ? "border-gray-600"
                              : "border-gray-300"
                            : phoneValidation.isValid
                            ? "border-green-500"
                            : "border-red-500"
                        } ${isDarkTheme ? "bg-gray-700" : "bg-gray-50"}`}
                        style={{
                          display: "flex",
                          borderRadius: "8px",
                          overflow: "hidden",
                          border: "1px solid",
                        }}
                      >
                        <select
                          className={`${
                            isDarkTheme
                              ? "bg-gray-700 text-white border-gray-600"
                              : "bg-gray-50 text-gray-900 border-gray-300"
                          }`}
                          style={{
                            border: "none",
                            borderRight: "1px solid",
                            borderRightColor: isDarkTheme
                              ? "#4b5563"
                              : "#d1d5db",
                            borderRadius: "0",
                            padding: "12px 8px",
                            backgroundColor: "inherit",
                            WebkitAppearance: "none",
                            MozAppearance: "none",
                            appearance: "none",
                            fontSize: "16px",
                          }}
                        >
                          {userLocation === "India" ? (
                            <option>+91</option>
                          ) : (
                            <>
                              <option>+1</option>
                              <option>+44</option>
                              <option>+61</option>
                              <option>+91</option>
                              <option>+49</option>
                              <option>+33</option>
                              <option>+81</option>
                            </>
                          )}
                        </select>
                        <input
                          type="tel"
                          value={userPhone}
                          onChange={handlePhoneChange}
                          className={`${
                            isDarkTheme
                              ? "bg-gray-700 text-white"
                              : "bg-gray-50 text-gray-900"
                          } focus:outline-none focus:ring-2 ${
                            formErrors.phone
                              ? "focus:ring-red-500"
                              : phoneValidation.isValid === null
                              ? "focus:ring-blue-500"
                              : phoneValidation.isValid
                              ? "focus:ring-green-500"
                              : "focus:ring-red-500"
                          }`}
                          style={{
                            border: "none",
                            borderRadius: "0",
                            flex: "1",
                            padding: "12px 16px",
                            backgroundColor: "inherit",
                            WebkitAppearance: "none",
                            MozAppearance: "none",
                            appearance: "none",
                            fontSize: "16px",
                            WebkitTapHighlightColor: "transparent",
                          }}
                          placeholder={
                            userLocation === "India"
                              ? "Enter 10-digit mobile number"
                              : "Enter phone number"
                          }
                          maxLength={userLocation === "India" ? "10" : "15"}
                          inputMode="numeric"
                          pattern="[0-9]*"
                        />
                      </div>
                      {formErrors.phone && (
                        <p className="text-sm mt-2 text-red-500">
                          {userLocation === "India"
                            ? "Please enter a valid 10-digit mobile number"
                            : "Please enter a valid phone number (7-15 digits)"}
                        </p>
                      )}
                      {!formErrors.phone && phoneValidation.message && (
                        <p
                          className={`text-sm mt-2 ${
                            phoneValidation.isValid
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {phoneValidation.message}
                        </p>
                      )}
                    </div>

                    {/* Email Input - Fixed for iOS */}
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${
                          isDarkTheme ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={userEmail}
                        onChange={handleEmailChange}
                        className={`w-full ${
                          isDarkTheme
                            ? "bg-gray-700 text-white border-gray-600"
                            : "bg-gray-50 text-gray-900 border-gray-300"
                        } border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 ${
                          formErrors.email
                            ? "border-red-500 focus:ring-red-500"
                            : emailValidation.isValid === null
                            ? "border-gray-300 focus:ring-blue-500"
                            : emailValidation.isValid
                            ? "border-green-500 focus:ring-green-500"
                            : "border-red-500 focus:ring-red-500"
                        }`}
                        style={{
                          WebkitAppearance: "none",
                          MozAppearance: "none",
                          appearance: "none",
                          fontSize: "16px",
                          WebkitTapHighlightColor: "transparent",
                          borderRadius: "8px",
                        }}
                        placeholder="Enter email address"
                        inputMode="email"
                        autoComplete="email"
                      />
                      {formErrors.email && (
                        <p className="text-sm mt-2 text-red-500">
                          Please enter a valid email address
                        </p>
                      )}
                      {!formErrors.email && emailValidation.message && (
                        <p
                          className={`text-sm mt-2 ${
                            emailValidation.isValid
                              ? "text-green-500"
                              : "text-red-500"
                          }`}
                        >
                          {emailValidation.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* GST Breakdown for Indian users */}
                  {shouldShowGST() && currentPlan && (
                    <div
                      className={`mb-6 p-4 rounded-lg border ${
                        isDarkTheme
                          ? "bg-gray-700 border-gray-600"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <h4
                        className={`text-sm font-semibold mb-3 ${
                          isDarkTheme ? "text-white" : "text-gray-900"
                        }`}
                      >
                        Price Breakdown
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span
                            className={`${
                              isDarkTheme ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            {currentPlan.name} Plan
                          </span>
                          <span
                            className={`${
                              isDarkTheme ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {getCurrencySymbol()}
                            {currentPlan.amount?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span
                            className={`${
                              isDarkTheme ? "text-gray-300" : "text-gray-700"
                            }`}
                          >
                            +18% GST
                          </span>
                          <span
                            className={`${
                              isDarkTheme ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {getCurrencySymbol()}
                            {currentPlan.gstAmount?.toLocaleString()}
                          </span>
                        </div>
                        <div
                          className={`flex justify-between pt-2 border-t font-semibold ${
                            isDarkTheme
                              ? "border-gray-600 text-white"
                              : "border-gray-300 text-gray-900"
                          }`}
                        >
                          <span>Total Amount</span>
                          <span>
                            {getCurrencySymbol()}
                            {currentPlan.baseAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-8">
                    <button
                      onClick={proceedToPayment}
                      disabled={isPaymentLoading}
                      className={`w-full bg-gradient-to-r from-[#B8E6F8] to-[#5E8EFF] text-black py-4 rounded-lg font-semibold transition-all ${
                        isPaymentLoading
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:shadow-lg"
                      }`}
                    >
                      {isPaymentLoading ? (
                        "Processing..."
                      ) : (
                        <div className="flex items-center gap-2 justify-center">
                          <span>
                            Pay {getCurrencySymbol()}
                            {currentPlan.baseAmount.toLocaleString()} using
                          </span>
                          <img
                            src="/images/razorpay-logo.svg"
                            alt="Razorpay"
                            className="w-20 h-6"
                          />
                        </div>
                      )}
                    </button>

                    <div className="text-center mt-6">
                      <div className="flex items-center gap-2 justify-center text-sm text-gray-400 mb-2">
                        <span>🔒 Secured by</span>
                        <img
                          src="/images/razorpay-logo.svg"
                          alt="Razorpay"
                          className="w-16 h-5"
                        />
                      </div>
                      {shouldShowGST() && (
                        <div
                          className={`text-xs ${
                            isDarkTheme ? "text-gray-500" : "text-gray-500"
                          }`}
                        >
                          * All prices include 18% GST as per Indian tax
                          regulations
                        </div>
                      )}
                    </div>

                    {currentPlanData?.status === 1 && (
                      <button
                        onClick={() => setSubscriptionStatus(true)}
                        className={`w-full mt-5 ${
                          isDarkTheme
                            ? "bg-gray-700 text-white"
                            : "bg-gray-200 text-gray-900"
                        } py-3 rounded-lg font-semibold hover:shadow-lg transition-all`}
                      >
                        Back to Dashboard
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Subscription Activation Waiting Popup */}
        {isWaitingForActivation && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div
              className={`${
                isDarkTheme ? "bg-gray-800" : "bg-white"
              } rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 border ${
                isDarkTheme ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div className="text-center">
                <div className="mb-6">
                  <FontAwesomeIcon
                    icon={faSpinner}
                    className={`text-4xl mb-4 animate-spin ${
                      isDarkTheme ? "text-white" : "text-gray-900"
                    }`}
                  />
                  <h3
                    className={`text-xl font-semibold mb-2 ${
                      isDarkTheme ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Subscription Created!
                  </h3>
                  <p
                    className={`text-sm ${
                      isDarkTheme ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Your subscription is created. Please wait or come back after
                    some time to see the details. We&apos;re activating your
                    subscription now...
                  </p>
                </div>
                <div
                  className={`text-xs ${
                    isDarkTheme ? "text-gray-500" : "text-gray-500"
                  }`}
                >
                  This usually takes 1-2 minutes
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cancel Confirmation Popup */}
        {showCancelConfirmation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div
              className={`${
                isDarkTheme ? "bg-gray-800" : "bg-white"
              } rounded-xl shadow-2xl p-8 max-w-md w-full mx-4 border ${
                isDarkTheme ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <div className="text-center">
                <div className="mb-6">
                  <h3
                    className={`text-xl font-semibold mb-2 ${
                      isDarkTheme ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Cancel Subscription
                  </h3>
                  <p
                    className={`text-sm ${
                      isDarkTheme ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    Are you sure you want to cancel your subscription? This
                    action will cancel your subscription at the end of the
                    current billing cycle.
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setShowCancelConfirmation(false)}
                    className={`flex-1 ${
                      isDarkTheme
                        ? "bg-gray-700 text-white hover:bg-gray-600"
                        : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                    } py-3 px-6 rounded-lg font-semibold transition-all`}
                  >
                    No
                  </button>
                  <button
                    onClick={() => {
                      handleCancelSubscription();
                    }}
                    disabled={isCancelLoading}
                    className={`flex-1 ${
                      isDarkTheme
                        ? "bg-gray-700 text-white hover:bg-gray-600"
                        : "bg-gray-200 text-gray-900 hover:bg-gray-300"
                    } py-3 px-6 rounded-lg font-semibold  transition-all ${
                      isCancelLoading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {isCancelLoading ? (
                      <FontAwesomeIcon
                        icon={faSpinner}
                        className="animate-spin"
                      />
                    ) : (
                      "Yes"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced CSS for iOS fixes and responsive design */}
        <style jsx>{`
          /* iOS Input Field Fixes */
          input[type="number"],
          input[type="email"],
          input[type="tel"],
          select {
            /* Remove iOS default styling */
            -webkit-appearance: none !important;
            -moz-appearance: none !important;
            appearance: none !important;

            /* Prevent iOS zoom on focus */
            font-size: 16px !important;

            /* Remove iOS default border radius */
            border-radius: 8px !important;

            /* Remove iOS default shadows and highlights */
            -webkit-box-shadow: none !important;
            box-shadow: none !important;
            -webkit-tap-highlight-color: transparent !important;
          }

          /* Remove spinner arrows on number inputs */
          input[type="number"]::-webkit-outer-spin-button,
          input[type="number"]::-webkit-inner-spin-button {
            -webkit-appearance: none !important;
            margin: 0 !important;
          }

          input[type="number"] {
            -moz-appearance: textfield !important;
          }

          /* Phone input container styling */
          .phone-input-container {
            display: flex !important;
            border-radius: 8px !important;
            overflow: hidden !important;
            background-color: inherit !important;
          }

          .phone-input-container select {
            border: none !important;
            border-radius: 0 !important;
            flex-shrink: 0 !important;
            background-color: inherit !important;
            -webkit-appearance: none !important;
            -moz-appearance: none !important;
            appearance: none !important;
          }

          .phone-input-container input {
            border: none !important;
            border-radius: 0 !important;
            flex: 1 !important;
            background-color: inherit !important;
            -webkit-appearance: none !important;
            -moz-appearance: none !important;
            appearance: none !important;
          }

          /* Custom scrollbar styling */
          .subscription-container::-webkit-scrollbar {
            width: 8px;
          }

          .subscription-container::-webkit-scrollbar-track {
            background: ${isDarkMode ? "#1f2937" : "#f1f5f9"};
            border-radius: 4px;
          }

          .subscription-container::-webkit-scrollbar-thumb {
            background: ${isDarkMode ? "#4b5563" : "#cbd5e1"};
            border-radius: 4px;
          }

          .subscription-container::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }

          /* Dark theme scrollbar */
          .dark .subscription-container::-webkit-scrollbar-track {
            background: #1f2937;
          }

          .dark .subscription-container::-webkit-scrollbar-thumb {
            background: #4b5563;
          }

          .dark .subscription-container::-webkit-scrollbar-thumb:hover {
            background: #6b7280;
          }

          /* Firefox scrollbar styling */
          .subscription-container {
            padding-bottom: 20px;
            scrollbar-width: thin;
            scrollbar-color: #cbd5e1 #f1f5f9;
          }

          .dark .subscription-container {
            scrollbar-color: #4b5563 #1f2937;
          }

          /* Smooth scrolling */
          html {
            scroll-behavior: smooth;
          }

          /* Hover effects */
          .plan-card:hover {
            transform: translateY(-2px);
            box-shadow: ${isDarkMode
              ? "0 8px 25px rgba(0, 0, 0, 0.3)"
              : "0 8px 25px rgba(0, 0, 0, 0.1)"};
          }

          /* Responsive adjustments for mobile */
          @media (max-width: 640px) {
            .subscription-container {
              margin-left: 0 !important;
              width: 100% !important;
              padding: 16px;
              min-height: calc(100vh - 80px) !important;
            }

            /* Mobile grid adjustments */
            .grid.lg\\:grid-cols-2 {
              grid-template-columns: 1fr !important;
            }

            .grid.lg\\:grid-cols-3 {
              grid-template-columns: 1fr !important;
            }

            /* Mobile text adjustments */
            .text-4xl {
              font-size: 2rem !important;
            }

            .text-xl {
              font-size: 1.125rem !important;
            }

            /* Mobile scrollbar adjustments */
            .subscription-container::-webkit-scrollbar {
              width: 4px;
            }

            /* Mobile specific input adjustments */
            input[type="number"],
            input[type="email"],
            input[type="tel"],
            select {
              font-size: 16px !important;
              padding: 14px 16px !important;
            }

            .phone-input-container select {
              padding: 14px 8px !important;
              min-width: 70px !important;
            }

            .phone-input-container input {
              padding: 14px 16px !important;
            }
          }

          /* Ensure proper scrolling on all devices */
          @media (max-height: 600px) {
            .subscription-container {
              min-height: 100vh !important;
            }
          }

          /* Fix for very small screens */
          @media (max-width: 480px) {
            .subscription-container {
              padding: 12px;
            }

            .text-2xl {
              font-size: 1.5rem !important;
            }

            .gap-8 {
              gap: 1rem !important;
            }
          }

          /* Loading overlay fix */
          .under-construction-container {
            padding-bottom: 0 !important;
          }
        `}</style>
      </DashboardLayout>
    
  );
};

export default function SubscriptionPage() {
  return (
    <AuthWrapper requireAuth={true}>
      <Subscription />
    </AuthWrapper>
  );
}
