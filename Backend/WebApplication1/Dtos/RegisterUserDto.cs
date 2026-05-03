using System.ComponentModel.DataAnnotations;

namespace WebApplication1.Dtos
{
    public class RegisterUserDto
    {
        public required string Username { get; set; }

        public required string Password { get; set; }

        public required string ConfirmPassword { get; set; }

        [RegularExpression("^(Admin|Doctor|Assistant)$", ErrorMessage = "Role must be Admin, Doctor, or Assistant")]
        public required string Role { get; set; } = "User";
    }
}
