import axios from 'axios';
import type { Shift, CreateShiftRequest, UpdateShiftRequest } from '../types/shift';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token'ı localStorage'dan al ve axios'a ekle
const getToken = () => localStorage.getItem('token');

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

// Response interceptor - hata durumlarını yakala
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token geçersiz, kullanıcıyı login sayfasına yönlendir
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const shiftService = {
  // Tüm vardiyaları getir
  getAllShifts: async (): Promise<Shift[]> => {
    const response = await api.get<Shift[]>('/Shift');
    return response.data;
  },

  // Çalışanın vardiyalarını getir
  getShiftsByEmployee: async (employeeId: string): Promise<Shift[]> => {
    const response = await api.get<Shift[]>(`/Shift/employee/${employeeId}`);
    return response.data;
  },

  // Vardiya oluştur (sadece admin)
  createShift: async (data: CreateShiftRequest): Promise<Shift> => {
    const response = await api.post<Shift>('/Shift', data);
    return response.data;
  },

  // Vardiya güncelle (sadece admin)
  updateShift: async (id: string, data: UpdateShiftRequest): Promise<Shift> => {
    const response = await api.put<Shift>(`/Shift/${id}`, data);
    return response.data;
  },

  // Vardiya sil (sadece admin)
  deleteShift: async (id: string): Promise<void> => {
    await api.delete(`/Shift/${id}`);
  },

  // Vardiya iptal et (sadece admin)
  cancelShift: async (id: string): Promise<void> => {
    await api.post(`/Shift/${id}/cancel`);
  },

  // Tarih aralığına göre vardiyaları getir
  getShiftsByDateRange: async (startDate: string, endDate: string): Promise<Shift[]> => {
    const response = await api.get<Shift[]>(`/Shift/dateRange?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },

  // Belirli bir tarihteki vardiyaları getir
  getShiftsByDate: async (date: string): Promise<Shift[]> => {
    const response = await api.get<Shift[]>(`/Shift/date/${date}`);
    return response.data;
  }
};
