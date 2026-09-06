import React, { useState, useMemo, useEffect } from 'react';
import { UserLocation, AppView, SupportedLanguage, CulturalEventAlert } from '../types';
import { CULTURAL_ALERTS_DATA } from '../data/culturalAlertsData';
import { FESTIVALS_DATA } from '../data/festivalsData';
import { calculateDistanceKm, POPULAR_ORIGIN_CITIES } from '../data/indianLocations';
import { getTranslation } from '../data/languages';
import {
  Bell,
  AlertTriangle,
  Sparkles,
  Flame,
  Info,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Clock,
  ArrowRight,
  X,
  ExternalLink,
  Eye,
  Minimize2,
  Maximize2
} from 'lucide-react';

interface LocalCulturalAlertBarProps {
  userLocation: UserLocation;
  onNavigateTo: (view: AppView, params?: any) => void;
  onOpenLocationModal: () => void;
  currentLanguage?: SupportedLanguage;
}

interface EnrichedAlert {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  state: string;
  severity: 'urgent' | 'highlight' | 'advisory' | 'auspicious';
  category: string;
  liveBadge?: string;
  dateRange: string;
  description: string;
  travelerTip: string;
  actionLabel?: string;
  actionView?: AppView;
  actionParams?: any;
  distanceKm?: number;
  isDirectCityMatch: boolean;
  isStateMatch: boolean;
}

