using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Controllers;
using Repositories;
using WebAPI.Models;

namespace WebAPI.Controllers
{
    public class GradeCategoryController : ODataController
    {
        private IGradeCategoryRepo _repo = new GradeCategoryRepo();
        private IMapper _Mapper { get; }
        public GradeCategoryController(IMapper mapper)
        {
            _Mapper = mapper;
        }

        [Authorize(Roles = "Admin,Teacher")]
        [EnableQuery]
        public IActionResult Get()
        {
            var gradeCategories = _repo.GetGradeCategories();
            var gradeCategoryDTOs = _Mapper.Map<List<GradeCategoryDTO>>(gradeCategories);
            return Ok(gradeCategoryDTOs);
        }
    }
}
