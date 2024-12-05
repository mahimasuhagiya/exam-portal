import React from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle } from 'reactstrap';
import ViewUsers from './ViewUsers';
import Sidebar from './Sidebar';
import Header from './Header';
const Dashboard = () => {
  return (
    <Container>
        <ViewUsers/>
    </Container>
  );
};
export default Dashboard;