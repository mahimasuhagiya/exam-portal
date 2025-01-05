import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import { Col, Container, Row } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import CollegePage from './components/CollegePage';
import QuestionCategories from './components/QuestionCategories';
import Difficulty from './components/Difficulty';
import Student from './components/Student';
import Questions from './components/Questions';
import Exams from './components/Exams';
import StudentDashboard from './components/StudentDashboard';
import ExamPage from './components/ExamPage';
import ExamSubmit from './components/ExamSubmit';
import ExamResult from './components/ExamResult';
import Result from './components/Result';
import { getWithExpiry } from './services/authService';

function App() {
  const isLoggedIn = getWithExpiry("userId") !== "null" && getWithExpiry("userId") !== null;
  const isAdmin = ["EXAMINER", "ADMIN"].includes(getWithExpiry("role"));

  return (
    <Router>
      <Row>
        <Header /></Row>
      <Container fluid>
        {isLoggedIn ? (
          <Row>
            {isAdmin ?
              <Routes>
                <Route path="/" element={isLoggedIn ?<Dashboard />:<Home /> } />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/colleges" element={<CollegePage />} />
                <Route path="/difficulty" element={<Difficulty />} />
                <Route path="/viewusers" element={<Student />} />
                <Route path="/manageexams" element={<Exams />} />
                <Route path="/questions" element={<Questions />} />
                <Route path="/result" element={<Result />} />
                <Route path="/examresult/:userId/:examId" element={<ExamResult />} />
                <Route path="/question-categories" element={<QuestionCategories />} />
              </Routes>
              :
              <Routes>
                <Route path="/" element={isLoggedIn?<StudentDashboard />:<Home />} />
                <Route path="/student" element={<StudentDashboard />} />
                <Route path="/exam" element={<ExamPage />} />
                <Route path="/examsubmit" element={<ExamSubmit />} />
              </Routes>
            }
          </Row>
        ) : (
          <div>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
          </div>
        )}
      </Container>
    </Router>
  );
}

export default App;
