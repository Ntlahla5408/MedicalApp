// src/components/AddPatient.js
import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Row, Col, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const AddPatient = ({ show, onHide, onPatientAdded }) => {
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
            await api.post('/Patients', formData);
            onPatientAdded();
            // Reset form
            setFormData({
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
        } catch (err) {
            console.error('Error adding patient:', err);
            if (err.response?.status === 400) {
                setError(err.response.data || 'Invalid patient data.');
            } else if (err.response?.status === 403) {
                setError('Access denied. Only Assistants can add patients.');
            } else {
                setError('Failed to add patient. Please try again.');
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
        setFormData({
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
        setError('');
        onHide();
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" centered>
            <Modal.Header closeButton>
                <Modal.Title className="fw-semibold">➕ Add New Patient</Modal.Title>
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
                                    placeholder="Enter patient's name"
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
                                    placeholder="Enter patient's surname"
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
                                    placeholder="Enter unique username"
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
                            placeholder="Enter full home address"
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
                                    placeholder="Enter email address"
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
                                    placeholder="Enter phone number"
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
                        {loading ? (
                            <>
                                <Spinner size="sm" className="me-2" />
                                Adding...
                            </>
                        ) : (
                            'Add Patient'
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default AddPatient;