import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, CardBody, CardTitle, Button, Form, FormGroup, Label, Input } from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import API_URL, { getWithExpiry } from "../services/authService";
import { toast, ToastContainer } from "react-toastify";
import showToastConfirmation from "./toast";

const ExamResult = () => {
  const navigate = useNavigate();
  const [resultDetails, setResultDetails] = useState({});
  const [questions, setQuestions] = useState([]);
  const token = getWithExpiry("jwtToken");
  const { examId, userId } = useParams();
  const decodedExamId = examId ? atob(examId) : null;
  const decodedUserId = userId ? atob(userId) : null;
  const adminId = getWithExpiry("userId");
  const [obtainedMarks, setObtainedMarks] = useState(0);
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch student details
        const resultDetailsResponse = await axios.get(`${API_URL}/result/${decodedExamId}/${decodedUserId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setResultDetails(resultDetailsResponse.data);

        // Fetch questions
        const questionsResponse = await axios.get(`${API_URL}/exam_questions/questions/${decodedExamId}/false`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const fetchedQuestions = questionsResponse.data;

        // Fetch user answers
        const userAnswersResponse = await axios.get(`${API_URL}/questions_attempt/${decodedExamId}/${decodedUserId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const userAnswers = userAnswersResponse.data;

        // Merge user answers into questions
        const mergedQuestions = fetchedQuestions.map((question) => {
          const userAnswerEntry = userAnswers.find(
            ([, questionId]) => questionId == question.id
          );
          return {
            ...question,
            user_answer: userAnswerEntry ? userAnswerEntry[0] : "Not answered",
          };
        });

        setQuestions(mergedQuestions);
      } catch (error) {
        toast.error("Error fetching data!");
        console.error(error);
      }
    };

    fetchData();
  }, [decodedExamId, decodedUserId, token]);
  const handleInputChange = (e) => {
    const { value } = e.target;
    if (!isNaN(value)) {
      setObtainedMarks(value);
    }
  };
  const markResult = async (e) => {
    e.preventDefault();
    const markResultCallback = async () => {
      try {
        const response = await axios.put(`${API_URL}/result/${resultDetails.id}/${adminId}/${obtainedMarks}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        setResultDetails(response.data);
        toast.success("Exam checked successfully!");
      } catch (error) {
        toast.error("Error updating result. Please try again.");
      }
    };
    showToastConfirmation("mark", "exam as checked", markResultCallback);
  };
  return (
    <Container>
      <ToastContainer />
      {/* Student Details */}
      <Card className="mb-4" style={{ backgroundColor: "darkslategrey", color: "white", marginTop: "10px" }}>
        <CardBody>
          <CardTitle tag="h4">
            Result: {resultDetails.total >= resultDetails.exam?.passingMarks ? <strong style={{ color: "lightgreen" }}> Pass</strong> : <strong style={{ color: "orange" }}>Fail</strong>}
          </CardTitle>
          <Row>
            <hr style={{ borderColor: "lightgray" }} />
            <Col xs="4">
              <strong>Date of Result Generation:</strong>{" "}
              {new Date(resultDetails.generatedAt).toLocaleString("en-GB")}
            </Col>
            <Col xs="4">
              {resultDetails.exam?.programming && resultDetails.checkedBy?.name == null ? (
                <Form onSubmit={markResult} className="d-flex align-items-center">
                  <strong style={{ marginRight: "10px" }}>Obtained Marks:</strong>
                  <Input
                    type="number"
                    className="form-control mr-2"
                    name="total"
                    onChange={handleInputChange}
                    style={{ width: "70px" }}
                  />
                  <Button type="submit" className="btn btn-primary">Submit</Button>
                </Form>
              ) : (
                <><strong>Obtained Marks:</strong> {resultDetails.total}</>
              )}
            </Col>

            <Col xs="4">
              <strong>Checked By:</strong>
              {(resultDetails.exam?.programming && resultDetails.checkedBy?.name == null) ? <strong style={{ color: "orange" }}>Pending</strong> : resultDetails.exam?.programming ? resultDetails.checkedBy?.name : "System"}
            </Col>
            <hr style={{ borderColor: "lightgray" }} />
            <Col xs="4">
              <strong>Exam:</strong> {resultDetails.exam?.title}
            </Col>
            <Col xs="4">
              <strong>Number of Questions:</strong> {resultDetails.exam?.numberOfQuestions}
            </Col>
            <Col xs="4">
              <strong>Passing Criteria:</strong> {resultDetails.exam?.passingMarks}
            </Col>
            <hr style={{ borderColor: "lightgray" }} />
            <Col xs="4">
              <strong>Name:</strong> {resultDetails.user?.name}
            </Col>
            <Col xs="4">
              <strong>Email:</strong> {resultDetails.user?.email}
            </Col>
            <Col xs="4">
              <strong>Phone:</strong> {resultDetails.user?.phone}
            </Col>
            <Col xs="4">
              <strong>Address:</strong> {resultDetails.user?.address}
            </Col>
            <Col xs="4">
              <strong>College:</strong> {resultDetails.user?.college?.name}, {resultDetails.user?.college?.address}
            </Col>
          </Row>
        </CardBody>
      </Card>


      {/* Questions and Answers */}
      {questions.map((question, index) => (
        <Card key={question.id} >
          <CardBody>
            <CardTitle tag="h5">Q{index + 1}. {question.question}</CardTitle>
            {question.image ? (
              <img
                src={`${API_URL}/${question.image}`}
                alt="image"
                style={{ width: '100px', height: '100px' }}
              />
            ) : null}
            <Row>
              {["A", "B", "C", "D"].map((option) =>
                question[`option${option}`] && (
                  <Col xs="6" key={option}>
                    <p>
                      {option}.&nbsp;
                      {question[`${option.toLowerCase()}image`] ? (
                        <img
                          src={`${API_URL}/${question[`option${option}`]}`}
                          alt={`Option ${option}`}
                          style={{ width: '100px', height: '100px' }}
                        />
                      ) : (
                        question[`option${option}`]
                      )}
                    </p>
                  </Col>
                )
              )}

            </Row>
            <Row>
              <Col xs="4" ><strong>Correct Answer:</strong>
                <div
                  style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                  dangerouslySetInnerHTML={{ __html: question.correctAnswer || "Not answered" }}
                /></Col>
              <Col xs="4" ><strong>Category:</strong> {question.category?.name}</Col>
              <Col xs="4" ><strong>Difficulty:</strong> {question.difficulty?.name}</Col>
            </Row>
            <Col xs="12">
              <strong>User's Answer:</strong>
              <div
                style={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                }}
                dangerouslySetInnerHTML={{ __html: question.user_answer || "Not answered" }}
              />
            </Col>
          </CardBody>
        </Card>
      ))}
    </Container>
  );
};

export default ExamResult;
