import React, { useState } from 'react';
import { DestinationPhrases, LocalPhrase, SupportedLanguage } from '../types';
import { getPhrasesForCity } from '../data/phrasesData';
import { getTranslation } from '../data/languages';
import {
  Copy,
  Check,
  Languages,
  Sparkles,
  MessageSquare,
  Compass,
  ShoppingBag,
  Utensils,
  HeartHandshake,
  AlertTriangle,
  Info
} from 'lucide-react';

interface CommonPhrasesTableProps {
  cityId: string;
  cityName: string;
  stateName?: string;
  initialCategory?: string;
  currentLanguage?: SupportedLanguage;
}

export const CommonPhrasesTable: React.FC<CommonPhrasesTableProps> = ({
  cityId,
  cityName,
  stateName = 'India',
  initialCategory = 'all',
  currentLanguage = 'en'
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const phraseData: DestinationPhrases = getPhrasesForCity(cityId, cityName, stateName);

  const categories = [
    { id: 'all', label: getTranslation('phrases.all', currentLanguage) || 'All Phrases', icon: Languages },
    { id: 'greeting', label: getTranslation('phrases.greetings', currentLanguage) || 'Greetings', icon: MessageSquare },
    { id: 'direction', label: getTranslation('phrases.directions', currentLanguage) || 'Directions & Transit', icon: Compass },
    { id: 'bargaining', label: getTranslation('phrases.shopping', currentLanguage) || 'Bazaars & Bargaining', icon: ShoppingBag },
    { id: 'dining', label: getTranslation('phrases.dining', currentLanguage) || 'Food & Dining', icon: Utensils },
    { id: 'courtesy', label: getTranslation('phrases.courtesy', currentLanguage) || 'Courtesy & Respect', icon: HeartHandshake },
    { id: 'emergency', label: getTranslation('phrases.emergency', currentLanguage) || 'Assistance & Help', icon: AlertTriangle }
  ];

  const filteredPhrases = phraseData.phrases.filter((phrase) => {
    const matchesCat = selectedCategory === 'all' || phrase.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      phrase.english.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phrase.phonetic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phrase.originalScript.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCopy = (phrase: LocalPhrase) => {
    const text = `${phrase.originalScript} (${phrase.phonetic}) - "${phrase.english}"`;
    navigator.clipboard.writeText(text);
    setCopiedId(phrase.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e5e0d8] shadow-xs space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#f0ece5]">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#9E3E26] uppercase tracking-widest">
            <Languages className="w-4 h-4" />
            <span>{getTranslation('phrases.guideTitle', currentLanguage) || 'Local Language & Dialect Guide'}</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#2d2a26] mt-1">
            Common Phrases in {phraseData.regionLanguage}
          </h3>
          <p className="text-xs sm:text-sm text-[#6b625b] mt-1 max-w-xl">
            {phraseData.culturalNote}
          </p>
        </div>

        {/* Script Info */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-[#f9f7f4] px-3.5 py-2 rounded-2xl border border-[#e5e0d8] flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8c827a]">
              {getTranslation('phrases.script', currentLanguage) || 'Script'}:
            </span>
            <span className="text-xs font-bold text-[#2d2a26] font-mono">{phraseData.scriptName}</span>
          </div>
        </div>
      </div>

      {/* Category Pills & Search Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-[#2d2a26] text-white shadow-xs'
                    : 'bg-[#f5f2ed] text-[#5a524c] hover:bg-[#ebe7e0] border border-[#e5e0d8]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        <input
          type="text"
          placeholder={getTranslation('search.placeholder', currentLanguage) || 'Search phrases in English or local script...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-3.5 py-2 bg-[#f9f7f4] border border-[#e5e0d8] rounded-xl text-xs text-[#2d2a26] placeholder-[#a0978f] focus:outline-none focus:border-[#9E3E26] sm:w-64"
        />
      </div>

      {/* Interactive Phrases Table */}
      <div className="overflow-hidden rounded-2xl border border-[#e5e0d8] shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f5f2ed] border-b border-[#e5e0d8] text-[11px] font-bold uppercase tracking-wider text-[#7a716a]">
                <th className="py-3.5 px-4">
                  {getTranslation('phrases.scriptAndPronounce', currentLanguage) || 'Local Script & Pronunciation'}
                </th>
                <th className="py-3.5 px-4">
                  {getTranslation('phrases.meaning', currentLanguage) || 'English Meaning'}
                </th>
                <th className="py-3.5 px-4 hidden md:table-cell">
                  {getTranslation('phrases.context', currentLanguage) || 'Travel Context & Etiquette'}
                </th>
                <th className="py-3.5 px-4 w-16 text-center">
                  {getTranslation('phrases.copy', currentLanguage) || 'Copy'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ece5] bg-white text-xs text-[#2d2a26]">
              {filteredPhrases.length > 0 ? (
                filteredPhrases.map((phrase) => {
                  const isCopied = copiedId === phrase.id;

                  return (
                    <tr
                      key={phrase.id}
                      className="hover:bg-[#fbf9f6] transition-colors group"
                    >
                      {/* Original Script + Roman Phonetics */}
                      <td className="py-4 px-4 align-middle">
                        <div className="space-y-1">
                          <div className="text-base sm:text-lg font-bold text-[#2d2a26] font-serif leading-tight">
                            {phrase.originalScript}
                          </div>
                          <div className="text-xs font-semibold text-[#9E3E26] tracking-wide flex items-center gap-1.5">
                            <span>🗣️ {phrase.phonetic}</span>
                          </div>
                        </div>
                      </td>

                      {/* English Meaning */}
                      <td className="py-4 px-4 align-middle font-medium text-[#3d3834]">
                        {phrase.english}
                      </td>

                      {/* Situational Context Tip */}
                      <td className="py-4 px-4 align-middle text-[#6b625b] hidden md:table-cell">
                        {phrase.situationalTip ? (
                          <div className="flex items-start gap-1.5 text-[11px] leading-relaxed bg-[#f9f7f4] p-2.5 rounded-xl border border-[#ece7df]">
                            <Info className="w-3.5 h-3.5 text-[#5A5A40] shrink-0 mt-0.5" />
                            <span>{phrase.situationalTip}</span>
                          </div>
                        ) : (
                          <span className="text-[#a0978f]">—</span>
                        )}
                      </td>

                      {/* Copy Phrase */}
                      <td className="py-4 px-4 text-center align-middle">
                        <button
                          onClick={() => handleCopy(phrase)}
                          title="Copy phrase to clipboard"
                          className="w-8 h-8 rounded-lg bg-[#f9f7f4] hover:bg-[#e8e4dc] border border-[#e5e0d8] flex items-center justify-center text-[#6b625b] hover:text-[#2d2a26] transition-all cursor-pointer mx-auto"
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-xs text-[#8c827a]">
                    No phrases found matching "{searchQuery}". Try selecting another category or clear search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Travel Pro-Tip Footer */}
      <div className="p-4 bg-[#fbf9f6] rounded-2xl border border-[#e5e0d8] text-xs text-[#5a524c] flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-[#9E3E26] shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-[#2d2a26]">
            {getTranslation('phrases.etiquetteTitle', currentLanguage) || 'Conversational Etiquette'}:{' '}
          </span>
          {getTranslation('phrases.etiquetteBody', currentLanguage) ||
            'Even a single word spoken in the regional tongue (like Khamma Ghani in Rajasthan, Nomoshkar in Bengal, or Vanakkam in Tamil Nadu) conveys genuine warmth and instantly turns local shopkeepers and artisans into welcoming cultural guides.'}
        </div>
      </div>
    </div>
  );
};
