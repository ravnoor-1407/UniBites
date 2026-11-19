import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, 
  Clock, 
  MapPin, 
  CreditCard, 
  CheckCircle2, 
  ShieldAlert, 
  QrCode, 
  Banknote,
  Users,
  Armchair
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import { API_BASE } from '../../config/api';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    itemsList, 
    activeOutlet, 
    totalItemCount, 
    subtotal, 
    platformFee, 
    grandTotal, 
    pickupSlot, 
    diningMode, 
    selectedSeats,
    isGroupOrder,
    groupCode,
    clearCart 
  } = useCart();

  const [paymentMethod, setPaymentMethod] = useState('UPI (Simulated)'); // 'UPI (Simulated)' | 'Pay at pickup'
  const [studentName, setStudentName] = useState(user?.name || 'Aarav Sharma');
  const [studentRoll, setStudentRoll] = useState(user?.rollNumber || '12204891');
  const [studentPhone, setStudentPhone] = useState(user?.phone || '9876543210');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (totalItemCount === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="text-sm text-text-muted mb-4">No active cart to checkout.</p>
        <Link to="/home" className="text-xs font-mono font-bold text-primary hover:underline">
          Return to Campus Food Courts
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const payload = {
        outletId: activeOutlet.id,
        items: itemsList.map(({ item, quantity }) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity,
          isVeg: item.isVeg,
          prepMins: item.prepMins,
          addedBy: item.addedBy || studentName,
        })),
        diningMode,
        pickupSlot,
        paymentMethod,
        studentName,
        studentRoll,
        studentPhone,
        isGroupOrder,
        groupCode,
        selectedSeats,
      };

      const res = await axios.post(`${API_BASE}/orders`, payload);

      if (res.data.success && res.data.data) {
        const order = res.data.data;
        clearCart();
        navigate(`/orders/${order.id}`, { replace: true, state: { justPlaced: true } });
      } else {
        setError(res.data.message || 'Failed to place order.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Server error while placing order.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fadeIn pb-24">
      
      {/* Back button */}
      <Link to="/cart" className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-text-muted hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Cart</span>
      </Link>

      <div className="border-b border-border pb-3">
        <h1 className="font-serif font-black text-2xl sm:text-3xl text-text">
          Confirm & Pay
        </h1>
        <p className="text-xs text-text-muted mt-0.5">
          Review your order details and choose your payment method
        </p>
      </div>

      {error && (
        <div className="p-4 bg-danger/10 border border-danger/30 rounded-xl text-danger text-xs font-medium flex items-start gap-2 animate-fadeIn">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="space-y-6">
        
        {/* 1. Order Summary Card */}
        <div className="bg-white p-5 rounded-card border border-border shadow-soft space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h3 className="font-serif font-bold text-lg text-text">
                {activeOutlet?.name}
              </h3>
              <p className="text-xs text-text-muted flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span>{activeOutlet?.location}</span>
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-surface-alt font-mono text-xs font-bold text-text">
              {totalItemCount} Items
            </span>
          </div>

          {/* Dish list */}
          <div className="space-y-2 text-xs font-mono">
            {itemsList.map(({ item, quantity }) => (
              <div key={item.id} className="flex justify-between items-center text-text">
                <span className="truncate pr-2">
                  {quantity}x {item.name}
                </span>
                <span className="font-bold shrink-0">₹{item.price * quantity}</span>
              </div>
            ))}
          </div>

          {/* Extra details */}
          <div className="pt-3 border-t border-border/60 flex flex-wrap gap-4 text-xs font-mono text-text-muted">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-primary" />
              <span>Pickup: <strong className="text-text font-bold">{pickupSlot}</strong></span>
            </span>
            <span>•</span>
            <span>
              Mode: <strong className="text-text font-bold">{diningMode}</strong>
            </span>
            {selectedSeats.length > 0 && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 text-primary font-bold">
                  <Armchair className="w-3.5 h-3.5" />
                  <span>Seats: {selectedSeats.join(', ')}</span>
                </span>
              </>
            )}
            {isGroupOrder && groupCode && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 text-primary font-bold">
                  <Users className="w-3.5 h-3.5" />
                  <span>Group {groupCode}</span>
                </span>
              </>
            )}
          </div>
        </div>

        {/* 2. Student Identification */}
        <div className="bg-white p-5 rounded-card border border-border shadow-soft space-y-4">
          <h3 className="font-serif font-bold text-base text-text">
            Student Contact Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-mono font-bold text-text uppercase mb-1">
                Name
              </label>
              <input
                type="text"
                required
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-3 py-2 bg-surface-alt border border-border rounded-xl text-xs sm:text-sm text-text focus:outline-none focus:bg-white focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono font-bold text-text uppercase mb-1">
                Roll Number
              </label>
              <input
                type="text"
                required
                value={studentRoll}
                onChange={(e) => setStudentRoll(e.target.value)}
                className="w-full px-3 py-2 bg-surface-alt border border-border rounded-xl text-xs sm:text-sm text-text font-mono uppercase focus:outline-none focus:bg-white focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono font-bold text-text uppercase mb-1">
                Phone
              </label>
              <input
                type="tel"
                required
                value={studentPhone}
                onChange={(e) => setStudentPhone(e.target.value)}
                className="w-full px-3 py-2 bg-surface-alt border border-border rounded-xl text-xs sm:text-sm text-text font-mono focus:outline-none focus:bg-white focus:border-primary"
              />
            </div>
          </div>
        </div>

        {/* 3. Payment Method Choice */}
        <div className="bg-white p-5 rounded-card border border-border shadow-soft space-y-4">
          <div className="flex items-baseline justify-between">
            <h3 className="font-serif font-bold text-base text-text">
              Select Payment Method
            </h3>
            <span className="text-[11px] font-mono text-text-muted">
              Campus Approved
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Option A: Pay Online (UPI, Simulated) */}
            <label
              className={`p-4 rounded-xl border flex flex-col justify-between gap-3 cursor-pointer select-none transition-colors ${
                paymentMethod === 'UPI (Simulated)'
                  ? 'border-primary bg-primary/5 shadow-soft ring-2 ring-primary/20'
                  : 'border-border bg-surface-alt hover:bg-border/40'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <QrCode className="w-5 h-5 text-primary" />
                  <span className="font-bold text-sm text-text">Pay Online (UPI)</span>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'UPI (Simulated)'}
                  onChange={() => setPaymentMethod('UPI (Simulated)')}
                  className="w-4 h-4 text-primary"
                />
              </div>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Instant digital confirmation. <em>(Simulated payment for campus demo — no actual bank deduction)</em>.
              </p>
            </label>

            {/* Option B: Pay at Pickup */}
            <label
              className={`p-4 rounded-xl border flex flex-col justify-between gap-3 cursor-pointer select-none transition-colors ${
                paymentMethod === 'Pay at pickup'
                  ? 'border-primary bg-primary/5 shadow-soft ring-2 ring-primary/20'
                  : 'border-border bg-surface-alt hover:bg-border/40'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <Banknote className="w-5 h-5 text-accent" />
                  <span className="font-bold text-sm text-text">Pay at Pickup Counter</span>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === 'Pay at pickup'}
                  onChange={() => setPaymentMethod('Pay at pickup')}
                  className="w-4 h-4 text-primary"
                />
              </div>
              <p className="text-[11px] text-text-muted leading-relaxed">
                Pay via Cash or UPI directly to the vendor when collecting your food at the counter.
              </p>
            </label>
          </div>
        </div>

        {/* 4. Total & Submit Button */}
        <div className="bg-white p-5 rounded-card border border-border shadow-soft flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono text-text-muted block">Total Payable Amount</span>
            <span className="font-mono font-black text-2xl text-primary">₹{grandTotal}</span>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full sm:w-auto uppercase tracking-wider text-xs sm:text-sm font-bold shadow-card px-8"
          >
            <span>Confirm & Place Order</span>
          </Button>
        </div>

      </form>

    </div>
  );
};

export default CheckoutPage;
