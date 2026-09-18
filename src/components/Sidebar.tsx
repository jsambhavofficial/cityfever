import React from 'react';
import type {
  IncidentCategory,
  TimeRangeOption,
  VisualizationSettings,
} from '../types/incident';
import {
  Layers,
  Lightbulb,
  Droplets,
  Trash2,
  Car,
  Cone,
  Shield,
  ChevronDown,
  Compass,
  RotateCcw,
} from 'lucide-react';

interface SidebarProps {
  selectedCategory: IncidentCategory;
  onSelectCategory: (category: IncidentCategory) => void;
  selectedTimeRange: TimeRangeOption;
  onSelectTimeRange: (range: TimeRangeOption) => void;
  visSettings: VisualizationSettings;
  onUpdateVisSettings: (settings: Partial<VisualizationSettings>) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onResetReplay: () => void;
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
}

const INCIDENT_LAYERS: {
  id: IncidentCategory;
  label: string;
  count: number;
  icon: any;
}[] = [
  { id: 'all', label: 'All incidents', count: 2548, icon: Layers },
  { id: 'water', label: 'Water supply', count: 546, icon: Droplets },
  { id: 'road', label: 'Road damage', count: 482, icon: Cone },
  { id: 'streetlight', label: 'Streetlight & power', count: 419, icon: Lightbulb },
  { id: 'traffic', label: 'Traffic grid', count: 395, icon: Car },
  { id: 'waste', label: 'Sanitation & waste', count: 312, icon: Trash2 },
  { id: 'safety', label: 'Public safety', count: 176, icon: Shield },
];

export const Sidebar: React.FC<SidebarProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedTimeRange,
  onSelectTimeRange,
  selectedCity,
  onSelectCity,
}) => {
  return (
    <aside className="w-64 shrink-0 h-full bg-[#0B121C] border-r border-[#1E293B] flex flex-col justify-between overflow-y-auto z-30 select-none text-xs">
      <div>
        {/* ── Section 1: Operations Header & Sector Picker ── */}
        <div className="p-3.5 border-b border-[#1E293B]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#1597D4]" />
              Operations
            </span>
            <span className="text-[11px] text-[#637184]">
              Delhi NCR
            </span>
          </div>

          <label className="text-[11px] text-[#93A1B2] block mb-1">Metro Sector</label>
          <div className="relative">
            <select
              value={selectedCity}
              onChange={(e) => onSelectCity(e.target.value)}
              className="w-full bg-[#111A24] border border-[#263342] rounded px-2.5 py-1.5 text-xs text-[#E8EDF3] focus:outline-none focus:border-[#1597D4] appearance-none cursor-pointer pr-7"
            >
              <option value="metro-core">Delhi Metro Core (All Wards)</option>
              <option value="ward-14">Ward 14 — Rohini North</option>
              <option value="ward-42">Ward 42 — Connaught Place</option>
              <option value="ward-28">Ward 28 — Lajpat Nagar</option>
              <option value="ward-19">Ward 19 — East Delhi Central</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#637184] absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* ── Section 2: Incident Layers ── */}
        <div className="p-3 border-b border-[#1E293B]">
          <div className="text-[11px] font-semibold text-[#93A1B2] mb-2 px-1">
            Incident Layers
          </div>

          <div className="space-y-1">
            {INCIDENT_LAYERS.map((layer) => {
              const Icon = layer.icon;
              const isSelected = selectedCategory === layer.id;
              return (
                <button
                  key={layer.id}
                  onClick={() => onSelectCategory(layer.id)}
                  className={`w-full px-2.5 py-2 rounded flex items-center justify-between transition-colors cursor-pointer text-left relative ${
                    isSelected
                      ? 'bg-[#152332] text-white font-medium'
                      : 'text-[#93A1B2] hover:text-white hover:bg-[#111A24]/60'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute left-0 top-1 bottom-1 w-[3px] bg-[#1597D4] rounded-r" />
                  )}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#1597D4]' : 'text-[#637184]'}`} />
                    <span className="truncate text-xs">{layer.label}</span>
                  </div>
                  <span className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${isSelected ? 'bg-[#1597D4]/20 text-[#1597D4] font-medium' : 'text-[#637184]'}`}>
                    {layer.count.toLocaleString()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Section 3: Filters Grid ── */}
      <div className="p-3.5 border-t border-[#1E293B] space-y-3 bg-[#090E16]/80">
        <div className="text-[11px] font-semibold text-white px-0.5">
          Filters
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="text-[10px] text-[#637184] block mb-1">Severity</label>
            <div className="relative">
              <select className="w-full bg-[#111A24] border border-[#263342] rounded px-2 py-1 text-xs text-[#E8EDF3] appearance-none cursor-pointer pr-6">
                <option>All</option>
                <option>Critical</option>
                <option>High</option>
                <option>Normal</option>
              </select>
              <ChevronDown className="w-3 h-3 text-[#637184] absolute right-2 top-2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-[#637184] block mb-1">Status</label>
            <div className="relative">
              <select className="w-full bg-[#111A24] border border-[#263342] rounded px-2 py-1 text-xs text-[#E8EDF3] appearance-none cursor-pointer pr-6">
                <option>All</option>
                <option>Active</option>
                <option>In Progress</option>
                <option>Resolved</option>
              </select>
              <ChevronDown className="w-3 h-3 text-[#637184] absolute right-2 top-2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-[#637184] block mb-1">Time window</label>
            <div className="relative">
              <select
                value={selectedTimeRange}
                onChange={(e) => onSelectTimeRange(e.target.value as TimeRangeOption)}
                className="w-full bg-[#111A24] border border-[#263342] rounded px-2 py-1 text-xs text-[#E8EDF3] appearance-none cursor-pointer pr-6"
              >
                <option value="realtime">Real-time</option>
                <option value="today">24 hours</option>
                <option value="last7d">7 days</option>
                <option value="last30d">30 days</option>
              </select>
              <ChevronDown className="w-3 h-3 text-[#637184] absolute right-2 top-2 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-[10px] text-[#637184] block mb-1">District</label>
            <div className="relative">
              <select className="w-full bg-[#111A24] border border-[#263342] rounded px-2 py-1 text-xs text-[#E8EDF3] appearance-none cursor-pointer pr-6">
                <option>All</option>
                <option>North Delhi</option>
                <option>Central Delhi</option>
                <option>South Delhi</option>
                <option>East Delhi</option>
              </select>
              <ChevronDown className="w-3 h-3 text-[#637184] absolute right-2 top-2 pointer-events-none" />
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            onSelectCategory('all');
            onSelectTimeRange('realtime');
          }}
          className="flex items-center gap-1.5 text-[#1597D4] hover:text-[#38BDF8] text-xs font-medium cursor-pointer pt-1"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset filters</span>
        </button>
      </div>
    </aside>
  );
};
