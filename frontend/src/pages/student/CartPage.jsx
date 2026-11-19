import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ShoppingBag, 
  Trash2, 
  Clock, 
  Armchair, 
  Users, 
  ArrowRight, 
  ShieldCheck, 
  Check, 
  Copy,
  Tag,
  AlertCircle
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Stepper from '../../components/ui/Stepper';
import Button from '../../components/ui/Button';
import Badge, { DietaryMark } from '../../components/ui/Badge';
import SeatMapModal from '../../components/canteen/SeatMapModal';
import EmptyState from '../../components/ui/EmptyState';
import { API_BASE } from '../../config/api';

const pickupTimeSlots = [
  'Now (~10 mins)',
  '11:00 AM (Morning Lecture Break)',
  '11:15 AM (Morning Break)',
  '01:00 PM (Lunch Break)',
  '01:15 PM (Lunch Rush Break)',
  '03:30 PM (Lab Interval Break)',
  '05:00 PM (Evening Snack Break)',
];

const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    cartItems, 
    itemsList, 
    activeOutlet, 
    totalItemCount, 
    subtotal, 
    platformFee, 
    grandTotal, 
    pickupSlot, 
    setPickupSlot,
    diningMode,
    setDiningMode,
    selectedSeats,
    isGroupOrder,
    setIsGroupOrder,
    groupCode,
    setGroupCode,
    updateQuantity, 
    removeFromCart, 
    clearCart 
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [seatModalOpen, setSeatModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [groupLoading, setGroupLoading] = useState(false);

  if (totalItemCount === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <EmptyState
          icon={ShoppingBag}
          title="Your Cart is Empty"
          description="Browse campus canteens and pre-order your favorite meal to skip the counter queue."
          actionText="Browse Canteens"
          onAction={() => navigate('/home')}
        />
      </div>
    );
  }

  const discountAmount = couponApplied ? 10 : 0;
  const finalPayable = Math.max(0, grandTotal - discountAmount);
  const isCanteen = activeOutlet?.isAcademicCanteen;

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === 'STUDENT10') {
      setCouponApplied(true);
    } else {
      alert('Invalid coupon. Use code "STUDENT10" for ₹10 off.');
    }
  };

  const handleStartGroupOrder = async () => {
    if (groupCode) return;
    try {
      setGroupLoading(true);
      const res = await axios.post(`${API_BASE}/groups/create`, {
        outletId: activeOutlet?.id,
        hostName: user?.name || 'Aarav Sharma',
        hostRoll: user?.rollNumber || '12204891',
      });
      if (res.data.success) {
        setIsGroupOrder(true);
        setGroupCode(res.data.data.groupCode);
      }
    } catch (err) {
      // Fallback local group code
      const code = Math.random().toString(36).substring(2, 7).toUpperCase();
      setIsGroupOrder(true);
      setGroupCode(code);
    } finally {
      setGroupLoading(false);
    }
  };

  const copyGroupLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/cart?joinGroup=${groupCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fadeIn pb-28">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div>
          <h1 className="font-serif font-black text-2xl sm:text-3xl text-text">
            Your Food Cart
          </h1>
          <p className="text-xs text-text-muted mt-0.5">
            Pre-order from <strong className="text-text font-bold">{activeOutlet?.name}</strong>
          </p>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="text-xs font-mono font-bold text-danger hover:underline flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Cart</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Cart Items & Settings */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* 1. Item List */}
          <div className="bg-white rounded-card border border-border shadow-soft divide-y divide-border overflow-hidden">
            {itemsList.map(({ item, quantity }) => (
              <div key={item.id} className="p-4 flex items-center justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="mt-1">
                    <DietaryMark isVeg={item.isVeg} size="sm" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-serif font-bold text-sm sm:text-base text-text truncate">
                      {item.name}
                    </h4>
                    <p className="text-xs font-mono font-bold text-text mt-0.5">
                      ₹{item.price} each
                    </p>
                    {item.addedBy && item.addedBy !== user?.name && (
                      <span className="inline-block mt-1 text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface-alt text-primary font-bold">
                        Added by {item.addedBy}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="font-mono font-bold text-sm text-text w-16 text-right">
                    ₹{item.price * quantity}
                  </span>
                  <Stepper
                    quantity={quantity}
                    onIncrement={() => updateQuantity(item.id, quantity + 1)}
                    onDecrement={() => updateQuantity(item.id, quantity - 1)}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* 2. Scheduled Pickup Slot Selector */}
          <div className="bg-white p-4 sm:p-5 rounded-card border border-border shadow-soft space-y-2.5">
            <label className="flex items-center justify-between text-xs font-mono font-bold text-text uppercase">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary" />
                <span>Scheduled Pickup Slot</span>
              </span>
              <span className="text-[10px] text-primary bg-accent/20 px-2 py-0.5 rounded font-bold">
                Skip Queue
              </span>
            </label>
            <select
              value={pickupSlot}
              onChange={(e) => setPickupSlot(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-surface-alt border border-border rounded-xl text-xs sm:text-sm font-mono font-bold text-text focus:outline-none focus:bg-white focus:border-primary transition-colors cursor-pointer"
            >
              {pickupTimeSlots.map(slot => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-text-muted">
              Canteen prepares food right before your slot so it is hot and packed on arrival.
            </p>
          </div>

          {/* 3. Dining Mode: Takeaway vs Dine-In */}
          <div className="bg-white p-4 sm:p-5 rounded-card border border-border shadow-soft space-y-3">
            <span className="block text-xs font-mono font-bold text-text uppercase">
              Dining Style
            </span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDiningMode('Takeaway')}
                className={`p-3 rounded-xl border text-left transition-colors select-none ${
                  diningMode === 'Takeaway'
                    ? 'bg-primary text-white border-primary shadow-soft'
                    : 'bg-surface-alt border-border text-text hover:bg-border/60'
                }`}
              >
                <p className="font-bold text-xs sm:text-sm">Takeaway Parcel</p>
                <p className={`text-[11px] mt-0.5 ${diningMode === 'Takeaway' ? 'text-[#F3EBDD]' : 'text-text-muted'}`}>
                  Packed in eco box for express grab-and-go
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setDiningMode('Dine-in');
                  if (isCanteen) setSeatModalOpen(true);
                }}
                className={`p-3 rounded-xl border text-left transition-colors select-none ${
                  diningMode === 'Dine-in'
                    ? 'bg-primary text-white border-primary shadow-soft'
                    : 'bg-surface-alt border-border text-text hover:bg-border/60'
                }`}
              >
                <p className="font-bold text-xs sm:text-sm flex items-center justify-between">
                  <span>Dine-In</span>
                  {selectedSeats.length > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 bg-accent text-[#2B1B1F] rounded">
                      {selectedSeats.length} seats
                    </span>
                  )}
                </p>
                <p className={`text-[11px] mt-0.5 ${diningMode === 'Dine-in' ? 'text-[#F3EBDD]' : 'text-text-muted'}`}>
                  {isCanteen ? 'Choose seats on BookMyShow seat map' : 'Served in dining area'}
                </p>
              </button>
            </div>

            {isCanteen && diningMode === 'Dine-in' && (
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-text-muted">
                  {selectedSeats.length > 0 ? `Reserved: ${selectedSeats.join(', ')}` : 'No seats selected yet'}
                </span>
                <button
                  type="button"
                  onClick={() => setSeatModalOpen(true)}
                  className="text-xs font-mono font-bold text-primary hover:underline flex items-center gap-1"
                >
                  <Armchair className="w-3.5 h-3.5" />
                  <span>{selectedSeats.length > 0 ? 'Change Seats' : 'Select Seats (15m hold)'}</span>
                </button>
              </div>
            )}
          </div>

          {/* 4. Group Ordering Box ("Order with friends") */}
          <div className="bg-white p-4 sm:p-5 rounded-card border border-border shadow-soft space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span className="font-bold text-sm text-text">Group Order with Friends</span>
              </div>
              {!groupCode ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartGroupOrder}
                  loading={groupLoading}
                  className="font-mono text-xs"
                >
                  Start Group
                </Button>
              ) : (
                <span className="text-xs font-mono font-bold px-2 py-0.5 bg-success/10 text-success rounded">
                  Group Active
                </span>
              )}
            </div>

            {groupCode ? (
              <div className="p-3 bg-surface-alt rounded-xl border border-border text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Group Code:</span>
                  <span className="font-mono font-black text-sm text-primary tracking-wider">
                    {groupCode}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-border/60">
                  <span className="text-[11px] text-text-muted">
                    Friends can enter this code to add dishes to your basket.
                  </span>
                  <button
                    type="button"
                    onClick={copyGroupLink}
                    className="px-2.5 py-1 rounded bg-white border border-border text-[11px] font-mono font-bold flex items-center gap-1 hover:bg-border/40"
                  >
                    {copied ? <Check className="w-3 h-3 text-success" /> : <Copy className="w-3 h-3 text-text" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-text-muted">
                Combine orders with roommates or classmates to receive one shared token.
              </p>
            )}
          </div>

        </div>

        {/* Right Col: Bill Summary & Checkout Button */}
        <div className="space-y-5">
          <div className="bg-white p-5 rounded-card border border-border shadow-soft space-y-4">
            <h3 className="font-serif font-bold text-lg text-text pb-2 border-b border-border">
              Bill Summary
            </h3>

            {/* Price lines */}
            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex justify-between text-text">
                <span>Item Subtotal</span>
                <span className="font-bold">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-text-muted">
                <span>Campus Platform Fee</span>
                <span>₹{platformFee}</span>
              </div>

              {couponApplied && (
                <div className="flex justify-between text-success font-bold">
                  <span>Student Discount (STUDENT10)</span>
                  <span>-₹10</span>
                </div>
              )}

              <div className="pt-3 border-t border-border flex justify-between items-baseline text-base font-bold text-text">
                <span className="font-serif font-bold text-lg">To Pay</span>
                <span className="font-mono font-black text-xl text-primary">₹{finalPayable}</span>
              </div>
            </div>

            {/* One Coupon Line */}
            <form onSubmit={handleApplyCoupon} className="pt-2">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Coupon: STUDENT10"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 px-3 py-2 bg-surface-alt border border-border rounded-xl text-xs font-mono uppercase focus:outline-none focus:bg-white focus:border-primary"
                />
                <Button
                  type="submit"
                  variant="outline"
                  size="sm"
                  disabled={couponApplied}
                  className="text-xs font-mono"
                >
                  {couponApplied ? 'Applied' : 'Apply'}
                </Button>
              </div>
            </form>

            {/* Checkout Button */}
            <Button
              variant="accent"
              size="lg"
              onClick={() => navigate('/checkout')}
              className="w-full uppercase tracking-wider text-xs sm:text-sm font-bold shadow-soft"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            <div className="text-center text-[11px] text-text-muted flex items-center justify-center gap-1.5 pt-1">
              <ShieldCheck className="w-4 h-4 text-success" />
              <span>Campus pre-order with verified token guarantee</span>
            </div>
          </div>
        </div>

      </div>

      {/* Seat Map Modal if opened */}
      {activeOutlet && (
        <SeatMapModal
          isOpen={seatModalOpen}
          onClose={() => setSeatModalOpen(false)}
          outlet={activeOutlet}
        />
      )}

    </div>
  );
};

export default CartPage;
