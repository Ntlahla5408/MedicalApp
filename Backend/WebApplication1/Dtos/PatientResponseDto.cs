namespace WebApplication1.Dtos
{
    public class PatientResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Surname { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Gender { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public bool HasMedicalAid { get; set; }
        public string? MedicalAidCompany { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
