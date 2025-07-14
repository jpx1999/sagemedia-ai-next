import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { applyActionCode, checkActionCode } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSpinner,
  faCheckCircle,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { Toaster, toast } from "react-hot-toast";

const AuthActionHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing"); // processing, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleAuthAction = async () => {
      const mode = searchParams.get("mode");
      const oobCode = searchParams.get("oobCode");

      if (!mode || !oobCode) {
        setStatus("error");
        setMessage("Invalid verification link. Please try again.");
        return;
      }

      try {
        switch (mode) {
          case "verifyEmail":
            await handleEmailVerification(oobCode);
            break;
          case "resetPassword":
            // Handle password reset if needed in the future
            setStatus("error");
            setMessage("Password reset is not implemented yet.");
            break;
          default:
            setStatus("error");
            setMessage("Unknown action mode.");
        }
      } catch (error) {
        console.error("Auth action error:", error);
        setStatus("error");

        let errorMessage = "Verification failed. Please try again.";
        if (error.code) {
          switch (error.code) {
            case "auth/expired-action-code":
              errorMessage =
                "This verification link has expired. Please request a new one.";
              break;
            case "auth/invalid-action-code":
              errorMessage =
                "This verification link is invalid. Please request a new one.";
              break;
            case "auth/user-disabled":
              errorMessage = "This user account has been disabled.";
              break;
            case "auth/user-not-found":
              errorMessage = "User not found. Please sign up again.";
              break;
            default:
              errorMessage = error.message || errorMessage;
          }
        }

        setMessage(errorMessage);
        toast.error(errorMessage);
      }
    };

    const handleEmailVerification = async (oobCode) => {
      try {
        // First check if the action code is valid
        await checkActionCode(auth, oobCode);

        // Apply the email verification
        await applyActionCode(auth, oobCode);

        setStatus("success");
        setMessage("Email verified successfully! You can now sign in.");
        toast.success("Email verified successfully! You can now sign in.");

        // Redirect to login page after a short delay
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 3000);
      } catch (error) {
        throw error; // Re-throw to be handled by the outer try-catch
      }
    };

    handleAuthAction();
  }, [searchParams, navigate]);

  const handleReturnToLogin = () => {
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
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

      <div className="max-w-md w-full bg-gray-900 rounded-lg p-8 text-center">
        {status === "processing" && (
          <>
            <FontAwesomeIcon
              icon={faSpinner}
              spin
              className="text-4xl text-blue-500 mb-4"
            />
            <h2 className="text-2xl font-bold mb-4">Processing...</h2>
            <p className="text-gray-300">
              Please wait while we verify your email.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <FontAwesomeIcon
              icon={faCheckCircle}
              className="text-4xl text-green-500 mb-4"
            />
            <h2 className="text-2xl font-bold mb-4 text-green-500">Success!</h2>
            <p className="text-gray-300 mb-6">{message}</p>
            <p className="text-sm text-gray-400">
              Redirecting to login page...
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              className="text-4xl text-red-500 mb-4"
            />
            <h2 className="text-2xl font-bold mb-4 text-red-500">
              Verification Failed
            </h2>
            <p className="text-gray-300 mb-6">{message}</p>
            <button
              onClick={handleReturnToLogin}
              className="bg-gradient-to-r from-[#B8E6F8] to-[#5E8EFF] text-gray-900 px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Return to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthActionHandler;
