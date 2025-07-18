import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Helper to get the base URL depending on environment
function getBaseUrl() {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL;
  } else {
    return process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;
  }
}

const apiClient: AxiosInstance = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to set Bearer token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers = config.headers || {};
        (config.headers as any)['Authorization'] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling responses and errors
apiClient.interceptors.response.use(
  <T>(response: AxiosResponse<T>) => response.data as T,
  (error: AxiosError) => {
    if (error.response) {
      return Promise.reject({
        status: error.response.status,
        data: error.response.data,
        message: error.message,
      });
    } else if (error.request) {
      return Promise.reject({
        status: null,
        data: null,
        message: 'No response from server',
      });
    } else {
      return Promise.reject({
        status: null,
        data: null,
        message: error.message,
      });
    }
  }
);

// Generic GET wrapper for type-safe API calls
export async function apiGet<T>(url: string, config?: any): Promise<T> {
  return apiClient.get<T, T>(url, config);
}

export default apiClient; 