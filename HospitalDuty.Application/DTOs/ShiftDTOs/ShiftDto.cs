using System;
using HospitalDuty.Application.DTOs.EmployeeDTOs;
using HospitalDuty.Domain.Entities;
using HospitalDuty.Domain.Enums;

namespace HospitalDuty.Application.DTOs.ShiftDTOs;

public class ShiftDto
{
    public int Id { get; set; }
    public Guid DepartmentId { get; set; }
    public Department? Department { get; set; } = default!;
    public Guid EmployeeId { get; set; }
    public Employee? Employee { get; set; } = default!;
    public Guid HospitalId { get; set; }
    public Hospital? Hospital { get; set; } = default!;
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public ShiftType ShiftType { get; set; } = ShiftType.Normal;
    public string Notes { get; set; } = string.Empty;
}

