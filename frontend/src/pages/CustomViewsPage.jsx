import React from 'react';
import ReviewProgressChart from '../components/ReviewProgressChart';
import CustodianVolumeHeatmap from '../components/CustodianVolumeHeatmap';
import ProductionLogPdfExport from '../components/ProductionLogPdfExport';
import ReviewRulesEditor from '../components/ReviewRulesEditor';
import { Layers } from 'lucide-react';

export default function CustomViewsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500">
          <Layers className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">eDiscovery Views</h1>
          <p className="text-sm text-slate-400">
            Review progress, custodian volume, production log PDF export, and review rules editor.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ReviewProgressChart />
        <CustodianVolumeHeatmap />
      </div>

      <ProductionLogPdfExport />
      <ReviewRulesEditor />
    </div>
  );
}
