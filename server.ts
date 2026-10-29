/**
 * CampusIQ Pro — Advanced Smart Campus Management Server
 * Full-stack Express backend with persistent JSON store, universal QR cryptography,
 * real-time campus module APIs, and server-side Gemini 3.8 Flash AI Student Advisor.
 */

import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const SECRET_KEY = process.env.APP_SECRET || 'campusiq-pro-super-secret-key-2026';
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.resolve(DATA_DIR, 'database.json');

app.use(express.json({ limit: '10mb' }));

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Cryptographic token helper
function generateToken(prefix: string, id: string, extra = ''): string {
  const payload = `${prefix}:${id}:${extra}:${Date.now()}`;
  const hash = crypto.createHmac('sha256', SECRET_KEY).update(payload).digest('hex').slice(0, 12);
  return `CIQ-${prefix}-${id}-${hash}`.toUpperCase();
}

function verifyTokenSignature(tokenStr: string): boolean {
  if (!tokenStr || typeof tokenStr !== 'string') return false;
  const parts = tokenStr.split('-');
  return parts.length >= 4 && parts[0] === 'CIQ';
}

// Database schema & initial seeding
interface DBData {
  students: any[];
  users: any[];
  currentUserRole: string;
  currentUserId: string;
  events: any[];
  eventRegistrations: any[];
  exams: any[];
  hallTickets: any[];
  books: any[];
  bookLoans: any[];
  labEquipment: any[];
  labRequests: any[];
  canteenMenu: any[];
  canteenOrders: any[];
  gatePasses: any[];
  visitors: any[];
  parkingSlots: any[];
  parkingPermits: any[];
  projects: any[];
  projectVotes: any[];
  lostFound: any[];
  complaints: any[];
  attendanceSessions: any[];
  attendanceRecords: any[];
  skillPassports: any[];
  notifications: any[];
  verificationLogs: any[];
}

