import React, { useState } from 'react';
import type { HotspotCluster } from '../types/incident';
import { IncidentRanking } from './IncidentRanking';
import { AIInsightPanel } from './AIInsightPanel';

interface RightPanelProps {
  hotspots: HotspotCluster[];
  selectedClusterId: string | null;
  onSelectCluster: (cluster: HotspotCluster) => void;
  currentHour: number;
  onQuickDispatch: (action: string) => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  hotspots,
  selectedClusterId,
  onSelectCluster,
  currentHour,
  onQuickDispatch,
}) => {
  const [activeTab, setActiveTab] = useState<'active' | 'critical' | 'teams'>('active');

  const formattedHour = `${Math.floor(currentHour).toString().padStart(2, '0')}:00 hrs`;

  return (
    <aside className="w-80 shrink-0 h-full bg-[#0B121C] border-l border-[#1E293B] flex flex-col justify-between overflow-y-auto z-30 select-none text-xs">
      {/* ── Top Area: Header, Tabs, and Incidents List ── */}
      <div>
        {/* Header */}
        <div className="p-3.5 border-b border-[#1E293B] flex items-center justify-between">
          <div>
            <h2 className="text-xs font-semibold text-white">
              Civic Intelligence
            </h2>
            <p className="text-[11px] text-[#637184] mt-0.5">
              Live operational picture
            </p>
          </div>
          <div className="text-right">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-[#27A878]/15 border border-[#27A878]/30 text-[#27A878] text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#27A878]" />
              <span>LIVE</span>
            </div>
            <div className="text-[10px] text-[#637184] font-mono mt-0.5">{formattedHour}</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-[#1E293B] px-3 gap-4 text-xs">
          <button
            onClick={() => setActiveTab('active')}
            className={`py-2.5 font-medium transition-colors cursor-pointer relative ${
              activeTab === 'active'
                ? 'text-white font-semibold'
                : 'text-[#637184] hover:text-[#93A1B2]'
            }`}
          >
            Active incidents
            {activeTab === 'active' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1597D4]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('critical')}
            className={`py-2.5 font-medium transition-colors cursor-pointer relative ${
              activeTab === 'critical'
                ? 'text-white font-semibold'
                : 'text-[#637184] hover:text-[#93A1B2]'
            }`}
          >
            Critical (14)
            {activeTab === 'critical' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1597D4]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('teams')}
            className={`py-2.5 font-medium transition-colors cursor-pointer relative ${
              activeTab === 'teams'
                ? 'text-white font-semibold'
                : 'text-[#637184] hover:text-[#93A1B2]'
            }`}
          >
            Nearby teams
            {activeTab === 'teams' && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1597D4]" />
            )}
          </button>
        </div>

        {/* Incident List */}
        <div className="p-3">
          <IncidentRanking
            hotspots={hotspots}
            selectedClusterId={selectedClusterId}
            onSelectCluster={onSelectCluster}
            currentHour={currentHour}
          />
        </div>
      </div>

      {/* ── Bottom Area: Operational Insight ── */}
      <div className="p-3.5 border-t border-[#1E293B] bg-[#090E16]/80">
        <AIInsightPanel
          selectedClusterId={selectedClusterId}
          currentHour={currentHour}
          onQuickDispatch={onQuickDispatch}
        />
      </div>
    </aside>
  );
};
