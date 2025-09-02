export const ShiftType = {
  Normal: 0,
  Night: 1,
  Emergency: 2
} as const;

export type ShiftType = typeof ShiftType[keyof typeof ShiftType];

export interface Shift {
  id: string;
  employeeId: string;
  hospitalId: string;
  departmentId: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  shiftType: ShiftType;
  notes: string;
  employeeName: string;
  hospitalName: string;
  departmentName: string;
}

export interface CreateShiftRequest {
  employeeId: string;
  hospitalId: string;
  departmentId: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  shiftType: ShiftType;
  notes: string;
}

export interface UpdateShiftRequest {
  employeeId: string;
  hospitalId: string;
  departmentId: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  shiftType: ShiftType;
  notes: string;
}

export interface ShiftResponse {
  success: boolean;
  message: string;
  data?: Shift[];
}
