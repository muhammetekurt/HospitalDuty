using System;
using HospitalDuty.Application.DTOs.EmployeeDTOs;
using HospitalDuty.Application.DTOs.HospitalDTOs;
using HospitalDuty.Domain.Entities;

namespace HospitalDuty.Application.DTOs.DepartmentDTOs;

public class UpdateDepartmentDto
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public Guid HospitalId { get; set; }
    //public HospitalDto Hospital { get; set; } = default!;
    public Guid? ManagerId { get; set; }
    //public EmployeeDto? Manager { get; set; }
}
