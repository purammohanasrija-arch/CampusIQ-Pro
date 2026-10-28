const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const dbPath = path.resolve(rootDir, 'data/database.json');
const serverPath = path.resolve(rootDir, 'server.ts');

console.log('Reading database from', dbPath);
let db = {};
if (fs.existsSync(dbPath)) {
  db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
}

// 1. Updated Faculty Roster with Names, Roles, and Rooms
const updatedUsers = [
  { id: 'USR-01', name: 'Dr. Sarah Jenkins', role: 'Super Administrator', email: 'director@campusiq.edu', department: 'Executive Directorate', designation: 'Campus Director', roomNumber: 'Room NB-301' },
  { id: 'USR-02', name: 'Prof. Arthur Davies', role: 'College Administrator', email: 'dean@campusiq.edu', department: 'Academic Affairs', designation: 'Dean of Academics & Warden', roomNumber: 'Room NB-101' },
  { id: 'USR-03', name: 'Dr. Elena Chen', role: 'Faculty', email: 'elena.chen@campusiq.edu', department: 'Computer Science & Engineering', designation: 'Professor & Head of Department', roomNumber: 'Room NB-201' },
  { id: 'USR-04', name: 'Aarav Sharma', role: 'Student', email: 'aarav.sharma@student.campusiq.edu', department: 'Computer Science', rollNumber: '241FA04001', roomNumber: 'Room NB-101' },
  { id: 'USR-05', name: 'Marcus Bell', role: 'Librarian', email: 'library@campusiq.edu', department: 'Central Library', designation: 'Head Librarian', roomNumber: 'Room NB-104 (Library Wing)' },
  { id: 'USR-06', name: 'Vikram Mehta', role: 'Lab Technician', email: 'labtech@campusiq.edu', department: 'Robotics & IoT', designation: 'Senior Lab Instructor', roomNumber: 'Room NB-305 (Robotics Lab)' },
  { id: 'USR-07', name: 'Chef Mario Rossi', role: 'Canteen Staff', email: 'canteen@campusiq.edu', department: 'Campus Dining', designation: 'Dining Facility Manager', roomNumber: 'Room NB-G02 (Cafeteria)' },
  { id: 'USR-08', name: 'Chief Jackson Reed', role: 'Security Staff', email: 'security@campusiq.edu', department: 'Campus Security', designation: 'Chief Security Officer', roomNumber: 'Room NB-G01 (Security Post)' },
  { id: 'USR-09', name: 'Priya Nambiar', role: 'Event Organizer', email: 'events@campusiq.edu', department: 'Student Council', designation: 'Cultural Secretary', roomNumber: 'Room NB-108 (Council Hall)' },
  { id: 'USR-10', name: 'Dr. Robert Thorne', role: 'Examination Staff', email: 'coe@campusiq.edu', department: 'Controller of Exams', designation: 'Controller of Examinations', roomNumber: 'Room NB-105 (Exam Confidential Room)' },
  { id: 'USR-11', name: 'Dr. Sophia Vance', role: 'Project Judge', email: 'sophia.vance@techpartner.com', department: 'Industry Advisory Board', designation: 'Industry Tech Fellow', roomNumber: 'Room NB-206' },
  { id: 'USR-12', name: 'Prof. David Miller', role: 'Faculty', email: 'david.miller@campusiq.edu', department: 'Electronics & Communication', designation: 'Associate Professor', roomNumber: 'Room NB-204' },
  { id: 'USR-13', name: 'Prof. Meera Kulkarni', role: 'Faculty', email: 'meera.k@campusiq.edu', department: 'Artificial Intelligence & ML', designation: 'Professor & Lab Director', roomNumber: 'Room NB-202' },
  { id: 'USR-14', name: 'Dr. Rajesh Sundaram', role: 'Faculty', email: 'rajesh.s@campusiq.edu', department: 'Mechanical & Robotics', designation: 'Professor & Research Chair', roomNumber: 'Room NB-305' },
  { id: 'USR-15', name: 'Prof. Sunita Sharma', role: 'Faculty', email: 'sunita.s@campusiq.edu', department: 'Mathematics & Computing', designation: 'Assistant Professor', roomNumber: 'Room NB-102' },
  { id: 'USR-16', name: 'Dr. Michael Chang', role: 'Faculty', email: 'michael.c@campusiq.edu', department: 'Cybersecurity', designation: 'Professor', roomNumber: 'Room NB-205' },
  { id: 'USR-17', name: 'Prof. Anita Desai', role: 'Faculty', email: 'anita.d@campusiq.edu', department: 'IoT & Embedded Systems', designation: 'Associate Professor', roomNumber: 'Room NB-203' }
];

