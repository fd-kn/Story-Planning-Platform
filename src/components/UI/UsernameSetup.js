import React, { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db, auth } from '../../firebaseconfig';
import useAuth from '../../hooks/useAuth';
import { updatePassword } from 'firebase/auth';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'; // Import eye icons

const UsernameSetup = () => {
  const { user } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // New state for confirmation password
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);  
  const [successMessage, setSuccessMessage] = useState('');  
  const [needsPassword, setNeedsPassword] = useState(false);  
  const [showPassword, setShowPassword] = useState(false); // State for password visibility
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // State for confirm password visibility
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is defined and signed in using a provider other than email/password
    if (user && user.providerData && Array.isArray(user.providerData) && user.providerData.length > 0) {
      // Set needsPassword to true if signed in via Google or other providers
      setNeedsPassword(user.providerData[0].providerId !== 'password');
    }
  }, [user]);

  const validatePassword = (password) => {
    const hasLength = password.length >= 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    return hasLength && hasUpperCase && hasLowerCase && hasNumber;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);  // Reset error on submit
    setSuccessMessage('');  // Reset success message
    setLoading(true);  // Start loading

    if (!username.trim()) {
      setError("Username can't be empty.");
      setLoading(false);
      return;
    }

    if (needsPassword) {
      if (!validatePassword(password)) {
        setError('Password must be at least 6 characters long, with at least one uppercase letter, one lowercase letter, and one number.');
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please try again.');
        setLoading(false);
        return;
      }
    }

    try {
      // Create a reference to the user document and save the username and email in Firestore
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, { 
        username, 
        email: user.email // Add the user's email here
      }, { merge: true });

      if (needsPassword) {
        // Set the password only if the user logged in with Google or another provider
        await updatePassword(auth.currentUser, password);
      }

      setSuccessMessage('Your account setup was successful!');
      setTimeout(() => {
        navigate('/homepage');
      }, 2000);  // Navigate to homepage after 2 seconds

    } catch (err) {
      setError(`An error occurred while setting your username or password. Please try again. ${err}`);
    } finally {
      setLoading(false);  // Stop loading
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 via-blue-200 to-teal-200 flex justify-center items-center p-4">
      <div className="max-w-md w-full bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-lg shadow-xl overflow-hidden">
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-6 text-center text-pink-500">Set Username {needsPassword && 'and Password'}</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">Username</label>
              <p className="text-gray-500 text-sm mb-2">This name can be adjusted anytime.</p> {/* Note for username */}
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:outline-none transition"
                placeholder="Enter your username"
                required
              />
            </div>

            {needsPassword && (
              <>
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Set Password</label>
                  <p className="text-gray-500 text-sm mb-2">We only ask for a password just in case you want to sign up manually using email next time.</p> {/* Note for password */}
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:outline-none transition"
                      placeholder="Password (min 6 characters, 1 uppercase, 1 lowercase, 1 number)"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-gray-400 focus:outline-none"
                    >
                      {showPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:outline-none transition"
                      placeholder="Confirm your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-gray-400 focus:outline-none"
                    >
                      {showConfirmPassword ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {error && <p className="text-red-500 text-sm">{error}</p>}
            {successMessage && <p className="text-green-500 text-sm">{successMessage}</p>}
            
            <button
              type="submit"
              className={`w-full bg-gradient-to-r from-teal-400 to-blue-500 text-white py-2 rounded-md font-semibold transition-colors ${loading || successMessage ? 'opacity-50 cursor-not-allowed' : 'hover:from-teal-500 hover:to-blue-600'}`}
              disabled={loading || successMessage} // Disable button while loading or if success message is shown
            >
              {loading ? 'Saving...' : 'Save'} 
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UsernameSetup;
