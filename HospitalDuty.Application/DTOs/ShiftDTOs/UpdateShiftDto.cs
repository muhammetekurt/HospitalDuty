using System;
using HospitalDuty.Domain.Enums;

namespace HospitalDuty.Application.DTOs.ShiftDTOs;

public class UpdateShiftDto
{
    public Guid EmployeeId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public ShiftType ShiftType { get; set; } = ShiftType.Normal;
    public string Notes { get; set; } = string.Empty;
}
