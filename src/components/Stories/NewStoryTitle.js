import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db, storage } from '../../firebaseconfig'; // import Firebase storage
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // functions for image upload
import useAuth from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { BookOpenIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';

const NewStoryTitle = () => {
  const [title, setTitle] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [image, setImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSaveStory = async () => {
    if (!title.trim()) {
      setError('Title cannot be empty');
      return;
    }
    setError(null);
    setLoading(true);

    let imageUrl = '';
    
    try {
      if (image) {
        const imageRef = ref(storage, `storyImages/${image.name}-${Date.now()}`);
        const uploadResult = await uploadBytes(imageRef, image);
        imageUrl = await getDownloadURL(uploadResult.ref);
      }

      const docRef = await addDoc(collection(db, 'stories'), {
        title: title.trim(),
        synopsis: synopsis.trim(),
        imageUrl,
        uid: user.uid,
        createdAt: new Date(),
      });

      setLoading(false);
      navigate(`/story/${docRef.id}`);
    } catch (error) {
      setError('Failed to save story. Please try again.');
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreviewUrl(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 via-blue-200 to-teal-200 relative overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Background circles */}
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-white rounded-full opacity-40 circle"></div>
      <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-white rounded-full opacity-40 circle"></div>
      <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full opacity-30 circle"></div>
      <div className="absolute top-40 right-20 w-64 h-64 bg-white rounded-full opacity-30 circle"></div>
      <div className="absolute bottom-10 left-20 w-56 h-56 bg-white rounded-full opacity-30 circle"></div>

      {/* New Center Circle */}
      <div className="absolute top-1/2 left-1/2 w-48 h-48 bg-white rounded-full opacity-30 transform -translate-x-1/2 -translate-y-1/2"></div>

      <div className="max-w-md mx-auto relative z-10">
        <div className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-xl overflow-hidden">
          <div className="px-4 py-6 sm:px-6 lg:px-8 relative">
            {/* Close Button */}
            <button
              onClick={() => window.history.back()} // Navigate back to the last page
              className="absolute top-4 right-4 bg-red-500 rounded-full p-2 text-white hover:bg-red-600 transition duration-300"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>

            <div className="text-center mb-8">
              <BookOpenIcon className="mx-auto h-12 w-auto text-pink-500" />
              <h2 className="mt-4 text-3xl font-extrabold text-gray-900">
                Create a New Story
              </h2>
            </div>
            
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                  placeholder="Story Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="synopsis" className="block text-sm font-medium text-gray-700">
                  Synopsis
                </label>
                <textarea
                  id="synopsis"
                  name="synopsis"
                  rows="4"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
                  placeholder="Story Synopsis"
                  value={synopsis}
                  onChange={(e) => setSynopsis(e.target.value)}
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Cover Image
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    {previewUrl ? (
                      <div className="relative">
                        <img src={previewUrl} alt="Preview" className="mx-auto h-32 w-auto" />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                    )}
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-pink-600 hover:text-pink-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-pink-500"
                      >
                        <span>{previewUrl ? 'Change image' : 'Upload a file'}</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                      </label>
                    </div>

                  </div>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm text-center">{error}</p>}

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                  onClick={handleSaveStory}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Story'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewStoryTitle;
