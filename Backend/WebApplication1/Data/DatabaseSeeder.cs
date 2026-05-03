using Microsoft.EntityFrameworkCore;
using WebApplication1.Models.Entities;

namespace WebApplication1.Data
{
    public static class DatabaseSeeder
    {
        public static async Task SeedAdminUser(ApplicationDbContext context)
        {
            // Check if admin user already exists
            if (!await context.User.AnyAsync(u => u.Username == "admin"))
            {
                var adminUser = new User
                {
                    Username = "admin",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("password"),
                    Role = "Admin",
                    CreatedAt = DateTime.UtcNow,
                   
                };

                context.User.Add(adminUser);
                await context.SaveChangesAsync();
            }

            // Seed sample patients for testing
            if (!await context.Patients.AnyAsync())
            {
                var patients = new List<Patient>
                {
                    new Patient
                    {
                        Name = "John",
                        Surname = "Doe",
                        Username = "johndoe",
                        Gender = "Male",
                        HomeAddress = "123 Main St, Cityville",
                        Email = "john.doe@example.com",
                        Phone = "555-0101",
                        HasMedicalAid = true,
                        MedicalAidCompany = "MediCare Plus",
                        CreatedAt = DateTime.UtcNow,
                         
                    },
                    new Patient
                    {
                        Name = "Jane",
                        Surname = "Smith",
                        Username = "janesmith",
                        Gender = "Female",
                        HomeAddress = "456 Oak Ave, Townsville",
                        Email = "jane.smith@example.com",
                        Phone = "555-0102",
                        HasMedicalAid = false,
                        MedicalAidCompany = null,
                        CreatedAt = DateTime.UtcNow,
                         
                    }
                };

                context.Patients.AddRange(patients);
                await context.SaveChangesAsync();
            }
        }
    }
}