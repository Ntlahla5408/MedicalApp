using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Numerics;
using System.Reflection;
using WebApplication1.Data;
using WebApplication1.Dtos;
using WebApplication1.Models.Entities;

namespace WebApplication1.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Assistant,Doctor")]
    public class PatientsController : ControllerBase
    {
        private readonly ApplicationDbContext dbcontext;

        public PatientsController(ApplicationDbContext dbcontext)
        {
            this.dbcontext = dbcontext;
        }

        // GET: api/Patients - View all patients (Assistant, Doctor, Admin)
        //[HttpGet]
        //public async Task<ActionResult<IEnumerable<object>>> GetPatients()
        //{
        //    var patients = await dbcontext.Patients
        //        .Where(p => p.IsActive)
        //        .Select(p => new
        //        {
        //            p.Id,
        //            p.Name,
        //            p.Surname,
        //            p.Username,
        //            p.Gender,
        //            p.Email,
        //            p.Phone,
        //            p.HasMedicalAid,
        //            p.MedicalAidCompany,
        //            p.CreatedAt
        //        })
        //        .ToListAsync();

        //    return Ok(patients);
        //}

        [HttpGet]
        public IActionResult GetAllPatients()
        {
            //var allPatients = dbcontext.Patients.ToList();
            //return Ok(allPatients);
            return Ok(dbcontext.Patients.ToList());
        }

        // GET: api/Patients/5 - Get patient by ID
        //[HttpGet("{id}")]
        //public async Task<ActionResult<Patient>> GetPatient(int id)
        //{
        //    var patient = await dbcontext.Patients
        //        .FirstOrDefaultAsync(p => p.Id == id && p.IsActive);

        //    if (patient == null)
        //    {
        //        return NotFound();
        //    }

        //    return patient;
        //}
        
        [HttpGet("search/{name}/{surname}/{username}")]
        public async Task<IActionResult> GetOnePatient(string name, string surname, string username)
        {
            var findpatient = await dbcontext.Patients
    .FirstOrDefaultAsync(p => p.Name == name || p.Surname == surname || p.Username == username);

            if (findpatient == null)
            {
                return NotFound();
            }

            //var patient = dbcontext.Patients.Find(id);
            //if(patient == null)
            //{
            //    return NotFound();
            //}
            return Ok(findpatient);
        }
        //// POST: api/Patients - Add new patient (Assistant only)
        //[HttpPost]
        //[Authorize(Roles = "Assistant,Admin")]
        //public async Task<ActionResult<Patient>> CreatePatient(Patient patient)
        //{
        //    // Validate medical aid
        //    if (patient.HasMedicalAid && string.IsNullOrEmpty(patient.MedicalAidCompany))
        //    {
        //        return BadRequest("Medical aid company is required when medical aid is selected.");
        //    }

        //    if (!patient.HasMedicalAid)
        //    {
        //        patient.MedicalAidCompany = null;
        //    }

        //    // Check if username already exists
        //    if (await dbcontext.Patients.AnyAsync(p => p.Username == patient.Username))
        //    {
        //        return BadRequest("Username already exists.");
        //    }

        //    patient.CreatedAt = DateTime.UtcNow;
        //    patient.IsActive = true;

        //    dbcontext.Patients.Add(patient);
        //    await dbcontext.SaveChangesAsync();

        //    return CreatedAtAction(nameof(GetOnePatient), new { id = patient.Id }, patient);
        //}

        [HttpPost]
        [Authorize(Roles = "Assistant")]
        public IActionResult AddPatient(AddPatientDto addPatientDto)
        {

            var patiententity = new Patient()
            {
                Name = addPatientDto.Name,
                Surname = addPatientDto.Surname,
                Username = addPatientDto.Username,
                Gender = addPatientDto.Gender,
                HomeAddress = addPatientDto.HomeAddress,
                Email = addPatientDto.Email,
                Phone = addPatientDto.Phone,
                HasMedicalAid = addPatientDto.HasMedicalAid,
                MedicalAidCompany = addPatientDto.MedicalAidCompany,
            };

            // Validate medical aid logic
            if (addPatientDto.HasMedicalAid && string.IsNullOrEmpty(addPatientDto.MedicalAidCompany))
            {
                return BadRequest("Medical aid company is required when medical aid is selected.");
            }


            dbcontext.Patients.Add(patiententity);
            dbcontext.SaveChanges();
            return Ok(patiententity);
        }

        // PUT: api/Patients/5 - Update patient (Assistant only)
        ////[HttpPut("{id}")]
        ////[Authorize(Roles = "Assistant,Admin")]
        ////public async Task<IActionResult> UpdatePatient(int id, Patient patient)
        ////{
        ////    if (id != patient.Id)
        ////    {
        ////        return BadRequest();
        ////    }

        ////    var existingPatient = await dbcontext.Patients.FindAsync(id);
        ////    if (existingPatient == null || !existingPatient.IsActive)
        ////    {
        ////        return NotFound();
        ////    }

        ////    // Validate medical aid
        ////    if (patient.HasMedicalAid && string.IsNullOrEmpty(patient.MedicalAidCompany))
        ////    {
        ////        return BadRequest("Medical aid company is required when medical aid is selected.");
        ////    }

        ////    if (!patient.HasMedicalAid)
        ////    {
        ////        patient.MedicalAidCompany = null;
        ////    }

        ////    // Update properties
        ////    existingPatient.Name = patient.Name;
        ////    existingPatient.Surname = patient.Surname;
        ////    existingPatient.Username = patient.Username;
        ////    existingPatient.Gender = patient.Gender;
        ////    existingPatient.HomeAddress = patient.HomeAddress;
        ////    existingPatient.Email = patient.Email;
        ////    existingPatient.Phone = patient.Phone;
        ////    existingPatient.HasMedicalAid = patient.HasMedicalAid;
        ////    existingPatient.MedicalAidCompany = patient.MedicalAidCompany;
        ////    existingPatient.UpdatedAt = DateTime.UtcNow;

        ////    try
        ////    {
        ////        await dbcontext.SaveChangesAsync();
        ////    }
        ////    catch (DbUpdateConcurrencyException)
        ////    {
        ////        if (!PatientExists(id))
        ////        {
        ////            return NotFound();
        ////        }
        ////        else
        ////        {
        ////            throw;
        ////        }
        ////    }

        ////    return NoContent();
        ////}

        [HttpPut]
        [Authorize(Roles = "Assistant")]
        public async Task<IActionResult> UpdatePatient(
            [FromQuery] string name,
            [FromQuery] string surname,
            [FromQuery] string username,
            [FromBody] UpdatePatientDto updatePatientDto) // Add [FromBody]
        {
            var updatepatient = await dbcontext.Patients
                .FirstOrDefaultAsync(p => p.Name == name || p.Surname == surname || p.Username == username);

            if (updatepatient == null)
            {
                return NotFound();
            }

            updatepatient.Name = updatePatientDto.Name;
            updatepatient.Surname = updatePatientDto.Surname;
            updatepatient.Username = updatePatientDto.Username;
            updatepatient.Gender = updatePatientDto.Gender;
            updatepatient.HomeAddress = updatePatientDto.HomeAddress;
            updatepatient.Email = updatePatientDto.Email;
            updatepatient.Phone = updatePatientDto.Phone;
            updatepatient.HasMedicalAid = updatePatientDto.HasMedicalAid;
            updatepatient.MedicalAidCompany = updatePatientDto.MedicalAidCompany;

            await dbcontext.SaveChangesAsync(); // Add await
            return Ok(updatepatient);
        }

        // DELETE: api/Patients/5 - Soft delete patient (Assistant only)
        //[HttpDelete("{id}")]
        //[Authorize(Roles = "Assistant,Admin")]
        //public async Task<IActionResult> DeletePatient(int id)
        //{
        //    var patient = await dbcontext.Patients.FindAsync(id);
        //    if (patient == null || !patient.IsActive)
        //    {
        //        return NotFound();
        //    }

        //    patient.IsActive = false;
        //    patient.UpdatedAt = DateTime.UtcNow;

        //    await dbcontext.SaveChangesAsync();

        //    return NoContent();
        //}

        [HttpDelete("by-credentials/{name}/{surname}/{username}")]
        [Authorize(Roles = "Assistant")]
        public async Task<IActionResult> DeletePatient(string name, string surname, string username)
        {
            var deletepatient = await dbcontext.Patients
    .FirstOrDefaultAsync(p => p.Name == name || p.Surname == surname || p.Username == username);

            if (deletepatient == null)
            {
                return NotFound();
            }

            dbcontext.Patients.Remove(deletepatient);
            dbcontext.SaveChanges();
            return Ok(deletepatient);
        }

        // GET: api/Patients/search?term=john - Search patients
        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<object>>> SearchPatients([FromQuery] string term)
        {
            if (string.IsNullOrWhiteSpace(term))
            {
                return BadRequest("Search term is required.");
            }

            // REMOVED: p.IsActive && 
            var patients = await dbcontext.Patients
                .Where(p => p.Name.Contains(term) ||
                           p.Surname.Contains(term) ||
                           p.Username.Contains(term))
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Surname,
                    p.Username,
                    p.Gender,
                    p.Email,
                    p.Phone,
                    p.HasMedicalAid,
                    p.MedicalAidCompany
                })
                .ToListAsync();

            return Ok(patients);
        }
    }
}