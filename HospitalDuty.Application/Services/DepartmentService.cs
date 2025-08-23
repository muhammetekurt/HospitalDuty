using System;
using AutoMapper;
using HospitalDuty.Application.Abstractions;
using HospitalDuty.Application.DTOs.DepartmentDTOs;
using HospitalDuty.Application.Interfaces;
using HospitalDuty.Domain.Entities;

namespace HospitalDuty.Application.Services;

public class DepartmentService : IDepartmentService
{
    private readonly IDepartmentRepository _context;
    private readonly IMapper _mapper;
    public DepartmentService(IDepartmentRepository context, IMapper mapper)
    {
        _context = context;
        _mapper = mapper;
    }

    public async Task<DepartmentDto?> GetByIdAsync(Guid id)
    {
        var department = await _context.GetByIdAsync(id);
        return department == null ? null : _mapper.Map<DepartmentDto>(department);
    }
    public async Task<IEnumerable<DepartmentDto>> GetAllAsync()
    {
        var departments = await _context.GetAllAsync();
        return _mapper.Map<IEnumerable<DepartmentDto>>(departments);
    }

    public async Task<IEnumerable<DepartmentDto?>> GetByHospitalAsync(Guid hospitalId)
    {
        var departments = await _context.GetByHospitalAsync(hospitalId);
        return _mapper.Map<IEnumerable<DepartmentDto?>>(departments);
    }

    public async Task<DepartmentDto?> GetByManagerAsync(Guid managerId)
    {
        var department = await _context.GetByManagerAsync(managerId);
        return department == null ? null : _mapper.Map<DepartmentDto>(department);
    }

    public async Task<DepartmentDto> CreateAsync(CreateDepartmentDto departmentDto)
    {
        var department = _mapper.Map<Department>(departmentDto);
        await _context.CreateAsync(department);
        return _mapper.Map<DepartmentDto>(department);
    }

    public async Task<bool> UpdateAsync(Guid id, UpdateDepartmentDto departmentDto)
    {
        var existingDepartment = await _context.GetByIdAsync(id);
        if (existingDepartment == null) return false;

        _mapper.Map(departmentDto, existingDepartment);
        var result = await _context.UpdateAsync(existingDepartment);
        return result;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        return await _context.DeleteAsync(id);
    }
}
