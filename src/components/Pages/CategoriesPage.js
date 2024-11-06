import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { db } from '../../firebaseconfig';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import TheDefaultCharacterImage from '../../defaultimages/TheDefaultCharacter.jpg';
import TheDefaultLocationImage from '../../defaultimages/TheDefaultLocation.jpg';
import TheDefaultEventImage from '../../defaultimages/TheDefaultEvent.jpg';
import TheDefaultPlotImage from '../../defaultimages/TheDefaultPlot.jpg';
import TheDefaultGalleryImage from '../../defaultimages/TheDefaultGallery.jpg';
import TheDefaultNoteImage from '../../defaultimages/TheDefaultNotes.jpg';
import { PlusIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';

const CategoriesPage = () => {
  const { id, category } = useParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      const q = query(
        collection(db, `stories/${id}/${category}`),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const itemsList = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      setItems(itemsList);
      setLoading(false);
    };

    fetchItems();
  }, [id, category]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-teal-100 via-blue-200 to-teal-200">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  const formatDate = (date) => {
    if (!date || !(date instanceof Date)) return 'Unknown Date';
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const renderItems = () => {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {items.map((item) => (
          <div key={item.id} className="text-center">
            <Link to={`/story/${id}/${category}/${item.id}`} className="block">
              <div className="relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg">
                <div className="w-full h-48 relative overflow-hidden">
                  <img
                    src={
                      category === 'characters'
                        ? item.image || TheDefaultCharacterImage
                        : category === 'locations'
                        ? item.image || TheDefaultLocationImage
                        : category === 'events'
                        ? item.image || TheDefaultEventImage
                        : category === 'plots'
                        ? item.image || TheDefaultPlotImage
                        : category === 'gallery'
                        ? item.image || TheDefaultGalleryImage
                        : item.image || TheDefaultNoteImage
                    }
                    alt={item.name || item.title || item.caption || 'Untitled'}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              </div>
              <p className="mt-2 text-sm font-semibold text-teal-700">
                { 
                 (item.name || item.title || 'Untitled')}
              </p>
              <p className="mt-1 text-xs text-gray-500">Added: {formatDate(item.createdAt)}</p>
            </Link>
          </div>
        ))}
      </div>
    );
  };

  // Mapping of categories to their descriptions
  const categoryDescriptions = {
    characters: "Bring your characters to life with unique details and traits.",
    notes: "Keep track of important ideas and notes as you develop your story.",
    gallery: "Add artwork or images that complement your story's world.",
    events: "Document significant events, whether they're part of the main plot or happen in the background.",
    locations: "Describe the various settings and places featured in your story.",
    plots: "Outline key plot points that drive your story forward."
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 via-blue-200 to-teal-200 py-12 px-4 relative overflow-hidden">
      {/* Background circles */}
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-white rounded-full opacity-40 circle"></div>
      <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-white rounded-full opacity-40 circle"></div>
      <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full opacity-30 circle"></div>
      <div className="absolute top-40 right-20 w-64 h-64 bg-white rounded-full opacity-30 circle"></div>
      <div className="absolute bottom-10 left-20 w-56 h-56 bg-white rounded-full opacity-30 circle"></div>

      {/* New Center Circle */}
      <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-white rounded-full opacity-30 transform -translate-x-1/2 -translate-y-1/2 circle"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-pink-500 capitalize">{category}</h1>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              to={`/story/${id}/create/${category}`}
              className="flex items-center px-4 py-2 bg-gradient-to-r from-teal-400 to-blue-500 text-white rounded-lg hover:from-teal-500 hover:to-blue-600 transition-colors duration-300 shadow-md"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create
            </Link>
            <Link
              to={`/story/${id}`}
              className="flex items-center px-4 py-2 bg-white bg-opacity-80 text-teal-700 rounded-lg hover:bg-opacity-100 transition-colors duration-300 shadow-md"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Story
            </Link>
          </div>
        </div>

        <div className='mb-8 font-semibold font-serif italic'>
          <p>{categoryDescriptions[category] || "No description available for this category."}</p>
        </div>

        {items.length > 0 ? (
          renderItems()
        ) : (
          <p className="text-center text-lg italic text-teal-600">This list is currently empty...</p>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;
