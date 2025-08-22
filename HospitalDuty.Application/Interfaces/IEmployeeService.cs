using HospitalDuty.Application.DTOs.Employee;
using HospitalDuty.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HospitalDuty.Application.Interfaces
{
    public interface IEmployeeService
    {
        Task<IEnumerable<EmployeeDto>> GetAllAsync();
        Task<EmployeeDto?> GetByIdAsync(Guid id);
        Task<bool> DeleteAsync(Guid id);
    }
}