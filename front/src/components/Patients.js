// src/components/Patients.js
import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Button, Form, Alert, Badge, Spinner, ButtonGroup, InputGroup, Modal } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import AddPatient from './AddPatient';
import EditPatient from './EditPatient';

const Patients = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [filteredData, setFilteredData] = useState([]);
    const [localSearchTerm, setLocalSearchTerm] = useState('');

    const { user: currentUser, API_BASE } = useAuth();
    const canModifyPatients = currentUser?.role === 'Assistant';

    // Create axios instance with auth interceptor
    const api = axios.create({
        baseURL: API_BASE,
    });

    // Add JWT token to all requests
    api.interceptors.request.use((config) => {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    const loadPatientsFromAPI = async () => {
        try {
            setLoading(true);
            const response = await api.get('/Patients');
            setData(response.data);
            setFilteredData(response.data);
            setError(null);
        } catch (err) {
            console.error('Error fetching patients:', err);
            if (err.response?.status === 401) {
                setError('Please login to access patient data.');
            } else if (err.response?.status === 403) {
                setError('Access denied. You do not have permission to view patients.');
            } else {
                setError(`Failed to load patients: ${err.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPatientsFromAPI();
    }, []);

    // Local search/filter function
    useEffect(() => {
        if (localSearchTerm.trim() === '') {
            setFilteredData(data);
        } else {
            const term = localSearchTerm.toLowerCase();
            const filtered = data.filter(patient =>
                patient.name?.toLowerCase().includes(term) ||
                patient.surname?.toLowerCase().includes(term) ||
                patient.username?.toLowerCase().includes(term)
            );
            setFilteredData(filtered);
        }
    }, [localSearchTerm, data]);

    const handleDeletePatient = async (name, surname, username) => {
        if (window.confirm(`Are you sure you want to delete ${name} ${surname}?`)) {
            try {
                await api.delete(`/Patients/by-credentials/${name}/${surname}/${username}`);
                loadPatientsFromAPI();
            } catch (err) {
                console.error('Error deleting patient:', err);
                if (err.response?.status === 403) {
                    setError('Access denied. You do not have permission to delete patients.');
                } else {
                    setError('Failed to delete patient.');
                }
            }
        }
    };

    const handleEditPatient = (patient) => {
        setSelectedPatient(patient);
        setShowEditModal(true);
    };

    const handlePatientAdded = () => {
        loadPatientsFromAPI();
        setShowAddModal(false);
    };

    const handlePatientUpdated = () => {
        loadPatientsFromAPI();
        setShowEditModal(false);
    };

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                    <p className="mt-2">Loading patients from database...</p>
                </div>
            </Container>
        );
    }

    return (
        <Container fluid className="p-4">
            {/* Header Section */}
            <Row className="align-items-center mb-4">
                <Col>
                    <h1 className="text-primary mb-1 fw-bold">👥 Patient Management</h1>
                    <p className="text-muted mb-0">
                        Welcome, <strong>{currentUser.username}</strong> 
                        <Badge bg="secondary" className="ms-2">{currentUser.role}</Badge>
                    </p>
                </Col>
                <Col xs="auto">
                    {canModifyPatients && (
                        <Button 
                            variant="success" 
                            className="me-2"
                            onClick={() => setShowAddModal(true)}
                        >
                            ➕ Add Patient
                        </Button>
                    )}
                </Col>
            </Row>

            {/* Local Search Bar */}
            <Row className="mb-3">
                <Col md={6}>
                    <InputGroup>
                        <Form.Control
                            type="text"
                            placeholder="Quick search by name, surname, or username..."
                            value={localSearchTerm}
                            onChange={(e) => setLocalSearchTerm(e.target.value)}
                        />
                        {localSearchTerm && (
                            <Button 
                                variant="outline-secondary" 
                                onClick={() => setLocalSearchTerm('')}
                            >
                                Clear
                            </Button>
                        )}
                    </InputGroup>
                    <small className="text-muted">
                        Showing {filteredData.length} of {data.length} patients
                        {localSearchTerm && ` - filtered by "${localSearchTerm}"`}
                    </small>
                </Col>
            </Row>

            {error && (
                <Alert variant="danger" className="mb-3">
                    {error}
                </Alert>
            )}

            {/* Patient Data Table */}
            <Row>
                <Col>
                    <Card>
                        <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-semibold">📋 Patient Records</h5>
                            <Badge bg="primary" className="fs-6">{filteredData.length} patient(s)</Badge>
                        </Card.Header>
                        <Card.Body>
                            {filteredData.length > 0 ? (
                                <div className="table-responsive">
                                    <Table striped hover>
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Name</th>
                                                <th>Surname</th>
                                                <th>Username</th>
                                                <th>Gender</th>
                                                <th>Email</th>
                                                <th>Phone</th>
                                                <th>Medical Aid</th>
                                                <th>Medical Aid Company</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredData.map((patient) => (
                                                <tr key={patient.id}>
                                                    <td className="fw-semibold">#{patient.id}</td>
                                                    <td>{patient.name}</td>
                                                    <td>{patient.surname}</td>
                                                    <td>{patient.username}</td>
                                                    <td>
                                                        <Badge bg="info">{patient.gender}</Badge>
                                                    </td>
                                                    <td>{patient.email}</td>
                                                    <td>{patient.phone}</td>
                                                    <td>
                                                        <Badge bg={patient.hasMedicalAid ? 'success' : 'secondary'}>
                                                            {patient.hasMedicalAid ? 'Yes' : 'No'}
                                                        </Badge>
                                                    </td>
                                                    <td>{patient.medicalAidCompany || 'N/A'}</td>
                                                    <td>
                                                        <ButtonGroup size="sm">
                                                            <Button 
                                                                variant="outline-primary"
                                                                onClick={() => handleEditPatient(patient)}
                                                                disabled={!canModifyPatients}
                                                                title={
                                                                    !canModifyPatients 
                                                                        ? 'Only Assistants can edit patients' 
                                                                        : 'Edit patient'
                                                                }
                                                            >
                                                                ✏️ Edit
                                                            </Button>
                                                            <Button 
                                                                variant="outline-danger"
                                                                onClick={() => handleDeletePatient(
                                                                    patient.name, 
                                                                    patient.surname, 
                                                                    patient.username
                                                                )}
                                                                disabled={!canModifyPatients}
                                                                title={
                                                                    !canModifyPatients 
                                                                        ? 'Only Assistants can delete patients' 
                                                                        : 'Delete patient'
                                                                }
                                                            >
                                                                🗑️ Delete
                                                            </Button>
                                                        </ButtonGroup>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="text-center text-muted py-4">
                                    {localSearchTerm 
                                        ? `No patients found matching "${localSearchTerm}"` 
                                        : 'No patients found in the database'
                                    }
                                    {!localSearchTerm && canModifyPatients && (
                                        <div className="mt-2">
                                            <Button 
                                                variant="success" 
                                                onClick={() => setShowAddModal(true)}
                                            >
                                                ➕ Add First Patient
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Add Patient Modal */}
            <AddPatient 
                show={showAddModal}
                onHide={() => setShowAddModal(false)}
                onPatientAdded={handlePatientAdded}
            />

            {/* Edit Patient Modal */}
            <EditPatient 
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                patient={selectedPatient}
                onPatientUpdated={handlePatientUpdated}
            />
        </Container>
    );
};

export default Patients;