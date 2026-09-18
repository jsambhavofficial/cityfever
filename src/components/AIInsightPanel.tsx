import React from 'react';
import { Lightbulb } from 'lucide-react';

interface AIInsightPanelProps {
  selectedClusterId: string | null;
  currentHour: number;
  onQuickDispatch: (action: string) => void;
}

export const AIInsightPanel: React.FC<AIInsightPanelProps> = ({
  onQuickDispatch,
}) => {
  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-white">
          Operational insight
        </span>
        <button
          onClick={() => onQuickDispatch('Operational insights detail requested')}
          className="text-xs text-[#1597D4] hover:underline cursor-pointer"
        >
          View details
        </button>
      </div>

      {/* Insight Card with Lightbulb */}
      <div className="p-3 rounded-lg bg-[#111A24] border border-[#1E293B] flex items-start gap-2.5">
        <Lightbulb className="w-4 h-4 text-[#D49A32] shrink-0 mt-0.5" />
        <p className="text-[11px] text-[#93A1B2] leading-relaxed">
          Cyber City is showing an unusual increase in streetlight complaints. 45 reports were recorded compared with a historical baseline of 11. Reports are geographically concentrated within a 1.8 km radius.
        </p>
      </div>
    </div>
  );
};
