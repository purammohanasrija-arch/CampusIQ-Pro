/**
 * CampusIQ Pro — Lost & Found Portal
 * Item reporting, automatic category matching, and private security verification questions.
 */

import React, { useState } from 'react';
import {
  SearchCheck,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Shield,
  Clock,
  MapPin,
  Sparkles
} from 'lucide-react';
import { LostFoundItem, UserRole } from '../types/campus';
import { api } from '../services/api';

interface LostFoundViewProps {
  items: LostFoundItem[];
  userRole: UserRole;
  onRefresh: () => void;
}

export const LostFoundView: React.FC<LostFoundViewProps> = ({
  items,
  userRole,
  onRefresh,
}) => {
  const [filterType, setFilterType] = useState<'All' | 'Lost' | 'Found'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [claimModalItem, setClaimModalItem] = useState<LostFoundItem | null>(null);
  const [verificationAnswer, setVerificationAnswer] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);

  const [newReport, setNewReport] = useState({
    type: 'Found' as 'Lost' | 'Found',
    title: '',
    category: 'Electronics',
    locationFound: '',
    description: '',
    securityQuestion: '',
  });

  const filteredItems = items.filter(item => {
    const matchType = filterType === 'All' || item.type === filterType;
    const matchSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.locationFound.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchSearch;
  });

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimModalItem || !verificationAnswer.trim()) return;
    try {
      const res = await api.claimLostFound(claimModalItem.id, verificationAnswer.trim());
      alert(res.message);
      setClaimModalItem(null);
      setVerificationAnswer('');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Claim submission failed');
    }
  };

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReport.title || !newReport.locationFound) return;
    try {
      await api.createLostFound(newReport);
      setShowReportModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Report failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <span>Campus Lost & Found Bulletin</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Privacy-Preserved Verification
            </span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Report misplaced campus valuables, check automated match suggestions, and verify ownership via private security prompts.
          </p>
        </div>

        <button
          onClick={() => setShowReportModal(true)}
          className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Report Lost or Found Item</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search title, description, location..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 text-stone-900"
          />
        </div>

        <div className="flex gap-1.5 p-1 bg-stone-100 rounded-lg w-full sm:w-auto">
          {(['All', 'Found', 'Lost'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilterType(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                filterType === tab
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {tab === 'All' ? 'All Items' : `${tab} Items`}
            </button>
          ))}
        </div>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map(item => {
          const isFound = item.type === 'Found';

          return (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-stone-200 shadow-xs p-5 flex flex-col justify-between hover:border-emerald-600/40 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isFound
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-900'
                    }`}
                  >
                    {item.type}
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">
                    {item.dateReported}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-stone-900">{item.title}</h3>
                <p className="text-xs text-stone-600 mt-1 leading-relaxed">{item.description}</p>

                <div className="mt-3 pt-2 border-t border-stone-100 space-y-1 text-xs text-stone-500">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>Location: <strong className="text-stone-700">{item.locationFound}</strong></span>
                  </div>
                  <p className="text-[11px] text-stone-400">Category: {item.category}</p>
                </div>

                {item.securityQuestion && (
                  <div className="mt-3 p-2.5 bg-stone-50 rounded-lg border border-stone-200/80 text-[11px] text-stone-600">
                    <span className="text-[10px] font-bold uppercase text-stone-400 block mb-0.5">
                      Ownership Verification Prompt:
                    </span>
                    <span className="italic">{item.securityQuestion}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-emerald-800">
                  {item.status}
                </span>

                {isFound && item.status === 'Open for Claim' && (
                  <button
                    onClick={() => setClaimModalItem(item)}
                    className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded text-xs font-semibold shadow-2xs transition-colors"
                  >
                    Claim Ownership
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Claim Modal */}
      {claimModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-sm font-bold text-stone-900 mb-1">Verify Ownership Claim</h3>
            <p className="text-xs text-stone-500 mb-4">
              Item: <strong>{claimModalItem.title}</strong>
            </p>

            <form onSubmit={handleClaim} className="space-y-3 text-xs">
              <div className="p-3 bg-stone-50 rounded-lg text-stone-700 font-medium border border-stone-200">
                <span className="text-[10px] text-stone-400 uppercase font-semibold block mb-1">
                  Required Verification Question:
                </span>
                {claimModalItem.securityQuestion}
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Your Detailed Answer</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide precise details (e.g. wallpaper description, serial digits, custom stickers)..."
                  value={verificationAnswer}
                  onChange={e => setVerificationAnswer(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setClaimModalItem(null)}
                  className="px-4 py-2 text-stone-600 hover:text-stone-900 bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-lg shadow-xs"
                >
                  Submit for Desk Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-sm font-bold text-stone-900 mb-1">Report Item to Campus Bulletin</h3>
            <p className="text-xs text-stone-500 mb-4">
              Logs record to notify students and facilitate safe handover at campus security.
            </p>

            <form onSubmit={handleCreateReport} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Report Type</label>
                  <select
                    value={newReport.type}
                    onChange={e => setNewReport({ ...newReport, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                  >
                    <option value="Found">I Found an Item</option>
                    <option value="Lost">I Lost an Item</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Category</label>
                  <select
                    value={newReport.category}
                    onChange={e => setNewReport({ ...newReport, category: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                  >
                    <option value="Electronics">Electronics / Tablets</option>
                    <option value="Stationery">Stationery & Calculators</option>
                    <option value="Clothing">Jackets & Accessories</option>
                    <option value="Keys & Cards">Keys & Campus IDs</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Item Title / Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sony WH-1000XM5 Black Headphones"
                  value={newReport.title}
                  onChange={e => setNewReport({ ...newReport, title: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Location Discovered or Lost</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Turing Complex 2nd Floor Lounge"
                  value={newReport.locationFound}
                  onChange={e => setNewReport({ ...newReport, locationFound: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">General Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Color, condition, case..."
                  value={newReport.description}
                  onChange={e => setNewReport({ ...newReport, description: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">
                  Private Security Question (Only claimant must answer)
                </label>
                <input
                  type="text"
                  placeholder="e.g. What is inside the zipper pouch?"
                  value={newReport.securityQuestion}
                  onChange={e => setNewReport({ ...newReport, securityQuestion: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 text-stone-600 hover:text-stone-900 bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-lg shadow-xs"
                >
                  Post to Bulletin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
