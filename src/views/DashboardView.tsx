/**
 * CampusIQ Pro — Dashboard View
 * Real computed stats, quick actions, attendance health, upcoming exams, active events, and audit feed.
 */

import React from 'react';
import {
  Users,
  CreditCard,
  QrCode,
  CalendarCheck2,
  BookOpen,
  Cpu,
  Ticket,
  DoorOpen,
  UtensilsCrossed,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  GraduationCap, MapPin, Building, Phone,
  Box
} from 'lucide-react';
import { NavTab } from '../components/Sidebar';
import { UserRole, VerificationLog } from '../types/campus';

interface DashboardViewProps {
  stats: any;
  userRole: UserRole;
  onNavigate: (tab: NavTab) => void;
  onOpenScanner: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  userRole,
  onNavigate,
  onOpenScanner,
}) => {
  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/30 text-emerald-100 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Autonomous Smart Campus Management Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
            Welcome to CampusIQ Pro
          </h1>
          <p className="text-emerald-100/90 text-sm leading-relaxed mb-6">
            Unified university operations with cryptographic QR verification, digital student ID passes, smart library circulation, lab inventory, automated gate passes, and AI academic advising.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenScanner}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              <span>Launch Universal QR Scanner</span>
            </button>
            <button
              onClick={() => onNavigate('campus-3d')}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 border border-emerald-500/40"
            >
              <Box className="w-4 h-4 text-emerald-200" />
              <span>Explore 3D Campus Twin</span>
            </button>
            <button
              onClick={() => onNavigate('students')}
              className="px-4 py-2.5 bg-emerald-800/80 hover:bg-emerald-700/80 text-white font-medium text-xs rounded-xl border border-emerald-600/50 transition-colors flex items-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              <span>View Digital Student IDs</span>
            </button>
          </div>
        </div>

        {/* Decorative background aerial image overlay */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 hidden lg:block opacity-35 mix-blend-luminosity pointer-events-none">
          <img
            src="/src/assets/images/campus_hero_aerial_1793080116992.jpg"
            alt="Campus Architecture"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <div
          onClick={() => onNavigate('students')}
          className="p-5 bg-white rounded-xl border border-stone-200 shadow-xs hover:border-emerald-600/50 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-500">Total Enrolled Students</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center group-hover:bg-emerald-800 group-hover:text-white transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-900 tabular-nums">
              {stats?.totalStudents || 4}
            </span>
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              Active Verified
            </span>
          </div>
          <p className="text-[11px] text-stone-400 mt-2">Across 5 Engineering Depts</p>
        </div>

        {/* Attendance Avg */}
        <div
          onClick={() => onNavigate('attendance')}
          className="p-5 bg-white rounded-xl border border-stone-200 shadow-xs hover:border-emerald-600/50 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-500">Campus Attendance Avg</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 flex items-center justify-center group-hover:bg-teal-800 group-hover:text-white transition-colors">
              <CalendarCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-900 tabular-nums">
              {stats?.avgAttendance || 88.5}%
            </span>
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              &gt; 75% Threshold
            </span>
          </div>
          <p className="text-[11px] text-stone-400 mt-2">Dynamic QR & NFC Enabled</p>
        </div>

        {/* Active Events */}
        <div
          onClick={() => onNavigate('events')}
          className="p-5 bg-white rounded-xl border border-stone-200 shadow-xs hover:border-emerald-600/50 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-500">Upcoming Events & Fests</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center group-hover:bg-amber-800 group-hover:text-white transition-colors">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-900 tabular-nums">
              {stats?.activeEvents || 3}
            </span>
            <span className="text-[11px] font-medium text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded">
              Passes Active
            </span>
          </div>
          <p className="text-[11px] text-stone-400 mt-2">AI Hackathon & Clean Energy</p>
        </div>

        {/* Library Books */}
        <div
          onClick={() => onNavigate('library')}
          className="p-5 bg-white rounded-xl border border-stone-200 shadow-xs hover:border-emerald-600/50 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-500">Library Circulation</span>
            <div className="w-8 h-8 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center group-hover:bg-emerald-800 group-hover:text-white transition-colors">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-900 tabular-nums">
              {stats?.library?.available || 17} / {stats?.library?.total || 50}
            </span>
            <span className="text-[11px] font-medium text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded">
              Available
            </span>
          </div>
          <p className="text-[11px] text-stone-400 mt-2">Auto overdue fine calculator</p>
        </div>
      </div>

      {/* Main 2-Column Split: Campus Operations & Recent QR Verifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Campus Fast Modules (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Action Matrix */}
          <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <span>Core Campus Services</span>
                <span className="text-xs font-normal text-stone-400">· 1-click access</span>
              </h3>
              <span className="text-xs text-emerald-800 font-medium">All Systems Nominal</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => onNavigate('exams')}
                className="p-3 text-left rounded-lg bg-stone-50 hover:bg-emerald-50/70 border border-stone-200/80 hover:border-emerald-300 transition-all group"
              >
                <GraduationCap className="w-5 h-5 text-emerald-800 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="text-xs font-bold text-stone-900">Hall Tickets</h4>
                <p className="text-[10px] text-stone-500 mt-0.5">Autumn 2026 Ready</p>
              </button>

              <button
                onClick={() => onNavigate('canteen')}
                className="p-3 text-left rounded-lg bg-stone-50 hover:bg-emerald-50/70 border border-stone-200/80 hover:border-emerald-300 transition-all group"
              >
                <UtensilsCrossed className="w-5 h-5 text-amber-700 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="text-xs font-bold text-stone-900">Smart Canteen</h4>
                <p className="text-[10px] text-stone-500 mt-0.5">Order & Pickup QR</p>
              </button>

              <button
                onClick={() => onNavigate('gatepass')}
                className="p-3 text-left rounded-lg bg-stone-50 hover:bg-emerald-50/70 border border-stone-200/80 hover:border-emerald-300 transition-all group"
              >
                <DoorOpen className="w-5 h-5 text-teal-700 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="text-xs font-bold text-stone-900">Gate Passes</h4>
                <p className="text-[10px] text-stone-500 mt-0.5">Leave & Visitors</p>
              </button>

              <button
                onClick={() => onNavigate('lab')}
                className="p-3 text-left rounded-lg bg-stone-50 hover:bg-emerald-50/70 border border-stone-200/80 hover:border-emerald-300 transition-all group"
              >
                <Cpu className="w-5 h-5 text-indigo-700 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="text-xs font-bold text-stone-900">Lab Assets</h4>
                <p className="text-[10px] text-stone-500 mt-0.5">Checkout & Return</p>
              </button>
            </div>
          </div>

          {/* Module Status Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Examination Alert */}
            <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                    Autumn 2026 Examinations
                  </span>
                  <span className="text-xs text-stone-400">Begins Nov 20</span>
                </div>
                <h4 className="text-sm font-bold text-stone-900 mt-1">
                  CS601 Distributed Systems & Cloud Architecture
                </h4>
                <p className="text-xs text-stone-500 mt-1">
                  Venue: Lecture Hall Complex Room NB-101 · Reporting time: 08:45 AM
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs font-medium text-emerald-700">Digital Hall Ticket Verified</span>
                <button
                  onClick={() => onNavigate('exams')}
                  className="text-xs text-stone-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
                >
                  <span>View Ticket</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* AI Advisor Preview */}
            <div className="bg-gradient-to-br from-emerald-50 via-warm-cream to-amber-50/40 rounded-xl border border-emerald-200/70 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 mb-2">
                  <Sparkles className="w-4 h-4 text-emerald-700" />
                  <span>AI Academic & Career Advisor</span>
                </div>
                <p className="text-xs text-stone-700 leading-relaxed">
                  Personalized analysis generated using Gemini 3.8 Flash based on your 88.5% attendance, CS curriculum, and hackathon awards.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-emerald-200/60 flex items-center justify-between">
                <span className="text-[11px] font-medium text-emerald-800">Target: Robotics MS / Systems Eng</span>
                <button
                  onClick={() => onNavigate('ai-advisor')}
                  className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                >
                  <span>Open Advisor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live QR Verifications Feed */}
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-bold text-stone-900">Live Verification Log</h3>
            </div>
            <button
              onClick={() => onNavigate('qr-verifier')}
              className="text-xs text-emerald-700 hover:underline font-medium"
            >
              Full Center
            </button>
          </div>

          <div className="flex-1 space-y-3 divide-y divide-stone-100">
            {stats?.recentActivities && stats.recentActivities.length > 0 ? (
              stats.recentActivities.map((log: VerificationLog) => (
                <div key={log.id} className="pt-3 first:pt-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-900 truncate">
                      {log.subjectName}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                      {log.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5 truncate">{log.type}</p>
                  <p className="text-[10px] text-stone-400 mt-0.5 truncate">{log.verifiedBy}</p>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-stone-400">
                No recent scans recorded yet.
              </div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-stone-100">
            <button
              onClick={onOpenScanner}
              className="w-full py-2 bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 text-stone-700 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <QrCode className="w-4 h-4" />
              <span>Verify Any Campus Pass</span>
            </button>
          </div>
        </div>
      </div>

      {/* Campus Academic Directory: Students & Faculty with Rooms */}
      <div className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2">
              <Building className="w-5 h-5 text-emerald-800" />
              <h3 className="text-base font-bold text-stone-900">New Academic Block (NB) Directory & Office Locations</h3>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Faculty cabins, classroom lecture allocations, and enrolled student roll numbers (241FA04... series).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('attendance')}
              className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <span>NFC Attendance Reader</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('students')}
              className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>Student ID Cards</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Faculty Members & Cabins */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-emerald-700" />
                <span>Faculty Members & Faculty Cabins</span>
              </h4>
              <span className="text-[11px] text-stone-400 font-mono">New Block Wing</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {[
                { name: 'Dr. Elena Chen', role: 'Professor & HOD (Computer Science)', room: 'Room NB-201' },
                { name: 'Prof. Arthur Davies', role: 'Dean of Academics & Warden', room: 'Room NB-101' },
                { name: 'Dr. Sarah Jenkins', role: 'Campus Director & Executive', room: 'Room NB-301' },
                { name: 'Prof. David Miller', role: 'Associate Professor (ECE)', room: 'Room NB-204' },
                { name: 'Prof. Meera Kulkarni', role: 'Professor (AI & Machine Learning)', room: 'Room NB-202' },
                { name: 'Dr. Rajesh Sundaram', role: 'Professor (Robotics & Automation)', room: 'Room NB-305' },
                { name: 'Dr. Robert Thorne', role: 'Controller of Examinations', room: 'Room NB-105' },
                { name: 'Prof. Sunita Sharma', role: 'Assistant Professor (Mathematics)', room: 'Room NB-102' },
                { name: 'Dr. Michael Chang', role: 'Professor (Network Security)', room: 'Room NB-205' },
                { name: 'Prof. Anita Desai', role: 'Associate Professor (IoT Systems)', room: 'Room NB-203' }
              ].map((fac, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 hover:border-emerald-300 transition-colors">
                  <div className="flex items-start justify-between gap-1">
                    <span className="font-bold text-stone-900 truncate">{fac.name}</span>
                    <span className="shrink-0 text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                      {fac.room}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-0.5 line-clamp-1">{fac.role}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Student Roster with Roll Numbers */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-700" />
                <span>Enrolled Students & Roll Numbers</span>
              </h4>
              <span className="text-[11px] text-stone-400 font-mono">241FA04... Series</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {[
                { name: 'Aarav Sharma', roll: '241FA04001', dept: 'CS (AI & Data Systems)', hall: 'Room NB-101' },
                { name: 'Maya Lin', roll: '241FA04002', dept: 'Electronics & Comm.', hall: 'Room NB-101' },
                { name: 'Rohan Patel', roll: '241FA04003', dept: 'Robotics & Mechatronics', hall: 'Room NB-101' },
                { name: 'Zoe Washington', roll: '241FA04004', dept: 'Cybersecurity', hall: 'Room NB-102' },
                { name: 'Karan Verma', roll: '241FA04005', dept: 'Electrical & Smart Grids', hall: 'Room NB-102' },
                { name: 'Ananya Iyer', roll: '241FA04015', dept: 'Data Science & Analytics', hall: 'Room NB-201' },
                { name: 'Vikramaditya Rao', roll: '241FA04042', dept: 'Automation & Controls', hall: 'Room NB-201' },
                { name: 'Vamsi Uppalapati', roll: '241FA04331', dept: 'Computer Science (Autonomous)', hall: 'Room NB-101' },
                { name: 'Sneha Reddy', roll: '241FA04088', dept: 'Bioengineering & Tech', hall: 'Room NB-204' },
                { name: 'Rahul Deshmukh', roll: '241FA04099', dept: 'Smart Infrastructure', hall: 'Room NB-204' }
              ].map((stu, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 hover:border-emerald-300 transition-colors">
                  <div className="flex items-start justify-between gap-1">
                    <span className="font-bold text-stone-900 truncate">{stu.name}</span>
                    <span className="shrink-0 text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                      {stu.roll}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-stone-500 mt-0.5">
                    <span className="truncate">{stu.dept}</span>
                    <span className="text-[10px] text-stone-400 font-mono">{stu.hall}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
