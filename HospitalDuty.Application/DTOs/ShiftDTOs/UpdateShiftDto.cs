using System;
using HospitalDuty.Domain.Enums;

namespace HospitalDuty.Application.DTOs.ShiftDTOs;

public class UpdateShiftDto
{
    public int Id { get; set; }
    public Guid DepartmentId { get; set; }
    public Guid EmployeeId { get; set; }
    public Guid HospitalId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public ShiftType ShiftType { get; set; } = ShiftType.Normal;
    public string Notes { get; set; } = string.Empty;
}
