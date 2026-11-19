import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  loading = false,
  className = '',
  onClick,
  ...props
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium transition-colors select-none focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";
  
  const sizeClasses = {
    sm: "min-h-[36px] px-3 py-1.5 text-xs rounded-xl gap-1.5",
    md: "min-h-[44px] px-4 py-2.5 text-sm rounded-xl gap-2 font-semibold",
    lg: "min-h-[52px] px-6 py-3.5 text-base rounded-2xl gap-2.5 font-bold",
    vendor: "min-h-[56px] px-6 py-4 text-lg font-bold rounded-2xl gap-3", // Big vendor touch buttons
  };

  const variantClasses = {
    primary: "bg-primary hover:bg-primary-hover text-white shadow-soft",
    accent: "bg-accent hover:bg-accent-hover text-[#2B1B1F] font-bold shadow-soft",
    secondary: "bg-surface-alt hover:bg-border text-text font-semibold",
    outline: "bg-white border border-border hover:bg-surface-alt text-text font-semibold",
    danger: "bg-danger hover:bg-[#A31D1D] text-white font-semibold",
    success: "bg-success hover:bg-[#23633E] text-white font-semibold",
    ghost: "bg-transparent hover:bg-surface-alt text-text",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${baseClasses} ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.primary} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Processing...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
