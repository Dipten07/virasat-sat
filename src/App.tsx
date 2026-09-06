import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AppView,
  UserLocation,
  Festival,
  Monument,
  CityDestination,
  StateData,
  SavedItinerary,
  BreadcrumbItem,
  SupportedLanguage
} from './types';
import { POPULAR_ORIGIN_CITIES } from './data/indianLocations';
import { MONTHS_DATA } from './data/monthsData';
import { FESTIVALS_DATA } from './data/festivalsData';
import { STATES_DATA } from './data/statesData';
import { MONUMENTS_DATA } from './data/monumentsData';
import { CITIES_DATA } from './data/citiesData';
import { SUPPORTED_LANGUAGES, getTranslation } from './data/languages';
import { LanguageProvider, useLanguage } from './context/LanguageContext';

// Components
import { Navbar } from './components/Navbar';
import { Breadcrumbs } from './components/Breadcrumbs';
import { HeroSection } from './components/HeroSection';
import { MonthSelector } from './components/MonthSelector';
import { FestivalCard } from './components/FestivalCard';
import { FestivalDetailView } from './components/FestivalDetailView';
import { CityDetailView } from './components/CityDetailView';
import { MonumentDetailView } from './components/MonumentDetailView';
import { StateSelectionView } from './components/StateSelectionView';
import { StateDetailView } from './components/StateDetailView';
import { ItineraryGeneratorView } from './components/ItineraryGeneratorView';
import { MyTripView } from './components/MyTripView';
import { ProfileView } from './components/ProfileView';
import { LocationModal } from './components/LocationModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { LanguageSelectorModal } from './components/LanguageSelectorModal';
import { MonumentInteractiveMap } from './components/MonumentInteractiveMap';
import { DestinationWeatherView } from './components/DestinationWeatherView';
import { CultureQuizView } from './components/CultureQuizView';
import { TripChecklistView } from './components/TripChecklistView';
import { CulturalAlertsSection } from './components/CulturalAlertsSection';
import { LocalCulturalAlertBar } from './components/LocalCulturalAlertBar';
import { TripMemoriesView } from './components/TripMemoriesView';
import { CULTURAL_ALERTS_DATA } from './data/culturalAlertsData';
import { getSafeHeritageImage, handleImageError } from './utils/imageUtils';
import { trackViewNavigation } from './utils/recentHistory';

