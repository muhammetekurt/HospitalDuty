import axios from 'axios';
import type { Hospital, CreateHospitalRequest, UpdateHospitalRequest } from '../types/hospital';

const API_BASE_URL = 'https://localhost:5000/api'; // .NET API'nizin URL'i

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const hospitalService = {
  // Tüm hastaneleri getir
  getAll: async (): Promise<Hospital[]> => {
    const response = await api.get<Hospital[]>('/Hospital');
    return response.data;
  },

  // ID'ye göre hastane getir
  getById: async (id: string): Promise<Hospital> => {
    const response = await api.get<Hospital>(`/Hospital/${id}`);
    return response.data;
  },

  // Direktör ID'sine göre hastane getir
  getByDirector: async (directorId: string): Promise<Hospital> => {
    const response = await api.get<Hospital>(`/Hospital/director/${directorId}`);
    return response.data;
  },

  // Yeni hastane oluştur
  create: async (hospital: CreateHospitalRequest): Promise<Hospital> => {
    const response = await api.post<Hospital>('/Hospital', hospital);
    return response.data;
  },

  // Hastane güncelle
  update: async (id: string, hospital: UpdateHospitalRequest): Promise<void> => {
    await api.put(`/Hospital?id=${id}`, hospital);
  },

  // Hastane sil
  delete: async (id: string): Promise<void> => {
    await api.delete(`/Hospital/${id}`);
  },
};
