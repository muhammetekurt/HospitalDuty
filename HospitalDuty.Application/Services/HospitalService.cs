
using System;
using AutoMapper;
using HospitalDuty.Application.Abstractions;
using HospitalDuty.Application.DTOs.HospitalDTOs;
using HospitalDuty.Application.Interfaces;
using HospitalDuty.Domain.Entities;

namespace HospitalDuty.Application.Services;

public class HospitalService : IHospitalService
{

    private readonly IHospitalRepository _hospitalRepository;
    private readonly IMapper _mapper;

    public HospitalService(IHospitalRepository hospitalRepository, IMapper mapper)
    {
        _hospitalRepository = hospitalRepository;
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
        return await _hospitalRepository.DeleteAsync(id);
    }

}
