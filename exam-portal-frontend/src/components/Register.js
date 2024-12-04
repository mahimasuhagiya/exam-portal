import React, { useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../services/authService";

const Register = () => {
  const [collages, setCollages] = useState([]);
  const [userRoles, setUserRoles] = useState([]);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    college: "",
    role: "",
  });
  

  useEffect(() => {
    axios.get(`${API_URL}/colleges`)
      .then(response => setCollages(response.data))
      .catch(error => console.error("Error fetching colleges:", error));

    axios.get(`${API_URL}/userroles`)
      .then(response => setUserRoles(response.data))
      .catch(error => console.error("Error fetching user roles:", error));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    axios.post(`${API_URL}/register`, formData)
      .then(response => {
        console.log("User registered successfully:", response);
      })
      .catch(error => {
        console.error("Error registering user:", error);
      });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Username</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
        />
      </div>

      <div>
        <label>Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
        />
      </div>

      <div>
        <label>College</label>
        <select
        name="college"
        value={formData.college}
        onChange={handleChange}
        >
        <option value="">Select College</option>
        {collages.map((college) => (
            <option key={college.id} value={college.id}>
            {college.name}
            </option>
        ))}
        </select>
      </div>

      <div>
        <label>Role</label>
        <select
        name="role"
        value={formData.role}
        onChange={handleChange}
        >
        <option value="">Select Role</option>
        {userRoles.map((role) => (
            <option key={role.id} value={role.id}>
            {role.name}
            </option>
        ))}
        </select>
      </div>

      <button type="submit">Register</button>
    </form>
  );
};

export default Register;
