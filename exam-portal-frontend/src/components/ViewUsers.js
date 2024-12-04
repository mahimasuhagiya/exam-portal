import React, { useState, useEffect } from 'react';
import UserCard from './UserCard';
import API_URL from './../services/authService'
import axios from 'axios';
function ViewUsers() {
    const [users, setUsers] = useState([]);
  
    useEffect(() => {
      const fetchUsers = async () => {
        try {
          const token = localStorage.getItem('jwtToken');
          const response = await axios.get(`${API_URL}/users`,{
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            }
          });
          // if (!response.ok) {
          //   throw new Error('Failed to fetch');
          // }
          // const data = await response.json();
          setUsers(response.data);
        } catch (error) {
          console.error('Error fetching users:'+ error);
        }
      };
  
      fetchUsers();
    }, []);
  
    return (
      <div style={{ padding: '20px' }}>
        {users.length > 0 ? (
          users.map(user => <UserCard key={user.id} user={user} />)
        ) : (
          <p>Loading...</p>
        )}
      </div>
    );
  }
  
  export default ViewUsers;