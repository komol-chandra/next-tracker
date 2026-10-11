import {
  Tenant,
  User,
  Task,
  TimeEntry,
  Timesheet,
  LeaveRequest,
  LeaveBalance,
  Holiday,
  AttendanceRecord,
  MonthlyPlan,
  PayrollRecord,
  OrgDepartment,
  SpatiePermission,
  TaskPreset,
  SystemNotification,
  DashboardStats
} from '../types';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const currentTenant = localStorage.getItem('erp_tenant') || 'tenant-bd';
  const headers = {
    'Content-Type': 'application/json',
    'x-tenant-id': currentTenant,
    ...(options.headers || {})
  };

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  // Tenants & Auth
  getTenants: () => request<{ tenants: Tenant[] }>('/tenants'),
  getCurrentUser: () => request<{ user: User; tenant: Tenant }>('/auth/current-user'),

  // Dashboard Stats (Member 1: Adhara Paul)
  getDashboardStats: () => request<DashboardStats>('/dashboard/stats'),

  // Time Tracking (Member 1: Adhara Paul)
  getTimeEntries: () => request<{ entries: TimeEntry[] }>('/time/entries'),
  createTimeEntry: (data: Partial<TimeEntry>) =>
    request<{ entry: TimeEntry; updatedTask?: Task }>('/time/entries', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getTimesheets: () => request<{ timesheets: Timesheet[] }>('/time/timesheets'),
  updateTimesheetCell: (id: string, day: string, hours: number) =>
    request<{ timesheet: Timesheet }>(`/time/timesheets/${id}/cell`, {
      method: 'PUT',
      body: JSON.stringify({ day, hours })
    }),
  submitTimesheet: (id: string) =>
    request<{ timesheet: Timesheet; message: string }>(`/time/timesheets/${id}/submit`, {
      method: 'POST'
    }),
  approveTimesheet: (id: string, action: 'approve' | 'flag', remarks?: string) =>
    request<{ timesheet: Timesheet; message: string }>(`/time/timesheets/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ action, remarks })
    }),
  batchApproveTimesheets: () =>
    request<{ approvedCount: number; message: string }>('/time/timesheets/batch-approve', {
      method: 'POST'
    }),

  // Leave & Holidays (Member 1: Adhara Paul)
  getLeaves: (userId?: string) =>
    request<{ leaves: LeaveRequest[]; balance: LeaveBalance }>(
      userId ? `/leaves?userId=${userId}` : '/leaves'
    ),
  applyLeave: (data: Partial<LeaveRequest>) =>
    request<{ leave: LeaveRequest; message: string }>('/leaves/apply', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateLeaveStatus: (id: string, status: 'Approved' | 'Rejected', remarks?: string) =>
    request<{ leave: LeaveRequest; message: string }>(`/leaves/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, remarks })
    }),
  getHolidays: () => request<{ holidays: Holiday[] }>('/holidays'),
  createHoliday: (data: Partial<Holiday>) =>
    request<{ holiday: Holiday }>('/holidays', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // RBAC & Multi-Tenancy (Member 1: Adhara Paul)
  getRbacMatrix: () =>
    request<{ permissions: SpatiePermission[]; roles: string[] }>('/rbac/matrix'),
  getDepartments: () => request<{ departments: OrgDepartment[] }>('/rbac/departments'),
  createDepartment: (data: { name: string; code: string; hod: string; budget: string; initialTeam?: string }) =>
    request<{ department: OrgDepartment; message: string }>('/rbac/departments', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  createRole: (data: { name: string; guard: string; permissions: string[] }) =>
    request<{ role: any; message: string }>('/rbac/roles', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Tasks (Member 2: Anindita Ghosh Mridu)
  getTasks: (filters?: { category?: string; status?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.category) params.set('category', filters.category);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.search) params.set('search', filters.search);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return request<{ tasks: Task[] }>(`/tasks${qs}`);
  },
  createTask: (data: Partial<Task>) =>
    request<{ task: Task; message: string }>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  updateTask: (id: string, data: Partial<Task>) =>
    request<{ task: Task; message: string }>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
  deleteTask: (id: string) =>
    request<{ deleted: Task; message: string }>(`/tasks/${id}`, {
      method: 'DELETE'
    }),
  submitFullPlan: () =>
    request<{ submittedCount: number; message: string }>('/tasks/submit-plan', {
      method: 'POST'
    }),
  getTaskPresets: () => request<{ presets: TaskPreset[] }>('/task-presets'),
  createTaskPreset: (data: Partial<TaskPreset>) =>
    request<{ preset: TaskPreset; message: string }>('/task-presets', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Monthly Plans (Member 2)
  getMonthlyPlans: () => request<{ plans: MonthlyPlan[] }>('/monthly-plans'),
  createMonthlyPlan: (data: Partial<MonthlyPlan>) =>
    request<{ plan: MonthlyPlan; message: string }>('/monthly-plans', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Attendance (Member 3: Rafsan Alam Rishad)
  getAttendance: () => request<{ records: AttendanceRecord[] }>('/attendance'),
  punchAttendance: (action: 'clock-in' | 'clock-out', location?: string, note?: string) =>
    request<{ status: string; time: string; record: AttendanceRecord }>('/attendance/punch', {
      method: 'POST',
      body: JSON.stringify({ action, location, note })
    }),

  // Payroll (Member 3: Rafsan Alam Rishad)
  getPayroll: () => request<{ records: PayrollRecord[] }>('/payroll'),
  generatePayroll: () =>
    request<{ count: number; message: string }>('/payroll/generate', {
      method: 'POST'
    }),

  // Notifications
  getNotifications: () => request<{ notifications: SystemNotification[] }>('/notifications'),
  markNotificationsRead: () =>
    request<{ message: string }>('/notifications/mark-read', {
      method: 'POST'
    }),

  // Settings
  getSettings: () => request<{ settings: any }>('/settings'),
  updateSettings: (data: any) =>
    request<{ settings: any; message: string }>('/settings', {
      method: 'PUT',
      body: JSON.stringify(data)
    })
};
