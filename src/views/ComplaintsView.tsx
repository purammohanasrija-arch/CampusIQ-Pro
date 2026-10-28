/**
 * CampusIQ Pro — Smart Complaint & Grievance Tracking System
 * Ticket lifecycle management, priority SLA tracking, departmental assignment, and audit history.
 */

import React, { useState } from 'react';
import {
  MessageSquareWarning,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building,
  User,
  ArrowRight,
  ShieldCheck,
  Search
} from 'lucide-react';
import { ComplaintTicket, UserRole } from '../types/campus';
import { api } from '../services/api';

interface ComplaintsViewProps {
  complaints: ComplaintTicket[];
  userRole: UserRole;
  onRefresh: () => void;
}

export const ComplaintsView: React.FC<ComplaintsViewProps> = ({
  complaints,
  userRole,
  onRefresh,
}) => {
  const [selectedTicket, setSelectedTicket] = useState<ComplaintTicket | null>(complaints[0] || null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [statusUpdateNote, setStatusUpdateNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [newComplaint, setNewComplaint] = useState({
    title: '',
    category: 'Laboratory & Equipment',
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
    description: '',
  });

  const canResolve =
    userRole === 'Super Administrator' || userRole === 'College Administrator' || userRole === 'Faculty';

  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComplaint.title || !newComplaint.description) return;
    try {
      const res = await api.createComplaint(newComplaint);
      setShowAddModal(false);
      onRefresh();
      setSelectedTicket(res.complaint);
    } catch (err: any) {
      alert(err.message || 'Ticket creation failed');
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedTicket) return;
    setUpdatingStatus(true);
    try {
      const res = await api.updateComplaintStatus(selectedTicket.id, status, statusUpdateNote);
      setSelectedTicket(res.complaint);
      setStatusUpdateNote('');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <span>Smart Complaint & Grievance Tracker</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              SLA Resolution Targets
            </span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Institutional accountability portal for logging classroom, lab, network, and hostel maintenance with timestamped auditing.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>File New Grievance</span>
        </button>
      </div>

      {/* Main Grid: Ticket List & Ticket Details Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Tickets List (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-stone-200 bg-stone-50/70 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-stone-900">Campus Issue Queue</h3>
              <p className="text-[11px] text-stone-500">Track status across facilities & network</p>
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
              {complaints.length} Tickets
            </span>
          </div>

          <div className="divide-y divide-stone-100 max-h-[560px] overflow-y-auto">
            {complaints.map(tkt => {
              const isSelected = selectedTicket?.id === tkt.id;
              const isHigh = tkt.priority === 'High';
              const isResolved = tkt.status === 'Resolved';

              return (
                <div
                  key={tkt.id}
                  onClick={() => setSelectedTicket(tkt)}
                  className={`p-4 hover:bg-stone-50 cursor-pointer transition-colors ${
                    isSelected ? 'bg-emerald-50/50 border-l-4 border-emerald-700' : ''
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[10px] font-bold text-stone-500 bg-stone-100 px-1.5 py-0.2 rounded">
                      {tkt.ticketNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isResolved
                          ? 'bg-emerald-100 text-emerald-800'
                          : isHigh
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {tkt.status}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-stone-900 line-clamp-1 mt-1">
                    {tkt.title}
                  </h4>
                  <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                    {tkt.category} · {tkt.assignedDepartment}
                  </p>

                  <div className="mt-2 flex items-center justify-between text-[10px] text-stone-400">
                    <span>By: <strong className="text-stone-700">{tkt.studentName}</strong></span>
                    <span className="font-mono">{new Date(tkt.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Ticket Detail & Audit Timeline (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedTicket ? (
            <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between pb-4 border-b border-stone-200">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      {selectedTicket.ticketNumber}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                      {selectedTicket.category}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-stone-900 mt-2">
                    {selectedTicket.title}
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Assigned to: <strong className="text-stone-800">{selectedTicket.assignedDepartment}</strong>
                  </p>
                </div>

                <div className="text-right">
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      selectedTicket.status === 'Resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedTicket.priority === 'High'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {selectedTicket.status}
                  </span>
                  <p className="text-[10px] text-stone-400 font-mono mt-1">
                    SLA: {selectedTicket.targetResolutionHours}h Resolution Target
                  </p>
                </div>
              </div>

              {/* Description Body */}
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
                  Reported Issue Description
                </span>
                <p className="text-xs text-stone-700 leading-relaxed bg-stone-50 p-3 rounded-lg border border-stone-200/80">
                  {selectedTicket.description}
                </p>
              </div>

              {/* Staff Notes */}
              {selectedTicket.staffNotes && (
                <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200/80 text-xs">
                  <span className="text-[10px] font-bold text-amber-800 uppercase block mb-1">
                    Department Action & Technician Notes:
                  </span>
                  <p className="text-stone-800 font-medium">{selectedTicket.staffNotes}</p>
                </div>
              )}

              {/* Timeline Stepper */}
              <div>
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-3">
                  Status History & Audit Trail
                </span>
                <div className="space-y-3 relative pl-4 border-l-2 border-stone-200 ml-2 text-xs">
                  {selectedTicket.statusHistory.map((step, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-700 border-2 border-white" />
                      <div className="flex items-center justify-between">
                        <strong className="text-stone-900 font-semibold">{step.status}</strong>
                        <span className="text-[10px] font-mono text-stone-400">
                          {new Date(step.time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">{step.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Transition Actions */}
              {canResolve && selectedTicket.status !== 'Resolved' && (
                <div className="pt-4 border-t border-stone-200 space-y-3">
                  <span className="text-[11px] font-bold text-stone-700 block">
                    Update Ticket Status & Add Staff Note
                  </span>
                  <input
                    type="text"
                    placeholder="e.g. Technician deployed; verified calibrated multimeter readings..."
                    value={statusUpdateNote}
                    onChange={e => setStatusUpdateNote(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                  />

                  <div className="flex flex-wrap gap-2">
                    {selectedTicket.status === 'Submitted' && (
                      <button
                        onClick={() => handleUpdateStatus('Acknowledged')}
                        disabled={updatingStatus}
                        className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded text-xs font-semibold"
                      >
                        Acknowledge Ticket
                      </button>
                    )}
                    {selectedTicket.status !== 'In Progress' && (
                      <button
                        onClick={() => handleUpdateStatus('In Progress')}
                        disabled={updatingStatus}
                        className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded text-xs font-semibold"
                      >
                        Set In Progress
                      </button>
                    )}
                    <button
                      onClick={() => handleUpdateStatus('Resolved')}
                      disabled={updatingStatus}
                      className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded text-xs font-semibold shadow-xs"
                    >
                      Resolve & Close Ticket
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-stone-50 border-2 border-dashed border-stone-300 rounded-xl p-8 text-center text-xs text-stone-400">
              Select a ticket on the left to inspect timeline and staff actions.
            </div>
          )}
        </div>
      </div>

      {/* Add Complaint Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-sm font-bold text-stone-900 mb-1">File Campus Maintenance Ticket</h3>
            <p className="text-xs text-stone-500 mb-4">
              Dispatches issue directly to facility supervisors and engineering maintenance staff.
            </p>

            <form onSubmit={handleCreateComplaint} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">Issue Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Projector HDMI Flashing in Hall Room NB-101"
                  value={newComplaint.title}
                  onChange={e => setNewComplaint({ ...newComplaint, title: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Facility Category</label>
                  <select
                    value={newComplaint.category}
                    onChange={e => setNewComplaint({ ...newComplaint, category: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                  >
                    <option value="Laboratory & Equipment">Laboratory & Equipment</option>
                    <option value="Campus Network & Wi-Fi">Network & Wi-Fi</option>
                    <option value="Classroom & AV">Classroom & AV</option>
                    <option value="Hostel & Residential">Hostel & Living</option>
                    <option value="Transportation">Transportation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Urgency Priority</label>
                  <select
                    value={newComplaint.priority}
                    onChange={e => setNewComplaint({ ...newComplaint, priority: e.target.value as any })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                  >
                    <option value="Low">Low (72h SLA)</option>
                    <option value="Medium">Medium (48h SLA)</option>
                    <option value="High">High / Critical (24h SLA)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Specify precise room number, error message, or equipment serial..."
                  value={newComplaint.description}
                  onChange={e => setNewComplaint({ ...newComplaint, description: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-stone-600 hover:text-stone-900 bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-lg shadow-xs"
                >
                  Submit Grievance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
