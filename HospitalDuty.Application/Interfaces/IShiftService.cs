using System;
using HospitalDuty.Application.DTOs.ShiftDTOs;

namespace HospitalDuty.Application.Interfaces;

public interface IShiftService
{
    Task<ShiftDto> GetShiftByIdAsync(int id);
    Task<IEnumerable<ShiftDto>> GetAllShiftsAsync();
    Task<IEnumerable<ShiftDto>> GetShiftByHospitalIdAsync(Guid hospitalId);
    Task<IEnumerable<ShiftDto>> GetShiftByDepartmentIdAsync(Guid departmentId);
    Task<IEnumerable<ShiftDto>> GetShiftByEmployeeIdAsync(Guid employeeId);
    Task<IEnumerable<ShiftDto>> GetShiftByDateAsync(DateTime date);
    Task<IEnumerable<ShiftDto>> GetShiftByDateRangeAsync(DateTime startDate, DateTime endDate);
    Task<ShiftDto> CreateShiftAsync(CreateShiftDto createShiftDto);
    Task<bool> UpdateShiftAsync(int id, UpdateShiftDto updateShiftDto);
    Task<bool> DeleteShiftAsync(int id);
}
