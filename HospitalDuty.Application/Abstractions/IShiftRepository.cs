using System;
using HospitalDuty.Domain.Entities;

namespace HospitalDuty.Application.Abstractions;

public interface IShiftRepository
{
    Task<Shift> GetShiftByIdAsync(int id);
    Task<IEnumerable<Shift>> GetAllShiftsAsync();
    Task<IEnumerable<Shift>> GetShiftByHospitalIdAsync(Guid hospitalId);
    Task<IEnumerable<Shift>> GetShiftByDepartmentIdAsync(Guid departmentId);
    Task<IEnumerable<Shift>> GetShiftByEmployeeIdAsync(Guid employeeId);
    Task<IEnumerable<Shift>> GetShiftByDateAsync(DateTime date);
    Task<IEnumerable<Shift>> GetShiftByDateRangeAsync(DateTime startDate, DateTime endDate);
    Task<Shift> CreateShiftAsync(Shift shift);
    Task<bool> UpdateShiftAsync(Shift shift);
    Task<bool> DeleteShiftAsync(int id);
}
