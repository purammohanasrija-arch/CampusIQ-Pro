/**
 * CampusIQ Pro — Role-Based Access Control (RBAC) & Persona Switcher
 * Demonstrates role segregation, permissions boundaries, and instant persona switching.
 */

import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  UserCheck,
  Building,
  GraduationCap,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { UserRole } from '../types/campus';
import { api } from '../services/api';

interface RoleSwitcherViewProps {
  currentRole: UserRole;
  onSwitchRole: (role: UserRole) => void;
  onClose?: () => void;
}

interface RoleDefinition {
  role: UserRole;
  department: string;
  description: string;
  permissions: string[];
}

export const RoleSwitcherView: React.FC<RoleSwitcherViewProps> = ({
  currentRole,
  onSwitchRole,
  onClose,
}) => {
  const rolesList: RoleDefinition[] = [
    {
      role: 'Super Administrator',
      department: 'Executive Board',
      description: 'Unrestricted full-system authority across all academic, security, and administrative domains.',
      permissions: ['All System Permissions', 'Manage Roles & Users', 'Audit System Security', 'Delete Records'],
    },
    {
      role: 'College Administrator',
      department: 'Dean of Academic Affairs',
      description: 'Campus-wide governance, student roster management, gate pass approvals, and curriculum oversight.',
      permissions: ['Issue Student IDs', 'Approve Gate Passes', 'Publish Campus Events', 'Oversee Grievances'],
    },
    {
      role: 'Faculty',
      department: 'Computer Science Department',
      description: 'Academic instructor with grading authority, classroom lecture attendance QR generation, and skill verifications.',
      permissions: ['Launch QR Attendance Sessions', 'Verify Student Skill Badges', 'Enter Exam Marks', 'Advise Students'],
    },
    {
      role: 'Student',
      department: 'Undergraduate Engineering',
      description: 'Access to digital student ID, event registrations, library borrowing, canteen ordering, and AI advisor.',
      permissions: ['View Digital ID & Hall Ticket', 'Order Food from Canteen', 'Apply for Gate Passes', 'Cast Expo Vote'],
    },
    {
      role: 'Librarian',
      department: 'Central University Library',
      description: 'Library asset management, book circulation, overdue fine calculations, and catalog acquisitions.',
      permissions: ['Add & Edit Books', 'Scan Book QR to Issue/Return', 'Assess Overdue Fines', 'Manage Reserves'],
    },
    {
      role: 'Lab Technician',
      department: 'Robotics & VLSI Labs',
      description: 'Laboratory inventory maintenance, asset checkout verification, and equipment calibration auditing.',
      permissions: ['Register Lab Assets', 'Approve Checkout Requests', 'Log Maintenance Logs', 'Audit Asset QRs'],
    },
    {
      role: 'Canteen Staff',
      department: 'Campus Dining Services',
      description: 'Kitchen order management, meal preparation updates, and single-use pickup QR redemption.',
      permissions: ['Update Meal Prep Status', 'Scan Pickup Tokens', 'Verify Campus Wallet', 'Manage Menu'],
    },
    {
      role: 'Security Staff',
      department: 'Campus Perimeter Security',
      description: 'Universal pass and ID verification at main gates, vehicle parking barriers, and event entrance scanners.',
      permissions: ['Universal QR Scanner', 'Scan Gate Passes for Exit/Re-entry', 'Verify Student Identity', 'Log Access History'],
    },
    {
      role: 'Event Organizer',
      department: 'Student Affairs & Cultural Council',
      description: 'Event creation, participant registration tracking, and gate entrance pass check-in scanners.',
      permissions: ['Create & Publish Events', 'Scan Attendee Passes', 'Monitor Capacity Limits', 'Generate Reports'],
    },
    {
      role: 'Examination Staff',
      department: 'Controller of Examinations (COE)',
      description: 'Examination schedule coordination, seat assignment, hall ticket issuance, and test hall admissions.',
      permissions: ['Generate Official Hall Tickets', 'Assign Exam Rooms & Desks', 'Verify Exam Eligibility', 'Audit Gate Entry'],
    },
    {
      role: 'Project Judge',
      department: 'Industry Advisory Board',
      description: 'Evaluation of innovation expo capstones using formal rubric criteria for innovation, architecture, and impact.',
      permissions: ['Submit Rubric Scores (0-100)', 'Inspect Capstone Abstract', 'Audit Voting Transparency'],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-stone-200">
        <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
          <span>Role-Based Access Control (RBAC) & Persona Switcher</span>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            11 Standardized Roles
          </span>
        </h2>
        <p className="text-xs text-stone-500 mt-1">
          Test and experience CampusIQ Pro from the perspective of any campus stakeholder. Each role strictly respects least-privilege security boundaries.
        </p>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rolesList.map(item => {
          const isCurrent = currentRole === item.role;

          return (
            <div
              key={item.role}
              onClick={() => onSwitchRole(item.role)}
              className={`p-5 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                isCurrent
                  ? 'border-emerald-700 bg-emerald-50/40 shadow-sm'
                  : 'border-stone-200 bg-white hover:border-emerald-500/50 hover:bg-stone-50/80 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded font-semibold">
                    {item.department}
                  </span>
                  {isCurrent && (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                      <span>Active Role</span>
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-stone-900 mt-1">
                  {item.role}
                </h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                  {item.description}
                </p>

                <div className="mt-4 pt-3 border-t border-stone-200/60">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-1.5">
                    Authorized Permissions:
                  </span>
                  <div className="space-y-1">
                    {item.permissions.map(p => (
                      <div key={p} className="flex items-center gap-1.5 text-[11px] text-stone-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-700 shrink-0" />
                        <span className="truncate">{p}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-stone-200/60">
                <button
                  type="button"
                  className={`w-full py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                    isCurrent
                      ? 'bg-emerald-800 text-white font-bold'
                      : 'bg-stone-100 hover:bg-emerald-50 text-stone-800'
                  }`}
                >
                  <span>{isCurrent ? 'Currently Active' : 'Switch to this Persona'}</span>
                  {!isCurrent && <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
