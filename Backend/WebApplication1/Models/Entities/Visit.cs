using System.ComponentModel.DataAnnotations;

namespace WebApplication1.Models.Entities
{
    public class Visit
    {
        public int Id { get; set; }

        public int PatientId { get; set; }
        public Patient Patient { get; set; }

        // Remove Doctor navigation property and use only DoctorUsername
        public string DoctorUsername { get; set; } = string.Empty;

        public DateTime VisitDate { get; set; } = DateTime.UtcNow;

        public string Diagnosis { get; set; } = string.Empty;

        public string Treatment { get; set; } = string.Empty;

        public string? Notes { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}