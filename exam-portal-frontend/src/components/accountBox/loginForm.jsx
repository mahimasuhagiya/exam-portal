import React, { useContext ,useState} from "react";
import {
  BoldLink,
  BoxContainer,
  FormContainer,
  Input,
  LineText,
  MutedLink,
  SubmitButton,
} from "./common";
import { Marginer } from "../marginer";
import { AccountContext } from './accountContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL, { setWithExpiry } from '../../services/authService';

export function LoginForm(props) {
  const { switchToForgotpassword } = useContext(AccountContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Email validation function
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    // Validation checks
    if (!username || !password) {
      setError("Both fields are required.");
      return;
    }

    if (!validateEmail(username)) {
      setError("Invalid email format.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    const loginData = { username, password };

    try {
        // Call the login API 
        const response = await axios.post(`${API_URL}/authenticate`, loginData);

        const  token  = response.data.Token;
        const  userId  = response.data.userId;
        const  role  = response.data.role;
        const ttl = 30 * 24 * 60 * 60 * 1000;

        setWithExpiry('jwtToken', token, ttl);
        setWithExpiry('userId', userId, ttl);
        setWithExpiry('role', role, ttl);
        console.log(token);
        
        if(role === "ADMIN" || role === "EXAMINER")
            window.location.href = '/dashboard';
        else
            window.location.href ="/student";
    } catch (err) {
        setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <BoxContainer>
      <FormContainer as="form" style={{display: "contents"}} onSubmit={handleSubmit}>
        <Input
          type="email"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
          required
        />
        <Input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          required
        />
        <Marginer direction="vertical" margin={10} />
        <SubmitButton type="submit">Sign-In</SubmitButton>
        <Marginer direction="vertical" margin="1.6em" />
      </FormContainer>
      {/* <LineText>
        Forgot password?{" "}
        <BoldLink onClick={switchToForgotpassword} href="#">
          Click here
        </BoldLink>
      </LineText> */}
      {error && <p style={{ color: "red", fontSize: "14px" }}>{error}</p>}
    </BoxContainer>
  );
}
 