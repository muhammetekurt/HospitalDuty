using HospitalDuty.Domain.Entities;
using HospitalDuty.Domain.Enums;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace HospitalDuty.Infrastructure.Persistence;

public class HospitalDbContext : IdentityDbContext<ApplicationUser>
{
    public HospitalDbContext(DbContextOptions<HospitalDbContext> options)
        : base(options) { }

    public DbSet<Hospital> Hospitals => Set<Hospital>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Employee> Employees => Set<Employee>();
    public DbSet<Shift> Shifts => Set<Shift>();
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<Hospital>()
            .HasOne(h => h.Director)
            .WithMany()
            .HasForeignKey(h => h.DirectorId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Employee>()
            .HasOne(e => e.Department)
            .WithMany(d => d.Employees)
            .HasForeignKey(e => e.DepartmentId);

        modelBuilder.Entity<Department>()
            .HasOne(d => d.Manager)
            .WithMany()
            .HasForeignKey(d => d.ManagerId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Employee>()
            .HasOne(e => e.Hospital)
            .WithMany(h => h.Employees)
            .HasForeignKey(e => e.HospitalId);

        modelBuilder.Entity<Shift>()
            .HasOne(s => s.Hospital)
            .WithMany(h => h.Shifts)
            .HasForeignKey(s => s.HospitalId);

        modelBuilder.Entity<Shift>()
            .HasOne(s => s.Employee)
            .WithMany(e => e.Shifts)
            .HasForeignKey(s => s.EmployeeId);

        modelBuilder.Entity<Shift>()
            .HasOne(s => s.Department)
            .WithMany(d => d.Shifts)
            .HasForeignKey(s => s.DepartmentId);

        //modelBuilder.Seed();
    }
}
