using System;
using HospitalDuty.Application.Interfaces;

namespace HospitalDuty.Application.Services;

public class NotificationService : INotificationService
{
    private readonly IEmailService _emailService;

    public NotificationService(IEmailService emailService)
    {
        _emailService = emailService;
    }

    public async Task<bool> SendWelcomeEmail(string userEmail, string fullName)
    {
        var subject = "Hoşgeldin!";
        var body = $"<h1>Merhaba {fullName}</h1><p>Hesabın başarıyla oluşturuldu.</p>";
        await _emailService.SendEmailAsync(userEmail, "", subject, body);
        return true;
    }
}
