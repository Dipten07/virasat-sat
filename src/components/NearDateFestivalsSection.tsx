import React, { useState, useMemo } from 'react';
import { Festival, CityDestination, SupportedLanguage } from '../types';
import { FESTIVALS_DATA } from '../data/festivalsData';
import { getSafeHeritageImage, handleImageError } from '../utils/imageUtils';
import { getTranslation } from '../data/languages';
import {
  Calendar,
  Sparkles,
  Clock,
  MapPin,
  Compass,
  ArrowRight,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Heart,
  Luggage,
  CalendarCheck,
  ChevronRight,
  Zap,
  Info
} from 'lucide-react';

interface NearDateFestivalsSectionProps {
  city: CityDestination;
  currentLanguage?: SupportedLanguage;
  onSelectFestival: (festivalId: string) => void;
  onOpenItineraryGenerator: (cityId: string, festivalId?: string) => void;
  onToggleSaveFestival?: (festivalId: string) => void;
  isSavedFestival?: (festivalId: string) => boolean;
  selectedTravelDate?: string;
  onTravelDateChange?: (date: string) => void;
}

interface ProcessedFestival {
  festival: Festival;
  isWithin30Days: boolean;
  daysRemaining: number;
  statusText: string;
  statusType: 'active' | 'upcoming-soon' | 'future';
  isDirectCityMatch: boolean;
  approxDateStr: string;
}

// Helper to parse festival day and month from festival object
function getFestivalApproxDate(festival: Festival, referenceYear: number = 2026): Date {
  const monthIdx = (festival.monthId || 1) - 1; // 0-indexed month
  let day = 15; // default mid-month

  if (festival.dateRange) {
    // Try to extract first number
    const match = festival.dateRange.match(/\b([1-9]|[12][0-9]|3[01])\b/);
    if (match) {
      day = parseInt(match[1], 10);
    }
  }

  return new Date(referenceYear, monthIdx, day);
}

