using System;
using System.Collections.Generic;
using HospitalDuty.Application.DTOs.HospitalDTOs;
using HospitalDuty.Domain.Entities;
using DomainRole = HospitalDuty.Domain.Enums.Role;

namespace HospitalDuty.Application.DTOs.EmployeeDTOs
{
    public class EmployeeDto
    {
        public Guid Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public List<string>? Roles { get; set; }
        public Guid DepartmentId { get; set; }
        public Guid HospitalId { get; set; }
        //public HospitalDto Hospital { get; set; } = default!;
    }
}
