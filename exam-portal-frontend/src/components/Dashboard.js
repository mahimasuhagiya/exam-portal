import React , { useEffect }from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
const Dashboard = () => {
  const isLoggedIn = localStorage.getItem("userId") !== "null" && localStorage.getItem("userId") !== null;
  const navigate = useNavigate();
    // Redirect if not logged in
    useEffect(() => {
      if (!isLoggedIn) {
        navigate('/');
      }
    }, [isLoggedIn, navigate]);
  
  return (
    <Container>
      <h1>Admin Dashboard </h1>
    </Container>
  );
};
export default Dashboard;