using AutoMapper;
using HospitalDuty.Application.Abstractions;
using HospitalDuty.Application.DTOs.Employee;
using HospitalDuty.Application.Interfaces;
using HospitalDuty.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HospitalDuty.Application.Services
{
    public class EmployeeService : IEmployeeService
    {
        private readonly IEmployeeRepository _context;
        private readonly IMapper _mapper;
        public EmployeeService(IEmployeeRepository context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<IEnumerable<EmployeeDto>> GetAllAsync()
        {
            var employees = await _context.GetAllAsync();
            return _mapper.Map<IEnumerable<EmployeeDto>>(employees);
        }

        public async Task<EmployeeDto?> GetByIdAsync(Guid id)
        {
            var employee = await _context.GetByIdAsync(id);
            return employee is null ? null : _mapper.Map<EmployeeDto>(employee);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            return await _context.DeleteAsync(id);
        }
    }
}
