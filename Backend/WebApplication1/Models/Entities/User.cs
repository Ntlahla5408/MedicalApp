using System.ComponentModel.DataAnnotations;

namespace WebApplication1.Models.Entities
{
    public class User
    {
        public int Id { get; set; }

        public required string Username { get; set; }

        public required string PasswordHash { get; set; }

        public required string Role { get; set; } = "User"; // Default role

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime? UpdatedAt { get; set; }

        public DateTime? LastLogin { get; set; }

    }
}