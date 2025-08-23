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
        return await _context.Shifts.FindAsync(id);
    }

    public async Task<IEnumerable<Shift>> GetAllShiftsAsync()
    {
        return await _context.Shifts.ToListAsync();
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
