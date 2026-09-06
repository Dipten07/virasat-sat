import React, { useState, useEffect } from 'react';
import { CityDestination, UserLocation, DayItinerary, ItineraryActivity, SavedItinerary, SupportedLanguage } from '../types';
import { generatePersonalizedItinerary, calculateTravelPlan } from '../data/travelUtils';
import { FESTIVALS_DATA } from '../data/festivalsData';
import { CITIES_DATA } from '../data/citiesData';
import { getTranslation } from '../data/languages';
import {
  Calendar,
  Clock,
  MapPin,
  Utensils,
  Landmark,
  Sparkles,
  Heart,
  Save,
  Printer,
  Download,
  Plus,
  Minus,
  Trash2,
  Hotel,
  Plane,
  Train,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Compass,
  ArrowRight
} from 'lucide-react';

interface ItineraryGeneratorViewProps {
  city: CityDestination;
  userLocation: UserLocation;
  festivalId?: string;
  onSelectCity?: (cityId: string) => void;
  onSelectFestival?: (festivalId?: string) => void;
  onSaveItinerary: (saved: SavedItinerary) => void;
  onBack: () => void;
  currentLanguage?: SupportedLanguage;
}

// Helpers for timezone-safe date math & formatting
const formatDateForInput = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addDaysToDate = (dateStr: string, numDays: number): string => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + numDays);
  return formatDateForInput(date);
};

const calculateDaysDifference = (startStr: string, endStr: string): number => {
  if (!startStr || !endStr) return 1;
  const [y1, m1, d1] = startStr.split('-').map(Number);
  const [y2, m2, d2] = endStr.split('-').map(Number);
  const date1 = new Date(y1, m1 - 1, d1);
  const date2 = new Date(y2, m2 - 1, d2);
  const diffMs = date2.getTime() - date1.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, diffDays);
};

