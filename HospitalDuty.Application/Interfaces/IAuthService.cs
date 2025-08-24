using System;
using HospitalDuty.Application.DTOs.EmployeeDTOs;

namespace HospitalDuty.Application.Interfaces;

public interface IAuthService
{
    Task<bool> RegisterAsync(RegisterDto dto);
    Task<TokenDto?> LoginAsync(LoginDto dto);
    Task<bool> CreateWithCreatorAsync(RegisterDto dto, string creatorUserId);
}
