import React, { useState } from 'react';
import { Link, useNavigate, useLocation as useRouteLocation } from 'react-router-dom';
import { 
  MapPin, 
  Search, 
  ShoppingBag, 
  User, 
  LogOut, 
  ChevronDown,
  Sparkles,
  UtensilsCrossed,
  Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { useCart } from '../../context/CartContext';

const Navbar = ({ onSearchClick }) => {
  const { user, logout } = useAuth();
  const { selectedLocation, setLocation, campusSpots } = useLocation();
  const { totalItemCount, grandTotal } = useCart();
  const navigate = useNavigate();
  const routeLocation = useRouteLocation();

  const [locationOpen, setLocationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/outlets?search=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const navLinks = [
    { to: '/home', label: 'Home' },
    { to: '/break-planner', label: 'Break Planner', icon: Sparkles },
    { to: '/outlets', label: 'Outlets' },
    { to: '/orders', label: 'My Orders' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-border shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Brand Logo & Location Picker */}
          <div className="flex items-center gap-4 lg:gap-6 shrink-0">
            <Link to="/home" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-soft group-hover:bg-primary-hover transition-colors">
                <UtensilsCrossed className="w-5 h-5 text-accent" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-black text-xl sm:text-2xl text-primary tracking-tight leading-none">
                  UniBites
                </span>
                <span className="text-[10px] font-mono text-text-muted font-bold tracking-widest uppercase">
                  Campus Pre-Order
                </span>
              </div>
            </Link>

            {/* Campus Location Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLocationOpen(!locationOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-alt hover:bg-border/60 transition-colors text-left"
              >
                <MapPin className="w-4 h-4 text-primary shrink-0" />
                <span className="text-xs font-semibold text-text max-w-[120px] sm:max-w-[160px] truncate">
                  {selectedLocation}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-text-muted shrink-0" />
              </button>

              {locationOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setLocationOpen(false)} />
                  <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-card border border-border p-1.5 z-20 animate-fadeIn">
                    <div className="px-3 py-2 text-[11px] font-mono font-bold text-text-muted uppercase border-b border-border mb-1">
                      Where are you now?
                    </div>
                    {campusSpots.map(spot => (
                      <button
                        key={spot}
                        type="button"
                        onClick={() => {
                          setLocation(spot);
                          setLocationOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                          selectedLocation === spot
                            ? 'bg-primary text-white font-bold'
                            : 'text-text hover:bg-surface-alt'
                        }`}
                      >
                        <span>{spot}</span>
                        {selectedLocation === spot && <span className="text-[10px] font-mono">Current</span>}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-2">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input
                type="text"
                placeholder="Search food, dishes or canteens..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-surface-alt border border-border rounded-xl text-sm text-text placeholder-text-muted focus:outline-none focus:bg-white focus:border-primary transition-colors"
              />
            </form>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map(link => {
              const isActive = routeLocation.pathname === link.to;
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    isActive ? 'text-primary font-bold' : 'text-text hover:text-primary'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 text-accent" />}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons: Cart & Profile */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Desktop Cart Button */}
            <Link
              to="/cart"
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-accent hover:bg-accent-hover text-text font-bold text-xs shadow-soft transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-primary" />
              <span className="hidden sm:inline">Cart</span>
              {totalItemCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-primary text-white text-[11px] font-mono">
                  {totalItemCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="w-10 h-10 rounded-xl bg-surface-alt border border-border hover:bg-border/60 flex items-center justify-center text-text transition-colors"
              >
                <User className="w-5 h-5 text-primary" />
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-card border border-border p-2 z-20 animate-fadeIn">
                    <div className="px-3 py-2 border-b border-border mb-1.5">
                      <p className="font-bold text-sm text-text truncate">{user?.name || 'Student'}</p>
                      <p className="text-xs font-mono text-text-muted">{user?.rollNumber || user?.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-text hover:bg-surface-alt flex items-center gap-2"
                    >
                      <User className="w-4 h-4 text-text-muted" />
                      <span>My Profile</span>
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setProfileOpen(false)}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-text hover:bg-surface-alt flex items-center gap-2"
                    >
                      <Clock className="w-4 h-4 text-text-muted" />
                      <span>My Orders</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setProfileOpen(false);
                        logout();
                        navigate('/login');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-xs font-semibold text-danger hover:bg-danger/10 flex items-center gap-2 mt-1 border-t border-border pt-2"
                    >
                      <LogOut className="w-4 h-4 text-danger" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;
