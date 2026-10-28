/**
 * CampusIQ Pro — Core TypeScript Types and Interfaces
 */

export type UserRole =
  | 'Super Administrator'
  | 'College Administrator'
  | 'Faculty'
  | 'Student'
  | 'Librarian'
  | 'Lab Technician'
  | 'Canteen Staff'
  | 'Security Staff'
  | 'Event Organizer'
  | 'Examination Staff'
  | 'Project Judge';

export interface Student {
  id: string;
  rollNumber: string;
  name: string;
  email: string;
  department: string;
  course: string;
  year: string;
  semester: string;
  gpa: number;
  attendancePercentage: number;
  bloodGroup: string;
  emergencyContact: string;
  photo: string;
  rfidTag: string;
  idCardStatus: 'Active' | 'Deactivated' | 'Expired';
  idCardIssuedDate: string;
  idCardExpiryDate: string;
  qrToken: string;
  mentor: string;
}

export interface VerificationResult {
  valid: boolean;
  status: string;
  type?: string;
  message: string;
  data?: any;
  student?: any;
  canRedeem?: boolean;
  redeemEndpoint?: string;
  payload?: any;
}

export interface VerificationLog {
  id: string;
  token: string;
  type: string;
  entityId: string;
  subjectName: string;
  verifiedBy: string;
  status: string;
  timestamp: string;
  notes: string;
}

export interface CampusEvent {
  id: string;
  title: string;
  category: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  capacity: number;
  registeredCount: number;
  checkedInCount: number;
  eligibility: string;
  registrationDeadline: string;
  organizer: string;
  status: string;
  entryQRCode: string;
  bannerUrl: string;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  studentId: string;
  studentName: string;
  registeredAt: string;
  qrPass: string;
  status: 'Confirmed' | 'Checked-In' | 'Cancelled';
  checkedInAt: string | null;
  seatNumber: string;
}

export interface Exam {
  id: string;
  courseCode: string;
  subjectName: string;
  date: string;
  reportingTime: string;
  session: string;
  department: string;
  semester: string;
  roomNumber: string;
  totalCandidates: number;
  status: string;
}

export interface HallTicket {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  examPeriod: string;
  department: string;
  roomNumber: string;
  seatNumber: string;
  examDates: Array<{
    subject: string;
    date: string;
    time: string;
    room: string;
  }>;
  issuedAt: string;
  qrToken: string;
  eligibilityStatus: string;
  verifiedAtGate: boolean;
}

export interface LibraryBook {
  id: string;
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
  shelfLocation: string;
  coverImage: string;
  qrCode: string;
}

export interface BookLoan {
  id: string;
  bookId: string;
  bookTitle: string;
  studentId: string;
  studentName: string;
  issuedDate: string;
  dueDate: string;
  returnedDate: string | null;
  overdueDays: number;
  fineAmount: number;
  status: 'Active' | 'Overdue' | 'Returned';
  qrCode: string;
}

export interface LabEquipment {
  id: string;
  assetId: string;
  name: string;
  category: string;
  lab: string;
  condition: string;
  status: 'Available' | 'Borrowed' | 'Under Maintenance';
  allocatedTo: { studentId: string; studentName: string; dueDate: string } | null;
  serialNumber: string;
  qrTag: string;
}

export interface LabRequest {
  id: string;
  equipmentId: string;
  equipmentName: string;
  studentId: string;
  studentName: string;
  requestDate: string;
  purpose: string;
  status: string;
  approvedBy: string;
  returnDueDate: string;
}

export interface CanteenMenuItem {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  available: boolean;
  dietary: string;
  image: string;
  calories?: number;
  preparationTime?: string;
  rating?: number;
}

