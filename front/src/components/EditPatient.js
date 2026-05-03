// src/components/EditPatient.js
import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Row, Col, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const EditPatient = ({ show, onHide, patient, onPatientUpdated }) => {
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        username: '',
        gender: 'Male',
        homeAddress: '',
        email: '',
        phone: '',
        hasMedicalAid: false,
        medicalAidCompany: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const { API_BASE } = useAuth();

    const api = axios.create({
        baseURL: API_BASE,
    });

    api.interceptors.request.use((config) => {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    });

    useEffect(() => {
        if (patient) {
            setFormData({
                name: patient.name || '',
                surname: patient.surname || '',
                username: patient.username || '',
                gender: patient.gender || 'Male',
                homeAddress: patient.homeAddress || '',
                email: patient.email || '',
                phone: patient.phone || '',
                hasMedicalAid: patient.hasMedicalAid || false,
                medicalAidCompany: patient.medicalAidCompany || ''
            });
        }
    }, [patient]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validation
        if (formData.hasMedicalAid && !formData.medicalAidCompany.trim()) {
            setError('Medical aid company is required when medical aid is selected.');
            setLoading(false);
            return;
        }

        try {
            await api.put('/Patients', formData, {
                params: {
                    name: patient.name,
                    surname: patient.surname,
                    username: patient.username
                }
            });
            onPatientUpdated();
        } catch (err) {
            console.error('Error updating patient:', err);
            if (err.response?.status === 400) {
                setError(err.response.data || 'Invalid patient data.');
            } else if (err.response?.status === 403) {
                setError('Access denied. Only Assistants can update patients.');
            } else if (err.response?.status === 404) {
                setError('Patient not found.');
            } else {
                setError('Failed to update patient. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleClose = () => {
        setError('');
        onHide();
    };

    if (!patient) return null;

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title className="fw-semibold">✏️ Edit Patient</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    
                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold">Name *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold">Surname *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="surname"
                                    value={formData.surname}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold">Username *</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold">Gender *</Form.Label>
                                <Form.Select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Home Address *</Form.Label>
                        <Form.Control
                            type="text"
                            name="homeAddress"
                            value={formData.homeAddress}
                            onChange={handleChange}
                            required
                        />
                    </Form.Group>

                    <Row>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold">Email *</Form.Label>
                                <Form.Control
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            <Form.Group className="mb-3">
                                <Form.Label className="fw-semibold">Phone *</Form.Label>
                                <Form.Control
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
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
                                    name="hasMedicalAid"
                                    label="Has Medical Aid"
                                    checked={formData.hasMedicalAid}
                                    onChange={handleChange}
                                />
                            </Form.Group>
                        </Col>
                        <Col md={6}>
                            {formData.hasMedicalAid && (
                                <Form.Group className="mb-3">
                                    <Form.Label className="fw-semibold">Medical Aid Company *</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="medicalAidCompany"
                                        value={formData.medicalAidCompany}
                                        onChange={handleChange}
                                        required={formData.hasMedicalAid}
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
                        {loading ? (
                            <>
                                <Spinner size="sm" className="me-2" />
                                Updating...
                            </>
                        ) : (
                            'Update Patient'
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};
 
export default EditPatient;