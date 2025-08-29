using AutoMapper;
using HospitalDuty.Application.Contracts.Persistence;
using HospitalDuty.Application.Contracts.Services;
using HospitalDuty.Application.DTOs.EmployeeDTOs;
using HospitalDuty.Application.DTOs.ShiftPreferenceDTOs;
using HospitalDuty.Domain.Entities;
using HospitalDuty.Domain.Enums;

namespace HospitalDuty.Application.Services
{
    public class ShiftPreferenceService : IShiftPreferenceService
    {
        private readonly IShiftPreferenceRepository _repository;
        private readonly IEmployeeService _employeeService;
        private readonly IMapper _mapper;

        public ShiftPreferenceService(IShiftPreferenceRepository repository, IEmployeeService employeeService, IMapper mapper)
        {
            _repository = repository;
            _employeeService = employeeService;
            _mapper = mapper;
        }

        public async Task<IEnumerable<ShiftPreferenceDto>> CreatePreferencesAsync(CreateShiftPreferenceDto dto)
        {
            var result = new List<ShiftPreferenceDto>();

            foreach (var date in dto.Dates)
            {
                var existing = await _repository.GetByEmployeeAndDateAsync(dto.EmployeeId, date.Date);
                if (existing != null) continue;

                var entity = _mapper.Map<ShiftPreference>(dto);
                entity.Date = date.Date; // döngüde güncellemeyi unutma

                await _repository.CreateAsync(entity);

                result.Add(_mapper.Map<ShiftPreferenceDto>(entity));
            }

            return result;
        }

        public async Task<IEnumerable<ShiftPreferenceDto>> GetPreferencesByEmployeeAsync(Guid employeeId)
        {
            var prefs = await _repository.GetByEmployeeAsync(employeeId);
            return _mapper.Map<IEnumerable<ShiftPreferenceDto>>(prefs);
        }

        public async Task<bool> IsEmployeeAvailableAsync(Guid employeeId, DateTime date)
        {
            var pref = await _repository.GetByEmployeeAndDateAsync(employeeId, date.Date);
            if (pref == null) return true;
            return pref.PreferenceType == PreferenceType.Preferred;
        }
        //
        public async Task<IEnumerable<ShiftPreferenceDto>> GetAllPreferencesAsync()
        {
            var prefs = await _repository.GetAllAsync();
            return _mapper.Map<IEnumerable<ShiftPreferenceDto>>(prefs);
        }

        public async Task<IEnumerable<ShiftPreferenceDto>> GetPreferencesByMonthAsync(int month)
        {
            var prefs = await _repository.GetByMonthAsync(month);
            return _mapper.Map<IEnumerable<ShiftPreferenceDto>>(prefs);
        }

        public async Task<IEnumerable<ShiftPreferenceDto>> GetPreferencesByEmployeeAndMonthAsync(Guid employeeId, int month)
        {
            var prefs = await _repository.GetByEmployeeAndMonthAsync(employeeId, month);
            return _mapper.Map<IEnumerable<ShiftPreferenceDto>>(prefs);
        }
        //
        public async Task<IEnumerable<EmployeeDto>> GetAvailableEmployeesByDateAsync(DateTime date)
        {
            var allPrefs = await _repository.GetAllAsync();
            var unavailableIds = allPrefs
                .Where(p => p.Date.Date == date.Date && p.PreferenceType == PreferenceType.Unavailable)
                .Select(p => p.EmployeeId)
                .ToHashSet();

            var allEmployees = await _employeeService.GetAllAsync();
            return allEmployees.Where(e => !unavailableIds.Contains(e.Id));
        }

        public async Task<IEnumerable<EmployeeDto>> GetAvailableEmployeesByMonthAsync(int month)
        {
            var allPrefs = await _repository.GetByMonthAsync(month);
            var unavailableIds = allPrefs
                .Where(p => p.PreferenceType == PreferenceType.Unavailable)
                .Select(p => p.EmployeeId)
                .ToHashSet();

            var allEmployees = await _employeeService.GetAllAsync();
            return allEmployees.Where(e => !unavailableIds.Contains(e.Id));
        }
        public async Task<IEnumerable<EmployeeDto>> GetUnavailableEmployeesByDateAsync(DateTime date)
        {
            var prefs = await _repository.GetAllAsync();
            var unavailableIds = prefs
                .Where(p => p.Date.Date == date.Date && p.PreferenceType == PreferenceType.Unavailable)
                .Select(p => p.EmployeeId)
                .ToHashSet();

            var allEmployees = await _employeeService.GetAllAsync();
            return allEmployees.Where(e => unavailableIds.Contains(e.Id));
        }

        public async Task<IEnumerable<EmployeeDto>> GetUnavailableEmployeesByMonthAsync(int month)
        {
            var prefs = await _repository.GetByMonthAsync(month);
            var unavailableIds = prefs
                .Where(p => p.PreferenceType == PreferenceType.Unavailable)
                .Select(p => p.EmployeeId)
                .ToHashSet();

            var allEmployees = await _employeeService.GetAllAsync();
            return allEmployees.Where(e => unavailableIds.Contains(e.Id));
        }

    }
}
