using Microsoft.EntityFrameworkCore;
using HospitalDuty.Domain.Entities;
using HospitalDuty.Domain.Enums;

namespace HospitalDuty.Infrastructure.Persistence
{
    public static class SeedData
    {
        public static void Seed(this ModelBuilder modelBuilder)
        {
            // Sabit Guid'ler tanımla
            var hospital1Id = new Guid("11111111-1111-1111-1111-111111111111");
            var hospital2Id = new Guid("22222222-2222-2222-2222-222222222222");
            var hospital3Id = new Guid("33333333-3333-3333-3333-333333333333");
            var hospital4Id = new Guid("44444444-4444-4444-4444-444444444444");

            var dept1Id = new Guid("d1111111-1111-1111-1111-111111111111");
            var dept2Id = new Guid("d2222222-2222-2222-2222-222222222222");
            var dept3Id = new Guid("d3333333-3333-3333-3333-333333333333");
            var dept4Id = new Guid("d4444444-4444-4444-4444-444444444444");

            var emp1Id = new Guid("e1111111-1111-1111-1111-111111111111");
            var emp2Id = new Guid("e2222222-2222-2222-2222-222222222222");
            var emp3Id = new Guid("e3333333-3333-3333-3333-333333333333");
            var emp4Id = new Guid("e4444444-4444-4444-4444-444444444444");

            // Hospital seed data (DirectorId'siz - döngüyü kırmak için)
            var hospitals = new[]
            {
                new Hospital
                {
                    Id = hospital1Id,
                    Name = "Ankara Şehir Hastanesi",
                    Phone = "0312-552-6000",
                    District = "Çankaya",
                    City = "Ankara",
                    Address = "Üniversiteler Mahallesi, Bilkent Blv. No:1",
                    Email = "info@ankarashehir.saglik.gov.tr",
                    Website = "www.ankarashehir.saglik.gov.tr"
                },
                new Hospital
                {
                    Id = hospital2Id,
                    Name = "Hacettepe Üniversitesi Hastanesi",
                    Phone = "0312-305-1010",
                    District = "Altındağ",
                    City = "Ankara",
                    Address = "Sıhhiye Kampüsü",
                    Email = "info@hacettepe.edu.tr",
                    Website = "www.hastaneler.hacettepe.edu.tr"
                },
                new Hospital
                {
                    Id = hospital3Id,
                    Name = "Gazi Üniversitesi Hastanesi",
                    Phone = "0312-202-5252",
                    District = "Yenimahalle",
                    City = "Ankara",
                    Address = "Emniyet Mahallesi, Muammer Yaşar Bostancı Cad.",
                    Email = "info@gazi.edu.tr",
                    Website = "www.tip.gazi.edu.tr"
                },
                new Hospital
                {
                    Id = hospital4Id,
                    Name = "Ankara Numune Hastanesi",
                    Phone = "0312-508-4000",
                    District = "Altındağ",
                    City = "Ankara",
                    Address = "Talatpaşa Bulvarı No:44",
                    Email = "info@numune.saglik.gov.tr",
                    Website = "www.numune.saglik.gov.tr"
                }
            };

            // Department seed data (ManagerId'siz - döngüyü kırmak için)
            var departments = new[]
            {
                new Department
                {
                    Id = dept1Id,
                    Name = "Acil Servis",
                    HospitalId = hospital1Id
                },
                new Department
                {
                    Id = dept2Id,
                    Name = "Kardiyoloji",
                    HospitalId = hospital1Id
                },
                new Department
                {
                    Id = dept3Id,
                    Name = "Nöroloji",
                    HospitalId = hospital2Id
                },
                new Department
                {
                    Id = dept4Id,
                    Name = "Ortopedi",
                    HospitalId = hospital2Id
                }
            };

            // Employee seed data
            var employees = new[]
            {
                new Employee
                {
                    Id = emp1Id,
                    FirstName = "Mehmet",
                    LastName = "Yılmaz",
                    Email = "mehmet.yilmaz@ankarashehir.gov.tr",
                    PhoneNumber = "0532-111-1111",
                    ProfileImage = "mehmet.jpg",
                    Role = Role.Doctor,
                    DepartmentId = dept1Id,
                    HospitalId = hospital1Id
                },
                new Employee
                {
                    Id = emp2Id,
                    FirstName = "Ayşe",
                    LastName = "Kaya",
                    Email = "ayse.kaya@ankarashehir.gov.tr",
                    PhoneNumber = "0532-222-2222",
                    ProfileImage = "ayse.jpg",
                    Role = Role.Doctor,
                    DepartmentId = dept2Id,
                    HospitalId = hospital1Id
                },
                new Employee
                {
                    Id = emp3Id,
                    FirstName = "Fatma",
                    LastName = "Şahin",
                    Email = "fatma.sahin@hacettepe.edu.tr",
                    PhoneNumber = "0532-333-3333",
                    ProfileImage = "fatma.jpg",
                    Role = Role.Doctor,
                    DepartmentId = dept3Id,
                    HospitalId = hospital2Id
                },
                new Employee
                {
                    Id = emp4Id,
                    FirstName = "Ali",
                    LastName = "Demir",
                    Email = "ali.demir@hacettepe.edu.tr",
                    PhoneNumber = "0532-444-4444",
                    ProfileImage = "ali.jpg",
                    Role = Role.Doctor,
                    DepartmentId = dept4Id,
                    HospitalId = hospital2Id
                }
            };

            // Shift seed data
            var baseDate = new DateTime(2025, 1, 1);
            var shifts = new[]
            {
                new Shift
                {
                    Id = 1,
                    DepartmentId = dept1Id,
                    EmployeeId = emp1Id,
                    HospitalId = hospital1Id,
                    StartTime = baseDate.AddHours(8),
                    EndTime = baseDate.AddHours(16),
                    ShiftType = ShiftType.Normal,
                    Notes = "Gündüz vardiyası"
                },
                new Shift
                {
                    Id = 2,
                    DepartmentId = dept2Id,
                    EmployeeId = emp2Id,
                    HospitalId = hospital1Id,
                    StartTime = baseDate.AddHours(16),
                    EndTime = baseDate.AddDays(1),
                    ShiftType = ShiftType.Emergency,
                    Notes = "Akşam vardiyası"
                },
                new Shift
                {
                    Id = 3,
                    DepartmentId = dept3Id,
                    EmployeeId = emp3Id,
                    HospitalId = hospital2Id,
                    StartTime = baseDate,
                    EndTime = baseDate.AddHours(8),
                    ShiftType = ShiftType.Night,
                    Notes = "Gece vardiyası"
                },
                new Shift
                {
                    Id = 4,
                    DepartmentId = dept4Id,
                    EmployeeId = emp4Id,
                    HospitalId = hospital2Id,
                    StartTime = baseDate.AddDays(1).AddHours(8),
                    EndTime = baseDate.AddDays(1).AddHours(20),
                    ShiftType = ShiftType.Night,
                    Notes = "Nöbet vardiyası"
                }
            };

            // Seed data'yı model builder'a ekle
            modelBuilder.Entity<Hospital>().HasData(hospitals);
            modelBuilder.Entity<Department>().HasData(departments);
            modelBuilder.Entity<Employee>().HasData(employees);
            modelBuilder.Entity<Shift>().HasData(shifts);
        }
    }
}