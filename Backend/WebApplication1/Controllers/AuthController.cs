using Azure.Core;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using WebApplication1.Data;
using WebApplication1.Dtos;
using WebApplication1.Models.Entities;

namespace WebApplication1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly ApplicationDbContext dbcontext;

        public AuthController(IConfiguration configuration, ApplicationDbContext dbcontext)
        {
            _configuration = configuration;
            this.dbcontext = dbcontext;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginDto logindto)
        {
            // Find user by username in database
            var user = await dbcontext.User
                .FirstOrDefaultAsync(u => u.Username == logindto.Username);

            if (user == null)
            {
                return Unauthorized("Invalid credentials");
            }

            // Verify password
            if (!VerifyPassword(logindto.Password, user.PasswordHash))
            {
                return Unauthorized("Invalid credentials");
            }

            // Generate JWT token
            var token = GenerateJwtToken(user);
            return Ok(new
            {
                token = token,
                username = user.Username,
                role = user.Role
            });
        }


        [HttpPost("register")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Register(RegisterUserDto registerUserdto)
        {
            // Basic validation
            if (string.IsNullOrEmpty(registerUserdto.Username) || string.IsNullOrEmpty(registerUserdto.Password))
            {
                return BadRequest("Username and password are required");
            }

            if (registerUserdto.Password != registerUserdto.ConfirmPassword)
            {
                return BadRequest("Passwords do not match");
            }


            // Validate role
            var validRoles = new[] { "Admin", "Doctor", "Assistant" };
            if (!validRoles.Contains(registerUserdto.Role))
            {
                return BadRequest("Invalid role. Must be: Admin, Doctor, or Assistant.");
            }

            // Hash the password
            var passwordHash = HashPassword(registerUserdto.Password);

            // Create user
            var user = new User
            {
                Username = registerUserdto.Username,
                PasswordHash = passwordHash,
                Role = registerUserdto.Role,
                CreatedAt = DateTime.UtcNow,
            };

            // Save to database
            dbcontext.User.Add(user);
            await dbcontext.SaveChangesAsync();

            return Ok(new
            {
                message = "User registered successfully",
                userId = user.Id,
                username = user.Username,
                role = user.Role
            });
        }

        [HttpGet("users")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await dbcontext.User
                .Select(u => new
                {
                    u.Id,
                    u.Username,
                    u.Role,
                    u.CreatedAt,
                    u.LastLogin,
                })
                .ToListAsync();

            return Ok(users);
        }

        // Add these methods to your existing AuthController

        [HttpPut("users/{username}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateUserRole(string username, [FromBody] UpdateRoleRequest request)
        {
            try
            {
                // Find the user to update
                var user = await dbcontext.User.FirstOrDefaultAsync(u => u.Username == username);
                if (user == null)
                {
                    return NotFound(new { message = "User not found." });
                }

                // Get current logged-in user
                var currentUsername = User.Identity.Name;
                if (user.Username == currentUsername)
                {
                    return BadRequest(new { message = "Cannot modify your own account." });
                }

                // Validate the new role
                var validRoles = new[] { "Admin", "Doctor", "Assistant" };
                if (!validRoles.Contains(request.NewRole))
                {
                    return BadRequest(new { message = "Invalid role. Must be: Admin, Doctor, or Assistant." });
                }

                // Update the role
                user.Role = request.NewRole;
                user.UpdatedAt = DateTime.UtcNow;

                await dbcontext.SaveChangesAsync();

                return Ok(new
                {
                    message = "User role updated successfully",
                    username = user.Username,
                    newRole = user.Role
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while updating the user." });
            }
        }

        [HttpDelete("users/{username}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteUser(string username)
        {
            try
            {
                // Find the user to delete
                var user = await dbcontext.User.FirstOrDefaultAsync(u => u.Username == username);
                if (user == null)
                {
                    return NotFound(new { message = "User not found." });
                }

                // Get current logged-in user
                var currentUsername = User.Identity.Name;
                if (user.Username == currentUsername)
                {
                    return BadRequest(new { message = "Cannot delete your own account." });
                }

                // Delete the user
                dbcontext.User.Remove(user);
                await dbcontext.SaveChangesAsync();

                return Ok(new
                {
                    message = "User deleted successfully",
                    username = user.Username
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred while deleting the user." });
            }
        }

        // Add this DTO class inside your AuthController class (at the bottom)
        public class UpdateRoleRequest
        {
            public string NewRole { get; set; }
        }

        private string GenerateJwtToken(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Username),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddHours(1),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password);
        }

        private bool VerifyPassword(string password, string hashedPassword)
        {
            return BCrypt.Net.BCrypt.Verify(password, hashedPassword);
        }

    }
}
