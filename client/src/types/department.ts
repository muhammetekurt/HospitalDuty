export interface Department {
  id: string;
  name: string;
  hospitalId: string;
  hospital: {
    id: string;
    name: string;
    phone: string;
    district: string;
    city: string;
    address: string;
    email: string;
    website: string;
  };
  managerId?: string;
  manager?: {
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
  };
}

export interface CreateDepartmentRequest {
  name: string;
  hospitalId: string;
  managerId?: string;
}

export interface UpdateDepartmentRequest {
  name: string;
  hospitalId: string;
  managerId?: string;
}
