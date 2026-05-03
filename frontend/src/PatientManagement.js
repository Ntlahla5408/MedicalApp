import React, { useState, useEffect } from 'react';
import { 
    Container, Table, Button, Alert, Card, 
    Form, Modal, Row, Col, Badge 
} from 'react-bootstrap';
import { patientService } from './api';

const PatientManagement = () => {
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingPatient, setEditingPatient] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        username: '',
        gender: '',
        homeAddress: '',
        email: '',
        phone: '',
        hasMedicalAid: false,
        medicalAidCompany: ''
    });

    const userRole = localStorage.getItem('userRole');

    useEffect(() => {
        loadPatients();
    }, []);

    const loadPatients = async () => {
        try {
            setLoading(true);
            const data = await patientService.getAll();
            setPatients(data);
            setError('');
        } catch (err) {
            setError('Failed to load patients: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchTerm.trim()) {
            loadPatients();
            return;
        }

        try {
            setLoading(true);
            const results = await patientService.search(searchTerm);
            setPatients(results);
        } catch (err) {
            setError('Search failed: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (patient) => {
        if (window.confirm(`Delete patient ${patient.name} ${patient.surname}?`)) {
            try {
                await patientService.delete(patient.name, patient.surname, patient.username);
                loadPatients(); // Refresh list
            } catch (err) {
                setError('Delete failed: ' + err.message);
            }
        }
    };

    const handleEdit = (patient) => {
        setEditingPatient(patient);
        setFormData({
            name: patient.name,
            surname: patient.surname,
            username: patient.username,
            gender: patient.gender,
            homeAddress: patient.homeAddress,
            email: patient.email,
            phone: patient.phone,
            hasMedicalAid: patient.hasMedicalAid,
            medicalAidCompany: patient.medicalAidCompany || ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            if (editingPatient) {
                // Update existing patient
                await patientService.update(
                    editingPatient.name,
                    editingPatient.surname,
                    editingPatient.username,
                    formData
                );
            } else {
                // Create new patient
                await patientService.create(formData);
            }
            
            setShowModal(false);
            loadPatients(); // Refresh list
            resetForm();
        } catch (err) {
            setError((editingPatient ? 'Update' : 'Create') + ' failed: ' + err.message);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            surname: '',
            username: '',
            gender: '',
            homeAddress: '',
            email: '',
            phone: '',
            hasMedicalAid: false,
            medicalAidCompany: ''
        });
        setEditingPatient(null);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        resetForm();
    };

    if (loading) {
        return (
            <Container className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </Container>
        );
    }

    return (
        <Container fluid className="py-4">
            {/* Header */}
            <Row className="mb-4">
                <Col>
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h1 className="display-6">Patient Management</h1>
                            <p className="text-muted">Manage patient records and information</p>
                        </div>
                        {userRole === 'Assistant' && (
                            <Button variant="primary" onClick={() => setShowModal(true)}>
                                + Add New Patient
                            </Button>
                        )}
                    </div>
                </Col>
            </Row>

            {/* Search Bar */}
            <Row className="mb-4">
                <Col md={8}>
                    <Card>
                        <Card.Body>
                            <Form.Group>
                                <Form.Label>Search Patients</Form.Label>
                                <div className="d-flex">
                                    <Form.Control
                                        type="text"
                                        placeholder="Search by name, surname, or username..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    />
                                    <Button variant="outline-secondary" onClick={handleSearch} className="ms-2">
                                        Search
                                    </Button>
                                    <Button variant="outline-secondary" onClick={loadPatients} className="ms-2">
                                        Clear
                                    </Button>
                                </div>
                            </Form.Group>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Error Alert */}
            {error && (
                <Alert variant="danger" dismissible onClose={() => setError('')}>
                    {error}
                </Alert>
            )}

            {/* Patients Table */}
            <Card>
                <Card.Header>
                    <h5 className="mb-0">
                        Patients ({patients.length})
                        {searchTerm && <small className="text-muted"> - Search results for "{searchTerm}"</small>}
                    </h5>
                </Card.Header>
                <Card.Body>
                    <div className="table-responsive">
                        <Table striped bordered hover>
                            <thead className="table-dark">
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Surname</th>
                                    <th>Username</th>
                                    <th>Gender</th>
                                    <th>Email</th>
                                    <th>Phone</th>
                                    <th>Medical Aid</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {patients.length > 0 ? (
                                    patients.map(patient => (
                                        <tr key={patient.id}>
                                            <td>{patient.id}</td>
                                            <td>{patient.name}</td>
                                            <td>{patient.surname}</td>
                                            <td>{patient.username}</td>
                                            <td>{patient.gender}</td>
                                            <td>{patient.email}</td>
                                            <td>{patient.phone}</td>
                                            <td>
                                                <Badge bg={patient.hasMedicalAid ? 'success' : 'secondary'}>
                                                    {patient.hasMedicalAid ? 'Yes' : 'No'}
                                                </Badge>
                                                {patient.hasMedicalAid && patient.medicalAidCompany && (
                                                    <small className="d-block text-muted">
                                                        {patient.medicalAidCompany}
                                                    </small>
                                                )}
                                            </td>
                                            <td>
                                                <Button 
                                                    variant="outline-primary" 
                                                    size="sm" 
                                                    className="me-1"
                                                    onClick={() => handleEdit(patient)}
                                                >
                                                    Edit
                                                </Button>
                                                <Button 
                                                    variant="outline-danger" 
                                                    size="sm"
                                                    onClick={() => handleDelete(patient)}
                                                    disabled={userRole !== 'Assistant'}
                                                    title={userRole !== 'Assistant' ? 'Only Assistants can delete' : ''}
                                                >
                                                    Delete
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="9" className="text-center text-muted py-4">
                                            No patients found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>

            {/* Add/Edit Patient Modal */}
            <Modal show={showModal} onHide={handleCloseModal} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>
                        {editingPatient ? 'Edit Patient' : 'Add New Patient'}
                    </Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Name *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Surname *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.surname}
                                        onChange={(e) => setFormData({...formData, surname: e.target.value})}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Username *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.username}
                                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Gender *</Form.Label>
                                    <Form.Select
                                        value={formData.gender}
                                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                                        required
                                    >
                                        <option value="">Select Gender</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-3">
                            <Form.Label>Home Address</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.homeAddress}
                                onChange={(e) => setFormData({...formData, homeAddress: e.target.value})}
                            />
                        </Form.Group>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email *</Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Phone *</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        required
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Check
                                        type="checkbox"
                                        label="Has Medical Aid"
                                        checked={formData.hasMedicalAid}
                                        onChange={(e) => setFormData({...formData, hasMedicalAid: e.target.checked})}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                {formData.hasMedicalAid && (
                                    <Form.Group className="mb-3">
                                        <Form.Label>Medical Aid Company *</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={formData.medicalAidCompany}
                                            onChange={(e) => setFormData({...formData, medicalAidCompany: e.target.value})}
                                            required={formData.hasMedicalAid}
                                        />
                                    </Form.Group>
                                )}
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseModal}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit">
                            {editingPatient ? 'Update Patient' : 'Create Patient'}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </Container>
    );
};

export default PatientManagement;