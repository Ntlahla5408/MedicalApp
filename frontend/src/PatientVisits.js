import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert, Badge, Spinner } from 'react-bootstrap';
import axios from 'axios';

/**
 * PatientVisits Component - View and manage patient visit history
 */
const PatientVisits = ({ patient, show, onHide, onLogout }) => {
    const [visits, setVisits] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedVisit, setSelectedVisit] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        diagnosis: '',
        treatment: '',
        notes: ''
    });

    const API_BASE = 'https://localhost:7084/api';
    const currentUserRole = localStorage.getItem('userRole');
    const isDoctor = currentUserRole === 'Doctor';

    // Create axios instance with auth token
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

    // Load patient visits
    const loadPatientVisits = async () => {
        if (!patient) return;

        try {
            setLoading(true);
            console.log('Loading visits for patient:', patient.id);
            
            const response = await api.get(`/Visits/patient/${patient.id}`);
            setVisits(response.data);
            setError('');

        } catch (err) {
            console.error('Error loading visits:', err);
            if (err.response?.status === 404) {
                setError('Patient not found.');
            } else {
                setError('Failed to load visit history. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (patient && show) {
            loadPatientVisits();
        }
    }, [patient, show]);

    // Add New Visit - FIXED: Use correct DTO structure
    const handleAddVisit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setActionLoading(true);

        if (!formData.diagnosis.trim() || !formData.treatment.trim()) {
            setError('Diagnosis and Treatment are required fields.');
            setActionLoading(false);
            return;
        }

        try {
            console.log('Adding new visit for patient:', patient.id);

            // FIXED: Send only the required fields that match AddVisitDto
            const response = await api.post('/Visits', {
                patientId: patient.id,
                diagnosis: formData.diagnosis,
                treatment: formData.treatment,
                notes: formData.notes
                // Removed: patient, doctorId, visitDate, createdAt, updatedAt
            });

            console.log('Visit added successfully:', response.data);
            
            setSuccess('Visit record added successfully!');
            setFormData({ diagnosis: '', treatment: '', notes: '' });
            setShowAddModal(false);
            loadPatientVisits();

        } catch (err) {
            console.error('Error adding visit:', err);
            
            // Handle different error response formats
            let errorMessage = 'Failed to add visit record. Please try again.';
            
            if (err.response?.data) {
                // Handle ASP.NET Core ProblemDetails format
                if (typeof err.response.data === 'string') {
                    errorMessage = err.response.data;
                } else if (err.response.data.title) {
                    errorMessage = err.response.data.title;
                } else if (err.response.data.message) {
                    errorMessage = err.response.data.message;
                } else if (err.response.data.errors) {
                    // Handle validation errors
                    const validationErrors = Object.values(err.response.data.errors).flat();
                    errorMessage = validationErrors.join(', ');
                }
            } else if (err.response?.status === 403) {
                errorMessage = 'Access denied. Only Doctors can add visits.';
            } else if (err.response?.status === 400) {
                errorMessage = 'Validation error. Please check your input.';
            }
            
            setError(errorMessage);
        } finally {
            setActionLoading(false);
        }
    };

    // Edit Visit - FIXED: Use correct DTO structure
    const handleEditVisit = (visit) => {
        setSelectedVisit(visit);
        setFormData({
            diagnosis: visit.diagnosis || '',
            treatment: visit.treatment || '',
            notes: visit.notes || ''
        });
        setShowEditModal(true);
        setError('');
    };

    const handleUpdateVisit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setActionLoading(true);

        if (!formData.diagnosis.trim() || !formData.treatment.trim()) {
            setError('Diagnosis and Treatment are required fields.');
            setActionLoading(false);
            return;
        }

        try {
            console.log('Updating visit:', selectedVisit.id);

            // FIXED: Send only diagnosis, treatment, notes (matching UpdateVisitsDto)
            const response = await api.put(`/Visits/${selectedVisit.id}`, {
                diagnosis: formData.diagnosis,
                treatment: formData.treatment,
                notes: formData.notes
                // Removed: id, patientId, patient, doctor
            });

            console.log('Visit updated successfully:', response.data);
            
            setSuccess('Visit record updated successfully!');
            setShowEditModal(false);
            loadPatientVisits();

        } catch (err) {
            console.error('Error updating visit:', err);
            
            // Handle different error response formats
            let errorMessage = 'Failed to update visit record. Please try again.';
            
            if (err.response?.data) {
                // Handle ASP.NET Core ProblemDetails format
                if (typeof err.response.data === 'string') {
                    errorMessage = err.response.data;
                } else if (err.response.data.title) {
                    errorMessage = err.response.data.title;
                } else if (err.response.data.message) {
                    errorMessage = err.response.data.message;
                } else if (err.response.data.errors) {
                    // Handle validation errors
                    const validationErrors = Object.values(err.response.data.errors).flat();
                    errorMessage = validationErrors.join(', ');
                }
            } else if (err.response?.status === 403) {
                errorMessage = 'Access denied. Only Doctors can update visits.';
            } else if (err.response?.status === 404) {
                errorMessage = 'Visit not found.';
            } else if (err.response?.status === 400) {
                errorMessage = 'Validation error. Please check your input.';
            }
            
            setError(errorMessage);
        } finally {
            setActionLoading(false);
        }
    };

    const handleClose = () => {
        setVisits([]);
        setError('');
        setSuccess('');
        onHide();
    };

    const handleCloseAddModal = () => {
        setFormData({ diagnosis: '', treatment: '', notes: '' });
        setError('');
        setShowAddModal(false);
    };

    const handleCloseEditModal = () => {
        setSelectedVisit(null);
        setFormData({ diagnosis: '', treatment: '', notes: '' });
        setError('');
        setShowEditModal(false);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    if (!patient) {
        return (
            <Modal show={show} onHide={handleClose}>
                <Modal.Body>
                    <Alert variant="warning">No patient selected.</Alert>
                </Modal.Body>
            </Modal>
        );
    }

    return (
        <Modal show={show} onHide={handleClose} size="xl">
            <Modal.Header closeButton>
                <Modal.Title>
                    📋 Visit History - {patient.name} {patient.surname}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                {/* Patient Info */}
                <Card className="mb-4">
                    <Card.Body>
                        <Row>
                            <Col md={6}>
                                <strong>Patient:</strong> {patient.name} {patient.surname}<br/>
                                <strong>ID:</strong> {patient.id} | <strong>Username:</strong> {patient.username}
                            </Col>
                            <Col md={6}>
                                <strong>Contact:</strong> {patient.phone}<br/>
                                <strong>Email:</strong> {patient.email}
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Alerts */}
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

                {/* Actions */}
                {isDoctor && (
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6>Visit Records</h6>
                        <Button 
                            variant="success" 
                            size="sm"
                            onClick={() => setShowAddModal(true)}
                        >
                            ➕ Add New Visit
                        </Button>
                    </div>
                )}

                {/* Visits Table */}
                {loading ? (
                    <div className="text-center py-4">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading visits...</span>
                        </Spinner>
                        <p className="mt-2">Loading visit history...</p>
                    </div>
                ) : visits.length > 0 ? (
                    <div className="table-responsive">
                        <Table striped bordered hover size="sm">
                            <thead className="table-light">
                                <tr>
                                    <th>Visit Date</th>
                                    <th>Doctor</th>
                                    <th>Diagnosis</th>
                                    <th>Treatment</th>
                                    <th>Notes</th>
                                    {isDoctor && <th>Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {visits.map((visit) => (
                                    <tr key={visit.id}>
                                        <td>
                                            <small>{formatDate(visit.visitDate)}</small>
                                        </td>
                                        <td>
                                            <Badge bg="info">{visit.doctorUsername}</Badge>
                                        </td>
                                        <td>{visit.diagnosis}</td>
                                        <td>{visit.treatment}</td>
                                        <td>
                                            {visit.notes ? (
                                                <small className="text-muted">{visit.notes}</small>
                                            ) : (
                                                <span className="text-muted">-</span>
                                            )}
                                        </td>
                                        {isDoctor && (
                                            <td>
                                                <Button 
                                                    variant="outline-primary" 
                                                    size="sm"
                                                    onClick={() => handleEditVisit(visit)}
                                                >
                                                    Edit
                                                </Button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </div>
                ) : (
                    <Alert variant="info" className="text-center">
                        No visit records found for this patient.
                        {isDoctor && (
                            <div className="mt-2">
                                <Button 
                                    variant="success" 
                                    size="sm"
                                    onClick={() => setShowAddModal(true)}
                                >
                                    Add First Visit
                                </Button>
                            </div>
                        )}
                    </Alert>
                )}
            </Modal.Body>

            {/* Add Visit Modal */}
            <Modal show={showAddModal} onHide={handleCloseAddModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Add New Visit</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleAddVisit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Diagnosis *</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={formData.diagnosis}
                                onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                                placeholder="Enter diagnosis..."
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Treatment *</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={formData.treatment}
                                onChange={(e) => setFormData({...formData, treatment: e.target.value})}
                                placeholder="Enter treatment plan..."
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Notes</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                value={formData.notes}
                                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                placeholder="Additional notes (optional)..."
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseAddModal} disabled={actionLoading}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={actionLoading}>
                            {actionLoading ? 'Adding...' : 'Add Visit'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Edit Visit Modal */}
            <Modal show={showEditModal} onHide={handleCloseEditModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit Visit Record</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleUpdateVisit}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Diagnosis *</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={formData.diagnosis}
                                onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
                                placeholder="Enter diagnosis..."
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Treatment *</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={formData.treatment}
                                onChange={(e) => setFormData({...formData, treatment: e.target.value})}
                                placeholder="Enter treatment plan..."
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label>Notes</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                value={formData.notes}
                                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                placeholder="Additional notes (optional)..."
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseEditModal} disabled={actionLoading}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={actionLoading}>
                            {actionLoading ? 'Updating...' : 'Update Visit'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Modal>
    );
};

export default PatientVisits;