import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Sparkles, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Utensils, 
  ArrowRight,
  Filter
} from 'lucide-react';
import { useLocation, campusSpots } from '../../context/LocationContext';
import { useCart } from '../../context/CartContext';
import { calculateBreakFeasibility } from '../../utils/distanceMatrix';
import Chip from '../../components/ui/Chip';
import Badge, { DietaryMark } from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import DishImage from '../../components/ui/DishImage';
import EmptyState from '../../components/ui/EmptyState';
import { API_BASE } from '../../config/api';

const BreakPlannerPage = () => {
  const navigate = useNavigate();
  const { selectedLocation, setLocation } = useLocation();
  const { addToCart } = useCart();

  const [breakLength, setBreakLength] = useState(20);
  const [customBreak, setCustomBreak] = useState('');
  const [isTakeaway, setIsTakeaway] = useState(true);
  const [outlets, setOutlets] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Recommended'); // 'Recommended' | 'Risky' | 'Not Suitable'
  const [vegOnly, setVegOnly] = useState(false);

  const presetBreaks = [10, 15, 20, 25, 30];

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [outletsRes] = await Promise.all([
          axios.get(`${API_BASE}/outlets`),
        ]);

        if (outletsRes.data.success) {
          const loadedOutlets = outletsRes.data.data;
          setOutlets(loadedOutlets);

          // Fetch menus for outlets
          const menuPromises = loadedOutlets.slice(0, 15).map(o => 
            axios.get(`${API_BASE}/outlets/${o.id}`).then(r => r.data.data.menu || []).catch(() => [])
          );
          const menus = await Promise.all(menuPromises);
          const allDishes = menus.flat();
          setMenuItems(allDishes);
        }
      } catch (err) {
        console.error('Error fetching break planner data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const effectiveBreakLength = customBreak ? (parseInt(customBreak, 10) || 20) : breakLength;

  // Run feasibility calculation for each dish
  const rankedDishes = menuItems.map(dish => {
    const parentOutlet = outlets.find(o => o.id === dish.outletId);
    const outletSpot = parentOutlet?.campusSpot || 'Block 14 MSB';
    const queueCount = parentOutlet?.queueCount || 3;

    const feasibility = calculateBreakFeasibility({
      fromLocation: selectedLocation,
      outletSpot,
      queueCount,
      prepMins: dish.prepMins || 7,
      isTakeaway,
      breakLength: effectiveBreakLength,
    });

    return {
      dish,
      outlet: parentOutlet,
      feasibility,
    };
  }).filter(entry => {
    if (vegOnly && !entry.dish.isVeg) return false;
    return Boolean(entry.outlet);
  });

  const recommended = rankedDishes.filter(d => d.feasibility.classification === 'Recommended');
  const risky = rankedDishes.filter(d => d.feasibility.classification === 'Risky');
  const notSuitable = rankedDishes.filter(d => d.feasibility.classification === 'Not Suitable');

  const currentList = activeTab === 'Recommended' ? recommended : activeTab === 'Risky' ? risky : notSuitable;

  const handleOrderNow = (dish, outlet) => {
    addToCart(dish, outlet);
    navigate(`/outlet/${outlet.id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 animate-fadeIn pb-24">
      
      {/* Header */}
      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/20 border border-accent/40 text-primary text-xs font-mono font-bold uppercase mb-2">
          <Sparkles className="w-3.5 h-3.5 text-accent" />
          <span>Signature Smart Algorithm</span>
        </div>
        <h1 className="font-serif font-black text-3xl sm:text-4xl text-primary tracking-tight">
          Campus Break Planner
        </h1>
        <p className="text-sm text-text-muted mt-1 leading-relaxed">
          Matches live preparation times, counter queue delays, and campus walking distances to your schedule so you always make it to class on time.
        </p>
      </div>

      {/* Control Box: Location + Break Length + Dining Style */}
      <div className="bg-white p-5 sm:p-6 rounded-card border border-border shadow-soft space-y-6">
        
        {/* Step 1: Current Location */}
        <div className="space-y-2">
          <label className="block text-xs font-mono font-bold text-text uppercase">
            1. Where are you right now?
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {campusSpots.map(spot => (
              <Chip
                key={spot}
                active={selectedLocation === spot}
                onClick={() => setLocation(spot)}
                icon={MapPin}
              >
                {spot}
              </Chip>
            ))}
          </div>
        </div>

        {/* Step 2: Break Duration Chips */}
        <div className="space-y-2">
          <label className="block text-xs font-mono font-bold text-text uppercase">
            2. Available Break Time (Minutes)
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {presetBreaks.map(min => (
              <button
                key={min}
                type="button"
                onClick={() => {
                  setBreakLength(min);
                  setCustomBreak('');
                }}
                className={`min-h-[44px] px-4 py-2 rounded-xl font-mono text-sm font-bold border transition-colors select-none ${
                  !customBreak && breakLength === min
                    ? 'bg-primary text-white border-primary shadow-soft'
                    : 'bg-surface-alt border-border text-text hover:bg-border/60'
                }`}
              >
                {min} Mins
              </button>
            ))}

            <div className="flex items-center gap-1.5 min-h-[44px] px-3 bg-surface-alt border border-border rounded-xl">
              <span className="text-xs font-mono font-bold text-text-muted">Custom:</span>
              <input
                type="number"
                min="5"
                max="120"
                placeholder="mins"
                value={customBreak}
                onChange={(e) => setCustomBreak(e.target.value)}
                className="w-16 bg-transparent text-sm font-mono font-bold text-text focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Step 3: Dining Style & Veg Filter */}
        <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-text uppercase">
              Dining Style:
            </span>
            <div className="inline-flex p-1 bg-surface-alt rounded-xl border border-border">
              <button
                type="button"
                onClick={() => setIsTakeaway(true)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isTakeaway ? 'bg-primary text-white shadow-soft' : 'text-text hover:text-primary'
                }`}
              >
                Takeaway Parcel (0m eat)
              </button>
              <button
                type="button"
                onClick={() => setIsTakeaway(false)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  !isTakeaway ? 'bg-primary text-white shadow-soft' : 'text-text hover:text-primary'
                }`}
              >
                Dine-In (+8m eat)
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={vegOnly}
              onChange={(e) => setVegOnly(e.target.checked)}
              className="w-4 h-4 text-primary rounded border-border focus:ring-primary"
            />
            <span className="text-xs font-bold text-text">Pure Veg Only</span>
          </label>
        </div>

      </div>

      {/* Results Header Tabs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('Recommended')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors ${
                activeTab === 'Recommended'
                  ? 'bg-success text-white shadow-soft'
                  : 'bg-white border border-border text-text hover:bg-surface-alt'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Recommended ({recommended.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('Risky')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors ${
                activeTab === 'Risky'
                  ? 'bg-warning text-white shadow-soft'
                  : 'bg-white border border-border text-text hover:bg-surface-alt'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Risky ({risky.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('Not Suitable')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors ${
                activeTab === 'Not Suitable'
                  ? 'bg-danger text-white shadow-soft'
                  : 'bg-white border border-border text-text hover:bg-surface-alt'
              }`}
            >
              <XCircle className="w-4 h-4" />
              <span>Too Slow ({notSuitable.length})</span>
            </button>
          </div>

          <span className="text-xs font-mono font-bold text-text-muted hidden sm:inline">
            Break: {effectiveBreakLength} mins from {selectedLocation}
          </span>
        </div>

        {/* Results List */}
        {loading ? (
          <div className="py-12 text-center text-sm font-mono text-text-muted">
            Calculating campus walking times and live kitchen queues...
          </div>
        ) : currentList.length === 0 ? (
          <EmptyState
            icon={Clock}
            title={`No ${activeTab.toLowerCase()} options for ${effectiveBreakLength} minutes`}
            description="Try increasing your break duration or switching from Dine-in to Takeaway parcel."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {currentList.slice(0, 16).map(({ dish, outlet, feasibility }) => {
              const { walkMins, queueWaitMins, cookingMins, eatingMins, totalMins, classification, bufferMins } = feasibility;
              
              return (
                <div
                  key={`${outlet.id}-${dish.id}`}
                  className="bg-white rounded-card border border-border shadow-soft p-4 sm:p-5 flex flex-col justify-between gap-4 hover:border-primary/40 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 shrink-0">
                      <DishImage
                        src={dish.image}
                        name={dish.name}
                        category={dish.category}
                        aspectRatio="aspect-square"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <DietaryMark isVeg={dish.isVeg} size="sm" />
                        <span className="text-[11px] font-mono text-text-muted truncate">
                          {outlet.name}
                        </span>
                      </div>

                      <h4 className="font-serif font-bold text-base text-text truncate">
                        {dish.name}
                      </h4>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono font-bold text-sm text-text">
                          ₹{dish.price}
                        </span>
                        <span className="text-xs text-text-muted">•</span>
                        <span className="text-xs font-mono font-bold text-primary">
                          Total: ~{totalMins} mins
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Breakdown Strip (Formula Breakdown) */}
                  <div className="bg-surface-alt/70 p-3 rounded-xl border border-border/60 text-xs font-mono">
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div>
                        <span className="text-[10px] text-text-muted block">Walk</span>
                        <span className="font-bold text-text">{walkMins}m</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-text-muted block">Queue</span>
                        <span className="font-bold text-text">{queueWaitMins}m</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-text-muted block">Prep</span>
                        <span className="font-bold text-text">{cookingMins}m</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-text-muted block">Eat</span>
                        <span className="font-bold text-text">{eatingMins}m</span>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-border/40 flex items-center justify-between text-[11px]">
                      <span className={bufferMins >= 3 ? 'text-success font-bold' : bufferMins >= 0 ? 'text-warning font-bold' : 'text-danger font-bold'}>
                        {bufferMins >= 0 ? `✅ Arrive ${bufferMins}m before class` : `⚠️ ${Math.abs(bufferMins)}m late to class`}
                      </span>
                      <span className="text-text-muted">{outlet.location.split(',')[0]}</span>
                    </div>
                  </div>

                  <div className="pt-1 flex items-center justify-end">
                    <Button
                      variant={classification === 'Recommended' ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => handleOrderNow(dish, outlet)}
                    >
                      <span>Order Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default BreakPlannerPage;
