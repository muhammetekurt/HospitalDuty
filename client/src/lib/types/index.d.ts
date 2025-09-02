export type Role = "SystemAdmin" | "HospitalDirector" | "DepartmentManager" | "Staff"; // Enum örneği
export type ShiftType = "Normal" | "Night" | "Emergency"; // Enum örneği
export type PreferenceType = "Unavailable" | "Preferred"; // Enum örneği

export type ApplicationUser = {
    id: string;
    fullName: string;
    employee?: Employee;
    role: Role;
    hospitalId?: string;
    departmentId?: string;
};

export type Department = {
    id: string;
    name: string;
    hospitalId: string;
    hospital: Hospital;
    managerId?: string;
    manager?: Employee;
    employees: Employee[];
    shifts: Shift[];
};

export type Employee = {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    // phoneNumber?: string;
    // profileImage?: string;
    // role?: Role;
    departmentId?: string;
    department?: Department;
    hospitalId?: string;
    hospital?: Hospital;
    shifts: Shift[];
    applicationUserId?: string;
    applicationUser?: ApplicationUser;
    shiftPreferences: ShiftPreference[];
};

export type Hospital = {
    id: string;
    name: string;
    phone?: string;
    district?: string;
    city?: string;
    address?: string;
    email?: string;
    website?: string;
    directorId?: string;
    director?: Employee;
    departments: Department[];
    employees: Employee[];
    shifts: Shift[];
};

export type Shift = {
    id: number;
    departmentId: string;
    department: Department;
    employeeId: string;
    employee: Employee;
    hospitalId: string;
    hospital: Hospital;
    startTime: string; // ISO string
    endTime: string;   // ISO string
    shiftType: ShiftType;
    notes: string;
};

export type ShiftPreference = {
    id: string;
    employeeId: string;
    employee: Employee;
    date: string; // ISO string
    preferenceType: PreferenceType;
    notes: string;
    departmentName: string;
};

export type EmployeeDto = {
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