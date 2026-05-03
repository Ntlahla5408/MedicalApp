// src/components/Dashboard.js
import React from 'react';
import { Container, Row, Col, Card, Badge } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';

function Dashboard() {
  const { user } = useAuth();

  const getRoleColor = (role) => {
    switch(role) {
      case 'Admin': return 'danger';
      case 'Doctor': return 'primary';
      case 'Assistant': return 'success';
      default: return 'secondary';
    }
  };

  return (
    <Container>
      <Row className="mb-4">
        <Col>
          <h1 className="fw-bold text-dark">Dashboard</h1>
          <p className="lead text-muted">Welcome to the Medical Management System</p>
        </Col>
      </Row>
      
      <Row className="g-4">
        <Col md={4}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Body className="text-center">
              <div className="mb-3">
                <span className="fs-1">👤</span>
              </div>
              <Card.Title>User Profile</Card.Title>
              <Card.Text>
                <strong>Username:</strong> {user.username}<br />
                <strong>Role:</strong> <Badge bg={getRoleColor(user.role)}>{user.role}</Badge><br />
                <strong>Last Login:</strong> {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'First login'}
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={8}>
          <Card className="h-100 shadow-sm border-0">
            <Card.Body>
              <Card.Title className="fw-bold">Quick Actions</Card.Title>
              <Card.Text>
                Based on your role <Badge bg={getRoleColor(user.role)}>{user.role}</Badge>, you can access:
              </Card.Text>
              
              <Row className="g-3 mt-3">
                {user.role === 'Admin' && (
                  <>
                    <Col md={6}>
                      <Card className="bg-light border-0">
                        <Card.Body>
                          <h6>👥 User Management</h6>
                          <small className="text-muted">Manage all system users and roles</small>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={6}>
                      <Card className="bg-light border-0">
                        <Card.Body>
                          <h6>📊 System Overview</h6>
                          <small className="text-muted">View all patients and visits</small>
                        </Card.Body>
                      </Card>
                    </Col>
                  </>
                )}
                
                {user.role === 'Doctor' && (
                  <>
                    <Col md={6}>
                      <Card className="bg-light border-0">
                        <Card.Body>
                          <h6>📝 Record Visits</h6>
                          <small className="text-muted">Create and manage patient visits</small>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={6}>
                      <Card className="bg-light border-0">
                        <Card.Body>
                          <h6>🔍 View Patients</h6>
                          <small className="text-muted">Search and view patient records</small>
                        </Card.Body>
                      </Card>
                    </Col>
                  </>
                )}
                
                {user.role === 'Assistant' && (
                  <>
                    <Col md={6}>
                      <Card className="bg-light border-0">
                        <Card.Body>
                          <h6>➕ Add Patients</h6>
                          <small className="text-muted">Register new patients in the system</small>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={6}>
                      <Card className="bg-light border-0">
                        <Card.Body>
                          <h6>✏️ Manage Patients</h6>
                          <small className="text-muted">Update patient information</small>
                        </Card.Body>
                      </Card>
                    </Col>
                  </>
                )}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard;