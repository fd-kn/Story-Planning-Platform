import React, { useEffect, useState } from 'react';
import { getDocs, query, where, collection } from 'firebase/firestore';
import { db } from '../../firebaseconfig';
import useAuth from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import { PlusIcon, BookOpenIcon, CalendarIcon } from '@heroicons/react/24/outline';
import TheDefaultStoryImage from '../../defaultimages/TheDefaultStory.jpg'; // Import the default image

const MyStories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    const fetchStories = async () => {
      if (user && user.uid) {
        setLoading(true);
        try {
          const q = query(
            collection(db, 'stories'),
            where('uid', '==', user.uid)
          );
          const querySnapshot = await getDocs(q);
          const storiesList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate()
          }));
          
          // Sort stories by createdAt in descending order
          const sortedStories = storiesList.sort((a, b) => 
            b.createdAt.getTime() - a.createdAt.getTime()
          );
          
          setStories(sortedStories);
        } catch (error) {
          console.error("Error fetching stories:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchStories();
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return <div>Loading...</div>;
  }

  const formatDate = (date) => {
    if (!date) return 'Unknown date';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 via-blue-200 to-teal-200 py-12 px-4 relative overflow-hidden">
      {/* Background circles */}
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-white rounded-full opacity-40 circle"></div>
      <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-white rounded-full opacity-40 circle"></div>
      <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full opacity-30 circle"></div>
      <div className="absolute top-40 right-20 w-64 h-64 bg-white rounded-full opacity-30 circle"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-8">
          <Link
            to="/homepage"
            className="bg-gradient-to-r from-teal-400 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-teal-500 hover:to-blue-600 transition-colors duration-300 flex items-center shadow-md"
          >
            <BookOpenIcon className="w-5 h-5 mr-2" />
            Back to Homepage
          </Link>
          <Link
            to="/newstorytitle"
            className="bg-gradient-to-r from-teal-400 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-teal-500 hover:to-blue-600 transition-colors duration-300 flex items-center shadow-md"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Create New Story
          </Link>
        </div>

        <h2 className="text-4xl font-bold mb-8 text-center text-pink-500">My Stories</h2>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-500"></div>
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-12 bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-lg shadow-md">
            <p className="text-gray-600 text-xl mb-4">You currently have no stories.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories.map((story) => (
              <div
                key={story.id}
                className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col"
              >
                <Link to={`/story/${story.id}`} className="block flex-grow">
                  <div className="relative h-48 bg-teal-100">
                    <img
                      src={story.imageUrl || TheDefaultStoryImage} // Use default image if no imageUrl
                      alt={story.title || 'Untitled Story'}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-teal-900 to-transparent p-4">
                      <h3 className="text-xl font-semibold text-white truncate">
                        {story.title || 'Untitled Story'}
                      </h3>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {story.synopsis || 'No synopsis available.'}
                    </p>
                  </div>
                </Link>
                <div className="p-4 border-t border-gray-200 flex items-center justify-center text-sm text-gray-500">
                  <div className="flex items-center">
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    {formatDate(story.createdAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyStories;
