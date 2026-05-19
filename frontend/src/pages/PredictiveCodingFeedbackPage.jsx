import React from 'react';
import SimpleAIPage from './SimpleAIPage';

export default function PredictiveCodingFeedbackPage() {
  return (
    <SimpleAIPage
      title="Predictive Coding Feedback"
      description="Paste reviewer-coded samples (id/tag/rationale/preview); AI updates the coding rubric and surfaces ambiguous cases."
      endpoint="/ai/predictive-coding-feedback"
      fields={[
        { name: 'case_id', label: 'Case ID', type: 'number' },
        {
          name: 'samples',
          label: 'Samples (JSON array)',
          type: 'json',
          required: true,
          rows: 12,
          placeholder: '[ { "id": 1, "tag": "responsive", "rationale": "...", "preview": "..." }, ... ]',
        },
      ]}
    />
  );
}
