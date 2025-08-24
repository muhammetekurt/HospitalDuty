using HospitalDuty.Application.DTOs.EmployeeDTOs;
using HospitalDuty.Application.Interfaces;
using HospitalDuty.Domain.Entities;
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

    public AuthService(UserManager<ApplicationUser> userManager, IEmployeeService employeeService, IConfiguration config)
    {
        _userManager = userManager;
        _employeeService = employeeService;
        _config = config;
    }

    public async Task<bool> RegisterAsync(RegisterDto dto)
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

        var result = await _userManager.CreateAsync(user, dto.Password);
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

    public async Task<bool> CreateWithCreatorAsync(RegisterDto dto, string creatorUserId)
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

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded) return false;

        var creatorEmployee = await _employeeService.GetByIdAsync(Guid.Parse(creatorUserId));
        if (creatorEmployee == null) return false;

        var employee = new CreateEmployeeDto
        {
            Id = Guid.Parse(user.Id),
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            HospitalId = creatorEmployee.HospitalId,
            ApplicationUserId = user.Id,
            Email = dto.Email
        };

        await _employeeService.CreateAsync(employee);

        return true;
    }

    public async Task<TokenDto> LoginAsync(LoginDto dto)
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
}
