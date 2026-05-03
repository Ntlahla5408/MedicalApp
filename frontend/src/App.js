import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Login from './Login';
import Patient from './Assistant/Patients';
import Dashboard from './Dashboards';
import UserManagement from './UserManagement';
import DoctorVisits from './visits';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState('');

    const handleLogin = (userData) => {
        setIsAuthenticated(true);
        setUserRole(userData.role);
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setUserRole('');
        localStorage.removeItem('jwtToken');
        localStorage.removeItem('username');
        localStorage.removeItem('userRole');
    };

    const PrivateRoute = ({ children }) => {
        const token = localStorage.getItem('jwtToken');
        return token ? children : <Navigate to="/login" />;
    };

    return (
        <Router>
            <div className="App">
                <Routes>
                    {/* Login Route */}
                    <Route 
                        path="/login" 
                        element={
                            localStorage.getItem('jwtToken') ? 
                            <Navigate to="/Dashboards" /> : 
                            <Login onLogin={handleLogin} />
                        } 
                    />
                    
                    {/* Dashboard Route */}
                    <Route 
                        path="/Dashboards" 
                        element={
                            <PrivateRoute>
                                <Dashboard onLogout={handleLogout} />
                            </PrivateRoute>
                        } 
                    />
                    
                    {/* Patients Route */}
                    <Route 
                        path="/patients" 
                        element={
                            <PrivateRoute>
                                <Patient onLogout={handleLogout} />
                            </PrivateRoute>
                        } 
                    />
                    
                    {/* User Management Route - Admin Only */}
                    <Route 
                        path="/users" 
                        element={
                            <PrivateRoute>
                                <UserManagement onLogout={handleLogout} />
                            </PrivateRoute>
                        } 
                    />

                     {/* Doctor Visits Route - Doctor Only */}
                    <Route 
                        path="/visits" 
                        element={
                            <PrivateRoute>
                                <DoctorVisits onLogout={handleLogout} />
                            </PrivateRoute>
                        } 
                    />
                    
                    {/* Root Route - Redirect to Dashboard */}
                    <Route 
                        path="/" 
                        element={<Navigate to="/Dashboards" />} 
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;