import axios from 'axios';
import type { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  ChangePasswordRequest, 
  ForgotPasswordRequest, 
  ForgotPasswordResponse,
  User 
} from '../types/auth';

const API_BASE_URL = 'https://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token'ı localStorage'dan al ve axios'a ekle
const getToken = () => localStorage.getItem('token');
const setToken = (token: string) => localStorage.setItem('token', token);
const removeToken = () => localStorage.removeItem('token');

// Request interceptor - her istekte token'ı ekle
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - 401 hatalarını yakala
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Giriş yap
  login: async (loginData: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/Auth/login', loginData);
    const { token } = response.data;
    setToken(token);
    return response.data;
  },

  // Çıkış yap
  logout: async (): Promise<void> => {
    try {
      await api.post('/Auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeToken();
    }
  },

  // Mevcut kullanıcı bilgilerini getir
  getMe: async (): Promise<User> => {
    const response = await api.get<User>('/Auth/me');
    return response.data;
  },

  // Şifre değiştir
  changePassword: async (passwordData: ChangePasswordRequest): Promise<string> => {
    const response = await api.post<string>('/Auth/change-password', passwordData);
    return response.data;
  },

  // Şifremi unuttum
  forgotPassword: async (forgotData: ForgotPasswordRequest): Promise<string> => {
    const response = await api.post<string>('/Auth/forgot-password', forgotData);
    return response.data;
  },

  // Admin tarafından kullanıcı oluştur
  registerByAdmin: async (registerData: RegisterRequest): Promise<{ message: string }> => {
    const response = await api.post<{ message: string }>('/Auth/register-by-admin', registerData);
    return response.data;
  },

  // Token'ı al
  getToken: () => getToken(),

  // Token'ı temizle
  clearToken: () => removeToken(),
};
