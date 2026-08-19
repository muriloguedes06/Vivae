import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

const baseURL = "http://localhost:3000";

interface RefreshResponse {
  access_token: string;
  refresh_token: string;
}

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

export const api = axios.create({ baseURL });
const refreshClient = axios.create({ baseURL });
let refreshPromise: Promise<string> | null = null;

function clearSession() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}

async function renewAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) {
    throw new Error("Refresh token não encontrado.");
  }

  const response = await refreshClient.post<RefreshResponse>("/auth/refresh", {
    refresh_token: refreshToken,
  });

  localStorage.setItem("accessToken", response.data.access_token);
  localStorage.setItem("refreshToken", response.data.refresh_token);

  return response.data.access_token;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const excludedRoutes = ["/auth/login", "/auth/register", "/auth/refresh"];

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      excludedRoutes.some((route) => originalRequest.url?.includes(route))
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshPromise ??= renewAccessToken();
      const accessToken = await refreshPromise;
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return await api(originalRequest);
    } catch (refreshError) {
      clearSession();

      if (!["/login", "/criar-conta"].includes(window.location.pathname)) {
        window.location.assign("/login");
      }

      return Promise.reject(refreshError);
    } finally {
      refreshPromise = null;
    }
  },
);
