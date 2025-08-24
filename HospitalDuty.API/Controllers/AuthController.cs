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

// [ApiController]
// [Route("api/[controller]")]
// public class AuthController : ControllerBase
// {
//     private readonly UserManager<ApplicationUser> _userManager;
//     private readonly IConfiguration _config;
//     private readonly IEmployeeService _employeeService;

//     public AuthController(UserManager<ApplicationUser> userManager, IConfiguration config, IEmployeeService employeeService)
//     {
//         _userManager = userManager;
//         _config = config;
//         _employeeService = employeeService;
//     }

//     [HttpPost("register")]
//     public async Task<IActionResult> Register(RegisterDto dto)
//     {
//         var exists = await _userManager.FindByEmailAsync(dto.Email);
//         if (exists != null) return BadRequest("Email already exists");

//         var user = new ApplicationUser
//         {
//             UserName = dto.Email,
//             Email = dto.Email,
//             FullName = dto.FullName,
//             PhoneNumber = dto.PhoneNumber
//         };

//         var result = await _userManager.CreateAsync(user, dto.Password);

//         if(!result.Succeeded) return BadRequest(result.Errors);

//         var employee = new CreateEmployeeDto
//         {
//             Id = Guid.Parse(user.Id),
//             FirstName = dto.FirstName,
//             LastName = dto.LastName,
//             ApplicationUserId = user.Id
//         };

//         await _employeeService.CreateAsync(employee);

//         return Ok(new { Message = "User created successfully." });
//     }

//     [HttpPost("login")]
//     public async Task<IActionResult> Login(LoginDto dto)
//     {
//         var user = await _userManager.FindByEmailAsync(dto.Email);
//         if (user == null) return Unauthorized();

//         var pwOk = await _userManager.CheckPasswordAsync(user, dto.Password);
//         if (!pwOk) return Unauthorized();

//         var roles = await _userManager.GetRolesAsync(user);
//         var token = GenerateJwt(user, roles);

//         return Ok(new { token });
//     }

//     [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
//     [HttpGet("me")]
//     public IActionResult Me()
//     {
//         var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
//         var fullName = User.FindFirstValue(ClaimTypes.Name); // FullName'i claim olarak eklediysen
//         var email = User.FindFirstValue(ClaimTypes.Email);
//         var roles = User.FindAll(ClaimTypes.Role).Select(r => r.Value).ToList();

//         return Ok(new { userId, fullName, email, roles });
//     }


//     private string GenerateJwt(ApplicationUser user, IList<string> roles)
//     {
//         var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
//         var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
//         var claims = new List<Claim>
//         {
//             new(ClaimTypes.NameIdentifier, user.Id),
//             new(ClaimTypes.Email, user.Email ?? ""),
//             new(ClaimTypes.Name, user.FullName)
//         };
//         foreach (var r in roles) claims.Add(new Claim(ClaimTypes.Role, r));

//         var token = new JwtSecurityToken(
//             issuer: _config["Jwt:Issuer"],
//             audience: _config["Jwt:Audience"],
//             claims: claims,
//             expires: DateTime.UtcNow.AddHours(double.Parse(_config["Jwt:ExpireHours"]!)),
//             signingCredentials: creds
//         );

//         return new JwtSecurityTokenHandler().WriteToken(token);
//     }
// }
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
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Roles = "SystemAdmin, HospitalDirector")]
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
