import { deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { db } from '../../firebaseconfig';

const StoryDetails = () => {
  const { id } = useParams();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStory = async () => {
      const storyRef = doc(db, 'stories', id);
      const storyDoc = await getDoc(storyRef);
      if (storyDoc.exists()) {
        setStory(storyDoc.data());
        setNewTitle(storyDoc.data().title);
      } else {
        console.log('No such story!');
      }
      setLoading(false);
    };

    fetchStory();
  }, [id]);

  const handleDelete = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete this story?');
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, 'stories', id));
        console.log('Story deleted successfully');
        navigate('/mystories');
      } catch (error) {
        console.error('Error deleting story:', error);
      }
    }
  };

  const handleSaveTitle = async () => {
    try {
      const storyRef = doc(db, 'stories', id);
      await updateDoc(storyRef, { title: newTitle });
      setStory((prevStory) => ({ ...prevStory, title: newTitle }));
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating title:', error);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center p-4">
      <div className="w-full max-w-4xl bg-white shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-8 flex items-center justify-between">
          {isEditing ? (
            <>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="border border-gray-300 p-2 rounded w-full"
                placeholder="Edit title"
              />
              <div className="ml-4 flex space-x-2">
                <button
                  onClick={handleSaveTitle}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              {story?.title || 'Untitled Story'}
              <button
                onClick={() => setIsEditing(true)}
                className="ml-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Edit Title
              </button>
            </>
          )}
        </h1>

        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">Story Synopsis</h2>
          <p className="text-gray-700">{story?.synopsis || 'No synopsis provided.'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to={`/story/${id}/characters`} className="block bg-gray-100 p-4 rounded-lg hover:bg-gray-200">
            <h3 className="text-lg font-semibold text-center">Characters</h3>
          </Link>
          <Link to={`/story/${id}/locations`} className="block bg-gray-100 p-4 rounded-lg hover:bg-gray-200">
            <h3 className="text-lg font-semibold text-center">Locations</h3>
          </Link>
          <Link to={`/story/${id}/plots`} className="block bg-gray-100 p-4 rounded-lg hover:bg-gray-200">
            <h3 className="text-lg font-semibold text-center">Plots</h3>
          </Link>
          <Link to={`/story/${id}/events`} className="block bg-gray-100 p-4 rounded-lg hover:bg-gray-200">
            <h3 className="text-lg font-semibold text-center">Events</h3>
          </Link>
          <Link to={`/story/${id}/notes`} className="block bg-gray-100 p-4 rounded-lg hover:bg-gray-200">
            <h3 className="text-lg font-semibold text-center">Notes</h3>
          </Link>
          <Link to={`/story/${id}/gallery`} className="block bg-gray-100 p-4 rounded-lg hover:bg-gray-200">
            <h3 className="text-lg font-semibold text-center">Gallery</h3>
          </Link>
        </div>

        <div className="flex justify-between items-center mt-8">
          <Link
            to="/mystories"
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Back to My Stories
          </Link>
          <button
            onClick={handleDelete}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Delete Story
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoryDetails;
