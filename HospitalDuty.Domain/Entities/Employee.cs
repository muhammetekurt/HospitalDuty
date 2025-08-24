using System;
using System.Collections.Generic;
using HospitalDuty.Domain.Enums;

namespace HospitalDuty.Domain.Entities;

public class Employee
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    // public string PhoneNumber { get; set; } = string.Empty;
    // public string ProfileImage { get; set; } = string.Empty;
    // public Role Role { get; set; } = Role.Staff;

    public Guid? DepartmentId { get; set; }
    public Department? Department { get; set; }

    public Guid? HospitalId { get; set; }
    public Hospital? Hospital { get; set; }
    public ICollection<Shift> Shifts { get; set; } = new List<Shift>();

    // Identity ile birebir ilişki
    public string? ApplicationUserId { get; set; }  // string
    public ApplicationUser? ApplicationUser { get; set; }
}
