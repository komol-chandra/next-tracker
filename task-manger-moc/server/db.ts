// Multi-tenant in-memory data store with MongoDB-like collections
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
  role: 'Super Admin' | 'Admin' | 'HR' | 'Manager' | 'Member';
  dept: string;
  team: string;
  designation: string;
  avatar: string;
  baseSalary: number;
  phone: string;
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
  proofAttachments?: Array<{
    id: string;
    title: string;
    fileName: string;
    type: string;
    gpsCoordinates?: string;
    geofenceStatus?: string;
    timestamp: string;
    previewUrl?: string;
  }>;
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
  dailyHours: { [key: string]: number }; // mon, tue, wed, thu, fri, sat, sun
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

// Initial Data Store
export class DatabaseStore {
  tenants: Tenant[] = [
    {
      id: 'tenant-bd',
      name: 'Technologies Ltd',
      code: 'TECH-BD',
      domain: 'technologies.com.bd',
      currency: 'BDT (৳)',
      timezone: 'Asia/Dhaka',
      activePlan: 'Enterprise Multi-Tier'
    },
    {
      id: 'apex-agency',
      name: 'Apex Digital Agency',
      code: 'APEX-AGY',
      domain: 'apexagency.io',
      currency: 'USD ($)',
      timezone: 'America/New_York',
      activePlan: 'Growth Tier'
    },
    {
      id: 'ever-global',
      name: 'Ever Global Media',
      code: 'EVER-GLB',
      domain: 'everglobal.net',
      currency: 'GBP (£)',
      timezone: 'Europe/London',
      activePlan: 'Corporate OS'
    }
  ];

  users: User[] = [
    {
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
    },
    {
      id: 'usr-2',
      tenantId: 'tenant-bd',
      name: 'Mahmud Sahiuddin',
      email: 'mahmud.s@technologies.com.bd',
      role: 'Manager',
      dept: 'Field Sales',
      team: 'Dhaka North Sales',
      designation: 'Area Sales Manager',
      avatar: 'MS',
      baseSalary: 75000,
      phone: '+880 1819-345678'
    },
    {
      id: 'usr-3',
      tenantId: 'tenant-bd',
      name: 'Ravi Kumar',
      email: 'ravi.k@technologies.com.bd',
      role: 'Member',
      dept: 'Field Sales',
      team: 'Dhaka North Sales',
      designation: 'Sales Officer (SO)',
      avatar: 'RK',
      baseSalary: 45000,
      phone: '+880 1912-456789'
    },
    {
      id: 'usr-4',
      tenantId: 'tenant-bd',
      name: 'Nadia Rahman',
      email: 'nadia.r@technologies.com.bd',
      role: 'Member',
      dept: 'Field Sales',
      team: 'Dhaka North Sales',
      designation: 'Area Sales Executive (ASE)',
      avatar: 'NR',
      baseSalary: 48000,
      phone: '+880 1613-567890'
    },
    {
      id: 'usr-5',
      tenantId: 'tenant-bd',
      name: 'Tanvir Ahmed',
      email: 'tanvir.a@technologies.com.bd',
      role: 'Admin',
      dept: 'Engineering',
      team: 'Alpha Devs',
      designation: 'Technical Lead & ERP Architect',
      avatar: 'TA',
      baseSalary: 95000,
      phone: '+880 1514-678901'
    },
    {
      id: 'usr-6',
      tenantId: 'tenant-bd',
      name: 'Sadia Islam',
      email: 'sadia.i@technologies.com.bd',
      role: 'Member',
      dept: 'Marketing',
      team: 'Growth Marketing',
      designation: 'Growth Marketing Specialist',
      avatar: 'SI',
      baseSalary: 52000,
      phone: '+880 1715-789012'
    },
    {
      id: 'usr-7',
      tenantId: 'tenant-bd',
      name: 'Anisur Rahman',
      email: 'anisur.r@technologies.com.bd',
      role: 'HR',
      dept: 'Human Resources & Payroll',
      team: 'People Operations',
      designation: 'HR & Payroll Director',
      avatar: 'AR',
      baseSalary: 88000,
      phone: '+880 1816-890123'
    }
  ];

