using HospitalDuty.Domain.Entities;
using HospitalDuty.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HospitalDuty.Application.Abstractions
{
    public interface IEmployeeRepository
    {
        Task<IEnumerable<Employee>> GetAllAsync();
        Task<Employee?> GetByIdAsync(Guid id);
        Task<IEnumerable<Employee>> GetByDepartmentAsync(Guid departmentId);
        Task<IEnumerable<Employee>> GetByRoleAsync(Role role);
        Task<bool> DeleteAsync(Guid id);
        Task<bool> CreateAsync(Employee employee);
        Task<bool> UpdateAsync(Employee employee);
    }
}
