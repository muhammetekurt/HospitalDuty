using Microsoft.AspNetCore.Identity;
using HospitalDuty.Domain.Entities;
using HospitalDuty.Domain.Enums;
using HospitalDuty.Application.DTOs.EmployeeDTOs;
using HospitalDuty.Application.Contracts.Services;

public static class IdentitySeed
{
    public static async Task SeedRolesAndAdminAsync(UserManager<ApplicationUser> userManager,
                                                    RoleManager<IdentityRole> roleManager,
                                                    IEmployeeService employeeService)
    {
        // 1️⃣ Roller
        foreach(var roleName in Enum.GetNames(typeof(Role)))
        {
            if(!await roleManager.RoleExistsAsync(roleName))
            {
                await roleManager.CreateAsync(new IdentityRole(roleName));
            }
        }

        // 2️⃣ Sistem Admin
        var adminEmail = "admin@hospital.com";
        var admin = await userManager.FindByEmailAsync(adminEmail);
        if (admin == null)
        {
            admin = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                FullName = "System Admin",
                PhoneNumber = "5554443322"
            };
            await userManager.CreateAsync(admin, "123456ok");  // Güçlü şifre
            await userManager.AddToRoleAsync(admin, Role.SystemAdmin.ToString());
            var employee = new CreateEmployeeDto
            {
                Id = Guid.Parse(admin.Id),
                FirstName = "System",
                LastName = "Admin",
                ApplicationUserId = admin.Id,
                Email = adminEmail
            };
            await employeeService.CreateAsync(employee);
        }
    }
}