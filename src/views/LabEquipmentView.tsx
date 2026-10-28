/**
 * CampusIQ Pro — Laboratory Equipment Tracking & Maintenance
 * Asset tagging, checkout requests, simultaneous allocation prevention, and condition monitoring.
 */

import React, { useState } from 'react';
import {
  Cpu,
  Plus,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCcw,
  Wrench,
  Search
} from 'lucide-react';
import { LabEquipment, LabRequest, UserRole } from '../types/campus';
import { QRCodeView } from '../components/QRCodeView';
import { api } from '../services/api';

interface LabEquipmentViewProps {
  equipment: LabEquipment[];
  requests: LabRequest[];
  userRole: UserRole;
  onRefresh: () => void;
  onVerifyToken: (token: string) => void;
}

export const LabEquipmentView: React.FC<LabEquipmentViewProps> = ({
  equipment,
  requests,
  userRole,
  onRefresh,
  onVerifyToken,
}) => {
  const [selectedAssetQR, setSelectedAssetQR] = useState<LabEquipment | null>(null);
  const [requestModalAsset, setRequestModalAsset] = useState<LabEquipment | null>(null);
  const [requestPurpose, setRequestPurpose] = useState('');
  const [requestDays, setRequestDays] = useState(7);
  const [actionLoading, setActionLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newAsset, setNewAsset] = useState({
    name: '',
    assetId: '',
    category: 'Robotics & Control',
    lab: 'Robotics & Mechatronics Lab (R-204)',
    serialNumber: '',
  });

  const canManageLabs =
    userRole === 'Super Administrator' || userRole === 'College Administrator' || userRole === 'Lab Technician';

  const handleRequestCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestModalAsset) return;
    setActionLoading(true);
    try {
      await api.requestEquipment(requestModalAsset.id, requestPurpose, requestDays);
      setRequestModalAsset(null);
      setRequestPurpose('');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Checkout request failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAction = async (id: string, action: 'return' | 'maintenance' | 'available') => {
    setActionLoading(true);
    try {
      await api.performLabAction(id, action);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.name) return;
    try {
      await api.createEquipment(newAsset);
      setShowAddModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Creation failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <span>Laboratory Equipment & Asset Tracking</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Anti-Conflict Allocation
            </span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Real-time custody tracking, condition auditing, QR barcode asset labels, and conflict-free lab scheduling.
          </p>
        </div>

        {canManageLabs && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Register New Lab Asset</span>
          </button>
        )}
      </div>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {equipment.map(item => {
          const isAvailable = item.status === 'Available';
          const isBorrowed = item.status === 'Borrowed';
          const isMaintenance = item.status === 'Under Maintenance';

          return (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-stone-200 shadow-xs p-5 flex flex-col justify-between hover:border-emerald-600/40 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                    {item.assetId}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isAvailable
                        ? 'bg-emerald-100 text-emerald-800'
                        : isBorrowed
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <h3 className="text-xs font-bold text-stone-900 leading-snug">
                  {item.name}
                </h3>
                <p className="text-[11px] text-stone-500 mt-1">{item.category}</p>

                <div className="mt-3 pt-2 border-t border-stone-100 space-y-1 text-[11px] text-stone-600">
                  <p>Lab: <strong className="text-stone-800">{item.lab}</strong></p>
                  <p>Condition: <span className="text-emerald-700 font-semibold">{item.condition}</span></p>
                  {item.allocatedTo && (
                    <div className="p-2 bg-amber-50 rounded text-[10px] text-amber-900 mt-2 space-y-0.5">
                      <p>Borrower: <strong>{item.allocatedTo.studentName}</strong></p>
                      <p>Return Due: <strong>{item.allocatedTo.dueDate}</strong></p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedAssetQR(item)}
                  className="p-1.5 text-stone-500 hover:text-emerald-800 hover:bg-emerald-50 rounded transition-colors"
                  title="Generate QR Asset Label"
                >
                  <QrCode className="w-4 h-4" />
                </button>

                {isAvailable ? (
                  <button
                    onClick={() => setRequestModalAsset(item)}
                    className="flex-1 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded text-xs font-semibold shadow-2xs transition-colors"
                  >
                    Request Checkout
                  </button>
                ) : isBorrowed ? (
                  canManageLabs && (
                    <button
                      onClick={() => handleAction(item.id, 'return')}
                      disabled={actionLoading}
                      className="flex-1 py-1.5 bg-stone-100 hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded text-xs font-semibold transition-colors"
                    >
                      Process Return
                    </button>
                  )
                ) : (
                  canManageLabs && (
                    <button
                      onClick={() => handleAction(item.id, 'available')}
                      disabled={actionLoading}
                      className="flex-1 py-1.5 bg-stone-100 hover:bg-emerald-50 text-emerald-800 rounded text-xs font-semibold"
                    >
                      Clear Maintenance
                    </button>
                  )
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Checkout Request Modal */}
      {requestModalAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-sm font-bold text-stone-900 mb-1">Request Equipment Checkout</h3>
            <p className="text-xs text-stone-500 mb-4">
              Allocate <strong>{requestModalAsset.name}</strong> ({requestModalAsset.assetId}) for coursework or capstone research.
            </p>

            <form onSubmit={handleRequestCheckout} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">Project Purpose / Objective</label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Capstone project high-speed bus protocol debugging..."
                  value={requestPurpose}
                  onChange={e => setRequestPurpose(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Requested Duration (Days)</label>
                <select
                  value={requestDays}
                  onChange={e => setRequestDays(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                >
                  <option value={3}>3 Days (Quick Lab Work)</option>
                  <option value={7}>7 Days (Course Assignment)</option>
                  <option value={14}>14 Days (Capstone Sprint)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setRequestModalAsset(null)}
                  className="px-4 py-2 text-stone-600 hover:text-stone-900 bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-lg shadow-xs"
                >
                  {actionLoading ? 'Allocating...' : 'Submit & Check Out'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Asset QR Modal */}
      {selectedAssetQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center">
              <span className="text-[10px] font-mono text-emerald-800 uppercase tracking-widest font-semibold">
                Lab Inventory Asset QR
              </span>
              <h3 className="text-sm font-bold text-stone-900 mt-1">{selectedAssetQR.name}</h3>
              <p className="text-xs text-stone-500">{selectedAssetQR.assetId} · {selectedAssetQR.lab}</p>
            </div>

            <QRCodeView
              value={selectedAssetQR.qrTag}
              size={160}
              subtitle={`Serial: ${selectedAssetQR.serialNumber} · Status: ${selectedAssetQR.status}`}
            />

            <div className="flex gap-2">
              <button
                onClick={() => {
                  onVerifyToken(selectedAssetQR.qrTag);
                  setSelectedAssetQR(null);
                }}
                className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg"
              >
                Test Scan Asset
              </button>
              <button
                onClick={() => setSelectedAssetQR(null)}
                className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-sm font-bold text-stone-900 mb-1">Register Laboratory Equipment</h3>
            <p className="text-xs text-stone-500 mb-4">
              Indexes new instrument and provisions a unique asset QR label.
            </p>

            <form onSubmit={handleCreateAsset} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">Equipment Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rigol Spectrum Analyzer 1.5GHz"
                  value={newAsset.name}
                  onChange={e => setNewAsset({ ...newAsset, name: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Asset Tag ID</label>
                  <input
                    type="text"
                    placeholder="e.g. SPEC-ANA-01"
                    value={newAsset.assetId}
                    onChange={e => setNewAsset({ ...newAsset, assetId: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Category</label>
                  <select
                    value={newAsset.category}
                    onChange={e => setNewAsset({ ...newAsset, category: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                  >
                    <option value="Robotics & Control">Robotics & Control</option>
                    <option value="Instrumentation">Instrumentation</option>
                    <option value="Embedded Systems">Embedded Systems</option>
                    <option value="High Performance Computing">HPC & AI</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Laboratory Location</label>
                <input
                  type="text"
                  placeholder="e.g. VLSI Lab (E-102)"
                  value={newAsset.lab}
                  onChange={e => setNewAsset({ ...newAsset, lab: e.target.value })}
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
                  Register Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
