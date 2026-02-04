import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'sui-hackathon-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'sui-hackathon.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'sui-hackathon',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'sui-hackathon.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:sui-hackathon',
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const functions = getFunctions(app)

// Connect to emulators in development mode
const useEmulators = import.meta.env.DEV || import.meta.env.VITE_USE_EMULATORS === 'true'

if (useEmulators) {
  // Only connect once
  if (!(auth as any)._delegate._config?.emulator) {
    connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
  }
  
  if (!(db as any)._delegate._settings?.host?.includes('localhost')) {
    connectFirestoreEmulator(db, 'localhost', 8080)
  }
  
  if (!(functions as any)._delegate._url?.includes('localhost')) {
    connectFunctionsEmulator(functions, 'localhost', 5001)
  }
  
  console.log('🔥 Firebase Emulators connected!')
  console.log('  - Auth: http://localhost:9099')
  console.log('  - Firestore: localhost:8080')
  console.log('  - Functions: localhost:5001')
}

export default app
