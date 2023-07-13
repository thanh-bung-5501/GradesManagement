using AutoMapper;
using BusinessObjects;
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

        public IActionResult Post([FromBody] SubjectCreateDTO subjectCreate)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            Subject newSubject = _Mapper.Map<Subject>(subjectCreate);
            _repo.Create(newSubject);
            return NoContent();
        }

        public IActionResult Put([FromODataUri] int key, [FromBody] SubjectEditDTO subjectEdit)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            if (key != subjectEdit.Id)
            {
                return BadRequest();
            }
            Subject newSubject = _Mapper.Map<Subject>(subjectEdit);
            _repo.Update(newSubject);
            return NoContent();
        }
    }
}