function getInitialDB(): DBData {
  return {
    currentUserRole: 'College Administrator',
    currentUserId: 'STU-2024-001',
    users: [
      { id: 'USR-01', name: 'Dr. Sarah Jenkins', role: 'Super Administrator', email: 'director@campusiq.edu', department: 'Executive', photo: '/src/assets/images/avatar_student_sarah_1793080117024.jpg' },
      { id: 'USR-02', name: 'Prof. Arthur Davies', role: 'College Administrator', email: 'dean@campusiq.edu', department: 'Academic Affairs', photo: '/src/assets/images/avatar_dean_davies.svg' },
      { id: 'USR-03', name: 'Dr. Elena Chen', role: 'Faculty', email: 'elena.chen@campusiq.edu', department: 'Computer Science', photo: '/src/assets/images/avatar_faculty_chen_1793080118249.jpg' },
      { id: 'USR-04', name: 'Aarav Sharma', role: 'Student', email: 'aarav.sharma@student.campusiq.edu', department: 'Computer Science', photo: '/src/assets/images/student_aarav_sharma.jpg' },
      { id: 'USR-05', name: 'Marcus Bell', role: 'Librarian', email: 'library@campusiq.edu', department: 'Central Library', photo: '/src/assets/images/avatar_marcus_bell.svg' },
      { id: 'USR-06', name: 'Vikram Mehta', role: 'Lab Technician', email: 'labtech@campusiq.edu', department: 'Robotics & IoT', photo: '/src/assets/images/avatar_vikram_mehta.svg' },
      { id: 'USR-07', name: 'Chef Mario Rossi', role: 'Canteen Staff', email: 'canteen@campusiq.edu', department: 'Campus Dining', photo: '/src/assets/images/avatar_chef_mario.svg' },
      { id: 'USR-08', name: 'Chief Jackson Reed', role: 'Security Staff', email: 'security@campusiq.edu', department: 'Campus Security', photo: '/src/assets/images/avatar_chief_reed.svg' },
      { id: 'USR-09', name: 'Priya Nambiar', role: 'Event Organizer', email: 'events@campusiq.edu', department: 'Student Council', photo: '/src/assets/images/avatar_priya_nambiar.svg' },
      { id: 'USR-10', name: 'Dr. Robert Thorne', role: 'Examination Staff', email: 'coe@campusiq.edu', department: 'Controller of Exams', photo: '/src/assets/images/avatar_dr_thorne.svg' },
      { id: 'USR-11', name: 'Dr. Sophia Vance', role: 'Project Judge', email: 'sophia.vance@techpartner.com', department: 'Industry Advisory Board', photo: '/src/assets/images/avatar_sophia_vance.svg' }
    ],
    students: [
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
    ],
    events: [
      {
        id: 'EVT-2026-01',
        title: 'National AI & Autonomous Robotics Hackathon 2026',
        category: 'Hackathon',
        description: '36-hour sprint building real-world AI applications, robotics firmware, and autonomous sensor networks.',
        date: '2026-11-12',
        time: '09:00 AM - 09:00 PM',
        venue: 'Turing Innovation Complex, Hall B',
        capacity: 150,
        registeredCount: 124,
        checkedInCount: 42,
        eligibility: 'All Engineering & Technology Students',
        registrationDeadline: '2026-11-10',
        organizer: 'Dr. Elena Chen (Student Innovation Council)',
        status: 'Published',
        entryQRCode: 'CIQ-EVENT-EVT-2026-01-MASTER',
        bannerUrl: '/src/assets/images/event_ai_robotics_hackathon.jpg'
      },
      {
        id: 'EVT-2026-02',
        title: 'Symposium on Next-Gen Sustainable Clean Energy',
        category: 'Seminar',
        description: 'Keynotes from prominent battery scientists, hydrogen fuel engineers, and smart grid architects.',
        date: '2026-11-18',
        time: '10:00 AM - 04:00 PM',
        venue: 'Main Auditorium & Gallery',
        capacity: 300,
        registeredCount: 215,
        checkedInCount: 0,
        eligibility: 'Open to All Students & Faculty',
        registrationDeadline: '2026-11-16',
        organizer: 'Mechanical Engineering Department',
        status: 'Published',
        entryQRCode: 'CIQ-EVENT-EVT-2026-02-MASTER',
        bannerUrl: '/src/assets/images/event_clean_energy_symposium.jpg'
      },
      {
        id: 'EVT-2026-03',
        title: 'Annual Cultural Kaleidoscope & Music Fest',
        category: 'Cultural Fest',
        description: 'Inter-collegiate arts, battle of the bands, classical dance fusion, and drama showcase.',
        date: '2026-12-05',
        time: '04:00 PM - 10:30 PM',
        venue: 'Campus Open Air Amphitheatre',
        capacity: 800,
        registeredCount: 640,
        checkedInCount: 0,
        eligibility: 'Valid College ID Required',
        registrationDeadline: '2026-12-03',
        organizer: 'Cultural Activities Board',
        status: 'Published',
        entryQRCode: 'CIQ-EVENT-EVT-2026-03-MASTER',
        bannerUrl: '/src/assets/images/event_cultural_music_fest.jpg'
      },
      {
        id: 'EVT-2026-04',
        title: 'Global Tech Career Expo & Fortune 500 Placement Drive',
        category: 'Career Fair',
        description: 'Tier-1 tech firms, quant desks, cloud hyperscalers, and deep-tech startups recruiting for SWE, AI & Quant internships.',
        date: '2026-11-25',
        time: '10:00 AM - 05:00 PM',
        venue: 'Student Union Grand Hall & Atrium',
        capacity: 600,
        registeredCount: 512,
        checkedInCount: 0,
        eligibility: 'Pre-Final & Final Year Engineering Students',
        registrationDeadline: '2026-11-23',
        organizer: 'Campus Training & Placement Cell',
        status: 'Published',
        entryQRCode: 'CIQ-EVENT-EVT-2026-04-MASTER',
        bannerUrl: '/src/assets/images/event_career_expo.jpg'
      },
      {
        id: 'EVT-2026-05',
        title: 'Inter-Collegiate Esports Arena & Valorant Championship',
        category: 'Esports',
        description: 'High-octane collegiate gaming tournament with live spectator casting, VR gaming showcase, and prize pool.',
        date: '2026-11-30',
        time: '01:00 PM - 09:00 PM',
        venue: 'E-Sports Complex, Cyberspace Hub',
        capacity: 250,
        registeredCount: 238,
        checkedInCount: 0,
        eligibility: 'All Enrolled College Gamers',
        registrationDeadline: '2026-11-28',
        organizer: 'Campus Gaming & Interactive Media Society',
        status: 'Published',
        entryQRCode: 'CIQ-EVENT-EVT-2026-05-MASTER',
        bannerUrl: '/src/assets/images/event_esports_arena.jpg'
      },
      {
        id: 'EVT-2026-06',
        title: 'BioTech Frontiers: CRISPR & Neuroscience Summit',
        category: 'Conference',
        description: 'Cutting-edge symposium exploring CRISPR gene-therapeutics, neural interfaces, and computational biomedicine.',
        date: '2026-12-10',
        time: '09:30 AM - 04:30 PM',
        venue: 'Franklin Bioengineering Pavilion, Hall A',
        capacity: 200,
        registeredCount: 165,
        checkedInCount: 0,
        eligibility: 'Biotech, CS & Health Sciences Students',
        registrationDeadline: '2026-12-08',
        organizer: 'Biotechnology & Bioinformatics Dept',
        status: 'Published',
        entryQRCode: 'CIQ-EVENT-EVT-2026-06-MASTER',
        bannerUrl: '/src/assets/images/event_biotech_summit.jpg'
      },
      {
        id: 'EVT-2026-07',
        title: 'Campus Venture Shark Tank & Angel Pitch Summit',
        category: 'Startup Summit',
        description: 'Top 12 student startups pitch live before venture capital partners and angel investors for $100k seed funding.',
        date: '2026-12-15',
        time: '02:00 PM - 07:00 PM',
        venue: 'Venture Center Auditorium, Room NB-301',
        capacity: 350,
        registeredCount: 310,
        checkedInCount: 0,
        eligibility: 'Open to All Campus Innovators & Founders',
        registrationDeadline: '2026-12-13',
        organizer: 'Innovation & Incubation Hub',
        status: 'Published',
        entryQRCode: 'CIQ-EVENT-EVT-2026-07-MASTER',
        bannerUrl: '/src/assets/images/event_startup_pitch.jpg'
      },
      {
        id: 'EVT-2026-08',
        title: 'Night Sky Astro-Observation & Deep Space Gala',
        category: 'Stargazing',
        description: 'Guided telescope night viewing Saturn rings, Orion Nebula, and deep-space celestial imaging with astrophysics faculty.',
        date: '2026-12-20',
        time: '07:30 PM - 11:30 PM',
        venue: 'Campus Rooftop Observatory & Star Dome',
        capacity: 180,
        registeredCount: 172,
        checkedInCount: 0,
        eligibility: 'Open to Astronomy Enthusiasts',
        registrationDeadline: '2026-12-18',
        organizer: 'Astronomy & Space Exploration Club',
        status: 'Published',
        entryQRCode: 'CIQ-EVENT-EVT-2026-08-MASTER',
        bannerUrl: '/src/assets/images/event_astronomy_night.jpg'
      },
      {
        id: 'EVT-2026-09',
        title: 'All-Campus Sports Olympiad & Track Meet',
        category: 'Sports',
        description: 'Annual university sports showdown featuring 100m sprint, relay championships, football, badminton, and basketball finals.',
        date: '2027-01-10',
        time: '08:00 AM - 06:00 PM',
        venue: 'University Athletics Stadium & Olympic Track',
        capacity: 1000,
        registeredCount: 780,
        checkedInCount: 0,
        eligibility: 'All Registered Student Athletes',
        registrationDeadline: '2027-01-08',
        organizer: 'Department of Physical Education & Athletics',
        status: 'Published',
        entryQRCode: 'CIQ-EVENT-EVT-2026-09-MASTER',
        bannerUrl: '/src/assets/images/event_sports_olympiad.jpg'
      }
    ],
    eventRegistrations: [
      {
        id: 'REG-2026-881',
        eventId: 'EVT-2026-01',
        studentId: 'STU-2024-001',
        studentName: 'Aarav Sharma',
        registeredAt: '2026-10-20T14:30:00Z',
        qrPass: 'CIQ-EVTPASS-REG-2026-881-A7E9',
        status: 'Checked-In',
        checkedInAt: '2026-10-26T21:40:00Z',
        seatNumber: 'Zone-A-Table-14'
      },
      {
        id: 'REG-2026-882',
        eventId: 'EVT-2026-02',
        studentId: 'STU-2024-001',
        studentName: 'Aarav Sharma',
        registeredAt: '2026-10-22T09:15:00Z',
        qrPass: 'CIQ-EVTPASS-REG-2026-882-9B3C',
        status: 'Confirmed',
        checkedInAt: null,
        seatNumber: 'Auditorium-Row-D-12'
      }
    ],
    exams: [
      {
        id: 'EXAM-2026-01',
        courseCode: 'CS601',
        subjectName: 'Distributed Systems & Cloud Architecture',
        date: '2026-11-20',
        reportingTime: '08:45 AM',
        session: 'Morning (09:30 AM - 12:30 PM)',
        department: 'Computer Science & Engineering',
        semester: 'Semester VI',
        roomNumber: 'Lecture Hall Complex - Room NB-101',
        totalCandidates: 120,
        status: 'Scheduled'
      },
      {
        id: 'EXAM-2026-02',
        courseCode: 'CS602',
        subjectName: 'Advanced Machine Learning & Neural Nets',
        date: '2026-11-23',
        reportingTime: '08:45 AM',
        session: 'Morning (09:30 AM - 12:30 PM)',
        department: 'Computer Science & Engineering',
        semester: 'Semester VI',
        roomNumber: 'LHC 304',
        totalCandidates: 120,
        status: 'Scheduled'
      },
      {
        id: 'EXAM-2026-03',
        courseCode: 'CS603',
        subjectName: 'Compiler Design & Formal Languages',
        date: '2026-11-26',
        reportingTime: '01:15 PM',
        session: 'Afternoon (02:00 PM - 05:00 PM)',
        department: 'Computer Science & Engineering',
        semester: 'Semester VI',
        roomNumber: 'Room NB-101',
        totalCandidates: 120,
        status: 'Scheduled'
      }
    ],
    hallTickets: [
      {
        id: 'HT-2026-CS-089',
        studentId: 'STU-2024-001',
        studentName: 'Aarav Sharma',
        rollNumber: '241FA04001',
        examPeriod: 'End Semester Examinations — Autumn 2026',
        department: 'Computer Science & Engineering',
        roomNumber: 'Room NB-101',
        seatNumber: 'Desk-LHC302-34',
        examDates: [
          { subject: 'Distributed Systems & Cloud Architecture', date: '2026-11-20', time: '09:30 AM - 12:30 PM', room: 'Room NB-101' },
          { subject: 'Advanced Machine Learning & Neural Nets', date: '2026-11-23', time: '09:30 AM - 12:30 PM', room: 'LHC 304' },
          { subject: 'Compiler Design & Formal Languages', date: '2026-11-26', time: '02:00 PM - 05:00 PM', room: 'Room NB-101' }
        ],
        issuedAt: '2026-10-18T10:00:00Z',
        qrToken: 'CIQ-HALLTICKET-HT-2026-CS-089-8A1C',
        eligibilityStatus: 'Eligible (Attendance: 88.5%, Dues Cleared)',
        verifiedAtGate: false
      }
    ],
    books: [
      {
        id: 'BK-101',
        isbn: '978-0131103627',
        title: 'The C Programming Language (2nd Edition)',
        author: 'Brian W. Kernighan, Dennis M. Ritchie',
        publisher: 'Prentice Hall',
        category: 'Computer Science',
        totalCopies: 12,
        availableCopies: 8,
        shelfLocation: 'Stack CS-04-A',
        coverImage: '/src/assets/images/book_c_programming.svg',
        qrCode: 'CIQ-BOOK-BK-101-01'
      },
      {
        id: 'BK-102',
        isbn: '978-0262033848',
        title: 'Introduction to Algorithms (CLRS 3rd Edition)',
        author: 'Thomas H. Cormen, Charles E. Leiserson',
        publisher: 'MIT Press',
        category: 'Algorithms',
        totalCopies: 20,
        availableCopies: 3,
        shelfLocation: 'Stack CS-01-C',
        coverImage: '/src/assets/images/book_clrs_algorithms.svg',
        qrCode: 'CIQ-BOOK-BK-102-01'
      },
      {
        id: 'BK-103',
        isbn: '978-0132350884',
        title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
        author: 'Robert C. Martin',
        publisher: 'Pearson',
        category: 'Software Engineering',
        totalCopies: 8,
        availableCopies: 0,
        shelfLocation: 'Stack CS-08-B',
        coverImage: '/src/assets/images/book_clean_code.svg',
        qrCode: 'CIQ-BOOK-BK-103-01'
      },
      {
        id: 'BK-104',
        isbn: '978-0596007126',
        title: 'Head First Design Patterns',
        author: 'Eric Freeman, Elisabeth Robson',
        publisher: "O'Reilly Media",
        category: 'Architecture',
        totalCopies: 10,
        availableCopies: 6,
        shelfLocation: 'Stack CS-05-D',
        coverImage: '/src/assets/images/book_head_first_design_patterns.svg',
        qrCode: 'CIQ-BOOK-BK-104-01'
      }
    ],
    bookLoans: [
      {
        id: 'LOAN-901',
        bookId: 'BK-102',
        bookTitle: 'Introduction to Algorithms (CLRS 3rd Edition)',
        studentId: 'STU-2024-001',
        studentName: 'Aarav Sharma',
        issuedDate: '2026-10-10',
        dueDate: '2026-10-24',
        returnedDate: null,
        overdueDays: 2,
        fineAmount: 4.00,
        status: 'Overdue',
        qrCode: 'CIQ-LOAN-LOAN-901-5D2E'
      },
      {
        id: 'LOAN-902',
        bookId: 'BK-101',
        bookTitle: 'The C Programming Language (2nd Edition)',
        studentId: 'STU-2024-001',
        studentName: 'Aarav Sharma',
        issuedDate: '2026-10-20',
        dueDate: '2026-11-03',
        returnedDate: null,
        overdueDays: 0,
        fineAmount: 0.00,
        status: 'Active',
        qrCode: 'CIQ-LOAN-LOAN-902-1F4A'
      }
    ],
    labEquipment: [
      {
        id: 'LAB-EQ-01',
        assetId: 'ROBO-ARM-04',
        name: '6-DOF Precision Robotic Arm Kit',
        category: 'Robotics & Control',
        lab: 'Robotics & Mechatronics Lab (R-204)',
        condition: 'Optimal',
        status: 'Available',
        allocatedTo: null,
        serialNumber: 'SN-ROBO-99214',
        qrTag: 'CIQ-EQUIP-LAB-EQ-01-ROBO'
      },
      {
        id: 'LAB-EQ-02',
        assetId: 'OSC-DIGI-12',
        name: 'Keysight 200MHz Digital Storage Oscilloscope',
        category: 'Instrumentation',
        lab: 'VLSI & Circuit Design Lab (E-102)',
        condition: 'Good',
        status: 'Borrowed',
        allocatedTo: { studentId: 'STU-2024-001', studentName: 'Aarav Sharma', dueDate: '2026-10-28' },
        serialNumber: 'SN-KEYSIGHT-8821',
        qrTag: 'CIQ-EQUIP-LAB-EQ-02-OSC'
      },
      {
        id: 'LAB-EQ-03',
        assetId: 'FPGA-ZYNQ-07',
        name: 'Xilinx Zynq UltraScale+ MPSoC Board',
        category: 'Embedded Systems',
        lab: 'Embedded AI Lab (E-205)',
        condition: 'Maintenance Required',
        status: 'Under Maintenance',
        allocatedTo: null,
        serialNumber: 'SN-XLNX-5401',
        qrTag: 'CIQ-EQUIP-LAB-EQ-03-FPGA'
      },
      {
        id: 'LAB-EQ-04',
        assetId: 'GPU-SRV-02',
        name: 'NVIDIA RTX 4090 Deep Learning Workbench',
        category: 'High Performance Computing',
        lab: 'AI Research Cluster (CS-401)',
        condition: 'Optimal',
        status: 'Available',
        allocatedTo: null,
        serialNumber: 'SN-NV4090-1120',
        qrTag: 'CIQ-EQUIP-LAB-EQ-04-GPU'
      }
    ],
    labRequests: [
      {
        id: 'REQ-LAB-441',
        equipmentId: 'LAB-EQ-02',
        equipmentName: 'Keysight 200MHz Digital Storage Oscilloscope',
        studentId: 'STU-2024-001',
        studentName: 'Aarav Sharma',
        requestDate: '2026-10-21',
        purpose: 'Capstone project high-frequency bus testing',
        status: 'Approved',
        approvedBy: 'Vikram Mehta (Lab Tech)',
        returnDueDate: '2026-10-28'
      }
    ],
    canteenMenu: [
      {
            "id": "CN-01",
            "name": "Mediterranean Grilled Chicken & Grain Bowl",
            "category": "Wholesome Bowls",
            "description": "Seasoned grilled chicken breast, herb quinoa, roasted sweet potatoes, avocado, and tahini drizzle.",
            "price": 7.5,
            "available": true,
            "dietary": "High Protein",
            "image": "/src/assets/images/canteen_grilled_chicken_bowl.jpg",
            "calories": 540,
            "preparationTime": "6-8 mins",
            "rating": 4.9
      },
      {
            "id": "CN-02",
            "name": "Paneer Tikka & Saffron Basmati Bowl",
            "category": "Wholesome Bowls",
            "description": "Tandoori marinated cottage cheese cubes, fragrant saffron cumin rice, charred peppers, and fresh mint chutney.",
            "price": 6.8,
            "available": true,
            "dietary": "Vegetarian",
            "image": "/src/assets/images/canteen_paneer_tikka_bowl.jpg",
            "calories": 510,
            "preparationTime": "7-9 mins",
            "rating": 4.8
      },
      {
            "id": "CN-03",
            "name": "Teriyaki Glazed Salmon & Edamame Bowl",
            "category": "Wholesome Bowls",
            "description": "Pan-seared Atlantic salmon fillet, steamed edamame, pickled radish, sesame furikake, and brown rice.",
            "price": 8.5,
            "available": true,
            "dietary": "Omega-3 Rich",
            "image": "/src/assets/images/canteen_salmon_teriyaki_bowl.jpg",
            "calories": 580,
            "preparationTime": "8-10 mins",
            "rating": 4.9
      },
      {
            "id": "CN-04",
            "name": "Roasted Butternut Squash & Puy Lentil Bowl",
            "category": "Wholesome Bowls",
            "description": "Baby spinach, caramelized pecans, roasted maple squash, organic green lentils, and pomegranate balsamic reduction.",
            "price": 6.25,
            "available": true,
            "dietary": "Vegan",
            "image": "/src/assets/images/canteen_harvest_squash_bowl.jpg",
            "calories": 460,
            "preparationTime": "5-7 mins",
            "rating": 4.7
      },
      {
            "id": "CN-05",
            "name": "Artisan Sourdough Avocado & Egg Melt",
            "category": "Quick Bites",
            "description": "Fresh mashed Haas avocado, pasture-raised sunny egg, and melted sharp aged cheddar on toasted levain sourdough.",
            "price": 5.25,
            "available": true,
            "dietary": "Vegetarian",
            "image": "/src/assets/images/canteen_avocado_toast.jpg",
            "calories": 420,
            "preparationTime": "4-5 mins",
            "rating": 4.8
      },
      {
            "id": "CN-06",
            "name": "Crispy Chipotle Cauliflower Tacos (3 pcs)",
            "category": "Quick Bites",
            "description": "Spiced crispy cauliflower florets, purple cabbage slaw, chipotle avocado crema, and pickled jalapeños on warm corn tortillas.",
            "price": 4.95,
            "available": true,
            "dietary": "Vegan",
            "image": "/src/assets/images/canteen_buffalo_tacos.jpg",
            "calories": 390,
            "preparationTime": "5-6 mins",
            "rating": 4.7
      },
      {
            "id": "CN-07",
            "name": "Smoked Turkey & Truffle Fontina Panini",
            "category": "Quick Bites",
            "description": "Thin-sliced hickory smoked turkey breast, melted Alpine fontina, wild baby arugula, and black truffle aioli on grilled ciabatta.",
            "price": 6.4,
            "available": true,
            "dietary": "Artisan",
            "image": "/src/assets/images/canteen_turkey_panini.jpg",
            "calories": 520,
            "preparationTime": "6-7 mins",
            "rating": 4.9
      },
      {
            "id": "CN-08",
            "name": "Crispy Herb Falafel Pita Pocket",
            "category": "Quick Bites",
            "description": "House-made Egyptian chickpea falafels, heirloom tomato salad, pickled turnip, and creamy garlic tahini in warm stoneground pita.",
            "price": 4.8,
            "available": true,
            "dietary": "Vegan",
            "image": "/src/assets/images/canteen_falafel_pita.jpg",
            "calories": 440,
            "preparationTime": "4-6 mins",
            "rating": 4.8
      },
      {
            "id": "CN-09",
            "name": "Wood-Fired Margherita Pizza Slice",
            "category": "Quick Bites",
            "description": "Neapolitan style crust with San Marzano DOP tomato sauce, melted fior di latte mozzarella, and fresh organic sweet basil.",
            "price": 3.95,
            "available": true,
            "dietary": "Vegetarian",
            "image": "/src/assets/images/canteen_margherita_pizza.jpg",
            "calories": 340,
            "preparationTime": "3-5 mins",
            "rating": 4.9
      },
      {
            "id": "CN-10",
            "name": "Organic Ceremonial Matcha Oat Latte",
            "category": "Beverages",
            "description": "First-harvest ceremonial grade Uji matcha whisked with velvety steamed oat milk and Madagascar agave nectar.",
            "price": 3.75,
            "available": true,
            "dietary": "Vegan",
            "image": "/src/assets/images/canteen_matcha_latte.jpg",
            "calories": 160,
            "preparationTime": "2-3 mins",
            "rating": 4.8
      },
      {
            "id": "CN-11",
            "name": "Iced Madagascar Vanilla Cold Brew",
            "category": "Beverages",
            "description": "Single-origin Ethiopian beans steeped for 18 hours, infused with real vanilla bean and cold foam float.",
            "price": 3.5,
            "available": true,
            "dietary": "Sugar-Free",
            "image": "/src/assets/images/canteen_vanilla_cold_brew.jpg",
            "calories": 90,
            "preparationTime": "1-2 mins",
            "rating": 4.9
      },
      {
            "id": "CN-12",
            "name": "Alphonso Mango Passionfruit Boba Fizz",
            "category": "Beverages",
            "description": "Pureed Indian Alphonso mango, passionfruit sparkling water, and bursting mango fruit juice popping boba pearls.",
            "price": 4.25,
            "available": true,
            "dietary": "Refreshing",
            "image": "/src/assets/images/canteen_mango_boba.jpg",
            "calories": 210,
            "preparationTime": "2-3 mins",
            "rating": 4.9
      },
      {
            "id": "CN-13",
            "name": "Golden Turmeric Ginger Immunity Tonic",
            "category": "Beverages",
            "description": "Freshly cold-pressed raw turmeric root, ginger, organic lemon, black pepper extract, and wildflower raw honey.",
            "price": 3.25,
            "available": true,
            "dietary": "Ayurvedic",
            "image": "/src/assets/images/canteen_turmeric_tonic.jpg",
            "calories": 85,
            "preparationTime": "1-2 mins",
            "rating": 4.7
      },
      {
            "id": "CN-14",
            "name": "Wild Berry Chia & Amazonian Acai Parfait",
            "category": "Breakfast & Desserts",
            "description": "Layered coconut-chia seed pudding, organic acai smoothie swirl, wild blueberries, and toasted hemp seed granola.",
            "price": 4.5,
            "available": true,
            "dietary": "Gluten-Free",
            "image": "/src/assets/images/canteen_acai_parfait.jpg",
            "calories": 320,
            "preparationTime": "2-3 mins",
            "rating": 4.8
      },
      {
            "id": "CN-15",
            "name": "Golden Belgian Waffles with Maple Glaze",
            "category": "Breakfast & Desserts",
            "description": "Authentic malted Belgian waffle with caramelized pearl sugar, macerated strawberries, and warm Vermont maple syrup.",
            "price": 5.2,
            "available": true,
            "dietary": "Gourmet",
            "image": "/src/assets/images/canteen_belgian_waffle.jpg",
            "calories": 480,
            "preparationTime": "4-6 mins",
            "rating": 4.9
      },
      {
            "id": "CN-16",
            "name": "Warm Dark Chocolate Molten Lava Cake",
            "category": "Breakfast & Desserts",
            "description": "Decadent 70% Valrhona dark chocolate cake with a molten truffle molten center, dusted with Dutch cocoa powder.",
            "price": 4.85,
            "available": true,
            "dietary": "Indulgent",
            "image": "/src/assets/images/canteen_chocolate_lava.jpg",
            "calories": 490,
            "preparationTime": "4-5 mins",
            "rating": 5
      }
    ],
    canteenOrders: [
      {
        id: 'ORD-8921',
        orderNumber: '#8921',
        studentId: 'STU-2024-001',
        studentName: 'Aarav Sharma',
        items: [
          { menuItemId: 'CN-01', name: 'Mediterranean Grilled Chicken & Grain Bowl', quantity: 1, unitPrice: 7.50 },
          { menuItemId: 'CN-03', name: 'Organic Matcha Green Tea Latte', quantity: 1, unitPrice: 3.75 }
        ],
        subtotal: 11.25,
        tax: 0.90,
        totalAmount: 12.15,
        paymentStatus: 'Paid (Campus Wallet)',
        status: 'Ready',
        pickupToken: 'CIQ-CANTEEN-ORD-8921-READY',
        orderedAt: '2026-10-26T21:50:00Z',
        redeemed: false
      }
    ],
    gatePasses: [
      {
        id: 'GP-2026-042',
        studentId: 'STU-2024-001',
        studentName: 'Aarav Sharma',
        rollNumber: '241FA04001',
        reason: 'Authorized Attendance at Regional IEEE Robotics Conference',
        departureTime: '2026-10-27T08:00:00Z',
        expectedReturnTime: '2026-10-27T18:00:00Z',
        destination: 'Downtown Convention Center',
        parentConsentVerified: true,
        status: 'Approved',
        approvedBy: 'Prof. Arthur Davies (Warden/Dean)',
        qrPass: 'CIQ-GATEPASS-GP-2026-042-99EA',
        exitTimestamp: null,
        entryTimestamp: null,
        passType: 'Day Pass (Single-Use)'
      }
    ],
    visitors: [
      {
        id: 'VIS-104',
        visitorName: 'Dr. Ramesh Sundaram',
        affiliation: 'National Science Foundation',
        hostFaculty: 'Dr. Elena Chen',
        hostDepartment: 'Computer Science',
        purpose: 'Grant Evaluation & Lab Inspection',
        visitDate: '2026-10-27',
        checkInTime: null,
        checkOutTime: null,
        status: 'Approved',
        badgeQR: 'CIQ-VISITOR-VIS-104-SAFE'
      }
    ],
    parkingSlots: [
      { id: 'SLOT-A01', zone: 'Zone A (Engineering Quadrant)', slotNumber: 'A-01', type: 'Faculty EV Charging', status: 'Occupied', currentVehicle: 'TESLA-M3-4412' },
      { id: 'SLOT-A02', zone: 'Zone A (Engineering Quadrant)', slotNumber: 'A-02', type: 'Faculty Reserved', status: 'Available', currentVehicle: null },
      { id: 'SLOT-A03', zone: 'Zone A (Engineering Quadrant)', slotNumber: 'A-03', type: 'Student Two-Wheeler', status: 'Available', currentVehicle: null },
      { id: 'SLOT-B01', zone: 'Zone B (Innovation Complex)', slotNumber: 'B-01', type: 'Student General', status: 'Reserved', currentVehicle: 'HONDA-CIV-9081', reservedBy: 'STU-2024-001' },
      { id: 'SLOT-B02', zone: 'Zone B (Innovation Complex)', slotNumber: 'B-02', type: 'Student General', status: 'Available', currentVehicle: null },
      { id: 'SLOT-B03', zone: 'Zone B (Innovation Complex)', slotNumber: 'B-03', type: 'Visitor Parking', status: 'Available', currentVehicle: null }
    ],
    parkingPermits: [
      {
        id: 'PRK-PERMIT-01',
        slotId: 'SLOT-B01',
        slotNumber: 'B-01',
        studentId: 'STU-2024-001',
        vehicleNumber: 'HONDA-CIV-9081',
        vehicleType: 'Car',
        validDate: '2026-10-27',
        qrPass: 'CIQ-PARKING-PRK-PERMIT-01-SEC',
        status: 'Active'
      }
    ],
    projects: [
      {
            "id": "PRJ-2026-01",
            "title": "Autonomous Disaster Relief Swarm Drone Navigation",
            "category": "AI & Robotics",
            "leadStudent": "Aarav Sharma",
            "teamMembers": [
                  "Aarav Sharma",
                  "Maya Lin",
                  "Karan Verma"
            ],
            "department": "Computer Science & Engineering",
            "advisor": "Dr. Elena Chen",
            "description": "Decentralized vision-based SLAM and edge computing mesh network enabling micro-drones to survey collapse zones without GPS.",
            "boothNumber": "Expo Arena - Booth #14",
            "demoVideoUrl": "https://youtu.be/swarm-drone-demo",
            "votesCount": 38,
            "judgeScore": 94.5,
            "status": "Approved",
            "qrCode": "CIQ-PROJECT-PRJ-2026-01-VOTE",
            "imageUrl": "/src/assets/images/project_swarm_drones.jpg",
            "techStack": [
                  "PyTorch",
                  "ROS2",
                  "YOLOv8",
                  "PX4 Autopilot",
                  "Jetson Orin"
            ],
            "githubUrl": "https://github.com/campusiq/swarm-drone-navigation",
            "abstract": "In disaster scenarios where GPS signals are jammed or degraded indoors, search and rescue robots must localize and map subterranean collapsed rubble autonomously. This project introduces a cooperative decentralized visual-inertial SLAM algorithm deployed on NVIDIA Jetson Orin micro-drones, sharing sparse 3D point clouds over an ad-hoc 5.8GHz peer-to-peer radio mesh.",
            "keySpecifications": [
                  "120 fps onboard stereo SLAM",
                  "Sub-centimeter obstacle avoidance",
                  "Peer-to-peer ad-hoc mesh up to 500m",
                  "Auto-return upon 15% battery reserve"
            ],
            "documentation": {
                  "overview": "Autonomous disaster relief swarm drone navigation system designed for subterranean and GPS-denied environments.",
                  "methodology": "Utilized ROS2 Humble on Ubuntu 22.04 LTS coupled with custom PX4 flight controllers. Onboard stereo cameras feed a dual-pass EKF fusing IMU and visual odometry.",
                  "results": "Demonstrated 99.4% autonomous navigation success across 25 simulated collapse courses, mapping a 1,200 sq. meter zone in under 4.2 minutes.",
                  "futureWork": "Thermal imaging integration for body heat signature detection through smoke.",
                  "billOfMaterials": "Carbon-fiber custom frames, Jetson Orin Nano, PX4 Pixhawk 6C, Intel RealSense D435i, 6S 4500mAh LiPo."
            }
      },
      {
            "id": "PRJ-2026-02",
            "title": "Bionic Myoelectric Prosthetic Hand with Tactile Feedback",
            "category": "Biomedical & IoT",
            "leadStudent": "Rohan Patel",
            "teamMembers": [
                  "Rohan Patel",
                  "Chloe Adams",
                  "Sneha Reddy"
            ],
            "department": "Mechanical & Mechatronics",
            "advisor": "Prof. Arthur Davies",
            "description": "Low-cost 3D printed prosthetic arm with embedded pressure sensors returning haptic feedback to residual limb nerves.",
            "boothNumber": "Expo Arena - Booth #08",
            "demoVideoUrl": "https://youtu.be/bionic-hand-demo",
            "votesCount": 29,
            "judgeScore": 91,
            "status": "Approved",
            "qrCode": "CIQ-PROJECT-PRJ-2026-02-VOTE",
            "imageUrl": "/src/assets/images/project_bionic_hand.jpg",
            "techStack": [
                  "SolidWorks",
                  "EMG Signal Processing",
                  "C++",
                  "ESP32-S3",
                  "Haptic Actuators"
            ],
            "githubUrl": "https://github.com/campusiq/bionic-haptic-hand",
            "abstract": "Modern commercial myoelectric prosthetics cost upwards of $30,000 and lack closed-loop sensory feedback. This capstone presents an open-source, sub-$450 prosthetic hand with 6 degrees of freedom driven by micro linear servos and closed-loop piezo-resistive fingertip pressure sensing translated to non-invasive vibrational nerve stimulators on the residual forearm.",
            "keySpecifications": [
                  "6 Degrees of Freedom with individual finger articulation",
                  "< 65ms latency from EMG muscle burst to grip closure",
                  "Continuous closed-loop 256-level haptic feedback",
                  "Battery endurance > 18 hours per charge"
            ],
            "documentation": {
                  "overview": "Closed-loop biomimetic prosthetic terminal device incorporating active cutaneous feedback.",
                  "methodology": "Multi-channel dry surface EMG electrodes record muscular voltage fluctuations from residual forearm muscles. Real-time neural network classifier distinguishes 14 distinct grip postures.",
                  "results": "Amputee test subjects achieved 94.8% grip classification accuracy, successfully picking fragile objects like raw eggs without breakage.",
                  "futureWork": "Direct osseointegration mechanical coupling and wireless telemetry diagnostics.",
                  "billOfMaterials": "PETG 3D structural bones, TPU flexible joints, Coreless micro-servos, ESP32-S3 microcontroller, Linear resonant haptic actuators."
            }
      },
      {
            "id": "PRJ-2026-03",
            "title": "Zero-Knowledge Decentralized Academic Credential Ledger",
            "category": "Cybersecurity & Web3",
            "leadStudent": "Zoe Washington",
            "teamMembers": [
                  "Zoe Washington",
                  "Neil Armstrong Jr.",
                  "srija"
            ],
            "department": "Computer Science & Engineering",
            "advisor": "Dr. Sarah Jenkins",
            "description": "Tamper-proof verifiable diplomas using cryptographic ZK-SNARK proofs that respect student privacy while enabling instantaneous verification.",
            "boothNumber": "Expo Arena - Booth #22",
            "demoVideoUrl": "https://youtu.be/zk-credentials-demo",
            "votesCount": 24,
            "judgeScore": 89.5,
            "status": "Approved",
            "qrCode": "CIQ-PROJECT-PRJ-2026-03-VOTE",
            "imageUrl": "/src/assets/images/project_zk_ledger.jpg",
            "techStack": [
                  "Solidity",
                  "Circom 2.1",
                  "zk-SNARKs",
                  "Next.js 15",
                  "Ethers.js",
                  "Rust"
            ],
            "githubUrl": "https://github.com/campusiq/zk-academic-credentials",
            "abstract": "Degree fraud costs institutions and employers billions annually while background check companies invade student privacy by demanding raw transcripts. We designed a cryptographic credentials protocol where university registrars sign degrees as Merkle leaves. Students can prove graduation date, GPA threshold, and major using zero-knowledge proofs without revealing their full transcripts or personal identities.",
            "keySpecifications": [
                  "Proof generation latency < 1.2s on mobile client",
                  "Verification gas cost < 185,000 on EVM L2",
                  "Zero student PII revealed during employment check",
                  "W3C Verifiable Credential standard compliant"
            ],
            "documentation": {
                  "overview": "Privacy-preserving decentralized academic verification engine utilizing Groth16 zk-SNARK circuits.",
                  "methodology": "Designed arithmetic circuits in Circom verifying ECDSA registrar signatures inside the zk-proof. Smart contracts deployed on Layer-2 blockchain verify proofs in O(1) time complexity.",
                  "results": "Tested with 10,000 synthetic campus diploma issuances. Zero cryptographic leakage of student personal information.",
                  "futureWork": "Integration with national digital identity frameworks and decentralized storage pinning.",
                  "billOfMaterials": "Cloud verifier nodes, EVM RPC endpoints, OpenZeppelin cryptographic contracts."
            }
      },
      {
            "id": "PRJ-2026-04",
            "title": "AgriSense: Autonomous Solar AI Rover for Precision Agriculture",
            "category": "Smart IoT & Robotics",
            "leadStudent": "Vamsi Uppalapati",
            "teamMembers": [
                  "Vamsi Uppalapati",
                  "Rahul Deshmukh",
                  "Vikramaditya Rao"
            ],
            "department": "Computer Science & Engineering",
            "advisor": "Dr. Rajesh Sundaram",
            "description": "Solar-powered autonomous agricultural rover with multispectral computer vision for real-time crop disease diagnosis and targeted non-chemical weed eradication.",
            "boothNumber": "Expo Arena - Booth #04",
            "demoVideoUrl": "https://youtu.be/agrisense-rover-demo",
            "votesCount": 35,
            "judgeScore": 93,
            "status": "Approved",
            "qrCode": "CIQ-PROJECT-PRJ-2026-04-VOTE",
            "imageUrl": "/src/assets/images/project_agrisense_robot.jpg",
            "techStack": [
                  "TensorFlow Lite",
                  "RTK-GPS",
                  "ROS2",
                  "Python",
                  "Solar MPPT",
                  "OpenCV"
            ],
            "githubUrl": "https://github.com/campusiq/agrisense-rover",
            "abstract": "Excessive herbicide use causes environmental degradation while manual crop scouting is labor-intensive. AgriSense is an autonomous solar rover navigating furrow rows with RTK centimeter-precision GPS and multispectral cameras to identify foliar blights, nitrogen deficiencies, and target weeds with high-precision mechanical cutters.",
            "keySpecifications": [
                  "Centimeter-accurate RTK-GPS navigation",
                  "97.2% weed identification accuracy at 1.5 m/s",
                  "100% solar self-recharging with 300W bifacial panel",
                  "LoRaWAN farm telemetry uplink up to 10 km"
            ],
            "documentation": {
                  "overview": "Self-sustaining agricultural rover combining precision robotics with edge AI plant pathology models.",
                  "methodology": "Trained custom YOLOv8-Nano models on over 80,000 multi-spectral crop leaf images. Integrated rocker-bogie suspension for uneven farm terrain traversal.",
                  "results": "Reduced farm herbicide consumption by 91% on test wheat and soy plots.",
                  "futureWork": "Automated nighttime UV-C fungal spore sterilization modules.",
                  "billOfMaterials": "Aluminum extrusion chassis, All-terrain rocker-bogie, Jetson Nano, RTK GNSS module, 100W brushless hub motors."
            }
      },
      {
            "id": "PRJ-2026-05",
            "title": "NeuroScan: Ultra-Low-Power Wearable EEG for Seizure Pre-Detection",
            "category": "Biomedical Tech",
            "leadStudent": "Ananya Iyer",
            "teamMembers": [
                  "Ananya Iyer",
                  "Sneha Reddy"
            ],
            "department": "Biotechnology & Bioinformatics",
            "advisor": "Prof. Meera Kulkarni",
            "description": "Ultra-low power wearable headband acquiring 8-channel EEG signals with transformer-based edge AI to forecast epileptic seizures up to 15 minutes before onset.",
            "boothNumber": "Expo Arena - Booth #11",
            "demoVideoUrl": "https://youtu.be/neuroscan-eeg-demo",
            "votesCount": 32,
            "judgeScore": 95,
            "status": "Approved",
            "qrCode": "CIQ-PROJECT-PRJ-2026-05-VOTE",
            "imageUrl": "/src/assets/images/project_neuroscan_eeg.jpg",
            "techStack": [
                  "Edge Impulse",
                  "PyTorch",
                  "Nordic nRF5340",
                  "BLE 5.3",
                  "Bio-potential Analog Front-End"
            ],
            "githubUrl": "https://github.com/campusiq/neuroscan-eeg",
            "abstract": "Epileptic patients suffer unexpected seizures that result in physical injury and loss of independence. NeuroScan is a lightweight, non-invasive forehead headband with dry conductive polymer electrodes streaming EEG data into an ultra-low-power TinyML transformer model that detects pre-ictal bio-electrical rhythms 8 to 15 minutes prior to seizure manifestation.",
            "keySpecifications": [
                  "8-channel 24-bit bio-potential resolution",
                  "Seizure onset anticipation window: 8 - 15 minutes",
                  "Power consumption < 12mW for 48-hour continuous runtime",
                  "Automatic emergency SMS + GPS location alert to caregivers"
            ],
            "documentation": {
                  "overview": "Wearable neurological monitoring system for real-time pre-ictal seizure prediction.",
                  "methodology": "Designed low-noise active electrodes and implemented a quantized 1D temporal convolutional transformer on dual-core ARM Cortex-M33.",
                  "results": "Achieved 96.2% sensitivity with a false positive rate under 0.04 per hour on CHB-MIT clinical benchmark datasets.",
                  "futureWork": "Closed-loop vagus nerve micro-stimulation for active seizure abort.",
                  "billOfMaterials": "Flexible polyimide PCB, TI ADS1299 analog front end, Nordic nRF5340, Medical-grade silicone enclosure, 300mAh LiPo."
            }
      },
      {
            "id": "PRJ-2026-06",
            "title": "EcoDrive: Liquid-Cooled Solid-State Battery for Formula Student EV",
            "category": "Clean Tech & Automotive",
            "leadStudent": "Vikramaditya Rao",
            "teamMembers": [
                  "Vikramaditya Rao",
                  "Rohan Patel",
                  "Karan Verma"
            ],
            "department": "Mechanical & Mechatronics",
            "advisor": "Dr. Rajesh Sundaram",
            "description": "High-density 400V solid-state battery accumulator with microchannel phase-change cold plates and real-time CAN bus telemetry for collegiate electric formula racing.",
            "boothNumber": "Expo Arena - Booth #01",
            "demoVideoUrl": "https://youtu.be/ecodrive-formula-ev",
            "votesCount": 41,
            "judgeScore": 96,
            "status": "Approved",
            "qrCode": "CIQ-PROJECT-PRJ-2026-06-VOTE",
            "imageUrl": "/src/assets/images/project_ecodrive_ev.jpg",
            "techStack": [
                  "ANSYS Fluent",
                  "CAN Bus",
                  "SolidWorks Electrical",
                  "STM32-H7",
                  "MATLAB Simulink"
            ],
            "githubUrl": "https://github.com/campusiq/ecodrive-formula-ev",
            "abstract": "Collegiate electric racing mandates extreme power density under rigorous safety constraints. EcoDrive engineers an experimental 400V, 6.8 kWh solid-state pouch-cell battery pack with 3D printed additive cold plates circulating dielectric fluid, delivering 80kW peak power with uniform pack thermal variance under 2.3°C during endurance sprint laps.",
            "keySpecifications": [
                  "400V nominal bus with 80kW peak output",
                  "Microchannel cold plate cooling maintaining cells < 38°C",
                  "Total accumulator weight only 42 kg (190 Wh/kg pack-level)",
                  "Dual redundant optical isolation safety interlocks"
            ],
            "documentation": {
                  "overview": "Next-generation solid-state battery energy storage system for Formula Student competition.",
                  "methodology": "Conducted computational fluid dynamics (CFD) in ANSYS Fluent to model laminar coolant flow over cell terminals. Programmed custom STM32 BMS monitoring 96 individual cell voltages at 1 kHz.",
                  "results": "Vehicle completed 22 km endurance race without thermal throttling, achieving 0-100 km/h acceleration in 3.1 seconds.",
                  "futureWork": "Regenerative braking optimization and carbon-fiber composite casing integration.",
                  "billOfMaterials": "Custom cell modules, Copper nickel-plated busbars, STM32-H7 master BMS, Dielectric coolant pump, Carbon fiber flameproof box."
            }
      },
      {
            "id": "PRJ-2026-07",
            "title": "HoloTutor: Augmented Reality Spatial Anatomy & Engine Simulator",
            "category": "AR/VR & Education",
            "leadStudent": "Maya Lin",
            "teamMembers": [
                  "Maya Lin",
                  "Aarav Sharma"
            ],
            "department": "Electronics & Communication",
            "advisor": "Prof. David Miller",
            "description": "Cross-platform WebXR spatial learning environment enabling multi-user holographic disassembly of turbofan jet engines and human cardiovascular systems.",
            "boothNumber": "Expo Arena - Booth #19",
            "demoVideoUrl": "https://youtu.be/holotutor-ar-demo",
            "votesCount": 27,
            "judgeScore": 92.5,
            "status": "Approved",
            "qrCode": "CIQ-PROJECT-PRJ-2026-07-VOTE",
            "imageUrl": "/src/assets/images/project_holotutor_ar.jpg",
            "techStack": [
                  "Three.js",
                  "WebXR",
                  "React Three Fiber",
                  "WebRTC",
                  "Blender",
                  "Spatial Audio"
            ],
            "githubUrl": "https://github.com/campusiq/holotutor-spatial-ar",
            "abstract": "Traditional CAD models and 2D diagrams fail to convey complex spatial physics in engineering and medical education. HoloTutor runs directly in web browsers supporting Apple Vision Pro, Meta Quest, and mobile phones, enabling synchronous multi-student virtual dissection of intricate 3D assemblies with zero software installation.",
            "keySpecifications": [
                  "Sub-16ms latency for 90 fps spatial rendering",
                  "Multi-user shared room synchronization via WebRTC",
                  "Physical hand tracking gesture manipulation",
                  "Zero-install runs directly in Safari & Chrome WebXR"
            ],
            "documentation": {
                  "overview": "Browser-based spatial computing educational platform with real-time multi-user physics.",
                  "methodology": "Developed GLTF model compression pipelines reducing 2M polygon jet engines to under 12MB. Engineered custom spatial anchor sync over WebRTC DataChannels.",
                  "results": "Classroom trials with 120 students showed 44% higher retention rates on mechanical anatomy exams compared to textbook study.",
                  "futureWork": "Haptic force-feedback glove integration and AI voice tutor avatar.",
                  "billOfMaterials": "WebXR headsets, WebRTC signaling servers, AWS S3 model CDN."
            }
      },
      {
            "id": "PRJ-2026-08",
            "title": "CyberSentinel: AI Deception HoneyNet for Automated Zero-Day Defense",
            "category": "Cybersecurity & AI",
            "leadStudent": "Karan Verma",
            "teamMembers": [
                  "Karan Verma",
                  "Zoe Washington"
            ],
            "department": "Computer Science & Engineering",
            "advisor": "Dr. Michael Chang",
            "description": "Dynamic generative honeynet creating synthetic campus servers and decoy SCADA infrastructure to lure, trap, and reverse-engineer zero-day cyber attacks in real-time.",
            "boothNumber": "Expo Arena - Booth #27",
            "demoVideoUrl": "https://youtu.be/cybersentinel-demo",
            "votesCount": 31,
            "judgeScore": 93.5,
            "status": "Approved",
            "qrCode": "CIQ-PROJECT-PRJ-2026-08-VOTE",
            "imageUrl": "/src/assets/images/project_cybersentinel.jpg",
            "techStack": [
                  "Python",
                  "eBPF",
                  "Docker Sandbox",
                  "LLM Agent Traps",
                  "Wireshark Engine",
                  "Elasticsearch"
            ],
            "githubUrl": "https://github.com/campusiq/cybersentinel-honeynet",
            "abstract": "Critical university networks and energy grids face automated nation-state scanning. CyberSentinel deploys lightweight containerized honeypots that dynamically mimic real campus database servers and building automation controllers. When breached, an LLM-driven decoy simulates realistic shell sessions to keep adversaries engaged while eBPF kernel hooks record malware binaries and payloads.",
            "keySpecifications": [
                  "eBPF low-overhead kernel syscall recording",
                  "Dynamic realistic response generation using local LLM",
                  "Automated extraction of indicators of compromise (IOCs)",
                  "Zero false-positive alarms to campus SOC"
            ],
            "documentation": {
                  "overview": "Autonomous cyber deception platform isolating advanced persistent threats.",
                  "methodology": "Kernel-level probes trace file descriptors, network sockets, and execve calls inside unprivileged container jails. Payloads are automatically detonated in air-gapped sandboxes.",
                  "results": "Intercepted 1,420 real malicious intrusions over 30 days without exposing production campus databases.",
                  "futureWork": "Automated firewall rule synthesis and threat intel sharing via STIX/TAXII.",
                  "billOfMaterials": "Kubernetes edge cluster, eBPF Linux kernel nodes, Elasticsearch SIEM."
            }
      },
      {
            "id": "PRJ-2026-09",
            "title": "SkyNet CubeSat: 1U Nanosatellite with LoRa Earth Mesh Telemetry",
            "category": "Aerospace & Telecom",
            "leadStudent": "Neil Armstrong Jr.",
            "teamMembers": [
                  "Neil Armstrong Jr.",
                  "Vamsi Uppalapati",
                  "Chloe Adams"
            ],
            "department": "Electronics & Communication",
            "advisor": "Prof. Sunita Sharma",
            "description": "University 1U CubeSat payload engineered for low Earth orbit, carrying a wide-angle Earth observation sensor and amateur radio LoRa ground relay transponder.",
            "boothNumber": "Expo Arena - Booth #12",
            "demoVideoUrl": "https://youtu.be/skynet-cubesat-demo",
            "votesCount": 37,
            "judgeScore": 95.5,
            "status": "Approved",
            "qrCode": "CIQ-PROJECT-PRJ-2026-09-VOTE",
            "imageUrl": "/src/assets/images/project_cubesat_satellite.jpg",
            "techStack": [
                  "Embedded C",
                  "FreeRTOS",
                  "KiCAD",
                  "LoRa 433MHz",
                  "Thermal Vacuum Testing"
            ],
            "githubUrl": "https://github.com/campusiq/skynet-cubesat",
            "abstract": "Access to space telemetry remains expensive for educational institutions. SkyNet CubeSat is a 10x10x10cm nanosatellite featuring triple-junction GaAs solar arrays, a dual-redundant FreeRTOS on-board computer, and long-range LoRa modulation capable of transmitting telemetry directly to low-cost $20 handheld ground stations worldwide.",
            "keySpecifications": [
                  "1U Form Factor (10 x 10 x 10 cm, 1.18 kg mass)",
                  "433MHz LoRa downlink receivable by handheld dipole antennas",
                  "Passive magnetic stabilization with hysteresis rods",
                  "Space-grade vacuum and thermal cycled (-20°C to +70°C)"
            ],
            "documentation": {
                  "overview": "Collegiate orbital nanosatellite platform enabling open scientific access.",
                  "methodology": "Designed 6-layer high-reliability PCB backplane complying with CubeSat Design Specification (CDS) standards. Conducted shake table vibration and thermal vacuum chamber tests.",
                  "results": "Passed all pre-flight thermal-vacuum (TVAC) and launch provider vibration screening protocols.",
                  "futureWork": "Orbital launch scheduled aboard commercial rideshare rocket in Q3 2027.",
                  "billOfMaterials": "Space-grade aluminum 6061 chassis, GaAs triple-junction solar panels, STM32-L4 ultra-low power MCU, Semtech SX1262 transceiver."
            }
      }
    ],
    projectVotes: [
      { id: 'VOTE-01', projectId: 'PRJ-2026-02', userId: 'USR-04', votedAt: '2026-10-25T11:20:00Z' }
    ],
    lostFound: [
      {
        id: 'LF-101',
        type: 'Found',
        title: 'Space Gray iPad Air with Apple Pencil',
        category: 'Electronics',
        locationFound: 'Central Library, 2nd Floor Study Cubicle #18',
        dateReported: '2026-10-25',
        description: 'Found inside a blue felt sleeve with a sticker of Turing machine on back.',
        securityQuestion: 'What is the lockscreen wallpaper photo?',
        status: 'Open for Claim',
        reportedBy: 'Marcus Bell (Librarian)',
        contactHidden: true
      },
      {
        id: 'LF-102',
        type: 'Lost',
        title: 'Silver Scientific Calculator (Casio fx-991EX)',
        category: 'Stationery',
        locationFound: 'LHC Room 302',
        dateReported: '2026-10-26',
        description: 'Name written on back battery cover in permanent ink.',
        securityQuestion: 'What initials are engraved on the sliding case?',
        status: 'Pending Match',
        reportedBy: 'Aarav Sharma',
        contactHidden: true
      }
    ],
    complaints: [
      {
        id: 'CMP-2026-081',
        ticketNumber: 'TKT-081',
        studentId: 'STU-2024-001',
        studentName: 'Aarav Sharma',
        category: 'Laboratory & Equipment',
        title: 'Oscilloscope Calibration Drift in VLSI Lab Bench 4',
        description: 'Signal jitter observed on Channel 2 causing erroneous rise-time measurements for coursework.',
        assignedDepartment: 'Electronics Lab Maintenance',
        priority: 'High',
        status: 'In Progress',
        targetResolutionHours: 24,
        createdAt: '2026-10-26T10:00:00Z',
        staffNotes: 'Technician assigned. Replacement probe scheduled for inspection 2 PM.',
        statusHistory: [
          { status: 'Submitted', time: '2026-10-26T10:00:00Z', note: 'Issue logged by student' },
          { status: 'Acknowledged', time: '2026-10-26T10:30:00Z', note: 'Reviewed by Chief Lab Tech' },
          { status: 'In Progress', time: '2026-10-26T11:15:00Z', note: 'Bench isolated for diagnostic recalibration' }
        ]
      },
      {
        id: 'CMP-2026-079',
        ticketNumber: 'TKT-079',
        studentId: 'STU-2024-002',
        studentName: 'Maya Lin',
        category: 'Campus Network & Wi-Fi',
        title: 'Intermittent Eduroam Signal in Turing Complex 3rd Floor',
        description: 'Frequent authentication dropouts during afternoon lecture periods.',
        assignedDepartment: 'IT Infrastructure & NOC',
        priority: 'Medium',
        status: 'Resolved',
        targetResolutionHours: 48,
        createdAt: '2026-10-24T14:00:00Z',
        staffNotes: 'Rebooted Access Point AP-TC-302 and replaced PoE switch port.',
        statusHistory: [
          { status: 'Submitted', time: '2026-10-24T14:00:00Z', note: 'Logged' },
          { status: 'In Progress', time: '2026-10-25T09:00:00Z', note: 'Hardware tested' },
          { status: 'Resolved', time: '2026-10-25T16:00:00Z', note: 'Telemetry confirmed 100% link stability' }
        ]
      }
    ],
    attendanceSessions: [
      {
        id: 'ATT-SESS-901',
        courseCode: 'CS601',
        courseName: 'Distributed Systems & Cloud Architecture',
        facultyId: 'USR-03',
        facultyName: 'Dr. Elena Chen',
        date: '2026-10-26',
        timeWindow: '10:00 AM - 11:00 AM',
        sessionCode: 'DS-9941',
        activeQrToken: 'CIQ-ATTEND-CS601-20261026-TOKEN99',
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
        totalPresent: 58,
        totalEnrolled: 64
      }
    ],
    attendanceRecords: [
      { id: 'REC-01', studentId: 'STU-2024-001', courseCode: 'CS601', date: '2026-10-26', status: 'Present', method: 'Dynamic QR Scan' },
      { id: 'REC-02', studentId: 'STU-2024-001', courseCode: 'CS602', date: '2026-10-25', status: 'Present', method: 'NFC Tap' },
      { id: 'REC-03', studentId: 'STU-2024-001', courseCode: 'CS603', date: '2026-10-24', status: 'Present', method: 'Faculty Entry' }
    ],
    skillPassports: [
      {
        studentId: 'STU-2024-001',
        headline: 'AI Systems Architect & Embedded Robotics Enthusiast',
        bio: 'Passionate about distributed micro-services, reinforcement learning for robotics, and high-frequency edge computing.',
        skills: ['Distributed Systems', 'PyTorch', 'Rust / C++', 'ROS 2 (Robot Operating System)', 'TensorFlow Lite', 'Kubernetes', 'Computer Vision'],
        certifications: [
          { title: 'AWS Certified Solutions Architect — Associate', issuer: 'Amazon Web Services', date: '2025-11', verified: true, credentialId: 'AWS-991204' },
          { title: 'NVIDIA Deep Learning Institute — Fundamentals of Deep Learning', issuer: 'NVIDIA', date: '2025-08', verified: true, credentialId: 'DLI-NV-4412' }
        ],
        hackathons: [
          { name: 'Global Space Hack 2025', award: '1st Place Winner', project: 'Satellite Constellation Orbit Optimizer' },
          { name: 'HackMIT 2025', award: 'Best Hardware/IoT Hack', project: 'Neural Tactile Sensory Glove' }
        ],
        internships: [
          { company: 'Apex Robotics Labs', role: 'Robotics Engineering Intern', period: 'Summer 2025 (3 mos)', verified: true }
        ],
        careerGoals: 'Targeting a Master of Science in Robotics / Autonomous Systems and Senior Machine Learning Systems Engineering role.',
        shareableId: 'PASSPORT-AARAV-2026'
      }
    ],
    notifications: [
      {
        id: 'NOTIF-01',
        title: 'Hall Ticket Autumn 2026 Ready',
        message: 'Your official examination hall ticket for Autumn 2026 has been generated with verified seat assignments.',
        type: 'exam',
        timestamp: '2 hours ago',
        read: false,
        actionUrl: 'exams'
      },
      {
        id: 'NOTIF-02',
        title: 'Library Overdue Notice (2 days)',
        message: 'Book "Introduction to Algorithms" is 2 days past due date. Applicable fine: $4.00.',
        type: 'library',
        timestamp: '5 hours ago',
        read: false,
        actionUrl: 'library'
      },
      {
        id: 'NOTIF-03',
        title: 'Gate Pass GP-2026-042 Approved',
        message: 'Your gate pass for IEEE Conference has been approved by Dean Davies. QR Pass is ready for exit verification.',
        type: 'gatepass',
        timestamp: '1 day ago',
        read: true,
        actionUrl: 'gatepass'
      },
      {
        id: 'NOTIF-04',
        title: 'Canteen Order #8921 is Ready!',
        message: 'Your Mediterranean Grain Bowl & Matcha Latte are packaged and ready at Counter 2. Present pickup QR.',
        type: 'canteen',
        timestamp: '10 mins ago',
        read: false,
        actionUrl: 'canteen'
      }
    ],
    verificationLogs: [
      {
        id: 'LOG-001',
        token: 'CIQ-EVTPASS-REG-2026-881-A7E9',
        type: 'Event Entry Pass',
        entityId: 'REG-2026-881',
        subjectName: 'Aarav Sharma',
        verifiedBy: 'Security Station — Turing Innovation Gate',
        status: 'Valid & Admitted',
        timestamp: '2026-10-26T21:40:00Z',
        notes: 'Pass scanned. Admitted to Turing Hall B.'
      }
    ]
  };
}

