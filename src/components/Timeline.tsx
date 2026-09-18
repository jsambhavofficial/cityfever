import React, { useRef } from 'react';
import { Play, Pause, ChevronDown } from 'lucide-react';

interface TimelineProps {
  currentHour: number;
  onSeekHour: (hour: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
}

// 24-hour activity distribution for histogram visualization
const HOURLY_ACTIVITY_BARS = [
  { hour: 0, height: 12, level: 'normal' },
  { hour: 1, height: 10, level: 'normal' },
  { hour: 2, height: 8, level: 'normal' },
  { hour: 3, height: 7, level: 'normal' },
  { hour: 4, height: 9, level: 'normal' },
  { hour: 5, height: 14, level: 'normal' },
  { hour: 6, height: 22, level: 'normal' },
  { hour: 7, height: 35, level: 'normal' },
  { hour: 8, height: 48, level: 'normal' },
  { hour: 9, height: 55, level: 'normal' },
  { hour: 10, height: 58, level: 'normal' },
  { hour: 11, height: 52, level: 'normal' },
  { hour: 12, height: 60, level: 'normal' },
  { hour: 13, height: 56, level: 'normal' },
  { hour: 14, height: 62, level: 'normal' },
  { hour: 15, height: 70, level: 'high' },
  { hour: 16, height: 82, level: 'high' },
  { hour: 17, height: 92, level: 'critical' },
  { hour: 18, height: 98, level: 'critical' },
  { hour: 19, height: 100, level: 'critical' },
  { hour: 20, height: 85, level: 'high' },
  { hour: 21, height: 65, level: 'high' },
  { hour: 22, height: 40, level: 'normal' },
  { hour: 23, height: 25, level: 'normal' },
];

export const Timeline: React.FC<TimelineProps> = ({
  currentHour,
  onSeekHour,
  isPlaying,
  onTogglePlay,
  playbackSpeed,
  onChangeSpeed,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const progress = Math.min(100, Math.max(0, (currentHour / 24) * 100));

  const formatHour = (h: number) => {
    const hrs = Math.floor(h);
    const mins = Math.floor((h - hrs) * 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const handleTrackClick = (e: React.MouseEvent) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    onSeekHour(parseFloat((Math.min(24, Math.max(0, pos * 24))).toFixed(1)));
  };

  return (
    <div className="w-full bg-[#090E16]/95 border-t border-[#1E293B] px-4 sm:px-6 py-2.5 flex flex-col gap-2 z-40 select-none shrink-0 backdrop-blur-md">
      {/* ── Top Row: Controls & Legend ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-white">
            Activity timeline
          </span>

          {/* Circular Play / Pause button */}
          <button
            onClick={onTogglePlay}
            className="w-7 h-7 rounded-full bg-[#1597D4] hover:bg-[#1fa6e8] text-white cursor-pointer transition-colors flex items-center justify-center shadow-md shrink-0"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            )}
          </button>

          {/* Speed Selector */}
          <div className="relative">
            <select
              value={playbackSpeed}
              onChange={(e) => onChangeSpeed(Number(e.target.value))}
              className="bg-[#111A24] border border-[#263342] text-xs text-[#93A1B2] rounded px-2 py-0.5 appearance-none cursor-pointer pr-5 font-mono"
            >
              <option value={1}>1x</option>
              <option value={2}>2x</option>
              <option value={4}>4x</option>
            </select>
            <ChevronDown className="w-3 h-3 text-[#637184] absolute right-1.5 top-1.5 pointer-events-none" />
          </div>

          {/* Time display */}
          <div className="font-bold text-sm text-[#1597D4]">
            {formatHour(currentHour)}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <span className="flex items-center gap-1.5 text-[#93A1B2]">
            <span className="w-2 h-2 rounded-full bg-[#1597D4]" /> Normal
          </span>
          <span className="flex items-center gap-1.5 text-[#93A1B2]">
            <span className="w-2 h-2 rounded-full bg-[#D49A32]" /> High
          </span>
          <span className="flex items-center gap-1.5 text-[#93A1B2]">
            <span className="w-2 h-2 rounded-full bg-[#D65A5A]" /> Critical
          </span>
        </div>
      </div>

      {/* ── Interactive Activity Histogram Scrubber ── */}
      <div className="relative flex flex-col justify-end">
        <div
          ref={trackRef}
          onClick={handleTrackClick}
          className="w-full h-9 relative cursor-pointer flex items-end gap-[2px] pt-1"
        >
          {HOURLY_ACTIVITY_BARS.map((bar) => {
            const isCritical = bar.level === 'critical';
            const isHigh = bar.level === 'high';
            const barColor = isCritical
              ? '#D65A5A'
              : isHigh
              ? '#D49A32'
              : '#1597D4';

            return (
              <div
                key={bar.hour}
                className="flex-1 flex items-end justify-center h-full group"
              >
                <div
                  className="w-full rounded-t-xs transition-all opacity-80 group-hover:opacity-100"
                  style={{
                    height: `${bar.height}%`,
                    backgroundColor: barColor,
                  }}
                />
              </div>
            );
          })}

          {/* Timeline Scrub Handle & Vertical Indicator Line */}
          <div
            className="absolute top-0 bottom-0 pointer-events-none z-10 -ml-[1px]"
            style={{ left: `${progress}%` }}
          >
            <div className="w-[2px] h-full bg-white shadow-sm" />
            <div className="w-2.5 h-2.5 rounded-full bg-white border-2 border-[#1597D4] absolute -bottom-1 -left-[4px] shadow-md" />
          </div>
        </div>

        {/* Hour markers */}
        <div className="flex justify-between items-center text-[10px] text-[#637184] font-mono mt-1 px-0.5">
          <span>00:00</span>
          <span>04:00</span>
          <span>08:00</span>
          <span>12:00</span>
          <span>16:00</span>
          <span>20:00</span>
          <span>24:00</span>
        </div>
      </div>
    </div>
  );
};
