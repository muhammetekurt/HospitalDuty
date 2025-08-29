using System;
using HospitalDuty.Domain.Enums;

namespace HospitalDuty.Domain.Entities;

public class ShiftPreference
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid EmployeeId { get; set; }
    public Employee Employee { get; set; }
    public DateTime Date { get; set; }
    public PreferenceType PreferenceType { get; set; } = PreferenceType.Unavailable;
    public string Notes { get; set; } = string.Empty;
    public string DepartmentName { get; set; } = string.Empty;
}