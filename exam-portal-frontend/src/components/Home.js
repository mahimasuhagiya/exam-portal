import React, { useState } from 'react';
import {
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Alert
} from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../services/authService';

const Home = () => {
  const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        const loginData = {
            username,
            password
        };

        try {
            // Call the login API 
            const response = await axios.post(`${API_URL}/authenticate`, loginData);

            const  token  = response.data.Token;
            const  userId  = response.data.userId;
            const  role  = response.data.role;
            localStorage.setItem('jwtToken', token);
            localStorage.setItem('userId', userId);
            console.log(token);
            if(role=="ADMIN" || role=="EXAMINER")
              navigate('/dashboard');
            else
              navigate("/userDashboard")
        } catch (err) {
            setError('Login failed. Please check your credentials.',err);
        }
    };

  return (
    <Container fluid className="d-flex align-items-center justify-content-center" style={{ height: '100vh' }}>
      <Row>
      <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="username">Username:</label>
                    <input 
                        type="text" 
                        id="username" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        required 
                    />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input 
                        type="password" 
                        id="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </div>
                {error && <div style={{color: 'red'}}>{error}</div>}
                <button type="submit">Login</button>
            </form>
        </div>
      </Row>
    </Container>
  );
};

export default Home;