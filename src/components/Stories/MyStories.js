import React, { useEffect, useState } from 'react';
import { getDocs, query, where, collection } from 'firebase/firestore';
import { db } from '../../firebaseconfig';
import useAuth from '../../hooks/useAuth';
import { Link } from 'react-router-dom';

const MyStories = () => {
  const [stories, setStories] = useState([]);
  const user = useAuth();

  useEffect(() => {
    const fetchStories = async () => {
      if (user) {
        const q = query(collection(db, 'stories'), where('uid', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const userStories = [];
        querySnapshot.forEach((doc) => {
          userStories.push({ id: doc.id, ...doc.data() });
        });
        setStories(userStories);
      }
    };

    fetchStories();
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 py-8 px-4">
      <div className="w-full max-w-4xl">
        <Link
          to={'/homepage'}
          className="text-blue-500 hover:underline mb-6 block"
        >
          &larr; Back to Homepage
        </Link>

        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Your Stories</h2>

        {stories.length === 0 ? (
          <p className="text-gray-500 text-center">You haven't created any stories yet.</p>
        ) : (
          <ul className="space-y-4">
            {stories.map((story) => (
              <li
                key={story.id}
                className="border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-200"
              >
                <Link
                  to={`/story/${story.id}`}
                  className="text-xl font-semibold text-blue-600 hover:underline"
                >
                  {story.title || 'Untitled Story'}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MyStories;
