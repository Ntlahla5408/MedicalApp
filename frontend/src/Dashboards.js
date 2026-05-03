import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Badge, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import DoctorPatientSearch from './DoctorPatientSearch'; // Add this import
import PatientVisits from './PatientVisits'; // Add this import

/**
 * Dashboard Component - Overview of the medical system
 * Shows key metrics and provides quick access to features
 */
const Dashboard = ({ onLogout }) => {
    const [stats, setStats] = useState({
        totalPatients: 0,
        patientsWithMedicalAid: 0,
        patientsWithoutMedicalAid: 0,
        recentPatients: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    
    // Add these state variables for Doctor functionality
    const [showDoctorSearch, setShowDoctorSearch] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [showPatientVisits, setShowPatientVisits] = useState(false);

    const API_BASE = 'https://localhost:7084/api';
    const currentUserRole = localStorage.getItem('userRole');
    const currentUsername = localStorage.getItem('username');

    // Create axios instance with auth interceptor
    const api = axios.create({
        baseURL: API_BASE,
    });

    // Add JWT token to requests
    api.interceptors.request.use((config) => {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    // Load dashboard data
    const loadDashboardData = async () => {
        try {
            setLoading(true);
            console.log('Loading dashboard data...');

            // Get all patients
            const response = await api.get('/Patients');
            const patients = response.data;

            // Calculate statistics
            const totalPatients = patients.length;
            const patientsWithMedicalAid = patients.filter(p => p.hasMedicalAid).length;
            const patientsWithoutMedicalAid = totalPatients - patientsWithMedicalAid;
            
            // Get recent patients (last 5)
            const recentPatients = patients
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5);

            setStats({
                totalPatients,
                patientsWithMedicalAid,
                patientsWithoutMedicalAid,
                recentPatients
            });

            setError('');

        } catch (err) {
            console.error('Error loading dashboard data:', err);
            if (err.response?.status === 401) {
                setError('Please login to access dashboard.');
            } else {
                setError('Failed to load dashboard data. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        } else {
            localStorage.removeItem('jwtToken');
            localStorage.removeItem('username');
            localStorage.removeItem('userRole');
        }
        window.location.href = '/login';
    };

    const canModifyPatients = currentUserRole === 'Assistant';

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="text-center">
                    <Spinner animation="border" role="status" className="mb-3">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                    <p>Loading dashboard...</p>
                </div>
            </Container>
        );
    }

    return (
        <Container fluid className="p-4 bg-light min-vh-100">
            {/* Header */}
            <Row className="align-items-center mb-4">
                <Col>
                    <h1 className="text-primary mb-1">Medical System Dashboard</h1>
                    <p className="text-muted mb-0">
                        Welcome back, <strong>{currentUsername}</strong>
                        <Badge bg="secondary" className="ms-2">{currentUserRole}</Badge>
                    </p>
                </Col>
                <Col xs="auto">
                    <Button variant="outline-danger" onClick={handleLogout}>
                        Logout
                    </Button>
                </Col>
            </Row>

            {error && (
                <Alert variant="danger" className="mb-4">
                    {error}
                </Alert>
            )}

            {/* Quick Actions */}
            <Row className="mb-4">
                <Col>
                    <h5 className="mb-3">Quick Actions</h5>
                    <div className="d-flex gap-2 flex-wrap">
                        <Button 
                            variant="primary" 
                            onClick={() => navigate('/patients')}
                        >
                            📋 View All Patients
                        </Button>
                        {canModifyPatients && (
                            <Button 
                                variant="success" 
                                onClick={() => navigate('/patients')}
                            >
                                ➕ Add New Patient
                            </Button>
                        )}
                        <Button 
                            variant="info" 
                            onClick={() => navigate('/patients')}
                        >
                            🔍 Search Patients
                        </Button>
                        
                        {/* Doctor-specific actions */}
                        {currentUserRole === 'Doctor' && (
                            <Button 
                                variant="warning" 
                                onClick={() => setShowDoctorSearch(true)}
                            >
                                🩺 Doctor Search
                            </Button>
                        )}
                        
                        {/* Admin actions */}
                        {currentUserRole === 'Admin' && (
                            <Button 
                                variant="warning" 
                                onClick={() => navigate('/users')}
                            >
                                👥 Manage Users
                            </Button>
                        )}
                    </div>
                </Col>
            </Row>

            {/* Statistics Cards */}
            <Row className="mb-4">
                <Col md={4} className="mb-3">
                    <Card className="h-100 shadow-sm border-0">
                        <Card.Body className="text-center">
                            <div className="text-primary mb-2">
                                <i className="fas fa-users fa-2x"></i>
                            </div>
                            <h3 className="text-primary">{stats.totalPatients}</h3>
                            <Card.Title>Total Patients</Card.Title>
                            <Card.Text className="text-muted">
                                All patients in the system
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                
                <Col md={4} className="mb-3">
                    <Card className="h-100 shadow-sm border-0">
                        <Card.Body className="text-center">
                            <div className="text-success mb-2">
                                <i className="fas fa-heartbeat fa-2x"></i>
                            </div>
                            <h3 className="text-success">{stats.patientsWithMedicalAid}</h3>
                            <Card.Title>With Medical Aid</Card.Title>
                            <Card.Text className="text-muted">
                                Patients covered by medical insurance
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
                
                <Col md={4} className="mb-3">
                    <Card className="h-100 shadow-sm border-0">
                        <Card.Body className="text-center">
                            <div className="text-warning mb-2">
                                <i className="fas fa-file-medical fa-2x"></i>
                            </div>
                            <h3 className="text-warning">{stats.patientsWithoutMedicalAid}</h3>
                            <Card.Title>Without Medical Aid</Card.Title>
                            <Card.Text className="text-muted">
                                Patients paying out of pocket
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Recent Patients & System Info */}
            <Row>
                {/* Recent Patients */}
                <Col lg={8} className="mb-4">
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white border-0">
                            <h5 className="mb-0">📄 Recent Patients</h5>
                        </Card.Header>
                        <Card.Body>
                            {stats.recentPatients.length > 0 ? (
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Username</th>
                                                <th>Email</th>
                                                <th>Phone</th>
                                                <th>Medical Aid</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats.recentPatients.map(patient => (
                                                <tr key={patient.id} style={{cursor: 'pointer'}} 
                                                    onClick={() => navigate('/patients')}>
                                                    <td>
                                                        <strong>{patient.name} {patient.surname}</strong>
                                                    </td>
                                                    <td>{patient.username}</td>
                                                    <td>{patient.email}</td>
                                                    <td>{patient.phone}</td>
                                                    <td>
                                                        <Badge bg={patient.hasMedicalAid ? 'success' : 'secondary'}>
                                                            {patient.hasMedicalAid ? 'Yes' : 'No'}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center text-muted py-4">
                                    <p>No patients found in the system.</p>
                                    {canModifyPatients && (
                                        <Button 
                                            variant="success" 
                                            onClick={() => navigate('/patients')}
                                        >
                                            Add Your First Patient
                                        </Button>
                                    )}
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                {/* System Information */}
                <Col lg={4}>
                    <Card className="shadow-sm border-0 h-100">
                        <Card.Header className="bg-white border-0">
                            <h5 className="mb-0">⚙️ System Information</h5>
                        </Card.Header>
                        <Card.Body>
                            <div className="mb-3">
                                <strong>Logged in as:</strong>
                                <div className="mt-1">
                                    <Badge bg="primary">{currentUsername}</Badge>
                                    <Badge bg="secondary" className="ms-1">{currentUserRole}</Badge>
                                </div>
                            </div>
                            
                            <div className="mb-3">
                                <strong>Permissions:</strong>
                                <ul className="mt-1 mb-0">
                                    <li>View patients ✓</li>
                                    <li>Search patients ✓</li>
                                    {currentUserRole === 'Doctor' && <li>Manage visits ✓</li>}
                                    {canModifyPatients ? (
                                        <>
                                            <li>Add patients ✓</li>
                                            <li>Edit patients ✓</li>
                                            <li>Delete patients ✓</li>
                                        </>
                                    ) : (
                                        <>
                                            <li>Add patients ✗</li>
                                            <li>Edit patients ✗</li>
                                            <li>Delete patients ✗</li>
                                        </>
                                    )}
                                    {currentUserRole === 'Admin' && <li>Manage users ✓</li>}
                                </ul>
                            </div>

                            <div className="mb-3">
                                <strong>Last Updated:</strong>
                                <div className="text-muted">
                                    {new Date().toLocaleString()}
                                </div>
                            </div>

                            <div className="text-center mt-4">
                                <Button 
                                    variant="outline-primary" 
                                    size="sm"
                                    onClick={loadDashboardData}
                                    disabled={loading}
                                >
                                    {loading ? 'Refreshing...' : 'Refresh Data'}
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Footer */}
            <Row className="mt-4">
                <Col>
                    <div className="text-center text-muted">
                        <small>
                            Medical System v1.0 • Connected to: {API_BASE} • 
                            Last sync: {new Date().toLocaleTimeString()}
                        </small>
                    </div>
                </Col>
            </Row>

            {/* Doctor Search Modal */}
            <DoctorPatientSearch 
                show={showDoctorSearch}
                onHide={() => setShowDoctorSearch(false)}
                onPatientSelect={(patient) => {
                    setSelectedPatient(patient);
                    setShowPatientVisits(true);
                }}
            />

            {/* Patient Visits Modal */}
            <PatientVisits 
                patient={selectedPatient}
                show={showPatientVisits}
                onHide={() => setShowPatientVisits(false)}
                onLogout={onLogout}
            />
        </Container>
    );
};

export default Dashboard;