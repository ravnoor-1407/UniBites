import React, { useState } from 'react';
import imageReport from '../../data/imageReport.json';
import { CheckCircle2, AlertTriangle, ChevronDown, ChevronUp, Image as ImageIcon } from 'lucide-react';

export default function ImageCheckPage() {
  const [filter, setFilter] = useState('all'); // all, verified, placeholder
  const [expandedKeys, setExpandedKeys] = useState({});

  const totalKeys = imageReport.length;
  const verifiedCount = imageReport.filter((i) => i.status === 'viewed and matches').length;
  const placeholderCount = imageReport.filter((i) => i.status === 'placeholder').length;

  const toggleExpand = (key) => {
    setExpandedKeys((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const filteredItems = imageReport.filter((item) => {
    if (filter === 'verified') return item.status === 'viewed and matches';
    if (filter === 'placeholder') return item.status === 'placeholder';
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FBF6EC] text-[#2B1B1F] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header and Audit Summary */}
        <div className="bg-white border border-[#E7DCC8] rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#7A1F3D] text-[#FBF6EC] uppercase tracking-wider mb-2">
                Dev Tool • Internal Image Audit
              </span>
              <h1 className="text-3xl font-serif font-black text-[#7A1F3D]">
                UniBites Menu Visual Gallery
              </h1>
              <p className="text-sm text-[#6B5A5E] mt-1">
                Visual audit of all {totalKeys} unique culinary image keys across 366 campus dishes.
              </p>
            </div>

            {/* Metric Pills */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
                  filter === 'all'
                    ? 'bg-[#7A1F3D] text-white border-[#7A1F3D] shadow-sm'
                    : 'bg-[#FBF6EC] text-[#2B1B1F] border-[#E7DCC8] hover:bg-white'
                }`}
              >
                All Keys ({totalKeys})
              </button>
              <button
                onClick={() => setFilter('verified')}
                className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  filter === 'verified'
                    ? 'bg-[#2E7D4F] text-white border-[#2E7D4F] shadow-sm'
                    : 'bg-[#FBF6EC] text-[#2E7D4F] border-[#E7DCC8] hover:bg-white'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                Verified ({verifiedCount})
              </button>
              <button
                onClick={() => setFilter('placeholder')}
                className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all flex items-center gap-1.5 ${
                  filter === 'placeholder'
                    ? 'bg-[#C62828] text-white border-[#C62828] shadow-sm'
                    : 'bg-[#FBF6EC] text-[#C62828] border-[#E7DCC8] hover:bg-white'
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                Placeholders ({placeholderCount})
              </button>
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => {
            const isPlaceholder = item.status === 'placeholder';
            const isExpanded = !!expandedKeys[item.imageKey];

            return (
              <div
                key={item.imageKey}
                className={`bg-white rounded-2xl overflow-hidden transition-all shadow-sm flex flex-col ${
                  isPlaceholder
                    ? 'border-4 border-[#C62828] ring-2 ring-[#C62828]/20'
                    : 'border border-[#E7DCC8] hover:border-[#7A1F3D]'
                }`}
              >
                {/* Image Container 1:1 Aspect Ratio */}
                <div className="relative aspect-square bg-[#F3EBDD] overflow-hidden border-b border-[#E7DCC8]">
                  <img
                    src={`/images/menu/${item.imageKey}.webp`}
                    alt={item.imageKey}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-2.5 right-2.5">
                    {isPlaceholder ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#C62828] text-white shadow-md">
                        <AlertTriangle className="w-3 h-3" />
                        Placeholder
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#2E7D4F] text-white shadow-md">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified Photo
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white font-mono text-[10px]">
                    {item.size_kb} KB
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h2 className="font-mono font-bold text-sm text-[#7A1F3D] break-all">
                      {item.imageKey}
                    </h2>
                    <p className="text-xs text-[#6B5A5E] mt-1 line-clamp-2">
                      {item.checklist}
                    </p>
                  </div>

                  {/* Dishes Linked */}
                  <div className="border-t border-[#E7DCC8] pt-2.5">
                    <button
                      onClick={() => toggleExpand(item.imageKey)}
                      className="w-full flex items-center justify-between text-xs font-semibold text-[#2B1B1F] hover:text-[#7A1F3D]"
                    >
                      <span>{item.dishCount} {item.dishCount === 1 ? 'Dish' : 'Dishes'} Linked</span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-[#6B5A5E]" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-[#6B5A5E]" />
                      )}
                    </button>

                    {isExpanded && (
                      <ul className="mt-2 space-y-1 max-h-40 overflow-y-auto pr-1 text-[11px] text-[#6B5A5E] bg-[#F3EBDD]/60 p-2 rounded-lg border border-[#E7DCC8]">
                        {item.dishes.map((d, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-[#E3A82B] font-bold">•</span>
                            <span>{d}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
