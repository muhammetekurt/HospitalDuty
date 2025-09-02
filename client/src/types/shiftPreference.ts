export interface ShiftPreference {
  id: string;
  employeeId: string;
  date: string; // ISO string
  preferenceType: PreferenceType;
  notes: string;
  departmentName: string;
  employeeName: string;
}

export interface CreateShiftPreferenceRequest {
  // employeeId artık otomatik olarak current user'dan alınıyor
  dates: Date[]; // Date array
  preferenceType: PreferenceType;
  notes: string;
}

export const PreferenceType = {
  Unavailable: 0,
  Preferred: 1
} as const;

export type PreferenceType = typeof PreferenceType[keyof typeof PreferenceType];

export interface ShiftPreferenceResponse {
  success: boolean;
  message: string;
  data?: ShiftPreference[];
}
