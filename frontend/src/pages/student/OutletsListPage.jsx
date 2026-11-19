import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Search, MapPin, Filter } from 'lucide-react';
import { useLocation } from '../../context/LocationContext';
import OutletCard from '../../components/cards/OutletCard';
import Chip from '../../components/ui/Chip';
import EmptyState from '../../components/ui/EmptyState';
import { CardSkeleton } from '../../components/ui/Skeleton';
import { API_BASE } from '../../config/api';

const OutletsListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { selectedLocation } = useLocation();

  const [outlets, setOutlets] = useState([]);
  const [foodCourts, setFoodCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCourt, setSelectedCourt] = useState('All');
  const [canteensOnly, setCanteensOnly] = useState(false);

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

  const filtered = outlets.filter(o => {
    if (canteensOnly && !o.isAcademicCanteen) return false;
    if (selectedCourt !== 'All' && o.foodCourtId !== selectedCourt) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.name.toLowerCase().includes(q) ||
        o.location.toLowerCase().includes(q) ||
        (o.cuisine && o.cuisine.toLowerCase().includes(q))
      );
    }
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
          Browse all 30 university dining spots, food courts and academic canteens
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-card border border-border shadow-soft space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search by outlet name, dish or block location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-surface-alt border border-border rounded-xl text-xs sm:text-sm text-text placeholder-text-muted focus:outline-none focus:bg-white focus:border-primary transition-colors"
            />
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

        {/* Food Court Chips */}
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
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No outlets match your filter"
          description="Try clearing your search query or switching to All Food Courts."
          actionText="Reset Filters"
          onAction={() => {
            setSearchQuery('');
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
  );
};

export default OutletsListPage;
