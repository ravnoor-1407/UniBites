import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Search, MapPin, Filter, X, ChevronRight, UtensilsCrossed } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import { useAuth } from '../../context/AuthContext';
import OutletCard from '../../components/cards/OutletCard';
import DishImage from '../../components/ui/DishImage';
import Chip from '../../components/ui/Chip';
import EmptyState from '../../components/ui/EmptyState';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { API_BASE } from '../../config/api';

const OutletsListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { selectedLocation } = useLocation();

  const [outlets, setOutlets] = useState([]);
  const [foodCourts, setFoodCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCourt, setSelectedCourt] = useState('All');
  const [canteensOnly, setCanteensOnly] = useState(false);

  // Search results for food items & outlets
  const [searchResults, setSearchResults] = useState({ dishes: [], outlets: [] });
  const [isSearching, setIsSearching] = useState(false);

  // Sync searchQuery with searchParams if url changes
  useEffect(() => {
    const q = searchParams.get('search') || '';
    if (q !== searchQuery) {
      setSearchQuery(q);
    }
  }, [searchParams]);

  // Fetch full food courts and initial outlets
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [courtsRes, outletsRes] = await Promise.all([
          axios.get(`${API_BASE}/food-courts`),
          axios.get(`${API_BASE}/outlets?location=${encodeURIComponent(selectedLocation)}`),
        ]);

        if (courtsRes.data.success) setFoodCourts(courtsRes.data.data);
        if (outletsRes.data.success) setOutlets(outletsRes.data.data);
      } catch (err) {
        console.error('Error fetching outlets:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedLocation]);

  // Unified live search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ dishes: [], outlets: [] });
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await axios.get(`${API_BASE}/search?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.data.success) {
          setSearchResults({
            dishes: res.data.dishes || [],
            outlets: res.data.outlets || [],
          });
        }
      } catch (err) {
        console.error('Search error in outlets page:', err);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleDishClick = (dish) => {
    if (!isAuthenticated) {
      navigate('/login', {
        state: {
          message: `Please sign in first to order ${dish.name} from ${dish.outletName}.`,
          from: `/outlet/${dish.outletId}`,
        },
      });
    } else {
      navigate(`/outlet/${dish.outletId}`);
    }
  };

  // Filter outlets when not searching
  const filtered = outlets.filter(o => {
    if (canteensOnly && !o.isAcademicCanteen) return false;
    if (selectedCourt !== 'All' && o.foodCourtId !== selectedCourt) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fadeIn pb-24">
      
      {/* Page Header */}
      <div className="border-b border-border pb-3">
        <h1 className="font-serif font-black text-2xl sm:text-3xl text-text">
          Campus Outlets & Canteens
        </h1>
        <p className="text-xs text-text-muted mt-0.5">
          Browse university dining kiosks and academic block rooftop canteens across campus
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-card border border-border shadow-soft space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search by food item ('noodles', 'dosa'), outlet name or block..."
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery(val);
                if (!val) {
                  setSearchParams({});
                } else {
                  setSearchParams({ search: val });
                }
              }}
              className="w-full pl-10 pr-10 py-2 bg-surface-alt border border-border rounded-xl text-xs sm:text-sm text-text placeholder-text-muted focus:outline-none focus:bg-white focus:border-primary transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchParams({});
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none self-end sm:self-auto">
            <input
              type="checkbox"
              checked={canteensOnly}
              onChange={(e) => setCanteensOnly(e.target.checked)}
              className="w-4 h-4 text-primary rounded border-border focus:ring-primary"
            />
            <span className="text-xs font-bold text-text">100-Seat Academic Canteens Only</span>
          </label>
        </div>

        {/* Quick Food Suggestions */}
        {!searchQuery && (
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono text-text-muted pt-1 scrollbar-none">
            <span className="font-bold text-primary shrink-0">Popular:</span>
            {['Noodles', 'Dosa', 'Burger', 'Pizza', 'Waffle', 'Cold Coffee', 'Biryani', 'Chai'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setSearchQuery(item);
                  setSearchParams({ search: item });
                }}
                className="px-2 py-0.5 rounded bg-surface-alt hover:bg-accent/30 text-text transition-colors shrink-0"
              >
                {item}
              </button>
            ))}
          </div>
        )}

        {/* Food Court Chips */}
        {!searchQuery && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-border">
            <Chip
              active={selectedCourt === 'All'}
              onClick={() => setSelectedCourt('All')}
            >
              All Food Courts
            </Chip>
            {foodCourts.map(court => (
              <Chip
                key={court.id}
                active={selectedCourt === court.id}
                onClick={() => setSelectedCourt(court.id)}
              >
                {court.shortName}
              </Chip>
            ))}
          </div>
        )}
      </div>

      {/* When Search Query is Active: Show Matching Food Items + Outlets */}
      {searchQuery.trim() ? (
        <div className="space-y-8 animate-fadeIn">
          {/* Search Header */}
          <div className="flex items-center justify-between p-3.5 bg-white rounded-xl border border-border shadow-soft">
            <div>
              <p className="font-serif font-bold text-base text-text">
                Results for <span className="text-primary italic">"{searchQuery}"</span>
              </p>
              <p className="text-xs text-text-muted mt-0.5">
                {isSearching
                  ? 'Searching campus kitchens...'
                  : `Found ${searchResults.dishes.length} dishes across ${searchResults.outlets.length} canteens`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSearchParams({});
              }}
              className="text-xs font-mono font-bold text-primary hover:underline"
            >
              Clear Search
            </button>
          </div>

          {/* 1. Matching Food Items */}
          {searchResults.dishes.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-serif font-bold text-lg text-text flex items-center gap-2">
                <span>Matching Food Items</span>
                <span className="px-2 py-0.5 rounded-full bg-accent text-text text-xs font-mono font-bold">
                  {searchResults.dishes.length}
                </span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {searchResults.dishes.map((dish) => (
                  <div
                    key={dish.id}
                    onClick={() => handleDishClick(dish)}
                    className="group cursor-pointer bg-white rounded-2xl border border-border hover:border-primary/50 transition-all p-3 shadow-card flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-surface-alt mb-2.5">
                        <DishImage
                          src={dish.image}
                          alt={dish.name}
                          name={dish.name}
                          category={dish.category}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg bg-text/85 backdrop-blur-sm text-white font-mono font-bold text-xs">
                          ₹{dish.price}
                        </span>
                      </div>
                      <h4 className="font-serif font-bold text-sm text-text group-hover:text-primary transition-colors line-clamp-1">
                        {dish.name}
                      </h4>
                      <p className="text-[11px] font-mono text-primary font-bold mt-0.5 line-clamp-1">
                        📍 {dish.outletName}
                      </p>
                      <p className="text-xs text-text-muted mt-1 line-clamp-2">
                        {dish.description}
                      </p>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-between">
                      <span className="text-[10px] font-mono text-text-muted uppercase">
                        {dish.category}
                      </span>
                      <span className="text-xs font-bold text-primary flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                        Order Ahead <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Outlets Serving the Item */}
          <div className="space-y-3">
            <h3 className="font-serif font-bold text-lg text-text flex items-center gap-2">
              <span>Campus Outlets Serving "{searchQuery}"</span>
              <span className="px-2 py-0.5 rounded-full bg-primary text-white text-xs font-mono font-bold">
                {searchResults.outlets.length}
              </span>
            </h3>

            {searchResults.outlets.length === 0 ? (
              <EmptyState
                title={`No outlets found serving "${searchQuery}"`}
                description="Try searching for another dish like dosa, noodles, burger, waffle, coffee, pasta or thali."
                actionText="Reset Search"
                onAction={() => {
                  setSearchQuery('');
                  setSearchParams({});
                }}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {searchResults.outlets.map((outlet) => (
                  <OutletCard key={outlet.id} outlet={outlet} />
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Standard Outlets Grid when not searching */
        <div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              title="No outlets match your filter"
              description="Try clearing your filter or switching to All Food Courts."
              actionText="Reset Filters"
              onAction={() => {
                setSelectedCourt('All');
                setCanteensOnly(false);
              }}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(outlet => (
                <OutletCard key={outlet.id} outlet={outlet} />
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default OutletsListPage;
