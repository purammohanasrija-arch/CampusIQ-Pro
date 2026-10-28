/**
 * CampusIQ Pro — Top Navigation Bar
 * Follows the 3-Zone contract with global search, notifications, active role switcher, and scanner shortcut.
 */

import React, { useState } from 'react';
import {
  QrCode,
  Bell,
  Search,
  Check,
  ChevronDown,
  Sparkles,
  Shield,
  GraduationCap,
  ArrowRight,
  LogOut
} from 'lucide-react';
import { UserRole, NotificationItem } from '../types/campus';

interface NavbarProps {
  currentRole: UserRole;
  userName: string;
  notifications: NotificationItem[];
  onOpenScanner: () => void;
  onOpenRoleSwitcher: () => void;
  onOpenSearch: () => void;
  onSelectNotification: (actionUrl: string, id: string) => void;
  onMarkAllNotificationsRead: () => void;
  onOpenCover?: () => void;
  onOpenDashboard?: () => void;
  onLogout?: () => void;
  currentTab?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  userName,
  notifications,
  onOpenScanner,
  onOpenRoleSwitcher,
  onOpenSearch,
  onSelectNotification,
  onMarkAllNotificationsRead,
  onOpenCover,
  onOpenDashboard,
  onLogout,
  currentTab,
}) => {
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 h-16 bg-white/95 backdrop-blur-md border-b border-stone-200 px-4 lg:px-8 flex items-center justify-between gap-4">
      {/* Zone 1: Brand & Search */}
      <div className="flex items-center gap-6">
        <button
          onClick={onOpenCover}
          className="flex items-center gap-2.5 text-left group cursor-pointer"
          title="Return to Exhibition Cover Page"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-xs group-hover:bg-emerald-700 transition-colors">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-bold text-stone-900 tracking-tight block leading-tight">
              CampusIQ <span className="text-emerald-700">Pro</span>
            </span>
            <span className="text-[10px] text-stone-500 font-medium hidden sm:inline">Exhibition 2026 Edition</span>
          </div>
        </button>

        {/* Global Search trigger */}
        <button
          onClick={onOpenSearch}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 text-xs text-stone-400 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors w-64 text-left"
        >
          <Search className="w-3.5 h-3.5 text-stone-400" />
          <span className="flex-1 truncate">Search students, events, books...</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white border border-stone-300 rounded text-stone-500">⌘K</kbd>
        </button>
      </div>

      {/* Zone 2 & 3: Actions, Notifications & Active Role */}
      <div className="flex items-center gap-3">
        {/* Cover Page or Dashboard Link */}
        {currentTab === 'cover' ? (
          onOpenDashboard && (
            <button
              onClick={onOpenDashboard}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-xs transition-all active:scale-95"
              title="Enter Smart Campus Management Dashboard"
            >
              <span>Enter Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )
        ) : (
          onOpenCover && (
            <button
              onClick={onOpenCover}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold border border-stone-200 transition-colors"
              title="Return to Exhibition Cover Page"
            >
              <span>Cover Page</span>
            </button>
          )
        )}

        {/* QR Scanner trigger */}
        <button
          onClick={onOpenScanner}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          <QrCode className="w-4 h-4" />
          <span className="hidden sm:inline">Universal QR Scan</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative p-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full" />
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-stone-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="flex items-center justify-between px-4 py-2 border-b border-stone-100">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-stone-900">Campus Alerts</span>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 text-[10px] font-semibold rounded">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => {
                      onMarkAllNotificationsRead();
                      setShowNotifMenu(false);
                    }}
                    className="text-[11px] text-emerald-700 hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-stone-100">
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-xs text-stone-400">No current notifications</div>
                ) : (
                  notifications.map(item => (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectNotification(item.actionUrl, item.id);
                        setShowNotifMenu(false);
                      }}
                      className={`w-full text-left p-3 hover:bg-stone-50 transition-colors flex items-start gap-2.5 ${
                        !item.read ? 'bg-amber-50/40' : ''
                      }`}
                    >
                      <div className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-stone-900 truncate">{item.title}</p>
                        <p className="text-[11px] text-stone-500 line-clamp-2 mt-0.5">{item.message}</p>
                        <span className="text-[10px] text-stone-400 mt-1 block">{item.timestamp}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Role Switcher Pill */}
        <button
          onClick={onOpenRoleSwitcher}
          className="flex items-center gap-2 pl-2.5 pr-3 py-1.5 bg-stone-100 hover:bg-stone-200/80 border border-stone-200 rounded-lg text-xs font-medium text-stone-800 transition-colors"
          title="Switch User Role to view RBAC permissions"
        >
          <Shield className="w-3.5 h-3.5 text-emerald-700" />
          <div className="text-left hidden sm:block">
            <span className="font-bold text-stone-900 block text-[11px] leading-tight truncate max-w-[120px]">
              {userName}
            </span>
            <span className="text-[10px] text-emerald-800 font-medium block leading-tight">
              {currentRole}
            </span>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
        </button>

        {/* Sign Out / Exit to Login */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="p-2 rounded-lg text-stone-500 hover:text-rose-600 hover:bg-rose-50 border border-stone-200 hover:border-rose-200 transition-colors shrink-0 cursor-pointer"
            title="Lock session & return to Institutional Login Page"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>
    </header>
  );
};