  tasks: Task[] = [
    {
      id: 'task-1',
      tenantId: 'tenant-bd',
      title: 'Priority Outlet Visit - Route 01',
      desc: 'Cover top 25 retail outlets across Gulshan and Banani routes with shelf audits.',
      category: 'Field Visit',
      priority: 'High',
      status: 'Approved',
      due: 'Sep 15, 2026',
      progress: 85,
      hoursLogged: 14.5,
      ownerId: 'usr-2',
      ownerName: 'Mahmud Sahiuddin',
      dept: 'Field Sales',
      targetQuantity: 25,
      completedQuantity: 21,
      proofAttachments: [
        {
          id: 'proof-1',
          title: 'Retail Shelf Display Photo',
          fileName: 'IMG_GULSHAN_SHELF_01.jpg',
          type: 'image/jpeg',
          gpsCoordinates: '23.7925° N, 90.4078° E',
          geofenceStatus: 'Verified (Within 35m of outlet)',
          timestamp: '2026-09-11 10:45 AM'
        },
        {
          id: 'proof-2',
          title: 'Signed Delivery Slip',
          fileName: 'RECEIPT_BANANI_SLIP.pdf',
          type: 'application/pdf',
          gpsCoordinates: '23.7938° N, 90.4061° E',
          geofenceStatus: 'Verified with Retailer Signature',
          timestamp: '2026-09-11 11:30 AM'
        }
      ]
    },
    {
      id: 'task-2',
      tenantId: 'tenant-bd',
      title: 'Distributor Meeting - Q4 Target',
      desc: 'Finalize distributor volume quotas and closing inventory review for September.',
      category: 'Admin',
      priority: 'Medium',
      status: 'Approved',
      due: 'Sep 18, 2026',
      progress: 60,
      hoursLogged: 6.0,
      ownerId: 'usr-2',
      ownerName: 'Mahmud Sahiuddin',
      dept: 'Field Sales',
      targetQuantity: 1,
      completedQuantity: 1
    },
    {
      id: 'task-3',
      tenantId: 'tenant-bd',
      title: 'Overdue Collection Recovery',
      desc: 'Follow up retail accounts with >60 days overdue payment balances.',
      category: 'Collection',
      priority: 'Critical',
      status: 'Approved',
      due: 'Sep 22, 2026',
      progress: 40,
      hoursLogged: 8.0,
      ownerId: 'usr-2',
      ownerName: 'Mahmud Sahiuddin',
      dept: 'Field Sales',
      targetQuantity: 15,
      completedQuantity: 6
    },
    {
      id: 'task-4',
      tenantId: 'tenant-bd',
      title: 'Competitor Price Survey',
      desc: 'Collect competitor retail pricing and merchandising placement data in Uttara.',
      category: 'Sales',
      priority: 'Medium',
      status: 'Submitted',
      due: 'Sep 25, 2026',
      progress: 25,
      hoursLogged: 3.5,
      ownerId: 'usr-3',
      ownerName: 'Ravi Kumar',
      dept: 'Field Sales',
      targetQuantity: 30,
      completedQuantity: 8
    },
    {
      id: 'task-5',
      tenantId: 'tenant-bd',
      title: 'New Product Line Introduction',
      desc: 'Brief key retail trade partners on seasonal launch packages and margin tables.',
      category: 'Sales',
      priority: 'High',
      status: 'Draft',
      due: 'Sep 28, 2026',
      progress: 0,
      hoursLogged: 0,
      ownerId: 'usr-4',
      ownerName: 'Nadia Rahman',
      dept: 'Field Sales',
      targetQuantity: 20,
      completedQuantity: 0
    },
    {
      id: 'task-6',
      tenantId: 'tenant-bd',
      title: 'Dealer Merchandising Audit',
      desc: 'Inspect POS shelf visibility and branding compliance in 40 outlets.',
      category: 'Field Visit',
      priority: 'Medium',
      status: 'Approved',
      due: 'Sep 20, 2026',
      progress: 100,
      hoursLogged: 12.0,
      ownerId: 'usr-3',
      ownerName: 'Ravi Kumar',
      dept: 'Field Sales',
      targetQuantity: 40,
      completedQuantity: 40
    },
    {
      id: 'task-7',
      tenantId: 'tenant-bd',
      title: 'ERP Spatie RBAC & API Middleware Upgrade',
      desc: 'Implement Sanctum auth token refresh and tenant data isolation in Express/React.',
      category: 'Admin',
      priority: 'High',
      status: 'Approved',
      due: 'Sep 19, 2026',
      progress: 90,
      hoursLogged: 28.0,
      ownerId: 'usr-5',
      ownerName: 'Tanvir Ahmed',
      dept: 'Engineering',
      targetQuantity: 4,
      completedQuantity: 3
    }
  ];

