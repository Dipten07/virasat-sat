export interface NearbyStay {
  id: string;
  name: string;
  type: 'Heritage Palace' | 'Haveli Boutique' | 'Riverside Ashram' | 'Luxury Resort' | 'Comfort Hotel' | 'Homestay';
  cityId: string;
  cityName: string;
  pricePerNight: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  locationDistance: string;
  image: string;
  description: string;
  amenities: string[];
  heritageHighlight: string;
  roomTypes: {
    name: string;
    price: number;
    capacity: string;
    badge?: string;
  }[];
}

export interface HotelBooking {
  id: string;
  userId?: string;
  stayId: string;
  stayName: string;
  cityName: string;
  stayType: string;
  stayImage: string;
  roomType: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  guestsCount: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  specialRequests?: string;
  pricePerNight: number;
  totalAmount: number;
  taxesAndFees: number;
  finalTotal: number;
  paymentMethod: 'pay_at_hotel' | 'upi_instant' | 'card_prepay';
  status: 'Confirmed' | 'Completed' | 'Cancelled';
  bookingRef: string;
  createdAt: string;
}

export const NEARBY_STAYS_DATA: Record<string, NearbyStay[]> = {
  varanasi: [
    {
      id: 'stay-brijrama-palace',
      name: 'BrijRama Palace - Heritage Grand on Darbhanga Ghat',
      type: 'Heritage Palace',
      cityId: 'varanasi',
      cityName: 'Varanasi',
      pricePerNight: 16500,
      originalPrice: 19500,
      rating: 4.9,
      reviewCount: 382,
      locationDistance: 'Directly on Darbhanga Ghat (Private Bajra Boat Access)',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      description: 'One of the oldest structures in Varanasi, built in 1812 by the royal house of Nagpur with Maratha stone architecture, classical Shehnai recitals, and private sunrise boat rides.',
      amenities: ['Private Ghat Access', 'Pure Vegetarian Royal Dining', 'Rooftop Yoga & Meditation', 'Classical Sitar Evenings', 'Riverview Balcony'],
      heritageHighlight: '210+ years old Maratha palace with working royal wooden elevator installed in 1918',
      roomTypes: [
        { name: 'Maharaja Riverview Suite', price: 24500, capacity: '2 Adults, 1 Child', badge: 'Riverfront' },
        { name: 'Kashi Heritage Deluxe Room', price: 16500, capacity: '2 Adults', badge: 'Popular' },
        { name: 'Varuna Classic Room', price: 13500, capacity: '2 Adults' }
      ]
    },
    {
      id: 'stay-taj-ganges',
      name: 'Taj Ganges Varanasi & Nadesar Palace',
      type: 'Luxury Resort',
      cityId: 'varanasi',
      cityName: 'Varanasi',
      pricePerNight: 11200,
      originalPrice: 13500,
      rating: 4.8,
      reviewCount: 520,
      locationDistance: '4.5 km from Dashashwamedh Ghat (Cantonment)',
      image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
      description: 'Set amidst 40 acres of lush orchards once favored by the Maharaja of Benares and Queen Elizabeth II, featuring serene peacock gardens and authentic Varuna dining.',
      amenities: ['40-Acre Mango Orchards', 'Jiva Ayurvedic Spa', 'Outdoor Swimming Pool', 'Banarasi Silk Boutique', 'Complimentary City Shuttle'],
      heritageHighlight: 'Historic royal carriage rides and heritage tree walks within the royal grounds',
      roomTypes: [
        { name: 'Superior Garden View Room', price: 11200, capacity: '2 Adults' },
        { name: 'Executive Suite with Lawn Access', price: 18500, capacity: '2 Adults, 2 Children', badge: 'Spacious' }
      ]
    },
    {
      id: 'stay-amritara-suryauday',
      name: 'Amritara Suryauday Haveli',
      type: 'Haveli Boutique',
      cityId: 'varanasi',
      cityName: 'Varanasi',
      pricePerNight: 7800,
      originalPrice: 9200,
      rating: 4.7,
      reviewCount: 295,
      locationDistance: 'Shivala Ghat (15 min boat ride to main temple)',
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
      description: 'Built in the early 20th century by the Royal Family of Nepal as an elderly retreat, lovingly restored into an intimate riverside haveli with morning terrace aarti views.',
      amenities: ['Rooftop Sunrise Pavilion', 'Library & Reading Nook', 'Authentic Banarasi Breakfast', 'Temple Escort Service'],
      heritageHighlight: 'Built by the Rana dynasty of Nepal featuring traditional wood carvings and central courtyard',
      roomTypes: [
        { name: 'Ganga View Room', price: 9500, capacity: '2 Adults', badge: 'River View' },
        { name: 'Haveli Courtyard Room', price: 7800, capacity: '2 Adults' }
      ]
    },
    {
      id: 'stay-stops-hostel',
      name: 'Zostel & Heritage Backpackers Varanasi',
      type: 'Comfort Hotel',
      cityId: 'varanasi',
      cityName: 'Varanasi',
      pricePerNight: 2200,
      originalPrice: 2800,
      rating: 4.6,
      reviewCount: 410,
      locationDistance: '700m from Assi Ghat',
      image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
      description: 'Vibrant cultural retreat popular with backpackers, artists, and culture seekers featuring chai sessions on the roof, walking tours, and cozy AC rooms.',
      amenities: ['Rooftop Cafe', 'High-Speed Wi-Fi', 'Free Heritage Walking Tours', 'Bicycle Rentals', '24/7 Security'],
      heritageHighlight: 'Decorated with original folk art murals created by local Banaras Hindu University artisans',
      roomTypes: [
        { name: 'Private Deluxe Double Room', price: 2200, capacity: '2 Adults' },
        { name: 'Superior AC Family Studio', price: 3400, capacity: '3 Adults' }
      ]
    }
  ],
  jaipur: [
    {
      id: 'stay-rambagh-palace',
      name: 'Taj Rambagh Palace - The Jewel of Jaipur',
      type: 'Heritage Palace',
      cityId: 'jaipur',
      cityName: 'Jaipur',
      pricePerNight: 32000,
      originalPrice: 38000,
      rating: 5.0,
      reviewCount: 680,
      locationDistance: 'Bhawani Singh Road (10 min to City Palace)',
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
      description: 'Former residence of the Maharaja of Jaipur, ranked among the finest hotels in the world. Exquisite marble jalis, sprawling Mughal gardens, and royal polo lounge.',
      amenities: ['Royal Butler Service', 'Peacock Gardens', 'Indoor & Outdoor Heated Pools', 'Suvarna Mahal Fine Dining', 'Vintage Car Airport Transfers'],
      heritageHighlight: 'Authentic 1835 royal palace where Maharani Gayatri Devi resided',
      roomTypes: [
        { name: 'Palace Room with Garden View', price: 32000, capacity: '2 Adults', badge: 'Royal' },
        { name: 'Historical Suite (Maharani Suite)', price: 65000, capacity: '2 Adults, 2 Children' }
      ]
    },
    {
      id: 'stay-samode-haveli',
      name: 'Samode Haveli - 175-Year-Old Urban Sanctuary',
      type: 'Haveli Boutique',
      cityId: 'jaipur',
      cityName: 'Jaipur',
      pricePerNight: 12800,
      originalPrice: 15000,
      rating: 4.8,
      reviewCount: 340,
      locationDistance: 'Inside Walled Old City (Gangapole Gate)',
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
      description: 'Tucked away in the historic walled city, this former townhouse of the Rawals of Samode features painted murals, tranquil fountain courtyards, and a Moorish swimming pool.',
      amenities: ['Moorish Courtyard Pool', 'Sheesh Mahal Dining Room', 'Traditional Ayurvedic Spa', 'Cooking Demonstrations with Royal Chefs'],
      heritageHighlight: 'Intricate 19th-century fresco art and hand-painted miniature motifs across all corridors',
      roomTypes: [
        { name: 'Deluxe Haveli Room', price: 12800, capacity: '2 Adults', badge: 'Best Seller' },
        { name: 'Haveli Suite with Private Terrace', price: 19500, capacity: '2 Adults' }
      ]
    },
    {
      id: 'stay-albert-resort',
      name: 'Shahpura Haveli & Heritage Retreat',
      type: 'Haveli Boutique',
      cityId: 'jaipur',
      cityName: 'Jaipur',
      pricePerNight: 5500,
      originalPrice: 7000,
      rating: 4.7,
      reviewCount: 220,
      locationDistance: 'Bani Park (3 km to Hawa Mahal)',
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
      description: 'Eco-conscious heritage mansion with Rajasthani jharokhas, brass antique furnishings, and evening folk puppet & Ghoomar dance shows for guests.',
      amenities: ['Rooftop Pool with Amber Views', 'Organic Royal Kitchen', 'Free Wi-Fi', 'Heritage Village Tour'],
      heritageHighlight: '300-year-old royal family residence adorned with gold-leaf work and antique family portraits',
      roomTypes: [
        { name: 'Royal Heritage Deluxe', price: 5500, capacity: '2 Adults' },
        { name: 'Shahpura Suite with Jharokha', price: 8200, capacity: '2 Adults, 1 Child' }
      ]
    }
  ],
  agra: [
    {
      id: 'stay-oberoi-amarvilas',
      name: 'The Oberoi Amarvilas - Uninterrupted Taj Views',
      type: 'Luxury Resort',
      cityId: 'agra',
      cityName: 'Agra',
      pricePerNight: 28000,
      originalPrice: 34000,
      rating: 5.0,
      reviewCount: 710,
      locationDistance: '600 meters from Taj Mahal (Private Golf Cart Access)',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      description: 'Every single room, suite, lobby, and restaurant offers completely unobstructed views of the iconic Taj Mahal. Inspired by Moorish and Mughal architecture with terraced lawns and reflecting pools.',
      amenities: ['Direct View of Taj Mahal from Every Room', 'Private Golf Cart to Taj East Gate', 'Mughal Courtyard Spa', 'Fine Dining Bellevue & Esphahan'],
      heritageHighlight: 'Crafted with white marble pillars, gold leaf domes, and hand-woven Persian silks',
      roomTypes: [
        { name: 'Premier Room with Taj View', price: 28000, capacity: '2 Adults', badge: 'Taj View' },
        { name: 'Deluxe Suite with Private Balcony', price: 52000, capacity: '2 Adults' }
      ]
    },
    {
      id: 'stay-itc-mughal',
      name: 'ITC Mughal - A Luxury Collection Resort',
      type: 'Luxury Resort',
      cityId: 'agra',
      cityName: 'Agra',
      pricePerNight: 8500,
      originalPrice: 11000,
      rating: 4.7,
      reviewCount: 640,
      locationDistance: 'Fatehabad Road (3 km from Taj Mahal)',
      image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
      description: 'Winner of the prestigious Aga Khan Award for Architecture, spread over 35 acres of Mughal gardens with Kaya Kalp, one of India’s largest royal spa complexes.',
      amenities: ['35-Acre Mughal Gardens', 'Kaya Kalp Royal Spa (99,000 sq ft)', 'Peshawri North-West Frontier Dining', '2 Swimming Pools'],
      heritageHighlight: 'Architectural homage to Fatehpur Sikri and red sandstone Mughal geometry',
      roomTypes: [
        { name: 'Mughal Chamber King', price: 8500, capacity: '2 Adults' },
        { name: 'Royal Garden Suite', price: 14500, capacity: '2 Adults, 2 Children' }
      ]
    },
    {
      id: 'stay-tājview-agra',
      name: 'Tajview - IHCL SeleQtions Agra',
      type: 'Comfort Hotel',
      cityId: 'agra',
      cityName: 'Agra',
      pricePerNight: 4600,
      originalPrice: 5800,
      rating: 4.6,
      reviewCount: 310,
      locationDistance: '2.5 km from Taj Mahal',
      image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=800&q=80',
      description: 'Contemporary comfort with warm hospitality, offering rooftop dinner tables overlooking the marble dome of Taj Mahal illuminated under the stars.',
      amenities: ['Sky Deck Taj View Restaurant', 'Outdoor Swimming Pool', 'Fitness Center', 'Travel Concierge'],
      heritageHighlight: 'Rooftop sundowners with live Santoor accompaniment and mughlai delicacies',
      roomTypes: [
        { name: 'Superior Room', price: 4600, capacity: '2 Adults' },
        { name: 'Executive Taj View Room', price: 6800, capacity: '2 Adults', badge: 'Taj View' }
      ]
    }
  ],
  udaipur: [
    {
      id: 'stay-taj-lake-palace',
      name: 'Taj Lake Palace - 18th-Century Floating Wonder',
      type: 'Heritage Palace',
      cityId: 'udaipur',
      cityName: 'Udaipur',
      pricePerNight: 36000,
      originalPrice: 42000,
      rating: 5.0,
      reviewCount: 820,
      locationDistance: 'Island in Lake Pichola (Accessible by private motorboat)',
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
      description: 'Built between 1743 and 1746 by Maharana Jagat Singh II as a pleasure palace, floating like a white marble jewel on Lake Pichola with Mewari royal hospitality.',
      amenities: ['Private Lake Boat Transfers', 'Jharokha Private Dining', 'Jiva Spa Boat with Jacuzzi', 'Royal Astrologer & Palm Reader'],
      heritageHighlight: 'World-famous marble floating palace featured in global cinema and royal histories',
      roomTypes: [
        { name: 'Luxury Garden View Room', price: 36000, capacity: '2 Adults', badge: 'Iconic' },
        { name: 'Grand Royal Lakefront Suite', price: 75000, capacity: '2 Adults' }
      ]
    },
    {
      id: 'stay-fateh-garh',
      name: 'Fateh Garh Heritage Sanctuary',
      type: 'Heritage Palace',
      cityId: 'udaipur',
      cityName: 'Udaipur',
      pricePerNight: 9500,
      originalPrice: 12000,
      rating: 4.8,
      reviewCount: 380,
      locationDistance: 'Perched on Sisarma Hill overlooking Udaipur Valley',
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
      description: 'Pioneering relocated heritage palace following ancient Vastu principles with vintage car collection, infinity pool perched over the valley, and sunset terrace dining.',
      amenities: ['Vintage Automobile Museum', 'Hilltop Infinity Pool', 'Horseback Riding Trails', 'Sunset Rooftop Barbecue'],
      heritageHighlight: 'Carefully relocated stone by stone from ancient Mewar ruins using traditional craftsmanship',
      roomTypes: [
        { name: 'Renaissance Heritage Room', price: 9500, capacity: '2 Adults' },
        { name: 'Palace Suite with Lake & Hill View', price: 15500, capacity: '2 Adults, 1 Child' }
      ]
    }
  ]
};

