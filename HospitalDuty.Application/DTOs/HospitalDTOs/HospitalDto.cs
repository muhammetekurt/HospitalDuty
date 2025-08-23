using System;
using HospitalDuty.Application.DTOs.EmployeeDTOs;
using HospitalDuty.Domain.Entities;

namespace HospitalDuty.Application.DTOs.HospitalDTOs;

public class HospitalDto
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string District { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Website { get; set; } = string.Empty;
    public Guid? DirectorId { get; set; }
    public EmployeeDto? Director { get; set; }
}