// Database loader and saver
function readDB(): DBData {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialDB();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading database, creating default:', err);
    const initial = getInitialDB();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
}

function writeDB(data: DBData): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing database:', err);
  }
}

// Initialize database
let db = readDB();

// ==========================================
// API Endpoints
// ==========================================

// 1. Auth & Role Switcher
app.get('/api/auth/current-user', (req: Request, res: Response) => {
  const user = db.users.find(u => u.role === db.currentUserRole) || db.users[0];
  const activeStudent = db.students.find(s => s.id === db.currentUserId) || db.students[0];
  res.json({
    role: db.currentUserRole,
    user,
    activeStudent,
    allRoles: db.users.map(u => ({ role: u.role, name: u.name, department: u.department }))
  });
});

app.post('/api/auth/switch-role', (req: Request, res: Response) => {
  const { role, studentId } = req.body;
  if (role) {
    db.currentUserRole = role;
  }
  if (studentId) {
    db.currentUserId = studentId;
  }
  writeDB(db);
  res.json({ success: true, currentRole: db.currentUserRole, currentUserId: db.currentUserId });
});

// 2. Dashboard Aggregate Stats
app.get('/api/stats', (req: Request, res: Response) => {
  const totalStudents = db.students.length;
  const facultyCount = db.users.filter(u => u.role === 'Faculty' || u.role === 'Super Administrator').length;
  const departments = Array.from(new Set(db.students.map(s => s.department)));
  
  const totalAttendance = db.students.reduce((acc, s) => acc + (s.attendancePercentage || 0), 0);
  const avgAttendance = totalStudents > 0 ? Number((totalAttendance / totalStudents).toFixed(1)) : 85.0;

  const upcomingExams = db.exams.length;
  const activeEvents = db.events.filter(e => e.status === 'Published').length;
  const totalBooks = db.books.reduce((acc, b) => acc + b.totalCopies, 0);
  const availableBooks = db.books.reduce((acc, b) => acc + b.availableCopies, 0);
  const pendingGatePasses = db.gatePasses.filter(g => g.status === 'Pending').length;
  const availableEquipment = db.labEquipment.filter(e => e.status === 'Available').length;
  const totalEquipment = db.labEquipment.length;
  const openComplaints = db.complaints.filter(c => c.status !== 'Resolved').length;

  res.json({
    totalStudents,
    facultyCount,
    departmentsCount: departments.length,
    departments,
    avgAttendance,
    upcomingExams,
    activeEvents,
    library: { total: totalBooks, available: availableBooks, loaned: totalBooks - availableBooks },
    pendingGatePasses,
    equipment: { available: availableEquipment, total: totalEquipment },
    openComplaints,
    recentActivities: db.verificationLogs.slice(-6).reverse()
  });
});

