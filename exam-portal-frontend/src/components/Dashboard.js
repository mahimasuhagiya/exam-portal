import React from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle } from 'reactstrap';
import ViewUsers from './ViewUsers';
import Sidebar from './Sidebar';
import Header from './Header';
import { useNavigate } from 'react-router-dom';
const Dashboard = () => {
  const isLoggedIn = (localStorage.getItem("userId") !== "null" && localStorage.getItem("userId") !== null)? true:false;

  const navigate = useNavigate();
  return (
    <Container>
      {isLoggedIn?<h1>Admin Dashboard </h1>:  navigate('/')}
    </Container>
  );
};
export default Dashboard;