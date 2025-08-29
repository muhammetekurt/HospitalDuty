using HospitalDuty.Application.Contracts.Persistence;
using HospitalDuty.Domain.Entities;
using HospitalDuty.Domain.Enums;
using HospitalDuty.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HospitalDuty.Infrastructure.Repository
{
    public class ShiftPreferenceRepository : IShiftPreferenceRepository
    {
        private readonly HospitalDbContext _context;

        public ShiftPreferenceRepository(HospitalDbContext context)
        {
            _context = context;
        }

        public async Task<bool> CreateAsync(ShiftPreference shiftPreference)
        {
            await _context.ShiftPreference.AddAsync(shiftPreference);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<ShiftPreference>> GetByEmployeeAsync(Guid employeeId)
        {
            return await _context.ShiftPreference
                .Where(x => x.EmployeeId == employeeId)
                .ToListAsync();
        }

        public async Task<ShiftPreference?> GetByEmployeeAndDateAsync(Guid employeeId, DateTime date)
        {
            return await _context.ShiftPreference
                .FirstOrDefaultAsync(x => x.EmployeeId == employeeId && x.Date.Date == date.Date);
        }

        public async Task<IEnumerable<ShiftPreference>> GetAllAsync()
        {
            return await _context.ShiftPreference.ToListAsync();
        }

        public async Task<IEnumerable<ShiftPreference>> GetByMonthAsync(int month)
        {
            return await _context.ShiftPreference
                .Where(x => x.Date.Month == month)
                .ToListAsync();
        }

        public async Task<IEnumerable<ShiftPreference>> GetByEmployeeAndMonthAsync(Guid employeeId, int month)
        {
            return await _context.ShiftPreference
                .Where(x => x.EmployeeId == employeeId && x.Date.Month == month)
                .ToListAsync();
        }

        public async Task<IEnumerable<ShiftPreference>> GetAvailableEmployeesByDateAsync(DateTime date)
        {
            return await _context.ShiftPreference
                .Where(x => x.Date.Date == date.Date && x.PreferenceType == PreferenceType.Preferred)
                .ToListAsync();
        }

        public async Task<IEnumerable<ShiftPreference>> GetAvailableEmployeesByMonthAsync(int month)
        {
            return await _context.ShiftPreference
                .Where(x => x.Date.Month == month && x.PreferenceType == PreferenceType.Preferred)
                .ToListAsync();
        }
    }
}