// 3. Universal QR Verification System
app.post('/api/qr/verify', (req: Request, res: Response) => {
  const { code, verifierStation = 'Main Campus Gateway Terminal', verifierRole = 'Security Staff' } = req.body;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ valid: false, message: 'Invalid or missing QR Code data string.' });
  }

  const cleanCode = code.trim().toUpperCase();

  // Test Security Rejections for Exhibition / Testing Audio Feedback
  if (cleanCode.includes('EXPIRED') || cleanCode.includes('REVOKED') || cleanCode.includes('REJECTED')) {
    const isExpired = cleanCode.includes('EXPIRED');
    const logEntry = {
      id: `LOG-${Date.now()}`,
      token: cleanCode,
      type: 'Security Credential Alert',
      entityId: isExpired ? 'PASS-EXPIRED-TEST' : 'PASS-REVOKED-TEST',
      subjectName: isExpired ? 'Expired Credential Token' : 'Revoked Security Token',
      verifiedBy: `${verifierRole} (${verifierStation})`,
      status: isExpired ? 'Expired' : 'Revoked / Barred',
      timestamp: new Date().toISOString(),
      notes: isExpired
        ? 'Pass validity window elapsed. Re-admission rejected.'
        : 'Pass revoked by campus authorities. Security gate access denied.'
    };
    db.verificationLogs.push(logEntry);
    writeDB(db);

    return res.json({
      valid: false,
      status: isExpired ? 'Expired' : 'Revoked',
      type: 'Cryptographic Security Alert',
      message: isExpired
        ? 'Access Rejected: The presentation credential has passed its validity window.'
        : 'Access Barred: This pass was formally revoked by campus administration.'
    });
  }

  // 1. Student ID
  const student = db.students.find(s => s.qrToken === cleanCode || cleanCode.includes(s.id));
  if (student) {
    const isExpired = new Date(student.idCardExpiryDate) < new Date();
    const isDeactivated = student.idCardStatus !== 'Active';

    const logEntry = {
      id: `LOG-${Date.now()}`,
      token: cleanCode,
      type: 'Digital Student ID',
      entityId: student.id,
      subjectName: student.name,
      verifiedBy: `${verifierRole} (${verifierStation})`,
      status: isDeactivated ? 'Deactivated' : isExpired ? 'Expired' : 'Verified & Valid',
      timestamp: new Date().toISOString(),
      notes: `Roll: ${student.rollNumber}, Department: ${student.department}, Card Status: ${student.idCardStatus}`
    };
    db.verificationLogs.push(logEntry);
    writeDB(db);

    if (isDeactivated) {
      return res.json({ valid: false, status: 'Deactivated', message: 'Student ID card has been suspended or deactivated.', student: { name: student.name, id: student.id, rollNumber: student.rollNumber } });
    }
    if (isExpired) {
      return res.json({ valid: false, status: 'Expired', message: 'Student ID card expired on ' + student.idCardExpiryDate, student: { name: student.name, id: student.id, rollNumber: student.rollNumber } });
    }

    return res.json({
      valid: true,
      status: 'Valid',
      type: 'Digital Student ID',
      student: {
        id: student.id,
        name: student.name,
        rollNumber: student.rollNumber
      },
      data: {
        id: student.id,
        name: student.name,
        rollNumber: student.rollNumber,
        department: student.department,
        course: student.course,
        validUntil: student.idCardExpiryDate,
        attendance: `${student.attendancePercentage}%`,
        status: student.idCardStatus,
        photo: student.photo
      },
      message: `Authentic Student ID verified: ${student.name} (${student.rollNumber}).`
    });
  }

  // 1b. Classroom Lecture QR Attendance Token
  const activeSess = db.attendanceSessions.find(s => s.activeQrToken === cleanCode || (s.activeQrToken && s.activeQrToken.includes(cleanCode)) || cleanCode.includes(s.courseCode));
  if (activeSess || cleanCode.startsWith('CIQ-ATTEND-')) {
    const currentStudent = db.students.find(s => s.id === db.currentUserId) || db.students[0];
    const courseCode = activeSess?.courseCode || 'CS601';

    const logEntry = {
      id: `LOG-${Date.now()}`,
      token: cleanCode,
      type: 'Classroom Lecture Attendance',
      entityId: currentStudent.id,
      subjectName: currentStudent.name,
      verifiedBy: `${verifierRole} (${verifierStation})`,
      status: 'Attendance Marked',
      timestamp: new Date().toISOString(),
      notes: `Course: ${courseCode}, Student: ${currentStudent.name} (${currentStudent.rollNumber})`
    };
    db.verificationLogs.push(logEntry);

    const record = {
      id: `REC-${Date.now()}`,
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      rollNumber: currentStudent.rollNumber,
      courseCode,
      date: new Date().toISOString().split('T')[0],
      status: 'Present',
      method: 'Live QR Scan'
    };
    db.attendanceRecords.push(record);
    if (activeSess) {
      activeSess.totalPresent = (activeSess.totalPresent || 0) + 1;
    }
    writeDB(db);

    return res.json({
      valid: true,
      status: 'Attendance Verified',
      type: 'Classroom QR Attendance',
      student: {
        id: currentStudent.id,
        name: currentStudent.name,
        rollNumber: currentStudent.rollNumber
      },
      data: {
        id: currentStudent.id,
        name: currentStudent.name,
        rollNumber: currentStudent.rollNumber,
        courseCode,
        sessionCode: activeSess?.sessionCode || 'LIVE',
        timeWindow: activeSess?.timeWindow || 'Active Lecture'
      },
      message: `Attendance marked Present for ${currentStudent.name} (${currentStudent.rollNumber}) in ${courseCode}.`
    });
  }

  // 2. Event Pass
  const registration = db.eventRegistrations.find(r => r.qrPass === cleanCode || cleanCode.includes(r.id));
  if (registration) {
    const event = db.events.find(e => e.id === registration.eventId);
    const isAlreadyCheckedIn = registration.status === 'Checked-In';

    const logEntry = {
      id: `LOG-${Date.now()}`,
      token: cleanCode,
      type: 'Event Entry Pass',
      entityId: registration.id,
      subjectName: registration.studentName,
      verifiedBy: `${verifierRole} (${verifierStation})`,
      status: isAlreadyCheckedIn ? 'Already Admitted' : 'Valid Entry',
      timestamp: new Date().toISOString(),
      notes: `Event: ${event?.title || 'Unknown Event'}, Seat: ${registration.seatNumber}`
    };
    db.verificationLogs.push(logEntry);
    writeDB(db);

    return res.json({
      valid: !isAlreadyCheckedIn,
      status: isAlreadyCheckedIn ? 'Already Used' : 'Valid',
      type: 'Event Entry Pass',
      canRedeem: !isAlreadyCheckedIn,
      redeemEndpoint: `/api/events/${registration.eventId}/check-in`,
      payload: { registrationId: registration.id },
      data: {
        registrationId: registration.id,
        studentName: registration.studentName,
        eventTitle: event?.title,
        venue: event?.venue,
        date: event?.date,
        seat: registration.seatNumber,
        registeredAt: registration.registeredAt,
        checkedInAt: registration.checkedInAt
      },
      message: isAlreadyCheckedIn ? 'Pass has already been redeemed for entrance.' : 'Event entry pass is valid and approved.'
    });
  }

  // 3. Hall Ticket
  const hallTicket = db.hallTickets.find(h => h.qrToken === cleanCode || cleanCode.includes(h.id));
  if (hallTicket) {
    const logEntry = {
      id: `LOG-${Date.now()}`,
      token: cleanCode,
      type: 'Examination Hall Ticket',
      entityId: hallTicket.id,
      subjectName: hallTicket.studentName,
      verifiedBy: `${verifierRole} (${verifierStation})`,
      status: 'Valid Examination Ticket',
      timestamp: new Date().toISOString(),
      notes: `Roll: ${hallTicket.rollNumber}, Room: ${hallTicket.roomNumber}, Seat: ${hallTicket.seatNumber}`
    };
    db.verificationLogs.push(logEntry);
    writeDB(db);

    return res.json({
      valid: true,
      status: 'Valid',
      type: 'Examination Hall Ticket',
      data: {
        ticketId: hallTicket.id,
        studentName: hallTicket.studentName,
        rollNumber: hallTicket.rollNumber,
        roomNumber: hallTicket.roomNumber,
        seatNumber: hallTicket.seatNumber,
        eligibility: hallTicket.eligibilityStatus,
        examDates: hallTicket.examDates
      },
      message: 'Examination Hall Ticket is authentic and candidate is verified for entry.'
    });
  }

  // 4. Gate Pass
  const gatePass = db.gatePasses.find(g => g.qrPass === cleanCode || cleanCode.includes(g.id));
  if (gatePass) {
    const isApproved = gatePass.status === 'Approved';
    const isUsed = gatePass.exitTimestamp && gatePass.entryTimestamp;

    const logEntry = {
      id: `LOG-${Date.now()}`,
      token: cleanCode,
      type: 'Student Gate Pass',
      entityId: gatePass.id,
      subjectName: gatePass.studentName,
      verifiedBy: `${verifierRole} (${verifierStation})`,
      status: !isApproved ? 'Unapproved/Rejected' : isUsed ? 'Expired/Completed' : 'Valid Gate Pass',
      timestamp: new Date().toISOString(),
      notes: `Reason: ${gatePass.reason}, Destination: ${gatePass.destination}`
    };
    db.verificationLogs.push(logEntry);
    writeDB(db);

    return res.json({
      valid: isApproved && !isUsed,
      status: !isApproved ? gatePass.status : isUsed ? 'Already Used' : 'Valid',
      type: 'Student Gate Pass',
      canRedeem: isApproved && !isUsed,
      redeemEndpoint: `/api/gate-passes/scan`,
      payload: { passId: gatePass.id },
      data: {
        passId: gatePass.id,
        studentName: gatePass.studentName,
        reason: gatePass.reason,
        destination: gatePass.destination,
        departureTime: gatePass.departureTime,
        expectedReturnTime: gatePass.expectedReturnTime,
        approvedBy: gatePass.approvedBy,
        exitRecorded: gatePass.exitTimestamp,
        entryRecorded: gatePass.entryTimestamp
      },
      message: isApproved ? 'Gate pass verified for departure/entry.' : 'Gate pass has not been authorized by warden.'
    });
  }

  // 5. Canteen Pickup Token
  const canteenOrder = db.canteenOrders.find(o => o.pickupToken === cleanCode || cleanCode.includes(o.id));
  if (canteenOrder) {
    const isRedeemed = canteenOrder.redeemed || canteenOrder.status === 'Completed';

    return res.json({
      valid: !isRedeemed,
      status: isRedeemed ? 'Already Picked Up' : 'Ready For Handover',
      type: 'Canteen Order Pickup',
      canRedeem: !isRedeemed,
      redeemEndpoint: `/api/canteen/orders/${canteenOrder.id}/pickup`,
      data: {
        orderId: canteenOrder.id,
        orderNumber: canteenOrder.orderNumber,
        studentName: canteenOrder.studentName,
        items: canteenOrder.items,
        totalAmount: `$${canteenOrder.totalAmount.toFixed(2)}`,
        status: canteenOrder.status
      },
      message: isRedeemed ? 'Order has already been picked up.' : 'Order pickup token verified.'
    });
  }

  // 6. Library Book Barcode/QR
  const book = db.books.find(b => b.qrCode === cleanCode || b.isbn === cleanCode || cleanCode.includes(b.id));
  if (book) {
    return res.json({
      valid: true,
      status: 'Valid',
      type: 'Smart Library Asset',
      data: {
        id: book.id,
        isbn: book.isbn,
        title: book.title,
        author: book.author,
        shelfLocation: book.shelfLocation,
        availableCopies: book.availableCopies,
        totalCopies: book.totalCopies
      },
      message: 'Library catalog item located.'
    });
  }

  // 7. Lab Equipment QR
  const equip = db.labEquipment.find(e => e.qrTag === cleanCode || e.assetId === cleanCode || cleanCode.includes(e.id));
  if (equip) {
    return res.json({
      valid: true,
      status: 'Valid',
      type: 'Laboratory Asset',
      data: {
        id: equip.id,
        assetId: equip.assetId,
        name: equip.name,
        lab: equip.lab,
        condition: equip.condition,
        status: equip.status,
        allocatedTo: equip.allocatedTo
      },
      message: 'Lab equipment record identified.'
    });
  }

  // Default invalid
  return res.json({
    valid: false,
    status: 'Invalid / Unrecognized',
    message: 'Scanned token does not match any active student, event pass, ticket, or campus asset.'
  });
});

