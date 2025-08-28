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

    public async Task<bool> SendWelcomeEmail(string userEmail, string fullName, string password)
    {
        var subject = "Hastane Nöbet Sistemine Hoş Geldin!";
        var body = $"Merhaba {fullName},<br/><br/><p>Hesabın başarıyla oluşturuldu.</p><br/><p><strong>Geçici Şifreniz:</strong> {password}</p>";
        await _emailService.SendEmailAsync(userEmail, "", subject, body);
        return true;
    }
}