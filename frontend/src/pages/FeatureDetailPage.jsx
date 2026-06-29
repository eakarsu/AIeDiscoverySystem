import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DetailView from '../components/DetailView';
import FormModal from '../components/FormModal';
import Toast from '../components/Toast';
import { api } from '../api';

export default function FeatureDetailPage({ feature }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.get(`${feature.apiEndpoint}/${id}`);
      setData(result);
    } catch (err) {
      setToast({ message: `Failed to load record: ${err.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [feature.apiEndpoint, id]);

  useEffect(() => {
    fetchData();
    setAnalysisResult(null);
  }, [fetchData]);

  const handleEdit = async (formData) => {
    if (Object.keys(formData).length === 0) {
      setToast({ message: 'No changes to save.', type: 'info' });
      setShowEditModal(false);
      return;
    }
    try {
      await api.put(`${feature.apiEndpoint}/${id}`, formData);
      setToast({ message: 'Record updated successfully.', type: 'success' });
      setShowEditModal(false);
      fetchData();
    } catch (err) {
      setToast({ message: `Failed to update: ${err.message}`, type: 'error' });
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
      return;
    }
    try {
      await api.delete(`${feature.apiEndpoint}/${id}`);
      setToast({ message: 'Record deleted.', type: 'success' });
      setTimeout(() => navigate(`/${feature.key}`), 500);
    } catch (err) {
      setToast({ message: `Failed to delete: ${err.message}`, type: 'error' });
    }
  };

  const handleRunAnalysis = async () => {
    setAnalysisLoading(true);
    setAnalysisResult(null);
    try {
      const result = await api.post(`${feature.apiEndpoint}/${id}/analyze`, {});
      setAnalysisResult(result.analysis || result.result || result);
    } catch (err) {
      setToast({ message: `AI analysis failed: ${err.message}`, type: 'error' });
    } finally {
      setAnalysisLoading(false);
    }
  };

  return (
    <>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <DetailView
        title={feature.title}
        data={data}
        fields={feature.formFields}
        onBack={() => navigate(`/${feature.key}`)}
        onEdit={() => setShowEditModal(true)}
        onDelete={handleDelete}
        onRunAnalysis={handleRunAnalysis}
        analysisResult={analysisResult}
        analysisLoading={analysisLoading}
        loading={loading}
      />

      {showEditModal && data && (
        <FormModal
          title={`Edit ${feature.title}`}
          fields={feature.formFields}
          initialData={data}
          onSave={handleEdit}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  );
}
