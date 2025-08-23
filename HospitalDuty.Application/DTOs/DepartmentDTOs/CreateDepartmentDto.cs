using System;
using HospitalDuty.Application.DTOs.EmployeeDTOs;
using HospitalDuty.Application.DTOs.HospitalDTOs;
using HospitalDuty.Domain.Entities;

namespace HospitalDuty.Application.DTOs.DepartmentDTOs;

public class CreateDepartmentDto
{
    public string Name { get; set; } = string.Empty;
    public Guid HospitalId { get; set; }
    public Guid? ManagerId { get; set; }
}
