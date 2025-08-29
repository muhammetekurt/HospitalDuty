using AutoMapper;
using HospitalDuty.Application.Contracts.Persistence;
using HospitalDuty.Application.DTOs.EmployeeDTOs;
using HospitalDuty.Application.Contracts.Services;
using HospitalDuty.Domain.Entities;
using HospitalDuty.Domain.Enums;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Security.Claims;
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
            var employeeDtos = new List<EmployeeDto>();

            foreach (var emp in employees)
            {
                employeeDtos.Add(await MapToDtoWithRoles(emp));
            }

            return employeeDtos;
        }
        public async Task<EmployeeDto?> GetByIdAsync(Guid id)
        {
            var employee = await _context.GetByIdAsync(id);
            if (employee == null) return null;

            return await MapToDtoWithRoles(employee);
        }
        public async Task<IEnumerable<EmployeeDto>> GetByDepartmentAsync(Guid departmentId)
        {
            var employees = await _context.GetByDepartmentAsync(departmentId);
            var dtos = new List<EmployeeDto>();

            foreach (var emp in employees)
            {
                dtos.Add(await MapToDtoWithRoles(emp));
            }

            return dtos;
        }
        public async Task<IEnumerable<EmployeeDto>> GetByRoleAsync(Role role)
        {
            var employees = await _context.GetByRoleAsync(role);
            var dtos = new List<EmployeeDto>();

            foreach (var emp in employees)
            {
                dtos.Add(await MapToDtoWithRoles(emp));
            }

            return dtos;
        }

        public async Task<EmployeeDto?> CreateAsync(CreateEmployeeDto employeeDto) //kullanımda değil
        {
            var employee = _mapper.Map<Employee>(employeeDto);
            await _context.CreateAsync(employee);
            return _mapper.Map<EmployeeDto>(employee);
        }

        public async Task<EmployeeDto?> UpdateAsync(Guid id, UpdateEmployeeDto dto, ClaimsPrincipal user)
        {
            var employee = await _context.GetByIdAsync(id);
            if (employee == null) return null;

            // Kullanıcı rollerini al
            var userRoles = user.Claims
                .Where(c => c.Type == ClaimTypes.Role)
                .Select(c => c.Value)
                .ToList();

            bool isPrivileged = userRoles.Contains("SystemAdmin")
                             || userRoles.Contains("HospitalDirector")
                             || userRoles.Contains("DepartmentLeader");

            // ---------------------
            // Employee update
            // ---------------------
            employee.FirstName = dto.FirstName;
            employee.LastName = dto.LastName;
            employee.Email = dto.Email;

            if (isPrivileged) // sadece admin roller department/hospital değiştirebilir
            {
                employee.DepartmentId = dto.DepartmentId;
                employee.HospitalId = dto.HospitalId;
            }

            await _context.UpdateAsync(employee);

            // ---------------------
            // Identity update
            // ---------------------
            if (!string.IsNullOrEmpty(employee.ApplicationUserId))
            {
                var appUser = await _userManager.FindByIdAsync(employee.ApplicationUserId);
                if (appUser != null)
                {
                    if (!string.IsNullOrEmpty(dto.Email)) appUser.Email = dto.Email;
                    if (!string.IsNullOrEmpty(dto.FirstName) && !string.IsNullOrEmpty(dto.LastName))
                        appUser.FullName = $"{dto.FirstName} {dto.LastName}";
                    if (!string.IsNullOrEmpty(dto.PhoneNumber)) appUser.PhoneNumber = dto.PhoneNumber;

                    await _userManager.UpdateAsync(appUser);

                    // Roller sadece admin roller tarafından değiştirilebilir
                    if (isPrivileged && dto.Roles != null && dto.Roles.Any())
                    {
                        var currentRoles = await _userManager.GetRolesAsync(appUser);
                        var rolesToRemove = currentRoles.Except(dto.Roles).ToList();
                        var rolesToAdd = dto.Roles.Except(currentRoles).ToList();

                        if (rolesToRemove.Any())
                            await _userManager.RemoveFromRolesAsync(appUser, rolesToRemove);
                        if (rolesToAdd.Any())
                            await _userManager.AddToRolesAsync(appUser, rolesToAdd);
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

        private async Task<EmployeeDto> MapToDtoWithRoles(Employee employee)
        {
            var dto = _mapper.Map<EmployeeDto>(employee);
            if (!string.IsNullOrEmpty(employee.ApplicationUserId))
            {
                var user = await _userManager.FindByIdAsync(employee.ApplicationUserId);
                if (user != null)
                {
                    dto.FullName = user.FullName;
                    dto.Email = user.Email;
                    dto.PhoneNumber = user.PhoneNumber;
                    dto.Roles = (await _userManager.GetRolesAsync(user)).ToList();
                }
            }
            dto.Department = employee.Department?.Name ?? string.Empty;
            return dto;
        }

    }
}
