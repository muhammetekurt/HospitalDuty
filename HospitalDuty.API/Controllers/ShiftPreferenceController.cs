using HospitalDuty.Application.DTOs.ShiftPreferenceDTOs;
using HospitalDuty.Application.Contracts.Services;
using Microsoft.AspNetCore.Mvc;

namespace HospitalDuty.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ShiftPreferenceController : ControllerBase
    {
        private readonly IShiftPreferenceService _service;

        public ShiftPreferenceController(IShiftPreferenceService service)
        {
            _service = service;
        }

        /// <summary>
        /// Creates shift preferences for an employee.
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreatePreferences([FromBody] CreateShiftPreferenceDto dto)
        {
            var result = await _service.CreatePreferencesAsync(dto);
            return Ok(result);
        }

        /// <summary>
        /// Gets shift preferences for a specific employee.
        /// </summary>
        [HttpGet("employee/{employeeId}")]
        public async Task<IActionResult> GetPreferencesByEmployee(Guid employeeId)
        {
            var result = await _service.GetPreferencesByEmployeeAsync(employeeId);
            return Ok(result);
        }

        /// <summary>
        /// Is there a shift preferences for a specific employee on a specific date.
        /// </summary>
        [HttpGet("employee/{employeeId}/date/{date}")]
        public async Task<IActionResult> IsEmployeeAvailable(Guid employeeId, DateTime date)
        {
            var result = await _service.IsEmployeeAvailableAsync(employeeId, date);
            return Ok(result);
        }

        /// <summary>
        /// Gets all shift preferences.
        /// </summary>
        [HttpGet("all")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _service.GetAllPreferencesAsync();
            return Ok(result);
        }

        /// <summary>
        /// Gets shift preferences for a specific month.
        /// </summary>
        [HttpGet("month/{month}")]
        public async Task<IActionResult> GetByMonth(int month)
        {
            var result = await _service.GetPreferencesByMonthAsync(month);
            return Ok(result);
        }

        /// <summary>
        /// Gets shift preferences for a specific employee in a specific month.
        /// </summary>
        [HttpGet("employee/{employeeId}/month/{month}")]
        public async Task<IActionResult> GetByEmployeeAndMonth(Guid employeeId, int month)
        {
            var result = await _service.GetPreferencesByEmployeeAndMonthAsync(employeeId, month);
            return Ok(result);
        }
        /// <summary>
        /// Gets available employees for a specific date.
        /// </summary>
        [HttpGet("available/date/{date}")]
        public async Task<IActionResult> GetAvailableEmployeesByDate(DateTime date)
        {
            var result = await _service.GetAvailableEmployeesByDateAsync(date);
            return Ok(result);
        }
        /// <summary>
        /// Gets available employees for a specific month.
        /// </summary>
        [HttpGet("available/month/{month}")]
        public async Task<IActionResult> GetAvailableEmployeesByMonth(int month)
        {
            var result = await _service.GetAvailableEmployeesByMonthAsync(month);
            return Ok(result);
        }
        [HttpGet("unavailable/month/{month}")]
        public async Task<IActionResult> GetUnavailableEmployeesByMonth(int month)
        {
            var result = await _service.GetUnavailableEmployeesByMonthAsync(month);
            return Ok(result);
        }
        [HttpGet("unavailable/date/{date}")]
        public async Task<IActionResult> GetUnavailableEmployeesByDate(DateTime date)
        {
            var result = await _service.GetUnavailableEmployeesByDateAsync(date);
            return Ok(result);
        }
    }
}
