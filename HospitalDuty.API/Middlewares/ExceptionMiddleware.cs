using System.Net;
using System.Text.Json;
using HospitalDuty.Application.Exceptions;

namespace HospitalDuty.API.Middlewares;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";

        var statusCode = exception switch
        {
            NotFoundException => HttpStatusCode.NotFound,
            BadRequestException => HttpStatusCode.BadRequest,
            UnauthorizedException => HttpStatusCode.Unauthorized,
            ForbiddenException => HttpStatusCode.Forbidden,
            _ => HttpStatusCode.InternalServerError
        };

        var response = new
        {
            StatusCode = (int)statusCode,
            Message = exception.Message
        };

        var json = JsonSerializer.Serialize(response);
        context.Response.StatusCode = (int)statusCode;

        return context.Response.WriteAsync(json);
    }
}
