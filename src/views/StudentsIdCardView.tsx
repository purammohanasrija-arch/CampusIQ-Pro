/**
 * CampusIQ Pro — Digital Student ID Card Generator & Student Roster
 * Flip 3D digital college ID card, cryptographic QR pass, NFC tag simulation, and admin lifecycle controls.
 */

import React, { useState } from 'react';
import {
  CreditCard,
  QrCode,
  Download,
  RotateCw,
  Plus,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Radio,
  UserCheck,
  Sparkles,
  Phone,
  Mail,
  GraduationCap,
  Calendar,
  Building,
  Volume2
} from 'lucide-react';
import { Student, UserRole } from '../types/campus';
import { QRCodeView } from '../components/QRCodeView';
import { api } from '../services/api';
import { audioFeedback } from '../utils/audioFeedback';

interface StudentsIdCardViewProps {
  students: Student[];
  userRole: UserRole;
  onRefresh: () => void;
  onVerifyToken: (token: string) => void;
}

export const StudentsIdCardView: React.FC<StudentsIdCardViewProps> = ({
  students,
  userRole,
  onRefresh,
  onVerifyToken,
}) => {
  const [selectedStudent, setSelectedStudent] = useState<Student>(students[0] || null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    department: 'Computer Science & Engineering',
    course: 'B.Tech CS (AI & Data Systems)',
    email: '',
    emergencyContact: '',
    bloodGroup: 'O+ve',
  });

  const canAdministerCards =
    userRole === 'Super Administrator' || userRole === 'College Administrator' || userRole === 'Faculty';

  const handleCardAction = async (action: 'renew' | 'deactivate' | 'reissue' | 'activate') => {
    if (!selectedStudent) return;
    setActionLoading(true);
    try {
      const res = await api.updateStudentCard(selectedStudent.id, action);
      setSelectedStudent(res.student);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.rollNumber) return;
    try {
      const res = await api.createStudent(formData);
      setShowAddModal(false);
      onRefresh();
      setSelectedStudent(res.student);
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
            <span>Digital Student ID Card Generator</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Cryptographic NFC/QR Pass
            </span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Official verifiable college identity cards with dynamic QR verification, validity tracking, and lifecycle administration.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canAdministerCards && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Enroll New Student</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: ID Card Preview & Student List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive ID Card Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-700">Digital Smart Card Preview</span>
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="text-xs text-emerald-800 hover:underline flex items-center gap-1 font-medium"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Flip to {isFlipped ? 'Front' : 'Back (QR / NFC)'}</span>
            </button>
          </div>

          {selectedStudent && (
            <div className="relative mx-auto max-w-sm w-full transition-all duration-300">
              {!isFlipped ? (
                /* FRONT OF CARD */
                <div className="relative rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white p-6 shadow-xl border border-emerald-700 overflow-hidden min-h-[390px] flex flex-col justify-between">
                  {/* Holographic watermark background */}
                  <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />
                  <div className="absolute top-0 right-0 p-4 opacity-15">
                    <GraduationCap className="w-32 h-32" />
                  </div>

                  {/* Header */}
                  <div>
                    <div className="flex items-center justify-between border-b border-emerald-700/60 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                          <GraduationCap className="w-4 h-4 text-emerald-300" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold tracking-tight uppercase leading-none">
                            CampusIQ Institute of Technology
                          </h4>
                          <span className="text-[9px] text-emerald-300 font-medium">Autonomous Smart Campus</span>
                        </div>
                      </div>
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          selectedStudent.idCardStatus === 'Active'
                            ? 'bg-emerald-400 text-emerald-950'
                            : 'bg-rose-500 text-white'
                        }`}
                      >
                        {selectedStudent.idCardStatus}
                      </span>
                    </div>

                    {/* Student Info & Photo */}
                    <div className="flex items-start gap-4 mt-5">
                      <div className="w-20 h-24 rounded-xl overflow-hidden border-2 border-emerald-400/80 shadow-md bg-stone-800 shrink-0">
                        <img
                          src={selectedStudent.photo || '/src/assets/images/student_aarav_sharma.jpg'}
                          alt={selectedStudent.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.currentTarget as HTMLImageElement;
                            target.onerror = null;
                            target.src = '/src/assets/images/student_aarav_sharma.jpg';
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] text-emerald-300 uppercase tracking-widest font-mono">
                          {selectedStudent.rollNumber}
                        </span>
                        <h3 className="text-base font-bold text-white truncate mt-0.5">
                          {selectedStudent.name}
                        </h3>
                        <p className="text-xs text-emerald-100 font-medium mt-1 leading-tight">
                          {selectedStudent.course}
                        </p>
                        <p className="text-[11px] text-emerald-200/80 mt-0.5">
                          {selectedStudent.department}
                        </p>
                        <p className="text-[10px] text-emerald-300 font-mono mt-1">
                          {selectedStudent.year} · {selectedStudent.semester}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom / NFC Bar */}
                  <div className="pt-4 border-t border-emerald-700/60 mt-4 flex items-center justify-between text-[10px]">
                    <div className="flex items-center gap-1.5 text-emerald-200">
                      <Radio className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                      <span className="font-mono">{selectedStudent.rfidTag}</span>
                    </div>
                    <div className="text-right text-emerald-200">
                      <span>Valid Thru: </span>
                      <strong className="text-white font-mono">{selectedStudent.idCardExpiryDate}</strong>
                    </div>
                  </div>
                </div>
              ) : (
                /* BACK OF CARD */
                <div className="relative rounded-2xl bg-stone-900 text-white p-6 shadow-xl border border-stone-700 min-h-[390px] flex flex-col justify-between">
                  <div className="text-center">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400">
                      Universal QR Verification Badge
                    </span>
                    <p className="text-xs text-stone-400 mt-0.5">
                      Present at gates, library, examination halls, and canteen
                    </p>
                  </div>

                  {/* QR Box */}
                  <div className="my-auto flex flex-col items-center">
                    <div className="p-3 bg-white rounded-xl shadow-lg">
                      <QRCodeView value={selectedStudent.qrToken} size={150} showDownload={false} />
                    </div>
                  </div>

                  {/* Emergency & Terms */}
                  <div className="text-[10px] text-stone-400 border-t border-stone-800 pt-3 space-y-1">
                    <div className="flex justify-between">
                      <span>Emergency Helpline:</span>
                      <span className="text-white font-mono">{selectedStudent.emergencyContact}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Blood Group:</span>
                      <span className="text-white font-semibold">{selectedStudent.bloodGroup}</span>
                    </div>
                    <p className="text-[9px] text-stone-500 pt-1 text-center">
                      Property of CampusIQ Institute. If found, please return to Central Security.
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons below preview */}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => onVerifyToken(selectedStudent.qrToken)}
                  className="flex-1 py-2 px-3 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verify Card Status</span>
                </button>

                <button
                  type="button"
                  onClick={() => audioFeedback.speakAttendanceMarked(selectedStudent.name, selectedStudent.rollNumber)}
                  className="py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg border border-stone-300 transition-colors flex items-center justify-center gap-1.5"
                  title="Announce student name & roll number aloud"
                >
                  <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Voice Roll / Name</span>
                </button>

                {canAdministerCards && (
                  <>
                    {selectedStudent.idCardStatus === 'Active' ? (
                      <button
                        onClick={() => handleCardAction('deactivate')}
                        disabled={actionLoading}
                        className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-lg transition-colors"
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => handleCardAction('activate')}
                        disabled={actionLoading}
                        className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-semibold rounded-lg transition-colors"
                      >
                        Re-Activate
                      </button>
                    )}

                    <button
                      onClick={() => handleCardAction('renew')}
                      disabled={actionLoading}
                      className="py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg transition-colors"
                    >
                      Renew
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Student Directory & Roster (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-stone-200 bg-stone-50/70 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-stone-900">Enrolled Student Roster</h3>
              <p className="text-[11px] text-stone-500">Select any student to inspect digital credential</p>
            </div>
            <span className="text-xs text-emerald-800 font-semibold font-mono">
              {students.length} Total
            </span>
          </div>

          <div className="divide-y divide-stone-100 max-h-[520px] overflow-y-auto">
            {students.map(student => {
              const isSelected = selectedStudent?.id === student.id;
              return (
                <div
                  key={student.id}
                  onClick={() => {
                    setSelectedStudent(student);
                    setIsFlipped(false);
                  }}
                  className={`p-4 flex items-center justify-between hover:bg-stone-50 cursor-pointer transition-colors ${
                    isSelected ? 'bg-emerald-50/50 border-l-4 border-emerald-700' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={student.photo || '/src/assets/images/student_aarav_sharma.jpg'}
                      alt={student.name}
                      className="w-10 h-10 rounded-full object-cover border border-stone-200 shrink-0"
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.onerror = null;
                        target.src = '/src/assets/images/student_aarav_sharma.jpg';
                      }}
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-stone-900 truncate">{student.name}</span>
                        <span className="text-[10px] font-mono text-stone-500">{student.rollNumber}</span>
                      </div>
                      <p className="text-[11px] text-stone-500 truncate">{student.department}</p>
                      <div className="flex items-center gap-3 text-[10px] text-stone-400 mt-0.5">
                        <span>GPA: <strong className="text-stone-700">{student.gpa}</strong></span>
                        <span>Attendance: <strong className="text-emerald-700">{student.attendancePercentage}%</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        student.idCardStatus === 'Active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {student.idCardStatus}
                    </span>
                    <span className="text-[10px] text-stone-400 block mt-1 font-mono">
                      {student.rfidTag}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-sm font-bold text-stone-900 mb-1">Enroll Student & Issue Digital ID</h3>
            <p className="text-xs text-stone-500 mb-4">
              Enrolls student record into university database with cryptographically signed QR card.
            </p>

            <form onSubmit={handleCreateStudent} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kenneth Vance"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Roll Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. CS-2024-180"
                  value={formData.rollNumber}
                  onChange={e => setFormData({ ...formData, rollNumber: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white font-mono"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Department</label>
                <select
                  value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                >
                  <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                  <option value="Electronics & Communication">Electronics & Communication</option>
                  <option value="Mechanical & Mechatronics">Mechanical & Mechatronics</option>
                  <option value="Biomedical Engineering">Biomedical Engineering</option>
                  <option value="Civil & Environmental">Civil & Environmental</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Emergency Contact</label>
                <input
                  type="text"
                  placeholder="+1 (555) 000-0000"
                  value={formData.emergencyContact}
                  onChange={e => setFormData({ ...formData, emergencyContact: e.target.value })}
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
                  Create & Issue Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
