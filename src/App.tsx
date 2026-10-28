/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * CampusIQ Pro — Advanced Smart Campus Management Platform
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { QRScannerModal } from './components/QRScannerModal';
import { VerificationVerdictModal } from './components/VerificationVerdictModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { ThreeCampusDigitalTwin } from './components/ThreeCampusDigitalTwin';
import { ThreeAIOrb } from './components/ThreeAIOrb';
import { audioFeedback } from './utils/audioFeedback';

// Views
import { DashboardView } from './views/DashboardView';
import { StudentsIdCardView } from './views/StudentsIdCardView';
import { QRVerificationView } from './views/QRVerificationView';
import { AttendanceView } from './views/AttendanceView';
import { ExamsView } from './views/ExamsView';
import { LibraryView } from './views/LibraryView';
import { LabEquipmentView } from './views/LabEquipmentView';
import { EventsView } from './views/EventsView';
import { CanteenView } from './views/CanteenView';
import { GatePassView } from './views/GatePassView';
import { ParkingView } from './views/ParkingView';
import { ProjectsView } from './views/ProjectsView';
import { LostFoundView } from './views/LostFoundView';
import { ComplaintsView } from './views/ComplaintsView';
import { SkillPassportView } from './views/SkillPassportView';
import { AIAdvisorView } from './views/AIAdvisorView';
import { AnalyticsView } from './views/AnalyticsView';
import { RoleSwitcherView } from './views/RoleSwitcherView';
import { ThreeExamHallPlanner } from './views/ThreeExamHallPlanner';
import { ThreeLibraryExplorer } from './views/ThreeLibraryExplorer';
import { CoverPageView } from './views/CoverPageView';
import { LoginPageView } from './views/LoginPageView';

import {
  Student,
  UserRole,
  VerificationResult,
  CampusEvent,
  EventRegistration,
  Exam,
  HallTicket,
  LibraryBook,
  BookLoan,
  LabEquipment,
  LabRequest,
  CanteenMenuItem,
  CanteenOrder,
  GatePass,
  Visitor,
  ParkingSlot,
  ParkingPermit,
  ProjectSubmission,
  LostFoundItem,
  ComplaintTicket,
  AttendanceSession,
  AttendanceSummary,
  NotificationItem
} from './types/campus';
import { api } from './services/api';

