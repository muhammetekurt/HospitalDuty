using System;
using HospitalDuty.Domain.Enums;

namespace HospitalDuty.Application.DTOs.ShiftPreferenceDTOs;

public class ShiftPreferenceDto
{
    public Guid Id { get; set; }
    public Guid EmployeeId { get; set; }
    public DateTime Date { get; set; }
    public PreferenceType PreferenceType { get; set; }
    public string Notes { get; set; } = string.Empty;
    public string DepartmentName { get; set; } = string.Empty;
}