import React, { useState, useRef, useEffect } from 'react';
import { AppView, UserLocation, SupportedLanguage } from '../types';
import { SUPPORTED_LANGUAGES, getTranslation } from '../data/languages';
import { useAuth } from '../context/AuthContext';
import { CULTURAL_ALERTS_DATA } from '../data/culturalAlertsData';
import {
  Compass,
  Calendar,
  Landmark,
  MapPin,
  Heart,
  Search,
  Menu,
  X,
  User,
  Sparkles,
  Luggage,
  Layers,
  Map as MapIcon,
  CloudSun,
  Award,
  ListChecks,
  Languages,
  Cloud,
  LogIn,
  Bell,
  ChevronDown,
  Camera,
  Compass as CompassIcon,
  Wrench
} from 'lucide-react';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  userLocation: UserLocation;
  onOpenLocationModal: () => void;
  onOpenSearchModal: () => void;
  savedCount?: number;
  currentLanguage: SupportedLanguage;
  onOpenLanguageModal: () => void;
  onOpenAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  userLocation,
  onOpenLocationModal,
  onOpenSearchModal,
  currentLanguage,
  onOpenLanguageModal,
  onOpenAuthModal
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);
  const { user, userProfile, bookmarks, itineraries } = useAuth();

  const totalSavedCount = bookmarks.length + itineraries.length;
  const activeLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  const localAlertCount = React.useMemo(() => {
    const city = userLocation.city.toLowerCase();
    const state = userLocation.state.toLowerCase();
    return CULTURAL_ALERTS_DATA.filter((a) =>
      a.location.toLowerCase().includes(city) ||
      city.includes(a.location.toLowerCase()) ||
      a.state.toLowerCase().includes(state) ||
      state.includes(a.state.toLowerCase())
    ).length;
  }, [userLocation.city, userLocation.state]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
        setToolsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Simplified Core Primary Navigation Links
  const primaryNavItems: { label: string; view: AppView; icon: React.FC<{ className?: string }>; activeViews: AppView[] }[] = [
    { 
      label: getTranslation('nav.home', currentLanguage), 
      view: 'home', 
      icon: Compass,
      activeViews: ['home', 'destinations', 'city-detail', 'state-detail', 'states']
    },
    { 
      label: getTranslation('nav.festivals', currentLanguage), 
      view: 'festivals', 
      icon: Calendar,
      activeViews: ['festivals', 'festival-detail']
    },
    { 
      label: `${getTranslation('nav.monuments', currentLanguage)} & Map`, 
      view: 'monuments', 
      icon: Landmark,
      activeViews: ['monuments', 'monuments-map', 'monument-detail']
    },
    { 
      label: getTranslation('nav.savedTrips', currentLanguage), 
      view: 'my-trip', 
      icon: Luggage,
      activeViews: ['my-trip', 'itinerary-generator']
    },
  ];

  // Secondary Toolkit Items
  const toolkitItems: { label: string; view: AppView; icon: React.FC<{ className?: string }>; desc: string; badge?: string }[] = [
    { 
      label: getTranslation('nav.map', currentLanguage) || 'Interactive Map', 
      view: 'monuments-map', 
      icon: MapIcon, 
      desc: 'Explore ASI & UNESCO heritage on map' 
    },
    { 
      label: getTranslation('nav.quiz', currentLanguage) || 'Heritage Quiz', 
      view: 'culture-quiz', 
      icon: Award, 
      desc: 'Test your cultural knowledge & win badges' 
    },
    { 
      label: getTranslation('nav.checklist', currentLanguage) || 'Packing Checklist', 
      view: 'checklist', 
      icon: ListChecks, 
      desc: 'Temple & cultural luggage planner' 
    },
    { 
      label: getTranslation('nav.weather', currentLanguage) || 'Weather & Seasons', 
      view: 'weather', 
      icon: CloudSun, 
      desc: 'Forecast & best visiting timings' 
    },
    { 
      label: 'Cultural Alerts', 
      view: 'cultural-alerts', 
      icon: Bell, 
      desc: 'Crowd advisories & festival alerts',
      badge: localAlertCount > 0 ? `${localAlertCount} Active` : undefined
    },
    { 
      label: 'Trip Memories', 
      view: 'trip-memories', 
      icon: Camera, 
      desc: 'Journal photos & travel reflections' 
    },
  ];

  const isToolActive = ['monuments-map', 'culture-quiz', 'checklist', 'weather', 'cultural-alerts', 'trip-memories'].includes(currentView);

  return (
    <>
      {/* Top Main Navbar */}
      <header className="sticky top-0 z-40 bg-[#fdfaf6]/95 backdrop-blur-md border-b border-[#e5e0d8] shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 gap-3">
            
            {/* Brand Logo */}
            <div
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 cursor-pointer select-none group shrink-0"
              id="brand-logo-btn"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#5A5A40] flex items-center justify-center text-white shadow-sm shadow-[#5A5A40]/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-[#E6BE8A]" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold italic text-lg sm:text-xl text-[#2d2a26] tracking-tight leading-none">
                  Virasat<span className="text-[#8A3324]">.</span>
                </span>
                <span className="text-[9px] uppercase tracking-widest font-semibold text-[#8a817c] mt-0.5 hidden xs:inline">
                  Indian Heritage & Culture
                </span>
              </div>
            </div>

            {/* Desktop Navigation Links (Simplified 4 Core Items + Tools Dropdown) */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-1.5" id="main-nav-links">
              {primaryNavItems.map((item) => {
                const isActive = item.activeViews.includes(currentView);
                const Icon = item.icon;
                return (
                  <button
                    key={item.view}
                    onClick={() => onNavigate(item.view)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#5A5A40] text-white shadow-xs'
                        : 'text-[#615951] hover:text-[#2d2a26] hover:bg-[#f2ece2]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                    {item.view === 'my-trip' && totalSavedCount > 0 && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-white text-[#5A5A40]' : 'bg-[#8A3324] text-white'
                      }`}>
                        {totalSavedCount}
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Tools Dropdown Menu */}
              <div className="relative" ref={toolsRef}>
                <button
                  onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    isToolActive || toolsDropdownOpen
                      ? 'bg-[#5A5A40]/10 text-[#5A5A40] font-bold'
                      : 'text-[#615951] hover:text-[#2d2a26] hover:bg-[#f2ece2]'
                  }`}
                  title="Cultural tools & guides"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Tools</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${toolsDropdownOpen ? 'rotate-180' : ''}`} />
                  {localAlertCount > 0 && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
                  )}
                </button>

                {/* Dropdown Popover */}
                {toolsDropdownOpen && (
                  <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl border border-[#e5e0d8] shadow-xl p-2 z-50 animate-fadeIn space-y-1">
                    <div className="px-3 py-2 border-b border-[#e5e0d8] text-[10px] uppercase font-bold text-[#8a817c] tracking-widest">
                      Travel & Culture Toolkit
                    </div>
                    {toolkitItems.map((tool) => {
                      const Icon = tool.icon;
                      const isToolSelected = currentView === tool.view;
                      return (
                        <button
                          key={tool.view}
                          onClick={() => {
                            onNavigate(tool.view);
                            setToolsDropdownOpen(false);
                          }}
                          className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl transition-all text-left cursor-pointer ${
                            isToolSelected ? 'bg-[#f5f2ed] text-[#5A5A40]' : 'hover:bg-[#f8f5f0] text-[#2d2a26]'
                          }`}
                        >
                          <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                            isToolSelected ? 'bg-[#5A5A40] text-white' : 'bg-[#f5f2ed] text-[#5A5A40]'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold">{tool.label}</span>
                              {tool.badge && (
                                <span className="text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full">
                                  {tool.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-[#8a817c] truncate mt-0.5 font-normal">
                              {tool.desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </nav>

            {/* Right Action Tools: Language, Location, Quick Search, User Auth */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Language Selector */}
              <button
                onClick={onOpenLanguageModal}
                className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs bg-white hover:bg-[#f5f2ed] border border-[#e5e0d8] rounded-full transition-all text-[#8A3324] font-semibold cursor-pointer shrink-0 shadow-2xs hover:scale-102"
                title="Change regional language"
                id="language-selector-nav-btn"
              >
                <Languages className="w-3.5 h-3.5 text-[#8A3324]" />
                <span className="font-bold text-xs">{activeLangObj.nativeName}</span>
              </button>

              {/* Origin City Pill */}
              <button
                onClick={onOpenLocationModal}
                className="relative flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs bg-white hover:bg-[#f5f2ed] border border-[#e5e0d8] rounded-full transition-all shadow-2xs cursor-pointer shrink-0"
                title={`Departure City: ${userLocation.city}`}
                id="location-selector-nav-btn"
              >
                <MapPin className="w-3.5 h-3.5 text-[#5A5A40]" />
                <span className="truncate max-w-[65px] sm:max-w-[90px] font-semibold text-[#2d2a26]">
                  {userLocation.city}
                </span>
              </button>

              {/* Quick Search Shortcut */}
              <button
                onClick={onOpenSearchModal}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#8a817c] bg-[#f5f2ed] hover:bg-[#ece7df] border border-[#e5e0d8] rounded-full transition-all shadow-2xs cursor-pointer"
                title="Search destinations, monuments & festivals (⌘K)"
                id="search-trigger-nav-btn"
              >
                <Search className="w-3.5 h-3.5 text-[#5A5A40]" />
                <span className="hidden lg:inline text-xs">Search</span>
                <kbd className="hidden lg:inline-block text-[9px] font-mono bg-white text-[#8a817c] px-1.5 py-0.5 rounded-md border border-[#e5e0d8]">
                  ⌘K
                </kbd>
              </button>

              {/* User Account / Profile */}
              {user ? (
                <button
                  onClick={() => onNavigate('profile')}
                  className={`flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full border transition-all cursor-pointer shadow-2xs ${
                    currentView === 'profile'
                      ? 'bg-[#5A5A40] text-white border-[#5A5A40]'
                      : 'bg-white hover:bg-[#f5f2ed] border-[#e5e0d8] text-[#2d2a26]'
                  }`}
                  title="Traveler Profile & Cloud Passport"
                >
                  <div className="w-6 h-6 rounded-full bg-[#E6BE8A] text-[#2c221e] flex items-center justify-center font-bold text-xs shadow-xs">
                    {(userProfile?.displayName || user.displayName || 'V')[0].toUpperCase()}
                  </div>
                  <Cloud className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                </button>
              ) : (
                <button
                  onClick={onOpenAuthModal}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#5A5A40] hover:bg-[#43432f] text-white text-xs font-semibold rounded-full shadow-xs transition-all cursor-pointer"
                  title="Sign In / Cloud Sync"
                  id="auth-sign-in-nav-btn"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-[#2d2a26] hover:text-[#5A5A40] rounded-xl cursor-pointer"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#fdfaf6] border-b border-[#e5e0d8] px-4 pt-2 pb-4 space-y-2 shadow-lg animate-fadeIn">
            <div className="space-y-1">
              <div className="px-2 py-1 text-[10px] font-bold text-[#8a817c] uppercase tracking-widest">
                Main Discovery
              </div>
              {primaryNavItems.map((item) => {
                const isActive = item.activeViews.includes(currentView);
                const Icon = item.icon;
                return (
                  <button
                    key={item.view}
                    onClick={() => {
                      onNavigate(item.view);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#5A5A40] text-white font-bold'
                        : 'text-[#2d2a26] hover:bg-[#f5f2ed]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.view === 'my-trip' && totalSavedCount > 0 && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white text-[#5A5A40]">
                        {totalSavedCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Mobile Toolkit Options */}
            <div className="pt-2 border-t border-[#e5e0d8] space-y-1">
              <div className="px-2 py-1 text-[10px] font-bold text-[#8a817c] uppercase tracking-widest">
                Culture & Travel Tools
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {toolkitItems.map((tool) => {
                  const Icon = tool.icon;
                  const isSelected = currentView === tool.view;
                  return (
                    <button
                      key={tool.view}
                      onClick={() => {
                        onNavigate(tool.view);
                        setMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium text-left transition-all ${
                        isSelected ? 'bg-[#5A5A40] text-white' : 'bg-white border border-[#e5e0d8] text-[#2d2a26]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{tool.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mobile Footer Shortcuts */}
            <div className="pt-2 border-t border-[#e5e0d8] flex items-center gap-2">
              <button
                onClick={() => {
                  onOpenLanguageModal();
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2 px-3 text-xs font-semibold text-[#8A3324] bg-[#8A3324]/10 rounded-xl text-center flex items-center justify-center gap-1.5"
              >
                <Languages className="w-3.5 h-3.5" />
                <span>{activeLangObj.name}</span>
              </button>
              <button
                onClick={() => {
                  onNavigate('profile');
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2 px-3 text-xs font-semibold text-[#2d2a26] bg-white border border-[#e5e0d8] rounded-xl text-center flex items-center justify-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                <span>Passport</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Bottom Navigation Bar (Simplified with Safe Area Padding & Touch Targets) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#fdfaf6]/95 backdrop-blur-md border-t border-[#e5e0d8] px-2 py-1.5 pb-safe shadow-lg">
        <div className="flex items-center justify-around">
          {[
            { label: 'Explore', view: 'home' as AppView, icon: Compass },
            { label: 'Festivals', view: 'festivals' as AppView, icon: Calendar },
            { label: 'Monuments', view: 'monuments' as AppView, icon: Landmark },
            { label: 'Saved', view: 'my-trip' as AppView, icon: Luggage },
          ].map((item) => {
            const isActive = currentView === item.view || 
              (item.view === 'home' && ['destinations', 'city-detail', 'state-detail', 'states'].includes(currentView)) ||
              (item.view === 'festivals' && currentView === 'festival-detail') ||
              (item.view === 'monuments' && ['monuments-map', 'monument-detail'].includes(currentView)) ||
              (item.view === 'my-trip' && currentView === 'itinerary-generator');
            
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => onNavigate(item.view)}
                className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl text-[10px] font-medium transition-all min-h-[44px] min-w-[56px] active:scale-95 cursor-pointer ${
                  isActive ? 'text-[#5A5A40] font-bold bg-[#5A5A40]/10' : 'text-[#8a817c] hover:text-[#2d2a26]'
                }`}
              >
                <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-[#5A5A40]' : 'text-[#8a817c]'}`} />
                <span className="leading-tight">{item.label}</span>
                {item.view === 'my-trip' && totalSavedCount > 0 && (
                  <span className="absolute top-1 right-2.5 w-3.5 h-3.5 bg-[#8A3324] text-white text-[8px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#fdfaf6]">
                    {totalSavedCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
