import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../services/authService';
import { toast, ToastContainer } from 'react-toastify';
import showToastConfirmation from './toast';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import styles for react-quill

const ExamPage = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60 * localStorage.getItem("examDuration") || 0);
  const examId = localStorage.getItem("examId");
  const token = localStorage.getItem('jwtToken');
  const userId = localStorage.getItem("userId"); 

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!token) return;
      try {
        const response = await axios.get(`${API_URL}/exam_questions/questions/${examId}/true`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        setQuestions(response.data);
      } catch (error) {
        toast.error('Error fetching exam questions!');
        console.error(error);
      }
    };

    fetchQuestions();
  }, [token]);

  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit(); // Automatically submit when timer runs out
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);

    return () => clearInterval(timerId); // Cleanup timer on component unmount
  }, [timeLeft]);

  const handleAnswerChange = (questionId, option) => {
    const optionValue = option ;
  
    setAnswers({
      ...answers,
      [questionId]: optionValue,
    });
  };

  const handleRichTextChange = (questionId, value) => {
    setAnswers({
      ...answers,
      [questionId]: value,
    });
  };

  const handleSubmit = async () => {
    const saveCallback = async () => {
      try {
        console.log(answers);
        const response = await axios.post(
         `${API_URL}/questions_attempt/${examId}/${userId}`,
          answers ,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
       
        localStorage.setItem('examId', 0);
        localStorage.setItem('examDuration', 0);
  
        // Navigate after successful submission
        navigate('/student');
      } catch (error) {
        console.error('Submission error:', error.response?.data || error.message);
        toast.error("Error submitting exam. Please try again.");
      }
    };
  
    showToastConfirmation("submit", "exam", saveCallback);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleQuestionClick = (index) => {
    setCurrentQuestionIndex(index);
  };

  const isQuestionAttempted = (questionId) => {
    return answers.hasOwnProperty(questionId);
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Container>
      <ToastContainer />
      <Row>
        {/* Left Sidebar for Navigation */}
        <Col xs="3" style={{ position: 'sticky', top: '20px', height: '100vh', overflowY: 'auto', borderRight: '2px solid #ccc' }}>
          <h4>Question Navigation</h4>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {questions.length > 0 && (
              <Row>
                {questions.map((question, index) => (
                  <Col key={question.id} xs="1" style={{ marginBottom: '10px' }}>
                    <Button
                      color={isQuestionAttempted(question.id) ? 'success' : 'secondary'}
                      style={{
                        width: '100%',
                        textAlign: 'center',
                        fontWeight: 'bold',
                        backgroundColor: isQuestionAttempted(question.id) ? 'green' : '',
                      }}
                      onClick={() => handleQuestionClick(index)}
                    >
                      {index + 1}
                    </Button>
                  </Col>
                ))}
              </Row>
            )}
          </div>
        </Col>

        {/* Main Content */}
        <Col xs="9">
          <h2>Exam</h2>
          <div style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 'bold' }}>
            Time Remaining: {formatTime(timeLeft)}
          </div>
          {questions.length === 0 ? (
            <p>Loading questions...</p>
          ) : (
            <Form>
              <Card style={{ margin: '10px' }}>
                <CardBody>
                  {/* Display current question */}
                  <CardTitle tag="h5">{questions[currentQuestionIndex].question}</CardTitle>
                  {questions[currentQuestionIndex].image ? (
                    <img
                      src={`${API_URL}/${questions[currentQuestionIndex].image}`}
                      alt="image"
                      style={{ width: '100px', height: '100px' }}
                    />
                  ) : null}

                  {/* Conditional rendering based on programming question */}
                  {questions[currentQuestionIndex].programming ? (
                    <FormGroup>
                      <Label for="richTextAnswer">Answer:</Label>
                      <ReactQuill
                        value={answers[questions[currentQuestionIndex].id] || ''}
                        onChange={(value) => handleRichTextChange(questions[currentQuestionIndex].id, value)}
                        theme="snow"
                        placeholder="Write your code here..."
                      />
                    </FormGroup>
                  ) : (
                    <Row>
                      {["A", "B", "C", "D"].map((option) =>
                        questions[currentQuestionIndex][`option${option}`] && (
                          <Col xs="6" key={option}>
                            <FormGroup>
                              <Label>
                                <Input
                                  type="radio"
                                  name={`question-${questions[currentQuestionIndex].id}`}
                                  value={option}
                                  checked={answers[questions[currentQuestionIndex].id] === (option)}
                                  onChange={() =>
                                    handleAnswerChange(questions[currentQuestionIndex].id, option)
                                  }
                                />
                                {questions[currentQuestionIndex][`${option.toLowerCase()}image`] ? (
                                  <img
                                    src={`${API_URL}/${questions[currentQuestionIndex][`option${option}`]}`}
                                    alt={`Option ${option}`}
                                    style={{ width: '100px', height: '100px' }}
                                  />
                                ) : (
                                  questions[currentQuestionIndex][`option${option}`]
                                )}
                              </Label>
                            </FormGroup>
                          </Col>
                        )
                      )}
                    </Row>
                  )}

                  {/* Navigation Controls */}
                  <Row>
                    <Col xs="6" className="text-left">
                      <Button color="secondary" onClick={handlePreviousQuestion} disabled={currentQuestionIndex === 0}>
                        Previous
                      </Button>
                    </Col>
                    <Col xs="6" className="text-right">
                      <Button color="secondary" onClick={handleNextQuestion} disabled={currentQuestionIndex === questions.length - 1}>
                        Next
                      </Button>
                    </Col>
                  </Row>
                </CardBody>
              </Card>

              <Button color="primary" onClick={handleSubmit}>
                Submit Exam
              </Button>
            </Form>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ExamPage;
