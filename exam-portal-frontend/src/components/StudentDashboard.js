import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle, Button } from 'reactstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import API_URL from "../services/authService";
import { toast, ToastContainer } from "react-toastify";
import "../css/styles.css";
import '@fortawesome/fontawesome-free/css/all.min.css';


const StudentDashboard = () => {
  const navigate = useNavigate();
  const isLoggedIn =
    localStorage.getItem("userId") !== "null" && localStorage.getItem("userId") !== null;
  const [examsData, setExamsData] = useState([]);
  const token = localStorage.getItem("jwtToken");

  // Fetch exams data
  const fetchExams = async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${API_URL}/exams/active`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setExamsData(response.data);
    } catch (error) {
      toast.error("Error fetching exams data!");
    }
  };
  // Redirect if not logged in
  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/');
    }
    fetchExams();
  }, [isLoggedIn, navigate]);

  const startexam = (exam) => {
    localStorage.setItem('examId', exam.id);
    localStorage.setItem('examDuration', exam.durationMinutes);
    navigate(`/exam`);
  };

  return (
    <Container>
      {isLoggedIn && (
        <div>{examsData.length == 0 ?
          <Card style={{ textAlign: "center", margin: "10px" }}>
            <CardBody>
              <CardTitle tag="h5">
                <i className="fas fa-exclamation-triangle" style={{ fontSize: "100px", color: "#ecaa44" }}></i>
              </CardTitle>
              <p> No exam is currently active.</p>
            </CardBody>
          </Card>
          :
          <div>{examsData.map((exam) => (
            <Row>
              <Col key={exam.id}>
                <Card style={{ textAlign: "center", margin: "10px" }}>
                  <CardBody>
                    <CardTitle tag="h5">{exam.title}</CardTitle>
                    <p> <strong>Number of Questions:</strong> {exam.numberOfQuestions}</p>
                    <p>
                      <strong>Duration:</strong> {exam.durationMinutes} (min)
                    </p>
                    {/* <Link to={`/exam/${exam.id}`}> */}
                      <Button color="primary" onClick={()=> startexam(exam)}>Start Exam</Button>
                    {/* </Link> */}
                  </CardBody>
                </Card>
              </Col>
            </Row>
          ))}
          </div>
        }
        </div>
      )}
    </Container>
  );
};

export default StudentDashboard;
