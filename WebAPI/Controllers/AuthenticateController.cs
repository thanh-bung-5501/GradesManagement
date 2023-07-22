using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Repositories;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using WebAPI.Models;

namespace WebAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthenticateController : ControllerBase
    {
        private IUserRepo _repoU = new UserRepo();
        private readonly IConfiguration _configuration;

        public AuthenticateController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        private JwtSecurityToken GetToken(List<Claim> authClaims)
        {
            var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JWT:Secret"]));

            var token = new JwtSecurityToken(
                issuer: _configuration["JWT:ValidIssuer"],
                audience: _configuration["JWT:ValidAudience"],
                expires: DateTime.Now.AddHours(3),
                claims: authClaims,
                signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
                );

            return token;
        }

        [HttpPost]
        [Route("login")]
        public IActionResult Login([FromBody] LoginDTO model)
        {
            // find user by email & pw 
            var user = _repoU.GetUserByEmailAndPw(model.Email, model.Password);

            if (user != null)
            {
                var authClaims = new List<Claim>
                {
                    new Claim("UserId", user.Id),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                    new Claim(ClaimTypes.Role, user.Role.Name),
                };

                var token = GetToken(authClaims);

                return Ok(new
                {
                    token = new JwtSecurityTokenHandler().WriteToken(token),
                    expiration = token.ValidTo
                });
            }
            return Unauthorized();
        }

        [Authorize]
        [HttpGet]
        [Route("user/role")]
        public IActionResult GetUserRoleByToken()
        {
            // Get the user's Claims from the authenticated User
            var user = HttpContext.User;

            // Retrieve the 'role' claim from the user's Claims
            var roleClaim = user.FindFirst(c => c.Type.Equals(ClaimTypes.Role));

            if (roleClaim != null)
            {
                var userRole = roleClaim.Value;
                return Ok(new { role = userRole });
            }
            else
            {
                // Role claim not found, handle as needed (e.g., return an error response)
                return BadRequest("User role not found in token.");
            }
        }
    }
}
