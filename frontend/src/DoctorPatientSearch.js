import React, { useState } from 'react';
import { Form, Button, Modal, Alert, Table, Badge, InputGroup, Row, Col } from 'react-bootstrap';
import axios from 'axios';

/**
 * DoctorPatientSearch Component - Enhanced search for doctors
 * Search by patient number, name, surname, or username
 */
const DoctorPatientSearch = ({ show, onHide, onPatientSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchBy, setSearchBy] = useState('all'); // all, id, name, surname, username
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [hasSearched, setHasSearched] = useState(false);

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

    const handleSearch = async (e) => {
        e.preventDefault();
        
        if (!searchTerm.trim()) {
            setError('Please enter a search term');
            return;
        }

        setLoading(true);
        setError('');
        setHasSearched(true);

        try {
            console.log('Searching patients for doctor:', searchTerm, 'by:', searchBy);
            
            // Use the existing patient search endpoint with enhanced frontend filtering
            const response = await api.get('/Patients/search', {
                params: { term: searchTerm }
            });
            
            let filteredResults = response.data;
            
            // Apply additional filtering based on searchBy
            if (searchBy !== 'all') {
                const term = searchTerm.toLowerCase();
                filteredResults = filteredResults.filter(patient => {
                    switch (searchBy) {
                        case 'id':
                            return patient.id.toString().includes(term);
                        case 'name':
                            return patient.name?.toLowerCase().includes(term);
                        case 'surname':
                            return patient.surname?.toLowerCase().includes(term);
                        case 'username':
                            return patient.username?.toLowerCase().includes(term);
                        default:
                            return true;
                    }
                });
            }
            
            console.log('Search results:', filteredResults);
            setSearchResults(filteredResults);
            
        } catch (err) {
            console.error('Error searching patients:', err);
            if (err.response?.status === 400) {
                setError(err.response.data || 'Invalid search request.');
            } else if (err.response?.status === 401) {
                setError('Please login to search patients.');
            } else {
                setError('Failed to search patients. Please try again.');
            }
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handlePatientSelect = (patient) => {
        if (onPatientSelect) {
            onPatientSelect(patient);
        }
        handleClose();
    };

    const handleClose = () => {
        setSearchTerm('');
        setSearchResults([]);
        setError('');
        setHasSearched(false);
        setSearchBy('all');
        onHide();
    };

    const clearSearch = () => {
        setSearchTerm('');
        setSearchResults([]);
        setHasSearched(false);
        setError('');
    };

    return (
        <Modal show={show} onHide={handleClose} size="xl">
            <Modal.Header closeButton>
                <Modal.Title>🔍 Search Patients - Doctor View</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {/* Search Form */}
                <Form onSubmit={handleSearch}>
                    <Row className="mb-3">
                        <Col md={8}>
                            <Form.Control
                                type="text"
                                placeholder="Search patients..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                disabled={loading}
                            />
                        </Col>
                        <Col md={2}>
                            <Form.Select
                                value={searchBy}
                                onChange={(e) => setSearchBy(e.target.value)}
                                disabled={loading}
                            >
                                <option value="all">All Fields</option>
                                <option value="id">Patient ID</option>
                                <option value="name">Name</option>
                                <option value="surname">Surname</option>
                                <option value="username">Username</option>
                            </Form.Select>
                        </Col>
                        <Col md={2}>
                            <Button 
                                variant="primary" 
                                type="submit" 
                                disabled={loading || !searchTerm.trim()}
                                className="w-100"
                            >
                                {loading ? 'Searching...' : 'Search'}
                            </Button>
                        </Col>
                    </Row>
                </Form>

                {/* Search Tips */}
                <div className="text-muted mb-3">
                    <small>
                        <strong>Search Options:</strong> Search by Patient ID, Name, Surname, or Username
                    </small>
                </div>

                {/* Error Display */}
                {error && <Alert variant="danger">{error}</Alert>}

                {/* Search Results */}
                {hasSearched && !loading && (
                    <div className="mt-3">
                        <h6>
                            Search Results 
                            <Badge bg="primary" className="ms-2">
                                {searchResults.length} patient(s) found
                            </Badge>
                        </h6>
                        
                        {searchResults.length > 0 ? (
                            <div className="table-responsive">
                                <Table striped bordered hover size="sm">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Patient ID</th>
                                            <th>Name</th>
                                            <th>Surname</th>
                                            <th>Username</th>
                                            <th>Gender</th>
                                            <th>Contact</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {searchResults.map((patient) => (
                                            <tr key={patient.id}>
                                                <td>
                                                    <strong>{patient.id}</strong>
                                                </td>
                                                <td>{patient.name}</td>
                                                <td>{patient.surname}</td>
                                                <td>{patient.username}</td>
                                                <td>{patient.gender}</td>
                                                <td>
                                                    <div>
                                                        <small>📧 {patient.email}</small><br/>
                                                        <small>📞 {patient.phone}</small>
                                                    </div>
                                                </td>
                                                <td>
                                                    <Button 
                                                        variant="outline-primary" 
                                                        size="sm"
                                                        onClick={() => handlePatientSelect(patient)}
                                                        title="View patient visit history"
                                                    >
                                                        View Visits
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        ) : (
                            !error && (
                                <Alert variant="info" className="text-center">
                                    No patients found matching your search criteria.
                                </Alert>
                            )
                        )}
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                {hasSearched && (
                    <Button variant="outline-secondary" onClick={clearSearch}>
                        New Search
                    </Button>
                )}
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DoctorPatientSearch;