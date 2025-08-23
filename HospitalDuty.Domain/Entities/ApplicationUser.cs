using Microsoft.AspNetCore.Identity;

namespace HospitalDuty.Domain.Entities;

public class ApplicationUser : IdentityUser
{
    public string FullName { get; set; } = string.Empty;
    public Employee? Employee { get; set; }
}
