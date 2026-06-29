import React, { useMemo, useState } from 'react';

const initialItems = [
  { id: 1, owner: 'Ops', priority: 'High', status: 'Ready', task: 'Review exception queue' },
  { id: 2, owner: 'AI', priority: 'Medium', status: 'In progress', task: 'Draft recommended next actions' },
  { id: 3, owner: 'Compliance', priority: 'Low', status: 'Queued', task: 'Attach audit evidence' },
];

export default function CodexOperationsFeature() {
  const [query, setQuery] = useState('');
  const [items, setItems] = useState(initialItems);
  const [task, setTask] = useState('');

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return items;
    return items.filter((item) => Object.values(item).join(' ').toLowerCase().includes(normalized));
  }, [items, query]);

  function addTask(event) {
    event.preventDefault();
    if (!task.trim()) return;
    setItems((current) => [
      { id: Date.now(), owner: 'User', priority: 'Medium', status: 'Queued', task: task.trim() },
      ...current,
    ]);
    setTask('');
  }

  return (
    <section className="text-slate-100">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Non-visual workflow</p>
      <h1 className="mb-5 mt-1 text-2xl font-semibold text-white">AI eDiscovery System Operations Desk</h1>

      <form onSubmit={addTask} className="mb-4 grid grid-cols-[minmax(220px,1fr)_auto] gap-2">
        <input value={task} onChange={(event) => setTask(event.target.value)} placeholder="Add an operational follow-up" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none" />
        <button type="submit" className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600">Add task</button>
      </form>

      <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search owner, priority, status, or task" className="mb-4 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-blue-500 focus:outline-none" />

      <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800/50">
        {filtered.map((item) => (
          <div key={item.id} className="grid grid-cols-[1fr_120px_120px_120px] items-center gap-3 border-b border-slate-700 px-4 py-3 text-sm last:border-b-0">
            <strong className="text-white">{item.task}</strong>
            <span className="text-slate-300">{item.owner}</span>
            <span className="text-slate-300">{item.priority}</span>
            <span className="text-slate-300">{item.status}</span>
          </div>
        ))}
        {filtered.length === 0 && <div className="p-5 text-sm text-slate-500">No matching workflow items.</div>}
      </div>
    </section>
  );
}
