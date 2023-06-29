using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OData.Query;
using Microsoft.AspNetCore.OData.Routing.Controllers;
using Repositories;
using WebAPI.Models;

namespace WebAPI.Controllers
{
    public class RoleController : ODataController
    {
        private IRoleRepo _repo = new RoleRepo();
        private IMapper _Mapper { get; }
        public RoleController(IMapper mapper)
        {
            _Mapper = mapper;
        }

        [EnableQuery]
        public IActionResult Get()
        {
            var roles = _repo.GetRoles();
            var roleDTOs = _Mapper.Map<List<RoleDTO>>(roles);
            return Ok(roleDTOs);
        }
    }
}
