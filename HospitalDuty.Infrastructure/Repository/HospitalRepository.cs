using System;
using HospitalDuty.Application.Abstractions;
using HospitalDuty.Domain.Entities;
using HospitalDuty.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace HospitalDuty.Infrastructure.Repository;

public class HospitalRepository : IHospitalRepository
{
    private readonly HospitalDbContext _dbContext;

    public HospitalRepository(HospitalDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Hospital?> GetByIdAsync(Guid id)
    {
        return await _dbContext.Hospitals.FindAsync(id);
    }

    public async Task<IEnumerable<Hospital>> GetAllAsync()
    {
        return await _dbContext.Hospitals.ToListAsync();
    }

    public async Task<Hospital?> GetByDirectorAsync(Guid directorId)
    {
        return await _dbContext.Hospitals.FirstOrDefaultAsync(h => h.DirectorId == directorId);
    }

    public async Task CreateAsync(Hospital hospital)
    {
        await _dbContext.Hospitals.AddAsync(hospital);
        await _dbContext.SaveChangesAsync();
    }

    public async Task<bool> UpdateAsync(Hospital hospital)
    {
        _dbContext.Hospitals.Update(hospital);
        await _dbContext.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        var hospital = await GetByIdAsync(id);
        if (hospital == null) return false;

        _dbContext.Hospitals.Remove(hospital);
        return await _dbContext.SaveChangesAsync() > 0;
    }

}
