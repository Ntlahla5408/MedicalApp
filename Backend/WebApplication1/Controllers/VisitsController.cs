using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using WebApplication1.Data;
using WebApplication1.Models.Entities;
using WebApplication1.Dtos;

namespace WebApplication1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Doctor,Admin,Assistant")]
    public class VisitsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<VisitsController> _logger;

        public VisitsController(ApplicationDbContext context, ILogger<VisitsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/Visits/patient/5 - Get visit history for a patient
        [HttpGet("patient/{patientId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetPatientVisits(int patientId)
        {
            try
            {
                _logger.LogInformation("Getting visits for patient {PatientId}", patientId);

                var visits = await _context.Visits
                    .Where(v => v.PatientId == patientId)
                    .OrderByDescending(v => v.VisitDate)
                    .Select(v => new
                    {
                        v.Id,
                        v.VisitDate,
                        v.DoctorUsername,
                        v.Diagnosis,
                        v.Treatment,
                        v.Notes,
                        v.CreatedAt
                    })
                    .ToListAsync();

                _logger.LogInformation("Found {Count} visits for patient {PatientId}", visits.Count, patientId);
                return Ok(visits);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting visits for patient {PatientId}", patientId);
                return StatusCode(500, "An error occurred while retrieving visits.");
            }
        }

        [HttpPost]
        [Authorize(Roles = "Doctor")]
        public async Task<ActionResult<Visit>> CreateVisit([FromBody] AddVisitDto visitDto)
        {
            try
            {
                _logger.LogInformation("Starting visit creation for patient {PatientId}", visitDto.PatientId);

                // Get current user (doctor) username
                var username = User.FindFirst(ClaimTypes.Name)?.Value;
                if (string.IsNullOrEmpty(username))
                {
                    _logger.LogWarning("Username not found in token");
                    return Unauthorized("Unable to identify doctor.");
                }

                _logger.LogInformation("Doctor username: {Username}", username);

                // Verify patient exists
                var patientExists = await _context.Patients.AnyAsync(p => p.Id == visitDto.PatientId);
                if (!patientExists)
                {
                    _logger.LogWarning("Patient {PatientId} not found in database", visitDto.PatientId);
                    return BadRequest($"Patient with ID {visitDto.PatientId} not found.");
                }

                _logger.LogInformation("Patient {PatientId} exists in database", visitDto.PatientId);

                // Validate required fields
                if (string.IsNullOrWhiteSpace(visitDto.Diagnosis))
                {
                    return BadRequest("Diagnosis is required.");
                }

                if (string.IsNullOrWhiteSpace(visitDto.Treatment))
                {
                    return BadRequest("Treatment is required.");
                }

                // Create Visit entity
                var visit = new Visit
                {
                    PatientId = visitDto.PatientId,
                    DoctorUsername = username,
                    Diagnosis = visitDto.Diagnosis.Trim(),
                    Treatment = visitDto.Treatment.Trim(),
                    Notes = string.IsNullOrWhiteSpace(visitDto.Notes) ? null : visitDto.Notes.Trim(),
                    VisitDate = DateTime.UtcNow,
                    CreatedAt = DateTime.UtcNow
                };

                _logger.LogInformation("Attempting to add visit to database: {@Visit}", new
                {
                    visit.PatientId,
                    visit.DoctorUsername,
                    DiagnosisLength = visit.Diagnosis.Length,
                    TreatmentLength = visit.Treatment.Length
                });

                // Add and save with detailed error handling
                _context.Visits.Add(visit);

                var changes = await _context.SaveChangesAsync();
                _logger.LogInformation("Database changes saved successfully. {Changes} records affected.", changes);

                _logger.LogInformation("Visit created successfully with ID: {VisitId}", visit.Id);

                // Return simplified response without loading related entities
                return Ok(new
                {
                    visit.Id,
                    visit.PatientId,
                    visit.DoctorUsername,
                    visit.Diagnosis,
                    visit.Treatment,
                    visit.Notes,
                    visit.VisitDate,
                    visit.CreatedAt,
                    Message = "Visit created successfully"
                });

            }
            catch (DbUpdateException dbEx)
            {
                _logger.LogError(dbEx, "Database update error while creating visit");

                // Log inner exception details
                if (dbEx.InnerException != null)
                {
                    _logger.LogError("Inner exception: {InnerException}", dbEx.InnerException.Message);
                }

                return StatusCode(500, new
                {
                    Error = "Database error occurred while creating visit",
                    Details = dbEx.InnerException?.Message ?? dbEx.Message
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unexpected error while creating visit");
                return StatusCode(500, new
                {
                    Error = "An unexpected error occurred",
                    Details = ex.Message
                });
            }
        }

        // PUT: api/Visits/5 - Update visit record
        [HttpPut("{id}")]
        [Authorize(Roles = "Doctor")]
        public async Task<IActionResult> UpdateVisit(int id, [FromBody] UpdateVisitsDto updateDto)
        {
            try
            {
                _logger.LogInformation("Updating visit {VisitId}", id);

                var existingVisit = await _context.Visits.FindAsync(id);
                if (existingVisit == null)
                {
                    _logger.LogWarning("Visit {VisitId} not found", id);
                    return NotFound($"Visit with ID {id} not found.");
                }

                // Validate current user is the doctor who created the visit or has permission
                var username = User.FindFirst(ClaimTypes.Name)?.Value;
                if (existingVisit.DoctorUsername != username)
                {
                    _logger.LogWarning("User {Username} not authorized to update visit {VisitId} created by {Creator}",
                        username, id, existingVisit.DoctorUsername);
                    return Forbid("You can only update visits that you created.");
                }

                // Validate required fields
                if (string.IsNullOrWhiteSpace(updateDto.Diagnosis))
                {
                    return BadRequest("Diagnosis is required.");
                }

                if (string.IsNullOrWhiteSpace(updateDto.Treatment))
                {
                    return BadRequest("Treatment is required.");
                }

                // Update properties from DTO
                existingVisit.Diagnosis = updateDto.Diagnosis.Trim();
                existingVisit.Treatment = updateDto.Treatment.Trim();
                existingVisit.Notes = string.IsNullOrWhiteSpace(updateDto.Notes) ? null : updateDto.Notes.Trim();
                existingVisit.UpdatedAt = DateTime.UtcNow;

                _logger.LogInformation("Updating visit {VisitId} with new data", id);

                await _context.SaveChangesAsync();

                _logger.LogInformation("Visit {VisitId} updated successfully", id);
                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!VisitExists(id))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating visit {VisitId}", id);
                return StatusCode(500, "An error occurred while updating the visit.");
            }
        }

        // GET: api/Visits/5 - Get specific visit
        [HttpGet("{id}")]
        public async Task<ActionResult<Visit>> GetVisit(int id)
        {
            try
            {
                var visit = await _context.Visits
                    .Include(v => v.Patient)
                    .FirstOrDefaultAsync(v => v.Id == id);

                if (visit == null)
                {
                    return NotFound();
                }

                return visit;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting visit {VisitId}", id);
                return StatusCode(500, "An error occurred while retrieving the visit.");
            }
        }

        private bool VisitExists(int id)
        {
            return _context.Visits.Any(e => e.Id == id);
        }
    }
}