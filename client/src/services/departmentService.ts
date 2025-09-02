import axios from 'axios';
import type { Department, CreateDepartmentRequest, UpdateDepartmentRequest } from '../types/department';

const API_BASE_URL = 'https://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const departmentService = {
  // Tüm departmanları getir
  getAll: async (): Promise<Department[]> => {
    const response = await api.get<Department[]>('/Department');
    return response.data;
  },

  // ID'ye göre departman getir
  getById: async (id: string): Promise<Department> => {
    const response = await api.get<Department>(`/Department/${id}`);
    return response.data;
  },

  // Hastane ID'sine göre departmanları getir
  getByHospital: async (hospitalId: string): Promise<Department[]> => {
    const response = await api.get<Department[]>(`/Department/hospital/${hospitalId}`);
    return response.data;
  },

  // Manager ID'sine göre departmanları getir
  getByManager: async (managerId: string): Promise<Department[]> => {
    const response = await api.get<Department[]>(`/Department/manager/${managerId}`);
    return response.data;
  },

  // Departman manager'ını getir
  getManagerByDepartment: async (departmentId: string): Promise<Department> => {
    const response = await api.get<Department>(`/Department/department/${departmentId}`);
    return response.data;
  },

  // Yeni departman oluştur
  create: async (department: CreateDepartmentRequest): Promise<Department> => {
    const response = await api.post<Department>('/Department', department);
    return response.data;
  },

  // Departman güncelle
  update: async (id: string, department: UpdateDepartmentRequest): Promise<Department> => {
    const response = await api.put<Department>(`/Department/${id}`, department);
    return response.data;
  },

  // Departman sil
  delete: async (id: string): Promise<void> => {
    await api.delete(`/Department/${id}`);
  },
};
