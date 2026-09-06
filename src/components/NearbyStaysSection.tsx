import React, { useState } from 'react';
import { 
  Hotel, 
  MapPin, 
  Star, 
  Check, 
  Calendar, 
  User, 
  Mail, 
  Phone, 
  Sparkles, 
  CreditCard, 
  ShieldCheck, 
  X, 
  Clock, 
  ArrowRight,
  Info,
  CheckCircle2,
  Building
} from 'lucide-react';
import { NearbyStay, HotelBooking, getStaysForDestination } from '../data/nearbyStaysData';
import { useAuth } from '../context/AuthContext';
import { getSafeHeritageImage, handleImageError } from '../utils/imageUtils';

interface NearbyStaysSectionProps {
  cityId: string;
  cityName: string;
  onOpenAuthModal?: () => void;
}

export const NearbyStaysSection: React.FC<NearbyStaysSectionProps> = ({
  cityId,
  cityName,
  onOpenAuthModal
}) => {
  const { user } = useAuth();
  const stays = getStaysForDestination(cityId, cityName);

  // Active selected stay for booking modal
  const [selectedStay, setSelectedStay] = useState<NearbyStay | null>(null);
  const [selectedRoomIndex, setSelectedRoomIndex] = useState<number>(0);
  
  // Booking Form State
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  
  const [checkIn, setCheckIn] = useState<string>(today);
  const [checkOut, setCheckOut] = useState<string>(tomorrow);
  const [guestsCount, setGuestsCount] = useState<number>(2);
  const [guestName, setGuestName] = useState<string>(user?.displayName || '');
  const [guestEmail, setGuestEmail] = useState<string>(user?.email || '');
  const [guestPhone, setGuestPhone] = useState<string>('');
  const [specialRequests, setSpecialRequests] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'pay_at_hotel' | 'upi_instant' | 'card_prepay'>('pay_at_hotel');
  
  // Booking status state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmedBooking, setConfirmedBooking] = useState<HotelBooking | null>(null);

  // Calculate nights and pricing
  const calculateNights = () => {
    try {
      const inDate = new Date(checkIn).getTime();
      const outDate = new Date(checkOut).getTime();
      const diff = Math.ceil((outDate - inDate) / (1000 * 60 * 60 * 24));
      return diff > 0 ? diff : 1;
    } catch {
      return 1;
    }
  };

  const nights = calculateNights();
  const selectedRoom = selectedStay ? selectedStay.roomTypes[selectedRoomIndex] || selectedStay.roomTypes[0] : null;
  const pricePerNight = selectedRoom ? selectedRoom.price : (selectedStay?.pricePerNight || 0);
  const baseTotal = pricePerNight * nights;
  const taxesAndFees = Math.round(baseTotal * 0.12); // 12% GST standard
  const finalTotal = baseTotal + taxesAndFees;

  const handleOpenBookingModal = (stay: NearbyStay) => {
    setSelectedStay(stay);
    setSelectedRoomIndex(0);
    if (user) {
      if (!guestName && user.displayName) setGuestName(user.displayName);
      if (!guestEmail && user.email) setGuestEmail(user.email);
    }
  };

  const handleCloseModal = () => {
    setSelectedStay(null);
    setConfirmedBooking(null);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStay || !selectedRoom) return;

    setIsSubmitting(true);

    setTimeout(() => {
      const bookingRef = 'VIRASAT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const bookingData: HotelBooking = {
        id: 'book-' + Date.now(),
        userId: user?.uid,
        stayId: selectedStay.id,
        stayName: selectedStay.name,
        cityName: selectedStay.cityName,
        stayType: selectedStay.type,
        stayImage: selectedStay.image,
        roomType: selectedRoom.name,
        checkInDate: checkIn,
        checkOutDate: checkOut,
        nights,
        guestsCount,
        guestName: guestName.trim() || 'Heritage Guest',
        guestEmail: guestEmail.trim() || 'guest@virasat.app',
        guestPhone: guestPhone.trim() || '+91 98765 43210',
        specialRequests: specialRequests.trim(),
        pricePerNight,
        totalAmount: baseTotal,
        taxesAndFees,
        finalTotal,
        paymentMethod,
        status: 'Confirmed',
        bookingRef,
        createdAt: new Date().toISOString()
      };

      // Save to localStorage for instant persistence across sessions
      try {
        const existing = JSON.parse(localStorage.getItem('virasat_hotel_bookings') || '[]');
        localStorage.setItem('virasat_hotel_bookings', JSON.stringify([bookingData, ...existing]));
      } catch (err) {
        console.error('Failed to store booking in local state', err);
      }

      setIsSubmitting(false);
      setConfirmedBooking(bookingData);
    }, 800);
  };

  return (
    <section id="nearby-stays-section" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e5e0d8] pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#8a817c] uppercase tracking-widest">
            <Building className="w-3.5 h-3.5 text-[#5A5A40]" />
            <span>Verified Accommodations & Heritage Stays</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2d2a26] mt-0.5">
            Nearby Stays & Heritage Hotels in {cityName}
          </h2>
          <p className="text-xs sm:text-sm text-[#8a817c] mt-1 font-normal">
            Book verified royal palaces, riverfront havelis, and boutique stays directly with instant confirmation and flexible cancellation.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-[#5A5A40] bg-[#f5f2ed] px-3.5 py-1.5 rounded-full border border-[#e5e0d8]">
            {stays.length} Verified Properties
          </span>
        </div>
      </div>

      {/* Grid of Nearby Hotels / Stays */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stays.map((stay) => (
          <div
            key={stay.id}
            className="group bg-white rounded-3xl border border-[#e5e0d8] p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div className="space-y-4">
              {/* Stay Image with Tag & Price */}
              <div className="relative h-52 rounded-2xl overflow-hidden bg-[#3a352f]">
                <img
                  src={getSafeHeritageImage(stay.image, 'landscape', stay.id)}
                  alt={stay.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  onError={(e) => handleImageError(e, 'landscape')}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <div className="absolute top-3 left-3 bg-[#E6BE8A] text-[#2d2a26] text-[10px] font-bold uppercase tracking-widest px-3 py-0.5 rounded-full shadow-xs">
                  {stay.type}
                </div>

                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/20">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{stay.rating}</span>
                  <span className="text-[10px] opacity-75 font-normal">({stay.reviewCount})</span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="text-lg font-serif font-bold text-white line-clamp-1">
                    {stay.name}
                  </h3>
                  <p className="text-[11px] text-[#E6BE8A] flex items-center gap-1 mt-0.5 truncate">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span>{stay.locationDistance}</span>
                  </p>
                </div>
              </div>

              {/* Heritage Highlight Badge */}
              <div className="p-3 rounded-2xl bg-[#f5f2ed] border border-[#e5e0d8] space-y-1">
                <div className="text-[10px] uppercase font-bold tracking-widest text-[#5A5A40] flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#5A5A40]" />
                  <span>Heritage Highlight</span>
                </div>
                <p className="text-xs text-[#2d2a26] line-clamp-2 leading-relaxed">
                  {stay.heritageHighlight}
                </p>
              </div>

              {/* Amenities Pills */}
              <div className="flex flex-wrap gap-1.5">
                {stay.amenities.slice(0, 3).map((amenity, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] bg-stone-100 text-stone-700 px-2.5 py-1 rounded-full border border-stone-200 font-medium"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

            {/* Price & Book Now Action */}
            <div className="pt-4 mt-4 border-t border-[#e5e0d8] flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-[#8a817c]">
                  Starting from
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-lg font-serif font-bold text-[#2d2a26]">
                    ₹{stay.pricePerNight.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[11px] text-[#8a817c]">/ night</span>
                  {stay.originalPrice && (
                    <span className="text-xs text-[#8a817c] line-through">
                      ₹{stay.originalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={() => handleOpenBookingModal(stay)}
                className="px-5 py-2.5 rounded-full bg-[#5A5A40] hover:bg-[#484833] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <span>Book Stay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* BOOKING MODAL */}
      {selectedStay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl border border-[#e5e0d8] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#e5e0d8] pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#5A5A40] bg-[#f5f2ed] px-3 py-0.5 rounded-full border border-[#e5e0d8]">
                  {selectedStay.type} • Direct Booking
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#2d2a26] mt-1">
                  {selectedStay.name}
                </h3>
                <p className="text-xs text-[#8a817c] flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#5A5A40]" />
                  <span>{selectedStay.locationDistance}</span>
                </p>
              </div>

              <button
                onClick={handleCloseModal}
                className="p-2 rounded-full hover:bg-[#f5f2ed] text-[#8a817c] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* If booking confirmed, show receipt confirmation */}
            {confirmedBooking ? (
              <div className="text-center py-6 space-y-5 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                
                <div className="space-y-1">
                  <h4 className="text-2xl font-serif font-bold text-[#2d2a26]">
                    Booking Confirmed!
                  </h4>
                  <p className="text-xs sm:text-sm text-[#8a817c]">
                    Your reservation has been received and confirmed with {confirmedBooking.stayName}.
                  </p>
                </div>

                {/* Booking Receipt Details */}
                <div className="bg-[#f5f2ed] rounded-2xl p-5 border border-[#e5e0d8] text-left space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-[#e5e0d8] pb-2">
                    <span className="font-bold text-[#8a817c] uppercase tracking-wider text-[10px]">
                      Booking Reference
                    </span>
                    <span className="font-mono font-bold text-sm text-[#5A5A40]">
                      {confirmedBooking.bookingRef}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[#8a817c] block text-[10px] uppercase">Guest Name</span>
                      <strong className="text-[#2d2a26]">{confirmedBooking.guestName}</strong>
                    </div>
                    <div>
                      <span className="text-[#8a817c] block text-[10px] uppercase">Room Selected</span>
                      <strong className="text-[#2d2a26]">{confirmedBooking.roomType}</strong>
                    </div>
                    <div>
                      <span className="text-[#8a817c] block text-[10px] uppercase">Check-In</span>
                      <strong className="text-[#2d2a26]">{confirmedBooking.checkInDate}</strong>
                    </div>
                    <div>
                      <span className="text-[#8a817c] block text-[10px] uppercase">Check-Out</span>
                      <strong className="text-[#2d2a26]">{confirmedBooking.checkOutDate} ({confirmedBooking.nights} Night{confirmedBooking.nights > 1 ? 's' : ''})</strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#e5e0d8] flex items-center justify-between text-sm">
                    <span className="font-bold text-[#2d2a26]">Total Amount ({confirmedBooking.paymentMethod === 'pay_at_hotel' ? 'Pay at Check-in' : 'Pre-paid'})</span>
                    <span className="font-serif font-bold text-lg text-[#5A5A40]">
                      ₹{confirmedBooking.finalTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-center gap-3">
                  <button
                    onClick={handleCloseModal}
                    className="px-6 py-3 rounded-full bg-[#5A5A40] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#484833] transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              /* Booking Form */
              <form onSubmit={handleConfirmBooking} className="space-y-6">
                
                {/* 1. Room Type Selection */}
                <div className="space-y-2.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#2d2a26] flex items-center gap-1.5">
                    <Hotel className="w-3.5 h-3.5 text-[#5A5A40]" />
                    <span>Select Room Category</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedStay.roomTypes.map((room, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedRoomIndex(idx)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                          selectedRoomIndex === idx
                            ? 'bg-amber-50/60 border-[#5A5A40] ring-2 ring-[#5A5A40]/20'
                            : 'bg-[#f5f2ed] border-[#e5e0d8] hover:border-[#5A5A40]/40'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <div className="text-sm font-serif font-bold text-[#2d2a26]">
                              {room.name}
                            </div>
                            <div className="text-[11px] text-[#8a817c]">
                              Capacity: {room.capacity}
                            </div>
                          </div>
                          {room.badge && (
                            <span className="text-[9px] uppercase font-bold bg-[#E6BE8A] text-[#2d2a26] px-2 py-0.5 rounded-full">
                              {room.badge}
                            </span>
                          )}
                        </div>
                        <div className="mt-2 text-xs font-bold text-[#5A5A40]">
                          ₹{room.price.toLocaleString('en-IN')} / night
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Dates & Guest Counts */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#2d2a26] block mb-1">
                      Check-In Date
                    </label>
                    <input
                      type="date"
                      min={today}
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#e5e0d8] bg-white focus:outline-hidden focus:border-[#5A5A40]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#2d2a26] block mb-1">
                      Check-Out Date
                    </label>
                    <input
                      type="date"
                      min={checkIn || today}
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      required
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#e5e0d8] bg-white focus:outline-hidden focus:border-[#5A5A40]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#2d2a26] block mb-1">
                      Guests
                    </label>
                    <select
                      value={guestsCount}
                      onChange={(e) => setGuestsCount(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#e5e0d8] bg-white focus:outline-hidden focus:border-[#5A5A40]"
                    >
                      <option value={1}>1 Guest</option>
                      <option value={2}>2 Guests</option>
                      <option value={3}>3 Guests</option>
                      <option value={4}>4 Guests</option>
                      <option value={5}>5+ Guests (Family)</option>
                    </select>
                  </div>
                </div>

                {/* 3. Guest Information */}
                <div className="space-y-3 pt-2 border-t border-[#e5e0d8]">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#2d2a26]">
                    Guest Details
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Full Name *"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#e5e0d8] bg-white focus:outline-hidden focus:border-[#5A5A40]"
                      />
                    </div>
                    <div>
                      <input
                        type="email"
                        placeholder="Email Address *"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#e5e0d8] bg-white focus:outline-hidden focus:border-[#5A5A40]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <input
                        type="tel"
                        placeholder="Phone Number (+91) *"
                        value={guestPhone}
                        onChange={(e) => setGuestPhone(e.target.value)}
                        required
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#e5e0d8] bg-white focus:outline-hidden focus:border-[#5A5A40]"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Special Requests (e.g. Early check-in, high floor)"
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#e5e0d8] bg-white focus:outline-hidden focus:border-[#5A5A40]"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Payment Preference Selection */}
                <div className="space-y-2 pt-2 border-t border-[#e5e0d8]">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#2d2a26]">
                    Payment Mode
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('pay_at_hotel')}
                      className={`p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                        paymentMethod === 'pay_at_hotel'
                          ? 'border-[#5A5A40] bg-amber-50 text-[#2d2a26] font-bold ring-1 ring-[#5A5A40]'
                          : 'border-[#e5e0d8] bg-white text-stone-700'
                      }`}
                    >
                      <div className="font-bold">Pay at Hotel</div>
                      <div className="text-[10px] text-[#8a817c]">No upfront payment</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi_instant')}
                      className={`p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                        paymentMethod === 'upi_instant'
                          ? 'border-[#5A5A40] bg-amber-50 text-[#2d2a26] font-bold ring-1 ring-[#5A5A40]'
                          : 'border-[#e5e0d8] bg-white text-stone-700'
                      }`}
                    >
                      <div className="font-bold">UPI / QR Code</div>
                      <div className="text-[10px] text-[#8a817c]">GPay, PhonePe, Paytm</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card_prepay')}
                      className={`p-3 rounded-xl border text-left text-xs font-medium transition-all ${
                        paymentMethod === 'card_prepay'
                          ? 'border-[#5A5A40] bg-amber-50 text-[#2d2a26] font-bold ring-1 ring-[#5A5A40]'
                          : 'border-[#e5e0d8] bg-white text-stone-700'
                      }`}
                    >
                      <div className="font-bold">Credit / Debit Card</div>
                      <div className="text-[10px] text-[#8a817c]">Visa, Mastercard, RuPay</div>
                    </button>
                  </div>
                </div>

                {/* 5. Pricing Summary Card */}
                <div className="p-4 rounded-2xl bg-[#f5f2ed] border border-[#e5e0d8] space-y-2 text-xs">
                  <div className="flex items-center justify-between text-[#8a817c]">
                    <span>₹{pricePerNight.toLocaleString('en-IN')} × {nights} Night{nights > 1 ? 's' : ''}</span>
                    <span>₹{baseTotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between text-[#8a817c]">
                    <span>Taxes & Heritage Service Fees (12% GST)</span>
                    <span>₹{taxesAndFees.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="pt-2 border-t border-[#e5e0d8] flex items-center justify-between font-bold text-[#2d2a26] text-sm">
                    <span>Total Amount Payable</span>
                    <span className="font-serif text-lg text-[#5A5A40]">
                      ₹{finalTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-5 py-3 rounded-full border border-[#e5e0d8] text-xs font-bold uppercase tracking-wider text-[#8a817c] hover:bg-[#f5f2ed] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 rounded-full bg-[#5A5A40] hover:bg-[#484833] text-white font-bold text-xs uppercase tracking-widest transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Confirming Reservation...</span>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-[#E6BE8A]" />
                        <span>Confirm & Reserve Room</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
