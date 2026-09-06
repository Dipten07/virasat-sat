import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInAnonymously, 
  fbSignOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile as fbUpdateProfile,
  User 
} from '../lib/firebase';
import { 
  UserProfile, 
  UserBookmark, 
  SavedItinerary, 
  VisitedPlace, 
  QuizHistoryRecord,
  TripMemory 
} from '../types';
import { 
  syncUserProfile, 
  subscribeUserProfile, 
  addBookmarkToFirestore, 
  removeBookmarkFromFirestore, 
  subscribeUserBookmarks,
  saveItineraryToFirestore,
  deleteItineraryFromFirestore,
  subscribeUserItineraries,
  markPlaceVisited,
  deleteVisitedPlace,
  subscribeVisitedPlaces,
  subscribeQuizHistory,
  saveTripMemoryToFirestore,
  deleteTripMemoryFromFirestore,
  subscribeUserTripMemories
} from '../services/firebaseService';

const DEFAULT_MEMORIES: TripMemory[] = [
  {
    id: 'mem-varanasi-sunrise',
    title: 'Dawn Rowboat on the Ganga & Dashashwamedh Bells',
    destination: 'Varanasi',
    cityId: 'varanasi',
    date: '2026-04-12',
    journalText: 'Woke at 5:00 AM while the mist still hovered over Assi Ghat. The ancient rowboat carved through emerald water as earthen diyas flickered against stone steps. The smell of burning sandalwood and the resonance of conch shells from morning aartis filled the crisp air.',
    culturalHighlights: ['Subah-e-Banaras Aarti at Assi Ghat', 'Hand-rowed wooden boat to Manikarnika', 'Banarasi Malaiyo & clay-pot chai'],
    sensoryImpressions: {
      taste: 'Warm saffron cardamom Malaiyo foam and ginger kulhad chai',
      sound: 'Deep brass bells echoing across the stone steps with morning chants',
      sight: 'Amber sunlight illuminating centuries-old marigold offerings on the river'
    },
    mood: 'Spiritual',
    photos: [
      'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=1000&q=80'
    ],
    tags: ['Ganga Aarti', 'Heritage Sunrise', 'Spiritual Awakening', 'Sacred Ghats'],
    isAiPolished: true,
    createdAt: '2026-04-12T08:30:00Z'
  },
  {
    id: 'mem-jaipur-amer-fort',
    title: 'Echoes of Royalty at Sheesh Mahal, Amer',
    destination: 'Jaipur',
    cityId: 'jaipur',
    monumentId: 'amer-fort',
    date: '2026-02-18',
    journalText: 'Stepped inside the Hall of Mirrors where concave Belgian glass reflections danced with every movement. Our guide lit a single matchstick, and the entire ceiling ignited like a constellation of stars in the night sky.',
    culturalHighlights: ['Sheesh Mahal concave mirror ceiling', 'Maota Lake reflection vantage point', 'Pyaaz Kachori at Rawat Mishtan Bhandar'],
    sensoryImpressions: {
      taste: 'Spicy crisp Pyaaz Kachori followed by sweet Ghewar drenched in rabdi',
      sound: 'Folk ravanahatha musicians playing Kesariya Balam outside the Sun Gate',
      sight: 'Amber yellow sandstone battlements climbing rugged Aravalli ridges'
    },
    mood: 'Awe-Inspired',
    photos: [
      'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1000&q=80'
    ],
    tags: ['Amer Fort', 'Rajput Architecture', 'Sheesh Mahal', 'Royal Rajasthan'],
    isAiPolished: true,
    createdAt: '2026-02-18T16:45:00Z'
  }
];

const LOCAL_STORAGE_KEYS = {
  BOOKMARKS: 'virasat_local_bookmarks',
  ITINERARIES: 'virasat_local_itineraries',
  VISITED: 'virasat_local_visited',
  MEMORIES: 'virasat_local_memories',
  QUIZ: 'virasat_quiz_history'
};

const getLocalItem = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn(`Error reading ${key} from localStorage:`, e);
  }
  return fallback;
};

