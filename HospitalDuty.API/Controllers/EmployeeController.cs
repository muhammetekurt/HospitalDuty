using HospitalDuty.Application.DTOs.Employee;
using HospitalDuty.Application.Interfaces;
using HospitalDuty.Application.Services;
using HospitalDuty.Domain.Entities;
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
    /// Deletes an Employee by Id
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var result = await _employeeService.DeleteAsync(id);
        if (!result)
            return NotFound();

        return NoContent();
    }
}
