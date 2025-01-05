import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle,CardText } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../services/authService';
import { toast, ToastContainer } from 'react-toastify';
const DashboardCard = ({ title, count, bgColor, textColor, icon }) => {
  return (
    <Card
      className="text-center mb-4 shadow"
      style={{
        backgroundColor: bgColor,
        color: textColor,
        border: 'none',
        borderRadius: '10px',
        minHeight: '150px',
      }}
    >
      <CardBody>
        {icon && (
          <div className="mb-3">
            <i className={`fa ${icon}`} style={{ fontSize: '2.5rem' }}></i>
          </div>
        )}
        <CardTitle tag="h5">{title}</CardTitle>
        <CardText className="display-4 fw-bold">{count}</CardText>
      </CardBody>
    </Card>
  );
};

const Dashboard = () => {
  const isLoggedIn = localStorage.getItem("userId") !== "null" && localStorage.getItem("userId") !== null;
  const token = localStorage.getItem('jwtToken');
  const [pendingResultsCount, setPendingResultsCount] = useState(0);
  const [examsCount, setExamsCount] = useState(0);
  const [activeExamsCount, setActiveExamsCount] = useState(0);
  const [studentsCount, setStudentsCount] = useState(0);
  const navigate = useNavigate();
    // Redirect if not logged in
    useEffect(() => {
      if (!isLoggedIn) {
        navigate('/');
      }

    }, [isLoggedIn, navigate]);
  
    useEffect(() => {
      const fetchStudentsCount = async () => {
        if (!token) return;
        try {
          const response = await axios.get(`${API_URL}/users/student_count`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          setStudentsCount(response.data);
        } catch (error) {
          toast.error("Error fetching student's count!");
          console.error(error);
        }
      };
      const fetchActiveExamsCount = async () => {
        if (!token) return;
        try {
          const response = await axios.get(`${API_URL}/exams/active_count`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          setActiveExamsCount(response.data);
        } catch (error) {
          toast.error("Error fetching active exam's count!");
          console.error(error);
        }
      };
      const fetchPendingResultsCount = async () => {
        if (!token) return;
        try {
          const response = await axios.get(`${API_URL}/result/pending`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          setPendingResultsCount(response.data);
        } catch (error) {
          toast.error("Error fetching pending result's count!");
          console.error(error);
        }
      };
      const fetchExamsCount = async () => {
        if (!token) return;
        try {
          const response = await axios.get(`${API_URL}/exams/count`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          setExamsCount(response.data);
        } catch (error) {
          toast.error("Error fetching exam's count!");
          console.error(error);
        }
      };
    
   
      fetchStudentsCount();
      fetchActiveExamsCount();
      fetchPendingResultsCount();
      fetchExamsCount();
    }, [token]);
  
    const data = {
      totalStudents: 1200,
      activeExams: 15,
      upcomingExams: 5,
      completedExams: 50,
    };
  
    return (
      <div className="container mt-5">
        <Row className="justify-content-center">
        <Col lg="5" md="6" sm="12">
          <DashboardCard
            title="Total Students"
            count={studentsCount}
            bgColor="#67AF6F  " 
            textColor="#ffffff"
            icon="fa-users"
          />
        </Col>
        <Col lg="5" md="6" sm="12">
          <DashboardCard
            title="Active Exams"
            count={activeExamsCount}
            bgColor="#21C0F3"
            textColor="#ffffff"
            icon="fa-book"
          />
        </Col>
        <Col lg="5" md="6" sm="12">
          <DashboardCard
            title="Pending Results"
            count={pendingResultsCount}
            bgColor="#ecaa44" 
            textColor="#ffffff"
            icon="fa-hourglass-half"
          />
        </Col>
        <Col lg="5" md="6" sm="12">
          <DashboardCard
            title="Total Exams"
            count={examsCount}
            bgColor="#9C4DB0" 
            textColor="#ffffff"
            icon="fa-list-alt"
          />
        </Col>
        </Row>
      </div>
    );
  };  


export default Dashboard;