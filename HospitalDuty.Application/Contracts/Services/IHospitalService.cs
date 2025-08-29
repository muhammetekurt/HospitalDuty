using HospitalDuty.Application.DTOs.EmployeeDTOs;
using HospitalDuty.Application.DTOs.HospitalDTOs;
using HospitalDuty.Domain.Entities;
using HospitalDuty.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace HospitalDuty.Application.Contracts.Services;

public interface IHospitalService
{
        Task<HospitalDto?> GetByIdAsync(Guid id);
        Task<IEnumerable<HospitalDto>> GetAllAsync();
        Task<HospitalDto?> GetByDirectorAsync(Guid directorId);
        Task<CreateHospitalDto> CreateAsync(CreateHospitalDto hospitalDto);
        Task<bool> UpdateAsync(Guid id, UpdateHospitalDto hospitalDto);
        Task<bool> DeleteAsync(Guid id);
}
