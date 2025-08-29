using System;
using HospitalDuty.Application.DTOs.EmployeeDTOs;
using HospitalDuty.Domain.Entities;

namespace HospitalDuty.Application.Interfaces;

public interface IAuthService
{
    Task<bool> RegisterAsync(RegisterDto dto);
    Task<TokenDto?> LoginAsync(LoginDto dto);
    Task<ApplicationUser?> CreateWithCreatorAsync(RegisterDto dto, string creatorUserId, string password);
    Task<bool> ChangePasswordAsync(string userId, ChangePasswordDto dto);
}