import axios, { AxiosInstance, AxiosError } from 'axios';
import { 
  Article, 
  Comment, 
  UserProfile, 
  SystemSettings, 
  ApiResponse, 
  AuthResponse, 
  PageResponse 
} from '../types';

// Standard response codes
const SUCCESS_CODE = 0;
const TOKEN_EXPIRED_CODE = 11004;

const apiClient: AxiosInstance = axios.create({
  baseURL: '/api', // Standard prefix as per common proxy setup
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor for Token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers['token'] = token;
  }
  return config;
}, (error) => Promise.reject(error));

// Response Interceptor for Token Refresh and Error Handling
apiClient.interceptors.response.use(
  (response) => {
    const res = response.data as ApiResponse<any>;
    if (res.code !== SUCCESS_CODE) {
      return Promise.reject(res);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    const res = error.response?.data as ApiResponse<any>;

    if (res?.code === TOKEN_EXPIRED_CODE && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        // Note: Relative path as baseURL is set
        const refreshRes = await axios.post<ApiResponse<AuthResponse>>('/api/auth/refresh', { refreshToken });
        
        if (refreshRes.data.code === SUCCESS_CODE) {
          const { accessToken, refreshToken: newRefreshToken } = refreshRes.data.data;
          localStorage.setItem('access_token', accessToken);
          localStorage.setItem('refresh_token', newRefreshToken);
          
          if (originalRequest.headers) {
            originalRequest.headers['token'] = accessToken;
          }
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.clear();
        window.location.href = '/auth';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(res || error);
  }
);

export const dataService = {
  // Auth
  register: async (data: any): Promise<AuthResponse> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return res.data.data;
  },

  login: async (data: any): Promise<AuthResponse> => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return res.data.data;
  },

  logout: async (refreshToken: string): Promise<void> => {
    await apiClient.post('/auth/logout', { refreshToken });
    localStorage.clear();
  },

  logoutAll: async (refreshToken: string): Promise<void> => {
    await apiClient.post('/auth/logout-all', { refreshToken });
    localStorage.clear();
  },

  // Articles
  getArticles: async (params: {
    cursor?: string;
    size?: number;
    categoryId?: number;
    keyword?: string;
    sort?: 'latest' | 'hotest' | string;
  } = {}): Promise<PageResponse<Article>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<Article>>>('/articles', { params });
    return res.data.data;
  },

  getArticleDetail: async (id: number): Promise<Article> => {
    const res = await apiClient.get<ApiResponse<Article>>(`/articles/${id}`);
    return res.data.data;
  },

  createArticle: async (data: {
    title: string;
    content: string;
    summary?: string;
    coverKey?: string;
    categoryId: number;
    tagNames?: string[];
    visibility: number; // 0: 公开, 1: 仅自己可见
  }): Promise<Article> => {
    const res = await apiClient.post<ApiResponse<Article>>('/articles', data);
    return res.data.data;
  },

  createDraft: async (data: {
    title: string;
    content: string;
    summary?: string;
    coverKey?: string;
    categoryId: number;
    tagNames?: string[];
  }): Promise<Article> => {
    const res = await apiClient.post<ApiResponse<Article>>('/articles/drafts', data);
    return res.data.data;
  },

  updateArticle: async (id: number, data: any): Promise<Article> => {
    const res = await apiClient.put<ApiResponse<Article>>(`/articles/${id}`, data);
    return res.data.data;
  },

  deleteArticle: async (id: number): Promise<void> => {
    await apiClient.delete(`/articles/${id}`);
  },

  publishDraft: async (id: number): Promise<void> => {
    await apiClient.post(`/articles/${id}/publish`);
  },

  unpublishArticle: async (id: number): Promise<void> => {
    await apiClient.post(`/articles/${id}/unpublish`);
  },

  getMyArticles: async (params: any = {}): Promise<PageResponse<Article>> => {
    const res = await apiClient.get<ApiResponse<PageResponse<Article>>>('/articles/mine', { params });
    return res.data.data;
  },

  // Ping (For testing)
  pingPublic: async () => {
    const res = await apiClient.get('/ping/public');
    return res.data;
  },

  pingAuth: async () => {
    const res = await apiClient.get('/ping/auth');
    return res.data;
  },

  pingAdmin: async () => {
    const res = await apiClient.get('/ping/admin');
    return res.data;
  },

  // Fallbacks for missing endpoints in documentation but used in UI
  // These might need Mock or further integration if the doc is incomplete
  getSettings: async (): Promise<SystemSettings> => {
    // Attempting a guess or using local fallback if not in doc
    return {
      siteName: 'DeepSleep Blog',
      siteSubtitle: '一个沉浸式的数字花园',
      allowRegistration: true,
      commentReviewRequired: false,
      postsPerPage: 10,
      sensitiveWords: []
    };
  },

  getProfile: async (id: number): Promise<UserProfile> => {
    // Docs mentioned it will be added, using a placeholder for now
    const res = await apiClient.get<ApiResponse<UserProfile>>(`/users/${id}`);
    return res.data.data;
  },

  getCurrentUser: async (): Promise<UserProfile> => {
    const res = await apiClient.get<ApiResponse<UserProfile>>('/users/me');
    return res.data.data;
  },

  updateProfile: async (id: number, data: any): Promise<void> => {
    await apiClient.put(`/users/${id}`, data);
  },

  deleteComment: async (id: number): Promise<void> => {
    await apiClient.delete(`/comments/${id}`);
  },

  updateSettings: async (settings: SystemSettings): Promise<void> => {
    await apiClient.put('/settings', settings);
  }
};
