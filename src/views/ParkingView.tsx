/**
 * CampusIQ Pro — Smart Campus Parking Management
 * Zone-wise interactive parking slots, real-time occupancy grid, and QR vehicle permits.
 */

import React, { useState } from 'react';
import {
  Car,
  CheckCircle2,
  AlertCircle,
  QrCode,
  ShieldCheck,
  Plus,
  Zap,
  Clock,
  ArrowRight
} from 'lucide-react';
import { ParkingSlot, ParkingPermit, UserRole } from '../types/campus';
import { QRCodeView } from '../components/QRCodeView';
import { api } from '../services/api';

interface ParkingViewProps {
  slots: ParkingSlot[];
  permits: ParkingPermit[];
  userRole: UserRole;
  onRefresh: () => void;
  onVerifyToken: (token: string) => void;
}

export const ParkingView: React.FC<ParkingViewProps> = ({
  slots,
  permits,
  userRole,
  onRefresh,
  onVerifyToken,
}) => {
  const [selectedSlotForReserve, setSelectedSlotForReserve] = useState<ParkingSlot | null>(null);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('Car');
  const [selectedPermitQR, setSelectedPermitQR] = useState<ParkingPermit | null>(permits[0] || null);
  const [actionLoading, setActionLoading] = useState(false);

  const canManageParking =
    userRole === 'Super Administrator' || userRole === 'College Administrator' || userRole === 'Security Staff';

  const totalSlots = slots.length;
  const availableSlots = slots.filter(s => s.status === 'Available').length;
  const occupiedSlots = slots.filter(s => s.status === 'Occupied').length;
  const reservedSlots = slots.filter(s => s.status === 'Reserved').length;

  const handleReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlotForReserve || !vehicleNumber.trim()) return;
    setActionLoading(true);
    try {
      const res = await api.reserveParking(selectedSlotForReserve.id, vehicleNumber.trim(), vehicleType);
      setSelectedSlotForReserve(null);
      setVehicleNumber('');
      onRefresh();
      setSelectedPermitQR(res.permit);
    } catch (err: any) {
      alert(err.message || 'Reservation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSlotAction = async (slotId: string, action: 'occupy' | 'vacate') => {
    try {
      await api.performParkingAction(slotId, action);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <span>Smart Parking Allocation & QR Permits</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Live Sensor Emulation
            </span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Visual slot layout across campus engineering quadrants, EV charging spots, and vehicle barcode barrier access.
          </p>
        </div>

        {selectedPermitQR && (
          <button
            onClick={() => onVerifyToken(selectedPermitQR.qrPass)}
            className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <QrCode className="w-4 h-4 text-emerald-800" />
            <span>Verify Parking Permit</span>
          </button>
        )}
      </div>

      {/* Occupancy KPI Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-500 font-medium">Total Capacity</span>
          <p className="text-2xl font-bold text-stone-900 mt-1 tabular-nums">{totalSlots} Slots</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-xs">
          <span className="text-xs text-emerald-700 font-medium">Available Now</span>
          <p className="text-2xl font-bold text-emerald-800 mt-1 tabular-nums">{availableSlots}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-xs">
          <span className="text-xs text-amber-700 font-medium">Reserved</span>
          <p className="text-2xl font-bold text-amber-800 mt-1 tabular-nums">{reservedSlots}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-stone-200 shadow-xs">
          <span className="text-xs text-rose-700 font-medium">Occupied</span>
          <p className="text-2xl font-bold text-rose-800 mt-1 tabular-nums">{occupiedSlots}</p>
        </div>
      </div>

      {/* Interactive Parking Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Slot visualizer (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider mb-3">
              Zone A & B Parking Quadrants
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Green spots are available for immediate reservation. Click any available bay to reserve.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {slots.map(slot => {
                const isAvail = slot.status === 'Available';
                const isOccupied = slot.status === 'Occupied';
                const isReserved = slot.status === 'Reserved';

                return (
                  <div
                    key={slot.id}
                    onClick={() => isAvail && setSelectedSlotForReserve(slot)}
                    className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between min-h-[140px] ${
                      isAvail
                        ? 'border-emerald-500/80 bg-emerald-50/30 hover:bg-emerald-50 hover:shadow-md'
                        : isOccupied
                        ? 'border-rose-400 bg-rose-50/40 cursor-not-allowed'
                        : 'border-amber-400 bg-amber-50/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-stone-900 bg-white px-2 py-0.5 rounded shadow-2xs">
                        {slot.slotNumber}
                      </span>
                      {slot.type.includes('EV') && (
                        <span className="p-1 rounded bg-teal-100 text-teal-800" title="EV Charging Available">
                          <Zap className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </div>

                    <div className="my-2">
                      <Car
                        className={`w-8 h-8 ${
                          isAvail
                            ? 'text-emerald-300'
                            : isOccupied
                            ? 'text-rose-600'
                            : 'text-amber-600'
                        }`}
                      />
                      <p className="text-[10px] text-stone-500 mt-1 line-clamp-1">{slot.type}</p>
                      {slot.currentVehicle && (
                        <p className="text-[10px] font-mono font-bold text-stone-800 truncate">
                          {slot.currentVehicle}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-stone-200/60 flex items-center justify-between text-[10px]">
                      <span
                        className={`font-semibold ${
                          isAvail
                            ? 'text-emerald-700'
                            : isOccupied
                            ? 'text-rose-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {slot.status}
                      </span>

                      {canManageParking && (
                        <div className="flex items-center gap-1">
                          {isOccupied ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSlotAction(slot.id, 'vacate');
                              }}
                              className="px-1.5 py-0.5 bg-stone-200 text-stone-800 rounded text-[9px] font-semibold"
                            >
                              Vacate
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSlotAction(slot.id, 'occupy');
                              }}
                              className="px-1.5 py-0.5 bg-rose-100 text-rose-800 rounded text-[9px] font-semibold"
                            >
                              Occupy
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Active Permit QR Pass (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
            <h3 className="text-xs font-bold text-stone-900 mb-3 flex items-center justify-between">
              <span>Verified Campus Parking Pass</span>
              <span className="text-[10px] text-emerald-800 font-semibold font-mono">RFID ENABLED</span>
            </h3>

            {selectedPermitQR ? (
              <div className="space-y-4">
                <QRCodeView
                  value={selectedPermitQR.qrPass}
                  size={150}
                  subtitle={`Slot: ${selectedPermitQR.slotNumber} · Vehicle: ${selectedPermitQR.vehicleNumber}`}
                />

                <div className="space-y-1.5 text-xs border-t border-stone-100 pt-3">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Vehicle Type</span>
                    <span className="font-semibold text-stone-900">{selectedPermitQR.vehicleType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">License Plate</span>
                    <span className="font-mono font-bold text-stone-900">{selectedPermitQR.vehicleNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Valid Date</span>
                    <span className="font-mono text-stone-600">{selectedPermitQR.validDate}</span>
                  </div>
                </div>

                <button
                  onClick={() => onVerifyToken(selectedPermitQR.qrPass)}
                  className="w-full py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Simulate Boom Barrier Scan
                </button>
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-stone-400">
                No active parking permit. Reserve an available spot on the left.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Slot Reservation Modal */}
      {selectedSlotForReserve && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-sm font-bold text-stone-900 mb-1">
              Reserve Parking Bay {selectedSlotForReserve.slotNumber}
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Zone: {selectedSlotForReserve.zone} ({selectedSlotForReserve.type})
            </p>

            <form onSubmit={handleReserve} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">Vehicle License Plate</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HONDA-CIV-9081"
                  value={vehicleNumber}
                  onChange={e => setVehicleNumber(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Vehicle Type</label>
                <select
                  value={vehicleType}
                  onChange={e => setVehicleType(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                >
                  <option value="Car">Car / Sedan / SUV</option>
                  <option value="Electric Vehicle">Electric Vehicle (EV)</option>
                  <option value="Motorcycle / Scooter">Two-Wheeler</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setSelectedSlotForReserve(null)}
                  className="px-4 py-2 text-stone-600 hover:text-stone-900 bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-lg shadow-xs"
                >
                  {actionLoading ? 'Reserving...' : 'Confirm & Generate Pass'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
