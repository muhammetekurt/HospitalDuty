using System;
using HospitalDuty.Application.DTOs.DepartmentDTOs;
using HospitalDuty.Application.DTOs.HospitalDTOs;
using HospitalDuty.Application.Contracts.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace HospitalDuty.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DepartmentController : ControllerBase
{
    private readonly IDepartmentService _departmentService;

    public DepartmentController(IDepartmentService departmentService)
    {
        _departmentService = departmentService;
    }

    /// <summary>
    /// Returns a Department by Id
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var department = await _departmentService.GetByIdAsync(id);
        if (department == null) return NotFound();
        return Ok(department);
    }

    /// <summary>
    /// Returns all Departments
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<DepartmentDto>>> GetAll()
    {
        var departments = await _departmentService.GetAllAsync();
        return Ok(departments);
    }

    /// <summary>
    /// Returns Departments by Hospital Id
    /// </summary>
    [HttpGet("hospital/{hospitalId}")]
    public async Task<IActionResult> GetByHospital(Guid hospitalId)
    {
        var department = await _departmentService.GetByHospitalAsync(hospitalId);
        if (department == null) return NotFound();
        return Ok(department);
    }

    /// <summary>
    /// Returns Departments by Manager Id
    /// </summary>
    [HttpGet("manager/{managerId}")]
    public async Task<IActionResult> GetByManager(Guid managerId)
    {
        var department = await _departmentService.GetByManagerAsync(managerId);
        if (department == null) return NotFound();
        return Ok(department);
    }

    /// <summary>
    /// Creates a new Department
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create(CreateDepartmentDto departmentDto)
    {
        var department = await _departmentService.CreateAsync(departmentDto);
        if (department == null) return BadRequest();
        return CreatedAtAction(nameof(GetById), new { id = department.Id }, department);
    }

    /// <summary>
    /// Updates an existing Department
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, UpdateDepartmentDto departmentDto)
    {
        var department = await _departmentService.UpdateAsync(id, departmentDto);
        if (department == null) return NotFound();
        return Ok(department);
    }

    /// <summary>
    /// Deletes a Department by Id
    /// </summary>
    [Authorize(Roles = "SystemAdmin, HospitalDirector")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var result = await _departmentService.DeleteAsync(id);
        if (!result) return NotFound();
        return NoContent();
    }


}
