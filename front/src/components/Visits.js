// src/components/Visits.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert, Badge, Spinner, InputGroup, ButtonGroup } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Visits = () => {
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [visits, setVisits] = useState([]);
    const [showAddVisitModal, setShowAddVisitModal] = useState(false);
    const [showEditVisitModal, setShowEditVisitModal] = useState(false);
    const [selectedVisit, setSelectedVisit] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [searchBy, setSearchBy] = useState('all');

    const [visitFormData, setVisitFormData] = useState({
        patientId: '',
        diagnosis: '',
        treatment: '',
        notes: ''
    });

    const { user: currentUser, API_BASE } = useAuth();
    const isDoctor = currentUser?.role === 'Doctor';
    const canViewVisits = ['Doctor', 'Admin', 'Assistant'].includes(currentUser?.role);

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

    // Load all patients for search
    const loadPatients = async () => {
        try {
            setLoading(true);
            const response = await api.get('/Patients');
            setPatients(response.data);
            setError('');
        } catch (err) {
            console.error('Error loading patients:', err);
            if (err.response?.status === 401) {
                setError('Please login to access patient data.');
            } else if (err.response?.status === 403) {
                setError('Access denied. You do not have permission to view patients.');
            } else {
                setError('Failed to load patients. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    // Load visits for selected patient
    const loadPatientVisits = async (patientId) => {
        try {
            setActionLoading(true);
            const response = await api.get(`/Visits/patient/${patientId}`);
            setVisits(response.data);
            setError('');
        } catch (err) {
            console.error('Error loading visits:', err);
            setError('Failed to load visit history. Please try again.');
        } finally {
            setActionLoading(false);
        }
    };

    useEffect(() => {
        if (canViewVisits) {
            loadPatients();
        }
    }, [canViewVisits]);

    // Filter patients based on search
    const filteredPatients = patients.filter(patient => {
        if (!searchTerm.trim()) return true;
        
        const term = searchTerm.toLowerCase();
        switch (searchBy) {
            case 'id':
                return patient.id.toString().includes(term);
            case 'name':
                return patient.name?.toLowerCase().includes(term);
            case 'surname':
                return patient.surname?.toLowerCase().includes(term);
            case 'username':
                return patient.username?.toLowerCase().includes(term);
            case 'all':
            default:
                return (
                    patient.id.toString().includes(term) ||
                    patient.name?.toLowerCase().includes(term) ||
                    patient.surname?.toLowerCase().includes(term) ||
                    patient.username?.toLowerCase().includes(term)
                );
        }
    });

    const handlePatientSelect = (patient) => {
        setSelectedPatient(patient);
        loadPatientVisits(patient.id);
    };

    const handleAddVisit = (patient) => {
        setSelectedPatient(patient);
        setVisitFormData({
            patientId: patient.id,
            diagnosis: '',
            treatment: '',
            notes: ''
        });
        setShowAddVisitModal(true);
        setError('');
    };

    const handleSubmitVisit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setActionLoading(true);

        if (!visitFormData.diagnosis.trim() || !visitFormData.treatment.trim()) {
            setError('Diagnosis and Treatment are required fields.');
            setActionLoading(false);
            return;
        }

        try {
            const response = await api.post('/Visits', visitFormData);
            
            setSuccess('✅ Visit record added successfully!');
            setShowAddVisitModal(false);
            setVisitFormData({
                patientId: '',
                diagnosis: '',
                treatment: '',
                notes: ''
            });
            
            // Reload visits for the patient
            if (selectedPatient) {
                loadPatientVisits(selectedPatient.id);
            }

        } catch (err) {
            console.error('Error adding visit:', err);
            if (err.response?.status === 400) {
                setError(err.response.data || 'Validation error. Please check your input.');
            } else if (err.response?.status === 403) {
                setError('Access denied. Only Doctors can add visit records.');
            } else {
                setError('Failed to add visit record. Please try again.');
            }
        } finally {
            setActionLoading(false);
        }
    };

    const handleEditVisit = (visit) => {
        setSelectedVisit(visit);
        setVisitFormData({
            patientId: selectedPatient?.id || '',
            diagnosis: visit.diagnosis || '',
            treatment: visit.treatment || '',
            notes: visit.notes || ''
        });
        setShowEditVisitModal(true);
        setError('');
    };

    const handleUpdateVisit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setActionLoading(true);

        if (!visitFormData.diagnosis.trim() || !visitFormData.treatment.trim()) {
            setError('Diagnosis and Treatment are required fields.');
            setActionLoading(false);
            return;
        }

        try {
            await api.put(`/Visits/${selectedVisit.id}`, {
                diagnosis: visitFormData.diagnosis,
                treatment: visitFormData.treatment,
                notes: visitFormData.notes
            });
            
            setSuccess('✅ Visit record updated successfully!');
            setShowEditVisitModal(false);
            setVisitFormData({
                patientId: '',
                diagnosis: '',
                treatment: '',
                notes: ''
            });
            
            // Reload visits for the patient
            if (selectedPatient) {
                loadPatientVisits(selectedPatient.id);
            }

        } catch (err) {
            console.error('Error updating visit:', err);
            if (err.response?.status === 400) {
                setError(err.response.data || 'Validation error. Please check your input.');
            } else if (err.response?.status === 404) {
                setError('Visit not found.');
            } else {
                setError('Failed to update visit record. Please try again.');
            }
        } finally {
            setActionLoading(false);
        }
    };

    const handleCloseModals = () => {
        setShowAddVisitModal(false);
        setShowEditVisitModal(false);
        setVisitFormData({
            patientId: '',
            diagnosis: '',
            treatment: '',
            notes: ''
        });
        setError('');
    };

    const getRoleBadgeVariant = (role) => {
        switch(role) {
            case 'Admin': return 'danger';
            case 'Doctor': return 'primary';
            case 'Assistant': return 'success';
            default: return 'secondary';
        }
    };

    if (!canViewVisits) {
        return (
            <Container className="d-flex justify-content-center align-items-center min-vh-100">
                <Alert variant="danger" className="text-center">
                    <h4>🚫 Access Denied</h4>
                    <p>You do not have permission to access visit management.</p>
                </Alert>
            </Container>
        );
    }

    if (loading && patients.length === 0) {
        return (
            <Container className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="text-center">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                    <p>Loading patients...</p>
                </div>
            </Container>
        );
    }

    return (
        <Container fluid className="p-4">
            {/* Header */}
            <Row className="align-items-center mb-4">
                <Col>
                    <h1 className="text-primary mb-1 fw-bold">🏥 Visit Management</h1>
                    <p className="text-muted mb-0">
                        Welcome, <strong>{currentUser.username}</strong>
                        <Badge bg={getRoleBadgeVariant(currentUser.role)} className="ms-2">
                            {currentUser.role}
                        </Badge>
                    </p>
                </Col>
            </Row>

            {/* Alerts */}
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Row>
                {/* Patient Search Section */}
                <Col lg={6} className="mb-4">
                    <Card className="h-100 shadow-sm">
                        <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-semibold">🔍 Search Patients</h5>
                            <Badge bg="primary">{patients.length} patient(s)</Badge>
                        </Card.Header>
                        <Card.Body>
                            {/* Search Controls */}
                            <div className="mb-3">
                                <InputGroup>
                                    <Form.Control
                                        type="text"
                                        placeholder="Search patients..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                    <Form.Select 
                                        style={{ maxWidth: '150px' }}
                                        value={searchBy}
                                        onChange={(e) => setSearchBy(e.target.value)}
                                    >
                                        <option value="all">All Fields</option>
                                        <option value="id">Patient ID</option>
                                        <option value="name">Name</option>
                                        <option value="surname">Surname</option>
                                        <option value="username">Username</option>
                                    </Form.Select>
                                </InputGroup>
                                <small className="text-muted">
                                    Showing {filteredPatients.length} of {patients.length} patients
                                </small>
                            </div>

                            {/* Patients List */}
                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {filteredPatients.length > 0 ? (
                                    <Table striped hover size="sm">
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Name</th>
                                                <th>Surname</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredPatients.map(patient => (
                                                <tr 
                                                    key={patient.id}
                                                    className={selectedPatient?.id === patient.id ? 'table-active' : ''}
                                                >
                                                    <td className="fw-semibold">#{patient.id}</td>
                                                    <td>{patient.name}</td>
                                                    <td>{patient.surname}</td>
                                                    <td>
                                                        <ButtonGroup size="sm">
                                                            <Button
                                                                variant="outline-primary"
                                                                onClick={() => handlePatientSelect(patient)}
                                                            >
                                                                View Visits
                                                            </Button>
                                                            {isDoctor && (
                                                                <Button
                                                                    variant="outline-success"
                                                                    onClick={() => handleAddVisit(patient)}
                                                                >
                                                                    Add Visit
                                                                </Button>
                                                            )}
                                                        </ButtonGroup>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                ) : (
                                    <div className="text-center text-muted py-4">
                                        {searchTerm ? 'No patients found matching your search.' : 'No patients available.'}
                                    </div>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Visit History Section */}
                <Col lg={6}>
                    <Card className="h-100 shadow-sm">
                        <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-semibold">
                                📋 Visit History
                                {selectedPatient && (
                                    <span className="text-muted ms-2">
                                        - {selectedPatient.name} {selectedPatient.surname}
                                    </span>
                                )}
                            </h5>
                            {selectedPatient && (
                                <Badge bg="primary">{visits.length} visit(s)</Badge>
                            )}
                        </Card.Header>
                        <Card.Body>
                            {selectedPatient ? (
                                actionLoading ? (
                                    <div className="text-center py-4">
                                        <Spinner animation="border" role="status">
                                            <span className="visually-hidden">Loading visits...</span>
                                        </Spinner>
                                        <p className="mt-2">Loading visit history...</p>
                                    </div>
                                ) : visits.length > 0 ? (
                                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                        {visits.map(visit => (
                                            <Card key={visit.id} className="mb-3 border-0 shadow-sm">
                                                <Card.Header className="py-2 d-flex justify-content-between align-items-center bg-light">
                                                    <small className="text-muted fw-semibold">
                                                        {new Date(visit.visitDate).toLocaleString()}
                                                    </small>
                                                    {isDoctor && (
                                                        <Button
                                                            variant="outline-primary"
                                                            size="sm"
                                                            onClick={() => handleEditVisit(visit)}
                                                        >
                                                            ✏️ Edit
                                                        </Button>
                                                    )}
                                                </Card.Header>
                                                <Card.Body className="py-3">
                                                    <div className="mb-2">
                                                        <strong>Diagnosis:</strong>
                                                        <p className="mb-1 text-dark">{visit.diagnosis}</p>
                                                    </div>
                                                    <div className="mb-2">
                                                        <strong>Treatment:</strong>
                                                        <p className="mb-1 text-dark">{visit.treatment}</p>
                                                    </div>
                                                    {visit.notes && (
                                                        <div className="mb-2">
                                                            <strong>Notes:</strong>
                                                            <p className="mb-1 text-muted">{visit.notes}</p>
                                                        </div>
                                                    )}
                                                    <small className="text-muted">
                                                        Doctor: <Badge bg="info">{visit.doctorUsername}</Badge>
                                                    </small>
                                                </Card.Body>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-muted py-4">
                                        <p>No visit records found for this patient.</p>
                                        {isDoctor && (
                                            <Button
                                                variant="success"
                                                onClick={() => handleAddVisit(selectedPatient)}
                                                className="mt-2"
                                            >
                                                ➕ Add First Visit
                                            </Button>
                                        )}
                                    </div>
                                )
                            ) : (
                                <div className="text-center text-muted py-4">
                                    <p>Select a patient to view their visit history.</p>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Add Visit Modal */}
            <Modal show={showAddVisitModal} onHide={handleCloseModals} size="lg" centered>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-semibold">➕ Add New Visit</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmitVisit}>
                    <Modal.Body>
                        {selectedPatient && (
                            <Alert variant="info" className="mb-3">
                                <strong>Patient:</strong> {selectedPatient.name} {selectedPatient.surname}
                                <br />
                                <strong>Patient ID:</strong> {selectedPatient.id}
                            </Alert>
                        )}
                        
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Diagnosis *</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={visitFormData.diagnosis}
                                onChange={(e) => setVisitFormData({...visitFormData, diagnosis: e.target.value})}
                                placeholder="Enter diagnosis..."
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Treatment *</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={visitFormData.treatment}
                                onChange={(e) => setVisitFormData({...visitFormData, treatment: e.target.value})}
                                placeholder="Enter treatment plan..."
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Additional Notes</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                value={visitFormData.notes}
                                onChange={(e) => setVisitFormData({...visitFormData, notes: e.target.value})}
                                placeholder="Enter any additional notes..."
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="border-0">
                        <Button variant="secondary" onClick={handleCloseModals} disabled={actionLoading}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={actionLoading}>
                            {actionLoading ? (
                                <>
                                    <Spinner size="sm" className="me-2" />
                                    Saving...
                                </>
                            ) : (
                                'Save Visit Record'
                            )}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Edit Visit Modal */}
            <Modal show={showEditVisitModal} onHide={handleCloseModals} size="lg" centered>
                <Modal.Header closeButton className="border-0">
                    <Modal.Title className="fw-semibold">✏️ Edit Visit Record</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleUpdateVisit}>
                    <Modal.Body>
                        {selectedPatient && selectedVisit && (
                            <Alert variant="info" className="mb-3">
                                <strong>Patient:</strong> {selectedPatient.name} {selectedPatient.surname}
                                <br />
                                <strong>Visit Date:</strong> {new Date(selectedVisit.visitDate).toLocaleString()}
                            </Alert>
                        )}
                        
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Diagnosis *</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={visitFormData.diagnosis}
                                onChange={(e) => setVisitFormData({...visitFormData, diagnosis: e.target.value})}
                                placeholder="Enter diagnosis..."
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Treatment *</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={visitFormData.treatment}
                                onChange={(e) => setVisitFormData({...visitFormData, treatment: e.target.value})}
                                placeholder="Enter treatment plan..."
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Additional Notes</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                value={visitFormData.notes}
                                onChange={(e) => setVisitFormData({...visitFormData, notes: e.target.value})}
                                placeholder="Enter any additional notes..."
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="border-0">
                        <Button variant="secondary" onClick={handleCloseModals} disabled={actionLoading}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={actionLoading}>
                            {actionLoading ? (
                                <>
                                    <Spinner size="sm" className="me-2" />
                                    Updating...
                                </>
                            ) : (
                                'Update Visit Record'
                            )}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default Visits;