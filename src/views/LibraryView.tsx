/**
 * CampusIQ Pro — Smart Library Management System
 * Book catalog, QR barcode identification, instant issue/return, automated overdue fine calculation.
 */

import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  QrCode,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Layers,
  DollarSign
} from 'lucide-react';
import { LibraryBook, BookLoan, UserRole } from '../types/campus';
import { QRCodeView } from '../components/QRCodeView';
import { api } from '../services/api';

interface LibraryViewProps {
  books: LibraryBook[];
  loans: BookLoan[];
  userRole: UserRole;
  onRefresh: () => void;
  onVerifyToken: (token: string) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  books,
  loans,
  userRole,
  onRefresh,
  onVerifyToken,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBookForQR, setSelectedBookForQR] = useState<LibraryBook | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    isbn: '',
    publisher: 'Academic Press',
    category: 'Computer Science',
    totalCopies: 8,
    shelfLocation: 'Stack CS-03-A',
  });

  const canManageLibrary =
    userRole === 'Super Administrator' || userRole === 'College Administrator' || userRole === 'Librarian';

  const categories = ['All', 'Computer Science', 'Algorithms', 'Software Engineering', 'Architecture'];

  const filteredBooks = books.filter(b => {
    const matchCat = selectedCategory === 'All' || b.category === selectedCategory;
    const matchSearch =
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.isbn.includes(searchQuery);
    return matchCat && matchSearch;
  });

  const handleIssueBook = async (bookId: string) => {
    setActionLoading(true);
    try {
      await api.issueBook(bookId);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Issue failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReturnBook = async (loanId: string) => {
    setActionLoading(true);
    try {
      const res = await api.returnBook(loanId);
      alert(res.message);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Return failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBook.title || !newBook.author) return;
    try {
      await api.createBook(newBook);
      setShowAddModal(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Book addition failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2">
            <span>Smart Central Library Circulation</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              QR Catalog & Auto-Fines
            </span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Barcode asset indexing, instant self-checkout, automated overdue fine schedules ($2.00/day), and live catalog inventory.
          </p>
        </div>

        {canManageLibrary && (
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Book to Catalog</span>
          </button>
        )}
      </div>

      {/* Active Loans & Overdue Fine Alert */}
      {loans.length > 0 && (
        <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-stone-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-800" />
              <span>Current Borrowed Books & Due Dates</span>
            </h3>
            <span className="text-xs font-mono text-stone-500">{loans.filter(l => l.status !== 'Returned').length} Active Loans</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {loans.map(loan => (
              <div
                key={loan.id}
                className={`p-3.5 rounded-lg border flex flex-col justify-between ${
                  loan.status === 'Overdue'
                    ? 'bg-amber-50/50 border-amber-300'
                    : loan.status === 'Returned'
                    ? 'bg-stone-50 border-stone-200 opacity-60'
                    : 'bg-emerald-50/30 border-emerald-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900 truncate max-w-[220px]">
                      {loan.bookTitle}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        loan.status === 'Overdue'
                          ? 'bg-amber-200 text-amber-900'
                          : loan.status === 'Returned'
                          ? 'bg-stone-200 text-stone-700'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {loan.status}
                    </span>
                  </div>

                  <div className="mt-2 text-[11px] text-stone-500 space-y-0.5">
                    <p>Borrower: <strong className="text-stone-700">{loan.studentName}</strong></p>
                    <p>Due Date: <strong className="text-stone-800 font-mono">{loan.dueDate}</strong></p>
                    {loan.overdueDays > 0 && (
                      <p className="text-amber-800 font-semibold flex items-center gap-1 mt-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                        <span>Overdue by {loan.overdueDays} days · Fine: ${loan.fineAmount.toFixed(2)}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-stone-200/60 flex items-center justify-between">
                  <button
                    onClick={() => onVerifyToken(loan.qrCode)}
                    className="text-[11px] text-stone-500 hover:text-emerald-800 font-mono flex items-center gap-1"
                  >
                    <QrCode className="w-3 h-3" />
                    <span>Scan Token</span>
                  </button>

                  {loan.status !== 'Returned' && (
                    <button
                      onClick={() => handleReturnBook(loan.id)}
                      disabled={actionLoading}
                      className="px-3 py-1 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300 rounded text-xs font-semibold shadow-2xs"
                    >
                      Return Book
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Catalog Search & Category Filters */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by title, author, ISBN..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 text-stone-900"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-emerald-800 text-white'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredBooks.map(book => {
          const isAvailable = book.availableCopies > 0;
          return (
            <div
              key={book.id}
              className="bg-white rounded-xl border border-stone-200 shadow-xs p-4 flex flex-col justify-between hover:border-emerald-600/40 transition-all group"
            >
              <div>
                {/* Book Cover Image */}
                <div className="relative h-48 mb-3 rounded-lg overflow-hidden bg-stone-900 border border-stone-200/60 shadow-xs flex items-center justify-center">
                  <img
                    src={book.coverImage || '/src/assets/images/book_c_programming.svg'}
                    alt={book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e: any) => {
                      e.target.src = '/src/assets/images/book_c_programming.svg';
                    }}
                  />
                  <div className="absolute top-2 left-2">
                    <span className="text-[10px] font-semibold text-white bg-stone-900/80 backdrop-blur-xs px-2 py-0.5 rounded shadow">
                      {book.category}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded shadow ${
                        isAvailable ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                      }`}
                    >
                      {book.availableCopies} / {book.totalCopies} Available
                    </span>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-stone-900 group-hover:text-emerald-900 transition-colors line-clamp-2 leading-tight">
                  {book.title}
                </h4>
                <p className="text-[11px] text-stone-500 mt-1 line-clamp-1">{book.author}</p>

                <div className="mt-3 pt-2 border-t border-stone-100 space-y-1 text-[10px] text-stone-400 font-mono">
                  <p>ISBN: {book.isbn}</p>
                  <p>Location: <strong className="text-stone-700">{book.shelfLocation}</strong></p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedBookForQR(book)}
                  className="p-1.5 text-stone-500 hover:text-emerald-800 hover:bg-emerald-50 rounded transition-colors"
                  title="Generate QR Barcode"
                >
                  <QrCode className="w-4 h-4" />
                </button>

                <button
                  onClick={() => handleIssueBook(book.id)}
                  disabled={!isAvailable || actionLoading}
                  className="flex-1 py-1.5 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white rounded text-xs font-semibold shadow-2xs transition-colors"
                >
                  {isAvailable ? 'Borrow (14 Days)' : 'Reserved / Out'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Book QR Modal */}
      {selectedBookForQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center">
              <span className="text-[10px] font-mono text-emerald-800 uppercase tracking-widest font-semibold">
                Library RFID / QR Label
              </span>
              <h3 className="text-sm font-bold text-stone-900 mt-1">{selectedBookForQR.title}</h3>
              <p className="text-xs text-stone-500">{selectedBookForQR.author}</p>
            </div>

            <QRCodeView
              value={selectedBookForQR.qrCode}
              size={160}
              subtitle={`Shelf: ${selectedBookForQR.shelfLocation} · ISBN: ${selectedBookForQR.isbn}`}
            />

            <div className="flex gap-2">
              <button
                onClick={() => {
                  onVerifyToken(selectedBookForQR.qrCode);
                  setSelectedBookForQR(null);
                }}
                className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg"
              >
                Test Scan Book QR
              </button>
              <button
                onClick={() => setSelectedBookForQR(null)}
                className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Book Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-sm font-bold text-stone-900 mb-1">Add Book to Central Catalog</h3>
            <p className="text-xs text-stone-500 mb-4">
              Indexes book record and generates verifiable physical QR spine label.
            </p>

            <form onSubmit={handleAddBook} className="space-y-3 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1">Book Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Structure and Interpretation of Computer Programs"
                  value={newBook.title}
                  onChange={e => setNewBook({ ...newBook, title: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Author(s)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Harold Abelson, Gerald Jay Sussman"
                  value={newBook.author}
                  onChange={e => setNewBook({ ...newBook, author: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Category</label>
                  <select
                    value={newBook.category}
                    onChange={e => setNewBook({ ...newBook, category: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Algorithms">Algorithms</option>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Architecture">Architecture</option>
                    <option value="Electronics">Electronics</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Total Copies</label>
                  <input
                    type="number"
                    min="1"
                    value={newBook.totalCopies}
                    onChange={e => setNewBook({ ...newBook, totalCopies: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-700 font-medium mb-1">Shelf Location</label>
                  <input
                    type="text"
                    value={newBook.shelfLocation}
                    onChange={e => setNewBook({ ...newBook, shelfLocation: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-medium mb-1">ISBN (Optional)</label>
                  <input
                    type="text"
                    placeholder="978-..."
                    value={newBook.isbn}
                    onChange={e => setNewBook({ ...newBook, isbn: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:bg-white font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-stone-600 hover:text-stone-900 bg-stone-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold rounded-lg shadow-xs"
                >
                  Save to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
