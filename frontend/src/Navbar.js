import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const CustomNavbar = ({ onLogout }) => {
    const navigate = useNavigate();
    const username = localStorage.getItem('username');
    const userRole = localStorage.getItem('userRole');

    const handleLogout = () => {
        if (onLogout) {
            onLogout();
        }
        navigate('/login');
    };

    return (
        <Navbar bg="dark" variant="dark" expand="lg" className="shadow">
            <Container>
                <Navbar.Brand href="/dashboard" className="fw-bold">
                    🏥 Medical System
                </Navbar.Brand>
                
                <Navbar.Toggle aria-controls="basic-navbar-nav" />
                <Navbar.Collapse id="basic-navbar-nav">
                    <Nav className="me-auto">
                        <Nav.Link href="/dashboard">Dashboard</Nav.Link>
                        <Nav.Link href="/patients">Patients</Nav.Link>
                        {userRole === 'Admin' && (
                            <Nav.Link href="/users">User Management</Nav.Link>
                        )}
                    </Nav>
                    
                    <Nav className="ms-auto">
                        <Navbar.Text className="me-3">
                            Welcome, <strong>{username}</strong> 
                            <span className="badge bg-primary ms-2">{userRole}</span>
                        </Navbar.Text>
                        <Button variant="outline-light" size="sm" onClick={handleLogout}>
                            Logout
                        </Button>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    );
};

export default CustomNavbar;