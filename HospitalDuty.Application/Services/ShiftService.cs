using System;
using AutoMapper;
using HospitalDuty.Application.Abstractions;
using HospitalDuty.Application.DTOs.ShiftDTOs;
using HospitalDuty.Application.Interfaces;
using HospitalDuty.Domain.Entities;

namespace HospitalDuty.Application.Services;

public class ShiftService : IShiftService
{
    private readonly IShiftRepository _shiftRepository;
    private readonly IMapper _mapper;

    public ShiftService(IShiftRepository shiftRepository, IMapper mapper)
    {
        _shiftRepository = shiftRepository;
        _mapper = mapper;
    }

    public async Task<ShiftDto> GetShiftByIdAsync(int id)
    {
        var shift = await _shiftRepository.GetShiftByIdAsync(id);
        return _mapper.Map<ShiftDto>(shift);
    }

    public async Task<IEnumerable<ShiftDto>> GetAllShiftsAsync()
    {
        var shifts = await _shiftRepository.GetAllShiftsAsync();
        return _mapper.Map<IEnumerable<ShiftDto>>(shifts);
    }

    public async Task<IEnumerable<ShiftDto>> GetShiftByDateRangeAsync(DateTime startDate, DateTime endDate)
    {
        var shifts = await _shiftRepository.GetShiftByDateRangeAsync(startDate, endDate);
        return _mapper.Map<IEnumerable<ShiftDto>>(shifts);
    }

    public async Task<IEnumerable<ShiftDto>> GetShiftByDateAsync(DateTime date)
    {
        var shifts = await _shiftRepository.GetShiftByDateAsync(date);
        return _mapper.Map<IEnumerable<ShiftDto>>(shifts);
    }

    public async Task<IEnumerable<ShiftDto>> GetShiftByEmployeeIdAsync(Guid employeeId)
    {
        var shifts = await _shiftRepository.GetShiftByEmployeeIdAsync(employeeId);
        return _mapper.Map<IEnumerable<ShiftDto>>(shifts);
    }

    public async Task<IEnumerable<ShiftDto>> GetShiftByDepartmentIdAsync(Guid departmentId)
    {
        var shifts = await _shiftRepository.GetShiftByDepartmentIdAsync(departmentId);
        return _mapper.Map<IEnumerable<ShiftDto>>(shifts);
    }
    public async Task<IEnumerable<ShiftDto>> GetShiftByHospitalIdAsync(Guid hospitalId)
    {
        var shifts = await _shiftRepository.GetShiftByHospitalIdAsync(hospitalId);
        return _mapper.Map<IEnumerable<ShiftDto>>(shifts);
    }

    public async Task<ShiftDto> CreateShiftAsync(CreateShiftDto createShiftDto)
    {
        var shift = _mapper.Map<Shift>(createShiftDto);
        var createdShift = await _shiftRepository.CreateShiftAsync(shift);
        return _mapper.Map<ShiftDto>(createdShift);
    }

    public async Task<bool> UpdateShiftAsync(int id, UpdateShiftDto updateShiftDto)
    {
        var existingShift = await _shiftRepository.GetShiftByIdAsync(id);
        if (existingShift == null) return false;

        _mapper.Map(updateShiftDto, existingShift);
        var result = await _shiftRepository.UpdateShiftAsync(existingShift);
        return result;
    }

    public async Task<bool> DeleteShiftAsync(int id)
    {
        return await _shiftRepository.DeleteShiftAsync(id);
    }
}
