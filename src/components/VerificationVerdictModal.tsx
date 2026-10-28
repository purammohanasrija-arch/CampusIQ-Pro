/**
 * CampusIQ Pro — Verification Verdict Modal
 * Displays cryptographic validation results, permissions, and allows 1-click redemption.
 */

import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ShieldCheck,
  X,
  ArrowRight,
  User,
  Calendar,
  MapPin,
  Check
} from 'lucide-react';
import { VerificationResult } from '../types/campus';

interface VerificationVerdictModalProps {
  result: VerificationResult | null;
  code: string;
  onClose: () => void;
  onRedeemed?: () => void;
}

export const VerificationVerdictModal: React.FC<VerificationVerdictModalProps> = ({
  result,
  code,
  onClose,
  onRedeemed,
}) => {
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState<string | null>(null);

  if (!result) return null;

  const isSuccess = result.valid;
  const isAlreadyUsed = result.status === 'Already Used' || result.status === 'Already Admitted' || result.status === 'Already Picked Up';
  const isExpired = result.status === 'Expired' || result.status === 'Deactivated';

  const handleRedeem = async () => {
    if (!result.redeemEndpoint) return;
    setIsRedeeming(true);
    try {
      const res = await fetch(result.redeemEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.payload || {}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to complete redemption');
      setRedeemSuccess(data.message || 'Check-in confirmed and pass marked as redeemed.');
      if (onRedeemed) onRedeemed();
    } catch (err: any) {
      alert(err.message || 'Redemption error');
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-stone-200">
        {/* Status Banner */}
        <div
          className={`p-6 text-center text-white ${
            isSuccess
              ? 'bg-emerald-700'
              : isAlreadyUsed
              ? 'bg-amber-600'
              : isExpired
              ? 'bg-orange-700'
              : 'bg-rose-700'
          }`}
        >
          <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-white/15 backdrop-blur-xs flex items-center justify-center">
            {isSuccess ? (
              <CheckCircle2 className="w-8 h-8 text-white" />
            ) : isAlreadyUsed ? (
              <Clock className="w-8 h-8 text-white" />
            ) : isExpired ? (
              <AlertTriangle className="w-8 h-8 text-white" />
            ) : (
              <XCircle className="w-8 h-8 text-white" />
            )}
          </div>
          <span className="text-[11px] font-mono tracking-widest uppercase opacity-80 block">
            {result.type || 'Verification'}
          </span>
          <h2 className="text-xl font-bold mt-1">
            {isSuccess ? 'Valid & Verified' : result.status}
          </h2>
          <p className="text-xs text-white/90 mt-1 max-w-xs mx-auto">
            {result.message}
          </p>
        </div>

        {/* Payload Details */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Token info */}
          <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-between text-xs font-mono text-stone-600">
            <span className="text-[10px] uppercase text-stone-400 font-sans font-semibold">Token</span>
            <span className="truncate max-w-[220px]" title={code}>{code}</span>
          </div>

          {/* Dynamic Payload Render */}
          {result.data && (
            <div className="space-y-2 text-xs">
              {result.data.name && (
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-500">Student Name</span>
                  <span className="font-semibold text-stone-900">{result.data.name}</span>
                </div>
              )}
              {result.data.rollNumber && (
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-500">Roll Number</span>
                  <span className="font-mono font-medium text-stone-900">{result.data.rollNumber}</span>
                </div>
              )}
              {result.data.department && (
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-500">Department</span>
                  <span className="font-medium text-stone-800 text-right">{result.data.department}</span>
                </div>
              )}
              {result.data.eventTitle && (
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-500">Event</span>
                  <span className="font-semibold text-stone-900 text-right">{result.data.eventTitle}</span>
                </div>
              )}
              {result.data.venue && (
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-500">Venue & Seat</span>
                  <span className="font-medium text-stone-800">{result.data.venue} ({result.data.seat})</span>
                </div>
              )}
              {result.data.roomNumber && (
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-500">Exam Room & Seat</span>
                  <span className="font-medium text-stone-900">{result.data.roomNumber} ({result.data.seatNumber})</span>
                </div>
              )}
              {result.data.destination && (
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-500">Destination</span>
                  <span className="font-medium text-stone-900">{result.data.destination}</span>
                </div>
              )}
              {result.data.orderNumber && (
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-500">Order Number</span>
                  <span className="font-mono font-bold text-emerald-800">{result.data.orderNumber}</span>
                </div>
              )}
              {result.data.title && (
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-500">Title</span>
                  <span className="font-medium text-stone-900 text-right">{result.data.title}</span>
                </div>
              )}
              {result.data.condition && (
                <div className="flex justify-between py-1 border-b border-stone-100">
                  <span className="text-stone-500">Asset Condition</span>
                  <span className="font-medium text-emerald-700">{result.data.condition}</span>
                </div>
              )}
            </div>
          )}

          {redeemSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{redeemSuccess}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 bg-white border border-stone-300 rounded-lg transition-colors"
          >
            Close
          </button>

          {result.canRedeem && !redeemSuccess && (
            <button
              onClick={handleRedeem}
              disabled={isRedeeming}
              className="flex-1 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              {isRedeeming ? (
                <span>Confirming...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admit & Record Action</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
