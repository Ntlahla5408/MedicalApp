// src/components/Navigation.js
import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Navigation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (location.pathname === '/login') {
    return null;
  }

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/dashboard" className="fw-bold">
          🏥 Medical System
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          {user && (
            <>
              <Nav className="me-auto">
                <Nav.Link as={Link} to="/dashboard" className="fw-semibold">
                  Dashboard
                </Nav.Link>
                {(user.role === 'Assistant' || user.role === 'Admin') && (
                  <Nav.Link as={Link} to="/patients" className="fw-semibold">
                    Patients
                  </Nav.Link>
                )}
                {(user.role === 'Doctor' || user.role === 'Admin' || user.role === 'Assistant') && (
                  <Nav.Link as={Link} to="/visits" className="fw-semibold">
                    Visits
                  </Nav.Link>
                )}
                {user.role === 'Admin' && (
                  <Nav.Link as={Link} to="/users" className="fw-semibold">
                    Users
                  </Nav.Link>
                )}
              </Nav>
              <Nav>
                <Navbar.Text className="me-3 text-light">
                  <strong>{user.username}</strong> ({user.role})
                </Navbar.Text>
                <Button variant="outline-light" size="sm" onClick={handleLogout}>
                  Logout
                </Button>
              </Nav>
            </>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export default Navigation;