export const NearDateFestivalsSection: React.FC<NearDateFestivalsSectionProps> = ({
  city,
  currentLanguage = 'en',
  onSelectFestival,
  onOpenItineraryGenerator,
  onToggleSaveFestival,
  isSavedFestival
}) => {
  // Current reference date (defaults to current system date)
  const [selectedMonthOffset, setSelectedMonthOffset] = useState<number | 'all'>('all');
  const [activeViewMode, setActiveViewMode] = useState<'30days' | 'all-upcoming'>('30days');

  // Base current date
  const now = useMemo(() => new Date(), []);
  const currentMonthNum = now.getMonth() + 1; // 1-12
  const currentDay = now.getDate();

  // 1. Gather all festivals relevant to this city
  const cityFestivals = useMemo(() => {
    const cityIdLower = city.id.toLowerCase();
    const cityNameLower = city.name.toLowerCase();
    const stateIdLower = city.state.toLowerCase().replace(/\s+/g, '-');

    return FESTIVALS_DATA.filter((f) => {
      // Direct city ID link
      const directCityIdMatch = city.festivalIds?.includes(f.id);
      
      // Primary destinations link
      const destMatch = f.primaryDestinations?.some((dest) => {
        const dLower = dest.toLowerCase();
        return dLower.includes(cityIdLower) || cityIdLower.includes(dLower) || cityNameLower.includes(dLower);
      });

      // State link
      const stateMatch = f.celebratedStates?.some((st) => {
        const sLower = st.toLowerCase().replace(/\s+/g, '-');
        return sLower === stateIdLower || stateIdLower.includes(sLower);
      });

      return directCityIdMatch || destMatch || stateMatch;
    });
  }, [city]);

  // 2. Process and calculate proximity/30-day window
  const processedFestivals = useMemo<ProcessedFestival[]>(() => {
    const refYear = now.getFullYear();

    return cityFestivals.map((f) => {
      let targetDate = getFestivalApproxDate(f, refYear);

      // If festival month has already passed in the current year, evaluate for next year
      if (targetDate.getTime() < now.getTime() - 7 * 24 * 60 * 60 * 1000) {
        targetDate = getFestivalApproxDate(f, refYear + 1);
      }

      const diffMs = targetDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      const isDirectCityMatch = (city.festivalIds?.includes(f.id) || 
        f.primaryDestinations?.some(d => d.toLowerCase().includes(city.id.toLowerCase()))) ?? false;

      let statusType: 'active' | 'upcoming-soon' | 'future' = 'future';
      let statusText = `In ~${diffDays} days`;

      if (diffDays <= 0 && diffDays >= -5) {
        statusType = 'active';
        statusText = '🔥 Happening This Week!';
      } else if (diffDays <= 30 && diffDays > 0) {
        statusType = 'upcoming-soon';
        statusText = `⚡ In ${diffDays} day${diffDays === 1 ? '' : 's'} (${f.monthName})`;
      } else {
        statusType = 'future';
        statusText = `${f.monthName} • In ${Math.ceil(diffDays / 30)} months`;
      }

      const isWithin30Days = diffDays >= -2 && diffDays <= 30;

      return {
        festival: f,
        isWithin30Days,
        daysRemaining: diffDays,
        statusText,
        statusType,
        isDirectCityMatch,
        approxDateStr: targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      };
    }).sort((a, b) => {
      // Sort priority: Direct city match first, then closest upcoming days
      if (a.isWithin30Days && !b.isWithin30Days) return -1;
      if (!a.isWithin30Days && b.isWithin30Days) return 1;
      return a.daysRemaining - b.daysRemaining;
    });
  }, [cityFestivals, now, city.festivalIds, city.id]);

  // Filtered lists
  const nearDateList = useMemo(() => {
    return processedFestivals.filter((pf) => pf.isWithin30Days);
  }, [processedFestivals]);

  const displayList = useMemo(() => {
    if (activeViewMode === '30days') {
      // If none strictly in 30 days, take the closest 3 upcoming
      return nearDateList.length > 0 ? nearDateList : processedFestivals.slice(0, 3);
    }
    return processedFestivals;
  }, [activeViewMode, nearDateList, processedFestivals]);

  // Next immediate flagship celebration
  const immediateFlagship = useMemo(() => {
    return processedFestivals[0] || null;
  }, [processedFestivals]);

  if (cityFestivals.length === 0) {
    return null;
  }

  return (
    <section id="near-date-festivals-section" className="space-y-6">
      {/* Header with 30-Day Badge & View Mode Toggle */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e5e0d8] shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#8C271E]/10 text-[#8C271E] text-xs font-bold uppercase tracking-wider">
                <Flame className="w-3.5 h-3.5 text-[#8C271E]" />
                <span>Next 30 Days Cultural Pulse</span>
              </span>
              {nearDateList.length > 0 ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                  <Zap className="w-3 h-3" />
                  {nearDateList.length} Active in 30 Days
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                  Next in Season: {immediateFlagship?.festival.name}
                </span>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2d2a26]">
              Near-Date & Upcoming Festivals in {city.name}
            </h2>
            <p className="text-xs sm:text-sm text-[#8a817c]">
              Real-time schedule of cultural processions, sacred rituals, and music fairs for travelers planning their visit now.
            </p>
          </div>

          {/* Switcher Toggle */}
          <div className="flex items-center gap-1 bg-[#f5f2ed] p-1 rounded-2xl border border-[#e5e0d8] self-start md:self-auto shrink-0">
            <button
              onClick={() => setActiveViewMode('30days')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeViewMode === '30days'
                  ? 'bg-[#5A5A40] text-white shadow-xs'
                  : 'text-[#8a817c] hover:text-[#2d2a26]'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Next 30 Days ({nearDateList.length})</span>
            </button>
            <button
              onClick={() => setActiveViewMode('all-upcoming')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeViewMode === 'all-upcoming'
                  ? 'bg-[#5A5A40] text-white shadow-xs'
                  : 'text-[#8a817c] hover:text-[#2d2a26]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Full Schedule ({cityFestivals.length})</span>
            </button>
          </div>
        </div>

        {/* Featured Immediate Spotlight Card */}
        {immediateFlagship && (
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-[#2d2a26] via-[#3a352f] to-[#47413a] text-white p-4 sm:p-5 md:p-6 border border-[#5A5A40]/30 shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6 items-center">
              
              {/* Left Column: Image with Date Tag */}
              <div className="md:col-span-5 lg:col-span-4 relative h-48 sm:h-56 rounded-xl overflow-hidden bg-black/40 group">
                <img
                  src={getSafeHeritageImage(immediateFlagship.festival.bannerImage, 'festival', immediateFlagship.festival.id)}
                  alt={immediateFlagship.festival.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  onError={(e) => handleImageError(e, 'festival')}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute top-2.5 left-2.5 bg-[#E6BE8A] text-[#2d2a26] text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                  {immediateFlagship.isWithin30Days ? '⚡ Active 30-Day Window' : '🌟 Next Major Event'}
                </div>
                <div className="absolute bottom-2.5 left-2.5 right-2.5">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#E6BE8A]">
                    📅 {immediateFlagship.festival.dateRange}
                  </span>
                </div>
              </div>

              {/* Right Column: Festival Details & Actions */}
              <div className="md:col-span-7 lg:col-span-8 space-y-3 sm:space-y-3.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-white/15 text-[#E6BE8A] text-[11px] sm:text-xs font-bold flex items-center gap-1.5 border border-white/20">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{immediateFlagship.statusText}</span>
                  </span>
                  <span className="text-xs text-neutral-300 font-medium">
                    Duration: <strong className="text-white">{immediateFlagship.festival.duration}</strong>
                  </span>
                </div>

                <div>
                  <h3 className="font-serif text-xl sm:text-2xl md:text-3xl font-bold text-white leading-snug">
                    {immediateFlagship.festival.name}
                  </h3>
                  {immediateFlagship.festival.hindiName && (
                    <p className="text-xs text-[#E6BE8A] font-serif italic mt-0.5">
                      {immediateFlagship.festival.hindiName}
                    </p>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-neutral-200 line-clamp-2 leading-relaxed font-normal">
                  {immediateFlagship.festival.shortDescription}
                </p>

                {/* Key Highlights / Spot */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs bg-black/25 rounded-xl p-3 border border-white/10">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase font-semibold text-neutral-400">Prime City Spot</div>
                      <div className="text-neutral-200 font-medium truncate">
                        {immediateFlagship.festival.bestExperienceSpot || `${city.name} Cultural Ghats / Streets`}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <Sparkles className="w-4 h-4 text-[#E6BE8A] shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="text-[10px] uppercase font-semibold text-neutral-400">Core Ritual</div>
                      <div className="text-neutral-200 font-medium truncate">
                        {immediateFlagship.festival.ritualHighlights?.[0] || 'Grand Aarti & Cultural Gathering'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 pt-1">
                  <button
                    onClick={() => onOpenItineraryGenerator(city.id, immediateFlagship.festival.id)}
                    className="w-full sm:w-auto px-4 sm:px-5 py-2.5 bg-[#E6BE8A] hover:bg-white text-[#2d2a26] text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5 active:scale-98 min-h-[44px]"
                  >
                    <Compass className="w-3.5 h-3.5 text-[#5A5A40]" />
                    <span>Plan Itinerary for this Event</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectFestival(immediateFlagship.festival.id)}
                      className="flex-1 sm:flex-none px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white border border-white/20 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 min-h-[44px]"
                    >
                      <span>View Rituals & Guide</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    {onToggleSaveFestival && (
                      <button
                        onClick={() => onToggleSaveFestival(immediateFlagship.festival.id)}
                        className="p-2.5 bg-white/10 hover:bg-white/20 border border-white/15 rounded-xl text-white transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title="Save Festival"
                      >
                        <Heart className={`w-4 h-4 ${isSavedFestival?.(immediateFlagship.festival.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                      </button>
                    )}
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* Near-Date & Upcoming Festivals Grid */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#8a817c] uppercase tracking-wider px-1">
            <span>{activeViewMode === '30days' ? 'Events in Next 30 Days' : 'Full Year Calendar for ' + city.name}</span>
            <span>{displayList.length} Festivals Cataloged</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayList.map((item) => {
              const f = item.festival;
              const isSaved = isSavedFestival ? isSavedFestival(f.id) : false;

              return (
                <div
                  key={f.id}
                  onClick={() => onSelectFestival(f.id)}
                  className={`group bg-white rounded-2xl p-4 border transition-all cursor-pointer flex flex-col justify-between space-y-3 shadow-xs hover:shadow-md ${
                    item.isWithin30Days
                      ? 'border-[#8C271E]/30 bg-[#fdfbf9]'
                      : 'border-[#e5e0d8]'
                  }`}
                >
                  <div>
                    {/* Top Row: Tag and Status */}
                    <div className="flex items-center justify-between gap-2 mb-2.5">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        item.isWithin30Days
                          ? 'bg-[#8C271E] text-white'
                          : 'bg-[#f5f2ed] text-[#5A5A40]'
                      }`}>
                        {item.statusText}
                      </span>
                      <span className="text-[11px] font-bold text-[#8a817c]">
                        {f.monthName}
                      </span>
                    </div>

                    {/* Image Preview */}
                    <div className="relative h-36 rounded-xl overflow-hidden bg-[#3a352f] mb-3">
                      <img
                        src={getSafeHeritageImage(f.bannerImage, 'festival', f.id)}
                        alt={f.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        onError={(e) => handleImageError(e, 'festival')}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute bottom-2 left-2.5 right-2.5 text-white">
                        <div className="text-[10px] uppercase font-bold tracking-wider text-[#E6BE8A]">
                          📅 {f.dateRange}
                        </div>
                        <h4 className="font-serif font-bold text-base text-white line-clamp-1">
                          {f.name}
                        </h4>
                      </div>
                    </div>

                    <p className="text-xs text-[#8a817c] line-clamp-2 leading-relaxed">
                      {f.shortDescription}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-[#e5e0d8] text-[11px] text-[#615951] space-y-1">
                      <div className="flex items-center gap-1 text-[11px] text-[#8a817c]">
                        <MapPin className="w-3 h-3 text-[#5A5A40] shrink-0" />
                        <span className="truncate">{f.bestExperienceSpot || city.name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="pt-2 border-t border-[#e5e0d8] flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenItineraryGenerator(city.id, f.id);
                      }}
                      className="text-xs font-bold text-[#8C271E] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Compass className="w-3 h-3" />
                      <span>Plan Trip</span>
                    </button>

                    <span className="font-bold text-[#5A5A40] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>Explore</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
