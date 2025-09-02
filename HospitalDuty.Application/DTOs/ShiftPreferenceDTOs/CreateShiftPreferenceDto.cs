using System;

using System.ComponentModel.DataAnnotations;
using HospitalDuty.Domain.Enums;

namespace HospitalDuty.Application.DTOs.ShiftPreferenceDTOs;

    public class CreateShiftPreferenceDto
    {
        /// <summary>
        /// Employee ID (controller'da otomatik olarak set edilir)
        /// </summary>
        public Guid EmployeeId { get; set; }

        /// <summary>
        /// Seçilen tarihler
        /// </summary>
        [Required]
        public List<DateTime> Dates { get; set; } = new();

        /// <summary>
        /// Tercih tipi (0: Unavailable, 1: Preferred)
        /// </summary>
        public PreferenceType PreferenceType { get; set; } = PreferenceType.Unavailable;
        
        /// <summary>
        /// Notlar
        /// </summary>
        public string Notes { get; set; } = string.Empty;
    }
