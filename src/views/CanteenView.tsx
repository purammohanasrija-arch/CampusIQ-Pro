/**
 * CampusIQ Pro — Smart Canteen Food Ordering & Real-Time Payment System
 * Features:
 * - 16 Diverse Gourmet Dishes Across 4 Categories with Unique High-Res Food Photography
 * - Interactive Tray & Cart with Live Tax, Discounts, & Special Instructions
 * - Real-Time Multi-Gateway Payment Terminal:
 *   1) Campus Smart ID Wallet (NFC Contactless Smartcard Tap with audio chirp & live balance deduction)
 *   2) Dynamic UPI / QR Scan & Pay (Google Pay / PhonePe / Paytm with live expiry countdown & laser sweep)
 *   3) Credit / Debit Card & Apple Pay with 3D Secure simulation
 *   4) Daily Academic Meal Voucher ($10 student stipend redemption)
 * - Auditory POS Terminal Chime & Real-Time Voice Synthesis Confirmation
 * - Live Kitchen Queue with Multi-Stage Status Tracking & Cryptographic Counter Pickup QR
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  UtensilsCrossed,
  ShoppingBag,
  Plus,
  Minus,
  CheckCircle2,
  Clock,
  QrCode,
  DollarSign,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  CreditCard,
  Smartphone,
  Wallet,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  Flame,
  Heart,
  X,
  Search,
  Check,
  Tag,
  Volume2,
  VolumeX,
  Award,
  Star,
  Lock,
  Receipt,
  Coffee
} from 'lucide-react';
import { CanteenMenuItem, CanteenOrder, UserRole } from '../types/campus';
import { QRCodeView } from '../components/QRCodeView';
import { api } from '../services/api';
import { audioFeedback } from '../utils/audioFeedback';

interface CanteenViewProps {
  menu: CanteenMenuItem[];
  orders: CanteenOrder[];
  userRole: UserRole;
  onRefresh: () => void;
  onVerifyToken: (token: string) => void;
}

export const CanteenView: React.FC<CanteenViewProps> = ({
  menu,
  orders,
  userRole,
  onRefresh,
  onVerifyToken,
}) => {
  // Cart state: itemId -> quantity
  const [cart, setCart] = useState<{ [itemId: string]: number }>({});
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDietary, setSelectedDietary] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  // Modals & Navigation
  const [activePickupPass, setActivePickupPass] = useState<CanteenOrder | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(25);

  // Student Smart Wallet
  const [walletBalance, setWalletBalance] = useState<number>(48.50);

  // Payment Gateway State Machine
  const [paymentMode, setPaymentMode] = useState<'wallet' | 'upi' | 'card' | 'voucher'>('wallet');
  const [paymentStep, setPaymentStep] = useState<'idle' | 'authorizing' | 'success'>('idle');
  const [paymentProgressText, setPaymentProgressText] = useState('Initializing secure gateway...');
  const [completedOrder, setCompletedOrder] = useState<CanteenOrder | null>(null);
  const [upiTimerSeconds, setUpiTimerSeconds] = useState(300); // 5-minute countdown for UPI QR
  const [nfcTapping, setNfcTapping] = useState(false);

  // Card details state
  const [cardDetails, setCardDetails] = useState({
    number: '•••• •••• •••• 4242',
    name: 'AARAV SHARMA',
    expiry: '08/28',
    cvv: '912',
  });

  const canManageKitchen =
    userRole === 'Super Administrator' || userRole === 'College Administrator' || userRole === 'Canteen Staff';

  const categories = ['All', 'Wholesome Bowls', 'Quick Bites', 'Beverages', 'Breakfast & Desserts'];
  const dietaryOptions = ['All', 'High Protein', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Omega-3 Rich'];

  // Load wallet balance from API
  useEffect(() => {
    api.getCanteenMenu().then((res) => {
      if (res.walletBalance !== undefined) {
        setWalletBalance(res.walletBalance);
      }
    }).catch(() => {});
  }, []);

  // UPI countdown timer
  useEffect(() => {
    let interval: any = null;
    if (showPaymentModal && paymentMode === 'upi' && paymentStep === 'idle') {
      interval = setInterval(() => {
        setUpiTimerSeconds((prev) => (prev > 0 ? prev - 1 : 300));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showPaymentModal, paymentMode, paymentStep]);

  // Cart Calculations
  const cartItemCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const cartSubtotal = Object.entries(cart).reduce((total, [id, qty]) => {
    const item = menu.find((m) => m.id === id);
    return total + (item ? item.price * qty : 0);
  }, 0);

  const cartTax = Number((cartSubtotal * 0.08).toFixed(2));
  const cartTotalDue = Number((cartSubtotal + cartTax).toFixed(2));

  const addToCart = (id: string) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const copy = { ...prev };
      if (copy[id] > 1) {
        copy[id] -= 1;
      } else {
        delete copy[id];
      }
      return copy;
    });
  };

  // Filtered Menu
  const filteredMenu = useMemo(() => {
    return menu.filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesDietary =
        selectedDietary === 'All' || item.dietary.toLowerCase().includes(selectedDietary.toLowerCase());
      const matchesSearch =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.dietary.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesDietary && matchesSearch;
    });
  }, [menu, selectedCategory, selectedDietary, searchQuery]);

  // Open Real-time Payment Terminal
  const handleProceedToPayment = () => {
    if (cartItemCount === 0) return;
    setPaymentStep('idle');
    setPaymentMode('wallet');
    setShowPaymentModal(true);
  };

  // Execute Real-Time Payment Flow
  const executeRealTimePayment = async (selectedMethod: string) => {
    setPaymentStep('authorizing');

    // Simulate multi-stage cryptographic payment handshake
    if (selectedMethod.includes('NFC') || selectedMethod.includes('Wallet')) {
      setNfcTapping(true);
      audioFeedback.playNfcBeepSound();
      setPaymentProgressText('Detecting ISO 14443A NFC Student Smartcard...');
      await new Promise((r) => setTimeout(r, 650));
      setPaymentProgressText('Verifying Cryptographic RFID Signature...');
      await new Promise((r) => setTimeout(r, 600));
      setPaymentProgressText('Authorizing Wallet Ledger Debit...');
    } else if (selectedMethod.includes('UPI')) {
      setPaymentProgressText('Verifying Dynamic UPI QR Handshake...');
      await new Promise((r) => setTimeout(r, 700));
      setPaymentProgressText('Awaiting Bank NPCI Response...');
      await new Promise((r) => setTimeout(r, 700));
      setPaymentProgressText('UPI UTR Transaction Settled...');
    } else if (selectedMethod.includes('Card')) {
      setPaymentProgressText('Contacting Visa / Mastercard 3D-Secure Gateway...');
      await new Promise((r) => setTimeout(r, 800));
      setPaymentProgressText('Cryptographic OTP Token Verified...');
    } else {
      setPaymentProgressText('Redeeming Academic Dining Scholarship Stipend...');
      await new Promise((r) => setTimeout(r, 600));
    }

    try {
      const itemsPayload = Object.entries(cart).map(([menuItemId, quantity]) => ({
        menuItemId,
        quantity,
      }));

      const txnId = `TXN-CIQ-${Date.now().toString().slice(-6)}`;

      const res = await api.placeOrder(itemsPayload, {
        paymentMethod: selectedMethod,
        transactionId: txnId,
        notes: specialInstructions,
      });

      // Update remaining wallet balance if wallet was used
      if (res.remainingWalletBalance !== undefined) {
        setWalletBalance(res.remainingWalletBalance);
      } else if (selectedMethod.includes('Wallet')) {
        setWalletBalance((prev) => Math.max(0, Number((prev - cartTotalDue).toFixed(2))));
      }

      setCompletedOrder(res.order);
      setPaymentStep('success');
      setNfcTapping(false);

      // Play joyful POS payment success chime & announce via voice
      audioFeedback.playPaymentSuccessSound();
      setTimeout(() => {
        audioFeedback.announcePaymentSuccess(res.order.orderNumber, res.order.totalAmount, selectedMethod);
      }, 350);

      // Reset cart
      setCart({});
      setSpecialInstructions('');
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Payment processing failed');
      setPaymentStep('idle');
      setNfcTapping(false);
    }
  };

  // Top Up Wallet
  const handleTopUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.topUpWallet(topUpAmount);
      setWalletBalance(res.walletBalance);
      audioFeedback.playPaymentSuccessSound();
      alert(`Smart Campus Wallet successfully recharged! New balance: $${res.walletBalance.toFixed(2)}`);
      setShowTopUpModal(false);
    } catch (err: any) {
      alert(err.message || 'Top-up failed');
    }
  };

  // Kitchen Status Update
  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await api.updateOrderStatus(orderId, status);
      if (status === 'Ready') {
        audioFeedback.playSuccessSound();
        audioFeedback.speakText(`Order ${orderId.replace('ORD-', '')} is now ready for pickup at Counter 2.`);
      }
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Wallet Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl font-bold text-stone-900 tracking-tight">
              Smart Campus Canteen & Dining
            </h2>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              16 Gourmet Chef Creations
            </span>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-blue-700" />
              <span>Real-Time Payment Gateway</span>
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl leading-relaxed">
            Nutritious gourmet menu, real-time NFC student card & UPI payments, dynamic queue tracker, and instant QR counter pickup.
          </p>
        </div>

        {/* Live Wallet Badge & Order Actions */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Smart Wallet Balance Display */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 flex items-center gap-3 shadow-2xs">
            <div className="p-1.5 rounded-lg bg-emerald-700 text-white">
              <Wallet className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider block">
                Campus Smart Wallet
              </span>
              <strong className="text-sm font-bold text-emerald-900 tabular-nums">
                ${walletBalance.toFixed(2)}
              </strong>
            </div>
            <button
              onClick={() => setShowTopUpModal(true)}
              className="ml-2 px-2.5 py-1 bg-white hover:bg-emerald-50 text-emerald-800 border border-stone-300 hover:border-emerald-400 text-[11px] font-bold rounded-lg transition-colors"
            >
              + Top Up
            </button>
          </div>

          {/* Latest Order QR Button */}
          {orders.length > 0 && (
            <button
              onClick={() => setActivePickupPass(orders[0])}
              className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <QrCode className="w-4 h-4" />
              <span>Active Order QR</span>
            </button>
          )}
        </div>
      </div>

      {/* Main 2-Column Split: Menu Catalog on Left (8 cols), Cart & Live Queue on Right (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Menu Items & Filters (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Search & Dietary Filters Bar */}
          <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-2xs space-y-2.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search menu (e.g. Grilled Chicken, Paneer Tikka, Sourdough, Boba, Matcha, Tacos)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-700 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors text-[11px] ${
                    selectedCategory === cat
                      ? 'bg-emerald-800 text-white font-bold shadow-2xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Dietary Sub-filter Tags */}
            <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-stone-100 scrollbar-none text-[10px]">
              <span className="text-stone-400 font-medium shrink-0">Dietary:</span>
              {dietaryOptions.map((diet) => (
                <button
                  key={diet}
                  onClick={() => setSelectedDietary(diet)}
                  className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                    selectedDietary === diet
                      ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-300'
                      : 'bg-stone-50 hover:bg-stone-100 text-stone-500 border border-stone-200'
                  }`}
                >
                  {diet}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Items Grid */}
          {filteredMenu.length === 0 ? (
            <div className="bg-white rounded-xl border border-stone-200 p-12 text-center space-y-3">
              <UtensilsCrossed className="w-10 h-10 text-stone-300 mx-auto" />
              <h3 className="text-sm font-bold text-stone-800">No Dishes Found</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                No menu items match &ldquo;{searchQuery}&rdquo;. Try another keyword or reset the category filter.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedDietary('All');
                }}
                className="px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-semibold"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredMenu.map((item) => {
                const qtyInCart = cart[item.id] || 0;
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden flex flex-col justify-between hover:border-emerald-600/40 hover:shadow-md transition-all duration-200 group"
                  >
                    {/* Food Photo Banner */}
                    <div className="relative h-40 bg-stone-900 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          target.onerror = null;
                          target.src = '/src/assets/images/canteen_grilled_chicken_bowl.jpg';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />

                      {/* Top Badges */}
                      <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                        <span className="bg-stone-900/85 backdrop-blur-xs text-white text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-white/20">
                          {item.dietary}
                        </span>
                        <span className="bg-white/95 text-stone-900 text-xs font-bold px-2 py-0.5 rounded-full shadow-xs tabular-nums">
                          ${item.price.toFixed(2)}
                        </span>
                      </div>

                      {/* Bottom Image Stats (Calories & Prep Time) */}
                      <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white text-[10px]">
                        <span className="flex items-center gap-1 font-medium bg-black/50 px-2 py-0.5 rounded backdrop-blur-xs">
                          <Flame className="w-3 h-3 text-amber-400" />
                          <span>{item.calories || 450} kcal</span>
                        </span>
                        <span className="flex items-center gap-1 font-medium bg-black/50 px-2 py-0.5 rounded backdrop-blur-xs">
                          <Clock className="w-3 h-3 text-emerald-400" />
                          <span>{item.preparationTime || '5-7 mins'}</span>
                        </span>
                      </div>
                    </div>

                    {/* Food Details Body */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-bold text-stone-900 leading-snug group-hover:text-emerald-800 transition-colors">
                            {item.name}
                          </h4>
                          <span className="flex items-center text-[10px] font-bold text-amber-600 shrink-0">
                            ★ {item.rating || 4.9}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                      </div>

                      {/* Price & Add to Cart Controls */}
                      <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                        <div>
                          <span className="text-[9px] text-stone-400 uppercase font-semibold block">Price</span>
                          <span className="text-sm font-bold text-emerald-800 tabular-nums">
                            ${item.price.toFixed(2)}
                          </span>
                        </div>

                        {qtyInCart > 0 ? (
                          <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-lg border border-stone-200">
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="w-6 h-6 rounded bg-white text-stone-700 flex items-center justify-center hover:bg-stone-200 transition-colors shadow-2xs"
                              title="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-bold text-stone-900 px-1 tabular-nums">
                              {qtyInCart}
                            </span>
                            <button
                              onClick={() => addToCart(item.id)}
                              className="w-6 h-6 rounded bg-emerald-800 text-white flex items-center justify-center hover:bg-emerald-900 transition-colors shadow-2xs"
                              title="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(item.id)}
                            className="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Checkout Cart & Live Kitchen Status (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Interactive Meal Tray (Cart) */}
          <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-xs font-bold text-stone-900 flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-800" />
                <span>My Meal Tray</span>
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-mono">
                {cartItemCount} items
              </span>
            </div>

            {cartItemCount === 0 ? (
              <div className="py-8 text-center text-xs text-stone-400 space-y-2">
                <Coffee className="w-8 h-8 text-stone-300 mx-auto" />
                <p>Your meal tray is empty. Tap &ldquo;+ Add&rdquo; on any dish to begin your order.</p>
              </div>
            ) : (
              <div className="pt-3 space-y-3.5">
                {/* Itemized Cart List */}
                <div className="divide-y divide-stone-100 max-h-52 overflow-y-auto pr-1">
                  {Object.entries(cart).map(([id, qty]) => {
                    const item = menu.find((m) => m.id === id);
                    if (!item) return null;
                    return (
                      <div key={id} className="py-2.5 flex items-center justify-between text-xs">
                        <div className="truncate pr-2">
                          <p className="font-semibold text-stone-900 truncate">{item.name}</p>
                          <span className="text-[10px] text-stone-400">
                            ${item.price.toFixed(2)} × {qty}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-bold text-stone-900 tabular-nums">
                            ${(item.price * qty).toFixed(2)}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 text-stone-400 hover:text-red-600 rounded"
                            title="Remove"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Special Instructions Input */}
                <div>
                  <label className="text-[10px] font-bold text-stone-600 uppercase tracking-wide block mb-1">
                    Special Kitchen Notes (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Extra napkins, no spicy, cutlery..."
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:ring-1 focus:ring-emerald-700"
                  />
                </div>

                {/* Order Bill Breakdown */}
                <div className="pt-3 border-t border-stone-200 space-y-1.5 text-xs">
                  <div className="flex justify-between text-stone-500">
                    <span>Subtotal</span>
                    <span className="tabular-nums font-mono">${cartSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>Campus Dining Tax (8%)</span>
                    <span className="tabular-nums font-mono">${cartTax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-stone-900 font-bold text-sm pt-1.5 border-t border-stone-100">
                    <span>Total Due</span>
                    <span className="text-emerald-800 tabular-nums font-mono text-base">
                      ${cartTotalDue.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Real-time Payment Call-to-Action */}
                <div className="pt-2">
                  <button
                    onClick={handleProceedToPayment}
                    className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 group"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Proceed to Real-Time Payment (${cartTotalDue.toFixed(2)})</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                  <p className="text-[10px] text-stone-400 text-center mt-2 flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-700" />
                    <span>Instant NFC, UPI QR, or Card Debit Verified</span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Kitchen Queue & Orders Tracker */}
          <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs">
            <h3 className="text-xs font-bold text-stone-900 mb-3 flex items-center justify-between">
              <span>Kitchen Queue & Live Status</span>
              <span className="text-[10px] text-stone-400 font-mono">{orders.length} orders</span>
            </h3>

            <div className="space-y-3.5 max-h-80 overflow-y-auto divide-y divide-stone-100 pr-1">
              {orders.map((order) => (
                <div key={order.id} className="pt-3 first:pt-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono font-bold text-xs text-stone-900">
                        {order.orderNumber}
                      </span>
                      <span className="text-[10px] text-stone-500 ml-2">
                        {order.studentName}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        order.status === 'Completed'
                          ? 'bg-stone-100 text-stone-600'
                          : order.status === 'Ready'
                          ? 'bg-emerald-100 text-emerald-900 font-extrabold animate-pulse border border-emerald-300'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  {/* Payment Details Tag */}
                  <div className="flex items-center justify-between text-[10px] text-stone-500 bg-stone-50 px-2 py-1 rounded">
                    <span>Paid: <strong>${order.totalAmount.toFixed(2)}</strong></span>
                    <span className="text-emerald-800 font-medium truncate max-w-[140px]">
                      {order.paymentMethod || 'Campus Smart Wallet'}
                    </span>
                  </div>

                  <div className="text-[11px] text-stone-600 line-clamp-2">
                    {order.items.map((i) => `${i.name} (×${i.quantity})`).join(', ')}
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <button
                      onClick={() => setActivePickupPass(order)}
                      className="text-emerald-800 hover:underline font-semibold flex items-center gap-1"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>View Pickup Token</span>
                    </button>

                    {canManageKitchen && order.status !== 'Completed' && (
                      <div className="flex items-center gap-1">
                        {order.status === 'Placed' && (
                          <button
                            onClick={() => handleStatusChange(order.id, 'Preparing')}
                            className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-[10px] font-medium rounded transition-colors"
                          >
                            Mark Prepping
                          </button>
                        )}
                        {order.status === 'Preparing' && (
                          <button
                            onClick={() => handleStatusChange(order.id, 'Ready')}
                            className="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-800 text-white text-[10px] font-bold rounded transition-colors shadow-2xs"
                          >
                            Mark Ready
                          </button>
                        )}
                        {order.status === 'Ready' && (
                          <button
                            onClick={() => handleStatusChange(order.id, 'Completed')}
                            className="px-2 py-0.5 bg-stone-800 hover:bg-black text-white text-[10px] font-bold rounded transition-colors"
                          >
                            Mark Handed Over
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* REAL-TIME PAYMENT GATEWAY MODAL */}
      {/* ============================================================== */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-5 animate-in fade-in zoom-in-95 duration-150 my-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-800 text-white shadow-xs">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">CampusIQ Real-Time Payment Terminal</h3>
                  <p className="text-[11px] text-stone-500">256-bit Encrypted Student Dining Checkout</p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (paymentStep !== 'authorizing') setShowPaymentModal(false);
                }}
                disabled={paymentStep === 'authorizing'}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Total Due Banner */}
            <div className="p-3.5 bg-emerald-950 text-white rounded-xl flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[10px] text-emerald-300 uppercase tracking-wider font-semibold block">
                  Amount Due Now
                </span>
                <span className="text-xl font-bold font-mono">${cartTotalDue.toFixed(2)}</span>
              </div>
              <span className="text-xs text-emerald-200 font-medium">
                {cartItemCount} item{cartItemCount > 1 ? 's' : ''} in tray
              </span>
            </div>

            {paymentStep === 'idle' && (
              <>
                {/* Payment Methods Tabs */}
                <div className="grid grid-cols-4 gap-1.5 p-1 bg-stone-100 rounded-xl text-xs font-semibold">
                  <button
                    onClick={() => setPaymentMode('wallet')}
                    className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all text-center ${
                      paymentMode === 'wallet'
                        ? 'bg-white text-emerald-900 shadow-2xs font-bold'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    <Wallet className="w-4 h-4" />
                    <span className="text-[10px]">Smart Wallet</span>
                  </button>

                  <button
                    onClick={() => setPaymentMode('upi')}
                    className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all text-center ${
                      paymentMode === 'upi'
                        ? 'bg-white text-emerald-900 shadow-2xs font-bold'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span className="text-[10px]">UPI Scan</span>
                  </button>

                  <button
                    onClick={() => setPaymentMode('card')}
                    className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all text-center ${
                      paymentMode === 'card'
                        ? 'bg-white text-emerald-900 shadow-2xs font-bold'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span className="text-[10px]">Debit Card</span>
                  </button>

                  <button
                    onClick={() => setPaymentMode('voucher')}
                    className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all text-center ${
                      paymentMode === 'voucher'
                        ? 'bg-white text-emerald-900 shadow-2xs font-bold'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    <Award className="w-4 h-4" />
                    <span className="text-[10px]">Meal Voucher</span>
                  </button>
                </div>

                {/* Tab 1: Smart Campus ID Wallet (NFC) */}
                {paymentMode === 'wallet' && (
                  <div className="space-y-4">
                    {/* Simulated NFC Card Preview */}
                    <div className="relative rounded-xl p-5 bg-gradient-to-br from-emerald-800 to-stone-900 text-white shadow-md overflow-hidden">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-mono tracking-widest uppercase font-semibold text-emerald-300">
                          CampusIQ Smart Student ID
                        </span>
                        <div className="flex items-center gap-1 text-[11px] bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-xs">
                          <Smartphone className="w-3 h-3 text-emerald-300" />
                          <span>NFC Tap Active</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="font-bold text-sm">Aarav Sharma</p>
                        <p className="text-[11px] text-emerald-200 font-mono">Roll: 241FA04001 &bull; CS Dept</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[9px] text-emerald-300 block uppercase font-medium">Available Balance</span>
                          <span className="text-base font-bold font-mono">${walletBalance.toFixed(2)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-emerald-300 block uppercase font-medium">After Debit</span>
                          <span className="text-sm font-bold font-mono text-emerald-200">
                            ${Math.max(0, walletBalance - cartTotalDue).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {nfcTapping && (
                        <div className="absolute inset-0 bg-emerald-600/30 backdrop-blur-xs flex items-center justify-center animate-pulse">
                          <span className="font-bold text-sm">Transmitting NFC Data...</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => executeRealTimePayment('Campus Smart ID Wallet (NFC)')}
                      disabled={walletBalance < cartTotalDue}
                      className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>
                        {walletBalance < cartTotalDue
                          ? 'Insufficient Wallet Balance (Please Top Up)'
                          : `Tap NFC Card to Pay $${cartTotalDue.toFixed(2)}`}
                      </span>
                    </button>
                  </div>
                )}

                {/* Tab 2: Dynamic UPI QR Code Scan */}
                {paymentMode === 'upi' && (
                  <div className="space-y-4 text-center">
                    <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-stone-500">Scan via GPay / PhonePe / Paytm</span>
                        <span className="font-mono text-emerald-800 font-bold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>
                            {String(Math.floor(upiTimerSeconds / 60)).padStart(2, '0')}:
                            {String(upiTimerSeconds % 60).padStart(2, '0')}
                          </span>
                        </span>
                      </div>

                      {/* Dynamic Generated UPI QR */}
                      <div className="relative inline-block p-3 bg-white rounded-xl border-2 border-dashed border-emerald-600 shadow-xs">
                        <QRCodeView
                          value={`upi://pay?pa=canteen.campusiq@icici&pn=CampusIQ+Dining&am=${cartTotalDue.toFixed(2)}&cu=USD&tn=ORD-CIQ`}
                          size={150}
                          subtitle={`UPI: canteen.campusiq@icici`}
                        />
                      </div>

                      <p className="text-[11px] text-stone-500">
                        Scan with any UPI app on your mobile phone to complete payment.
                      </p>
                    </div>

                    <button
                      onClick={() => executeRealTimePayment('UPI Instant Pay (Google Pay / PhonePe)')}
                      className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Simulate Mobile App UPI Approval ($ {cartTotalDue.toFixed(2)})</span>
                    </button>
                  </div>
                )}

                {/* Tab 3: Credit / Debit Card */}
                {paymentMode === 'card' && (
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="block text-stone-700 font-medium mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg font-mono"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-stone-700 font-medium mb-1">Cardholder Name</label>
                        <input
                          type="text"
                          value={cardDetails.name}
                          onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
                          className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-1.5">
                        <div>
                          <label className="block text-stone-700 font-medium mb-1">Expiry</label>
                          <input
                            type="text"
                            value={cardDetails.expiry}
                            onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                            className="w-full px-2 py-2 bg-stone-50 border border-stone-300 rounded-lg font-mono text-center"
                          />
                        </div>
                        <div>
                          <label className="block text-stone-700 font-medium mb-1">CVV</label>
                          <input
                            type="password"
                            value={cardDetails.cvv}
                            onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                            className="w-full px-2 py-2 bg-stone-50 border border-stone-300 rounded-lg font-mono text-center"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => executeRealTimePayment('Credit Card (Visa / Mastercard)')}
                      className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 mt-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Authorize 3D-Secure Payment (${cartTotalDue.toFixed(2)})</span>
                    </button>
                  </div>
                )}

                {/* Tab 4: Student Meal Plan Voucher */}
                {paymentMode === 'voucher' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-amber-900 font-bold">
                        <Award className="w-4 h-4 text-amber-700" />
                        <span>Daily Academic Dining Stipend Voucher</span>
                      </div>
                      <p className="text-amber-800 text-[11px] leading-relaxed">
                        Students on university scholarship or hostel residency receive a $10.00 daily meal voucher
                        subsidized by the Dean of Student Affairs.
                      </p>
                      <div className="pt-2 border-t border-amber-200 flex justify-between font-semibold">
                        <span>Voucher Value Applied:</span>
                        <span className="font-bold text-emerald-800">-$10.00</span>
                      </div>
                      <div className="flex justify-between font-bold text-stone-900 text-sm">
                        <span>Remaining Balance:</span>
                        <span>${Math.max(0, cartTotalDue - 10).toFixed(2)}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => executeRealTimePayment('Student Scholarship Dining Voucher')}
                      className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Redeem Voucher & Confirm Order</span>
                    </button>
                  </div>
                )}
              </>
            )}

            {/* State: Authorizing (Animated progress) */}
            {paymentStep === 'authorizing' && (
              <div className="py-10 text-center space-y-4 animate-in fade-in duration-200">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="w-16 h-16 border-4 border-stone-200 border-t-emerald-800 rounded-full animate-spin" />
                  <Lock className="w-6 h-6 text-emerald-800 absolute inset-0 m-auto" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-stone-900">Processing Real-Time Payment</h4>
                  <p className="text-xs text-stone-500 mt-1 font-mono">{paymentProgressText}</p>
                </div>
              </div>
            )}

            {/* State: Success (Receipt & QR link) */}
            {paymentStep === 'success' && completedOrder && (
              <div className="space-y-4 text-center animate-in zoom-in-95 duration-200">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-300">
                  <CheckCircle2 className="w-8 h-8 text-emerald-700" />
                </div>

                <div>
                  <h4 className="text-base font-bold text-stone-900">Payment Authorized & Settled!</h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Order <strong>{completedOrder.orderNumber}</strong> has been transmitted to Canteen Counter #2.
                  </p>
                </div>

                {/* Digital Receipt */}
                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs text-left space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-stone-500">Transaction ID:</span>
                    <span className="font-mono font-bold text-stone-900">{completedOrder.transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Payment Method:</span>
                    <span className="font-semibold text-emerald-900">{completedOrder.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-stone-500">Total Settled:</span>
                    <span className="font-bold text-stone-900 font-mono">${completedOrder.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => {
                      setShowPaymentModal(false);
                      setActivePickupPass(completedOrder);
                    }}
                    className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>View Counter Pickup Token</span>
                  </button>
                  <button
                    onClick={() => setShowPaymentModal(false)}
                    className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* WALLET TOP-UP MODAL */}
      {/* ============================================================== */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900">Top Up Campus Smart Wallet</h3>
                <p className="text-[11px] text-stone-500">Recharge contactless NFC dining balance</p>
              </div>
            </div>

            <form onSubmit={handleTopUpSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-700 font-medium mb-1.5">Select Top-Up Amount</label>
                <div className="grid grid-cols-3 gap-2">
                  {[10, 25, 50].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setTopUpAmount(amt)}
                      className={`py-2 rounded-lg font-bold border text-center transition-all ${
                        topUpAmount === amt
                          ? 'bg-emerald-800 text-white border-emerald-900 shadow-2xs'
                          : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                      }`}
                    >
                      +${amt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-medium mb-1">Custom Amount ($)</label>
                <input
                  type="number"
                  min="5"
                  max="500"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg font-mono font-bold text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowTopUpModal(false)}
                  className="px-4 py-2 text-stone-600 hover:text-stone-900 bg-stone-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg shadow-xs"
                >
                  Confirm Recharge (${topUpAmount})
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* CANTEEN PICKUP PASS MODAL */}
      {/* ============================================================== */}
      {activePickupPass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="text-center">
              <span className="text-[10px] font-mono text-emerald-800 uppercase tracking-widest font-semibold">
                Canteen Counter Pickup Pass
              </span>
              <h3 className="text-base font-bold text-stone-900 mt-1">
                Order {activePickupPass.orderNumber}
              </h3>
              <p className="text-xs text-stone-500">
                Total: <strong>${activePickupPass.totalAmount.toFixed(2)}</strong> &bull; {activePickupPass.paymentStatus}
              </p>
            </div>

            <QRCodeView
              value={activePickupPass.pickupToken}
              size={160}
              subtitle="Scan at Canteen Counter 2 to claim your hot meal"
            />

            <div className="p-3 bg-stone-50 rounded-lg text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-stone-500">Kitchen Status:</span>
                <span className="font-bold text-emerald-800">{activePickupPass.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Payment Method:</span>
                <span className="font-medium text-stone-800">{activePickupPass.paymentMethod || 'Campus Smart Wallet'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Single-Redemption:</span>
                <span className="font-mono text-stone-700">
                  {activePickupPass.redeemed ? 'Redeemed' : 'Unredeemed'}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  onVerifyToken(activePickupPass.pickupToken);
                  setActivePickupPass(null);
                }}
                className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg transition-colors"
              >
                Test Counter Scan
              </button>
              <button
                onClick={() => setActivePickupPass(null)}
                className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
