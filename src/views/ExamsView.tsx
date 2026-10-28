/**
 * CampusIQ Pro — Digital Examination Timetable & Hall Ticket System
 * Hall ticket issuance, seat allocations, reporting schedules, and printable QR hall tickets.
 */

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Printer,
  QrCode,
  ShieldCheck,
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  GraduationCap,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Exam, HallTicket, UserRole } from '../types/campus';
import { QRCodeView } from '../components/QRCodeView';
import { api } from '../services/api';

interface ExamsViewProps {
  exams: Exam[];
  hallTickets: HallTicket[];
  userRole: UserRole;
  onRefresh: () => void;
  onVerifyToken: (token: string) => void;
}

export const ExamsView: React.FC<ExamsViewProps> = ({
  exams,
  hallTickets,
  userRole,
  onRefresh,
  onVerifyToken,
}) => {
  const [selectedTicket, setSelectedTicket] = useState<HallTicket | null>(hallTickets[0] || null);
  const [generating, setGenerating] = useState(false);

  const handleGenerateTicket = async () => {
    setGenerating(true);
    try {
      const res = await api.generateHallTicket();
      onRefresh();
      setSelectedTicket(res.hallTicket);
    } catch (err: any) {
      alert(err.message || 'Hall ticket generation failed');
    } finally {
      setGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <span>Digital Examination Timetable & Hall Tickets</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Autumn 2026 Controller of Exams
            </span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Verified candidate seating charts, subject timetables, and tamper-proof QR hall passes with eligibility clearance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedTicket ? (
            <button
              onClick={handlePrint}
              className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Hall Ticket</span>
            </button>
          ) : (
            <button
              onClick={handleGenerateTicket}
              disabled={generating}
              className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>{generating ? 'Generating...' : 'Issue My Hall Ticket'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Scheduled Subjects & Digital Hall Ticket Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Scheduled Exams Table (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-stone-200 bg-stone-50/70 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-stone-900">End Semester Exam Timetable</h3>
              <p className="text-[11px] text-stone-500">B.Tech Semester VI · Autumn 2026 Session</p>
            </div>
            <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
              3 Papers Scheduled
            </span>
          </div>

          <div className="divide-y divide-stone-100">
            {exams.map(exam => (
              <div key={exam.id} className="p-4 hover:bg-stone-50 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded">
                    {exam.courseCode}
                  </span>
                  <span className="text-[10px] text-stone-400 font-medium">
                    Reporting: <strong className="text-stone-700">{exam.reportingTime}</strong>
                  </span>
                </div>

                <h4 className="text-sm font-bold text-stone-900 mt-1">
                  {exam.subjectName}
                </h4>

                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-stone-100 text-[11px] text-stone-500">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-stone-400" />
                    <span>{exam.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>{exam.session}</span>
                  </div>
                  <div className="flex items-center gap-1.5 col-span-2">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    <span>{exam.roomNumber}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Digital Hall Ticket Official Certificate View (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-700">Official Candidate Admit Card</span>
            {selectedTicket && (
              <button
                onClick={() => onVerifyToken(selectedTicket.qrToken)}
                className="text-xs text-emerald-800 hover:underline font-semibold flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verify Gate Admission QR</span>
              </button>
            )}
          </div>

          {selectedTicket ? (
            <div className="bg-white rounded-2xl border-2 border-stone-800 p-6 shadow-lg space-y-5 print:border-black">
              {/* Header Certificate */}
              <div className="border-b-2 border-stone-800 pb-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <GraduationCap className="w-6 h-6 text-emerald-800" />
                  <h3 className="text-base font-extrabold uppercase tracking-wide text-stone-900">
                    CampusIQ Institute of Technology
                  </h3>
                </div>
                <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-widest">
                  Office of the Controller of Examinations
                </h4>
                <p className="text-[10px] text-stone-500 mt-0.5 font-medium">
                  Official Admit Card & Examination Hall Ticket — Autumn 2026
                </p>
              </div>

              {/* Student Bio Split with QR */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-stone-50 p-4 rounded-xl border border-stone-200">
                <div className="space-y-1 text-xs min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-stone-500">Candidate:</span>
                    <strong className="text-stone-900 font-bold text-sm">{selectedTicket.studentName}</strong>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-stone-500">Roll No:</span>
                    <span className="font-mono font-bold text-emerald-800">{selectedTicket.rollNumber}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-stone-500">Desk / Seat:</span>
                    <strong className="text-stone-900 font-mono">{selectedTicket.seatNumber}</strong>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-stone-500">Venue:</span>
                    <span className="text-stone-800 font-medium">{selectedTicket.roomNumber}</span>
                  </div>
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-800 bg-emerald-100 font-semibold px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                      <span>{selectedTicket.eligibilityStatus}</span>
                    </span>
                  </div>
                </div>

                <div className="p-2 bg-white rounded-lg border border-stone-200 shrink-0 text-center">
                  <QRCodeView value={selectedTicket.qrToken} size={110} showDownload={false} />
                  <span className="text-[9px] font-mono text-stone-400 block mt-1">Gate Verification QR</span>
                </div>
              </div>

              {/* Subject Schedule on Ticket */}
              <div>
                <h5 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                  Permitted Papers & Assigned Examination Halls
                </h5>
                <div className="border border-stone-200 rounded-lg overflow-hidden text-xs">
                  <div className="bg-stone-100 px-3 py-1.5 font-semibold text-stone-600 grid grid-cols-12 gap-2 text-[11px]">
                    <span className="col-span-6">Subject</span>
                    <span className="col-span-3">Date</span>
                    <span className="col-span-3 text-right">Hall</span>
                  </div>
                  <div className="divide-y divide-stone-100">
                    {selectedTicket.examDates.map((item, idx) => (
                      <div key={idx} className="px-3 py-2 grid grid-cols-12 gap-2 text-stone-800">
                        <span className="col-span-6 font-medium truncate">{item.subject}</span>
                        <span className="col-span-3 text-stone-500 font-mono text-[11px]">{item.date}</span>
                        <span className="col-span-3 text-right font-mono font-medium">{item.room}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Instructions & Security Seal */}
              <div className="text-[10px] text-stone-500 space-y-1 border-t border-stone-200 pt-3">
                <p>1. Candidates must arrive at the examination center 30 minutes prior to reporting time.</p>
                <p>2. Electronic gadgets, unauthorized notes, and bags are prohibited inside exam halls.</p>
                <p>3. Hall ticket is valid only when verified with official student photo ID card at gate entrance.</p>
              </div>
            </div>
          ) : (
            <div className="bg-stone-50 border-2 border-dashed border-stone-300 rounded-2xl p-8 text-center space-y-3">
              <FileSpreadsheet className="w-10 h-10 mx-auto text-stone-400" />
              <h4 className="text-sm font-bold text-stone-700">No Hall Ticket Generated Yet</h4>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Generate your Autumn 2026 Hall Ticket to obtain your assigned exam desk and entry QR code.
              </p>
              <button
                onClick={handleGenerateTicket}
                disabled={generating}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                {generating ? 'Generating Ticket...' : 'Generate Official Hall Ticket'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
