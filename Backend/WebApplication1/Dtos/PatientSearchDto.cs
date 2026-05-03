namespace WebApplication1.Dtos
{
    public class PatientSearchDto
    {
        public string? Name { get; set; }
        public string? Surname { get; set; }
        public string? Username { get; set; }
        public int? PatientNumber { get; set; } // This would be the Patient Id
    }
}
