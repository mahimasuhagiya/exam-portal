import React from "react";
import { Card, CardBody, CardTitle, CardText } from "reactstrap";

const ExamSubmit = ({ studentName, examName, totalMarks, submissionTime }) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f8f9fa",
      }}
    >
      <Card
        style={{
          width: "90%",
          maxWidth: "400px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          borderRadius: "10px",
          padding: "20px",
        }}
      >
        <CardBody>
          <CardTitle
            tag="h5"
            style={{
              color: "darkslategrey",
              marginBottom: "15px",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            Exam Submitted Successfully! 🎉
          </CardTitle>
          <CardText
            style={{
              color: "#555555",
              marginBottom: "20px",
              textAlign: "center",
              fontSize: "18px",
            }}
          >
            Congratulations, <strong>{studentName}</strong>!
          </CardText>
          <CardText
            style={{
              color: "#777777",
              fontSize: "16px",
              marginBottom: "10px",
            }}
          >
            <strong>Exam Name:</strong> {examName}
          </CardText>
          <CardText
            style={{
              color: "#777777",
              fontSize: "16px",
              marginBottom: "10px",
            }}
          >
            <strong>Total Marks:</strong> {totalMarks}
          </CardText>
          <CardText
            style={{
              color: "#777777",
              fontSize: "16px",
              marginBottom: "10px",
            }}
          >
            <strong>Submission Time:</strong> {submissionTime}
          </CardText>
        </CardBody>
      </Card>
    </div>
  );
};

export default ExamSubmit;
