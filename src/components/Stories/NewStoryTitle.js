import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../firebaseconfig';
import useAuth from '../../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';

const NewStoryTitle = () => {
  const [title, setTitle] = useState('');
  const [error, setError] = useState(null);
  const user = useAuth();
  const navigate = useNavigate();

  const handleSaveStory = async () => {
    if (!title) {
      setError('Title cannot be empty');
      return;
    }
    try {
      const docRef = await addDoc(collection(db, 'stories'), {
        title: title,
        uid: user.uid,
        createdAt: new Date(),
      });
      setTitle(''); // Clear the input field after saving
      navigate(`/story/${docRef.id}`);
    } catch (error) {
      setError('Failed to save story. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-8 px-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <Link
          to={'/homepage'}
          className="text-blue-500 hover:underline mb-6 block text-sm"
        >
          &larr; Back to Homepage
        </Link>

        <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
          Create a New Story
        </h2>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter story title"
          className="border border-gray-300 rounded-lg w-full p-3 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          className="bg-blue-600 text-white w-full py-2 rounded-lg hover:bg-blue-700 transition duration-200"
          onClick={handleSaveStory}
        >
          Save Story
        </button>

        {error && <p className="text-red-500 text-center mt-2">{error}</p>}
      </div>
    </div>
  );
};

export default NewStoryTitle;
