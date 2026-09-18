import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  UserRole,
  CitizenComplaint,
  FieldJob,
  FieldJobStatus,
  AppNotification,
  UserProfile,
  AuthUser,
} from '../types/multiRole';
import {
  INITIAL_CITIZEN_PROFILE,
  INITIAL_CITIZEN_COMPLAINTS,
  INITIAL_FIELD_JOBS,
  INITIAL_NOTIFICATIONS,
} from '../data/multiRoleData';
import { DEMO_CITIZEN, DEMO_OFFICER } from '../data/authDemoData';
import { api, type CanonicalComplaint } from '../services/api';

interface AppContextType {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  
  // Citizen state
  userProfile: UserProfile;
  complaints: CitizenComplaint[];
  addComplaint: (newComplaint: {
    title: string;
    description: string;
    location?: string;
    ward?: string;
    latitude?: number;
    longitude?: number;
    photoUrl?: string;
    category?: any;
    severity?: any;
  }) => CitizenComplaint;
  upvoteComplaint: (id: string) => void;
  rateComplaint: (id: string, rating: number) => void;

  // Field worker state
  fieldJobs: FieldJob[];
  updateJobStatus: (jobId: string, status: FieldJobStatus, notes?: string) => void;
  toggleChecklistItem: (jobId: string, checkId: string) => void;
  updateJobNotes: (jobId: string, notes: string) => void;
  completeJob: (jobId: string, notes?: string, afterPhotoUrl?: string) => void;

