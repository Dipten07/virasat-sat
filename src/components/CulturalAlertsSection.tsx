import React, { useState, useMemo } from 'react';
import { CulturalEventAlert, AppView } from '../types';
import { CULTURAL_ALERTS_DATA } from '../data/culturalAlertsData';
import { 
  Bell, 
  AlertTriangle, 
  Sparkles, 
  Flame, 
  Clock, 
  MapPin, 
  ArrowRight, 
  Filter, 
  Info, 
  Compass, 
  Calendar,
  CheckCircle2,
  X,
  Share2,
  ExternalLink
} from 'lucide-react';

interface CulturalAlertsSectionProps {
  onNavigateTo: (view: AppView, params?: any) => void;
  maxItems?: number;
  isFullView?: boolean;
}

export const CulturalAlertsSection: React.FC<CulturalAlertsSectionProps> = ({
  onNavigateTo,
  maxItems,
  isFullView = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeModalAlert, setActiveModalAlert] = useState<CulturalEventAlert | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filteredAlerts = useMemo(() => {
    return CULTURAL_ALERTS_DATA.filter((alert) => {
      const matchCategory = selectedCategory === 'all' || alert.category === selectedCategory;
      const matchSeverity = selectedSeverity === 'all' || alert.severity === selectedSeverity;
      const matchSearch = !searchQuery || 
        alert.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSeverity && matchSearch;
    });
  }, [selectedCategory, selectedSeverity, searchQuery]);

  const displayAlerts = maxItems ? filteredAlerts.slice(0, maxItems) : filteredAlerts;

  const getSeverityBadge = (severity: CulturalEventAlert['severity']) => {
    switch (severity) {
      case 'urgent':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
          icon: AlertTriangle,
          label: 'Permit & Booking Window'
        };
      case 'auspicious':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500 animate-pulse',
          icon: Flame,
          label: 'Auspicious Ritual'
        };
      case 'highlight':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
          icon: Sparkles,
          label: 'Cultural Highlight'
        };
      default:
        return {
          bg: 'bg-orange-50 text-orange-800 border-orange-200',
          dot: 'bg-orange-500',
          icon: Info,
          label: 'Travel Advisory'
        };
    }
  };

  const handleShare = (alert: CulturalEventAlert) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`✨ ${alert.title} | ${alert.location}, ${alert.state}\n📅 ${alert.dateRange}\n💡 ${alert.travelerTip}\nVia Virasat Cultural Portal`);
      setCopiedId(alert.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  return (
    <section id="cultural-event-alerts-section" className="w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2 rounded-xl bg-orange-100 text-orange-700 border border-orange-200 shadow-xs">
              <Bell className="w-5 h-5 animate-bounce text-orange-600" />
            </div>
            <span className="text-xs uppercase tracking-wider font-bold text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200/80">
              Live Cultural Intelligence
            </span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-stone-900 font-serif">
            Cultural Event Alerts & Special Access
          </h2>
          <p className="text-stone-600 text-sm mt-1">
            Real-time advisory on full moon night viewings, grand aartis, temple car festivals, and high-demand permits across India.
          </p>
        </div>

        {!isFullView && (
          <button
            id="view-all-alerts-btn"
            onClick={() => onNavigateTo('cultural-alerts')}
            className="self-start md:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-orange-700 text-white text-sm font-medium transition-all shadow-sm group"
          >
            <span>Explore All Alerts ({CULTURAL_ALERTS_DATA.length})</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
        )}
      </div>

      {/* Filter Chips (if in full view or many items) */}
      {(isFullView || displayAlerts.length > 2) && (
        <div className="flex flex-wrap items-center gap-2 pb-4 mb-4 border-b border-stone-200 text-xs">
          <div className="flex items-center gap-1.5 text-stone-500 mr-2 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          <button
            onClick={() => setSelectedSeverity('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              selectedSeverity === 'all'
                ? 'bg-orange-700 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            All Severities
          </button>
          <button
            onClick={() => setSelectedSeverity('highlight')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              selectedSeverity === 'highlight'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            Highlights
          </button>
          <button
            onClick={() => setSelectedSeverity('auspicious')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              selectedSeverity === 'auspicious'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            Sacred Rituals
          </button>
          <button
            onClick={() => setSelectedSeverity('urgent')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              selectedSeverity === 'urgent'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            Permit & Booking
          </button>

          {isFullView && (
            <input
              type="text"
              placeholder="Search alerts by city, state, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ml-auto px-3.5 py-1.5 rounded-lg border border-stone-300 text-stone-900 bg-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs w-full sm:w-64"
            />
          )}
        </div>
      )}

      {/* Grid of Alerts - CSS Grid Responsive */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {displayAlerts.map((alert) => {
          const badge = getSeverityBadge(alert.severity);
          const IconComp = badge.icon;

          return (
            <div
              key={alert.id}
              id={`cultural-alert-card-${alert.id}`}
              className="group bg-white rounded-2xl border border-stone-200 shadow-xs hover:shadow-md hover:border-orange-300 transition-all duration-300 flex flex-col justify-between overflow-hidden relative p-5"
            >
              <div className="flex flex-col gap-3">
                {/* Badge Row */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.bg}`}>
                    <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                    {badge.label}
                  </span>

                  <span className="text-[11px] font-medium text-stone-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-stone-400" />
                    {alert.location}
                  </span>
                </div>

                {/* Title & Subtitle */}
                <div>
                  <h3 className="text-base font-bold text-stone-900 group-hover:text-orange-800 transition-colors font-serif leading-snug line-clamp-2">
                    {alert.title}
                  </h3>
                  <p className="text-xs text-orange-800/80 font-medium mt-1">
                    {alert.subtitle}
                  </p>
                </div>

                {/* Timing Pill */}
                <div className="bg-stone-50 rounded-xl p-2.5 border border-stone-100 flex items-start gap-2">
                  <Clock className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-semibold text-stone-800 block">Timing / Access Window:</span>
                    <span className="text-stone-600">{alert.dateRange}</span>
                  </div>
                </div>

                {/* Description Snippet */}
                <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                  {alert.description}
                </p>

                {/* Traveler Tip Highlight */}
                <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-2.5 text-xs text-amber-900 flex items-start gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span className="line-clamp-2">
                    <strong className="font-semibold">Insider Tip: </strong>{alert.travelerTip}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => setActiveModalAlert(alert)}
                  className="text-xs font-semibold text-stone-700 hover:text-orange-700 flex items-center gap-1 transition-colors"
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>Full Details</span>
                </button>

                {alert.actionView && (
                  <button
                    onClick={() => onNavigateTo(alert.actionView!, alert.actionParams)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-600 text-orange-700 hover:text-white text-xs font-semibold transition-all border border-orange-200/70 shadow-2xs"
                  >
                    <span>{alert.actionLabel || 'Explore'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Modal */}
      {activeModalAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-stone-200 shadow-2xl p-6 sm:p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveModalAlert(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
              aria-label="Close alert details"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-700 bg-orange-100 px-3 py-1 rounded-full">
                {activeModalAlert.location}, {activeModalAlert.state}
              </span>
              {activeModalAlert.liveBadge && (
                <span className="text-xs font-semibold text-stone-700 bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
                  {activeModalAlert.liveBadge}
                </span>
              )}
            </div>

            <h3 className="text-2xl font-bold text-stone-900 font-serif mb-2">
              {activeModalAlert.title}
            </h3>
            <p className="text-sm font-medium text-orange-800 mb-5">
              {activeModalAlert.subtitle}
            </p>

            <div className="space-y-4 mb-6 text-sm text-stone-700">
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
                <div className="flex items-center gap-2 font-semibold text-stone-900 mb-1">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span>Timings & Access Details</span>
                </div>
                <p className="text-stone-600 text-xs sm:text-sm pl-6">{activeModalAlert.dateRange}</p>
              </div>

              <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100">
                <div className="flex items-center gap-2 font-semibold text-orange-950 mb-1">
                  <Compass className="w-4 h-4 text-orange-700" />
                  <span>Advisory & Cultural Overview</span>
                </div>
                <p className="text-stone-700 text-xs sm:text-sm leading-relaxed pl-6">
                  {activeModalAlert.description}
                </p>
              </div>

              <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
                <div className="flex items-center gap-2 font-semibold text-amber-950 mb-1">
                  <Sparkles className="w-4 h-4 text-amber-700" />
                  <span>Verified Travel & Permit Advice</span>
                </div>
                <p className="text-amber-900 text-xs sm:text-sm leading-relaxed pl-6">
                  {activeModalAlert.travelerTip}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-stone-200">
              <button
                onClick={() => handleShare(activeModalAlert)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors"
              >
                {copiedId === activeModalAlert.id ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">Advisory Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Copy & Share Alert</span>
                  </>
                )}
              </button>

              {activeModalAlert.actionView && (
                <button
                  onClick={() => {
                    const view = activeModalAlert.actionView!;
                    const params = activeModalAlert.actionParams;
                    setActiveModalAlert(null);
                    onNavigateTo(view, params);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-700 hover:bg-orange-800 text-white text-xs font-bold transition-all shadow-xs"
                >
                  <span>{activeModalAlert.actionLabel || 'View Related Heritage Guide'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
