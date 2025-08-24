using AutoMapper;
using HospitalDuty.Application.Abstractions;
using HospitalDuty.Application.DTOs.EmployeeDTOs;
using HospitalDuty.Application.Interfaces;
using HospitalDuty.Domain.Entities;
using HospitalDuty.Domain.Enums;
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

        public async Task<IEnumerable<EmployeeDto>> GetByDepartmentAsync(Guid departmentId)
        {
            var employees = await _context.GetByDepartmentAsync(departmentId);
            return _mapper.Map<IEnumerable<EmployeeDto>>(employees);
        }

        // public async Task<IEnumerable<EmployeeDto>> GetByRoleAsync(Role role)
        // {
        //     var employees = await _context.GetByRoleAsync(role);
        //     return _mapper.Map<IEnumerable<EmployeeDto>>(employees);
        // }

        public async Task<EmployeeDto?> CreateAsync(CreateEmployeeDto employeeDto)
        {
            var employee = _mapper.Map<Employee>(employeeDto);
            await _context.CreateAsync(employee);
            return _mapper.Map<EmployeeDto>(employee);
        }

        public async Task<EmployeeDto?> UpdateAsync(Guid id, UpdateEmployeeDto employeeDto)
        {
            var existingEmployee = await _context.GetByIdAsync(id);
            
            if (existingEmployee == null) return null;
                
            _mapper.Map(employeeDto, existingEmployee);
            var result = await _context.UpdateAsync(existingEmployee);
            return result ? _mapper.Map<EmployeeDto>(existingEmployee) : null;
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            return await _context.DeleteAsync(id);
        }
    }
}
