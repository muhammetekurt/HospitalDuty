using System;
using HospitalDuty.Domain.Entities;

namespace HospitalDuty.Application.Contracts.Persistence;

public interface IShiftPreferenceRepository
{
    Task<bool> CreateAsync(ShiftPreference shiftPreference);
    Task<IEnumerable<ShiftPreference>> GetByEmployeeAsync(Guid employeeId);
    Task<ShiftPreference?> GetByEmployeeAndDateAsync(Guid employeeId, DateTime date);
    Task<IEnumerable<ShiftPreference>> GetAllAsync();
    Task<IEnumerable<ShiftPreference>> GetByMonthAsync(int month);
    Task<IEnumerable<ShiftPreference>> GetByEmployeeAndMonthAsync(Guid employeeId, int month);
    Task<bool> DeletePreferencesByEmployeeAsync(Guid employeeId);
    Task<bool> DeletePreferenceAsync(Guid id);
}
