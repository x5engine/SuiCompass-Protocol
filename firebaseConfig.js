// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { 
    initializeFirestore, 
    connectFirestoreEmulator, 
    CACHE_SIZE_UNLIMITED 
} from 'firebase/firestore'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getStorage, connectStorageEmulator } from 'firebase/storage'

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics ONLY in production
if (!import.meta.env.DEV) {
  getAnalytics(app);
}

// Initialize Services with specific settings
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
    cacheSizeBytes: CACHE_SIZE_UNLIMITED,
    experimentalForceLongPolling: true, 
});
export const storage = getStorage(app);

// Connect to emulators in development
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('🔥 [firebaseConfig.js] Connecting to Local Emulators (127.0.0.1)...');
    try {
        connectFirestoreEmulator(db, '127.0.0.1', 8090);
        connectAuthEmulator(auth, "http://127.0.0.1:9099");
        connectStorageEmulator(storage, '127.0.0.1', 9199);
    } catch (e) {
        console.warn('[firebaseConfig.js] Emulator connection error (already connected?):', e);
    }
} else {
    console.log('🔥 [firebaseConfig.js] Connecting to Production Firebase...');
}

export default app;
