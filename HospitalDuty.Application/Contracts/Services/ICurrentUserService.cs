using System;

namespace HospitalDuty.Application.Contracts.Services;

public interface ICurrentUserService
{
    string? UserId { get; }
    string? FullName { get; }
    string? Email { get; }
    bool IsAuthenticated { get; }
    IEnumerable<string> Roles { get; }
    bool IsInRole(string role);
}

