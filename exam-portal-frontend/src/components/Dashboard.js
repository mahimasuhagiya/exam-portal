import React from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle } from 'reactstrap';
import ViewUsers from './ViewUsers';
import Sidebar from './Sidebar';

const Dashboard = () => {
  return (
    <Container>
      <Row>
        <Col className='col-3'>
          <Sidebar />
        </Col>
        <Col className='col-8'>
        <ViewUsers/>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;