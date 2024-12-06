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
import API_URL from '../../services/authService';

export function LoginForm(props) {

  const { switchToForgotpassword } = useContext(AccountContext);
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
               window.location.href = '/dashboard';
            else
            window.location.href ="/userDashboard";
        } catch (err) {
            setError('Login failed. Please check your credentials.',err);
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
        <SubmitButton type="submit" >Signin</SubmitButton>
        <Marginer direction="vertical" margin="1.6em" />
      </FormContainer>
      <LineText>
        Forgot password?{" "}
        <BoldLink onClick={switchToForgotpassword} href="#">
          Click here
        </BoldLink>
      </LineText>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </BoxContainer>
  );
}