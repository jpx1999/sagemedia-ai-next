'use client'
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../store/slice/authSlice";
import { useRouter, usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faEdit,
  faArrowLeft,
} from "@fortawesome/free-solid-svg-icons";
import * as config from "../../firebase/firebaseConfig";
import {
  onAuthStateChanged,
  getAuth,
  signInWithCustomToken,
} from "firebase/auth";
import { updateTokens } from "../../helpers/authHelper";
import { sendOTP, verifyOTP, checkEmailExists, authUser } from "../../helpers/api";
import { Toaster, toast } from "react-hot-toast";
import Layout from "../../components/Layout";
import {
  formatLocationForAPI,
  getAuthenticationData,
} from "../../utils/locationUtils";

// Helper function to check if email is Gmail
const isGmailAccount = (email) => {
  return email && email.toLowerCase().endsWith("@gmail.com");
};

const SignUpAndLogin = ({
  isModal = false,
  onLoginSuccess = null,
  redirectAfterLogin = true,
  isDarkTheme,
}) => {
  const base_uri = process.env.NEXT_PUBLIC_API_BASE_URL;
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [isAuth0Loading, setIsAuth0Loading] = useState(false);
  const [signInLoading, setSignInLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    verificationCode: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [microsoftLoading, setMicrosoftLoading] = useState(false);
  const [waitingForVerification, setWaitingForVerification] = useState(false);
  const [isEmailEditable, setIsEmailEditable] = useState(true);
  const [showVerificationCodeField, setShowVerificationCodeField] =
    useState(false);
  const [showNameField, setShowNameField] = useState(false);
  const [emailExists, setEmailExists] = useState(null);
  const [existingUserName, setExistingUserName] = useState("");

  // Updated state initializations with Gmail check
  const [lastEmail, setLastEmail] = useState(() => {
    const storedEmail = localStorage.getItem("lastLoggedInEmail") || "";
    return isGmailAccount(storedEmail) ? storedEmail : "";
  });

  const [showJumpBackIn, setShowJumpBackIn] = useState(() => {
    const lastEmail = localStorage.getItem("lastLoggedInEmail");
    return !!(lastEmail && isGmailAccount(lastEmail));
  });

  // New state for step management
  const [currentStep, setCurrentStep] = useState("email"); // "email", "name", "verification"

  // Timer states for resend verification
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);

  // Timer effect for resend verification
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((timer) => {
          if (timer <= 1) {
            setCanResend(true);
            return 0;
          }
          return timer - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  // Listen for auth state changes to handle email verification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(config.auth, (user) => {
      if (user) {
        user
          .reload()
          .then(() => {
            if (user.emailVerified && waitingForVerification) {
              setSuccess("Email verified successfully! You can now sign in.");
              toast.success(
                "Email verified successfully! You can now sign in."
              );
              setIsSignUp(false);
              setFormData({
                name: "",
                email: user.email,
                verificationCode: "",
              });
              setError("");
              setWaitingForVerification(false);
              setCurrentStep("email");
              setResendTimer(0);
              setCanResend(true);
            }
          })
          .catch((error) => {
            console.error("Error reloading user:", error);
          });
      }
    });
    return () => unsubscribe();
  }, [isSignUp, waitingForVerification]);

  // Handle login for verified users
  const handleVerifiedUserLogin = async (user) => {
    try {
      const accessToken = await user.getIdToken();
      const refreshToken = user.refreshToken;
      getUserDetails(accessToken, refreshToken);
    } catch (error) {
      console.error("Error handling verified user login:", error);
      toast.error("Login failed. Please try again.");
    }
  };

  // Function to check if email exists
  const handleEmailCheck = async (email) => {
    try {
      const response = await checkEmailExists(email);
      if (response && response.exists !== undefined) {
        setEmailExists(response.exists);
        if (response.exists) {
          let userName = "";
          if (response.user && response.user.name) {
            userName = response.user.name;
          } else if (response.user && response.user.displayName) {
            userName = response.user.displayName;
          } else if (response.name) {
            userName = response.name;
          } else if (response.user && response.user.email) {
            userName = response.user.email.split("@")[0];
          } else if (response.email) {
            userName = response.email.split("@")[0];
          }
          setExistingUserName(userName);
        } else {
          setExistingUserName("");
        }
        return response.exists;
      } else {
        throw new Error("Invalid response from email check API");
      }
    } catch (error) {
      console.error("Error checking email:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to check email. Please try again.";
      toast.error(errorMessage);
      setError(errorMessage);
      return null;
    }
  };

  // Handle verification code submission using new OTP API
  const handleVerificationCodeSubmit = async (
    e,
    isAutoSubmit = false,
    customFormData = null
  ) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    const currentFormData = customFormData || formData;

    if (!isAutoSubmit && !currentFormData.verificationCode.trim()) {
      toast.error("Please enter the verification code");
      setError("Please enter the verification code");
      return;
    }

    if (signInLoading) {
      return;
    }

    setSignInLoading(true);
    setError("");

    try {
      let nameToUse = "";
      if (emailExists) {
        nameToUse = existingUserName || "";
      } else {
        const storedName = localStorage.getItem("tempUserName");
        nameToUse = storedName || currentFormData.name || "";
      }

      const response = await verifyOTP(
        currentFormData.email,
        currentFormData.verificationCode,
        nameToUse
      );

      if (response && response.success && response.customToken) {
        if (!isAutoSubmit) {
          toast.success("Email verified successfully!");
        }
        localStorage.removeItem("tempUserName");
        await handleCustomTokenAuthentication(
          response.customToken,
          response.user
        );
      } else {
        throw new Error(response?.message || "Invalid verification code");
      }
    } catch (error) {
      console.error("Verification code error:", error);
      if (!isAutoSubmit || error.response?.status !== 400) {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Invalid verification code. Please try again.";
        toast.error(errorMessage);
        setError(errorMessage);
      }
    } finally {
      setSignInLoading(false);
    }
  };

  // Handle custom token authentication
  const handleCustomTokenAuthentication = async (customToken, userInfo) => {
    try {
      const auth = getAuth();
      const userCredential = await signInWithCustomToken(auth, customToken);
      const idToken = await userCredential.user.getIdToken();
      const refreshToken = userCredential.user.refreshToken;

      const storedName = localStorage.getItem("tempUserName");
      const nameToUse = storedName || formData.name;

      if (nameToUse && nameToUse.trim()) {
        await config.updateProfile(userCredential.user, {
          displayName: nameToUse,
        });
      }

      localStorage.removeItem("tempUserName");
      await getUserDetails(idToken, refreshToken, "custom-token-auth");
    } catch (error) {
      console.error("Error in custom token authentication:", error);
      toast.error("Authentication failed. Please try again.");
      setError("Authentication failed. Please try again.");
      setSignInLoading(false);
    }
  };

  // Handle successful OTP verification
  const handleSuccessfulVerification = async () => {
    console.warn(
      "handleSuccessfulVerification is deprecated, use handleCustomTokenAuthentication instead"
    );
  };

  // Resend verification email with timer using new OTP API
  const resendVerificationEmail = async () => {
    if (!canResend) return;

    try {
      setError("");
      let nameToSend = null;
      if (emailExists) {
        nameToSend = existingUserName;
      } else {
        nameToSend = localStorage.getItem("tempUserName");
      }

      const response = await sendOTP(formData.email, nameToSend);
      if (response && response.success) {
        toast.success("Verification code sent! Please check your inbox.");
        setCanResend(false);
        setResendTimer(60);
      } else {
        throw new Error(
          response?.message || "Failed to send verification code"
        );
      }
    } catch (error) {
      console.error("Error resending verification code:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to send verification code. Please try again.";
      toast.error(errorMessage);
      setError(errorMessage);
    }
  };

  // Format timer display
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Extract newsId from current URL if it exists
  const getNewsIdFromUrl = () => {
    const pathParts = pathname.split("/");
    const newsIdIndex = pathParts.indexOf("newsid");
    if (newsIdIndex !== -1 && pathParts.length > newsIdIndex + 1) {
      return pathParts[newsIdIndex + 1];
    }
    return null;
  };

  // Handle input changes
  const handleChange = async (e) => {
    const { name, value } = e.target;
    if (name === "verificationCode") {
      const numericValue = value.replace(/[^0-9]/g, "");
      setFormData({ ...formData, [name]: numericValue });
      setError("");
      if (numericValue.length === 6 && !signInLoading) {
        const updatedFormData = { ...formData, verificationCode: numericValue };
        await handleVerificationCodeSubmit(null, true, updatedFormData);
      }
    } else if (name === "email") {
      setFormData({ ...formData, [name]: value });
      // Email regex validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && !emailRegex.test(value)) {
        setError("Please enter a valid email address");
      } else {
        setError("");
      }
    } else {
      setFormData({ ...formData, [name]: value });
      setError("");
    }
  };

  // Handle email step submission
  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email.trim()) {
      toast.error("Please enter your email address");
      setError("Please enter your email address");
      return;
    }

    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      toast.error("Please enter a valid email address");
      setError("Please enter a valid email address");
      return;
    }

    setSignInLoading(true);
    setError("");
    setSuccess("");

    try {
      const exists = await handleEmailCheck(formData.email);
      if (exists === null) {
        setSignInLoading(false);
        return;
      }

      if (!exists) {
        // New user - go to name step
        setCurrentStep("name");
      } else {
        // Existing user - go directly to verification
        await sendOTPForExistingUser();
      }
    } catch (error) {
      console.error("Error checking email:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to check email. Please try again.";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setSignInLoading(false);
    }
  };

  // Handle name step submission
  const handleNameSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter your name");
      setError("Please enter your name");
      return;
    }

    setSignInLoading(true);
    setError("");

    try {
      localStorage.setItem("tempUserName", formData.name.trim());
      await sendOTPForNewUser();
    } catch (error) {
      console.error("Error in name submission:", error);
      setSignInLoading(false);
    }
  };

  // Send OTP for existing user
  const sendOTPForExistingUser = async () => {
    try {
      const response = await sendOTP(formData.email, existingUserName);
      if (response && response.success) {
        toast.success(
          `Verification code sent to ${formData.email}! Please check your inbox.`
        );
        setCurrentStep("verification");
        setWaitingForVerification(true);
        setCanResend(false);
        setResendTimer(60);
      } else {
        throw new Error(
          response?.message || "Failed to send verification code"
        );
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to send verification code. Please try again.";
      toast.error(errorMessage);
      setError(errorMessage);
    }
  };

  // Send OTP for new user
  const sendOTPForNewUser = async () => {
    try {
      const response = await sendOTP(formData.email, formData.name.trim());
      if (response && response.success) {
        toast.success(
          `Verification code sent to ${formData.email}! Please check your inbox.`
        );
        setCurrentStep("verification");
        setWaitingForVerification(true);
        setCanResend(false);
        setResendTimer(60);
      } else {
        throw new Error(
          response?.message || "Failed to send verification code"
        );
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to send verification code. Please try again.";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setSignInLoading(false);
    }
  };

  // Handle form submission based on current step
  const handleSubmit = async (e) => {
    e.preventDefault();

    switch (currentStep) {
      case "email":
        await handleEmailSubmit(e);
        break;
      case "name":
        await handleNameSubmit(e);
        break;
      case "verification":
        await handleVerificationCodeSubmit(e);
        break;
      default:
        break;
    }
  };

  // Go back to previous step
  const goBackStep = () => {
    switch (currentStep) {
      case "name":
        setCurrentStep("email");
        setEmailExists(null);
        setExistingUserName("");
        break;
      case "verification":
        if (emailExists) {
          setCurrentStep("email");
        } else {
          setCurrentStep("name");
        }
        setWaitingForVerification(false);
        setFormData({ ...formData, verificationCode: "" });
        setResendTimer(0);
        setCanResend(true);
        break;
      default:
        break;
    }
    setError("");
    setSuccess("");
  };

  const firebaseGoogleLogin = () => {
    setGoogleLoading(true);
    config
      .signInWithPopup(config.auth, config.googleAuthProvider)
      .then(async (result) => {
        const userData = result.user;
        if (userData) {
          const accessToken = await userData.getIdToken();
          const refreshToken = result.user.refreshToken;
          getUserDetails(accessToken, refreshToken, "google");
        }
      })
      .catch((error) => {
        console.error("Firebase Google Login Error:", error);
        toast.error("Failed to log in with Google. Please try again.");
        setError("Failed to log in with Google. Please try again.");
        setGoogleLoading(false);
      });
  };

  const firebaseMicrosoftLogin = () => {
    setMicrosoftLoading(true);
    config
      .signInWithPopup(config.auth, config.microsoftAuthProvider)
      .then(async (result) => {
        const userData = result.user;
        if (userData) {
          const accessToken = await userData.getIdToken();
          const refreshToken = result.user.refreshToken;
          getUserDetails(accessToken, refreshToken, "microsoft");
        }
      })
      .catch((error) => {
        console.error("Firebase Microsoft Login Error:", error);
        toast.error("Failed to log in with Microsoft. Please try again.");
        setError("Failed to log in with Microsoft. Please try again.");
        setMicrosoftLoading(false);
      });
  };

  async function getUserDetails(accessToken, refreshToken, loginType = null) {
    try {
      const currentUser = config.auth.currentUser;
      if (currentUser && accessToken !== (await currentUser.getIdToken())) {
        accessToken = await currentUser.getIdToken(true);
        refreshToken = currentUser.refreshToken;
      }

      // Get comprehensive authentication data including IP, device info, login method, and user source
      const authData = await getAuthenticationData(loginType);
      const formattedLocation = formatLocationForAPI(authData.location, {
        ip: authData.ip,
        deviceInfo: authData.deviceInfo,
        loginMethod: authData.loginMethod,
        userSource: authData.userSource,
      });

      const response = await authUser(formattedLocation);

      const isVerified = response.data?.status === 1;
      if (isVerified) {
        updateTokens(accessToken, refreshToken);
        localStorage.setItem("role", response.data?.role);
        const userData = {
          uid: currentUser.uid,
          email: currentUser.email,
          name: currentUser.displayName || formData.name || "",
          photoURL: currentUser.photoURL || "",
          emailVerified: currentUser.emailVerified,
        };

        localStorage.setItem(
          "authData",
          JSON.stringify({
            user: userData,
            isLoggedIn: true,
          })
        );

        dispatch(
          loginSuccess({
            user: userData,
            token: accessToken,
            refreshToken: refreshToken,
            role: response.data?.role,
          })
        );

        // Updated logic: Only store Gmail emails for jump back functionality
        if (isGmailAccount(userData.email)) {
          localStorage.setItem("lastLoggedInEmail", userData.email);
        } else {
          localStorage.removeItem("lastLoggedInEmail");
        }

        if (loginType !== "custom-token-auth") {
          toast.success("Login successful!");
        }

        if (onLoginSuccess) {
          onLoginSuccess();
        } else if (redirectAfterLogin) {
          const newsId = getNewsIdFromUrl();
          if (newsId) {
            router.push(`/news-intelligence/newsid/${newsId}`);
          } else {
            router.push("/news-intelligence");
          }
        }
      } else {
        console.error("User verification failed, response:", response.data);
        toast.error("User verification failed. Please contact support.");
        setError("User verification failed. Please contact support.");
      }
    } catch (error) {
      console.error("Error getting user details:", error);
      let errorMessage = "Authentication failed. Please try again.";
      if (error.response?.status === 401) {
        errorMessage =
          "Invalid authentication token. Please try logging in again.";
      } else if (error.response?.status === 403) {
        errorMessage = "Access denied. Please contact support.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      if (loginType === "google") {
        setGoogleLoading(false);
      } else if (loginType === "microsoft") {
        setMicrosoftLoading(false);
      } else if (
        loginType === "signin" ||
        loginType === "otp-verification" ||
        loginType === "custom-token-auth"
      ) {
        setSignInLoading(false);
      }
    }
  }

  const resetForm = () => {
    setCurrentStep("email");
    setError("");
    setFormData({ name: "", email: "", verificationCode: "" });
    setIsEmailEditable(true);
    setEmailExists(null);
    setExistingUserName("");
    setResendTimer(0);
    setCanResend(true);
    setWaitingForVerification(false);
    setShowJumpBackIn(false);
    localStorage.removeItem("tempUserName");
  };

  const styles = {
    logo: {
      display: "flex",
      alignItems: "center",
      fontWeight: "600",
      fontSize: "22px",
    },
    logoImg: {
      borderRadius: "50%",
      marginRight: "10px",
      background: "url(/images/sage-icon-big.png)",
      backgroundSize: "cover",
    },
  };

  // Get step title and description
  const getStepContent = () => {
    switch (currentStep) {
      case "email":
        return {
          title: "Welcome to SAGE",
          description: "Enter your email to continue",
        };
      case "name":
        return {
          title: "Create your account",
          description: `You're creating an account with ${formData.email}`,
        };
      case "verification":
        return {
          title: "Verify Your Email",
          description: `We've sent a verification code to ${formData.email}`,
        };
      default:
        return {
          title: "Welcome to SAGE",
          description: "Enter your email to continue",
        };
    }
  };

  // Render form fields based on current step
  const renderFormFields = () => {
    const stepContent = getStepContent();

    return (
      <>
        {currentStep !== "email" && (
          <button
            type="button"
            onClick={goBackStep}
            className="flex items-center text-white hover:text-blue-300 mb-4 transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back
          </button>
        )}

        <p className="text-center text-base mb-4 md:mb-6">
          {stepContent.description}
        </p>

        {currentStep === "email" && (
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter Your Email"
            className="text-lg w-full px-4 py-4 mb-4 bg-transparent border border-gray-500 rounded-md text-white placeholder-gray-400"
            required
          />
        )}

        {currentStep === "name" && (
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter Your Name"
            className="text-lg w-full px-4 py-4 mb-4 bg-transparent border border-gray-500 rounded-md text-white placeholder-gray-400"
            required
            autoFocus
          />
        )}

        {currentStep === "verification" && (
          <div className="mb-4">
            <input
              type="text"
              name="verificationCode"
              value={formData.verificationCode}
              onChange={handleChange}
              placeholder="Enter verification code"
              className="text-lg w-full px-4 py-4 bg-transparent border border-gray-500 rounded-md text-white placeholder-gray-400"
              maxLength="6"
              required
              autoComplete="one-time-code"
              inputMode="numeric"
              pattern="[0-9]*"
              autoFocus
            />
            <p className="text-white text-base mt-1">
              Didn&apos;t receive the code? Check your spam folder or{" "}
              <button
                type="button"
                onClick={resendVerificationEmail}
                disabled={!canResend}
                className={`transition-colors ${
                  canResend
                    ? "text-blue-400 hover:text-blue-300 cursor-pointer"
                    : "text-blue-400 cursor-not-allowed"
                }`}
              >
                Resend{" "}
                <span className="text-gray-400">
                  {!canResend && `(${formatTimer(resendTimer)})`}
                </span>
              </button>
            </p>
          </div>
        )}
      </>
    );
  };

  // Get button text based on current step
  const getButtonText = () => {
    switch (currentStep) {
      case "email":
        return "Continue";
      case "name":
        return "Create Account";
      case "verification":
        return "Verify Code";
      default:
        return "Continue";
    }
  };

  // "Jump back in!" screen - now only shows for Gmail users
  if (showJumpBackIn && !isModal) {
    return (
      <Layout isDarkTheme={isDarkTheme}>
        <div className="flex flex-col-reverse md:flex-row bg-black text-white relative py-10">
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

          <div className="p-8 absolute top-0 left-0 right-0 z-10 items-center justify-center md:justify-start hidden">
            <span className="max-w-[200px] md:max-w-[270px] flex items-center justify-center">
              <img src="/images/logo.png" />
            </span>
            <span className="px-5">|</span>
            <div style={styles.logo}>
              <div
                className="w-[40px] h-[40px] md:w-[50px] md:h-[50px]"
                style={styles.logoImg}
              ></div>
              <span className="text-lg md:text-3xl">SAGE</span>
              <sup className="ps-2 block text-[16px] text-[#6ABCFF]">V1.01</sup>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-4 relative">
            <img
              src="/images/sage-login-img.png"
              alt="Person"
              className="w-12/12 md:w-11/12 lg:w-9/12"
            />
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-8 md:px-4 relative">
            <div className="absolute inset-0 z-0 overflow-hidden hidden md:block">
              <img
                src="/images/banner-bg.png"
                alt="Space background"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="relative z-10 w-full max-w-xl flex flex-col items-center">
              <h1 className="text-3xl md:text-4xl font-medium text-center mb-5 md:mb-8">
                Jump back in!
              </h1>
              <div className="md:flex items-center mb-10">
                <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4 md:mb-0 md:mr-4">
                  {lastEmail.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-lg font-medium">{lastEmail}</p>
                </div>
              </div>
              <button
                className={`w-full h-16 flex items-center gap-2 bg-gradient-to-r from-[#B8E6F8] to-[#5E8EFF] text-gray-900 border-none rounded-lg px-4 py-2 text-xl justify-center font-medium transition-all duration-300 ${
                  googleLoading ? "opacity-70" : "hover:opacity-90"
                }`}
                onClick={() => firebaseGoogleLogin()}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <FontAwesomeIcon
                    icon={faSpinner}
                    className="mr-2 animate-spin"
                  />
                ) : null}
                Continue
              </button>
              <button
                className="text-white hover:text-blue-300 underline mt-4"
                onClick={() => setShowJumpBackIn(false)}
              >
                Continue with another account
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Modal version
  if (isModal) {
    const stepContent = getStepContent();

    return (
      <div
        className="flex flex-col text-white relative"
        style={{ backgroundColor: "rgb(34, 38, 42)" }}
      >
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

        <form onSubmit={handleSubmit} className="w-full">
          <div className="w-full">
            {error && (
              <div className="text-red-700 bg-white opacity-80  p-3 rounded-md mb-4 text-center text-lg">
                {error}
              </div>
            )}

            {success && (
              <div className="text-white bg-green-600 p-3 rounded-md mb-4 text-center">
                {success}
              </div>
            )}

            {renderFormFields()}

            <button
              type="submit"
              className={`ms-auto w-full h-12 flex items-center gap-2 bg-gradient-to-r from-[#B8E6F8] to-[#5E8EFF] text-gray-900 border-none rounded-lg px-4 py-2 text-xl justify-center font-medium transition-all duration-300 ${
                signInLoading ? "opacity-70" : "hover:opacity-90"
              }`}
              disabled={signInLoading}
            >
              {signInLoading ? (
                <FontAwesomeIcon
                  icon={faSpinner}
                  spin
                  className="mr-2 animate-spin"
                />
              ) : null}
              {getButtonText()}
            </button>
          </div>
        </form>

        {currentStep === "email" && (
          <>
            <p className="text-center my-4">Or continue with</p>

            <div className="flex justify-center space-x-4 w-full">
              <button
                className="flex items-center justify-center bg-white text-black font-medium py-2 px-4 rounded w-40 hover:bg-gray-100 transition-colors"
                onClick={() => firebaseGoogleLogin()}
                disabled={googleLoading}
              >
                {googleLoading ? (
                  <FontAwesomeIcon
                    icon={faSpinner}
                    spin
                    className="mr-2 animate-spin"
                  />
                ) : (
                  <img
                    src="/images/google-logo.svg"
                    alt="Google Icon"
                    className="mr-2"
                  />
                )}
              </button>

              <button
                className="flex items-center justify-center bg-white text-black font-medium py-2 px-4 rounded w-40 hover:bg-gray-100 transition-colors"
                onClick={() => firebaseMicrosoftLogin()}
                disabled={microsoftLoading}
              >
                {microsoftLoading ? (
                  <FontAwesomeIcon
                    icon={faSpinner}
                    spin
                    className="mr-2 animate-spin"
                  />
                ) : (
                  <img
                    src="/images/microsoft-logo.svg"
                    alt="Microsoft Icon"
                    className="mr-2"
                  />
                )}
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  // Original full page version
  const stepContent = getStepContent();

  return (
      <Layout isDarkTheme={isDarkTheme}>
        <div className="flex flex-col-reverse md:flex-row bg-black text-white relative py-10">
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

          <div className="p-8 absolute top-0 left-0 right-0 z-10 items-center justify-center md:justify-start hidden">
            <span className="max-w-[200px] md:max-w-[270px] flex items-center justify-center">
              <img src="/images/logo.png" />
            </span>
            <span className="px-5">|</span>
            <div style={styles.logo}>
              <div
                className="w-[40px] h-[40px] md:w-[50px] md:h-[50px]"
                style={styles.logoImg}
              ></div>
              <span className="text-lg md:text-3xl">SAGE</span>
              <sup className="ps-2 block text-[16px] text-[#6ABCFF]">V1.01</sup>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-4 relative">
            <img
              src="/images/sage-login-img.png"
              alt="Person"
              className="w-12/12 md:w-11/12 lg:w-9/12"
            />
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-8 md:px-4 relative">
            <div className="absolute inset-0 z-0 overflow-hidden hidden md:block">
              <img
                src="/images/banner-bg.png"
                alt="Space background"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="relative z-10 w-full max-w-xl flex flex-col items-center">
              <h1 className="text-3xl md:text-4xl font-semibold text-center">
                {stepContent.title}
              </h1>

              <form onSubmit={handleSubmit} className="w-full py-4">
                <div className="w-full">
                  {error && (
                    <div className="text-gray-500 bg-black bg-opacity-50 p-3 rounded-md mb-4 text-center">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="text-black bg-black bg-opacity-50 p-3 rounded-md mb-4 text-center">
                      {success}
                    </div>
                  )}

                  {renderFormFields()}

                  <button
                    type="submit"
                    className={`ms-auto mt-5 mb-5 w-full h-16 flex items-center gap-2 bg-gradient-to-r from-[#B8E6F8] to-[#5E8EFF] text-gray-900 border-none rounded-lg px-4 py-2 text-xl justify-center font-medium transition-all duration-300 ${
                      signInLoading ? "opacity-70" : "hover:opacity-90"
                    }`}
                    disabled={signInLoading}
                  >
                    {signInLoading ? (
                      <FontAwesomeIcon
                        icon={faSpinner}
                        className="mr-2 animate-spin"
                      />
                    ) : null}
                    {getButtonText()}
                  </button>
                </div>
              </form>

              {currentStep === "email" && (
                <>
                  <p className="text-center mb-4">Or continue with</p>

                  <div className="flex justify-center space-x-4 w-full">
                    <button
                      className="flex items-center justify-center bg-white text-black font-medium py-2 px-4 rounded w-40 hover:bg-gray-100 transition-colors"
                      onClick={() => firebaseGoogleLogin()}
                      disabled={googleLoading}
                    >
                      {googleLoading ? (
                        <FontAwesomeIcon
                          icon={faSpinner}
                          className="text-gray-500 animate-spin"
                        />
                      ) : (
                        <img
                          src="/images/google-logo.svg"
                          alt="Google Icon"
                          className="mr-2"
                        />
                      )}
                    </button>

                    <button
                      className="flex items-center justify-center bg-white text-black font-medium py-2 px-4 rounded w-40 hover:bg-gray-100 transition-colors"
                      onClick={() => firebaseMicrosoftLogin()}
                      disabled={microsoftLoading}
                    >
                      {microsoftLoading ? (
                        <FontAwesomeIcon
                          icon={faSpinner}
                          className="mr-2 animate-spin"
                        />
                      ) : (
                        <img
                          src="/images/microsoft-logo.svg"
                          alt="Microsoft Icon"
                          className="mr-2"
                        />
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </Layout>
  );
};

export default SignUpAndLogin;
