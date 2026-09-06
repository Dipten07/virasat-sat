import React, { useState, useEffect, useRef } from 'react';
import { FESTIVALS_DATA } from '../data/festivalsData';
import { MONUMENTS_DATA } from '../data/monumentsData';
import { CITIES_DATA } from '../data/citiesData';
import { STATES_DATA } from '../data/statesData';
import { RecentHistoryItem, AppView } from '../types';
import {
  getRecentHistory,
  removeRecentHistoryItem,
  clearRecentHistory,
  formatTimeAgo,
  shareCulturalItem,
  addRecentHistoryItem
} from '../utils/recentHistory';
import {
  Search,
  X,
  Sparkles,
  MapPin,
  Landmark,
  Calendar,
  Map,
  ArrowRight,
  History,
  Trash2,
  Share2,
  Check,
  Clock,
  Compass,
  CornerDownLeft
} from 'lucide-react';
import { getSafeHeritageImage, handleImageError } from '../utils/imageUtils';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFestival: (festivalId: string) => void;
  onSelectMonument: (monumentId: string) => void;
  onSelectCity: (cityId: string) => void;
  onSelectState: (stateId: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectFestival,
  onSelectMonument,
  onSelectCity,
  onSelectState
}) => {
  const [query, setQuery] = useState('');
  const [recentHistory, setRecentHistory] = useState<RecentHistoryItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [sharedItemId, setSharedItemId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const toastTimeoutRef = useRef<any>(null);

  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  useEffect(() => {
    if (isOpen) {
      setRecentHistory(getRecentHistory());
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setToastMessage(null);
    }
  }, [isOpen]);

  const handleClearHistory = () => {
    clearRecentHistory();
    setRecentHistory([]);
    showToast('Recent navigation history cleared');
  };

  const handleRemoveHistoryItem = (e: React.MouseEvent, id: string, type: string) => {
    e.stopPropagation();
    const updated = removeRecentHistoryItem(id, type);
    setRecentHistory(updated);
    showToast('Removed item from recent history');
  };

  const handleShareItem = async (
    e: React.MouseEvent,
    item: { id: string; title: string; type: string; subtitle?: string }
  ) => {
    e.stopPropagation();
    setSharedItemId(item.id);
    const res = await shareCulturalItem({
      title: item.title,
      type: item.type,
      subtitle: item.subtitle
    });
    showToast(res.message);
    setTimeout(() => {
      setSharedItemId(null);
    }, 2000);
  };

  const handleSelectRecent = (item: RecentHistoryItem) => {
    if (item.type === 'monument') onSelectMonument(item.id);
    else if (item.type === 'city') onSelectCity(item.id);
    else if (item.type === 'festival') onSelectFestival(item.id);
    else if (item.type === 'state') onSelectState(item.id);
    onClose();
  };

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const matchingFestivals = q
    ? FESTIVALS_DATA.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.hindiName.toLowerCase().includes(q) ||
          f.shortDescription.toLowerCase().includes(q) ||
          f.tags.some((t) => t.toLowerCase().includes(q))
      )
    : [];

  const matchingMonuments = q
    ? MONUMENTS_DATA.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.hindiName && m.hindiName.toLowerCase().includes(q)) ||
          m.cityName.toLowerCase().includes(q) ||
          m.state.toLowerCase().includes(q) ||
          m.type.toLowerCase().includes(q) ||
          m.tags.some((t) => t.toLowerCase().includes(q))
      )
    : [];

  const matchingCities = q
    ? CITIES_DATA.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.state.toLowerCase().includes(q) ||
          c.tagline.toLowerCase().includes(q) ||
          c.authenticFood.some((f) => f.name.toLowerCase().includes(q)) ||
          c.religiousSites.some((r) => r.name.toLowerCase().includes(q))
      )
    : [];

  const matchingStates = q
    ? STATES_DATA.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.culturalSummary.toLowerCase().includes(q) ||
          s.famousFor.some((f) => f.toLowerCase().includes(q))
      )
    : [];

  const totalResults =
    matchingFestivals.length + matchingMonuments.length + matchingCities.length + matchingStates.length;

  const getTypeBadgeStyle = (type: string) => {
    switch (type) {
      case 'monument':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'city':
        return 'bg-emerald-100 text-emerald-900 border-emerald-200';
      case 'festival':
        return 'bg-rose-100 text-rose-900 border-rose-200';
      case 'state':
        return 'bg-sky-100 text-sky-900 border-sky-200';
      default:
        return 'bg-[#f5f2ed] text-[#5A5A40] border-[#e5e0d8]';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 sm:pt-16 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-[#fdfaf6] rounded-3xl shadow-2xl border border-[#e5e0d8] overflow-hidden animate-scaleUp flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Bar Header */}
        <div className="relative border-b border-[#e5e0d8] bg-white p-4 flex items-center gap-3 shrink-0">
          <Search className="w-5 h-5 text-[#5A5A40] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search festivals, monuments, cities, states, temples (e.g. Taj Mahal, Varanasi, Diwali)..."
            className="w-full text-sm sm:text-base bg-transparent focus:outline-none placeholder:text-[#8a817c] text-[#2d2a26] font-sans"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[#8a817c] hover:text-[#2d2a26] hover:bg-[#f5f2ed] rounded-full cursor-pointer transition-colors shrink-0"
              title="Clear search query"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Quick Share Virasat Discovery Button */}
          <button
            onClick={(e) =>
              handleShareItem(e, {
                id: 'virasat-portal',
                title: query ? `Search for "${query}" on Virasat` : 'Virasat - Indian Cultural & Heritage Discovery Portal',
                type: 'Heritage Discovery',
                subtitle: 'Explore 40+ UNESCO monuments, 12 months of sacred festivals, and authentic culinary journeys.'
              })
            }
            className="p-2 rounded-xl text-[#5A5A40] hover:text-[#2d2a26] hover:bg-[#f5f2ed] border border-[#e5e0d8] transition-all cursor-pointer shrink-0 flex items-center gap-1.5 text-xs font-semibold"
            title="Share Portal or Current Search"
          >
            {sharedItemId === 'virasat-portal' ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Share</span>
          </button>

          <span className="hidden sm:inline-block text-[10px] uppercase font-bold tracking-wider text-[#8a817c] bg-[#f5f2ed] px-2.5 py-1 rounded-full border border-[#e5e0d8] shrink-0">
            ESC
          </span>
        </div>

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="bg-[#2d2a26] text-white px-4 py-2 text-xs font-medium flex items-center justify-between gap-3 animate-fadeIn shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Results / Suggestions Container */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1">
          {!q ? (
            /* Default View: Recent History & Trending Discoveries */
            <div className="space-y-6">
              
              {/* SECTION 1: Local State Tracker (Recent Navigation History) */}
              {recentHistory.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-[#5A5A40]/10 text-[#5A5A40]">
                        <History className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-[#2d2a26] uppercase tracking-wider">
                          Recently Viewed & Navigation History
                        </h3>
                        <p className="text-[11px] text-[#8a817c]">
                          Quick access to your previously visited cities, monuments & celebrations
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleClearHistory}
                      className="text-[11px] font-semibold text-[#8a817c] hover:text-[#8C271E] flex items-center gap-1 cursor-pointer transition-colors px-2 py-1 rounded-lg hover:bg-rose-50"
                      title="Clear all recent history"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear All</span>
                    </button>
                  </div>

                  {/* Recent History Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {recentHistory.map((item) => (
                      <div
                        key={`${item.type}-${item.id}`}
                        onClick={() => handleSelectRecent(item)}
                        className="group relative flex items-center justify-between p-2.5 bg-white hover:bg-[#f5f2ed] rounded-2xl border border-[#e5e0d8] hover:border-[#5A5A40]/40 transition-all cursor-pointer shadow-xs hover:shadow-sm"
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <img
                            src={getSafeHeritageImage(item.image, item.type, item.id)}
                            alt={item.title}
                            className="w-11 h-11 rounded-xl object-cover border border-[#e5e0d8] shrink-0"
                            referrerPolicy="no-referrer"
                            onError={(e) => handleImageError(e, item.type)}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span
                                className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-md border ${getTypeBadgeStyle(
                                  item.type
                                )}`}
                              >
                                {item.type}
                              </span>
                              <span className="text-[10px] text-[#8a817c] flex items-center gap-0.5">
                                <Clock className="w-2.5 h-2.5" />
                                {formatTimeAgo(item.timestamp)}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-[#2d2a26] truncate group-hover:text-[#5A5A40] transition-colors">
                              {item.title}
                            </h4>
                            <p className="text-[10px] text-[#8a817c] truncate">
                              {item.subtitle}
                            </p>
                          </div>
                        </div>

                        {/* Card Hover Action Buttons: Share & Delete */}
                        <div className="flex items-center gap-1 pl-1 shrink-0">
                          <button
                            onClick={(e) => handleShareItem(e, item)}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              sharedItemId === item.id
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                : 'text-[#8a817c] hover:text-[#5A5A40] hover:bg-white border-transparent hover:border-[#e5e0d8]'
                            }`}
                            title={`Share ${item.title}`}
                          >
                            {sharedItemId === item.id ? (
                              <Check className="w-3.5 h-3.5" />
                            ) : (
                              <Share2 className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={(e) => handleRemoveHistoryItem(e, item.id, item.type)}
                            className="p-1.5 rounded-lg text-[#8a817c] hover:text-[#8C271E] hover:bg-white border border-transparent hover:border-[#e5e0d8] transition-colors cursor-pointer"
                            title="Remove from history"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION 2: Popular Trending Discoveries */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#8a817c] uppercase tracking-widest">
                  <Sparkles className="w-3.5 h-3.5 text-[#5A5A40]" />
                  <span>Popular Trending Discoveries</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: 'Taj Mahal, Agra', type: 'monument', id: 'taj-mahal', subtitle: 'Agra, Uttar Pradesh • Mughal Mausoleum' },
                    { label: 'Dev Deepawali, Varanasi', type: 'festival', id: 'dev-deepawali', subtitle: 'Kartik Poornima • Varanasi' },
                    { label: 'Durga Puja, Kolkata', type: 'festival', id: 'durga-puja', subtitle: 'UNESCO Living Heritage • Kolkata' },
                    { label: 'Amber Fort, Jaipur', type: 'monument', id: 'amber-fort', subtitle: 'Jaipur, Rajasthan • Hilltop Citadel' },
                    { label: 'Hampi Ruins, Karnataka', type: 'monument', id: 'hampi-ruins', subtitle: 'Vijayanagara Empire • Tungabhadra River' },
                    { label: 'Golden Temple, Amritsar', type: 'monument', id: 'golden-temple', subtitle: 'Amritsar, Punjab • Harmandir Sahib' },
                    { label: 'Puri Jagannath Rath Yatra', type: 'festival', id: 'rath-yatra', subtitle: 'Puri, Odisha • Grand Chariot Festival' },
                    { label: 'Rajasthan Royal Heritage', type: 'state', id: 'rajasthan', subtitle: 'North India • Palaces, Forts & Desert' }
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center rounded-full bg-white border border-[#e5e0d8] shadow-xs overflow-hidden group"
                    >
                      <button
                        onClick={() => {
                          if (item.type === 'festival') onSelectFestival(item.id);
                          if (item.type === 'monument') onSelectMonument(item.id);
                          if (item.type === 'state') onSelectState(item.id);
                          onClose();
                        }}
                        className="text-xs font-medium px-3.5 py-1.5 hover:bg-[#5A5A40] hover:text-white text-[#2d2a26] transition-colors cursor-pointer"
                      >
                        {item.label}
                      </button>
                      <button
                        onClick={(e) =>
                          handleShareItem(e, {
                            id: item.id,
                            title: item.label,
                            type: item.type,
                            subtitle: item.subtitle
                          })
                        }
                        className="px-2 py-1.5 text-[#8a817c] hover:text-[#2d2a26] hover:bg-[#f5f2ed] border-l border-[#e5e0d8] transition-colors cursor-pointer"
                        title={`Share ${item.label}`}
                      >
                        {sharedItemId === item.id ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Share2 className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Categorized Visual Shortcuts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="p-4 bg-white rounded-2xl border border-[#e5e0d8] shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-xs font-serif font-bold text-[#2d2a26]">
                        <Calendar className="w-4 h-4 text-[#5A5A40]" />
                        <span>Explore by Festivals</span>
                      </div>
                      <span className="text-[10px] font-bold text-[#5A5A40] bg-[#f5f2ed] px-2 py-0.5 rounded-full">
                        12 Months
                      </span>
                    </div>
                    <p className="text-xs text-[#8a817c] mb-3 font-normal leading-relaxed">
                      Discover India through sacred tithis, boat races, classical dance and harvest celebrations.
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#f5f2ed]">
                    <button
                      onClick={() => {
                        onSelectFestival('dev-deepawali');
                        onClose();
                      }}
                      className="text-xs font-bold uppercase tracking-wider text-[#5A5A40] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Browse Dev Deepawali</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) =>
                        handleShareItem(e, {
                          id: 'festivals-calendar',
                          title: '12 Months Indian Cultural Festival Calendar',
                          type: 'Festivals',
                          subtitle: 'Sacred ceremonies, harvest festivals and classical arts across India'
                        })
                      }
                      className="p-1.5 text-[#8a817c] hover:text-[#5A5A40] rounded-lg transition-colors cursor-pointer"
                      title="Share Festival Calendar"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-2xl border border-[#e5e0d8] shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-xs font-serif font-bold text-[#2d2a26]">
                        <Landmark className="w-4 h-4 text-[#5A5A40]" />
                        <span>UNESCO Monuments</span>
                      </div>
                      <span className="text-[10px] font-bold text-[#5A5A40] bg-[#f5f2ed] px-2 py-0.5 rounded-full">
                        40+ Sites
                      </span>
                    </div>
                    <p className="text-xs text-[#8a817c] mb-3 font-normal leading-relaxed">
                      Architectural histories, acoustics, visiting hours, fees & local food guides.
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-[#f5f2ed]">
                    <button
                      onClick={() => {
                        onSelectMonument('taj-mahal');
                        onClose();
                      }}
                      className="text-xs font-bold uppercase tracking-wider text-[#5A5A40] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Taj Mahal</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) =>
                        handleShareItem(e, {
                          id: 'monuments-guide',
                          title: 'UNESCO Monuments & Architectural Heritage Guide',
                          type: 'Monuments',
                          subtitle: 'Comprehensive architectural history, visiting guides and tickets'
                        })
                      }
                      className="p-1.5 text-[#8a817c] hover:text-[#5A5A40] rounded-lg transition-colors cursor-pointer"
                      title="Share Monuments Guide"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : totalResults === 0 ? (
            /* No Results State */
            <div className="text-center py-12 space-y-3">
              <Search className="w-10 h-10 text-[#8a817c]/50 mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-serif font-bold text-[#2d2a26]">No matches found for "{query}"</p>
                <p className="text-xs text-[#8a817c] max-w-sm mx-auto font-normal">
                  Try searching by festival name, UNESCO site, destination city (Jaipur, Varanasi, Kochi) or deity.
                </p>
              </div>
              {recentHistory.length > 0 && (
                <div className="pt-2">
                  <p className="text-xs text-[#8a817c] mb-2 font-semibold">Or pick from your recently viewed items:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {recentHistory.slice(0, 4).map((h) => (
                      <button
                        key={h.id}
                        onClick={() => handleSelectRecent(h)}
                        className="text-xs bg-white px-3 py-1 rounded-full border border-[#e5e0d8] hover:bg-[#5A5A40] hover:text-white transition-colors cursor-pointer"
                      >
                        {h.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Live Filtered Results with Share Option on Every Card */
            <div className="space-y-5">
              <div className="text-xs font-semibold text-[#8a817c] flex items-center justify-between">
                <span>
                  Found <strong className="text-[#2d2a26]">{totalResults}</strong> cultural matches
                </span>
                <span className="text-[11px] text-[#5A5A40]">Click card to view • Click 🔗 to share</span>
              </div>

              {/* Monuments Results */}
              {matchingMonuments.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#8a817c] uppercase tracking-widest">
                    <Landmark className="w-3.5 h-3.5 text-[#5A5A40]" />
                    <span>Monuments & Heritage ({matchingMonuments.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {matchingMonuments.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => {
                          onSelectMonument(m.id);
                          onClose();
                        }}
                        className="flex items-center justify-between p-3 bg-white hover:bg-[#f5f2ed] rounded-2xl border border-[#e5e0d8] hover:border-[#5A5A40]/40 transition-all cursor-pointer group shadow-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <img
                            src={getSafeHeritageImage(m.bannerImage, 'monument', m.id)}
                            alt={m.name}
                            className="w-12 h-12 rounded-xl object-cover border border-[#e5e0d8] shrink-0"
                            referrerPolicy="no-referrer"
                            onError={(e) => handleImageError(e, 'monument')}
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-serif font-bold text-[#2d2a26] group-hover:text-[#5A5A40] transition-colors truncate">
                              {m.name}
                            </h4>
                            <p className="text-xs text-[#8a817c] flex items-center gap-2 mt-0.5 font-normal truncate">
                              <span className="text-[#5A5A40] font-medium truncate">
                                📍 {m.cityName}, {m.state}
                              </span>
                              <span>•</span>
                              <span className="bg-[#f5f2ed] text-[#5A5A40] px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shrink-0">
                                {m.type}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Controls: Share & Arrow */}
                        <div className="flex items-center gap-1 pl-2 shrink-0">
                          <button
                            onClick={(e) =>
                              handleShareItem(e, {
                                id: m.id,
                                title: m.name,
                                type: 'monument',
                                subtitle: `${m.cityName}, ${m.state} • ${m.type}`
                              })
                            }
                            className="p-2 rounded-xl text-[#8a817c] hover:text-[#5A5A40] hover:bg-white border border-transparent hover:border-[#e5e0d8] transition-colors cursor-pointer"
                            title={`Share ${m.name}`}
                          >
                            {sharedItemId === m.id ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Share2 className="w-4 h-4" />
                            )}
                          </button>
                          <ArrowRight className="w-4 h-4 text-[#8a817c] group-hover:text-[#5A5A40] group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Destinations & Cities */}
              {matchingCities.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#8a817c] uppercase tracking-widest">
                    <MapPin className="w-3.5 h-3.5 text-[#5A5A40]" />
                    <span>Cities & Destinations ({matchingCities.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {matchingCities.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          onSelectCity(c.id);
                          onClose();
                        }}
                        className="flex items-center justify-between p-3 bg-white hover:bg-[#f5f2ed] rounded-2xl border border-[#e5e0d8] hover:border-[#5A5A40]/40 transition-all cursor-pointer group shadow-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <img
                            src={getSafeHeritageImage(c.bannerImage, 'city', c.id)}
                            alt={c.name}
                            className="w-12 h-12 rounded-xl object-cover border border-[#e5e0d8] shrink-0"
                            referrerPolicy="no-referrer"
                            onError={(e) => handleImageError(e, 'city')}
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-serif font-bold text-[#2d2a26] group-hover:text-[#5A5A40] transition-colors truncate">
                              {c.name}, {c.state}
                            </h4>
                            <p className="text-xs text-[#8a817c] truncate mt-0.5 font-normal">
                              {c.tagline}
                            </p>
                          </div>
                        </div>

                        {/* Controls: Share & Arrow */}
                        <div className="flex items-center gap-1 pl-2 shrink-0">
                          <button
                            onClick={(e) =>
                              handleShareItem(e, {
                                id: c.id,
                                title: c.name,
                                type: 'city',
                                subtitle: `${c.state} • ${c.tagline}`
                              })
                            }
                            className="p-2 rounded-xl text-[#8a817c] hover:text-[#5A5A40] hover:bg-white border border-transparent hover:border-[#e5e0d8] transition-colors cursor-pointer"
                            title={`Share ${c.name}`}
                          >
                            {sharedItemId === c.id ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Share2 className="w-4 h-4" />
                            )}
                          </button>
                          <ArrowRight className="w-4 h-4 text-[#8a817c] group-hover:text-[#5A5A40] group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Festivals Results */}
              {matchingFestivals.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#8a817c] uppercase tracking-widest">
                    <Calendar className="w-3.5 h-3.5 text-[#5A5A40]" />
                    <span>Festivals ({matchingFestivals.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {matchingFestivals.map((f) => (
                      <div
                        key={f.id}
                        onClick={() => {
                          onSelectFestival(f.id);
                          onClose();
                        }}
                        className="flex items-center justify-between p-3 bg-white hover:bg-[#f5f2ed] rounded-2xl border border-[#e5e0d8] hover:border-[#5A5A40]/40 transition-all cursor-pointer group shadow-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <img
                            src={getSafeHeritageImage(f.bannerImage, 'festival', f.id)}
                            alt={f.name}
                            className="w-12 h-12 rounded-xl object-cover border border-[#e5e0d8] shrink-0"
                            referrerPolicy="no-referrer"
                            onError={(e) => handleImageError(e, 'festival')}
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-serif font-bold text-[#2d2a26] group-hover:text-[#5A5A40] transition-colors truncate">
                              {f.name}
                            </h4>
                            <p className="text-xs text-[#8a817c] flex items-center gap-2 mt-0.5 font-normal truncate">
                              <span>📅 {f.dateRange}</span>
                              <span>•</span>
                              <span className="capitalize">
                                {(f.celebratedStates || []).slice(0, 2).join(', ')}
                              </span>
                            </p>
                          </div>
                        </div>

                        {/* Controls: Share & Arrow */}
                        <div className="flex items-center gap-1 pl-2 shrink-0">
                          <button
                            onClick={(e) =>
                              handleShareItem(e, {
                                id: f.id,
                                title: f.name,
                                type: 'festival',
                                subtitle: `${f.dateRange} • ${(f.celebratedStates || []).join(', ')}`
                              })
                            }
                            className="p-2 rounded-xl text-[#8a817c] hover:text-[#5A5A40] hover:bg-white border border-transparent hover:border-[#e5e0d8] transition-colors cursor-pointer"
                            title={`Share ${f.name}`}
                          >
                            {sharedItemId === f.id ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Share2 className="w-4 h-4" />
                            )}
                          </button>
                          <ArrowRight className="w-4 h-4 text-[#8a817c] group-hover:text-[#5A5A40] group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* States */}
              {matchingStates.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#8a817c] uppercase tracking-widest">
                    <Map className="w-3.5 h-3.5 text-[#5A5A40]" />
                    <span>States ({matchingStates.length})</span>
                  </div>
                  <div className="space-y-1.5">
                    {matchingStates.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => {
                          onSelectState(s.id);
                          onClose();
                        }}
                        className="flex items-center justify-between p-3 bg-white hover:bg-[#f5f2ed] rounded-2xl border border-[#e5e0d8] hover:border-[#5A5A40]/40 transition-all cursor-pointer group shadow-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <img
                            src={getSafeHeritageImage(s.bannerImage, 'landscape', s.id)}
                            alt={s.name}
                            className="w-12 h-12 rounded-xl object-cover border border-[#e5e0d8] shrink-0"
                            referrerPolicy="no-referrer"
                            onError={(e) => handleImageError(e, 'landscape')}
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-sm font-serif font-bold text-[#2d2a26] group-hover:text-[#5A5A40] transition-colors truncate">
                              {s.name} ({s.region} India)
                            </h4>
                            <p className="text-xs text-[#8a817c] truncate mt-0.5 font-normal">
                              Famous for: {(s.famousFor || []).slice(0, 3).join(', ')}
                            </p>
                          </div>
                        </div>

                        {/* Controls: Share & Arrow */}
                        <div className="flex items-center gap-1 pl-2 shrink-0">
                          <button
                            onClick={(e) =>
                              handleShareItem(e, {
                                id: s.id,
                                title: `${s.name} State Heritage`,
                                type: 'state',
                                subtitle: `${s.region} India • ${(s.famousFor || []).join(', ')}`
                              })
                            }
                            className="p-2 rounded-xl text-[#8a817c] hover:text-[#5A5A40] hover:bg-white border border-transparent hover:border-[#e5e0d8] transition-colors cursor-pointer"
                            title={`Share ${s.name}`}
                          >
                            {sharedItemId === s.id ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Share2 className="w-4 h-4" />
                            )}
                          </button>
                          <ArrowRight className="w-4 h-4 text-[#8a817c] group-hover:text-[#5A5A40] group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#f5f2ed] px-5 py-3 border-t border-[#e5e0d8] flex flex-wrap items-center justify-between gap-2 text-xs text-[#8a817c] shrink-0">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="bg-white px-1.5 py-0.5 rounded border border-[#e5e0d8] font-mono text-[10px] text-[#2d2a26]">ESC</kbd>
              <span>to exit</span>
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline flex items-center gap-1">
              <History className="w-3 h-3 text-[#5A5A40]" />
              <span>Auto-tracked local history</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={(e) =>
                handleShareItem(e, {
                  id: 'virasat-share-footer',
                  title: 'Virasat - India Cultural & Heritage Portal',
                  type: 'Portal',
                  subtitle: 'Explore authentic monuments, 12 months festival calendar, and personalized itineraries.'
                })
              }
              className="text-[#5A5A40] hover:text-[#2d2a26] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share App</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1 font-bold uppercase tracking-wider text-[#5A5A40] hover:underline cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
