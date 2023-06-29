using AutoMapper;
using BusinessObjects;
using WebAPI.Models;

namespace WebAPI.Mapper
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<User, UserDTO>().ReverseMap();
            CreateMap<Role, RoleDTO>().ReverseMap();
            CreateMap<Subject, SubjectDTO>().ReverseMap();
        }
    }
}
