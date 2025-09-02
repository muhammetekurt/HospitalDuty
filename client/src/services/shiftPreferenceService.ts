import axios from 'axios';
import type { 
  ShiftPreference, 
  CreateShiftPreferenceRequest,
  PreferenceType 
} from '../types/shiftPreference';

const API_BASE_URL = 'https://localhost:5000/api';

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

export const shiftPreferenceService = {
  // Shift preference oluştur
  createPreferences: async (data: CreateShiftPreferenceRequest): Promise<ShiftPreference[]> => {
    const response = await api.post<ShiftPreference[]>('/ShiftPreference', data);
    return response.data;
  },

  // Çalışanın shift preference'larını getir
  getPreferencesByEmployee: async (employeeId: string): Promise<ShiftPreference[]> => {
    const response = await api.get<ShiftPreference[]>(`/ShiftPreference/employee/${employeeId}`);
    return response.data;
  },

  // Çalışanın belirli ay için shift preference'larını getir
  getPreferencesByEmployeeAndMonth: async (employeeId: string, month: number): Promise<ShiftPreference[]> => {
    const response = await api.get<ShiftPreference[]>(`/ShiftPreference/employee/${employeeId}/month/${month}`);
    return response.data;
  },

  // Tüm shift preference'ları getir
  getAllPreferences: async (): Promise<ShiftPreference[]> => {
    const response = await api.get<ShiftPreference[]>('/ShiftPreference/all');
    return response.data;
  },

  // Belirli ay için shift preference'ları getir
  getPreferencesByMonth: async (month: number): Promise<ShiftPreference[]> => {
    const response = await api.get<ShiftPreference[]>(`/ShiftPreference/month/${month}`);
    return response.data;
  },

  // Belirli tarihte müsait çalışanları getir
  getAvailableEmployeesByDate: async (date: string): Promise<any[]> => {
    const response = await api.get<any[]>(`/ShiftPreference/available/date/${date}`);
    return response.data;
  },

  // Belirli ay için müsait çalışanları getir
  getAvailableEmployeesByMonth: async (month: number): Promise<any[]> => {
    const response = await api.get<any[]>(`/ShiftPreference/available/month/${month}`);
    return response.data;
  },

  // Belirli tarihte müsait olmayan çalışanları getir
  getUnavailableEmployeesByDate: async (date: string): Promise<any[]> => {
    const response = await api.get<any[]>(`/ShiftPreference/unavailable/date/${date}`);
    return response.data;
  },

  // Belirli ay için müsait olmayan çalışanları getir
  getUnavailableEmployeesByMonth: async (month: number): Promise<any[]> => {
    const response = await api.get<any[]>(`/ShiftPreference/unavailable/month/${month}`);
    return response.data;
  },

  // Çalışanın shift preference'larını sil
  deletePreferencesByEmployee: async (employeeId: string): Promise<void> => {
    await api.delete(`/ShiftPreference/employee/${employeeId}`);
  },

  // Belirli shift preference'ı sil
  deletePreference: async (id: string): Promise<void> => {
    await api.delete(`/ShiftPreference/${id}`);
  },

  // Çalışanın belirli tarihte müsait olup olmadığını kontrol et
  isEmployeeAvailable: async (employeeId: string, date: string): Promise<boolean> => {
    const response = await api.get<boolean>(`/ShiftPreference/employee/${employeeId}/date/${date}`);
    return response.data;
  },
};