  timeEntries: TimeEntry[] = [
    {
      id: 'te-1',
      tenantId: 'tenant-bd',
      userId: 'usr-2',
      userName: 'Mahmud Sahiuddin',
      taskId: 'task-1',
      taskTitle: 'Priority Outlet Visit - Route 01',
      date: '2026-09-11',
      startTime: '09:30 AM',
      endTime: '01:45 PM',
      durationHours: 4.25,
      category: 'Field Operational Visit',
      location: 'Gulshan Route 01 Outlets',
      notes: 'Completed 12 visits, inspected shelf facings, checked expiry dates.',
      source: 'timer',
      status: 'Approved'
    },
    {
      id: 'te-2',
      tenantId: 'tenant-bd',
      userId: 'usr-2',
      userName: 'Mahmud Sahiuddin',
      taskId: 'task-2',
      taskTitle: 'Distributor Meeting - Q4 Target',
      date: '2026-09-10',
      startTime: '02:00 PM',
      endTime: '05:00 PM',
      durationHours: 3.0,
      category: 'Distributor Reconciliation',
      location: 'Tejgaon Distributor Hub',
      notes: 'Reviewed Q4 targets and confirmed supply allotment.',
      source: 'manual',
      status: 'Approved'
    },
    {
      id: 'te-3',
      tenantId: 'tenant-bd',
      userId: 'usr-3',
      userName: 'Ravi Kumar',
      taskId: 'task-6',
      taskTitle: 'Dealer Merchandising Audit',
      date: '2026-09-11',
      startTime: '10:00 AM',
      endTime: '04:00 PM',
      durationHours: 6.0,
      category: 'Field Operational Visit',
      location: 'Mohakhali & Banani Trade Area',
      notes: 'Audit of shelf merchandising in 20 major retail stores.',
      source: 'timer',
      status: 'Submitted'
    }
  ];

  timesheets: Timesheet[] = [
    {
      id: 'ts-1',
      tenantId: 'tenant-bd',
      userId: 'usr-2',
      userName: 'Mahmud Sahiuddin',
      weekLabel: 'Week 37 (Sep 07 - Sep 13, 2026)',
      startDate: '2026-09-07',
      endDate: '2026-09-13',
      dailyHours: { mon: 7.5, tue: 8.0, wed: 7.0, thu: 8.0, fri: 4.0, sat: 0.0, sun: 0.0 },
      totalHours: 34.5,
      status: 'Draft',
      idleFlags: 0
    },
    {
      id: 'ts-2',
      tenantId: 'tenant-bd',
      userId: 'usr-5',
      userName: 'Tanvir Ahmed',
      weekLabel: 'Week 37 (Sep 07 - Sep 13, 2026)',
      startDate: '2026-09-07',
      endDate: '2026-09-13',
      dailyHours: { mon: 8.0, tue: 8.5, wed: 8.0, thu: 8.0, fri: 6.0, sat: 0.0, sun: 0.0 },
      totalHours: 38.5,
      status: 'Submitted',
      idleFlags: 0,
      submittedAt: '2026-09-11 05:40 PM'
    },
    {
      id: 'ts-3',
      tenantId: 'tenant-bd',
      userId: 'usr-3',
      userName: 'Ravi Kumar',
      weekLabel: 'Week 37 (Sep 07 - Sep 13, 2026)',
      startDate: '2026-09-07',
      endDate: '2026-09-13',
      dailyHours: { mon: 8.0, tue: 8.0, wed: 7.5, thu: 8.0, fri: 7.5, sat: 0.0, sun: 0.0 },
      totalHours: 39.0,
      status: 'Submitted',
      idleFlags: 0,
      submittedAt: '2026-09-11 06:10 PM'
    }
  ];

