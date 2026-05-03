import React, { useState, useEffect, Fragment } from "react";
import Table from 'react-bootstrap/Table';
import {Form, Button, Alert, Container, Row, Col, ButtonGroup,InputGroup } from 'react-bootstrap';
import axios from 'axios';
import AddPatient from './AddPatient';
import EditPatient from './EditPatient';
import SearchPatient from "./SearchPatient";
import { useNavigate } from 'react-router-dom';

const Patient = ({ onLogout }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false); // Control search modal
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [filteredData, setFilteredData] = useState([]); // For local filtering
    const [localSearchTerm, setLocalSearchTerm] = useState(''); // For local search

    const API_BASE = 'https://localhost:7084/api';

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

    // Handle authentication errors
    api.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response?.status === 401) {
                handleLogout();
            }
            return Promise.reject(error);
        }
    );

    const loadPatientsFromAPI = async () => {
        try {
            setLoading(true);
            console.log('Fetching patients from:', `${API_BASE}/Patients`);
            const response = await api.get('/Patients');
            setData(response.data);
            setFilteredData(response.data); // Initialize filtered data
            setError(null);
            console.log('Patients loaded successfully:', response.data.length, 'patients');
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

// In the handleEditPatient function in Patient.js, update the API call:

const handleEditPatient = async (name, surname, username, updateData) => {
    try {
        // FIXED: Use query parameters and body correctly
        const response = await api.put('/Patients', updateData, {
            params: {
                name: name,
                surname: surname,
                username: username
            }
        });
        return response.data;
    } catch (err) {
        console.error('Error updating patient:', err);
        throw err;
    }
};

// And in the EditPatient component, make sure it calls this correctly

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

    const handlePatientAdded = () => {
        loadPatientsFromAPI();
    };

    const handlePatientUpdated = () => {
        loadPatientsFromAPI();
    };

    const currentUserRole = localStorage.getItem('userRole');
    const currentUsername = localStorage.getItem('username');
    const canModifyPatients = currentUserRole === 'Assistant';

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading patients from database...</p>
                </div>
            </Container>
        );
    }

    return (
        <Fragment>
            <Container fluid className="p-4">
                {/* Header Section */}
                <Row className="align-items-center mb-4">
                    <Col>
                        <h2 className="text-primary">Patient Management System</h2>
                        <small className="text-muted">
                            Welcome, <strong>{currentUsername}</strong> 
                            <span className="badge bg-secondary ms-2">{currentUserRole}</span>
                        </small>
                    </Col>
                    <Col xs="auto">
                        {/* Action Buttons */}
                        <Button 
                            variant="info" 
                            className="me-2"
                            onClick={() => setShowSearchModal(true)}
                            title="Search patients by name, surname, or username"
                        >
                            🔍 Search
                        </Button>
                        {canModifyPatients && (
                            <Button 
                                variant="success" 
                                className="me-2"
                                onClick={() => setShowAddModal(true)}
                            >
                                + Add Patient
                            </Button>
                        )}
                        <Button variant="outline-danger" onClick={handleLogout}>
                            Logout
                        </Button>
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
                <div className="card shadow-sm">
                    <div className="card-body">
                        <Table striped bordered hover responsive>
                            <thead className="table-dark">
                                <tr>
                                    <th>#</th>
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
                                {filteredData.length > 0 ? filteredData.map((item, index) => (
                                    <tr key={item.id}>
                                        <td>{index + 1}</td>
                                        <td>{item.id}</td>
                                        <td>{item.name}</td>
                                        <td>{item.surname}</td>
                                        <td>{item.username}</td>
                                        <td>{item.gender}</td>
                                        <td>{item.email}</td>
                                        <td>{item.phone}</td>
                                        <td>
                                            <span className={`badge ${item.hasMedicalAid ? 'bg-success' : 'bg-secondary'}`}>
                                                {item.hasMedicalAid ? 'Yes' : 'No'}
                                            </span>
                                        </td>
                                        <td>{item.medicalAidCompany || 'N/A'}</td>
                                        <td>
                                            <ButtonGroup size="sm">
                                                <Button 
                                                    variant="outline-primary"
                                                    onClick={() => handleEditPatient(item)}
                                                    disabled={!canModifyPatients}
                                                    title={
                                                        !canModifyPatients 
                                                            ? 'Only Assistants can edit patients' 
                                                            : 'Edit patient'
                                                    }
                                                >
                                                    Edit
                                                </Button>
                                                <Button 
                                                    variant="outline-danger"
                                                    onClick={() => handleDeletePatient(
                                                        item.name, 
                                                        item.surname, 
                                                        item.username
                                                    )}
                                                    disabled={!canModifyPatients}
                                                    title={
                                                        !canModifyPatients 
                                                            ? 'Only Assistants can delete patients' 
                                                            : 'Delete patient'
                                                    }
                                                >
                                                    Delete
                                                </Button>
                                            </ButtonGroup>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="11" className="text-center text-muted py-4">
                                            {localSearchTerm 
                                                ? `No patients found matching "${localSearchTerm}"` 
                                                : 'No patients found in the database'
                                            }
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </div>

                <div className="mt-3 text-center text-muted">
                    <small>
                        Connected to: {API_BASE} | 
                        Showing {filteredData.length} of {data.length} patients
                        {localSearchTerm && ` (filtered by "${localSearchTerm}")`}
                    </small>
                </div>

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

                {/* Search Patient Modal */}
                <SearchPatient 
                    show={showSearchModal}
                    onHide={() => setShowSearchModal(false)}
                />
            </Container>
        </Fragment>
    );
};

export default Patient;