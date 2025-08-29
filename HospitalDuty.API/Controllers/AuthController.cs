using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HospitalDuty.Application.DTOs.EmployeeDTOs;
using HospitalDuty.Application.Contracts.Services;
using HospitalDuty.Domain.Entities;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace HospitalDuty.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IEmployeeService _employeeService;
    private readonly IEmailService _emailService;
    private readonly INotificationService _notificationService;

    public AuthController(IAuthService authService, IEmployeeService employeeService, IEmailService emailService, INotificationService notificationService)
    {
        _authService = authService;
        _employeeService = employeeService;
        _emailService = emailService;
        _notificationService = notificationService;
    }

    //şimdilik kendi kendine kayıt yok
    // [HttpPost("register")]
    // public async Task<IActionResult> Register(RegisterDto dto)
    // {
    //     var result = await _authService.RegisterAsync(dto);
    //     if (!result) return BadRequest("Registration failed.");
    //     return Ok(new { Message = "User created successfully." });
    // }

    [HttpPost("register-by-admin")]
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "SystemAdmin, HospitalDirector, DepartmentManager")]
    public async Task<IActionResult> RegisterByAdmin(RegisterDto dto)
    {
        var creatorUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        string password = CreatePassword(8);
        var result = await _authService.CreateWithCreatorAsync(dto, creatorUserId, password);
        var fullName = $"{dto.FirstName} {dto.LastName}";
        if (result == null) return BadRequest("Creation failed.");
        // Send welcome email
        //await _emailService.SendEmailAsync(dto.Email, "", "Welcome to HospitalDuty", "Thank you for registering!");
        await _notificationService.SendWelcomeEmail(dto.Email, fullName, password);

        return Ok(new { Message = "User created successfully." });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var token = await _authService.LoginAsync(dto);
        if (token == null) return Unauthorized();
        return Ok(token);
    }

    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [HttpPost("logout")]
    public IActionResult Logout()
    {
        return Ok(new { Message = "Logged out successfully. Please delete token on client." });
    }

    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword(ChangePasswordDto dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); // token’dan user id alır
        if (userId == null) return Unauthorized();

        var result = await _authService.ChangePasswordAsync(userId, dto);

        if (!result)
            return BadRequest("Password change failed.");

        return Ok("Password changed successfully.");
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordDto dto)
    {
        var newPassword = CreatePassword(8);
        var result = await _authService.ForgotPasswordAsync(dto.Email, newPassword);
        if (!result.Success)
            return BadRequest(result.Message);

        return Ok(result.Message);
    }

    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var employee = await _employeeService.GetByIdAsync(Guid.Parse(userId));
        if (employee == null) return NotFound();
        return Ok(employee);
    }

    [HttpGet("create-password")]
    public string CreatePassword(int length)
    {
        const string valid = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
        StringBuilder res = new StringBuilder();
        Random rnd = new Random();
        while (0 < length--)
        {
            res.Append(valid[rnd.Next(valid.Length)]);
        }
        return res.ToString();
    }

    // [Authorize(Roles = "SystemAdmin")]
    // [HttpPost("admin-only")]
    // public IActionResult AdminOnly() => Ok("Only admin can see this.");
}
