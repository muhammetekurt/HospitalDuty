using System;
using MimeKit.Cryptography;

namespace HospitalDuty.Application.Interfaces;

public interface INotificationService
{
    public Task<bool> SendWelcomeEmail(string userEmail, string fullName);
}