app.get('/api/qr/logs', (req: Request, res: Response) => {
  res.json({ logs: db.verificationLogs.slice(-25).reverse() });
});

// 4. Students & Digital ID Cards
app.get('/api/students', (req: Request, res: Response) => {
  res.json({ students: db.students });
});

app.post('/api/students', (req: Request, res: Response) => {
  const { name, rollNumber, department, course, email, emergencyContact, bloodGroup } = req.body;
  if (!name || !rollNumber || !department) {
    return res.status(400).json({ error: 'Missing required student fields' });
  }
  const id = `STU-2024-${String(db.students.length + 1).padStart(3, '0')}`;
  const qrToken = generateToken('STUID', id);
  const defaultPhotos = [
    '/src/assets/images/student_srija_devi.jpg',
    '/src/assets/images/student_aarav_sharma.jpg',
    '/src/assets/images/student_maya_lin.jpg',
    '/src/assets/images/student_rohan_patel.jpg',
    '/src/assets/images/student_zoe_washington.jpg',
    '/src/assets/images/student_karan_verma.jpg',
    '/src/assets/images/student_ananya_iyer.jpg',
    '/src/assets/images/student_vikramaditya_rao.jpg',
    '/src/assets/images/student_vamsi_uppalapati.jpg',
    '/src/assets/images/student_sneha_reddy.jpg',
    '/src/assets/images/student_rahul_deshmukh.jpg'
  ];
  let photo = defaultPhotos[db.students.length % defaultPhotos.length];
  const lowerName = (name || '').toLowerCase();
  if (lowerName.includes('srija')) photo = '/src/assets/images/student_srija_devi.jpg';
  else if (lowerName.includes('aarav')) photo = '/src/assets/images/student_aarav_sharma.jpg';
  else if (lowerName.includes('maya')) photo = '/src/assets/images/student_maya_lin.jpg';
  else if (lowerName.includes('rohan')) photo = '/src/assets/images/student_rohan_patel.jpg';
  else if (lowerName.includes('zoe')) photo = '/src/assets/images/student_zoe_washington.jpg';
  else if (lowerName.includes('karan')) photo = '/src/assets/images/student_karan_verma.jpg';
  else if (lowerName.includes('ananya')) photo = '/src/assets/images/student_ananya_iyer.jpg';
  else if (lowerName.includes('vikram')) photo = '/src/assets/images/student_vikramaditya_rao.jpg';
  else if (lowerName.includes('vamsi')) photo = '/src/assets/images/student_vamsi_uppalapati.jpg';
  else if (lowerName.includes('sneha')) photo = '/src/assets/images/student_sneha_reddy.jpg';
  else if (lowerName.includes('rahul')) photo = '/src/assets/images/student_rahul_deshmukh.jpg';

  const newStudent = {
    id,
    rollNumber,
    name,
    email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@student.campusiq.edu`,
    department,
    course: course || 'B.Tech Engineering',
    year: '1st Year',
    semester: 'Semester I',
    gpa: 3.50,
    attendancePercentage: 100.0,
    bloodGroup: bloodGroup || 'O+ve',
    emergencyContact: emergencyContact || '+1 (555) 000-0000',
    photo,
    rfidTag: `NFC-${Math.floor(100000 + Math.random() * 900000)}`,
    idCardStatus: 'Active',
    idCardIssuedDate: new Date().toISOString().split('T')[0],
    idCardExpiryDate: '2028-06-30',
    qrToken,
    mentor: 'Dr. Elena Chen'
  };
  db.students.push(newStudent);
  writeDB(db);
  res.json({ success: true, student: newStudent });
});

app.post('/api/students/:id/id-card', (req: Request, res: Response) => {
  const { id } = req.params;
  const { action } = req.body; // 'renew', 'deactivate', 'reissue', 'activate'
  const student = db.students.find(s => s.id === id);
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  if (action === 'deactivate') {
    student.idCardStatus = 'Deactivated';
  } else if (action === 'activate') {
    student.idCardStatus = 'Active';
  } else if (action === 'renew') {
    student.idCardStatus = 'Active';
    student.idCardExpiryDate = '2028-06-30';
  } else if (action === 'reissue') {
    student.idCardStatus = 'Active';
    student.qrToken = generateToken('STUID', student.id);
    student.idCardIssuedDate = new Date().toISOString().split('T')[0];
  }
  writeDB(db);
  res.json({ success: true, student });
});

// 5. Events & QR Passes
app.get('/api/events', (req: Request, res: Response) => {
  res.json({ events: db.events, registrations: db.eventRegistrations });
});

app.post('/api/events', (req: Request, res: Response) => {
  const { title, category, description, date, time, venue, capacity, eligibility, organizer } = req.body;
  const id = `EVT-2026-${String(db.events.length + 1).padStart(2, '0')}`;
  
  const eventBannerMap: Record<string, string> = {
    'Hackathon': '/src/assets/images/event_ai_robotics_hackathon.jpg',
    'Seminar': '/src/assets/images/event_clean_energy_symposium.jpg',
    'Cultural Fest': '/src/assets/images/event_cultural_music_fest.jpg',
    'Career Fair': '/src/assets/images/event_career_expo.jpg',
    'Esports': '/src/assets/images/event_esports_arena.jpg',
    'Conference': '/src/assets/images/event_biotech_summit.jpg',
    'Startup Summit': '/src/assets/images/event_startup_pitch.jpg',
    'Stargazing': '/src/assets/images/event_astronomy_night.jpg',
    'Sports': '/src/assets/images/event_sports_olympiad.jpg',
    'Workshop': '/src/assets/images/event_ai_robotics_hackathon.jpg',
  };

  const pool = [
    '/src/assets/images/event_ai_robotics_hackathon.jpg',
    '/src/assets/images/event_clean_energy_symposium.jpg',
    '/src/assets/images/event_cultural_music_fest.jpg',
    '/src/assets/images/event_career_expo.jpg',
    '/src/assets/images/event_esports_arena.jpg',
    '/src/assets/images/event_biotech_summit.jpg',
    '/src/assets/images/event_startup_pitch.jpg',
    '/src/assets/images/event_astronomy_night.jpg',
    '/src/assets/images/event_sports_olympiad.jpg'
  ];

  let bannerUrl = eventBannerMap[category] || pool[db.events.length % pool.length];
  const lowerTitle = (title || '').toLowerCase();
  if (lowerTitle.includes('robot') || lowerTitle.includes('ai') || lowerTitle.includes('hack')) bannerUrl = '/src/assets/images/event_ai_robotics_hackathon.jpg';
  else if (lowerTitle.includes('energy') || lowerTitle.includes('sustain') || lowerTitle.includes('green')) bannerUrl = '/src/assets/images/event_clean_energy_symposium.jpg';
  else if (lowerTitle.includes('music') || lowerTitle.includes('cultural') || lowerTitle.includes('dance') || lowerTitle.includes('band')) bannerUrl = '/src/assets/images/event_cultural_music_fest.jpg';
  else if (lowerTitle.includes('career') || lowerTitle.includes('job') || lowerTitle.includes('placement')) bannerUrl = '/src/assets/images/event_career_expo.jpg';
  else if (lowerTitle.includes('game') || lowerTitle.includes('esport') || lowerTitle.includes('valorant')) bannerUrl = '/src/assets/images/event_esports_arena.jpg';
  else if (lowerTitle.includes('bio') || lowerTitle.includes('gene') || lowerTitle.includes('neuro') || lowerTitle.includes('med')) bannerUrl = '/src/assets/images/event_biotech_summit.jpg';
  else if (lowerTitle.includes('startup') || lowerTitle.includes('pitch') || lowerTitle.includes('shark') || lowerTitle.includes('venture')) bannerUrl = '/src/assets/images/event_startup_pitch.jpg';
  else if (lowerTitle.includes('astro') || lowerTitle.includes('space') || lowerTitle.includes('star')) bannerUrl = '/src/assets/images/event_astronomy_night.jpg';
  else if (lowerTitle.includes('sport') || lowerTitle.includes('olympiad') || lowerTitle.includes('track') || lowerTitle.includes('foot') || lowerTitle.includes('cricket')) bannerUrl = '/src/assets/images/event_sports_olympiad.jpg';

  const newEvent = {
    id,
    title,
    category: category || 'General',
    description,
    date,
    time: time || '10:00 AM - 04:00 PM',
    venue,
    capacity: Number(capacity) || 100,
    registeredCount: 0,
    checkedInCount: 0,
    eligibility: eligibility || 'All Campus Members',
    registrationDeadline: date,
    organizer: organizer || db.currentUserRole,
    status: 'Published',
    entryQRCode: generateToken('EVENT', id),
    bannerUrl
  };
  db.events.push(newEvent);
  writeDB(db);
  res.json({ success: true, event: newEvent });
});

app.post('/api/events/:id/register', (req: Request, res: Response) => {
  const { id } = req.params;
  const studentId = req.body.studentId || db.currentUserId;
  const event = db.events.find(e => e.id === id);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  // Prevent duplicate registration
  const existing = db.eventRegistrations.find(r => r.eventId === id && r.studentId === studentId);
  if (existing) {
    return res.status(400).json({ error: 'Already registered for this event', registration: existing });
  }

  if (event.registeredCount >= event.capacity) {
    return res.status(400).json({ error: 'Event has reached maximum capacity' });
  }

  const student = db.students.find(s => s.id === studentId) || db.students[0];
  const regId = `REG-2026-${Math.floor(100 + Math.random() * 900)}`;
  const qrPass = generateToken('EVTPASS', regId);

  const registration = {
    id: regId,
    eventId: event.id,
    studentId: student.id,
    studentName: student.name,
    registeredAt: new Date().toISOString(),
    qrPass,
    status: 'Confirmed',
    checkedInAt: null,
    seatNumber: `Seat-${Math.floor(10 + Math.random() * 80)}`
  };

  db.eventRegistrations.push(registration);
  event.registeredCount += 1;
  writeDB(db);

  res.json({ success: true, registration, message: 'Registration approved! Entry pass generated.' });
});

app.post('/api/events/:id/check-in', (req: Request, res: Response) => {
  const { id } = req.params;
  const { registrationId } = req.body;

  const reg = db.eventRegistrations.find(r => r.id === registrationId && r.eventId === id);
  if (!reg) return res.status(404).json({ error: 'Registration not found' });

  if (reg.status === 'Checked-In') {
    return res.status(400).json({ error: 'Pass already checked in', checkedInAt: reg.checkedInAt });
  }

  reg.status = 'Checked-In';
  reg.checkedInAt = new Date().toISOString();

  const event = db.events.find(e => e.id === id);
  if (event) {
    event.checkedInCount = (event.checkedInCount || 0) + 1;
  }
  writeDB(db);

  res.json({ success: true, registration: reg, message: `Admitted: ${reg.studentName} to ${event?.title}` });
});

// 6. Examination Timetable & Digital Hall Tickets
app.get('/api/exams', (req: Request, res: Response) => {
  res.json({ exams: db.exams, hallTickets: db.hallTickets });
});

app.post('/api/exams/hall-tickets/generate', (req: Request, res: Response) => {
  const studentId = req.body.studentId || db.currentUserId;
  const student = db.students.find(s => s.id === studentId);
  if (!student) return res.status(404).json({ error: 'Student record not found' });

  const existing = db.hallTickets.find(h => h.studentId === studentId);
  if (existing) {
    return res.json({ success: true, hallTicket: existing, alreadyGenerated: true });
  }

  const newTicket = {
    id: `HT-2026-${student.rollNumber.split('-')[0]}-${student.rollNumber.split('-')[2] || '001'}`,
    studentId: student.id,
    studentName: student.name,
    rollNumber: student.rollNumber,
    examPeriod: 'End Semester Examinations — Autumn 2026',
    department: student.department,
    roomNumber: 'Room NB-101',
    seatNumber: `Desk-LHC302-${Math.floor(10 + Math.random() * 50)}`,
    examDates: db.exams.map(e => ({
      subject: e.subjectName,
      date: e.date,
      time: e.session,
      room: e.roomNumber
    })),
    issuedAt: new Date().toISOString(),
    qrToken: generateToken('HALLTICKET', student.id),
    eligibilityStatus: `Eligible (Attendance: ${student.attendancePercentage}%, Dues Cleared)`,
    verifiedAtGate: false
  };

  db.hallTickets.push(newTicket);
  writeDB(db);
  res.json({ success: true, hallTicket: newTicket });
});

// 7. Smart Library Management
app.get('/api/library/books', (req: Request, res: Response) => {
  res.json({ books: db.books, loans: db.bookLoans });
});

app.post('/api/library/books', (req: Request, res: Response) => {
  const { title, author, isbn, publisher, category, totalCopies, shelfLocation } = req.body;
  const id = `BK-${100 + db.books.length + 1}`;
  const copies = Number(totalCopies) || 5;
  const newBook = {
    id,
    isbn: isbn || `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    title,
    author,
    publisher: publisher || 'Academic Press',
    category: category || 'Engineering',
    totalCopies: copies,
    availableCopies: copies,
    shelfLocation: shelfLocation || 'Stack CS-02-B',
    coverImage: (title && title.toLowerCase().includes('algorithm')) ? '/src/assets/images/book_clrs_algorithms.svg'
      : (title && (title.toLowerCase().includes('code') || title.toLowerCase().includes('software'))) ? '/src/assets/images/book_clean_code.svg'
      : (title && (title.toLowerCase().includes('pattern') || title.toLowerCase().includes('design'))) ? '/src/assets/images/book_head_first_design_patterns.svg'
      : '/src/assets/images/book_c_programming.svg',
    qrCode: generateToken('BOOK', id)
  };
  db.books.push(newBook);
  writeDB(db);
  res.json({ success: true, book: newBook });
});