export const ItineraryGeneratorView: React.FC<ItineraryGeneratorViewProps> = ({
  city,
  userLocation,
  festivalId,
  onSelectCity,
  onSelectFestival,
  onSaveItinerary,
  onBack,
  currentLanguage = 'en'
}) => {
  const [daysCount, setDaysCount] = useState<number>(3);
  const [travelPace, setTravelPace] = useState<'Relaxed' | 'Balanced' | 'Fast-Paced'>('Balanced');
  const [stayStyle, setStayStyle] = useState<string>('Heritage Haveli & Palaces');
  
  const [startDate, setStartDate] = useState<string>(() => {
    const today = new Date();
    return formatDateForInput(today);
  });
  
  const [endDate, setEndDate] = useState<string>(() => {
    const today = new Date();
    const start = formatDateForInput(today);
    return addDaysToDate(start, 2); // 3-day default
  });

  const [isSavedNotice, setIsSavedNotice] = useState(false);

  // Helper to format date and day for day index (1-based)
  const getDayInfo = (dayIndex: number) => {
    if (!startDate) return null;
    const [year, month, day] = startDate.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day + (dayIndex - 1));
    
    return {
      dateFormatted: dateObj.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      weekday: dateObj.toLocaleDateString('en-IN', { weekday: 'long' }),
      shortWeekday: dateObj.toLocaleDateString('en-IN', { weekday: 'short' })
    };
  };

  const getEndDateInfo = () => {
    if (!endDate) return null;
    const [year, month, day] = endDate.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    return {
      dateFormatted: dateObj.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      weekday: dateObj.toLocaleDateString('en-IN', { weekday: 'long' }),
      shortWeekday: dateObj.toLocaleDateString('en-IN', { weekday: 'short' })
    };
  };

  // Active generated schedule
  const [itineraryDays, setItineraryDays] = useState<DayItinerary[]>(() =>
    generatePersonalizedItinerary(city, daysCount, festivalId, travelPace)
  );

  // Keep itinerary strictly updated when city, days, or festival changes
  useEffect(() => {
    setItineraryDays(generatePersonalizedItinerary(city, daysCount, festivalId, travelPace));
    if (activeDayTab > daysCount) {
      setActiveDayTab(1);
    }
  }, [city.id, festivalId, daysCount, travelPace]);

  const [activeDayTab, setActiveDayTab] = useState<number>(1);
  const [newActivityTitle, setNewActivityTitle] = useState('');
  const [showAddActivityForm, setShowAddActivityForm] = useState(false);

  const festival = festivalId ? FESTIVALS_DATA.find((f) => f.id === festivalId) : null;
  const travelPlan = calculateTravelPlan(userLocation, city);

  const handleRegenerate = (newDays: number, newPace: 'Relaxed' | 'Balanced' | 'Fast-Paced') => {
    setDaysCount(newDays);
    setTravelPace(newPace);
    const updated = generatePersonalizedItinerary(city, newDays, festivalId, newPace);
    setItineraryDays(updated);
    if (activeDayTab > newDays) setActiveDayTab(1);
  };

  // Handlers for dynamic date and days changes
  const handleStartDateChange = (newStart: string) => {
    setStartDate(newStart);
    if (newStart) {
      const calculatedEnd = addDaysToDate(newStart, daysCount - 1);
      setEndDate(calculatedEnd);
    }
  };

  const handleEndDateChange = (newEnd: string) => {
    setEndDate(newEnd);
    if (newEnd && startDate) {
      if (newEnd >= startDate) {
        const diff = calculateDaysDifference(startDate, newEnd);
        const clampedDays = Math.min(30, Math.max(1, diff));
        setDaysCount(clampedDays);
        handleRegenerate(clampedDays, travelPace);
      } else {
        // If end date is before start date, sync start date to match end date
        setStartDate(newEnd);
        setDaysCount(1);
        handleRegenerate(1, travelPace);
      }
    }
  };

  const handleDaysCountInput = (newDaysValue: number | string) => {
    const parsed = typeof newDaysValue === 'string' ? parseInt(newDaysValue, 10) : newDaysValue;
    const validDays = isNaN(parsed) ? 1 : Math.min(30, Math.max(1, parsed));
    setDaysCount(validDays);
    if (startDate) {
      const calculatedEnd = addDaysToDate(startDate, validDays - 1);
      setEndDate(calculatedEnd);
    }
    handleRegenerate(validDays, travelPace);
  };

  const handleSave = () => {
    const savedObj: SavedItinerary = {
      id: `itin-${Date.now()}`,
      destinationId: city.id,
      destinationName: city.name,
      festivalId: festival?.id,
      festivalName: festival?.name,
      createdAt: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      startDate,
      endDate,
      daysCount,
      stayStyle,
      travelPace,
      days: itineraryDays
    };
    onSaveItinerary(savedObj);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 4000);
  };

  const handleRemoveActivity = (dayIndex: number, actId: string) => {
    setItineraryDays((prev) =>
      prev.map((d, idx) =>
        idx === dayIndex
          ? { ...d, activities: d.activities.filter((a) => a.id !== actId) }
          : d
      )
    );
  };

  const handleAddCustomActivity = (dayIndex: number) => {
    if (!newActivityTitle.trim()) return;
    const newAct: ItineraryActivity = {
      id: `custom-${Date.now()}`,
      time: '03:30 PM',
      title: newActivityTitle.trim(),
      category: 'culture',
      duration: '1.5 Hours',
      locationName: city.name,
      notes: 'Custom traveler stop'
    };
    setItineraryDays((prev) =>
      prev.map((d, idx) =>
        idx === dayIndex
          ? { ...d, activities: [...d.activities, newAct] }
          : d
      )
    );
    setNewActivityTitle('');
    setShowAddActivityForm(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const currentDayData = itineraryDays.find((d) => d.dayNumber === activeDayTab) || itineraryDays[0];
  const startDayDateInfo = getDayInfo(1);
  const endDayDateInfo = getEndDateInfo();
  const activeDayDateInfo = getDayInfo(activeDayTab);

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      {/* Header & Controls */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e5e0d8] shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#e5e0d8] pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-[#5A5A40] uppercase tracking-widest bg-[#f5f2ed] px-3 py-1 rounded-full border border-[#e5e0d8]">
                Custom Heritage Trip Planner
              </span>
              {festival && (
                <span className="text-[10px] font-bold uppercase tracking-widest bg-[#E6BE8A]/30 text-[#2d2a26] px-3 py-1 rounded-full border border-[#E6BE8A]/50">
                  🎉 {festival.name}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-[#2d2a26]">
              {daysCount}-Day Personalized Itinerary: {city.name}
            </h1>
            <p className="text-xs sm:text-sm text-[#8a817c] font-normal">
              Starting from <strong className="text-[#2d2a26]">{userLocation.city}</strong> (~{travelPlan.distanceKm} km away)
              {startDayDateInfo && endDayDateInfo && (
                <span>
                  {' '}• Schedule: <strong className="text-[#5A5A40] font-semibold">{startDayDateInfo.shortWeekday}, {startDayDateInfo.dateFormatted}</strong> to <strong className="text-[#5A5A40] font-semibold">{endDayDateInfo.shortWeekday}, {endDayDateInfo.dateFormatted}</strong> ({daysCount} {daysCount === 1 ? 'Day' : 'Days'})
                </span>
              )}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-[#2d2a26] bg-[#E6BE8A] hover:bg-white rounded-full shadow-sm transition-all cursor-pointer active:scale-95 border border-[#e5e0d8]"
            >
              <Save className="w-3.5 h-3.5 text-[#5A5A40]" />
              <span>Save to My Trip</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-[#8a817c] bg-[#f5f2ed] hover:bg-white border border-[#e5e0d8] rounded-full transition-colors cursor-pointer"
              title="Print or save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {isSavedNotice && (
          <div className="p-3 bg-[#f5f2ed] border border-[#5A5A40]/30 rounded-2xl text-xs font-semibold text-[#5A5A40] flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-[#5A5A40]" />
            <span>Itinerary saved to your "My Trip" dashboard! You can access it anytime.</span>
          </div>
        )}

        {/* Customization Options Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-2">
          {/* Destination Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#8a817c] uppercase tracking-widest block">
              Destination City
            </label>
            <select
              value={city.id}
              onChange={(e) => onSelectCity && onSelectCity(e.target.value)}
              className="w-full py-2.5 px-3 text-xs font-semibold bg-[#f5f2ed] border border-[#e5e0d8] rounded-2xl text-[#2d2a26] focus:outline-none focus:ring-1 focus:ring-[#5A5A40] cursor-pointer"
            >
              {CITIES_DATA.map((c) => (
                <option key={c.id} value={c.id}>
                  📍 {c.name} ({c.state})
                </option>
              ))}
            </select>
          </div>

          {/* Trip Start Date & Day Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#8a817c] uppercase tracking-widest block">
              Trip Start Date & Day
            </label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="w-full py-2 px-3 text-xs font-semibold bg-[#f5f2ed] border border-[#e5e0d8] rounded-2xl text-[#2d2a26] focus:outline-none focus:ring-1 focus:ring-[#5A5A40] cursor-pointer"
              />
            </div>
            {startDayDateInfo && (
              <div className="text-[10px] text-[#5A5A40] font-medium px-1 flex items-center gap-1">
                <span>Starts:</span>
                <span className="font-bold">{startDayDateInfo.weekday}, {startDayDateInfo.dateFormatted.split(' ')[0]} {startDayDateInfo.dateFormatted.split(' ')[1]}</span>
              </div>
            )}
          </div>

          {/* Trip End Date & Day Selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#8a817c] uppercase tracking-widest block">
              Trip End Date & Day
            </label>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => handleEndDateChange(e.target.value)}
                className="w-full py-2 px-3 text-xs font-semibold bg-[#f5f2ed] border border-[#e5e0d8] rounded-2xl text-[#2d2a26] focus:outline-none focus:ring-1 focus:ring-[#5A5A40] cursor-pointer"
              />
            </div>
            {endDayDateInfo && (
              <div className="text-[10px] text-[#5A5A40] font-medium px-1 flex items-center gap-1">
                <span>Ends:</span>
                <span className="font-bold">{endDayDateInfo.weekday}, {endDayDateInfo.dateFormatted.split(' ')[0]} {endDayDateInfo.dateFormatted.split(' ')[1]}</span>
              </div>
            )}
          </div>

          {/* Enter Trip Days directly with Stepper & Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-[#8a817c] uppercase tracking-widest block">
                Enter Trip Days
              </label>
              <span className="text-[10px] font-bold text-[#5A5A40]">
                {daysCount} {daysCount === 1 ? 'Day' : 'Days'} ({Math.max(0, daysCount - 1)}N)
              </span>
            </div>
            <div className="flex items-center bg-[#f5f2ed] border border-[#e5e0d8] rounded-2xl p-1 gap-1">
              <button
                type="button"
                onClick={() => handleDaysCountInput(Math.max(1, daysCount - 1))}
                disabled={daysCount <= 1}
                className="w-8 h-7 rounded-xl bg-white hover:bg-[#e5e0d8] text-[#2d2a26] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                title="Decrease 1 Day"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <div className="flex-1 flex items-center justify-center">
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={daysCount}
                  onChange={(e) => handleDaysCountInput(e.target.value)}
                  className="w-full text-center text-xs font-bold text-[#2d2a26] bg-transparent focus:outline-none"
                  title="Type number of days"
                />
              </div>
              <button
                type="button"
                onClick={() => handleDaysCountInput(Math.min(30, daysCount + 1))}
                disabled={daysCount >= 30}
                className="w-8 h-7 rounded-xl bg-white hover:bg-[#e5e0d8] text-[#2d2a26] disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                title="Increase 1 Day"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-[10px] text-[#8a817c] px-1">
              Custom duration (1 to 30 days)
            </div>
          </div>

          {/* Travel Pace & Rhythm */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#8a817c] uppercase tracking-widest block">
              Travel Pace
            </label>
            <div className="flex gap-1">
              {(['Relaxed', 'Balanced', 'Fast-Paced'] as const).map((pace) => (
                <button
                  key={pace}
                  onClick={() => handleRegenerate(daysCount, pace)}
                  className={`flex-1 py-2 text-[11px] font-bold rounded-2xl border transition-all cursor-pointer ${
                    travelPace === pace
                      ? 'bg-[#5A5A40] text-white border-[#5A5A40]'
                      : 'bg-[#f5f2ed] hover:bg-white text-[#2d2a26] border-[#e5e0d8]'
                  }`}
                >
                  {pace === 'Fast-Paced' ? 'Fast' : pace}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Day Selection Tabs with Real Dates and Days */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {itineraryDays.map((d) => {
          const dateInfo = getDayInfo(d.dayNumber);
          const isSelected = activeDayTab === d.dayNumber;

          return (
            <button
              key={d.dayNumber}
              onClick={() => setActiveDayTab(d.dayNumber)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
                isSelected
                  ? 'bg-[#5A5A40] text-white shadow-sm ring-2 ring-[#5A5A40]/30'
                  : 'bg-white hover:bg-[#f5f2ed] text-[#8a817c] border border-[#e5e0d8]'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Day {d.dayNumber}</span>
              {dateInfo && (
                <span className={`text-[10px] font-normal normal-case ${isSelected ? 'text-white/80' : 'text-[#8a817c]'}`}>
                  • {dateInfo.shortWeekday}, {dateInfo.dateFormatted.split(' ')[0]} {dateInfo.dateFormatted.split(' ')[1]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Day Timeline */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e5e0d8] shadow-sm space-y-6">
        <div className="space-y-4">
          {/* Day Theme Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e5e0d8] pb-4">
            <div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-[#8a817c] uppercase tracking-widest">
                <span>Day {currentDayData.dayNumber} Timeline</span>
                {activeDayDateInfo && (
                  <>
                    <span>•</span>
                    <span className="text-[#5A5A40] font-bold">{activeDayDateInfo.weekday}, {activeDayDateInfo.dateFormatted}</span>
                  </>
                )}
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2d2a26] mt-0.5">
                {currentDayData.theme}
              </h3>
            </div>

            <button
              onClick={() => setShowAddActivityForm(!showAddActivityForm)}
              className="inline-flex items-center gap-1 px-4 py-2 rounded-full text-xs font-bold bg-[#f5f2ed] hover:bg-[#5A5A40] text-[#2d2a26] hover:text-white border border-[#e5e0d8] transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Stop</span>
            </button>
          </div>

          {/* Add custom activity input form */}
          {showAddActivityForm && (
            <div className="p-4 bg-[#f5f2ed] rounded-2xl border border-[#e5e0d8] space-y-3 animate-fadeIn">
              <label className="text-xs font-bold text-[#2d2a26]">Add Custom Sight or Experience to Day {currentDayData.dayNumber}</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Visit local spice market, Sunrise boat ride..."
                  value={newActivityTitle}
                  onChange={(e) => setNewActivityTitle(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-full text-xs bg-white border border-[#e5e0d8] text-[#2d2a26] focus:outline-none focus:ring-1 focus:ring-[#5A5A40]"
                />
                <button
                  onClick={() => handleAddCustomActivity(activeDayTab - 1)}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#5A5A40] hover:bg-[#464632] rounded-full transition-colors cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Activities List */}
          <div className="space-y-4 pt-2">
            {currentDayData.activities.map((act, index) => (
              <div
                key={act.id || index}
                className="p-4 sm:p-5 rounded-2xl border border-[#e5e0d8] hover:border-[#5A5A40]/40 transition-all bg-[#faf8f5] flex flex-col sm:flex-row sm:items-start justify-between gap-4 group"
              >
                <div className="flex items-start gap-4">
                  {/* Time Badge */}
                  <div className="px-3 py-1.5 rounded-xl bg-white border border-[#e5e0d8] text-xs font-bold text-[#5A5A40] shrink-0 text-center shadow-2xs">
                    <Clock className="w-3.5 h-3.5 mx-auto mb-0.5 opacity-70" />
                    <span>{act.time}</span>
                  </div>

                  {/* Content Details */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white border border-[#e5e0d8] text-[#8a817c]">
                        {act.category}
                      </span>
                      <span className="text-xs text-[#8a817c] flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {act.locationName}
                      </span>
                      {act.duration && (
                        <span className="text-xs text-[#8a817c]">
                          • {act.duration}
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-serif font-bold text-[#2d2a26]">
                      {act.title}
                    </h4>

                    {act.notes && (
                      <p className="text-xs text-[#8a817c] leading-relaxed">
                        {act.notes}
                      </p>
                    )}

                    {act.entryInfo && (
                      <div className="text-[11px] text-[#5A5A40] font-semibold pt-1">
                        🎫 {act.entryInfo}
                      </div>
                    )}
                  </div>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => handleRemoveActivity(activeDayTab - 1, act.id)}
                  className="opacity-60 group-hover:opacity-100 text-[#8a817c] hover:text-rose-600 p-1 self-end sm:self-center transition-colors cursor-pointer"
                  title="Remove activity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transit & Travel Calculation Overview */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e5e0d8] shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-[#5A5A40]" />
          <h3 className="text-lg font-serif font-bold text-[#2d2a26]">
            Transit Overview from {userLocation.city} to {city.name}
          </h3>
        </div>
        <p className="text-xs text-[#8a817c]">
          Calculated road distance is approximately {travelPlan.distanceKm} km. Recommended transit options:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {travelPlan.options.map((opt, idx) => (
            <div key={idx} className="p-4 rounded-2xl bg-[#f5f2ed] border border-[#e5e0d8] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#5A5A40] flex items-center gap-1.5 capitalize">
                  {opt.mode === 'flight' && <Plane className="w-3.5 h-3.5" />}
                  {opt.mode === 'train' && <Train className="w-3.5 h-3.5" />}
                  {opt.mode === 'bus' && <Hotel className="w-3.5 h-3.5" />}
                  {opt.mode === 'drive' && <Compass className="w-3.5 h-3.5" />}
                  <span>{opt.mode === 'drive' ? 'Drive / Taxi' : opt.mode}</span>
                </span>
                <span className="text-xs font-bold text-[#2d2a26]">{opt.duration}</span>
              </div>
              <div className="text-xs text-[#2d2a26] font-medium">{opt.priceRange}</div>
              <div className="text-[11px] text-[#8a817c]">{opt.operatorOrDetail}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
