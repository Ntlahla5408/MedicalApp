# Medical Practice Management System

A full-stack academic project for managing patient information and recording medical visits. The repository contains an ASP.NET Core Web API, SQL Server data layer and React-based user interfaces.

## Project capabilities

The implemented API and interface code covers:

- **Authentication:** username/password login with JSON Web Token (JWT) authentication.
- **Role-based access:** Admin, Doctor and Assistant roles.
- **User administration:** administrator endpoints for listing users, registering accounts and updating user roles.
- **Patient records:** patient details, contact information and medical-aid information, with patient creation, retrieval, update and deletion workflows in the application.
- **Visit records:** recording and retrieving a patient's visit history, including diagnosis, treatment, notes, visit date and the associated doctor.
- **API documentation:** Swagger/OpenAPI configuration for the backend in development.

The project uses password hashing for stored user passwords and Entity Framework Core migrations to manage the database schema.

## Technology stack

| Area | Technologies |
|---|---|
| Backend | C#, ASP.NET Core Web API, .NET 8 |
| Data access | Entity Framework Core |
| Database | Microsoft SQL Server |
| Authentication | JWT Bearer authentication, BCrypt |
| Frontend | React, JavaScript, React Router |
| UI | React Bootstrap, Bootstrap |
| HTTP requests | Axios |
| API exploration | Swagger / OpenAPI |

## Repository structure

```text
MedicalApp/
├── Backend/
│   └── WebApplication1/
│       ├── Controllers/       # Authentication, patient and visit endpoints
│       ├── Data/              # EF Core context and database seeding
│       ├── Dtos/              # API request and response models
│       ├── Migrations/        # EF Core database migrations
│       └── Models/Entities/   # User, patient and visit entities
├── front/                     # React application (earlier interface)
├── frontend/                  # Separate React application/interface
└── README.md
```

## Important repository notes

There are currently two React application directories, `front/` and `frontend/`. They contain different application code and should not be assumed to be interchangeable. The intended/current frontend entry point should be confirmed before following a single frontend setup path.

The frontend source contains locally configured API addresses. When running the application, ensure the frontend's configured API base URL matches the backend's actual local address and port.

## Local development prerequisites

- .NET 8 SDK
- Microsoft SQL Server
- Node.js and npm
- Visual Studio or another C# development environment
- A modern web browser

### Backend

1. Configure a local SQL Server connection string using your own development settings.
2. Configure the JWT issuer, audience and signing key through local configuration or environment variables.
3. Open a terminal in `Backend/WebApplication1`.
4. Restore dependencies and run the API:

```bash
dotnet restore
dotnet run
```

In the development environment, the API is configured to expose Swagger.

### Frontend

Both `front/` and `frontend/` contain React application manifests with the Create React App development scripts. First identify which interface you intend to run, then open a terminal in that folder:

```bash
npm install
npm start
```

Confirm that its configured API base URL matches the running backend.

## Scope and limitations

This repository represents an academic software-development project. It is not presented as a production-ready clinical system. Do not use real patient information when testing or demonstrating it. A production deployment would require additional security, privacy, operational and clinical-governance review.

## Repository

[View MedicalApp on GitHub](https://github.com/Ntlahla5408/MedicalApp)
