import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { IdleWarningBanner } from './components/layout/IdleWarningBanner';
import { ModalRoot } from './components/modals/ModalRoot';
import { ToastContainer } from './components/common/ToastContainer';

// Views
import { DashboardView } from './views/DashboardView';
import { TimeTrackerView } from './views/TimeTrackerView';
import { LeaveManagementView } from './views/LeaveManagementView';
import { TasksView } from './views/TasksView';
import { MonthlyPlanView } from './views/MonthlyPlanView';
import { AttendanceView } from './views/AttendanceView';
import { ApprovalsView } from './views/ApprovalsView';
import { PayrollView } from './views/PayrollView';
import { ReportsView } from './views/ReportsView';
import { UserReportView } from './views/UserReportView';
import { OrgRbacView } from './views/OrgRbacView';
import { TaskPresetsView } from './views/TaskPresetsView';
import { SettingsView } from './views/SettingsView';

const MainContent: React.FC = () => {
  const { activeView } = useApp();

  return (
    <div className="flex-1 min-w-0 flex flex-col min-h-screen bg-[#f5f7f5]">
      <Topbar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        <IdleWarningBanner />

        {activeView === 'dashboard' && <DashboardView />}
        {activeView === 'timer' && <TimeTrackerView />}
        {activeView === 'leaves' && <LeaveManagementView />}
        {activeView === 'tasks' && <TasksView />}
        {activeView === 'monthly-plan' && <MonthlyPlanView />}
        {activeView === 'attendance' && <AttendanceView />}
        {activeView === 'approvals' && <ApprovalsView />}
        {activeView === 'payroll' && <PayrollView />}
        {activeView === 'reports' && <ReportsView />}
        {activeView === 'user-report' && <UserReportView />}
        {activeView === 'org-rbac' && <OrgRbacView />}
        {activeView === 'task-types' && <TaskPresetsView />}
        {activeView === 'settings' && <SettingsView />}
      </main>

      <ModalRoot />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <div className="flex min-h-screen font-sans text-slate-800 antialiased bg-[#f5f7f5]">
        <Sidebar />
        <MainContent />
      </div>
    </AppProvider>
  );
}
