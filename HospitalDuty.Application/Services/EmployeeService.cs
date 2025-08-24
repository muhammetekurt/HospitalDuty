using AutoMapper;
using HospitalDuty.Application.Abstractions;
using HospitalDuty.Application.DTOs.EmployeeDTOs;
using HospitalDuty.Application.Interfaces;
using HospitalDuty.Domain.Entities;
using HospitalDuty.Domain.Enums;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HospitalDuty.Application.Services
{
    public class EmployeeService : IEmployeeService
    {
        private readonly IEmployeeRepository _context;
        private readonly IMapper _mapper;
        private readonly UserManager<ApplicationUser> _userManager;

        public EmployeeService(IEmployeeRepository context, IMapper mapper, UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _mapper = mapper;
            _userManager = userManager;
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

        public async Task<EmployeeDto?> UpdateAsync(Guid id, UpdateEmployeeDto dto)
        {
            var employee = await _context.GetByIdAsync(id);
            if (employee == null) return null;

            // Employee entity alanlarını güncelle
            employee.FirstName = dto.FirstName;
            employee.LastName = dto.LastName;
            employee.DepartmentId = dto.DepartmentId;
            employee.HospitalId = dto.HospitalId;

            await _context.UpdateAsync(employee);

            // IdentityUser güncelle
            if (!string.IsNullOrEmpty(employee.ApplicationUserId))
            {
                var user = await _userManager.FindByIdAsync(employee.ApplicationUserId);
                if (user != null)
                {
                    if (!string.IsNullOrEmpty(dto.Email)) user.Email = dto.Email;
                    if (!string.IsNullOrEmpty(dto.Email)) user.Email = dto.Email;
                    if (!string.IsNullOrEmpty(dto.FirstName) && !string.IsNullOrEmpty(dto.LastName)) user.FullName = $"{dto.FirstName} {dto.LastName}";
                    if (!string.IsNullOrEmpty(dto.PhoneNumber)) user.PhoneNumber = dto.PhoneNumber;
                    await _userManager.UpdateAsync(user);

                    // Roller
                    if (dto.Roles != null && dto.Roles.Any())
                    {
                        var currentRoles = await _userManager.GetRolesAsync(user);
                        var rolesToRemove = currentRoles.Except(dto.Roles).ToList();
                        var rolesToAdd = dto.Roles.Except(currentRoles).ToList();

                        if (rolesToRemove.Any()) await _userManager.RemoveFromRolesAsync(user, rolesToRemove);
                        if (rolesToAdd.Any()) await _userManager.AddToRolesAsync(user, rolesToAdd);
                    }
                }
            }

            return _mapper.Map<EmployeeDto>(employee);
        }

        public async Task<bool> DeleteAsync(Guid id)
        {
            var employee = await _context.GetByIdAsync(id);
            if (employee == null) return false;

            // IdentityUser sil
            if (!string.IsNullOrEmpty(employee.ApplicationUserId))
            {
                var user = await _userManager.FindByIdAsync(employee.ApplicationUserId);
                if (user != null) await _userManager.DeleteAsync(user);
            }

            // Employee sil
            await _context.DeleteAsync(id);
            return true;
        }
    }
}