const setLocalItem = <T,>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Error writing ${key} to localStorage:`, e);
  }
};

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isGuestMode: boolean;
  bookmarks: UserBookmark[];
  itineraries: SavedItinerary[];
  visitedPlaces: VisitedPlace[];
  quizHistory: QuizHistoryRecord[];
  memories: TripMemory[];
  loginWithGoogle: () => Promise<void>;
  loginAsGuest: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  toggleBookmark: (item: { itemType: 'festival' | 'monument' | 'city'; itemId: string; title: string; subtitle: string; imageUrl: string }) => Promise<boolean>;
  isBookmarked: (itemType: string, itemId: string) => boolean;
  addItinerary: (itinerary: SavedItinerary) => Promise<void>;
  saveItinerary: (itinerary: SavedItinerary) => Promise<void>;
  removeItinerary: (itineraryId: string) => Promise<void>;
  logVisitedPlace: (place: { itemId: string; itemType: 'monument' | 'festival' | 'city'; title: string; locationName: string; visitedDate: string; rating: number; personalNotes?: string }) => Promise<void>;
  removeVisitedPlace: (visitId: string) => Promise<void>;
  isPlaceVisited: (itemType: string, itemId: string) => boolean;
  saveMemory: (memory: TripMemory) => Promise<void>;
  deleteMemory: (memoryId: string) => Promise<void>;
  updateProfileDetails: (details: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuestMode, setIsGuestMode] = useState(false);

  const [bookmarks, setBookmarks] = useState<UserBookmark[]>(() => getLocalItem(LOCAL_STORAGE_KEYS.BOOKMARKS, []));
  const [itineraries, setItineraries] = useState<SavedItinerary[]>(() => getLocalItem(LOCAL_STORAGE_KEYS.ITINERARIES, []));
  const [visitedPlaces, setVisitedPlaces] = useState<VisitedPlace[]>(() => getLocalItem(LOCAL_STORAGE_KEYS.VISITED, []));
  const [quizHistory, setQuizHistory] = useState<QuizHistoryRecord[]>(() => getLocalItem(LOCAL_STORAGE_KEYS.QUIZ, []));
  const [memories, setMemories] = useState<TripMemory[]>(() => getLocalItem(LOCAL_STORAGE_KEYS.MEMORIES, DEFAULT_MEMORIES));

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        setIsGuestMode(false);
        // Sync profile to firestore
        try {
          await syncUserProfile({
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            isAnonymous: currentUser.isAnonymous
          });

          // Opportunistically migrate local bookmarks to cloud if any exist
          const localB = getLocalItem<UserBookmark[]>(LOCAL_STORAGE_KEYS.BOOKMARKS, []);
          if (localB.length > 0) {
            for (const b of localB) {
              try {
                await addBookmarkToFirestore(currentUser.uid, b);
              } catch {
                // non-blocking
              }
            }
          }

          // Opportunistically migrate local itineraries to cloud
          const localI = getLocalItem<SavedItinerary[]>(LOCAL_STORAGE_KEYS.ITINERARIES, []);
          if (localI.length > 0) {
            for (const it of localI) {
              try {
                await saveItineraryToFirestore(currentUser.uid, it);
              } catch {
                // non-blocking
              }
            }
          }

          // Opportunistically migrate local visited places
          const localV = getLocalItem<VisitedPlace[]>(LOCAL_STORAGE_KEYS.VISITED, []);
          if (localV.length > 0) {
            for (const vp of localV) {
              try {
                await markPlaceVisited(currentUser.uid, vp);
              } catch {
                // non-blocking
              }
            }
          }
        } catch (e) {
          console.warn('Could not sync user profile immediately:', e);
        }
      } else {
        setUserProfile(null);
        // Load local storage items
        setBookmarks(getLocalItem(LOCAL_STORAGE_KEYS.BOOKMARKS, []));
        setItineraries(getLocalItem(LOCAL_STORAGE_KEYS.ITINERARIES, []));
        setVisitedPlaces(getLocalItem(LOCAL_STORAGE_KEYS.VISITED, []));
        setQuizHistory(getLocalItem(LOCAL_STORAGE_KEYS.QUIZ, []));
        setMemories(getLocalItem(LOCAL_STORAGE_KEYS.MEMORIES, DEFAULT_MEMORIES));
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to user Firestore subcollections when user is logged in
  useEffect(() => {
    if (!user) return;

    const unsubProfile = subscribeUserProfile(user.uid, (p) => setUserProfile(p));
    const unsubBookmarks = subscribeUserBookmarks(user.uid, (b) => {
      setBookmarks(b);
      setLocalItem(LOCAL_STORAGE_KEYS.BOOKMARKS, b);
    });
    const unsubItineraries = subscribeUserItineraries(user.uid, (it) => {
      setItineraries(it);
      setLocalItem(LOCAL_STORAGE_KEYS.ITINERARIES, it);
    });
    const unsubVisited = subscribeVisitedPlaces(user.uid, (vp) => {
      setVisitedPlaces(vp);
      setLocalItem(LOCAL_STORAGE_KEYS.VISITED, vp);
    });
    const unsubQuiz = subscribeQuizHistory(user.uid, (qh) => {
      setQuizHistory(qh);
      setLocalItem(LOCAL_STORAGE_KEYS.QUIZ, qh);
    });
    const unsubMemories = subscribeUserTripMemories(user.uid, (mList) => {
      if (mList && mList.length > 0) {
        setMemories(mList);
        setLocalItem(LOCAL_STORAGE_KEYS.MEMORIES, mList);
      }
    });

    return () => {
      unsubProfile();
      unsubBookmarks();
      unsubItineraries();
      unsubVisited();
      unsubQuiz();
      unsubMemories();
    };
  }, [user]);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      throw err;
    }
  };

  const loginAsGuest = async () => {
    try {
      // Try anonymous auth if enabled; if restricted, fallback to local guest session seamlessly
      await signInAnonymously(auth);
    } catch (err: any) {
      console.warn('Anonymous auth not enabled in Firebase; running in local Guest Mode:', err?.message || err);
      setIsGuestMode(true);
      setUserProfile({
        uid: 'guest_local_user',
        email: null,
        displayName: 'Heritage Guest Explorer',
        photoURL: null,
        isAnonymous: true,
        homeCity: 'New Delhi',
        favoriteRegion: 'All India',
        bio: 'Exploring India in guest mode'
      });
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: any) {
      if (err?.code === 'auth/admin-restricted-operation' || err?.message?.includes('admin-restricted-operation')) {
        throw new Error('Email/Password provider is not configured. Please use "Continue with Google" for instant one-click sign in.');
      }
      throw err;
    }
  };

  const signupWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (cred.user) {
        await fbUpdateProfile(cred.user, { displayName: name });
        await syncUserProfile({
          uid: cred.user.uid,
          email: cred.user.email,
          displayName: name,
          photoURL: null,
          isAnonymous: false
        });
      }
    } catch (err: any) {
      if (err?.code === 'auth/admin-restricted-operation' || err?.message?.includes('admin-restricted-operation')) {
        throw new Error('Email registration is not configured on this Firebase project. Please use "Continue with Google" for instant one-click sign in.');
      }
      throw err;
    }
  };

  const logout = async () => {
    try {
      if (auth.currentUser) {
        await fbSignOut(auth);
      }
    } catch (e) {
      console.warn('Sign out warning:', e);
    }
    setIsGuestMode(false);
    setUserProfile(null);
    setUser(null);
  };

  const bookmarkMap = useMemo(() => {
    const set = new Set<string>();
    bookmarks.forEach(b => set.add(`${b.itemType}_${b.itemId}`));
    return set;
  }, [bookmarks]);

  const isBookmarked = (itemType: string, itemId: string) => {
    return bookmarkMap.has(`${itemType}_${itemId}`);
  };

  const toggleBookmark = async (item: { itemType: 'festival' | 'monument' | 'city'; itemId: string; title: string; subtitle: string; imageUrl: string }) => {
    const key = `${item.itemType}_${item.itemId}`;
    const alreadySaved = bookmarkMap.has(key);

    if (alreadySaved) {
      const updated = bookmarks.filter(b => !(b.itemType === item.itemType && b.itemId === item.itemId));
      setBookmarks(updated);
      setLocalItem(LOCAL_STORAGE_KEYS.BOOKMARKS, updated);
      if (user) {
        try {
          await removeBookmarkFromFirestore(user.uid, key);
        } catch (e) {
          console.warn('Could not remove bookmark from Firestore:', e);
        }
      }
      return false;
    } else {
      const newBookmark: UserBookmark = {
        id: key,
        itemType: item.itemType,
        itemId: item.itemId,
        title: item.title,
        subtitle: item.subtitle,
        imageUrl: item.imageUrl,
        savedAt: new Date().toISOString()
      };
      const updated = [newBookmark, ...bookmarks];
      setBookmarks(updated);
      setLocalItem(LOCAL_STORAGE_KEYS.BOOKMARKS, updated);
      if (user) {
        try {
          await addBookmarkToFirestore(user.uid, newBookmark);
        } catch (e) {
          console.warn('Could not sync bookmark to Firestore:', e);
        }
      }
      return true;
    }
  };

  const addItinerary = async (itinerary: SavedItinerary) => {
    const updated = [itinerary, ...itineraries.filter(it => it.id !== itinerary.id)];
    setItineraries(updated);
    setLocalItem(LOCAL_STORAGE_KEYS.ITINERARIES, updated);
    if (user) {
      try {
        await saveItineraryToFirestore(user.uid, itinerary);
      } catch (e) {
        console.warn('Could not sync itinerary to Firestore:', e);
      }
    }
  };

  const removeItinerary = async (itineraryId: string) => {
    const updated = itineraries.filter(it => it.id !== itineraryId);
    setItineraries(updated);
    setLocalItem(LOCAL_STORAGE_KEYS.ITINERARIES, updated);
    if (user) {
      try {
        await deleteItineraryFromFirestore(user.uid, itineraryId);
      } catch (e) {
        console.warn('Could not delete itinerary from Firestore:', e);
      }
    }
  };

  const visitedMap = useMemo(() => {
    const set = new Set<string>();
    visitedPlaces.forEach(v => set.add(`${v.itemType}_${v.itemId}`));
    return set;
  }, [visitedPlaces]);

  const isPlaceVisited = (itemType: string, itemId: string) => {
    return visitedMap.has(`${itemType}_${itemId}`);
  };

  const logVisitedPlace = async (place: { itemId: string; itemType: 'monument' | 'festival' | 'city'; title: string; locationName: string; visitedDate: string; rating: number; personalNotes?: string }) => {
    const visitId = `${place.itemType}_${place.itemId}`;
    const newVisit: VisitedPlace = {
      id: visitId,
      ...place,
      createdAt: new Date().toISOString()
    };
    const updated = [newVisit, ...visitedPlaces.filter(v => v.id !== visitId)];
    setVisitedPlaces(updated);
    setLocalItem(LOCAL_STORAGE_KEYS.VISITED, updated);
    if (user) {
      try {
        await markPlaceVisited(user.uid, newVisit);
      } catch (e) {
        console.warn('Could not sync visited place to Firestore:', e);
      }
    }
  };

  const removeVisitedPlace = async (visitId: string) => {
    const updated = visitedPlaces.filter(v => v.id !== visitId);
    setVisitedPlaces(updated);
    setLocalItem(LOCAL_STORAGE_KEYS.VISITED, updated);
    if (user) {
      try {
        await deleteVisitedPlace(user.uid, visitId);
      } catch (e) {
        console.warn('Could not delete visited place from Firestore:', e);
      }
    }
  };

  const saveItinerary = addItinerary;

  const saveMemory = async (memory: TripMemory) => {
    const updated = [memory, ...memories.filter((m) => m.id !== memory.id)];
    setMemories(updated);
    setLocalItem(LOCAL_STORAGE_KEYS.MEMORIES, updated);

    if (user) {
      try {
        await saveTripMemoryToFirestore(user.uid, memory);
      } catch (e) {
        console.warn('Saved memory locally; firestore sync error:', e);
      }
    }
  };

  const deleteMemory = async (memoryId: string) => {
    const updated = memories.filter((m) => m.id !== memoryId);
    setMemories(updated);
    setLocalItem(LOCAL_STORAGE_KEYS.MEMORIES, updated);

    if (user) {
      try {
        await deleteTripMemoryFromFirestore(user.uid, memoryId);
      } catch (e) {
        console.warn('Deleted memory locally; firestore deletion error:', e);
      }
    }
  };

  const updateProfileDetails = async (details: Partial<UserProfile>) => {
    if (user) {
      await syncUserProfile(user, details);
    } else {
      setUserProfile((prev) => prev ? { ...prev, ...details } : null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        bookmarks,
        itineraries,
        visitedPlaces,
        quizHistory,
        memories,
        loginWithGoogle,
        loginAsGuest,
        loginWithEmail,
        signupWithEmail,
        logout,
        toggleBookmark,
        isBookmarked,
        addItinerary,
        saveItinerary,
        removeItinerary,
        logVisitedPlace,
        removeVisitedPlace,
        isPlaceVisited,
        saveMemory,
        deleteMemory,
        updateProfileDetails
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
