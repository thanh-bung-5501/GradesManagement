using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Controllers;
using Repositories;

namespace WebAPI.Controllers
{
    public class GradesController : ODataController
    {
        private IGradeRepo _repo = new GradesRepo();
        private IMapper _Mapper { get; }
        public GradesController(IMapper mapper)
        {
            _Mapper = mapper;
        }

        //[EnableQuery]
        //public IActionResult Get()
        //{
        //    var grades = _repo.g();
        //    var authorDTOs = _Mapper.Map<List<AuthorDTO>>(grades);
        //    return Ok(authorDTOs);
        //}
    }
}
