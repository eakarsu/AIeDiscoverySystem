import React from 'react';
import SimpleAIPage from './SimpleAIPage';

export default function BatchTagSuggestPage() {
  return (
    <SimpleAIPage
      title="Batch Tag Suggest"
      description="AI proposes review tags for a batch of documents. Pass document IDs as a JSON array."
      endpoint="/ai/batch-tag-suggest"
      fields={[
        { name: 'case_id', label: 'Case ID', type: 'number' },
        {
          name: 'document_ids',
          label: 'Document IDs (JSON array)',
          type: 'json',
          required: true,
          rows: 4,
          placeholder: '[1, 2, 3, 4]',
        },
      ]}
    />
  );
}
