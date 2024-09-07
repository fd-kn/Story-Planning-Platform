import { deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { db } from '../../firebaseconfig';

const StoryDetails = () => {
  const { id } = useParams(); // This will be the story ID from the URL
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
        setNewTitle(storyDoc.data().title); // Set the current title as the default value in the input
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
        navigate('/mystories'); // Navigate back to the "My Stories" page
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
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl mb-8">
        {isEditing ? (
          <>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="border border-gray-300 p-2 rounded"
            />
            <button
              onClick={handleSaveTitle}
              className="ml-2 bg-blue-500 text-white px-4 py-2 rounded"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="ml-2 bg-gray-500 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            {story?.title || 'Untitled Story'}
            <button
              onClick={() => setIsEditing(true)}
              className="ml-2 bg-blue-500 text-white px-4 py-2 rounded"
            >
              Edit Title
            </button>
          </>
        )}
      </h1>

      <h1>Story synopsis</h1>

      <h1 className="text-3xl mb-8">Story Details</h1>

      <Link to={'/mystories'}>Back</Link>

      <button
        onClick={handleDelete}
        className="bg-red-500 text-white px-4 py-2 rounded mt-4"
      >
        Delete Story
      </button>

      <div className="w-full max-w-4xl">
        {/* Characters Section */}
        <section className="mb-8">
          <Link to={`/story/${id}/characters`}>
            <h2 className="text-2xl mb-4">Characters</h2>
          </Link>
        </section>

        {/* Locations Section */}
        <section className="mb-8">
          <Link to={`/story/${id}/locations`}>
            <h2 className="text-2xl mb-4">Locations</h2>
          </Link>
        </section>

        {/* Plots Section */}
        <section className="mb-8">
          <Link to={`/story/${id}/plots`}>
            <h2 className="text-2xl mb-4">Plots</h2>
          </Link>
        </section>

        <section className="mb-8">
          <Link to={`/story/${id}/events`}>
            <h2 className="text-2xl mb-4">Events</h2>
          </Link>
        </section>

        <section className="mb-8">
          <Link to={`/story/${id}/notes`}>
            <h2 className="text-2xl mb-4">Notes</h2>
          </Link>
        </section>

        {/* Other Sections */}
        <section className="mb-8">
          <Link to={`/story/${id}/gallery`}>
            <h2 className="text-2xl mb-4">Gallery</h2>
          </Link>
        </section>
      </div>
    </div>
  );
};

export default StoryDetails;
