using System;
using HospitalDuty.Domain.Enums;

namespace HospitalDuty.Application.DTOs.EmployeeDTOs;

public class RegisterDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName => $"{FirstName} {LastName}";
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    //public string Password { get; set; } = string.Empty;

    public Guid? HospitalId { get; set; } 
    public Guid? DepartmentId { get; set; } 
    public Role? Role { get; set; }
}