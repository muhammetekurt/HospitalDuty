using System;
using HospitalDuty.Application.Contracts.Persistence;
using HospitalDuty.Domain.Entities;
using HospitalDuty.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HospitalDuty.Infrastructure.Repository;

public class DepartmentRepository : IDepartmentRepository
{
    private readonly HospitalDbContext _context;

    public DepartmentRepository(HospitalDbContext context)
    {
        _context = context;
    }

    public async Task<Department?> GetByIdAsync(Guid id)
    {
        //return await _context.Departments.FindAsync(id);
        return await _context.Departments
            .Include(d => d.Hospital)
            .FirstOrDefaultAsync(d => d.Id == id);
    }

    public async Task<IEnumerable<Department>> GetAllAsync()
    {
        return await _context.Departments
            .Include(d => d.Hospital)
            .ToListAsync();
    }

    public async Task<IEnumerable<Department?>> GetByHospitalAsync(Guid hospitalId)
    {
        return await _context.Departments
            .Include(d => d.Hospital)
            .Where(d => d.HospitalId == hospitalId)
            .ToListAsync();
    }

    public async Task<Department?> GetByManagerAsync(Guid managerId)
    {
        return await _context.Departments.Include(d => d.Hospital).FirstOrDefaultAsync(d => d.ManagerId == managerId);
    }

    public async Task CreateAsync(Department department)
    {
        await _context.Departments.AddAsync(department);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> UpdateAsync(Department department)
    {
        _context.Departments.Update(department);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var department = await _context.Departments.FindAsync(id);
        if (department == null) return false;

        _context.Departments.Remove(department);
        await _context.SaveChangesAsync();
        return true;
    }
}
