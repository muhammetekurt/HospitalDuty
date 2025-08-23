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
