using HospitalDuty.Domain.Entities;
using HospitalDuty.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace HospitalDuty.Infrastructure.Persistence;

public class HospitalDbContext : DbContext
{
    public HospitalDbContext(DbContextOptions<HospitalDbContext> options) 
        : base(options) { }

    public DbSet<Hospital> Hospitals => Set<Hospital>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Shift> Shifts => Set<Shift>();

}
