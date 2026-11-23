import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Clock, 
  MapPin, 
  Star, 
  Search, 
  Armchair, 
  ArrowLeft, 
  AlertCircle,
  Share2,
  Users,
  LayoutGrid,
  List
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useLocation } from '../../context/LocationContext';
import Chip from '../../components/ui/Chip';
import Badge, { DietaryMark } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Stepper from '../../components/ui/Stepper';
import DishImage from '../../components/ui/DishImage';
import SeatMapModal from '../../components/canteen/SeatMapModal';
import OutletConflictModal from '../../components/cart/OutletConflictModal';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';
import { API_BASE } from '../../config/api';

const OutletMenuPage = () => {
  const { id } = useParams();
  const { selectedLocation } = useLocation();
  const { 
    cartItems, 
    addToCart, 
    updateQuantity, 
    getItemQuantity,
    selectedSeats,
    diningMode
  } = useCart();

  const [outlet, setOutlet] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & View Mode within outlet (Default: Grid View)
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [vegOnly, setVegOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Seat modal state
  const [seatModalOpen, setSeatModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchOutlet = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/outlets/${id}?location=${encodeURIComponent(selectedLocation)}`);
        if (isMounted && res.data.success) {
          setOutlet(res.data.data);
          setMenu(res.data.data.menu || []);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load menu for this outlet.');
          setLoading(false);
        }
      }
    };

    fetchOutlet();
    return () => { isMounted = false; };
  }, [id, selectedLocation]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        <Skeleton className="w-full h-56 rounded-2xl" />
        <Skeleton className="w-3/4 h-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-border p-3 space-y-3 shadow-soft">
              <Skeleton className="w-full aspect-[4/3] rounded-xl" />
              <Skeleton className="w-2/3 h-5" />
              <Skeleton className="w-full h-4" />
              <div className="flex justify-between items-center pt-2">
                <Skeleton className="w-16 h-6" />
                <Skeleton className="w-20 h-8 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !outlet) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <EmptyState
          icon={AlertCircle}
          title="Outlet Not Found"
          description={error || "We couldn't locate this campus outlet."}
          actionText="Back to Canteens"
          onAction={() => window.history.back()}
        />
      </div>
    );
  }

  // Derive categories
  const categories = ['All', ...new Set(menu.map(i => i.category).filter(Boolean))];

  // Filtered menu
  const filteredDishes = menu.filter(dish => {
    if (vegOnly && !dish.isVeg) return false;
    if (selectedCategory !== 'All' && dish.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return dish.name.toLowerCase().includes(q) || (dish.description && dish.description.toLowerCase().includes(q));
    }
    return true;
  });

  const isPaused = outlet.isPaused;
  const isCanteen = outlet.isAcademicCanteen;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fadeIn pb-28">
      
      {/* Back button */}
      <Link to="/home" className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-text-muted hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Campus Food Courts</span>
      </Link>

      {/* Outlet Header Card */}
      <div className="bg-white rounded-card border border-border shadow-soft overflow-hidden">
        
        {/* Outlet Cover Banner Photo */}
        <div className="relative h-48 sm:h-64 w-full bg-surface-alt overflow-hidden">
          <img
            src={outlet.image || outlet.coverImage}
            alt={outlet.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-4 left-6 sm:left-8 text-white">
            <span className="px-2.5 py-1 rounded-md bg-primary text-white text-[11px] font-mono font-bold uppercase tracking-wider shadow-soft border border-border/30">
              {outlet.foodCourt || 'Campus Dining'}
            </span>
          </div>
        </div>

        {/* Banner with Outlet Details */}
        <div className="p-6 sm:p-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {isPaused ? (
                  <Badge variant="paused" size="md">Orders Paused</Badge>
                ) : outlet.isOpen ? (
                  <Badge variant="open" size="md">Open Now</Badge>
                ) : (
                  <Badge variant="danger" size="md">Closed</Badge>
                )}
                <span className="text-xs font-mono text-text-muted">{outlet.openHours}</span>
              </div>

              <h1 className="font-serif font-black text-2xl sm:text-3xl lg:text-4xl text-text">
                {outlet.name}
              </h1>
              <p className="text-sm text-text-muted mt-1 max-w-2xl leading-relaxed">
                {outlet.cuisine || outlet.category}
              </p>
            </div>

            {/* Rating if present in data */}
            {outlet.rating && (
              <div className="flex sm:flex-col items-center sm:items-end gap-1.5">
                <span className="px-3 py-1.5 rounded-xl bg-accent text-[#2B1B1F] font-mono font-bold text-sm shadow-soft flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-primary text-primary" />
                  <span>{outlet.rating}</span>
                </span>
                <span className="text-[11px] font-mono text-text-muted">
                  Campus Verified
                </span>
              </div>
            )}
          </div>

          {/* Location & Status Strip */}
          <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-4 text-text-muted">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-primary" />
                <span>{outlet.location}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary" />
                <span>~{outlet.avgPrepTime || 7}m prep time</span>
              </span>
            </div>

            {/* Academic Canteen Seat Status vs Food Court Queue */}
            {isCanteen ? (
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 rounded-lg bg-[#F3EBDD] text-primary font-bold">
                  {outlet.seatsFree !== undefined ? outlet.seatsFree : 58} of 100 seats free
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSeatModalOpen(true)}
                  className="font-mono text-xs"
                >
                  <Armchair className="w-4 h-4 text-accent" />
                  <span>{selectedSeats.length > 0 ? `Held (${selectedSeats.length})` : 'Book Seat'}</span>
                </Button>
              </div>
            ) : (
              <span className={`px-3 py-1 rounded-lg font-bold ${
                outlet.queueStatus === 'Low'
                  ? 'bg-success/10 text-success'
                  : outlet.queueStatus === 'Medium'
                  ? 'bg-warning/10 text-warning'
                  : 'bg-danger/10 text-danger'
              }`}>
                {outlet.queueStatus} Queue ({outlet.queueCount || 3} orders ahead)
              </span>
            )}
          </div>

        </div>

      </div>

      {/* Paused Notice Banner */}
      {isPaused && (
        <div className="p-4 bg-danger/10 border border-danger/30 rounded-xl text-danger text-sm flex items-center gap-3 font-medium">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>This canteen has temporarily paused incoming orders. Menu is available for browsing only.</span>
        </div>
      )}

      {/* Menu Filter & Search Bar */}
      <div className="bg-white p-4 rounded-card border border-border shadow-soft space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search inside outlet */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder={`Search dishes in ${outlet.name}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-alt border border-border rounded-xl text-xs sm:text-sm text-text placeholder-text-muted focus:outline-none focus:bg-white focus:border-primary transition-colors"
            />
          </div>

          {/* Veg Only Toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none self-end sm:self-auto">
            <input
              type="checkbox"
              checked={vegOnly}
              onChange={(e) => setVegOnly(e.target.checked)}
              className="w-4 h-4 text-primary rounded border-border focus:ring-primary"
            />
            <span className="text-xs font-bold text-text">Pure Veg Only</span>
          </label>
        </div>

        {/* Category Filter Chips */}
        {categories.length > 2 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-border">
            {categories.map(cat => (
              <Chip
                key={cat}
                active={selectedCategory === cat}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Chip>
            ))}
          </div>
        )}
      </div>

      {/* Dishes Section: Switchable Grid (Default) or List View */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border/80">
          <div className="flex items-center gap-3">
            <h3 className="font-serif font-bold text-lg sm:text-xl text-text">
              Menu ({filteredDishes.length} Items)
            </h3>
            <span className="text-xs font-mono text-text-muted hidden sm:inline">
              • All prices ₹80 - ₹250
            </span>
          </div>

          {/* View Switcher: Grid View (Default) vs List View */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs font-mono text-text-muted hidden md:inline">View:</span>
            <div className="inline-flex p-1 bg-surface-alt rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-primary text-white shadow-soft'
                    : 'text-text-muted hover:text-text hover:bg-white/60'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Grid</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                aria-label="List view"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  viewMode === 'list'
                    ? 'bg-primary text-white shadow-soft'
                    : 'text-text-muted hover:text-text hover:bg-white/60'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>List</span>
              </button>
            </div>
          </div>
        </div>

        {filteredDishes.length === 0 ? (
          <EmptyState
            title="No dishes found"
            description="Try changing your search term or category filter."
            actionText="View Full Menu"
            onAction={() => {
              setSelectedCategory('All');
              setVegOnly(false);
              setSearchQuery('');
            }}
          />
        ) : viewMode === 'grid' ? (
          /* 1. Grid View (Default) */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-fadeIn">
            {filteredDishes.map(dish => {
              const qty = getItemQuantity(dish.id);
              const isSoldOut = dish.isAvailable === false;

              return (
                <div
                  key={dish.id}
                  className={`group bg-white rounded-2xl border border-border overflow-hidden shadow-card hover:shadow-soft hover:border-primary/40 transition-all flex flex-col justify-between ${
                    isSoldOut ? 'opacity-65 bg-surface-alt/40' : ''
                  }`}
                >
                  {/* Top: 4:3 Aspect Dish Image with Floating Badges */}
                  <div>
                    <div className="relative aspect-[4/3] w-full bg-surface-alt overflow-hidden">
                      <DishImage
                        src={dish.image}
                        name={dish.name}
                        category={dish.category}
                        aspectRatio="aspect-[4/3]"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Top-Left: Dietary Marker */}
                      <div className="absolute top-2.5 left-2.5 bg-white/95 backdrop-blur-sm p-1 rounded-md shadow-soft border border-border/50 flex items-center justify-center">
                        <DietaryMark isVeg={dish.isVeg} size="sm" />
                      </div>

                      {/* Top-Right: Sold Out Badge if unavailable */}
                      {isSoldOut && (
                        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md bg-text/85 backdrop-blur-sm text-white font-mono font-bold text-[10px] uppercase shadow-soft">
                          Sold Out
                        </span>
                      )}

                      {/* Bottom-Right: Price Tag Badge */}
                      <span className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-text/85 backdrop-blur-sm text-white font-mono font-bold text-xs shadow-soft">
                        ₹{dish.price}
                      </span>
                    </div>

                    {/* Dish Details */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono text-text-muted">
                        <span className="uppercase tracking-wider font-semibold text-primary truncate">
                          {dish.category}
                        </span>
                        <span className="flex items-center gap-1 shrink-0">
                          <Clock className="w-3 h-3 text-accent" />
                          <span>~{dish.prepMins || 7}m prep</span>
                        </span>
                      </div>

                      <h4 className="font-serif font-bold text-base text-text group-hover:text-primary transition-colors line-clamp-1">
                        {dish.name}
                      </h4>

                      <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                        {dish.description}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer: Price & Stepper Button */}
                  <div className="px-4 py-3 bg-surface-alt/40 border-t border-border flex items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-text-muted block">Price</span>
                      <span className="font-serif font-bold text-base text-text">
                        ₹{dish.price}
                      </span>
                    </div>

                    <div>
                      {isSoldOut || isPaused ? (
                        <span className="text-xs font-mono font-bold text-text-muted uppercase py-1">
                          Unavailable
                        </span>
                      ) : (
                        <Stepper
                          quantity={qty}
                          onIncrement={() => addToCart(dish, outlet)}
                          onDecrement={() => updateQuantity(dish.id, qty - 1)}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* 2. List View */
          <div className="space-y-3 animate-fadeIn">
            {filteredDishes.map(dish => {
              const qty = getItemQuantity(dish.id);
              const isSoldOut = dish.isAvailable === false;

              return (
                <div
                  key={dish.id}
                  className={`bg-white rounded-card border border-border p-4 shadow-soft flex items-center justify-between gap-4 transition-all ${
                    isSoldOut ? 'opacity-60 bg-surface-alt/40' : 'hover:border-primary/40'
                  }`}
                >
                  {/* Left: Dish Information */}
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2 mb-1">
                      <DietaryMark isVeg={dish.isVeg} size="sm" />
                      <span className="text-[10px] font-mono text-primary uppercase font-bold tracking-wider">
                        {dish.category}
                      </span>
                      {isSoldOut && (
                        <span className="px-2 py-0.5 rounded bg-border text-text-muted font-mono font-bold text-[10px] uppercase">
                          Sold Out
                        </span>
                      )}
                    </div>

                    <h4 className="font-serif font-bold text-base text-text truncate">
                      {dish.name}
                    </h4>

                    <p className="text-xs text-text-muted line-clamp-2 mt-0.5">
                      {dish.description}
                    </p>

                    <div className="flex items-center gap-3 mt-2 font-mono">
                      <span className="font-bold text-sm sm:text-base text-text">
                        ₹{dish.price}
                      </span>
                      <span className="text-xs text-text-muted">•</span>
                      <span className="text-xs text-text-muted flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-accent" />
                        <span>~{dish.prepMins || 7}m prep</span>
                      </span>
                    </div>
                  </div>

                  {/* Right: Dish Image & Add Stepper */}
                  <div className="flex flex-col items-end gap-2.5 shrink-0">
                    <div className="w-24 h-24 sm:w-28 sm:h-24 rounded-xl overflow-hidden">
                      <DishImage
                        src={dish.image}
                        name={dish.name}
                        category={dish.category}
                        aspectRatio="aspect-[4/3]"
                      />
                    </div>

                    <div className="w-24 sm:w-28 flex justify-center">
                      {isSoldOut || isPaused ? (
                        <span className="text-xs font-mono font-bold text-text-muted uppercase py-1">
                          Unavailable
                        </span>
                      ) : (
                        <Stepper
                          quantity={qty}
                          onIncrement={() => addToCart(dish, outlet)}
                          onDecrement={() => updateQuantity(dish.id, qty - 1)}
                        />
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Seat Map Modal for Academic Canteens */}
      {isCanteen && (
        <SeatMapModal
          isOpen={seatModalOpen}
          onClose={() => setSeatModalOpen(false)}
          outlet={outlet}
        />
      )}

      {/* Conflict Modal when switching outlets */}
      <OutletConflictModal />

    </div>
  );
};

export default OutletMenuPage;
