using System.Security.Claims;
using HospitalDuty.Application.DTOs.EmployeeDTOs;
using HospitalDuty.Application.Contracts.Services;
using HospitalDuty.Domain.Entities;
using HospitalDuty.Domain.Enums;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HospitalDuty.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmployeeController : ControllerBase
{
    private readonly IEmployeeService _employeeService;

    public EmployeeController(IEmployeeService employeeService)
    {
        _employeeService = employeeService;
    }

    /// <summary>
    /// Returns all Employee
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<EmployeeDto>>> GetAll()
    {
        var employees = await _employeeService.GetAllAsync();
        return Ok(employees);
    }

    /// <summary>
    /// Returns an Employee by Id
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<EmployeeDto>> GetById(Guid id)
    {
        var employee = await _employeeService.GetByIdAsync(id);
        if (employee == null)
            return NotFound();

        return Ok(employee);
    }

    /// <summary>
    /// Returns current logged-in Employee info
    /// </summary>
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [HttpGet("my-infos")]
    public async Task<ActionResult<EmployeeDto>> GetMyInfos()
    {
        // Token içindeki Identity User Id'yi çek
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        // UserId üzerinden Employee bul
        var employee = await _employeeService.GetByIdAsync(Guid.Parse(userId));
        if (employee == null)
            return NotFound("Employee not found for current user.");

        return Ok(employee);
    }

    /// <summary>
    /// Returns Employees by departmentId
    /// </summary>
    [HttpGet("department/{departmentId:guid}")]
    public async Task<ActionResult<IEnumerable<EmployeeDto>>> GetByDepartment(Guid departmentId)
    {
        var employees = await _employeeService.GetByDepartmentAsync(departmentId);
        if (employees == null || !employees.Any())
            return NotFound();

        return Ok(employees);
    }

    /// <summary>
    /// Returns Employees by roleId
    /// </summary>
    [HttpGet("role/{role}")]
    public async Task<ActionResult<IEnumerable<EmployeeDto>>> GetByRole(Role role)
    {
        var employees = await _employeeService.GetByRoleAsync(role);
        if (employees == null || !employees.Any())
            return NotFound();

        return Ok(employees);
    }

    /// <summary>
    /// Creates a new Employee //KAYITLAR AUTH TARAFINDAN ALINIYOR O YÜZDEN İPTAL
    /// </summary>
    // [HttpPost]
    // public async Task<ActionResult<EmployeeDto>> Create(CreateEmployeeDto employeeDto)
    // {
    //     var employee = await _employeeService.CreateAsync(employeeDto);
    //     if (employee == null)
    //         return BadRequest();

    //     return CreatedAtAction(nameof(GetById), new { id = employee.Id }, employee);
    // }

    /// <summary>
    /// Updates an existing Employee
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<EmployeeDto>> Update(Guid id, UpdateEmployeeDto employeeDto)
    {
        var employee = await _employeeService.UpdateAsync(id, employeeDto, User); //User: CurrentEmployee
        if (employee == null)
            return NotFound();

        return Ok(employee);
    }

    /// <summary>
    /// Deletes an Employee by Id
    /// </summary>
    [Authorize(Roles = "SystemAdmin, HospitalDirector, DepartmentManager")]
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var result = await _employeeService.DeleteAsync(id);
        if (!result)
            return NotFound();

        return NoContent();
    }

    /// <summary>
    /// Uploads a profile image for an employee
    /// </summary>
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [HttpPost("{id:guid}/upload-profile-image")]
    public async Task<ActionResult> UploadProfileImage(Guid id, IFormFile file)
    {
        // Dosya kontrolü
        if (file == null || file.Length == 0)
            return BadRequest("No file uploaded");

        // Dosya boyutu kontrolü (2MB)
        if (file.Length > 2 * 1024 * 1024)
            return BadRequest("File size cannot exceed 2MB");

        // Dosya tipi kontrolü
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
        var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(fileExtension))
            return BadRequest("Only JPG, PNG, and WebP files are allowed");

        try
        {
            // Dosya adını oluştur
            var fileName = $"employee-{id}{fileExtension}";
            var filePath = Path.Combine("wwwroot", "profile-images", fileName);

            // Eski dosyayı sil (varsa)
            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
            }

            // Yeni dosyayı kaydet
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Database'i güncelle
            var result = await _employeeService.UpdateProfileImageAsync(id, fileName);
            if (!result)
                return NotFound("Employee not found");

            return Ok(new { message = "Profile image uploaded successfully", fileName });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }

    /// <summary>
    /// Deletes a profile image for an employee
    /// </summary>
    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [HttpDelete("{id:guid}/delete-profile-image")]
    public async Task<ActionResult> DeleteProfileImage(Guid id)
    {
        try
        {
            // Employee'yi bul
            var employee = await _employeeService.GetByIdAsync(id);
            if (employee == null)
                return NotFound("Employee not found");

            // Eski dosyayı sil (varsa)
            if (!string.IsNullOrEmpty(employee.ProfileImagePath))
            {
                var filePath = Path.Combine("wwwroot", "profile-images", employee.ProfileImagePath);
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
            }

            // Database'den profil resmi bilgisini sil
            var result = await _employeeService.DeleteProfileImageAsync(id);
            if (!result)
                return NotFound("Employee not found");

            return Ok(new { message = "Profile image deleted successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, $"Internal server error: {ex.Message}");
        }
    }
}
