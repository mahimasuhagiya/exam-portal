import React, { useState, useEffect } from 'react';
const styles = {
  card: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    width: '300px',
    backgroundColor: '#f9f9f9',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    marginBottom: '20px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '10px',
  },
  body: {
    marginTop: '10px',
  },
};

const UserCard = ({ user }) => {
    const {
      name,
      email,
      phone,
      address,
      college,
      role,
      active,
    } = user;
  
    return (
      <div style={styles.card}>
        <div style={styles.header}>
          <h2>{name}</h2>
          <p>{role}</p>
        </div>
        <div style={styles.body}>
          <p><strong>Email:</strong> {email}</p>
          <p><strong>Phone:</strong> {phone}</p>
          <p><strong>Address:</strong> {address}</p>
          {/* <p><strong>College:</strong> {college.name}, {college.address}</p> */}
          <p><strong>Status:</strong> {active ? "Active" : "Inactive"}</p>
        </div>
      </div>
    );
  };

    
  export default UserCard;
  