// 2. Updated Student Roster with Names, Roll Numbers (241FA04001 and so on)
const updatedStudents = [
  {
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
    rfidTag: 'NFC-241FA04001-CS',
    idCardStatus: 'Active',
    idCardIssuedDate: '2024-08-15',
    idCardExpiryDate: '2027-06-30',
    qrToken: 'CIQ-STUID-241FA04001-9F2B81',
    mentor: 'Dr. Elena Chen (Room NB-201)'
  },
  {
    id: 'STU-2024-002',
    rollNumber: '241FA04002',
    name: 'Maya Lin',
    email: 'maya.lin@student.campusiq.edu',
    department: 'Electronics & Communication',
    course: 'B.Tech ECE',
    year: '3rd Year',
    semester: 'Semester VI',
    gpa: 3.75,
    attendancePercentage: 92.0,
    bloodGroup: 'B+ve',
    emergencyContact: '+1 (555) 876-5432',
    photo: '/src/assets/images/student_maya_lin.jpg',
    rfidTag: 'NFC-241FA04002-EC',
    idCardStatus: 'Active',
    idCardIssuedDate: '2024-08-15',
    idCardExpiryDate: '2027-06-30',
    qrToken: 'CIQ-STUID-241FA04002-3A1D7B',
    mentor: 'Prof. David Miller (Room NB-204)'
  },
  {
    id: 'STU-2024-003',
    rollNumber: '241FA04003',
    name: 'Rohan Patel',
    email: 'rohan.patel@student.campusiq.edu',
    department: 'Mechanical & Mechatronics',
    course: 'B.Tech Robotics',
    year: '4th Year',
    semester: 'Semester VIII',
    gpa: 3.62,
    attendancePercentage: 74.2,
    bloodGroup: 'A+ve',
    emergencyContact: '+1 (555) 345-6789',
    photo: '/src/assets/images/student_rohan_patel.jpg',
    rfidTag: 'NFC-241FA04003-ME',
    idCardStatus: 'Active',
    idCardIssuedDate: '2023-08-10',
    idCardExpiryDate: '2026-06-30',
    qrToken: 'CIQ-STUID-241FA04003-7B4F90',
    mentor: 'Dr. Rajesh Sundaram (Room NB-305)'
  },
  {
    id: 'STU-2024-004',
    rollNumber: '241FA04004',
    name: 'Zoe Washington',
    email: 'zoe.w@student.campusiq.edu',
    department: 'Computer Science & Engineering',
    course: 'B.Tech CS (Cybersecurity)',
    year: '2nd Year',
    semester: 'Semester IV',
    gpa: 3.92,
    attendancePercentage: 95.8,
    bloodGroup: 'AB+ve',
    emergencyContact: '+1 (555) 456-7890',
    photo: '/src/assets/images/student_zoe_washington.jpg',
    rfidTag: 'NFC-241FA04004-CS',
    idCardStatus: 'Active',
    idCardIssuedDate: '2025-08-15',
    idCardExpiryDate: '2028-06-30',
    qrToken: 'CIQ-STUID-241FA04004-1C2D3E',
    mentor: 'Dr. Michael Chang (Room NB-205)'
  },
  {
    id: 'STU-2024-005',
    rollNumber: '241FA04005',
    name: 'Karan Verma',
    email: 'karan.verma@student.campusiq.edu',
    department: 'Electrical & Electronics',
    course: 'B.Tech EEE (Smart Grids)',
    year: '3rd Year',
    semester: 'Semester VI',
    gpa: 3.71,
    attendancePercentage: 86.4,
    bloodGroup: 'O-ve',
    emergencyContact: '+1 (555) 567-8901',
    photo: '/src/assets/images/student_karan_verma.jpg',
    rfidTag: 'NFC-241FA04005-EE',
    idCardStatus: 'Active',
    idCardIssuedDate: '2024-08-15',
    idCardExpiryDate: '2027-06-30',
    qrToken: 'CIQ-STUID-241FA04005-4D5E6F',
    mentor: 'Prof. Anita Desai (Room NB-203)'
  },
  {
    id: 'STU-2024-006',
    rollNumber: '241FA04015',
    name: 'Ananya Iyer',
    email: 'ananya.iyer@student.campusiq.edu',
    department: 'Computer Science & Engineering',
    course: 'B.Tech Data Science',
    year: '3rd Year',
    semester: 'Semester VI',
    gpa: 3.95,
    attendancePercentage: 94.2,
    bloodGroup: 'A+ve',
    emergencyContact: '+1 (555) 678-9012',
    photo: '/src/assets/images/student_ananya_iyer.jpg',
    rfidTag: 'NFC-241FA04015-DS',
    idCardStatus: 'Active',
    idCardIssuedDate: '2024-08-15',
    idCardExpiryDate: '2027-06-30',
    qrToken: 'CIQ-STUID-241FA04015-8A9B0C',
    mentor: 'Prof. Meera Kulkarni (Room NB-202)'
  },
  {
    id: 'STU-2024-007',
    rollNumber: '241FA04042',
    name: 'Vikramaditya Rao',
    email: 'vikram.rao@student.campusiq.edu',
    department: 'Mechanical & Mechatronics',
    course: 'B.Tech Automation',
    year: '2nd Year',
    semester: 'Semester IV',
    gpa: 3.68,
    attendancePercentage: 89.0,
    bloodGroup: 'B+ve',
    emergencyContact: '+1 (555) 789-0123',
    photo: '/src/assets/images/student_vikramaditya_rao.jpg',
    rfidTag: 'NFC-241FA04042-ME',
    idCardStatus: 'Active',
    idCardIssuedDate: '2025-08-15',
    idCardExpiryDate: '2028-06-30',
    qrToken: 'CIQ-STUID-241FA04042-3E4F5A',
    mentor: 'Dr. Rajesh Sundaram (Room NB-305)'
  },
  {
    id: 'STU-2024-008',
    rollNumber: '241FA04331',
    name: 'Vamsi Uppalapati',
    email: 'vu.241fa04331@gmail.com',
    department: 'Computer Science & Engineering',
    course: 'B.Tech CS (AI & Autonomous Systems)',
    year: '3rd Year',
    semester: 'Semester VI',
    gpa: 3.96,
    attendancePercentage: 96.5,
    bloodGroup: 'O+ve',
    emergencyContact: '+1 (555) 890-1234',
    photo: '/src/assets/images/student_vamsi_uppalapati.jpg',
    rfidTag: 'NFC-241FA04331-CS',
    idCardStatus: 'Active',
    idCardIssuedDate: '2024-08-15',
    idCardExpiryDate: '2027-06-30',
    qrToken: 'CIQ-STUID-241FA04331-7C8D9E',
    mentor: 'Dr. Elena Chen (Room NB-201)'
  },
  {
    id: 'STU-2024-009',
    rollNumber: '241FA04088',
    name: 'Sneha Reddy',
    email: 'sneha.reddy@student.campusiq.edu',
    department: 'Biotechnology & Bioinformatics',
    course: 'B.Tech Bioengineering',
    year: '4th Year',
    semester: 'Semester VIII',
    gpa: 3.84,
    attendancePercentage: 91.0,
    bloodGroup: 'AB+ve',
    emergencyContact: '+1 (555) 901-2345',
    photo: '/src/assets/images/student_sneha_reddy.jpg',
    rfidTag: 'NFC-241FA04088-BT',
    idCardStatus: 'Active',
    idCardIssuedDate: '2023-08-10',
    idCardExpiryDate: '2026-06-30',
    qrToken: 'CIQ-STUID-241FA04088-2B3C4D',
    mentor: 'Prof. Sunita Sharma (Room NB-102)'
  },
  {
    id: 'STU-2024-010',
    rollNumber: '241FA04099',
    name: 'Rahul Deshmukh',
    email: 'rahul.deshmukh@student.campusiq.edu',
    department: 'Civil & Infrastructure Engineering',
    course: 'B.Tech Smart Infrastructure',
    year: '3rd Year',
    semester: 'Semester VI',
    gpa: 3.58,
    attendancePercentage: 84.5,
    bloodGroup: 'A-ve',
    emergencyContact: '+1 (555) 012-3456',
    photo: '/src/assets/images/student_rahul_deshmukh.jpg',
    rfidTag: 'NFC-241FA04099-CE',
    idCardStatus: 'Active',
    idCardIssuedDate: '2024-08-15',
    idCardExpiryDate: '2027-06-30',
    qrToken: 'CIQ-STUID-241FA04099-5F6A7B',
    mentor: 'Prof. Arthur Davies (Room NB-101)'
  },
  {
    id: 'STU-2024-011',
    rollNumber: 'CS-2018-2006',
    name: 'srija',
    email: 'srija@student.campusiq.edu',
    department: 'Computer Science & Engineering',
    course: 'B.Tech CS (AI & Data Systems)',
    year: '1st Year',
    semester: 'Semester I',
    gpa: 3.50,
    attendancePercentage: 100.0,
    bloodGroup: 'O+ve',
    emergencyContact: '+1 (555) 292-2700',
    photo: '/src/assets/images/student_srija_devi.jpg',
    rfidTag: 'NFC-292270',
    idCardStatus: 'Active',
    idCardIssuedDate: '2024-08-15',
    idCardExpiryDate: '2028-06-30',
    qrToken: 'CIQ-STUID-CS-2018-2006-SRIJA',
    mentor: 'Dr. Elena Chen (Room NB-201)'
  }
];

