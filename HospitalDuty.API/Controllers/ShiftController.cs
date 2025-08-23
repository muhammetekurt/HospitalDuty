using System;
using HospitalDuty.Application.DTOs.ShiftDTOs;
using HospitalDuty.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HospitalDuty.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ShiftController : ControllerBase
{
    private readonly IShiftService _shiftService;

    public ShiftController(IShiftService shiftService)
    {
        _shiftService = shiftService;
    }

    /// <summary>
    /// Returns a Shift by Id
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetShiftById(int id)
    {
        var shift = await _shiftService.GetShiftByIdAsync(id);
        if (shift == null) return NotFound();
        return Ok(shift);
    }

    /// <summary>
    /// Returns all Shifts
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAllShifts()
    {
        var shifts = await _shiftService.GetAllShiftsAsync();
        return Ok(shifts);
    }

    /// <summary>
    /// Returns all Shifts for a specific Hospital
    /// </summary>
    [HttpGet("hospital/{hospitalId}")]
    public async Task<IActionResult> GetShiftByHospitalId(Guid hospitalId)
    {
        var shifts = await _shiftService.GetShiftByHospitalIdAsync(hospitalId);
        return Ok(shifts);
    }

    /// <summary>
    /// Returns all Shifts for a specific Employee
    /// </summary>
    [HttpGet("employee/{employeeId}")]
    public async Task<IActionResult> GetShiftByEmployeeId(Guid employeeId)
    {
        var shifts = await _shiftService.GetShiftByEmployeeIdAsync(employeeId);
        return Ok(shifts);
    }

    /// <summary>
    /// Returns all Shifts for a specific Department
    /// </summary>
    [HttpGet("department/{departmentId}")]
    public async Task<IActionResult> GetShiftByDepartmentId(Guid departmentId)
    {
        var shifts = await _shiftService.GetShiftByDepartmentIdAsync(departmentId);
        return Ok(shifts);
    }
    /// <summary>
    /// Returns all Shifts for a specific Date
    /// </summary>
    [HttpGet("date/{date}")]
    public async Task<IActionResult> GetShiftByDate(DateTime date)
    {
        var shifts = await _shiftService.GetShiftByDateAsync(date);
        return Ok(shifts);
    }

    /// <summary>
    /// Returns all Shifts for a specific Date Range
    /// </summary>
    [HttpGet("dateRange")]
    public async Task<IActionResult> GetShiftByDateRange([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
    {
        var shifts = await _shiftService.GetShiftByDateRangeAsync(startDate, endDate);
        return Ok(shifts);
    }

    /// <summary>
    /// Creates a Shift
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> CreateShift([FromBody] CreateShiftDto createShiftDto)
    {
        var shift = await _shiftService.CreateShiftAsync(createShiftDto);
        return CreatedAtAction(nameof(GetShiftById), new { id = shift.Id }, shift);
    }

    /// <summary>
    /// Updates a Shift
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateShift(int id, [FromBody] UpdateShiftDto updateShiftDto)
    {
        var shift = await _shiftService.UpdateShiftAsync(id, updateShiftDto);
        if (shift == null) return NotFound();
        return Ok(shift);
    }

    /// <summary>
    /// Deletes a Shift
    /// </summary>

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteShift(int id)
    {
        var result = await _shiftService.DeleteShiftAsync(id);
        if (!result) return NotFound();

        return NoContent();
    }
}
