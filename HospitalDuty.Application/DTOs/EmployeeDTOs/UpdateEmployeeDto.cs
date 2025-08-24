using System;
using DomainRole = HospitalDuty.Domain.Enums.Role;

namespace HospitalDuty.Application.DTOs.EmployeeDTOs
{
    public class UpdateEmployeeDto
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        //public string ProfileImage { get; set; } = string.Empty;
        public List<string> Roles { get; set; } = new List<string>();
        public Guid DepartmentId { get; set; }
        public Guid HospitalId { get; set; }
    }
}