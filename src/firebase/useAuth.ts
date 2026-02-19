import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInAnonymously, User } from 'firebase/auth';
import { auth } from '../../firebaseConfig.js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!mounted) return;
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        // If no user, try sign in anonymously
        signInAnonymously(auth).catch((error) => {
          console.error("Anonymous sign-in failed:", error);
          if (mounted) {
              // FALLBACK: Create a fake local user object so the app thinks we are logged in
              // This allows the UI to render while using local storage for data
              const mockUser = {
                  uid: 'local-user-' + Math.random().toString(36).substr(2, 9),
                  isAnonymous: true,
                  displayName: 'Guest',
                  email: null,
                  // Add other necessary User properties as mocks if needed
              } as unknown as User;
              
              setUser(mockUser);
              setIsOffline(true);
              setLoading(false);
          }
        });
      }
    });

    return () => {
        mounted = false;
        unsubscribe();
    };
  }, []);

  return { user, loading, isOffline };
}