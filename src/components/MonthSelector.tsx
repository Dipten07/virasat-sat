import React from 'react';
import { MonthData, SupportedLanguage } from '../types';
import { MONTHS_DATA } from '../data/monthsData';
import { FESTIVALS_DATA } from '../data/festivalsData';
import { getTranslation } from '../data/languages';
import { Calendar, Sparkles, X, RotateCcw } from 'lucide-react';

interface MonthSelectorProps {
  selectedMonthId?: number | null;
  onSelectMonth: (monthId: number | null) => void;
  currentLanguage?: SupportedLanguage;
  showAllOption?: boolean;
}

export const MonthSelector: React.FC<MonthSelectorProps> = ({
  selectedMonthId,
  onSelectMonth,
  currentLanguage = 'en',
  showAllOption = true
}) => {
  const currentMonthData = selectedMonthId != null 
    ? MONTHS_DATA.find((m) => m.id === selectedMonthId) || null
    : null;

  const getMonthName = (monthId: number, defaultName: string) => {
    const key = `month.${monthId}.name`;
    const translated = getTranslation(key, currentLanguage);
    return translated !== key ? translated : defaultName;
  };

  const handleMonthClick = (monthId: number) => {
    // If the clicked month is already selected, deselect it (toggle off)
    if (selectedMonthId === monthId) {
      onSelectMonth(null);
    } else {
      onSelectMonth(monthId);
    }
  };

  return (
    <div className="space-y-4">
      {/* Month Selector Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#8a817c] uppercase tracking-widest">
            <Calendar className="w-3.5 h-3.5 text-[#5A5A40]" />
            <span>{getTranslation('month.timeline', currentLanguage) || 'Timeline (12 Months of Festivals)'}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2d2a26] mt-0.5">
            {getTranslation('month.exploreBy', currentLanguage) || 'Explore Celebrations by Month'}
          </h2>
        </div>

        {/* Deselect / Reset Month button */}
        {selectedMonthId !== null && selectedMonthId !== undefined && (
          <button
            onClick={() => onSelectMonth(null)}
            className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#8a817c] hover:text-[#2d2a26] bg-[#f5f2ed] hover:bg-[#e5e0d8] border border-[#e5e0d8] transition-colors cursor-pointer"
            title="Deselect month"
          >
            <X className="w-3.5 h-3.5" />
            <span>Deselect Month</span>
          </button>
        )}
      </div>

      {/* 12 Months Horizontal Scroll / Adaptive Pill Grid */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 px-1">
        {/* All Months Filter Pill (Optional, shown in Festivals view) */}
        {showAllOption && (
          <button
            onClick={() => onSelectMonth(null)}
            className={`flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer select-none shrink-0 ${
              selectedMonthId == null
                ? 'px-5 py-2.5 rounded-full bg-[#5A5A40] text-white text-xs font-bold shadow-lg shadow-[#5A5A40]/20 scale-102'
                : 'px-4 py-2 rounded-full border border-[#e5e0d8] bg-[#f5f2ed] hover:bg-white text-xs text-[#8a817c] hover:text-[#2d2a26]'
            }`}
          >
            <span>{getTranslation('month.all', currentLanguage) || 'All Months'}</span>
            <span className={`text-[10px] ${selectedMonthId == null ? 'opacity-80 font-normal text-white' : 'opacity-60 text-[#8a817c]'}`}>
              ({FESTIVALS_DATA.length})
            </span>
          </button>
        )}

        {MONTHS_DATA.map((month) => {
          const isSelected = month.id === selectedMonthId;
          const monthName = getMonthName(month.id, month.name);

          return (
            <button
              key={month.id}
              onClick={() => handleMonthClick(month.id)}
              className={`flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer select-none shrink-0 ${
                isSelected
                  ? 'px-5 py-2.5 rounded-full bg-[#5A5A40] text-white text-xs font-bold shadow-lg shadow-[#5A5A40]/20 scale-102 ring-2 ring-[#5A5A40]/30'
                  : 'px-4 py-2 rounded-full border border-[#e5e0d8] bg-[#f5f2ed] hover:bg-white text-xs text-[#8a817c] hover:text-[#2d2a26]'
              }`}
              title={isSelected ? 'Click again to deselect' : `Select ${monthName}`}
            >
              <span>{monthName}</span>
              <span className={`text-[10px] ${isSelected ? 'opacity-90 font-normal text-white' : 'opacity-60 text-[#8a817c]'}`}>
                ({month.festivalCount})
              </span>
              {isSelected && <X className="w-3 h-3 ml-0.5 opacity-80" />}
            </button>
          );
        })}
      </div>

      {/* Prompt Banner when no month is selected */}
      {!currentMonthData && !showAllOption && (
        <div className="rounded-3xl bg-[#f5f2ed] p-6 sm:p-8 border border-[#e5e0d8] text-center space-y-2 animate-fadeIn">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#5A5A40]/10 text-[#5A5A40] mb-1">
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="font-serif text-base sm:text-lg font-bold text-[#2d2a26]">
            Select a Month to View Celebrations
          </h3>
          <p className="text-xs text-[#8a817c] max-w-md mx-auto leading-relaxed">
            Click any month above (from January to December) to explore ritual highlights, harvest fairs, and sacred celebrations across India. Click the selected month again or choose "Deselect Month" to clear.
          </p>
        </div>
      )}

      {/* Active Month Banner Preview */}
      {currentMonthData && (
        <div className="relative overflow-hidden rounded-3xl bg-[#3a352f] text-white p-6 sm:p-7 border border-[#e5e0d8] shadow-sm animate-fadeIn">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l15 30H15z' fill='%23E6BE8A' fill-opacity='0.2'/%3E%3C/svg%3E")`, backgroundSize: '120px' }}></div>
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 w-full">
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="bg-orange-500/80 text-white text-[10px] px-3 py-0.5 rounded-full font-bold uppercase tracking-widest">
                  {currentMonthData.season}
                </span>
                <span className="text-xs text-[#E6BE8A] font-serif italic">
                  {currentMonthData.hindiName}
                </span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
                {getMonthName(currentMonthData.id, currentMonthData.name)} {getTranslation('month.inIndia', currentLanguage) || 'in India'}
              </h3>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-normal">
                {currentMonthData.tagline}
              </p>
            </div>

            <div className="flex flex-col items-start lg:items-end gap-2 shrink-0">
              <div className="flex items-center justify-between w-full lg:w-auto gap-3">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#E6BE8A]">
                  {getTranslation('month.topHighlights', currentLanguage) || 'Top Highlights:'}
                </span>
                <button
                  onClick={() => onSelectMonth(null)}
                  className="inline-flex items-center gap-1 text-[11px] text-[#E6BE8A] hover:text-white underline cursor-pointer"
                >
                  <X className="w-3 h-3" />
                  <span>Deselect</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-2 justify-start lg:justify-end">
                {currentMonthData.topFestivals.slice(0, 3).map((item, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-white/10 backdrop-blur-sm text-white px-3.5 py-1.5 rounded-full border border-white/20 font-medium hover:bg-white/20 transition-all"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
