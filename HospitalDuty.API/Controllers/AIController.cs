using Microsoft.AspNetCore.Mvc;
using HospitalDuty.Application.Contracts.Services;
using HospitalDuty.Application.Contracts.Persistence;
using System.Threading.Tasks;

namespace HospitalDuty.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AIController : ControllerBase
    {
        private readonly IAIService _aiService;
        private readonly IShiftRepository _shiftRepository;
        private readonly IDepartmentRepository _departmentRepository;
        private readonly IEmployeeRepository _employeeRepository;
        private readonly IHospitalRepository _hospitalRepository;

        public AIController(
            IAIService aiService,
            IShiftRepository shiftRepository,
            IDepartmentRepository departmentRepository,
            IEmployeeRepository employeeRepository,
            IHospitalRepository hospitalRepository)
        {
            _aiService = aiService;
            _shiftRepository = shiftRepository;
            _departmentRepository = departmentRepository;
            _employeeRepository = employeeRepository;
            _hospitalRepository = hospitalRepository;
        }

        [HttpPost("chat")]
        public async Task<IActionResult> Chat([FromBody] ChatRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.Message))
                {
                    return BadRequest("Mesaj boş olamaz.");
                }

                // Proje verilerini topla
                var projectData = await GetProjectDataAsync();
                
                // AI'ya proje verilerini context olarak gönder
                var context = $"HospitalDuty vardiya yönetim sistemi\n\n{projectData}";
                var response = await _aiService.GetAIResponseAsync(request.Message, context);
                
                return Ok(new ChatResponse
                {
                    Message = response,
                    Timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "AI servisi hatası: " + ex.Message);
            }
        }

        private async Task<string> GetProjectDataAsync()
        {
            try
            {
                var shifts = await _shiftRepository.GetAllShiftsAsync();
                var departments = await _departmentRepository.GetAllAsync();
                var employees = await _employeeRepository.GetAllAsync();
                var hospitals = await _hospitalRepository.GetAllAsync();

                var projectData = $@"
SİSTEM BİLGİLERİ:
==================

HASTANELER ({hospitals.Count()} adet):
{string.Join("\n", hospitals.Select(h => $"- {h.Name} (ID: {h.Id})"))}

DEPARTMANLAR ({departments.Count()} adet):
{string.Join("\n", departments.Select(d => $"- {d.Name} (Hastane: {d.Hospital?.Name})"))}

ÇALIŞANLAR ({employees.Count()} adet):
{string.Join("\n", employees.Take(10).Select(e => $"- {e.FirstName} {e.LastName} - {e.Department?.Name}"))}
{(employees.Count() > 10 ? $"... ve {employees.Count() - 10} çalışan daha" : "")}

VARDİYALAR ({shifts.Count()} adet):
{string.Join("\n", shifts.Take(10).Select(s => $"- {s.Employee?.FirstName} {s.Employee?.LastName} - {s.ShiftType} ({s.StartTime:dd.MM.yyyy HH:mm} - {s.EndTime:dd.MM.yyyy HH:mm})"))}
{(shifts.Count() > 10 ? $"... ve {shifts.Count() - 10} vardiya daha" : "")}

SHIFT TÜRLERİ:
- Normal (0): Standart çalışma saatleri
- Night (1): Gece vardiyası
- Emergency (2): Acil durum vardiyası

ROL HİYERARŞİSİ:
- SystemAdmin: Sistem yöneticisi (en yüksek yetki)
- HospitalDirector: Hastane müdürü
- DepartmentManager: Departman müdürü
- DepartmentLeader: Departman lideri
- Doctor: Doktor
- Nurse: Hemşire
- Staff: Personel

YETKİLENDİRME:
- Sistem yöneticileri: Tüm hastaneleri yönetebilir
- Hastane müdürleri: Kendi hastanesini yönetebilir
- Departman müdürleri: Kendi departmanlarını yönetebilir
- Shift yönetimi: Departman müdürleri, liderler ve hastane müdürleri yapabilir
";

                return projectData;
            }
            catch (Exception ex)
            {
                return $"Proje verileri alınırken hata oluştu: {ex.Message}";
            }
        }
    }

    public class ChatRequest
    {
        public string Message { get; set; } = string.Empty;
        public string Context { get; set; } = string.Empty;
    }

    public class ChatResponse
    {
        public string Message { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
    }
}
