using System;
using HospitalDuty.Domain.Entities;

namespace HospitalDuty.Application.Abstractions;

public interface IShiftRepository
{
    Task<Shift> GetShiftByIdAsync(int id);
    Task<IEnumerable<Shift>> GetAllShiftsAsync();
    Task<Shift> CreateShiftAsync(Shift shift);
    Task<bool> UpdateShiftAsync(Shift shift);
    Task<bool> DeleteShiftAsync(int id);
}
