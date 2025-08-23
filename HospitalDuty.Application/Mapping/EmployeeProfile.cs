using AutoMapper;
using HospitalDuty.Domain.Entities;
using HospitalDuty.Application.DTOs;
using HospitalDuty.Application.DTOs.EmployeeDTOs;
using HospitalDuty.Application.DTOs.HospitalDTOs;

namespace HospitalDuty.Application.Mapping
{
    public class EmployeeProfile : Profile
    {
        public EmployeeProfile()
        {
            //CreateMap<Employee, EmployeeDto>().ForMember(dest => dest.Role, opt => opt.MapFrom(src => src.Role.ToString()));
            CreateMap<Employee, EmployeeDto>();
            CreateMap<CreateEmployeeDto, Employee>();
            CreateMap<UpdateEmployeeDto, Employee>();

            CreateMap<Hospital, HospitalDto>();
            CreateMap<Hospital, CreateHospitalDto>().ReverseMap();
            CreateMap<UpdateHospitalDto, Hospital>();
        }
    }
}
