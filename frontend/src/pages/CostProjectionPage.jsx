import React from 'react';
import SimpleAIPage from './SimpleAIPage';

export default function CostProjectionPage() {
  return (
    <SimpleAIPage
      title="Review Cost Projection"
      description="Project review cost from document counts and review pace. Pass case_id to auto-count documents."
      endpoint="/ai/cost-projection"
      fields={[
        { name: 'case_id', label: 'Case ID', type: 'number' },
        { name: 'hourly_rate', label: 'Hourly Rate (USD)', type: 'number', placeholder: '250' },
        { name: 'expected_review_pace_per_hour', label: 'Review Pace (docs/hr)', type: 'number', placeholder: '50' },
        { name: 'doc_count_override', label: 'Doc Count Override', type: 'number' },
      ]}
    />
  );
}
