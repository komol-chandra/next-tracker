import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  Role,
  Tenant,
  User,
  ViewTab,
  SystemNotification
} from '../types';
import { api } from '../services/api';

interface TimerState {
  running: boolean;
  seconds: number;
  activeTaskId: string;
  activeTaskTitle: string;
}

interface IdleState {
  detected: boolean;
  idleMinutes: number;
  thresholdSeconds: number;
}

interface PunchState {
  clockedIn: boolean;
  clockInTime: string;
  clockOutTime: string | null;
  status: 'Present' | 'Clocked Out';
}

interface ToastItem {
  id: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  tenants: Tenant[];
  currentTenant: Tenant;
  switchTenant: (tenantId: string) => void;
  currentRole: Role;
  switchRole: (role: Role) => void;
  currentUser: User;
  activeView: ViewTab;
  setActiveView: (view: ViewTab) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Timer
  timer: TimerState;
  toggleTimer: () => void;
  resetTimer: () => void;
  selectTaskForTimer: (taskId: string, title: string) => void;
  formatSeconds: (sec: number) => string;

  // Web Idle Detector
  idle: IdleState;
  keepIdleTime: () => void;
  discardIdleTime: () => void;

  // Attendance Punch
  punchState: PunchState;
  punchClockIn: (location?: string, note?: string) => Promise<void>;
  punchClockOut: () => Promise<void>;

  // Modals
  activeModal: { type: string; props?: any } | null;
  openModal: (type: string, props?: any) => void;
  closeModal: () => void;

  // Notifications
  notifications: SystemNotification[];
  unreadNotifsCount: number;
  markNotificationsRead: () => Promise<void>;

  // Toasts
  toasts: ToastItem[];
  showToast: (message: string, type?: ToastItem['type']) => void;

  // Data Refresh Trigger
  dataVersion: number;
  triggerRefresh: () => void;
}

const defaultTenant: Tenant = {
  id: 'tenant-bd',
  name: 'Technologies Ltd',
  code: 'TECH-BD',
  domain: 'technologies.com.bd',
  currency: 'BDT (৳)',
  timezone: 'Asia/Dhaka',
  activePlan: 'Enterprise Multi-Tier'
};

