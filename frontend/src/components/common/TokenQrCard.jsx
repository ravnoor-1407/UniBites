import React from 'react';
import { QrCode, CheckCircle2 } from 'lucide-react';

const TokenQrCard = ({ token, orderId, outletName, status }) => {
  return (
    <div className="bg-white rounded-card border-2 border-primary shadow-card p-6 text-center space-y-4 max-w-sm mx-auto">
      <div className="space-y-1">
        <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-text-muted">
          Your Express Counter Token
        </span>
        <div className="py-2 px-4 rounded-xl bg-primary text-white inline-block shadow-soft">
          <span className="font-mono font-black text-3xl sm:text-4xl tracking-wider select-all block">
            {token || 'UB-101'}
          </span>
        </div>
      </div>

      {/* SVG QR Code */}
      <div className="p-3 bg-surface-alt rounded-2xl border border-border inline-block shadow-soft">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 160 160"
          className="w-36 h-36 mx-auto"
        >
          {/* Outer finder patterns */}
          <rect width="160" height="160" fill="#FFFFFF" rx="8" />
          
          {/* Top-left corner */}
          <rect x="16" y="16" width="36" height="36" fill="#7A1F3D" rx="4" />
          <rect x="22" y="22" width="24" height="24" fill="#FFFFFF" rx="2" />
          <rect x="28" y="28" width="12" height="12" fill="#7A1F3D" />

          {/* Top-right corner */}
          <rect x="108" y="16" width="36" height="36" fill="#7A1F3D" rx="4" />
          <rect x="114" y="22" width="24" height="24" fill="#FFFFFF" rx="2" />
          <rect x="120" y="28" width="12" height="12" fill="#7A1F3D" />

          {/* Bottom-left corner */}
          <rect x="16" y="108" width="36" height="36" fill="#7A1F3D" rx="4" />
          <rect x="22" y="114" width="24" height="24" fill="#FFFFFF" rx="2" />
          <rect x="28" y="120" width="12" height="12" fill="#7A1F3D" />

          {/* Matrix data dots (simulated high density) */}
          <rect x="64" y="20" width="8" height="8" fill="#2B1B1F" />
          <rect x="76" y="20" width="8" height="8" fill="#2B1B1F" />
          <rect x="88" y="20" width="8" height="8" fill="#2B1B1F" />
          <rect x="64" y="36" width="8" height="8" fill="#2B1B1F" />
          <rect x="88" y="36" width="8" height="8" fill="#2B1B1F" />
          <rect x="64" y="52" width="8" height="8" fill="#2B1B1F" />
          <rect x="76" y="52" width="8" height="8" fill="#2B1B1F" />

          <rect x="20" y="64" width="8" height="8" fill="#2B1B1F" />
          <rect x="36" y="64" width="8" height="8" fill="#2B1B1F" />
          <rect x="52" y="64" width="8" height="8" fill="#2B1B1F" />
          <rect x="68" y="64" width="24" height="24" fill="#E3A82B" rx="4" />
          <rect x="100" y="64" width="8" height="8" fill="#2B1B1F" />
          <rect x="116" y="64" width="8" height="8" fill="#2B1B1F" />
          <rect x="132" y="64" width="8" height="8" fill="#2B1B1F" />

          <rect x="20" y="80" width="8" height="8" fill="#2B1B1F" />
          <rect x="52" y="80" width="8" height="8" fill="#2B1B1F" />
          <rect x="100" y="80" width="8" height="8" fill="#2B1B1F" />
          <rect x="132" y="80" width="8" height="8" fill="#2B1B1F" />

          <rect x="64" y="96" width="8" height="8" fill="#2B1B1F" />
          <rect x="80" y="96" width="8" height="8" fill="#2B1B1F" />
          <rect x="64" y="112" width="8" height="8" fill="#2B1B1F" />
          <rect x="88" y="112" width="8" height="8" fill="#2B1B1F" />
          <rect x="112" y="112" width="8" height="8" fill="#2B1B1F" />
          <rect x="128" y="112" width="8" height="8" fill="#2B1B1F" />

          <rect x="64" y="128" width="16" height="8" fill="#2B1B1F" />
          <rect x="96" y="128" width="16" height="8" fill="#2B1B1F" />
          <rect x="120" y="128" width="16" height="8" fill="#2B1B1F" />
        </svg>
      </div>

      <div className="space-y-1">
        <p className="font-mono text-xs text-text font-bold">
          Order ID: {orderId}
        </p>
        <p className="text-[11px] text-text-muted">
          Show this token or QR code at {outletName} counter to collect food.
        </p>
      </div>
    </div>
  );
};

export default TokenQrCard;
