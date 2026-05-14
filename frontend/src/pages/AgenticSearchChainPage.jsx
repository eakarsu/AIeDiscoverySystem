import React from 'react';
import SimpleAIPage from './SimpleAIPage';

export default function AgenticSearchChainPage() {
  return (
    <SimpleAIPage
      title="Agentic Search Chain"
      description="AI plans a sequence of progressively narrower search queries for an investigation objective. Plans are returned for review; nothing executes automatically."
      endpoint="/ai/agentic-search-chain"
      fields={[
        { name: 'case_id', label: 'Case ID', type: 'number' },
        { name: 'objective', label: 'Objective', required: true, placeholder: 'e.g. find evidence of insider knowledge before 2023-Q1 earnings' },
      ]}
    />
  );
}