  // Notifications
  notifications: AppNotification[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  addNotification: (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;

  // Settings & i18n
  language: 'en' | 'hi';
  setLanguage: (lang: 'en' | 'hi') => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;

  // Authentication
  currentUser: AuthUser | null;
  loginAsCitizen: () => void;
  loginAsOfficer: () => void;
  loginCustom: (user: AuthUser) => void;
  logout: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;

  // Toast / Global alert
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('civic_auth_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [currentRole, setCurrentRole] = useState<UserRole>('citizen');
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_CITIZEN_PROFILE);
  const [complaints, setComplaints] = useState<CitizenComplaint[]>(INITIAL_CITIZEN_COMPLAINTS);
  const [fieldJobs, setFieldJobs] = useState<FieldJob[]>(INITIAL_FIELD_JOBS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loginAsCitizen = () => {
    setCurrentUser(DEMO_CITIZEN);
    setCurrentRole('citizen');
    localStorage.setItem('civic_auth_user', JSON.stringify(DEMO_CITIZEN));
    setIsAuthModalOpen(false);
    showToast('Logged in as Citizen: Rahul Sharma (Ward 14)');
  };

  const loginAsOfficer = () => {
    setCurrentUser(DEMO_OFFICER);
    setCurrentRole('commander');
    localStorage.setItem('civic_auth_user', JSON.stringify(DEMO_OFFICER));
    setIsAuthModalOpen(false);
    showToast('Logged in as Municipal Commander: Insp. Vikram Malhotra');
  };

  const loginCustom = (user: AuthUser) => {
    setCurrentUser(user);
    if (user.role === 'citizen') {
      setCurrentRole('citizen');
    } else {
      setCurrentRole('commander');
    }
    localStorage.setItem('civic_auth_user', JSON.stringify(user));
    setIsAuthModalOpen(false);
    showToast(`Logged in as ${user.name}`);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('civic_auth_user');
    setIsAuthModalOpen(true);
    showToast('Logged out successfully');
  };

  // Sync initial complaints from live FastAPI backend
  useEffect(() => {
    const fetchBackendComplaints = async () => {
      try {
        const backendItems = await api.getComplaints({ limit: 50 });
        if (backendItems && backendItems.length > 0) {
          const deptToCategoryMap: Record<string, any> = {
            roads: 'road',
            water: 'water',
            sanitation: 'waste',
            electrical: 'streetlight',
            sewage: 'drainage',
            traffic: 'traffic',
            parks: 'safety',
            other: 'safety'
          };

          const mapped: CitizenComplaint[] = backendItems.map((c) => {
            const cat = deptToCategoryMap[c.department.toLowerCase()] || 'safety';
            const sev: any = c.priority_level.toUpperCase() === 'HIGH' ? 'HIGH' : c.priority_level.toUpperCase() === 'LOW' ? 'LOW' : 'MEDIUM';
            const stat: any = c.status.toUpperCase() === 'RESOLVED' ? 'RESOLVED' : c.status.toUpperCase() === 'IN PROGRESS' ? 'IN_PROGRESS' : 'REPORTED';
            const dt = new Date(c.created_at);

            return {
              id: c.id,
              category: cat,
              title: `${c.issue_type} in ${c.locality || 'Locality'}`,
              description: c.complaint_text,
              location: c.locality || 'Delhi NCR Region',
              ward: c.locality ? `Ward — ${c.locality}` : 'Central Ward',
              latitude: c.latitude || 28.6315,
              longitude: c.longitude || 77.2195,
              reportedAt: dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
              status: stat,
              severity: sev,
              upvotes: c.matched_complaint_ids ? c.matched_complaint_ids.length + 1 : 1,
              hasUpvoted: false,
              assignedDept: c.department,
              assignedCrew: c.assigned_to || undefined,
              statusUpdates: [
                {
                  status: stat,
                  timestamp: dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  note: c.priority_reasons && c.priority_reasons.length > 0 ? c.priority_reasons.join('. ') : 'Ingested and prioritized by AI triage',
                  actor: 'CivicFlow AI Engine'
                }
              ]
            };
          });

          // Merge backend items with any local additions
          setComplaints(mapped);
        }
      } catch (err) {
        console.warn('Backend synchronization notice:', err);
      }
    };
    fetchBackendComplaints();
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Add new complaint (AI-predicted category & priority)
  const addComplaint = (data: {
    title: string;
    description: string;
    location?: string;
    ward?: string;
    latitude?: number;
    longitude?: number;
    photoUrl?: string;
    category?: any;
    severity?: any;
  }) => {
    const id = `C${Math.floor(1025 + Math.random() * 8000)}`;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });

    const newTicket: CitizenComplaint = {
      id,
      title: data.title,
      description: data.description,
      location: data.location || 'Delhi NCR',
      ward: data.ward || 'Central Ward',
      latitude: data.latitude || 28.6315,
      longitude: data.longitude || 77.2195,
      photoUrl: data.photoUrl,
      category: data.category || 'road',
      severity: data.severity || 'MEDIUM',
      reportedAt: `${dateStr}, ${timeStr}`,
      upvotes: 1,
      hasUpvoted: true,
      status: 'REPORTED',
      statusUpdates: [
        {
          status: 'REPORTED',
          timestamp: timeStr,
          note: 'Complaint registered and submitted to live NLP routing engine',
          actor: 'Citizen App',
        },
      ],
    };

    setComplaints((prev) => [newTicket, ...prev]);

    // Automatically create corresponding field worker task for ground crew
    const newJob: FieldJob = {
      id: `JOB-${id.replace('C', '')}`,
      complaintId: id,
      title: data.title,
      category: data.category || 'road',
      severity: data.severity || 'HIGH',
      ward: data.ward || 'Central Ward',
      address: data.location || 'Delhi NCR Region',
      latitude: data.latitude || 28.6315,
      longitude: data.longitude || 77.2195,
      distanceKm: Number((1.2 + Math.random() * 2.5).toFixed(1)),
      assignedToCrew: 'Quick Response Team 1',
      assignedAt: `${dateStr}, ${timeStr}`,
      slaDeadline: '4h 00m',
      status: 'ASSIGNED',
      reportedIssue: data.description || data.title,
      partsRequired: ['Inspection Sensor Kit', 'Municipal Repair Gear'],
      checklist: [
        { id: 'c1', label: 'Arrive at site & verify safety perimeter', completed: false },
        { id: 'c2', label: 'Confirm AI diagnosis and visual evidence', completed: false },
        { id: 'c3', label: 'Execute rapid fix or schedule heavy crew', completed: false },
        { id: 'c4', label: 'Upload proof photo and mark resolved', completed: false }
      ]
    };
    setFieldJobs((prev) => [newJob, ...prev]);

    // Asynchronously dispatch to FastAPI backend for live NLP/Gemini triage
    api.submitComplaint({
      complaint_text: data.description ? `${data.title}. ${data.description}` : data.title,
      locality: data.location || data.ward,
      latitude: data.latitude,
      longitude: data.longitude,
      photo_url: data.photoUrl
    }).then((res) => {
      console.log('Successfully saved to backend database with AI classification:', res);
      const deptToCategoryMap: Record<string, any> = {
        roads: 'road',
        water: 'water',
        sanitation: 'waste',
        electrical: 'streetlight',
        sewage: 'drainage',
        traffic: 'traffic',
        parks: 'safety',
        other: 'safety'
      };
      const cat = deptToCategoryMap[res.department.toLowerCase()] || 'safety';
      const sev: any = res.priority_level.toUpperCase() === 'HIGH' ? 'HIGH' : res.priority_level.toUpperCase() === 'LOW' ? 'LOW' : 'MEDIUM';

      setComplaints((prev) =>
        prev.map((c) => {
          if (c.id === id || c.id === res.id) {
            return {
              ...c,
              id: res.id,
              category: cat,
              assignedDept: res.department,
              issueType: res.issue_type,
              confidence: res.department_confidence,
              severity: sev,
              priorityScore: res.priority_score,
              priorityReasons: res.priority_reasons,
              duplicateClusterId: res.duplicate_cluster_id,
              matchedComplaintIds: res.matched_complaint_ids,
              location: res.locality || c.location,
              statusUpdates: [
                ...c.statusUpdates,
                {
                  status: 'ACKNOWLEDGED',
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  note: `AI Triage: Auto-classified into ${res.department} (${res.issue_type}). Priority: ${res.priority_level} (${res.priority_score}/100)${res.duplicate_cluster_id ? ' • Duplicate Cluster: ' + res.duplicate_cluster_id : ''}`,
                  actor: 'CivicFlow AI Engine'
                }
              ]
            };
          }
          return c;
        })
      );

      showToast(`AI Classified: [${res.department} • ${res.issue_type}] | Urgency: ${res.priority_level} (${res.priority_score}/100)`);
    }).catch((e) => {
      console.warn('Backend sync error:', e);
    });

    // Update karma points
    setUserProfile((prev) => ({
      ...prev,
      karmaPoints: prev.karmaPoints + 25,
    }));

    // Generate automatic notification
    addNotification({
      type: 'CRITICAL',
      title: `📝 Grievance Filed: ${id}`,
      message: `${data.title}. AI automated triage in progress.`,
      relatedId: id,
    });

    showToast(`Complaint ${id} registered and triaged via AI! +25 Civic Karma.`);
    return newTicket;
  };

  // Upvote complaint
  const upvoteComplaint = (id: string) => {
    setComplaints((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const hasUpvoted = !c.hasUpvoted;
          return {
            ...c,
            upvotes: hasUpvoted ? c.upvotes + 1 : c.upvotes - 1,
            hasUpvoted,
          };
        }
        return c;
      })
    );
  };

  // Rate resolved complaint
  const rateComplaint = (id: string, rating: number) => {
    setComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, citizenRating: rating } : c))
    );
    showToast(`Thank you! Your feedback (${rating} Stars) has been recorded.`);
  };

  // Update Field Job Status
  const updateJobStatus = (jobId: string, status: FieldJobStatus, notes?: string) => {
    setFieldJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          return {
            ...job,
            status,
            workNotes: notes || job.workNotes,
          };
        }
        return job;
      })
    );

    // Also sync with associated Citizen complaint
    const targetJob = fieldJobs.find((j) => j.id === jobId);
    if (targetJob) {
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const statusMap: Record<FieldJobStatus, any> = {
        ASSIGNED: 'ASSIGNED',
        EN_ROUTE: 'ASSIGNED',
        ON_SITE: 'IN_PROGRESS',
        IN_REPAIR: 'IN_PROGRESS',
        RESOLVED: 'RESOLVED',
      };

      const mappedStatus = statusMap[status];

      setComplaints((prev) =>
        prev.map((c) => {
          if (c.id === targetJob.complaintId) {
            const newUpdates = [
              ...c.statusUpdates,
              {
                status: mappedStatus,
                timestamp: nowTime,
                note: `Field update: Crew transitioned status to ${status.replace('_', ' ')}.${notes ? ` Note: ${notes}` : ''}`,
                actor: targetJob.assignedToCrew,
              },
            ];
            return {
              ...c,
              status: mappedStatus,
              statusUpdates: newUpdates,
            };
          }
          return c;
        })
      );
    }

    showToast(`Work order ${jobId} updated to ${status.replace('_', ' ')}.`);
  };

  // Toggle checklist item in field job
  const toggleChecklistItem = (jobId: string, checkId: string) => {
    setFieldJobs((prev) =>
      prev.map((j) => {
        if (j.id === jobId) {
          return {
            ...j,
            checklist: j.checklist.map((item) =>
              item.id === checkId ? { ...item, completed: !item.completed } : item
            ),
          };
        }
        return j;
      })
    );
  };

  // Update job notes
  const updateJobNotes = (jobId: string, notes: string) => {
    setFieldJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, workNotes: notes } : j))
    );
  };

  // Complete field job
  const completeJob = (jobId: string, notes?: string, afterPhotoUrl?: string) => {
    updateJobStatus(jobId, 'RESOLVED', notes);
    if (afterPhotoUrl) {
      setFieldJobs((prev) =>
        prev.map((j) => (j.id === jobId ? { ...j, afterPhotoUrl } : j))
      );
    }

    const job = fieldJobs.find((j) => j.id === jobId);
    addNotification({
      type: 'RESOLVED',
      title: `✅ Work Order ${jobId} Completed`,
      message: `${job?.title || 'Job'} marked as RESOLVED by ${job?.assignedToCrew || 'Crew'}.`,
      relatedId: job?.complaintId,
    });
  };

  // Notification methods
  const unreadNotificationCount = notifications.filter((n) => !n.read).length;

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read');
  };

  const addNotification = (notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `N-${Date.now()}`,
      timestamp: 'Just now',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        userProfile,
        complaints,
        addComplaint,
        upvoteComplaint,
        rateComplaint,
        fieldJobs,
        updateJobStatus,
        toggleChecklistItem,
        updateJobNotes,
        completeJob,
        notifications,
        unreadNotificationCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        addNotification,
        isNotificationsOpen,
        setIsNotificationsOpen,
        language,
        setLanguage,
        theme,
        setTheme,
        toggleTheme,
        isSettingsOpen,
        setIsSettingsOpen,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
