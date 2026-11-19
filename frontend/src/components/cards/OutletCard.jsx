import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Clock, MapPin, Users, Armchair, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Badge from '../ui/Badge';
import DishImage from '../ui/DishImage';

const OutletCard = ({ outlet }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  if (!outlet) return null;

  const isPaused = outlet.isPaused;
  const walkMins = outlet.walkMins ?? 5;
  const prepMins = outlet.prepMins ?? 8;
  const queueCount = outlet.queueCount ?? 3;

  const handleCardClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault();
      navigate('/login', {
        state: {
          message: `Please sign in first to explore ${outlet.name} and pre-order food.`,
          from: `/outlet/${outlet.id}`,
        },
      });
    }
  };

  return (
    <Link
      to={`/outlet/${outlet.id}`}
      onClick={handleCardClick}
      className="group block h-full bg-white rounded-card border border-border hover:border-primary/40 transition-all duration-200 overflow-hidden shadow-card flex flex-col"
    >
      {/* Outlet Banner Image */}
      <div className="relative h-44 w-full bg-surface-alt overflow-hidden shrink-0">
        <DishImage
          src={outlet.image || outlet.coverImage}
          alt={outlet.name}
          name={outlet.name}
          category={outlet.category || outlet.cuisine}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Status Overlay Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
          {isPaused ? (
            <span className="px-2.5 py-1 bg-danger text-white text-xs font-mono font-bold rounded-lg uppercase tracking-wider shadow-soft">
              Paused ({outlet.pausedUntil ? 'Busy' : 'Paused'})
            </span>
          ) : (
            <span className="px-2.5 py-1 bg-white/95 text-success text-xs font-mono font-bold rounded-lg uppercase tracking-wider shadow-soft border border-border">
              Open Now
            </span>
          )}

          {outlet.isAcademicCanteen && (
            <span className="px-2 py-1 bg-primary text-white text-xs font-mono font-bold rounded-lg shadow-soft">
              Canteen (100 Seats)
            </span>
          )}
        </div>

        {/* Walk & Prep Time Badge */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-text/80 backdrop-blur-sm text-white rounded-lg text-xs font-mono">
          <Clock className="w-3.5 h-3.5 text-accent" />
          <span>~{walkMins + prepMins} min total</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-serif font-bold text-lg text-text group-hover:text-primary transition-colors line-clamp-1">
                {outlet.name}
              </h3>
              <p className="text-xs text-text-muted mt-0.5 line-clamp-1">
                {outlet.cuisine || outlet.category}
              </p>
            </div>
            {outlet.isPureVeg && (
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-success/10 text-success border border-success/30 shrink-0">
                PURE VEG
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 text-xs text-text-muted mt-2.5">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-primary" />
            <span className="truncate">{outlet.location}</span>
          </div>

          {outlet.matchingDishes && outlet.matchingDishes.length > 0 && (
            <div className="mt-2.5 px-2.5 py-1.5 rounded-lg bg-accent/25 border border-accent/60 text-[11px] font-mono text-text flex items-center gap-1.5 animate-fadeIn">
              <span className="font-bold text-primary shrink-0">Serves:</span>
              <span className="truncate font-semibold text-text">
                {outlet.matchingDishes.map(d => d.name).join(', ')}
              </span>
            </div>
          )}
        </div>

        {/* Footer Metrics */}
        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs font-mono text-text-muted">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1" title="Estimated walking time">
              <Clock className="w-3.5 h-3.5 text-text-muted" />
              {walkMins} min walk
            </span>
            <span className="flex items-center gap-1" title="Live queue">
              <Users className="w-3.5 h-3.5 text-text-muted" />
              {queueCount} ahead
            </span>
          </div>

          {outlet.isAcademicCanteen && (
            <span className="flex items-center gap-1 text-primary font-bold">
              <Armchair className="w-3.5 h-3.5" />
              Seat Map
            </span>
          )}

          {!outlet.isAcademicCanteen && (
            <span className="text-primary font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
              Menu <ChevronRight className="w-3.5 h-3.5" />
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default OutletCard;
