import React, { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseconfig';
import { Link } from 'react-router-dom';

const Homepage = () => {
  const user = useAuth();
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsername = async () => {
      if (user) {
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setUsername(userDoc.data().username);
        }
        setIsLoading(false);
      }
    };

    fetchUsername();
  }, [user]);

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-blue-500 to-indigo-600">
      <div className="bg-white shadow-lg rounded-lg p-8 text-center max-w-md w-full">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">Welcome</h1>
        {isLoading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          user &&
          username && (
            <>
              <p className="text-xl text-gray-700 mb-6">Hello, {username}!</p>
              <div className="flex justify-center space-x-4">
                <Link to="/newstorytitle">
                  <button className="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-600 transition duration-300">
                    Create Story
                  </button>
                </Link>
                <Link to="/mystories">
                  <button className="bg-green-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-green-600 transition duration-300">
                    View Stories
                  </button>
                </Link>
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
};

export default Homepage;