  leaves: LeaveRequest[] = [
    {
      id: 'leave-1',
      tenantId: 'tenant-bd',
      userId: 'usr-2',
      applicantName: 'Mahmud Sahiuddin',
      dept: 'Field Sales',
      type: 'Casual Leave',
      startDate: '2026-09-07',
      endDate: '2026-09-07',
      duration: '1 Day (Paid)',
      reason: 'Family emergency and personal appointment.',
      status: 'Approved',
      appliedAt: '2026-09-05',
      approvedBy: 'Adhara Paul (Workforce Lead)'
    },
    {
      id: 'leave-2',
      tenantId: 'tenant-bd',
      userId: 'usr-6',
      applicantName: 'Sadia Islam',
      dept: 'Marketing',
      type: 'Sick Leave',
      startDate: '2026-09-21',
      endDate: '2026-09-21',
      duration: '1 Day',
      reason: 'Severe viral fever and clinical consultation at Square Hospital.',
      status: 'Pending HR',
      appliedAt: '2026-09-10',
      certificateAttachment: 'Medical_Prescription_Sadia.pdf'
    },
    {
      id: 'leave-3',
      tenantId: 'tenant-bd',
      userId: 'usr-4',
      applicantName: 'Nadia Rahman',
      dept: 'Field Sales',
      type: 'Annual Leave',
      startDate: '2026-09-29',
      endDate: '2026-09-30',
      duration: '2 Days',
      reason: 'Scheduled vacation with prior team coverage plan.',
      status: 'Pending Manager',
      appliedAt: '2026-09-11'
    }
  ];

  leaveBalances: { [userId: string]: LeaveBalance } = {
    'usr-1': { tenantId: 'tenant-bd', userId: 'usr-1', casualTotal: 10, casualUsed: 0, sickTotal: 7, sickUsed: 0, annualTotal: 15, annualUsed: 2, unpaidUsed: 0 },
    'usr-2': { tenantId: 'tenant-bd', userId: 'usr-2', casualTotal: 10, casualUsed: 1, sickTotal: 7, sickUsed: 0, annualTotal: 15, annualUsed: 0, unpaidUsed: 0 },
    'usr-3': { tenantId: 'tenant-bd', userId: 'usr-3', casualTotal: 10, casualUsed: 0, sickTotal: 7, sickUsed: 0, annualTotal: 15, annualUsed: 1, unpaidUsed: 0 },
    'usr-4': { tenantId: 'tenant-bd', userId: 'usr-4', casualTotal: 10, casualUsed: 1, sickTotal: 7, sickUsed: 1, annualTotal: 15, annualUsed: 0, unpaidUsed: 0 },
    'usr-5': { tenantId: 'tenant-bd', userId: 'usr-5', casualTotal: 10, casualUsed: 0, sickTotal: 7, sickUsed: 0, annualTotal: 15, annualUsed: 0, unpaidUsed: 0 },
    'usr-6': { tenantId: 'tenant-bd', userId: 'usr-6', casualTotal: 10, casualUsed: 1, sickTotal: 7, sickUsed: 1, annualTotal: 15, annualUsed: 0, unpaidUsed: 0 },
    'usr-7': { tenantId: 'tenant-bd', userId: 'usr-7', casualTotal: 10, casualUsed: 0, sickTotal: 7, sickUsed: 0, annualTotal: 15, annualUsed: 0, unpaidUsed: 0 }
  };

