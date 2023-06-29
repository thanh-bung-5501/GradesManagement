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
    public class UserController : ODataController
    {
        private IUserRepo _repo = new UserRepo();
        private IMapper _Mapper { get; }
        public UserController(IMapper mapper)
        {
            _Mapper = mapper;
        }

        [EnableQuery]
        public IActionResult Get()
        {
            var users = _repo.GetUsers();
            var userDTOs = _Mapper.Map<List<UserDTO>>(users);
            return Ok(userDTOs);
        }

        [HttpPost]
        [Route("api/user/generate-user-id")]
        public IActionResult GenerateUserID()
        {
            // Generate a unique user ID
            string userID = Guid.NewGuid().ToString();

            // Return the generated ID in the response
            return Ok(new { id = userID });
        }

        [EnableQuery]
        public IActionResult Get([FromODataUri] string key)
        {
            var user = _repo.GetUserById(key);
            var userDTO = _Mapper.Map<UserDTO>(user);
            return Ok(userDTO);
        }

        //public IActionResult Post([FromBody] AuthorCreateDTO authorCreateDTO)
        //{
        //    if (!ModelState.IsValid)
        //    {
        //        return BadRequest(ModelState);
        //    }
        //    Author newUser = _Mapper.Map<Author>(authorCreateDTO);
        //    _repo.Create(newUser);
        //    return NoContent();
        //}

        //public IActionResult Put([FromODataUri] int key, [FromBody] UserDTO userDTO)
        //{
        //    if (!ModelState.IsValid)
        //    {
        //        return BadRequest(ModelState);
        //    }
        //    if (key != userDTO.Id)
        //    {
        //        return BadRequest();
        //    }
        //    User newUser = _Mapper.Map<User>(userDTO);
        //    _repo.Update(newUser);
        //    return NoContent();
        //}

        //public IActionResult Delete([FromODataUri] int key)
        //{
        //    var user = _repo.GetUserById(key);
        //    if (user is null)
        //    {
        //        return BadRequest();
        //    }
        //    _repo.Delete(user.Id);
        //    return NoContent();
        //}
    }
}
