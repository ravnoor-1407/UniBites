import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const FloatingCartBar = () => {
  const { totalItemCount, grandTotal, activeOutlet } = useCart();
  const location = useLocation();

  // Hide floating bar if on cart or checkout pages or if cart is empty
  if (totalItemCount === 0 || location.pathname === '/cart' || location.pathname === '/checkout' || location.pathname.startsWith('/vendor')) {
    return null;
  }

  return (
    <div className="fixed bottom-20 md:bottom-6 left-0 right-0 z-30 px-4 sm:px-6 pointer-events-none">
      <div className="max-w-lg mx-auto pointer-events-auto">
        <div className="bg-primary text-white p-3 sm:p-3.5 rounded-2xl shadow-card flex items-center justify-between border border-border/20 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent text-[#2B1B1F] flex items-center justify-center font-mono font-bold text-sm shadow-soft">
              {totalItemCount}
            </div>
            <div>
              <p className="font-mono font-bold text-sm sm:text-base leading-tight">
                ₹{grandTotal}
              </p>
              <p className="text-[11px] text-[#F3EBDD] font-medium truncate max-w-[140px] sm:max-w-[200px]">
                {activeOutlet?.name || 'Pre-order Items'}
              </p>
            </div>
          </div>

          <Link
            to="/cart"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-[#2B1B1F] font-bold text-xs uppercase tracking-wider transition-colors shadow-soft"
          >
            <span>View Cart</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default FloatingCartBar;