  holidays: Holiday[] = [
    { id: 'hol-1', tenantId: 'tenant-bd', title: 'Eid-e-Miladunnabi', date: '2026-09-04', day: 'Friday', type: 'Religious', description: 'National and religious public holiday.' },
    { id: 'hol-2', tenantId: 'tenant-bd', title: 'Durga Puja (Bijoya Dashami)', date: '2026-10-20', day: 'Tuesday', type: 'Religious', description: 'Public religious holiday.' },
    { id: 'hol-3', tenantId: 'tenant-bd', title: 'National Revolution Day', date: '2026-11-07', day: 'Saturday', type: 'National', description: 'Recognized public holiday.' },
    { id: 'hol-4', tenantId: 'tenant-bd', title: 'Victory Day (Bijoy Dibos)', date: '2026-12-16', day: 'Wednesday', type: 'National', description: 'Celebration of national victory.' },
    { id: 'hol-5', tenantId: 'tenant-bd', title: 'Christmas Day', date: '2026-12-25', day: 'Friday', type: 'Religious', description: 'Public holiday celebration.' },
    { id: 'hol-6', tenantId: 'tenant-bd', title: 'International Mother Language Day', date: '2026-02-21', day: 'Saturday', type: 'National', description: 'Language movement remembrance.' }
  ];

  attendanceRecords: AttendanceRecord[] = [
    { id: 'att-1', tenantId: 'tenant-bd', userId: 'usr-2', userName: 'Mahmud Sahiuddin', date: '2026-09-11', clockIn: '09:12 AM', clockOut: undefined, duration: 'Active (5h 42m)', status: 'Present', location: 'HQ - Gulshan Office', note: 'Visiting Gulshan Route 01 outlets' },
    { id: 'att-2', tenantId: 'tenant-bd', userId: 'usr-2', userName: 'Mahmud Sahiuddin', date: '2026-09-10', clockIn: '09:05 AM', clockOut: '06:15 PM', duration: '8h 10m', status: 'Present', location: 'HQ + Outlets', note: 'Full route completed' },
    { id: 'att-3', tenantId: 'tenant-bd', userId: 'usr-2', userName: 'Mahmud Sahiuddin', date: '2026-09-09', clockIn: '09:15 AM', clockOut: '06:00 PM', duration: '7h 45m', status: 'Present', location: 'Client Site', note: 'Distributor reconciliation' },
    { id: 'att-4', tenantId: 'tenant-bd', userId: 'usr-2', userName: 'Mahmud Sahiuddin', date: '2026-09-08', clockIn: '09:00 AM', clockOut: '06:30 PM', duration: '8h 30m', status: 'Present', location: 'Field Area', note: 'Uttara retail coverage' },
    { id: 'att-5', tenantId: 'tenant-bd', userId: 'usr-2', userName: 'Mahmud Sahiuddin', date: '2026-09-07', clockIn: '--', clockOut: '--', duration: '0h', status: 'Leave', location: 'Remote', note: 'Approved Casual Leave' },
    { id: 'att-6', tenantId: 'tenant-bd', userId: 'usr-3', userName: 'Ravi Kumar', date: '2026-09-11', clockIn: '10:15 AM', clockOut: undefined, duration: 'Active (4h 39m)', status: 'Late', location: 'Field Area', note: 'Traffic on Airport road' },
    { id: 'att-7', tenantId: 'tenant-bd', userId: 'usr-5', userName: 'Tanvir Ahmed', date: '2026-09-11', clockIn: '08:55 AM', clockOut: undefined, duration: 'Active (6h 00m)', status: 'Present', location: 'HQ Development Wing', note: 'Sprint delivery' }
  ];

