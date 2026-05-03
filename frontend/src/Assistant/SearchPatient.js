import React, { useState } from 'react';
import { Form, Button, Modal, Alert, Table, Badge, InputGroup } from 'react-bootstrap';
import axios from 'axios';

/**
 * SearchPatient Component - Modal for searching patients by name, surname, or username
 * Accessible to all authenticated users (Assistant, Doctor, Admin)
 */
const SearchPatient = ({ show, onHide }) => {
    const [searchTerm, setSearchTerm] = useState('');
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
            console.log('Searching patients with term:', searchTerm);
            
            // Call the search endpoint
            const response = await api.get(`/Patients/search?term=${encodeURIComponent(searchTerm)}`);
            console.log('Search results:', response.data);
            
            setSearchResults(response.data);
            
        } catch (err) {
            console.error('Error searching patients:', err);
            if (err.response?.status === 400) {
                setError(err.response.data || 'Invalid search request.');
            } else if (err.response?.status === 401) {
                setError('Please login to search patients.');
            } else if (err.response?.status === 403) {
                setError('Access denied. You do not have permission to search patients.');
            } else {
                setError('Failed to search patients. Please try again.');
            }
            setSearchResults([]);
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSearchTerm('');
        setSearchResults([]);
        setError('');
        setHasSearched(false);
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
                <Modal.Title>Search Patients</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {/* Search Form */}
                <Form onSubmit={handleSearch}>
                    <div className="d-flex mb-3">
                        <Form.Control
                            type="text"
                            placeholder="Search by name, surname, or username..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            disabled={loading}
                        />
                        <Button 
                            variant="primary" 
                            type="submit" 
                            disabled={loading || !searchTerm.trim()}
                            className="ms-2"
                        >
                            {loading ? 'Searching...' : 'Search'}
                        </Button>
                        {hasSearched && (
                            <Button 
                                variant="outline-secondary" 
                                onClick={clearSearch}
                                className="ms-2"
                            >
                                Clear
                            </Button>
                        )}
                    </div>
                </Form>

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
                                            <th>ID</th>
                                            <th>Name</th>
                                            <th>Surname</th>
                                            <th>Username</th>
                                            <th>Gender</th>
                                            <th>Email</th>
                                            <th>Phone</th>
                                            <th>Medical Aid</th>
                                            <th>Medical Aid Company</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {searchResults.map((patient) => (
                                            <tr key={patient.id}>
                                                <td>{patient.id}</td>
                                                <td>{patient.name}</td>
                                                <td>{patient.surname}</td>
                                                <td>{patient.username}</td>
                                                <td>{patient.gender}</td>
                                                <td>{patient.email}</td>
                                                <td>{patient.phone}</td>
                                                <td>
                                                    <span className={`badge ${patient.hasMedicalAid ? 'bg-success' : 'bg-secondary'}`}>
                                                        {patient.hasMedicalAid ? 'Yes' : 'No'}
                                                    </span>
                                                </td>
                                                <td>{patient.medicalAidCompany || 'N/A'}</td>
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

                {/* Search Tips */}
                {!hasSearched && (
                    <div className="text-muted">
                        <small>
                            <strong>Search Tips:</strong><br />
                            • Search by patient's first name, last name, or username<br />
                            • Partial matches are supported (e.g., "Joh" will find "John")<br />
                            • Search is case-insensitive
                        </small>
                    </div>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Close
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default SearchPatient;