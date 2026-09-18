import React from 'react';
import type { HotspotCluster } from '../types/incident';
import { TrendingUp, MapPin } from 'lucide-react';
import { getCategoryTheme } from '../utils/categoryColors';

interface IncidentRankingProps {
  hotspots: HotspotCluster[];
  selectedClusterId: string | null;
  onSelectCluster: (cluster: HotspotCluster) => void;
  currentHour: number;
}

export const IncidentRanking: React.FC<IncidentRankingProps> = ({
  hotspots,
  selectedClusterId,
  onSelectCluster,
  currentHour,
}) => {
  return (
    <div className="space-y-3">
      <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-0.5">
        {hotspots.slice(0, 4).map((cluster, idx) => {
          const isSelected = selectedClusterId === cluster.id;
          const hourIdx = Math.floor(currentHour) % 24;
          const hourRatio = (cluster.hourlyDistribution[hourIdx] || 10) / (cluster.actualReports || 1);
          const dynamicReports = Math.max(3, Math.round(cluster.actualReports * hourRatio));
          const incId = `INC-${2041 + idx}`;
          const theme = getCategoryTheme(cluster.category);

          // Team assignment statuses as shown in screenshot
          const teamName = idx === 3 ? 'Team 04 en route' : `Team 0${idx + 1} assigned`;
          const isEnRoute = idx === 3;

          return (
            <div
              key={cluster.id}
              onClick={() => onSelectCluster(cluster)}
              className={`p-2.5 rounded-lg border transition-all cursor-pointer text-left relative ${
                isSelected
                  ? 'bg-[#152232] border-[#1597D4]'
                  : 'bg-[#111A24] border-[#1E293B] hover:border-[#263342] hover:bg-[#151F2A]'
              }`}
            >
              {/* Header Line */}
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <MapPin
                    className="w-3.5 h-3.5 shrink-0"
                    style={{ color: theme.hex }}
                  />
                  <span className="font-mono text-xs text-white font-semibold">
                    {incId}
                  </span>
                  <span
                    className="text-[9px] px-1.5 py-0.5 rounded font-medium truncate"
                    style={{
                      backgroundColor: theme.badgeBg,
                      color: theme.badgeText,
                      border: `1px solid ${theme.badgeBorder}`,
                    }}
                  >
                    {theme.name}
                  </span>
                </div>

                <span className="text-[11px] font-mono text-[#D65A5A] font-semibold flex items-center shrink-0">
                  <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
                  +{cluster.spikePercentage}%
                </span>
              </div>

              {/* Title / Location */}
              <div className="text-xs font-semibold text-white pl-5 truncate">
                {cluster.name}
              </div>

              {/* Reports & Assigned Crew */}
              <div className="flex items-center justify-between text-[11px] text-[#93A1B2] mt-1 pl-5">
                <span>{dynamicReports} reports</span>
                <span className={`text-[10px] flex items-center gap-1 ${isEnRoute ? 'text-[#D49A32]' : 'text-[#27A878]'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isEnRoute ? 'bg-[#D49A32]' : 'bg-[#27A878]'}`} />
                  {teamName}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => onSelectCluster(hotspots[0])}
        className="text-xs text-[#1597D4] hover:underline font-medium flex items-center gap-1 cursor-pointer pt-0.5"
      >
        <span>View all incidents</span>
        <span>→</span>
      </button>
    </div>
  );
};
