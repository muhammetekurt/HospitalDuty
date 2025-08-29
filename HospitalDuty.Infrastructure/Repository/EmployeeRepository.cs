using HospitalDuty.Application.Contracts.Persistence;
using HospitalDuty.Domain.Entities;
using HospitalDuty.Domain.Enums;
using HospitalDuty.Infrastructure.Persistence;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HospitalDuty.Infrastructure.Repository
{
    public class EmployeeRepository : IEmployeeRepository
    {
        private readonly HospitalDbContext _context;
        private readonly UserManager<ApplicationUser> _userManager;

        public EmployeeRepository(HospitalDbContext context, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public async Task<IEnumerable<Employee>> GetAllAsync()
        {
            return await _context.Employees.Include(e => e.ApplicationUser).Include(e => e.Department).ToListAsync();
        }

        public async Task<Employee?> GetByIdAsync(Guid id)
        {
            return await _context.Employees.Include(e => e.ApplicationUser).Include(e => e.Department).FirstOrDefaultAsync(e => e.Id == id);
        }

        public async Task<IEnumerable<Employee>> GetByDepartmentAsync(Guid departmentId)
        {
            return await _context.Employees
                .Where(e => e.DepartmentId == departmentId).Include(e => e.ApplicationUser).Include(e => e.Department)
                .ToListAsync();
        }

        public async Task<IEnumerable<Employee>> GetByRoleAsync(Role role)
        {
            string roleName = role.ToString(); // Enum → string

            // Belirtilen roldeki IdentityUser'ları al
            var usersInRole = await _userManager.GetUsersInRoleAsync(roleName);
            var userIds = usersInRole.Select(u => u.Id).ToList();

            // Employee tablosundan ApplicationUserId ile eşleşenleri çek
            var employees = await _context.Employees
                .Include(e => e.ApplicationUser).Include(e => e.Department)
                .Where(e => e.ApplicationUserId != null && userIds.Contains(e.ApplicationUserId))
                .ToListAsync();

            return employees;
        }

        public async Task<bool> CreateAsync(Employee employee)
        {
            try
            {
                await _context.Employees.AddAsync(employee);
                await _context.SaveChangesAsync();
                return true;
            }
            catch (DbUpdateException dbEx)
            {
                // DB ile ilgili hataları yakala
                Console.WriteLine("DB Update Error: " + dbEx.Message);
                if (dbEx.InnerException != null)
                    Console.WriteLine("Inner Exception: " + dbEx.InnerException.Message);
                throw;
            }
            catch (Exception ex)
            {
                // Genel hatalar
                Console.WriteLine("General Error: " + ex.Message);
                if (ex.InnerException != null)
                    Console.WriteLine("Inner Exception: " + ex.InnerException.Message);
                throw;
            }
        }

        public async Task<bool> UpdateAsync(Employee employee)
        {
            _context.Employees.Update(employee);
            await _context.SaveChangesAsync();
            return true;
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