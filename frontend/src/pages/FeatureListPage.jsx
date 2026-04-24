import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw } from 'lucide-react';
import DataTable from '../components/DataTable';
import FormModal from '../components/FormModal';
import Toast from '../components/Toast';
import { api } from '../api';

export default function FeatureListPage({ feature }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.get(feature.apiEndpoint);
      setData(Array.isArray(result) ? result : []);
    } catch (err) {
      setToast({ message: `Failed to load ${feature.title}: ${err.message}`, type: 'error' });
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [feature.apiEndpoint, feature.title]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreate = async (formData) => {
    try {
      await api.post(feature.apiEndpoint, formData);
      setToast({ message: `${feature.title} item created successfully.`, type: 'success' });
      setShowModal(false);
      fetchData();
    } catch (err) {
      setToast({ message: `Failed to create: ${err.message}`, type: 'error' });
    }
  };

  const handleRowClick = (row) => {
    navigate(`/${feature.key}/${row.id}`);
  };

  return (
    <div className="animate-fade-in">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-white">{feature.title}</h1>
          <p className="text-sm text-slate-400 mt-0.5">{feature.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchData}
            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Item
          </button>
        </div>
      </div>

      <DataTable
        columns={feature.columns}
        data={data}
        onRowClick={handleRowClick}
        loading={loading}
      />

      {showModal && (
        <FormModal
          title={`Create ${feature.title}`}
          fields={feature.formFields}
          onSave={handleCreate}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
