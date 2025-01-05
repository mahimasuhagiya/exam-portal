import React from "react";
import { Card, CardBody, CardTitle, Button } from "reactstrap";
import { useLocation, useNavigate } from "react-router-dom";

const ExamSubmit = () => {
  const navigate = useNavigate();
const doneSuspiciousActivity = localStorage.getItem("doneSuspiciousActivity") === "true";

  const handleBackToHome = () => {
    navigate('/student'); // Navigate to the home page
  };
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
            {doneSuspiciousActivity === true ?<> <i className="fas fa-exclamation-triangle" style={{ fontSize: "100px", color: "#ecaa44" }}></i><p>You have tried some suspicious activity, due to that the exam is submitted.</p></>
              :<> <i className="fas fa-check-circle " style={{ fontSize: "100px", color: "#67AF6F" }}></i><p> Exam Submitted Successfully! 🎉</p></>}
            
          </CardTitle>
          <Button color="primary" onClick={handleBackToHome} style={{ width: "100%" }}>
            Back to Home
          </Button>
        </CardBody>
      </Card>
    </div>
  );
};
export default ExamSubmit;