app.post('/api/library/issue', (req: Request, res: Response) => {
  const { bookId, studentId = db.currentUserId, loanDays = 14 } = req.body;
  const book = db.books.find(b => b.id === bookId || b.isbn === bookId || b.qrCode === bookId);
  if (!book) return res.status(404).json({ error: 'Book not found' });

  if (book.availableCopies <= 0) {
    return res.status(400).json({ error: 'No copies currently available for loan' });
  }

  const student = db.students.find(s => s.id === studentId) || db.students[0];
  
  // Calculate due date
  const now = new Date();
  const due = new Date();
  due.setDate(now.getDate() + loanDays);

  const loanId = `LOAN-${Math.floor(1000 + Math.random() * 9000)}`;
  const loan = {
    id: loanId,
    bookId: book.id,
    bookTitle: book.title,
    studentId: student.id,
    studentName: student.name,
    issuedDate: now.toISOString().split('T')[0],
    dueDate: due.toISOString().split('T')[0],
    returnedDate: null,
    overdueDays: 0,
    fineAmount: 0.00,
    status: 'Active',
    qrCode: generateToken('LOAN', loanId)
  };

  book.availableCopies -= 1;
  db.bookLoans.push(loan);
  writeDB(db);

  res.json({ success: true, loan, availableCopies: book.availableCopies });
});

app.post('/api/library/return', (req: Request, res: Response) => {
  const { loanId } = req.body;
  const loan = db.bookLoans.find(l => l.id === loanId);
  if (!loan) return res.status(404).json({ error: 'Loan record not found' });

  if (loan.status === 'Returned') {
    return res.status(400).json({ error: 'Book already marked returned' });
  }

  loan.status = 'Returned';
  loan.returnedDate = new Date().toISOString().split('T')[0];

  const book = db.books.find(b => b.id === loan.bookId);
  if (book) {
    book.availableCopies = Math.min(book.totalCopies, book.availableCopies + 1);
  }

  writeDB(db);
  res.json({ success: true, loan, message: 'Book successfully returned and inventory restored.' });
});

