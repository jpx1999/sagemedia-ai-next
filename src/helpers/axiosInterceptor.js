// api-interceptor.js
import axios from "axios";
import * as config from "../firebase/firebaseConfig";
import {
  getAccessToken,
  updateTokens,
  canRestoreSession,
  waitForAuthReady,
} from "./authHelper";
import { store } from "../store/store";
import { updateTokens as updateReduxTokens } from "../store/slice/authSlice";

const BASE_URI =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://apidev.sagemedia.ai";

const api = axios.create({
  baseURL: BASE_URI,
  timeout: 100000,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Add request interceptor to include access token
api.interceptors.request.use(
  (config) => {
    const accessToken = getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Avoid retrying multiple times
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (!isRefreshing) {
        originalRequest._retry = true;
        isRefreshing = true;

        try {
          let user = config.auth?.currentUser;

          // If user is null but we can restore session, wait for auth state
          if (!user && canRestoreSession()) {
            user = await waitForAuthReady();
          }

          if (!user) {
            // Check if we have any stored tokens before giving up
            const storedAuthData = localStorage.getItem("authData");
            const storedAccessToken = localStorage.getItem("accessToken");

            if (!storedAuthData && !storedAccessToken) {
              throw new Error("Invalid Code");
            } else {
              throw new Error("User session expired and could not be restored");
            }
          }

          const newAccessToken = await user.getIdToken(true);
          localStorage.setItem("accessToken", newAccessToken);
          updateTokens(newAccessToken, user.refreshToken);
          store.dispatch(
            updateReduxTokens({
              token: newAccessToken,
              refreshToken: user.refreshToken,
            })
          );

          // Update both default headers and the original request headers
          api.defaults.headers.Authorization = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          processQueue(null, newAccessToken);

          return api(originalRequest);
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
          processQueue(refreshError, null);

          // Only clear storage and redirect if it's an actual auth failure
          // if (refreshError.message.includes("not authenticated") ||
          //   refreshError.message.includes("session expired")) {
          //   localStorage.removeItem("authData");
          //   localStorage.removeItem("accessToken");
          //   window.location.href = "/";
          // }

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Wait for refresh to complete and retry
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          },
          reject: (err) => {
            reject(err);
          },
        });
      });
    }

    return Promise.reject(error);
  }
);

export default api;
