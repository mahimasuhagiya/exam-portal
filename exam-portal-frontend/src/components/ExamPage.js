import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, CardBody, CardTitle, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL, { getWithExpiry, setWithExpiry } from '../services/authService';
import { toast, ToastContainer } from 'react-toastify';
import showToastConfirmation from './toast';
import 'react-quill/dist/quill.snow.css';
import Editor from "@monaco-editor/react";
import { Box, FormControl, InputLabel, MenuItem, Select } from '@mui/material';

const ExamPage = () => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState(JSON.parse(localStorage.getItem('answers')) || {});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(Number(localStorage.getItem('timeLeft')) || 60 * getWithExpiry('examDuration') || 0);
  const examId = getWithExpiry('examId');
  const token = getWithExpiry('jwtToken');
  const userId = getWithExpiry("userId");
  const [editorLanguage, setEditorLanguage] = useState("java");
  const [code, setCode] = useState(`public class Main { public static void main(String[] args) { System.out.println("Hello, World!"); } }`);
  const [output, setOutput] = useState("");

  const executeCode = async (event) => {
    event.preventDefault(); // Prevent form submission

    try {
      if (editorLanguage == 'python') {
        const response = await fetch("https://emkc.org/api/v2/piston/execute", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            language: "python",  
            version: "3.10",
            files: [
              { name: "main.py", content: code } 
            ],
          }),
        });
        // setOutput(response.data.run.output);
        setOutput((await response.json()).run.output.toString());
      }
      else{
        // const response = await fetch("http://localhost:8080/editor/code/execute",
        //   {
        //     method: "POST",
        //     headers: {
        //         "Content-Type": "application/json",
        //     },
        //     body: JSON.stringify({ 'language':editorLanguage, 'code':code }),
        // });
        // setOutput((await response.text()).toString());
        const response = await fetch("http://localhost:5000/execute-code", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: code,  // The code to execute
            language: editorLanguage,  // The programming language
          }),
        });
  
        const data = await response.json();  // Parse the response as JSON
        console.log(data);  // Log for debugging
        setOutput(data.output);
      }
    } catch (error) {
      setOutput("Error executing code", error);
    }
  };


  // Helper functions moved to the top
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleQuestionClick = (index) => {
    setCurrentQuestionIndex(index);
  };

  const isQuestionAttempted = (questionId) => {
    return answers.hasOwnProperty(questionId);
  };

  const handleLanguageChange = (event) => {
    setEditorLanguage(event.target.value);
  };

  const handleProgrammingAnswerChange = (value) => {
    setAnswers({
      ...answers,
      [questions[currentQuestionIndex].id]: value,
    });
  };

  const runCode = () => {
    const code = answers[questions[currentQuestionIndex].id] || '';
    let logs = [];

    try {
      // Save original console functions
      const originalConsoleLog = console.log;
      const originalConsoleError = console.error;

      // Override console methods to capture output
      console.log = (...args) => {
        logs.push(args.join(' '));
        originalConsoleLog(...args);
      };

      console.error = (...args) => {
        logs.push(`ERROR: ${args.join(' ')}`);
        originalConsoleError(...args);
      };

      // Execute the code
      const func = new Function(code);
      const result = func();

      // Restore original console functions
      console.log = originalConsoleLog;
      console.error = originalConsoleError;

      // Combine logs and result
      let outputContent = logs.join('\n');
      if (result !== undefined) {
        outputContent += `\n>> Final result: ${JSON.stringify(result)}`;
      }

      setOutput(outputContent || "Code executed successfully (no output)");

    } catch (error) {
      setOutput(`Execution Error: ${error.message}`);
    }
  };

  useEffect(() => {
    // Prevent text selection during the exam
    document.body.style.userSelect = 'none';

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

  // Start timer from stored time on reload
  useEffect(() => {
    if (timeLeft <= 0) {
      saveCallback(); // Automatically submit when timer runs out
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prevTime) => {
        const newTime = prevTime - 1;
        localStorage.setItem('timeLeft', newTime); // Store updated timeLeft in localStorage
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timerId);// Cleanup timer on component unmount
  }, [timeLeft]);

  useEffect(() => {
    localStorage.setItem('answers', JSON.stringify(answers));// Store answers
  }, [answers]);

  const handleAnswerChange = (questionId, option) => {
    setAnswers({
      ...answers,
      [questionId]: option,
    });
  };

  const saveCallback = async () => {
    try {
      await axios.post(
        `${API_URL}/questions_attempt/${examId}/${userId}`,
        answers,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setWithExpiry('examId', 0);
      setWithExpiry('examDuration', 0);
      // Navigate after successful submission
      navigate('/examsubmit');
    } catch (error) {
      console.error('Submission error:', error.response?.data || error.message);
      toast.error("Error submitting exam. Please try again.");
    }
  };

  const handleSubmit = async () => {
    showToastConfirmation("submit", "exam", saveCallback);
  };

  const SubmitExam = async () => {
    toast.warn("You changed tabs or windows - submitting the exam...");
    localStorage.setItem("doneSuspiciousActivity", true);
    setTimeout(() => saveCallback(), 1000)
  };

  // // Handle tab/window switching
  // useEffect(() => {
  //   const handleVisibilityChange = () => {
  //     if (document.hidden) {
  //       SubmitExam();
  //     }
  //   };


  //   document.addEventListener('visibilitychange', handleVisibilityChange);
  //   return () => {
  //     document.removeEventListener('visibilitychange', handleVisibilityChange);
  //   };
  // }, []);


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
                      <div>
                        <FormControl sx={{ marginTop: '20px', minWidth: 120, height: '40px' }}>
                          <InputLabel id="language-select-label">Language</InputLabel>
                          <Select
                            value={editorLanguage}
                            onChange={handleLanguageChange}
                            label="Language"
                          >
                            <MenuItem value="c">C</MenuItem>
                            <MenuItem value="python">Python</MenuItem>
                            <MenuItem value="java">Java</MenuItem>
                            <MenuItem value="csharp">C#</MenuItem>
                            <MenuItem value="cpp">C++</MenuItem>
                            <MenuItem value="sql">SQL</MenuItem>
                          </Select>
                        </FormControl>
                        <Editor
                          height="300px"
                          defaultLanguage="java"
                          // defaultValue={code}
                          onChange={(value) => setCode(value)}
                          theme="vs-dark"
                        />
                        <Button onClick={executeCode} type="button">Run</Button>
                        <pre>{output}</pre>
                      </div>
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