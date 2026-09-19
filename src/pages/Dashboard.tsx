import React, { useState, useEffect } from 'react';
import type {
  IncidentCategory,
  TimeRangeOption,
  VisualizationSettings,
  HotspotCluster,
} from '../types/incident';
import { HOTSPOT_CLUSTERS } from '../data/hotspots';
import { filterIncidentsByState } from '../utils/incidentAnalytics';
import { KPIBar } from '../components/KPIBar';
import { Sidebar } from '../components/Sidebar';
import { CityMap } from '../components/CityMap';
import { RightPanel } from '../components/RightPanel';
import { Timeline } from '../components/Timeline';
import { IncidentDetailModal } from '../components/IncidentDetailModal';
import { AIIntelligenceModal } from '../components/AIIntelligenceModal';
import { ReportSubmissionModal } from '../components/ReportSubmissionModal';
import { useApp } from '../context/AppContext';
import {
  CheckCircle2,
  Satellite,
  AlertTriangle,
  Radio,
  Crosshair,
  Flame,
  Activity,
  ShieldAlert,
} from 'lucide-react';
import { sounds } from '../services/soundEffects';

export const Dashboard: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<IncidentCategory>('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRangeOption>('realtime');
  const [selectedCity, setSelectedCity] = useState<string>('metro-core');
  const [selectedCluster, setSelectedCluster] = useState<HotspotCluster | null>(null);

  const [visSettings, setVisSettings] = useState<VisualizationSettings>({
    heatIntensity: 70,
    hotspotRadius: 450,
    buildingHeight: 2.0,
    viewMode: '3D',
    pitch: 50,
    bearing: -15,
  });

  const [currentHour, setCurrentHour] = useState<number>(19);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(2);

  const [isAIModalOpen, setIsAIModalOpen] = useState<boolean>(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Replay loop
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentHour((prev) => {
        const next = prev + 0.1 * playbackSpeed;
        if (next >= 24) { setIsPlaying(false); return 24; }
        return parseFloat(next.toFixed(1));
      });
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  const handleUpdateVisSettings = (s: Partial<VisualizationSettings>) => {
    setVisSettings((prev) => ({ ...prev, ...s }));
  };

  const { complaints } = useApp();

  const handleSelectCluster = (cluster: HotspotCluster) => {
    setSelectedCluster(cluster);
    setIsDetailModalOpen(true);
  };

  const handleDispatch = (actionText: string) => {
    setNotification(actionText);
    setTimeout(() => setNotification(null), 4500);
  };

  const handleReportCreated = (report: any) => {
    handleDispatch(`New report ${report.id} successfully filed in ${report.ward}. Auto-classified as ${report.category.toUpperCase()}.`);
  };

  // Dynamically map citizen complaints onto the live 3D GIS Map
  const liveCitizenHotspots: HotspotCluster[] = complaints.map((c, idx) => {
    const isEmergency =
      c.severity === 'CRITICAL' ||
      c.title.toUpperCase().includes('EMERGENCY') ||
      c.title.toUpperCase().includes('SOS') ||
      (c.priorityScore !== undefined && c.priorityScore >= 90);

    return {
      id: `citizen-hotspot-${c.id}`,
      rank: isEmergency ? 0 : idx + 1,
      name: isEmergency
        ? `🚨 SOS: ${(c.location || 'Delhi Zone').split(',')[0]} (${c.id})`
        : `${(c.location || 'Delhi Zone').split(',')[0]} (${c.id})`,
      aliasTitle: c.title,
      district: c.ward,
      category: isEmergency ? 'safety' : ((c.category as IncidentCategory) || 'road'),
      title: c.title,
      subtitle: (c.description || '').slice(0, 65) + '...',
      latitude: c.latitude || 28.6315,
      longitude: c.longitude || 77.2195,
      currentDensity: isEmergency ? 100 : 88,
      baselineReports: 1,
      actualReports: c.upvotes || 1,
      spikePercentage: isEmergency ? 450 : (c.priorityScore || 75) * 2,
      severity: isEmergency ? 'CRITICAL' : ((c.severity as SeverityLevel) || 'HIGH'),
      radiusKm: isEmergency ? 0.65 : 0.35,
      buildingHeightMultiplier: isEmergency ? 3.5 : 1.8,
      anomalyScore: isEmergency ? 0.99 : (c.priorityScore || 75) / 100,
      whyDetected:
        c.priorityReasons && c.priorityReasons.length > 0
          ? c.priorityReasons
          : isEmergency
          ? ['🚨 CRITICAL PUBLIC SAFETY DISTRESS BEACON ACTIVATED', 'Priority Level: 99/100 • Ground Dispatch Alerted']
          : ['Live Grievance Filed by Citizen • AI Prioritized'],
      sampleReports: [
        {
          id: c.id,
          time: c.reportedAt,
          text: c.description || c.title,
          severity: isEmergency ? 'CRITICAL' : ((c.severity as SeverityLevel) || 'HIGH'),
          user: isEmergency ? '🚨 Citizen Distress SOS' : 'Citizen Reporter',
        },
      ],
      hourlyDistribution: Array(24).fill(1),
      recommendedAction: isEmergency
        ? `🚨 RED-ALERT RAPID DISPATCH: Cordon hazard perimeter for ${c.title}`
        : `Inspect and dispatch field crew for ${c.issueType || c.title}`,
    };
  });

  const allHotspotsCombined = [...liveCitizenHotspots, ...HOTSPOT_CLUSTERS].sort((a, b) => {
    const aEmerg = a.severity === 'CRITICAL' || a.name.includes('SOS') || a.title.toUpperCase().includes('EMERGENCY');
    const bEmerg = b.severity === 'CRITICAL' || b.name.includes('SOS') || b.title.toUpperCase().includes('EMERGENCY');
    if (aEmerg && !bEmerg) return -1;
    if (!aEmerg && bEmerg) return 1;
    return 0;
  });
  const filteredHotspots = allHotspotsCombined.filter((h) => selectedCategory === 'all' ? true : h.category === selectedCategory);

  const staticIncidents = filterIncidentsByState(selectedCategory, currentHour, selectedCluster?.id || null);
  const liveCitizenIncidents = complaints.map((c) => {
    const isEmerg =
      c.severity === 'CRITICAL' ||
      c.title.toUpperCase().includes('EMERGENCY') ||
      c.title.toUpperCase().includes('SOS');
    return {
      id: c.id,
      clusterId: `citizen-hotspot-${c.id}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      hour: currentHour,
      category: isEmerg ? 'safety' : ((c.category as IncidentCategory) || 'road'),
      title: c.title,
      description: c.description || c.title,
      locationName: c.location,
      district: c.ward,
      latitude: c.latitude || 28.6315,
      longitude: c.longitude || 77.2195,
      severity: isEmerg ? 'CRITICAL' : ((c.severity as SeverityLevel) || 'HIGH'),
      status: (c.status === 'RESOLVED' ? 'RESOLVED' : 'ACTIVE') as any,
      citizenReporter: isEmerg ? '🚨 Citizen Distress SOS' : 'Verified Citizen',
      confidenceScore: c.confidence || 0.98,
    };
  });

  const activeIncidents = [
    ...liveCitizenIncidents.filter((inc) => selectedCategory === 'all' || inc.category === selectedCategory),
    ...staticIncidents
  ];

  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-hidden bg-[#080D14] text-[#E8EDF3] font-sans">
      {/* Telemetry Operational Header */}
      <KPIBar currentHour={currentHour} activeIncidentsCount={activeIncidents.length} />

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar */}
        <Sidebar
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          selectedTimeRange={selectedTimeRange}
          onSelectTimeRange={setSelectedTimeRange}
          visSettings={visSettings}
          onUpdateVisSettings={handleUpdateVisSettings}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          onResetReplay={() => { setIsPlaying(false); setCurrentHour(0); }}
          playbackSpeed={playbackSpeed}
          onChangeSpeed={setPlaybackSpeed}
          selectedCity={selectedCity}
          onSelectCity={setSelectedCity}
        />

        {/* Center: Map + Timeline */}
        <div className="flex-1 flex flex-col relative overflow-hidden">
          {/* Map Area */}
          <div className="flex-1 relative overflow-hidden">
            <CityMap
              hotspots={filteredHotspots}
              incidents={activeIncidents}
              selectedClusterId={selectedCluster?.id || 'hotspot-1'}
              onSelectCluster={handleSelectCluster}
              visSettings={visSettings}
              onUpdateVisSettings={handleUpdateVisSettings}
              currentHour={currentHour}
            />
          </div>

          <Timeline
            currentHour={currentHour}
            onSeekHour={(h) => setCurrentHour(h)}
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying(!isPlaying)}
            onReset={() => { setIsPlaying(false); setCurrentHour(0); }}
            playbackSpeed={playbackSpeed}
            onChangeSpeed={setPlaybackSpeed}
          />
        </div>

        {/* Right Panel */}
        <RightPanel
          hotspots={filteredHotspots}
          selectedClusterId={selectedCluster?.id || 'hotspot-1'}
          onSelectCluster={handleSelectCluster}
          currentHour={currentHour}
          onQuickDispatch={handleDispatch}
        />
      </div>

      {/* Modals */}
      {isDetailModalOpen && (
        <IncidentDetailModal
          cluster={selectedCluster || filteredHotspots[0]}
          onClose={() => setIsDetailModalOpen(false)}
          onDispatch={handleDispatch}
        />
      )}

      <AIIntelligenceModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        onDispatch={handleDispatch}
      />

      <ReportSubmissionModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onReportCreated={handleReportCreated}
      />

      {/* Notification Toast */}
      {notification && (
        <div
          className="fixed top-14 right-6 z-50 p-3 rounded flex items-center gap-2.5 text-xs bg-[#151F2A] border border-[#263342] shadow-2xl text-[#E8EDF3]"
        >
          <CheckCircle2 className="w-4 h-4 text-[#27A878] shrink-0" />
          <div>
            <div className="text-[10px] text-[#27A878] font-mono uppercase tracking-wide font-medium">
              Operational event
            </div>
            <div className="text-[#93A1B2] mt-0.5 max-w-xs text-xs">{notification}</div>
          </div>
        </div>
      )}
    </div>
  );
};