export const LocalCulturalAlertBar: React.FC<LocalCulturalAlertBarProps> = ({
  userLocation,
  onNavigateTo,
  onOpenLocationModal,
  currentLanguage = 'en'
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Compute matched alerts for the user's location
  const matchedAlerts: EnrichedAlert[] = useMemo(() => {
    const userCityLower = userLocation.city.toLowerCase();
    const userStateLower = userLocation.state.toLowerCase();

    // 1. Direct city matches in CULTURAL_ALERTS_DATA
    const directCityAlerts: EnrichedAlert[] = [];
    // 2. State matches
    const stateAlerts: EnrichedAlert[] = [];
    // 3. Nearby other alerts
    const otherAlerts: EnrichedAlert[] = [];

    CULTURAL_ALERTS_DATA.forEach((alert) => {
      const alertCityLower = alert.location.toLowerCase();
      const alertStateLower = alert.state.toLowerCase();

      // Find coords of alert location if possible
      const matchedCityLoc = POPULAR_ORIGIN_CITIES.find(
        (c) => c.city.toLowerCase().includes(alertCityLower) || alertCityLower.includes(c.city.toLowerCase())
      );
      const distance = matchedCityLoc
        ? calculateDistanceKm(userLocation.latitude, userLocation.longitude, matchedCityLoc.latitude, matchedCityLoc.longitude)
        : undefined;

      const enriched: EnrichedAlert = {
        id: alert.id,
        title: alert.title,
        subtitle: alert.subtitle,
        location: alert.location,
        state: alert.state,
        severity: alert.severity,
        category: alert.category,
        liveBadge: alert.liveBadge,
        dateRange: alert.dateRange,
        description: alert.description,
        travelerTip: alert.travelerTip,
        actionLabel: alert.actionLabel,
        actionView: alert.actionView,
        actionParams: alert.actionParams,
        distanceKm: distance,
        isDirectCityMatch: alertCityLower.includes(userCityLower) || userCityLower.includes(alertCityLower) || (alert.cityId && alert.cityId.toLowerCase() === userCityLower),
        isStateMatch: alertStateLower.includes(userStateLower) || userStateLower.includes(alertStateLower)
      };

      if (enriched.isDirectCityMatch) {
        directCityAlerts.push(enriched);
      } else if (enriched.isStateMatch) {
        stateAlerts.push(enriched);
      } else if (distance !== undefined && distance <= 450) {
        otherAlerts.push(enriched);
      }
    });

    // Also check if any upcoming festival belongs to user's state / city
    FESTIVALS_DATA.forEach((fest) => {
      const stateMatch = (fest.celebratedStates || []).some((s) => s.toLowerCase().includes(userStateLower) || userStateLower.includes(s.toLowerCase()));
      const destMatch = (fest.primaryDestinations || []).some((d) => d.toLowerCase().includes(userCityLower) || userCityLower.includes(d.toLowerCase()));
      
      if (destMatch || stateMatch) {
        // avoid duplicate if alert already covers this festival
        const alreadyExists = directCityAlerts.some((a) => a.actionParams?.festivalId === fest.id) ||
                              stateAlerts.some((a) => a.actionParams?.festivalId === fest.id);
        if (!alreadyExists) {
          const festAlert: EnrichedAlert = {
            id: `fest-alert-${fest.id}`,
            title: `${fest.name} Celebrations & Advisory`,
            subtitle: `${fest.traditionalTithi || fest.dateRange} • ${fest.duration}`,
            location: destMatch ? userLocation.city : fest.stateOrigin || fest.celebratedStates?.[0] || userLocation.state,
            state: userLocation.state,
            severity: 'auspicious',
            category: 'ritual',
            liveBadge: `🪔 ${fest.name}`,
            dateRange: fest.dateRange,
            description: fest.shortDescription,
            travelerTip: `Best experienced at ${fest.bestExperienceSpot}. Enjoy traditional delicacies like ${fest.specialFoods?.slice(0, 2).join(', ') || 'regional sweets'}.`,
            actionLabel: `Explore ${fest.name} Schedule`,
            actionView: 'festival-detail',
            actionParams: { festivalId: fest.id },
            isDirectCityMatch: destMatch,
            isStateMatch: stateMatch,
            distanceKm: destMatch ? 0 : 50
          };
          if (destMatch) directCityAlerts.push(festAlert);
          else stateAlerts.push(festAlert);
        }
      }
    });

    // Combine in order of relevance: Direct City > State > Nearby (<450km) > fallback top alerts
    let result = [...directCityAlerts, ...stateAlerts, ...otherAlerts];
    if (result.length === 0) {
      // Fallback to top highlights with calculated distances from user location
      result = CULTURAL_ALERTS_DATA.slice(0, 3).map((a) => {
        const matchedCityLoc = POPULAR_ORIGIN_CITIES.find(
          (c) => c.city.toLowerCase().includes(a.location.toLowerCase()) || a.location.toLowerCase().includes(c.city.toLowerCase())
        );
        const distance = matchedCityLoc
          ? calculateDistanceKm(userLocation.latitude, userLocation.longitude, matchedCityLoc.latitude, matchedCityLoc.longitude)
          : undefined;
        return {
          id: a.id,
          title: a.title,
          subtitle: a.subtitle,
          location: a.location,
          state: a.state,
          severity: a.severity,
          category: a.category,
          liveBadge: a.liveBadge,
          dateRange: a.dateRange,
          description: a.description,
          travelerTip: a.travelerTip,
          actionLabel: a.actionLabel,
          actionView: a.actionView,
          actionParams: a.actionParams,
          distanceKm: distance,
          isDirectCityMatch: false,
          isStateMatch: false
        };
      });
    }

    return result;
  }, [userLocation]);

  // Reset index if out of bounds or user location changes
  useEffect(() => {
    setCurrentIndex(0);
    setIsDismissed(false);
  }, [userLocation.city, userLocation.state]);

  if (isDismissed || matchedAlerts.length === 0) {
    return null;
  }

  const currentAlert = matchedAlerts[currentIndex] || matchedAlerts[0];

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % matchedAlerts.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + matchedAlerts.length) % matchedAlerts.length);
  };

  const handleAction = () => {
    if (currentAlert.actionView) {
      onNavigateTo(currentAlert.actionView, currentAlert.actionParams);
    } else {
      onNavigateTo('cultural-alerts');
    }
  };

  // Severity color pairings
  const getSeverityStyle = (severity: EnrichedAlert['severity']) => {
    switch (severity) {
      case 'urgent':
        return {
          barBg: 'bg-[#fff5f5] border-[#fed7d7]',
          badgeBg: 'bg-[#e53e3e] text-white',
          badgeText: 'text-[#c53030]',
          iconBg: 'bg-[#fed7d7] text-[#c53030]',
          pulseDot: 'bg-[#e53e3e]',
          btnBg: 'bg-[#c53030] hover:bg-[#9b2c2c] text-white',
          icon: AlertTriangle,
          label: 'Permit & Crowd Warning'
        };
      case 'auspicious':
        return {
          barBg: 'bg-[#fffaf0] border-[#feebc8]',
          badgeBg: 'bg-[#dd6b20] text-white',
          badgeText: 'text-[#c05621]',
          iconBg: 'bg-[#feebc8] text-[#c05621]',
          pulseDot: 'bg-[#dd6b20]',
          btnBg: 'bg-[#c05621] hover:bg-[#9c4221] text-white',
          icon: Flame,
          label: 'Auspicious Ritual & Timing'
        };
      case 'highlight':
        return {
          barBg: 'bg-[#f0fff4] border-[#c6f6d5]',
          badgeBg: 'bg-[#38a169] text-white',
          badgeText: 'text-[#2f855a]',
          iconBg: 'bg-[#c6f6d5] text-[#2f855a]',
          pulseDot: 'bg-[#38a169]',
          btnBg: 'bg-[#2f855a] hover:bg-[#276749] text-white',
          icon: Sparkles,
          label: 'Special Access & Illumination'
        };
      default:
        return {
          barBg: 'bg-[#faf8f5] border-[#e2ddd5]',
          badgeBg: 'bg-[#5A5A40] text-white',
          badgeText: 'text-[#5A5A40]',
          iconBg: 'bg-[#ece7df] text-[#5A5A40]',
          pulseDot: 'bg-[#5A5A40]',
          btnBg: 'bg-[#5A5A40] hover:bg-[#484833] text-white',
          icon: Info,
          label: 'Local Cultural Advisory'
        };
    }
  };

  const style = getSeverityStyle(currentAlert.severity);
  const IconComponent = style.icon;

  // Minimized Floating Pill View
  if (isMinimized) {
    return (
      <div className="animate-fadeIn mb-4">
        <div
          onClick={() => setIsMinimized(false)}
          className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-2xl border shadow-xs transition-all cursor-pointer hover:shadow-md ${style.barBg}`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${style.pulseDot}`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${style.pulseDot}`} />
            </span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2d2a26] truncate">
              <span className="font-bold text-[#8a817c]">
                {currentAlert.isDirectCityMatch
                  ? `Local Alert for ${userLocation.city}:`
                  : `Regional Alert (${userLocation.state}):`}
              </span>
              <span className="truncate">{currentAlert.title}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(false);
              }}
              className="p-1 text-[#8a817c] hover:text-[#2d2a26] rounded-md transition-colors"
              title="Expand Alert Bar"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="relative animate-fadeIn mb-6 sm:mb-8">
        <div
          className={`rounded-2xl sm:rounded-3xl border shadow-xs p-3.5 sm:p-4 transition-all duration-300 ${style.barBg}`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5">
            
            {/* Left: Icon, Badges, Title & Key Advisory */}
            <div className="flex items-start gap-3 min-w-0 flex-1">
              {/* Icon badge with pulsing status dot */}
              <div className="relative shrink-0 mt-0.5">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xs ${style.iconBg}`}>
                  <IconComponent className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${style.pulseDot}`} />
                  <span className={`relative inline-flex rounded-full h-3 w-3 ${style.pulseDot}`} />
                </span>
              </div>

              {/* Text content */}
              <div className="min-w-0 flex-1 space-y-1">
                {/* Badges row */}
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {/* Location badge */}
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-white/90 border border-[#e5e0d8] text-[#2d2a26] shadow-2xs">
                    <MapPin className="w-3 h-3 text-[#5A5A40]" />
                    {currentAlert.isDirectCityMatch ? (
                      <span>In {userLocation.city}</span>
                    ) : currentAlert.isStateMatch ? (
                      <span>In {userLocation.state}</span>
                    ) : currentAlert.distanceKm !== undefined ? (
                      <span>~{currentAlert.distanceKm} km from {userLocation.city}</span>
                    ) : (
                      <span>{currentAlert.location}</span>
                    )}
                  </span>

                  {/* Category / Live Badge */}
                  {currentAlert.liveBadge && (
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold shadow-2xs ${style.badgeBg}`}>
                      {currentAlert.liveBadge}
                    </span>
                  )}

                  {/* Timing indicator */}
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-medium text-[#6b625b]">
                    <Clock className="w-3 h-3 text-[#8a817c]" />
                    <span>{currentAlert.dateRange}</span>
                  </span>
                </div>

                {/* Title & brief tip */}
                <div className="space-y-0.5">
                  <h4 className="text-xs sm:text-sm font-bold text-[#2d2a26] leading-tight">
                    {currentAlert.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-[#5c544e] line-clamp-1 leading-relaxed">
                    <strong className="text-[#2d2a26] font-semibold">{currentAlert.subtitle}: </strong>
                    <span>{currentAlert.travelerTip || currentAlert.description}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Right Controls: Actions, Paging, Minimize & Close */}
            <div className="flex items-center justify-between md:justify-end gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#e5e0d8]/60">
              {/* Carousel pager if multiple alerts */}
              {matchedAlerts.length > 1 && (
                <div className="flex items-center gap-1 bg-white/80 border border-[#e5e0d8] rounded-xl px-2 py-1 text-[10px] font-semibold text-[#6b625b] shadow-2xs">
                  <button
                    onClick={handlePrev}
                    className="p-0.5 hover:text-[#2d2a26] cursor-pointer"
                    title="Previous local alert"
                    aria-label="Previous alert"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-1 text-[#2d2a26] font-bold">
                    {currentIndex + 1}/{matchedAlerts.length}
                  </span>
                  <button
                    onClick={handleNext}
                    className="p-0.5 hover:text-[#2d2a26] cursor-pointer"
                    title="Next local alert"
                    aria-label="Next alert"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Quick View Details Modal Trigger */}
              <button
                onClick={() => setShowDetailModal(true)}
                className="px-2.5 py-1.5 rounded-xl border border-[#e5e0d8] bg-white hover:bg-[#f5f2ed] text-[#2d2a26] text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                title="Read full advisory notice"
              >
                <Eye className="w-3.5 h-3.5 text-[#5A5A40]" />
                <span className="hidden sm:inline">Advisory Details</span>
              </button>

              {/* Main Action Button */}
              <button
                onClick={handleAction}
                className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs hover:shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0 ${style.btnBg}`}
              >
                <span>{currentAlert.actionLabel || 'Explore Event'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Change Location Pill */}
              <button
                onClick={onOpenLocationModal}
                className="p-1.5 rounded-xl text-[#8a817c] hover:text-[#2d2a26] hover:bg-white/80 transition-colors cursor-pointer border border-transparent hover:border-[#e5e0d8]"
                title={`Change selected location (Current: ${userLocation.city})`}
              >
                <MapPin className="w-3.5 h-3.5" />
              </button>

              {/* Minimize & Dismiss */}
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => setIsMinimized(true)}
                  className="p-1.5 rounded-xl text-[#8a817c] hover:text-[#2d2a26] hover:bg-white/80 transition-colors cursor-pointer"
                  title="Minimize Alert Bar"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsDismissed(true)}
                  className="p-1.5 rounded-xl text-[#8a817c] hover:text-[#2d2a26] hover:bg-white/80 transition-colors cursor-pointer"
                  title="Dismiss Alert"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Full Advisory Detail Modal */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div
            className="bg-white rounded-3xl border border-[#e5e0d8] shadow-2xl max-w-lg w-full overflow-hidden animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`p-6 border-b border-[#e5e0d8] ${style.barBg} flex items-start justify-between gap-4`}>
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-2xl ${style.iconBg} shadow-2xs shrink-0`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${style.badgeBg}`}>
                      {currentAlert.liveBadge || style.label}
                    </span>
                    <span className="text-xs font-semibold text-[#8a817c]">
                      📍 {currentAlert.location}, {currentAlert.state}
                    </span>
                  </div>
                  <h3 className="text-lg font-serif font-bold text-[#2d2a26] leading-snug">
                    {currentAlert.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="p-1.5 rounded-full bg-white/80 hover:bg-white text-[#8a817c] hover:text-[#2d2a26] border border-[#e5e0d8] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center gap-2 text-xs text-[#8a817c] bg-[#f5f2ed] px-3.5 py-2 rounded-xl">
                <Clock className="w-4 h-4 text-[#5A5A40] shrink-0" />
                <span><strong>Active Schedule Window:</strong> {currentAlert.dateRange}</span>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8a817c]">
                  Official Advisory & Context
                </h4>
                <p className="text-xs sm:text-sm text-[#2d2a26] leading-relaxed">
                  {currentAlert.description}
                </p>
              </div>

              {currentAlert.travelerTip && (
                <div className="p-4 rounded-2xl bg-[#fbf9f5] border border-[#e5e0d8] space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#8C271E]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Traveler Guideline & Practical Tip</span>
                  </div>
                  <p className="text-xs text-[#5c544e] leading-relaxed">
                    {currentAlert.travelerTip}
                  </p>
                </div>
              )}

              <div className="text-[11px] text-[#8a817c] flex items-center gap-1.5 pt-2">
                <Info className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Configured for your active origin <strong className="text-[#2d2a26]">{userLocation.city}, {userLocation.state}</strong>.
                </span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#faf8f5] border-t border-[#e5e0d8] flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  onOpenLocationModal();
                }}
                className="text-xs font-semibold text-[#5A5A40] hover:text-[#2d2a26] underline cursor-pointer"
              >
                Change Location ({userLocation.city})
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#e5e0d8] text-xs font-semibold text-[#6b625b] hover:bg-white cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleAction();
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer ${style.btnBg}`}
                >
                  {currentAlert.actionLabel || 'Proceed to Guide'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
