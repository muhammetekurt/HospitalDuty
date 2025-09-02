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
}
