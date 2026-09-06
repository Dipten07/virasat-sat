import React, { useState } from 'react';
import { TripMemory, AppView } from '../types';
import { useAuth } from '../context/AuthContext';
import { handleImageError } from '../utils/imageUtils';
import { 
  BookOpen, 
  Sparkles, 
  Plus, 
  Trash2, 
  Calendar, 
  MapPin, 
  Heart, 
  Share2, 
  Check, 
  X, 
  Camera, 
  Feather, 
  Tag, 
  Music, 
  Coffee, 
  Eye,
  Search,
  Filter,
  Compass,
  ArrowRight
} from 'lucide-react';

interface TripMemoriesViewProps {
  onNavigateTo: (view: AppView, params?: any) => void;
  isDashboardCompact?: boolean;
}

export const TripMemoriesView: React.FC<TripMemoriesViewProps> = ({
  onNavigateTo,
  isDashboardCompact = false
}) => {
  const { memories, saveMemory, deleteMemory, user } = useAuth();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedMood, setSelectedMood] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedMemoryDetail, setSelectedMemoryDetail] = useState<TripMemory | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Memory Form State
  const [formTitle, setFormTitle] = useState<string>('');
  const [formDestination, setFormDestination] = useState<string>('');
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formMood, setFormMood] = useState<TripMemory['mood']>('Spiritual');
  const [formJournal, setFormJournal] = useState<string>('');
  const [formHighlights, setFormHighlights] = useState<string>('');
  const [formTaste, setFormTaste] = useState<string>('');
  const [formSound, setFormSound] = useState<string>('');
  const [formSight, setFormSight] = useState<string>('');
  const [formPhoto, setFormPhoto] = useState<string>('');
  const [formTags, setFormTags] = useState<string>('');
  
  // AI Polish state
  const [isPolishing, setIsPolishing] = useState<boolean>(false);
  const [aiPoeticQuote, setAiPoeticQuote] = useState<string | null>(null);

  const moodsList: TripMemory['mood'][] = ['Spiritual', 'Awe-Inspired', 'Festive', 'Adventurous', 'Peaceful'];

  const filteredMemories = memories.filter((m) => {
    const matchMood = selectedMood === 'all' || m.mood === selectedMood;
    const matchSearch = !searchQuery ||
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.journalText.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.tags && m.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return matchMood && matchSearch;
  });

  const handleOpenNewModal = (presetDestination?: string) => {
    setFormTitle('');
    setFormDestination(presetDestination || '');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormMood('Spiritual');
    setFormJournal('');
    setFormHighlights('');
    setFormTaste('');
    setFormSound('');
    setFormSight('');
    setFormPhoto('');
    setFormTags('');
    setAiPoeticQuote(null);
    setIsModalOpen(true);
  };

  const handleAiPolish = async () => {
    if (!formJournal.trim() || !formDestination.trim()) {
      alert('Please enter at least a destination and your raw journal notes to polish!');
      return;
    }

    setIsPolishing(true);
    try {
      const response = await fetch('/api/polish-memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle,
          destination: formDestination,
          journalText: formJournal,
          culturalHighlights: formHighlights ? formHighlights.split(',').map(s => s.trim()) : [],
          sensoryImpressions: {
            taste: formTaste,
            sound: formSound,
            sight: formSight
          },
          mood: formMood
        })
      });

      if (!response.ok) throw new Error('AI Polish request failed');
      const data = await response.json();

      if (data.polishedTitle) setFormTitle(data.polishedTitle);
      if (data.polishedText) setFormJournal(data.polishedText);
      if (data.poeticQuote) setAiPoeticQuote(data.poeticQuote);
      if (Array.isArray(data.suggestedTags)) {
        const combined = Array.from(new Set([
          ...formTags.split(',').map(t => t.trim()).filter(Boolean),
          ...data.suggestedTags
        ])).join(', ');
        setFormTags(combined);
      }
    } catch (error) {
      console.error('Error polishing memory:', error);
      alert('Failed to connect to AI Polish. Please try again.');
    } finally {
      setIsPolishing(false);
    }
  };

  const handleSaveMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDestination.trim() || !formJournal.trim()) {
      alert('Please fill in title, destination, and journal reflections.');
      return;
    }

    const highlightsArr = formHighlights
      ? formHighlights.split(',').map((h) => h.trim()).filter(Boolean)
      : [];

    const tagsArr = formTags
      ? formTags.split(',').map((t) => t.trim().replace(/^#/, '')).filter(Boolean)
      : [formDestination, formMood];

    const photosArr = formPhoto.trim() ? [formPhoto.trim()] : [];

    const newMemory: TripMemory = {
      id: `memory_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: user?.uid,
      title: formTitle.trim(),
      destination: formDestination.trim(),
      date: formDate,
      mood: formMood,
      journalText: formJournal.trim(),
      culturalHighlights: highlightsArr,
      sensoryImpressions: {
        taste: formTaste.trim() || undefined,
        sound: formSound.trim() || undefined,
        sight: formSight.trim() || undefined
      },
      photos: photosArr,
      tags: tagsArr,
      isAiPolished: !!aiPoeticQuote,
      createdAt: new Date().toISOString()
    };

    await saveMemory(newMemory);
    setIsModalOpen(false);
  };

  const handleShare = (mem: TripMemory) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`✨ Travel Memoir: ${mem.title}\n📍 ${mem.destination} (${mem.date})\n🌟 Mood: ${mem.mood}\n\n"${mem.journalText}"\n\nPreserved via Virasat Cultural Portal`);
      setCopiedId(mem.id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const getMoodBadgeStyle = (mood: TripMemory['mood']) => {
    switch (mood) {
      case 'Spiritual':
        return 'bg-amber-100 text-amber-900 border-amber-200';
      case 'Awe-Inspired':
        return 'bg-purple-100 text-purple-900 border-purple-200';
      case 'Festive':
        return 'bg-rose-100 text-rose-900 border-rose-200';
      case 'Adventurous':
        return 'bg-emerald-100 text-emerald-900 border-emerald-200';
      case 'Peaceful':
        return 'bg-sky-100 text-sky-900 border-sky-200';
      default:
        return 'bg-stone-100 text-stone-900 border-stone-200';
    }
  };

  return (
    <section id="trip-memories-view" className="w-full">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800 border border-amber-200 shadow-xs">
              <BookOpen className="w-5 h-5 text-amber-700" />
            </div>
            <span className="text-xs uppercase tracking-wider font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/80">
              Cultural Travel Memoirs
            </span>
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-stone-900 font-serif">
            Personal Trip Memories & Sensory Journal
          </h2>
          <p className="text-stone-600 text-sm mt-1">
            Capture sacred dawns, bazaar aromas, temple bells, and royal haveli reflections. Enhance your raw thoughts into poetic travel memoirs with AI.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="write-new-memory-btn"
            onClick={() => handleOpenNewModal()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-700 hover:bg-orange-800 text-white text-sm font-semibold transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Write New Memoir</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-stone-200 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-stone-500 mr-2 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter by Mood:</span>
          </div>
          <button
            onClick={() => setSelectedMood('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              selectedMood === 'all'
                ? 'bg-stone-900 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            All ({memories.length})
          </button>
          {moodsList.map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMood(m)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                selectedMood === m
                  ? 'bg-orange-700 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
          <input
            type="text"
            placeholder="Search memories or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 rounded-lg border border-stone-300 text-stone-900 bg-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs"
          />
        </div>
      </div>

      {/* Memories Grid - CSS Grid System */}
      {filteredMemories.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-3xl bg-stone-50 border border-dashed border-stone-300">
          <Feather className="w-12 h-12 text-stone-400 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-stone-800 font-serif">No Trip Memories Found</h3>
          <p className="text-stone-500 text-xs mt-1 max-w-md mx-auto">
            {searchQuery || selectedMood !== 'all'
              ? 'Try resetting your filters or search terms.'
              : 'Begin preserving your personal cultural journeys across sacred rivers, forts, and festive streets.'}
          </p>
          <button
            onClick={() => handleOpenNewModal()}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-700 text-white text-xs font-semibold hover:bg-orange-800"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Write Your First Memory</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMemories.map((mem) => {
            const hasSensory = mem.sensoryImpressions && (mem.sensoryImpressions.taste || mem.sensoryImpressions.sound || mem.sensoryImpressions.sight);
            return (
              <div
                key={mem.id}
                id={`trip-memory-card-${mem.id}`}
                className="group bg-white rounded-2xl border border-stone-200 shadow-xs hover:shadow-md hover:border-amber-300 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Photo Header if exists */}
                {mem.photos && mem.photos.length > 0 ? (
                  <div className="relative h-44 w-full overflow-hidden bg-stone-100">
                    <img
                      src={mem.photos[0]}
                      alt={mem.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      onError={(e) => handleImageError(e, 'landscape')}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent" />
                    <div className="absolute top-3 right-3">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border shadow-xs ${getMoodBadgeStyle(mem.mood)}`}>
                        {mem.mood}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <span className="text-[11px] font-medium flex items-center gap-1 text-stone-200">
                        <MapPin className="w-3 h-3 text-orange-400" />
                        {mem.destination} • {mem.date}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 pb-0 flex items-center justify-between">
                    <span className="text-xs font-semibold text-stone-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-orange-600" />
                      {mem.destination} • {mem.date}
                    </span>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getMoodBadgeStyle(mem.mood)}`}>
                      {mem.mood}
                    </span>
                  </div>
                )}

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-stone-900 font-serif group-hover:text-orange-800 transition-colors leading-snug line-clamp-2">
                      {mem.title}
                    </h3>

                    {mem.isAiPolished && (
                      <div className="mt-1.5 mb-2 inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        <span>AI Polished Prose</span>
                      </div>
                    )}

                    <p className="text-stone-600 text-xs leading-relaxed mt-2 line-clamp-4 font-normal">
                      "{mem.journalText}"
                    </p>

                    {/* Sensory Notes Snippet */}
                    {hasSensory && (
                      <div className="mt-3 pt-2.5 border-t border-stone-100 grid grid-cols-1 gap-1.5 text-[11px] text-stone-600 bg-stone-50/70 p-2.5 rounded-xl">
                        {mem.sensoryImpressions?.sound && (
                          <div className="flex items-center gap-1.5 text-stone-700 truncate">
                            <Music className="w-3 h-3 text-purple-600 shrink-0" />
                            <span className="truncate"><strong>Sound:</strong> {mem.sensoryImpressions.sound}</span>
                          </div>
                        )}
                        {mem.sensoryImpressions?.taste && (
                          <div className="flex items-center gap-1.5 text-stone-700 truncate">
                            <Coffee className="w-3 h-3 text-amber-600 shrink-0" />
                            <span className="truncate"><strong>Taste:</strong> {mem.sensoryImpressions.taste}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tags */}
                    {mem.tags && mem.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {mem.tags.slice(0, 3).map((t, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-medium text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="pt-4 mt-4 border-t border-stone-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => setSelectedMemoryDetail(mem)}
                      className="text-xs font-semibold text-orange-700 hover:text-orange-900 flex items-center gap-1 transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Read Memoir</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleShare(mem)}
                        title="Copy memoir to clipboard"
                        className="p-1.5 text-stone-400 hover:text-stone-700 transition-colors"
                      >
                        {copiedId === mem.id ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Share2 className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        onClick={() => {
                          if (confirm('Delete this cultural trip memory?')) {
                            deleteMemory(mem.id);
                          }
                        }}
                        title="Delete memory"
                        className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Write / Polish Memory Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-stone-200 shadow-2xl p-6 sm:p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-xl bg-orange-100 text-orange-800">
                <Feather className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-stone-900 font-serif">
                  Write Cultural Travel Memoir
                </h3>
                <p className="text-xs text-stone-500">
                  Record personal memories and let the AI Cultural Writer polish your reflections.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveMemory} className="mt-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Destination / City *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Varanasi, Amer Fort, Hampi, Madurai"
                    value={formDestination}
                    onChange={(e) => setFormDestination(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Date of Visit</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Memoir Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bells of Kashi at Dawn"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Atmosphere / Mood</label>
                  <select
                    value={formMood}
                    onChange={(e) => setFormMood(e.target.value as TripMemory['mood'])}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 focus:ring-2 focus:ring-orange-500 focus:outline-none bg-white"
                  >
                    {moodsList.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Journal Notes */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-stone-800">
                    Your Reflections & Notes *
                  </label>
                  <button
                    type="button"
                    onClick={handleAiPolish}
                    disabled={isPolishing}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    <Sparkles className={`w-3.5 h-3.5 text-amber-700 ${isPolishing ? 'animate-spin' : ''}`} />
                    <span>{isPolishing ? 'Polishing...' : 'Polish with AI Writer'}</span>
                  </button>
                </div>
                <textarea
                  required
                  rows={5}
                  placeholder="Describe your journey, the sunlight on stone, chanting monks, sensory aromas, local artisans..."
                  value={formJournal}
                  onChange={(e) => setFormJournal(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 focus:ring-2 focus:ring-orange-500 focus:outline-none leading-relaxed"
                />
              </div>

              {aiPoeticQuote && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 italic text-xs">
                  <strong>AI Poetic Reflection:</strong> "{aiPoeticQuote}"
                </div>
              )}

              {/* Sensory Impressions */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-3">
                <span className="font-bold text-stone-800 block text-xs">
                  Sensory Footprints (Optional)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-stone-600 mb-0.5">Taste / Culinary</label>
                    <input
                      type="text"
                      placeholder="e.g. Saffron Malaiyo, Pyaaz Kachori"
                      value={formTaste}
                      onChange={(e) => setFormTaste(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-0.5">Sound / Music</label>
                    <input
                      type="text"
                      placeholder="e.g. Conch shells, Ravanahatha"
                      value={formSound}
                      onChange={(e) => setFormSound(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 mb-0.5">Sight / Light</label>
                    <input
                      type="text"
                      placeholder="e.g. Golden sandstone sunset"
                      value={formSight}
                      onChange={(e) => setFormSight(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Highlights & Photo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Key Highlights (Comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Morning Aarti, Sheesh Mahal, Sand dunes"
                    value={formHighlights}
                    onChange={(e) => setFormHighlights(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-stone-800 mb-1">Photo Image URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={formPhoto}
                    onChange={(e) => setFormPhoto(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-800 mb-1">Tags (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. GangaAarti, RajasthanRoyals, UNESCO"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-stone-900 focus:ring-2 focus:ring-orange-500 focus:outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-orange-700 hover:bg-orange-800 text-white font-bold transition-all shadow-xs"
                >
                  Save Memoir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Memory Detail Modal */}
      {selectedMemoryDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-stone-200 shadow-2xl p-6 sm:p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedMemoryDetail(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 transition-colors"
              aria-label="Close details"
            >
              <X className="w-5 h-5" />
            </button>

            {selectedMemoryDetail.photos && selectedMemoryDetail.photos.length > 0 && (
              <div className="w-full h-56 rounded-2xl overflow-hidden mb-5 -mt-2">
                <img
                  src={selectedMemoryDetail.photos[0]}
                  alt={selectedMemoryDetail.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => handleImageError(e, 'landscape')}
                />
              </div>
            )}

            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${getMoodBadgeStyle(selectedMemoryDetail.mood)}`}>
                {selectedMemoryDetail.mood}
              </span>
              <span className="text-xs text-stone-500 font-medium flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-orange-600" />
                {selectedMemoryDetail.destination} • {selectedMemoryDetail.date}
              </span>
            </div>

            <h3 className="text-2xl font-bold text-stone-900 font-serif mb-4">
              {selectedMemoryDetail.title}
            </h3>

            <div className="prose prose-stone text-stone-700 text-sm leading-relaxed mb-6 bg-stone-50 p-5 rounded-2xl border border-stone-200 whitespace-pre-line font-serif">
              {selectedMemoryDetail.journalText}
            </div>

            {selectedMemoryDetail.sensoryImpressions && (
              <div className="bg-amber-50/60 p-4 rounded-2xl border border-amber-200/70 text-xs space-y-2 mb-6">
                <span className="font-bold text-amber-950 block">Sensory Impressions</span>
                {selectedMemoryDetail.sensoryImpressions.taste && (
                  <p className="text-amber-900"><strong>Taste:</strong> {selectedMemoryDetail.sensoryImpressions.taste}</p>
                )}
                {selectedMemoryDetail.sensoryImpressions.sound && (
                  <p className="text-amber-900"><strong>Sound:</strong> {selectedMemoryDetail.sensoryImpressions.sound}</p>
                )}
                {selectedMemoryDetail.sensoryImpressions.sight && (
                  <p className="text-amber-900"><strong>Sight:</strong> {selectedMemoryDetail.sensoryImpressions.sight}</p>
                )}
              </div>
            )}

            {selectedMemoryDetail.culturalHighlights && selectedMemoryDetail.culturalHighlights.length > 0 && (
              <div className="mb-6">
                <span className="text-xs font-bold text-stone-800 block mb-2">Cultural Highlights</span>
                <div className="flex flex-wrap gap-2">
                  {selectedMemoryDetail.culturalHighlights.map((h, i) => (
                    <span key={i} className="text-xs font-medium text-stone-700 bg-stone-100 px-3 py-1 rounded-lg border border-stone-200">
                      ✨ {h}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-stone-200 text-xs">
              <button
                onClick={() => handleShare(selectedMemoryDetail)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 font-semibold text-stone-800"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share Memoir</span>
              </button>

              <button
                onClick={() => setSelectedMemoryDetail(null)}
                className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
