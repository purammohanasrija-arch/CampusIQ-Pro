/**
 * CampusIQ Pro — Exhibition Cover Page & Project Overview Portal
 * Designed for college project exhibitions, evaluators, judges, and prospective students.
 * Highlights:
 * - High-impact hero with campus twin preview, live status ticker, and quick role launcher
 * - 6 Exhibition Pillar Cards with deep-links to 3D and operational modules
 * - One-click interactive Persona Switcher (Student, Exam Controller, Security, Dean, Lab Tech)
 * - Technology architecture and compliance specifications
 */

import React from 'react';
import {
  Building,
  Layers,
  BookOpen,
  Cpu,
  QrCode,
  Sparkles,
  ShieldCheck,
  Award,
  ArrowRight,
  Play,
  Eye,
  CheckCircle2,
  Users,
  Compass,
  Zap,
  Activity,
  FileSpreadsheet,
  GraduationCap,
  Scan,
  Maximize2,
  ExternalLink,
  MapPin,
  Info,
  X,
  Lock,
  Calendar,
  Clock,
  ClipboardList,
  Server
} from 'lucide-react';
import { NavTab } from '../components/Sidebar';
import { UserRole, Student } from '../types/campus';

interface CoverPageViewProps {
  onNavigate: (tab: NavTab) => void;
  onOpenScanner: () => void;
  onSelectRole: (role: UserRole) => void;
  currentRole: UserRole;
  student: Student | null;
  stats: any;
  onLogout?: () => void;
}

