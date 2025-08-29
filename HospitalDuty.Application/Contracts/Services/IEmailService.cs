using System;

namespace HospitalDuty.Application.Contracts.Services;

public interface IEmailService
{
    Task SendEmailAsync(string to, string cc, string subject, string body);
}