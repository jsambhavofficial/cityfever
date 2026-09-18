/**
 * CivicFlow & CivicPulse Unified Frontend API Client
 * Connects React UI to FastAPI backend with real-time NLP triage, explainable priority, and geospatial intelligence.
 */

export const API_BASE_URL = 'http://localhost:8000/api';

// Canonical Complaint Interface (Member 2 & 3 Standard)
export interface CanonicalComplaint {
  id: string;
  complaint_text: string;
  department: string;
  issue_type: string;
  department_confidence: number;
  issue_confidence: number;
  priority_score: number;
  priority_level: 'High' | 'Medium' | 'Low';
  priority_reasons?: string[];
  locality?: string;
  duration_text?: string;
  latitude?: number;
  longitude?: number;
  duplicate_cluster_id?: string | null;
  matched_complaint_ids?: string[];
  status: string;
  assigned_to?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface ComplaintSubmissionPayload {
  complaint_text?: string;
  locality?: string;
  latitude?: number;
  longitude?: number;
  photo_url?: string;
}

export interface DashboardStats {
  total_complaints: number;
  high_priority_count: number;
  medium_priority_count: number;
  low_priority_count: number;
  manual_review_count: number;
  pending_count: number;
  in_progress_count: number;
  resolved_count: number;
  duplicate_clusters_count: number;
  department_breakdown: Record<string, number>;
  priority_breakdown: Record<string, number>;
  top_localities: Record<string, number>;
}

export interface IncidentSummary {
  id: string;
  title: string;
  subtitle?: string;
  category: string;
  status: string;
  severity: string;
  score: number;
  centroid_lat: number;
  centroid_lng: number;
  radius_m: number;
  report_count: number;
  baseline_count: number;
  growth_percent: number;
  anomaly_score: number;
  assigned_dept?: string;
  assigned_crew?: string;
  recommended_action?: string;
  detected_at: string;
  acknowledged_at?: string;
  resolved_at?: string;
  pre_volume_hourly?: number;
  post_volume_hourly?: number;
  impact_delta_pct?: number;
  why_detected?: string[];
}

export interface CitizenReportPayload {
  description: string;
  latitude: number;
  longitude: number;
  ward?: string;
  category?: string;
  severity?: string;
  reporter_name?: string;
}

export interface TelemetryKPIs {
  totalReportsToday: number;
  activeIncidentsCount: number;
  maxSpikePercent: number;
  responseVelocityScore: number;
  gridStrainIndex: number;
  resolvedTodayCount: number;
  anomalyWindowActive: boolean;
}

export const api = {
  // ── Canonical Member 2 API Endpoints ──

  // 1. Submit citizen complaint to live ML, Entity, Priority & Duplicate pipeline
  async submitComplaint(payload: ComplaintSubmissionPayload): Promise<CanonicalComplaint> {
    const res = await fetch(`${API_BASE_URL}/complaints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`Failed to submit complaint: HTTP ${res.status}`);
    return await res.json();
  },

  // 1b. Analyze incident image via Gemini Multimodal Vision
  async analyzeImage(image: string, hint?: string): Promise<{
    title: string;
    description: string;
    department: string;
    issue_type: string;
    severity: string;
    priority_score: number;
    priority_reasons: string[];
    visual_hazards?: string[];
    landmark_hints?: string;
    ai_engine?: string;
  }> {
    const res = await fetch(`${API_BASE_URL}/complaints/analyze-image`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image, hint })
    });
    if (!res.ok) throw new Error(`Image analysis failed: HTTP ${res.status}`);
    return await res.json();
  },

  // 2. Fetch all complaints with multi-filter query
  async getComplaints(params?: {
    department?: string;
    priority_level?: string;
    status?: string;
    duplicate_cluster_id?: string;
    search?: string;
    limit?: number;
  }): Promise<CanonicalComplaint[]> {
    try {
      const query = new URLSearchParams();
      if (params?.department && params.department !== 'all') query.append('department', params.department);
      if (params?.priority_level && params.priority_level !== 'all') query.append('priority_level', params.priority_level);
      if (params?.status && params.status !== 'all') query.append('status', params.status);
      if (params?.duplicate_cluster_id) query.append('duplicate_cluster_id', params.duplicate_cluster_id);
      if (params?.search) query.append('search', params.search);
      if (params?.limit) query.append('limit', String(params.limit));

      const res = await fetch(`${API_BASE_URL}/complaints?${query.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn('Backend API /complaints unreachable:', e);
      return [];
    }
  },

  // 3. Get single complaint details by ID
  async getComplaintById(id: string): Promise<CanonicalComplaint | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/complaints/${id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return null;
    }
  },

  // 4. Update complaint status / assigned officer
  async updateComplaint(id: string, update: { status?: string; assigned_to?: string }): Promise<CanonicalComplaint> {
    const res = await fetch(`${API_BASE_URL}/complaints/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(update)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  },

  // 5. Reassign complaint department & officer
  async reassignComplaint(id: string, payload: { department: string; reason?: string; assigned_to?: string }): Promise<CanonicalComplaint> {
    const res = await fetch(`${API_BASE_URL}/complaints/${id}/reassign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  },

  // 6. Get department officer incoming queue
  async getDepartmentQueue(department: string, status?: string): Promise<CanonicalComplaint[]> {
    try {
      const q = status ? `?status=${encodeURIComponent(status)}` : '';
      const res = await fetch(`${API_BASE_URL}/queues/${encodeURIComponent(department)}${q}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return [];
    }
  },

  // 7. Get high-level analytics & dashboard stats
  async getDashboardStats(): Promise<DashboardStats | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/dashboard/stats`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return null;
    }
  },

  // 8. Get similar & duplicate complaints cluster
  async getSimilarComplaints(id: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/complaints/${id}/similar`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return null;
    }
  },

  // ── UI Integration Endpoints ──

  async getEmergingIncidents(category?: string, severity?: string): Promise<IncidentSummary[]> {
    try {
      const params = new URLSearchParams();
      if (category && category !== 'all') params.append('category', category);
      if (severity && severity !== 'all') params.append('severity', severity);
      const res = await fetch(`${API_BASE_URL}/incidents/emerging?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn('Backend API unavailable, using offline cache', e);
      return [];
    }
  },

  async getIncidentDetail(id: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/incidents/${id}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      console.warn(`Failed to fetch incident ${id}`, e);
      return null;
    }
  },

  async updateIncidentStatus(
    id: string,
    status: string,
    note?: string,
    assigned_dept?: string,
    assigned_crew?: string
  ): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/incidents/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        status,
        note: note || `Status transitioned to ${status}`,
        assigned_dept,
        assigned_crew,
        changed_by: 'Incident Commander'
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  },

  async submitCitizenReport(payload: CitizenReportPayload): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  },

  async getTelemetry(): Promise<TelemetryKPIs | null> {
    try {
      const res = await fetch(`${API_BASE_URL}/analytics/telemetry`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return null;
    }
  },

  async getHotspotsGeoJSON(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/hotspots`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch {
      return null;
    }
  }
};
