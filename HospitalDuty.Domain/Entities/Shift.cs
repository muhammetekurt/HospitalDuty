using System;
using HospitalDuty.Domain.Enums;

namespace HospitalDuty.Domain.Entities;

public class Shift
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid DepartmentId { get; set; }

    public Guid EmployeeId { get; set; }

    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }

    public ShiftType ShiftType { get; set; } = ShiftType.Normal;

    public string Notes { get; set; } = string.Empty;
}