// 3. Updated Exams with Room No: NB-101, NB-102, NB-201, NB-204, etc.
const updatedExams = [
  {
    id: 'EXAM-2026-01',
    courseCode: 'CS601',
    subjectName: 'Distributed Systems & Cloud Computing',
    date: '2026-11-20',
    reportingTime: '09:00 AM',
    session: 'Morning (09:30 AM - 12:30 PM)',
    department: 'Computer Science',
    semester: 'Semester VI',
    roomNumber: 'Room NB-101',
    totalCandidates: 64,
    status: 'Scheduled'
  },
  {
    id: 'EXAM-2026-02',
    courseCode: 'CS602',
    subjectName: 'Advanced Machine Learning & Neural Networks',
    date: '2026-11-23',
    reportingTime: '09:00 AM',
    session: 'Morning (09:30 AM - 12:30 PM)',
    department: 'Computer Science',
    semester: 'Semester VI',
    roomNumber: 'Room NB-102',
    totalCandidates: 64,
    status: 'Scheduled'
  },
  {
    id: 'EXAM-2026-03',
    courseCode: 'CS603',
    subjectName: 'Compiler Design & Program Analysis',
    date: '2026-11-26',
    reportingTime: '01:30 PM',
    session: 'Afternoon (02:00 PM - 05:00 PM)',
    department: 'Computer Science',
    semester: 'Semester VI',
    roomNumber: 'Room NB-201',
    totalCandidates: 64,
    status: 'Scheduled'
  },
  {
    id: 'EXAM-2026-04',
    courseCode: 'CS604',
    subjectName: 'Cybersecurity, Cryptography & Digital Forensics',
    date: '2026-11-29',
    reportingTime: '09:00 AM',
    session: 'Morning (09:30 AM - 12:30 PM)',
    department: 'Computer Science',
    semester: 'Semester VI',
    roomNumber: 'Room NB-204',
    totalCandidates: 64,
    status: 'Scheduled'
  }
];

