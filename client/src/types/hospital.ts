export interface Hospital {
  id: string;
  name: string;
  phone: string;
  district: string;
  city: string;
  address: string;
  email: string;
  website: string;
  directorId?: string;
  director?: {
    id: string;
    firstName: string;
    lastName: string;
    fullName?: string;
    email?: string;
    phoneNumber?: string;
    roles?: string[];
    departmentId?: string;
    hospitalId?: string;
    department?: string;
  };
}

export interface CreateHospitalRequest {
  name: string;
  phone: string;
  district: string;
  city: string;
  address: string;
  email: string;
  website: string;
  directorId?: string;
}

export interface UpdateHospitalRequest {
  name: string;
  phone: string;
  district: string;
  city: string;
  address: string;
  email: string;
  website: string;
  directorId?: string;
}
