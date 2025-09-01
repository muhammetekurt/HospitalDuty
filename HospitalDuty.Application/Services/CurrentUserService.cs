using System.Security.Claims;
using HospitalDuty.Application.Contracts.Services;
using Microsoft.AspNetCore.Http;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    private ClaimsPrincipal? User => _httpContextAccessor.HttpContext?.User;

    public string? UserId => User?.FindFirstValue(ClaimTypes.NameIdentifier);

    public string FullName => User?.Identity?.Name ?? "System";

    public string? Email => User?.FindFirstValue(ClaimTypes.Email);

    public bool IsAuthenticated => User?.Identity?.IsAuthenticated ?? false;

    public IEnumerable<string> Roles =>
        User?.FindAll(ClaimTypes.Role).Select(r => r.Value) ?? Enumerable.Empty<string>();

    public bool IsInRole(string role) =>
        User?.IsInRole(role) ?? false;
}
