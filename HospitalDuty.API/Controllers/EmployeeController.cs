using System.Security.Claims;
using HospitalDuty.Application.DTOs.EmployeeDTOs;
using HospitalDuty.Application.Interfaces;
using HospitalDuty.Application.Services;
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
}
