using HospitalDuty.Application.Abstractions;
using HospitalDuty.Domain.Entities;
using HospitalDuty.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HospitalDuty.Infrastructure.Repository
{
    public class EmployeeRepository : IEmployeeRepository
    {
        private readonly HospitalDbContext _context;

        public EmployeeRepository(HospitalDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Employee>> GetAllAsync()
        {
            return await _context.Employees.ToListAsync();
        }

        public async Task<Employee?> GetByIdAsync(Guid id)
        {
            return await _context.Employees.FindAsync(id);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var employee = await _context.Employees.FindAsync(id);
            if (employee == null) return false;

            _context.Employees.Remove(employee);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
