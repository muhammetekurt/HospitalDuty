using System;
using HospitalDuty.Application.DTOs.ShiftDTOs;

namespace HospitalDuty.Application.Interfaces;

public interface IShiftService
{
    Task<ShiftDto> GetShiftByIdAsync(int id);
    Task<IEnumerable<ShiftDto>> GetAllShiftsAsync();
    Task<ShiftDto> CreateShiftAsync(CreateShiftDto createShiftDto);
    Task<bool> UpdateShiftAsync(int id, UpdateShiftDto updateShiftDto);
    Task<bool> DeleteShiftAsync(int id);
}
