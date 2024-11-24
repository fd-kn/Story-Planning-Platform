// src/components/Auth/AuthCard.js
import React, { useState } from 'react';
import { auth, db, googleProvider } from '../../firebaseconfig';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'; // Import ArrowLeftIcon

const AuthCard = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // New state for confirmation password
  const [error, setError] = useState(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const errorMessages = {
    'auth/email-already-in-use': 'This email is already in use. Please use a different email.',
    'auth/invalid-credential': 'Your email or password is incorrect.',
    'auth/user-not-found': 'No account found with this email. Please sign up.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/weak-password': 'Password should be at least 6 characters long.',
    'auth/operation-not-allowed': 'This operation is not allowed. Please contact support.',
    'auth/popup-closed-by-user': 'The popup was closed before completing the sign-in.',
  };

  const checkUsername = async (uid) => {
    try {
      const userRef = doc(db, 'users', uid);
      const userDoc = await getDoc(userRef);
      return userDoc.exists() && userDoc.data().username;
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match. Please try again.');
      setIsLoading(false);
      return;
    }

    try {
      const authFunction = isSignUp ? createUserWithEmailAndPassword : signInWithEmailAndPassword;
      const userCredential = await authFunction(auth, email, password);
      const uid = userCredential.user.uid;
      const hasUsername = await checkUsername(uid);

      navigate(hasUsername ? '/homepage' : '/setup-username');
    } catch (error) {
      setError(errorMessages[error.code] || `An unexpected error occurred. Please try again. ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setIsLoading(true);

    const timeoutId = setTimeout(() => {
      setIsLoading(false);
      setError('Sign-in process was interrupted. Please try again.');
    }, 3000); 

    try {
      const result = await signInWithPopup(auth, googleProvider);
      clearTimeout(timeoutId); 
      const uid = result.user.uid;
      const hasUsername = await checkUsername(uid);

      navigate(hasUsername ? '/homepage' : '/setup-username');
    } catch (error) {
      clearTimeout(timeoutId); 
      setError(errorMessages[error.code] || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-purple-100 to-indigo-100 relative overflow-hidden py-10">
      {/* Background circles */}
      <div className="absolute -top-20 -left-20 w-80 h-80 bg-white rounded-full opacity-40 circle"></div>
      <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-white rounded-full opacity-40 circle"></div>
      <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full opacity-30 circle"></div>
      <div className="absolute top-40 right-20 w-64 h-64 bg-white rounded-full opacity-30 circle"></div>
      <div className="absolute -top-10 right-40 w-48 h-48 bg-white rounded-full opacity-20 circle"></div>
      <div className="absolute bottom-20 left-20 w-56 h-56 bg-white rounded-full opacity-30 circle"></div>

      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md z-10">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')} 
          className=" top-4 left-4 text-gray-600 hover:text-indigo-600 transition duration-300"
        >
          <ArrowLeftIcon className="w-6 h-6" /> 
        </button>

        <h2 className="text-3xl font-bold mb-4 text-center text-gray-800">
          {isSignUp ? 'Create an Account!' : 'Welcome Back!'}
        </h2>

        <div className="mb-6 text-center">
          <p className="text-sm italic text-gray-600">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <span
              onClick={() => setIsSignUp(!isSignUp)}
              className="font-medium text-indigo-600 hover:text-indigo-500 cursor-pointer"
            >
              {isSignUp ? 'Login' : 'Sign Up'}
            </span>
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="relative">
            <label className="block mb-1 font-medium text-gray-700">Email</label>
            <div className="flex items-center">
              <EnvelopeIcon className="absolute left-3 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your email"
              />
            </div>
          </div>
          <div className="relative">
            <label className="block mb-1 font-medium text-gray-700">Password</label>
            <div className="flex items-center">
              <LockClosedIcon className="absolute left-3 w-5 h-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-gray-400 focus:outline-none"
              >
                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>
          {isSignUp && ( 
            <div className="relative">
              <label className="block mb-1 font-medium text-gray-700">Confirm Password</label>
              <div className="flex items-center">
                <LockClosedIcon className="absolute left-3 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-gray-400 focus:outline-none"
                >
                  {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>
          )}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition duration-300 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isLoading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Login')}
          </button>
        </form>
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>
          <div className="mt-6">
            <button
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className={`w-full flex items-center justify-center bg-white text-gray-700 border border-gray-300 rounded-md px-4 py-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
                <path fill="none" d="M1 1h22v22H1z" />
              </svg>
              Continue with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthCard;
