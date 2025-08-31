using System;
using AutoMapper;
using HospitalDuty.Application.Contracts.Persistence;
using HospitalDuty.Application.DTOs.ShiftDTOs;
using HospitalDuty.Application.Contracts.Services;
using HospitalDuty.Domain.Entities;
using HospitalDuty.Domain.Enums;

namespace HospitalDuty.Application.Services;

public class ShiftService : IShiftService
{
    private readonly IShiftRepository _shiftRepository;
    private readonly IMapper _mapper;
    private readonly IEmployeeService _employeeService;
    private readonly IShiftPreferenceService _shiftPreferenceService;
    private readonly INotificationService _notificationService;
    private readonly ICurrentUserService _currentUserService;

    public ShiftService(IShiftRepository shiftRepository, IMapper mapper, IEmployeeService employeeService, IShiftPreferenceService shiftPreferenceService, INotificationService notificationService, ICurrentUserService currentUserService)
    {
        _shiftRepository = shiftRepository;
        _mapper = mapper;
        _employeeService = employeeService;
        _shiftPreferenceService = shiftPreferenceService;
        _notificationService = notificationService;
        _currentUserService = currentUserService;
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
        var creatorEmployee = await _employeeService.GetByIdAsync(Guid.Parse(_currentUserService.UserId));
        if (creatorEmployee == null) throw new Exception("Creator not found");

        // Tüm preference’ları al
        var prefs = await _shiftPreferenceService.GetPreferencesByEmployeeAndMonthAsync(
            createShiftDto.EmployeeId, createShiftDto.StartTime.Month);
        if (prefs != null && prefs.Any())
        {
            // Shift aralığını kontrol et
            var shiftDates = Enumerable.Range(0, (createShiftDto.EndTime.Date - createShiftDto.StartTime.Date).Days + 1)
                                    .Select(d => createShiftDto.StartTime.Date.AddDays(d));

            if (prefs.Any(p => shiftDates.Contains(p.Date.Date) && p.PreferenceType == PreferenceType.Unavailable))
            {
                throw new Exception("Employee is unavailable for one or more dates in the selected shift range");
            }
        }

        // Shift oluştur
        var shift = _mapper.Map<Shift>(createShiftDto);
        shift.HospitalId = creatorEmployee.HospitalId;
        shift.DepartmentId = creatorEmployee.DepartmentId;

        var createdShift = await _shiftRepository.CreateShiftAsync(shift);
        
        var employee = await _employeeService.GetByIdAsync(createShiftDto.EmployeeId);
        if (employee == null)
            throw new Exception("Assigned employee not found");

        if (string.IsNullOrEmpty(employee.Email))
            throw new Exception("Employee email is missing. Cannot send notification.");

        await _notificationService.SendShiftCreatedNotification(
            creatorEmployee.FullName,
            employee.Email,
            employee.FullName,
            createShiftDto.StartTime,
            createShiftDto.EndTime
        );
        return _mapper.Map<ShiftDto>(createdShift);
    }

    public async Task<bool> UpdateShiftAsync(int id, UpdateShiftDto updateShiftDto)
    {
        
        var existingShift = await _shiftRepository.GetShiftByIdAsync(id);
        if (existingShift == null) return false;

        if (existingShift.EmployeeId != updateShiftDto.EmployeeId)
        {
            var oldEmployee = await _employeeService.GetByIdAsync(existingShift.EmployeeId);
            await _notificationService.SendShiftCanceledNotification(_currentUserService.FullName, oldEmployee.Email, oldEmployee.FullName, existingShift.StartTime, existingShift.EndTime);

            var newEmployee = await _employeeService.GetByIdAsync(updateShiftDto.EmployeeId);
            await _notificationService.SendShiftCreatedNotification(_currentUserService.FullName, newEmployee.Email, newEmployee.FullName, existingShift.StartTime, existingShift.EndTime);
        }
        else
        {
            var employee = await _employeeService.GetByIdAsync(existingShift.EmployeeId);
            await _notificationService.SendShiftUpdatedNotification(employee.Email, employee.FullName, existingShift.StartTime, existingShift.EndTime);
        }
        _mapper.Map(updateShiftDto, existingShift);
        var result = await _shiftRepository.UpdateShiftAsync(existingShift);

        return result;
    }
    public async Task<bool> DeleteShiftAsync(int id)
    {
        return await _shiftRepository.DeleteShiftAsync(id);
    }
}