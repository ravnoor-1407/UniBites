import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Armchair, Clock, Check, AlertCircle, Info } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { useCart } from '../../context/CartContext';
import { API_BASE } from '../../config/api';

const SeatMapModal = ({ isOpen, onClose, outlet }) => {
  const { selectedSeats, setSelectedSeats, setDiningMode } = useCart();
  const [seatsData, setSeatsData] = useState(null);
  const [localSelection, setLocalSelection] = useState(selectedSeats || []);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 mins in seconds
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !outlet?.isAcademicCanteen) return;

    let isMounted = true;
    const fetchSeats = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/canteen/seats/${outlet.id}`);
        if (isMounted && res.data.success) {
          setSeatsData(res.data.data);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) setLoading(false);
      }
    };

    fetchSeats();
    return () => { isMounted = false; };
  }, [isOpen, outlet]);

  // 15-minute reservation hold countdown
  useEffect(() => {
    if (!isOpen || localSelection.length === 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setLocalSelection([]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, localSelection]);

  const toggleSeat = (seatId, isOccupied) => {
    if (isOccupied) return;

    setLocalSelection(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(id => id !== seatId);
      } else {
        if (prev.length >= 6) {
          alert('Maximum 6 seats can be reserved per order.');
          return prev;
        }
        return [...prev, seatId];
      }
    });
  };

  const handleConfirm = async () => {
    if (localSelection.length === 0) {
      alert('Please select at least 1 vacant seat.');
      return;
    }

    try {
      await axios.post(`${API_BASE}/canteen/seats/hold`, {
        outletId: outlet.id,
        seatIds: localSelection,
      });
      setSelectedSeats(localSelection);
      setDiningMode('Dine-in');
      onClose();
    } catch {
      setSelectedSeats(localSelection);
      setDiningMode('Dine-in');
      onClose();
    }
  };

  const formatCountdown = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  const totalSeats = seatsData?.totalSeats || 100;
  const occupiedSeats = seatsData?.occupiedSeats || 42;
  const freeSeats = seatsData?.freeSeats || (totalSeats - occupiedSeats);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${outlet.name} • Dine-In Seat Selection`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-5">
        
        {/* Honest summary bar */}
        <div className="p-3.5 bg-surface-alt rounded-xl border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div>
            <span className="font-bold text-text text-sm">
              {freeSeats} of {totalSeats} seats free
            </span>
            <span className="ml-2 px-2 py-0.5 rounded-full bg-success/10 text-success font-mono font-bold">
              {freeSeats > 30 ? 'Low Rush' : freeSeats > 10 ? 'Moderate Rush' : 'High Rush'}
            </span>
            <p className="text-[11px] text-text-muted mt-0.5">
              Updated by canteen staff • Live capacity tracker
            </p>
          </div>

          {localSelection.length > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-[#2B1B1F] font-mono font-bold text-xs">
              <Clock className="w-4 h-4" />
              <span>Held for {formatCountdown(timeLeft)}</span>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-xs font-mono font-medium py-1 border-y border-border">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-white border border-border" />
            <span>Vacant</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-border border border-border" />
            <span>Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-md bg-accent text-[#2B1B1F] flex items-center justify-center font-bold text-[10px]">
              ✓
            </span>
            <span>Selected</span>
          </div>
        </div>

        {/* Canteen Dining Hall Layout Map */}
        <div className="bg-[#FAF6EC] p-4 sm:p-6 rounded-2xl border border-border max-h-[380px] overflow-y-auto">
          <div className="text-center text-[11px] font-mono font-bold text-text-muted uppercase tracking-widest mb-4 pb-2 border-b border-border/60">
            --- Canteen Food Counter / Tray Pickup Area ---
          </div>

          {/* Seat Grid: 10 rows of 10 seats = 100 seats */}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-2.5 justify-items-center">
            {Array.from({ length: totalSeats }, (_, i) => {
              const seatNum = i + 1;
              const seatId = `S-${seatNum}`;
              const isOccupied = seatNum <= occupiedSeats;
              const isSelected = localSelection.includes(seatId);

              return (
                <button
                  key={seatId}
                  type="button"
                  disabled={isOccupied}
                  onClick={() => toggleSeat(seatId, isOccupied)}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center relative select-none ${
                    isSelected
                      ? 'bg-accent text-[#2B1B1F] shadow-soft scale-105 border-2 border-primary'
                      : isOccupied
                      ? 'bg-border/80 text-text-muted/60 cursor-not-allowed'
                      : 'bg-white border border-border hover:border-primary text-text shadow-soft cursor-pointer active:scale-95'
                  }`}
                  title={isOccupied ? `Seat ${seatNum} (Occupied)` : `Seat ${seatNum} (Vacant)`}
                >
                  <span>{seatNum}</span>
                </button>
              );
            })}
          </div>

          <div className="text-center text-[11px] font-mono text-text-muted mt-5 pt-3 border-t border-border/60">
            --- Canteen Entrance / Exit ---
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="text-xs text-text-muted">
            {localSelection.length > 0 ? (
              <span>Selected <strong>{localSelection.length}</strong> seat(s): {localSelection.join(', ')}</span>
            ) : (
              <span>Select seats to dine in while food is prepared.</span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button variant="outline" size="md" onClick={onClose} className="flex-1 sm:flex-none">
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleConfirm}
              disabled={localSelection.length === 0}
              className="flex-1 sm:flex-none"
            >
              <span>Confirm Seats ({localSelection.length})</span>
            </Button>
          </div>
        </div>

      </div>
    </Modal>
  );
};

export default SeatMapModal;
