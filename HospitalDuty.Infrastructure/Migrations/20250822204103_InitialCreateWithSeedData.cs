using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace HospitalDuty.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreateWithSeedData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Hospitals",
                columns: new[] { "Id", "Address", "City", "DirectorId", "District", "Email", "Name", "Phone", "Website" },
                values: new object[] { new Guid("2cdc5e58-fd44-4f8c-bbd4-fc19e91b3cfc"), "Üniversiteler Mahallesi Bilkent Bulvarı", "Ankara", new Guid("1c25eb38-fdd7-4e1e-a22a-cdbd89833f45"), "Çankaya", "info@ankarashehir.gov.tr", "Ankara Şehir Hastanesi", "0312 123 45 67", "www.ankarashehir.gov.tr" });

            migrationBuilder.InsertData(
                table: "Departments",
                columns: new[] { "Id", "HospitalId", "ManagerId", "Name" },
                values: new object[,]
                {
                    { new Guid("409f37a0-622d-4e9c-a92a-320ccbf98ca8"), new Guid("2cdc5e58-fd44-4f8c-bbd4-fc19e91b3cfc"), new Guid("f2390eea-b584-4cb5-8f07-edab98aa1673"), "Acil Servis" },
                    { new Guid("91fdcfdb-8868-4ed1-a80b-672d3e7e1a19"), new Guid("2cdc5e58-fd44-4f8c-bbd4-fc19e91b3cfc"), new Guid("bc985e6b-274b-4928-996b-f4bfa0063dbe"), "Genel Cerrahi" },
                    { new Guid("946abea1-0c11-4f0e-9d2d-22d7967b894a"), new Guid("2cdc5e58-fd44-4f8c-bbd4-fc19e91b3cfc"), new Guid("699f05d0-376b-4110-b628-59cab733e7e8"), "Dahiliye" }
                });

            migrationBuilder.InsertData(
                table: "Employees",
                columns: new[] { "Id", "DepartmentId", "Email", "FirstName", "LastName", "PhoneNumber", "ProfileImage", "Role" },
                values: new object[,]
                {
                    { new Guid("120cff6b-7ec0-4ff9-acd5-691820056ce7"), new Guid("409f37a0-622d-4e9c-a92a-320ccbf98ca8"), "zeynep.arslan@ankarashehir.gov.tr", "Zeynep", "Arslan", "0532 666 66 66", "", 4 },
                    { new Guid("1c25eb38-fdd7-4e1e-a22a-cdbd89833f45"), new Guid("409f37a0-622d-4e9c-a92a-320ccbf98ca8"), "mehmet.ozkan@ankarashehir.gov.tr", "Mehmet", "Özkan", "0532 111 11 11", "", 0 },
                    { new Guid("1f7e7409-8ae0-4b35-8b1a-ef906f0a31c8"), new Guid("91fdcfdb-8868-4ed1-a80b-672d3e7e1a19"), "selin.aktas@ankarashehir.gov.tr", "Selin", "Aktaş", "0532 888 88 88", "", 4 },
                    { new Guid("699f05d0-376b-4110-b628-59cab733e7e8"), new Guid("946abea1-0c11-4f0e-9d2d-22d7967b894a"), "ali.yilmaz@ankarashehir.gov.tr", "Ali", "Yılmaz", "0532 333 33 33", "", 1 },
                    { new Guid("8dd89b10-5b55-4be4-8dd8-1d488a85aa60"), new Guid("409f37a0-622d-4e9c-a92a-320ccbf98ca8"), "mustafa.celik@ankarashehir.gov.tr", "Mustafa", "Çelik", "0532 555 55 55", "", 4 },
                    { new Guid("bc985e6b-274b-4928-996b-f4bfa0063dbe"), new Guid("91fdcfdb-8868-4ed1-a80b-672d3e7e1a19"), "fatma.kaya@ankarashehir.gov.tr", "Fatma", "Kaya", "0532 444 44 44", "", 1 },
                    { new Guid("d80a56b0-1bef-425d-a5fa-93cd96bcffb5"), new Guid("946abea1-0c11-4f0e-9d2d-22d7967b894a"), "can.guven@ankarashehir.gov.tr", "Can", "Güven", "0532 777 77 77", "", 4 },
                    { new Guid("f2390eea-b584-4cb5-8f07-edab98aa1673"), new Guid("409f37a0-622d-4e9c-a92a-320ccbf98ca8"), "ayse.demir@ankarashehir.gov.tr", "Ayşe", "Demir", "0532 222 22 22", "", 1 }
                });

            migrationBuilder.InsertData(
                table: "Shifts",
                columns: new[] { "Id", "DepartmentId", "EmployeeId", "EndTime", "Notes", "ShiftType", "StartTime" },
                values: new object[,]
                {
                    { new Guid("71dbe74d-0c45-492e-886f-d3a9ff0e1064"), new Guid("409f37a0-622d-4e9c-a92a-320ccbf98ca8"), new Guid("1c25eb38-fdd7-4e1e-a22a-cdbd89833f45"), new DateTime(2025, 8, 23, 8, 0, 0, 0, DateTimeKind.Local), "Gece vardiyası", 2, new DateTime(2025, 8, 22, 16, 0, 0, 0, DateTimeKind.Local) },
                    { new Guid("8f44f9dc-a942-4354-8106-c8c949dbac9e"), new Guid("946abea1-0c11-4f0e-9d2d-22d7967b894a"), new Guid("699f05d0-376b-4110-b628-59cab733e7e8"), new DateTime(2025, 8, 22, 17, 0, 0, 0, DateTimeKind.Local), "Günlük mesai", 0, new DateTime(2025, 8, 22, 9, 0, 0, 0, DateTimeKind.Local) },
                    { new Guid("e3780220-9be9-4afb-8ca9-92ab42fc9435"), new Guid("409f37a0-622d-4e9c-a92a-320ccbf98ca8"), new Guid("f2390eea-b584-4cb5-8f07-edab98aa1673"), new DateTime(2025, 8, 22, 16, 0, 0, 0, DateTimeKind.Local), "Sabah vardiyası", 1, new DateTime(2025, 8, 22, 8, 0, 0, 0, DateTimeKind.Local) }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: new Guid("120cff6b-7ec0-4ff9-acd5-691820056ce7"));

            migrationBuilder.DeleteData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: new Guid("1f7e7409-8ae0-4b35-8b1a-ef906f0a31c8"));

            migrationBuilder.DeleteData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: new Guid("8dd89b10-5b55-4be4-8dd8-1d488a85aa60"));

            migrationBuilder.DeleteData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: new Guid("bc985e6b-274b-4928-996b-f4bfa0063dbe"));

            migrationBuilder.DeleteData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: new Guid("d80a56b0-1bef-425d-a5fa-93cd96bcffb5"));

            migrationBuilder.DeleteData(
                table: "Shifts",
                keyColumn: "Id",
                keyValue: new Guid("71dbe74d-0c45-492e-886f-d3a9ff0e1064"));

            migrationBuilder.DeleteData(
                table: "Shifts",
                keyColumn: "Id",
                keyValue: new Guid("8f44f9dc-a942-4354-8106-c8c949dbac9e"));

            migrationBuilder.DeleteData(
                table: "Shifts",
                keyColumn: "Id",
                keyValue: new Guid("e3780220-9be9-4afb-8ca9-92ab42fc9435"));

            migrationBuilder.DeleteData(
                table: "Departments",
                keyColumn: "Id",
                keyValue: new Guid("91fdcfdb-8868-4ed1-a80b-672d3e7e1a19"));

            migrationBuilder.DeleteData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: new Guid("1c25eb38-fdd7-4e1e-a22a-cdbd89833f45"));

            migrationBuilder.DeleteData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: new Guid("699f05d0-376b-4110-b628-59cab733e7e8"));

            migrationBuilder.DeleteData(
                table: "Employees",
                keyColumn: "Id",
                keyValue: new Guid("f2390eea-b584-4cb5-8f07-edab98aa1673"));

            migrationBuilder.DeleteData(
                table: "Departments",
                keyColumn: "Id",
                keyValue: new Guid("409f37a0-622d-4e9c-a92a-320ccbf98ca8"));

            migrationBuilder.DeleteData(
                table: "Departments",
                keyColumn: "Id",
                keyValue: new Guid("946abea1-0c11-4f0e-9d2d-22d7967b894a"));

            migrationBuilder.DeleteData(
                table: "Hospitals",
                keyColumn: "Id",
                keyValue: new Guid("2cdc5e58-fd44-4f8c-bbd4-fc19e91b3cfc"));
        }
    }
}
