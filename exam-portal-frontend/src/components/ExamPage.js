import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../services/authService';
import { toast } from 'react-toastify';

const ExamPage = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60 * 15); // 15 minutes in seconds
  const token = localStorage.getItem('jwtToken');

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!token) return;
      try {
        const response = await axios.get(`${API_URL}/exam_questions/questions/8`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        console.log('API response:', response.data);
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

  const handleAnswerChange = (questionId, answer) => {
    setAnswers({
      ...answers,
      [questionId]: answer,
    });
  };

  const handleSubmit = () => {
    console.log('Submitted Answers:', answers);
    toast.success('Your exam has been submitted!');
    navigate('/student');
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
                            ) :<></>
                  }
                  {/* Answer Options */}
                  <Row>
                    {questions[currentQuestionIndex].optionA && (
                      <Col xs="6">
                        <FormGroup>
                          <Label>
                            <Input
                              type="radio"
                              name={`question-${questions[currentQuestionIndex].id}`}
                              value="optionA"
                              checked={answers[questions[currentQuestionIndex].id] === 'optionA'}
                              onChange={() => handleAnswerChange(questions[currentQuestionIndex].id, 'optionA')}
                            />
                            {questions[currentQuestionIndex].aimage ? (
                              <img
                                src={`${API_URL}/${questions[currentQuestionIndex].optionA}`}
                                alt="Option A"
                                style={{ width: '100px', height: '100px' }}
                              />
                            ) : (
                              questions[currentQuestionIndex].optionA
                            )}
                          </Label>
                        </FormGroup>
                      </Col>
                    )}
                    {questions[currentQuestionIndex].optionB && (
                      <Col xs="6">
                        <FormGroup>
                          <Label>
                            <Input
                              type="radio"
                              name={`question-${questions[currentQuestionIndex].id}`}
                              value="optionB"
                              checked={answers[questions[currentQuestionIndex].id] === 'optionB'}
                              onChange={() => handleAnswerChange(questions[currentQuestionIndex].id, 'optionB')}
                            />
                            {questions[currentQuestionIndex].bimage ? (
                              <img
                                src={`${API_URL}/${questions[currentQuestionIndex].optionB}`}
                                alt="Option B"
                                style={{ width: '100px', height: '100px' }}
                              />
                            ) : (
                              questions[currentQuestionIndex].optionB
                            )}
                          </Label>
                        </FormGroup>
                      </Col>
                    )}
                     {questions[currentQuestionIndex].optionC && (
                      <Col xs="12" sm="6">
                        <FormGroup>
                          <Label>
                            <Input
                              type="radio"
                              name={`question-${questions[currentQuestionIndex].id}`}
                              value="optionC"
                              checked={answers[questions[currentQuestionIndex].id] === 'optionC'}
                              onChange={() => handleAnswerChange(questions[currentQuestionIndex].id, 'optionC')}
                            />
                            {questions[currentQuestionIndex].cimage ? (
                              <img
                                src={`${API_URL}/${questions[currentQuestionIndex].optionC}`}
                                alt="Option C"
                                style={{ width: '100px', height: '100px' }}
                              />
                            ) : (
                              questions[currentQuestionIndex].optionC
                            )}
                          </Label>
                        </FormGroup>
                      </Col>
                    )}

                    {questions[currentQuestionIndex].optionD && (
                      <Col xs="12" sm="6">
                        <FormGroup>
                          <Label>
                            <Input
                              type="radio"
                              name={`question-${questions[currentQuestionIndex].id}`}
                              value="optionD"
                              checked={answers[questions[currentQuestionIndex].id] === 'optionD'}
                              onChange={() => handleAnswerChange(questions[currentQuestionIndex].id, 'optionD')}
                            />
                            {questions[currentQuestionIndex].dimage ? (
                              <img
                                src={`${API_URL}/${questions[currentQuestionIndex].optionD}`}
                                alt="Option D"
                                style={{ width: '100px', height: '100px' }}
                              />
                            ) : (
                              questions[currentQuestionIndex].optionD
                            )}
                          </Label>
                        </FormGroup>
                      </Col>
                    )}
                  </Row>

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
