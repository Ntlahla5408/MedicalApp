// src/components/Users.js
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Form, Alert, Badge, Spinner, ButtonGroup } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        role: 'Assistant'
    });

    const [editFormData, setEditFormData] = useState({
        username: '',
        role: 'Assistant'
    });

    const { user: currentUser, API_BASE, logout } = useAuth();
    const isAdmin = currentUser?.role === 'Admin';

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

    /**
     * Load all users from the API
     */
    const loadUsers = async () => {
        try {
            setLoading(true);
            setError('');
            
            const response = await api.get('/Auth/users');
            setUsers(response.data);

        } catch (err) {
            console.error('Error loading users:', err);
            if (err.response?.status === 403) {
                setError('Access denied. Only Administrators can manage users.');
            } else if (err.response?.status === 401) {
                setError('Please login to access user management.');
            } else {
                setError('Failed to load users. Please check if the backend is running.');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAdmin) {
            loadUsers();
        }
    }, [isAdmin]);

    /**
     * Handle adding a new user
     */
    const handleAddUser = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setActionLoading(true);

        // Validation
        if (!formData.username.trim() || !formData.password || !formData.confirmPassword) {
            setError('Please fill in all fields.');
            setActionLoading(false);
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters long.');
            setActionLoading(false);
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            setActionLoading(false);
            return;
        }

        try {
            const response = await api.post('/Auth/register', {
                username: formData.username.trim(),
                password: formData.password,
                confirmPassword: formData.confirmPassword,
                role: formData.role
            });
            
            setSuccess(`✅ User "${formData.username}" created successfully as ${formData.role}`);
            
            // Reset form and close modal
            setFormData({
                username: '',
                password: '',
                confirmPassword: '',
                role: 'Assistant'
            });
            
            setShowAddModal(false);
            loadUsers();

        } catch (err) {
            console.error('Error creating user:', err);
            if (err.response?.status === 400) {
                setError(err.response.data || 'Username already exists or invalid data.');
            } else if (err.response?.status === 403) {
                setError('Access denied. Only Administrators can create users.');
            } else {
                setError('Failed to create user. Please try again.');
            }
        } finally {
            setActionLoading(false);
        }
    };

    /**
     * Handle editing user role
     */
    const handleEditUser = (user) => {
        setSelectedUser(user);
        setEditFormData({
            username: user.username,
            role: user.role
        });
        setShowEditModal(true);
        setError('');
    };

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setActionLoading(true);

        try {
            const response = await api.put(`/Auth/users/${selectedUser.username}`, {
                newRole: editFormData.role
            });
            
            setSuccess(`✅ User "${selectedUser.username}" updated successfully to ${editFormData.role}`);
            setShowEditModal(false);
            loadUsers();

        } catch (err) {
            console.error('Error updating user:', err);
            if (err.response?.status === 400) {
                setError(err.response.data || 'Invalid role selected.');
            } else if (err.response?.status === 403) {
                setError('Access denied. Only Administrators can update users.');
            } else if (err.response?.status === 404) {
                setError('User not found.');
            } else {
                setError('Failed to update user. Please try again.');
            }
        } finally {
            setActionLoading(false);
        }
    };

    /**
     * Handle deleting a user
     */
    const handleDeleteUser = (user) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
        setError('');
    };

    const handleConfirmDelete = async () => {
        setActionLoading(true);
        setError('');

        try {
            await api.delete(`/Auth/users/${selectedUser.username}`);
            
            setSuccess(`✅ User "${selectedUser.username}" deleted successfully`);
            setShowDeleteModal(false);
            loadUsers();

        } catch (err) {
            console.error('Error deleting user:', err);
            if (err.response?.status === 403) {
                setError('Access denied. Only Administrators can delete users.');
            } else if (err.response?.status === 404) {
                setError('User not found.');
            } else {
                setError('Failed to delete user. Please try again.');
            }
        } finally {
            setActionLoading(false);
        }
    };

    /**
     * Modal close handlers
     */
    const handleCloseAddModal = () => {
        setFormData({
            username: '',
            password: '',
            confirmPassword: '',
            role: 'Assistant'
        });
        setError('');
        setShowAddModal(false);
    };

    const handleCloseEditModal = () => {
        setSelectedUser(null);
        setEditFormData({
            username: '',
            role: 'Assistant'
        });
        setError('');
        setShowEditModal(false);
    };

    const handleCloseDeleteModal = () => {
        setSelectedUser(null);
        setShowDeleteModal(false);
    };

    // Access control - only admins can access this page
    if (!isAdmin) {
        return (
            <Container className="d-flex justify-content-center align-items-center min-vh-100">
                <Alert variant="danger" className="text-center">
                    <h4>🚫 Access Denied</h4>
                    <p>Only Administrators can access user management.</p>
                </Alert>
            </Container>
        );
    }

    // Loading state
    if (loading && users.length === 0) {
        return (
            <Container className="d-flex justify-content-center align-items-center min-vh-100">
                <div className="text-center">
                    <Spinner animation="border" role="status" className="mb-3">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                    <p>Loading users...</p>
                </div>
            </Container>
        );
    }

    const getRoleBadgeVariant = (role) => {
        switch(role) {
            case 'Admin': return 'danger';
            case 'Doctor': return 'primary';
            case 'Assistant': return 'success';
            default: return 'secondary';
        }
    };

    return (
        <Container fluid className="p-4 min-vh-100">
            {/* Header */}
            <Row className="align-items-center mb-4">
                <Col>
                    <h1 className="text-primary mb-1 fw-bold">👥 User Management</h1>
                    <p className="text-muted mb-0">
                        Administrator: <strong>{currentUser.username}</strong>
                        <Badge bg="warning" className="ms-2">Administrator</Badge>
                    </p>
                </Col>
                <Col xs="auto">
                    <Button 
                        variant="success" 
                        className="me-2"
                        onClick={() => setShowAddModal(true)}
                    >
                        ➕ Add User
                    </Button>
                </Col>
            </Row>

            {/* Alerts */}
            {error && <Alert variant="danger">{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            {/* Users Table */}
            <Row>
                <Col>
                    <Card>
                        <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 fw-semibold">📋 System Users</h5>
                            <Badge bg="primary" className="fs-6">{users.length} user(s)</Badge>
                        </Card.Header>
                        <Card.Body>
                            {users.length > 0 ? (
                                <div className="table-responsive">
                                    <Table hover>
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Username</th>
                                                <th>Role</th>
                                                <th>Created Date</th>
                                                <th>Last Login</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.map(user => (
                                                <tr key={user.id}>
                                                    <td className="fw-semibold">#{user.id}</td>
                                                    <td>
                                                        <strong>{user.username}</strong>
                                                        {user.username === currentUser.username && (
                                                            <Badge bg="info" className="ms-2">You</Badge>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <Badge bg={getRoleBadgeVariant(user.role)}>
                                                            {user.role}
                                                        </Badge>
                                                    </td>
                                                    <td>
                                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                                    </td>
                                                    <td>
                                                        {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                                                    </td>
                                                    <td>
                                                        <ButtonGroup size="sm">
                                                            <Button 
                                                                variant="outline-primary"
                                                                onClick={() => handleEditUser(user)}
                                                                disabled={user.username === currentUser.username}
                                                                title={
                                                                    user.username === currentUser.username 
                                                                        ? 'Cannot edit your own account' 
                                                                        : 'Edit user role'
                                                                }
                                                            >
                                                                ✏️ Edit
                                                            </Button>
                                                            <Button 
                                                                variant="outline-danger"
                                                                onClick={() => handleDeleteUser(user)}
                                                                disabled={user.username === currentUser.username}
                                                                title={
                                                                    user.username === currentUser.username 
                                                                        ? 'Cannot delete your own account' 
                                                                        : 'Delete user'
                                                                }
                                                            >
                                                                🗑️ Delete
                                                            </Button>
                                                        </ButtonGroup>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>
                                </div>
                            ) : (
                                <div className="text-center text-muted py-4">
                                    <p>No users found in the system.</p>
                                    <Button 
                                        variant="success" 
                                        onClick={() => setShowAddModal(true)}
                                    >
                                        ➕ Add First User
                                    </Button>
                                </div>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Add User Modal */}
            <Modal show={showAddModal} onHide={handleCloseAddModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-semibold">➕ Add New User</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleAddUser}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Username *</Form.Label>
                            <Form.Control
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({...formData, username: e.target.value})}
                                placeholder="Enter username"
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Role *</Form.Label>
                            <Form.Select
                                value={formData.role}
                                onChange={(e) => setFormData({...formData, role: e.target.value})}
                                required
                            >
                                <option value="Assistant">👨‍💼 Assistant</option>
                                <option value="Doctor">👨‍⚕️ Doctor</option>
                                <option value="Admin">👑 Admin</option>
                            </Form.Select>
                            <Form.Text className="text-muted">
                                Select the role for the new user.
                            </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Password *</Form.Label>
                            <Form.Control
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                placeholder="Enter password (min 6 characters)"
                                required
                                minLength={6}
                            />
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Confirm Password *</Form.Label>
                            <Form.Control
                                type="password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                                placeholder="Confirm password"
                                required
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseAddModal} disabled={actionLoading}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={actionLoading}>
                            {actionLoading ? (
                                <>
                                    <Spinner size="sm" className="me-2" />
                                    Creating...
                                </>
                            ) : (
                                'Create User'
                            )}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Edit User Modal */}
            <Modal show={showEditModal} onHide={handleCloseEditModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-semibold">✏️ Edit User Role</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleUpdateUser}>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Username</Form.Label>
                            <Form.Control
                                type="text"
                                value={editFormData.username}
                                disabled
                                className="bg-light"
                            />
                            <Form.Text className="text-muted">
                                Username cannot be changed.
                            </Form.Text>
                        </Form.Group>

                        <Form.Group className="mb-3">
                            <Form.Label className="fw-semibold">Role *</Form.Label>
                            <Form.Select
                                value={editFormData.role}
                                onChange={(e) => setEditFormData({...editFormData, role: e.target.value})}
                                required
                            >
                                <option value="Assistant">👨‍💼 Assistant</option>
                                <option value="Doctor">👨‍⚕️ Doctor</option>
                                <option value="Admin">👑 Admin</option>
                            </Form.Select>
                            <Form.Text className="text-muted">
                                Update the user's role and system permissions.
                            </Form.Text>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleCloseEditModal} disabled={actionLoading}>
                            Cancel
                        </Button>
                        <Button variant="primary" type="submit" disabled={actionLoading}>
                            {actionLoading ? (
                                <>
                                    <Spinner size="sm" className="me-2" />
                                    Updating...
                                </>
                            ) : (
                                'Update Role'
                            )}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>

            {/* Delete User Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={handleCloseDeleteModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title className="fw-semibold">🗑️ Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Alert variant="warning">
                        <strong>⚠️ Warning:</strong> This action cannot be undone.
                    </Alert>
                    <p className="fw-semibold">
                        Are you sure you want to delete user <span className="text-danger">"{selectedUser?.username}"</span>?
                    </p>
                    <p className="text-muted">
                        This will permanently remove the user account and all associated data from the system.
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseDeleteModal} disabled={actionLoading}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleConfirmDelete} disabled={actionLoading}>
                        {actionLoading ? (
                            <>
                                <Spinner size="sm" className="me-2" />
                                Deleting...
                            </>
                        ) : (
                            'Delete User'
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Users;