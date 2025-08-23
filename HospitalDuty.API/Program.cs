using System.Reflection;
using HospitalDuty.API.Middlewares;
using HospitalDuty.Application.Abstractions;
using HospitalDuty.Application.Interfaces;
using HospitalDuty.Application.Services;
using HospitalDuty.Infrastructure.Persistence;
using HospitalDuty.Infrastructure.Repository;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddDbContext<HospitalDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
        c.IncludeXmlComments(xmlPath);
});

builder.Services.AddScoped<IEmployeeRepository, HospitalDuty.Infrastructure.Repository.EmployeeRepository>();
builder.Services.AddScoped<IEmployeeService, EmployeeService>();
builder.Services.AddScoped<IHospitalRepository, HospitalRepository>();
builder.Services.AddScoped<IHospitalService, HospitalService>();
builder.Services.AddScoped<IDepartmentRepository, DepartmentRepository>();
builder.Services.AddScoped<IDepartmentService, DepartmentService>();
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

builder.WebHost.UseUrls("https://localhost:5000");

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseMiddleware<ExceptionMiddleware>();

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

//app.Urls.Clear();
//app.Urls.Add("https://localhost:5000");

app.Run();

