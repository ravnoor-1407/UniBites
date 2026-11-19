import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';
import { 
  CheckCircle2, 
  Clock, 
  MapPin, 
  AlertCircle, 
  ChefHat, 
  Bell, 
  ArrowLeft, 
  Armchair,
  Users,
  Check
} from 'lucide-react';
import TokenQrCard from '../../components/common/TokenQrCard';
import { playReadyChime } from '../../components/ui/Toast';
import Button from '../../components/ui/Button';
import { API_BASE, SOCKET_URL } from '../../config/api';

const stages = [
  { key: 'Placed', label: 'Placed', desc: 'Sent to canteen' },
  { key: 'Accepted', label: 'Accepted', desc: 'Kitchen acknowledged' },
  { key: 'Preparing', label: 'Cooking', desc: 'Chef preparing food' },
  { key: 'Ready for Pickup', label: 'Ready', desc: 'Packed at counter' },
  { key: 'Collected', label: 'Collected', desc: 'Handed over' },
];

const LiveOrderTrackingPage = () => {
  const { id } = useParams();
  const location = useLocation();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [readyAlertShown, setReadyAlertShown] = useState(false);

  // Fetch order
  useEffect(() => {
    let isMounted = true;
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/orders/${id}`);
        if (isMounted && res.data.success) {
          setOrder(res.data.data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError('Could not locate order details.');
          setLoading(false);
        }
      }
    };

    fetchOrder();
    return () => { isMounted = false; };
  }, [id]);

  // Connect to Socket.IO for real-time live updates
  useEffect(() => {
    if (!id) return;
    const socket = io(SOCKET_URL, { transports: ['websocket'] });

    socket.emit('join_order_room', id);

    socket.on('order_status_changed', (updatedOrder) => {
      if (updatedOrder && (updatedOrder.id === id || updatedOrder.orderId === id)) {
        setOrder(prev => ({
          ...prev,
          ...updatedOrder,
          status: updatedOrder.status || prev.status,
        }));

        if (updatedOrder.status === 'Ready for Pickup') {
          playReadyChime();
          // Request browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`🔔 Your UniBites Order ${updatedOrder.token} is Ready!`, {
              body: `Please collect your food at ${updatedOrder.outletName || 'the express counter'}.`,
              icon: '/favicon.svg',
            });
          }
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  // Ask for notification permission once
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4 font-mono text-sm text-text-muted">
        <Clock className="w-8 h-8 animate-spin text-primary mx-auto" />
        <p>Connecting to live kitchen tracker...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-danger mx-auto" />
        <h3 className="font-serif font-bold text-lg text-text">Order Not Found</h3>
        <p className="text-xs text-text-muted">{error || 'This order does not exist.'}</p>
        <Link to="/orders" className="text-xs font-mono font-bold text-primary hover:underline block pt-2">
          View My Orders
        </Link>
      </div>
    );
  }

  const isRejected = order.status === 'Rejected';
  const isReady = order.status === 'Ready for Pickup';
  const isCollected = order.status === 'Collected';

  // Current stage index
  const currentStageIndex = stages.findIndex(s => s.key === order.status);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fadeIn pb-24">
      
      {/* Back button */}
      <Link to="/orders" className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-text-muted hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Order History</span>
      </Link>

      {/* Ready Alert Celebratory Banner */}
      {isReady && (
        <div className="p-4 sm:p-5 bg-success text-white rounded-card shadow-card flex items-center justify-between gap-4 animate-bounce">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6 animate-pulse" />
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg">
                Your Food is Ready for Pickup!
              </h3>
              <p className="text-xs text-[#F3EBDD] font-mono">
                Present Token <strong>{order.token}</strong> at {order.outletName} counter.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={playReadyChime}
            className="px-3 py-1.5 rounded-xl bg-white text-success font-mono font-bold text-xs shrink-0"
          >
            Replay Chime
          </button>
        </div>
      )}

      {/* Rejection notice */}
      {isRejected && (
        <div className="p-4 bg-danger/10 border-2 border-danger rounded-card text-danger text-sm space-y-1">
          <p className="font-bold flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>Order Could Not Be Accepted</span>
          </p>
          <p className="text-xs pl-7">
            Reason: {order.rejectReason || 'Outlet exceeded maximum kitchen capacity.'}
          </p>
        </div>
      )}

      {/* Token & QR Card */}
      <TokenQrCard
        token={order.token}
        orderId={order.id}
        outletName={order.outletName}
        status={order.status}
      />

      {/* 5-Stage Live Stepper */}
      {!isRejected && (
        <div className="bg-white p-5 sm:p-6 rounded-card border border-border shadow-soft space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-base text-text">
              Live Preparation Stages
            </h3>
            <span className="text-xs font-mono font-bold text-primary px-2.5 py-1 bg-surface-alt rounded-lg">
              Status: {order.status}
            </span>
          </div>

          <div className="relative">
            {/* Connecting progress line */}
            <div className="absolute top-5 left-4 right-4 h-1 bg-border -z-0 hidden sm:block" />
            
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 relative z-10">
              {stages.map((stage, idx) => {
                const isPassed = currentStageIndex >= idx;
                const isCurrent = currentStageIndex === idx;

                return (
                  <div
                    key={stage.key}
                    className={`flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2 p-2.5 sm:p-2 rounded-xl border transition-colors ${
                      isCurrent
                        ? 'border-primary bg-primary/5 font-bold shadow-soft'
                        : isPassed
                        ? 'border-success/40 bg-success/5'
                        : 'border-border bg-surface-alt/40 opacity-50'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold shrink-0 ${
                        isCurrent
                          ? 'bg-primary text-white ring-4 ring-primary/20'
                          : isPassed
                          ? 'bg-success text-white'
                          : 'bg-white border border-border text-text-muted'
                      }`}
                    >
                      {isPassed ? <Check className="w-4 h-4" /> : idx + 1}
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-text truncate">
                        {stage.label}
                      </p>
                      <p className="text-[10px] text-text-muted hidden sm:block">
                        {stage.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-between text-xs font-mono text-text-muted">
            <span>Ordered at: {order.orderedAt || 'Just now'}</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-accent" />
              <span>Target: ~{order.prepMins || 7} mins</span>
            </span>
          </div>
        </div>
      )}

      {/* Order Details Breakdown Card */}
      <div className="bg-white p-5 rounded-card border border-border shadow-soft space-y-4">
        <h3 className="font-serif font-bold text-base text-text pb-2 border-b border-border">
          Order Summary
        </h3>

        <div className="space-y-2 text-xs font-mono">
          {order.items?.map((it, idx) => (
            <div key={idx} className="flex justify-between items-center text-text">
              <span className="truncate pr-2">
                {it.quantity}x {it.name}
              </span>
              <span className="font-bold">₹{it.price * it.quantity}</span>
            </div>
          ))}

          <div className="pt-2 border-t border-border/40 flex justify-between text-text-muted">
            <span>Platform Fee</span>
            <span>₹{order.platformFee || 5}</span>
          </div>

          <div className="pt-2 border-t border-border flex justify-between items-baseline text-sm font-bold text-text">
            <span>Total Amount</span>
            <span className="font-mono text-base text-primary">₹{order.totalAmount}</span>
          </div>
        </div>

        {/* Metadata info */}
        <div className="pt-3 border-t border-border/60 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs font-mono">
          <div>
            <span className="text-[10px] text-text-muted block">Payment</span>
            <span className="font-bold text-text">
              {order.paymentMethod} • <span className={order.paymentStatus === 'Paid' ? 'text-success' : 'text-warning'}>{order.paymentStatus}</span>
            </span>
          </div>
          <div>
            <span className="text-[10px] text-text-muted block">Dining Mode</span>
            <span className="font-bold text-text">{order.diningMode}</span>
          </div>
          <div>
            <span className="text-[10px] text-text-muted block">Pickup Slot</span>
            <span className="font-bold text-text truncate block">{order.pickupSlot}</span>
          </div>
        </div>

        {order.selectedSeats?.length > 0 && (
          <div className="p-2.5 bg-surface-alt rounded-xl border border-border text-xs font-mono flex items-center gap-2">
            <Armchair className="w-4 h-4 text-primary" />
            <span>Reserved Canteen Seats: <strong>{order.selectedSeats.join(', ')}</strong></span>
          </div>
        )}
      </div>

    </div>
  );
};

export default LiveOrderTrackingPage;
