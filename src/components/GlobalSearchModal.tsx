/**
 * CampusIQ Pro — Global Search & Command Palette (Cmd+K)
 * Fast search across students, events, books, lab equipment, exams, and module tabs.
 */

import React, { useState, useEffect } from 'react';
import { Search, X, ArrowRight, CreditCard, Ticket, BookOpen, Cpu, Calendar, LayoutDashboard } from 'lucide-react';
import { NavTab } from './Sidebar';
import { Student, CampusEvent, LibraryBook, LabEquipment } from '../types/campus';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: NavTab) => void;
  students: Student[];
  events: CampusEvent[];
  books: LibraryBook[];
  equipment: LabEquipment[];
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  students,
  events,
  books,
  equipment,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  const allModules: Array<{ label: string; tab: NavTab; desc: string }> = [
    { label: 'Dashboard & KPI Overview', tab: 'dashboard', desc: 'Campus stats, recent logs, announcements' },
    { label: 'Students & Digital ID Cards', tab: 'students', desc: 'Roster, NFC tags, flip 3D digital smart cards' },
    { label: 'Universal QR Verification Center', tab: 'qr-verifier', desc: 'Real-time token validation & audit trail' },
    { label: 'Classroom Attendance & NFC', tab: 'attendance', desc: 'Dynamic QR sessions, course health thresholds' },
    { label: 'Examination Timetable & Hall Tickets', tab: 'exams', desc: 'Admit cards, seat charts, reporting schedules' },
    { label: 'Smart Library Catalog', tab: 'library', desc: 'Book loans, QR barcode checkout, overdue fines' },
    { label: 'Laboratory Equipment Tracking', tab: 'lab', desc: 'Asset checkouts, condition maintenance' },
    { label: 'Campus Events & QR Passes', tab: 'events', desc: 'Symposiums, hackathons, duplicate-free entry' },
    { label: 'Smart Canteen Ordering', tab: 'canteen', desc: 'Menu bowls, wallet payment, pickup token QR' },
    { label: 'Gate Pass & Visitor Management', tab: 'gatepass', desc: 'Single-use leave passes, campus visitor badges' },
    { label: 'Smart Parking Allocation', tab: 'parking', desc: 'Zone A & B slots, EV chargers, QR vehicle permits' },
    { label: 'Project Exhibition & Live Voting', tab: 'projects', desc: 'Capstone expo, booth placards, judge scores' },
    { label: 'Campus Lost & Found Portal', tab: 'lost-found', desc: 'Misplaced items, ownership verification' },
    { label: 'Complaints & Grievance Tracker', tab: 'complaints', desc: 'SLA target hours, technician logs' },
    { label: 'Student Skill Passport', tab: 'skills', desc: 'Verified credentials, hackathon wins, public links' },
    { label: 'AI Student Advisor (Gemini 3.8)', tab: 'ai-advisor', desc: 'Curriculum guidance & career milestones' },
    { label: 'Campus Analytics & CSV Reports', tab: 'analytics', desc: 'Departmental trends & attendance velocity' },
  ];

  const matchingModules = allModules.filter(m => !q || m.label.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q));

  const matchingStudents = students.filter(s =>
    !q ? false : s.name.toLowerCase().includes(q) || s.rollNumber.toLowerCase().includes(q) || s.department.toLowerCase().includes(q)
  );

  const matchingEvents = events.filter(e =>
    !q ? false : e.title.toLowerCase().includes(q) || e.category.toLowerCase().includes(q)
  );

  const matchingBooks = books.filter(b =>
    !q ? false : b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || b.isbn.includes(q)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-stone-200 flex flex-col max-h-[75vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-stone-200 flex items-center gap-3 bg-stone-50/80">
          <Search className="w-5 h-5 text-stone-400 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command, student, event, book, or module..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full text-xs bg-transparent border-none focus:outline-hidden text-stone-900 placeholder:text-stone-400"
          />
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs">
          {/* Modules */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-2 block mb-1">
              CampusIQ Navigation Modules
            </span>
            <div className="space-y-0.5">
              {matchingModules.slice(0, 6).map(mod => (
                <button
                  key={mod.tab}
                  onClick={() => {
                    onNavigate(mod.tab);
                    onClose();
                  }}
                  className="w-full p-2.5 rounded-lg hover:bg-emerald-50 text-left flex items-center justify-between text-stone-700 hover:text-emerald-900 transition-colors group"
                >
                  <div>
                    <strong className="block text-stone-900 group-hover:text-emerald-950 font-semibold">{mod.label}</strong>
                    <span className="text-[11px] text-stone-500">{mod.desc}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-stone-300 group-hover:text-emerald-700 shrink-0" />
                </button>
              ))}
            </div>
          </div>

          {/* Student Matches */}
          {matchingStudents.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-2 block mb-1">
                Matching Student Records
              </span>
              <div className="space-y-0.5">
                {matchingStudents.map(stu => (
                  <button
                    key={stu.id}
                    onClick={() => {
                      onNavigate('students');
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-lg hover:bg-emerald-50 text-left flex items-center justify-between text-stone-700 hover:text-emerald-900 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-800 shrink-0" />
                      <div>
                        <strong className="text-stone-900">{stu.name}</strong>
                        <span className="text-stone-500 ml-1.5 font-mono">({stu.rollNumber})</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-stone-400">{stu.department}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Event Matches */}
          {matchingEvents.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-2 block mb-1">
                Matching Events
              </span>
              <div className="space-y-0.5">
                {matchingEvents.map(evt => (
                  <button
                    key={evt.id}
                    onClick={() => {
                      onNavigate('events');
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-lg hover:bg-emerald-50 text-left flex items-center justify-between text-stone-700 hover:text-emerald-900 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-amber-700 shrink-0" />
                      <div>
                        <strong className="text-stone-900">{evt.title}</strong>
                        <span className="text-stone-500 ml-1.5 font-mono text-[10px]">{evt.date}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-stone-400">{evt.venue}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Book Matches */}
          {matchingBooks.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 px-2 block mb-1">
                Matching Library Books
              </span>
              <div className="space-y-0.5">
                {matchingBooks.map(bk => (
                  <button
                    key={bk.id}
                    onClick={() => {
                      onNavigate('library');
                      onClose();
                    }}
                    className="w-full p-2.5 rounded-lg hover:bg-emerald-50 text-left flex items-center justify-between text-stone-700 hover:text-emerald-900 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-emerald-800 shrink-0" />
                      <div>
                        <strong className="text-stone-900">{bk.title}</strong>
                        <span className="text-stone-500 ml-1.5 text-[11px]">{bk.author}</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-stone-400">{bk.shelfLocation}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 text-[11px] text-stone-400 flex items-center justify-between">
          <span>Navigate with mouse or arrow keys</span>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white border border-stone-300 rounded">ESC</kbd>
            <span>to dismiss</span>
          </div>
        </div>
      </div>
    </div>
  );
};
