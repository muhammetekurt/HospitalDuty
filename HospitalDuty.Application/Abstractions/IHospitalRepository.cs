using System;
using HospitalDuty.Domain.Entities;
using HospitalDuty.Domain.Enums;

namespace HospitalDuty.Application.Abstractions;

public interface IHospitalRepository
{
    Task<IEnumerable<Hospital>> GetAllAsync();
    Task<Hospital?> GetByIdAsync(Guid id);
    Task<Hospital?> GetByDirectorAsync(Guid directorId);
    Task CreateAsync(Hospital hospital);
    Task<bool> UpdateAsync(Hospital hospital);
    Task<bool> DeleteAsync(Guid id);
}
