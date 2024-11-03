import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../../firebaseconfig';
import { deleteObject, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import DEFAULT_IMAGE_URL from '../../defaultimages/defaulticon.jpg';
import Modal from '../UI/Modal';
import { PencilIcon, TrashIcon, ArrowLeftIcon, PhotoIcon } from '@heroicons/react/24/solid';
import { UserIcon, MapPinIcon, BookOpenIcon, CalendarIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import TheDefaultStoryImage from '../../defaultimages/TheDefaultStory.jpg'; // Import the default image

const StoryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingSynopsis, setIsEditingSynopsis] = useState(false);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSynopsis, setNewSynopsis] = useState('');
  const [newImage, setNewImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRemovingImage, setIsRemovingImage] = useState(false);
  const [titleError, setTitleError] = useState('');

  const defaultImageUrl = 'DEFAULT_IMAGE_PLACEHOLDER_URL';

  useEffect(() => {
    const fetchStory = async () => {
      const storyRef = doc(db, 'stories', id);
      const storyDoc = await getDoc(storyRef);
      if (storyDoc.exists()) {
        const data = storyDoc.data();
        setStory(data);
        setNewTitle(data.title);
        setNewSynopsis(data.synopsis);
      } else {
        console.log('No such story!');
      }
      setLoading(false);
    };
    fetchStory();
  }, [id]);

  const handleSaveTitle = async () => {
    if (!newTitle.trim()) {
      setTitleError('Title cannot be empty');
      return;
    }
    
    try {
      const storyRef = doc(db, 'stories', id);
      await updateDoc(storyRef, { title: newTitle.trim() });
      setStory((prevStory) => ({ ...prevStory, title: newTitle.trim() }));
      setIsEditingTitle(false);
      setTitleError('');
    } catch (error) {
      console.error('Error updating title:', error);
      setTitleError('Failed to update title. Please try again.');
    }
  };

  const handleSaveSynopsis = async () => {
    try {
      const storyRef = doc(db, 'stories', id);
      await updateDoc(storyRef, { synopsis: newSynopsis });
      setStory((prevStory) => ({ ...prevStory, synopsis: newSynopsis }));
      setIsEditingSynopsis(false);
    } catch (error) {
      console.error('Error updating synopsis:', error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSaveImage = async () => {
    if (!newImage) return;

    try {
      const imageRef = ref(storage, `storyImages/${newImage.name}-${Date.now()}`);
      const uploadResult = await uploadBytes(imageRef, newImage);
      const imageUrl = await getDownloadURL(uploadResult.ref);

      const storyRef = doc(db, 'stories', id);
      await updateDoc(storyRef, { imageUrl });
      setStory((prevStory) => ({ ...prevStory, imageUrl }));
      setIsEditingImage(false);
      setPreviewImage(null);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleDeleteStory = async () => {
    try {
      const storyRef = doc(db, 'stories', id);
      await deleteDoc(storyRef);
      navigate('/mystories'); 
    } catch (error) {
      console.error('Error deleting story:', error);
    }
  };

  const handleCancelEdit = (field) => {
    switch (field) {
      case 'title':
        setIsEditingTitle(false);
        setNewTitle(story?.title);
        break;
      case 'synopsis':
        setIsEditingSynopsis(false);
        setNewSynopsis(story?.synopsis);
        break;
      case 'image':
        setIsEditingImage(false);
        setPreviewImage(null);
        setNewImage(null);
        break;
      default:
        break;
    }
  };

  const handleRemoveImage = async () => {
    try {
      const storyRef = doc(db, 'stories', id);
      await updateDoc(storyRef, { imageUrl: null });
      setStory((prevStory) => ({ ...prevStory, imageUrl: null }));
      setIsEditingImage(false);
      setIsRemovingImage(false);
    } catch (error) {
      console.error('Error removing image:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  const formattedDate = story?.createdAt
    ? new Date(story.createdAt.seconds * 1000).toLocaleDateString()
    : 'Date not available';

  const categories = [
    { name: 'Characters', path: 'characters', icon: UserIcon },
    { name: 'Locations', path: 'locations', icon: MapPinIcon },
    { name: 'Plots', path: 'plots', icon: BookOpenIcon },
    { name: 'Events', path: 'events', icon: CalendarIcon },
    { name: 'Notes', path: 'notes', icon: PencilSquareIcon },
    { name: 'Gallery', path: 'gallery', icon: PhotoIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-100 via-blue-200 to-teal-200 py-8 px-4 relative overflow-hidden">
      {/* Subtle circle in top-left corner */}
      <div className="absolute -top-40 -left-40 w-80 h-80 bg-white rounded-full opacity-40 circle"></div>
      
      {/* Subtle circle in bottom-right corner */}
      <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-white rounded-full opacity-40 circle"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-pink-500">{story?.title}</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => navigate('/mystories')}
              className="px-4 py-2 bg-gradient-to-r from-teal-400 to-blue-500 text-white rounded-md hover:from-teal-500 hover:to-blue-600 transition-colors flex items-center"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Stories
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center"
            >
              <TrashIcon className="h-5 w-5 mr-2" />
              Delete Story
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Story Details */}
          <div className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg shadow rounded-lg p-5">
            <h2 className="text-xl font-semibold mb-4 text-pink-500">Story Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">Title</label>
                {isEditingTitle ? (
                  <div>
                    <div className="flex items-center">
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 px-3 py-2"
                      />
                      <button onClick={handleSaveTitle} className="ml-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                        Save
                      </button>
                      <button onClick={() => handleCancelEdit('title')} className="ml-2 inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                        Cancel
                      </button>
                    </div>
                    {titleError && <p className="text-red-500 text-sm mt-1">{titleError}</p>}
                  </div>
                ) : (
                  <div className="flex items-center">
                    <h3 className="text-lg font-semibold text-gray-900">{story?.title}</h3>
                    <button onClick={() => setIsEditingTitle(true)} className="ml-2 p-1 rounded-full text-teal-600 hover:text-teal-700">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">Synopsis</label>
                {isEditingSynopsis ? (
                  <div>
                    <textarea
                      value={newSynopsis}
                      onChange={(e) => setNewSynopsis(e.target.value)}
                      rows="3"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 px-3 py-2"
                    ></textarea>
                    <div className="mt-2">
                      <button onClick={handleSaveSynopsis} className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                        Save
                      </button>
                      <button onClick={() => handleCancelEdit('synopsis')} className="ml-2 inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start">
                    {story?.synopsis ? (
                      <p className="text-gray-900 text-sm whitespace-pre-wrap">{story.synopsis}</p>
                    ) : (
                      <p className="text-gray-400 text-sm italic">No synopsis provided</p>
                    )}
                    <button onClick={() => setIsEditingSynopsis(true)} className="ml-2 p-1 rounded-full text-gray-400 hover:text-gray-500">
                      <PencilIcon className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                {/* <label className="block text-base font-medium text-gray-700 mb-1">Image</label> */}
                <div className="mt-1 flex justify-start">
                  <img
                    src={isEditingImage ? previewImage || story.imageUrl || TheDefaultStoryImage : story?.imageUrl || TheDefaultStoryImage}
                    alt={story?.title}
                    className="w-11/12 h-56 object-cover rounded-lg"
                  />
                </div>
                {isEditingImage ? (
                  <div className="mt-2">
                    <input
                      type="file"
                      onChange={handleImageChange}
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 px-3 py-2"
                    />
                    <div className="mt-2 flex space-x-2">
                      <button onClick={handleSaveImage} className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-gradient-to-r from-teal-400 to-blue-500 hover:from-teal-500 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                        Save
                      </button>
                      <button onClick={() => handleCancelEdit('image')} className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                        Cancel
                      </button>
                      {story?.imageUrl && (
                        <button onClick={() => setIsRemovingImage(true)} className="inline-flex items-center px-3 py-2 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setIsEditingImage(true)} className="mt-2 inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
                    <PhotoIcon className="h-4 w-4 mr-2" />
                    Change Image
                  </button>
                )}
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-1">Created on</label>
                <span className="text-gray-900 text-sm">{formattedDate}</span>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg shadow rounded-lg p-5">
            <h2 className="text-xl font-semibold mb-6 text-pink-500">Categories</h2>
            <div className="grid grid-cols-2 gap-6">
              {categories.map((category) => (
                <Link
                  key={category.path}
                  to={`/story/${id}/${category.path}`}
                  className="bg-gradient-to-r from-teal-400 to-blue-500 rounded-lg p-6 flex flex-col items-center justify-center hover:from-teal-500 hover:to-blue-600 transition-colors duration-300"
                >
                  <category.icon className="h-10 w-10 text-white mb-3" aria-hidden="true" />
                  <h3 className="text-sm font-medium text-white text-center">{category.name}</h3>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4 text-pink-500">Confirm Delete</h2>
          <p>Are you sure you want to delete this story?</p>
          <div className="space-x-4 mt-6">
            <button onClick={handleDeleteStory} className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600">
              Delete
            </button>
            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gradient-to-r from-teal-400 to-blue-500 text-white rounded-md hover:from-teal-500 hover:to-blue-600">
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Remove Image Confirmation Modal */}
      <Modal isOpen={isRemovingImage} onClose={() => setIsRemovingImage(false)}>
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4 text-pink-500">Confirm Remove Image</h2>
          <p>Are you sure you want to remove this image?</p>
          <div className="space-x-4 mt-6">
            <button 
              onClick={handleRemoveImage} 
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Remove
            </button>
            <button 
              onClick={() => setIsRemovingImage(false)} 
              className="px-4 py-2 bg-gradient-to-r from-teal-400 to-blue-500 text-white rounded-md hover:from-teal-500 hover:to-blue-600"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StoryDetails;