export interface CanteenOrder {
  id: string;
  orderNumber: string;
  studentId: string;
  studentName: string;
  items: Array<{
    menuItemId: string;
    name: string;
    quantity: number;
    unitPrice: number;
  }>;
  subtotal: number;
  tax: number;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod?: string;
  transactionId?: string;
  status: 'Placed' | 'Accepted' | 'Preparing' | 'Ready' | 'Completed' | 'Cancelled';
  pickupToken: string;
  orderedAt: string;
  redeemed: boolean;
  notes?: string;
}

export interface GatePass {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  reason: string;
  departureTime: string;
  expectedReturnTime: string;
  destination: string;
  parentConsentVerified: boolean;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Expired';
  approvedBy: string;
  qrPass: string;
  exitTimestamp: string | null;
  entryTimestamp: string | null;
  passType: string;
}

export interface Visitor {
  id: string;
  visitorName: string;
  affiliation: string;
  hostFaculty: string;
  hostDepartment: string;
  purpose: string;
  visitDate: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: string;
  badgeQR: string;
}

export interface ParkingSlot {
  id: string;
  zone: string;
  slotNumber: string;
  type: string;
  status: 'Available' | 'Occupied' | 'Reserved';
  currentVehicle: string | null;
  reservedBy?: string;
}

export interface ParkingPermit {
  id: string;
  slotId: string;
  slotNumber: string;
  studentId: string;
  vehicleNumber: string;
  vehicleType: string;
  validDate: string;
  qrPass: string;
  status: string;
}

export interface ProjectSubmission {
  id: string;
  title: string;
  category: string;
  leadStudent: string;
  teamMembers: string[];
  department: string;
  advisor: string;
  description: string;
  boothNumber: string;
  demoVideoUrl: string;
  votesCount: number;
  judgeScore: number;
  status: string;
  qrCode: string;
  imageUrl?: string;
  techStack?: string[];
  githubUrl?: string;
  abstract?: string;
  keySpecifications?: string[];
  documentation?: {
    overview: string;
    methodology: string;
    results: string;
    futureWork: string;
    billOfMaterials?: string;
  };
}

export interface LostFoundItem {
  id: string;
  type: 'Lost' | 'Found';
  title: string;
  category: string;
  locationFound: string;
  dateReported: string;
  description: string;
  securityQuestion: string;
  status: string;
  reportedBy: string;
  contactHidden: boolean;
}

export interface ComplaintTicket {
  id: string;
  ticketNumber: string;
  studentId: string;
  studentName: string;
  category: string;
  title: string;
  description: string;
  assignedDepartment: string;
  priority: 'Low' | 'Medium' | 'High';
  status: 'Submitted' | 'Acknowledged' | 'In Progress' | 'Resolved' | 'Reopened';
  targetResolutionHours: number;
  createdAt: string;
  staffNotes: string;
  statusHistory: Array<{
    status: string;
    time: string;
    note: string;
  }>;
}

export interface AttendanceSummary {
  averageAttendance: number;
  thresholdMinimum: number;
  courses: Array<{
    code: string;
    name: string;
    attended: number;
    total: number;
    pct: number;
  }>;
}

export interface AttendanceSession {
  id: string;
  courseCode: string;
  courseName: string;
  facultyId: string;
  facultyName: string;
  date: string;
  timeWindow: string;
  sessionCode: string;
  activeQrToken: string;
  expiresAt: string;
  totalPresent: number;
  totalEnrolled: number;
}

export interface SkillPassport {
  studentId: string;
  headline: string;
  bio: string;
  skills: string[];
  certifications: Array<{
    title: string;
    issuer: string;
    date: string;
    verified: boolean;
    credentialId: string;
  }>;
  hackathons: Array<{
    name: string;
    award: string;
    project: string;
  }>;
  internships: Array<{
    company: string;
    role: string;
    period: string;
    verified: boolean;
  }>;
  careerGoals: string;
  shareableId: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'exam' | 'library' | 'gatepass' | 'canteen' | 'event' | 'complaint';
  timestamp: string;
  read: boolean;
  actionUrl: string;
}
