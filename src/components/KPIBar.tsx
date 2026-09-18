import React from 'react';
import {
  TrendingUp,
  Layers,
  AlertTriangle,
  Users,
  Clock,
  FileText,
  Inbox,
  ArrowDown,
} from 'lucide-react';

interface KPIBarProps {
  currentHour: number;
  activeIncidentsCount: number;
}

export const KPIBar: React.FC<KPIBarProps> = () => {
  const activeCount = 28010;
  const criticalCount = 14;
  const fieldTeams = 48;
  const avgSla = (12.4).toFixed(1);
  const openWorkOrders = 134;
  const totalReportsToday = 4920;

  return (
    <div className="w-full bg-[#090E16] border-b border-[#1E293B] px-4 sm:px-6 py-2.5 flex items-center select-none shrink-0 overflow-x-auto">
      <div className="flex items-center justify-between w-full min-w-[900px] divide-x divide-[#1E293B]">
        {/* Metric 1: Active incidents */}
        <div className="flex items-center gap-3 flex-1 px-4 first:pl-0">
          <div className="w-8 h-8 rounded bg-[#1597D4]/15 border border-[#1597D4]/30 flex items-center justify-center text-[#1597D4] shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-base text-white tracking-tight">
                {activeCount.toLocaleString()}
              </span>
              <span className="text-[10px] text-[#27A878] font-medium flex items-center">
                <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> +8.4%
              </span>
            </div>
            <div className="text-[11px] text-[#93A1B2]">Active incidents</div>
          </div>
        </div>

        {/* Metric 2: Critical incidents */}
        <div className="flex items-center gap-3 flex-1 px-4">
          <div className="w-8 h-8 rounded bg-[#D65A5A]/15 border border-[#D65A5A]/30 flex items-center justify-center text-[#D65A5A] shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-base text-white tracking-tight">
                {criticalCount}
              </span>
              <span className="text-[10px] text-[#D65A5A] font-medium">
                High priority
              </span>
            </div>
            <div className="text-[11px] text-[#93A1B2]">Critical incidents</div>
          </div>
        </div>

        {/* Metric 3: Field crews */}
        <div className="flex items-center gap-3 flex-1 px-4">
          <div className="w-8 h-8 rounded bg-[#27A878]/15 border border-[#27A878]/30 flex items-center justify-center text-[#27A878] shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-base text-white tracking-tight">
                {fieldTeams}
              </span>
              <span className="text-[10px] text-[#27A878] font-medium">
                Active on site
              </span>
            </div>
            <div className="text-[11px] text-[#93A1B2]">Field crews</div>
          </div>
        </div>

        {/* Metric 4: Avg response time */}
        <div className="flex items-center gap-3 flex-1 px-4">
          <div className="w-8 h-8 rounded bg-[#1597D4]/15 border border-[#1597D4]/30 flex items-center justify-center text-[#1597D4] shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-base text-white tracking-tight">
                {avgSla}m
              </span>
              <span className="text-[10px] text-[#27A878] font-medium flex items-center">
                <ArrowDown className="w-2.5 h-2.5 mr-0.5" /> 18%
              </span>
            </div>
            <div className="text-[11px] text-[#93A1B2]">Avg response time</div>
          </div>
        </div>

        {/* Metric 5: Open work orders */}
        <div className="flex items-center gap-3 flex-1 px-4">
          <div className="w-8 h-8 rounded bg-[#D49A32]/15 border border-[#D49A32]/30 flex items-center justify-center text-[#D49A32] shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-base text-white tracking-tight">
                {openWorkOrders}
              </span>
              <span className="text-[10px] text-[#D49A32] font-medium">
                Dispatched
              </span>
            </div>
            <div className="text-[11px] text-[#93A1B2]">Open work orders</div>
          </div>
        </div>

        {/* Metric 6: Reports today */}
        <div className="flex items-center gap-3 flex-1 px-4 last:pr-0">
          <div className="w-8 h-8 rounded bg-[#1597D4]/15 border border-[#1597D4]/30 flex items-center justify-center text-[#1597D4] shrink-0">
            <Inbox className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-bold text-base text-white tracking-tight">
                {totalReportsToday.toLocaleString()}
              </span>
              <span className="text-[10px] text-[#637184]">
                24h total
              </span>
            </div>
            <div className="text-[11px] text-[#93A1B2]">Reports today</div>
          </div>
        </div>
      </div>
    </div>
  );
};
