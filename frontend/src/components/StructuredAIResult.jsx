import React from 'react';
import { Brain, CheckCircle, ListChecks, Table2 } from 'lucide-react';

function titleize(value) {
  return String(value || '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function parsePossibleJson(value) {
  if (value == null) return value;
  if (typeof value !== 'string') return value;

  const trimmed = value.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  const candidate = fenced ? fenced[1].trim() : trimmed;

  if (!candidate.startsWith('{') && !candidate.startsWith('[')) return value;

  try {
    return JSON.parse(candidate);
  } catch {
    return value;
  }
}

function normalizeResult(value) {
  const parsed = parsePossibleJson(value);
  if (typeof parsed === 'string') return parsed;
  if (parsed?.analysis) return normalizeResult(parsed.analysis);
  if (parsed?.result) return normalizeResult(parsed.result);
  if (parsed?.output && Object.keys(parsed).length <= 5) return normalizeResult(parsed.output);
  if (parsed?.choices?.[0]?.message?.content) return normalizeResult(parsed.choices[0].message.content);
  return deepNormalize(parsed);
}

function deepNormalize(value) {
  const parsed = parsePossibleJson(value);

  if (Array.isArray(parsed)) {
    return parsed.map((item) => deepNormalize(item));
  }

  if (parsed && typeof parsed === 'object') {
    const keys = Object.keys(parsed);
    if (keys.length === 1 && Object.prototype.hasOwnProperty.call(parsed, 'raw')) {
      return deepNormalize(parsed.raw);
    }

    if (Object.prototype.hasOwnProperty.call(parsed, 'raw')) {
      const normalizedRaw = deepNormalize(parsed.raw);
      if (normalizedRaw && typeof normalizedRaw === 'object' && !Array.isArray(normalizedRaw)) {
        const rest = Object.fromEntries(
          Object.entries(parsed)
            .filter(([key]) => key !== 'raw')
            .map(([key, nestedValue]) => [key, deepNormalize(nestedValue)])
        );
        return { ...rest, ...normalizedRaw };
      }
    }

    return Object.fromEntries(
      Object.entries(parsed).map(([key, nestedValue]) => [key, deepNormalize(nestedValue)])
    );
  }

  return parsed;
}

function formatValue(value) {
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'number') return Number.isInteger(value) ? value.toLocaleString() : value.toLocaleString(undefined, { maximumFractionDigits: 4 });
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) return new Date(value).toLocaleString();
  return String(value);
}

function isPrimitive(value) {
  return value === null || ['string', 'number', 'boolean', 'undefined'].includes(typeof value);
}

function confidencePercent(value) {
  if (typeof value !== 'number') return null;
  if (value <= 1) return `${Math.round(value * 100)}%`;
  if (value <= 100) return `${Math.round(value)}%`;
  return null;
}

function PrimitiveCard({ name, value }) {
  const confidence = /confidence|accuracy|precision|recall|score|rate/i.test(name)
    ? confidencePercent(value)
    : null;

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/60 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{titleize(name)}</p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-100">
        {confidence || formatValue(value)}
      </p>
    </div>
  );
}

function TextBlock({ value }) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
      <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-200">{value}</p>
    </div>
  );
}

