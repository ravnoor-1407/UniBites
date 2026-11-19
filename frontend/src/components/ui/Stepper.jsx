import React from 'react';
import { Plus, Minus } from 'lucide-react';

const Stepper = ({
  quantity = 0,
  onIncrement,
  onDecrement,
  min = 0,
  max = 99,
  disabled = false,
  className = '',
}) => {
  if (quantity === 0) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={onIncrement}
        className={`min-h-[38px] px-4 py-1.5 rounded-xl bg-white border border-border text-primary font-bold text-xs uppercase tracking-wider hover:bg-surface-alt shadow-soft transition-colors select-none flex items-center justify-center gap-1.5 ${
          disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-95'
        } ${className}`}
      >
        <span>Add</span>
        <Plus className="w-3.5 h-3.5" />
      </button>
    );
  }

  return (
    <div className={`inline-flex items-center bg-primary text-white rounded-xl shadow-soft select-none overflow-hidden h-[38px] ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={onDecrement}
        className="w-9 h-full flex items-center justify-center hover:bg-primary-hover active:bg-[#4E1226] transition-colors focus:outline-none"
        aria-label="Decrease quantity"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>
      <span className="w-8 text-center font-mono font-bold text-xs sm:text-sm">
        {quantity}
      </span>
      <button
        type="button"
        disabled={disabled || quantity >= max}
        onClick={onIncrement}
        className="w-9 h-full flex items-center justify-center hover:bg-primary-hover active:bg-[#4E1226] transition-colors focus:outline-none"
        aria-label="Increase quantity"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default Stepper;
