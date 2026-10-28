/**
 * CampusIQ Pro — Collapsible Sidebar Navigation
 * Clear category groups with emerald green / warm cream highlights.
 */

import React from 'react';
import {
  LayoutDashboard,
  CreditCard,
  QrCode,
  CalendarCheck2,
  FileSpreadsheet,
  BookOpen,
  Cpu,
  Ticket,
  UtensilsCrossed,
  DoorOpen,
  Car,
  Lightbulb,
  SearchCheck,
  MessageSquareWarning,
  Sparkles,
  BarChart3,
  ShieldCheck,
  Award,
  Box,
  Layers,
  Compass
} from 'lucide-react';
import { UserRole } from '../types/campus';

export type NavTab =
  | 'cover'
  | 'dashboard'
  | 'campus-3d'
  | 'exam-hall-3d'
  | 'library-3d'
  | 'students'
  | 'qr-verifier'
  | 'attendance'
  | 'exams'
  | 'library'
  | 'lab'
  | 'events'
  | 'canteen'
  | 'gatepass'
  | 'parking'
  | 'projects'
  | 'lost-found'
  | 'complaints'
  | 'skills'
  | 'ai-advisor'
  | 'analytics'
  | 'roles';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpen: boolean;
  onToggle: () => void;
  userRole: UserRole;
}

interface NavItem {
  id: NavTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpen,
  onToggle,
  userRole,
}) => {
  const sections: NavSection[] = [
    {
      title: 'Exhibition & Overview',
      items: [
        { id: 'cover', label: 'Project Cover Page', icon: Award, badge: '2026' },
      ],
    },
    {
      title: '3D Virtual Campus',
      items: [
        { id: 'campus-3d', label: '3D Campus Digital Twin', icon: Box, badge: 'Three.js' },
        { id: 'exam-hall-3d', label: '3D Exam Hall Planner', icon: Layers, badge: '3D Desks' },
        { id: 'library-3d', label: '3D Library & Lab Walk', icon: Compass, badge: 'Interactive' },
      ],
    },
    {
      title: 'Core Management',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'students', label: 'Students & Digital ID', icon: CreditCard },
        { id: 'qr-verifier', label: 'Universal QR Center', icon: QrCode, badge: 'Live' },
        { id: 'attendance', label: 'Attendance & NFC', icon: CalendarCheck2 },
      ],
    },
    {
      title: 'Academic Modules',
      items: [
        { id: 'exams', label: 'Exams & Hall Tickets', icon: FileSpreadsheet },
        { id: 'library', label: 'Smart Library', icon: BookOpen },
        { id: 'lab', label: 'Lab Equipment Tracking', icon: Cpu },
      ],
    },
    {
      title: 'Campus Life & Services',
      items: [
        { id: 'events', label: 'Events & Entry Passes', icon: Ticket },
        { id: 'canteen', label: 'Smart Canteen Ordering', icon: UtensilsCrossed },
        { id: 'gatepass', label: 'Gate Pass & Visitors', icon: DoorOpen },
        { id: 'parking', label: 'Smart Parking', icon: Car },
      ],
    },
    {
      title: 'Innovation & Student Affairs',
      items: [
        { id: 'projects', label: 'Project Expo & Voting', icon: Lightbulb },
        { id: 'skills', label: 'Skill Passport', icon: Award },
        { id: 'lost-found', label: 'Lost & Found Portal', icon: SearchCheck },
        { id: 'complaints', label: 'Complaints Tracker', icon: MessageSquareWarning },
      ],
    },
    {
      title: 'Intelligence & Administration',
      items: [
        { id: 'ai-advisor', label: 'AI Student Advisor', icon: Sparkles, badge: 'Gemini 3.8' },
        { id: 'analytics', label: 'Campus Analytics', icon: BarChart3 },
        { id: 'roles', label: 'Role & Permissions (RBAC)', icon: ShieldCheck },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 bg-stone-900/40 z-40 lg:hidden backdrop-blur-xs"
        />
      )}

      <aside
        className={`fixed lg:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 bg-stone-50 border-r border-stone-200/80 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {sections.map(section => (
            <div key={section.title}>
              <h5 className="px-3 text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5">
                {section.title}
              </h5>
              <div className="space-y-0.5">
                {section.items.map(item => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        if (window.innerWidth < 1024) onToggle();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-emerald-800 text-white shadow-xs font-semibold'
                          : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-stone-500'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                            isActive
                              ? 'bg-emerald-900 text-emerald-200'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer info in sidebar */}
        <div className="p-3 bg-stone-100/70 border-t border-stone-200/70 text-[11px] text-stone-500 flex items-center justify-between">
          <span className="truncate">Active: <strong className="text-stone-700">{userRole}</strong></span>
          <span className="font-mono text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">v2.6 PRO</span>
        </div>
      </aside>
    </>
  );
};
