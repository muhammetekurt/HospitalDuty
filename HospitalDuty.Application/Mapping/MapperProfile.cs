using AutoMapper;
using HospitalDuty.Domain.Entities;
using HospitalDuty.Application.DTOs;
using HospitalDuty.Application.DTOs.EmployeeDTOs;
using HospitalDuty.Application.DTOs.HospitalDTOs;
using HospitalDuty.Application.DTOs.DepartmentDTOs;
using HospitalDuty.Application.DTOs.ShiftDTOs;

namespace HospitalDuty.Application.Mapping
{
    public class MapperProfile : Profile
    {
        public MapperProfile()
        {
            CreateMap<Employee, EmployeeDto>();
            CreateMap<CreateEmployeeDto, Employee>();
            CreateMap<UpdateEmployeeDto, Employee>();

            CreateMap<Hospital, HospitalDto>();
            CreateMap<Hospital, CreateHospitalDto>().ReverseMap();
            CreateMap<UpdateHospitalDto, Hospital>();

            CreateMap<Department, DepartmentDto>();
            CreateMap<CreateDepartmentDto, Department>();
            CreateMap<UpdateDepartmentDto, Department>();

            CreateMap<Shift, ShiftDto>();
            CreateMap<CreateShiftDto, Shift>();
            CreateMap<UpdateShiftDto, Shift>();


        }
    }
}
