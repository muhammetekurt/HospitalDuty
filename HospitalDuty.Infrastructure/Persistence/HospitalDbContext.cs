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
    public DbSet<ShiftPreference> ShiftPreference => Set<ShiftPreference>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<Hospital>()
                .HasMany(h => h.Departments)
                .WithOne(d => d.Hospital)
                .HasForeignKey(d => d.HospitalId)
                .OnDelete(DeleteBehavior.Cascade);

        // -------------------------
        // Hospital → Employees (1-N)
        // -------------------------
        modelBuilder.Entity<Hospital>()
            .HasMany(h => h.Employees)
            .WithOne(e => e.Hospital)
            .HasForeignKey(e => e.HospitalId)
            .OnDelete(DeleteBehavior.Cascade);

        // -------------------------
        // Hospital → Director (1-1 nullable)
        // (Director zaten bir Employee, silinince cascade ile gidecek.
        // Bu yüzden FK'de SetNull diyoruz, problem çıkmasın.)
        // -------------------------
        modelBuilder.Entity<Hospital>()
            .HasOne(h => h.Director)
            .WithMany()
            .HasForeignKey(h => h.DirectorId)
            .OnDelete(DeleteBehavior.SetNull);

        // -------------------------
        // Department → Employees (1-N)
        // -------------------------
        modelBuilder.Entity<Department>()
            .HasMany(d => d.Employees)
            .WithOne(e => e.Department)
            .HasForeignKey(e => e.DepartmentId)
            .OnDelete(DeleteBehavior.Cascade);

        // -------------------------
        // Department → Manager (1-1 nullable)
        // (Manager da Employee, silinince cascade ile gider.
        // O yüzden SetNull yapıyoruz.)
        // -------------------------
        modelBuilder.Entity<Department>()
            .HasOne(d => d.Manager)
            .WithMany()
            .HasForeignKey(d => d.ManagerId)
            .OnDelete(DeleteBehavior.SetNull);

        // -------------------------
        // Employee → Shifts (1-N)
        // -------------------------
        modelBuilder.Entity<Employee>()
            .HasMany(e => e.Shifts)
            .WithOne(s => s.Employee)
            .HasForeignKey(s => s.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        // -------------------------
        // Employee → ShiftPreferences (1-N)
        // -------------------------
        modelBuilder.Entity<Employee>()
            .HasMany(e => e.ShiftPreferences)
            .WithOne(sp => sp.Employee)
            .HasForeignKey(sp => sp.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        //modelBuilder.Seed();
    }
}
