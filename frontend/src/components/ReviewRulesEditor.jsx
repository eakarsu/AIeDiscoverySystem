import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { Plus, Trash2, Save, Pencil, X, Tag, Lock } from 'lucide-react';

const emptyForm = { type: 'tag', name: '', description: '', color: '#3b82f6' };

export default function ReviewRulesEditor() {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/custom-views/review-rules');
      setRules(res.rules || []);
    } catch (e) {
      setError(e.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId) {
        await api.put(`/custom-views/review-rules/${editingId}`, form);
      } else {
        await api.post('/custom-views/review-rules', form);
      }
      setForm(emptyForm);
      setEditingId(null);
      await load();
    } catch (e) {
      setError(e.message || 'Save failed');
    }
  };

  const remove = async (id) => {
    setError('');
    try {
      await api.delete(`/custom-views/review-rules/${id}`);
      await load();
    } catch (e) {
      setError(e.message || 'Delete failed');
    }
  };

  const startEdit = (r) => {
    setEditingId(r.id);
    setForm({ type: r.type, name: r.name, description: r.description || '', color: r.color || '#3b82f6' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const tagRules = rules.filter((r) => r.type === 'tag');
  const privRules = rules.filter((r) => r.type === 'privilege');

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Pencil className="w-5 h-5 text-amber-400" />
        <h3 className="text-lg font-semibold text-white">Review Rules Editor</h3>
        <span className="text-xs text-slate-500">Tag taxonomy + Privilege rules</span>
      </div>

      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

      <form onSubmit={submit} className="grid grid-cols-12 gap-2 mb-5 bg-slate-900/40 p-3 rounded-lg border border-slate-700/50">
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="col-span-2 bg-slate-900 border border-slate-600 rounded px-2 py-2 text-sm text-white"
        >
          <option value="tag">Tag</option>
          <option value="privilege">Privilege</option>
        </select>
        <input
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Rule name"
          className="col-span-3 bg-slate-900 border border-slate-600 rounded px-2 py-2 text-sm text-white"
        />
        <input
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Description"
          className="col-span-5 bg-slate-900 border border-slate-600 rounded px-2 py-2 text-sm text-white"
        />
        <input
          type="color"
          value={form.color}
          onChange={(e) => setForm({ ...form, color: e.target.value })}
          className="col-span-1 h-9 w-full bg-slate-900 border border-slate-600 rounded cursor-pointer"
        />
        <div className="col-span-1 flex gap-1">
          <button
            type="submit"
            className="flex-1 flex items-center justify-center bg-blue-500 hover:bg-blue-600 text-white rounded"
            title={editingId ? 'Save' : 'Add'}
          >
            {editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="flex items-center justify-center bg-slate-700 hover:bg-slate-600 text-white rounded px-2"
              title="Cancel"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <p className="text-slate-400 text-sm">Loading…</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          <RulesGroup title="Tag Taxonomy" icon={Tag} rules={tagRules} onEdit={startEdit} onDelete={remove} />
          <RulesGroup title="Privilege Rules" icon={Lock} rules={privRules} onEdit={startEdit} onDelete={remove} />
        </div>
      )}
    </div>
  );
}

function RulesGroup({ title, icon: Icon, rules, onEdit, onDelete }) {
  return (
    <div className="bg-slate-900/40 rounded-lg p-3 border border-slate-700/40">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-slate-400" />
        <h4 className="text-sm font-semibold text-slate-200">{title}</h4>
        <span className="text-xs text-slate-500">({rules.length})</span>
      </div>
      {rules.length === 0 ? (
        <p className="text-xs text-slate-500 italic">No rules.</p>
      ) : (
        <ul className="space-y-1.5">
          {rules.map((r) => (
            <li key={r.id} className="flex items-center gap-2 bg-slate-900/60 rounded px-2 py-1.5">
              <span
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: r.color || '#3b82f6' }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{r.name}</p>
                {r.description && <p className="text-[11px] text-slate-500 truncate">{r.description}</p>}
              </div>
              <button
                onClick={() => onEdit(r)}
                className="text-slate-500 hover:text-blue-400"
                title="Edit"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onDelete(r.id)}
                className="text-slate-500 hover:text-red-400"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