  monthlyPlans: MonthlyPlan[] = [
    {
      id: 'plan-1',
      tenantId: 'tenant-bd',
      team: 'Dhaka North Sales',
      dept: 'Field Sales',
      targetObjective: '450 Retail Outlets + ৳1.8M Collection Target',
      repsCount: '5 Reps',
      tasksCount: 32,
      targetQuantity: '450 visits',
      progressRollup: 84,
      status: 'Approved',
      monthCycle: 'September 2026',
      operationalNotes: 'Key focus on high-turnover retailers in Gulshan, Banani, and Baridhara zones.'
    },
    {
      id: 'plan-2',
      tenantId: 'tenant-bd',
      team: 'Chittagong Field Team',
      dept: 'Field Sales',
      targetObjective: '280 Outlets + ৳1.2M Collection Target',
      repsCount: '4 Reps',
      tasksCount: 24,
      targetQuantity: '280 visits',
      progressRollup: 72,
      status: 'Approved',
      monthCycle: 'September 2026',
      operationalNotes: 'Cover Agrabad, GEC circle, and Nasirabad commercial corridors.'
    },
    {
      id: 'plan-3',
      tenantId: 'tenant-bd',
      team: 'Alpha Devs (Engineering)',
      dept: 'Engineering',
      targetObjective: 'Deliver v1 Web Timer + Spatie RBAC Architecture',
      repsCount: '4 Devs',
      tasksCount: 18,
      targetQuantity: '4 sprints',
      progressRollup: 90,
      status: 'In Progress',
      monthCycle: 'September 2026',
      operationalNotes: 'Zero-latency sync and browser idle detector integration.'
    },
    {
      id: 'plan-4',
      tenantId: 'tenant-bd',
      team: 'Growth Marketing',
      dept: 'Marketing',
      targetObjective: 'Launch Q4 Seasonal Retail Promo & Merchandising Kits',
      repsCount: '3 Reps',
      tasksCount: 12,
      targetQuantity: '1 Campaign',
      progressRollup: 65,
      status: 'Submitted',
      monthCycle: 'September 2026',
      operationalNotes: 'Coordinate with field team on POS shelf materials.'
    }
  ];

  payrollRecords: PayrollRecord[] = [
    {
      id: 'pay-1',
      tenantId: 'tenant-bd',
      userId: 'usr-1',
      employeeName: 'Adhara Paul',
      empCode: 'EMP-2026-001',
      dept: 'Workforce Operations',
      role: 'Operations Lead & Member 1',
      baseSalary: 85000,
      presentDays: 22,
      absentDays: 0,
      leaveDays: 0,
      bonus: 15000,
      deductions: 2500,
      netSalary: 97500,
      status: 'Calculated',
      month: 'September 2026',
      paymentMethod: 'Bank Direct Transfer'
    },
    {
      id: 'pay-2',
      tenantId: 'tenant-bd',
      userId: 'usr-2',
      employeeName: 'Mahmud Sahiuddin',
      empCode: 'EMP-2026-002',
      dept: 'Field Sales',
      role: 'Manager',
      baseSalary: 75000,
      presentDays: 20,
      absentDays: 0,
      leaveDays: 1,
      bonus: 12000,
      deductions: 1600,
      netSalary: 85400,
      status: 'Calculated',
      month: 'September 2026',
      paymentMethod: 'City Bank (Acc: **** 8842)'
    },
    {
      id: 'pay-3',
      tenantId: 'tenant-bd',
      userId: 'usr-3',
      employeeName: 'Ravi Kumar',
      empCode: 'EMP-2026-003',
      dept: 'Field Sales',
      role: 'Sales Officer (SO)',
      baseSalary: 45000,
      presentDays: 19,
      absentDays: 1,
      leaveDays: 0,
      bonus: 5000,
      deductions: 2500,
      netSalary: 47500,
      status: 'Calculated',
      month: 'September 2026',
      paymentMethod: 'BRAC Bank'
    },
    {
      id: 'pay-4',
      tenantId: 'tenant-bd',
      userId: 'usr-4',
      employeeName: 'Nadia Rahman',
      empCode: 'EMP-2026-004',
      dept: 'Field Sales',
      role: 'Area Sales Exec (ASE)',
      baseSalary: 48000,
      presentDays: 20,
      absentDays: 0,
      leaveDays: 2,
      bonus: 6500,
      deductions: 1200,
      netSalary: 53300,
      status: 'Calculated',
      month: 'September 2026',
      paymentMethod: 'Eastern Bank'
    },
    {
      id: 'pay-5',
      tenantId: 'tenant-bd',
      userId: 'usr-5',
      employeeName: 'Tanvir Ahmed',
      empCode: 'EMP-2026-005',
      dept: 'Engineering',
      role: 'Technical Lead',
      baseSalary: 95000,
      presentDays: 21,
      absentDays: 0,
      leaveDays: 0,
      bonus: 16000,
      deductions: 2200,
      netSalary: 108800,
      status: 'Calculated',
      month: 'September 2026',
      paymentMethod: 'Dutch-Bangla Bank'
    },
    {
      id: 'pay-6',
      tenantId: 'tenant-bd',
      userId: 'usr-6',
      employeeName: 'Sadia Islam',
      empCode: 'EMP-2026-006',
      dept: 'Marketing',
      role: 'Growth Marketing',
      baseSalary: 52000,
      presentDays: 18,
      absentDays: 2,
      leaveDays: 1,
      bonus: 4000,
      deductions: 4467,
      netSalary: 51533,
      status: 'Calculated',
      month: 'September 2026',
      paymentMethod: 'Mutual Trust Bank'
    }
  ];

