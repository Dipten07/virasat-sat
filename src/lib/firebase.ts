import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInAnonymously, 
  signOut as fbSignOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  User
} from 'firebase/auth';
import { 
  initializeFirestore,
  Firestore
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App instance
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Authentication
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Cloud Firestore with long polling enabled to prevent backend stream timeouts in container/iframe environments
export const db: Firestore = initializeFirestore(
  app,
  {
    experimentalForceLongPolling: true
  },
  firebaseConfig.firestoreDatabaseId || undefined
);

export { 
  signInWithPopup, 
  signInAnonymously, 
  fbSignOut, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile 
};
export type { User };
export default app;