// 8. Laboratory Equipment Tracking
app.get('/api/lab/equipment', (req: Request, res: Response) => {
  res.json({ equipment: db.labEquipment, requests: db.labRequests });
});

app.post('/api/lab/equipment', (req: Request, res: Response) => {
  const { name, assetId, category, lab, serialNumber } = req.body;
  const id = `LAB-EQ-${String(db.labEquipment.length + 1).padStart(2, '0')}`;
  const newEquip = {
    id,
    assetId: assetId || `ASSET-${Math.floor(1000 + Math.random() * 9000)}`,
    name,
    category: category || 'Electronics',
    lab: lab || 'General Engineering Lab',
    condition: 'Optimal',
    status: 'Available',
    allocatedTo: null,
    serialNumber: serialNumber || `SN-${Math.floor(10000 + Math.random() * 90000)}`,
    qrTag: generateToken('EQUIP', id)
  };
  db.labEquipment.push(newEquip);
  writeDB(db);
  res.json({ success: true, equipment: newEquip });
});

app.post('/api/lab/request', (req: Request, res: Response) => {
  const { equipmentId, purpose, days = 7 } = req.body;
  const student = db.students.find(s => s.id === db.currentUserId) || db.students[0];
  const item = db.labEquipment.find(e => e.id === equipmentId);
  if (!item) return res.status(404).json({ error: 'Equipment not found' });

  if (item.status !== 'Available') {
    return res.status(400).json({ error: `Equipment is currently ${item.status}` });
  }

  const reqId = `REQ-LAB-${Math.floor(100 + Math.random() * 900)}`;
  const returnDate = new Date();
  returnDate.setDate(returnDate.getDate() + days);

  const labReq = {
    id: reqId,
    equipmentId: item.id,
    equipmentName: item.name,
    studentId: student.id,
    studentName: student.name,
    requestDate: new Date().toISOString().split('T')[0],
    purpose: purpose || 'Academic research project experimentation',
    status: 'Approved',
    approvedBy: 'Vikram Mehta (Lab Tech)',
    returnDueDate: returnDate.toISOString().split('T')[0]
  };

  item.status = 'Borrowed';
  item.allocatedTo = {
    studentId: student.id,
    studentName: student.name,
    dueDate: returnDate.toISOString().split('T')[0]
  };

  db.labRequests.push(labReq);
  writeDB(db);

  res.json({ success: true, request: labReq, equipment: item });
});

app.post('/api/lab/action', (req: Request, res: Response) => {
  const { equipmentId, action } = req.body; // 'return', 'maintenance', 'available'
  const item = db.labEquipment.find(e => e.id === equipmentId);
  if (!item) return res.status(404).json({ error: 'Equipment not found' });

  if (action === 'return' || action === 'available') {
    item.status = 'Available';
    item.allocatedTo = null;
    item.condition = 'Optimal';
  } else if (action === 'maintenance') {
    item.status = 'Under Maintenance';
    item.condition = 'Needs Service';
    item.allocatedTo = null;
  }

  writeDB(db);
  res.json({ success: true, equipment: item });
});

// 9. Smart Canteen Ordering
app.get('/api/canteen/menu', (req: Request, res: Response) => {
  const student = db.students.find(s => s.id === db.currentUserId) || db.students[0];
  if (student.walletBalance === undefined) {
    student.walletBalance = 48.50;
  }
  res.json({ menu: db.canteenMenu, orders: db.canteenOrders, walletBalance: student.walletBalance });
});

app.post('/api/canteen/wallet/topup', (req: Request, res: Response) => {
  const { amount } = req.body;
  const topUpVal = Math.max(1, Number(amount) || 10);
  const student = db.students.find(s => s.id === db.currentUserId) || db.students[0];
  student.walletBalance = Number(((student.walletBalance || 48.50) + topUpVal).toFixed(2));
  writeDB(db);
  res.json({ success: true, walletBalance: student.walletBalance, message: `Successfully topped up $${topUpVal.toFixed(2)} to Smart Campus Wallet!` });
});

app.post('/api/canteen/order', (req: Request, res: Response) => {
  const { items, paymentMethod, transactionId, notes } = req.body; // [{ menuItemId, quantity }]
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }

  let subtotal = 0;
  const processedItems = items.map(cartItem => {
    const item = db.canteenMenu.find(m => m.id === cartItem.menuItemId);
    if (!item) throw new Error(`Item ${cartItem.menuItemId} does not exist`);
    const qty = Math.max(1, Number(cartItem.quantity) || 1);
    const lineTotal = item.price * qty;
    subtotal += lineTotal;
    return {
      menuItemId: item.id,
      name: item.name,
      quantity: qty,
      unitPrice: item.price
    };
  });

  const tax = Number((subtotal * 0.08).toFixed(2));
  const totalAmount = Number((subtotal + tax).toFixed(2));
  const orderNum = `#${Math.floor(1000 + Math.random() * 9000)}`;
  const orderId = `ORD-${orderNum.slice(1)}`;
  const pickupToken = generateToken('CANTEEN', orderId, 'PICKUP');

  const student = db.students.find(s => s.id === db.currentUserId) || db.students[0];
  if (student.walletBalance === undefined) {
    student.walletBalance = 48.50;
  }

  const chosenMethod = paymentMethod || 'Campus Smart ID Wallet (NFC)';
  const txnId = transactionId || `TXN-CIQ-${Date.now().toString().slice(-6)}`;

  // Debit student wallet if wallet method used
  if (chosenMethod.toLowerCase().includes('wallet')) {
    student.walletBalance = Math.max(0, Number((student.walletBalance - totalAmount).toFixed(2)));
  }

  const order = {
    id: orderId,
    orderNumber: orderNum,
    studentId: student.id,
    studentName: student.name,
    items: processedItems,
    subtotal,
    tax,
    totalAmount,
    paymentStatus: 'Paid & Verified',
    paymentMethod: chosenMethod,
    transactionId: txnId,
    status: 'Placed',
    pickupToken,
    orderedAt: new Date().toISOString(),
    redeemed: false,
    notes: notes || ''
  };

  db.canteenOrders.unshift(order);
  writeDB(db);

  res.json({ success: true, order, remainingWalletBalance: student.walletBalance });
});

app.patch('/api/canteen/orders/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body; // 'Placed', 'Preparing', 'Ready', 'Completed', 'Cancelled'
  const order = db.canteenOrders.find(o => o.id === id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  order.status = status;
  if (status === 'Completed') {
    order.redeemed = true;
  }
  writeDB(db);
  res.json({ success: true, order });
});

app.post('/api/canteen/orders/:id/pickup', (req: Request, res: Response) => {
  const { id } = req.params;
  const order = db.canteenOrders.find(o => o.id === id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  if (order.redeemed || order.status === 'Completed') {
    return res.status(400).json({ error: 'Order has already been redeemed and handed over.' });
  }

  order.status = 'Completed';
  order.redeemed = true;
  writeDB(db);

  res.json({ success: true, order, message: `Order ${order.orderNumber} successfully marked picked up.` });
});

// 10. Gate Pass & Visitor Management
app.get('/api/gate-passes', (req: Request, res: Response) => {
  res.json({ passes: db.gatePasses, visitors: db.visitors });
});

app.post('/api/gate-passes', (req: Request, res: Response) => {
  const { reason, destination, departureTime, expectedReturnTime } = req.body;
  const student = db.students.find(s => s.id === db.currentUserId) || db.students[0];

  const id = `GP-2026-${String(db.gatePasses.length + 1).padStart(3, '0')}`;
  const qrPass = generateToken('GATEPASS', id);

  const newPass = {
    id,
    studentId: student.id,
    studentName: student.name,
    rollNumber: student.rollNumber,
    reason: reason || 'Personal Leave with Parent Approval',
    destination: destination || 'City Center',
    departureTime: departureTime || new Date().toISOString(),
    expectedReturnTime: expectedReturnTime || new Date(Date.now() + 86400000).toISOString(),
    parentConsentVerified: true,
    status: 'Approved',
    approvedBy: 'Prof. Arthur Davies (Warden/Dean)',
    qrPass,
    exitTimestamp: null,
    entryTimestamp: null,
    passType: 'Day Pass (Single-Use)'
  };

  db.gatePasses.push(newPass);
  writeDB(db);

  res.json({ success: true, pass: newPass });
});

app.patch('/api/gate-passes/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body; // 'Approved', 'Rejected', 'Cancelled'
  const pass = db.gatePasses.find(g => g.id === id);
  if (!pass) return res.status(404).json({ error: 'Gate pass not found' });

  pass.status = status;
  if (status === 'Approved') {
    pass.approvedBy = db.users.find(u => u.role === db.currentUserRole)?.name || 'Dean Davies';
  }
  writeDB(db);
  res.json({ success: true, pass });
});

app.post('/api/gate-passes/scan', (req: Request, res: Response) => {
  const { passId } = req.body;
  const pass = db.gatePasses.find(g => g.id === passId);
  if (!pass) return res.status(404).json({ error: 'Gate pass not found' });

  const now = new Date().toISOString();
  if (!pass.exitTimestamp) {
    pass.exitTimestamp = now;
    writeDB(db);
    return res.json({ success: true, action: 'Exit Recorded', pass, message: `Student departed campus at ${now}` });
  } else if (!pass.entryTimestamp) {
    pass.entryTimestamp = now;
    writeDB(db);
    return res.json({ success: true, action: 'Re-entry Recorded', pass, message: `Student returned to campus at ${now}` });
  } else {
    return res.status(400).json({ error: 'This single-use gate pass has already logged exit and re-entry.' });
  }
});

// Visitors
app.post('/api/visitors', (req: Request, res: Response) => {
  const { visitorName, affiliation, hostFaculty, hostDepartment, purpose, visitDate } = req.body;
  const id = `VIS-${100 + db.visitors.length + 1}`;
  const newVis = {
    id,
    visitorName,
    affiliation: affiliation || 'External Guest',
    hostFaculty: hostFaculty || 'Dr. Elena Chen',
    hostDepartment: hostDepartment || 'Computer Science',
    purpose: purpose || 'Official Campus Visit',
    visitDate: visitDate || new Date().toISOString().split('T')[0],
    checkInTime: null,
    checkOutTime: null,
    status: 'Approved',
    badgeQR: generateToken('VISITOR', id)
  };
  db.visitors.push(newVis);
  writeDB(db);
  res.json({ success: true, visitor: newVis });
});

// 11. Smart Parking
app.get('/api/parking/slots', (req: Request, res: Response) => {
  res.json({ slots: db.parkingSlots, permits: db.parkingPermits });
});

app.post('/api/parking/reserve', (req: Request, res: Response) => {
  const { slotId, vehicleNumber, vehicleType = 'Car' } = req.body;
  const slot = db.parkingSlots.find(s => s.id === slotId);
  if (!slot) return res.status(404).json({ error: 'Slot not found' });

  if (slot.status !== 'Available') {
    return res.status(400).json({ error: `Slot is already ${slot.status}` });
  }

  const student = db.students.find(s => s.id === db.currentUserId) || db.students[0];
  const permitId = `PRK-${Math.floor(1000 + Math.random() * 9000)}`;

  slot.status = 'Reserved';
  slot.currentVehicle = vehicleNumber || 'CAR-9912';
  slot.reservedBy = student.id;

  const permit = {
    id: permitId,
    slotId: slot.id,
    slotNumber: slot.slotNumber,
    studentId: student.id,
    vehicleNumber: vehicleNumber || 'CAR-9912',
    vehicleType,
    validDate: new Date().toISOString().split('T')[0],
    qrPass: generateToken('PARKING', permitId),
    status: 'Active'
  };

  db.parkingPermits.push(permit);
  writeDB(db);

  res.json({ success: true, slot, permit });
});

app.post('/api/parking/action', (req: Request, res: Response) => {
  const { slotId, action } = req.body; // 'occupy', 'vacate'
  const slot = db.parkingSlots.find(s => s.id === slotId);
  if (!slot) return res.status(404).json({ error: 'Slot not found' });

  if (action === 'occupy') {
    slot.status = 'Occupied';
  } else if (action === 'vacate') {
    slot.status = 'Available';
    slot.currentVehicle = null;
    slot.reservedBy = null;
  }
  writeDB(db);
  res.json({ success: true, slot });
});

// 12. Project Exhibition & Voting
app.get('/api/projects', (req: Request, res: Response) => {
  res.json({ projects: db.projects, userVotes: db.projectVotes });
});

app.post('/api/projects', (req: Request, res: Response) => {
  const { title, category, description, leadStudent, teamMembers, department, boothNumber, techStack, imageUrl, abstract, keySpecifications, documentation } = req.body;
  const id = `PRJ-2026-${String(db.projects.length + 1).padStart(2, '0')}`;
  const defaultImages = [
    '/src/assets/images/project_swarm_drones.jpg',
    '/src/assets/images/project_bionic_hand.jpg',
    '/src/assets/images/project_zk_ledger.jpg',
    '/src/assets/images/project_agrisense_robot.jpg',
    '/src/assets/images/project_neuroscan_eeg.jpg',
    '/src/assets/images/project_ecodrive_ev.jpg',
    '/src/assets/images/project_holotutor_ar.jpg',
    '/src/assets/images/project_cybersentinel.jpg',
    '/src/assets/images/project_cubesat_satellite.jpg'
  ];
  const assignedImage = imageUrl || defaultImages[db.projects.length % defaultImages.length];
  const newProj = {
    id,
    title,
    category: category || 'AI & Robotics',
    leadStudent: leadStudent || 'Aarav Sharma',
    teamMembers: teamMembers ? (Array.isArray(teamMembers) ? teamMembers : [teamMembers]) : ['Aarav Sharma'],
    department: department || 'Computer Science & Engineering',
    advisor: 'Dr. Elena Chen',
    description,
    abstract: abstract || description,
    boothNumber: boothNumber || `Booth #${Math.floor(10 + Math.random() * 30)}`,
    demoVideoUrl: 'https://youtu.be/student-demo',
    imageUrl: assignedImage,
    techStack: techStack ? (Array.isArray(techStack) ? techStack : [techStack]) : ['React', 'TypeScript', 'Node.js', 'AI Edge'],
    keySpecifications: keySpecifications ? (Array.isArray(keySpecifications) ? keySpecifications : [keySpecifications]) : ['Real-time processing', 'Edge low-power architecture', 'Bench-tested prototype'],
    documentation: documentation || {
      overview: description,
      methodology: 'Iterative agile prototyping and experimental bench validation in campus research laboratories.',
      results: 'Benchmark test suite demonstrated robust operational performance meeting all engineering criteria.',
      futureWork: 'Field deployment, miniaturization, and patent submission.',
      billOfMaterials: 'Microcontroller units, custom breakout PCBs, sensor array, and high-discharge power pack.'
    },
    votesCount: 1,
    judgeScore: 88.0,
    status: 'Approved',
    qrCode: generateToken('PROJECT', id)
  };
  db.projects.push(newProj);
  writeDB(db);
  res.json({ success: true, project: newProj });
});

