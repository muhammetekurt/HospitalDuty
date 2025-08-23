using System;
using System.Collections.Generic;
using DomainRole = HospitalDuty.Domain.Enums.Role;

namespace HospitalDuty.Application.DTOs.EmployeeDTOs
{
    public class CreateEmployeeDto
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string ProfileImage { get; set; } = string.Empty;
        public DomainRole Role { get; set; } = DomainRole.Staff;
        public Guid DepartmentId { get; set; }
    }
}
