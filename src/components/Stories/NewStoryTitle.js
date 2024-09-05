import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { auth, db } from '../../firebaseconfig';
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
    <div className="mb-8">
        <Link to={'/homepage'}>Back</Link>
      <h2 className="text-xl mb-4">Create a New Story</h2>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter story title"
        className="border p-2 mb-4"
      />
      <button
        className="bg-blue-500 text-white py-2 px-4 rounded"
        onClick={handleSaveStory}
      >
        Save Story
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default NewStoryTitle;
