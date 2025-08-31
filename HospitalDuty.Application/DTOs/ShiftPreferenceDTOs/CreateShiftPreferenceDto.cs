using System;
using HospitalDuty.Domain.Enums;

namespace HospitalDuty.Application.DTOs.ShiftPreferenceDTOs;

    public class CreateShiftPreferenceDto
    {
        public Guid EmployeeId { get; set; }

        // Frontend’den seçilen günler listesi gelecek (ör: 3, 5, 11, 12, 20)
        public List<DateTime> Dates { get; set; } = new();

        public PreferenceType PreferenceType { get; set; } = PreferenceType.Unavailable;
        public string Notes { get; set; } = string.Empty;
    }
