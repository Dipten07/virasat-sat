import React, { useState } from 'react';
import { UserLocation, SupportedLanguage } from '../types';
import { getTranslation } from '../data/languages';
import { 
  Sparkles, 
  Calendar, 
  Landmark, 
  MapPin, 
  ArrowRight, 
  Compass, 
  ShieldCheck, 
  Search,
  Train,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { handleImageError, FALLBACK_IMAGES, getSafeHeritageImage } from '../utils/imageUtils';

interface HeroSectionProps {
  userLocation: UserLocation;
  currentLanguage?: SupportedLanguage;
  onExploreFestivals: () => void;
  onPlanJourney: () => void;
  onOpenLocationModal: () => void;
  onOpenSearchModal: () => void;
  onQuickSearchDestination?: (query: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  userLocation,
  currentLanguage = 'en',
  onExploreFestivals,
  onPlanJourney,
  onOpenLocationModal,
  onOpenSearchModal,
  onQuickSearchDestination
}) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      if (onQuickSearchDestination) {
        onQuickSearchDestination(searchInput.trim());
      } else {
        onOpenSearchModal();
      }
    } else {
      onOpenSearchModal();
    }
  };

  const trendingSearches = [
    { label: 'Varanasi Ghats', query: 'varanasi' },
    { label: 'Taj Mahal', query: 'taj-mahal' },
    { label: 'Hampi Ruins', query: 'hampi' },
    { label: 'Jaipur Forts', query: 'jaipur' },
    { label: 'Konark Sun Temple', query: 'konark' }
  ];

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-sm border border-[#e5e0d8] bg-[#2d2a26] text-white">
      {/* Background Image with Warm Heritage Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={FALLBACK_IMAGES.landscape}
          alt="Indian Cultural Heritage"
          className="w-full h-full object-cover object-center opacity-30 mix-blend-luminosity scale-100"
          referrerPolicy="no-referrer"
          onError={(e) => handleImageError(e, 'landscape')}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#2d2a26] via-[#2d2a26]/85 to-[#2d2a26]/60" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 p-6 sm:p-8 md:p-10 lg:p-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Headlines, Instant Search & Action Buttons */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Top Subtitle Pill */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[#E6BE8A] text-[11px] font-semibold tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-[#E6BE8A]" />
                <span>{getTranslation('hero.tagline', currentLanguage) || 'Discover Living Traditions & Wonders'}</span>
              </div>

              <button
                onClick={onOpenLocationModal}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-neutral-200 hover:text-white border border-white/15 text-[11px] font-medium transition-colors cursor-pointer"
                title="Change departure city"
                id="hero-change-origin-btn"
              >
                <MapPin className="w-3 h-3 text-orange-400" />
                <span>From {userLocation.city}</span>
              </button>
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight leading-tight">
                {getTranslation('hero.title', currentLanguage) || 'Journey Through India\'s Timeless Heritage'}
              </h1>
              <p className="text-neutral-300 text-sm sm:text-base leading-relaxed max-w-xl font-normal">
                {getTranslation('hero.subtitle', currentLanguage) || 'Explore ancient monuments, 12 months of cultural celebrations, and authentic local experiences.'}
              </p>
            </div>

            {/* Integrated Quick Discovery Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative max-w-xl">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 absolute left-3.5 sm:left-4 text-neutral-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search Taj Mahal, Diwali, Hampi..."
                  className="w-full pl-10 sm:pl-11 pr-24 sm:pr-28 py-3 sm:py-3.5 bg-white/95 text-[#2d2a26] text-xs sm:text-sm rounded-2xl border-none shadow-md focus:outline-none focus:ring-2 focus:ring-[#E6BE8A] placeholder-neutral-500 font-medium"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 sm:right-2 px-3 sm:px-4 py-2 bg-[#5A5A40] hover:bg-[#454530] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1 min-h-[38px]"
                >
                  <span>Explore</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </form>

            {/* Trending Quick Search Chips */}
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-[11px] text-neutral-400 font-medium mr-1">Trending:</span>
              {trendingSearches.map((item) => (
                <button
                  key={item.query}
                  type="button"
                  onClick={() => {
                    if (onQuickSearchDestination) {
                      onQuickSearchDestination(item.query);
                    } else {
                      onOpenSearchModal();
                    }
                  }}
                  className="text-[11px] text-neutral-200 bg-white/10 hover:bg-white/20 border border-white/10 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Quick Action Navigation Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onExploreFestivals}
                className="flex items-center gap-2 px-5 py-2.5 bg-[#E6BE8A] hover:bg-[#ebd0a7] text-[#2d2a26] rounded-xl text-xs font-bold transition-all shadow-sm active:scale-98 cursor-pointer"
                id="hero-explore-festivals-btn"
              >
                <Calendar className="w-4 h-4 text-[#5A5A40]" />
                <span>12-Month Festival Calendar</span>
              </button>

              <button
                onClick={onPlanJourney}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-xl text-xs font-semibold transition-all active:scale-98 cursor-pointer"
                id="hero-plan-journey-btn"
              >
                <Compass className="w-4 h-4 text-[#E6BE8A]" />
                <span>Smart Itinerary Planner</span>
              </button>
            </div>

          </div>

          {/* Right Column: Featured Cultural Spotlight Card */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            <div className="relative bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-5 text-white shadow-xl space-y-4">
              
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-[#E6BE8A] text-[#2d2a26] px-2.5 py-0.5 rounded-full">
                    Featured Destination
                  </span>
                  <span className="text-[10px] text-emerald-300 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Best Season Now
                  </span>
                </div>
                <span className="text-[10px] text-neutral-300 font-medium">
                  {userLocation.city} Connected
                </span>
              </div>

              {/* Landmark Image */}
              <div className="relative h-44 rounded-xl overflow-hidden bg-black/40 border border-white/10 group">
                <img
                  src={getSafeHeritageImage("https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80", 'monument', 'taj-mahal')}
                  alt="Taj Mahal Agra"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  onError={(e) => handleImageError(e, 'monument')}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 space-y-0.5">
                  <h3 className="font-serif font-bold text-lg text-white">
                    Taj Mahal & Agra Fort
                  </h3>
                  <p className="text-xs text-neutral-300 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-orange-400" />
                    <span>Agra, Uttar Pradesh • Mughal Heritage</span>
                  </p>
                </div>
              </div>

              {/* 3 Quick Heritage Insights */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-black/25 rounded-xl p-2 border border-white/10">
                  <div className="text-[9px] uppercase text-neutral-400 font-medium">Ticket</div>
                  <div className="text-xs font-bold text-white mt-0.5">₹50 (ASI)</div>
                </div>
                <div className="bg-black/25 rounded-xl p-2 border border-white/10">
                  <div className="text-[9px] uppercase text-neutral-400 font-medium">Ideal Visit</div>
                  <div className="text-xs font-bold text-[#E6BE8A] mt-0.5">Sunrise / 3h</div>
                </div>
                <div className="bg-black/25 rounded-xl p-2 border border-white/10">
                  <div className="text-[9px] uppercase text-neutral-400 font-medium">From {userLocation.city}</div>
                  <div className="text-xs font-bold text-orange-300 mt-0.5">Direct Route</div>
                </div>
              </div>

              {/* Direct Card Action */}
              <button
                onClick={onPlanJourney}
                className="w-full py-2.5 px-4 bg-[#E6BE8A] hover:bg-white text-[#2d2a26] rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-center cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                id="hero-spotlight-plan-btn"
              >
                <Compass className="w-3.5 h-3.5 text-[#5A5A40]" />
                <span>Create Trip Itinerary</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
