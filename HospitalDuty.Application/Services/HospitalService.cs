
using System;
using AutoMapper;
using HospitalDuty.Application.Contracts.Persistence;
using HospitalDuty.Application.DTOs.HospitalDTOs;
using HospitalDuty.Application.Contracts.Services;
using HospitalDuty.Domain.Entities;

namespace HospitalDuty.Application.Services;

public class HospitalService : IHospitalService
{

    private readonly IHospitalRepository _hospitalRepository;
    private readonly IDepartmentRepository _departmentRepository;
    private readonly IEmployeeService _employeeService;

    private readonly IMapper _mapper;

    public HospitalService(IHospitalRepository hospitalRepository, IDepartmentRepository departmentRepository, IEmployeeService employeeService, IMapper mapper)
    {
        _hospitalRepository = hospitalRepository;
        _departmentRepository = departmentRepository;
        _employeeService = employeeService;
        _mapper = mapper;
    }

    public async Task<HospitalDto?> GetByIdAsync(Guid id)
    {
        var hospital = await _hospitalRepository.GetByIdAsync(id);
        if (hospital == null) return null;
        return _mapper.Map<HospitalDto>(hospital);
    }

    public async Task<IEnumerable<HospitalDto>> GetAllAsync()
    {
        var hospitals = await _hospitalRepository.GetAllAsync();
        return _mapper.Map<IEnumerable<HospitalDto>>(hospitals);
    }

    public async Task<HospitalDto?> GetByDirectorAsync(Guid directorId)
    {
        var hospital = await _hospitalRepository.GetByDirectorAsync(directorId);
        if (hospital == null) return null;
        return _mapper.Map<HospitalDto>(hospital);
    }

    public async Task<CreateHospitalDto> CreateAsync(CreateHospitalDto hospitalDto)
    {
        var hospital = _mapper.Map<Hospital>(hospitalDto);
        await _hospitalRepository.CreateAsync(hospital);
        return _mapper.Map<CreateHospitalDto>(hospital);
    }

    public async Task<bool> UpdateAsync(Guid id, UpdateHospitalDto hospitalDto)
    {
        var existingHospital = await _hospitalRepository.GetByIdAsync(id);

        if (existingHospital == null)
            return false;

        _mapper.Map(hospitalDto, existingHospital);
        return await _hospitalRepository.UpdateAsync(existingHospital);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {

        var employees = await _employeeService.GetAllAsync();
        var hospitalEmployees = employees.Where(e => e.HospitalId == id).ToList();
        foreach (var emp in hospitalEmployees)
        {
            await _employeeService.DeleteAsync(emp.Id); // IdentityUser’ı da siler
        }

        // 2️⃣ Hospital’a bağlı tüm Department’ları al ve sil
        var departments = await _departmentRepository.GetByHospitalAsync(id);
        foreach (var dept in departments)
        {
            await _departmentRepository.DeleteAsync(dept.Id);
        }

        // 3️⃣ Hospital’u sil
        return await _hospitalRepository.DeleteAsync(id);

        //return await _hospitalRepository.DeleteAsync(id);
    }

}
