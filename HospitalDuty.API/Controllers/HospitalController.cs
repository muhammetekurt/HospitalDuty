using System;
using HospitalDuty.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using HospitalDuty.Application.DTOs.HospitalDTOs;
using Microsoft.AspNetCore.Authorization;

namespace HospitalDuty.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HospitalController : ControllerBase
{
    private readonly IHospitalService _hospitalService;

    public HospitalController(IHospitalService hospitalService)
    {
        _hospitalService = hospitalService;
    }
    /// <summary>
    /// Returns all Hospitals
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<HospitalDto>>> GetAll()
    {
        var hospitals = await _hospitalService.GetAllAsync();
        return Ok(hospitals);
    }

    /// <summary>
    /// Returns a Hospital by Id
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<HospitalDto>> GetById(Guid id)
    {
        var hospital = await _hospitalService.GetByIdAsync(id);
        if (hospital == null)
            return NotFound();

        return Ok(hospital);
    }

    /// <summary>
    /// Returns Hospital by Director Id
    /// </summary>
    [HttpGet("director/{directorId:guid}")]
    public async Task<ActionResult<HospitalDto?>> GetByDirector(Guid directorId)
    {
        var hospital = await _hospitalService.GetByDirectorAsync(directorId);
        if (hospital == null)
            return NotFound();

        return Ok(hospital);
    }

    /// <summary>
    /// Creates a new Hospital
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<CreateHospitalDto>> Create(CreateHospitalDto hospitalDto)
    {
        var createdHospital = await _hospitalService.CreateAsync(hospitalDto);
        if (createdHospital == null)
            return BadRequest();

        return Ok(createdHospital);
    }

    /// <summary>
    /// Updates a Hospital
    /// </summary>
    [HttpPut]
    public async Task<ActionResult> Update(Guid id, UpdateHospitalDto hospitalDto)
    {
        var result = await _hospitalService.UpdateAsync(id, hospitalDto);
        if (!result)
            return NotFound();

        return NoContent();
    }

    /// <summary>
    /// Deletes a Hospital by Id
    /// </summary>
    [Authorize(Roles = "SystemAdmin")]
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var result = await _hospitalService.DeleteAsync(id);
        if (!result)
            return NotFound();

        return NoContent();
    }
}
