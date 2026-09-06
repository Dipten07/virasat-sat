import React from 'react';
import { SavedItinerary, UserLocation, SupportedLanguage } from '../types';
import { FESTIVALS_DATA } from '../data/festivalsData';
import { MONUMENTS_DATA } from '../data/monumentsData';
import { CITIES_DATA } from '../data/citiesData';
import { getTranslation } from '../data/languages';
import { useAuth } from '../context/AuthContext';
import { HotelBooking } from '../data/nearbyStaysData';
import { getSafeHeritageImage, handleImageError } from '../utils/imageUtils';
import {
  Luggage,
  Calendar,
  Landmark,
  MapPin,
  Trash2,
  ArrowRight,
  Compass,
  CheckCircle2,
  ShieldCheck,
  Printer,
  Sparkles,
  Cloud,
  Heart,
  UserCheck,
  BookOpen,
  Feather,
  Plus,
  Hotel,
  Clock
} from 'lucide-react';
import { AppView } from '../types';

interface MyTripViewProps {
  savedItineraries?: SavedItinerary[];
  savedFestivalIds?: string[];
  savedMonumentIds?: string[];
  savedCityIds?: string[];
  userLocation: UserLocation;
  onRemoveItinerary: (id: string) => void;
  onSelectFestival: (id: string) => void;
  onSelectMonument: (id: string) => void;
  onSelectCity: (id: string) => void;
  onToggleSaveFestival: (id: string) => void;
  onToggleSaveMonument: (id: string) => void;
  onOpenItineraryGenerator: (cityId: string, festivalId?: string) => void;
  onOpenAuthModal?: () => void;
  onNavigateTo?: (view: AppView, params?: any) => void;
  currentLanguage?: SupportedLanguage;
}