  departments: OrgDepartment[] = [
    {
      name: 'Field Sales',
      code: 'FS',
      hod: 'Mahmud Sahiuddin (Manager)',
      budget: '৳ 1,200,000',
      teams: [
        {
          name: 'Dhaka North Sales',
          lead: 'Mahmud Sahiuddin',
          members: ['Ravi Kumar (Sales Officer)', 'Nadia Rahman (Area Sales Exec)']
        },
        {
          name: 'Chittagong Sales',
          lead: 'Farhan Ali',
          members: ['Zubair Hasan (Territory Officer)', 'Tasnim Ara (Merchandiser)']
        }
      ]
    },
    {
      name: 'Workforce Operations',
      code: 'OPS',
      hod: 'Adhara Paul (Workforce Lead)',
      budget: '৳ 800,000',
      teams: [
        {
          name: 'Operations Leadership',
          lead: 'Adhara Paul',
          members: ['Zahir Hossain (Time Audit Officer)', 'Farhana Yasmin (Leave Specialist)']
        }
      ]
    },
    {
      name: 'Engineering',
      code: 'ENG',
      hod: 'Tanvir Ahmed (Tech Lead)',
      budget: '৳ 950,000',
      teams: [
        {
          name: 'Alpha Devs',
          lead: 'Tanvir Ahmed',
          members: ['Raihan Kabir (Frontend UI)', 'Sumaiya Noor (Backend & Database)']
        }
      ]
    },
    {
      name: 'Marketing',
      code: 'MKT',
      hod: 'Sadia Islam (Marketing Lead)',
      budget: '৳ 450,000',
      teams: [
        {
          name: 'Growth Marketing',
          lead: 'Sadia Islam',
          members: ['Kamrul Ahsan (Digital Campaigns)']
        }
      ]
    },
    {
      name: 'Human Resources & Payroll',
      code: 'HR',
      hod: 'Anisur Rahman (HR Director)',
      budget: '৳ 350,000',
      teams: [
        {
          name: 'People Operations',
          lead: 'Anisur Rahman',
          members: ['Fatima Khan (Payroll Officer)']
        }
      ]
    }
  ];

  spatiePermissions: SpatiePermission[] = [
    { perm: 'dashboard.view_stats', name: 'View Executive Dashboard & Headcount', module: 'Dashboard', admin: true, hr: true, manager: true, member: true },
    { perm: 'dashboard.payroll_overview', name: 'View Payroll Disbursal Totals', module: 'Dashboard', admin: true, hr: true, manager: false, member: false },
    { perm: 'timelog.record', name: 'Start/Stop Web Timer with Idle Detection', module: 'Time Tracking', admin: true, hr: true, manager: true, member: true },
    { perm: 'timelog.manual_entry', name: 'Submit Manual Time Entries', module: 'Time Tracking', admin: true, hr: true, manager: true, member: true },
    { perm: 'timelog.approve', name: 'Inspect & Approve Team Timesheets', module: 'Time Tracking', admin: true, hr: false, manager: true, member: false },
    { perm: 'leave.request', name: 'Apply For Leave & Check Balances', module: 'Leave & Holiday', admin: true, hr: true, manager: true, member: true },
    { perm: 'leave.approve', name: 'Authorize Paid & Sick Leaves', module: 'Leave & Holiday', admin: true, hr: true, manager: true, member: false },
    { perm: 'holiday.manage', name: 'Configure National & Company Holidays', module: 'Leave & Holiday', admin: true, hr: true, manager: false, member: false },
    { perm: 'tasks.create', name: 'Create Monthly Plan Tasks', module: 'Tasks', admin: true, hr: false, manager: true, member: true },
    { perm: 'tasks.approve', name: 'Approve Subordinate Plan Tasks', module: 'Tasks', admin: true, hr: false, manager: true, member: false },
    { perm: 'attendance.punch', name: 'Daily Clock In / Clock Out', module: 'Attendance', admin: true, hr: true, manager: true, member: true },
    { perm: 'attendance.manage', name: 'Manage Company Attendance Logs', module: 'Attendance', admin: true, hr: true, manager: false, member: false },
    { perm: 'monthly_plan.manage', name: 'Set Team Strategic Targets & Quotas', module: 'Monthly Planning', admin: true, hr: false, manager: true, member: false },
    { perm: 'payroll.view_own', name: 'View & Print Own Payslip', module: 'Payroll', admin: true, hr: true, manager: true, member: true },
    { perm: 'payroll.process', name: 'Execute Monthly Payroll & Deductions', module: 'Payroll', admin: true, hr: true, manager: false, member: false },
    { perm: 'org.manage', name: 'Manage Multi-Tenant Depts, Teams & RBAC', module: 'Administration', admin: true, hr: false, manager: false, member: false }
  ];

