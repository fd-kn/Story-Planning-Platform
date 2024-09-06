import React, { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../firebaseconfig';
import { useParams, useNavigate } from 'react-router-dom';

const CreateNote = () => {
  const { id } = useParams(); // Story ID from the URL
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const noteData = {
      title: title || 'Untitled Note',
      note: note || 'No Note Content',
    };

    try {
      // Add a new document with a generated ID to Firestore
      await addDoc(collection(db, 'stories', id, 'notes'), noteData);
      alert('Note created successfully!');
      navigate(`/story/${id}/notes`); // Navigate back to the notes list after creation
    } catch (error) {
      console.error('Error creating note:', error);
      alert('Error creating note, please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-3xl mb-8">Create Note</h1>

      <form onSubmit={handleSubmit} className="w-full max-w-2xl">
        <div className="mb-4">
          <label className="block text-gray-700">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700">Note</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded mt-4"
        >
          Create Note
        </button>
      </form>
    </div>
  );
};

export default CreateNote;
