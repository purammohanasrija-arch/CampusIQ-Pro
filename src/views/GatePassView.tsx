/**
 * CampusIQ Pro — Digital Gate Pass & Campus Visitor Management
 * Single-use departure/re-entry tokens, warden approvals, and verified visitor logging.
 */

import React, { useState } from 'react';
import {
  DoorOpen,
  Plus,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  UserCheck,
  MapPin,
  Calendar,
  AlertTriangle,
  Building
} from 'lucide-react';
import { GatePass, Visitor, UserRole } from '../types/campus';
import { QRCodeView } from '../components/QRCodeView';
import { api } from '../services/api';

interface GatePassViewProps {
  passes: GatePass[];
  visitors: Visitor[];
  userRole: UserRole;
  onRefresh: () => void;
  onVerifyToken: (token: string) => void;
}

export const GatePassView: React.FC<GatePassViewProps> = ({
  passes,
  visitors,
  userRole,
  onRefresh,
  onVerifyToken,
}) => {
  const [activeTab, setActiveTab] = useState<'student' | 'visitor'>('student');
  const [selectedPassForQR, setSelectedPassForQR] = useState<GatePass | null>(null);
  const [selectedVisitorQR, setSelectedVisitorQR] = useState<Visitor | null>(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showVisitorModal, setShowVisitorModal] = useState(false);

  const [applyForm, setApplyForm] = useState({
    reason: '',
    destination: '',
    departureTime: '',
    expectedReturnTime: '',
  });

  const [visitorForm, setVisitorForm] = useState({
    visitorName: '',
    affiliation: '',
    hostFaculty: 'Dr. Elena Chen',
    hostDepartment: 'Computer Science',
    purpose: '',
    visitDate: new Date().toISOString().split('T')[0],
  });

  const canApprove =
    userRole === 'Super Administrator' || userRole === 'College Administrator' || userRole === 'Security Staff';

  const handleApplyPass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyForm.reason || !applyForm.destination) return;
    try {
      const res = await api.createGatePass(applyForm);
      setShowApplyModal(false);
      onRefresh();
      setSelectedPassForQR(res.pass);
    } catch (err: any) {
      alert(err.message || 'Pass application failed');
    }
  };

  const handleCreateVisitor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitorForm.visitorName) return;
    try {
      const res = await api.createVisitor(visitorForm);
      setShowVisitorModal(false);
      onRefresh();
      setSelectedVisitorQR(res.visitor);
    } catch (err: any) {
      alert(err.message || 'Visitor registration failed');
    }
  };

  const handleGateScan = async (passId: string) => {
    try {
      const res = await api.scanGatePass(passId);
      alert(`${res.action}: ${res.message}`);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Gate log failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <span>Digital Gate Pass & Visitor Security</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Single-Use Exit & Re-Entry
            </span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Automated student leave approval, time-limited security gate QR passes, and verified visitor escort tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'student' ? (
            <button
              onClick={() => setShowApplyModal(true)}
              className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Apply Student Gate Pass</span>
            </button>
          ) : (
            <button
              onClick={() => setShowVisitorModal(true)}
              className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Register Official Visitor</span>
            </button>
          )}
        </div>
      </div>

      {/* Segmented Tab Switcher */}
      <div className="flex gap-2 p-1 bg-stone-100 rounded-lg max-w-xs">
        <button
          onClick={() => setActiveTab('student')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            activeTab === 'student' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Student Gate Passes ({passes.length})
        </button>
        <button
          onClick={() => setActiveTab('visitor')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
            activeTab === 'visitor' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Campus Visitors ({visitors.length})
        </button>
      </div>

      {/* Student Gate Passes Grid */}
      {activeTab === 'student' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {passes.map(pass => {
            const isApproved = pass.status === 'Approved';
            const hasExited = !!pass.exitTimestamp;
            const hasReturned = !!pass.entryTimestamp;

            return (
              <div
                key={pass.id}
                className="bg-white rounded-xl border border-stone-200 shadow-xs p-5 flex flex-col justify-between hover:border-emerald-600/40 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                      {pass.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        hasReturned
                          ? 'bg-stone-100 text-stone-600'
                          : hasExited
                          ? 'bg-amber-100 text-amber-900 font-extrabold'
                          : isApproved
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {hasReturned ? 'Returned to Campus' : hasExited ? 'Off-Campus (Active)' : pass.status}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-stone-900">
                    {pass.studentName} <span className="font-mono text-stone-400 font-normal">({pass.rollNumber})</span>
                  </h3>
                  <p className="text-xs text-stone-600 mt-1 font-medium">{pass.reason}</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">Destination: {pass.destination}</p>

                  <div className="mt-3 pt-2 border-t border-stone-100 space-y-1 text-[11px] text-stone-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      <span>Depart: {new Date(pass.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      <span>Return By: {new Date(pass.expectedReturnTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-[10px] text-stone-400 pt-1">Approved by: {pass.approvedBy}</p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedPassForQR(pass)}
                    className="p-1.5 text-stone-500 hover:text-emerald-800 hover:bg-emerald-50 rounded transition-colors"
                    title="View Gate QR Pass"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleGateScan(pass.id)}
                    disabled={hasReturned}
                    className="flex-1 py-1.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white rounded text-xs font-semibold shadow-2xs transition-colors"
                  >
                    {!hasExited ? 'Log Gate Exit' : !hasReturned ? 'Log Re-Entry' : 'Pass Completed'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Campus Visitors Grid */}
      {activeTab === 'visitor' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visitors.map(vis => (
            <div
              key={vis.id}
              className="bg-white rounded-xl border border-stone-200 shadow-xs p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                    {vis.id}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {vis.status}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-stone-900">{vis.visitorName}</h3>
                <p className="text-[11px] text-stone-500">{vis.affiliation}</p>

                <div className="mt-3 pt-2 border-t border-stone-100 space-y-1 text-[11px] text-stone-600">
                  <p>Host Faculty: <strong className="text-stone-800">{vis.hostFaculty}</strong></p>
                  <p>Department: {vis.hostDepartment}</p>
                  <p>Purpose: <span className="italic">{vis.purpose}</span></p>
                  <p className="text-[10px] text-stone-400 font-mono">Date: {vis.visitDate}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedVisitorQR(vis)}
                  className="text-xs text-emerald-800 hover:underline font-semibold flex items-center gap-1"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Visitor Badge QR</span>
                </button>
                <button
                  onClick={() => onVerifyToken(vis.badgeQR)}
                  className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded text-xs font-semibold"
                >
                  Verify Badge
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Modals */}
      {selectedPassForQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center">
              <span className="text-[10px] font-mono text-emerald-800 uppercase tracking-widest font-semibold">
                Student Gate Pass Token
              </span>
              <h3 className="text-base font-bold text-stone-900 mt-1">{selectedPassForQR.studentName}</h3>
              <p className="text-xs text-stone-500">{selectedPassForQR.reason}</p>
            </div>

            <QRCodeView
              value={selectedPassForQR.qrPass}
              size={160}
              subtitle="Present at Main Campus Security Barrier"
            />

            <div className="flex gap-2">
              <button
                onClick={() => {
                  onVerifyToken(selectedPassForQR.qrPass);
                  setSelectedPassForQR(null);
                }}
                className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg"
              >
                Test Security Scan
              </button>
              <button
                onClick={() => setSelectedPassForQR(null)}
                className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedVisitorQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center">
              <span className="text-[10px] font-mono text-emerald-800 uppercase tracking-widest font-semibold">
                Official Visitor Pass
              </span>
              <h3 className="text-base font-bold text-stone-900 mt-1">{selectedVisitorQR.visitorName}</h3>
              <p className="text-xs text-stone-500">{selectedVisitorQR.affiliation}</p>
            </div>

            <QRCodeView
              value={selectedVisitorQR.badgeQR}
              size={160}
              subtitle={`Host: ${selectedVisitorQR.hostFaculty} · Purpose: ${selectedVisitorQR.purpose}`}
            />

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedVisitorQR(null)}
                className="w-full py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Pass Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-sm font-bold text-stone-900 mb-1">Apply Student Gate Pass</h3>
            <p className="text-xs text-stone-500 mb-4">
              Requests formal departure approval with parent consent verification.
            </p>

            <form onSubmit={handleApplyPass} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">Purpose / Reason for Leave</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IEEE Conference / Medical Appointment"
                  value={applyForm.reason}
                  onChange={e => setApplyForm({ ...applyForm, reason: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Destination</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. City Convention Center"
                  value={applyForm.destination}
                  onChange={e => setApplyForm({ ...applyForm, destination: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Departure Time</label>
                  <input
                    type="time"
                    required
                    value={applyForm.departureTime}
                    onChange={e => setApplyForm({ ...applyForm, departureTime: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Return Time</label>
                  <input
                    type="time"
                    required
                    value={applyForm.expectedReturnTime}
                    onChange={e => setApplyForm({ ...applyForm, expectedReturnTime: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50 text-[11px] text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>Parent authorization verified via CampusIQ Guardian SMS.</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 text-stone-600 hover:text-stone-900 bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-lg shadow-xs"
                >
                  Submit & Authorize Pass
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Visitor Modal */}
      {showVisitorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-sm font-bold text-stone-900 mb-1">Register Campus Visitor</h3>
            <p className="text-xs text-stone-500 mb-4">
              Issues verified visitor badge linked to host faculty member.
            </p>

            <form onSubmit={handleCreateVisitor} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">Visitor Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Jane Goodall"
                  value={visitorForm.visitorName}
                  onChange={e => setVisitorForm({ ...visitorForm, visitorName: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Affiliation / Organization</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MIT Lincoln Laboratory"
                  value={visitorForm.affiliation}
                  onChange={e => setVisitorForm({ ...visitorForm, affiliation: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Host Faculty</label>
                <input
                  type="text"
                  required
                  value={visitorForm.hostFaculty}
                  onChange={e => setVisitorForm({ ...visitorForm, hostFaculty: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Purpose of Visit</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Guest Lecture & Lab Tour"
                  value={visitorForm.purpose}
                  onChange={e => setVisitorForm({ ...visitorForm, purpose: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowVisitorModal(false)}
                  className="px-4 py-2 text-stone-600 hover:text-stone-900 bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-lg shadow-xs"
                >
                  Issue Visitor Badge
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
