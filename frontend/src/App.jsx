import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FeatureListPage from './pages/FeatureListPage';
import FeatureDetailPage from './pages/FeatureDetailPage';
import RelevanceScorePage from './pages/RelevanceScorePage';
import RedactionSuggestPage from './pages/RedactionSuggestPage';
import EmailThreadClusterPage from './pages/EmailThreadClusterPage';
import WitnessProfilePage from './pages/WitnessProfilePage';
import CostProjectionPage from './pages/CostProjectionPage';
import PredictiveCodingFeedbackPage from './pages/PredictiveCodingFeedbackPage';
import AgenticSearchChainPage from './pages/AgenticSearchChainPage';
import BatchTagSuggestPage from './pages/BatchTagSuggestPage';
import PrivilegeRateReportPage from './pages/PrivilegeRateReportPage';
import { features } from './config/features';

import Batch03Features from './pages/Batch03Features';

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
          <Route path="/batch03" element={<Batch03Features />} />
      <Route path="/" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/ai-relevance-score"
        element={
          <ProtectedRoute>
            <RelevanceScorePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-redaction-suggest"
        element={
          <ProtectedRoute>
            <RedactionSuggestPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-email-thread-cluster"
        element={
          <ProtectedRoute>
            <EmailThreadClusterPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-witness-profile"
        element={
          <ProtectedRoute>
            <WitnessProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-cost-projection"
        element={
          <ProtectedRoute>
            <CostProjectionPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-predictive-coding-feedback"
        element={
          <ProtectedRoute>
            <PredictiveCodingFeedbackPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-agentic-search-chain"
        element={
          <ProtectedRoute>
            <AgenticSearchChainPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-batch-tag-suggest"
        element={
          <ProtectedRoute>
            <BatchTagSuggestPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-privilege-rate-report"
        element={
          <ProtectedRoute>
            <PrivilegeRateReportPage />
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