const defaultUser: User = {
  id: 'usr-1',
  tenantId: 'tenant-bd',
  name: 'Adhara Paul',
  email: 'adhara.paul@technologies.com.bd',
  role: 'Manager',
  dept: 'Workforce Operations',
  team: 'Operations Leadership',
  designation: 'Operations Lead & Workforce Specialist',
  avatar: 'AP',
  baseSalary: 85000,
  phone: '+880 1711-234567'
};

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenants, setTenants] = useState<Tenant[]>([defaultTenant]);
  const [currentTenant, setCurrentTenant] = useState<Tenant>(defaultTenant);
  const [currentRole, setCurrentRole] = useState<Role>(() => {
    return (localStorage.getItem('erp_role') as Role) || 'Manager';
  });
  const [currentUser, setCurrentUser] = useState<User>(defaultUser);
  const [activeView, setActiveView] = useState<ViewTab>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [dataVersion, setDataVersion] = useState<number>(1);

  // Timer state
  const [timer, setTimer] = useState<TimerState>({
    running: false,
    seconds: 3420, // 57 mins initial demo
    activeTaskId: 'task-1',
    activeTaskTitle: 'Priority Outlet Visit - Route 01'
  });

  // Web Idle detection state
  const [idle, setIdle] = useState<IdleState>({
    detected: false,
    idleMinutes: 1,
    thresholdSeconds: 60 // 60s for demo idle trigger
  });

  const lastActivityRef = useRef<number>(Date.now());

  // Attendance Punch state
  const [punchState, setPunchState] = useState<PunchState>({
    clockedIn: true,
    clockInTime: '09:12 AM',
    clockOutTime: null,
    status: 'Present'
  });

  // Modals & Toasts & Notifications
  const [activeModal, setActiveModal] = useState<{ type: string; props?: any } | null>(null);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);

  const showToast = useCallback((message: string, type: ToastItem['type'] = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  }, []);

  const triggerRefresh = useCallback(() => {
    setDataVersion(v => v + 1);
  }, []);

  // Fetch initial tenants & current user
  useEffect(() => {
    api.getTenants()
      .then(res => {
        setTenants(res.tenants);
        const storedTenantId = localStorage.getItem('erp_tenant') || 'tenant-bd';
        const found = res.tenants.find(t => t.id === storedTenantId) || res.tenants[0];
        setCurrentTenant(found);
      })
      .catch(() => {});

    api.getCurrentUser()
      .then(res => {
        if (res.user) {
          setCurrentUser(res.user);
        }
      })
      .catch(() => {});

    api.getNotifications()
      .then(res => setNotifications(res.notifications))
      .catch(() => {});
  }, []);

  // Switch Tenant
  const switchTenant = (tenantId: string) => {
    const target = tenants.find(t => t.id === tenantId);
    if (!target) return;
    localStorage.setItem('erp_tenant', target.id);
    setCurrentTenant(target);
    showToast(`Switched tenant context to "${target.name}". Database partitioned.`);
    triggerRefresh();
  };

  // Switch Role
  const switchRole = (role: Role) => {
    setCurrentRole(role);
    localStorage.setItem('erp_role', role);
    showToast(`Role switched to "${role}". UI and Spatie permissions scoped.`);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  // Live Timer Interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (timer.running) {
      interval = setInterval(() => {
        setTimer(prev => ({ ...prev, seconds: prev.seconds + 1 }));

        // Check Web Inactivity / Idle
        if (!idle.detected) {
          const now = Date.now();
          const idleSec = Math.floor((now - lastActivityRef.current) / 1000);
          if (idleSec >= idle.thresholdSeconds) {
            setIdle(prev => ({
              ...prev,
              detected: true,
              idleMinutes: Math.max(1, Math.floor(idleSec / 60))
            }));
          }
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timer.running, idle.detected, idle.thresholdSeconds]);

  // Activity listeners for Web Idle detection
  useEffect(() => {
    const handleUserActivity = () => {
      lastActivityRef.current = Date.now();
    };

    window.addEventListener('mousemove', handleUserActivity, { passive: true });
    window.addEventListener('keydown', handleUserActivity, { passive: true });
    window.addEventListener('scroll', handleUserActivity, { passive: true });
    window.addEventListener('click', handleUserActivity, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
    };
  }, []);

  const toggleTimer = () => {
    if (timer.running) {
      setTimer(prev => ({ ...prev, running: false }));
      showToast(`Timer paused on "${timer.activeTaskTitle}". Duration: ${formatSeconds(timer.seconds)}.`);
    } else {
      lastActivityRef.current = Date.now();
      setTimer(prev => ({ ...prev, running: true }));
      showToast(`Web timer started on "${timer.activeTaskTitle}". Idle detection active.`);
    }
  };

  const resetTimer = () => {
    setTimer(prev => ({ ...prev, seconds: 0 }));
    showToast('Timer session reset to 00:00:00.');
  };

  const selectTaskForTimer = (taskId: string, title: string) => {
    setTimer(prev => ({
      ...prev,
      activeTaskId: taskId,
      activeTaskTitle: title
    }));
  };

  const keepIdleTime = () => {
    setIdle(prev => ({ ...prev, detected: false }));
    lastActivityRef.current = Date.now();
    showToast(`Kept ${idle.idleMinutes}m of idle time in timesheet log.`);
  };

  const discardIdleTime = () => {
    const discardSeconds = idle.idleMinutes * 60;
    setTimer(prev => ({
      ...prev,
      seconds: Math.max(0, prev.seconds - discardSeconds)
    }));
    setIdle(prev => ({ ...prev, detected: false }));
    lastActivityRef.current = Date.now();
    showToast(`Discarded ${idle.idleMinutes}m idle gap from active timer session.`);
  };

  const formatSeconds = (totalSecs: number) => {
    const h = Math.floor(totalSecs / 3600);
    const m = Math.floor((totalSecs % 3600) / 60);
    const s = totalSecs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Punch actions
  const punchClockIn = async (location = 'HQ - Gulshan Office', note = 'Visiting Gulshan Route 01 outlets') => {
    try {
      const res = await api.punchAttendance('clock-in', location, note);
      setPunchState({
        clockedIn: true,
        clockInTime: res.time,
        clockOutTime: null,
        status: 'Present'
      });
      showToast(`Clocked in at ${res.time}. Status: Present.`);
      triggerRefresh();
    } catch {
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setPunchState({
        clockedIn: true,
        clockInTime: nowTime,
        clockOutTime: null,
        status: 'Present'
      });
      showToast(`Clocked in at ${nowTime}. Status: Present.`);
    }
  };

  const punchClockOut = async () => {
    try {
      const res = await api.punchAttendance('clock-out');
      setPunchState(prev => ({
        ...prev,
        clockedIn: false,
        clockOutTime: res.time,
        status: 'Clocked Out'
      }));
      showToast(`Clocked out at ${res.time}. Daily record saved.`);
      triggerRefresh();
    } catch {
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setPunchState(prev => ({
        ...prev,
        clockedIn: false,
        clockOutTime: nowTime,
        status: 'Clocked Out'
      }));
      showToast(`Clocked out at ${nowTime}. Daily record saved.`);
    }
  };

  const openModal = (type: string, props?: any) => {
    setActiveModal({ type, props });
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const markNotificationsRead = async () => {
    try {
      await api.markNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      showToast('All notifications marked as read.');
    } catch {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const unreadNotifsCount = notifications.filter(n => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        tenants,
        currentTenant,
        switchTenant,
        currentRole,
        switchRole,
        currentUser,
        activeView,
        setActiveView,
        sidebarCollapsed,
        toggleSidebar,
        timer,
        toggleTimer,
        resetTimer,
        selectTaskForTimer,
        formatSeconds,
        idle,
        keepIdleTime,
        discardIdleTime,
        punchState,
        punchClockIn,
        punchClockOut,
        activeModal,
        openModal,
        closeModal,
        notifications,
        unreadNotifsCount,
        markNotificationsRead,
        toasts,
        showToast,
        dataVersion,
        triggerRefresh
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
