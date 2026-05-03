import React, { useState } from 'react';
import { Form, Button, Modal, Alert, Row, Col } from 'react-bootstrap';
import axios from 'axios';

/**
 * AddPatient Component - Modal form for creating new patients
 * Accessible only to users with Assistant role
 */
const AddPatient = ({ show, onHide, onPatientAdded }) => {
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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const API_BASE = 'https://localhost:7084/api';

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

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        // Clear medical aid company if medical aid is disabled
        if (name === 'hasMedicalAid' && !checked) {
            setFormData(prev => ({
                ...prev,
                medicalAidCompany: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validate medical aid
        if (formData.hasMedicalAid && !formData.medicalAidCompany.trim()) {
            setError('Medical aid company is required when medical aid is selected.');
            setLoading(false);
            return;
        }

        try {
            console.log('Adding new patient:', formData);
            
            const response = await api.post('/Patients', formData);
            console.log('Patient added successfully:', response.data);
            
            // Reset form and close modal
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
            
            // Notify parent component to refresh patient list
            if (onPatientAdded) {
                onPatientAdded();
            }
            
            onHide(); // Close the modal
            
        } catch (err) {
            console.error('Error adding patient:', err);
            if (err.response?.status === 400) {
                setError(err.response.data || 'Validation error. Please check your input.');
            } else if (err.response?.status === 403) {
                setError('Access denied. Only Assistants can add patients.');
            } else {
                setError('Failed to add patient. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
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
        setError('');
        onHide();
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>Add New Patient</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    
                    <Row>

                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Username *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter username"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Name *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter first name"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Surname *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="surname"
                                    value={formData.surname}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter surname"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Gender *</Form.Label>
                                <Form.Select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label>Phone *</Form.Label>
                                <Form.Control
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter phone number"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label>Email *</Form.Label>
                        <Form.Control
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            placeholder="Enter email address"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Home Address</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            name="homeAddress"
                            value={formData.homeAddress}
                            onChange={handleChange}
                            placeholder="Enter home address"
                        />
                    </Form.Group>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Check
                                    type="checkbox"
                                    name="hasMedicalAid"
                                    checked={formData.hasMedicalAid}
                                    onChange={handleChange}
                                    label="Has Medical Aid"
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            {formData.hasMedicalAid && (
                                <Form.Group className="mb-3">
                                    <Form.Label>Medical Aid Company *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="medicalAidCompany"
                                        value={formData.medicalAidCompany}
                                        onChange={handleChange}
                                        required={formData.hasMedicalAid}
                                        placeholder="Enter medical aid company"
                                    />
                                </Form.Group>
                            )}
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? 'Adding...' : 'Add Patient'}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default AddPatient;