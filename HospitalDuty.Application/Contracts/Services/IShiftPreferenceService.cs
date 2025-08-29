using System;
using HospitalDuty.Application.DTOs.EmployeeDTOs;
using HospitalDuty.Application.DTOs.ShiftPreferenceDTOs;

namespace HospitalDuty.Application.Contracts.Services;

public interface IShiftPreferenceService
{
    Task<IEnumerable<ShiftPreferenceDto>> CreatePreferencesAsync(CreateShiftPreferenceDto dto);
    Task<IEnumerable<ShiftPreferenceDto>> GetPreferencesByEmployeeAsync(Guid employeeId);
    Task<bool> IsEmployeeAvailableAsync(Guid employeeId, DateTime date);
    //
    Task<IEnumerable<ShiftPreferenceDto>> GetAllPreferencesAsync();
    Task<IEnumerable<ShiftPreferenceDto>> GetPreferencesByMonthAsync(int month);
    Task<IEnumerable<ShiftPreferenceDto>> GetPreferencesByEmployeeAndMonthAsync(Guid employeeId, int month);
    //
    Task<IEnumerable<EmployeeDto>> GetAvailableEmployeesByDateAsync(DateTime date);
    Task<IEnumerable<EmployeeDto>> GetAvailableEmployeesByMonthAsync(int month);
    Task<IEnumerable<EmployeeDto>> GetUnavailableEmployeesByDateAsync(DateTime date);
    Task<IEnumerable<EmployeeDto>> GetUnavailableEmployeesByMonthAsync(int month);
}
