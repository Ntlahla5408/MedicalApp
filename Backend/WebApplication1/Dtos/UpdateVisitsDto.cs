using System.ComponentModel.DataAnnotations;

namespace WebApplication1.Dtos
{
    public class UpdateVisitsDto
    {
        [Required(ErrorMessage = "Diagnosis is required")]
        [StringLength(1000, ErrorMessage = "Diagnosis cannot exceed 1000 characters")]
        public string Diagnosis { get; set; } = string.Empty;

        [Required(ErrorMessage = "Treatment is required")]
        [StringLength(1000, ErrorMessage = "Treatment cannot exceed 1000 characters")]
        public string Treatment { get; set; } = string.Empty;

        [StringLength(500, ErrorMessage = "Notes cannot exceed 500 characters")]
        public string? Notes { get; set; }
    }
}