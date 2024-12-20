import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Home from './components/Home';
import Dashboard from './components/Dashboard';
import { Col, Container, Row } from 'reactstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import ViewUsers from './components/ViewUsers';
import CollegePage from './components/CollegePage';
import QuestionCategories from './components/QuestionCategories';
import Difficulty from './components/Difficulty';
import Student from './components/Student';
import Questions from './components/Questions';
import Exams from './components/Exams';

function App() {
 // localStorage.setItem("userId",1);
  const isLoggedIn = (localStorage.getItem("userId") !== "null" && localStorage.getItem("userId") !== null)? true:false;

  return (
    <Router>
      <Row>
      <Header /></Row>
      <Container fluid>
        {isLoggedIn ? (
          <Row>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/colleges" element={<CollegePage />} />
                <Route path="/difficulty" element={<Difficulty />} />
                <Route path="/viewusers" element={<Student />} />
                <Route path="/manageexams" element={<Exams />} />
                <Route path="/questions" element={<Questions />} />
                <Route path="/question-categories" element={<QuestionCategories />} />
              </Routes>
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
