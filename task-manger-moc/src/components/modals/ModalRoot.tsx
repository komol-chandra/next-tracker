import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  X,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Download,
  Calendar,
  MapPin,
  FileText,
  Building2,
  Users,
  Shield,
  Send,
  Trash2
} from 'lucide-react';

export const ModalRoot: React.FC = () => {
  const {
    activeModal,
    closeModal,
    showToast,
    punchState,
    punchClockIn,
    punchClockOut,
    currentUser,
    currentTenant,
    selectTaskForTimer,
    setActiveView,
    triggerRefresh,
    notifications,
    markNotificationsRead
  } = useApp();

  // State for interactive simulator in salary structure modal
  const [simGross, setSimGross] = useState<number>(75000);
  const [simAbsent, setSimAbsent] = useState<number>(1);

  if (!activeModal) return null;

  const { type, props = {} } = activeModal;

  // Helper for closing on background click
  const handleBgClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) closeModal();
  };

  return (
    <div
      onClick={handleBgClick}
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* MODAL 1: ATTENDANCE CLOCK IN / OUT */}
        {type === 'clock' && (
          <>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Attendance Punch Register</h2>
                <p className="text-xs text-slate-400">Daily clock record for payroll attendance</p>
              </div>
              <button onClick={closeModal} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-4xl font-black text-emerald-800 font-mono tracking-tight">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-xs text-slate-500 mt-1">Friday, 11 September 2026</div>
                <div className="mt-2.5">
                  <span
                    className={`text-[11px] font-extrabold px-3 py-1 rounded-full ${
                      punchState.clockedIn
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    Current Status: {punchState.clockedIn ? 'Clocked In' : 'Clocked Out'}
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Work Location</label>
                <select
                  id="punch-loc-select"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-none focus:border-emerald-600"
                  defaultValue="Headquarters (HQ) - Gulshan Office"
                >
                  <option>Headquarters (HQ) - Gulshan Office</option>
                  <option>Ex-HQ / Client Site</option>
                  <option>Remote / Work from Home</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Daily Activity Note / Route</label>
                <input
                  id="punch-note-input"
                  type="text"
                  defaultValue="Visiting Gulshan Route 01 outlets"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
              <button
                onClick={closeModal}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              {punchState.clockedIn ? (
                <button
                  onClick={async () => {
                    await punchClockOut();
                    closeModal();
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  Clock Out (End Workday)
                </button>
              ) : (
                <button
                  onClick={async () => {
                    const loc = (document.getElementById('punch-loc-select') as HTMLSelectElement)?.value;
                    const note = (document.getElementById('punch-note-input') as HTMLInputElement)?.value;
                    await punchClockIn(loc, note);
                    closeModal();
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer shadow-xs"
                >
                  Clock In (Begin Workday)
                </button>
              )}
            </div>
          </>
        )}

        {/* MODAL 2: ADD NEW TASK */}
        {type === 'newTask' && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const data = new FormData(form);
              await api.createTask({
                title: data.get('title') as string,
                desc: data.get('desc') as string,
                category: data.get('category') as any,
                priority: data.get('priority') as any,
                due: data.get('due') as string,
                targetQuantity: parseInt(data.get('targetQuantity') as string) || 25
              });
              showToast('Task added to monthly draft plan!');
              triggerRefresh();
              closeModal();
            }}
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Add Monthly Plan Task</h2>
                <p className="text-xs text-slate-400">Propose new objective or select master preset</p>
              </div>
              <button type="button" onClick={closeModal} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Task Title *</label>
                <input
                  name="title"
                  required
                  placeholder="E.g. Outlet Audit Gulshan Route 02"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    name="category"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-none focus:border-emerald-600"
                  >
                    <option>Field Visit</option>
                    <option>Sales</option>
                    <option>Collection</option>
                    <option>Admin</option>
                    <option>Service</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Priority *</label>
                  <select
                    name="priority"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-none focus:border-emerald-600"
                  >
                    <option>Medium</option>
                    <option>High</option>
                    <option>Critical</option>
                    <option>Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Due Date *</label>
                  <input
                    name="due"
                    type="date"
                    defaultValue="2026-09-24"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Quantity</label>
                  <input
                    name="targetQuantity"
                    type="number"
                    defaultValue={25}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Objective & Expected Outcome</label>
                <textarea
                  name="desc"
                  placeholder="Details of the proposed field assignment..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={closeModal}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Add to Monthly Plan
              </button>
            </div>
          </form>
        )}

        {/* MODAL 3: TASK DETAIL */}
        {type === 'taskDetail' && props.task && (
          <>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">{props.task.title}</h2>
                <p className="text-xs text-slate-400">Assigned Rep: {props.task.ownerName}</p>
              </div>
              <button onClick={closeModal} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Category</span>
                  <span className="font-extrabold text-slate-800">{props.task.category}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Priority</span>
                  <span className="font-extrabold text-slate-800">{props.task.priority}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Status</span>
                  <span className="font-extrabold text-emerald-800">{props.task.status}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Hours Logged</span>
                  <span className="font-extrabold text-slate-800">{props.task.hoursLogged} hrs</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Description</span>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {props.task.desc}
                </p>
              </div>
            </div>

            <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-2.5">
              <button
                onClick={() => {
                  selectTaskForTimer(props.task.id, props.task.title);
                  closeModal();
                  setActiveView('timer');
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Clock size={13} />
                <span>Track Time On This Task</span>
              </button>
              <button
                onClick={closeModal}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
            </div>
          </>
        )}

        {/* MODAL 4: MANUAL TIME ENTRY */}
        {type === 'manualTime' && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const data = new FormData(form);
              await api.createTimeEntry({
                taskId: data.get('taskId') as string,
                date: data.get('date') as string,
                durationHours: parseFloat(data.get('durationHours') as string) || 1.0,
                startTime: data.get('startTime') as string,
                endTime: data.get('endTime') as string,
                category: data.get('category') as string,
                location: data.get('location') as string,
                notes: data.get('notes') as string,
                source: 'manual'
              });
              showToast('Manual time entry logged successfully!');
              triggerRefresh();
              closeModal();
            }}
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Log Manual Time Entry</h2>
                <p className="text-xs text-slate-400">Add audited hours directly to timesheet</p>
              </div>
              <button type="button" onClick={closeModal} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Work Date *</label>
                  <input
                    name="date"
                    type="date"
                    defaultValue="2026-09-11"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duration (Hours) *</label>
                  <input
                    name="durationHours"
                    type="number"
                    step="0.25"
                    defaultValue={2.5}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Time</label>
                  <input
                    name="startTime"
                    defaultValue="10:00 AM"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Time</label>
                  <input
                    name="endTime"
                    defaultValue="12:30 PM"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Location / Route</label>
                <input
                  name="location"
                  defaultValue="Gulshan Route 02 Outlets"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description & Work Accomplished *</label>
                <textarea
                  name="notes"
                  rows={3}
                  defaultValue="Executed routine retail shelf check and resolved delivery discrepancy."
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={closeModal}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Save Time Entry
              </button>
            </div>
          </form>
        )}

        {/* MODAL 5: APPLY LEAVE */}
        {type === 'applyLeave' && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const data = new FormData(form);
              await api.applyLeave({
                type: data.get('type') as any,
                startDate: data.get('startDate') as string,
                endDate: data.get('endDate') as string,
                duration: data.get('duration') as string,
                reason: data.get('reason') as string,
                applicantName: currentUser.name,
                dept: currentUser.dept
              });
              showToast('Leave application submitted to Manager and HR!');
              triggerRefresh();
              closeModal();
            }}
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Submit Leave Application</h2>
                <p className="text-xs text-slate-400">Apply for paid casual, sick, or annual leave</p>
              </div>
              <button type="button" onClick={closeModal} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Leave Type *</label>
                  <select
                    name="type"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-none focus:border-emerald-600"
                  >
                    <option>Casual Leave (Paid)</option>
                    <option>Sick Leave (Medical)</option>
                    <option>Annual Leave (Paid)</option>
                    <option>Unpaid Leave / LOP</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duration *</label>
                  <select
                    name="duration"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-none focus:border-emerald-600"
                  >
                    <option>1 Day</option>
                    <option>2 Days</option>
                    <option>Half Day (First Half)</option>
                    <option>Half Day (Second Half)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Date *</label>
                  <input
                    name="startDate"
                    type="date"
                    defaultValue="2026-09-18"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Date *</label>
                  <input
                    name="endDate"
                    type="date"
                    defaultValue="2026-09-18"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Leave *</label>
                <textarea
                  name="reason"
                  rows={3}
                  required
                  placeholder="State detailed reason for manager and HR review..."
                  defaultValue="Personal family appointment and route hand-off."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={closeModal}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Submit Application
              </button>
            </div>
          </form>
        )}

        {/* MODAL 6: PAYSLIP VIEWER & PRINT */}
        {type === 'payslip' && props.emp && (
          <>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Employee Payslip &mdash; September 2026
                </h2>
                <p className="text-xs text-slate-400">Confidential Disbursal Document</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
                >
                  <Printer size={13} />
                  <span>Print / PDF</span>
                </button>
                <button onClick={closeModal} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer">
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs overflow-y-auto">
              <div className="p-4 border-b-2 border-emerald-700 flex justify-between items-start">
                <div>
                  <div className="text-lg font-black text-slate-900">Technologies Ltd</div>
                  <div className="text-slate-500">Plot 12, Gulshan Avenue, Dhaka-1212</div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-emerald-800 uppercase tracking-wider">
                    CONFIDENTIAL PAYSLIP
                  </div>
                  <div className="text-slate-400 text-[11px]">Pay Period: September 2026</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-200">
                <div className="space-y-1">
                  <div>Employee Name: <b>{props.emp.employeeName}</b></div>
                  <div>Employee ID: <b>{props.emp.empCode}</b></div>
                  <div>Department: <b>{props.emp.dept}</b></div>
                </div>
                <div className="space-y-1">
                  <div>Role: <b>{props.emp.role}</b></div>
                  <div>Present Days: <b>{props.emp.presentDays}</b> / 22 Days</div>
                  <div>Approved Leaves: <b>{props.emp.leaveDays}</b> Day(s)</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="font-extrabold text-emerald-800 border-b border-slate-200 pb-1 mb-2">
                    Earnings
                  </div>
                  <div className="space-y-1.5 text-slate-700">
                    <div className="flex justify-between">
                      <span>Basic Salary (60%):</span>
                      <b>৳ {(props.emp.baseSalary * 0.6).toLocaleString()}</b>
                    </div>
                    <div className="flex justify-between">
                      <span>House Rent Allowance (25%):</span>
                      <b>৳ {(props.emp.baseSalary * 0.25).toLocaleString()}</b>
                    </div>
                    <div className="flex justify-between">
                      <span>Conveyance & Medical (15%):</span>
                      <b>৳ {(props.emp.baseSalary * 0.15).toLocaleString()}</b>
                    </div>
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Performance Bonus:</span>
                      <b>+ ৳ {props.emp.bonus.toLocaleString()}</b>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="font-extrabold text-rose-800 border-b border-slate-200 pb-1 mb-2">
                    Deductions
                  </div>
                  <div className="space-y-1.5 text-slate-700">
                    <div className="flex justify-between">
                      <span>Provident Fund (8.33%):</span>
                      <b>৳ {(props.emp.deductions * 0.5).toFixed(0)}</b>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax Withholding:</span>
                      <b>৳ {(props.emp.deductions * 0.3).toFixed(0)}</b>
                    </div>
                    <div className="flex justify-between text-rose-600 font-bold">
                      <span>Absence / Unpaid Penalty:</span>
                      <b>- ৳ {(props.emp.deductions * 0.2).toFixed(0)}</b>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between mt-3">
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                    Net Take-Home Salary
                  </div>
                  <div className="text-2xl font-black text-emerald-950">
                    ৳ {props.emp.netSalary.toLocaleString()}
                  </div>
                </div>
                <div className="text-right text-[11px] text-slate-500 font-semibold">
                  <span>Authorized by HR System</span>
                  <br />
                  <span className="text-emerald-700 font-bold">✓ Direct Bank Transfer Ready</span>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-900 cursor-pointer"
              >
                Close Payslip
              </button>
            </div>
          </>
        )}

        {/* MODAL 7: SALARY STRUCTURE SIMULATOR */}
        {type === 'salaryStructure' && (
          <>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Salary Structure & Deduction Simulator
                </h2>
                <p className="text-xs text-slate-400">Statutory breakdown rules and live calculator</p>
              </div>
              <button onClick={closeModal} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 text-slate-700">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="font-extrabold text-emerald-900 mb-1">Earnings Components</div>
                  <div>&bull; Basic Salary: <b>60% of Gross</b></div>
                  <div>&bull; House Rent (HRA): <b>25% of Gross</b></div>
                  <div>&bull; Conveyance: <b>15% of Gross</b></div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="font-extrabold text-rose-900 mb-1">Deduction Rules</div>
                  <div>&bull; Provident Fund: <b>8.33% Basic</b></div>
                  <div>&bull; Absence: <b>(Basic / 30) &times; Days</b></div>
                </div>
              </div>

              <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl space-y-3">
                <div className="font-extrabold text-slate-900">Interactive Salary Simulator</div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Test Gross Salary (৳)</label>
                    <input
                      type="number"
                      value={simGross}
                      onChange={(e) => setSimGross(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 font-bold text-slate-800 outline-none focus:border-emerald-600"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Unpaid Absent Days</label>
                    <input
                      type="number"
                      value={simAbsent}
                      min={0}
                      max={30}
                      onChange={(e) => setSimAbsent(parseFloat(e.target.value) || 0)}
                      className="w-full bg-white border border-slate-200 rounded-xl p-2 font-bold text-slate-800 outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                {/* Live calculated outputs */}
                <div className="p-3 bg-white border border-slate-200 rounded-xl grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Calculated Basic</div>
                    <div className="font-extrabold text-slate-900 text-sm mt-0.5">
                      ৳ {(simGross * 0.6).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Absence Penalty</div>
                    <div className="font-extrabold text-rose-600 text-sm mt-0.5">
                      - ৳ {Math.round(((simGross * 0.6) / 30) * simAbsent).toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Estimated Net</div>
                    <div className="font-black text-emerald-800 text-sm mt-0.5">
                      ৳ {Math.round(simGross - ((simGross * 0.6) / 30) * simAbsent).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 cursor-pointer shadow-xs"
              >
                Save & Apply Rules
              </button>
            </div>
          </>
        )}

        {/* MODAL 8: VISIT PROOF ATTACHMENTS */}
        {type === 'attachmentPreview' && (
          <>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Visit Verification Proofs
                </h2>
                <p className="text-xs text-slate-400">
                  Rep: {props.user || 'Mahmud Sahiuddin'} &middot; Task: {props.taskTitle || 'Outlet Visit'}
                </p>
              </div>
              <button onClick={closeModal} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  <div className="h-32 bg-gradient-to-br from-emerald-900 to-teal-950 text-white flex flex-col items-center justify-center p-3 text-center">
                    <span className="text-3xl mb-1">🏪</span>
                    <span className="font-bold text-xs">Retail Shelf Facings Photo</span>
                    <span className="text-[10px] text-emerald-300 mt-1">
                      GPS: 23.7925&deg; N, 90.4078&deg; E
                    </span>
                  </div>
                  <div className="p-2.5 bg-white border-t border-slate-200 space-y-1">
                    <div className="font-bold text-slate-900">IMG_20260911_01.jpg</div>
                    <div className="text-[11px] text-emerald-700 font-bold">
                      &check; Geofence Verified (35m radius)
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">
                  <div className="h-32 bg-gradient-to-br from-slate-900 to-slate-800 text-white flex flex-col items-center justify-center p-3 text-center">
                    <span className="text-3xl mb-1">📝</span>
                    <span className="font-bold text-xs">Retailer Signed Order Slip</span>
                    <span className="text-[10px] text-slate-300 mt-1">
                      Digital Signature Captured
                    </span>
                  </div>
                  <div className="p-2.5 bg-white border-t border-slate-200 space-y-1">
                    <div className="font-bold text-slate-900">SLIP_RECEIPT_02.pdf</div>
                    <div className="text-[11px] text-slate-500 font-semibold">
                      Timestamp: 11:42 AM
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-slate-600">
                <div>Device Metadata: <b>Samsung Galaxy A54 5G (Android 14)</b></div>
                <div>Network Provider: <b>Grameenphone 4G &middot; Cell Tower ID #4782</b></div>
                <div className="text-emerald-700 font-bold">&check; Integrity Audit: Verified Authentic</div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => {
                  showToast('Downloaded proofs to local drive');
                  closeModal();
                }}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer flex items-center gap-1"
              >
                <Download size={13} />
                <span>Download Proofs</span>
              </button>
              <button
                onClick={() => {
                  showToast('Visit verification approved and confirmed clean!');
                  closeModal();
                }}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Confirm Audit Approval
              </button>
            </div>
          </>
        )}

        {/* MODAL 9: NOTIFICATIONS DRAWER */}
        {type === 'notifications' && (
          <>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Notification Center</h2>
                <p className="text-xs text-slate-400">Actionable system workforce updates</p>
              </div>
              <button onClick={closeModal} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs max-h-[60vh] overflow-y-auto">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    n.read ? 'bg-slate-50 border-slate-200' : 'bg-emerald-50/60 border-emerald-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-extrabold text-slate-900">{n.title}</span>
                    <span className="text-[10px] text-slate-400 font-semibold">{n.timestamp}</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">{n.message}</p>
                </div>
              ))}
            </div>

            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                onClick={markNotificationsRead}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
              >
                Mark All as Read
              </button>
              <button
                onClick={closeModal}
                className="px-4 py-1.5 rounded-xl bg-slate-800 text-white font-bold text-xs hover:bg-slate-900 cursor-pointer"
              >
                Close
              </button>
            </div>
          </>
        )}

        {/* MODAL 10: USER PROFILE */}
        {type === 'profile' && (
          <>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">User Profile & Account</h2>
                <p className="text-xs text-slate-400">Workforce ID: USR-8842</p>
              </div>
              <button onClick={closeModal} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="flex items-center gap-3.5 pb-3 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-emerald-800 text-white font-black text-lg flex items-center justify-center">
                  {currentUser.avatar || 'AP'}
                </div>
                <div>
                  <div className="text-sm font-black text-slate-900">{currentUser.name}</div>
                  <div className="text-xs text-slate-500">{currentUser.designation}</div>
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Active Session &middot; {currentUser.dept}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-slate-700">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Tenant Organization:</span>
                  <b className="text-slate-900">{currentTenant.name} ({currentTenant.id})</b>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Assigned Spatie Role:</span>
                  <b className="text-slate-900">{currentUser.role} (Team Lead)</b>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Team:</span>
                  <b className="text-slate-900">{currentUser.team}</b>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-400">Reporting HQ:</span>
                  <b className="text-slate-900">Plot 12, Gulshan Avenue, Dhaka</b>
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1.5">
                  Effective Spatie Permissions
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'dashboard.view_stats',
                    'timelog.record',
                    'timelog.approve',
                    'leave.request',
                    'leave.approve',
                    'tasks.create',
                    'tasks.approve',
                    'attendance.punch',
                    'payroll.view_own'
                  ].map((p) => (
                    <span
                      key={p}
                      className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 cursor-pointer shadow-xs"
              >
                Done
              </button>
            </div>
          </>
        )}

        {/* MODAL 11: ADD DEPARTMENT */}
        {type === 'addDept' && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const data = new FormData(form);
              await api.createDepartment({
                name: data.get('name') as string,
                code: data.get('code') as string,
                hod: data.get('hod') as string,
                budget: data.get('budget') as string,
                initialTeam: data.get('initialTeam') as string
              });
              showToast('Department registered in organization tree!');
              triggerRefresh();
              closeModal();
            }}
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Add New Department</h2>
                <p className="text-xs text-slate-400">Create unit in tenant organization tree</p>
              </div>
              <button type="button" onClick={closeModal} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department Name *</label>
                  <input
                    name="name"
                    required
                    defaultValue="Logistics & Supply Chain"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Code *</label>
                  <input
                    name="code"
                    required
                    defaultValue="LOG"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Head of Department (HOD) *</label>
                  <input
                    name="hod"
                    required
                    defaultValue="Asif Mahmud"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Operating Budget *</label>
                  <input
                    name="budget"
                    required
                    defaultValue="৳ 600,000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Initial Primary Team Name</label>
                <input
                  name="initialTeam"
                  defaultValue="Warehouse & Fleet Distribution"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={closeModal}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Create Department
              </button>
            </div>
          </form>
        )}

        {/* MODAL 12: NEW SPATIE ROLE */}
        {type === 'newRole' && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              showToast('Spatie role created and synced with permissions matrix!');
              closeModal();
            }}
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Create Spatie Role</h2>
                <p className="text-xs text-slate-400">Scoped for Spatie RBAC & API authorization</p>
              </div>
              <button type="button" onClick={closeModal} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Role Name *</label>
                  <input
                    name="name"
                    required
                    defaultValue="Territory Supervisor"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Guard Name *</label>
                  <select
                    name="guard"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-none focus:border-emerald-600"
                  >
                    <option value="sanctum">sanctum (API Token)</option>
                    <option value="web">web (Session Cookie)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Scope Level</label>
                <select
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-none focus:border-emerald-600"
                >
                  <option>Team-Scoped (Restricted to own team members)</option>
                  <option>Department-Scoped</option>
                  <option>Tenant Global</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Permissions</label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl max-h-36 overflow-y-auto space-y-1.5">
                  {['tasks.create', 'tasks.approve', 'timelog.record', 'timelog.approve', 'attendance.punch', 'leave.request'].map((p) => (
                    <label key={p} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" defaultChecked className="accent-emerald-700" />
                      <span className="font-mono text-[11px] text-slate-700 font-semibold">{p}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={closeModal}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Register Role
              </button>
            </div>
          </form>
        )}

        {/* MODAL 13: ORG NODE DETAIL */}
        {type === 'nodeDetail' && (
          <>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">{props.title || 'Node'}</h2>
                <p className="text-xs text-slate-400">Node Type: {props.type || 'Department'}</p>
              </div>
              <button onClick={closeModal} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-3 text-xs text-slate-700">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span>Tenant ID:</span>
                  <b className="text-slate-900">{currentTenant.id} (Isolated)</b>
                </div>
                <div className="flex justify-between">
                  <span>RBAC Guard:</span>
                  <b className="text-slate-900">sanctum + web session</b>
                </div>
                <div className="flex justify-between">
                  <span>Isolation Enforcement:</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Active & Enforced
                  </span>
                </div>
              </div>

              <p className="leading-relaxed text-slate-600 bg-emerald-50/50 p-3 rounded-xl border border-emerald-200">
                Scoped under the multi-tenant database schema. Team-level access policies ensure managers in this node can inspect subordinate plans and time logs without cross-department data leakage.
              </p>
            </div>

            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 cursor-pointer"
              >
                Close
              </button>
            </div>
          </>
        )}

        {/* MODAL 14: SET TEAM MONTHLY PLAN */}
        {type === 'newPlan' && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const data = new FormData(form);
              await api.createMonthlyPlan({
                team: data.get('team') as string,
                dept: data.get('dept') as string,
                targetObjective: data.get('targetObjective') as string,
                repsCount: data.get('repsCount') as string,
                tasksCount: parseInt(data.get('tasksCount') as string) || 20,
                targetQuantity: data.get('targetQuantity') as string
              });
              showToast('Team Monthly Plan created!');
              triggerRefresh();
              closeModal();
            }}
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Set Team Monthly Plan</h2>
                <p className="text-xs text-slate-400">Align team targets, reps, and quota milestones</p>
              </div>
              <button type="button" onClick={closeModal} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department *</label>
                  <select
                    name="dept"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-none focus:border-emerald-600"
                  >
                    <option>Field Sales</option>
                    <option>Engineering</option>
                    <option>Marketing</option>
                    <option>Human Resources</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Team Name *</label>
                  <input
                    name="team"
                    required
                    defaultValue="Sylhet Territory Sales"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Strategic Monthly Target *</label>
                <input
                  name="targetObjective"
                  required
                  defaultValue="350 Retail Outlets + ৳1.4M Collection Target"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Reps *</label>
                  <input
                    name="repsCount"
                    required
                    defaultValue="4 Reps"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Quantity *</label>
                  <input
                    name="targetQuantity"
                    required
                    defaultValue="350 visits"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
            </div>

            <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={closeModal}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Create Monthly Plan
              </button>
            </div>
          </form>
        )}

        {/* MODAL 15: TEAM PLAN BREAKDOWN */}
        {type === 'teamPlanBreakdown' && (
          <>
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  {props.teamName || 'Team Plan'} Breakdown
                </h2>
                <p className="text-xs text-slate-400">Individual rep quotas and achievement roll-up</p>
              </div>
              <button onClick={closeModal} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Quota Target</div>
                  <div className="text-base font-extrabold text-slate-900 mt-1">450 Visits</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Rollup Progress</div>
                  <div className="text-base font-extrabold text-emerald-800 mt-1">84%</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Status</div>
                  <div className="text-base font-extrabold text-emerald-800 mt-1">Approved</div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 text-[10px] uppercase">
                    <tr>
                      <th className="p-2.5">Rep Name</th>
                      <th className="p-2.5">Quota Target</th>
                      <th className="p-2.5">Achieved</th>
                      <th className="p-2.5 text-right">Hours</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-2.5 font-bold text-slate-900">Ravi Kumar (SO)</td>
                      <td className="p-2.5">120 Visits</td>
                      <td className="p-2.5 font-bold text-emerald-800">104 Visits (86%)</td>
                      <td className="p-2.5 text-right font-semibold">42.5h</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-900">Nadia Rahman (ASE)</td>
                      <td className="p-2.5">140 Visits</td>
                      <td className="p-2.5 font-bold text-emerald-800">112 Visits (80%)</td>
                      <td className="p-2.5 text-right font-semibold">38.0h</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-bold text-slate-900">Zubair Hasan (TO)</td>
                      <td className="p-2.5">100 Visits</td>
                      <td className="p-2.5 font-bold text-emerald-800">78 Visits (78%)</td>
                      <td className="p-2.5 text-right font-semibold">35.5h</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs hover:bg-emerald-800 cursor-pointer"
              >
                Close Breakdown
              </button>
            </div>
          </>
        )}

        {/* MODAL 16: NEW TASK PRESET */}
        {type === 'newTaskPreset' && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const data = new FormData(form);
              await api.createTaskPreset({
                name: data.get('name') as string,
                category: data.get('category') as any,
                freq: data.get('freq') as any,
                target: parseInt(data.get('target') as string) || 25,
                role: data.get('role') as string,
                proofType: data.get('proofType') as string
              });
              showToast('Master Preset published!');
              triggerRefresh();
              closeModal();
            }}
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">Add Master Task Preset</h2>
                <p className="text-xs text-slate-400">Create reusable operational template</p>
              </div>
              <button type="button" onClick={closeModal} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Preset Name *</label>
                <input
                  name="name"
                  required
                  defaultValue="Retail POS Merchandising Audit"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category *</label>
                  <select
                    name="category"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-none focus:border-emerald-600"
                  >
                    <option>Field Visit</option>
                    <option>Sales</option>
                    <option>Collection</option>
                    <option>Admin</option>
                    <option>Service</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Frequency *</label>
                  <select
                    name="freq"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-none focus:border-emerald-600"
                  >
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Default Target</label>
                  <input
                    name="target"
                    type="number"
                    defaultValue={30}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Allowed Roles</label>
                  <input
                    name="role"
                    defaultValue="SO, ASE, Merchandiser"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Verification Proof</label>
                <select
                  name="proofType"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-semibold text-slate-800 outline-none focus:border-emerald-600"
                >
                  <option>GPS Geofence + 2 Photos (Shelf & Receipt)</option>
                  <option>GPS Geofence Only</option>
                  <option>Signature / Digital Receipt</option>
                  <option>None (Self-declaration)</option>
                </select>
              </div>
            </div>

            <div className="px-5 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={closeModal}
                className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs cursor-pointer shadow-xs"
              >
                Publish Master Preset
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
