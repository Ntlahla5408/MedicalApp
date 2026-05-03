using Microsoft.EntityFrameworkCore;
using WebApplication1.Models.Entities;

namespace WebApplication1.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<User> User { get; set; }
        public DbSet<Patient> Patients { get; set; }
        public DbSet<Visit> Visits { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Visit entity WITHOUT Doctor relationship
            modelBuilder.Entity<Visit>(entity =>
            {
                entity.HasKey(v => v.Id);

                // Configure relationship with Patient only
                entity.HasOne(v => v.Patient)
                      .WithMany(p => p.Visits)
                      .HasForeignKey(v => v.PatientId)
                      .OnDelete(DeleteBehavior.Restrict);

                // Configure DoctorUsername as a simple string (no foreign key)
                entity.Property(v => v.DoctorUsername)
                      .IsRequired()
                      .HasMaxLength(100);

                entity.Property(v => v.Diagnosis)
                      .IsRequired()
                      .HasMaxLength(1000);

                entity.Property(v => v.Treatment)
                      .IsRequired()
                      .HasMaxLength(1000);

                entity.Property(v => v.Notes)
                      .HasMaxLength(500);
            });
        }
    }
}