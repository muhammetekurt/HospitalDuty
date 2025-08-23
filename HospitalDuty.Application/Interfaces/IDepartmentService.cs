using System;
using HospitalDuty.Application.DTOs.DepartmentDTOs;

namespace HospitalDuty.Application.Interfaces;

public interface IDepartmentService
{
    Task<DepartmentDto?> GetByIdAsync(Guid id);
    Task<IEnumerable<DepartmentDto>> GetAllAsync();
    Task<IEnumerable<DepartmentDto?>> GetByHospitalAsync(Guid hospitalId);
    Task<DepartmentDto?> GetByManagerAsync(Guid managerId);
    Task<DepartmentDto> CreateAsync(CreateDepartmentDto departmentDto);
    Task<bool> UpdateAsync(Guid id, UpdateDepartmentDto departmentDto);
    Task<bool> DeleteAsync(Guid id);
}