import {
  Calendar,
  Landmark,
  MapPin,
  Sparkles,
  ArrowRight,
  Compass,
  Heart,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Ticket,
  Award,
  Languages,
  Bell,
  BookOpen,
  Feather,
  Flame,
  Plus,
  X,
  RotateCcw,
  LayoutGrid,
  Map as MapIcon,
  ListChecks,
  CloudSun,
  Camera,
  Layers,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './components/AuthModal';

function AppMain() {
  const { user, bookmarks, itineraries, memories, toggleBookmark, isBookmarked, saveItinerary } = useAuth();
  const { currentLanguage, setLanguage, t, formatMonthName } = useLanguage();

  // Navigation & View State
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedFestivalId, setSelectedFestivalId] = useState<string>('dev-deepawali');
  const [selectedCityId, setSelectedCityId] = useState<string>('varanasi');
  const [selectedMonumentId, setSelectedMonumentId] = useState<string>('taj-mahal');
  const [selectedStateId, setSelectedStateId] = useState<string>('uttar-pradesh');
  const [activeMonthId, setActiveMonthId] = useState<number | null>(null);
  const [itineraryFestivalId, setItineraryFestivalId] = useState<string | undefined>(undefined);
  
  // Filter States
  const [festivalSearchQuery, setFestivalSearchQuery] = useState<string>('');
  const [festivalCategoryFilter, setFestivalCategoryFilter] = useState<string>('all');
  const [monumentSearchQuery, setMonumentSearchQuery] = useState<string>('');
  const [monumentCategoryFilter, setMonumentCategoryFilter] = useState<string>('all');
  const [monumentViewMode, setMonumentViewMode] = useState<'grid' | 'map'>('grid');
  const [destinationVibeFilter, setDestinationVibeFilter] = useState<string>('all');

  // Navigation History for Back Button
  const [history, setHistory] = useState<
    { view: AppView; festivalId?: string; cityId?: string; monumentId?: string; stateId?: string }[]
  >([{ view: 'home' }]);

  // User Departure Origin Location (default: New Delhi)
  const [userLocation, setUserLocation] = useState<UserLocation>(POPULAR_ORIGIN_CITIES[0]);

  // Modals
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Keyboard shortcut for search (⌘K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsSearchModalOpen(false);
        setIsLocationModalOpen(false);
        setIsLanguageModalOpen(false);
        setIsAuthModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Navigation handlers
  const navigateTo = (
    view: AppView,
    params?: { festivalId?: string; cityId?: string; monumentId?: string; stateId?: string }
  ) => {
    let resolvedCityId = params?.cityId;
    let resolvedFestivalId = params?.festivalId;
    let resolvedMonumentId = params?.monumentId;
    let resolvedStateId = params?.stateId;

    if (params?.monumentId) {
      resolvedMonumentId = params.monumentId;
      setSelectedMonumentId(params.monumentId);
      const m = MONUMENTS_DATA.find((item) => item.id === params.monumentId);
      if (m && m.cityId && !resolvedCityId) {
        resolvedCityId = m.cityId;
        setSelectedCityId(m.cityId);
      }
    }

    if (params?.festivalId) {
      resolvedFestivalId = params.festivalId;
      setSelectedFestivalId(params.festivalId);
      if (view === 'itinerary-generator') {
        setItineraryFestivalId(params.festivalId);
      }
      const f = FESTIVALS_DATA.find((item) => item.id === params.festivalId);
      if (f && f.primaryDestinations && f.primaryDestinations.length > 0 && !resolvedCityId) {
        resolvedCityId = f.primaryDestinations[0];
        setSelectedCityId(f.primaryDestinations[0]);
      }
    } else if (view === 'itinerary-generator' && params?.festivalId === undefined) {
      setItineraryFestivalId(undefined);
    }

    if (params?.cityId) {
      resolvedCityId = params.cityId;
      setSelectedCityId(params.cityId);
    }

    if (params?.stateId) {
      resolvedStateId = params.stateId;
      setSelectedStateId(params.stateId);
    }

    setHistory((prev) => [
      ...prev,
      {
        view,
        festivalId: resolvedFestivalId || selectedFestivalId,
        cityId: resolvedCityId || selectedCityId,
        monumentId: resolvedMonumentId || selectedMonumentId,
        stateId: resolvedStateId || selectedStateId
      }
    ]);

    trackViewNavigation(view, {
      festivalId: resolvedFestivalId || selectedFestivalId,
      cityId: resolvedCityId || selectedCityId,
      monumentId: resolvedMonumentId || selectedMonumentId,
      stateId: resolvedStateId || selectedStateId
    });

    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    if (history.length > 1) {
      const newHistory = [...history];
      newHistory.pop();
      const prevStep = newHistory[newHistory.length - 1];
      setHistory(newHistory);
      if (prevStep.festivalId) setSelectedFestivalId(prevStep.festivalId);
      if (prevStep.cityId) setSelectedCityId(prevStep.cityId);
      if (prevStep.monumentId) setSelectedMonumentId(prevStep.monumentId);
      if (prevStep.stateId) setSelectedStateId(prevStep.stateId);
      trackViewNavigation(prevStep.view, {
        festivalId: prevStep.festivalId,
        cityId: prevStep.cityId,
        monumentId: prevStep.monumentId,
        stateId: prevStep.stateId
      });
      setCurrentView(prevStep.view);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setCurrentView('home');
    }
  };

  // Quick search handler from Hero
  const handleHeroQuickSearch = (query: string) => {
    const q = query.toLowerCase();
    const matchedCity = CITIES_DATA.find(c => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q));
    if (matchedCity) {
      navigateTo('city-detail', { cityId: matchedCity.id });
      return;
    }
    const matchedMonument = MONUMENTS_DATA.find(m => m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q));
    if (matchedMonument) {
      navigateTo('monument-detail', { monumentId: matchedMonument.id });
      return;
    }
    const matchedFestival = FESTIVALS_DATA.find(f => f.name.toLowerCase().includes(q) || f.id.toLowerCase().includes(q));
    if (matchedFestival) {
      navigateTo('festival-detail', { festivalId: matchedFestival.id });
      return;
    }
    setIsSearchModalOpen(true);
  };

  // Toggle Saves via Firebase
  const toggleSaveFestival = (id: string) => {
    const f = FESTIVALS_DATA.find(item => item.id === id);
    if (f) {
      toggleBookmark({
        itemType: 'festival',
        itemId: f.id,
        title: f.name,
        subtitle: f.dateRange,
        imageUrl: f.bannerImage
      });
    }
  };

  const toggleSaveMonument = (id: string) => {
    const m = MONUMENTS_DATA.find(item => item.id === id);
    if (m) {
      toggleBookmark({
        itemType: 'monument',
        itemId: m.id,
        title: m.name,
        subtitle: `${m.cityName}, ${m.state}`,
        imageUrl: m.bannerImage
      });
    }
  };

  const toggleSaveCity = (id: string) => {
    const c = CITIES_DATA.find(item => item.id === id);
    if (c) {
      toggleBookmark({
        itemType: 'city',
        itemId: c.id,
        title: c.name,
        subtitle: c.state,
        imageUrl: c.bannerImage
      });
    }
  };

  // Breadcrumbs Generator
  const breadcrumbs: BreadcrumbItem[] = useMemo(() => {
    const items: BreadcrumbItem[] = [{ label: t('nav.home', 'Home'), view: 'home' }];

    if (currentView === 'festivals') {
      items.push({ label: t('nav.festivals', 'Festivals Calendar'), view: 'festivals' });
    } else if (currentView === 'festival-detail') {
      items.push({ label: t('nav.festivals', 'Festivals'), view: 'festivals' });
      const f = FESTIVALS_DATA.find((item) => item.id === selectedFestivalId);
      if (f) items.push({ label: f.name, view: 'festival-detail', params: { festivalId: f.id } });
    } else if (currentView === 'states') {
      items.push({ label: t('nav.states', 'States & Regions'), view: 'states' });
    } else if (currentView === 'state-detail') {
      items.push({ label: t('nav.states', 'States'), view: 'states' });
      const s = STATES_DATA.find((item) => item.id === selectedStateId);
      if (s) items.push({ label: s.name, view: 'state-detail', params: { stateId: s.id } });
    } else if (currentView === 'destinations') {
      items.push({ label: t('nav.destinations', 'Destinations'), view: 'destinations' });
    } else if (currentView === 'city-detail') {
      items.push({ label: t('nav.destinations', 'Destinations'), view: 'destinations' });
      const c = CITIES_DATA.find((item) => item.id === selectedCityId);
      if (c) items.push({ label: c.name, view: 'city-detail', params: { cityId: c.id } });
    } else if (currentView === 'monuments') {
      items.push({ label: t('nav.monuments', 'Monuments & Map'), view: 'monuments' });
    } else if (currentView === 'monuments-map') {
      items.push({ label: t('nav.interactiveMap', 'Interactive Heritage Map'), view: 'monuments-map' });
    } else if (currentView === 'culture-quiz') {
      items.push({ label: t('nav.cultureQuiz', 'Heritage Culture Quiz'), view: 'culture-quiz' });
    } else if (currentView === 'checklist') {
      items.push({ label: t('nav.tripChecklist', 'Packing Checklist'), view: 'checklist' });
    } else if (currentView === 'weather') {
      items.push({ label: t('nav.weather', 'Weather & Seasons'), view: 'weather' });
    } else if (currentView === 'monument-detail') {
      items.push({ label: t('nav.monuments', 'Monuments'), view: 'monuments' });
      const m = MONUMENTS_DATA.find((item) => item.id === selectedMonumentId);
      if (m) items.push({ label: m.name, view: 'monument-detail', params: { monumentId: m.id } });
    } else if (currentView === 'itinerary-generator') {
      const c = CITIES_DATA.find((item) => item.id === selectedCityId);
      items.push({ label: t('nav.destinations', 'Destinations'), view: 'destinations' });
      if (c) items.push({ label: c.name, view: 'city-detail', params: { cityId: c.id } });
      items.push({ label: t('nav.planTrip', 'Plan Itinerary'), view: 'itinerary-generator' });
    } else if (currentView === 'my-trip') {
      items.push({ label: t('nav.myTrip', 'My Trip & Saved'), view: 'my-trip' });
    } else if (currentView === 'cultural-alerts') {
      items.push({ label: 'Cultural Alerts', view: 'cultural-alerts' });
    } else if (currentView === 'trip-memories') {
      items.push({ label: 'Trip Memories & Journal', view: 'trip-memories' });
    } else if (currentView === 'profile') {
      items.push({ label: t('nav.profile', 'Traveler Profile'), view: 'profile' });
    }

    return items;
  }, [currentView, selectedFestivalId, selectedCityId, selectedMonumentId, selectedStateId, currentLanguage, t]);

  // Selected Entities
  const currentFestival =
    FESTIVALS_DATA.find((f) => f.id === selectedFestivalId) || FESTIVALS_DATA[0];
  const currentCity =
    CITIES_DATA.find((c) => c.id === selectedCityId) || CITIES_DATA[0];
  const currentMonument =
    MONUMENTS_DATA.find((m) => m.id === selectedMonumentId) || MONUMENTS_DATA[0];
  const currentState =
    STATES_DATA.find((s) => s.id === selectedStateId) || STATES_DATA[0];

  // Month filtered festivals
  const activeMonthFestivals = useMemo(() => {
    return FESTIVALS_DATA.filter((f) => f.monthId === activeMonthId);
  }, [activeMonthId]);

  // Filtered festivals for directory & search
  const filteredFestivals = useMemo(() => {
    return FESTIVALS_DATA.filter((f) => {
      const matchesMonth = activeMonthId == null || f.monthId === activeMonthId;
      const q = festivalSearchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        f.name.toLowerCase().includes(q) ||
        (f.hindiName && f.hindiName.toLowerCase().includes(q)) ||
        (f.shortDescription && f.shortDescription.toLowerCase().includes(q)) ||
        (f.stateOrigin && f.stateOrigin.toLowerCase().includes(q)) ||
        (f.celebratedStates && f.celebratedStates.some((s) => s.toLowerCase().includes(q))) ||
        (f.primaryDestinations && f.primaryDestinations.some((d) => d.toLowerCase().includes(q))) ||
        (f.tags && f.tags.some((t) => t.toLowerCase().includes(q)));
      const matchesCategory =
        festivalCategoryFilter === 'all' ||
        (f.tags && f.tags.some((t) => t.toLowerCase().includes(festivalCategoryFilter.toLowerCase())));
      return matchesMonth && matchesSearch && matchesCategory;
    });
  }, [activeMonthId, festivalSearchQuery, festivalCategoryFilter]);

  // Filtered monuments for directory
  const filteredMonuments = useMemo(() => {
    return MONUMENTS_DATA.filter((m) => {
      const q = monumentSearchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.cityName.toLowerCase().includes(q) ||
        m.state.toLowerCase().includes(q) ||
        m.type.toLowerCase().includes(q) ||
        m.historicalSignificance.toLowerCase().includes(q);
      
      const matchesCategory =
        monumentCategoryFilter === 'all' ||
        (monumentCategoryFilter === 'unesco' && m.historicalSignificance.toLowerCase().includes('unesco')) ||
        (monumentCategoryFilter === 'fort' && m.type.toLowerCase().includes('fort')) ||
        (monumentCategoryFilter === 'temple' && m.type.toLowerCase().includes('temple')) ||
        (monumentCategoryFilter === 'palace' && m.type.toLowerCase().includes('palace')) ||
        (monumentCategoryFilter === 'caves' && (m.type.toLowerCase().includes('cave') || m.type.toLowerCase().includes('tomb')));

      return matchesSearch && matchesCategory;
    });
  }, [monumentSearchQuery, monumentCategoryFilter]);

  // Filtered cities on home view
  const filteredCities = useMemo(() => {
    if (destinationVibeFilter === 'all') return CITIES_DATA;
    if (destinationVibeFilter === 'spiritual') {
      return CITIES_DATA.filter(c => ['varanasi', 'madurai', 'amritsar', 'puri', 'rishikesh'].includes(c.id));
    }
    if (destinationVibeFilter === 'unesco') {
      return CITIES_DATA.filter(c => ['agra', 'hampi', 'khajuraho', 'aurangabad', 'konark'].includes(c.id));
    }
    if (destinationVibeFilter === 'royal') {
      return CITIES_DATA.filter(c => ['jaipur', 'udaipur', 'jodhpur', 'mysore', 'gwalior'].includes(c.id));
    }
    return CITIES_DATA;
  }, [destinationVibeFilter]);

  // Unique key for smooth page transitions between views and specific entity detail pages
  const viewKey = useMemo(() => {
    switch (currentView) {
      case 'festival-detail':
        return `festival-${selectedFestivalId}`;
      case 'city-detail':
        return `city-${selectedCityId}`;
      case 'monument-detail':
        return `monument-${selectedMonumentId}`;
      case 'state-detail':
        return `state-${selectedStateId}`;
      case 'itinerary-generator':
        return `itinerary-${selectedCityId}-${itineraryFestivalId || 'general'}`;
      default:
        return currentView;
    }
  }, [currentView, selectedFestivalId, selectedCityId, selectedMonumentId, selectedStateId, itineraryFestivalId]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1E1B18] flex flex-col font-sans selection:bg-[#8C271E]/20 selection:text-[#8C271E]">
      {/* Top Main Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={(v) => navigateTo(v)}
        userLocation={userLocation}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        onOpenSearchModal={() => setIsSearchModalOpen(true)}
        currentLanguage={currentLanguage}
        onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
      />

      {/* Contextual Breadcrumbs Bar */}
      <Breadcrumbs
        items={breadcrumbs}
        onNavigate={(v, params) => navigateTo(v, params)}
        onBack={history.length > 1 ? handleBack : undefined}
        currentLanguage={currentLanguage}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={viewKey}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
        
        {/* =========================================================================
            VIEW 1: HOME VIEW
           ========================================================================= */}
        {currentView === 'home' && (
          <div className="space-y-10 sm:space-y-14">
            
            {/* Contextual Local Cultural Alert Notice */}
            <LocalCulturalAlertBar
              userLocation={userLocation}
              onNavigateTo={(view, params) => navigateTo(view, params)}
              onOpenLocationModal={() => setIsLocationModalOpen(true)}
              currentLanguage={currentLanguage}
            />

            {/* Hero Section */}
            <HeroSection
              userLocation={userLocation}
              currentLanguage={currentLanguage}
              onExploreFestivals={() => navigateTo('festivals')}
              onPlanJourney={() => navigateTo('itinerary-generator', { cityId: selectedCityId })}
              onOpenLocationModal={() => setIsLocationModalOpen(true)}
              onOpenSearchModal={() => setIsSearchModalOpen(true)}
              onQuickSearchDestination={handleHeroQuickSearch}
            />

            {/* Cultural Vibe Explorer Filter Bar */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#8a817c] uppercase tracking-widest">
                    <Sparkles className="w-3.5 h-3.5 text-[#5A5A40]" />
                    <span>Explore by Experience</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2d2a26] mt-0.5">
                    Curated Heritage Journeys
                  </h2>
                </div>
                
                {/* Vibe Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                  {[
                    { id: 'all', label: 'All Destinations' },
                    { id: 'spiritual', label: '🪔 Sacred & Ghats' },
                    { id: 'unesco', label: '🏛️ UNESCO Sites' },
                    { id: 'royal', label: '👑 Royal Palaces' },
                  ].map((vibe) => (
                    <button
                      key={vibe.id}
                      onClick={() => setDestinationVibeFilter(vibe.id)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        destinationVibeFilter === vibe.id
                          ? 'bg-[#5A5A40] text-white shadow-xs'
                          : 'bg-white hover:bg-[#f2ece2] text-[#615951] border border-[#e5e0d8]'
                      }`}
                    >
                      {vibe.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Destinations Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-1">
                {filteredCities.map((city) => (
                  <div
                    key={city.id}
                    onClick={() => navigateTo('city-detail', { cityId: city.id })}
                    className="group bg-white rounded-2xl border border-[#e5e0d8] p-3 sm:p-3.5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative h-44 rounded-xl overflow-hidden bg-[#3a352f]">
                        <img
                          src={getSafeHeritageImage(city.bannerImage, 'city', city.id)}
                          alt={city.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          onError={(e) => handleImageError(e, 'city')}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        <div className="absolute top-2.5 left-2.5 bg-orange-500/90 text-white text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md">
                          {city.state}
                        </div>
                        <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                          <h3 className="text-lg font-serif font-bold text-white">
                            {city.name}
                          </h3>
                        </div>
                      </div>

                      <div className="pt-3 px-1 space-y-2">
                        <p className="text-xs text-[#8a817c] line-clamp-2 leading-relaxed">
                          {city.tagline}
                        </p>

                        <div className="text-xs text-[#615951] space-y-0.5">
                          <div>
                            <strong className="text-[#5A5A40]">Key Sites: </strong>
                            <span>{city.monumentIds.length} Monuments • {city.religiousSites.length} Temples</span>
                          </div>
                          <div>
                            <strong className="text-[#5A5A40]">Cuisine: </strong>
                            <span>{city.authenticFood.slice(0, 2).map((f) => f.name).join(', ')}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 px-1 border-t border-[#e5e0d8] flex items-center justify-between text-xs mt-3">
                      <span className="text-xs font-semibold text-[#5A5A40]">
                        Explore City Guide
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#5A5A40] group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* 12-Month Festival Discovery Flow */}
            <section id="month-festival-section" className="space-y-6 pt-4 border-t border-[#e5e0d8]">
              <MonthSelector
                selectedMonthId={activeMonthId}
                onSelectMonth={(mId) => setActiveMonthId(mId)}
                currentLanguage={currentLanguage}
                showAllOption={false}
              />

              {/* Month Festivals Grid when a month is clicked */}
              {activeMonthId !== null && (
                <div className="space-y-4 pt-2 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-xl font-serif font-bold text-[#2d2a26]">
                        {`${t('month.celebrationsIn', 'Celebrations in')} ${formatMonthName(activeMonthId)}`}
                      </h3>
                      <p className="text-xs text-[#8a817c]">
                        {`Explore sacred traditions & fairs celebrated in ${formatMonthName(activeMonthId)}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setActiveMonthId(null)}
                        className="text-xs font-semibold text-[#8a817c] hover:text-[#2d2a26] underline cursor-pointer"
                      >
                        Clear Selection
                      </button>
                      <button
                        onClick={() => navigateTo('festivals')}
                        className="text-xs uppercase font-bold tracking-widest text-[#5A5A40] hover:text-[#2d2a26] flex items-center gap-1 cursor-pointer shrink-0"
                      >
                        <span>View All 12 Months</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {activeMonthFestivals.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                      {activeMonthFestivals.map((festival) => (
                        <FestivalCard
                          key={festival.id}
                          festival={festival}
                          onExplore={(fId) => navigateTo('festival-detail', { festivalId: fId })}
                          isSaved={isBookmarked('festival', festival.id)}
                          onToggleSave={toggleSaveFestival}
                          currentLanguage={currentLanguage}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl p-8 text-center border border-[#e5e0d8] text-xs text-[#8a817c]">
                      More regional celebrations being cataloged for this month.
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Traveler's Smart Cultural Toolkit (4 Clear Cards) */}
            <section className="space-y-4 pt-4 border-t border-[#e5e0d8]">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#8a817c] uppercase tracking-widest">
                  <Compass className="w-3.5 h-3.5 text-[#5A5A40]" />
                  <span>Traveler Toolkit</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#2d2a26] mt-0.5">
                  Essential Heritage Tools
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Tool 1: Interactive Map */}
                <div
                  onClick={() => navigateTo('monuments-map')}
                  className="bg-white rounded-2xl p-5 border border-[#e5e0d8] shadow-2xs hover:shadow-md hover:border-[#5A5A40]/40 transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-[#5A5A40]/10 text-[#5A5A40] flex items-center justify-center group-hover:bg-[#5A5A40] group-hover:text-white transition-colors">
                      <MapIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#2d2a26]">Interactive Heritage Map</h3>
                      <p className="text-xs text-[#8a817c] mt-1 line-clamp-2">
                        Pinpoint ASI monuments, calculate direct route distances & discover nearby gems.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 flex items-center text-xs font-bold text-[#5A5A40] group-hover:translate-x-1 transition-transform">
                    <span>Open Visual Map</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>

                {/* Tool 2: Culture Quiz */}
                <div
                  onClick={() => navigateTo('culture-quiz')}
                  className="bg-white rounded-2xl p-5 border border-[#e5e0d8] shadow-2xs hover:shadow-md hover:border-[#5A5A40]/40 transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#2d2a26]">Heritage Culture Quiz</h3>
                      <p className="text-xs text-[#8a817c] mt-1 line-clamp-2">
                        Test your knowledge of Indian temples, rituals, Mughal architecture & win badges.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 flex items-center text-xs font-bold text-amber-700 group-hover:translate-x-1 transition-transform">
                    <span>Take Culture Quiz</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>

                {/* Tool 3: Packing Checklist */}
                <div
                  onClick={() => navigateTo('checklist')}
                  className="bg-white rounded-2xl p-5 border border-[#e5e0d8] shadow-2xs hover:shadow-md hover:border-[#5A5A40]/40 transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <ListChecks className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#2d2a26]">Temple & Trip Checklist</h3>
                      <p className="text-xs text-[#8a817c] mt-1 line-clamp-2">
                        Curated packing checklist for modesty norms, socks, camera passes, and weather essentials.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 flex items-center text-xs font-bold text-emerald-700 group-hover:translate-x-1 transition-transform">
                    <span>View Checklist</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>

                {/* Tool 4: Weather Guide */}
                <div
                  onClick={() => navigateTo('weather')}
                  className="bg-white rounded-2xl p-5 border border-[#e5e0d8] shadow-2xs hover:shadow-md hover:border-[#5A5A40]/40 transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-700 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors">
                      <CloudSun className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#2d2a26]">Weather & Season Guide</h3>
                      <p className="text-xs text-[#8a817c] mt-1 line-clamp-2">
                        Optimal visiting months, sunrise timings, and monsoon considerations across cities.
                      </p>
                    </div>
                  </div>
                  <div className="pt-4 flex items-center text-xs font-bold text-sky-700 group-hover:translate-x-1 transition-transform">
                    <span>Check Climate</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>
              </div>
            </section>

          </div>
        )}

        {/* =========================================================================
            VIEW 2: FESTIVALS DIRECTORY VIEW
           ========================================================================= */}
        {currentView === 'festivals' && (
          <div className="space-y-8 animate-fadeIn pb-16">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#8a817c] uppercase tracking-widest">
                  <Calendar className="w-3.5 h-3.5 text-[#5A5A40]" />
                  <span>12 Months Calendar</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-serif font-bold text-[#2d2a26] mt-0.5">
                  Indian Cultural & Festival Explorer
                </h1>
                <p className="text-xs sm:text-sm text-[#8a817c] mt-1 font-normal">
                  Browse spiritual, classical, folk, and seasonal celebrations across all 12 months.
                </p>
              </div>

              <div className="text-xs font-medium text-[#8a817c] bg-white border border-[#e5e0d8] px-3.5 py-1.5 rounded-full shrink-0 shadow-xs self-start sm:self-auto">
                Showing <strong className="text-[#2d2a26]">{filteredFestivals.length}</strong> celebrations
              </div>
            </div>

            {/* Month Selector Carousel / Tabs */}
            <MonthSelector
              selectedMonthId={activeMonthId}
              onSelectMonth={(mId) => setActiveMonthId(mId)}
              currentLanguage={currentLanguage}
            />

            {/* Search & Tag Filter Toolbar */}
            <div className="bg-white rounded-2xl p-4 border border-[#e5e0d8] shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a817c]" />
                  <input
                    type="text"
                    value={festivalSearchQuery}
                    onChange={(e) => setFestivalSearchQuery(e.target.value)}
                    placeholder="Search festivals by name, state, deity, rituals (e.g. Diwali, Holi, Varanasi, Kathakali)..."
                    className="w-full pl-10 pr-9 py-2 bg-[#f5f2ed] border border-[#e5e0d8] rounded-xl text-xs sm:text-sm text-[#2d2a26] placeholder-[#8a817c] focus:outline-none focus:border-[#5A5A40] transition-colors"
                  />
                  {festivalSearchQuery && (
                    <button
                      onClick={() => setFestivalSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a817c] hover:text-[#2d2a26] cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Category Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  {[
                    { id: 'all', label: 'All Themes' },
                    { id: 'Harvest', label: '🌾 Harvest' },
                    { id: 'Spiritual', label: '🪔 Sacred & Ritual' },
                    { id: 'Classical', label: '🎭 Classical Arts' },
                    { id: 'Heritage', label: '👑 Royal / Heritage' },
                    { id: 'Tribal', label: '🥁 Folk & Tribal' }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setFestivalCategoryFilter(cat.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        festivalCategoryFilter === cat.id
                          ? 'bg-[#5A5A40] text-white shadow-xs'
                          : 'bg-[#f5f2ed] hover:bg-[#eae5dd] text-[#6b625b] border border-[#e5e0d8]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Festivals Grid */}
            {filteredFestivals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-2">
                {filteredFestivals.map((festival) => (
                  <FestivalCard
                    key={festival.id}
                    festival={festival}
                    onExplore={(fId) => navigateTo('festival-detail', { festivalId: fId })}
                    isSaved={isBookmarked('festival', festival.id)}
                    onToggleSave={toggleSaveFestival}
                    currentLanguage={currentLanguage}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#e5e0d8] space-y-4">
                <div className="w-12 h-12 rounded-full bg-[#f5f2ed] text-[#5A5A40] flex items-center justify-center mx-auto">
                  <Calendar className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-serif font-bold text-[#2d2a26]">No festivals match your filter</h3>
                  <p className="text-xs text-[#8a817c] max-w-md mx-auto">
                    Try resetting your search query or selecting a different month.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveMonthId(null);
                    setFestivalSearchQuery('');
                    setFestivalCategoryFilter('all');
                  }}
                  className="px-5 py-2 bg-[#5A5A40] hover:bg-[#484833] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            VIEW 3: FESTIVAL DETAIL VIEW
           ========================================================================= */}
        {currentView === 'festival-detail' && currentFestival && (
          <FestivalDetailView
            festival={currentFestival}
            userLocation={userLocation}
            currentLanguage={currentLanguage}
            onSelectState={(sId) => navigateTo('state-detail', { stateId: sId })}
            onSelectCity={(cId) => navigateTo('city-detail', { cityId: cId })}
            onSelectMonument={(mId) => navigateTo('monument-detail', { monumentId: mId })}
            onPlanTrip={(cId, fId) => {
              setItineraryFestivalId(fId);
              navigateTo('itinerary-generator', { cityId: cId, festivalId: fId });
            }}
            isSaved={isBookmarked('festival', currentFestival.id)}
            onToggleSave={toggleSaveFestival}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}

        {/* =========================================================================
            VIEW 4: MONUMENTS & MAP VIEW (Integrated Switcher)
           ========================================================================= */}
        {currentView === 'monuments' && (
          <div className="space-y-6 animate-fadeIn pb-16">
            
            {/* Header with Integrated Switcher */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#8a817c] uppercase tracking-widest">
                  <Landmark className="w-3.5 h-3.5 text-[#5A5A40]" />
                  <span>Living Heritage & Architecture</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-serif font-bold text-[#2d2a26] mt-0.5">
                  Monuments, Forts & UNESCO Sites
                </h1>
                <p className="text-xs sm:text-sm text-[#8a817c] mt-1 font-normal">
                  Explore architectural marvels, visiting hours, tickets, and interactive map locations.
                </p>
              </div>

              {/* View Switcher Toggle */}
              <div className="flex items-center gap-1 bg-[#f0eae1] p-1 rounded-xl border border-[#e5e0d8] shrink-0 self-start sm:self-auto">
                <button
                  onClick={() => setMonumentViewMode('grid')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    monumentViewMode === 'grid'
                      ? 'bg-white text-[#2d2a26] shadow-xs'
                      : 'text-[#8a817c] hover:text-[#2d2a26]'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Grid Cards</span>
                </button>
                <button
                  onClick={() => setMonumentViewMode('map')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    monumentViewMode === 'map'
                      ? 'bg-[#5A5A40] text-white shadow-xs'
                      : 'text-[#8a817c] hover:text-[#2d2a26]'
                  }`}
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>Map Explorer</span>
                </button>
              </div>
            </div>

            {/* If Map Mode is selected */}
            {monumentViewMode === 'map' ? (
              <div className="space-y-4 animate-fadeIn">
                <MonumentInteractiveMap
                  userLocation={userLocation}
                  onSelectMonument={(mId) => navigateTo('monument-detail', { monumentId: mId })}
                  onOpenItineraryGenerator={(cId) => navigateTo('itinerary-generator', { cityId: cId })}
                  heightClassName="h-[640px]"
                  currentLanguage={currentLanguage}
                />
              </div>
            ) : (
              /* If Grid Mode is selected */
              <div className="space-y-6 animate-fadeIn">
                
                {/* Search & Category Filter Toolbar */}
                <div className="bg-white rounded-2xl p-4 border border-[#e5e0d8] shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a817c]" />
                      <input
                        type="text"
                        value={monumentSearchQuery}
                        onChange={(e) => setMonumentSearchQuery(e.target.value)}
                        placeholder="Search monuments by name, city, architectural style (e.g. Taj Mahal, Red Fort, Hampi, Chola)..."
                        className="w-full pl-10 pr-9 py-2 bg-[#f5f2ed] border border-[#e5e0d8] rounded-xl text-xs sm:text-sm text-[#2d2a26] placeholder-[#8a817c] focus:outline-none focus:border-[#5A5A40] transition-colors"
                      />
                      {monumentSearchQuery && (
                        <button
                          onClick={() => setMonumentSearchQuery('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a817c] hover:text-[#2d2a26] cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                      {[
                        { id: 'all', label: 'All Heritage' },
                        { id: 'unesco', label: '🏛️ UNESCO Wonders' },
                        { id: 'fort', label: '🛡️ Forts & Citadels' },
                        { id: 'temple', label: '🪔 Temples & Shrines' },
                        { id: 'palace', label: '👑 Palaces' },
                        { id: 'caves', label: '⛰️ Caves & Tombs' }
                      ].map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => setMonumentCategoryFilter(cat.id)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                            monumentCategoryFilter === cat.id
                              ? 'bg-[#5A5A40] text-white shadow-xs'
                              : 'bg-[#f5f2ed] hover:bg-[#eae5dd] text-[#6b625b] border border-[#e5e0d8]'
                          }`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Monument Cards Grid */}
                {filteredMonuments.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMonuments.map((monument) => (
                      <div
                        key={monument.id}
                        onClick={() => navigateTo('monument-detail', { monumentId: monument.id })}
                        className="group bg-white rounded-2xl border border-[#e5e0d8] p-3 sm:p-4 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                      >
                        <div>
                          <div className="relative h-48 rounded-xl overflow-hidden bg-[#3a352f]">
                            <img
                              src={getSafeHeritageImage(monument.bannerImage, 'monument', monument.id)}
                              alt={monument.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              referrerPolicy="no-referrer"
                              loading="lazy"
                              onError={(e) => handleImageError(e, 'monument')}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            <div className="absolute top-2.5 left-2.5 bg-[#E6BE8A] text-[#2d2a26] text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md">
                              {monument.type}
                            </div>
                            <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                              <h3 className="text-lg font-serif font-bold text-white line-clamp-1">
                                {monument.name}
                              </h3>
                              <p className="text-[11px] text-[#E6BE8A] font-medium">
                                📍 {monument.cityName}, {monument.state}
                              </p>
                            </div>
                          </div>

                          <div className="pt-3 px-1 space-y-2">
                            <p className="text-xs text-[#8a817c] line-clamp-2 leading-relaxed">
                              {monument.historicalSignificance}
                            </p>
                            <div className="text-[11px] text-[#615951] flex items-center gap-1.5 pt-0.5">
                              <Clock className="w-3.5 h-3.5 text-[#5A5A40]" />
                              <span>{monument.estimatedVisitDuration} • Ticket: {monument.entryFee.indian}</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 px-1 border-t border-[#e5e0d8] flex items-center justify-between text-xs mt-3">
                          <span className="font-semibold text-[#5A5A40]">
                            View Details
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-[#5A5A40] group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-12 text-center border border-[#e5e0d8] space-y-3">
                    <Landmark className="w-8 h-8 text-[#5A5A40] mx-auto opacity-60" />
                    <h3 className="font-serif font-bold text-base text-[#2d2a26]">No monuments found</h3>
                    <p className="text-xs text-[#8a817c]">Try adjusting your search terms or category filter.</p>
                    <button
                      onClick={() => {
                        setMonumentSearchQuery('');
                        setMonumentCategoryFilter('all');
                      }}
                      className="px-4 py-1.5 bg-[#5A5A40] text-white text-xs font-semibold rounded-lg"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* =========================================================================
            VIEW 5: MONUMENT DETAIL VIEW
           ========================================================================= */}
        {currentView === 'monument-detail' && currentMonument && (
          <MonumentDetailView
            monument={currentMonument}
            userLocation={userLocation}
            currentLanguage={currentLanguage}
            onSelectCity={(cId) => navigateTo('city-detail', { cityId: cId })}
            onPlanTrip={(cId) => navigateTo('itinerary-generator', { cityId: cId })}
            isSaved={isBookmarked('monument', currentMonument.id)}
            onToggleSave={toggleSaveMonument}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}

        {/* =========================================================================
            VIEW 6: DESTINATIONS & CITIES VIEW
           ========================================================================= */}
        {currentView === 'destinations' && (
          <div className="space-y-8 animate-fadeIn pb-16">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#8a817c] uppercase tracking-widest">
                <MapPin className="w-3.5 h-3.5 text-[#5A5A40]" />
                <span>Destination Directory</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-serif font-bold text-[#2d2a26] mt-0.5">
                Indian Cultural & Heritage Destinations
              </h1>
              <p className="text-xs sm:text-sm text-[#8a817c] mt-1 font-normal">
                Discover monuments, festivals, bazaars, and authentic cuisine across cities.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {CITIES_DATA.map((city) => (
                <div
                  key={city.id}
                  onClick={() => navigateTo('city-detail', { cityId: city.id })}
                  className="group bg-white rounded-2xl border border-[#e5e0d8] p-3 sm:p-4 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="relative h-48 rounded-xl overflow-hidden bg-[#3a352f]">
                      <img
                        src={getSafeHeritageImage(city.bannerImage, 'city', city.id)}
                        alt={city.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        onError={(e) => handleImageError(e, 'city')}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      <div className="absolute top-2.5 left-2.5 bg-orange-500/90 text-white text-[9px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-md">
                        {city.state}
                      </div>
                      <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                        <h3 className="text-xl font-serif font-bold text-white">
                          {city.name}
                        </h3>
                      </div>
                    </div>

                    <div className="pt-3 px-1 space-y-2.5">
                      <p className="text-xs text-[#8a817c] line-clamp-2 leading-relaxed">
                        {city.tagline}
                      </p>

                      <div className="space-y-0.5 text-xs text-[#615951]">
                        <div>
                          <strong className="text-[#5A5A40]">Key Sites: </strong>
                          <span>{city.monumentIds.length} Monuments • {city.religiousSites.length} Temples</span>
                        </div>
                        <div>
                          <strong className="text-[#5A5A40]">Must Eat: </strong>
                          <span>{city.authenticFood.slice(0, 2).map((f) => f.name).join(', ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 px-1 border-t border-[#e5e0d8] flex items-center justify-between text-xs mt-3">
                    <span className="font-semibold text-[#5A5A40]">
                      Explore Heritage Guide
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#5A5A40] group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            VIEW 7: CITY COMPLETE HERITAGE DETAIL VIEW
           ========================================================================= */}
        {currentView === 'city-detail' && currentCity && (
          <CityDetailView
            city={currentCity}
            userLocation={userLocation}
            currentLanguage={currentLanguage}
            onSelectMonument={(mId) => navigateTo('monument-detail', { monumentId: mId })}
            onSelectFestival={(fId) => navigateTo('festival-detail', { festivalId: fId })}
            onOpenItineraryGenerator={(cId, fId) => {
              setItineraryFestivalId(fId);
              navigateTo('itinerary-generator', { cityId: cId, festivalId: fId });
            }}
            onToggleSaveCity={toggleSaveCity}
            isSaved={isBookmarked('city', currentCity.id)}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onToggleSaveFestival={toggleSaveFestival}
            isSavedFestival={(fId) => isBookmarked('festival', fId)}
          />
        )}

        {/* =========================================================================
            VIEW 8: STATES DIRECTORY & STATE DETAIL VIEW
           ========================================================================= */}
        {currentView === 'states' && (
          <StateSelectionView
            onSelectState={(sId) => {
              navigateTo('state-detail', { stateId: sId });
            }}
            onSelectCity={(cId) => navigateTo('city-detail', { cityId: cId })}
            currentLanguage={currentLanguage}
          />
        )}

        {currentView === 'state-detail' && currentState && (
          <StateDetailView
            state={currentState}
            currentLanguage={currentLanguage}
            onSelectCity={(cId) => navigateTo('city-detail', { cityId: cId })}
            onSelectFestival={(fId) => navigateTo('festival-detail', { festivalId: fId })}
            onSelectMonument={(mId) => navigateTo('monument-detail', { monumentId: mId })}
            onBackToStates={() => navigateTo('states')}
          />
        )}

        {/* =========================================================================
            VIEW 9: INTERACTIVE PERSONALIZED ITINERARY GENERATOR
           ========================================================================= */}
        {currentView === 'itinerary-generator' && currentCity && (
          <ItineraryGeneratorView
            key={`${currentCity.id}-${itineraryFestivalId || 'all'}`}
            city={currentCity}
            userLocation={userLocation}
            festivalId={itineraryFestivalId}
            onSelectCity={(cId) => {
              setSelectedCityId(cId);
              navigateTo('itinerary-generator', { cityId: cId, festivalId: itineraryFestivalId });
            }}
            onSelectFestival={(fId) => {
              setItineraryFestivalId(fId);
              navigateTo('itinerary-generator', { cityId: currentCity.id, festivalId: fId });
            }}
            onSaveItinerary={(saved) => saveItinerary(saved)}
            onBack={handleBack}
            currentLanguage={currentLanguage}
          />
        )}

        {/* =========================================================================
            VIEW 10: MY TRIP & SAVED
           ========================================================================= */}
        {currentView === 'my-trip' && (
          <MyTripView
            userLocation={userLocation}
            onSelectFestival={(fId) => navigateTo('festival-detail', { festivalId: fId })}
            onSelectMonument={(mId) => navigateTo('monument-detail', { monumentId: mId })}
            onSelectCity={(cId) => navigateTo('city-detail', { cityId: cId })}
            onToggleSaveFestival={toggleSaveFestival}
            onToggleSaveMonument={toggleSaveMonument}
            onOpenItineraryGenerator={(cId, fId) => {
              setItineraryFestivalId(fId);
              navigateTo('itinerary-generator', { cityId: cId, festivalId: fId });
            }}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onNavigateTo={(v, p) => navigateTo(v, p)}
            currentLanguage={currentLanguage}
          />
        )}

        {/* =========================================================================
            VIEW 11: INTERACTIVE MONUMENTS MAP
           ========================================================================= */}
        {currentView === 'monuments-map' && (
          <div className="space-y-6 animate-fadeIn pb-16">
            <MonumentInteractiveMap
              userLocation={userLocation}
              onSelectMonument={(mId) => navigateTo('monument-detail', { monumentId: mId })}
              onOpenItineraryGenerator={(cId) => navigateTo('itinerary-generator', { cityId: cId })}
              heightClassName="h-[640px]"
              currentLanguage={currentLanguage}
            />
          </div>
        )}

        {/* =========================================================================
            VIEW 12: DESTINATION WEATHER & CLIMATE DISCOVERY
           ========================================================================= */}
        {currentView === 'weather' && (
          <DestinationWeatherView
            onSelectCity={(cId) => navigateTo('city-detail', { cityId: cId })}
            onExploreMap={() => navigateTo('monuments-map')}
            currentLanguage={currentLanguage}
          />
        )}

        {/* =========================================================================
            VIEW 13: HERITAGE CULTURE & MONUMENT QUIZ
           ========================================================================= */}
        {currentView === 'culture-quiz' && (
          <CultureQuizView
            currentLanguage={currentLanguage}
            onSelectMonument={(mId) => navigateTo('monument-detail', { monumentId: mId })}
            onSelectCity={(cId) => navigateTo('city-detail', { cityId: cId })}
            onExploreMap={() => navigateTo('monuments-map')}
          />
        )}

        {/* =========================================================================
            VIEW 14: TRIP & MONUMENT CHECKLIST
           ========================================================================= */}
        {currentView === 'checklist' && (
          <div className="space-y-6 animate-fadeIn pb-16">
            <TripChecklistView
              cityName={userLocation.city}
              onSelectCity={(cId) => navigateTo('city-detail', { cityId: cId })}
              currentLanguage={currentLanguage}
            />
          </div>
        )}

        {/* =========================================================================
            VIEW 15: PROFILE VIEW
           ========================================================================= */}
        {currentView === 'profile' && (
          <ProfileView
            userLocation={userLocation}
            onOpenLocationModal={() => setIsLocationModalOpen(true)}
            onNavigateHome={() => navigateTo('home')}
            currentLanguage={currentLanguage}
            onOpenLanguageModal={() => setIsLanguageModalOpen(true)}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}

        {/* =========================================================================
            VIEW 16: CULTURAL EVENT ALERTS & ADVISORIES
           ========================================================================= */}
        {currentView === 'cultural-alerts' && (
          <div className="space-y-6 animate-fadeIn pb-16">
            <CulturalAlertsSection
              onNavigateTo={(view, params) => navigateTo(view, params)}
              isFullView={true}
            />
          </div>
        )}

        {/* =========================================================================
            VIEW 17: TRIP MEMORIES & TRAVEL JOURNAL
           ========================================================================= */}
        {(currentView === 'trip-memories' || currentView === 'memories') && (
          <div className="space-y-6 animate-fadeIn pb-16">
            <TripMemoriesView
              onNavigateTo={(view, params) => navigateTo(view, params)}
            />
          </div>
        )}

          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-[#2d2a26] text-white border-t border-[#e5e0d8] pt-12 pb-20 md:pb-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#5A5A40] flex items-center justify-center text-white shadow-sm">
                  <Sparkles className="w-4 h-4 text-[#E6BE8A]" />
                </div>
                <span className="font-serif font-bold text-xl text-white">
                  Virasat<span className="text-[#8A3324] italic">.</span>
                </span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed max-w-md font-normal">
                {t('footer.description', 'An Indian cultural, festival, and heritage discovery platform. Exploring festivals, monuments, living rituals, classical arts, authentic cuisine, and custom travel journeys across India.')}
              </p>
              <div className="flex items-center gap-2 text-xs text-[#E6BE8A]">
                <MapPin className="w-3.5 h-3.5 text-orange-400" />
                <span>{t('footer.departureOrigin', 'Departure Origin')}: <strong className="text-white">{userLocation.city}, {userLocation.state}</strong></span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#E6BE8A]">
                Discovery
              </h4>
              <div className="flex flex-col space-y-2 text-xs text-neutral-300">
                <button onClick={() => navigateTo('home')} className="hover:text-white text-left cursor-pointer transition-colors">Explore Home</button>
                <button onClick={() => navigateTo('festivals')} className="hover:text-white text-left cursor-pointer transition-colors">12 Months Festivals</button>
                <button onClick={() => navigateTo('monuments')} className="hover:text-white text-left cursor-pointer transition-colors">Monuments & UNESCO</button>
                <button onClick={() => navigateTo('monuments-map')} className="hover:text-white text-left cursor-pointer transition-colors">Interactive Heritage Map</button>
                <button onClick={() => navigateTo('my-trip')} className="hover:text-white text-left cursor-pointer transition-colors">Trip Itineraries</button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-widest text-[#E6BE8A]">
                Cultural Toolkit
              </h4>
              <div className="flex flex-col space-y-2 text-xs text-neutral-300">
                <button onClick={() => navigateTo('culture-quiz')} className="hover:text-white text-left cursor-pointer transition-colors">Culture & Heritage Quiz</button>
                <button onClick={() => navigateTo('checklist')} className="hover:text-white text-left cursor-pointer transition-colors">Temple & Packing Checklist</button>
                <button onClick={() => navigateTo('weather')} className="hover:text-white text-left cursor-pointer transition-colors">Weather & Season Guide</button>
                <button onClick={() => navigateTo('cultural-alerts')} className="hover:text-white text-left cursor-pointer transition-colors">Cultural Advisories</button>
                <button onClick={() => setIsLanguageModalOpen(true)} className="hover:text-white text-left cursor-pointer transition-colors">Regional Languages</button>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] uppercase tracking-wider text-neutral-400">
            <span>© {new Date().getFullYear()} Virasat Heritage & Culture. Incredible India.</span>
            <span>Handcrafted for authentic Indian cultural travel experiences.</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={userLocation}
        onSelectLocation={(loc) => setUserLocation(loc)}
      />

      <LanguageSelectorModal
        isOpen={isLanguageModalOpen}
        onClose={() => setIsLanguageModalOpen(false)}
        currentLanguage={currentLanguage}
        onSelectLanguage={setLanguage}
      />

      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onSelectFestival={(fId) => navigateTo('festival-detail', { festivalId: fId })}
        onSelectMonument={(mId) => navigateTo('monument-detail', { monumentId: mId })}
        onSelectCity={(cId) => navigateTo('city-detail', { cityId: cId })}
        onSelectState={(sId) => navigateTo('state-detail', { stateId: sId })}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppMain />
      </AuthProvider>
    </LanguageProvider>
  );
}
