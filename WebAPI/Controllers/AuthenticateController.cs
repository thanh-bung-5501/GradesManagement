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
                    new Claim("UserName", user.Fullname),
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
        [Route("user/info")]
        public IActionResult GetUserInfoByToken()
        {
            // Get the user's Claims from the authenticated User
            var user = HttpContext.User;
            if (user != null)
            {
                var roleClaim = user.FindFirst(c => c.Type.Equals(ClaimTypes.Role))!;
                var uIdClaim = user.FindFirst(c => c.Type.Equals("UserId"))!;
                var uNameClaim = user.FindFirst(c => c.Type.Equals("UserName"))!;
                return Ok(new
                {
                    id = uIdClaim.Value,
                    name = uNameClaim.Value,
                    role = roleClaim.Value
                });
            }
            else
            {
                // user's Claims not found
                return BadRequest("User not found in token.");
            }
        }
    }
}
