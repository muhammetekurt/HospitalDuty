using System;

namespace HospitalDuty.Application.DTOs.EmployeeDTOs;

public class ChangePasswordDto
{
    public string CurrentPassword { get; set; }
    public string NewPassword { get; set; }
}