function ArrayTable({ name, rows }) {
  const columns = Array.from(
    rows.reduce((set, row) => {
      Object.keys(row || {}).forEach((key) => {
        const normalizedValue = deepNormalize(row[key]);
        if (isPrimitive(normalizedValue) || Array.isArray(normalizedValue)) set.add(key);
      });
      return set;
    }, new Set())
  ).slice(0, 6);

  if (columns.length === 0) {
    return <NestedSection name={name} value={rows} />;
  }

  return (
    <section className="rounded-xl border border-slate-700 bg-slate-800/60 overflow-hidden">
      <div className="flex items-center gap-2 border-b border-slate-700 px-4 py-3">
        <Table2 className="h-4 w-4 text-blue-300" />
        <h4 className="text-sm font-semibold text-white">{titleize(name)}</h4>
        <span className="rounded-full bg-slate-900 px-2 py-0.5 text-xs text-slate-400">{rows.length}</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-950/50">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {titleize(column)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/60">
            {rows.map((row, index) => (
              <tr key={index} className="align-top">
                {columns.map((column) => (
                  <td key={column} className="max-w-sm px-4 py-3 text-sm text-slate-200">
                    {Array.isArray(deepNormalize(row[column])) ? (
                      <div className="flex flex-wrap gap-1">
                        {deepNormalize(row[column]).slice(0, 6).map((item, itemIndex) => (
                          <span key={itemIndex} className="rounded-full border border-blue-500/30 bg-blue-500/10 px-2 py-0.5 text-xs text-blue-200">
                            {formatValue(item)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="break-words">{formatValue(row[column])}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ArrayList({ name, values }) {
  return (
    <section className="rounded-xl border border-slate-700 bg-slate-800/60 p-4">
      <div className="mb-3 flex items-center gap-2">
        <ListChecks className="h-4 w-4 text-blue-300" />
        <h4 className="text-sm font-semibold text-white">{titleize(name)}</h4>
        <span className="rounded-full bg-slate-900 px-2 py-0.5 text-xs text-slate-400">{values.length}</span>
      </div>
      <ul className="space-y-2">
        {values.map((item, index) => (
          <li key={index} className="flex items-start gap-2 text-sm text-slate-200">
            <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-400" />
            <span className="break-words">{formatValue(item)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function NestedSection({ name, value }) {
  const normalized = deepNormalize(value);

  if (isPrimitive(normalized)) {
    return (
      <section>
        <h4 className="mb-2 text-sm font-semibold text-white">{titleize(name)}</h4>
        <TextBlock value={formatValue(normalized)} />
      </section>
    );
  }

  if (Array.isArray(normalized)) {
    if (normalized.every(isPrimitive)) return <ArrayList name={name} values={normalized} />;
    if (normalized.every((item) => item && typeof item === 'object' && !Array.isArray(item))) {
      return <ArrayTable name={name} rows={normalized} />;
    }
    return (
      <section className="space-y-3">
        <h4 className="text-sm font-semibold text-white">{titleize(name)}</h4>
        {normalized.map((item, index) => (
          <NestedSection key={index} name={`${name} ${index + 1}`} value={item} />
        ))}
      </section>
    );
  }

  return <ObjectReport title={name} data={normalized} nested />;
}

function ObjectReport({ title, data, nested = false }) {
  const entries = Object.entries(data || {});
  const primitives = entries.filter(([, value]) => isPrimitive(value));
  const complex = entries.filter(([, value]) => !isPrimitive(value));
  const summaryEntry = entries.find(([key, value]) => /summary|executive_summary|overview|narrative/i.test(key) && typeof value === 'string');

  return (
    <section className={nested ? 'space-y-4' : 'space-y-5'}>
      {title && nested && (
        <h4 className="text-sm font-semibold text-white">{titleize(title)}</h4>
      )}

      {summaryEntry && <TextBlock value={summaryEntry[1]} />}

      {primitives.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {primitives
            .filter(([key]) => key !== summaryEntry?.[0])
            .map(([key, value]) => (
              <PrimitiveCard key={key} name={key} value={value} />
            ))}
        </div>
      )}

      {complex.map(([key, value]) => (
        <NestedSection key={key} name={key} value={value} />
      ))}
    </section>
  );
}

export default function StructuredAIResult({ result, title = 'AI Analysis Report' }) {
  const normalized = normalizeResult(result);

  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-slate-700 bg-slate-800/70 shadow-xl">
      <div className="flex items-center gap-3 border-b border-slate-700 bg-slate-950/40 px-5 py-4">
        <div className="rounded-lg bg-purple-500/15 p-2">
          <Brain className="h-5 w-5 text-purple-300" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <p className="text-xs text-slate-400">Structured operational output</p>
        </div>
      </div>
      <div className="space-y-5 p-5">
        {typeof normalized === 'string' ? (
          <TextBlock value={normalized} />
        ) : Array.isArray(normalized) ? (
          <NestedSection name="Results" value={normalized} />
        ) : (
          <ObjectReport data={normalized} />
        )}
      </div>
    </div>
  );
}
