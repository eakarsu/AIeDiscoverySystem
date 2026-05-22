import React, { useEffect, useState } from 'react';

export default function PrivilegeClawbackRisk() {
  const [data, setData] = useState(null);
  useEffect(() => { fetch('/api/privilege-clawback-risk').then(r => r.json()).then(setData).catch(() => setData(null)); }, []);
  return <div><h1>Privilege Clawback Risk</h1><p>Prioritize documents likely to require clawback or second-level privilege review.</p><div className="stats-grid">{data && Object.entries(data.summary).map(([k,v]) => <div className="stat-card" key={k}><span>{k.replaceAll('_',' ')}</span><strong>{v}</strong></div>)}</div><div className="card">{(data?.documents || []).map(d => <div key={d.doc} style={{padding:12,borderBottom:'1px solid #e5e7eb'}}><strong>{d.doc}</strong><div>{d.reason} - {d.risk} - {d.action}</div></div>)}</div></div>;
}
