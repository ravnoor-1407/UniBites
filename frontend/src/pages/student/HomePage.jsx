import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Sparkles, 
  Search, 
  MapPin, 
  Clock, 
  ChevronRight, 
  ArrowRight,
  ChefHat,
  UtensilsCrossed, 
  AlertCircle
} from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useAuth } from '../../context/AuthContext';
import OutletCard from '../../components/cards/OutletCard';
import Chip from '../../components/ui/Chip';
import Skeleton, { CardSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { API_BASE } from '../../config/api';

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedLocation } = useLocation();

  const [foodCourts, setFoodCourts] = useState([]);
  const [outlets, setOutlets] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourtFilter, setSelectedCourtFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Outlets, Food Courts and Active Orders
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        const [courtsRes, outletsRes, ordersRes] = await Promise.all([
          axios.get(`${API_BASE}/food-courts`),
          axios.get(`${API_BASE}/outlets?location=${encodeURIComponent(selectedLocation)}`),
          axios.get(`${API_BASE}/orders?studentRoll=${user?.rollNumber || '12204891'}`).catch(() => ({ data: { data: [] } })),
        ]);

        if (isMounted) {
          if (courtsRes.data.success) setFoodCourts(courtsRes.data.data);
          if (outletsRes.data.success) setOutlets(outletsRes.data.data);

          // Find active order (Placed, Accepted, Preparing, Ready for Pickup)
          const allOrders = ordersRes.data.data || [];
          const active = allOrders.find(o => 
            ['Placed', 'Accepted', 'Preparing', 'Ready for Pickup'].includes(o.status)
          );
          setActiveOrder(active || null);

          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load campus canteens. Please check server connection.');
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [selectedLocation, user]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const el = document.getElementById('campus-outlets-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      } else {
        navigate(`/outlets?search=${encodeURIComponent(searchQuery.trim())}`);
      }
    }
  };

  // Filter outlets by food court & search
  const filteredOutlets = outlets.filter(o => {
    if (selectedCourtFilter !== 'All' && o.foodCourtId !== selectedCourtFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.name.toLowerCase().includes(q) || 
        (o.cuisine && o.cuisine.toLowerCase().includes(q)) ||
        (o.category && o.category.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10 animate-fadeIn pb-24">
      
      {/* 1. Active Order Banner (If student has placed an order) */}
      {activeOrder && (
        <div className="p-4 sm:p-5 bg-white rounded-card border-2 border-primary shadow-card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center font-mono font-bold text-sm shadow-soft shrink-0">
              {activeOrder.token}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-text-muted">
                  Active Order • {activeOrder.status}
                </span>
              </div>
              <h3 className="font-serif font-bold text-base text-text">
                {activeOrder.outletName}
              </h3>
              <p className="text-xs text-text-muted">
                {activeOrder.items?.map(i => `${i.quantity}x ${i.name}`).join(', ')}
              </p>
            </div>
          </div>

          <Link
            to={`/orders/${activeOrder.id}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-text font-bold text-xs uppercase tracking-wider transition-colors shadow-soft"
          >
            <span>Live Tracking</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* 2. Hero Section: "Order Smart. Skip the Queue. Never Miss a Class." */}
      <section className="relative pt-2 pb-6 lg:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column: Heading, Subtitle, Search Bar, CTAs */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Tag chip */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/20 border border-accent/40 text-primary text-xs font-mono font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-accent-hover" />
              <span>Smart Campus Food Ordering & Queue Management</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-serif font-bold text-4xl sm:text-5xl lg:text-6xl text-text leading-[1.12] tracking-tight">
              Order Smart.{' '}
              <span className="font-serif italic font-normal text-primary block sm:inline">
                Skip the Queue.
              </span>{' '}
              <span className="block text-text">Never Miss a Class.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-text-muted text-base sm:text-lg leading-relaxed max-w-xl font-sans">
              UniBites lets you pre-order meals from your campus canteens, synchronizes food preparation with your lecture break timetable, and alerts you the second your digital token is ready.
            </p>

            {/* Inline Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative max-w-lg">
              <div className="flex items-center bg-white border border-border rounded-2xl p-1.5 shadow-card focus-within:border-primary/50 transition-all">
                <Search className="w-5 h-5 text-text-muted ml-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Search 'Cold Coffee', 'Dosa', 'Paneer Roll'..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 text-sm text-text placeholder-text-muted/70 bg-transparent focus:outline-none font-sans"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-mono font-bold text-xs uppercase tracking-wider transition-colors shadow-soft shrink-0"
                >
                  Find Food
                </button>
              </div>
            </form>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('campus-outlets-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  else navigate('/outlets');
                }}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-mono font-bold text-xs uppercase tracking-wider transition-colors shadow-card"
              >
                <span>Explore Campus Outlets</span>
                <ArrowRight className="w-4 h-4 text-accent" />
              </button>

              <Link
                to="/break-planner"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-surface-alt text-text border border-border font-mono font-bold text-xs uppercase tracking-wider transition-colors shadow-soft"
              >
                <Clock className="w-4 h-4 text-accent-hover" />
                <span>Break-Time Planner</span>
              </Link>
            </div>

            {/* Quick Link to Vendor Portal */}
            <div className="pt-1">
              <Link
                to="/vendor"
                className="inline-flex items-center gap-2 text-xs font-mono text-text-muted hover:text-primary transition-colors group"
              >
                <ChefHat className="w-4 h-4 text-accent-hover group-hover:scale-110 transition-transform" />
                <span>Vendor Portal (Kitchen Terminal)</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase Card with Floating Badges */}
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end mt-6 lg:mt-0">
            <div className="relative w-full max-w-md">
              
              {/* Floating Badge Top-Left: Active Token Preview */}
              <div className="absolute -top-4 -left-4 sm:-left-6 z-20 bg-white/95 backdrop-blur-md border border-border rounded-xl p-2.5 shadow-card flex items-center gap-2.5 animate-fadeIn">
                <span className="px-2 py-1 rounded-md bg-accent text-text font-mono font-bold text-[11px]">
                  TOKEN UB-104
                </span>
                <div>
                  <p className="font-serif font-bold text-xs text-text line-clamp-1">
                    Belgian Chocolate Waffle
                  </p>
                  <p className="text-[10px] font-mono font-bold text-success flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-ping inline-block" />
                    Ready for Pickup at Kiosk #1
                  </p>
                </div>
              </div>

              {/* Main Showcase Image Card */}
              <div className="relative rounded-2xl overflow-hidden border border-border shadow-card bg-surface-alt aspect-[4/3] group">
                <img
                  src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=800&q=80"
                  alt="Tech Cafe & Central Canteen"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-text/90 via-text/20 to-transparent flex flex-col justify-end p-5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-accent text-text text-[10px] font-mono font-bold uppercase tracking-wider w-fit mb-1.5 shadow-soft">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    Live Queue Radar
                  </div>
                  <h3 className="font-serif font-bold text-lg text-white">
                    Tech Cafe & Central Canteen
                  </h3>
                  <p className="text-xs text-[#F3EBDD] font-sans mt-0.5">
                    Campus Student Activity Center • Open Now
                  </p>
                </div>
              </div>

              {/* Floating Badge Bottom-Right: Break Recommendation */}
              <div className="absolute -bottom-4 -right-2 sm:-right-4 z-20 bg-white/95 backdrop-blur-md border border-border rounded-xl p-3 shadow-card max-w-[240px] animate-fadeIn">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="px-1.5 py-0.5 rounded bg-success/15 text-success font-mono font-bold text-[10px]">
                    20m Class Break
                  </span>
                  <span className="text-[10px] font-mono font-bold text-success uppercase">
                    Recommended
                  </span>
                </div>
                <p className="font-serif font-bold text-xs text-text">
                  Crispy Masala Dosa
                </p>
                <p className="text-[10px] font-mono text-text-muted mt-0.5">
                  Total transit + prep: ~11 mins
                </p>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* 3. Food Court Selector Chips */}
      <div id="campus-outlets-section" className="space-y-4 pt-4 border-t border-border">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-serif font-bold text-2xl text-text">
              Explore Campus Food Hubs
            </h2>
            <p className="text-xs text-text-muted mt-0.5">
              Select a food court zone to browse kitchens and canteens
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-primary shrink-0">
            30 Outlets Across LPU
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <Chip
            active={selectedCourtFilter === 'All'}
            onClick={() => setSelectedCourtFilter('All')}
          >
            All Food Courts
          </Chip>
          {foodCourts.map(court => (
            <Chip
              key={court.id}
              active={selectedCourtFilter === court.id}
              onClick={() => setSelectedCourtFilter(court.id)}
            >
              {court.shortName}
            </Chip>
          ))}
        </div>
      </div>

      {/* 4. Outlets Grouped by Food Court */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          icon={AlertCircle}
          title="Could not connect to UniBites API"
          description={error}
          actionText="Retry Connection"
          onAction={() => window.location.reload()}
        />
      ) : filteredOutlets.length === 0 ? (
        <EmptyState
          title="No food outlets found"
          description="Try selecting a different food court or clear your search filter."
          actionText="View All Outlets"
          onAction={() => {
            setSelectedCourtFilter('All');
            setSearchQuery('');
          }}
        />
      ) : selectedCourtFilter !== 'All' ? (
        /* Flat Grid when a specific court is selected */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOutlets.map(outlet => (
            <OutletCard key={outlet.id} outlet={outlet} />
          ))}
        </div>
      ) : (
        /* Grouped Sections by Food Court when 'All' is selected */
        <div className="space-y-12">
          {foodCourts.map(court => {
            const courtOutlets = outlets.filter(o => o.foodCourtId === court.id);
            if (courtOutlets.length === 0) return null;

            return (
              <section key={court.id} className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 pb-2 border-b border-border">
                  <div>
                    <h3 className="font-serif font-bold text-xl text-text">
                      {court.name}
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      {court.description}
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-primary shrink-0">
                    {courtOutlets.length} Outlets • {court.badge}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {courtOutlets.map(outlet => (
                    <OutletCard key={outlet.id} outlet={outlet} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

    </div>
  );
};

export default HomePage;
