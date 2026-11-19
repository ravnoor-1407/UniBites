import React from 'react';

const Chip = ({
  children,
  active = false,
  onClick,
  icon: Icon,
  badge,
  className = '',
  disabled = false,
}) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors select-none shrink-0 ${
        active
          ? 'bg-primary text-white font-semibold shadow-soft'
          : 'bg-white border border-border text-text hover:bg-surface-alt'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      {Icon && <Icon className={`w-3.5 h-3.5 ${active ? 'text-white' : 'text-text-muted'}`} />}
      <span>{children}</span>
      {badge !== undefined && (
        <span
          className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
            active ? 'bg-white/25 text-white' : 'bg-surface-alt text-text-muted'
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
};

export default Chip;
