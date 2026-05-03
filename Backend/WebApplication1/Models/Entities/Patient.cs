using System.ComponentModel.DataAnnotations;

namespace WebApplication1.Models.Entities
{
    public class Patient
    {
        public int Id { get; set; } 

        public required string Name { get; set; }

        public required string Surname { get; set; }

        public required string Username { get; set; }

        public required string Gender { get; set; } // "Male", "Female", "Other"

        public required string HomeAddress { get; set; }

        public required string Email { get; set; }

        public required string Phone { get; set; }

        public required bool HasMedicalAid { get; set; }

        public string? MedicalAidCompany { get; set; } // Nullable if no medical aid

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }

        // Navigation property for visits
        public ICollection<Visit> Visits { get; set; } = new List<Visit>();
    }
}
