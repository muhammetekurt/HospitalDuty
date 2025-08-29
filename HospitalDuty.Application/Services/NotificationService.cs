using System;
using HospitalDuty.Application.Contracts.Services;

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
    public async Task<bool> SendPasswordResetEmail(string userEmail, string fullName, string newPassword)
    {
        var subject = "Hastane Nöbet Sistemi - Şifre Sıfırlama";
        var body = $"Merhaba {fullName},<br/><br/><p>Şifreniz başarıyla sıfırlandı. Yeni şifrenizi kullanarak giriş yapabilirsiniz.</p><br/><p><strong>Yeni Şifreniz:</strong> {newPassword}</p>";
        await _emailService.SendEmailAsync(userEmail, "", subject, body);
        return true;
    }
}