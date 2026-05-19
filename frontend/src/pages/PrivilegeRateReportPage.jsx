import React from 'react';
import SimpleAIPage from './SimpleAIPage';

export default function PrivilegeRateReportPage() {
  return (
    <SimpleAIPage
      title="Privilege Rate Report"
      description="Computes deterministic privilege rate / processed counts from the documents table; AI executive summary is added when an OpenRouter key is configured."
      endpoint="/ai/privilege-rate-report"
      fields={[
        { name: 'case_id', label: 'Case ID', type: 'number', required: true },
      ]}
    />
  );
}
