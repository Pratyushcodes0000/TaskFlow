import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage/LandingPage';
import Login from './Auth/Login';
import ProjectsManagement from './Projects/ProjectsManagement';
import NewProject from './Projects/NewProject';
import Dashboard from './Dashboard/IndivisualDashBoard'
import Header from './LandingPage/Header';
import './App.css';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/ProjectsManagement" element={<ProjectsManagement />} />
        <Route path="/NewProject" element={<NewProject />} />
        <Route path="/Dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;