﻿using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Controllers;
using Repositories;
using WebAPI.Models;

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

        [EnableQuery]
        public IActionResult Get()
        {
            var grades = _repo.GetGrades();
            var gradeDTOs = _Mapper.Map<List<GradesDTO>>(grades);
            return Ok(gradeDTOs);
        }
    }
}
