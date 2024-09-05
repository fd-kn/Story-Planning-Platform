import React, { useState } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebaseconfig';
import useAuth from '../../hooks/useAuth';

const UsernameSetup = () => {
  const user = useAuth();
  const [username, setUsername] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("Username can't be empty");
      return;
    }

    try {
      // Check if username already exists
      const usernameDoc = await getDoc(doc(db, "usernames", username));
      if (usernameDoc.exists()) {
        setError("Username already taken");
        return;
      }

      // Create a reference to the user document
      const userRef = doc(db, 'users', user.uid);

      // Save the username in the Firestore database
      await setDoc(userRef, { username }, { merge: true });

      // Also create a separate document to make username uniqueness easier to check
      await setDoc(doc(db, "usernames", username), { uid: user.uid });
      navigate('/homepage');
      window.location.reload();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Choose a Username</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Username:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border rounded-md"
              required
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
          >
            Save Username
          </button>
        </form>
      </div>
    </div>
  );
};

export default UsernameSetup;
