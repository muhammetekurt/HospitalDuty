using System;
using HospitalDuty.Application.DTOs.DepartmentDTOs;
using HospitalDuty.Application.DTOs.EmployeeDTOs;

namespace HospitalDuty.Application.Contracts.Services;

public interface IDepartmentService
{
    Task<DepartmentDto?> GetByIdAsync(Guid id);
    Task<IEnumerable<DepartmentDto>> GetAllAsync();
    Task<IEnumerable<DepartmentDto?>> GetByHospitalAsync(Guid hospitalId);
    Task<DepartmentDto?> GetByManagerAsync(Guid managerId);
    Task<EmployeeDto?> GetManagerByDepartmentIdAsync(Guid departmentId);
    Task<DepartmentDto> CreateAsync(CreateDepartmentDto departmentDto);
    Task<bool> UpdateAsync(Guid id, UpdateDepartmentDto departmentDto);
    Task<bool> DeleteAsync(Guid id);
}