export const MyTripView: React.FC<MyTripViewProps> = ({
  userLocation,
  onRemoveItinerary,
  onSelectFestival,
  onSelectMonument,
  onSelectCity,
  onToggleSaveFestival,
  onToggleSaveMonument,
  onOpenItineraryGenerator,
  onOpenAuthModal,
  onNavigateTo,
  currentLanguage = 'en'
}) => {
  const { user, bookmarks, itineraries, memories, toggleBookmark, removeItinerary } = useAuth();

  const savedFestivals = bookmarks
    .filter((b) => b.itemType === 'festival')
    .map((b) => {
      const found = FESTIVALS_DATA.find((f) => f.id === b.itemId);
      return found || {
        id: b.itemId,
        name: b.title,
        dateRange: b.subtitle,
        bestExperienceSpot: 'Heritage Spot',
        bannerImage: b.imageUrl
      };
    });

  const savedMonuments = bookmarks
    .filter((b) => b.itemType === 'monument')
    .map((b) => {
      const found = MONUMENTS_DATA.find((m) => m.id === b.itemId);
      return found || {
        id: b.itemId,
        name: b.title,
        cityName: b.subtitle.split(',')[0] || 'India',
        state: b.subtitle.split(',')[1] || '',
        entryFee: { indian: 'ASI Monument' },
        bannerImage: b.imageUrl
      };
    });

  const [hotelBookings, setHotelBookings] = React.useState<HotelBooking[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('virasat_hotel_bookings') || '[]');
    } catch {
      return [];
    }
  });

  const handleCancelBooking = (bookingId: string) => {
    const updated = hotelBookings.filter(b => b.id !== bookingId);
    setHotelBookings(updated);
    try {
      localStorage.setItem('virasat_hotel_bookings', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const totalSaved = itineraries.length + savedFestivals.length + savedMonuments.length + (memories?.length || 0) + hotelBookings.length;

  return (
    <div className="space-y-10 animate-fadeIn pb-16">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e5e0d8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold text-[#5A5A40] uppercase tracking-widest bg-[#f5f2ed] px-3 py-1 rounded-full border border-[#e5e0d8]">
              Cloud Traveler Dashboard
            </span>
            <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full border border-emerald-200">
              <Cloud className="w-3 h-3" />
              <span>Firebase Synced</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-[#2d2a26]">
            My Trip & Saved Heritage
          </h1>
          <p className="text-xs sm:text-sm text-[#8a817c] font-normal">
            Departure Hub: <strong className="text-[#2d2a26]">{userLocation.city}, {userLocation.state}</strong> • {totalSaved} Saved Item{totalSaved !== 1 ? 's' : ''} in Cloud
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-[#8a817c] bg-[#f5f2ed] hover:bg-white border border-[#e5e0d8] rounded-full cursor-pointer shadow-2xs transition-all"
          >
            <Printer className="w-3.5 h-3.5 text-[#5A5A40]" />
            <span>Print Summary</span>
          </button>
        </div>
      </div>

      {totalSaved === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#e5e0d8] space-y-4 shadow-xs">
          <Luggage className="w-16 h-16 text-[#8a817c]/50 mx-auto" />
          <h3 className="font-serif text-2xl font-bold text-[#2d2a26]">Your Cloud Trip Box is Empty</h3>
          <p className="text-xs sm:text-sm text-[#8a817c] max-w-md mx-auto font-normal">
            Explore 12 months of vibrant Indian festivals, UNESCO monuments, and destinations. Click the heart or save buttons to save items directly to Firebase Firestore!
          </p>
          <button
            onClick={() => onSelectFestival('dev-deepawali')}
            className="px-7 py-3 text-xs font-bold uppercase tracking-widest text-[#2d2a26] bg-[#E6BE8A] hover:bg-white rounded-full cursor-pointer shadow-xs border border-[#e5e0d8] transition-all"
          >
            Start Exploring Festivals
          </button>
        </div>
      )}

      {/* 1. SAVED ITINERARIES */}
      {itineraries.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#8a817c] uppercase tracking-widest">
            <Compass className="w-3.5 h-3.5 text-[#5A5A40]" />
            <span>Cloud Saved Itineraries ({itineraries.length})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {itineraries.map((itin) => (
              <div
                key={itin.id}
                className="bg-white rounded-3xl p-6 border border-[#e5e0d8] shadow-xs flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#5A5A40] bg-[#f5f2ed] px-3 py-1 rounded-full border border-[#e5e0d8]">
                      {itin.daysCount} Days • {itin.travelPace}
                    </span>
                    <button
                      onClick={() => removeItinerary(itin.id)}
                      className="text-[#8a817c] hover:text-rose-600 p-1 cursor-pointer transition-colors"
                      title="Delete Saved Itinerary from Cloud"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <h3 className="text-xl font-serif font-bold text-[#2d2a26] mt-2">
                    {itin.destinationName} Heritage Journey
                  </h3>
                  {itin.startDate && (
                    <p className="text-xs text-[#5A5A40] font-semibold mt-0.5">
                      🗓️ {new Date(itin.startDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                      {itin.endDate && (
                        <span> – {new Date(itin.endDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      )}
                      {' '}({itin.daysCount} {itin.daysCount === 1 ? 'Day' : 'Days'})
                    </p>
                  )}
                  {itin.festivalName && (
                    <p className="text-xs text-[#5A5A40] font-medium mt-0.5">
                      Includes: {itin.festivalName}
                    </p>
                  )}
                  <p className="text-xs text-[#8a817c] mt-1 font-normal">
                    Stay Style: <strong className="text-[#2d2a26] font-medium">{itin.stayStyle}</strong>
                  </p>

                  {/* Highlights list preview */}
                  <div className="space-y-1.5 mt-3 pt-3 border-t border-[#e5e0d8]">
                    {itin.days.slice(0, 2).map((d) => (
                      <div key={d.dayNumber} className="text-xs text-[#2d2a26] flex items-center gap-1.5">
                        <span className="font-bold text-[#5A5A40]">Day {d.dayNumber}:</span>
                        <span className="truncate">{d.theme}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#e5e0d8] flex items-center justify-between">
                  <button
                    onClick={() => onOpenItineraryGenerator(itin.destinationId, itin.festivalId)}
                    className="text-xs font-bold uppercase tracking-wider text-[#5A5A40] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open Timeline</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <span className="text-[10px] text-[#8a817c]">Saved on {itin.createdAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. SAVED FESTIVALS */}
      {savedFestivals.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#8a817c] uppercase tracking-widest">
            <Calendar className="w-3.5 h-3.5 text-[#5A5A40]" />
            <span>Saved Festivals ({savedFestivals.length})</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedFestivals.map((fest: any) => (
              <div
                key={fest.id}
                onClick={() => onSelectFestival(fest.id)}
                className="group p-4 bg-white rounded-3xl border border-[#e5e0d8] flex items-center justify-between gap-3 shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 truncate">
                  <img
                    src={getSafeHeritageImage(fest.bannerImage, 'festival', fest.id)}
                    alt={fest.name}
                    className="w-14 h-14 rounded-2xl object-cover shrink-0"
                    referrerPolicy="no-referrer"
                    onError={(e) => handleImageError(e, 'festival')}
                  />
                  <div className="truncate">
                    <h4 className="text-sm font-serif font-bold text-[#2d2a26] group-hover:text-[#5A5A40] truncate">
                      {fest.name}
                    </h4>
                    <p className="text-xs text-[#8a817c] mt-0.5 font-normal">📅 {fest.dateRange}</p>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-[#8a817c] truncate">{fest.bestExperienceSpot}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBookmark({
                      itemType: 'festival',
                      itemId: fest.id,
                      title: fest.name,
                      subtitle: fest.dateRange,
                      imageUrl: fest.bannerImage
                    });
                  }}
                  className="text-[#8a817c] hover:text-rose-600 p-1.5 shrink-0 cursor-pointer transition-colors"
                  title="Remove from Cloud"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. SAVED MONUMENTS */}
      {savedMonuments.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#8a817c] uppercase tracking-widest">
            <Landmark className="w-3.5 h-3.5 text-[#5A5A40]" />
            <span>Saved Monuments & Heritage ({savedMonuments.length})</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedMonuments.map((mon: any) => (
              <div
                key={mon.id}
                onClick={() => onSelectMonument(mon.id)}
                className="group p-4 bg-white rounded-3xl border border-[#e5e0d8] flex items-center justify-between gap-3 shadow-xs hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 truncate">
                  <img
                    src={getSafeHeritageImage(mon.bannerImage, 'monument', mon.id)}
                    alt={mon.name}
                    className="w-14 h-14 rounded-2xl object-cover shrink-0"
                    referrerPolicy="no-referrer"
                    onError={(e) => handleImageError(e, 'monument')}
                  />
                  <div className="truncate">
                    <h4 className="text-sm font-serif font-bold text-[#2d2a26] group-hover:text-[#5A5A40] truncate">
                      {mon.name}
                    </h4>
                    <p className="text-xs text-[#8a817c] mt-0.5 font-normal">📍 {mon.cityName}, {mon.state}</p>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-[#8a817c]">{mon.entryFee?.indian || 'Heritage Site'}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleBookmark({
                      itemType: 'monument',
                      itemId: mon.id,
                      title: mon.name,
                      subtitle: `${mon.cityName}, ${mon.state}`,
                      imageUrl: mon.bannerImage
                    });
                  }}
                  className="text-[#8a817c] hover:text-rose-600 p-1.5 shrink-0 cursor-pointer transition-colors"
                  title="Remove from Cloud"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. CULTURAL TRIP MEMORIES & JOURNAL */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e5e0d8] space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#8a817c] uppercase tracking-widest mb-1">
              <BookOpen className="w-4 h-4 text-[#5A5A40]" />
              <span>Personal Cultural Memoirs ({memories?.length || 0})</span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#2d2a26]">
              Trip Memories & Sensory Journal
            </h3>
            <p className="text-xs text-[#8a817c] mt-0.5">
              Preserved in Firestore cloud database with AI poetic enhancements and sensory footprints.
            </p>
          </div>

          <button
            onClick={() => onNavigateTo?.('trip-memories')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#5A5A40] hover:bg-[#2d2a26] text-white text-xs font-bold uppercase tracking-wider transition-all shadow-xs shrink-0 self-start sm:self-auto"
          >
            <Feather className="w-3.5 h-3.5 text-[#E6BE8A]" />
            <span>Open Journal / Write Memoir</span>
          </button>
        </div>

        {memories && memories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {memories.slice(0, 3).map((mem) => (
              <div
                key={mem.id}
                onClick={() => onNavigateTo?.('trip-memories')}
                className="bg-[#f5f2ed] p-5 rounded-2xl border border-[#e5e0d8] hover:border-[#5A5A40] transition-colors cursor-pointer flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] text-[#8a817c] mb-1">
                    <span className="font-semibold text-[#5A5A40]">{mem.destination}</span>
                    <span>{mem.date}</span>
                  </div>
                  <h4 className="font-serif font-bold text-[#2d2a26] text-base line-clamp-1">
                    {mem.title}
                  </h4>
                  <p className="text-xs text-[#8a817c] line-clamp-2 leading-relaxed mt-1">
                    "{mem.journalText}"
                  </p>
                </div>

                <div className="pt-2 border-t border-[#e5e0d8] flex items-center justify-between text-xs text-[#5A5A40] font-bold">
                  <span>Mood: {mem.mood}</span>
                  <span className="flex items-center gap-1">Read <ArrowRight className="w-3 h-3" /></span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-[#f5f2ed] border border-[#e5e0d8] text-center space-y-2">
            <p className="text-xs text-[#8a817c]">
              No travel memoirs recorded yet. Capture your morning aartis, fort climbs, and culinary stories!
            </p>
            <button
              onClick={() => onNavigateTo?.('trip-memories')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#E6BE8A] text-[#2d2a26] text-xs font-bold uppercase tracking-wider hover:bg-white transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record First Memory</span>
            </button>
          </div>
        )}
      </div>

      {/* 5. HOTEL & HERITAGE STAY RESERVATIONS */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e5e0d8] space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e5e0d8] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-[#8a817c] uppercase tracking-widest">
              <Hotel className="w-4 h-4 text-[#5A5A40]" />
              <span>Confirmed Heritage Stays ({hotelBookings.length})</span>
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#2d2a26]">
              Hotel & Stay Bookings
            </h3>
            <p className="text-xs text-[#8a817c]">
              Directly confirmed reservations with local heritage palaces, havelis, and guest houses.
            </p>
          </div>
        </div>

        {hotelBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hotelBookings.map((b) => (
              <div
                key={b.id}
                className="p-5 rounded-3xl bg-[#f5f2ed] border border-[#e5e0d8] flex flex-col justify-between space-y-4 shadow-xs"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#5A5A40] bg-white px-2.5 py-0.5 rounded-full border border-[#e5e0d8]">
                        Ref: {b.bookingRef}
                      </span>
                      <h4 className="font-serif font-bold text-[#2d2a26] text-lg mt-1">
                        {b.stayName}
                      </h4>
                      <p className="text-xs text-[#8a817c] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#5A5A40]" />
                        <span>{b.cityName} • {b.roomType}</span>
                      </p>
                    </div>

                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                      Confirmed
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs bg-white p-3 rounded-2xl border border-[#e5e0d8]">
                    <div>
                      <span className="text-[10px] text-[#8a817c] uppercase block">Dates</span>
                      <strong className="text-[#2d2a26]">{b.checkInDate} → {b.checkOutDate}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#8a817c] uppercase block">Guests & Nights</span>
                      <strong className="text-[#2d2a26]">{b.guestsCount} Guests, {b.nights} Night{b.nights > 1 ? 's' : ''}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#8a817c] uppercase block">Guest Name</span>
                      <span className="text-[#2d2a26] truncate block">{b.guestName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#8a817c] uppercase block">Total Price</span>
                      <strong className="text-[#5A5A40]">₹{b.finalTotal.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#e5e0d8] flex items-center justify-between text-xs">
                  <span className="text-[10px] text-[#8a817c]">
                    Payment: {b.paymentMethod === 'pay_at_hotel' ? 'Pay at Check-In' : 'Online Pre-paid'}
                  </span>
                  <button
                    onClick={() => handleCancelBooking(b.id)}
                    className="text-[11px] font-bold uppercase tracking-wider text-rose-600 hover:text-rose-800 transition-colors cursor-pointer"
                  >
                    Cancel Booking
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-[#f5f2ed] border border-[#e5e0d8] text-center space-y-2">
            <Hotel className="w-10 h-10 text-[#8a817c]/50 mx-auto" />
            <p className="text-xs text-[#8a817c]">
              No stays booked yet. Browse heritage destinations or festivals and book verified nearby stays directly!
            </p>
          </div>
        )}
      </div>

      {/* 6. HERITAGE TRAVELER ESSENTIAL CHECKLIST */}
      <div className="bg-[#f5f2ed] rounded-3xl p-6 sm:p-8 border border-[#e5e0d8] space-y-4 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold text-[#8a817c] uppercase tracking-widest">
          <ShieldCheck className="w-4 h-4 text-[#5A5A40]" />
          <span>Pre-Departure Heritage Traveler Advice</span>
        </div>
        <h3 className="font-serif text-2xl font-bold text-[#2d2a26]">
          Essential Tips for Indian Cultural & Monument Travel
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
          <div className="bg-white p-5 rounded-2xl border border-[#e5e0d8] space-y-1.5 shadow-2xs">
            <h4 className="text-[10px] font-bold text-[#5A5A40] uppercase tracking-widest">ASI Monument Passes</h4>
            <p className="text-xs text-[#8a817c] leading-relaxed font-normal">
              Book Archaeological Survey of India (ASI) tickets via the official portal in advance to save 10% on entry fees and bypass queues.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#e5e0d8] space-y-1.5 shadow-2xs">
            <h4 className="text-[10px] font-bold text-[#5A5A40] uppercase tracking-widest">Temple Dress Codes</h4>
            <p className="text-xs text-[#8a817c] leading-relaxed font-normal">
              Most major temples (Varanasi, Tirupati, Puri, Madurai) require traditional modest attire (dhoti/kurta or saree/salwar; shoulders and knees covered).
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#e5e0d8] space-y-1.5 shadow-2xs">
            <h4 className="text-[10px] font-bold text-[#5A5A40] uppercase tracking-widest">Festival Crowds & Timings</h4>
            <p className="text-xs text-[#8a817c] leading-relaxed font-normal">
              For major rituals (Ganga Aarti, Rath Yatra, Kullu Dussehra), arrive at vantage points 2 hours early to secure prime viewing spots.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
