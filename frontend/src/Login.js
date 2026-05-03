import React, { useState } from 'react';
import { Form, Button, Card, Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

/**
 * Login Component
 * Handles user authentication by communicating with the ASP.NET Core backend API
 * Features: Form validation, JWT token storage, error handling, loading states
 */
const Login = ({ onLogin }) => {
    // State management for form data, loading status, and error messages
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false); // Tracks when API call is in progress
    const [error, setError] = useState(''); // Stores error messages to display to user
    const navigate = useNavigate(); // React Router hook for programmatic navigation

    // Backend API base URL - points to ASP.NET Core Web API
    const API_BASE = 'https://localhost:7219/swagger';

    /**
     * Handles form input changes
     * Updates form state and clears any existing error messages
     */
    const handleChange = (e) => {
        setFormData({
            ...formData, // Spread existing form data
            [e.target.name]: e.target.value // Update the specific field that changed
        });
        setError(''); // Clear errors when user starts typing
    };

    /**
     * Handles form submission
     * Validates inputs, makes API call to backend, processes response
     */
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission behavior
        
        // Basic client-side validation
        if (!formData.username || !formData.password) {
            setError('Please enter both username and password');
            return;
        }

        // Set loading state and clear previous errors
        setLoading(true);
        setError('');

        console.log('Attempting login to:', `${API_BASE}/Auth/login`);

        try {
            // Make POST request to ASP.NET Core AuthController Login endpoint
            const response = await axios.post(`${API_BASE}/Auth/login`, {
                username: formData.username,
                password: formData.password
            }, {
                timeout: 10000 // 10 second timeout
            });

            console.log('Login successful! Response:', response.data);

            // Extract data from successful response
            const { token, username, role } = response.data;
            
            // Store authentication data in browser's localStorage
            // This persists the login state across page refreshes
            localStorage.setItem('jwtToken', token); // JWT token for API authentication
            localStorage.setItem('username', username); // User's display name
            localStorage.setItem('userRole', role); // User's role for authorization
            
            // Set default authorization header for all future axios requests
            // This automatically includes the JWT token in all API calls
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            
            // Notify parent component (App.js) about successful login
            // This updates the global authentication state
            if (onLogin) {
                onLogin({ username, role, token });
            }
            
            // Show success message to user
            setError(`✅ Login successful! Welcome ${username} (${role})`);
            
            // Redirect to patients page after 1 second delay
            // Gives user time to see the success message
            setTimeout(() => {
                navigate('/Dashboards'); // React Router navigation
            }, 1000);

        } catch (err) {
            // Error handling for different types of failures
            console.error('Login error:', err);
            
            if (err.response) {
                // Server responded with an error status code (4xx, 5xx)
                if (err.response.status === 401) {
                    // Unauthorized - invalid credentials
                    setError('Invalid username or password');
                } else {
                    // Other server errors (400, 403, 500, etc.)
                    setError(`Login failed: ${err.response.data || 'Unknown error'}`);
                }
            } else if (err.request) {
                // Request was made but no response received
                // Usually indicates backend is not running or network issues
                setError('Cannot connect to backend server. Please ensure the API is running on https://localhost:7084');
            } else {
                // Something else went wrong in setting up the request
                setError(`Login error: ${err.message}`);
            }
        } finally {
            // Always execute - reset loading state whether success or failure
            setLoading(false);
        }
    };

    /**
     * Renders the login form UI
     * Uses React-Bootstrap components for responsive styling
     */
    return (
        // Full-screen container with centered content
        <Container fluid className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
            <Row className="w-100 justify-content-center">
                <Col xs={12} sm={8} md={6} lg={4}>
                    {/* Card component for form container with shadow effect */}
                    <Card className="shadow">
                        <Card.Body className="p-4">
                            {/* Header section */}
                            <div className="text-center mb-4">
                                <h2 className="text-primary">Medical System</h2>
                                <p className="text-muted">Sign in to your account</p>
                            </div>

                            {/* Conditional error/success message display */}
                            {error && (
                                <Alert variant={error.includes('✅') ? 'success' : 'danger'} className="mb-3">
                                    {error}
                                    {/* Additional help text for connection errors */}
                                    {error.includes('Cannot connect') && (
                                        <div className="mt-2">
                                            <small>
                                                Backend URL: <code>https://localhost:7084</code><br />
                                                Make sure Swagger is accessible at: <br />
                                                <a href="https://localhost:7084/swagger" target="_blank" rel="noopener noreferrer">
                                                    https://localhost:7084/swagger
                                                </a>
                                            </small>
                                        </div>
                                    )}
                                </Alert>
                            )}

                            {/* Login form */}
                            <Form onSubmit={handleSubmit}>
                                {/* Username input field */}
                                <Form.Group className="mb-3">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleChange}
                                        placeholder="Enter username"
                                        disabled={loading} // Disable during API call
                                        required // HTML5 validation
                                    />
                                </Form.Group>

                                {/* Password input field */}
                                <Form.Group className="mb-4">
                                    <Form.Label>Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Enter password"
                                        disabled={loading} // Disable during API call
                                        required // HTML5 validation
                                    />
                                </Form.Group>

                                {/* Submit button with loading state */}
                                <Button 
                                    variant="primary" 
                                    type="submit" 
                                    className="w-100" 
                                    disabled={loading}
                                >
                                    {loading ? (
                                        // Show spinner and loading text during API call
                                        <>
                                            <Spinner
                                                as="span"
                                                animation="border"
                                                size="sm"
                                                role="status"
                                                aria-hidden="true"
                                                className="me-2"
                                            />
                                            Signing in...
                                        </>
                                    ) : (
                                        // Normal button text
                                        'Sign In'
                                    )}
                                </Button>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Login;