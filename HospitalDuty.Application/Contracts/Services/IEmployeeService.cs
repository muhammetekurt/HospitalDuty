using HospitalDuty.Application.DTOs.EmployeeDTOs;
using HospitalDuty.Domain.Entities;
using HospitalDuty.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace HospitalDuty.Application.Contracts.Services
{
    public interface IEmployeeService
    {
        Task<IEnumerable<EmployeeDto>> GetAllAsync();
        Task<EmployeeDto?> GetByIdAsync(Guid id);
        Task<IEnumerable<EmployeeDto>> GetByDepartmentAsync(Guid departmentId);
        Task<IEnumerable<EmployeeDto>> GetByRoleAsync(Role role);
        Task<bool> DeleteAsync(Guid id);
        Task<EmployeeDto?> CreateAsync(CreateEmployeeDto employeeDto);
        Task<EmployeeDto?> UpdateAsync(Guid id, UpdateEmployeeDto employeeDto, ClaimsPrincipal user);
    }
}