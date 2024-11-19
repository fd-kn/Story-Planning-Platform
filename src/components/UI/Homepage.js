import React, { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseconfig';
import { Link, useNavigate } from 'react-router-dom';
import { PlusIcon, BookOpenIcon, UserIcon } from '@heroicons/react/24/outline';

const Homepage = () => {
  const { user, loading: authLoading } = useAuth();
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { 
    const fetchUsername = async () => {
      if (user && user.uid) {
        try {
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            setUsername(userDoc.data().username || '');
          }
        } catch (error) {
          console.error("Error fetching username:", error);
        }
      }
      setIsLoading(false);
    };

    if (!authLoading) {
      fetchUsername();
    }
  }, [user, authLoading]);

  if (authLoading || isLoading) {
    return <div>Loading...</div>;
  }

  if (!user || !username) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-teal-100 via-blue-200 to-teal-200">
        <h2 className="text-2xl font-bold text-center">Complete Your Profile Setup!</h2>
        <p className="mt-4 text-center">Set up your username and start creating your stories.</p>
        <button
          onClick={() => navigate('/setup-username')}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
        >
          Go to Profile Setup
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-teal-100 via-blue-200 to-teal-200">
      {/* Background circles */}
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-white rounded-full opacity-40 circle"></div>
      <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-white rounded-full opacity-40 circle"></div>
      <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full opacity-30 circle"></div>
      <div className="absolute top-40 right-20 w-64 h-64 bg-white rounded-full opacity-30 circle"></div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="max-w-3xl mx-auto bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-lg shadow-xl overflow-hidden">
          <div className="p-8">
            <h1 className="text-4xl  mb-6 text-center">Hey there, <span className="text-pink-500 font-semibold">{username}</span>!</h1>
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
              </div>
            ) : user && username ? (
              <>
                <p className="text-xl italic text-gray-800 mb-8 text-center">
                  Ready to bring your next story to life? Let's get started!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Link to="/newstorytitle" className="block transform hover:scale-105 transition duration-300">
                    <div className="bg-gradient-to-br from-teal-100 to-blue-200 p-6 rounded-lg shadow-lg flex flex-col items-center">
                      <PlusIcon className="h-12 w-12 text-pink-500 mb-4" />
                      <span className="text-lg font-semibold text-gray-800">Create a New Story</span>
                    </div>
                  </Link>
                  <Link to="/mystories" className="block transform hover:scale-105 transition duration-300">
                    <div className="bg-gradient-to-br from-blue-100 to-teal-200 p-6 rounded-lg shadow-lg flex flex-col items-center">
                      <BookOpenIcon className="h-12 w-12 text-pink-500 mb-4" />
                      <span className="text-lg font-semibold text-gray-800">View My Stories</span>
                    </div>
                  </Link>
                  <Link to="/profile" className="block transform hover:scale-105 transition duration-300">
                    <div className="bg-gradient-to-br from-teal-100 to-blue-200 p-6 rounded-lg shadow-lg flex flex-col items-center">
                      <UserIcon className="h-12 w-12 text-pink-500 mb-4" />
                      <span className="text-lg font-semibold text-gray-800">My Profile</span>
                    </div>
                  </Link>
                </div>
                {/* <div className="relative mt-14 text-center p-2">
                  <p className="text-gray-900 italic font-semibold relative z-10">
                    If you have any questions or suggestions, feel free to reach out on Instagram at <a href="https://instagram.com/hazylight" className="text-pink-500 hover:underline"> @hazylight</a>. I welcome your thoughts and ideas!
                  </p>
                  <div className="absolute inset-0 border-2 border-pink-500 rounded-lg glow-animation"></div>
                </div> */}
              </>
            ) : (
              <div className="text-center">
                <p className="text-xl text-gray-800 mb-6">Please log in to access your stories.</p>
                <Link to="/login" className="bg-gradient-to-r from-teal-400 to-blue-500 text-white px-6 py-2 rounded-full hover:from-teal-500 hover:to-blue-600 transition duration-300 shadow-md">
                  Log In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Homepage;
