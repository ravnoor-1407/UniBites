import React from 'react';

const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: "px-2 py-0.5 text-[11px] rounded-md font-mono",
    md: "px-2.5 py-1 text-xs rounded-lg font-mono font-bold",
    lg: "px-3 py-1.5 text-sm rounded-xl font-mono font-bold",
  };

  const variantClasses = {
    default: "bg-surface-alt text-text border border-border",
    primary: "bg-primary text-white",
    accent: "bg-accent/20 text-[#2B1B1F] border border-accent",
    success: "bg-success/10 text-success border border-success/30",
    warning: "bg-warning/10 text-warning border border-warning/30",
    danger: "bg-danger/10 text-danger border border-danger/30",
    paused: "bg-danger text-white",
    open: "bg-success text-white",
    seats: "bg-[#F3EBDD] text-primary border border-primary/20",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 tracking-tight ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.default} ${className}`}>
      {children}
    </span>
  );
};

export const DietaryMark = ({ isVeg, size = 'md' }) => {
  const isSmall = size === 'sm';
  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 border-2 rounded ${
        isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'
      } ${isVeg ? 'border-success' : 'border-danger'}`}
      title={isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
    >
      <span
        className={`rounded-full ${isSmall ? 'w-1.5 h-1.5' : 'w-2 h-2'} ${
          isVeg ? 'bg-success' : 'bg-danger'
        }`}
      />
    </span>
  );
};

export default Badge;
