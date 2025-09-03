export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  roles?: string[];
  departmentId: string;
  hospitalId: string;
  department: string;
  hospitalName: string;
  profileImagePath?: string;
  profileImageUrl?: string;
  hospital?: {
    id: string;
    name: string;
    phone: string;
    district: string;
    city: string;
    address: string;
    email: string;
    website: string;
  };
  applicationUserId?: string;
}

export interface CreateEmployeeRequest {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  roles?: string[];
  departmentId?: string;
  hospitalId?: string;
  applicationUserId?: string;
}

export interface UpdateEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  roles: string[];
  departmentId: string;
  hospitalId: string;
}

export const Role = {
  HospitalDirector: 'HospitalDirector',
  DepartmentManager: 'DepartmentManager',
  DepartmentLeader: 'DepartmentLeader',
  Doctor: 'Doctor',
  Nurse: 'Nurse',
  Staff: 'Staff',
  SystemAdmin: 'SystemAdmin'
} as const;

export type Role = typeof Role[keyof typeof Role];
