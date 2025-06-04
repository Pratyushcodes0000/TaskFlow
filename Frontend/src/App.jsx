import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './Auth/AuthContext';
import ProtectedRoute from './Auth/ProtectedRoute';
import LandingPage from './LandingPage/LandingPage';
import Login from './Auth/Login';
import ProjectsManagement from './Projects/ProjectsManagement';
import NewProject from './Projects/NewProject';
import GroupDashboard from './Dashboard/GroupDashboard'
import Header from './LandingPage/Header';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/ProjectsManagement" 
            element={
              <ProtectedRoute>
                <ProjectsManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/NewProject" 
            element={
              <ProtectedRoute>
                <NewProject />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/projectsManagement/GroupDashboard" 
            element={
              <ProtectedRoute>
                <GroupDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;