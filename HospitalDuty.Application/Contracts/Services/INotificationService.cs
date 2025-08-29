using System;
using MimeKit.Cryptography;

namespace HospitalDuty.Application.Contracts.Services;

public interface INotificationService
{
    public Task<bool> SendWelcomeEmail(string userEmail, string fullName, string password);
    public Task<bool> SendPasswordResetEmail(string userEmail, string fullName, string newPassword);
    public Task<bool> SendPasswordChangeNotification(string userEmail, string fullName);
}