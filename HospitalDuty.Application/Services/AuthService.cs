using HospitalDuty.Application.DTOs.EmployeeDTOs;
using HospitalDuty.Application.Contracts.Services;
using HospitalDuty.Domain.Entities;
using HospitalDuty.Domain.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IEmployeeService _employeeService;
    private readonly IConfiguration _config;
    private readonly INotificationService _notificationService;

    public AuthService(UserManager<ApplicationUser> userManager, IEmployeeService employeeService, IConfiguration config, INotificationService notificationService)
    {
        _userManager = userManager;
        _employeeService = employeeService;
        _config = config;
        _notificationService = notificationService;
    }

    public async Task<bool> RegisterAsync(RegisterDto dto) //KULLANIMDA DEĞİL - SELF REGISTER YOK
    {
        var exists = await _userManager.FindByEmailAsync(dto.Email);
        if (exists != null) return false;

        var user = new ApplicationUser
        {
            UserName = dto.Email,
            Email = dto.Email,
            FullName = dto.FullName,
            PhoneNumber = dto.PhoneNumber
        };

        var result = await _userManager.CreateAsync(user, "password12");
        if (!result.Succeeded) return false;

        var employee = new CreateEmployeeDto
        {
            Id = Guid.Parse(user.Id),
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            ApplicationUserId = user.Id,
            Email = dto.Email
        };

        await _employeeService.CreateAsync(employee);

        return true;
    }

    public async Task<ApplicationUser> CreateWithCreatorAsync(RegisterDto dto, string creatorUserId, string password)
    {
        var creator = await _userManager.FindByIdAsync(creatorUserId);
        if (creator == null)
            throw new Exception("Creator not found");


        var existingEmailUser = await _userManager.FindByEmailAsync(dto.Email);
        if (existingEmailUser != null)
            throw new Exception("Email already exists");

        var existingPhoneUser = _userManager.Users.FirstOrDefault(u => u.PhoneNumber == dto.PhoneNumber);
        if (existingPhoneUser != null)
            throw new Exception("Phone number already exists");

        // 2️⃣ Creator rolünü al
        var creatorRoles = await _userManager.GetRolesAsync(creator);
        var creatorRole = creatorRoles.FirstOrDefault();
        if (creatorRole == null)
            throw new Exception("Creator has no role");

        // 3️⃣ Yeni kullanıcı oluştur
        var user = new ApplicationUser
        {
            UserName = dto.Email,
            Email = dto.Email,
            FullName = dto.FullName,
            PhoneNumber = dto.PhoneNumber
        };

        // 4️⃣ Rol bazlı hospital & department aktarımı
        switch (creatorRole)
        {
            case nameof(Role.SystemAdmin):
                // Admin → HospitalDirector yaratacak
                if (dto.HospitalId == null)
                    throw new Exception("HospitalId is required for director creation by admin");
                user.HospitalId = dto.HospitalId;
                break;

            case nameof(Role.HospitalDirector):
                // Director → DepartmentManager yaratacak
                user.HospitalId = creator.HospitalId;
                if (dto.DepartmentId == null)
                    throw new Exception("DepartmentId is required for manager creation by director");
                user.DepartmentId = dto.DepartmentId;
                break;

            case nameof(Role.DepartmentManager):
                // Manager → Leader/Doctor/Nurse yaratacak
                user.HospitalId = creator.HospitalId;
                user.DepartmentId = creator.DepartmentId;
                break;

            default:
                throw new Exception("Creator role cannot create new users");
        }

        // 5️⃣ Kullanıcıyı Identity'ye ekle
        var result = await _userManager.CreateAsync(user, password);
        if (!result.Succeeded)
            throw new Exception(string.Join(", ", result.Errors.Select(e => e.Description)));

        // 6️⃣ Rol ekle (DTO üzerinden veya otomatik)
        string newUserRole = (dto.Role?.ToString()) ?? DetermineRoleByCreator(creatorRole);
        await _userManager.AddToRoleAsync(user, newUserRole);

        // 7️⃣ Employee tablosuna ekle
        var employeeDto = new CreateEmployeeDto
        {
            Id = Guid.Parse(user.Id),
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            ApplicationUserId = user.Id,
            HospitalId = user.HospitalId,
            DepartmentId = user.DepartmentId,
            Email = user.Email
        };

        await _employeeService.CreateAsync(employeeDto);

        return user;
    }


    public async Task<TokenDto?> LoginAsync(LoginDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user == null) return null;

        var pwOk = await _userManager.CheckPasswordAsync(user, dto.Password);
        if (!pwOk) return null;

        var roles = await _userManager.GetRolesAsync(user);
        var token = GenerateJwt(user, roles);

        return new TokenDto { Token = token };
    }

    private string GenerateJwt(ApplicationUser user, IList<string> roles)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Email, user.Email ?? ""),
            new(ClaimTypes.Name, user.FullName)
        };
        foreach (var r in roles) claims.Add(new Claim(ClaimTypes.Role, r));

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: DateTime.UtcNow.AddHours(double.Parse(_config["Jwt:ExpireHours"]!)),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
    private string DetermineRoleByCreator(string creatorRole)
    {
        return creatorRole switch
        {
            nameof(Role.SystemAdmin) => nameof(Role.HospitalDirector),
            nameof(Role.HospitalDirector) => nameof(Role.DepartmentManager),
            nameof(Role.DepartmentManager) => nameof(Role.DepartmentLeader),
            _ => throw new Exception("Cannot determine role for new user")
        };
    }
    public async Task<bool> ChangePasswordAsync(string userId, ChangePasswordDto dto)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return false;

        var result = await _userManager.ChangePasswordAsync(user, dto.CurrentPassword, dto.NewPassword);
        if (result.Succeeded)
            _notificationService.SendPasswordChangeNotification(user.Email, user.FullName);

        return result.Succeeded;
    }

    public async Task<(bool Success, string Message)> ForgotPasswordAsync(string email, string newPassword)
    {
        var user = await _userManager.FindByEmailAsync(email);
        if (user == null)
            return (false, "User not found.");
        
        await _userManager.RemovePasswordAsync(user);
        await _userManager.AddPasswordAsync(user, newPassword);
        await _notificationService.SendPasswordResetEmail(email, user.FullName, newPassword);

        return (true, "Password reset successfully and new password sent your e-mail address.");
    }

}