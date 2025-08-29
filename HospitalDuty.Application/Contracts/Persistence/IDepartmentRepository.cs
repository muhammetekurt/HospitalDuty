using System;
using HospitalDuty.Domain.Entities;

namespace HospitalDuty.Application.Contracts.Persistence;

public interface IDepartmentRepository
{
    Task<Department?> GetByIdAsync(Guid id);
    Task<IEnumerable<Department>> GetAllAsync();
    Task<IEnumerable<Department?>> GetByHospitalAsync(Guid hospitalId);
    Task<Department?> GetByManagerAsync(Guid managerId);
    Task CreateAsync(Department department);
    Task<bool> UpdateAsync(Department department);
    Task<bool> DeleteAsync(Guid id);
}
