import axios from 'axios';
import type { Employee, CreateEmployeeRequest, UpdateEmployeeRequest } from '../types/employee';
import { Role } from '../types/employee';

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

export const employeeService = {
  // Tüm çalışanları getir
  getAll: async (): Promise<Employee[]> => {
    const response = await api.get<Employee[]>('/Employee');
    return response.data;
  },

  // ID'ye göre çalışan getir
  getById: async (id: string): Promise<Employee> => {
    const response = await api.get<Employee>(`/Employee/${id}`);
    return response.data;
  },

  // Mevcut kullanıcının bilgilerini getir
  getMyInfos: async (): Promise<Employee> => {
    const response = await api.get<Employee>('/Employee/my-infos');
    return response.data;
  },

  // Departman ID'sine göre çalışanları getir
  getByDepartment: async (departmentId: string): Promise<Employee[]> => {
    const response = await api.get<Employee[]>(`/Employee/department/${departmentId}`);
    return response.data;
  },

  // Role'e göre çalışanları getir
  getByRole: async (role: Role): Promise<Employee[]> => {
    const response = await api.get<Employee[]>(`/Employee/role/${role}`);
    return response.data;
  },

  // Hastane ID'sine göre çalışanları getir
  getByHospital: async (hospitalId: string): Promise<Employee[]> => {
    const response = await api.get<Employee[]>(`/Employee/hospital/${hospitalId}`);
    return response.data;
  },

  // Çalışan güncelle
  update: async (id: string, employee: UpdateEmployeeRequest): Promise<Employee> => {
    const response = await api.put<Employee>(`/Employee/${id}`, employee);
    return response.data;
  },

  // Çalışan sil
  delete: async (id: string): Promise<void> => {
    await api.delete(`/Employee/${id}`);
  },

  // Profil resmi yükle
  uploadProfileImage: async (id: string, file: File): Promise<{ message: string; fileName: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<{ message: string; fileName: string }>(
      `/Employee/${id}/upload-profile-image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Profil resmi sil
  deleteProfileImage: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete<{ message: string }>(`/Employee/${id}/delete-profile-image`);
    return response.data;
  },
};