export const CoverPageView: React.FC<CoverPageViewProps> = ({
  onNavigate,
  onOpenScanner,
  onSelectRole,
  currentRole,
  student,
  stats,
  onLogout,
}) => {
  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Hero Exhibition Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-stone-950 via-emerald-950 to-stone-900 border border-emerald-900/40 text-white shadow-2xl p-6 sm:p-8 lg:p-10">
        {/* Subtle Background Glow Rings */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Title, Mission, Actions */}
          <div className="lg:col-span-7 space-y-6">
            {/* Badge Ticker */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                College Exhibition 2026 Edition
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-800 text-stone-300 border border-stone-700 text-xs font-mono">
                Optical jsQR Engine
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-800 text-stone-300 border border-stone-700 text-xs font-mono">
                Cryptographic ID Passes
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-800 text-stone-300 border border-stone-700 text-xs font-mono">
                Gemini 3.8 Flash AI
              </span>
            </div>

            {/* Main Title */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                CampusIQ <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300">Pro</span>
              </h1>
              <p className="text-base sm:text-lg text-stone-300 font-light leading-relaxed">
                Next-Generation AI & Smart Campus Management Platform. Seamlessly unifying real-time optical QR verification, verified digital student credentials, live examination seating control, automated library circulation, and generative academic advisory.
              </p>
            </div>

            {/* Direct Launch Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('dashboard')}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-stone-950 font-extrabold text-sm shadow-xl shadow-emerald-500/25 flex items-center gap-2.5 transition-all active:scale-95 group/btn"
              >
                <Activity className="w-4 h-4 text-stone-950" />
                <span>Enter Smart Campus Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onOpenScanner}
                className="px-5 py-3.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-semibold text-sm border border-stone-700 flex items-center gap-2 transition-all active:scale-95"
              >
                <Scan className="w-4 h-4 text-emerald-400" />
                <span>Live Optical QR Scanner</span>
              </button>

              <button
                onClick={() => onNavigate('students')}
                className="px-5 py-3.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-semibold text-sm border border-stone-700 flex items-center gap-2 transition-all active:scale-95"
              >
                <GraduationCap className="w-4 h-4 text-cyan-300" />
                <span>Student Digital IDs</span>
              </button>

              <button
                onClick={() => onNavigate('exams')}
                className="px-5 py-3.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-semibold text-sm border border-stone-700 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                <span>Exams & Hall Tickets</span>
              </button>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="px-4 py-3.5 rounded-xl bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-white font-semibold text-xs border border-stone-800 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  title="Lock session and return to institutional login screen"
                >
                  <Lock className="w-3.5 h-3.5 text-rose-400" />
                  <span>Exit to Login</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Pure UI Campus Operations Telemetry Hub (No 3D / No Images) */}
          <div className="lg:col-span-5 h-full flex flex-col justify-between p-6 rounded-2xl bg-stone-900/90 border border-emerald-500/40 backdrop-blur-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  Campus Operations Telemetry
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                99.8% HEALTH
              </span>
            </div>

            {/* Quick Interactive Operational Modules */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => onNavigate('students')}
                className="p-3.5 rounded-xl bg-stone-950/70 hover:bg-stone-800/80 border border-stone-800 hover:border-emerald-500/50 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <span className="text-xs font-bold text-white block">Student Digital IDs</span>
                <span className="text-[10px] text-stone-400 mt-0.5 block">4,820 Verified • Anti-Tamper QR</span>
              </button>

              <button
                onClick={onOpenScanner}
                className="p-3.5 rounded-xl bg-stone-950/70 hover:bg-stone-800/80 border border-stone-800 hover:border-emerald-500/50 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                    <Scan className="w-4 h-4" />
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <span className="text-xs font-bold text-white block">Universal QR Scanner</span>
                <span className="text-[10px] text-stone-400 mt-0.5 block">Camera Decoding & Audio Feedback</span>
              </button>

              <button
                onClick={() => onNavigate('exams')}
                className="p-3.5 rounded-xl bg-stone-950/70 hover:bg-stone-800/80 border border-stone-800 hover:border-amber-500/50 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center">
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-600 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <span className="text-xs font-bold text-white block">Exams & Hall Tickets</span>
                <span className="text-[10px] text-stone-400 mt-0.5 block">LHC-302 Center • Seating Grid</span>
              </button>

              <button
                onClick={() => onNavigate('library')}
                className="p-3.5 rounded-xl bg-stone-950/70 hover:bg-stone-800/80 border border-stone-800 hover:border-teal-500/50 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-300 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-600 group-hover:text-teal-400 group-hover:translate-x-0.5 transition-all" />
                </div>
                <span className="text-xs font-bold text-white block">Library & Facilities</span>
                <span className="text-[10px] text-stone-400 mt-0.5 block">3,420 Volumes • RFID Checkout</span>
              </button>
            </div>

            {/* Quick Status Bar */}
            <div className="pt-3 border-t border-stone-800 flex items-center justify-between text-[11px] font-mono text-stone-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero Latency Operations</span>
              </span>
              <button
                onClick={() => onNavigate('dashboard')}
                className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 transition-colors"
              >
                <span>Launch Dashboard</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Live Operational Metrics Ribbon */}
        <div className="mt-8 pt-6 border-t border-stone-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800">
            <span className="text-stone-400 block text-[11px]">Enrolled Students</span>
            <span className="text-xl font-bold text-emerald-400">4,820</span>
            <span className="text-[10px] text-stone-500 block">Verified Digital IDs</span>
          </div>
          <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800">
            <span className="text-stone-400 block text-[11px]">Exam Seating Grid</span>
            <span className="text-xl font-bold text-amber-400">24 Desks</span>
            <span className="text-[10px] text-stone-500 block">LHC-302 Real-Time</span>
          </div>
          <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800">
            <span className="text-stone-400 block text-[11px]">Academic Departments</span>
            <span className="text-xl font-bold text-cyan-400">8 Sectors</span>
            <span className="text-[10px] text-stone-500 block">Engineering & Sciences</span>
          </div>
          <div className="p-3 rounded-xl bg-stone-900/60 border border-stone-800">
            <span className="text-stone-400 block text-[11px]">QR Audit Authenticity</span>
            <span className="text-xl font-bold text-emerald-400">99.8%</span>
            <span className="text-[10px] text-stone-500 block">Web Audio Feedback</span>
          </div>
        </div>
      </div>

      {/* Exhibition Entry Gateway Bar */}
      <div className="bg-gradient-to-r from-emerald-950 via-stone-900 to-emerald-950 rounded-2xl border border-emerald-500/40 p-5 sm:p-6 shadow-xl text-white flex flex-col md:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center shrink-0 shadow-inner">
            <Activity className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-wide">CampusIQ Pro Main Operations System</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed max-w-2xl">
              Access live institutional KPIs, student records, digital ID credentials, examination seating grids, and campus security logs.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
          <button
            onClick={() => onNavigate('dashboard')}
            className="w-full md:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-stone-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
          >
            <span>Open Dashboard Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onNavigate('students')}
            className="hidden sm:flex px-4 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold border border-stone-700 items-center gap-1.5 transition-colors"
          >
            <GraduationCap className="w-3.5 h-3.5 text-emerald-300" />
            <span>Student Portal</span>
          </button>
        </div>
      </div>

      {/* Quick Exhibition Persona Launchers */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-emerald-800" />
            <h2 className="text-base font-bold text-stone-900">Exhibition Demo Personas (1-Click Test Drive)</h2>
          </div>
          <span className="text-xs text-stone-500 font-medium">Switch roles to experience tailored views</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => {
              onSelectRole('College Administrator');
              onNavigate('dashboard');
            }}
            className={`p-4 rounded-xl border text-left transition-all ${
              currentRole === 'College Administrator'
                ? 'bg-emerald-50 border-emerald-500 shadow-xs'
                : 'bg-stone-50 hover:bg-stone-100 border-stone-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-stone-900">Administrator</span>
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
            </div>
            <p className="text-xs text-stone-600 line-clamp-2">
              Oversee high-level college KPIs, student records, fee approvals, and audit logs.
            </p>
          </button>

          <button
            onClick={() => {
              onSelectRole('Student');
              onNavigate('students');
            }}
            className={`p-4 rounded-xl border text-left transition-all ${
              currentRole === 'Student'
                ? 'bg-emerald-50 border-emerald-500 shadow-xs'
                : 'bg-stone-50 hover:bg-stone-100 border-stone-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-stone-900">Student (Aarav)</span>
              <GraduationCap className="w-4 h-4 text-emerald-700" />
            </div>
            <p className="text-xs text-stone-600 line-clamp-2">
              Digital student ID, exam seat D-23, digital gate pass, library book loans & canteen wallet.
            </p>
          </button>

          <button
            onClick={() => {
              onSelectRole('Examination Staff');
              onNavigate('exam-hall-3d');
            }}
            className={`p-4 rounded-xl border text-left transition-all ${
              currentRole === 'Examination Staff'
                ? 'bg-emerald-50 border-emerald-500 shadow-xs'
                : 'bg-stone-50 hover:bg-stone-100 border-stone-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-stone-900">Exam Controller</span>
              <FileSpreadsheet className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-xs text-stone-600 line-clamp-2">
              3D seating charts, proctor dais view, hall ticket QR tokens, and seating manifest printing.
            </p>
          </button>

          <button
            onClick={() => {
              onSelectRole('Security Staff');
              onOpenScanner();
            }}
            className={`p-4 rounded-xl border text-left transition-all ${
              currentRole === 'Security Staff'
                ? 'bg-emerald-50 border-emerald-500 shadow-xs'
                : 'bg-stone-50 hover:bg-stone-100 border-stone-200'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-stone-900">Gate Security</span>
              <QrCode className="w-4 h-4 text-cyan-600" />
            </div>
            <p className="text-xs text-stone-600 line-clamp-2">
              Instant camera barcode decoding, gate passes, parking barrier scans & audio verification.
            </p>
          </button>
        </div>
      </div>

      {/* Six Pillars of CampusIQ Pro */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-900">Core Architecture & Capabilities</h2>
          <span className="text-xs text-stone-500">6 Modular Pillars</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Pillar 1 */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:border-emerald-500/60 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-800 text-emerald-200 flex items-center justify-center">
                <Building className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-stone-900">Campus Operations & Infrastructure</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Centralized management tracking 4,820 student profiles, faculty rosters, 8 academic departments, automated digital gate passes, and campus facilities.
              </p>
            </div>
            <button
              onClick={() => onNavigate('dashboard')}
              className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-emerald-800 hover:text-emerald-950"
            >
              <span>Explore Operations Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Pillar 2 */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:border-emerald-500/60 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-amber-700 text-amber-200 flex items-center justify-center">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-stone-900">3D Exam Hall & Candidate POV</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                24-seat examination center with seated student avatars actively writing exams, invigilator aisle pacing, live smartboard countdown timer, and first-person candidate view.
              </p>
            </div>
            <button
              onClick={() => onNavigate('exam-hall-3d')}
              className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-amber-800 hover:text-amber-950"
            >
              <span>Open 3D Exam Hall</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Pillar 3 */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:border-emerald-500/60 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-teal-800 text-teal-200 flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-stone-900">3D Library & Robotics Lab</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Virtual walk-through featuring students taking books, RFID checkout kiosk, 6-axis articulated pick-and-place robot, and live phosphor green oscilloscope waveform.
              </p>
            </div>
            <button
              onClick={() => onNavigate('library-3d')}
              className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-teal-800 hover:text-teal-950"
            >
              <span>Explore Virtual Stacks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Pillar 4 */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:border-emerald-500/60 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-stone-900 text-emerald-400 flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-stone-900">Universal Optical QR Engine</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Client-side jsQR optical decoding from webcam or phone camera with laser reticle overlay, instantaneous Web Audio harmonic chimes, and server-validated audit passes.
              </p>
            </div>
            <button
              onClick={onOpenScanner}
              className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-emerald-800 hover:text-emerald-950"
            >
              <span>Launch Camera Scanner</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Pillar 5 */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:border-emerald-500/60 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-purple-800 text-purple-200 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-stone-900">3D AI Assistant & Gemini Advisor</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Floating 3D quantum gyroscope orb with magnetic cursor physics, harmonic audio cues, and conversational advice on exams, attendance warnings, and campus services.
              </p>
            </div>
            <button
              onClick={() => onNavigate('ai-advisor')}
              className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-purple-800 hover:text-purple-950"
            >
              <span>Consult AI Advisor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Pillar 6 */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:border-emerald-500/60 transition-all flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-sky-800 text-sky-200 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-stone-900">Digital Credentials & Project Expo</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Verifiable student ID card generator with dynamic QR barcodes, anti-duplicate voting in collegiate project exhibitions, skill passports, and campus dining wallets.
              </p>
            </div>
            <button
              onClick={() => onNavigate('students')}
              className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-bold text-sky-800 hover:text-sky-950"
            >
              <span>View Student ID Cards</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Technology & Architectural Compatibility Matrix */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 border border-stone-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-800 pb-3">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-400" />
            <span>Underlying Engineering & Architecture Standards</span>
          </h3>
          <span className="text-xs text-stone-400 font-mono">Full-Stack Enterprise Ready</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-emerald-400 font-mono font-bold block">3D Graphics & Shaders</span>
            <p className="text-stone-300">
              Three.js PBR pipeline with RoomEnvironment, ACESFilmicToneMapping, zero-garbage-collection render loops, and SwiftShader software WebGL safety fallback guards.
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-cyan-400 font-mono font-bold block">Computer Vision & Audio</span>
            <p className="text-stone-300">
              Pure client-side jsQR optical barcode parsing running over live media streams, paired with synthesized harmonic Web Audio API verification sound cues.
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-amber-400 font-mono font-bold block">Artificial Intelligence</span>
            <p className="text-stone-300">
              Gemini 3.8 Flash model endpoint grounding student queries in real-time academic records, attendance percentages, and examination schedules.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
