import axios from 'axios';
import type { Employee } from '../types/employee';

const API_BASE_URL = 'https://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

  // Hastane ID'sine göre çalışanları getir
  getByHospital: async (hospitalId: string): Promise<Employee[]> => {
    const response = await api.get<Employee[]>(`/Employee/hospital/${hospitalId}`);
    return response.data;
  },
};
