using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HospitalDuty.Application.DTOs.EmployeeDTOs;
using HospitalDuty.Application.Interfaces;
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

    public AuthController(IAuthService authService, IEmployeeService employeeService)
    {
        _authService = authService;
        _employeeService = employeeService;
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
        var result = await _authService.CreateWithCreatorAsync(dto, creatorUserId);
        if (result == null) return BadRequest("Creation failed.");
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
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var employee = await _employeeService.GetByIdAsync(Guid.Parse(userId));
        if (employee == null) return NotFound();
        return Ok(employee);
    }
}
