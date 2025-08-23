using System;
using HospitalDuty.Application.Abstractions;
using HospitalDuty.Domain.Entities;
using HospitalDuty.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HospitalDuty.Infrastructure.Repository;

public class ShiftRepository : IShiftRepository
{
    private readonly HospitalDbContext _context;

    public ShiftRepository(HospitalDbContext context)
    {
        _context = context;
    }

    public async Task<Shift> GetShiftByIdAsync(int id)
    {
        var shift = await _context.Shifts.FindAsync(id);
        if (shift == null) throw new KeyNotFoundException($"Shift with Id {id} not found.");
        return shift;
    }

    // public async Task<IEnumerable<Shift>> GetAllShiftsAsync()
    // {
    //     return await _context.Shifts
    //         .Include(s => s.Hospital)
    //         .Include(s => s.Department)
    //         .Include(s => s.Employee)
    //         .ToListAsync();
    // }
    private IQueryable<Shift> GetShiftsWithIncludes()
    {
        return _context.Shifts
            .Include(s => s.Hospital)
            .Include(s => s.Department)
            .Include(s => s.Employee)
            .Select(s => new Shift
            {
                Id = s.Id,
                DepartmentId = s.DepartmentId,
                EmployeeId = s.EmployeeId,
                HospitalId = s.HospitalId,
                StartTime = s.StartTime,
                EndTime = s.EndTime,
                ShiftType = s.ShiftType,
                Notes = s.Notes,
                Department = new Department 
                { 
                    Id = s.Department.Id, 
                    Name = s.Department.Name 
                },
                Employee = new Employee 
                { 
                    Id = s.Employee.Id, 
                    FirstName = s.Employee.FirstName,
                    LastName = s.Employee.LastName
                },
                Hospital = new Hospital 
                { 
                    Id = s.Hospital.Id, 
                    Name = s.Hospital.Name,
                }
            });
    }

    // Artık tüm methodlar çok kısa:
    public async Task<IEnumerable<Shift>> GetAllShiftsAsync()
    {
        return await GetShiftsWithIncludes().ToListAsync();
    }

    public async Task<IEnumerable<Shift>> GetShiftByHospitalIdAsync(Guid hospitalId)
    {
        return await GetShiftsWithIncludes()
            .Where(s => s.HospitalId == hospitalId)
            .ToListAsync();
    }

    public async Task<IEnumerable<Shift>> GetShiftByDepartmentIdAsync(Guid departmentId)
    {
        return await GetShiftsWithIncludes()
            .Where(s => s.DepartmentId == departmentId)
            .ToListAsync();
    }

    public async Task<IEnumerable<Shift>> GetShiftByEmployeeIdAsync(Guid employeeId)
    {
        return await GetShiftsWithIncludes()
            .Where(s => s.EmployeeId == employeeId)
            .ToListAsync();
    }

    public async Task<IEnumerable<Shift>> GetShiftByDateAsync(DateTime date)
    {
        return await GetShiftsWithIncludes()
            .Where(s => s.StartTime.Date == date.Date)  // Date karşılaştırması daha iyi
            .ToListAsync();
    }

    public async Task<IEnumerable<Shift>> GetShiftByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        return await GetShiftsWithIncludes()
            .Where(s => s.StartTime >= startDate && s.StartTime <= endDate)
            .ToListAsync();
    }
    public async Task<Shift> CreateShiftAsync(Shift shift)
    {
        _context.Shifts.Add(shift);
        await _context.SaveChangesAsync();
        return shift;
    }

    public async Task<bool> UpdateShiftAsync(Shift shift)
    {
        _context.Shifts.Update(shift);
        return await _context.SaveChangesAsync() > 0;
    }

    public async Task<bool> DeleteShiftAsync(int id)
    {
        var shift = await GetShiftByIdAsync(id);
        if (shift == null) return false;

        _context.Shifts.Remove(shift);
        return await _context.SaveChangesAsync() > 0;
    }
}
