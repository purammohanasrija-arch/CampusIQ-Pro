/**
 * CampusIQ Pro — Universal QR Verification Center
 * Central security & verifier console for verifying all campus passes, tokens, tickets, and assets.
 */

import React, { useState, useEffect } from 'react';
import {
  QrCode,
  ShieldCheck,
  Search,
  Camera,
  History,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  RefreshCw,
  FileText
} from 'lucide-react';
import { VerificationLog, UserRole } from '../types/campus';
import { api } from '../services/api';

interface QRVerificationViewProps {
  userRole: UserRole;
  onOpenScanner: () => void;
  onVerifyToken: (token: string) => void;
}

export const QRVerificationView: React.FC<QRVerificationViewProps> = ({
  userRole,
  onOpenScanner,
  onVerifyToken,
}) => {
  const [tokenInput, setTokenInput] = useState('');
  const [logs, setLogs] = useState<VerificationLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('All');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.getQRLogs();
      setLogs(res.logs || []);
    } catch (err) {
      console.error('Error fetching verification logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) return;
    onVerifyToken(tokenInput.trim());
    setTokenInput('');
  };

  const testTokens = [
    { label: 'Student ID: Aarav Sharma', code: 'CIQ-STUID-STU-2024-001-9F2B81C4A0E1', type: 'Student ID' },
    { label: 'Event Pass: AI Hackathon', code: 'CIQ-EVTPASS-REG-2026-881-A7E9', type: 'Event Entry' },
    { label: 'Exam Hall Ticket: CS601', code: 'CIQ-HALLTICKET-HT-2026-CS-089-8A1C', type: 'Hall Ticket' },
    { label: 'Canteen Pickup: Order #8921', code: 'CIQ-CANTEEN-ORD-8921-READY', type: 'Canteen' },
    { label: 'Gate Pass: GP-2026-042', code: 'CIQ-GATEPASS-GP-2026-042-99EA', type: 'Gate Pass' },
    { label: 'Library Book: Algorithms (CLRS)', code: 'CIQ-BOOK-BK-102-01', type: 'Library Book' },
    { label: 'Lab Equipment: Robotic Arm Kit', code: 'CIQ-EQUIP-LAB-EQ-01-ROBO', type: 'Lab Asset' },
  ];

  const filteredLogs = logs.filter(l => {
    if (filterType === 'All') return true;
    return l.type.toLowerCase().includes(filterType.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-stone-200">
        <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
          <span>Universal QR Verification Center</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            Real-Time Server Auth
          </span>
        </h2>
        <p className="text-xs text-stone-500 mt-1">
          Cryptographic token verification console across 8 campus modules. Validates digital signatures, check-in statuses, and prevents duplicate admissions.
        </p>
      </div>

      {/* Verification Action Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Camera Launch Card */}
        <div className="p-5 bg-white rounded-xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
              <Camera className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-stone-900">Live Camera Scanner</h3>
            <p className="text-xs text-stone-500 mt-1">
              Point terminal webcam or mobile camera at printed or digital screen QR badges.
            </p>
          </div>
          <button
            onClick={onOpenScanner}
            className="mt-4 w-full py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-2"
          >
            <Camera className="w-4 h-4" />
            <span>Open Camera Scanner</span>
          </button>
        </div>

        {/* Manual Code Input Card */}
        <div className="md:col-span-2 p-5 bg-white rounded-xl border border-stone-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-800 flex items-center justify-center mb-3">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-stone-900">Manual Token Verification</h3>
            <p className="text-xs text-stone-500 mt-1">
              Directly validate cryptographic tokens, student barcodes, or manual numeric passcodes.
            </p>
          </div>

          <form onSubmit={handleManualSubmit} className="mt-4 flex gap-2">
            <input
              type="text"
              placeholder="e.g. CIQ-EVTPASS-REG-2026-881-A7E9..."
              value={tokenInput}
              onChange={e => setTokenInput(e.target.value)}
              className="flex-1 px-3 py-2 text-xs font-mono bg-stone-50 border border-stone-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-700 focus:bg-white text-stone-900"
            />
            <button
              type="submit"
              disabled={!tokenInput.trim()}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify Signature</span>
            </button>
          </form>
        </div>
      </div>

      {/* Quick Test Presets (Exhibition Ready) */}
      <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <h4 className="text-xs font-bold text-stone-900">Exhibition Demonstration Pass Tokens</h4>
          </div>
          <span className="text-[11px] text-stone-500">Click any preset below to trigger instantaneous server verification</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {testTokens.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => onVerifyToken(preset.code)}
              className="p-2.5 bg-white hover:bg-emerald-50 hover:border-emerald-300 rounded-lg border border-stone-200/80 text-left transition-colors group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded">
                  {preset.type}
                </span>
                <QrCode className="w-3.5 h-3.5 text-stone-400 group-hover:text-emerald-700" />
              </div>
              <p className="text-xs font-semibold text-stone-900 mt-1 truncate">{preset.label}</p>
              <span className="text-[10px] font-mono text-stone-400 truncate mt-1">{preset.code}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Verification Audit Logs Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-stone-200 bg-stone-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-800" />
            <h3 className="text-xs font-bold text-stone-900">Verification Audit History</h3>
            <span className="text-[11px] text-stone-500">({logs.length} logged events)</span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="text-xs px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-stone-700 focus:ring-1 focus:ring-emerald-700"
            >
              <option value="All">All Categories</option>
              <option value="Student">Student ID</option>
              <option value="Event">Event Passes</option>
              <option value="Hall">Hall Tickets</option>
              <option value="Gate">Gate Passes</option>
            </select>

            <button
              onClick={fetchLogs}
              className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
              title="Refresh logs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50/90 text-stone-500 font-semibold border-b border-stone-200">
              <tr>
                <th className="py-2.5 px-4">Timestamp</th>
                <th className="py-2.5 px-4">Subject / Pass</th>
                <th className="py-2.5 px-4">Pass Category</th>
                <th className="py-2.5 px-4">Station / Verifier</th>
                <th className="py-2.5 px-4">Result Status</th>
                <th className="py-2.5 px-4">Audit Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-400">
                    No verification records matching filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-stone-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3 px-4 font-semibold text-stone-900 whitespace-nowrap">
                      {log.subjectName}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 text-stone-700">
                        {log.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-stone-600 truncate max-w-[160px]">
                      {log.verifiedBy}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status.includes('Valid') || log.status.includes('Admitted')
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.status.includes('Already')
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-stone-500 truncate max-w-[240px]">
                      {log.notes}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