// 4. Updated Hall Ticket
const updatedHallTickets = [
  {
    id: 'HT-2026-8812',
    studentId: 'STU-2024-001',
    studentName: 'Aarav Sharma',
    rollNumber: '241FA04001',
    examPeriod: 'Autumn End-Semester 2026',
    department: 'Computer Science & Engineering',
    roomNumber: 'Room NB-101',
    seatNumber: 'Desk D-23 (Row 2, Col 3)',
    examDates: [
      { subject: 'Distributed Systems (CS601)', date: '2026-11-20', time: '09:30 AM - 12:30 PM', room: 'Room NB-101' },
      { subject: 'Machine Learning (CS602)', date: '2026-11-23', time: '09:30 AM - 12:30 PM', room: 'Room NB-102' },
      { subject: 'Compiler Design (CS603)', date: '2026-11-26', time: '02:00 PM - 05:00 PM', room: 'Room NB-201' },
      { subject: 'Cybersecurity (CS604)', date: '2026-11-29', time: '09:30 AM - 12:30 PM', room: 'Room NB-204' }
    ],
    issuedAt: '2026-10-24T10:00:00Z',
    qrToken: 'CIQ-HTICKET-241FA04001-SECURE',
    eligibilityStatus: 'Eligible (Attendance > 80%, No Disciplinary Hold)',
    verifiedAtGate: false
  }
];

