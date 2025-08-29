using System;
using HospitalDuty.Application.DTOs.EmployeeDTOs;
using HospitalDuty.Domain.Entities;

namespace HospitalDuty.Application.Contracts.Services;

public interface IAuthService
{
    Task<bool> RegisterAsync(RegisterDto dto);
    Task<TokenDto?> LoginAsync(LoginDto dto);
    Task<ApplicationUser?> CreateWithCreatorAsync(RegisterDto dto, string creatorUserId, string password);
    Task<bool> ChangePasswordAsync(string userId, ChangePasswordDto dto);
    Task<(bool Success, string Message)> ForgotPasswordAsync(string email, string newPassword);
}