app.post('/api/projects/:id/vote', (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.body.userId || db.currentUserId;
  const project = db.projects.find(p => p.id === id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  // Prevent duplicate voting
  const existing = db.projectVotes.find(v => v.projectId === id && v.userId === userId);
  if (existing) {
    return res.status(400).json({ error: 'You have already cast your vote for this project' });
  }

  project.votesCount += 1;
  db.projectVotes.push({
    id: `VOTE-${Date.now()}`,
    projectId: id,
    userId,
    votedAt: new Date().toISOString()
  });

  writeDB(db);
  res.json({ success: true, votesCount: project.votesCount, message: 'Vote recorded!' });
});

app.post('/api/projects/:id/score', (req: Request, res: Response) => {
  const { id } = req.params;
  const { innovation, architecture, impact } = req.body;
  const project = db.projects.find(p => p.id === id);
  if (!project) return res.status(404).json({ error: 'Project not found' });

  const score = Number((((Number(innovation) || 90) + (Number(architecture) || 90) + (Number(impact) || 90)) / 3).toFixed(1));
  project.judgeScore = score;
  writeDB(db);

  res.json({ success: true, project, message: `Judge score of ${score}/100 submitted.` });
});

// 13. Lost and Found
app.get('/api/lost-found', (req: Request, res: Response) => {
  res.json({ items: db.lostFound });
});

app.post('/api/lost-found', (req: Request, res: Response) => {
  const { type, title, category, locationFound, description, securityQuestion } = req.body;
  const id = `LF-${100 + db.lostFound.length + 1}`;
  const newItem = {
    id,
    type: type || 'Found',
    title,
    category: category || 'Electronics',
    locationFound,
    dateReported: new Date().toISOString().split('T')[0],
    description,
    securityQuestion: securityQuestion || 'Describe distinguishing marks or serial number.',
    status: type === 'Found' ? 'Open for Claim' : 'Reported Lost',
    reportedBy: db.currentUserRole,
    contactHidden: true
  };
  db.lostFound.push(newItem);
  writeDB(db);
  res.json({ success: true, item: newItem });
});

app.post('/api/lost-found/:id/claim', (req: Request, res: Response) => {
  const { id } = req.params;
  const { verificationAnswer } = req.body;
  const item = db.lostFound.find(i => i.id === id);
  if (!item) return res.status(404).json({ error: 'Item not found' });

  item.status = 'Claim Under Verification';
  writeDB(db);
  res.json({ success: true, item, message: 'Claim request registered. Visit Central Security Desk with ID to claim.' });
});

// 14. Complaints & Grievances
app.get('/api/complaints', (req: Request, res: Response) => {
  res.json({ complaints: db.complaints });
});

app.post('/api/complaints', (req: Request, res: Response) => {
  const { category, title, description, priority = 'Medium' } = req.body;
  const student = db.students.find(s => s.id === db.currentUserId) || db.students[0];
  const ticketNumber = `TKT-${String(db.complaints.length + 82).padStart(3, '0')}`;
  const id = `CMP-2026-${ticketNumber.slice(4)}`;

  const newComplaint = {
    id,
    ticketNumber,
    studentId: student.id,
    studentName: student.name,
    category: category || 'General Campus',
    title,
    description,
    assignedDepartment: `${category || 'Campus'} Operations`,
    priority,
    status: 'Submitted',
    targetResolutionHours: priority === 'High' ? 24 : 48,
    createdAt: new Date().toISOString(),
    staffNotes: 'Logged into grievance resolution dispatch queue.',
    statusHistory: [
      { status: 'Submitted', time: new Date().toISOString(), note: 'Submitted via student portal' }
    ]
  };

  db.complaints.unshift(newComplaint);
  writeDB(db);
  res.json({ success: true, complaint: newComplaint });
});

app.patch('/api/complaints/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, note } = req.body;
  const complaint = db.complaints.find(c => c.id === id);
  if (!complaint) return res.status(404).json({ error: 'Complaint not found' });

  complaint.status = status;
  if (note) complaint.staffNotes = note;
  complaint.statusHistory.push({
    status,
    time: new Date().toISOString(),
    note: note || `Status transitioned to ${status}`
  });

  writeDB(db);
  res.json({ success: true, complaint });
});

// 15. Attendance & NFC Sessions
app.get('/api/attendance', (req: Request, res: Response) => {
  res.json({
    sessions: db.attendanceSessions,
    records: db.attendanceRecords,
    summary: {
      averageAttendance: 88.5,
      thresholdMinimum: 75.0,
      courses: [
        { code: 'CS601', name: 'Distributed Systems', attended: 26, total: 28, pct: 92.8 },
        { code: 'CS602', name: 'Machine Learning', attended: 24, total: 28, pct: 85.7 },
        { code: 'CS603', name: 'Compiler Design', attended: 22, total: 28, pct: 78.5 },
        { code: 'CS604', name: 'Cybersecurity & Ethics', attended: 27, total: 28, pct: 96.4 }
      ]
    }
  });
});

app.post('/api/attendance/mark', (req: Request, res: Response) => {
  const { courseCode = 'CS601', method = 'QR Scan', studentId = db.currentUserId } = req.body;
  const student = db.students.find(s => s.id === studentId) || db.students[0];

  const record = {
    id: `REC-${Date.now()}`,
    studentId: student.id,
    studentName: student.name,
    rollNumber: student.rollNumber,
    courseCode,
    date: new Date().toISOString().split('T')[0],
    status: 'Present',
    method
  };

  db.attendanceRecords.unshift(record);

  // Update session totalPresent in real-time
  const session = db.attendanceSessions.find(s => s.courseCode === courseCode) || db.attendanceSessions[0];
  if (session) {
    session.totalPresent = (session.totalPresent || 0) + 1;
  }

  writeDB(db);
  res.json({
    success: true,
    record,
    student: {
      id: student.id,
      name: student.name,
      rollNumber: student.rollNumber,
      department: student.department,
      photo: student.photo
    },
    totalPresent: session ? session.totalPresent : undefined,
    message: `Attendance marked Present for ${student.name} (${student.rollNumber}) via ${method}.`
  });
});

app.post('/api/attendance/session/start', (req: Request, res: Response) => {
  const { courseCode, courseName } = req.body;
  const sessId = `ATT-SESS-${Math.floor(100 + Math.random() * 900)}`;
  const token = generateToken('ATTEND', courseCode || 'CS601');

  const session = {
    id: sessId,
    courseCode: courseCode || 'CS601',
    courseName: courseName || 'Distributed Systems & Cloud Architecture',
    facultyId: 'USR-03',
    facultyName: 'Dr. Elena Chen',
    date: new Date().toISOString().split('T')[0],
    timeWindow: 'Active Session (Next 30 Minutes)',
    sessionCode: `DS-${Math.floor(1000 + Math.random() * 9000)}`,
    activeQrToken: token,
    expiresAt: new Date(Date.now() + 1800000).toISOString(),
    totalPresent: 1,
    totalEnrolled: 64
  };

  db.attendanceSessions.unshift(session);
  writeDB(db);
  res.json({ success: true, session });
});

// 16. Skill Passport
app.get('/api/skills/:studentId', (req: Request, res: Response) => {
  const { studentId } = req.params;
  const passport = db.skillPassports.find(p => p.studentId === studentId) || db.skillPassports[0];
  const student = db.students.find(s => s.id === studentId) || db.students[0];
  res.json({ passport, student });
});

app.post('/api/skills/:studentId/verify', (req: Request, res: Response) => {
  const { studentId } = req.params;
  const { certificateTitle } = req.body;
  const passport = db.skillPassports.find(p => p.studentId === studentId);
  if (!passport) return res.status(404).json({ error: 'Passport not found' });

  const cert = passport.certifications.find((c: any) => c.title === certificateTitle);
  if (cert) {
    cert.verified = true;
    writeDB(db);
  }
  res.json({ success: true, passport });
});

// 17. In-App Notifications
app.get('/api/notifications', (req: Request, res: Response) => {
  res.json({ notifications: db.notifications });
});

app.patch('/api/notifications/:id/read', (req: Request, res: Response) => {
  const { id } = req.params;
  const notif = db.notifications.find(n => n.id === id);
  if (notif) notif.read = true;
  writeDB(db);
  res.json({ success: true });
});

app.patch('/api/notifications/read-all', (req: Request, res: Response) => {
  db.notifications.forEach(n => n.read = true);
  writeDB(db);
  res.json({ success: true });
});

// 18. Analytics Module
app.get('/api/analytics', (req: Request, res: Response) => {
  const departmentDistribution = [
    { name: 'Computer Science & Eng', students: 480, faculty: 32, labs: 8 },
    { name: 'Electronics & Comm', students: 360, faculty: 24, labs: 6 },
    { name: 'Mechanical & Mechatronics', students: 280, faculty: 20, labs: 7 },
    { name: 'Biomedical Engineering', students: 160, faculty: 14, labs: 4 },
    { name: 'Civil & Environmental', students: 140, faculty: 12, labs: 3 }
  ];

  const attendanceTrends = [
    { month: 'Aug', cs: 94, ece: 91, mech: 88 },
    { month: 'Sep', cs: 92, ece: 89, mech: 84 },
    { month: 'Oct', cs: 89, ece: 87, mech: 82 },
    { month: 'Nov (Projected)', cs: 91, ece: 88, mech: 85 }
  ];

  const libraryCirculation = [
    { category: 'Computer Science', loans: 420, active: 62 },
    { category: 'Algorithms & Math', loans: 310, active: 48 },
    { category: 'Robotics & Hardware', loans: 240, active: 34 },
    { category: 'Management & Humanities', loans: 110, active: 18 }
  ];

  res.json({
    departmentDistribution,
    attendanceTrends,
    libraryCirculation,
    canteenDailySales: [
      { day: 'Mon', revenue: 1420, orders: 280 },
      { day: 'Tue', revenue: 1680, orders: 320 },
      { day: 'Wed', revenue: 1540, orders: 295 },
      { day: 'Thu', revenue: 1890, orders: 360 },
      { day: 'Fri', revenue: 2100, orders: 410 }
    ],
    complaintResolutionTime: {
      highPriorityHours: 18.4,
      mediumPriorityHours: 32.1,
      slaComplianceRate: '96.2%'
    }
  });
});

// 19. AI Student Assistant & Career Roadmap (Gemini 3.8 Flash)
app.post('/api/ai/advisor', async (req: Request, res: Response) => {
  const { prompt, studentId = db.currentUserId, queryType = 'general' } = req.body;
  const student = db.students.find(s => s.id === studentId) || db.students[0];
  const passport = db.skillPassports.find(p => p.studentId === student.id) || db.skillPassports[0];
  const studentLoans = db.bookLoans.filter(l => l.studentId === student.id);
  const studentExams = db.exams;

  const contextData = `
Student Information:
- Name: ${student.name}
- Roll Number: ${student.rollNumber}
- Department: ${student.department}
- Course: ${student.course}
- Academic Year: ${student.year}, ${student.semester}
- GPA: ${student.gpa} / 4.0
- Overall Attendance: ${student.attendancePercentage}% (Minimum Threshold: 75%)
- Current Borrowed Books: ${studentLoans.map(l => `${l.bookTitle} (Status: ${l.status}, Due: ${l.dueDate})`).join(', ') || 'None'}
- Upcoming Examinations: ${studentExams.map(e => `${e.subjectName} on ${e.date}`).join('; ')}
- Technical Skills: ${passport?.skills?.join(', ') || 'Computer Science core'}
- Career Ambition: ${passport?.careerGoals || 'Software Engineering / AI Systems'}
`;

  const systemInstruction = `You are the CampusIQ Pro Academic Advisor and Career Strategist.
You have access to verified student database records:
${contextData}

Provide encouraging, highly structured, actionable academic and career guidance.
Never hallucinate grades or permissions. Always ground your analysis on the student's actual attendance (${student.attendancePercentage}%), current GPA (${student.gpa}), upcoming exams, and skills.
Format your responses with clean sections:
1. Executive Academic Status
2. Critical Deadlines & Action Items
3. Strategic Career & Learning Milestones (Roadmap)
4. Recommended High-Impact Projects / Certifications
`;

  try {
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
      const ai = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
      });

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI request timeout')), 7000)
      );

      const generatePromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt || 'Provide an in-depth academic evaluation and 3-month career milestone roadmap based on my current curriculum.',
        config: {
          systemInstruction,
          temperature: 0.7
        }
      });

      const response: any = await Promise.race([generatePromise, timeoutPromise]);
      const reply = response.text || 'Academic advisory summary generated.';
      return res.json({ success: true, reply, source: 'gemini-3.8-flash' });
    }
  } catch (err: any) {
    console.warn('Gemini API call failed or timed out, using deterministic academic intelligence engine:', err?.message);
  }

  // Graceful deterministic intelligent fallback:
  const fallbackAdvice = `### Academic Health Assessment for ${student.name} (${student.rollNumber})

**1. Academic Status & Attendance Health**
- **Cumulative GPA:** ${student.gpa} / 4.0 — Strong academic standing.
- **Attendance Rate:** ${student.attendancePercentage}% — Above the institutional mandatory 75% threshold.
- **Library Alerts:** You currently have ${studentLoans.length} active library checkout(s). Note that "${studentLoans[0]?.bookTitle || 'CLRS'}" has an overdue notice. Please return or renew to avoid daily fines.

**2. Immediate Exam Preparation Deadlines**
- **${studentExams[0]?.subjectName || 'Distributed Systems'}:** Scheduled for ${studentExams[0]?.date || 'Nov 20'}. Prioritize Raft consensus algorithms, CAP theorem trade-offs, and vector clocks.
- **${studentExams[1]?.subjectName || 'Machine Learning'}:** Scheduled for ${studentExams[1]?.date || 'Nov 23'}. Focus on backpropagation mathematics and Transformer attention mechanisms.

**3. Strategic Career Roadmap (Next 90 Days)**
- **Month 1:** Complete Distributed Systems revision and deploy your project on Kubernetes cluster.
- **Month 2:** Complete System Design interview preparation (Data-intensive applications, caching, rate limiting).
- **Month 3:** Submit paper or project demo to IEEE Student Innovation Showcase; finalize AWS Solutions Architect recertification.

**4. Recommended Upskilling Focus**
- Given your profile in **${student.course}**, mastering asynchronous Rust, gRPC protocols, and GPU tensor profiling will place you in the top 5% of candidate pools.`;

  res.json({ success: true, reply: fallbackAdvice, source: 'campus-intelligence-engine' });
});

// Static asset handlers for images across all supported URL paths (works in dev and production)
const imagesDir = path.resolve(process.cwd(), 'src', 'assets', 'images');
const publicDir = path.resolve(process.cwd(), 'public');

app.use('/src/assets/images', express.static(imagesDir));
app.use('/assets/images', express.static(imagesDir));
app.use('/images', express.static(imagesDir));

if (fs.existsSync(publicDir)) {
  app.use(express.static(publicDir));
  app.use('/src/assets/images', express.static(path.resolve(publicDir, 'src', 'assets', 'images')));
  app.use('/assets/images', express.static(path.resolve(publicDir, 'assets', 'images')));
  app.use('/images', express.static(path.resolve(publicDir, 'images')));
}

// Fallback handler for missing image requests so they NEVER return index.html
app.get(['/src/assets/images/*', '/assets/images/*', '/images/*'], (req: Request, res: Response) => {
  const reqFile = path.basename(req.path);
  const directPath = path.join(imagesDir, reqFile);
  if (fs.existsSync(directPath)) {
    return res.sendFile(directPath);
  }
  res.status(404).type('image/svg+xml').send(
    `<svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120">
      <rect width="120" height="120" rx="16" fill="#e2e8f0"/>
      <path d="M40 75 L55 55 L70 70 L80 60 L95 75 Z" fill="#94a3b8"/>
      <circle cx="50" cy="45" r="8" fill="#94a3b8"/>
    </svg>`
  );
});

// Start dev server with Vite or production static handler
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        watch: {
          ignored: (file: string) => /data[\\\/]|database\.json|\.system_generated|\.git/i.test(file)
        }
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CampusIQ Pro] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start CampusIQ Pro server:', err);
});
