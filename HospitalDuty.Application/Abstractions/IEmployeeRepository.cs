using HospitalDuty.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HospitalDuty.Application.Abstractions
{
    public interface IEmployeeRepository
    {
        Task<IEnumerable<Employee>> GetAllAsync();
        Task<Employee?> GetByIdAsync(Guid id);
        Task<bool> DeleteAsync(Guid id);
    }
}
