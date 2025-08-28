using System;

namespace HospitalDuty.Application.Interfaces;

public interface IEmailService
{
    Task SendEmailAsync(string to, string cc, string subject, string body);
}