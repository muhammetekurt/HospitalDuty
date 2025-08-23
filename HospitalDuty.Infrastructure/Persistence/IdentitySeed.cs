using Microsoft.AspNetCore.Identity;
using HospitalDuty.Domain.Entities;
using HospitalDuty.Domain.Enums;

public static class IdentitySeed
{
    public static async Task SeedRolesAndAdminAsync(UserManager<ApplicationUser> userManager,
                                                    RoleManager<IdentityRole> roleManager)
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
        if(admin == null)
        {
            admin = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                FullName = "System Admin",
                PhoneNumber = "0000000000"
            };
            await userManager.CreateAsync(admin, "123456ok");  // Güçlü şifre
            await userManager.AddToRoleAsync(admin, Role.SystemAdmin.ToString());
        }
    }
}
