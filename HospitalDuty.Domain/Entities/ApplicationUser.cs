using HospitalDuty.Domain.Enums;
using Microsoft.AspNetCore.Identity;

namespace HospitalDuty.Domain.Entities;

public class ApplicationUser : IdentityUser
{
    public string FullName { get; set; } = string.Empty;
    public Employee? Employee { get; set; }
    public Role Role { get; set; } // Enum Role
    public Guid? HospitalId { get; set; }
    public Guid? DepartmentId { get; set; }
}