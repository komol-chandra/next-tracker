export type Role = 'Super Admin' | 'Admin' | 'HR' | 'Manager' | 'Member';

export interface Tenant {
  id: string;
  name: string;
  code: string;
  domain: string;
  currency: string;
  timezone: string;
  activePlan: string;
}

export interface User {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  role: Role;
  dept: string;
  team: string;
  designation: string;
  avatar: string;
  baseSalary: number;
  phone: string;
}

export interface ProofAttachment {
  id: string;
  title: string;
  fileName: string;
  type: string;
  gpsCoordinates?: string;
  geofenceStatus?: string;
  timestamp: string;
  previewUrl?: string;
}

export interface Task {
  id: string;
  tenantId: string;
  title: string;
  desc: string;
  category: 'Field Visit' | 'Sales' | 'Collection' | 'Admin' | 'Service';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
  due: string;
  progress: number;
  hoursLogged: number;
  ownerId: string;
  ownerName: string;
  dept: string;
  targetQuantity?: number;
  completedQuantity?: number;
  proofAttachments?: ProofAttachment[];
}

export interface TimeEntry {
  id: string;
  tenantId: string;
  userId: string;
  userName: string;
  taskId: string;
  taskTitle: string;
  date: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  category: string;
  location: string;
  notes: string;
  idleTimeMinutes?: number;
  idleAction?: 'kept' | 'discarded';
  source: 'timer' | 'manual';
  status: 'Draft' | 'Submitted' | 'Approved';
}

export interface Timesheet {
  id: string;
  tenantId: string;
  userId: string;
  userName: string;
  weekLabel: string;
  startDate: string;
  endDate: string;
  dailyHours: { [key: string]: number };
  totalHours: number;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Flagged';
  idleFlags: number;
  submittedAt?: string;
  approvedBy?: string;
}

export interface LeaveRequest {
  id: string;
  tenantId: string;
  userId: string;
  applicantName: string;
  dept: string;
  type: 'Casual Leave' | 'Sick Leave' | 'Annual Leave' | 'Unpaid Leave';
  startDate: string;
  endDate: string;
  duration: string;
  reason: string;
  status: 'Pending Manager' | 'Pending HR' | 'Approved' | 'Rejected';
  appliedAt: string;
  approvedBy?: string;
  remarks?: string;
  certificateAttachment?: string;
}

export interface LeaveBalance {
  tenantId: string;
  userId: string;
  casualTotal: number;
  casualUsed: number;
  sickTotal: number;
  sickUsed: number;
  annualTotal: number;
  annualUsed: number;
  unpaidUsed: number;
}

export interface Holiday {
  id: string;
  tenantId: string;
  title: string;
  date: string;
  day: string;
  type: 'National' | 'Religious' | 'Company';
  description: string;
}

export interface AttendanceRecord {
  id: string;
  tenantId: string;
  userId: string;
  userName: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  duration: string;
  status: 'Present' | 'Late' | 'Absent' | 'Half-Day' | 'Leave';
  location: string;
  note: string;
}

export interface MonthlyPlan {
  id: string;
  tenantId: string;
  team: string;
  dept: string;
  targetObjective: string;
  repsCount: string;
  tasksCount: number;
  targetQuantity: string;
  progressRollup: number;
  status: 'In Progress' | 'Submitted' | 'Approved' | 'Under Revision';
  monthCycle: string;
  operationalNotes?: string;
}

export interface PayrollRecord {
  id: string;
  tenantId: string;
  userId: string;
  employeeName: string;
  empCode: string;
  dept: string;
  role: string;
  baseSalary: number;
  presentDays: number;
  absentDays: number;
  leaveDays: number;
  bonus: number;
  deductions: number;
  netSalary: number;
  status: 'Draft' | 'Calculated' | 'Disbursed';
  month: string;
  paymentMethod?: string;
}

export interface OrgDepartment {
  name: string;
  code: string;
  hod: string;
  budget: string;
  teams: Array<{
    name: string;
    lead: string;
    members: string[];
  }>;
}

export interface SpatiePermission {
  perm: string;
  name: string;
  module: string;
  admin: boolean;
  hr: boolean;
  manager: boolean;
  member: boolean;
}

export interface TaskPreset {
  id: string;
  name: string;
  category: 'Field Visit' | 'Sales' | 'Collection' | 'Admin' | 'Service';
  freq: 'Daily' | 'Weekly' | 'Monthly' | 'Quarterly';
  target: number;
  role: string;
  proofType: string;
  status: 'Published' | 'Draft';
}

export interface SystemNotification {
  id: string;
  tenantId: string;
  title: string;
  message: string;
  category: 'timesheet' | 'plan' | 'leave' | 'attendance' | 'payroll' | 'security';
  timestamp: string;
  read: boolean;
  linkTab?: string;
}

export interface DashboardStats {
  employeeCount: number;
  activeTasksCount: number;
  totalTasksCount: number;
  taskCompletionRate: number;
  attendanceSummary: {
    clockedInCount: number;
    totalHeadcount: number;
    onLeaveCount: number;
    lateCount: number;
    attendanceRate: string;
  };
  payrollOverview: {
    grossTotal: number;
    deductionsTotal: number;
    bonusesTotal: number;
    netPayable: number;
    status: string;
    currency: string;
  };
  workforceStatistics: {
    totalLoggedHours: number;
    activeTimersCount: number;
    avgPlanProgress: number;
    pendingApprovalsCount: number;
    departmentBreakdown: Array<{
      name: string;
      count: number;
      hours: number;
      progress: number;
    }>;
  };
}

export type ViewTab =
  | 'dashboard'
  | 'timer'
  | 'leaves'
  | 'tasks'
  | 'monthly-plan'
  | 'attendance'
  | 'approvals'
  | 'payroll'
  | 'reports'
  | 'user-report'
  | 'org-rbac'
  | 'task-types'
  | 'settings';
