import React, { useState, useEffect } from 'react';
import { Alert, Button, Card, Container } from 'react-bootstrap';
import axios from 'axios';

const ConnectionTest = () => {
    const [connectionStatus, setConnectionStatus] = useState('testing');
    const [message, setMessage] = useState('');

    const testConnection = async () => {
        const testUrls = [
            'https://localhost:7084/api/Auth/users',
            'https://localhost:7084/swagger/index.html',
            'http://localhost:5084/api/Auth/users',
            'http://localhost:5084/swagger/index.html'
        ];

        for (const url of testUrls) {
            try {
                console.log(`Testing: ${url}`);
                const response = await axios.get(url, { 
                    timeout: 5000,
                    httpsAgent: new (require('https').Agent)({  
                        rejectUnauthorized: false
                    })
                });
                
                setConnectionStatus('success');
                setMessage(`✅ Connected successfully to: ${url}`);
                console.log(`✅ Success: ${url}`, response.status);
                return;
            } catch (error) {
                console.log(`❌ Failed: ${url}`, error.message);
            }
        }

        setConnectionStatus('error');
        setMessage('❌ Cannot connect to any backend URL. Please check: 1) Backend is running, 2) Correct port, 3) No firewall blocking');
    };

    useEffect(() => {
        testConnection();
    }, []);

    return (
        <Container className="py-5">
            <Card>
                <Card.Header>
                    <h4>Backend Connection Test</h4>
                </Card.Header>
                <Card.Body>
                    <Alert variant={connectionStatus === 'success' ? 'success' : 'danger'}>
                        <h5>Connection Status: {connectionStatus === 'success' ? '✅ Connected' : '❌ Disconnected'}</h5>
                        <p>{message}</p>
                    </Alert>
                    
                    <h6>Troubleshooting Steps:</h6>
                    <ol>
                        <li>Ensure ASP.NET Core backend is running in Visual Studio</li>
                        <li>Check that Swagger loads at: <a href="https://localhost:7084/swagger" target="_blank">https://localhost:7084/swagger</a></li>
                        <li>Try running backend on HTTP instead of HTTPS</li>
                        <li>Check Windows Firewall settings</li>
                        <li>Restart both frontend and backend</li>
                    </ol>
                    
                    <Button variant="primary" onClick={testConnection}>
                        Test Connection Again
                    </Button>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default ConnectionTest;