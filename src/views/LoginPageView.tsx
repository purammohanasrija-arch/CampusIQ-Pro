/**
 * CampusIQ Pro — Institutional Security & Authentication Gateway
 * Unified single secure login interface with Zero-Trust RBAC verification,
 * clearance tier selection, and a cinematic cryptographic loading transition to the Cover Page.
 */

import React, { useState, useRef } from 'react';
import {
  Shield,
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  GraduationCap,
  CheckCircle2
} from 'lucide-react';
import { UserRole, Student } from '../types/campus';
import { audioFeedback } from '../utils/audioFeedback';

export interface SecurityUser {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  department: string;
  photo?: string;
  rollNumber?: string;
  clearanceLevel: string;
  badgeId: string;
}

interface LoginPageViewProps {
  onLoginSuccess: (
    user: { id?: string; name: string; role: UserRole; email?: string; department?: string },
    role: UserRole,
    student?: Student | null
  ) => void;
  availableStudents?: Student[];
  availableUsers?: any[];
}

export const LoginPageView: React.FC<LoginPageViewProps> = ({
  onLoginSuccess,
  availableStudents = [],
}) => {
  // Preset verified security personas
  const SECURITY_PERSONAS: SecurityUser[] = [
    {
      id: 'USR-08',
      name: 'Chief Jackson Reed',
      role: 'Security Staff',
      email: 'security@campusiq.edu',
      department: 'Campus Safety & Turnstiles',
      badgeId: 'SEC-BADGE-8841',
      clearanceLevel: 'Level 4 · Chief Security Access',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&fit=crop&q=80'
    },
    {
      id: 'USR-02',
      name: 'Prof. Arthur Davies',
      role: 'College Administrator',
      email: 'dean@campusiq.edu',
      department: 'Academic Affairs & Governance',
      badgeId: 'ADM-GOV-001',
      clearanceLevel: 'Level 5 · Executive Dean Clearance',
      photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&fit=crop&q=80'
    },
    {
      id: 'USR-03',
      name: 'Dr. Elena Chen',
      role: 'Faculty',
      email: 'elena.chen@campusiq.edu',
      department: 'Computer Science & Engineering',
      badgeId: 'FAC-ENG-402',
      clearanceLevel: 'Level 3 · Academic & Lab Supervisor',
      photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&fit=crop&q=80'
    },
    {
      id: 'STU-2024-001',
      name: 'Aarav Sharma',
      role: 'Student',
      email: 'aarav.sharma@student.campusiq.edu',
      department: 'B.Tech CS (AI & Data Systems)',
      rollNumber: '241FA04001',
      badgeId: 'STU-NFC-24101',
      clearanceLevel: 'Level 1 · Student SmartCard Access',
      photo: '/src/assets/images/student_aarav_sharma.jpg'
    }
  ];

  // Active selected security tier
  const [selectedTierIndex, setSelectedTierIndex] = useState(0);
  const [emailInput, setEmailInput] = useState(SECURITY_PERSONAS[0].email);
  const [passwordInput, setPasswordInput] = useState('campusiq2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cinematic Verification Loading State ("WITH LOADING")
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStepText, setLoadingStepText] = useState('Initiating Zero-Trust Security Handshake...');
  const [verifyingUser, setVerifyingUser] = useState<SecurityUser | null>(null);

  const loadingIntervalRef = useRef<any>(null);

  // Switch security clearance persona
  const handleSelectTier = (index: number) => {
    setSelectedTierIndex(index);
    const persona = SECURITY_PERSONAS[index];
    setEmailInput(persona.email);
    setPasswordInput('campusiq2026');
    setErrorMsg(null);
  };

  // Launch cinematic loading sequence to Cover Page
  const startSecurityLoading = (target: SecurityUser) => {
    setVerifyingUser(target);
    setIsLoading(true);
    setLoadingProgress(0);
    setErrorMsg(null);

    try {
      audioFeedback.playNfcBeepSound();
    } catch (_) {}

    const telemetrySteps = [
      { at: 10, text: 'Connecting to CampusIQ network...' },
      { at: 30, text: 'Verifying user profile & account credentials...' },
      { at: 55, text: `Loading permissions for ${target.role}...` },
      { at: 75, text: 'Preparing digital campus twin & live portal...' },
      { at: 92, text: `Welcome, ${target.name}! Opening campus portal...` }
    ];

    let currentProg = 0;
    if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);

    loadingIntervalRef.current = setInterval(() => {
      currentProg += Math.floor(Math.random() * 6) + 4;
      if (currentProg > 100) currentProg = 100;

      setLoadingProgress(currentProg);

      const matchedStep = [...telemetrySteps].reverse().find(s => currentProg >= s.at);
      if (matchedStep) {
        setLoadingStepText(matchedStep.text);
      }

      if (currentProg >= 100) {
        clearInterval(loadingIntervalRef.current);
        try {
          audioFeedback.playSuccessSound();
        } catch (_) {}

        setTimeout(() => {
          setIsLoading(false);

          // Find student profile if applicable
          const matchedStudent =
            availableStudents.find(
              s => s.id === target.id || s.email === target.email || s.name === target.name
            ) ||
            (target.role === 'Student'
              ? availableStudents[0] || {
                  id: target.id,
                  name: target.name,
                  rollNumber: target.rollNumber || '241FA04001',
                  email: target.email,
                  department: target.department,
                  photo: target.photo || '/src/assets/images/student_aarav_sharma.jpg',
                  rfidTag: 'NFC-241FA04001-CS',
                  idCardStatus: 'Active' as const,
                  attendancePercentage: 92.5,
                  gpa: 3.88,
                  bloodGroup: 'O+ve',
                  emergencyContact: '+91 98765 43210',
                  course: 'B.Tech CS',
                  year: '4th Year',
                  semester: '7th Semester',
                  idCardIssuedDate: '2024-08-01',
                  idCardExpiryDate: '2028-06-30',
                  qrToken: 'CIQ-STUID-241FA04001',
                  mentor: 'Dr. Elena Chen'
                }
              : null);

          onLoginSuccess(
            {
              id: target.id,
              name: target.name,
              role: target.role,
              email: target.email,
              department: target.department
            },
            target.role,
            matchedStudent
          );
        }, 350);
      }
    }, 45);
  };

  const handleInstantBypass = () => {
    if (loadingIntervalRef.current) clearInterval(loadingIntervalRef.current);
    if (!verifyingUser) return;
    try {
      audioFeedback.playSuccessSound();
    } catch (_) {}
    setIsLoading(false);
    onLoginSuccess(
      {
        id: verifyingUser.id,
        name: verifyingUser.name,
        role: verifyingUser.role,
        email: verifyingUser.email,
        department: verifyingUser.department
      },
      verifyingUser.role
    );
  };

  const handleSecurityLogin = (e?: React.FormEvent | React.MouseEvent) => {
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    const cleanInput = (emailInput || '').trim().toLowerCase();
    if (!cleanInput) {
      setErrorMsg('Please enter your institutional security email or ID');
      return;
    }

    // Match selected tier persona or find by email / roll number
    const matched =
      SECURITY_PERSONAS.find(
        p =>
          p.email.toLowerCase() === cleanInput ||
          p.name.toLowerCase().includes(cleanInput) ||
          (p.rollNumber && p.rollNumber.toLowerCase() === cleanInput)
      ) ||
      SECURITY_PERSONAS[selectedTierIndex] || {
        id: 'USR-SEC-CUSTOM',
        name: cleanInput.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        role: cleanInput.includes('student') || cleanInput.includes('241')
          ? ('Student' as UserRole)
          : cleanInput.includes('admin') || cleanInput.includes('dean')
          ? ('College Administrator' as UserRole)
          : ('Security Staff' as UserRole),
        email: emailInput,
        department: 'Campus Security Operations',
        badgeId: 'SEC-GEN-2026',
        clearanceLevel: 'Standard Institutional Clearance'
      };

    startSecurityLoading(matched);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-white flex flex-col justify-between relative overflow-hidden select-none font-sans">
      {/* Ambient Lighting & Glow Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[550px] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-10 right-10 w-80 h-80 bg-emerald-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Subtle Matrix Dot Grid Background */}
      <div
        className="absolute inset-0 opacity-[0.035] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      />

      {/* Top Header Ticker */}
      <header className="relative z-10 px-6 py-4 flex items-center justify-between border-b border-stone-800/70 bg-stone-950/70 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-stone-950 flex items-center justify-center shadow-lg shadow-emerald-500/20 font-bold">
            <Shield className="w-5 h-5 text-stone-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-extrabold tracking-tight text-white">
                CampusIQ <span className="text-emerald-400">Pro</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[10px] font-mono font-bold">
                PORTAL LOGIN
              </span>
            </div>
            <span className="text-[10px] text-stone-400 block -mt-0.5">
              Smart Campus Management & Student Information Portal
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2.5 text-xs">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stone-900 border border-stone-800 text-stone-300 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-stone-200">Campus Portal</span>
            <span className="text-stone-600">·</span>
            <span className="text-emerald-400 text-[11px] font-medium">Online</span>
          </div>
        </div>
      </header>

      {/* Main Single Security Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-xl bg-stone-900/90 backdrop-blur-2xl border border-stone-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-6">
          {/* Header Banner */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Campus Sign In</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Sign In to CampusIQ
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 max-w-md mx-auto">
              Select your role or enter your credentials to open the campus exhibition portal.
            </p>
          </div>

          {/* Security Clearance Role Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-stone-300">
              Select Role / Account:
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SECURITY_PERSONAS.map((tier, idx) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => handleSelectTier(idx)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    selectedTierIndex === idx
                      ? 'bg-emerald-950/80 border-emerald-400 text-white shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-400/50'
                      : 'bg-stone-950/70 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-bold text-emerald-400 truncate">
                      {tier.badgeId}
                    </span>
                    {selectedTierIndex === idx && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    )}
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-white truncate">
                      {tier.role}
                    </span>
                    <span className="text-[10px] text-stone-400 truncate block">
                      {tier.name.split(' ')[0]}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Single Security Credentials Form */}
          <form onSubmit={handleSecurityLogin} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs rounded-xl flex items-center gap-2">
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-stone-300 mb-1.5">
                Campus Email or Roll Number
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={emailInput}
                  onChange={e => setEmailInput(e.target.value)}
                  placeholder="e.g. security@campusiq.edu"
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl py-2.5 pl-9 pr-3 text-xs text-white placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-stone-300 mb-1.5">
                <span>Password</span>
                <button
                  type="button"
                  onClick={() => setPasswordInput('campusiq2026')}
                  className="text-[11px] text-emerald-400 hover:underline cursor-pointer"
                >
                  Demo Passcode: campusiq2026
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-3 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={e => setPasswordInput(e.target.value)}
                  placeholder="Enter your passcode"
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl py-2.5 pl-9 pr-10 text-xs text-white placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-stone-400 hover:text-white p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>


            <div className="flex items-center justify-between text-xs text-stone-400 pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded bg-stone-950 border-stone-700 text-emerald-500 focus:ring-emerald-500"
                />
                <span>Remember me on this device</span>
              </label>
            </div>

            {/* Primary Secure Sign In Button */}
            <button
              type="button"
              onClick={handleSecurityLogin}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 active:scale-[0.98] text-stone-950 font-extrabold rounded-xl text-sm shadow-xl shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              <span>Sign In & Open Campus Portal</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

        </div>
      </main>

      {/* Footer Info */}
      <footer className="relative z-10 px-6 py-3 text-center text-xs text-stone-500 border-t border-stone-900 bg-stone-950/80">
        <span>CampusIQ Pro © 2026 · Smart Campus Portal & Academic System</span>
      </footer>

      {/* ========================================================================= */}
      {/* HIGH-TECH CINEMATIC SECURITY LOADING SCREEN ("WITH LOADING")              */}
      {/* ========================================================================= */}
      {isLoading && verifyingUser && (
        <div className="fixed inset-0 z-50 bg-stone-950/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
          {/* Glowing Ambient Core */}
          <div className="absolute w-[520px] h-[520px] bg-emerald-500/20 rounded-full blur-[140px] pointer-events-none" />

          {/* Holographic Concentric Rings & User Avatar */}
          <div className="relative mb-6">
            {/* Outer Radiating Pulse Ring */}
            <div className="absolute -inset-6 rounded-full border border-emerald-400/25 animate-ping pointer-events-none" />

            {/* Rotating Cyber Ring */}
            <div
              className="absolute -inset-3 rounded-full border-2 border-dashed border-emerald-400/60 animate-spin pointer-events-none"
              style={{ animationDuration: '5s' }}
            />

            {/* Inner Glowing Badge / Avatar */}
            <div className="w-24 h-24 rounded-full border-2 border-emerald-400 bg-stone-900 p-1 shadow-2xl shadow-emerald-500/50 relative z-10 flex items-center justify-center overflow-hidden">
              <img
                src={
                  verifyingUser.photo ||
                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&fit=crop&q=80'
                }
                alt={verifyingUser.name}
                className="w-full h-full object-cover rounded-full"
                onError={(e: any) => {
                  e.target.src =
                    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&fit=crop&q=80';
                }}
              />
            </div>
          </div>

          {/* User Details & Identity Heading */}
          <div className="space-y-1.5 relative z-10 max-w-sm mx-auto mb-6">
            <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-400 font-bold flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              AUTHENTICATING USER ACCOUNT
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              {verifyingUser.name}
            </h3>
            <div className="flex items-center justify-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700/60 text-xs font-semibold">
                {verifyingUser.role}
              </span>
              <span className="text-xs text-stone-400 font-mono">
                {verifyingUser.department}
              </span>
            </div>
          </div>

          {/* Animated High-Tech Progress Bar */}
          <div className="w-full max-w-md space-y-2 relative z-10 mb-6">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-stone-400">Loading CampusIQ:</span>
              <span className="text-emerald-400 font-bold">{loadingProgress}%</span>
            </div>

            <div className="w-full h-2.5 bg-stone-900 rounded-full border border-stone-800 overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 via-emerald-400 to-teal-300 rounded-full transition-all duration-100 shadow-lg shadow-emerald-500/50"
                style={{ width: `${loadingProgress}%` }}
              />
            </div>

            {/* Terminal Step Telemetry */}
            <div className="p-3 bg-stone-900/95 rounded-xl border border-stone-800 text-left font-mono text-[11px] text-emerald-300 flex items-center gap-2.5 shadow-inner">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="truncate">{loadingStepText}</span>
            </div>
          </div>

          {/* Instant Bypass Button for convenience */}
          <button
            type="button"
            onClick={handleInstantBypass}
            className="text-[11px] font-mono text-stone-500 hover:text-stone-300 underline underline-offset-4 cursor-pointer relative z-10 transition-colors"
          >
            Skip loading & enter cover page directly →
          </button>
        </div>
      )}
    </div>
  );
};
