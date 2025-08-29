using System;
using MailKit.Net.Smtp;
using MimeKit;
using Microsoft.Extensions.Options;
using HospitalDuty.Application.Contracts.Services;
using HospitalDuty.Domain.Entities;

namespace HospitalDuty.Application.Services;

public class EmailService : IEmailService
{
    private readonly EmailSettings _emailSettings;

    public EmailService(IOptions<EmailSettings> settings)
    {
        _emailSettings = settings.Value;
    }

    public async Task SendEmailAsync(string to, string cc, string subject, string body)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_emailSettings.SenderName, _emailSettings.SenderEmail));
        message.To.Add(MailboxAddress.Parse(to));
        if (!string.IsNullOrWhiteSpace(cc))
        {
            message.Cc.Add(MailboxAddress.Parse(cc));
        }

        message.Subject = subject;

        message.Body = new TextPart("html") { Text = body };

        using var client = new SmtpClient();
        await client.ConnectAsync(_emailSettings.SmtpServer, _emailSettings.Port, MailKit.Security.SecureSocketOptions.StartTls);
        await client.AuthenticateAsync(_emailSettings.SenderEmail, _emailSettings.Password);
        await client.SendAsync(message);
        await client.DisconnectAsync(true);
    }
}