  taskPresets: TaskPreset[] = [
    { id: 'pre-1', name: 'Priority Outlet Coverage', category: 'Field Visit', freq: 'Daily', target: 25, role: 'SO, ASE', proofType: 'GPS Geofence + Photo', status: 'Published' },
    { id: 'pre-2', name: 'Dealer Point Review', category: 'Field Visit', freq: 'Daily', target: 1, role: 'ASM, SO', proofType: 'Signed Order Slip', status: 'Published' },
    { id: 'pre-3', name: 'Weekly Sales Analysis', category: 'Sales', freq: 'Weekly', target: 1, role: 'All Field Roles', proofType: 'CRM Metric Sheet', status: 'Published' },
    { id: 'pre-4', name: 'Distributor Executive Meeting', category: 'Admin', freq: 'Monthly', target: 1, role: 'Manager, ASM', proofType: 'Meeting Minutes', status: 'Published' },
    { id: 'pre-5', name: 'Route Optimization Survey', category: 'Field Visit', freq: 'Monthly', target: 1, role: 'Supervisor', proofType: 'GPS Route Map', status: 'Published' },
    { id: 'pre-6', name: 'Retail POS Merchandising Audit', category: 'Field Visit', freq: 'Weekly', target: 30, role: 'Merchandiser', proofType: 'Shelf Facings Photo', status: 'Published' }
  ];

  notifications: SystemNotification[] = [
    { id: 'notif-1', tenantId: 'tenant-bd', title: 'Timesheet Pending Approval', message: 'Tanvir Ahmed submitted Week 37 timesheet (38.5 hrs) for manager approval.', category: 'timesheet', timestamp: '10 mins ago', read: false, linkTab: 'approvals' },
    { id: 'notif-2', tenantId: 'tenant-bd', title: 'Monthly Plan Awaiting Review', message: 'Ravi Kumar submitted September Monthly Plan with 12 assigned field tasks.', category: 'plan', timestamp: '1 hour ago', read: false, linkTab: 'approvals' },
    { id: 'notif-3', tenantId: 'tenant-bd', title: 'Leave Application Filed', message: 'Sadia Islam requested 1-Day Sick Leave for Sep 21 with medical slip.', category: 'leave', timestamp: '3 hours ago', read: false, linkTab: 'approvals' },
    { id: 'notif-4', tenantId: 'tenant-bd', title: 'Web Idle Detection Active', message: 'Browser idle detection is actively monitoring timer sessions. Zero unverified idle gaps.', category: 'security', timestamp: 'Today', read: true, linkTab: 'timer' }
  ];

  settings = {
    idleThresholdSeconds: 60, // 1 min for demo or 300 for 5m
    defaultWorkingHours: 8,
    monthlySubmissionDeadline: 'Day 25 of every month',
    approvalWindowCloses: 'Day 28 of every month',
    deductionFormula: 'Daily Rate = Base Salary / 30; Deduction = Daily Rate * Unapproved Absent Days',
    overtimeRateMultiplier: 1.5
  };
}

// Singleton database instance
export const db = new DatabaseStore();
