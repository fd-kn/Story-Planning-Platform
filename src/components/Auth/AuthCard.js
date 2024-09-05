// src/components/AuthCard.js
import React, { useState } from 'react';
import { auth, db, googleProvider } from '../../firebaseconfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';

const AuthCard = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSignUp, setIsSignUp] = useState(true);
  const navigate = useNavigate();

  const checkUsername = async (uid) => {
    try {
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists() && userDoc.data().username) {
        // Username exists
        return true;
      } else {
        // Username does not exist
        return false;
      }
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError(null);

    try {
        let userCredential = '';
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('User signed up:', userCredential.user);
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('User logged in:', userCredential.user);
      }
      const uid = userCredential.user.uid;
      const hasUsername = await checkUsername(uid);

      if (hasUsername) {
        navigate('/homepage');
      } else {
        navigate('/setup-username');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log('User logged in with Google:', result.user);
      const uid = result.user.uid;
      const hasUsername = await checkUsername(uid);

      if (hasUsername) {
        navigate('/homepage');
      } else {
        navigate('/setup-username');
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isSignUp ? 'Sign Up' : 'Login'}
        </h2>
        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-md"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
          >
            {isSignUp ? 'Sign Up' : 'Login'}
          </button>
        </form>
        <div className="mt-4 flex justify-between">
          <button
            onClick={handleGoogleAuth}
            className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition"
          >
            Continue with Google
          </button>
        </div>
        <div className="mt-4 text-center">
          <p>
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <span
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-500 cursor-pointer"
            >
              {isSignUp ? 'Login' : 'Sign Up'}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthCard;