const VALID_TABS: NavTab[] = [
  'cover', 'campus-3d', 'exam-hall-3d', 'library-3d', 'dashboard', 'students',
  'qr-verifier', 'attendance', 'exams', 'library', 'lab', 'events', 'canteen',
  'gatepass', 'parking', 'projects', 'skills', 'lost-found', 'complaints',
  'ai-advisor', 'analytics', 'roles'
];

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>(() => {
    if (typeof window !== 'undefined') {
      try {
        const hash = window.location.hash.replace(/^#\/?/, '') as NavTab;
        if (hash && VALID_TABS.includes(hash)) return hash;
        const stored = localStorage.getItem('campusiq_current_tab') as NavTab;
        if (stored && VALID_TABS.includes(stored)) return stored;
      } catch (_) {}
    }
    return 'cover';
  });

  const navigateToTab = useCallback((tab: NavTab) => {
    setCurrentTab(tab);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('campusiq_current_tab', tab);
        if (window.location.hash !== `#${tab}`) {
          window.history.replaceState(null, '', `#${tab}`);
        }
      } catch (_) {}
    }
  }, []);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace(/^#\/?/, '') as NavTab;
      if (hash && VALID_TABS.includes(hash) && hash !== currentTab) {
        setCurrentTab(hash);
        try {
          localStorage.setItem('campusiq_current_tab', hash);
        } catch (_) {}
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [currentTab]);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('campusiq_is_authenticated');
        if (stored === 'true') return true;
      } catch (_) {}
    }
    return false;
  });

  const [currentRole, setCurrentRole] = useState<UserRole>('College Administrator');
  const [currentUser, setCurrentUser] = useState<any>({ name: 'Prof. Arthur Davies' });
  const [activeStudent, setActiveStudent] = useState<Student | null>(null);

  const handleLoginSuccess = (
    user: { id?: string; name: string; role: UserRole; email?: string; department?: string },
    role: UserRole,
    student?: Student | null
  ) => {
    setCurrentRole(role);
    setCurrentUser(user);
    if (student) {
      setActiveStudent(student);
    }
    setIsAuthenticated(true);
    try {
      localStorage.setItem('campusiq_is_authenticated', 'true');
      localStorage.setItem('campusiq_current_role', role);
      localStorage.setItem('campusiq_user', JSON.stringify(user));
    } catch (_) {}

    api.switchRole(role, student?.id || user.id).catch(() => {});
    navigateToTab('cover');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('campusiq_is_authenticated');
      localStorage.removeItem('campusiq_user');
      window.location.hash = '';
    } catch (_) {}
  };

  // Modals
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isRoleSwitcherModalOpen, setIsRoleSwitcherModalOpen] = useState(false);
  const [verdictModal, setVerdictModal] = useState<{ result: VerificationResult | null; code: string }>({
    result: null,
    code: '',
  });

  // Data Stores
  const [stats, setStats] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [eventRegistrations, setEventRegistrations] = useState<EventRegistration[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [hallTickets, setHallTickets] = useState<HallTicket[]>([]);
  const [books, setBooks] = useState<LibraryBook[]>([]);
  const [loans, setLoans] = useState<BookLoan[]>([]);
  const [equipment, setEquipment] = useState<LabEquipment[]>([]);
  const [labRequests, setLabRequests] = useState<LabRequest[]>([]);
  const [canteenMenu, setCanteenMenu] = useState<CanteenMenuItem[]>([]);
  const [canteenOrders, setCanteenOrders] = useState<CanteenOrder[]>([]);
  const [gatePasses, setGatePasses] = useState<GatePass[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [parkingSlots, setParkingSlots] = useState<ParkingSlot[]>([]);
  const [parkingPermits, setParkingPermits] = useState<ParkingPermit[]>([]);
  const [projects, setProjects] = useState<ProjectSubmission[]>([]);
  const [userVotes, setUserVotes] = useState<any[]>([]);
  const [lostFound, setLostFound] = useState<LostFoundItem[]>([]);
  const [complaints, setComplaints] = useState<ComplaintTicket[]>([]);
  const [attendanceSessions, setAttendanceSessions] = useState<AttendanceSession[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary>({
    averageAttendance: 88.5,
    thresholdMinimum: 75.0,
    courses: [],
  });
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Initial load
  const loadAllData = useCallback(async () => {
    try {
      const [
        userRes,
        statsRes,
        studentsRes,
        eventsRes,
        examsRes,
        libraryRes,
        labRes,
        canteenRes,
        gateRes,
        parkingRes,
        projRes,
        lfRes,
        cmpRes,
        attRes,
        notifRes,
      ] = await Promise.all([
        api.getCurrentUser(),
        api.getDashboardStats(),
        api.getStudents(),
        api.getEvents(),
        api.getExams(),
        api.getLibraryData(),
        api.getLabEquipment(),
        api.getCanteenMenu(),
        api.getGatePasses(),
        api.getParking(),
        api.getProjects(),
        api.getLostFound(),
        api.getComplaints(),
        api.getAttendance(),
        api.getNotifications(),
      ]);

      const storedRole = localStorage.getItem('campusiq_current_role') as UserRole;
      if (storedRole) {
        setCurrentRole(storedRole);
      } else {
        setCurrentRole(userRes.role);
      }

      const storedUser = localStorage.getItem('campusiq_user');
      if (storedUser) {
        try {
          setCurrentUser(JSON.parse(storedUser));
        } catch (_) {
          setCurrentUser(userRes.user);
        }
      } else {
        setCurrentUser(userRes.user);
      }

      setActiveStudent(userRes.activeStudent);

      setStats(statsRes);
      setStudents(studentsRes.students || []);
      setEvents(eventsRes.events || []);
      setEventRegistrations(eventsRes.registrations || []);
      setExams(examsRes.exams || []);
      setHallTickets(examsRes.hallTickets || []);
      setBooks(libraryRes.books || []);
      setLoans(libraryRes.loans || []);
      setEquipment(labRes.equipment || []);
      setLabRequests(labRes.requests || []);
      setCanteenMenu(canteenRes.menu || []);
      setCanteenOrders(canteenRes.orders || []);
      setGatePasses(gateRes.passes || []);
      setVisitors(gateRes.visitors || []);
      setParkingSlots(parkingRes.slots || []);
      setParkingPermits(parkingRes.permits || []);
      setProjects(projRes.projects || []);
      setUserVotes(projRes.userVotes || []);
      setLostFound(lfRes.items || []);
      setComplaints(cmpRes.complaints || []);
      setAttendanceSessions(attRes.sessions || []);
      setAttendanceRecords(attRes.records || []);
      setAttendanceSummary(attRes.summary || { averageAttendance: 88.5, thresholdMinimum: 75.0, courses: [] });
      setNotifications(notifRes.notifications || []);
    } catch (err) {
      console.error('Data hydration error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Global Keydown for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSwitchRole = async (role: UserRole) => {
    try {
      await api.switchRole(role);
      setCurrentRole(role);
      loadAllData();
      setIsRoleSwitcherModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to switch role');
    }
  };

  const handleVerifyTokenDirect = async (token: string) => {
    try {
      const result = await api.verifyQR(token, 'Direct Console Verification', currentRole);
      if (result.valid) {
        audioFeedback.playSuccessSound();
        // Automatically announce roll number or student name aloud!
        audioFeedback.announceScan(result);
      } else {
        audioFeedback.playErrorSound();
      }
      setVerdictModal({ result, code: token });
    } catch (err: any) {
      audioFeedback.playErrorSound();
      alert(err.message || 'Token verification error');
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  };

  const handleSelectNotification = async (actionUrl: string, id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
      if (actionUrl) {
        navigateToTab(actionUrl as NavTab);
      }
    } catch (err) {
      console.error('Notification action error:', err);
    }
  };

  const defaultStudent = activeStudent || students[0] || {
    id: 'STU-2024-001',
    rollNumber: '241FA04001',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@student.campusiq.edu',
    department: 'Computer Science & Engineering',
    course: 'B.Tech CS (AI & Data Systems)',
    year: '3rd Year',
    semester: 'Semester VI',
    gpa: 3.88,
    attendancePercentage: 88.5,
    bloodGroup: 'O+ve',
    emergencyContact: '+1 (555) 234-5678',
    photo: '/src/assets/images/student_aarav_sharma.jpg',
    rfidTag: 'NFC-994821-CS',
    idCardStatus: 'Active' as const,
    idCardIssuedDate: '2024-08-15',
    idCardExpiryDate: '2027-06-30',
    qrToken: 'CIQ-STUID-STU-2024-001-9F2B81C4A0E1',
    mentor: 'Dr. Elena Chen'
  };

  if (!isAuthenticated) {
    return (
      <LoginPageView
        onLoginSuccess={handleLoginSuccess}
        availableStudents={students}
      />
    );
  }

  return (
    <div className="min-h-screen bg-stone-100/50 text-stone-900 font-sans flex flex-col antialiased">
      {/* Top Navigation */}
      <Navbar
        currentRole={currentRole}
        userName={currentUser?.name || 'Administrator'}
        notifications={notifications}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenRoleSwitcher={() => setIsRoleSwitcherModalOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onSelectNotification={handleSelectNotification}
        onMarkAllNotificationsRead={handleMarkAllNotificationsRead}
        onOpenCover={() => navigateToTab('cover')}
        onOpenDashboard={() => navigateToTab('dashboard')}
        onLogout={handleLogout}
        currentTab={currentTab}
      />

      {/* Main Layout Area */}
      <div className={`flex-1 flex ${currentTab === 'cover' ? 'w-full' : 'max-w-7xl w-full mx-auto'}`}>
        {/* Collapsible Sidebar: Hidden on cover page for an immersive exhibition landing portal */}
        {currentTab !== 'cover' && (
          <Sidebar
            currentTab={currentTab}
            onSelectTab={tab => navigateToTab(tab)}
            isOpen={sidebarOpen}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            userRole={currentRole}
          />
        )}

        {/* Viewport Content */}
        <main className={`flex-1 ${currentTab === 'cover' ? 'p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full' : 'p-4 lg:p-8'} overflow-y-auto`}>
          {loading ? (
            <div className="py-20 text-center text-xs text-stone-400">
              Synchronizing CampusIQ Pro database...
            </div>
          ) : (
            <>
              {currentTab === 'cover' && (
                <CoverPageView
                  onNavigate={tab => navigateToTab(tab)}
                  onOpenScanner={() => setIsScannerOpen(true)}
                  onSelectRole={role => {
                    setCurrentRole(role);
                    if (role === 'Student' && students.length > 0) {
                      setActiveStudent(students[0]);
                      setCurrentUser({ name: students[0].name });
                    }
                  }}
                  currentRole={currentRole}
                  student={activeStudent || (students.length > 0 ? students[0] : null)}
                  stats={stats}
                  onLogout={handleLogout}
                />
              )}

              {currentTab === 'dashboard' && (
                <DashboardView
                  stats={stats}
                  userRole={currentRole}
                  onNavigate={tab => setCurrentTab(tab)}
                  onOpenScanner={() => setIsScannerOpen(true)}
                />
              )}

              {currentTab === 'campus-3d' && (
                <ThreeCampusDigitalTwin
                  onNavigate={tab => setCurrentTab(tab)}
                />
              )}

              {currentTab === 'exam-hall-3d' && (
                <ThreeExamHallPlanner
                  exams={exams}
                  hallTickets={hallTickets}
                  userRole={currentRole}
                  onVerifyToken={handleVerifyTokenDirect}
                />
              )}

              {currentTab === 'library-3d' && (
                <ThreeLibraryExplorer
                  books={books}
                  equipment={equipment}
                  onNavigate={tab => setCurrentTab(tab)}
                  onVerifyToken={handleVerifyTokenDirect}
                />
              )}

              {currentTab === 'students' && (
                <StudentsIdCardView
                  students={students}
                  userRole={currentRole}
                  onRefresh={loadAllData}
                  onVerifyToken={handleVerifyTokenDirect}
                />
              )}

              {currentTab === 'qr-verifier' && (
                <QRVerificationView
                  userRole={currentRole}
                  onOpenScanner={() => setIsScannerOpen(true)}
                  onVerifyToken={handleVerifyTokenDirect}
                />
              )}

              {currentTab === 'attendance' && (
                <AttendanceView
                  sessions={attendanceSessions}
                  records={attendanceRecords}
                  summary={attendanceSummary}
                  userRole={currentRole}
                  onRefresh={loadAllData}
                  onVerifyToken={handleVerifyTokenDirect}
                />
              )}

              {currentTab === 'exams' && (
                <ExamsView
                  exams={exams}
                  hallTickets={hallTickets}
                  userRole={currentRole}
                  onRefresh={loadAllData}
                  onVerifyToken={handleVerifyTokenDirect}
                />
              )}

              {currentTab === 'library' && (
                <LibraryView
                  books={books}
                  loans={loans}
                  userRole={currentRole}
                  onRefresh={loadAllData}
                  onVerifyToken={handleVerifyTokenDirect}
                />
              )}

              {currentTab === 'lab' && (
                <LabEquipmentView
                  equipment={equipment}
                  requests={labRequests}
                  userRole={currentRole}
                  onRefresh={loadAllData}
                  onVerifyToken={handleVerifyTokenDirect}
                />
              )}

              {currentTab === 'events' && (
                <EventsView
                  events={events}
                  registrations={eventRegistrations}
                  userRole={currentRole}
                  onRefresh={loadAllData}
                  onVerifyToken={handleVerifyTokenDirect}
                />
              )}

              {currentTab === 'canteen' && (
                <CanteenView
                  menu={canteenMenu}
                  orders={canteenOrders}
                  userRole={currentRole}
                  onRefresh={loadAllData}
                  onVerifyToken={handleVerifyTokenDirect}
                />
              )}

              {currentTab === 'gatepass' && (
                <GatePassView
                  passes={gatePasses}
                  visitors={visitors}
                  userRole={currentRole}
                  onRefresh={loadAllData}
                  onVerifyToken={handleVerifyTokenDirect}
                />
              )}

              {currentTab === 'parking' && (
                <ParkingView
                  slots={parkingSlots}
                  permits={parkingPermits}
                  userRole={currentRole}
                  onRefresh={loadAllData}
                  onVerifyToken={handleVerifyTokenDirect}
                />
              )}

              {currentTab === 'projects' && (
                <ProjectsView
                  projects={projects}
                  userVotes={userVotes}
                  userRole={currentRole}
                  onRefresh={loadAllData}
                  onVerifyToken={handleVerifyTokenDirect}
                />
              )}

              {currentTab === 'lost-found' && (
                <LostFoundView
                  items={lostFound}
                  userRole={currentRole}
                  onRefresh={loadAllData}
                />
              )}

              {currentTab === 'complaints' && (
                <ComplaintsView
                  complaints={complaints}
                  userRole={currentRole}
                  onRefresh={loadAllData}
                />
              )}

              {currentTab === 'skills' && (
                <SkillPassportView
                  student={defaultStudent}
                  userRole={currentRole}
                  onRefresh={loadAllData}
                  onVerifyToken={handleVerifyTokenDirect}
                />
              )}

              {currentTab === 'ai-advisor' && (
                <AIAdvisorView
                  student={defaultStudent}
                  userRole={currentRole}
                />
              )}

              {currentTab === 'analytics' && (
                <AnalyticsView />
              )}

              {currentTab === 'roles' && (
                <RoleSwitcherView
                  currentRole={currentRole}
                  onSwitchRole={handleSwitchRole}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Modals & Dialogs */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        defaultVerifierRole={currentRole}
        onVerified={(result, code) => setVerdictModal({ result, code })}
      />

      <VerificationVerdictModal
        result={verdictModal.result}
        code={verdictModal.code}
        onClose={() => setVerdictModal({ result: null, code: '' })}
        onRedeemed={loadAllData}
      />

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={tab => navigateToTab(tab)}
        students={students}
        events={events}
        books={books}
        equipment={equipment}
      />

      {isRoleSwitcherModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-stone-200 max-h-[85vh] overflow-y-auto">
            <RoleSwitcherView
              currentRole={currentRole}
              onSwitchRole={handleSwitchRole}
              onClose={() => setIsRoleSwitcherModalOpen(false)}
            />
            <div className="mt-4 pt-3 border-t border-stone-200 flex justify-end">
              <button
                onClick={() => setIsRoleSwitcherModalOpen(false)}
                className="px-4 py-2 bg-stone-900 text-white rounded-lg text-xs font-semibold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating 3D AI Assistant Orb */}
      <ThreeAIOrb
        student={defaultStudent}
        userRole={currentRole}
        onNavigate={tab => navigateToTab(tab)}
      />
    </div>
  );
}