// 5. Update Attendance Sessions with Room NB-101
const updatedSessions = [
  {
    id: 'ATT-SESS-01',
    courseCode: 'CS601',
    courseName: 'Distributed Systems & Cloud Computing',
    facultyId: 'USR-03',
    facultyName: 'Dr. Elena Chen',
    roomNumber: 'Room NB-101',
    date: '2026-10-27',
    timeWindow: '09:00 AM - 10:30 AM (Active Window)',
    sessionCode: 'DS-8819',
    activeQrToken: 'CIQ-ATTEND-CS601-LIVE-TOKEN-99',
    expiresAt: new Date(Date.now() + 1800000).toISOString(),
    totalPresent: 28,
    totalEnrolled: 64
  }
];

// 6. Updated Attendance Records
const updatedRecords = [
  { id: 'REC-01', studentId: 'STU-2024-001', studentName: 'Aarav Sharma', rollNumber: '241FA04001', courseCode: 'CS601', roomNumber: 'Room NB-101', date: '2026-10-27', status: 'Present', method: 'NFC SmartCard Tap' },
  { id: 'REC-02', studentId: 'STU-2024-002', studentName: 'Maya Lin', rollNumber: '241FA04002', courseCode: 'CS601', roomNumber: 'Room NB-101', date: '2026-10-27', status: 'Present', method: 'NFC SmartCard Tap' },
  { id: 'REC-03', studentId: 'STU-2024-008', studentName: 'Vamsi Uppalapati', rollNumber: '241FA04331', courseCode: 'CS601', roomNumber: 'Room NB-101', date: '2026-10-27', status: 'Present', method: 'NFC SmartCard Tap' }
];

db.users = updatedUsers;
db.students = updatedStudents;
db.exams = updatedExams;
db.hallTickets = updatedHallTickets;
db.attendanceSessions = updatedSessions;
db.attendanceRecords = updatedRecords;

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log('Successfully updated database.json with new student roll numbers, faculty names, and Room NB-xxx numbers!');
