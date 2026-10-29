/**
 * CampusIQ Pro — Advanced Classroom Attendance & NFC Emulation
 * Time-limited dynamic QR attendance sessions, simulated NFC smartcard taps, and real-time voice speech announcement.
 */

import React, { useState, useEffect } from 'react';
import {
  Radio,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Play,
  Volume2,
  VolumeX,
  Zap,
  User,
  Users,
  Mic,
  MicOff,
  Sparkles,
  ChevronDown,
  Volume1
} from 'lucide-react';
import { AttendanceSession, AttendanceSummary, UserRole, Student } from '../types/campus';
import { QRCodeView } from '../components/QRCodeView';
import { api } from '../services/api';
import { audioFeedback, VoiceAnnouncementMode } from '../utils/audioFeedback';

interface AttendanceViewProps {
  sessions: AttendanceSession[];
  summary: AttendanceSummary;
  records: any[];
  userRole: UserRole;
  onRefresh: () => void;
  onVerifyToken: (token: string) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  sessions,
  summary,
  records,
  userRole,
  onRefresh,
  onVerifyToken,
}) => {
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(sessions[0] || null);
  const [nfcTapping, setNfcTapping] = useState(false);
  const [nfcSuccess, setNfcSuccess] = useState<string | null>(null);
  const [nfcError, setNfcError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(audioFeedback.isMuted());
  const [voiceEnabled, setVoiceEnabled] = useState(audioFeedback.isVoiceEnabled());
  const [voiceMode, setVoiceMode] = useState<VoiceAnnouncementMode>(audioFeedback.getVoiceMode());
  const [lastSpokenText, setLastSpokenText] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [tapResultModal, setTapResultModal] = useState<{
    student: { id: string; name: string; rollNumber: string; department?: string; photo?: string; rfidTag?: string };
    record: any;
    message: string;
    timestamp: string;
  } | null>(null);

  // Student list for NFC Tap simulation
  const [studentsList, setStudentsList] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('STU-2024-001');

  const [newSessionForm, setNewSessionForm] = useState({
    courseCode: 'CS602',
    courseName: 'Advanced Machine Learning & Neural Nets',
  });

  const canStartSession =
    userRole === 'Super Administrator' || userRole === 'College Administrator' || userRole === 'Faculty';

  // Keep activeSession synchronized whenever parent updates sessions
  useEffect(() => {
    if (sessions && sessions.length > 0) {
      setActiveSession(prev => {
        if (!prev) return sessions[0];
        const match = sessions.find(s => s.id === prev.id || s.courseCode === prev.courseCode);
        return match || sessions[0];
      });
    }
  }, [sessions]);

  // Load students for simulator selection
  useEffect(() => {
    let isMounted = true;
    api.getStudents()
      .then(res => {
        if (isMounted && res.students && res.students.length > 0) {
          setStudentsList(res.students);
          if (!selectedStudentId && res.students[0]) {
            setSelectedStudentId(res.students[0].id);
          }
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const activeStudent: Student = studentsList.find(s => s.id === selectedStudentId) || studentsList[0] || {
    id: 'STU-2024-001',
    name: 'Aarav Sharma',
    rollNumber: '241FA04001',
    department: 'Computer Science & Engineering',
    rfidTag: 'NFC-994821-CS',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&fit=crop&q=80',
    email: 'aarav.sharma@campusiq.edu',
    course: 'B.Tech Computer Science',
    year: '4th Year',
    semester: '7th Semester',
    gpa: 3.92,
    attendancePercentage: 94.5,
    bloodGroup: 'O+',
    emergencyContact: '+91 98765 43210',
    idCardStatus: 'Active',
    idCardIssuedDate: '2024-08-01',
    idCardExpiryDate: '2028-06-30',
    qrToken: 'STU-241FA04001',
    mentor: 'Dr. Rajesh Rao'
  };

  const handleToggleMute = () => {
    const nextMuted = audioFeedback.toggleMute();
    setIsMuted(nextMuted);
    setVoiceEnabled(audioFeedback.isVoiceEnabled());
    if (!nextMuted) {
      try {
        audioFeedback.playNfcBeepSound();
      } catch (_) {}
    }
  };

  const handleToggleVoice = () => {
    const nextVoice = audioFeedback.toggleVoice();
    setVoiceEnabled(nextVoice);
    if (nextVoice) {
      try {
        const sampleText = audioFeedback.speakAttendanceMarked(
          activeStudent?.name || 'Aarav Sharma',
          activeStudent?.rollNumber || '241FA04001',
          voiceMode
        );
        setLastSpokenText(sampleText);
      } catch (_) {}
    }
  };

  const handleChangeVoiceMode = (mode: VoiceAnnouncementMode) => {
    audioFeedback.setVoiceMode(mode);
    setVoiceMode(mode);
    try {
      const spoken = audioFeedback.speakAttendanceMarked(
        activeStudent?.name || 'Aarav Sharma',
        activeStudent?.rollNumber || '241FA04001',
        mode
      );
      setLastSpokenText(spoken);
    } catch (_) {}
    setIsSpeaking(true);
    setTimeout(() => setIsSpeaking(false), 2400);
  };

  const handleTestBeep = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      audioFeedback.playNfcBeepSound();
    } catch (_) {}
  };

  const handleTestVoice = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSpeaking(true);
    try {
      const spoken = audioFeedback.speakAttendanceMarked(
        activeStudent?.name || 'Aarav Sharma',
        activeStudent?.rollNumber || '241FA04001',
        voiceMode
      );
      setLastSpokenText(spoken);
    } catch (_) {}
    setTimeout(() => setIsSpeaking(false), 2600);
  };

  const handleSimulateNfcTap = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (nfcTapping) return;

    setNfcTapping(true);
    setNfcSuccess(null);
    setNfcError(null);

    // 1. Instant realistic contactless NFC SmartCard confirmation chime (safely wrapped)
    try {
      audioFeedback.playNfcBeepSound();
    } catch (soundErr) {
      console.warn('Audio feedback failed:', soundErr);
    }

    try {
      const targetStudent = activeStudent || (studentsList.length > 0 ? studentsList[0] : {
        id: 'STU-2024-001',
        name: 'Aarav Sharma',
        rollNumber: '241FA04001',
        department: 'Computer Science & Engineering',
        rfidTag: 'NFC-994821-CS',
      });

      const courseCode = activeSession?.courseCode || 'CS601';
      const res = await api.markAttendance(courseCode, 'NFC SmartCard Tap', targetStudent.id);
      
      const studentName = res.student?.name || targetStudent.name;
      const rollNo = res.student?.rollNumber || targetStudent.rollNumber;
      const studentPhoto = (res.student as any)?.photo || (targetStudent as any)?.photo;
      const studentDept = (res.student as any)?.department || targetStudent.department;
      
      setNfcSuccess(res.message);

      // Optimistically update session present count
      if (activeSession) {
        setActiveSession(prev => prev ? {
          ...prev,
          totalPresent: (prev.totalPresent || 0) + 1
        } : null);
      }

      // Display immediate interactive popup confirmation
      setTapResultModal({
        student: {
          id: targetStudent.id,
          name: studentName,
          rollNumber: rollNo,
          department: studentDept,
          photo: studentPhoto,
          rfidTag: targetStudent.rfidTag || 'NFC-994821-CS',
        },
        record: res.record,
        message: res.message,
        timestamp: new Date().toLocaleTimeString(),
      });

      // Synchronize parent attendance records
      try {
        onRefresh();
      } catch (_) {}

      // 2. Clear real-time voice speech announcement: speaks marked roll number or name
      setTimeout(() => {
        try {
          setIsSpeaking(true);
          const spoken = audioFeedback.speakAttendanceMarked(studentName, rollNo, voiceMode);
          setLastSpokenText(spoken);
          setTimeout(() => setIsSpeaking(false), 2600);
        } catch (_) {}
      }, 200);

    } catch (err: any) {
      try {
        audioFeedback.playErrorSound();
      } catch (_) {}
      setNfcError(err.message || 'NFC SmartCard tap failed');
    } finally {
      setTimeout(() => {
        setNfcTapping(false);
      }, 350);
    }
  };

  const handleStartSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.startAttendanceSession(newSessionForm.courseCode, newSessionForm.courseName);
      setShowStartModal(false);
      onRefresh();
      setActiveSession(res.session);
    } catch (err: any) {
      alert(err.message || 'Session creation failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <span>Dynamic Classroom Attendance & NFC Terminal</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Anti-Proxy Rotating Tokens
            </span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Time-limited dynamic QR code sessions, contactless NFC smartcard emulation, and real-time voice speech announcement.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {canStartSession && (
            <button
              onClick={() => setShowStartModal(true)}
              className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Play className="w-4 h-4" />
              <span>Launch Lecture QR Session</span>
            </button>
          )}
        </div>
      </div>

      {/* Course Breakdown KPI Strips */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summary?.courses?.map(c => {
          const isAtRisk = c.pct < summary.thresholdMinimum;
          return (
            <div
              key={c.code}
              className={`p-4 rounded-xl border bg-white shadow-xs ${
                isAtRisk ? 'border-amber-300' : 'border-stone-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                  {c.code}
                </span>
                <span
                  className={`text-xs font-bold tabular-nums ${
                    isAtRisk ? 'text-amber-800' : 'text-emerald-800'
                  }`}
                >
                  {c.pct}%
                </span>
              </div>
              <h4 className="text-xs font-bold text-stone-900 line-clamp-1 mt-1">{c.name}</h4>
              <p className="text-[11px] text-stone-500 mt-0.5 tabular-nums">
                Attended: <strong>{c.attended}</strong> / {c.total} Lectures
              </p>

              {/* Progress bar */}
              <div className="w-full bg-stone-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className={`h-full rounded-full ${isAtRisk ? 'bg-amber-500' : 'bg-emerald-600'}`}
                  style={{ width: `${Math.min(100, c.pct)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Active QR Session on left, Simulated NFC Tap on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Active Dynamic QR Lecture Session (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200">
            <div>
              <span className="text-[10px] font-mono uppercase text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                Active Classroom QR Session
              </span>
              <h3 className="text-base font-bold text-stone-900 mt-1">
                {activeSession ? `${activeSession.courseCode} — ${activeSession.courseName}` : 'No Active Session'}
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Instructor: {activeSession?.facultyName} · Room NB-101 (New Academic Block)
              </p>
            </div>

            {activeSession && (
              <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Live Session
              </span>
            )}
          </div>

          {activeSession ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-stone-50 p-6 rounded-2xl border border-stone-200">
              <div className="space-y-3 text-xs flex-1">
                <div className="p-2.5 rounded-lg bg-emerald-100/70 text-emerald-950 font-medium space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Clock className="w-4 h-4 text-emerald-800" />
                    <span>Time Window: {activeSession.timeWindow}</span>
                  </div>
                  <p className="text-[11px] text-emerald-900">
                    Students must be connected to campus Wi-Fi & scan within the active 30-minute lecture window.
                  </p>
                </div>

                <div className="space-y-1 text-stone-600">
                  <p>Secret Session PIN: <strong className="font-mono text-stone-900 text-sm">{activeSession.sessionCode}</strong></p>
                  <p>Enrolled Candidates: <strong className="text-stone-900">{activeSession.totalEnrolled}</strong></p>
                  <p>Attendance Verified: <strong className="text-emerald-800 font-bold">{activeSession.totalPresent} Present</strong></p>
                </div>

                <button
                  onClick={() => onVerifyToken(activeSession.activeQrToken)}
                  className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold shadow-xs"
                >
                  Test Scan Lecture QR
                </button>
              </div>

              <div className="p-3 bg-white rounded-xl shadow-md border border-stone-200 shrink-0 text-center">
                <QRCodeView
                  value={activeSession.activeQrToken}
                  size={150}
                  subtitle="Project on Hall Screen"
                  showDownload={false}
                />
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-stone-400">
              No lecture QR session currently running. Launch a session to start taking classroom attendance.
            </div>
          )}
        </div>

        {/* Right: Simulated NFC / RFID Smart Card Tap Terminal (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-emerald-800" />
                <h3 className="text-sm font-bold text-stone-900">NFC SmartCard Reader Simulator</h3>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Emulates contactless NFC hardware mounted at classroom doorways for zero-click smart ID tap attendance.
              </p>
            </div>

            {/* Terminal Audio & Beep Controls */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={handleToggleMute}
                className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                  isMuted
                    ? 'bg-rose-50 border-rose-200 text-rose-700'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}
                title={isMuted ? 'Unmute Terminal Audio' : 'Mute Terminal Audio'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={handleTestBeep}
                className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 border border-stone-300 text-[11px] font-mono text-stone-700 flex items-center gap-1 transition-colors"
                title="Play test NFC SmartCard beep"
              >
                <Zap className="w-3 h-3 text-emerald-600" />
                <span>Test Beep</span>
              </button>
            </div>
          </div>

          {/* Voice Announcement Preference Bar */}
          <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-stone-800">
                <Volume1 className="w-4 h-4 text-emerald-700" />
                <span>Voice Announcement Mode:</span>
              </div>
              <button
                type="button"
                onClick={handleToggleVoice}
                className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors flex items-center gap-1 ${
                  voiceEnabled
                    ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                    : 'bg-stone-200 border-stone-300 text-stone-600'
                }`}
              >
                {voiceEnabled ? <Mic className="w-3 h-3 text-emerald-700" /> : <MicOff className="w-3 h-3 text-stone-500" />}
                <span>{voiceEnabled ? 'Voice Active' : 'Voice Off'}</span>
              </button>
            </div>

            {/* Mode Selector Buttons */}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => handleChangeVoiceMode('both')}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold border transition-all text-center ${
                  voiceMode === 'both'
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
                title="Speaks both student name and roll number"
              >
                Name & Roll No
              </button>
              <button
                type="button"
                onClick={() => handleChangeVoiceMode('roll')}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold border transition-all text-center ${
                  voiceMode === 'roll'
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
                title="Speaks only the roll number / marked ID"
              >
                Roll No Only
              </button>
              <button
                type="button"
                onClick={() => handleChangeVoiceMode('name')}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold border transition-all text-center ${
                  voiceMode === 'name'
                    ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                    : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                }`}
                title="Speaks only the student name"
              >
                Name Only
              </button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-stone-500">
                Spoken syntax: {voiceMode === 'both' ? '"Name + Roll No"' : voiceMode === 'roll' ? '"Roll Number only"' : '"Student Name only"'}
              </span>
              <button
                type="button"
                onClick={handleTestVoice}
                className="text-[11px] font-medium text-emerald-800 hover:text-emerald-950 flex items-center gap-1 underline underline-offset-2"
              >
                <Sparkles className="w-3 h-3 text-emerald-700" />
                <span>Test Voice Sample</span>
              </button>
            </div>
          </div>

          {/* Interactive NFC Terminal Interface */}
          <div className="bg-gradient-to-b from-stone-900 to-stone-950 text-white p-6 rounded-2xl border border-stone-800 flex flex-col items-center justify-center text-center space-y-4 shadow-lg relative overflow-hidden">
            {/* Animated Audio/NFC Radiating Rings during Tap */}
            {nfcTapping && (
              <>
                <div className="absolute inset-0 bg-emerald-500/5 animate-pulse pointer-events-none" />
                <div className="absolute w-36 h-36 rounded-full border border-emerald-400/30 animate-ping pointer-events-none" />
              </>
            )}

            <div
              className={`w-20 h-20 rounded-full flex items-center justify-center border-2 transition-all relative z-10 ${
                nfcTapping
                  ? 'border-emerald-400 bg-emerald-500/30 scale-110 shadow-lg shadow-emerald-500/30'
                  : isSpeaking
                  ? 'border-emerald-400 bg-emerald-950/70 shadow-lg shadow-emerald-500/20'
                  : 'border-emerald-600/40 bg-emerald-950/40'
              }`}
            >
              <Radio className={`w-10 h-10 text-emerald-400 ${nfcTapping ? 'animate-bounce' : isSpeaking ? 'animate-pulse' : ''}`} />
            </div>

            <div className="relative z-10 space-y-1">
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 font-semibold">
                  NFC / ISO 14443A TERMINAL
                </span>
                <span className={`w-1.5 h-1.5 rounded-full ${isSpeaking ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
              </div>
              <h4 className="text-sm font-bold">Ready for Contactless Tap</h4>
              <p className="text-[11px] text-stone-400">Hold digital Student ID near reader</p>
              
              <div className="flex items-center justify-center gap-2 pt-1 text-[10px] font-mono">
                <span className="text-emerald-400/90 flex items-center gap-1">
                  <Volume2 className="w-3 h-3" />
                  {isMuted ? 'Muted' : '2093Hz Beep'}
                </span>
                <span className="text-stone-600">·</span>
                <span className="text-emerald-300 flex items-center gap-1">
                  <Mic className="w-3 h-3" />
                  Voice: {voiceMode === 'both' ? 'Name + Roll No' : voiceMode === 'roll' ? 'Roll No Only' : 'Name Only'}
                </span>
              </div>
            </div>

            {/* Student ID Card Selection for Tap Simulation */}
            <div className="w-full bg-stone-800/90 p-3.5 rounded-xl border border-stone-700/80 text-left relative z-10 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] text-stone-400">
                <span className="flex items-center gap-1 font-mono uppercase text-[10px] tracking-wider text-emerald-400 font-bold">
                  <User className="w-3.5 h-3.5" /> Simulated SmartCard ID
                </span>
                <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/50">
                  {activeStudent.rfidTag || 'NFC-994821-CS'}
                </span>
              </div>

              {studentsList.length > 0 ? (
                <div className="relative">
                  <select
                    value={activeStudent.id}
                    onChange={e => setSelectedStudentId(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 rounded-lg py-2 pl-3 pr-8 text-xs text-white appearance-none focus:outline-none focus:ring-1 focus:ring-emerald-500 font-medium cursor-pointer shadow-inner"
                  >
                    {studentsList.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.rollNumber}) — {s.department?.split(' ')[0]}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-stone-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>
              ) : null}

              {/* Live Student ID Preview Card */}
              <div className="flex items-center gap-3 p-2.5 bg-stone-950/70 rounded-lg border border-stone-700/70">
                <img
                  src={activeStudent.photo || '/src/assets/images/student_aarav_sharma.jpg'}
                  alt={activeStudent.name}
                  className="w-11 h-11 rounded-lg object-cover border border-emerald-500/60 shadow-sm shrink-0"
                  onError={(e: any) => {
                    e.target.src = '/src/assets/images/student_aarav_sharma.jpg';
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-bold text-white truncate">{activeStudent.name}</p>
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800/40 shrink-0">
                      {activeStudent.rollNumber}
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-400 truncate mt-0.5">{activeStudent.department}</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSimulateNfcTap}
              disabled={nfcTapping}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-stone-950 font-bold rounded-xl text-xs shadow-lg hover:shadow-emerald-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 relative z-10 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed select-none"
            >
              <Radio className={`w-4 h-4 ${nfcTapping ? 'animate-spin' : ''}`} />
              <span>{nfcTapping ? 'Reading SmartCard Chip...' : 'Simulate Student ID Card Tap'}</span>
            </button>
          </div>

          {/* Voice Announcement Bubble Feedback */}
          {lastSpokenText && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-emerald-100 text-xs flex items-center gap-3 animate-in fade-in">
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0">
                <Volume2 className={`w-3.5 h-3.5 text-emerald-400 ${isSpeaking ? 'animate-bounce' : ''}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 font-bold">
                    Voice Synthesizer Announcement
                  </span>
                  {isSpeaking && (
                    <span className="text-[9px] bg-amber-500/20 border border-amber-400/40 text-amber-300 px-1.5 py-0.2 rounded font-mono animate-pulse">
                      Speaking...
                    </span>
                  )}
                </div>
                <p className="font-medium text-emerald-100 truncate">
                  "{lastSpokenText}"
                </p>
              </div>
            </div>
          )}

          {nfcSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <div className="flex-1">
                <span className="font-semibold block">{nfcSuccess}</span>
                <span className="text-[10px] text-emerald-700 font-mono">
                  Audio & Voice feedback verified via Web Audio API & Speech Synthesis
                </span>
              </div>
            </div>
          )}

          {nfcError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 text-xs flex items-center gap-2 animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-700 shrink-0" />
              <span>{nfcError}</span>
            </div>
          )}

          {/* Recent Attendance Scans */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-stone-800">Recent Attendance Logs</h4>
              <span className="text-[10px] text-stone-500 font-mono">Live Sync</span>
            </div>
            <div className="space-y-1.5 text-xs">
              {records && records.length > 0 ? (
                records.slice(0, 5).map((rec, i) => (
                  <div key={rec.id || i} className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 flex items-center justify-between text-stone-700 hover:bg-stone-100/80 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-900">{rec.studentName || 'Student'}</span>
                      <span className="text-[10px] font-mono text-stone-500 bg-stone-200/80 px-1.5 py-0.5 rounded">
                        {rec.rollNumber || rec.studentId}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-stone-500">{rec.courseCode}</span>
                      <span className="font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                        {rec.method || 'NFC Tap'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[11px] text-stone-400 py-2">No attendance records logged yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contactless Tap Confirmation Modal */}
      {tapResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-stone-900 border border-emerald-500/50 text-white rounded-2xl max-w-sm w-full p-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-150 space-y-4">
            {/* Top Badge */}
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-[10px] font-mono font-bold text-emerald-400 tracking-wider uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Contactless NFC Tap Verified
              </span>
              <button
                type="button"
                onClick={() => setTapResultModal(null)}
                className="w-7 h-7 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Student ID Card Layout */}
            <div className="p-3.5 bg-gradient-to-br from-stone-800/90 to-stone-950/90 rounded-xl border border-stone-700 flex items-center gap-3.5">
              <img
                src={tapResultModal.student.photo || '/src/assets/images/student_aarav_sharma.jpg'}
                alt={tapResultModal.student.name}
                className="w-14 h-14 rounded-xl object-cover border-2 border-emerald-400 shadow-lg shrink-0"
                onError={(e: any) => {
                  e.target.src = '/src/assets/images/student_aarav_sharma.jpg';
                }}
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-sm text-white truncate">{tapResultModal.student.name}</h4>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-800/40">
                    {tapResultModal.student.rollNumber}
                  </span>
                  <span className="text-[10px] text-stone-400 truncate">{tapResultModal.student.department?.split(' ')[0]}</span>
                </div>
                <p className="text-[9px] font-mono text-stone-500 mt-1">RFID: {tapResultModal.student.rfidTag || 'NFC-994821-CS'}</p>
              </div>
            </div>

            {/* Attendance Status Pill */}
            <div className="p-3 bg-emerald-950/70 border border-emerald-500/40 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-400">Classroom Session:</span>
                <span className="font-bold text-stone-200">{activeSession?.courseCode || 'CS601'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-400">Attendance Status:</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-stone-950 text-[11px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-stone-950" />
                  PRESENT
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-400">Timestamp:</span>
                <span className="font-mono text-stone-300 text-[11px]">{tapResultModal.timestamp}</span>
              </div>
            </div>

            {/* Voice Announcement preview */}
            {lastSpokenText && (
              <div className="p-2.5 bg-stone-800/80 rounded-lg border border-stone-700 text-[11px] text-stone-300 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="italic truncate">"{lastSpokenText}"</span>
              </div>
            )}

            <button
              type="button"
              onClick={() => setTapResultModal(null)}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-stone-950 font-bold rounded-xl text-xs transition-colors shadow-md cursor-pointer"
            >
              Done / Tap Next Student
            </button>
          </div>
        </div>
      )}

      {/* Start Session Modal */}
      {showStartModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-sm font-bold text-stone-900 mb-1">Launch Classroom QR Session</h3>
            <p className="text-xs text-stone-500 mb-4">
              Generates cryptographic QR session valid for 30 minutes in lecture hall.
            </p>

            <form onSubmit={handleStartSession} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">Course Code</label>
                <input
                  type="text"
                  required
                  value={newSessionForm.courseCode}
                  onChange={e => setNewSessionForm({ ...newSessionForm, courseCode: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 font-mono"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  value={newSessionForm.courseName}
                  onChange={e => setNewSessionForm({ ...newSessionForm, courseName: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowStartModal(false)}
                  className="px-4 py-2 text-stone-600 hover:text-stone-900 bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-lg shadow-xs"
                >
                  Start Live Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
