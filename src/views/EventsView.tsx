/**
 * CampusIQ Pro — College Event Management & QR Entry Passes
 * Registration, duplicate prevention, live capacity counters, and entry pass generation.
 */

import React, { useState } from 'react';
import {
  Ticket,
  Plus,
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Star,
  Search,
  Filter
} from 'lucide-react';
import { CampusEvent, EventRegistration, UserRole } from '../types/campus';
import { QRCodeView } from '../components/QRCodeView';
import { api } from '../services/api';

interface EventsViewProps {
  events: CampusEvent[];
  registrations: EventRegistration[];
  userRole: UserRole;
  onRefresh: () => void;
  onVerifyToken: (token: string) => void;
}

export const EventsView: React.FC<EventsViewProps> = ({
  events,
  registrations,
  userRole,
  onRefresh,
  onVerifyToken,
}) => {
  const [selectedPass, setSelectedPass] = useState<EventRegistration | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loadingEventId, setLoadingEventId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = [
    'All',
    'Hackathon',
    'Seminar',
    'Cultural Fest',
    'Career Fair',
    'Esports',
    'Conference',
    'Startup Summit',
    'Stargazing',
    'Sports'
  ];

  const filteredEvents = events.filter(event => {
    const matchesCategory =
      selectedCategory === 'All' ||
      event.category.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch =
      !searchQuery ||
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const [newEvent, setNewEvent] = useState({
    title: '',
    category: 'Hackathon',
    description: '',
    date: '',
    time: '10:00 AM - 04:00 PM',
    venue: '',
    capacity: 100,
    eligibility: 'All Engineering Students',
  });

  const canCreateEvents =
    userRole === 'Super Administrator' || userRole === 'College Administrator' || userRole === 'Event Organizer';

  const handleRegister = async (eventId: string) => {
    setLoadingEventId(eventId);
    try {
      const res = await api.registerEvent(eventId);
      onRefresh();
      setSelectedPass(res.registration);
    } catch (err: any) {
      alert(err.message || 'Registration failed');
    } finally {
      setLoadingEventId(null);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.date || !newEvent.venue) return;
    try {
      await api.createEvent(newEvent);
      setShowCreateModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Event creation failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <span>Campus Events & QR Entry Pass System</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Live Capacity & Check-In
            </span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Automated registration, cryptographically signed entrance tickets, and live duplicate-entry gate enforcement.
          </p>
        </div>

        {canCreateEvents && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Publish New Event</span>
          </button>
        )}
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-stone-200 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search events, venues, keywords..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition-all"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map(cat => {
            const count = cat === 'All' ? events.length : events.filter(e => e.category.toLowerCase().includes(cat.toLowerCase())).length;
            if (cat !== 'All' && count === 0) return null;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'
                }`}
              >
                <span>{cat}</span>
                <span className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-emerald-700 text-white' : 'bg-stone-200 text-stone-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map(event => {
          const userReg = registrations.find(r => r.eventId === event.id);
          const isRegistered = !!userReg;
          const isFull = event.registeredCount >= event.capacity;
          const remaining = Math.max(0, event.capacity - event.registeredCount);

          return (
            <div
              key={event.id}
              className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden flex flex-col justify-between hover:border-emerald-600/40 transition-all"
            >
              <div>
                {/* Image Banner */}
                <div className="relative h-40 bg-stone-100 overflow-hidden">
                  <img
                    src={event.bannerUrl || '/src/assets/images/campus_hero_aerial_1793080116992.jpg'}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-semibold uppercase px-2 py-0.5 rounded">
                    {event.category}
                  </div>
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs text-stone-900 text-[10px] font-bold px-2 py-0.5 rounded shadow-xs">
                    {event.status}
                  </div>
                </div>

                {/* Details */}
                <div className="p-5 space-y-3">
                  <h3 className="text-sm font-bold text-stone-900 leading-snug">
                    {event.title}
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="space-y-1.5 text-xs text-stone-600 pt-2 border-t border-stone-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>{event.date} · {event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span className="truncate">{event.venue}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span className="tabular-nums">
                        <strong>{event.registeredCount}</strong> / {event.capacity} Registered
                        ({remaining} spots left)
                      </span>
                    </div>
                  </div>

                  {/* Progress Capacity Bar */}
                  <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all"
                      style={{ width: `${Math.min(100, (event.registeredCount / event.capacity) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Card Footer / Action */}
              <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[11px] text-stone-400">
                  Admitted: <strong className="text-stone-700 tabular-nums">{event.checkedInCount || 0}</strong>
                </span>

                {isRegistered ? (
                  <button
                    onClick={() => setSelectedPass(userReg)}
                    className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5 text-emerald-700" />
                    <span>View Entry Pass</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleRegister(event.id)}
                    disabled={isFull || loadingEventId === event.id}
                    className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
                  >
                    {loadingEventId === event.id ? 'Registering...' : isFull ? 'Event Full' : 'Register & Get Pass'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center text-stone-500 shadow-xs">
          <Ticket className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-stone-700">No events found</h4>
          <p className="text-xs text-stone-400 mt-1">Try selecting another category or clearing your search query.</p>
        </div>
      )}

      {/* Entry Pass Modal */}
      {selectedPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-emerald-800 p-5 text-white text-center">
              <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-200">
                Official Campus Event Pass
              </span>
              <h3 className="text-base font-bold mt-1">Verified Entry Pass</h3>
              <p className="text-xs text-emerald-100 mt-0.5">Attendee: {selectedPass.studentName}</p>
            </div>

            <div className="p-6 flex flex-col items-center space-y-4">
              <QRCodeView
                value={selectedPass.qrPass}
                size={160}
                subtitle="Present this QR at the venue entrance scanner"
                showDownload={true}
              />

              <div className="w-full space-y-2 text-xs border-t border-stone-100 pt-3">
                <div className="flex justify-between">
                  <span className="text-stone-500">Pass Status:</span>
                  <span
                    className={`font-semibold ${
                      selectedPass.status === 'Checked-In' ? 'text-amber-700' : 'text-emerald-700'
                    }`}
                  >
                    {selectedPass.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Assigned Seat:</span>
                  <span className="font-semibold text-stone-900">{selectedPass.seatNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Registration ID:</span>
                  <span className="font-mono text-stone-600">{selectedPass.id}</span>
                </div>
              </div>

              <div className="w-full flex gap-2 pt-2">
                <button
                  onClick={() => {
                    onVerifyToken(selectedPass.qrPass);
                    setSelectedPass(null);
                  }}
                  className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" />
                  <span>Test Scan Pass</span>
                </button>
                <button
                  onClick={() => setSelectedPass(null)}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Publish Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-sm font-bold text-stone-900 mb-1">Create & Publish Campus Event</h3>
            <p className="text-xs text-stone-500 mb-4">
              Schedule technical symposiums, hackathons, or cultural fests with automated QR access control.
            </p>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Autonomous Robotics Workshop"
                  value={newEvent.title}
                  onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Category</label>
                  <select
                    value={newEvent.category}
                    onChange={e => setNewEvent({ ...newEvent, category: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                  >
                    <option value="Hackathon">Hackathon</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Cultural Fest">Cultural Fest</option>
                    <option value="Career Fair">Career Fair</option>
                    <option value="Esports">Esports</option>
                    <option value="Conference">Conference</option>
                    <option value="Startup Summit">Startup Summit</option>
                    <option value="Stargazing">Stargazing</option>
                    <option value="Sports">Sports</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Capacity</label>
                  <input
                    type="number"
                    required
                    value={newEvent.capacity}
                    onChange={e => setNewEvent({ ...newEvent, capacity: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Event Date</label>
                  <input
                    type="date"
                    required
                    value={newEvent.date}
                    onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Time Window</label>
                  <input
                    type="text"
                    value={newEvent.time}
                    onChange={e => setNewEvent({ ...newEvent, time: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Venue & Hall</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Turing Complex Auditorium"
                  value={newEvent.venue}
                  onChange={e => setNewEvent({ ...newEvent, venue: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief agenda, topics, and rules..."
                  value={newEvent.description}
                  onChange={e => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-stone-600 hover:text-stone-900 bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-lg shadow-xs"
                >
                  Publish Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
