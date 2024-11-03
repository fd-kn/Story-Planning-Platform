// src/hooks/useAuth.js
import { useEffect, useState } from 'react';
import { auth } from '../firebaseconfig';
import { onAuthStateChanged } from 'firebase/auth';

const useAuth = () => {
  const [authState, setAuthState] = useState({ user: null, loading: true });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthState({ user: user ? { ...user } : null, loading: false });
    });
    return () => unsubscribe();
  }, []);

  return authState;
};

export default useAuth;
