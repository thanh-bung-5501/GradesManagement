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
            CreateMap<UserCreateDTO, User>().ReverseMap();

            CreateMap<Role, RoleDTO>().ReverseMap();

            CreateMap<Subject, SubjectDTO>().ReverseMap();
            CreateMap<SubjectCreateDTO, Subject>().ReverseMap();
            CreateMap<SubjectEditDTO, Subject>().ReverseMap();

            CreateMap<Grades, GradesDTO>().ReverseMap();
            CreateMap<GradeCategory, GradeCategoryDTO>();
            CreateMap<GradesCreateDTO, Grades>();
            CreateMap<GradesUpdateDTO, Grades>();
        }
    }
}
