import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { 
  BellRing, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Armchair, 
  PauseCircle, 
  PlayCircle, 
  LogOut, 
  Search, 
  Check, 
  QrCode, 
  Banknote, 
  AlertCircle,
  Volume2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { API_BASE, SOCKET_URL } from '../../config/api';

// Audio chime for vendor incoming order
const playIncomingOrderBell = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
    osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.2); // E5
    osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.4); // A5
    gain.gain.setValueAtTime(0.4, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.2);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 1.2);
  } catch (_) {}
};

const VendorPortalPage = () => {
  const navigate = useNavigate();
  const { user, logout, role, isAuthenticated } = useAuth();

  // Route protection: vendor only
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    } else if (role !== 'vendor') {
      navigate('/home', { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  const [outlet, setOutlet] = useState(null);
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [activeTab, setActiveTab] = useState('new'); // 'new' | 'cooking' | 'ready' | 'menu'
  const [loading, setLoading] = useState(true);
  const [newOrderAlert, setNewOrderAlert] = useState(null);

  // Pause Modal State
  const [pauseModalOpen, setPauseModalOpen] = useState(false);
  const [pauseDuration, setPauseDuration] = useState(15);

  // Reject Modal State
  const [rejectModalOrder, setRejectModalOrder] = useState(null);
  const [rejectReason, setRejectReason] = useState('Kitchen busy / Out of ingredients');

  // Ready for Pickup verification
  const [tokenInput, setTokenInput] = useState('');
  const [verifiedOrder, setVerifiedOrder] = useState(null);
  const [tokenError, setTokenError] = useState('');

  const outletId = user?.outletId || 'outlet-1';

  // 1. Fetch initial orders, outlet info, and menu
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [outletRes, ordersRes] = await Promise.all([
        axios.get(`${API_BASE}/outlets/${outletId}`),
        axios.get(`${API_BASE}/orders`),
      ]);

      if (outletRes.data.success) {
        setOutlet(outletRes.data.data);
        setMenuItems(outletRes.data.data.menu || []);
      }
      if (ordersRes.data.success) {
        setOrders(ordersRes.data.data);
      }
    } catch (err) {
      console.error('Vendor data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!outletId) return;
    fetchAllData();
    // 5-second polling fallback guarantees new orders arrive even on serverless platforms (e.g. Vercel)
    const pollInterval = setInterval(() => {
      fetchAllData();
    }, 5000);
    return () => clearInterval(pollInterval);
  }, [outletId]);

  // 2. Real-Time Socket Connection for Vendor Kitchen
  useEffect(() => {
    if (!outletId) return;
    const socket = io(SOCKET_URL, { transports: ['websocket'] });

    socket.emit('join_outlet_room', outletId);

    // Incoming new order
    socket.on('new_order_placed', (newOrd) => {
      playIncomingOrderBell();
      setOrders(prev => [newOrd, ...prev.filter(o => o.id !== newOrd.id)]);
      setNewOrderAlert(`New Order ${newOrd.token} arrived!`);
      setTimeout(() => setNewOrderAlert(null), 8000);
    });

    // Order status update
    socket.on('order_status_changed', (updated) => {
      setOrders(prev => prev.map(o => (o.id === updated.id ? { ...o, ...updated } : o)));
    });

    return () => socket.disconnect();
  }, [outletId]);

  // Actions: Accept Order
  const handleAcceptOrder = async (orderId) => {
    try {
      const res = await axios.patch(`${API_BASE}/orders/${orderId}/status`, {
        status: 'Accepted',
      });
      if (res.data.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? res.data.data : o));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating order.');
    }
  };

  // Actions: Move to Cooking
  const handleStartCooking = async (orderId) => {
    try {
      const res = await axios.patch(`${API_BASE}/orders/${orderId}/status`, {
        status: 'Preparing',
      });
      if (res.data.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? res.data.data : o));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating order.');
    }
  };

  // Actions: Mark Food Ready
  const handleMarkReady = async (orderId) => {
    try {
      const res = await axios.patch(`${API_BASE}/orders/${orderId}/status`, {
        status: 'Ready for Pickup',
      });
      if (res.data.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? res.data.data : o));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating order.');
    }
  };

  // Actions: Reject Order
  const handleConfirmReject = async () => {
    if (!rejectModalOrder) return;
    try {
      const res = await axios.patch(`${API_BASE}/orders/${rejectModalOrder.id}/status`, {
        status: 'Rejected',
        rejectReason,
      });
      if (res.data.success) {
        setOrders(prev => prev.map(o => o.id === rejectModalOrder.id ? res.data.data : o));
        setRejectModalOrder(null);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error rejecting order.');
    }
  };

  // Actions: Verify Token
  const handleVerifyToken = async (e) => {
    e.preventDefault();
    setTokenError('');
    setVerifiedOrder(null);

    if (!tokenInput.trim()) {
      setTokenError('Please enter the token number.');
      return;
    }

    try {
      const res = await axios.post(`${API_BASE}/orders/verify/verify-token`, {
        token: tokenInput.trim(),
      });
      if (res.data.success && res.data.data) {
        setVerifiedOrder(res.data.data);
      }
    } catch (err) {
      setTokenError(err.response?.data?.message || `No order found with token '${tokenInput.trim()}'.`);
    }
  };

  // Actions: Collect Payment & Hand Over
  const handleHandover = async (orderId, paymentMethodReceived = 'Cash') => {
    try {
      const res = await axios.post(`${API_BASE}/orders/${orderId}/payment`, {
        paymentMethodReceived,
      });
      if (res.data.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? res.data.data : o));
        setVerifiedOrder(null);
        setTokenInput('');
        alert('Order completed and handed over to student!');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error completing handover.');
    }
  };

  // Actions: Toggle Menu Item Stock
  const handleToggleStock = async (itemId, currentAvailable) => {
    try {
      const res = await axios.patch(`${API_BASE}/vendor/items/${itemId}/stock`, {
        isAvailable: !currentAvailable,
      });
      if (res.data.success) {
        setMenuItems(prev => prev.map(i => i.id === itemId ? res.data.data : i));
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error toggling dish stock.');
    }
  };

  // Actions: Pause Orders
  const handleConfirmPause = async () => {
    try {
      const res = await axios.post(`${API_BASE}/vendor/pause`, {
        durationMinutes: pauseDuration,
      });
      if (res.data.success) {
        setOutlet(res.data.data);
        setPauseModalOpen(false);
      }
    } catch (err) {
      alert('Error pausing orders.');
    }
  };

  // Actions: Resume Orders
  const handleResumeOrders = async () => {
    try {
      const res = await axios.post(`${API_BASE}/vendor/resume`, {});
      if (res.data.success) {
        setOutlet(res.data.data);
      }
    } catch (err) {
      alert('Error resuming orders.');
    }
  };

  // Actions: Adjust Seat Count (for canteens)
  const handleAdjustSeats = async (delta) => {
    try {
      const res = await axios.patch(`${API_BASE}/vendor/seats`, { delta });
      if (res.data.success) {
        setOutlet(prev => ({ ...prev, occupiedSeats: res.data.data.occupiedSeats }));
      }
    } catch (err) {
      alert('Error updating seat count.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  // Filter orders by tab
  const newOrdersList = orders.filter(o => o.status === 'Placed');
  const cookingOrdersList = orders.filter(o => o.status === 'Accepted' || o.status === 'Preparing');
  const readyOrdersList = orders.filter(o => o.status === 'Ready for Pickup');

  const isPaused = outlet?.isPaused;
  const isCanteen = outlet?.isAcademicCanteen;

  return (
    <div className="min-h-screen bg-[#FBF6EC] text-[#2B1B1F] flex flex-col font-sans pb-16">
      
      {/* 1. TOP BAR (Always Visible) */}
      <header className="sticky top-0 z-40 bg-white border-b-2 border-border shadow-soft px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          
          {/* Outlet Title */}
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-success animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted">
                Vendor Terminal • {outlet?.location || 'Campus Counter'}
              </span>
            </div>
            <h1 className="font-serif font-black text-xl sm:text-2xl text-primary">
              {outlet?.name || 'Counter Terminal'}
            </h1>
          </div>

          {/* Controls: Pause/Resume + Seat Counter + Logout */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Academic Canteen Simple Seat Counter: "Seats occupied: - 37 +" */}
            {isCanteen && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-alt rounded-xl border border-border">
                <span className="text-xs font-mono font-bold text-text-muted">
                  Seats Occupied:
                </span>
                <button
                  type="button"
                  onClick={() => handleAdjustSeats(-1)}
                  className="w-8 h-8 rounded-lg bg-white border border-border font-mono font-bold text-base flex items-center justify-center hover:bg-border active:scale-95 shadow-soft"
                >
                  -
                </button>
                <span className="font-mono font-black text-lg text-primary w-10 text-center">
                  {outlet?.occupiedSeats || 42}
                </span>
                <button
                  type="button"
                  onClick={() => handleAdjustSeats(1)}
                  className="w-8 h-8 rounded-lg bg-white border border-border font-mono font-bold text-base flex items-center justify-center hover:bg-border active:scale-95 shadow-soft"
                >
                  +
                </button>
                <span className="text-xs font-mono text-text-muted">/100</span>
              </div>
            )}

            {/* Big PAUSE / RESUME Toggle Button */}
            {isPaused ? (
              <Button
                variant="success"
                size="md"
                onClick={handleResumeOrders}
                className="font-bold text-sm tracking-wide"
              >
                <PlayCircle className="w-5 h-5 mr-1" />
                <span>RESUME ORDERS</span>
              </Button>
            ) : (
              <Button
                variant="danger"
                size="md"
                onClick={() => setPauseModalOpen(true)}
                className="font-bold text-sm tracking-wide"
              >
                <PauseCircle className="w-5 h-5 mr-1" />
                <span>PAUSE ORDERS</span>
              </Button>
            )}

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="px-3.5 py-2.5 rounded-xl border border-border hover:bg-surface-alt text-xs font-mono font-bold text-text flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-4 h-4 text-danger" />
              <span>Sign Out</span>
            </button>

          </div>

        </div>
      </header>

      {/* New Order Toast Alert */}
      {newOrderAlert && (
        <div className="bg-primary text-white p-4 text-center font-serif font-bold text-lg shadow-card flex items-center justify-center gap-3 animate-bounce">
          <BellRing className="w-6 h-6 animate-pulse text-accent" />
          <span>{newOrderAlert}</span>
        </div>
      )}

      {/* Paused Notice Strip */}
      {isPaused && (
        <div className="bg-danger text-white px-4 py-2 text-center text-xs font-mono font-bold tracking-wider uppercase">
          ⚠️ Incoming student orders are currently PAUSED. Checkout is blocked for your outlet.
        </div>
      )}

      {/* 2. FOUR BIG TABS (Text 18px+, Buttons min 56px) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 flex-1 flex flex-col space-y-6">
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 select-none">
          
          {/* Tab 1: NEW ORDERS */}
          <button
            type="button"
            onClick={() => setActiveTab('new')}
            className={`min-h-[56px] p-3 sm:p-4 rounded-2xl border-2 flex items-center justify-between transition-all cursor-pointer ${
              activeTab === 'new'
                ? 'bg-primary text-white border-primary shadow-card scale-102'
                : 'bg-white text-text border-border hover:bg-surface-alt'
            }`}
          >
            <div className="text-left">
              <span className="text-[11px] font-mono uppercase tracking-wider block opacity-80">Tab 1</span>
              <span className="font-serif font-black text-lg sm:text-xl">NEW ORDERS</span>
            </div>
            <span className={`w-8 h-8 rounded-xl font-mono font-black text-base flex items-center justify-center ${
              activeTab === 'new' ? 'bg-accent text-[#2B1B1F]' : 'bg-surface-alt text-text'
            }`}>
              {newOrdersList.length}
            </span>
          </button>

          {/* Tab 2: COOKING */}
          <button
            type="button"
            onClick={() => setActiveTab('cooking')}
            className={`min-h-[56px] p-3 sm:p-4 rounded-2xl border-2 flex items-center justify-between transition-all cursor-pointer ${
              activeTab === 'cooking'
                ? 'bg-primary text-white border-primary shadow-card scale-102'
                : 'bg-white text-text border-border hover:bg-surface-alt'
            }`}
          >
            <div className="text-left">
              <span className="text-[11px] font-mono uppercase tracking-wider block opacity-80">Tab 2</span>
              <span className="font-serif font-black text-lg sm:text-xl">COOKING</span>
            </div>
            <span className={`w-8 h-8 rounded-xl font-mono font-black text-base flex items-center justify-center ${
              activeTab === 'cooking' ? 'bg-accent text-[#2B1B1F]' : 'bg-surface-alt text-text'
            }`}>
              {cookingOrdersList.length}
            </span>
          </button>

          {/* Tab 3: READY FOR PICKUP */}
          <button
            type="button"
            onClick={() => setActiveTab('ready')}
            className={`min-h-[56px] p-3 sm:p-4 rounded-2xl border-2 flex items-center justify-between transition-all cursor-pointer ${
              activeTab === 'ready'
                ? 'bg-primary text-white border-primary shadow-card scale-102'
                : 'bg-white text-text border-border hover:bg-surface-alt'
            }`}
          >
            <div className="text-left">
              <span className="text-[11px] font-mono uppercase tracking-wider block opacity-80">Tab 3</span>
              <span className="font-serif font-black text-lg sm:text-xl">READY FOR PICKUP</span>
            </div>
            <span className={`w-8 h-8 rounded-xl font-mono font-black text-base flex items-center justify-center ${
              activeTab === 'ready' ? 'bg-accent text-[#2B1B1F]' : 'bg-surface-alt text-text'
            }`}>
              {readyOrdersList.length}
            </span>
          </button>

          {/* Tab 4: MY MENU */}
          <button
            type="button"
            onClick={() => setActiveTab('menu')}
            className={`min-h-[56px] p-3 sm:p-4 rounded-2xl border-2 flex items-center justify-between transition-all cursor-pointer ${
              activeTab === 'menu'
                ? 'bg-primary text-white border-primary shadow-card scale-102'
                : 'bg-white text-text border-border hover:bg-surface-alt'
            }`}
          >
            <div className="text-left">
              <span className="text-[11px] font-mono uppercase tracking-wider block opacity-80">Tab 4</span>
              <span className="font-serif font-black text-lg sm:text-xl">MY MENU</span>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-surface-alt text-text">
              {menuItems.length} Dishes
            </span>
          </button>

        </div>

        {/* 3. TAB CONTENT VIEWS */}
        <div className="flex-1">

          {/* ==================== TAB 1: NEW ORDERS ==================== */}
          {activeTab === 'new' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif font-black text-2xl text-text">
                  Incoming Orders ({newOrdersList.length})
                </h2>
                <span className="text-xs font-mono text-text-muted">
                  Accept to start cooking
                </span>
              </div>

              {newOrdersList.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-card border border-border p-8 shadow-soft">
                  <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
                  <h3 className="font-serif font-bold text-xl text-text">All Caught Up!</h3>
                  <p className="text-sm text-text-muted mt-1">
                    No new orders waiting. A chime will ring when a student places an order.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {newOrdersList.map(order => (
                    <div
                      key={order.id}
                      className="bg-white rounded-card border-2 border-primary shadow-card p-5 sm:p-6 flex flex-col justify-between gap-5"
                    >
                      {/* Top info */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-3.5 py-1.5 rounded-xl bg-primary text-white font-mono font-black text-xl">
                            {order.token}
                          </span>
                          <span className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs ${
                            order.paymentStatus === 'Paid'
                              ? 'bg-success/15 text-success'
                              : 'bg-warning/20 text-warning'
                          }`}>
                            {order.paymentMethod} • {order.paymentStatus}
                          </span>
                        </div>

                        <div>
                          <p className="font-serif font-bold text-lg text-text">
                            Student: {order.studentName}
                          </p>
                          <p className="text-xs font-mono text-text-muted">
                            Roll: {order.studentRoll} • Slot: {order.pickupSlot} • Mode: {order.diningMode}
                          </p>
                        </div>

                        {/* Dish list */}
                        <div className="p-3.5 bg-surface-alt rounded-xl border border-border space-y-1.5 font-mono text-sm">
                          {order.items?.map((it, idx) => (
                            <div key={idx} className="flex justify-between items-center text-text font-bold">
                              <span>{it.quantity}x {it.name}</span>
                              <span>₹{it.price * it.quantity}</span>
                            </div>
                          ))}
                          <div className="pt-2 border-t border-border flex justify-between font-black text-base text-primary">
                            <span>Total</span>
                            <span>₹{order.totalAmount}</span>
                          </div>
                        </div>
                      </div>

                      {/* 2 Big Buttons: ACCEPT (Green) & REJECT (Red) min 56px */}
                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setRejectModalOrder(order)}
                          className="min-h-[56px] rounded-2xl bg-danger hover:bg-[#A31D1D] text-white font-serif font-black text-lg flex items-center justify-center gap-2 transition-colors active:scale-95 shadow-soft cursor-pointer"
                        >
                          <XCircle className="w-6 h-6" />
                          <span>REJECT</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAcceptOrder(order.id)}
                          className="min-h-[56px] rounded-2xl bg-success hover:bg-[#23633E] text-white font-serif font-black text-lg flex items-center justify-center gap-2 transition-colors active:scale-95 shadow-soft cursor-pointer"
                        >
                          <CheckCircle2 className="w-6 h-6" />
                          <span>ACCEPT</span>
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==================== TAB 2: COOKING ==================== */}
          {activeTab === 'cooking' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif font-black text-2xl text-text">
                  Orders in Kitchen ({cookingOrdersList.length})
                </h2>
                <span className="text-xs font-mono text-text-muted">
                  Tap "FOOD IS READY" when packed
                </span>
              </div>

              {cookingOrdersList.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-card border border-border p-8 shadow-soft">
                  <Clock className="w-12 h-12 text-text-muted mx-auto mb-3" />
                  <h3 className="font-serif font-bold text-xl text-text">Kitchen Idle</h3>
                  <p className="text-sm text-text-muted mt-1">
                    No orders currently cooking. Check the New Orders tab.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {cookingOrdersList.map(order => (
                    <div
                      key={order.id}
                      className="bg-white rounded-card border-2 border-border shadow-card p-5 sm:p-6 flex flex-col justify-between gap-5"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="px-3.5 py-1.5 rounded-xl bg-primary text-white font-mono font-black text-2xl">
                            {order.token}
                          </span>
                          <span className="px-2.5 py-1 rounded-lg bg-surface-alt font-mono font-bold text-xs text-primary">
                            {order.status}
                          </span>
                        </div>

                        <div>
                          <p className="font-serif font-bold text-lg text-text">
                            {order.studentName} ({order.studentRoll})
                          </p>
                          <p className="text-xs font-mono text-text-muted">
                            Ordered: {order.orderedAt} • Target: ~{order.prepMins || 7} mins
                          </p>
                        </div>

                        {/* Dish items */}
                        <div className="p-3.5 bg-surface-alt rounded-xl border border-border space-y-2 font-mono text-sm">
                          {order.items?.map((it, idx) => (
                            <div key={idx} className="flex justify-between items-center text-text font-bold">
                              <span className="text-base">{it.quantity}x {it.name}</span>
                              <span>₹{it.price * it.quantity}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* One Big Button: "FOOD IS READY" (min 56px) */}
                      <div className="pt-2">
                        {order.status === 'Accepted' ? (
                          <div className="grid grid-cols-2 gap-3">
                            <button
                              type="button"
                              onClick={() => handleStartCooking(order.id)}
                              className="min-h-[56px] rounded-2xl bg-surface-alt hover:bg-border text-text font-serif font-black text-lg transition-colors active:scale-95 cursor-pointer"
                            >
                              START COOKING
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMarkReady(order.id)}
                              className="min-h-[56px] rounded-2xl bg-success hover:bg-[#23633E] text-white font-serif font-black text-lg transition-colors active:scale-95 shadow-soft cursor-pointer"
                            >
                              FOOD IS READY
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleMarkReady(order.id)}
                            className="w-full min-h-[56px] rounded-2xl bg-success hover:bg-[#23633E] text-white font-serif font-black text-xl flex items-center justify-center gap-2 transition-colors active:scale-95 shadow-card cursor-pointer"
                          >
                            <Check className="w-6 h-6 stroke-[3]" />
                            <span>FOOD IS READY</span>
                          </button>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==================== TAB 3: READY FOR PICKUP ==================== */}
          {activeTab === 'ready' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="font-serif font-black text-2xl text-text">
                  Counter Verification & Handover
                </h2>
                <span className="text-xs font-mono font-bold text-primary">
                  {readyOrdersList.length} Packed Bags Ready
                </span>
              </div>

              {/* Token Lookup Form */}
              <div className="bg-white p-6 rounded-card border-2 border-border shadow-soft space-y-4 max-w-xl">
                <h3 className="font-serif font-bold text-lg text-text">
                  Verify Student Token
                </h3>
                <p className="text-xs text-text-muted">
                  Type the token number shown by the student (e.g. UB-101) or scan their QR code
                </p>

                <form onSubmit={handleVerifyToken} className="flex gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Enter Token (e.g. UB-101)"
                    value={tokenInput}
                    onChange={(e) => setTokenInput(e.target.value)}
                    className="flex-1 px-4 py-3 bg-surface-alt border border-border rounded-2xl text-lg font-mono font-black uppercase text-text focus:outline-none focus:bg-white focus:border-primary tracking-wider"
                  />
                  <button
                    type="submit"
                    className="min-h-[56px] px-6 rounded-2xl bg-primary hover:bg-primary-hover text-white font-serif font-black text-base transition-colors shadow-soft cursor-pointer"
                  >
                    VERIFY
                  </button>
                </form>

                {tokenError && (
                  <p className="text-sm font-bold text-danger flex items-center gap-1.5 animate-fadeIn">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{tokenError}</span>
                  </p>
                )}

                {/* Verified Order Card Details & Handover */}
                {verifiedOrder && (
                  <div className="p-5 bg-surface-alt rounded-2xl border-2 border-primary space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="px-3.5 py-1.5 rounded-xl bg-primary text-white font-mono font-black text-2xl">
                        {verifiedOrder.token}
                      </span>
                      <span className="text-xs font-mono font-bold text-success px-2.5 py-1 bg-white rounded-lg">
                        Token Verified ✓
                      </span>
                    </div>

                    <div>
                      <p className="font-serif font-bold text-lg text-text">
                        {verifiedOrder.studentName} ({verifiedOrder.studentRoll})
                      </p>
                      <p className="text-xs font-mono text-text-muted">
                        Dining: {verifiedOrder.diningMode} • Items: {verifiedOrder.items?.length}
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-xl border border-border font-mono text-xs space-y-1">
                      {verifiedOrder.items?.map((it, idx) => (
                        <div key={idx} className="flex justify-between font-bold">
                          <span>{it.quantity}x {it.name}</span>
                          <span>₹{it.price * it.quantity}</span>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-border flex justify-between font-black text-sm text-primary">
                        <span>Total Due</span>
                        <span>₹{verifiedOrder.totalAmount}</span>
                      </div>
                    </div>

                    {/* Pay at Pickup Collect buttons vs Already Paid */}
                    {verifiedOrder.paymentStatus === 'Unpaid' ? (
                      <div className="space-y-3 pt-2">
                        <div className="p-3 bg-warning/20 border border-warning rounded-xl text-xs font-mono font-bold text-text">
                          ⚠️ Order is "Pay at Pickup". Collect ₹{verifiedOrder.totalAmount} before handing over food:
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => handleHandover(verifiedOrder.id, 'Cash')}
                            className="min-h-[56px] rounded-2xl bg-accent hover:bg-accent-hover text-[#2B1B1F] font-serif font-black text-base flex items-center justify-center gap-2 shadow-soft cursor-pointer"
                          >
                            <Banknote className="w-5 h-5" />
                            <span>CASH RECEIVED</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleHandover(verifiedOrder.id, 'UPI')}
                            className="min-h-[56px] rounded-2xl bg-primary hover:bg-primary-hover text-white font-serif font-black text-base flex items-center justify-center gap-2 shadow-soft cursor-pointer"
                          >
                            <QrCode className="w-5 h-5" />
                            <span>UPI RECEIVED</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => handleHandover(verifiedOrder.id, 'Pre-paid')}
                          className="w-full min-h-[56px] rounded-2xl bg-success hover:bg-[#23633E] text-white font-serif font-black text-xl flex items-center justify-center gap-2 shadow-card cursor-pointer"
                        >
                          <Check className="w-6 h-6 stroke-[3]" />
                          <span>HAND OVER FOOD (PAID ONLINE)</span>
                        </button>
                      </div>
                    )}

                  </div>
                )}
              </div>

              {/* Ready Orders Cards Queue */}
              <div className="space-y-3">
                <h3 className="font-serif font-bold text-lg text-text">
                  Waiting for Student Pickup ({readyOrdersList.length})
                </h3>
                {readyOrdersList.length === 0 ? (
                  <p className="text-sm font-mono text-text-muted">No packed bags currently waiting.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {readyOrdersList.map(order => (
                      <div
                        key={order.id}
                        className="p-4 bg-white rounded-card border border-border shadow-soft flex items-center justify-between"
                      >
                        <div>
                          <span className="px-2.5 py-1 rounded-lg bg-primary text-white font-mono font-bold text-base">
                            {order.token}
                          </span>
                          <p className="font-bold text-sm text-text mt-2">{order.studentName}</p>
                          <p className="text-xs font-mono text-text-muted">{order.paymentMethod} • ₹{order.totalAmount}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setTokenInput(order.token);
                            setVerifiedOrder(order);
                          }}
                          className="px-3 py-2 rounded-xl bg-surface-alt hover:bg-border text-xs font-mono font-bold text-primary"
                        >
                          Select
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ==================== TAB 4: MY MENU ==================== */}
          {activeTab === 'menu' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif font-black text-2xl text-text">
                    My Menu Stock Management
                  </h2>
                  <p className="text-xs text-text-muted mt-0.5">
                    Toggle dish availability in real time. Sold-out dishes immediately block students from ordering.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {menuItems.map(dish => {
                  const isAvailable = dish.isAvailable !== false;

                  return (
                    <div
                      key={dish.id}
                      className={`p-4 rounded-card border shadow-soft flex items-center justify-between gap-4 transition-colors ${
                        isAvailable ? 'bg-white border-border' : 'bg-surface-alt/80 border-border opacity-70'
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <h4 className="font-serif font-bold text-base text-text truncate">
                          {dish.name}
                        </h4>
                        <p className="font-mono font-bold text-sm text-primary mt-0.5">
                          ₹{dish.price}
                        </p>
                        <span className="text-[11px] font-mono text-text-muted">
                          {dish.category} • ~{dish.prepMins}m
                        </span>
                      </div>

                      {/* Big Switch Button (Available / Finished for today) */}
                      <button
                        type="button"
                        onClick={() => handleToggleStock(dish.id, isAvailable)}
                        className={`min-h-[48px] px-3.5 py-2 rounded-xl font-mono text-xs font-black uppercase tracking-wider transition-all select-none shadow-soft shrink-0 ${
                          isAvailable
                            ? 'bg-success text-white hover:bg-[#23633E]'
                            : 'bg-danger text-white hover:bg-[#A31D1D]'
                        }`}
                      >
                        {isAvailable ? 'AVAILABLE' : 'FINISHED'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>

      {/* ==================== PAUSE ORDERS MODAL ==================== */}
      <Modal
        isOpen={pauseModalOpen}
        onClose={() => setPauseModalOpen(false)}
        title="Pause Incoming Orders"
      >
        <div className="space-y-4">
          <p className="text-sm text-text-muted leading-relaxed">
            Choose how long to pause orders. While paused, your outlet shows as <strong>Paused</strong> to students and checkout is blocked.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {[15, 30, 60, 0].map(mins => (
              <button
                key={mins}
                type="button"
                onClick={() => setPauseDuration(mins)}
                className={`min-h-[50px] p-3 rounded-xl border text-sm font-mono font-bold transition-colors select-none ${
                  pauseDuration === mins
                    ? 'bg-primary text-white border-primary shadow-soft'
                    : 'bg-surface-alt border-border text-text hover:bg-border'
                }`}
              >
                {mins === 0 ? 'Until I Resume' : `${mins} Minutes`}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button variant="outline" size="md" onClick={() => setPauseModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="md" onClick={handleConfirmPause}>
              Confirm Pause
            </Button>
          </div>
        </div>
      </Modal>

      {/* ==================== REJECT ORDER MODAL ==================== */}
      <Modal
        isOpen={Boolean(rejectModalOrder)}
        onClose={() => setRejectModalOrder(null)}
        title={`Reject Order ${rejectModalOrder?.token}?`}
      >
        <div className="space-y-4">
          <p className="text-sm text-text-muted">
            Please select or type a short reason for declining this order:
          </p>

          <div className="space-y-2">
            {[
              'Kitchen busy / Peak counter rush',
              'Out of specific ingredients',
              'Counter closing for scheduled break',
            ].map(r => (
              <label
                key={r}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-surface-alt border border-border cursor-pointer text-xs font-semibold text-text"
              >
                <input
                  type="radio"
                  name="rejectReason"
                  checked={rejectReason === r}
                  onChange={() => setRejectReason(r)}
                  className="w-4 h-4 text-primary"
                />
                <span>{r}</span>
              </label>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button variant="outline" size="md" onClick={() => setRejectModalOrder(null)}>
              Back
            </Button>
            <Button variant="danger" size="md" onClick={handleConfirmReject}>
              Confirm Reject
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default VendorPortalPage;
