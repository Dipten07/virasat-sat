import { RecentHistoryItem, AppView } from '../types';
import { MONUMENTS_DATA } from '../data/monumentsData';
import { CITIES_DATA } from '../data/citiesData';
import { FESTIVALS_DATA } from '../data/festivalsData';
import { STATES_DATA } from '../data/statesData';

const RECENT_HISTORY_KEY = 'virasat_recent_navigation_history';
const MAX_HISTORY_ITEMS = 12;

export function getRecentHistory(): RecentHistoryItem[] {
  try {
    const raw = localStorage.getItem(RECENT_HISTORY_KEY);
    if (!raw) {
      // Seed with meaningful initial discovery items if empty
      const defaultHistory: RecentHistoryItem[] = [
        {
          id: 'taj-mahal',
          type: 'monument',
          title: 'Taj Mahal',
          subtitle: 'Agra, Uttar Pradesh • Mughal Mausoleum',
          image: MONUMENTS_DATA.find((m) => m.id === 'taj-mahal')?.bannerImage,
          timestamp: Date.now() - 1000 * 60 * 15,
          view: 'monument-detail',
          params: { monumentId: 'taj-mahal', cityId: 'agra' }
        },
        {
          id: 'varanasi',
          type: 'city',
          title: 'Varanasi',
          subtitle: 'Uttar Pradesh • Spiritual Capital of India',
          image: CITIES_DATA.find((c) => c.id === 'varanasi')?.bannerImage,
          timestamp: Date.now() - 1000 * 60 * 45,
          view: 'city-detail',
          params: { cityId: 'varanasi' }
        },
        {
          id: 'dev-deepawali',
          type: 'festival',
          title: 'Dev Deepawali',
          subtitle: 'Kartik Poornima • Varanasi, Uttar Pradesh',
          image: FESTIVALS_DATA.find((f) => f.id === 'dev-deepawali')?.bannerImage,
          timestamp: Date.now() - 1000 * 60 * 120,
          view: 'festival-detail',
          params: { festivalId: 'dev-deepawali' }
        }
      ];
      localStorage.setItem(RECENT_HISTORY_KEY, JSON.stringify(defaultHistory));
      return defaultHistory;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading recent history:', e);
    return [];
  }
}

export function saveRecentHistory(items: RecentHistoryItem[]): void {
  try {
    localStorage.setItem(RECENT_HISTORY_KEY, JSON.stringify(items.slice(0, MAX_HISTORY_ITEMS)));
  } catch (e) {
    console.error('Error saving recent history:', e);
  }
}

export function addRecentHistoryItem(item: Omit<RecentHistoryItem, 'timestamp'>): RecentHistoryItem[] {
  const current = getRecentHistory();
  // Filter out any existing item with the same ID or type+id
  const filtered = current.filter((i) => !(i.id === item.id && i.type === item.type));
  const newItem: RecentHistoryItem = {
    ...item,
    timestamp: Date.now()
  };
  const updated = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS);
  saveRecentHistory(updated);
  return updated;
}

export function removeRecentHistoryItem(id: string, type?: string): RecentHistoryItem[] {
  const current = getRecentHistory();
  const updated = current.filter((i) => !(i.id === id && (!type || i.type === type)));
  saveRecentHistory(updated);
  return updated;
}

export function clearRecentHistory(): void {
  try {
    localStorage.removeItem(RECENT_HISTORY_KEY);
  } catch (e) {
    console.error('Error clearing recent history:', e);
  }
}

export function trackViewNavigation(
  view: AppView,
  params?: { festivalId?: string; cityId?: string; monumentId?: string; stateId?: string }
): void {
  if (view === 'monument-detail' && params?.monumentId) {
    const m = MONUMENTS_DATA.find((item) => item.id === params.monumentId);
    if (m) {
      addRecentHistoryItem({
        id: m.id,
        type: 'monument',
        title: m.name,
        subtitle: `${m.cityName}, ${m.state} • ${m.type}`,
        image: m.bannerImage,
        view: 'monument-detail',
        params: { monumentId: m.id, cityId: m.cityId }
      });
    }
  } else if (view === 'city-detail' && params?.cityId) {
    const c = CITIES_DATA.find((item) => item.id === params.cityId);
    if (c) {
      addRecentHistoryItem({
        id: c.id,
        type: 'city',
        title: c.name,
        subtitle: `${c.state} • ${c.tagline}`,
        image: c.bannerImage,
        view: 'city-detail',
        params: { cityId: c.id }
      });
    }
  } else if (view === 'festival-detail' && params?.festivalId) {
    const f = FESTIVALS_DATA.find((item) => item.id === params.festivalId);
    if (f) {
      addRecentHistoryItem({
        id: f.id,
        type: 'festival',
        title: f.name,
        subtitle: `${f.dateRange} • ${f.stateOrigin || (f.celebratedStates || []).slice(0, 2).join(', ')}`,
        image: f.bannerImage,
        view: 'festival-detail',
        params: { festivalId: f.id }
      });
    }
  } else if (view === 'state-detail' && params?.stateId) {
    const s = STATES_DATA.find((item) => item.id === params.stateId);
    if (s) {
      addRecentHistoryItem({
        id: s.id,
        type: 'state',
        title: s.name,
        subtitle: `${s.region} India • ${(s.famousFor || []).slice(0, 2).join(', ')}`,
        image: s.bannerImage,
        view: 'state-detail',
        params: { stateId: s.id }
      });
    }
  }
}

export function formatTimeAgo(timestamp: number): string {
  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
}

export async function shareCulturalItem(item: {
  title: string;
  type: string;
  subtitle?: string;
  url?: string;
}): Promise<{ success: boolean; message: string }> {
  const shareUrl = item.url || window.location.href;
  const shareText = `✨ Explore ${item.title} (${item.type.toUpperCase()}) on Virasat:\n${item.subtitle || 'Discover authentic Indian cultural heritage, monuments & traditions.'}\n🔗 ${shareUrl}`;

  if (navigator.share) {
    try {
      await navigator.share({
        title: `${item.title} - Virasat Cultural Portal`,
        text: shareText,
        url: shareUrl
      });
      return { success: true, message: `Shared ${item.title} successfully!` };
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        if (navigator.clipboard) {
          await navigator.clipboard.writeText(shareText);
          return { success: true, message: `Copied details & link for ${item.title} to clipboard!` };
        }
      }
      return { success: false, message: 'Share cancelled' };
    }
  }

  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(shareText);
      return { success: true, message: `Copied details & link for ${item.title} to clipboard!` };
    } catch (e) {
      return { success: false, message: 'Unable to copy to clipboard' };
    }
  }

  return { success: false, message: 'Sharing not supported on this browser' };
}
