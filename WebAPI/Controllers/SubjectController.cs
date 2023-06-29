using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Formatter;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Controllers;
using Repositories;
using WebAPI.Models;

namespace WebAPI.Controllers
{
    public class SubjectController : ODataController
    {
        private ISubjectRepo _repo = new SubjectRepo();
        private IMapper _Mapper { get; }
        public SubjectController(IMapper mapper)
        {
            _Mapper = mapper;
        }

        [EnableQuery]
        public IActionResult Get()
        {
            var subjects = _repo.GetSubjects();
            var subjectDTOs = _Mapper.Map<List<SubjectDTO>>(subjects);
            return Ok(subjectDTOs);
        }

        [EnableQuery]
        public IActionResult Get([FromODataUri] int key)
        {
            var subject = _repo.GetSubjectById(key);
            var subjectDTO = _Mapper.Map<SubjectDTO>(subject);
            return Ok(subjectDTO);
        }
    }
}
