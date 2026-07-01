import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import AddPatient from './pages/AddPatient';
import AddVitalsPrediction from './pages/AddVitalsPrediction';
import Dashboard from './pages/Dashboard';
import PatientList from './pages/PatientList';
import VitalsHistoryList from './pages/VitalsHistoryList';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientDashboard from './pages/PatientDashboard';
import AppointmentList from './pages/AppointmentList';

// Protect routes
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('access_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const IndexRoute = () => {
  const role = localStorage.getItem('role') || 'Admin';
  if (role === 'Patient') {
    return <PatientDashboard />;
  }
  return <Dashboard />;
};

// ==========================================
// Main App Router Configuration
// ==========================================
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* All routes inside MainLayout get the Sidebar and Header automatically */}
        <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
          <Route index element={<IndexRoute />} />
          <Route path="patients" element={<PatientList />} />
          <Route path="patients/add" element={<AddPatient />} />
          <Route path="appointments" element={<AppointmentList />} />
          <Route path="vitals/add" element={<AddVitalsPrediction />} />
          <Route path="vitals/history" element={<VitalsHistoryList />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
