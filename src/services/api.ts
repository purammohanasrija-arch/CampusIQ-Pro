/**
 * CampusIQ Pro — Typed Client API Service
 */

import {
  Student,
  VerificationResult,
  VerificationLog,
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
  SkillPassport,
  NotificationItem,
  UserRole
} from '../types/campus';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });
  if (!res.ok) {
    let errMessage = `Error ${res.status}: ${res.statusText}`;
    try {
      const body = await res.json();
      if (body.error) errMessage = body.error;
      else if (body.message) errMessage = body.message;
    } catch (_) {}
    throw new Error(errMessage);
  }
  return res.json();
}

export const api = {
  // Auth & Roles
  async getCurrentUser() {
    return fetchJSON<{
      role: UserRole;
      user: any;
      activeStudent: Student;
      allRoles: Array<{ role: UserRole; name: string; department: string }>;
    }>('/api/auth/current-user');
  },

  async switchRole(role: UserRole, studentId?: string) {
    return fetchJSON<{ success: boolean; currentRole: UserRole; currentUserId: string }>('/api/auth/switch-role', {
      method: 'POST',
      body: JSON.stringify({ role, studentId }),
    });
  },

  // Dashboard Stats
  async getDashboardStats() {
    return fetchJSON<{
      totalStudents: number;
      facultyCount: number;
      departmentsCount: number;
      departments: string[];
      avgAttendance: number;
      upcomingExams: number;
      activeEvents: number;
      library: { total: number; available: number; loaned: number };
      pendingGatePasses: number;
      equipment: { available: number; total: number };
      openComplaints: number;
      recentActivities: VerificationLog[];
    }>('/api/stats');
  },

  // Universal QR Verification
  async verifyQR(code: string, verifierStation?: string, verifierRole?: string) {
    return fetchJSON<VerificationResult>('/api/qr/verify', {
      method: 'POST',
      body: JSON.stringify({ code, verifierStation, verifierRole }),
    });
  },

  async getQRLogs() {
    return fetchJSON<{ logs: VerificationLog[] }>('/api/qr/logs');
  },

  // Students & ID Cards
  async getStudents() {
    return fetchJSON<{ students: Student[] }>('/api/students');
  },

  async createStudent(studentData: Partial<Student>) {
    return fetchJSON<{ success: boolean; student: Student }>('/api/students', {
      method: 'POST',
      body: JSON.stringify(studentData),
    });
  },

  async updateStudentCard(studentId: string, action: 'renew' | 'deactivate' | 'reissue' | 'activate') {
    return fetchJSON<{ success: boolean; student: Student }>(`/api/students/${studentId}/id-card`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  },

  // Events
  async getEvents() {
    return fetchJSON<{ events: CampusEvent[]; registrations: EventRegistration[] }>('/api/events');
  },

  async createEvent(eventData: Partial<CampusEvent>) {
    return fetchJSON<{ success: boolean; event: CampusEvent }>('/api/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  },

  async registerEvent(eventId: string, studentId?: string) {
    return fetchJSON<{ success: boolean; registration: EventRegistration; message: string }>(`/api/events/${eventId}/register`, {
      method: 'POST',
      body: JSON.stringify({ studentId }),
    });
  },

  async checkInEvent(eventId: string, registrationId: string) {
    return fetchJSON<{ success: boolean; registration: EventRegistration; message: string }>(`/api/events/${eventId}/check-in`, {
      method: 'POST',
      body: JSON.stringify({ registrationId }),
    });
  },

  // Exams & Hall Tickets
  async getExams() {
    return fetchJSON<{ exams: Exam[]; hallTickets: HallTicket[] }>('/api/exams');
  },

  async generateHallTicket(studentId?: string) {
    return fetchJSON<{ success: boolean; hallTicket: HallTicket; alreadyGenerated?: boolean }>('/api/exams/hall-tickets/generate', {
      method: 'POST',
      body: JSON.stringify({ studentId }),
    });
  },

  // Library
  async getLibraryData() {
    return fetchJSON<{ books: LibraryBook[]; loans: BookLoan[] }>('/api/library/books');
  },

  async createBook(bookData: Partial<LibraryBook>) {
    return fetchJSON<{ success: boolean; book: LibraryBook }>('/api/library/books', {
      method: 'POST',
      body: JSON.stringify(bookData),
    });
  },

  async issueBook(bookId: string, studentId?: string, loanDays?: number) {
    return fetchJSON<{ success: boolean; loan: BookLoan; availableCopies: number }>('/api/library/issue', {
      method: 'POST',
      body: JSON.stringify({ bookId, studentId, loanDays }),
    });
  },

  async returnBook(loanId: string) {
    return fetchJSON<{ success: boolean; loan: BookLoan; message: string }>('/api/library/return', {
      method: 'POST',
      body: JSON.stringify({ loanId }),
    });
  },

  // Lab Equipment
  async getLabEquipment() {
    return fetchJSON<{ equipment: LabEquipment[]; requests: LabRequest[] }>('/api/lab/equipment');
  },

  async createEquipment(data: Partial<LabEquipment>) {
    return fetchJSON<{ success: boolean; equipment: LabEquipment }>('/api/lab/equipment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async requestEquipment(equipmentId: string, purpose: string, days?: number) {
    return fetchJSON<{ success: boolean; request: LabRequest; equipment: LabEquipment }>('/api/lab/request', {
      method: 'POST',
      body: JSON.stringify({ equipmentId, purpose, days }),
    });
  },

  async performLabAction(equipmentId: string, action: 'return' | 'maintenance' | 'available') {
    return fetchJSON<{ success: boolean; equipment: LabEquipment }>('/api/lab/action', {
      method: 'POST',
      body: JSON.stringify({ equipmentId, action }),
    });
  },

  // Canteen
  async getCanteenMenu() {
    return fetchJSON<{ menu: CanteenMenuItem[]; orders: CanteenOrder[]; walletBalance: number }>('/api/canteen/menu');
  },

  async placeOrder(
    items: Array<{ menuItemId: string; quantity: number }>,
    paymentDetails?: {
      paymentMethod?: string;
      transactionId?: string;
      notes?: string;
    }
  ) {
    return fetchJSON<{ success: boolean; order: CanteenOrder; remainingWalletBalance: number }>('/api/canteen/order', {
      method: 'POST',
      body: JSON.stringify({ items, ...(paymentDetails || {}) }),
    });
  },

  async topUpWallet(amount: number) {
    return fetchJSON<{ success: boolean; walletBalance: number; message: string }>('/api/canteen/wallet/topup', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  },

  async updateOrderStatus(orderId: string, status: string) {
    return fetchJSON<{ success: boolean; order: CanteenOrder }>(`/api/canteen/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async pickupOrder(orderId: string) {
    return fetchJSON<{ success: boolean; order: CanteenOrder; message: string }>(`/api/canteen/orders/${orderId}/pickup`, {
      method: 'POST',
    });
  },

  // Gate Pass & Visitors
  async getGatePasses() {
    return fetchJSON<{ passes: GatePass[]; visitors: Visitor[] }>('/api/gate-passes');
  },

  async createGatePass(data: Partial<GatePass>) {
    return fetchJSON<{ success: boolean; pass: GatePass }>('/api/gate-passes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateGatePassStatus(passId: string, status: 'Approved' | 'Rejected' | 'Cancelled') {
    return fetchJSON<{ success: boolean; pass: GatePass }>(`/api/gate-passes/${passId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async scanGatePass(passId: string) {
    return fetchJSON<{ success: boolean; action: string; pass: GatePass; message: string }>('/api/gate-passes/scan', {
      method: 'POST',
      body: JSON.stringify({ passId }),
    });
  },

  async createVisitor(data: Partial<Visitor>) {
    return fetchJSON<{ success: boolean; visitor: Visitor }>('/api/visitors', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Smart Parking
  async getParking() {
    return fetchJSON<{ slots: ParkingSlot[]; permits: ParkingPermit[] }>('/api/parking/slots');
  },

  async reserveParking(slotId: string, vehicleNumber: string, vehicleType?: string) {
    return fetchJSON<{ success: boolean; slot: ParkingSlot; permit: ParkingPermit }>('/api/parking/reserve', {
      method: 'POST',
      body: JSON.stringify({ slotId, vehicleNumber, vehicleType }),
    });
  },

  async performParkingAction(slotId: string, action: 'occupy' | 'vacate') {
    return fetchJSON<{ success: boolean; slot: ParkingSlot }>('/api/parking/action', {
      method: 'POST',
      body: JSON.stringify({ slotId, action }),
    });
  },

  // Project Expo
  async getProjects() {
    return fetchJSON<{ projects: ProjectSubmission[]; userVotes: any[] }>('/api/projects');
  },

  async createProject(data: Partial<ProjectSubmission>) {
    return fetchJSON<{ success: boolean; project: ProjectSubmission }>('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async voteProject(projectId: string, userId?: string) {
    return fetchJSON<{ success: boolean; votesCount: number; message: string }>(`/api/projects/${projectId}/vote`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  async scoreProject(projectId: string, scores: { innovation: number; architecture: number; impact: number }) {
    return fetchJSON<{ success: boolean; project: ProjectSubmission; message: string }>(`/api/projects/${projectId}/score`, {
      method: 'POST',
      body: JSON.stringify(scores),
    });
  },

  // Lost & Found
  async getLostFound() {
    return fetchJSON<{ items: LostFoundItem[] }>('/api/lost-found');
  },

  async createLostFound(data: Partial<LostFoundItem>) {
    return fetchJSON<{ success: boolean; item: LostFoundItem }>('/api/lost-found', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async claimLostFound(itemId: string, verificationAnswer: string) {
    return fetchJSON<{ success: boolean; item: LostFoundItem; message: string }>(`/api/lost-found/${itemId}/claim`, {
      method: 'POST',
      body: JSON.stringify({ verificationAnswer }),
    });
  },

  // Complaints
  async getComplaints() {
    return fetchJSON<{ complaints: ComplaintTicket[] }>('/api/complaints');
  },

  async createComplaint(data: Partial<ComplaintTicket>) {
    return fetchJSON<{ success: boolean; complaint: ComplaintTicket }>('/api/complaints', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateComplaintStatus(id: string, status: string, note?: string) {
    return fetchJSON<{ success: boolean; complaint: ComplaintTicket }>(`/api/complaints/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    });
  },

  // Attendance & NFC
  async getAttendance() {
    return fetchJSON<{
      sessions: AttendanceSession[];
      records: any[];
      summary: AttendanceSummary;
    }>('/api/attendance');
  },

  async markAttendance(courseCode?: string, method?: string, studentId?: string) {
    return fetchJSON<{
      success: boolean;
      record: any;
      student?: { id: string; name: string; rollNumber: string };
      message: string;
    }>('/api/attendance/mark', {
      method: 'POST',
      body: JSON.stringify({ courseCode, method, studentId }),
    });
  },

  async startAttendanceSession(courseCode: string, courseName: string) {
    return fetchJSON<{ success: boolean; session: AttendanceSession }>('/api/attendance/session/start', {
      method: 'POST',
      body: JSON.stringify({ courseCode, courseName }),
    });
  },

  // Skill Passport
  async getSkillPassport(studentId: string) {
    return fetchJSON<{ passport: SkillPassport; student: Student }>(`/api/skills/${studentId}`);
  },

  async verifyCertificate(studentId: string, certificateTitle: string) {
    return fetchJSON<{ success: boolean; passport: SkillPassport }>(`/api/skills/${studentId}/verify`, {
      method: 'POST',
      body: JSON.stringify({ certificateTitle }),
    });
  },

  // Notifications
  async getNotifications() {
    return fetchJSON<{ notifications: NotificationItem[] }>('/api/notifications');
  },

  async markNotificationRead(id: string) {
    return fetchJSON<{ success: boolean }>(`/api/notifications/${id}/read`, {
      method: 'PATCH',
    });
  },

  async markAllNotificationsRead() {
    return fetchJSON<{ success: boolean }>('/api/notifications/read-all', {
      method: 'PATCH',
    });
  },

  // Analytics
  async getAnalytics() {
    return fetchJSON<{
      departmentDistribution: any[];
      attendanceTrends: any[];
      libraryCirculation: any[];
      canteenDailySales: any[];
      complaintResolutionTime: any;
    }>('/api/analytics');
  },

  // AI Advisor
  async askAIAdvisor(prompt: string, studentId?: string, userRole?: string) {
    return fetchJSON<{ success: boolean; reply: string; source: string }>('/api/ai/advisor', {
      method: 'POST',
      body: JSON.stringify({ prompt, studentId, userRole }),
    });
  },
};