// Generic fallback stay generator for any destination in the app
export function getStaysForDestination(cityId: string, cityName: string): NearbyStay[] {
  if (NEARBY_STAYS_DATA[cityId]) {
    return NEARBY_STAYS_DATA[cityId];
  }

  // Fallback dynamic generator with realistic localized data
  return [
    {
      id: `stay-${cityId}-grand-heritage`,
      name: `${cityName} Heritage Haveli & Palace Stay`,
      type: 'Heritage Palace',
      cityId,
      cityName,
      pricePerNight: 8500,
      originalPrice: 10500,
      rating: 4.8,
      reviewCount: 240,
      locationDistance: `Central Historic Quarter, ${cityName}`,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
      description: `Immerse yourself in authentic regional culture with heritage archways, courtyard folk music performances, and traditional cuisine prepared with ancestral recipes in ${cityName}.`,
      amenities: ['Courtyard Garden', 'Authentic Regional Dining', 'Complimentary Heritage Walking Tour', 'Free Wi-Fi', '24/7 Travel Desk'],
      heritageHighlight: 'Restored royal architecture showcasing authentic regional stone carvings and traditional courtyards',
      roomTypes: [
        { name: 'Deluxe Heritage Room', price: 8500, capacity: '2 Adults', badge: 'Popular' },
        { name: 'Royal Courtyard Suite', price: 13500, capacity: '2 Adults, 1 Child' }
      ]
    },
    {
      id: `stay-${cityId}-boutique-resort`,
      name: `${cityName} Royal Comfort Resort & Spa`,
      type: 'Luxury Resort',
      cityId,
      cityName,
      pricePerNight: 5200,
      originalPrice: 6500,
      rating: 4.7,
      reviewCount: 190,
      locationDistance: `Near Key Monuments & Temples in ${cityName}`,
      image: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
      description: `Relax in comfort after exploring the ancient sites of ${cityName}. Featuring modern amenities, outdoor swimming pool, and curated travel desk for seamless monument visits.`,
      amenities: ['Swimming Pool', 'Multi-Cuisine Restaurant', 'Air Conditioning', 'Airport/Station Transfers', 'Ayurvedic Massage'],
      heritageHighlight: 'Centrally located with direct travel assistance to all UNESCO landmarks and bazaars',
      roomTypes: [
        { name: 'Superior King Room', price: 5200, capacity: '2 Adults' },
        { name: 'Family Deluxe Suite', price: 7900, capacity: '3 Adults' }
      ]
    },
    {
      id: `stay-${cityId}-homestay-inn`,
      name: `${cityName} Cultural Homestay & Guest House`,
      type: 'Homestay',
      cityId,
      cityName,
      pricePerNight: 2400,
      originalPrice: 3000,
      rating: 4.6,
      reviewCount: 155,
      locationDistance: `Walking distance to local markets, ${cityName}`,
      image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
      description: `Experience heartfelt hospitality and home-cooked regional thalis with local family hosts who have lived in ${cityName} for generations.`,
      amenities: ['Home-Cooked Breakfast', 'Free Wi-Fi', 'Local Host Guidance', 'Hot Water 24/7', 'Luggage Storage'],
      heritageHighlight: 'Personalized local storytelling, cooking demonstrations, and artisan recommendations',
      roomTypes: [
        { name: 'Standard Double Room', price: 2400, capacity: '2 Adults' },
        { name: 'Deluxe AC Room', price: 3200, capacity: '2 Adults' }
      ]
    }
  ];
}
