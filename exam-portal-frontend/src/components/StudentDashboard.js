import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle, Button, List } from 'reactstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from "axios";
import API_URL, { getWithExpiry, setWithExpiry } from "../services/authService";
import { toast, ToastContainer } from "react-toastify";
import "../css/styles.css";
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Box, ListItem, ListItemText, Stack, Typography } from '@mui/material';


const StudentDashboard = () => {
  const navigate = useNavigate();
  const isLoggedIn =
    getWithExpiry("userId") !== "null" && getWithExpiry("userId") !== null;
  const [examsData, setExamsData] = useState([]);
  const token = getWithExpiry("jwtToken");
  const userId = getWithExpiry("userId");

  // Fetch exams data
  const fetchExams = async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${API_URL}/exams/active/${userId}`, {
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
    const startExamCallback = async () => {
      localStorage.setItem("doneSuspiciousActivity",false);
      setWithExpiry('examId', exam.id, 24  * 60  * 60  * 1000 );
      setWithExpiry('examDuration', exam.durationMinutes, 24  * 60  * 60  * 1000);
      navigate(`/exam`);
    }
    const toastId = toast(
      <Box sx={{ padding: 2 }}>
        <Typography variant="h6" style={{ textAlign: "center", color: "black" }} gutterBottom>
          Exam Instructions
        </Typography>
        <Stack spacing={1} sx={{ marginBottom: 2 }}>
          <Typography >
            Please read the following instructions carefully before starting your exam:
          </Typography>
          <Typography >
            • Ensure you are in a quiet environment free of distractions.
          </Typography>
          <Typography >
            • You have <b>{exam?.durationMinutes} minutes</b> to complete this exam.
          </Typography>
          <Typography >
            • The exam consists of <b>{exam?.numberOfQuestions} questions</b>.
          </Typography>
          <Typography >
            • Once the exam starts, you cannot pause or navigate away from the window.
          </Typography>
          <Typography >
            • The exam will auto-submit if you change tabs, windows, or when the time ends.
          </Typography>
          <Typography sx={{ fontWeight: 'bold', color: 'red' }}>
            • Make sure to review your answers before submission.
          </Typography>
        </Stack>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              startExamCallback();
              toast.dismiss(toastId );
            }}
          >
            Start Exam
          </Button>
          <Button variant="outlined" color="secondary" onClick={() => toast.dismiss(toastId )}>
            Cancel
          </Button>
        </Stack>
      </Box>,
      {
        position: "top-center",
        autoClose: false,
      }
    );

  };

  return (
    <Container>
      <ToastContainer />
      {isLoggedIn && (
        <div>{examsData.length == 0 ?
          <Card style={{ textAlign: "center", margin: "10px" }}>
            <CardBody>
              <CardTitle tag="h5">
                <i className="fas fa-exclamation-triangle" style={{ fontSize: "100px", color: "#ecaa44" }}></i>
              </CardTitle>
              <p> No exam found for you.</p>
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
                    <Button color="primary" onClick={() => startexam(exam)}>Start Exam</Button>
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
