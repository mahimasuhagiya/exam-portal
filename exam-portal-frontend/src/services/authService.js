import axios from 'axios';

const API_URL = 'http://localhost:8080'; 

export const registerUser = async (userData) => {
    return await axios.post(`${API_URL}/users/registerUser`, userData);
};

export const loginUser = async (loginData) => {
    return await axios.post(`${API_URL}/login`, loginData);
};

export default API_URL;