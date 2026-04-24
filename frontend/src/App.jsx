import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FeatureListPage from './pages/FeatureListPage';
import FeatureDetailPage from './pages/FeatureDetailPage';
import { features } from './config/features';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return <Layout>{children}</Layout>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {features.map((feature) => (
        <React.Fragment key={feature.key}>
          <Route
            path={`/${feature.key}`}
            element={
              <ProtectedRoute>
                <FeatureListPage feature={feature} />
              </ProtectedRoute>
            }
          />
          <Route
            path={`/${feature.key}/:id`}
            element={
              <ProtectedRoute>
                <FeatureDetailPage feature={feature} />
              </ProtectedRoute>
            }
          />
        </React.Fragment>
      ))}

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
